// worker/index.js
// Worker رئيسي لموقع OD Academy.
// يعالج مسارات API مثل /api/mentor و /api/login-notice
// ثم يمرر باقي الطلبات إلى ملفات React المبنية داخل dist عبر env.ASSETS.

const AI_SYSTEM_INSTRUCTION = `
أنت مستشار أول وعرّاب خبير في هندسة التطوير التنظيمي (Organization Development).

تتحدث بالعربية المهنية القريبة من العامية السعودية الرصينة، بأسلوب ذكي وفخم دون مبالغة.
استخدم عبارات مناسبة مثل:
- يا زميل المهنة
- خلنا نفككها
- وش العرض؟
- وش النمط؟
- وش الفرضيات اللي بنيت عليها؟

مهمتك هي توجيه المتدربين والممارسين باستخدام الطريقة السقراطية الذكية.

قواعدك:
1. لا تعطِ حلولًا جاهزة مباشرة.
2. ساعد المستخدم خطوة بخطوة على تفكيك:
   العرض → النمط → الفرضيات → البيانات المطلوبة → التدخل → قياس الأثر.
3. اربط إجاباتك بمبادئ التطوير التنظيمي:
   التفكير النظمي، الدخول والتعاقد، التشخيص متعدد المصادر، قيادة التغيير، الثقافة، التعلم المؤسسي، والاستدامة.
4. اجعل ردك عمليًا ومباشرًا، لكن لا تختصر لدرجة تفقد العمق.
5. عندما يكون سؤال المستخدم عامًا، اسأله سؤالين تشخيصيين قبل اقتراح المسار.
6. عندما يطلب المستخدم مثالًا، أعطه مثالًا تطبيقيًا مختصرًا ثم اسأله كيف ينطبق على حالته.
7. إذا سألك المستخدم عن بناء وصف وظيفي، وجّهه إلى فهم الغرض من الدور، موقعه في الهيكل، مخرجاته، صلاحياته، علاقاته، مؤشرات أدائه، ثم كفاءاته.
`;

const DEFAULT_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

const DEFAULT_ALLOWED_ORIGINS = [
  "https://odacademy.rayansalajlan.workers.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const MEMORY_RATE_LIMIT = new Map();

function getAllowedOrigins(env) {
  const configured = getEnvValue(env, "ALLOWED_ORIGINS", "CORS_ALLOWED_ORIGINS");

  if (!configured) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function normalizeOrigin(value) {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return "";
  }
}

function getRequestOrigin(request) {
  return normalizeOrigin(request.headers.get("Origin") || "");
}

function getFallbackOrigin(request, env) {
  const allowed = getAllowedOrigins(env);
  const requestUrl = new URL(request.url);
  const sameOrigin = `${requestUrl.protocol}//${requestUrl.host}`;

  if (allowed.includes(sameOrigin)) {
    return sameOrigin;
  }

  return allowed[0] || sameOrigin;
}

function isAllowedRequestOrigin(request, env) {
  const origin = getRequestOrigin(request);

  // الطلبات المباشرة من نفس الموقع أو السيرفر لا ترسل Origin دائمًا.
  if (!origin) {
    return true;
  }

  return getAllowedOrigins(env).includes(origin);
}

function corsHeaders(request, env, extraHeaders = {}) {
  const origin = getRequestOrigin(request);
  const fallbackOrigin = getFallbackOrigin(request, env);
  const allowedOrigin = origin && isAllowedRequestOrigin(request, env) ? origin : fallbackOrigin;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    ...extraHeaders
  };
}

