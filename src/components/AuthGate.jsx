import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const MONTHS = [
  {
    number: "01",
    title: "تأسيس العقل التنظيمي",
    output: "قراءة المنظمة كنظام قبل القفز إلى الحلول."
  },
  {
    number: "02",
    title: "تصميم المنظمة والهياكل والأدوار",
    output: "تحويل التشخيص إلى أدوار وصلاحيات ونظام عمل واضح."
  },
  {
    number: "03",
    title: "تصميم التدخلات التنظيمية",
    output: "اختيار تدخل مناسب بدل الاكتفاء بتوصيات عامة."
  },
  {
    number: "04",
    title: "قيادة التغيير والتحول",
    output: "بناء الالتزام وإدارة المقاومة واستدامة التغيير."
  },
  {
    number: "05",
    title: "الثقافة والتعلم وبناء القدرة",
    output: "قراءة السلوك والثقة والتعلم المؤسسي كقدرة مستمرة."
  },
  {
    number: "06",
    title: "قياس الأثر والاحتراف",
    output: "ربط التدخلات بمؤشرات أثر وممارسة مهنية ناضجة."
  }
];

const FAQ = [
  {
    q: "كم مدة الرحلة؟",
    a: "الرحلة مصممة على 180 يومًا، موزعة على 6 أشهر، مع دروس واختبارات ومحاكاة تطبيقية."
  },
  {
    q: "هل المحتوى مجاني؟",
    a: "نعم، الدخول إلى هذه النسخة من الرحلة مجاني. وقد يتم لاحقًا إضافة دفعات أو مسارات خاصة بحسب آلية التسجيل."
  },
  {
    q: "هل توجد شهادة؟",
    a: "تظهر وثيقة الإتقان بعد اكتمال التقدم المطلوب داخل الرحلة، وليست شهادة حضور تلقائية."
  },
  {
    q: "هل يوجد دعم أو متابعة؟",
    a: "توجد أدوات داخلية للتعلم مثل الرادار، المحاكاة، والموجه الذكي عند تفعيله تقنيًا. أي متابعة مباشرة تعتمد على ما يعلنه صاحب المنصة."
  },
  {
    q: "كيف تُحفظ بياناتي؟",
    a: "يتم استخدام بيانات الحساب والتقدم التعليمي لتشغيل التجربة وحفظ الإنجاز. لا ينبغي مشاركة بيانات حساسة داخل الحقول العامة."
  }
];

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function passwordIssue(password) {
  if (!password || password.length < 8) return "كلمة المرور يجب ألا تقل عن 8 أحرف.";
  if (!/[A-Za-z]/.test(password)) return "كلمة المرور يجب أن تحتوي على حرف واحد على الأقل.";
  if (!/[0-9]/.test(password)) return "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل.";
  return "";
}

function getDynamicCounters() {
  const launch = new Date("2026-01-01T00:00:00+03:00").getTime();
  const now = Date.now();
  const days = Math.max(1, Math.floor((now - launch) / 86400000));
  const minute = new Date().getMinutes();

  const total = 186 + days * 2 + (minute % 7);
  const active = 9 + (minute % 9);
  const completed = Math.max(3, Math.floor(total * 0.08));
  const remaining = Math.max(6, 44 - (total % 31));

  return { total, active, completed, remaining };
}

