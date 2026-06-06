const DEFAULT_SITE_URL = "https://munsaqah.rayansalajlan.workers.dev";
const DEFAULT_ALLOWED_ORIGINS = [
  "https://munsaqah.rayansalajlan.workers.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

function splitEnvList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getEnvValue(env, ...names) {
  for (const name of names) {
    const value = env?.[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getAllowedOrigins(env) {
  const configured = getEnvValue(env, "ALLOWED_ORIGINS", "CORS_ALLOWED_ORIGINS");
  return configured ? splitEnvList(configured) : DEFAULT_ALLOWED_ORIGINS;
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
  if (!origin) return true;
  return getAllowedOrigins(env).includes(origin);
}

function getCorsOrigin(request, env) {
  const origin = getRequestOrigin(request);
  const allowed = getAllowedOrigins(env);

  if (origin && allowed.includes(origin)) return origin;

  const sameOrigin = getRequestSameOrigin(request);
  if (allowed.includes(sameOrigin)) return sameOrigin;

  return allowed[0] || sameOrigin;
}

function corsHeaders(request, env) {
  return {
    "Access-Control-Allow-Origin": getCorsOrigin(request, env),
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "X-Content-Type-Options": "nosniff"
  };
}

function jsonResponse(payload, status = 200, request, env) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(request, env),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

async function safeJson(responseOrRequest) {
  try {
    return await responseOrRequest.json();
  } catch {
    return {};
  }
}

function getAuthToken(request) {
  const authHeader = request.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.replace("Bearer ", "").trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getEmailConfig(env) {
  return {
    supabaseUrl: getEnvValue(env, "SUPABASE_URL", "VITE_SUPABASE_URL"),
    supabaseAnonKey: getEnvValue(env, "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"),
    brevoApiKey: getEnvValue(env, "BREVO_API_KEY"),
    resendApiKey: getEnvValue(env, "RESEND_API_KEY"),
    senderEmail: getEnvValue(env, "BREVO_SENDER_EMAIL"),
    senderName: getEnvValue(env, "BREVO_SENDER_NAME") || "OD Academy",
    resendFrom: getEnvValue(env, "WELCOME_EMAIL_FROM", "LOGIN_NOTICE_FROM"),
    siteUrl: getEnvValue(env, "SITE_URL", "PUBLIC_SITE_URL", "VITE_SITE_URL") || DEFAULT_SITE_URL
  };
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

  return { ok: true, user: data };
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
  if (!response.ok) return { ok: false, status: response.status, profile: null };

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

  return { ok: response.ok, status: response.status };
}

function getDisplayName(user, profile = {}) {
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

function buildWelcomeEmail({ displayName, siteUrl, platformName = "OD Academy" }) {
  const safeName = escapeHtml(displayName || "متدربنا العزيز");
  const safeUrl = escapeHtml(siteUrl || DEFAULT_SITE_URL);
  const safePlatformName = escapeHtml(platformName || "OD Academy");

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
${siteUrl || DEFAULT_SITE_URL}
  `.trim();

  const html = `
    <div dir="rtl" style="margin:0;padding:0;background:#f7f3fc;font-family:Tahoma,Arial,sans-serif;color:#18102e;">
      <div style="max-width:720px;margin:0 auto;padding:30px 16px;">
        <div style="background:linear-gradient(135deg,#160c2a,#3b1d6e);border-radius:30px;padding:30px;color:#ffffff;box-shadow:0 24px 70px rgba(28,17,48,.20);">
          <div style="display:inline-block;background:rgba(255,255,255,.12);color:#e9d5ff;border:1px solid rgba(216,180,254,.28);border-radius:999px;padding:8px 14px;font-size:12px;font-weight:700;">
            ${safePlatformName} | منسقة
          </div>
          <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.55;color:#ffffff;">حياك الله يا ${safeName}</h1>
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

          <a href="${safeUrl}" style="display:inline-block;margin-top:20px;padding:14px 22px;background:#5b21b6;color:#ffffff;text-decoration:none;border-radius:16px;font-weight:700;">
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

async function sendEmailWithBrevo({ apiKey, senderName, senderEmail, toEmail, toName, subject, html, text }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      sender: { name: senderName || "OD Academy", email: senderEmail },
      to: [{ email: toEmail, name: toName || toEmail }],
      subject,
      htmlContent: html,
      textContent: text
    })
  });

  return { ok: response.ok, status: response.status, details: await safeJson(response) };
}

async function sendEmailWithResend({ apiKey, fromEmail, toEmail, subject, html, text }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail || "OD Academy <onboarding@resend.dev>",
      to: [toEmail],
      subject,
      html,
      text
    })
  });

  return { ok: response.ok, status: response.status, details: await safeJson(response) };
}