function jsonResponse(payload, status = 200, request = new Request("https://odacademy.local"), env = {}, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(request, env, extraHeaders),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function emptyResponse(status = 204, request = new Request("https://odacademy.local"), env = {}, extraHeaders = {}) {
  return new Response(null, {
    status,
    headers: corsHeaders(request, env, extraHeaders)
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

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function buildRateLimitKey(request, routeName) {
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    "unknown-ip";
  const country = request.headers.get("CF-IPCountry") || "xx";
  const userAgent = request.headers.get("User-Agent") || "unknown-agent";
  const authHeader = request.headers.get("Authorization") || "";

  // لا نخزن التوكن نفسه، فقط بصمة قصيرة منه إن وجد.
  const identitySource = authHeader
    ? `auth:${authHeader.slice(0, 80)}`
    : `ip:${ip}:${country}:${userAgent.slice(0, 120)}`;

  const hash = await sha256Hex(identitySource);

  return `rate:${routeName}:${hash}`;
}

async function checkRateLimit({
  request,
  env,
  routeName,
  limitPerMinute = 20,
  windowSeconds = 60
}) {
  const safeLimit = Math.max(1, Number(limitPerMinute || 20));
  const safeWindow = Math.max(10, Number(windowSeconds || 60));
  const key = await buildRateLimitKey(request, routeName);
  const now = Date.now();

  if (env?.RATE_LIMIT_KV) {
    const current = await env.RATE_LIMIT_KV.get(key, { type: "json" });
    const record =
      current && Number(current.resetAt) > now
        ? current
        : {
            count: 0,
            resetAt: now + safeWindow * 1000
          };

    if (record.count >= safeLimit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.max(1, Math.ceil((record.resetAt - now) / 1000))
      };
    }

    const nextRecord = {
      count: record.count + 1,
      resetAt: record.resetAt
    };

    await env.RATE_LIMIT_KV.put(key, JSON.stringify(nextRecord), {
      expirationTtl: safeWindow + 10
    });

    return {
      allowed: true,
      remaining: Math.max(0, safeLimit - nextRecord.count),
      retryAfter: Math.max(1, Math.ceil((record.resetAt - now) / 1000))
    };
  }

  // fallback مؤقت إذا لم تضف KV Binding بعد. ليس بديلًا دائمًا عن KV.
  const record = MEMORY_RATE_LIMIT.get(key);

  if (!record || record.resetAt <= now) {
    MEMORY_RATE_LIMIT.set(key, {
      count: 1,
      resetAt: now + safeWindow * 1000
    });

    return {
      allowed: true,
      remaining: safeLimit - 1,
      retryAfter: safeWindow
    };
  }

  if (record.count >= safeLimit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((record.resetAt - now) / 1000))
    };
  }

  record.count += 1;
  MEMORY_RATE_LIMIT.set(key, record);

  return {
    allowed: true,
    remaining: Math.max(0, safeLimit - record.count),
    retryAfter: Math.max(1, Math.ceil((record.resetAt - now) / 1000))
  };
}

function rateLimitResponse(request, env, retryAfter) {
  return jsonResponse(
    {
      ok: false,
      error:
        "الموجه عليه ضغط عالي الآن. خذ لك نفس دقيقة وارجع جرّب، بنكون جاهزين لك بإذن الله.",
      retryAfter
    },
    429,
    request,
    env,
    {
      "Retry-After": String(retryAfter)
    }
  );
}

function getEnvValue(env, ...names) {
  for (const name of names) {
    const value = env?.[name];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function cleanUserMessage(value) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, 7000);
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => part?.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function buildGeminiModelList(env) {
  const configuredModel = getEnvValue(env, "GEMINI_MODEL");

  if (configuredModel) {
    return [
      configuredModel,
      ...DEFAULT_GEMINI_MODELS.filter((model) => model !== configuredModel)
    ];
  }

  return DEFAULT_GEMINI_MODELS;
}

async function callGeminiOnce({ apiKey, model, message }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: AI_SYSTEM_INSTRUCTION
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: message
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.72,
        topP: 0.9,
        maxOutputTokens: 1400
      }
    })
  });

  const data = await safeJson(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      model,
      error:
        data?.error?.message ||
        data?.message ||
        `تعذر الاتصال بنموذج Gemini: ${model}`
    };
  }

  const text = extractGeminiText(data);

  return {
    ok: true,
    model,
    text:
      text ||
      "وصل رد فارغ من الموجه الذكي. أعد صياغة السؤال بتفاصيل أكثر وحاول مرة أخرى."
  };
}

