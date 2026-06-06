// worker/index.js
// OD Academy Worker
// API:
// - /api/mentor        الموجه الذكي عبر Cloudflare Workers AI مع Rate Limit و CORS مقيد
// - /api/login-notice  تنبيه دخول عبر Brevo
// - /api/welcome-email إيميل ترحيبي عبر Brevo
// باقي الطلبات تمر إلى assets عبر env.ASSETS

const DEFAULT_ALLOWED_ORIGINS = [
  "https://odacademy.rayansalajlan.workers.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const MEMORY_RATE_LIMIT = new Map();

const MENTOR_SYSTEM_INSTRUCTION = `
أنت "مختبر هندسة القرار المهني" داخل منصة OD Academy.

دورك:
تساعد المتدرب والممارس على بناء تفكير مهني عميق في التطوير التنظيمي والموارد البشرية:
- التشخيص قبل الحل.
- تحويل السؤال العام إلى خطوات قابلة للتطبيق.
- بناء نماذج عملية: وصف وظيفي، مؤشرات أداء، مصفوفة صلاحيات، خطة تغيير، تحليل ثقافة، تدخل تنظيمي.
- تقديم إطار واضح ثم أسئلة تخصيص قليلة عند الحاجة.

أسلوبك:
- عربي مهني رشيق قريب من السياق السعودي دون مبالغة.
- لا تكرر النداءات.
- لا تستخدم عبارة "يا زميل المهنة".
- لا تذكر أنك تعمل بالطريقة السقراطية.
- لا تتهرب من الإجابة بسؤال فقط.
- ابدأ بإجابة عملية مفيدة، ثم اسأل سؤالًا أو سؤالين فقط للتخصيص.
- استخدم عناوين قصيرة، خطوات واضحة، وقوالب عند الحاجة.
- لا تستخدم الإنجليزية إلا إذا كانت مصطلحًا مهنيًا شائعًا ولا يوجد بديل عربي مناسب.

عند سؤال "كيف أبني وصف وظيفي؟":
اعطِه مباشرة:
1) الغرض من الدور.
2) موقع الدور في الهيكل.
3) المخرجات الرئيسية.
4) المسؤوليات.
5) الصلاحيات.
6) العلاقات الداخلية والخارجية.
7) مؤشرات الأداء.
8) الكفاءات.
9) قالب مختصر قابل للنسخ.
ثم اسأله عن اسم الدور والقطاع إن أراد تخصيصه.

عند سؤال تشخيص مشكلة:
رتّب الرد:
العرض الظاهر، النمط المتكرر، الفرضيات، البيانات المطلوبة، أصحاب المصلحة، التدخل المقترح، قياس الأثر، المخاطر الأخلاقية.
`;

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
    "Access-Control-Allow-Origin": getCorsOrigin(request, env),
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
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

function extractAiText(result) {
  if (!result) return "";

  if (typeof result === "string") return result;

  if (typeof result.response === "string") return result.response;
  if (typeof result.result === "string") return result.result;
  if (typeof result.text === "string") return result.text;

  if (Array.isArray(result?.choices)) {
    return (
      result.choices[0]?.message?.content ||
      result.choices[0]?.text ||
      ""
    );
  }

  if (Array.isArray(result?.output)) {
    return result.output
      .map((item) => item?.content || item?.text || "")
      .join("\n")
      .trim();
  }

  return "";
}

async function callWorkersAi(env, conversation) {
  if (!env?.AI) {
    return {
      ok: false,
      error: "Workers AI binding AI غير موجود."
    };
  }

  const model =
    getEnvValue(env, "WORKERS_AI_MODEL") ||
    "@cf/meta/llama-3.1-8b-instruct";

  const messages = [
    {
      role: "system",
      content: MENTOR_SYSTEM_INSTRUCTION
    },
    ...conversation.map((item) => ({
      role: item.role,
      content: item.content
    }))
  ];

  const result = await env.AI.run(model, {
    messages,
    max_tokens: 1300,
    temperature: 0.45
  });

  const text = extractAiText(result);

  if (!text) {
    return {
      ok: false,
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
}

function getGeminiModels(env) {
  const configured = getEnvValue(env, "GEMINI_MODELS");

  if (configured) return splitEnvList(configured);

  return [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ];
}

function extractGeminiText(result) {
  return (
    result?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n")
      .trim() || ""
  );
}

async function callGeminiOnce({ apiKey, model, conversation }) {
  const contents = conversation.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.content }]
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: MENTOR_SYSTEM_INSTRUCTION }]
        },
        contents,
        generationConfig: {
          temperature: 0.45,
          topP: 0.9,
          maxOutputTokens: 1300
        }
      })
    }
  );

  const data = await safeJson(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data?.error?.message || "Gemini request failed",
      data
    };
  }

  const text = extractGeminiText(data);

  if (!text) {
    return {
      ok: false,
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
}

async function callGeminiFallback(env, conversation) {
  const apiKey = getEnvValue(env, "GEMINI_API_KEY");

  if (!apiKey) {
    return {
      ok: false,
      error: "GEMINI_API_KEY غير موجود."
    };
  }

  const errors = [];

  for (const model of getGeminiModels(env)) {
    const result = await callGeminiOnce({
      apiKey,
      model,
      conversation
    });

    if (result.ok) return result;

    errors.push({
      model,
      error: result.error,
      status: result.status
    });

    if (![429, 500, 502, 503, 504].includes(Number(result.status))) {
      break;
    }
  }

  return {
    ok: false,
    error: "تعذر الحصول على رد من Gemini.",
    errors
  };
}

async function handleMentorRequest(request, env) {
  if (request.method === "OPTIONS") return emptyResponse(request, env);

  if (request.method === "GET") {
    return jsonResponse(
      {
        ok: true,
        service: "odacademy-mentor",
        provider: env?.AI ? "workers-ai" : "gemini-fallback",
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

  const body = (await safeJson(request)) || {};
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

  let result = await callWorkersAi(env, conversation);

  if (!result.ok) {
    // fallback اختياري في حال لم تكن AI binding مفعلة.
    result = await callGeminiFallback(env, conversation);
  }

  if (!result.ok) {
    return jsonResponse(
      {
        ok: false,
        error: "الموجه غير متاح الآن. فيه ضغط على المختبر الذكي، جرّب بعد قليل.",
        details: result.error || result.errors
      },
      503,
      request,
      env
    );
  }

  return jsonResponse(
    {
      ok: true,
      reply: result.text,
      text: result.text,
      provider: result.provider,
      model: result.model
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
  const safeUrl = escapeHtml(siteUrl || "https://odacademy.rayansalajlan.workers.dev");

  return {
    subject: "تنبيه دخول إلى منصة OD Academy",
    text: `
حيّاك الله يا ${displayName || "متدربنا العزيز"}

تم تسجيل دخول جديد إلى حسابك في منصة OD Academy.

إذا كان هذا أنت، فلا تحتاج لأي إجراء.
إذا لم يكن أنت، غيّر كلمة المرور فورًا.

رابط المنصة:
${siteUrl || "https://odacademy.rayansalajlan.workers.dev"}
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
  const safeSiteUrl = escapeHtml(siteUrl || "https://odacademy.rayansalajlan.workers.dev");
  const safePlatformName = escapeHtml(platformName);

  const subject = "🎉 حيّاك الله في رحلة إتقان التطوير التنظيمي";

  const text = `
حيّاك الله يا ${displayName || "متدربنا العزيز"} 🌿

سعدنا بانضمامك إلى رحلة إتقان التطوير التنظيمي.

هذه ليست مجرد منصة محتوى، بل مساحة تدريب معرفي تساعدك على قراءة المنظمة قبل استعجال الحل:
تشخيص، تصميم، تغيير، ثقافة، قياس، واستدامة.

ابدأ رحلتك بهذه الخطوات:
1. افتح رحلتك التعليمية وابدأ من اليوم الأول.
2. حدّث ملفك التعليمي وحدد هدفك من الرحلة.
3. جرّب رادار الأداء لتعرف أين تقف.
4. استخدم الموجه الذكي عند مواجهة حالة أو سؤال مهني.
5. اختبر قراراتك داخل المحاكاة.

تذكّر: القيمة ليست في إنهاء الصفحات بسرعة، بل في بناء عين مهنية ترى النظام خلف المشكلة، والمعنى خلف السلوك.

رابط المنصة:
${siteUrl || "https://odacademy.rayansalajlan.workers.dev"}

بانتظار أثر جميل تصنعه من هذه الرحلة ✨
  `.trim();

  const html = `
  <div dir="rtl" style="margin:0;padding:0;background:#f8fafc;font-family:Tahoma,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:720px;margin:0 auto;padding:28px 16px;">
      <div style="background:linear-gradient(135deg,#0f172a,#312e81);border-radius:30px;padding:30px;color:#ffffff;box-shadow:0 22px 60px rgba(15,23,42,.18);">
        <div style="display:inline-block;background:rgba(245,158,11,.16);color:#fde68a;border:1px solid rgba(245,158,11,.28);border-radius:999px;padding:8px 14px;font-size:12px;font-weight:700;">
          ${safePlatformName} · بداية الرحلة 🌿
        </div>
        <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.55;">
          حيّاك الله يا ${safeDisplayName} 🎉
        </h1>
        <p style="margin:0;color:#dbeafe;font-size:16px;line-height:2;">
          سعدنا بانضمامك إلى رحلة معرفية صُممت لتساعدك على فهم المنظمة قبل استعجال الحل:
          تشخيص، تصميم، تغيير، ثقافة، قياس، واستدامة.
        </p>
      </div>

      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:26px;padding:24px;margin-top:16px;">
        <h2 style="margin:0 0 14px;font-size:21px;color:#0f172a;">كيف تبدأ؟ 🚀</h2>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:15px;margin-bottom:12px;">
          <strong style="color:#312e81;">01 · ابدأ من اليوم الأول</strong>
          <p style="margin:6px 0 0;color:#334155;line-height:1.9;font-size:14px;">لا تتعامل مع الرحلة كصفحات تُقرأ، بل كبوابات إتقان تتقدم فيها يومًا بعد يوم.</p>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:15px;margin-bottom:12px;">
          <strong style="color:#312e81;">02 · حدّث ملفك التعليمي ✍️</strong>
          <p style="margin:6px 0 0;color:#334155;line-height:1.9;font-size:14px;">اكتب هدفك من الرحلة ليصبح تقدمك أكثر ارتباطًا بما تريد بناءه مهنيًا.</p>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:15px;margin-bottom:12px;">
          <strong style="color:#312e81;">03 · جرّب الرادار والمحاكاة 🧭</strong>
          <p style="margin:6px 0 0;color:#334155;line-height:1.9;font-size:14px;">رادار الأداء يوضح أين تقف، والمحاكاة تختبر طريقة تفكيرك في مواقف تنظيمية واقعية.</p>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:22px;padding:18px;margin-top:18px;">
          <h3 style="margin:0 0 8px;color:#78350f;font-size:18px;">رسالة صغيرة قبل الانطلاق ✨</h3>
          <p style="margin:0;color:#78350f;font-size:15px;line-height:2;font-weight:700;">القيمة ليست في إنهاء الصفحات بسرعة، بل في بناء عين مهنية ترى النظام خلف المشكلة، والمعنى خلف السلوك.</p>
        </div>

        <a href="${safeSiteUrl}" style="display:inline-block;margin-top:20px;padding:14px 22px;background:#312e81;color:#ffffff;text-decoration:none;border-radius:16px;font-weight:700;">
          متابعة الرحلة الآن
        </a>
      </div>

      <div style="text-align:center;color:#64748b;font-size:12px;line-height:1.8;margin-top:18px;">
        هذه رسالة ترحيبية مرتبطة بإنشاء حسابك في منصة إتقان التطوير التنظيمي.
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
      "https://odacademy.rayansalajlan.workers.dev"
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
    return jsonResponse(
      {
        ok: false,
        error: "تعذر إرسال تنبيه الدخول.",
        details: sendResult.details
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
    const missing = [];

    if (!config.supabaseUrl) missing.push("SUPABASE_URL أو VITE_SUPABASE_URL");
    if (!config.supabaseAnonKey) missing.push("SUPABASE_ANON_KEY أو VITE_SUPABASE_ANON_KEY");
    if (!config.brevoApiKey) missing.push("BREVO_API_KEY");
    if (!config.senderEmail) missing.push("BREVO_SENDER_EMAIL");

    return jsonResponse(
      {
        ok: missing.length === 0,
        service: "odacademy-welcome-email",
        message: missing.length === 0
          ? "خدمة إيميل الترحيب متصلة وجاهزة."
          : "خدمة إيميل الترحيب متصلة لكن الإعدادات ناقصة.",
        envReady: missing.length === 0,
        missing
      },
      missing.length === 0 ? 200 : 500,
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

  const body = (await safeJson(request)) || {};
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
        error: "تعذر إرسال إيميل الترحيب.",
        details: sendResult.details
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


function jsStringLiteral(value) {
  return JSON.stringify(String(value || ""));
}

function handleRuntimeConfigRequest(request, env) {
  const config = {
    VITE_SUPABASE_URL: getEnvValue(env, "VITE_SUPABASE_URL", "SUPABASE_URL"),
    VITE_SUPABASE_ANON_KEY: getEnvValue(env, "VITE_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY"),
    SITE_URL:
      getEnvValue(env, "SITE_URL", "PUBLIC_SITE_URL") ||
      getRequestSameOrigin(request)
  };

  const body = `window.__ODACADEMY_CONFIG__ = Object.freeze({\n` +
    Object.entries(config)
      .map(([key, value]) => `  ${JSON.stringify(key)}: ${jsStringLiteral(value)}`)
      .join(",\n") +
    `\n});\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (pathname === "/env-config.js") {
      return handleRuntimeConfigRequest(request, env);
    }

    if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
      return emptyResponse(request, env);
    }

    if (pathname.startsWith("/api/") && !isAllowedRequestOrigin(request, env)) {
      return forbiddenOriginResponse(request, env);
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

    return env.ASSETS.fetch(request);
  }
};