export default function AuthGate({ onEnter, onAuthenticated }) {
  const [mode, setMode] = useState("signin");
  const [fullName, setFullName] = useState(localStorage.getItem("od_demo_name") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [counters, setCounters] = useState(getDynamicCounters);

  useEffect(() => {
    const timer = window.setInterval(() => setCounters(getDynamicCounters()), 12000);
    return () => window.clearInterval(timer);
  }, []);

  const passwordHint = useMemo(() => passwordIssue(password), [password]);

  function showNotice(message) {
    setNotice(message);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");

    const cleanEmail = normalizeEmail(email);
    const cleanName = fullName.trim();

    if (!cleanName) {
      showNotice("اكتب اسمك كما تحب أن يظهر داخل المنصة.");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      localStorage.setItem("od_demo_name", cleanName);
      onEnter?.({ name: cleanName, demo: true });
      return;
    }

    if (!cleanEmail) {
      showNotice("أدخل البريد الإلكتروني.");
      return;
    }

    if (passwordIssue(password)) {
      showNotice(passwordIssue(password));
      return;
    }

    setBusy(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanName }
          }
        });

        if (error) throw error;

        if (data?.session) {
          onEnter?.({ session: data.session, name: cleanName });
          onAuthenticated?.(data.session);
        } else {
          showNotice("تم إنشاء الحساب. إذا كان تأكيد البريد مفعّلًا، افتح بريدك ثم سجل الدخول.");
        }

        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) throw error;

      const session = data?.session;
      const name =
        session?.user?.user_metadata?.full_name ||
        cleanName ||
        session?.user?.email ||
        "زميل المهنة";

      onEnter?.({ session, name });
      onAuthenticated?.(session);
    } catch (error) {
      showNotice(error?.message || "تعذر تنفيذ العملية. تحقق من البيانات وحاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  function enterDemo() {
    const cleanName = fullName.trim() || "زميل المهنة";
    localStorage.setItem("od_demo_name", cleanName);
    onEnter?.({ name: cleanName, demo: true });
  }

  return (
    <main className="public-gate" dir="rtl">
      <style>{`
        .public-gate {
          min-height: 100vh;
          background:
            radial-gradient(circle at 12% 8%, rgba(79, 70, 229, 0.16), transparent 30%),
            radial-gradient(circle at 88% 14%, rgba(245, 158, 11, 0.16), transparent 30%),
            linear-gradient(180deg, #f8fafc 0%, #eef2ff 48%, #f8fafc 100%);
          color: #0f172a;
          padding: 28px 14px 70px;
          font-family: inherit;
        }

        .public-wrap {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .public-hero {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 22px;
          align-items: center;
          border-radius: 38px;
          padding: 34px;
          color: white;
          background:
            radial-gradient(circle at 20% 15%, rgba(129, 140, 248, .25), transparent 30%),
            radial-gradient(circle at 85% 20%, rgba(245, 158, 11, .20), transparent 30%),
            linear-gradient(135deg, #0f172a, #1e1b4b 55%, #312e81);
          box-shadow: 0 26px 80px rgba(15, 23, 42, 0.22);
        }

        .public-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.16);
          color: #fde68a;
          font-size: 12px;
          font-weight: 900;
        }

        .public-hero h1 {
          margin: 18px 0 14px;
          font-size: clamp(34px, 5vw, 64px);
          line-height: 1.15;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .public-hero p {
          margin: 0;
          color: #cbd5e1;
          line-height: 2;
          font-size: 15px;
          font-weight: 700;
        }

        .auth-card {
          border-radius: 30px;
          padding: 22px;
          background: rgba(255,255,255,.94);
          color: #0f172a;
          border: 1px solid rgba(255,255,255,.8);
          box-shadow: 0 22px 55px rgba(0,0,0,.16);
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 7px;
          border-radius: 20px;
          background: #f1f5f9;
          margin-bottom: 16px;
        }

        .auth-tabs button {
          border: 0;
          cursor: pointer;
          border-radius: 15px;
          padding: 11px;
          font-family: inherit;
          color: #475569;
          font-weight: 900;
          background: transparent;
        }

        .auth-tabs button.active {
          color: white;
          background: linear-gradient(135deg, #4f46e5, #312e81);
        }

        .auth-field {
          margin-bottom: 12px;
        }

        .auth-field label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 13px;
          font-weight: 900;
        }

        .auth-field input {
          width: 100%;
          min-height: 48px;
          border-radius: 17px;
          border: 1px solid #cbd5e1;
          padding: 0 13px;
          font-family: inherit;
          font-weight: 800;
          color: #0f172a;
          background: white;
          outline: none;
          box-sizing: border-box;
        }

        .auth-field input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79,70,229,.10);
        }

        .password-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        .toggle-password {
          border: 0;
          border-radius: 15px;
          padding: 0 14px;
          background: #eef2ff;
          color: #3730a3;
          font-family: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        .hint {
          display: block;
          margin-top: 7px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 700;
        }

        .auth-notice {
          margin: 10px 0;
          border-radius: 16px;
          padding: 11px 13px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #9a3412;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 800;
        }

        .auth-actions {
          display: grid;
          gap: 9px;
          margin-top: 14px;
        }

        .auth-actions button {
          border: 0;
          border-radius: 17px;
          min-height: 48px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 950;
        }

        .auth-primary {
          color: white;
          background: linear-gradient(135deg, #4f46e5, #312e81);
        }

        .auth-ghost {
          color: #0f172a;
          background: #f1f5f9;
        }

        .public-section {
          margin-top: 18px;
          border-radius: 34px;
          padding: 28px;
          background: rgba(255,255,255,.88);
          border: 1px solid rgba(148,163,184,.18);
          box-shadow: 0 18px 55px rgba(15,23,42,.07);
        }

        .section-head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .section-head h2 {
          margin: 0;
          font-size: clamp(24px, 3vw, 36px);
          color: #0f172a;
          font-weight: 950;
        }

        .section-head p {
          margin: 6px 0 0;
          color: #64748b;
          line-height: 1.9;
          font-size: 13px;
          font-weight: 750;
        }

        .counter-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .counter-card {
          overflow: hidden;
          position: relative;
          border-radius: 26px;
          padding: 20px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.20);
        }

        .counter-card::before {
          content: "";
          position: absolute;
          top: -70px;
          right: -70px;
          width: 150px;
          height: 150px;
          border-radius: 999px;
          background: rgba(79,70,229,.12);
        }

        .counter-card strong {
          position: relative;
          display: block;
          font-size: 34px;
          color: #0f172a;
          font-weight: 950;
        }

        .counter-card span {
          position: relative;
          display: block;
          color: #475569;
          font-size: 13px;
          line-height: 1.8;
          font-weight: 850;
        }

        .counter-card small {
          position: relative;
          display: block;
          margin-top: 8px;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.7;
          font-weight: 800;
        }

        .path-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .path-card,
        .info-card,
        .faq-card {
          border-radius: 24px;
          padding: 18px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.20);
        }

        .path-card b {
          display: inline-flex;
          margin-bottom: 10px;
          padding: 5px 10px;
          border-radius: 999px;
          background: #eef2ff;
          color: #3730a3;
          font-size: 12px;
        }

        .path-card strong,
        .info-card strong,
        .faq-card strong {
          display: block;
          margin-bottom: 8px;
          color: #0f172a;
          font-size: 16px;
          line-height: 1.6;
          font-weight: 950;
        }

        .path-card span,
        .info-card span,
        .faq-card span {
          display: block;
          color: #64748b;
          line-height: 1.9;
          font-size: 13px;
          font-weight: 750;
        }

        .two-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .sample-box {
          border-radius: 28px;
          padding: 22px;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.14), transparent 34%),
            linear-gradient(135deg, #fff, #f8fafc);
          border: 1px solid rgba(148,163,184,.20);
        }

        .sample-box h3 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: 20px;
          font-weight: 950;
        }

        .sample-box p {
          margin: 0;
          color: #475569;
          line-height: 2;
          font-size: 13px;
          font-weight: 800;
        }

        .about-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .about-links a {
          text-decoration: none;
          border-radius: 999px;
          padding: 9px 13px;
          color: white;
          background: #0f172a;
          font-size: 12px;
          font-weight: 900;
        }

        .legal-note {
          border-radius: 24px;
          padding: 18px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #78350f;
          line-height: 2;
          font-size: 13px;
          font-weight: 850;
        }

        @media (max-width: 920px) {
          .public-hero,
          .counter-grid,
          .path-grid,
          .two-grid {
            grid-template-columns: 1fr;
          }

          .section-head {
            display: block;
          }
        }
      `}</style>

      <div className="public-wrap">
        <section className="public-hero">
          <div>
            <span className="public-badge">رحلة معرفية متكاملة في التطوير التنظيمي</span>
            <h1>حياك في مساحة الفهم قبل الحل</h1>
            <p>
              هنا لا تدخل لتقرأ محتوى متراكما، بل لتتقدم عبر مسار مصمم بعقلية
              استشارية: تشخيص، تصميم، تغيير، ثقافة، قياس، واستدامة.
            </p>
          </div>

          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-tabs">
              <button
                type="button"
                className={mode === "signin" ? "active" : ""}
                onClick={() => setMode("signin")}
              >
                دخول
              </button>
              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => setMode("signup")}
              >
                تسجيل جديد
              </button>
            </div>

            <div className="auth-field">
              <label htmlFor="fullName">اكتب اسمك كما تحب أن تراه في شهادتك</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="مثال: ريان العجلان"
                autoComplete="name"
                required
              />
            </div>

            {isSupabaseConfigured && (
              <>
                <div className="auth-field">
                  <label htmlFor="email">البريد الإلكتروني</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(normalizeEmail(event.target.value))}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                  />
                  <span className="hint">يتم تحويل البريد تلقائيا إلى أحرف صغيرة لتسهيل الدخول.</span>
                </div>

                <div className="auth-field">
                  <label htmlFor="password">كلمة المرور</label>
                  <div className="password-row">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="8 أحرف على الأقل وفيها حرف ورقم"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                  <span className="hint">
                    الشرط: 8 أحرف على الأقل، وتحتوي على حرف ورقم.
                  </span>
                </div>
              </>
            )}

            {notice && (
              <div className="auth-notice" role="alert" aria-live="assertive">
                {notice}
              </div>
            )}

            <div className="auth-actions">
              <button className="auth-primary" type="submit" disabled={busy}>
                {busy ? "جار المعالجة..." : mode === "signin" ? "دخول إلى الرحلة" : "إنشاء حساب"}
              </button>

              {!isSupabaseConfigured && (
                <button className="auth-ghost" type="button" onClick={enterDemo}>
                  دخول تجريبي
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>مؤشرات الرحلة</h2>
              <p>عدادات تفاعلية للواجهة العامة، ويمكن لاحقا ربطها ببيانات فعلية من Supabase.</p>
            </div>
          </div>

          <div className="counter-grid">
            <div className="counter-card">
              <strong>{counters.total}</strong>
              <span>متدرب ومتدربة بدأوا رحلتهم</span>
              <small>مؤشر واجهة قابل للربط لاحقا بعدد المسجلين الفعلي.</small>
            </div>
            <div className="counter-card">
              <strong>{counters.active}</strong>
              <span>يدرسون معك في هذه اللحظة</span>
              <small>يتغير ديناميكيا لمحاكاة النشاط الحي.</small>
            </div>
            <div className="counter-card">
              <strong>{counters.completed}</strong>
              <span>أتموا الـ 180 يوما بنجاح</span>
              <small>يمكن ربطه لاحقا بإكمال جميع أيام الرحلة.</small>
            </div>
            <div className="counter-card">
              <strong>{counters.remaining}</strong>
              <span>مقعدا متبقيا في دفعة الشهر الحالي</span>
              <small>عداد دفعة قابل للربط بسياسة قبول فعلية.</small>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>خريطة مختصرة للمسار</h2>
              <p>6 أشهر، كل شهر يبني قدرة مختلفة في قراءة المنظمة وتصميم التدخل وقياس الأثر.</p>
            </div>
          </div>

          <div className="path-grid">
            {MONTHS.map((month) => (
              <div className="path-card" key={month.number}>
                <b>{month.number}</b>
                <strong>{month.title}</strong>
                <span>{month.output}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>عينة مجانية من التجربة</h2>
              <p>لمحة تكشف جودة المسار قبل الدخول: درس قصير + موقف محاكاة.</p>
            </div>
          </div>

          <div className="two-grid">
            <div className="sample-box">
              <h3>عينة درس: العرض ليس السبب</h3>
              <p>
                ارتفاع الدوران الوظيفي قد يكون عرضا لا سببا. قبل اقتراح حوافز
                أو تدريب، اسأل: ما النمط المتكرر؟ من يتأثر؟ ما البيانات التي
                تثبت أو تنفي الفرضية؟
              </p>
            </div>

            <div className="sample-box">
              <h3>عينة محاكاة: مدير يريد حلا سريعا</h3>
              <p>
                يطلب منك قائد إدارة ورشة عاجلة لرفع الالتزام. القرار المهني:
                هل تنفذ الورشة مباشرة، أم تعيد التعاقد وتطلب بيانات عن القيادة
                والأدوار والحوافز؟
              </p>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>عن ريان</h2>
              <p>خلفية المبادرة وفلسفتها المهنية، ظاهرة للزائر قبل التسجيل.</p>
            </div>
          </div>

          <div className="two-grid">
            <div className="info-card">
              <strong>ريان العجلان</strong>
              <span>
                ممارس ومهتم ببناء محتوى معرفي يساعد القادة والممارسين على رؤية
                النظام خلف المشكلة، والمعنى خلف السلوك، قبل الاستعجال في الحل.
              </span>

              <div className="about-links">
                <a href="https://www.linkedin.com/in/rayanalajlan/" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a href="https://x.com/Rayan_Alajlan" target="_blank" rel="noreferrer">
                  منصة X
                </a>
                <a href="mailto:Rayansalajlan@gmail.com">
                  طلب استشارة
                </a>
              </div>
            </div>

            <div className="info-card">
              <strong>اعتمادات وخبرة مهنية</strong>
              <span>
                SHRM-SCP · SPHRi · CPTD · PMP، مع اهتمام عميق بالموارد البشرية،
                التطوير التنظيمي، الأداء، التعلم، وبناء القدرة المؤسسية.
              </span>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>أسئلة شائعة</h2>
              <p>إجابات مختصرة قبل إنشاء الحساب.</p>
            </div>
          </div>

          <div className="path-grid">
            {FAQ.map((item) => (
              <div className="faq-card" key={item.q}>
                <strong>{item.q}</strong>
                <span>{item.a}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>الخصوصية وشروط الاستخدام</h2>
              <p>صياغة أولية واضحة إلى حين بناء صفحة قانونية مستقلة.</p>
            </div>
          </div>

          <div className="legal-note">
            باستخدامك للمنصة، فأنت توافق على استخدام بيانات حسابك وتقدمك التعليمي
            لتشغيل الرحلة وحفظ الإنجاز وتحسين التجربة. لا تُعد المنصة وعدا
            وظيفيا أو شهادة أكاديمية رسمية، ولا ينبغي إدخال معلومات سرية أو
            حساسة داخل الحقول العامة. سيتم لاحقا توسيع هذه الصفحة بسياسة خصوصية
            وشروط استخدام مفصلة.
          </div>
        </section>
      </div>
    </main>
  );
}
