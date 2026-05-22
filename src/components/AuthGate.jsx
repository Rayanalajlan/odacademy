import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const MONTHS = [
  {
    number: "01",
    title: "تأسيس العقل التنظيمي",
    output: "قراءة المنظمة كنظام حي قبل القفز إلى الحلول."
  },
  {
    number: "02",
    title: "تصميم المنظمة والهياكل والأدوار",
    output: "تحويل التشخيص إلى أدوار وصلاحيات ونظام عمل واضح."
  },
  {
    number: "03",
    title: "تصميم التدخلات التنظيمية",
    output: "اختيار تدخل مناسب يعالج السبب لا العرض."
  },
  {
    number: "04",
    title: "قيادة التغيير والتحول",
    output: "بناء الالتزام وإدارة المقاومة واستدامة التغيير."
  },
  {
    number: "05",
    title: "الثقافة والتعلم وبناء القدرة",
    output: "قراءة الثقة والسلوك والتعلم المؤسسي كقدرة مستمرة."
  },
  {
    number: "06",
    title: "قياس الأثر والاحتراف",
    output: "ربط التدخلات بمؤشرات أثر وممارسة مهنية ناضجة."
  }
];

const FAQ = [
  {
    q: "هل الرحلة مجانية؟",
    a: "نعم، هذه الرحلة مجانية لوجه الله، وهدفها نشر معرفة مهنية نافعة في الموارد البشرية والتطوير التنظيمي."
  },
  {
    q: "كم مدة الرحلة؟",
    a: "الرحلة مصممة على 180 يومًا، موزعة على 6 أشهر، مع دروس واختبارات ومحاكاة تطبيقية."
  },
  {
    q: "كيف أتعلم داخل المنصة؟",
    a: "تتقدم عبر مسار شهري وأسبوعي ويومي، وتحل اختبارًا قصيرًا بعد كل درس، ثم تستخدم الرادار والمحاكاة لربط المعرفة بالممارسة."
  },
  {
    q: "هل توجد شهادة؟",
    a: "تظهر وثيقة الإتقان بعد اكتمال متطلبات الرحلة داخل المنصة. هي وثيقة إنجاز للرحلة وليست شهادة أكاديمية رسمية."
  },
  {
    q: "هل أحتاج خبرة سابقة؟",
    a: "لا. يمكن للخريج والممارس والقائد والمستشار الاستفادة من الرحلة، لكن أثرها يزيد كلما ربطت الدروس بحالات واقعية."
  },
  {
    q: "هل يوجد دعم أو متابعة؟",
    a: "تحتوي المنصة على أدوات مساعدة مثل رادار الجدارات، مختبر المحاكاة، وحاسبة العائد من التعلم. أي متابعة مباشرة يتم الإعلان عنها في المنصة عند توفرها."
  },
  {
    q: "هل تحفظ المنصة تقدمي؟",
    a: "نعم، عند تسجيل الدخول يتم حفظ تقدمك التعليمي حتى تستطيع العودة إلى آخر محطة وصلت إليها."
  },
  {
    q: "ما البيانات التي أحتاج إدخالها؟",
    a: "تحتاج بريدًا إلكترونيًا وكلمة مرور واسمًا عند التسجيل. لا تدخل معلومات سرية أو حساسة داخل الحقول العامة."
  }
];

const DEFAULT_STATS = {
  total_joined: 0,
  active_now: 0,
  completed_count: 0
};

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function passwordIssue(password) {
  if (!password || password.length < 8) return "كلمة المرور يجب ألا تقل عن 8 أحرف.";
  if (!/[A-Za-z]/.test(password)) return "كلمة المرور يجب أن تحتوي على حرف واحد على الأقل.";
  if (!/[0-9]/.test(password)) return "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل.";
  return "";
}

function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("ar-SA").format(number);
}

function normalizeStats(payload) {
  const row = Array.isArray(payload) ? payload[0] : payload;

  return {
    total_joined: Number(row?.total_joined || 0),
    active_now: Number(row?.active_now || 0),
    completed_count: Number(row?.completed_count || 0)
  };
}