async function callGeminiWithFallbacks({ apiKey, env, message }) {
  const models = buildGeminiModelList(env);
  const errors = [];

  for (const model of models) {
    const result = await callGeminiOnce({
      apiKey,
      model,
      message
    });

    if (result.ok) {
      return result;
    }

    errors.push(`${model}: ${result.error}`);

    // هذه الأخطاء قد تكون بسبب نموذج غير متاح أو ضغط أو تغيير اسم النموذج.
    // لذلك نجرّب النموذج التالي.
    if (![400, 404, 429, 500, 502, 503].includes(result.status)) {
      break;
    }
  }

  return {
    ok: false,
    status: 502,
    error:
      errors.join(" | ") ||
      "تعذر الاتصال بالموجه الذكي عبر النماذج المتاحة."
  };
}

async function handleMentorRequest(request, env) {
  if (request.method === "OPTIONS") {
    return emptyResponse(204, request, env);
  }

  // اختبار سريع من المتصفح:
  // افتح /api/mentor
  // إذا ظهر هذا الرد، فالمسار يعمل.
  if (request.method === "GET") {
    return jsonResponse({
      ok: true,
      service: "odacademy-ai-mentor",
      message:
        "الموجه الذكي متصل على مستوى Cloudflare Worker. أرسل POST لاستخدامه."
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: `طريقة الطلب ${request.method} غير مدعومة. استخدم POST.`
      },
      405,
      request,
      env
    );
  }

  const rateLimit = await checkRateLimit({
    request,
    env,
    routeName: "mentor",
    limitPerMinute: Number(getEnvValue(env, "MENTOR_RATE_LIMIT_PER_MINUTE")) || 20,
    windowSeconds: 60
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse(request, env, rateLimit.retryAfter);
  }

  const apiKey = getEnvValue(env, "GEMINI_API_KEY");

  if (!apiKey) {
    return jsonResponse(
      {
        ok: false,
        error:
          "مفتاح GEMINI_API_KEY غير موجود في متغيرات Cloudflare. أضفه كـ Secret / Encrypted ثم أعد النشر."
      },
      500
    );
  }

  const body = await request.json().catch(() => ({}));
  const message = cleanUserMessage(body?.message);

  if (!message) {
    return jsonResponse(
      {
        ok: false,
        error: "اكتب رسالة أولًا حتى يستطيع الموجه الذكي الرد عليك."
      },
      400
    );
  }

  const result = await callGeminiWithFallbacks({
    apiKey,
    env,
    message
  });

  if (!result.ok) {
    return jsonResponse(
      {
        ok: false,
        error: result.error
      },
      result.status || 502
    );
  }

  return jsonResponse({
    ok: true,
    model: result.model,
    text: result.text
  });
}

/* -------------------------------------------------------
   login-notice عبر Brevo
   هذا الجزء يبقي رسالة الدخول شغالة إذا كنت تستخدمها.
------------------------------------------------------- */

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getSupabaseUser({ supabaseUrl, supabaseAnonKey, accessToken }) {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseAnonKey
    }
  });

  const data = await safeJson(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        data?.msg ||
        data?.error_description ||
        data?.error ||
        "Invalid Supabase session"
    };
  }

  return {
    ok: true,
    user: data
  };
}

