import { useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const MODES = {
  login: {
    eyebrow: "بوابة الدخول",
    title: "مرحبًا بك في منصة إتقان التطوير التنظيمي",
    subtitle:
      "هذه ليست صفحة دخول عادية؛ هذه بوابة عودة إلى رحلتك في التشخيص، تصميم المنظمة، قيادة التغيير، الثقافة، قياس الأثر، وبناء الاحتراف.",
    button: "دخول إلى رحلتي",
    switchText: "ليس لديك حساب؟",
    switchAction: "إنشاء حساب جديد"
  },
  signup: {
    eyebrow: "بداية الرحلة",
    title: "أنشئ حسابك وابدأ مسارك المهني",
    subtitle:
      "سجّل بياناتك لتبدأ رحلة منظمة من ستة أشهر، مصممة لتبني عقلية ممارس تطوير تنظيمي محترف.",
    button: "إنشاء الحساب",
    switchText: "لديك حساب بالفعل؟",
    switchAction: "تسجيل الدخول"
  },
  reset: {
    eyebrow: "استعادة الوصول",
    title: "استعد دخولك بهدوء",
    subtitle:
      "اكتب بريدك المهني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور إن كان الحساب مسجلًا.",
    button: "إرسال رابط الاستعادة",
    switchText: "تذكرت كلمة المرور؟",
    switchAction: "العودة للدخول"
  }
};

function getFriendlyError(errorMessage = "") {
  const text = String(errorMessage).toLowerCase();

  if (text.includes("invalid login credentials")) {
    return "بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.";
  }

  if (text.includes("email not confirmed")) {
    return "يبدو أن البريد لم يتم تأكيده بعد. راجع بريدك الإلكتروني.";
  }

  if (text.includes("password")) {
    return "تحقق من كلمة المرور. يجب أن تكون صحيحة ومكتوبة بدون مسافات زائدة.";
  }

  if (text.includes("rate limit")) {
    return "تمت محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.";
  }

  return "تعذر تنفيذ العملية الآن. تحقق من البيانات أو حاول لاحقًا.";
}

async function sendLoginNotice(session) {
  if (!session?.access_token) return;

  try {
    await fetch("/api/login-notice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        source: "odacademy-login",
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    });
  } catch {
    // لا نوقف دخول المستخدم لو فشل إرسال التنبيه.
  }
}

