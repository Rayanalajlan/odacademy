// worker/index.js
// OD Academy Worker
// API:
// - /api/mentor        الموجه الذكي عبر Cloudflare Workers AI مع Rate Limit و CORS مقيد
// - /api/login-notice  تنبيه دخول عبر Brevo
// - /api/welcome-email إيميل ترحيبي عبر Brevo
// باقي الطلبات تمر إلى assets عبر env.ASSETS

const DEFAULT_ALLOWED_ORIGINS = [
  "https://munsaqah.rayansalajlan.workers.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const MAX_MENTOR_REQUEST_BYTES = 32 * 1024;
const MAX_EMAIL_REQUEST_BYTES = 4 * 1024;

// الموجه الذكي: Llama يكتب مسودة أولية، ثم Gemini يصيغ الرد النهائي.
// ملاحظة: النموذج الأساسي مطلوب بالاسم أدناه، ومعه fallback تلقائي إذا تعطل أو تم إيقافه.
const DEFAULT_LLAMA_DRAFT_MODEL = "@cf/meta/llama-3-8b-instruct";
const DEFAULT_LLAMA_FALLBACK_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const DEFAULT_LLAMA_EXTRA_FALLBACK_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

const MENTOR_TIMEOUTS = {
  llamaMs: 22000,
  geminiMs: 38000
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin"
};

const MEMORY_RATE_LIMIT = new Map();

const MENTOR_SYSTEM_INSTRUCTION = `
أنت "الموجه الذكي" داخل منصة منسقة / OD Academy.

هويتك:
- اسمك: الموجه الذكي.
- دورك: مستشار مهني وتعليمي يساعد المستخدم في التطوير التنظيمي، الموارد البشرية، الإدارة، التعلم، التحليل، وبناء الأدوات العملية.
- لا تتصرف كبوت يكرر نصًا محفوظًا.
- لا تبدأ كل إجابة بنفس العبارة.
- لا تذكر تفاصيل تقنية داخلية مثل أسماء النماذج أو مفاتيح API أو مزود الخدمة، إلا إذا سأل المستخدم عنها صراحة.

نبرة الصوت:
- عربية فصحى واضحة، مدمجة بلمسة سعودية بيضاء خفيفة وودودة.
- استخدم عبارات طبيعية مثل: أبشر، ولا تشيل هم، خلّنا نمسكها بهدوء، وش ودك نخصص أكثر؟
- لا تبالغ في العامية.
- كن قريبًا، واثقًا، وعمليًا.

شكل الرد:
- إجابات طويلة ودسمة عندما يحتاج السؤال لذلك.
- قسّم الرد بعناوين فرعية واضحة.
- استخدم نقاط وقوائم عملية.
- استخدم الإيموجي بذكاء لكسر الجمود، دون مبالغة.
- أعطِ المستخدم نتيجة مباشرة لا مجرد أسئلة.
- إذا احتجت معلومات إضافية، أعطِ أفضل إجابة ممكنة أولًا، ثم اسأل سؤالًا أو سؤالين فقط للتخصيص.

منهجية التفكير:
- افهم السؤال قبل الإجابة.
- افرّق بين العرض الظاهر والجذر الحقيقي.
- لا تقفز للحلول قبل التشخيص إذا كانت المسألة تنظيمية أو بشرية.
- عند بناء أداة، قدّم قالبًا قابلًا للنسخ.
- عند تحليل مشكلة، قدّم فرضيات وبيانات مطلوبة وخطوات تنفيذ وقياس أثر.
`.trim();

const MENTOR_DRAFT_INSTRUCTION = `
${MENTOR_SYSTEM_INSTRUCTION}

مهمتك الآن: اكتب مسودة تحليلية أولية فقط تساعد على بناء الرد النهائي.
المسودة يجب أن تكون:
- شاملة للنقاط الأساسية.
- عملية وليست إنشائية.
- غير مكررة.
- قابلة لأن يحسنها نموذج آخر لاحقًا.
- لا تعتذر ولا تذكر أنها مسودة.
`.trim();

const MENTOR_FINAL_INSTRUCTION = `
${MENTOR_SYSTEM_INSTRUCTION}

مهمتك الآن: تحويل السؤال والمسودة الأولية إلى رد نهائي ممتاز للمستخدم.
قواعد صارمة:
- اكتب الرد النهائي فقط.
- لا تذكر وجود مسودة.
- لا تذكر أسماء النماذج أو Cloudflare أو Gemini أو Llama.
- لا تعرض أخطاء تقنية.
- حسّن التنظيم، احذف التكرار، واجعل الرد واضحًا ومريحًا للعين.
- استخدم عناوين فرعية وإيموجي بذكاء.
- اجعل الإجابة مفيدة حتى لو كان السؤال مختصرًا.
`.trim();

function getEnvValue(env, ...names) {
  for (const name of names) {
    const value = env?.[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function splitEnvList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAllowedOrigins(env) {
  const configured = getEnvValue(env, "ALLOWED_ORIGINS", "CORS_ALLOWED_ORIGINS");

  if (!configured) return DEFAULT_ALLOWED_ORIGINS;

  return splitEnvList(configured);
}

function normalizeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function getRequestOrigin(request) {
  return normalizeOrigin(request.headers.get("Origin") || "");
}

function getRequestSameOrigin(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function isAllowedRequestOrigin(request, env) {
  const origin = getRequestOrigin(request);

  // الطلبات المباشرة من نفس الموقع أو السيرفر لا ترسل Origin دائمًا.
  if (!origin) return true;

  const allowed = getAllowedOrigins(env);
  return allowed.includes(origin);
}

function getCorsOrigin(request, env) {
  const origin = getRequestOrigin(request);
  const allowed = getAllowedOrigins(env);

  if (origin && allowed.includes(origin)) return origin;

  const sameOrigin = getRequestSameOrigin(request);
  if (allowed.includes(sameOrigin)) return sameOrigin;

  return allowed[0] || sameOrigin;
}

function corsHeaders(request, env, extraHeaders = {}) {
  return {
    ...SECURITY_HEADERS,
    "Access-Control-Allow-Origin": getCorsOrigin(request, env),
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    ...extraHeaders
  };
}

function jsonResponse(payload, status = 200, request, env, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(request, env, extraHeaders),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function emptyResponse(request, env, status = 204) {
  return new Response(null, {
    status,
    headers: corsHeaders(request, env)
  });
}

function forbiddenOriginResponse(request, env) {
  return jsonResponse(
    {
      ok: false,
      error: "هذا الطلب غير مسموح من هذا النطاق."
    },
    403,
    request,
    env
  );
}

async function safeJson(responseOrRequest) {
  try {
    return await responseOrRequest.json();
  } catch {
    return null;
  }
}

async function readLimitedJsonRequest(request, maxBytes) {
  const contentLength = Number(request.headers.get("Content-Length") || "0");

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return {
      ok: false,
      status: 413,
      code: "REQUEST_TOO_LARGE",
      error: "Request body is too large."
    };
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (contentType && !contentType.toLowerCase().includes("application/json")) {
    return {
      ok: false,
      status: 415,
      code: "UNSUPPORTED_MEDIA_TYPE",
      error: "Content-Type must be application/json."
    };
  }

  let raw = "";

  try {
    raw = await request.text();
  } catch {
    return {
      ok: false,
      status: 400,
      code: "INVALID_BODY",
      error: "Request body could not be read."
    };
  }

  if (new TextEncoder().encode(raw).length > maxBytes) {
    return {
      ok: false,
      status: 413,
      code: "REQUEST_TOO_LARGE",
      error: "Request body is too large."
    };
  }

  if (!raw.trim()) return { ok: true, data: {} };

  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch {
    return {
      ok: false,
      status: 400,
      code: "INVALID_JSON",
      error: "Request body must be valid JSON."
    };
  }
}

function buildContentSecurityPolicy(env) {
  const configuredSiteOrigin = normalizeOrigin(
    getEnvValue(env, "SITE_URL", "PUBLIC_SITE_URL", "VITE_SITE_URL")
  );
  const configuredSupabaseOrigin = normalizeOrigin(
    getEnvValue(env, "SUPABASE_URL", "VITE_SUPABASE_URL")
  );
  const connectOrigins = Array.from(
    new Set([
      "'self'",
      configuredSiteOrigin,
      configuredSupabaseOrigin,
      "https://*.supabase.co"
    ].filter(Boolean))
  ).join(" ");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src ${connectOrigins}`,
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join("; ");
}

async function assetResponse(request, env) {
  const response = await env.ASSETS.fetch(request);
  const headers = new Headers(response.headers);
  const url = new URL(request.url);

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  if (url.protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  const contentType = headers.get("Content-Type") || "";
  if (contentType.includes("text/html")) {
    headers.set("Content-Security-Policy", buildContentSecurityPolicy(env));
    headers.set("Cache-Control", "no-store");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getClientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")?.[0]?.trim() ||
    "unknown"
  );
}

function getRateLimitNumber(env, name, fallback) {
  const value = Number(getEnvValue(env, name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function checkRateLimit(request, env, options = {}) {
  const pathname = new URL(request.url).pathname;
  const ipHash = await sha256Hex(getClientIp(request));
  const bucket = options.bucket || pathname.replaceAll("/", ":");
  const windowSeconds = options.windowSeconds || 60;
  const limit = options.limit || 20;
  const key = `rl:${bucket}:${ipHash}`;

  if (env?.RATE_LIMIT_KV) {
    const current = Number((await env.RATE_LIMIT_KV.get(key)) || "0");

    if (current >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        retryAfter: windowSeconds
      };
    }

    await env.RATE_LIMIT_KV.put(key, String(current + 1), {
      expirationTtl: windowSeconds
    });

    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - current - 1),
      retryAfter: windowSeconds
    };
  }

  // fallback مؤقت أثناء التجربة فقط. الأفضل ربط KV.
  const now = Date.now();
  const item = MEMORY_RATE_LIMIT.get(key);

  if (!item || item.expiresAt <= now) {
    MEMORY_RATE_LIMIT.set(key, {
      count: 1,
      expiresAt: now + windowSeconds * 1000
    });

    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      retryAfter: windowSeconds
    };
  }

  if (item.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfter: Math.ceil((item.expiresAt - now) / 1000)
    };
  }

  item.count += 1;
  MEMORY_RATE_LIMIT.set(key, item);

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - item.count),
    retryAfter: Math.ceil((item.expiresAt - now) / 1000)
  };
}

function rateLimitResponse(request, env, result) {
  return jsonResponse(
    {
      ok: false,
      code: "RATE_LIMITED",
      error: "الضغط عالي على الخدمة الآن. انتظر قليلًا ثم جرّب مرة أخرى.",
      retryAfter: result.retryAfter
    },
    429,
    request,
    env,
    {
      "Retry-After": String(result.retryAfter || 60),
      "X-RateLimit-Limit": String(result.limit || ""),
      "X-RateLimit-Remaining": String(result.remaining || 0)
    }
  );
}

function cleanUserMessage(message) {
  return String(message || "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim()
    .slice(0, 6000);
}

function normalizeMessages(rawMessages, latestMessage) {
  const messages = Array.isArray(rawMessages) ? rawMessages : [];

  const normalized = messages
    .slice(-12)
    .map((item) => {
      const role = item?.role === "assistant" ? "assistant" : "user";
      const content = cleanUserMessage(item?.content || item?.text || "");
      return content ? { role, content } : null;
    })
    .filter(Boolean);

  if (latestMessage && !normalized.some((item) => item.content === latestMessage)) {
    normalized.push({
      role: "user",
      content: latestMessage
    });
  }

  return normalized;
}

function conversationToPlainText(conversation) {
  if (!Array.isArray(conversation) || !conversation.length) return "لا يوجد سياق سابق.";

  return conversation
    .slice(-10)
    .map((item) => {
      const speaker = item.role === "assistant" ? "الموجه الذكي" : "المستخدم";
      return `${speaker}: ${item.content}`;
    })
    .join("\n")
    .slice(0, 9000);
}

function extractAiText(result) {
  if (!result) return "";

  if (typeof result === "string") return result.trim();

  if (typeof result.response === "string") return result.response.trim();
  if (typeof result.result === "string") return result.result.trim();
  if (typeof result.text === "string") return result.text.trim();
  if (typeof result.output_text === "string") return result.output_text.trim();

  if (Array.isArray(result?.choices)) {
    return (
      result.choices[0]?.message?.content ||
      result.choices[0]?.text ||
      ""
    ).trim();
  }

  if (Array.isArray(result?.content)) {
    return result.content
      .map((item) => item?.text || item?.content || "")
      .join("\n")
      .trim();
  }

  if (Array.isArray(result?.output)) {
    return result.output
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item?.content === "string") return item.content;
        if (typeof item?.text === "string") return item.text;
        if (Array.isArray(item?.content)) {
          return item.content.map((part) => part?.text || "").join("\n");
        }
        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

function safeError(error) {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error.slice(0, 500);
  return String(error.message || error.name || "Unknown error").slice(0, 500);
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(label)), ms);
    })
  ]);
}

function uniqueList(items) {
  return Array.from(
    new Set(
      items
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    )
  );
}

function getWorkersAiDraftModels(env) {
  return uniqueList([
    getEnvValue(env, "LLAMA_DRAFT_MODEL", "WORKERS_AI_DRAFT_MODEL") || DEFAULT_LLAMA_DRAFT_MODEL,
    getEnvValue(env, "LLAMA_FALLBACK_MODEL", "WORKERS_AI_FALLBACK_MODEL") || DEFAULT_LLAMA_FALLBACK_MODEL,
    getEnvValue(env, "WORKERS_AI_MODEL"),
    DEFAULT_LLAMA_EXTRA_FALLBACK_MODEL
  ]);
}

async function callWorkersAiDraftOnce(env, conversation, model) {
  if (!env?.AI || typeof env.AI.run !== "function") {
    return {
      ok: false,
      provider: "workers-ai",
      model,
      error: "Workers AI binding AI غير موجود."
    };
  }

  const messages = [
    {
      role: "system",
      content: MENTOR_DRAFT_INSTRUCTION
    },
    ...conversation.map((item) => ({
      role: item.role,
      content: item.content
    })),
    {
      role: "user",
      content: `
اكتب مسودة تحليلية قوية للسؤال الأخير أعلاه.
المطلوب: فهم السؤال، النقاط الأساسية، إجابة عملية، تنبيهات، وخطوات مقترحة.
لا تكتب اعتذارًا ولا تذكر أنها مسودة.
      `.trim()
    }
  ];

  try {
    const result = await withTimeout(
      env.AI.run(model, {
        messages,
        max_tokens: 1200,
        temperature: 0.45,
        top_p: 0.88,
        repetition_penalty: 1.12
      }),
      MENTOR_TIMEOUTS.llamaMs,
      "Workers AI timeout"
    );

    const text = extractAiText(result);

    if (!text) {
      return {
        ok: false,
        provider: "workers-ai",
        model,
        error: "لم يرجع النموذج نصًا مفهومًا.",
        raw: result
      };
    }

    return {
      ok: true,
      provider: "workers-ai",
      model,
      text
    };
  } catch (error) {
    return {
      ok: false,
      provider: "workers-ai",
      model,
      error: safeError(error)
    };
  }
}

async function callWorkersAiDraftWithFallback(env, conversation) {
  const errors = [];

  for (const model of getWorkersAiDraftModels(env)) {
    const result = await callWorkersAiDraftOnce(env, conversation, model);

    if (result.ok) return result;

    errors.push({
      model,
      error: result.error
    });
  }

  return {
    ok: false,
    provider: "workers-ai",
    error: "تعذر الحصول على مسودة من Workers AI.",
    errors
  };
}

function getGeminiModels(env) {
  const primary = getEnvValue(env, "GEMINI_MODEL") || DEFAULT_GEMINI_MODEL;
  const configuredList = splitEnvList(getEnvValue(env, "GEMINI_MODELS"));

  return uniqueList([
    primary,
    ...configuredList,
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ]);
}

function extractGeminiText(result) {
  if (!result) return "";

  const candidates = Array.isArray(result?.candidates) ? result.candidates : [];

  return candidates
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => part?.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function buildGeminiFinalPrompt({ conversation, latestMessage, llamaDraft }) {
  const hasDraft = Boolean(cleanUserMessage(llamaDraft));

  if (hasDraft) {
    return `
السياق المختصر للمحادثة:
${conversationToPlainText(conversation)}

سؤال المستخدم الأخير:
${latestMessage}

المسودة الأولية:
${llamaDraft}

حوّل ذلك إلى إجابة نهائية ممتازة للمستخدم.
اجعلها عربية، عملية، دسمة، مرتبة، مريحة للعين، وفيها لمسة سعودية بيضاء خفيفة.
لا تذكر المسودة ولا أي تفاصيل تقنية.
    `.trim();
  }

  return `
السياق المختصر للمحادثة:
${conversationToPlainText(conversation)}

سؤال المستخدم الأخير:
${latestMessage}

اكتب إجابة نهائية ممتازة للمستخدم مباشرة.
اجعلها عربية، عملية، دسمة، مرتبة، مريحة للعين، وفيها لمسة سعودية بيضاء خفيفة.
لا تذكر أي تفاصيل تقنية.
  `.trim();
}

async function callGeminiOnce({ apiKey, model, conversation, latestMessage, llamaDraft }) {
  const prompt = buildGeminiFinalPrompt({
    conversation,
    latestMessage,
    llamaDraft
  });

  let response;
  let data;

  try {
    response = await withTimeout(
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: MENTOR_FINAL_INSTRUCTION }]
            },
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              temperature: 0.55,
              topP: 0.9,
              maxOutputTokens: 2400
            }
          })
        }
      ),
      MENTOR_TIMEOUTS.geminiMs,
      "Gemini timeout"
    );

    data = await safeJson(response);

    if (!response.ok) {
      return {
        ok: false,
        provider: "gemini",
        model,
        status: response.status,
        error: data?.error?.message || "Gemini request failed",
        data
      };
    }

    const text = extractGeminiText(data);

    if (!text) {
      return {
        ok: false,
        provider: "gemini",
        model,
        status: 502,
        error: "Gemini returned empty response",
        data
      };
    }

    return {
      ok: true,
      provider: "gemini",
      model,
      text
    };
  } catch (error) {
    return {
      ok: false,
      provider: "gemini",
      model,
      status: 0,
      error: safeError(error)
    };
  }
}

async function callGeminiFinalWithFallback(env, conversation, latestMessage, llamaDraft = "") {
  const apiKey = getEnvValue(env, "GEMINI_API_KEY");

  if (!apiKey) {
    return {
      ok: false,
      provider: "gemini",
      error: "GEMINI_API_KEY غير موجود."
    };
  }

  const errors = [];

  for (const model of getGeminiModels(env)) {
    const result = await callGeminiOnce({
      apiKey,
      model,
      conversation,
      latestMessage,
      llamaDraft
    });

    if (result.ok) return result;

    errors.push({
      model,
      status: result.status,
      error: result.error
    });

    if (![0, 429, 500, 502, 503, 504].includes(Number(result.status))) {
      break;
    }
  }

  return {
    ok: false,
    provider: "gemini",
    error: "تعذر الحصول على رد نهائي من Gemini.",
    errors
  };
}

function buildGracefulModelFailureAnswer() {
  return `
أبشر، ولا تشيل هم 🌿

واجه الموجه الذكي ضغطًا مؤقتًا أثناء تجهيز الإجابة، وما أبغى أعطيك ردًا ناقصًا أو مضللًا.

جرّب ترسل السؤال مرة ثانية بصياغة مباشرة، مثل:
- ما المشكلة التي تريد تحليلها؟
- ما القرار الذي تحتاجه؟
- ما المجال: موارد بشرية، أداء، سياسات، تطوير تنظيمي، تدريب؟

وبإذن الله أرتبها لك خطوة بخطوة وبشكل عملي.
  `.trim();
}

async function handleMentorRequest(request, env) {
  if (request.method === "OPTIONS") return emptyResponse(request, env);

  if (request.method === "GET") {
    return jsonResponse(
      {
        ok: true,
        service: "odacademy-mentor",
        name: "الموجه الذكي",
        pipeline: "workers-ai-draft-then-gemini-final",
        workersAiReady: Boolean(env?.AI),
        geminiReady: Boolean(getEnvValue(env, "GEMINI_API_KEY")),
        message: "خدمة الموجه الذكي متصلة."
      },
      200,
      request,
      env
    );
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "Method not allowed"
      },
      405,
      request,
      env
    );
  }

  const limit = getRateLimitNumber(env, "MENTOR_RATE_LIMIT_PER_MINUTE", 20);
  const rate = await checkRateLimit(request, env, {
    bucket: "mentor",
    limit,
    windowSeconds: 60
  });

  if (!rate.allowed) return rateLimitResponse(request, env, rate);

  const parsedBody = await readLimitedJsonRequest(request, MAX_MENTOR_REQUEST_BYTES);
  if (!parsedBody.ok) {
    return jsonResponse(
      {
        ok: false,
        code: parsedBody.code,
        error: parsedBody.error
      },
      parsedBody.status,
      request,
      env
    );
  }

  const body = parsedBody.data || {};
  const latestMessage = cleanUserMessage(body.message || body.prompt || body.text || "");

  if (!latestMessage) {
    return jsonResponse(
      {
        ok: false,
        error: "اكتب سؤالك أو الحالة التي تريد تحليلها."
      },
      400,
      request,
      env
    );
  }

  const conversation = normalizeMessages(body.messages, latestMessage);

  // 1) المسار الأساسي: Workers AI / Llama ينتج مسودة أولية.
  const draftResult = await callWorkersAiDraftWithFallback(env, conversation);

  // 2) المسار النهائي: Gemini يحسن المسودة. إذا فشلت المسودة، يحاول Gemini الإجابة مباشرة.
  const finalResult = await callGeminiFinalWithFallback(
    env,
    conversation,
    latestMessage,
    draftResult.ok ? draftResult.text : ""
  );

  if (finalResult.ok) {
    return jsonResponse(
      {
        ok: true,
        reply: finalResult.text,
        text: finalResult.text,
        provider: "multi-model",
        model: finalResult.model,
        pipeline: draftResult.ok ? "workers-ai-draft-then-gemini-final" : "gemini-direct-fallback",
        degraded: !draftResult.ok,
        draftProvider: draftResult.ok ? draftResult.provider : null,
        draftModel: draftResult.ok ? draftResult.model : null,
        finalProvider: finalResult.provider,
        finalModel: finalResult.model
      },
      200,
      request,
      env
    );
  }

  // 3) إذا فشل Gemini لكن مسودة Workers AI نجحت، نرجع المسودة كمسار بديل بدل انهيار الواجهة.
  if (draftResult.ok) {
    const safeAnswer = `
أبشر، جهزت لك إجابة مستقرة بالمسار البديل ✅

${draftResult.text}
    `.trim();

    return jsonResponse(
      {
        ok: true,
        reply: safeAnswer,
        text: safeAnswer,
        provider: "workers-ai-fallback",
        model: draftResult.model,
        pipeline: "workers-ai-only-fallback",
        degraded: true,
        draftProvider: draftResult.provider,
        draftModel: draftResult.model,
        finalProvider: null,
        finalModel: null
      },
      200,
      request,
      env
    );
  }

  console.warn("Mentor pipeline failed:", {
    draft: draftResult.error || draftResult.errors,
    final: finalResult.error || finalResult.errors
  });

  // 4) آخر حماية: رد مرن بدل 503 حتى لا تظهر أخطاء تقنية للمستخدم داخل الواجهة.
  const fallbackAnswer = buildGracefulModelFailureAnswer();

  return jsonResponse(
    {
      ok: true,
      reply: fallbackAnswer,
      text: fallbackAnswer,
      provider: "safe-fallback",
      model: null,
      pipeline: "safe-static-fallback",
      degraded: true
    },
    200,
    request,
    env
  );
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getSupabaseUser({ supabaseUrl, supabaseAnonKey, accessToken }) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await safeJson(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data?.message || data?.error || "Invalid Supabase session"
    };
  }

  return {
    ok: true,
    user: data
  };
}

async function sendEmailWithBrevo({
  apiKey,
  senderName,
  senderEmail,
  toEmail,
  toName,
  subject,
  html,
  text
}) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      sender: {
        name: senderName || "OD Academy",
        email: senderEmail
      },
      to: [
        {
          email: toEmail,
          name: toName || toEmail
        }
      ],
      subject,
      htmlContent: html,
      textContent: text
    })
  });

  const data = await safeJson(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      details: data || (await response.text().catch(() => ""))
    };
  }

  return {
    ok: true,
    data
  };
}

function buildLoginEmail({ displayName, siteUrl }) {
  const safeName = escapeHtml(displayName || "متدربنا العزيز");
  const safeUrl = escapeHtml(siteUrl || "https://munsaqah.rayansalajlan.workers.dev");

  return {
    subject: "تنبيه دخول إلى منصة OD Academy",
    text: `
حيّاك الله يا ${displayName || "متدربنا العزيز"}

تم تسجيل دخول جديد إلى حسابك في منصة OD Academy.

إذا كان هذا أنت، فلا تحتاج لأي إجراء.
إذا لم يكن أنت، غيّر كلمة المرور فورًا.

رابط المنصة:
${siteUrl || "https://munsaqah.rayansalajlan.workers.dev"}
    `.trim(),
    html: `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
        <div style="max-width:650px;margin:auto;background:#fff;border-radius:22px;padding:24px;border:1px solid #e2e8f0;">
          <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:#eef2ff;color:#3730a3;font-weight:700;font-size:12px;">OD Academy</div>
          <h1 style="font-size:24px;line-height:1.6;margin:16px 0 8px;">تنبيه دخول جديد</h1>
          <p style="font-size:15px;line-height:2;color:#334155;">حيّاك الله يا ${safeName}. تم تسجيل دخول جديد إلى حسابك في المنصة.</p>
          <p style="font-size:14px;line-height:2;color:#64748b;">إذا كان هذا أنت، فلا تحتاج لأي إجراء. إذا لم يكن أنت، غيّر كلمة المرور فورًا.</p>
          <a href="${safeUrl}" style="display:inline-block;margin-top:12px;padding:12px 18px;border-radius:14px;background:#312e81;color:#fff;text-decoration:none;font-weight:700;">فتح المنصة</a>
        </div>
      </div>
    `.trim()
  };
}

function buildWelcomeEmail({ displayName, siteUrl, platformName = "OD Academy" }) {
  const safeDisplayName = escapeHtml(displayName || "متدربنا العزيز");
  const safeSiteUrl = escapeHtml(siteUrl || "https://munsaqah.rayansalajlan.workers.dev");
  const safePlatformName = escapeHtml(platformName);

  const subject = "مرحبًا بك في منسقة | رتّب فهمك قبل الحل";

  const text = `
حياك الله يا ${displayName || "متدربنا العزيز"}

أهلًا بك في منسقة.

هنا لا نبدأ بالحل مباشرة. نرتب الفهم أولًا:
نقرأ السلوك، نبحث عن النظام خلف المشكلة، ثم نبني تدخلًا قابلًا للقياس.

ابدأ بخطوات بسيطة:
1. افتح الرحلة التعليمية وابدأ من اليوم الأول.
2. أكمل ملفك التعليمي وحدد هدفك من الرحلة.
3. جرّب رادار الأداء لتعرف أين تقف.
4. استخدم الموجه الذكي عندما تواجه سؤالًا أو حالة مهنية.
5. احفظ إنجازك يومًا بعد يوم.

منسقة ليست سباق صفحات. هي مساحة تساعدك تبني عينًا مهنية أهدأ، وأعمق، وأكثر قدرة على قراءة ما يحدث داخل المنظمة.

رابط المنصة:
${siteUrl || "https://munsaqah.rayansalajlan.workers.dev"}
  `.trim();

  const html = `
  <div dir="rtl" style="margin:0;padding:0;background:#f7f3fc;font-family:Tahoma,Arial,sans-serif;color:#18102e;">
    <div style="max-width:720px;margin:0 auto;padding:30px 16px;">
      <div style="background:linear-gradient(135deg,#160c2a,#3b1d6e);border-radius:30px;padding:30px;color:#ffffff;box-shadow:0 24px 70px rgba(28,17,48,.20);">
        <div style="display:inline-block;background:rgba(255,255,255,.12);color:#e9d5ff;border:1px solid rgba(216,180,254,.28);border-radius:999px;padding:8px 14px;font-size:12px;font-weight:700;">
          ${safePlatformName} | منسقة
        </div>
        <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.55;color:#ffffff;">
          حياك الله يا ${safeDisplayName}
        </h1>
        <p style="margin:0;color:#ddd6fe;font-size:16px;line-height:2;">
          أهلًا بك في منسقة. هنا نرتب الفهم قبل الحل، ونبحث عن النظام خلف المشكلة، حتى تصبح قراءتك للتطوير التنظيمي أعمق وأكثر اتزانًا.
        </p>
      </div>

      <div style="background:#ffffff;border:1px solid #e5ddf5;border-radius:26px;padding:24px;margin-top:16px;">
        <h2 style="margin:0 0 14px;font-size:22px;line-height:1.6;color:#18102e;">كيف تبدأ رحلتك؟</h2>

        <div style="background:#f8f5ff;border:1px solid #eadcff;border-radius:18px;padding:15px;margin-bottom:12px;">
          <strong style="color:#5b21b6;">01 | افتح اليوم الأول</strong>
          <p style="margin:6px 0 0;color:#463c63;line-height:1.9;font-size:14px;">ابدأ بهدوء. المهم أن تفهم الفكرة وتربطها بواقع العمل، لا أن تنهي الصفحات بسرعة.</p>
        </div>

        <div style="background:#f8f5ff;border:1px solid #eadcff;border-radius:18px;padding:15px;margin-bottom:12px;">
          <strong style="color:#5b21b6;">02 | حدّث ملفك التعليمي</strong>
          <p style="margin:6px 0 0;color:#463c63;line-height:1.9;font-size:14px;">اكتب هدفك من الرحلة حتى يصبح تقدمك مرتبطًا بما تريد بناءه مهنيًا.</p>
        </div>

        <div style="background:#f8f5ff;border:1px solid #eadcff;border-radius:18px;padding:15px;margin-bottom:12px;">
          <strong style="color:#5b21b6;">03 | استخدم الرادار والمحاكاة</strong>
          <p style="margin:6px 0 0;color:#463c63;line-height:1.9;font-size:14px;">الرادار يوضح موقعك، والمحاكاة تساعدك تختبر قراراتك قبل أن تواجهها في الواقع.</p>
        </div>

        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:20px;padding:18px;margin-top:18px;">
          <h3 style="margin:0 0 8px;color:#7c2d12;font-size:18px;">تذكير من منسقة</h3>
          <p style="margin:0;color:#7c2d12;font-size:15px;line-height:2;font-weight:700;">لا تبدأ بالحل. افهم النظام أولًا، ثم اختر التدخل الذي يستحق أن يحدث.</p>
        </div>

        <a href="${safeSiteUrl}" style="display:inline-block;margin-top:20px;padding:14px 22px;background:#5b21b6;color:#ffffff;text-decoration:none;border-radius:16px;font-weight:700;">
          افتح منسقة الآن
        </a>
      </div>

      <div style="text-align:center;color:#6f6391;font-size:12px;line-height:1.8;margin-top:18px;">
        وصلتك هذه الرسالة لأنك أنشأت حسابًا في منصة منسقة.
      </div>
    </div>
  </div>
  `.trim();

  return { subject, text, html };
}

async function fetchUserProfile({ supabaseUrl, supabaseAnonKey, accessToken, userId }) {
  const select = [
    "full_name",
    "certificate_name",
    "display_name",
    "welcome_email_sent_at",
    "welcome_email_status"
  ].join(",");

  const response = await fetch(
    `${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(userId)}&select=${encodeURIComponent(select)}`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    }
  );

  const data = await safeJson(response);

  if (!response.ok) {
    return { ok: false, status: response.status, error: data?.message || data?.error };
  }

  return { ok: true, profile: Array.isArray(data) ? data[0] : null };
}

async function updateUserProfile({ supabaseUrl, supabaseAnonKey, accessToken, userId, patch }) {
  const response = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(patch)
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      details: await response.text().catch(() => "")
    };
  }

  return { ok: true };
}

async function safeFetchUserProfile(args) {
  const result = await fetchUserProfile(args);

  if (!result.ok) {
    console.warn("تعذر قراءة ملف المستخدم لإيميلات المنصة:", result.error || result.status);
    return {
      ok: false,
      profile: null,
      error: result.error,
      status: result.status
    };
  }

  return result;
}

async function safeUpdateUserProfile(args) {
  const result = await updateUserProfile(args);

  if (!result.ok) {
    console.warn("تعذر تحديث ملف المستخدم لإيميلات المنصة:", result.details || result.status);
  }

  return result;
}

function getDisplayNameFromUserAndProfile(user, profile = {}) {
  return (
    profile?.display_name ||
    profile?.certificate_name ||
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")?.[0] ||
    "متدربنا العزيز"
  );
}


function getAuthToken(request) {
  const authHeader = request.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.replace("Bearer ", "").trim();
}

function getRequiredEmailEnv(env) {
  return {
    supabaseUrl: getEnvValue(env, "SUPABASE_URL", "VITE_SUPABASE_URL"),
    supabaseAnonKey: getEnvValue(env, "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"),
    brevoApiKey: getEnvValue(env, "BREVO_API_KEY"),
    senderEmail: getEnvValue(env, "BREVO_SENDER_EMAIL"),
    senderName: getEnvValue(env, "BREVO_SENDER_NAME") || "OD Academy",
    siteUrl:
      getEnvValue(env, "SITE_URL", "PUBLIC_SITE_URL") ||
      "https://munsaqah.rayansalajlan.workers.dev"
  };
}

async function handleLoginNoticeRequest(request, env) {
  if (request.method === "OPTIONS") return emptyResponse(request, env);

  if (request.method === "GET") {
    return jsonResponse(
      {
        ok: true,
        service: "odacademy-login-notice",
        message: "خدمة تنبيه الدخول متصلة."
      },
      200,
      request,
      env
    );
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405, request, env);
  }

  const limit = getRateLimitNumber(env, "EMAIL_RATE_LIMIT_PER_MINUTE", 3);
  const rate = await checkRateLimit(request, env, {
    bucket: "login-notice",
    limit,
    windowSeconds: 60
  });

  if (!rate.allowed) return rateLimitResponse(request, env, rate);

  const accessToken = getAuthToken(request);

  if (!accessToken) {
    return jsonResponse({ ok: false, error: "Missing authorization token" }, 401, request, env);
  }

  const { supabaseUrl, supabaseAnonKey, brevoApiKey, senderEmail, senderName, siteUrl } = getRequiredEmailEnv(env);

  if (!supabaseUrl || !supabaseAnonKey || !brevoApiKey || !senderEmail) {
    return jsonResponse({ ok: false, error: "Email service environment variables are incomplete" }, 500, request, env);
  }

  const userResult = await getSupabaseUser({ supabaseUrl, supabaseAnonKey, accessToken });
  if (!userResult.ok) return jsonResponse({ ok: false, error: userResult.error }, userResult.status || 401, request, env);

  const profileResult = await safeFetchUserProfile({
    supabaseUrl,
    supabaseAnonKey,
    accessToken,
    userId: userResult.user.id
  });

  const profile = profileResult.profile || {};
  const displayName = getDisplayNameFromUserAndProfile(userResult.user, profile);
  const email = buildLoginEmail({ displayName, siteUrl });

  const sendResult = await sendEmailWithBrevo({
    apiKey: brevoApiKey,
    senderName,
    senderEmail,
    toEmail: userResult.user.email,
    toName: displayName,
    subject: email.subject,
    html: email.html,
    text: email.text
  });

  if (!sendResult.ok) {
    console.warn("Login notice email provider failed:", sendResult.status, sendResult.details);

    return jsonResponse(
      {
        ok: false,
        code: "EMAIL_PROVIDER_FAILED",
        error: "تعذر إرسال تنبيه الدخول."
      },
      502,
      request,
      env
    );
  }

  return jsonResponse({ ok: true, sent: true }, 200, request, env);
}

async function handleWelcomeEmailRequest(request, env) {
  if (request.method === "OPTIONS") return emptyResponse(request, env);

  if (request.method === "GET") {
    const config = getRequiredEmailEnv(env);
    const envReady = Boolean(
      config.supabaseUrl &&
        config.supabaseAnonKey &&
        config.brevoApiKey &&
        config.senderEmail
    );

    return jsonResponse(
      {
        ok: envReady,
        service: "odacademy-welcome-email",
        message: envReady
          ? "خدمة إيميل الترحيب متصلة وجاهزة."
          : "خدمة إيميل الترحيب متصلة لكن الإعدادات ناقصة.",
        envReady
      },
      envReady ? 200 : 503,
      request,
      env
    );
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405, request, env);
  }

  const limit = getRateLimitNumber(env, "EMAIL_RATE_LIMIT_PER_MINUTE", 3);
  const rate = await checkRateLimit(request, env, {
    bucket: "welcome-email",
    limit,
    windowSeconds: 60
  });

  if (!rate.allowed) return rateLimitResponse(request, env, rate);

  const accessToken = getAuthToken(request);

  if (!accessToken) {
    return jsonResponse({ ok: false, error: "Missing authorization token" }, 401, request, env);
  }

  const { supabaseUrl, supabaseAnonKey, brevoApiKey, senderEmail, senderName, siteUrl } = getRequiredEmailEnv(env);

  if (!supabaseUrl || !supabaseAnonKey || !brevoApiKey || !senderEmail) {
    return jsonResponse({ ok: false, error: "Email service environment variables are incomplete" }, 500, request, env);
  }

  const userResult = await getSupabaseUser({ supabaseUrl, supabaseAnonKey, accessToken });
  if (!userResult.ok) return jsonResponse({ ok: false, error: userResult.error }, userResult.status || 401, request, env);

  const parsedBody = await readLimitedJsonRequest(request, MAX_EMAIL_REQUEST_BYTES);
  if (!parsedBody.ok) {
    return jsonResponse(
      {
        ok: false,
        code: parsedBody.code,
        error: parsedBody.error
      },
      parsedBody.status,
      request,
      env
    );
  }

  const body = parsedBody.data || {};
  const force = body.force === true;

  const profileResult = await safeFetchUserProfile({
    supabaseUrl,
    supabaseAnonKey,
    accessToken,
    userId: userResult.user.id
  });

  const profile = profileResult.profile || {};

  if (!force && profile.welcome_email_sent_at) {
    return jsonResponse({ ok: true, skipped: true, reason: "welcome_email_already_sent" }, 200, request, env);
  }

  await safeUpdateUserProfile({
    supabaseUrl,
    supabaseAnonKey,
    accessToken,
    userId: userResult.user.id,
    patch: {
      welcome_email_status: "sending",
      welcome_email_last_attempt_at: new Date().toISOString()
    }
  });

  const displayName = getDisplayNameFromUserAndProfile(userResult.user, profile);
  const email = buildWelcomeEmail({ displayName, siteUrl, platformName: senderName });

  const sendResult = await sendEmailWithBrevo({
    apiKey: brevoApiKey,
    senderName,
    senderEmail,
    toEmail: userResult.user.email,
    toName: displayName,
    subject: email.subject,
    html: email.html,
    text: email.text
  });

  if (!sendResult.ok) {
    console.warn("Welcome email provider failed:", sendResult.status, sendResult.details);

    await safeUpdateUserProfile({
      supabaseUrl,
      supabaseAnonKey,
      accessToken,
      userId: userResult.user.id,
      patch: {
        welcome_email_status: "failed",
        welcome_email_error: JSON.stringify(sendResult.details || {}).slice(0, 700),
        welcome_email_last_attempt_at: new Date().toISOString()
      }
    });

    return jsonResponse(
      {
        ok: false,
        code: "EMAIL_PROVIDER_FAILED",
        error: "تعذر إرسال إيميل الترحيب."
      },
      502,
      request,
      env
    );
  }

  await safeUpdateUserProfile({
    supabaseUrl,
    supabaseAnonKey,
    accessToken,
    userId: userResult.user.id,
    patch: {
      welcome_email_sent_at: new Date().toISOString(),
      welcome_email_status: "sent",
      welcome_email_error: null,
      welcome_email_last_attempt_at: new Date().toISOString()
    }
  });

  return jsonResponse({ ok: true, sent: true, provider: "brevo" }, 200, request, env);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (pathname.startsWith("/api/") && !isAllowedRequestOrigin(request, env)) {
      return forbiddenOriginResponse(request, env);
    }

    if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
      return emptyResponse(request, env);
    }

    if (pathname === "/api/mentor") {
      return handleMentorRequest(request, env);
    }

    if (pathname === "/api/login-notice") {
      return handleLoginNoticeRequest(request, env);
    }

    if (pathname === "/api/welcome-email") {
      return handleWelcomeEmailRequest(request, env);
    }

    return assetResponse(request, env);
  }
};