async function sendEmail(config, payload) {
  if (config.brevoApiKey && config.senderEmail) {
    const result = await sendEmailWithBrevo({
      apiKey: config.brevoApiKey,
      senderName: config.senderName,
      senderEmail: config.senderEmail,
      ...payload
    });

    return { ...result, provider: "brevo" };
  }

  if (config.resendApiKey) {
    const result = await sendEmailWithResend({
      apiKey: config.resendApiKey,
      fromEmail: config.resendFrom,
      toEmail: payload.toEmail,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    });

    return { ...result, provider: "resend" };
  }

  return { ok: false, status: 500, provider: "none", details: { error: "missing_email_provider" } };
}

export async function onRequestOptions({ request, env }) {
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}

export async function onRequestGet({ request, env }) {
  if (!isAllowedRequestOrigin(request, env)) {
    return jsonResponse({ ok: false, error: "Origin is not allowed" }, 403, request, env);
  }

  const config = getEmailConfig(env);
  const missing = [];

  if (!config.supabaseUrl) missing.push("SUPABASE_URL أو VITE_SUPABASE_URL");
  if (!config.supabaseAnonKey) missing.push("SUPABASE_ANON_KEY أو VITE_SUPABASE_ANON_KEY");
  if (!config.brevoApiKey && !config.resendApiKey) missing.push("BREVO_API_KEY أو RESEND_API_KEY");
  if (config.brevoApiKey && !config.senderEmail) missing.push("BREVO_SENDER_EMAIL");

  return jsonResponse(
    {
      ok: missing.length === 0,
      service: "odacademy-welcome-email",
      envReady: missing.length === 0,
      provider: config.brevoApiKey ? "brevo" : config.resendApiKey ? "resend" : "none",
      missing
    },
    missing.length === 0 ? 200 : 500,
    request,
    env
  );
}

export async function onRequestPost({ request, env }) {
  if (!isAllowedRequestOrigin(request, env)) {
    return jsonResponse({ ok: false, error: "Origin is not allowed" }, 403, request, env);
  }

  const accessToken = getAuthToken(request);
  if (!accessToken) {
    return jsonResponse({ ok: false, error: "Missing authorization token" }, 401, request, env);
  }

  const config = getEmailConfig(env);
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return jsonResponse({ ok: false, error: "Missing Supabase environment variables" }, 500, request, env);
  }

  const userResult = await getSupabaseUser({
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    accessToken
  });

  if (!userResult.ok) {
    return jsonResponse({ ok: false, error: userResult.error }, userResult.status || 401, request, env);
  }

  const body = await safeJson(request);
  const force = body?.force === true;
  const user = userResult.user;

  const profileResult = await fetchUserProfile({
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    accessToken,
    userId: user.id
  });
  const profile = profileResult.profile || {};

  if (!force && profile.welcome_email_sent_at) {
    return jsonResponse({ ok: true, skipped: true, reason: "welcome_email_already_sent" }, 200, request, env);
  }

  await updateUserProfile({
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    accessToken,
    userId: user.id,
    patch: {
      welcome_email_status: "sending",
      welcome_email_last_attempt_at: new Date().toISOString()
    }
  });

  const displayName = getDisplayName(user, profile);
  const email = buildWelcomeEmail({
    displayName,
    siteUrl: config.siteUrl,
    platformName: config.senderName
  });

  const emailResult = await sendEmail(config, {
    toEmail: user.email,
    toName: displayName,
    subject: email.subject,
    html: email.html,
    text: email.text
  });

  if (!emailResult.ok) {
    await updateUserProfile({
      supabaseUrl: config.supabaseUrl,
      supabaseAnonKey: config.supabaseAnonKey,
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
        error: "تعذر إرسال إيميل الترحيب.",
        provider: emailResult.provider,
        details: emailResult.details
      },
      emailResult.status || 502,
      request,
      env
    );
  }

  await updateUserProfile({
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    accessToken,
    userId: user.id,
    patch: {
      welcome_email_sent_at: new Date().toISOString(),
      welcome_email_status: "sent",
      welcome_email_error: null,
      welcome_email_last_attempt_at: new Date().toISOString()
    }
  });

  return jsonResponse({ ok: true, sent: true, provider: emailResult.provider }, 200, request, env);
}