function buildLoginEmail({
  email,
  loginTime,
  country,
  city,
  timezone,
  browserLanguage,
  userAgent
}) {
  const safeEmail = escapeHtml(email);
  const safeLoginTime = escapeHtml(loginTime);
  const safeCountry = escapeHtml(country);
  const safeCity = escapeHtml(city);
  const safeTimezone = escapeHtml(timezone);
  const safeBrowserLanguage = escapeHtml(browserLanguage);
  const safeUserAgent = escapeHtml(userAgent);

  const subject = "تم تسجيل دخولك إلى منصة إتقان التطوير التنظيمي";

  const text = `
مرحبًا بك في منصة إتقان التطوير التنظيمي.

تم تسجيل دخول ناجح إلى حسابك.

البريد: ${email}
وقت الدخول: ${loginTime}
الدولة: ${country}
المدينة التقريبية: ${city}
لغة المتصفح: ${browserLanguage}
المنطقة الزمنية للجهاز: ${timezone}
الجهاز/المتصفح: ${userAgent}

إن كان هذا الدخول منك، فلا يلزم اتخاذ أي إجراء.
إن لم يكن منك، غيّر كلمة المرور فورًا وراجع أمان بريدك الإلكتروني.

رسالة الرحلة:
عودتك اليوم ليست دخولًا عابرًا؛ هي رجوع إلى مساحة تفهم النظام قبل أن تقترح الحل.
`.trim();

  const html = `
    <div dir="rtl" style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Tahoma,sans-serif;color:#0f172a;">
      <div style="max-width:680px;margin:0 auto;padding:28px 16px;">
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:28px;padding:28px;color:#ffffff;box-shadow:0 18px 50px rgba(15,23,42,.16);">
          <div style="display:inline-block;background:rgba(245,158,11,.16);color:#fde68a;border:1px solid rgba(245,158,11,.25);border-radius:999px;padding:8px 14px;font-size:12px;font-weight:700;">
            تنبيه دخول آمن
          </div>

          <h1 style="margin:18px 0 10px;font-size:28px;line-height:1.5;">
            تم تسجيل دخولك إلى منصة إتقان التطوير التنظيمي
          </h1>

          <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:2;">
            تم رصد دخول ناجح إلى حسابك. إن كان هذا الدخول منك، أكمل رحلتك بهدوء.
            وإن لم يكن منك، غيّر كلمة المرور فورًا.
          </p>
        </div>

        <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:22px;margin-top:16px;">
          <h2 style="margin:0 0 14px;font-size:19px;color:#0f172a;">تفاصيل الدخول</h2>

          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">البريد</td>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">وقت الدخول</td>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${safeLoginTime}</td>
            </tr>
            <tr>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">الدولة</td>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${safeCountry}</td>
            </tr>
            <tr>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">المدينة التقريبية</td>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${safeCity}</td>
            </tr>
            <tr>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">لغة المتصفح</td>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${safeBrowserLanguage}</td>
            </tr>
            <tr>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">المنطقة الزمنية</td>
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${safeTimezone}</td>
            </tr>
            <tr>
              <td style="padding:10px;color:#64748b;">الجهاز/المتصفح</td>
              <td style="padding:10px;font-weight:700;word-break:break-word;">${safeUserAgent}</td>
            </tr>
          </table>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:24px;padding:22px;margin-top:16px;">
          <h2 style="margin:0 0 10px;font-size:18px;color:#78350f;">رسالة الرحلة</h2>
          <p style="margin:0;color:#78350f;font-size:15px;line-height:2;font-weight:700;">
            عودتك اليوم ليست دخولًا عابرًا؛ هي رجوع إلى مساحة تفهم النظام قبل أن تقترح الحل.
          </p>
        </div>
      </div>
    </div>
  `.trim();

  return {
    subject,
    text,
    html
  };
}

async function sendEmailWithBrevo({
  apiKey,
  senderName,
  senderEmail,
  toEmail,
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
        name: senderName,
        email: senderEmail
      },
      to: [
        {
          email: toEmail
        }
      ],
      subject,
      htmlContent: html,
      textContent: text
    })
  });

  const result = await safeJson(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      details: result
    };
  }

  return {
    ok: true,
    result
  };
}

