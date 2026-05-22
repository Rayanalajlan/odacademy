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

const WORKERS_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(),
      ...extraHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function emptyResponse(status = 204) {
  return new Response(null, {
    status,
    headers: corsHeaders()
  });
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



function normalizeAiText(result) {
  return (
    result?.response ||
    result?.result?.response ||
    result?.text ||
    result?.answer ||
    ""
  ).trim();
}

function isQuotaError(error) {
  const message = String(error?.message || error || "").toLowerCase();

  return (
    message.includes("quota") ||
    message.includes("limit") ||
    message.includes("neurons") ||
    message.includes("allocation") ||
    message.includes("account limited") ||
    message.includes("429") ||
    message.includes("3036")
  );
}

function getNextResetAtUtc() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      5,
      0
    )
  ).toISOString();
}

function getFriendlyQuotaMessage() {
  return "يا زميل المهنة، واضح أن المختبر عليه ضغط اليوم والموجه أخذ نصيبه من الأسئلة. أعطني فرصة لين تتجدد الحصة، وارجع لي بعدها نكمّل التشخيص بهدوء.";
}

function safeHistory(value) {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-8)
    .filter((item) => item && item.content && item.role)
    .map((item) => ({
      role: item.role === "user" ? "user" : "assistant",
      content: String(item.content).slice(0, 1200)
    }));
}

async function runWorkersAi({ env, message, lens, history }) {
  const lensText = lens ? `عدسة التفكير المختارة: ${lens}\n\n` : "";

  return env.AI.run(WORKERS_AI_MODEL, {
    messages: [
      {
        role: "system",
        content: AI_SYSTEM_INSTRUCTION
      },
      ...safeHistory(history),
      {
        role: "user",
        content: `${lensText}الحالة أو السؤال:\n${message}`
      }
    ],
    max_tokens: 1100,
    temperature: 0.55
  });
}

async function handleMentorRequest(request, env) {
  if (request.method === "OPTIONS") {
    return emptyResponse();
  }

  if (request.method === "GET") {
    return jsonResponse({
      ok: true,
      service: "odacademy-ai-mentor",
      provider: "Cloudflare Workers AI",
      model: WORKERS_AI_MODEL,
      aiBinding: Boolean(env?.AI),
      expectedMethod: "POST"
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: `طريقة الطلب ${request.method} غير مدعومة. استخدم POST.`
      },
      405
    );
  }

  if (!env?.AI) {
    return jsonResponse(
      {
        ok: false,
        error:
          "Workers AI غير مفعّل. أضف Binding باسم AI من إعدادات Cloudflare ثم أعد النشر."
      },
      500
    );
  }

  const body = await request.json().catch(() => ({}));
  const message = cleanUserMessage(body?.message);
  const lens = String(body?.lens || "").trim().slice(0, 80);
  const history = body?.history;

  if (!message) {
    return jsonResponse(
      {
        ok: false,
        error: "اكتب رسالة أولًا حتى يستطيع الموجه الذكي الرد عليك."
      },
      400
    );
  }

  try {
    const result = await runWorkersAi({
      env,
      message,
      lens,
      history
    });

    const answer = normalizeAiText(result);

    if (!answer) {
      return jsonResponse(
        {
          ok: false,
          error:
            "وصل رد فارغ من الموجه الذكي. أعد صياغة السؤال بتفاصيل أكثر وحاول مرة أخرى."
        },
        502
      );
    }

    return jsonResponse({
      ok: true,
      provider: "cloudflare-workers-ai",
      model: WORKERS_AI_MODEL,
      answer,
      text: answer
    });
  } catch (error) {
    if (isQuotaError(error)) {
      const resetAt = getNextResetAtUtc();
      const retryAfterSeconds = Math.max(
        60,
        Math.floor((new Date(resetAt).getTime() - Date.now()) / 1000)
      );

      return jsonResponse(
        {
          ok: false,
          code: "AI_QUOTA_EXCEEDED",
          message: getFriendlyQuotaMessage(),
          resetAt,
          retryAfterSeconds
        },
        429,
        {
          "Retry-After": String(retryAfterSeconds)
        }
      );
    }

    return jsonResponse(
      {
        ok: false,
        error: error?.message || "حدث خطأ غير متوقع في خادم الموجه الذكي."
      },
      500
    );
  }
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
    return emptyResponse();
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
      405
    );
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (pathname === "/api/mentor") {
      return handleMentorRequest(request, env);
    }

    if (pathname === "/api/login-notice") {
      return handleLoginNoticeRequest(request, env);
    }

    // أي مسار غير API يذهب إلى ملفات الموقع.
    return env.ASSETS.fetch(request);
  }
};