export default function AuthGate({
  onEnter,
  onAuthenticated,
  recoveryMode = false,
  onPasswordUpdated
}) {
  const [mode, setMode] = useState(recoveryMode ? "recover" : "signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [statsReady, setStatsReady] = useState(false);
  const [sampleModal, setSampleModal] = useState("");
  const [openFaq, setOpenFaq] = useState("هل الرحلة مجانية؟");

  const passwordHint = useMemo(() => passwordIssue(password), [password]);
  const recoveryPasswordHint = useMemo(() => passwordIssue(newPassword), [newPassword]);

  useEffect(() => {
    setMode(recoveryMode ? "recover" : "signin");
  }, [recoveryMode]);

  async function loadPublicStats() {
    if (!isSupabaseConfigured || !supabase) {
      setStatsReady(true);
      return;
    }

    const { data, error } = await supabase.rpc("get_public_platform_stats");

    if (!error && data) {
      setStats(normalizeStats(data));
    }

    setStatsReady(true);
  }

  useEffect(() => {
    loadPublicStats();

    const timer = window.setInterval(() => {
      loadPublicStats();
    }, 30000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function touchActivity() {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.rpc("touch_user_activity");
  }

  function showNotice(message) {
    setNotice(message);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setNotice("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");

    if (nextMode === "signin") {
      setFullName("");
    }
  }

  async function handleForgotPassword() {
    setNotice("");

    if (!isSupabaseConfigured || !supabase) {
      showNotice("استعادة كلمة المرور تحتاج تفعيل Supabase.");
      return;
    }

    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail) {
      showNotice("اكتب بريدك الإلكتروني أولًا، ثم اضغط نسيت كلمة المرور.");
      return;
    }

    setBusy(true);

    try {
      const redirectTo = `${window.location.origin}/?reset_password=true`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo
      });

      if (error) throw error;

      showNotice("أرسلنا رابط استعادة كلمة المرور إلى بريدك. افتح الرابط ثم اكتب كلمة مرور جديدة.");
    } catch (error) {
      showNotice(error?.message || "تعذر إرسال رابط استعادة كلمة المرور.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRecoverySubmit(event) {
    event.preventDefault();
    setNotice("");

    const issue = passwordIssue(newPassword);
    if (issue) {
      showNotice(issue);
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotice("كلمتا المرور غير متطابقتين.");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      showNotice("تحديث كلمة المرور يحتاج تفعيل Supabase.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      const { data } = await supabase.auth.getSession();
      await touchActivity();

      showNotice("تم تحديث كلمة المرور بنجاح.");

      window.history.replaceState({}, document.title, window.location.origin + "/");

      onPasswordUpdated?.(data?.session || null);

      if (data?.session) {
        onEnter?.({
          session: data.session,
          name:
            data.session?.user?.user_metadata?.full_name ||
            data.session?.user?.email ||
            "زميل المهنة"
        });
        onAuthenticated?.(data.session);
      }
    } catch (error) {
      showNotice(error?.message || "تعذر تحديث كلمة المرور.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");

    if (mode === "recover") {
      await handleRecoverySubmit(event);
      return;
    }

    const cleanEmail = normalizeEmail(email);
    const cleanName = fullName.trim();

    if (!isSupabaseConfigured || !supabase) {
      const demoName = cleanName || "زميل المهنة";
      localStorage.setItem("od_demo_name", demoName);
      onEnter?.({ name: demoName, demo: true });
      return;
    }

    if (mode === "signup" && !cleanName) {
      showNotice("اكتب اسمك كما تحب أن تراه في شهادتك.");
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
          await touchActivity();
          await loadPublicStats();
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

      await touchActivity();
      await loadPublicStats();

      const session = data?.session;
      const name =
        session?.user?.user_metadata?.full_name ||
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
    const demoName = fullName.trim() || "زميل المهنة";
    localStorage.setItem("od_demo_name", demoName);
    onEnter?.({ name: demoName, demo: true });
  }

  return (
    <main className="public-gate" dir="rtl">
      <style>{`
        .public-gate {
          min-height: 100vh;
          background:
            radial-gradient(circle at 12% 8%, rgba(79, 70, 229, 0.15), transparent 30%),
            radial-gradient(circle at 88% 14%, rgba(245, 158, 11, 0.14), transparent 30%),
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

        .hero-points {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 22px;
        }

        .hero-point {
          border-radius: 22px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.10);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(14px);
        }

        .hero-point b {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 30px;
          border-radius: 999px;
          margin-bottom: 10px;
          color: #fde68a;
          background: rgba(255, 255, 255, 0.12);
          font-size: 12px;
          font-weight: 950;
        }

        .hero-point strong {
          display: block;
          color: #ffffff;
          font-size: 15px;
          line-height: 1.7;
          font-weight: 950;
          margin-bottom: 6px;
        }

        .hero-point span {
          display: block;
          color: rgba(226, 232, 240, 0.88);
          font-size: 12px;
          line-height: 1.9;
          font-weight: 750;
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

        .auth-title {
          margin: 0 0 16px;
          color: #0f172a;
          font-size: 22px;
          line-height: 1.5;
          font-weight: 950;
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

        .forgot-button {
          border: 0;
          background: transparent;
          color: #4f46e5;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          cursor: pointer;
          padding: 5px 0 0;
          text-align: right;
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
          grid-template-columns: repeat(3, minmax(0, 1fr));
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
        .info-card strong {
          display: block;
          margin-bottom: 8px;
          color: #0f172a;
          font-size: 16px;
          line-height: 1.6;
          font-weight: 950;
        }

        .path-card span,
        .info-card span {
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

        .sample-kicker {
          display: inline-flex;
          margin-bottom: 10px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #eef2ff;
          color: #3730a3;
          font-size: 11px;
          font-weight: 950;
        }

        .sample-lesson {
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.12), transparent 34%),
            linear-gradient(135deg, #fff, #f8fafc);
        }

        .sample-simulation {
          background:
            radial-gradient(circle at 100% 0%, rgba(16,185,129,.12), transparent 34%),
            linear-gradient(135deg, #fff, #f8fafc);
        }

        .sample-bullets {
          margin: 14px 0 0;
          padding: 0 18px 0 0;
          color: #334155;
          line-height: 1.9;
          font-size: 12px;
          font-weight: 850;
        }

        .sample-button {
          margin-top: 16px;
          border: 0;
          border-radius: 18px;
          padding: 13px 18px;
          color: white;
          background: linear-gradient(135deg, #4f46e5, #312e81);
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
        }

        .about-panel {
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 14px;
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

        .faq-list {
          display: grid;
          gap: 10px;
        }

        .faq-item {
          border-radius: 22px;
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(148,163,184,.20);
        }

        .faq-question {
          width: 100%;
          border: 0;
          background: transparent;
          padding: 16px 18px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #0f172a;
          font-family: inherit;
          font-size: 14px;
          font-weight: 950;
          text-align: right;
          cursor: pointer;
        }

        .faq-answer {
          padding: 0 18px 16px;
          color: #64748b;
          line-height: 1.95;
          font-size: 13px;
          font-weight: 750;
        }

        .legal-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .legal-card {
          border-radius: 24px;
          padding: 18px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.20);
        }

        .legal-card strong {
          display: block;
          color: #0f172a;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .legal-card span {
          color: #64748b;
          line-height: 1.9;
          font-size: 13px;
          font-weight: 750;
        }

        .public-footer {
          margin-top: 18px;
          text-align: center;
          color: #475569;
          line-height: 1.9;
          font-size: 13px;
          font-weight: 850;
        }

        .public-footer span {
          display: block;
          color: #94a3b8;
          margin-top: 4px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 90;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(15, 23, 42, .58);
          backdrop-filter: blur(10px);
        }

        .sample-modal {
          width: min(880px, 100%);
          max-height: 88vh;
          overflow: auto;
          border-radius: 32px;
          background: #fff;
          box-shadow: 0 26px 80px rgba(0,0,0,.28);
          padding: 26px;
        }

        .sample-modal h2 {
          margin: 0 0 12px;
          color: #0f172a;
          font-size: 28px;
          font-weight: 950;
        }

        .sample-modal p,
        .sample-modal li {
          color: #475569;
          line-height: 2;
          font-size: 14px;
          font-weight: 800;
        }

        .sample-modal-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin: 16px 0;
        }

        .sample-modal-card {
          border-radius: 20px;
          padding: 14px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.22);
        }

        .sample-modal-card b {
          display: inline-flex;
          margin-bottom: 8px;
          padding: 5px 9px;
          border-radius: 999px;
          background: #eef2ff;
          color: #3730a3;
          font-size: 11px;
          font-weight: 950;
        }

        .sample-modal-card strong {
          display: block;
          color: #0f172a;
          line-height: 1.7;
          font-size: 13px;
          font-weight: 950;
        }

        .sample-modal-card span {
          display: block;
          margin-top: 6px;
          color: #64748b;
          line-height: 1.8;
          font-size: 12px;
          font-weight: 750;
        }

        .simulation-choice {
          border-radius: 20px;
          padding: 14px;
          margin-top: 10px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.24);
        }

        .simulation-choice.correct {
          border-color: rgba(16,185,129,.45);
          background: #ecfdf5;
        }

        .simulation-choice.warning {
          border-color: rgba(245,158,11,.45);
          background: #fffbeb;
        }

        .simulation-choice strong {
          display: block;
          color: #0f172a;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 950;
        }

        .simulation-choice span {
          display: block;
          margin-top: 5px;
          color: #475569;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 750;
        }

        @media (max-width: 920px) {
          .sample-modal-grid {
            grid-template-columns: 1fr;
          }
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }

        .modal-actions button {
          border: 0;
          border-radius: 16px;
          padding: 12px 16px;
          color: white;
          background: #0f172a;
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
        }

        @media (max-width: 920px) {
          .public-hero,
          .counter-grid,
          .path-grid,
          .two-grid,
          .about-panel,
          .legal-grid,
          .hero-points {
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
              هنا لا تدخل لتقرأ محتوى متراكمًا، بل لتتقدم عبر مسار مصمم بعقلية
              استشارية: تشخيص، تصميم، تغيير، ثقافة، قياس، واستدامة.
            </p>

            <div className="hero-points" aria-label="مرتكزات الرحلة">
              <div className="hero-point">
                <b>01</b>
                <strong>اقرأ المنظمة كنظام</strong>
                <span>
                  افهم العلاقات بين الاستراتيجية، الهيكل، الأدوار، الثقافة،
                  والحوافز قبل بناء أي تدخل.
                </span>
              </div>

              <div className="hero-point">
                <b>02</b>
                <strong>ابنِ حكمًا مهنيًا</strong>
                <span>
                  تدرّب على تحليل الأعراض، اختبار الفرضيات، وطلب البيانات
                  المناسبة قبل إصدار التوصية.
                </span>
              </div>

              <div className="hero-point">
                <b>03</b>
                <strong>حوّل التعلم إلى أثر</strong>
                <span>
                  انتقل من فهم المفاهيم إلى تطبيقها في قرارات تنظيمية أوضح
                  وأكثر قابلية للقياس.
                </span>
              </div>
            </div>
          </div>

          <form className="auth-card" onSubmit={mode === "recover" ? handleRecoverySubmit : handleSubmit}>
            {mode !== "recover" && (
              <div className="auth-tabs">
                <button
                  type="button"
                  className={mode === "signin" ? "active" : ""}
                  onClick={() => switchMode("signin")}
                >
                  دخول
                </button>
                <button
                  type="button"
                  className={mode === "signup" ? "active" : ""}
                  onClick={() => switchMode("signup")}
                >
                  تسجيل جديد
                </button>
              </div>
            )}

            {mode === "recover" && (
              <>
                <h2 className="auth-title">تعيين كلمة مرور جديدة</h2>

                <div className="auth-field">
                  <label htmlFor="newPassword">كلمة المرور الجديدة</label>
                  <div className="password-row">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="8 أحرف على الأقل وفيها حرف ورقم"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      aria-label={showNewPassword ? "إخفاء كلمة المرور الجديدة" : "إظهار كلمة المرور الجديدة"}
                      aria-pressed={showNewPassword}
                      onClick={() => setShowNewPassword((value) => !value)}
                    >
                      {showNewPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                  <span className="hint">{recoveryPasswordHint || "كلمة المرور مناسبة."}</span>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
                  <input
                    id="confirmPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </>
            )}

            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor="fullName">اكتب اسمك كما تحب أن تراه في شهادتك</label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="اكتب الاسم هنا"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            {mode !== "recover" && isSupabaseConfigured && (
              <>
                <div className="auth-field">
                  <label htmlFor="email">البريد الإلكتروني</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="example@email.com"
                    autoComplete="email"
                    required
                  />
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

                  {mode === "signup" && (
                    <span className="hint">
                      {passwordHint || "كلمة المرور مناسبة."}
                    </span>
                  )}

                  {mode === "signin" && (
                    <button
                      type="button"
                      className="forgot-button"
                      onClick={handleForgotPassword}
                      disabled={busy}
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
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
                {busy
                  ? "جار المعالجة..."
                  : mode === "recover"
                    ? "تحديث كلمة المرور"
                    : mode === "signin"
                      ? "دخول إلى الرحلة"
                      : "إنشاء حساب"}
              </button>

              {mode === "recover" && (
                <button className="auth-ghost" type="button" onClick={() => switchMode("signin")}>
                  العودة لتسجيل الدخول
                </button>
              )}

              {!isSupabaseConfigured && mode !== "recover" && (
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
              <p>نبض حي يوضح حركة المتعلمين داخل المسار.</p>
            </div>
          </div>

          <div className="counter-grid" aria-live="polite">
            <div className="counter-card">
              <strong>{statsReady ? formatNumber(stats.total_joined) : "..."}</strong>
              <span>متدرب ومتدربة بدأوا رحلتهم</span>
            </div>
            <div className="counter-card">
              <strong>{statsReady ? formatNumber(stats.active_now) : "..."}</strong>
              <span>يدرسون معك في هذه اللحظة</span>
            </div>
            <div className="counter-card">
              <strong>{statsReady ? formatNumber(stats.completed_count) : "..."}</strong>
              <span>أتموا الـ 180 يوما بنجاح</span>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>خريطة مختصرة للمسار</h2>
              <p>ستة أشهر تبني قدرة متدرجة في قراءة المنظمة وتصميم التدخل وقياس الأثر.</p>
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
              <p>جرّب الفرق بين قراءة محتوى عادي، وبين تفكير استشاري يقودك من العرض إلى الفرضية والتدخل.</p>
            </div>
          </div>

          <div className="two-grid">
            <div className="sample-box sample-lesson">
              <span className="sample-kicker">عينة درس</span>
              <h3>لماذا لا تبدأ من الحل؟</h3>
              <p>
                ستتعلم كيف تفرّق بين العرض الظاهر والسبب الجذري، وكيف تحوّل
                مشكلة عامة مثل ضعف الالتزام إلى أسئلة تشخيصية قابلة للتحقق.
              </p>
              <ul className="sample-bullets">
                <li>فكرة مركزة من درس فعلي.</li>
                <li>إطار تشخيصي مختصر.</li>
                <li>سؤال تطبيقي قبل الانتقال للحل.</li>
              </ul>
              <button className="sample-button" type="button" onClick={() => setSampleModal("lesson")}>
                فتح الدرس التجريبي
              </button>
            </div>

            <div className="sample-box sample-simulation">
              <span className="sample-kicker">عينة محاكاة</span>
              <h3>اجتماع عاجل قبل إطلاق مبادرة تغيير</h3>
              <p>
                ستدخل موقفًا قصيرًا فيه ضغط من الإدارة، بيانات ناقصة، وروايات
                مختلفة. المطلوب أن تختار تصرفًا مهنيًا وتعرف لماذا هو الأقرب.
              </p>
              <ul className="sample-bullets">
                <li>موقف تشخيصي مصغر.</li>
                <li>ثلاثة اختيارات غير مفضوحة.</li>
                <li>تصحيح فوري يوضح منطق الإجابة.</li>
              </ul>
              <button className="sample-button" type="button" onClick={() => setSampleModal("simulation")}>
                تجربة الموقف
              </button>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>عن ريان</h2>
              <p>الجهة التي تقف خلف بناء هذه الرحلة المعرفية.</p>
            </div>
          </div>

          <div className="about-panel">
            <div className="info-card">
              <strong>ريان العجلان</strong>
              <span>
                صانع هذه الرحلة كأثر معرفي هادئ؛ لمن يبحث عن المعنى خلف السلوك،
                والنظام خلف المشكلة. يجمع اهتمامه بين الموارد البشرية، التطوير
                التنظيمي، الأداء، التعلم، وبناء القدرة المؤسسية.
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
              <strong>اعتمادات مهنية</strong>
              <span>
                SHRM-SCP · SPHRi · CPTD · PMP
              </span>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>أسئلة شائعة</h2>
              <p>إجابات مختصرة تساعدك قبل بدء الرحلة.</p>
            </div>
          </div>

          <div className="faq-list">
            {FAQ.map((item, index) => {
              const open = openFaq === item.q;
              const panelId = `faq-panel-${index}`;

              return (
                <div className="faq-item" key={item.q}>
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(open ? "" : item.q)}
                  >
                    <span>{item.q}</span>
                    <span>{open ? "−" : "+"}</span>
                  </button>

                  {open && (
                    <div id={panelId} className="faq-answer">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>الخصوصية وشروط الاستخدام</h2>
              <p>وضوح مبكر حول الحسابات والتقدم التعليمي والبيانات.</p>
            </div>
          </div>

          <div className="legal-grid">
            <div className="legal-card">
              <strong>حفظ التقدم</strong>
              <span>
                تُستخدم بيانات الحساب والتقدم التعليمي لحفظ إنجازك وإعادتك إلى
                آخر محطة وصلت إليها.
              </span>
            </div>

            <div className="legal-card">
              <strong>حدود الوثيقة</strong>
              <span>
                وثيقة الإتقان تثبت إتمام الرحلة داخل المنصة، ولا تمثل شهادة
                أكاديمية أو وعدا وظيفيا.
              </span>
            </div>

            <div className="legal-card">
              <strong>سلامة البيانات</strong>
              <span>
                لا تدخل معلومات سرية أو حساسة داخل الحقول العامة، واستخدم
                بياناتك التعليمية لغرض التعلم فقط.
              </span>
            </div>
          </div>
        </section>

        <footer className="public-footer">
          صنع بواسطة ريان العجلان كأثر معرفي هادئ؛ لمن يبحث عن المعنى خلف السلوك، والنظام خلف المشكلة.
          <span>© 2026 — جميع الحقوق محفوظة</span>
        </footer>
      </div>

      {sampleModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={sampleModal === "lesson" ? "درس تجريبي" : "محاكاة تجريبية"}
        >
          <div className="sample-modal">
            {sampleModal === "lesson" ? (
              <>
                <h2>درس تجريبي: لماذا لا تبدأ من الحل؟</h2>

                <p>
                  في التطوير التنظيمي، المشكلة التي تسمعها أولًا غالبًا ليست
                  المشكلة التي يجب أن تعالجها أولًا. عندما يقول المدير: "نحتاج
                  ورشة التزام"، فقد يكون يصف علاجًا يريده، لا عرضًا تم تشخيصه.
                </p>

                <div className="sample-modal-grid">
                  <div className="sample-modal-card">
                    <b>01</b>
                    <strong>العرض الظاهر</strong>
                    <span>انخفاض الالتزام، تأخر التسليم، مقاومة مبادرة، أو دوران وظيفي.</span>
                  </div>

                  <div className="sample-modal-card">
                    <b>02</b>
                    <strong>النمط المتكرر</strong>
                    <span>هل يحدث في فريق واحد، أم يتكرر مع كل مبادرة أو كل قائد؟</span>
                  </div>

                  <div className="sample-modal-card">
                    <b>03</b>
                    <strong>الفرضية المهنية</strong>
                    <span>قد يكون السبب في الأدوار، القيادة، الحوافز، الثقة، أو ضغط العمل.</span>
                  </div>
                </div>

                <p>
                  الفكرة العملية: لا تسأل "ما الحل المناسب؟" قبل أن تسأل:
                  "ما الذي يجعل هذا السلوك منطقيًا داخل النظام؟" هنا يبدأ
                  الفرق بين منفذ حلول وممارس تطوير تنظيمي.
                </p>

                <div className="sample-modal-card">
                  <b>تمرين سريع</b>
                  <strong>قبل أي تدخل، اكتب جملة تشخيصية واحدة:</strong>
                  <span>
                    يبدو أن العرض هو ضعف الالتزام، لكن الفرضية الأولية أن المشكلة
                    مرتبطة بوضوح الأولويات وحقوق القرار، وسأتحقق منها عبر مقابلات
                    قصيرة وقراءة مؤشرات التسليم.
                  </span>
                </div>
              </>
            ) : (
              <>
                <h2>محاكاة تجريبية: اجتماع عاجل قبل مبادرة تغيير</h2>

                <p>
                  وصلتك رسالة من مدير إدارة: "عندنا مقاومة عالية لمبادرة التحول.
                  نحتاج ورشة تحفيزية الأسبوع القادم." في المقابل، يخبرك أحد
                  المشرفين أن الفريق لا يقاوم التغيير نفسه، بل لا يفهم لماذا
                  تغيرت الأولويات ثلاث مرات خلال شهر واحد.
                </p>

                <div className="sample-modal-grid">
                  <div className="sample-modal-card">
                    <b>المعطى الأول</b>
                    <strong>الإدارة ترى مقاومة</strong>
                    <span>اللغة الرسمية تصف الناس بأنهم غير متعاونين.</span>
                  </div>

                  <div className="sample-modal-card">
                    <b>المعطى الثاني</b>
                    <strong>الموظفون يرون غموضًا</strong>
                    <span>الحديث غير الرسمي يدور حول تضارب الأولويات.</span>
                  </div>

                  <div className="sample-modal-card">
                    <b>التوتر التشخيصي</b>
                    <strong>هل المشكلة دافعية أم تصميم؟</strong>
                    <span>الإجابة تحدد هل نحتاج ورشة أم إعادة تعاقد وتشخيص.</span>
                  </div>
                </div>

                <div className="simulation-choice warning">
                  <strong>الخيار أ: تنفيذ ورشة تحفيزية مباشرة</strong>
                  <span>
                    يبدو سريعًا ومريحًا للإدارة، لكنه يقفز فوق التشخيص وقد يعالج
                    العرض لا السبب.
                  </span>
                </div>

                <div className="simulation-choice correct">
                  <strong>الخيار ب: إعادة التعاقد وطلب بيانات قبل التدخل</strong>
                  <span>
                    الأقرب مهنيًا: تحدد السؤال التشخيصي، تقابل عينات من الأطراف،
                    وتراجع تغيّر الأولويات قبل تصميم أي ورشة.
                  </span>
                </div>

                <div className="simulation-choice warning">
                  <strong>الخيار ج: إرسال استبيان رضا عام للجميع</strong>
                  <span>
                    قد يعطي مؤشرات عامة، لكنه لا يكفي وحده لفهم تضارب الروايات
                    وسياق المبادرة.
                  </span>
                </div>
              </>
            )}

            <div className="modal-actions">
              <button type="button" onClick={() => setSampleModal("")}>
                إغلاق العينة
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