async function handleLoginNoticeRequest(request, env) {
  if (request.method === "OPTIONS") {
    return emptyResponse(204, request, env);
  }

  if (request.method === "GET") {
    return jsonResponse({
      ok: true,
      service: "odacademy-login-notice",
      message: "خدمة تنبيه الدخول متصلة. أرسل POST بعد تسجيل الدخول."
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: `طريقة الطلب ${request.method} غير مدعومة. استخدم POST.`
      },
      405,
      request,
      env
    );
  }

  const emailRateLimit = await checkRateLimit({
    request,
    env,
    routeName: "login-notice",
    limitPerMinute: Number(getEnvValue(env, "EMAIL_RATE_LIMIT_PER_MINUTE")) || 3,
    windowSeconds: 60
  });

  if (!emailRateLimit.allowed) {
    return rateLimitResponse(request, env, emailRateLimit.retryAfter);
  }

  const authHeader = request.headers.get("Authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing authorization token"
      },
      401
    );
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();

  if (!accessToken) {
    return jsonResponse(
      {
        ok: false,
        error: "Empty authorization token"
      },
      401
    );
  }

  const supabaseUrl = getEnvValue(env, "SUPABASE_URL", "VITE_SUPABASE_URL");
  const supabaseAnonKey = getEnvValue(
    env,
    "SUPABASE_ANON_KEY",
    "VITE_SUPABASE_ANON_KEY"
  );

  const brevoApiKey = getEnvValue(env, "BREVO_API_KEY");
  const senderEmail = getEnvValue(env, "BREVO_SENDER_EMAIL");
  const senderName = getEnvValue(env, "BREVO_SENDER_NAME") || "OD Academy";

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing Supabase environment variables"
      },
      500
    );
  }

  if (!brevoApiKey) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing BREVO_API_KEY"
      },
      500
    );
  }

  if (!senderEmail) {
    return jsonResponse(
      {
        ok: false,
        error: "Missing BREVO_SENDER_EMAIL"
      },
      500
    );
  }

  const userResult = await getSupabaseUser({
    supabaseUrl,
    supabaseAnonKey,
    accessToken
  });

  if (!userResult.ok) {
    return jsonResponse(
      {
        ok: false,
        error: userResult.error || "Invalid Supabase session"
      },
      userResult.status || 401
    );
  }

  const user = userResult.user;

  if (!user?.email) {
    return jsonResponse(
      {
        ok: false,
        error: "User email not found"
      },
      400
    );
  }

  const body = await request.json().catch(() => ({}));

  const country = request.headers.get("CF-IPCountry") || "غير متاح";
  const city = request.cf?.city || "غير متاح";
  const timezone = body?.timezone || "Asia/Riyadh";
  const browserLanguage =
    body?.language || request.headers.get("Accept-Language") || "غير متاح";
  const userAgent =
    body?.userAgent || request.headers.get("User-Agent") || "غير متاح";

  const loginTime = new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Riyadh"
  }).format(new Date());

  const emailContent = buildLoginEmail({
    email: user.email,
    loginTime,
    country,
    city,
    timezone,
    browserLanguage,
    userAgent
  });

  const emailResult = await sendEmailWithBrevo({
    apiKey: brevoApiKey,
    senderName,
    senderEmail,
    toEmail: user.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });

  if (!emailResult.ok) {
    return jsonResponse(
      {
        ok: false,
        error: "Brevo email provider failed",
        details: emailResult.details
      },
      502
    );
  }

  return jsonResponse({
    ok: true,
    provider: "brevo",
    sent: true
  });
}


/* -------------------------------------------------------
   welcome-email عبر Brevo
   يرسل ترحيبًا واحدًا بعد أول دخول موثق، ثم يحفظ الحالة في Supabase.
------------------------------------------------------- */

