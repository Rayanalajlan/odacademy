export async function onRequestPost({ request, env }) {
  const json = (payload, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });

  try {
    const authHeader = request.headers.get("Authorization") || "";

    if (!authHeader.startsWith("Bearer ")) {
      return json({ ok: false, error: "Missing authorization token" }, 401);
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();

    const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return json(
        {
          ok: false,
          error: "Missing Supabase environment variables"
        },
        500
      );
    }

    if (!env.RESEND_API_KEY) {
      return json(
        {
          ok: false,
          error: "Missing RESEND_API_KEY"
        },
        500
      );
    }

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseAnonKey
      }
    });

    if (!userResponse.ok) {
      return json({ ok: false, error: "Invalid Supabase session" }, 401);
    }

    const user = await userResponse.json();

    if (!user?.email) {
      return json({ ok: false, error: "User email not found" }, 400);
    }

    const body = await request.json().catch(() => ({}));

    const country = request.headers.get("CF-IPCountry") || "غير متاح";
    const city = request.cf?.city || "غير متاح";
    const timezone = body.timezone || "Asia/Riyadh";
    const browserLanguage = body.language || "غير متاح";

    const loginTime = new Intl.DateTimeFormat("ar-SA", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Riyadh"
    }).format(new Date());

    const fromEmail =
      env.LOGIN_NOTICE_FROM || "OD Academy <onboarding@resend.dev>";

    const subject = "تم تسجيل دخولك إلى منصة إتقان التطوير التنظيمي";

    const text = `
مرحبًا بك في منصة إتقان التطوير التنظيمي.

تم تسجيل دخول ناجح إلى حسابك.

وقت الدخول: ${loginTime}
الدولة: ${country}
المدينة التقريبية: ${city}
لغة المتصفح: ${browserLanguage}
المنطقة الزمنية للجهاز: ${timezone}

إن كان هذا الدخول منك، فلا يلزم اتخاذ أي إجراء.
إن لم يكن منك، غيّر كلمة المرور فورًا وراجع أمان بريدك الإلكتروني.

رسالة تحفيزية:
عدت اليوم إلى مساحة لا تبدأ بالحل، بل تفهم النظام أولًا. خطوة صغيرة في الرحلة قد تصنع فرقًا كبيرًا في حكمك المهني.
`;

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
                <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">وقت الدخول</td>
                <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${loginTime}</td>
              </tr>
              <tr>
                <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">الدولة</td>
                <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${country}</td>
              </tr>
              <tr>
                <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">المدينة التقريبية</td>
                <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${city}</td>
              </tr>
              <tr>
                <td style="padding:10px;border-bottom:1px solid #f1f5f9;color:#64748b;">لغة المتصفح</td>
                <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-weight:700;">${browserLanguage}</td>
              </tr>
              <tr>
                <td style="padding:10px;color:#64748b;">المنطقة الزمنية للجهاز</td>
                <td style="padding:10px;font-weight:700;">${timezone}</td>
              </tr>
            </table>
          </div>

          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:24px;padding:22px;margin-top:16px;">
            <h2 style="margin:0 0 10px;font-size:18px;color:#78350f;">رسالة الرحلة</h2>
            <p style="margin:0;color:#78350f;font-size:15px;line-height:2;font-weight:700;">
              عدت اليوم إلى مساحة لا تبدأ بالحل، بل تفهم النظام أولًا. تقدّمك محفوظ،
              وعودتك تعني أن بوابة جديدة من الإتقان تنتظرك.
            </p>
          </div>

          <p style="text-align:center;color:#94a3b8;font-size:12px;line-height:1.8;margin:18px 0 0;">
            وصلت هذه الرسالة لأن حسابك سجّل دخولًا ناجحًا في منصة إتقان التطوير التنظيمي.
          </p>
        </div>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject,
        html,
        text
      })
    });

    const emailResult = await emailResponse.json().catch(() => ({}));

    if (!emailResponse.ok) {
      return json(
        {
          ok: false,
          error: "Email provider failed",
          details: emailResult
        },
        500
      );
    }

    return json({
      ok: true,
      sent: true
    });
  } catch (error) {
    return json(
      {
        ok: false,
        error: error?.message || "Unexpected error"
      },
      500
    );
  }
}