export default function AuthGate({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const meta = MODES[mode];

  const greetingLine = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "صباح الإنجاز، ريان.";
    if (hour < 18) return "مساء التركيز، ريان.";
    return "مرحبًا بعودتك إلى مساحة الإتقان.";
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        throw new Error("اكتب البريد الإلكتروني أولًا.");
      }

      if (mode !== "reset" && !password) {
        throw new Error("اكتب كلمة المرور أولًا.");
      }

      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error) throw error;

        await sendLoginNotice(data?.session);

        setMessage({
          type: "success",
          text: "تم تسجيل الدخول بنجاح. لحظة واحدة وننقلك إلى رحلتك التعليمية."
        });

        if (typeof onAuthenticated === "function") {
          onAuthenticated(data?.session);
        } else {
          setTimeout(() => window.location.reload(), 650);
        }
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });

        if (error) throw error;

        setMessage({
          type: "success",
          text:
            data?.session
              ? "تم إنشاء الحساب وتسجيل الدخول بنجاح."
              : "تم إنشاء الحساب. راجع بريدك لتأكيد الحساب ثم سجّل الدخول."
        });

        if (data?.session) {
          await sendLoginNotice(data.session);

          if (typeof onAuthenticated === "function") {
            onAuthenticated(data.session);
          } else {
            setTimeout(() => window.location.reload(), 650);
          }
        }
      }

      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin
        });

        if (error) throw error;

        setMessage({
          type: "success",
          text: "تم إرسال رابط استعادة كلمة المرور إلى بريدك إن كان الحساب موجودًا."
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.message?.startsWith("اكتب")
          ? error.message
          : getFriendlyError(error?.message)
      });
    } finally {
      setBusy(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage(null);
    setPassword("");
  }

  return (
    <main className="auth-cosmos" dir="rtl">
      <style>{`
        .auth-cosmos {
          --ink: #0f172a;
          --muted: #64748b;
          --line: rgba(148, 163, 184, .22);
          --primary: #4f46e5;
          --violet: #7c3aed;
          --gold: #f59e0b;
          --green: #10b981;
          --red: #ef4444;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: grid;
          place-items: center;
          padding: 28px 16px;
          color: var(--ink);
          background:
            radial-gradient(circle at 10% 12%, rgba(79,70,229,.22), transparent 32%),
            radial-gradient(circle at 92% 18%, rgba(245,158,11,.18), transparent 30%),
            radial-gradient(circle at 48% 92%, rgba(16,185,129,.16), transparent 34%),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 48%, #f8fafc 100%);
        }

        .auth-cosmos::before,
        .auth-cosmos::after {
          content: "";
          position: absolute;
          width: 560px;
          height: 560px;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(10px);
          opacity: .56;
          background: conic-gradient(
            from 120deg,
            rgba(79,70,229,.18),
            rgba(245,158,11,.12),
            rgba(16,185,129,.13),
            rgba(124,58,237,.16),
            rgba(79,70,229,.18)
          );
          animation: authFloat 12s ease-in-out infinite alternate;
        }

        .auth-cosmos::before {
          top: -350px;
          right: -230px;
        }

        .auth-cosmos::after {
          bottom: -370px;
          left: -250px;
          animation-delay: -5s;
        }

        @keyframes authFloat {
          from { transform: translate3d(0,0,0) rotate(0deg); }
          to { transform: translate3d(24px,34px,0) rotate(22deg); }
        }

        .auth-shell {
          width: min(1120px, 100%);
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.08fr .92fr;
          gap: 18px;
          align-items: stretch;
        }

        .auth-hero,
        .auth-card {
          border-radius: 38px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.82);
          box-shadow: 0 28px 90px rgba(15,23,42,.14);
          backdrop-filter: blur(22px);
        }

        .auth-hero {
          min-height: 650px;
          position: relative;
          color: white;
          padding: 34px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background:
            radial-gradient(circle at top right, rgba(245,158,11,.22), transparent 34%),
            radial-gradient(circle at bottom left, rgba(79,70,229,.35), transparent 36%),
            linear-gradient(150deg, #0f172a 0%, #1e293b 55%, #111827 100%);
        }

        .auth-hero::before {
          content: "";
          position: absolute;
          inset: -40%;
          background-image:
            linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
          background-size: 42px 42px;
          transform: rotate(-8deg);
          opacity: .42;
        }

        .auth-hero > * {
          position: relative;
          z-index: 1;
        }

        .auth-logo-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .auth-logo {
          width: 54px;
          height: 54px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          font-weight: 950;
          font-size: 18px;
          color: #111827;
          background: linear-gradient(135deg, #fde68a, #f59e0b);
          box-shadow: 0 18px 40px rgba(245,158,11,.26);
        }

        .auth-brand strong {
          display: block;
          font-size: 16px;
          font-weight: 950;
        }

        .auth-brand span {
          display: block;
          margin-top: 3px;
          color: rgba(226,232,240,.78);
          font-size: 12px;
          font-weight: 800;
        }

        .auth-badge {
          border-radius: 999px;
          padding: 8px 12px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.14);
          color: #fde68a;
          font-size: 11px;
          font-weight: 950;
          white-space: nowrap;
        }

        .auth-welcome {
          padding: 30px 0;
        }

        .auth-welcome small {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 14px;
          margin-bottom: 18px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.14);
          color: #c7d2fe;
          font-weight: 950;
        }

        .auth-welcome h1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 66px);
          line-height: 1.05;
          letter-spacing: -1.4px;
          font-weight: 950;
        }

        .auth-welcome h1 span {
          display: block;
          color: transparent;
          background: linear-gradient(90deg, #fff, #c7d2fe, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .auth-welcome p {
          margin: 18px 0 0;
          max-width: 720px;
          color: rgba(226,232,240,.86);
          font-size: 15px;
          line-height: 2;
          font-weight: 750;
        }

        .auth-principles {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .auth-principle {
          min-height: 116px;
          padding: 16px;
          border-radius: 24px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.12);
        }

        .auth-principle b {
          display: block;
          color: #fde68a;
          font-size: 20px;
          margin-bottom: 8px;
        }

        .auth-principle strong {
          display: block;
          font-size: 13px;
          font-weight: 950;
          line-height: 1.6;
        }

        .auth-principle span {
          display: block;
          margin-top: 6px;
          color: rgba(226,232,240,.74);
          font-size: 11px;
          line-height: 1.7;
          font-weight: 750;
        }

        .auth-card {
          background: rgba(255,255,255,.84);
          padding: 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .auth-card-top {
          margin-bottom: 22px;
        }

        .auth-card-top small {
          display: inline-flex;
          color: var(--primary);
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 10px;
        }

        .auth-card-top h2 {
          margin: 0;
          color: var(--ink);
          font-size: clamp(26px, 3vw, 38px);
          line-height: 1.25;
          font-weight: 950;
          letter-spacing: -.7px;
        }

        .auth-card-top p {
          margin: 12px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.95;
          font-weight: 750;
        }

        .auth-form {
          display: grid;
          gap: 14px;
        }

        .auth-field {
          display: grid;
          gap: 8px;
        }

        .auth-field label {
          color: #334155;
          font-size: 12px;
          font-weight: 950;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(148,163,184,.26);
          outline: 0;
          border-radius: 20px;
          padding: 15px 16px;
          background: rgba(255,255,255,.88);
          color: var(--ink);
          font-family: inherit;
          font-size: 14px;
          font-weight: 800;
          transition: .22s ease;
        }

        .auth-input:focus {
          border-color: rgba(79,70,229,.55);
          box-shadow: 0 0 0 4px rgba(79,70,229,.10);
          background: white;
        }

        .auth-show {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          cursor: pointer;
          border-radius: 14px;
          padding: 8px 10px;
          background: #eef2ff;
          color: #3730a3;
          font-family: inherit;
          font-size: 11px;
          font-weight: 950;
        }

        .auth-help-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: -4px;
        }

        .auth-link {
          border: 0;
          padding: 0;
          background: transparent;
          color: var(--primary);
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
        }

        .auth-hint {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
        }

        .auth-submit {
          width: 100%;
          border: 0;
          cursor: pointer;
          font-family: inherit;
          border-radius: 22px;
          padding: 16px 18px;
          color: white;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 18px 42px rgba(79,70,229,.24);
          font-size: 14px;
          font-weight: 950;
          transition: .24s ease;
        }

        .auth-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 48px rgba(79,70,229,.30);
        }

        .auth-submit:disabled {
          opacity: .62;
          cursor: not-allowed;
          transform: none;
        }

        .auth-message {
          border-radius: 20px;
          padding: 13px 15px;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 900;
        }

        .auth-message.success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid rgba(16,185,129,.22);
        }

        .auth-message.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid rgba(239,68,68,.22);
        }

        .auth-switch {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid rgba(148,163,184,.18);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          color: var(--muted);
          font-size: 12px;
          font-weight: 850;
        }

        .auth-security-note {
          margin-top: 18px;
          border-radius: 22px;
          padding: 14px 16px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.18);
          color: #475569;
          font-size: 12px;
          line-height: 1.85;
          font-weight: 800;
        }

        .auth-security-note b {
          color: #0f172a;
        }

        @media (max-width: 980px) {
          .auth-shell {
            grid-template-columns: 1fr;
          }

          .auth-hero {
            min-height: auto;
          }
        }

        @media (max-width: 640px) {
          .auth-cosmos {
            padding: 16px 10px;
          }

          .auth-hero,
          .auth-card {
            border-radius: 28px;
            padding: 22px;
          }

          .auth-principles {
            grid-template-columns: 1fr;
          }

          .auth-badge {
            display: none;
          }
        }
      `}</style>

      <section className="auth-shell">
        <aside className="auth-hero">
          <div className="auth-logo-row">
            <div className="auth-brand">
              <div className="auth-logo">OD</div>
              <div>
                <strong>OD Engineering Academy</strong>
                <span>منصة إتقان التطوير التنظيمي</span>
              </div>
            </div>

            <span className="auth-badge">رحلة معرفية مغلقة بالتقدم</span>
          </div>

          <div className="auth-welcome">
            <small>{greetingLine}</small>

            <h1>
              ادخل إلى مساحة
              <span>الفهم قبل الحل</span>
            </h1>

            <p>
              هنا لا تدخل لتقرأ محتوى متراكمًا، بل لتتقدم عبر مسار مصمم بعقلية
              استشارية: تشخيص، تصميم، تغيير، ثقافة، قياس، واستدامة.
            </p>
          </div>

          <div className="auth-principles">
            <div className="auth-principle">
              <b>01</b>
              <strong>لا تقفز للحل</strong>
              <span>كل رحلة تبدأ بسؤال: ما الذي ينتج هذا السلوك داخل النظام؟</span>
            </div>

            <div className="auth-principle">
              <b>02</b>
              <strong>اجعل التقدم مرئيًا</strong>
              <span>إنجازك محفوظ، ووثيقة الإتقان لا تفتح إلا بعد إكمال الرحلة.</span>
            </div>

            <div className="auth-principle">
              <b>03</b>
              <strong>حوّل المعرفة إلى ممارسة</strong>
              <span>كل درس مصمم ليقودك إلى حكم مهني لا إلى حفظ نظري فقط.</span>
            </div>
          </div>
        </aside>

        <section className="auth-card">
          <div className="auth-card-top">
            <small>{meta.eyebrow}</small>
            <h2>{meta.title}</h2>
            <p>{meta.subtitle}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor="fullName">الاسم</label>
                <input
                  id="fullName"
                  className="auth-input"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="اكتب اسمك كما تريد ظهوره داخل المنصة"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="email">البريد الإلكتروني</label>
              <input
                id="email"
                className="auth-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                required
              />
            </div>

            {mode !== "reset" && (
              <div className="auth-field">
                <label htmlFor="password">كلمة المرور</label>
                <div className="auth-input-wrap">
                  <input
                    id="password"
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="اكتب كلمة المرور"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                  />

                  <button
                    type="button"
                    className="auth-show"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? "إخفاء" : "إظهار"}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className="auth-help-row">
                <span className="auth-hint">سيتم إرسال تنبيه ترحيبي بعد الدخول الناجح.</span>

                <button
                  type="button"
                  className="auth-link"
                  onClick={() => switchMode("reset")}
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            {message && (
              <div className={`auth-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? "جارٍ التنفيذ..." : meta.button}
            </button>
          </form>

          <div className="auth-switch">
            <span>{meta.switchText}</span>

            <button
              type="button"
              className="auth-link"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            >
              {meta.switchAction}
            </button>
          </div>

          <div className="auth-security-note">
            <b>تنبيه أمان:</b> لا تشارك كلمة المرور مع أي شخص. عند كل دخول ناجح ستصلك رسالة
            تنبيه حتى تعرف أن حسابك استُخدم للوصول إلى المنصة.
          </div>
        </section>
      </section>
    </main>
  );
}