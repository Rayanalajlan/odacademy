// functions/api/login-notice.js
// هذه الدالة تعمل على Cloudflare Pages Functions.
// المسار المتوقع لها هو:
// /api/login-notice
//
// الهدف:
// إرسال رسالة تنبيه للمستخدم بعد تسجيل الدخول الناجح.
// مهم: لا نضع RESEND_API_KEY داخل React أو داخل ملفات الواجهة.

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
      error: data?.msg || data?.error_description || data?.error || "Invalid Supabase session"
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

رسالة تحفيزية:
عودتك اليوم ليست دخولًا عابرًا؛ هي رجوع إلى مساحة تفهم النظام قبل أن تقترح الحل. خطوة صغيرة في الرحلة قد تصنع فرقًا كبيرًا في حكمك المهني.
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
            أهلًا بك. تم رصد دخول ناجح إلى حسابك. إن كان هذا الدخول منك، أكمل رحلتك بهدوء.
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
              <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">المنطقة الزمنية للجهاز</td>
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
            تقدّمك محفوظ، والمرحلة التالية تنتظرك بهدوء.
          </p>
        </div>

        <p style="text-align:center;color:#94a3b8;font-size:12px;line-height:1.8;margin:18px 0 0;">
          وصلت هذه الرسالة لأن حسابك سجّل دخولًا ناجحًا في منصة إتقان التطوير التنظيمي.
        </p>
      </div>
    </div>
  `.trim();

  return {
    subject,
    text,
    html
  };
}

async function sendEmailWithResend({ apiKey, fromEmail, toEmail, subject, html, text }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
      text
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
    provider: "resend",
    result
  };
}

async function sendEmailWithBrevo({
  apiKey,
  senderEmail,
  senderName,
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

  const result = await safeJson(response);

  if (!response.ok) {
    return {
      ok: false,
      provider: "brevo",
      status: response.status,
      details: result
    };
  }

  return {
    ok: true,
    provider: "brevo",
    result
  };
}

// مهم لطلبات المتصفح الاستباقية Preflight.
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function onRequestGet({ env }) {
  const supabaseUrl = getEnvValue(env, "SUPABASE_URL", "VITE_SUPABASE_URL");
  const supabaseAnonKey = getEnvValue(
    env,
    "SUPABASE_ANON_KEY",
    "VITE_SUPABASE_ANON_KEY"
  );
  const resendApiKey = getEnvValue(env, "RESEND_API_KEY");
  const brevoApiKey = getEnvValue(env, "BREVO_API_KEY");
  const brevoSenderEmail = getEnvValue(env, "BREVO_SENDER_EMAIL");
  const missing = [];

  if (!supabaseUrl) missing.push("SUPABASE_URL أو VITE_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("SUPABASE_ANON_KEY أو VITE_SUPABASE_ANON_KEY");
  if (!resendApiKey && !brevoApiKey) missing.push("RESEND_API_KEY أو BREVO_API_KEY");
  if (brevoApiKey && !brevoSenderEmail) missing.push("BREVO_SENDER_EMAIL");

  return jsonResponse(
    {
      ok: missing.length === 0,
      service: "odacademy-login-notice",
      envReady: missing.length === 0,
      provider: brevoApiKey ? "brevo" : resendApiKey ? "resend" : "none",
      missing
    },
    missing.length === 0 ? 200 : 500
  );
}

export async function onRequestPost({ request, env }) {
  try {
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
    const resendApiKey = getEnvValue(env, "RESEND_API_KEY");
    const brevoApiKey = getEnvValue(env, "BREVO_API_KEY");
    const brevoSenderEmail = getEnvValue(env, "BREVO_SENDER_EMAIL");
    const brevoSenderName = getEnvValue(env, "BREVO_SENDER_NAME") || "OD Academy";

    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse(
        {
          ok: false,
          error: "Missing Supabase environment variables"
        },
        500
      );
    }

    if (!resendApiKey && !brevoApiKey) {
      return jsonResponse(
        {
          ok: false,
          error: "Missing RESEND_API_KEY or BREVO_API_KEY"
        },
        500
      );
    }

    if (brevoApiKey && !brevoSenderEmail) {
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
    const browserLanguage = body?.language || request.headers.get("Accept-Language") || "غير متاح";
    const userAgent = body?.userAgent || request.headers.get("User-Agent") || "غير متاح";

    const loginTime = new Intl.DateTimeFormat("ar-SA", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Riyadh"
    }).format(new Date());

    // الأفضل لاحقًا تضع بريدًا من دومين موثق في Resend.
    // مثال:
    // LOGIN_NOTICE_FROM = OD Academy <no-reply@yourdomain.com>
    const fromEmail =
      getEnvValue(env, "LOGIN_NOTICE_FROM") ||
      "OD Academy <onboarding@resend.dev>";

    const emailContent = buildLoginEmail({
      email: user.email,
      loginTime,
      country,
      city,
      timezone,
      browserLanguage,
      userAgent
    });

    const emailResult = brevoApiKey
      ? await sendEmailWithBrevo({
          apiKey: brevoApiKey,
          senderEmail: brevoSenderEmail,
          senderName: brevoSenderName,
          toEmail: user.email,
          toName: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        })
      : await sendEmailWithResend({
          apiKey: resendApiKey,
          fromEmail,
          toEmail: user.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });

    if (!emailResult.ok) {
      return jsonResponse(
        {
          ok: false,
          error: "Email provider failed",
          details: emailResult.details
        },
        502
      );
    }

    return jsonResponse({
      ok: true,
      sent: true,
      provider: emailResult.provider
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error?.message || "Unexpected error"
      },
      500
    );
  }
}