function buildWelcomeEmail({
  displayName,
  siteUrl,
  platformName = "OD Academy"
}) {
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

        <div style="display:grid;gap:12px;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:15px;">
            <strong style="color:#312e81;">01 · ابدأ من اليوم الأول</strong>
            <p style="margin:6px 0 0;color:#334155;line-height:1.9;font-size:14px;">
              لا تتعامل مع الرحلة كصفحات تُقرأ، بل كبوابات إتقان تتقدم فيها يومًا بعد يوم.
            </p>
          </div>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:15px;">
            <strong style="color:#312e81;">02 · حدّث ملفك التعليمي ✍️</strong>
            <p style="margin:6px 0 0;color:#334155;line-height:1.9;font-size:14px;">
              اكتب هدفك من الرحلة ليصبح تقدمك أكثر ارتباطًا بما تريد بناءه مهنيًا.
            </p>
          </div>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:15px;">
            <strong style="color:#312e81;">03 · جرّب الرادار والمحاكاة 🧭</strong>
            <p style="margin:6px 0 0;color:#334155;line-height:1.9;font-size:14px;">
              رادار الأداء يوضح أين تقف، والمحاكاة تختبر طريقة تفكيرك في مواقف تنظيمية واقعية.
            </p>
          </div>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:15px;">
            <strong style="color:#312e81;">04 · استخدم الموجه الذكي عند الحاجة 💡</strong>
            <p style="margin:6px 0 0;color:#334155;line-height:1.9;font-size:14px;">
              عندما تواجه سؤالًا أو حالة، اطلب منه بناء منهجية، تحليل موقف، أو تصميم تدخل.
            </p>
          </div>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:22px;padding:18px;margin-top:18px;">
          <h3 style="margin:0 0 8px;color:#78350f;font-size:18px;">رسالة صغيرة قبل الانطلاق ✨</h3>
          <p style="margin:0;color:#78350f;font-size:15px;line-height:2;font-weight:700;">
            القيمة ليست في إنهاء الصفحات بسرعة، بل في بناء عين مهنية ترى النظام خلف المشكلة، والمعنى خلف السلوك.
          </p>
        </div>

        <a href="${safeSiteUrl}"
           style="display:inline-block;margin-top:20px;padding:14px 22px;background:#312e81;color:#ffffff;text-decoration:none;border-radius:16px;font-weight:700;">
          متابعة الرحلة الآن
        </a>
      </div>

      <div style="text-align:center;color:#64748b;font-size:12px;line-height:1.8;margin-top:18px;">
        هذه رسالة ترحيبية مرتبطة بإنشاء حسابك في منصة إتقان التطوير التنظيمي.
        <br />
        إن لم تكن أنت من أنشأ الحساب، يمكنك تجاهل هذه الرسالة.
      </div>
    </div>
  </div>
  `.trim();

  return {
    subject,
    text,
    html
  };
}

async function updateWelcomeStatus({
  supabaseUrl,
  supabaseAnonKey,
  accessToken,
  userId,
  patch
}) {
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
    const details = await response.text().catch(() => "");

    return {
      ok: false,
      status: response.status,
      details
    };
  }

  return {
    ok: true
  };
}

async function fetchUserProfileForWelcome({
  supabaseUrl,
  supabaseAnonKey,
  accessToken,
  userId
}) {
  const select = [
    "full_name",
    "certificate_name",
    "welcome_email_sent_at",
    "welcome_email_status"
  ].join(",");

  const response = await fetch(
    `${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(userId)}&select=${encodeURIComponent(select)}`,
    {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    }
  );

  const data = await safeJson(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data?.message || data?.error || "Failed to read user profile"
    };
  }

  return {
    ok: true,
    profile: Array.isArray(data) ? data[0] : null
  };
}

async function handleWelcomeEmailRequest(request, env) {
  if (request.method === "OPTIONS") {
    return emptyResponse(204, request, env);
  }

  if (request.method === "GET") {
    return jsonResponse(
      {
        ok: true,
        service: "odacademy-welcome-email",
        message: "خدمة إيميل الترحيب متصلة. أرسل POST بعد تسجيل الدخول."
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
        error: `طريقة الطلب ${request.method} غير مدعومة. استخدم POST.`
      },
      405,
      request,
      env
    );
  }

  const emailRateLimit = await checkRateLimit({
    request,
    env,
    routeName: "welcome-email",
    limitPerMinute: Number(getEnvValue(env, "EMAIL_RATE_LIMIT_PER_MINUTE")) || 3,
    windowSeconds: 60
  });

  if (!emailRateLimit.allowed) {
    return rateLimitResponse(request, env, emailRateLimit.retryAfter);
  }

  const authHeader = request.headers.get("Authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ ok: false, error: "Missing authorization token" }, 401, request, env);
  }

  const accessToken = authHeader.replace("Bearer ", "").trim();

  if (!accessToken) {
    return jsonResponse({ ok: false, error: "Empty authorization token" }, 401, request, env);
  }

  const supabaseUrl = getEnvValue(env, "SUPABASE_URL", "VITE_SUPABASE_URL");
  const supabaseAnonKey = getEnvValue(env, "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");
  const brevoApiKey = getEnvValue(env, "BREVO_API_KEY");
  const senderEmail = getEnvValue(env, "BREVO_SENDER_EMAIL");
  const senderName = getEnvValue(env, "BREVO_SENDER_NAME") || "OD Academy";
  const siteUrl =
    getEnvValue(env, "SITE_URL", "PUBLIC_SITE_URL") ||
    "https://odacademy.rayansalajlan.workers.dev";

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({ ok: false, error: "Missing Supabase environment variables" }, 500, request, env);
  }

  if (!brevoApiKey || !senderEmail) {
    return jsonResponse({ ok: false, error: "Missing Brevo environment variables" }, 500, request, env);
  }

  const userResult = await getSupabaseUser({
    supabaseUrl,
    supabaseAnonKey,
    accessToken
  });

  if (!userResult.ok) {
    return jsonResponse(
      {
        ok: false,
        error: userResult.error || "Invalid Supabase session"
      },
      userResult.status || 401,
      request,
      env
    );
  }

  const user = userResult.user;

  if (!user?.id || !user?.email) {
    return jsonResponse({ ok: false, error: "User data is incomplete" }, 400, request, env);
  }

  const profileResult = await fetchUserProfileForWelcome({
    supabaseUrl,
    supabaseAnonKey,
    accessToken,
    userId: user.id
  });

  const profile = profileResult.ok ? profileResult.profile : null;

  if (profile?.welcome_email_sent_at) {
    return jsonResponse(
      {
        ok: true,
        skipped: true,
        reason: "welcome_email_already_sent"
      },
      200,
      request,
      env
    );
  }

  await updateWelcomeStatus({
    supabaseUrl,
    supabaseAnonKey,
    accessToken,
    userId: user.id,
    patch: {
      welcome_email_status: "sending",
      welcome_email_last_attempt_at: new Date().toISOString()
    }
  });

  const displayName =
    profile?.certificate_name ||
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    "متدربنا العزيز";

  const emailContent = buildWelcomeEmail({
    displayName,
    siteUrl,
    platformName: senderName || "OD Academy"
  });

  const emailResult = await sendEmailWithBrevo({
    apiKey: brevoApiKey,
    senderName,
    senderEmail,
    toEmail: user.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text
  });

  if (!emailResult.ok) {
    await updateWelcomeStatus({
      supabaseUrl,
      supabaseAnonKey,
      accessToken,
      userId: user.id,
      patch: {
        welcome_email_status: "failed",
        welcome_email_error: JSON.stringify(emailResult.details || {}).slice(0, 700),
        welcome_email_last_attempt_at: new Date().toISOString()
      }
    });

    return jsonResponse(
      {
        ok: false,
        error: "Brevo email provider failed",
        details: emailResult.details
      },
      502,
      request,
      env
    );
  }

  await updateWelcomeStatus({
    supabaseUrl,
    supabaseAnonKey,
    accessToken,
    userId: user.id,
    patch: {
      welcome_email_sent_at: new Date().toISOString(),
      welcome_email_status: "sent",
      welcome_email_error: null,
      welcome_email_last_attempt_at: new Date().toISOString()
    }
  });

  return jsonResponse(
    {
      ok: true,
      provider: "brevo",
      sent: true
    },
    200,
    request,
    env
  );
}


export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

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

    // أي مسار غير API يذهب إلى ملفات الموقع.
    return env.ASSETS.fetch(request);
  }
};