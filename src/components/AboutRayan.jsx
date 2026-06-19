import { useMemo, useState } from "react";

const LOGO_SRC = "/rayan-logo.png";

const credentials = ["SHRM-SCP", "SPHRi", "CPTD", "PMP"];

const methodologyCards = [
  {
    title: "فهم النظام",
    text: "قراءة المنظمة كشبكة مترابطة من الاستراتيجية، الهيكل، الأدوار، الصلاحيات، العمليات، الثقافة، والحوكمة قبل تفسير المشكلة أو اقتراح الحل."
  },
  {
    title: "تصميم التدخل",
    text: "تحويل التشخيص إلى تدخل عملي مناسب للسياق، لا إلى قالب جاهز. التدخل الجيد يراعي الناس، السلطة، البيانات، المقاومة، وإمكانات التنفيذ."
  },
  {
    title: "قياس الأثر",
    text: "ربط كل تدخل بنتيجة قابلة للملاحظة والقياس، حتى لا يبقى التطوير التنظيمي مجرد مبادرة جميلة بلا أثر واضح."
  }
];

const workDomains = [
  {
    title: "التشخيص التنظيمي",
    text: "قراءة الأعراض، الأنماط، الفرضيات، وأصحاب المصلحة للوصول إلى فهم مهني قبل اختيار الحل."
  },
  {
    title: "تصميم الأدوار والحوكمة",
    text: "بناء وضوح في المسؤوليات، الصلاحيات، نقاط القرار، التداخلات، ومصفوفات المساءلة."
  },
  {
    title: "منظومة الأداء والتعلم",
    text: "ربط الأداء بالسلوك، التغذية الراجعة، التعلم المستمر، ووضوح النتائج المتوقعة."
  },
  {
    title: "التغيير وبناء القدرة",
    text: "تصميم تدخلات تساعد المنظمة على تبنّي التغيير، تثبيت الممارسات، وبناء قدرة داخلية قابلة للاستمرار."
  }
];

const socialLinks = [
  {
    name: "LinkedIn",
    label: "المساحة المهنية",
    description:
      "مقالات وقراءات معمّقة في فلسفة العمل، بناء المنظمات، والقدرات البشرية التي تصنع الفارق.",
    icon: "in",
    url: "https://www.linkedin.com/in/rayanalajlan/",
    brandClass: "linkedin"
  },
  {
    name: "X",
    label: "الأفكار الحرة",
    description:
      "ومضات سريعة وأفكار حرة حول السلوك المؤسسي، القرارات اليومية، وتطوير بيئات العمل.",
    icon: "𝕏",
    url: "https://x.com/Rayan_Alajlan",
    brandClass: "x"
  }
];

const duaText =
  "أجمل ما قد يهديه لي العابرون بعد الفائدة: دعوة صادقة بظهر الغيب لوالديّ، وللمسلمين والمسلمات، الأحياء منهم والأموات؛ أن يشملهم الله بعفوه، ويعمّهم برضوانه.";

function MailIcon() {
  return (
    <svg
      className="ar-mail-icon consultation-mail-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="6.25" width="16" height="11.5" rx="3.2" />
      <path d="M5.25 8.1 12 12.9l6.75-4.8" />
      <path d="m5.4 16.55 4.25-4" opacity=".72" />
      <path d="m18.6 16.55-4.25-4" opacity=".72" />
    </svg>
  );
}

function buildConsultationMailto() {
  const to = "Rayansalajlan@gmail.com";
  const subject = "طلب استشارة مهنية";
  const body = `
السلام عليكم ريان،

أرغب بطلب استشارة مهنية، وهذه بعض التفاصيل الأولية:

الاسم:
الجهة / القطاع:
المسمى الوظيفي:
موضوع الاستشارة:
التحدي الحالي باختصار:
الهدف المتوقع من الاستشارة:
طريقة التواصل المناسبة:
الأوقات المناسبة للتواصل:

شكرًا لك.
`.trim();

  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function AboutRayan() {
  const [logoLoaded, setLogoLoaded] = useState(true);
  const consultationMailto = useMemo(() => buildConsultationMailto(), []);

  return (
    <section className="about-rayan" dir="rtl">
      <style>{`
        .about-rayan {
          --ink:#18102e;
          --muted:#7a6c9a;
          --line:rgba(167, 139, 250,.22);
          --gold:#8b5cf6;
          --gold-deep:#4c1d95;
          --gold-light:#c4b5fd;
          --gold-soft:rgba(139,92,246,.13);
          --linkedin:#0a66c2;
          --x:#18102e;
          min-height:100vh;
          position:relative;
          overflow:hidden;
          padding:30px 16px 72px;
          color:var(--ink);
          background:
            radial-gradient(circle at 12% 10%, rgba(139,92,246,.18), transparent 32%),
            radial-gradient(circle at 90% 18%, rgba(139, 92, 246,.13), transparent 30%),
            radial-gradient(circle at 45% 92%, rgba(16,185,129,.10), transparent 34%),
            linear-gradient(135deg,#f4f0fb 0%,#f7f3ff 46%,#efe9fb 100%);
        }

        .about-rayan * {
          box-sizing:border-box;
        }

        .ar-wrap {
          width:min(1180px,100%);
          margin:0 auto;
          position:relative;
          z-index:1;
        }

        .ar-hero {
          position:relative;
          overflow:hidden;
          border-radius:42px;
          padding:34px;
          color:white;
          background:
            radial-gradient(circle at 14% 20%, rgba(196,181,253,.26), transparent 32%),
            linear-gradient(135deg,#18102e,#281748 58%,#120a22);
          box-shadow:0 30px 90px rgba(28, 17, 48,.22);
        }

        .ar-hero::before {
          content:"";
          position:absolute;
          inset:-45%;
          background-image:
            linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
          background-size:42px 42px;
          transform:rotate(-8deg);
          opacity:.42;
        }

        .ar-hero-inner {
          position:relative;
          z-index:1;
          display:grid;
          grid-template-columns:1fr 320px;
          gap:30px;
          align-items:center;
        }

        .ar-eyebrow {
          display:inline-flex;
          width:fit-content;
          padding:8px 14px;
          border-radius:999px;
          color:#c4b5fd;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.16);
          font-size:12px;
          font-weight:950;
        }

        .ar-title {
          margin:18px 0 12px;
          font-size:clamp(34px,5vw,68px);
          line-height:1.05;
          letter-spacing:-1.4px;
          font-weight:950;
        }

        .ar-title span {
          display:block;
          color:transparent;
          background:linear-gradient(90deg,#fff,#c4b5fd,#c4b5fd);
          -webkit-background-clip:text;
          background-clip:text;
        }

        .ar-lead {
          margin:0;
          max-width:820px;
          color:rgba(196, 181, 253,.88);
          font-size:16px;
          line-height:2.15;
          font-weight:700;
        }

        .ar-credentials {
          margin-top:18px;
          display:flex;
          flex-wrap:wrap;
          gap:10px;
        }

        .ar-credential {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          min-height:38px;
          padding:9px 13px;
          border-radius:999px;
          color:#c4b5fd;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.15);
          font-size:12px;
          font-weight:950;
          letter-spacing:.3px;
        }

        .ar-hero-actions {
          display:flex;
          flex-wrap:wrap;
          gap:12px;
          margin-top:22px;
        }

        .ar-primary-action,
        .ar-secondary-action {
          text-decoration:none;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          border-radius:18px;
          padding:13px 18px;
          font-size:13px;
          font-weight:950;
          transition:.24s ease;
        }

        .ar-primary-action {
          color:#24123f;
          background:linear-gradient(135deg,#c4b5fd,#a855f7);
          box-shadow:0 18px 42px rgba(139,92,246,.20);
        }

        .ar-secondary-action {
          color:white;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.16);
        }

        .about-rayan :is(.ar-primary-action, .ar-consultation-button) .consultation-mail-icon {
          width:20px !important;
          height:20px !important;
          flex:0 0 20px !important;
          display:block !important;
          color:currentColor !important;
          fill:none !important;
          stroke:currentColor !important;
          stroke-width:1.9 !important;
          background:transparent !important;
          border:0 !important;
          box-shadow:none !important;
        }

        .about-rayan :is(.ar-primary-action, .ar-consultation-button) .consultation-mail-icon :is(rect, path) {
          fill:none !important;
          stroke:currentColor !important;
          vector-effect:non-scaling-stroke;
        }

        .ar-primary-action:hover,
        .ar-secondary-action:hover {
          transform:translateY(-3px);
        }

        .ar-logo-card {
          display:grid;
          place-items:center;
          min-height:310px;
          border-radius:34px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.14);
          backdrop-filter:blur(16px);
        }

        .ar-logo-shell {
          width:250px;
          height:250px;
          display:grid;
          place-items:center;
          border-radius:999px;
          background:#ffffff;
          box-shadow:
            inset 0 0 0 1px rgba(139,92,246,.10),
            0 28px 70px rgba(0,0,0,.22);
          overflow:hidden;
        }

        .ar-logo-shell img {
          width:100%;
          height:100%;
          object-fit:contain;
          display:block;
        }

        .ar-logo-fallback {
          width:100%;
          height:100%;
          display:grid;
          place-items:center;
          color:var(--gold);
          font-size:54px;
          font-weight:950;
          border:12px solid rgba(139,92,246,.42);
          border-radius:999px;
          background:white;
        }

        .ar-section {
          margin-top:20px;
          border-radius:34px;
          padding:26px;
          background:rgba(255,255,255,.84);
          border:1px solid rgba(255,255,255,.94);
          box-shadow:0 22px 60px rgba(28, 17, 48,.08);
          backdrop-filter:blur(20px);
        }

        .ar-section-head {
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:18px;
          margin-bottom:18px;
        }

        .ar-section-head span {
          display:inline-flex;
          color:var(--gold);
          font-size:12px;
          font-weight:950;
          margin-bottom:8px;
        }

        .ar-section-head h2 {
          margin:0;
          color:var(--ink);
          font-size:clamp(24px,3vw,38px);
          line-height:1.3;
          font-weight:950;
        }

        .ar-section-head p {
          margin:10px 0 0;
          max-width:780px;
          color:var(--muted);
          font-size:14px;
          line-height:2;
          font-weight:700;
        }

        .ar-signature {
          flex:0 0 auto;
          border-radius:22px;
          padding:14px 16px;
          color:white;
          background:linear-gradient(135deg,#18102e,#463c63);
          font-size:12px;
          line-height:1.8;
          font-weight:900;
          max-width:300px;
        }

        .ar-bio-box,
        .ar-consultation-copy,
        .ar-card,
        .ar-domain,
        .ar-social,
        .ar-dua-card {
          background:white;
          border:1px solid var(--line);
          box-shadow:0 16px 44px rgba(28, 17, 48,.06);
        }

        .ar-dua-section {
          margin-top:20px;
          border-radius:34px;
          padding:26px;
          background:rgba(255,255,255,.84);
          border:1px solid rgba(255,255,255,.94);
          box-shadow:0 22px 60px rgba(28, 17, 48,.08);
          backdrop-filter:blur(20px);
        }

        .ar-dua-card {
          position:relative;
          overflow:hidden;
          border-radius:28px;
          padding:22px;
          background:white;
          border:1px solid var(--line);
          box-shadow:0 16px 44px rgba(28, 17, 48,.06);
        }

        .ar-dua-card::before {
          content:"";
          position:absolute;
          top:-90px;
          left:-90px;
          width:220px;
          height:220px;
          border-radius:999px;
          background:rgba(139,92,246,.14);
        }

        .ar-dua-card span {
          position:relative;
          z-index:1;
          display:inline-flex;
          width:fit-content;
          min-height:38px;
          align-items:center;
          margin-bottom:10px;
          padding:8px 14px;
          border-radius:999px;
          color:var(--gold);
          background:#f5f0ff;
          border:1px solid rgba(139,92,246,.18);
          font-size:12px;
          font-weight:950;
        }

        .ar-dua-card p {
          position:relative;
          z-index:1;
          margin:0;
          color:#281748;
          font-size:15px;
          line-height:2.15;
          font-weight:700;
        }

        .ar-bio-box {
          border-radius:28px;
          padding:22px;
        }

        .ar-bio-box p {
          margin:0;
          color:#281748;
          font-size:15px;
          line-height:2.15;
          font-weight:700;
        }

        .ar-bio-box p + p {
          margin-top:14px;
        }

        .ar-identity-grid,
        .ar-lens-grid {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:14px;
        }

        .ar-card {
          position:relative;
          min-height:210px;
          overflow:hidden;
          border-radius:28px;
          padding:20px;
        }

        .ar-card::before {
          content:"";
          position:absolute;
          top:-60px;
          left:-60px;
          width:150px;
          height:150px;
          border-radius:999px;
          background:var(--gold-soft);
        }

        .ar-card small {
          position:relative;
          z-index:1;
          display:inline-flex;
          width:42px;
          height:42px;
          border-radius:17px;
          align-items:center;
          justify-content:center;
          color:#4c1d95;
          background:#f5f0ff;
          font-size:12px;
          font-weight:950;
          margin-bottom:18px;
        }

        .ar-card h3,
        .ar-card strong,
        .ar-card p {
          position:relative;
          z-index:1;
        }

        .ar-card h3 {
          margin:0 0 8px;
          color:var(--ink);
          font-size:18px;
          line-height:1.45;
          font-weight:950;
        }

        .ar-card strong {
          display:block;
          color:var(--gold);
          font-size:14px;
          line-height:1.7;
          font-weight:950;
          margin-bottom:10px;
        }

        .ar-card p {
          margin:0;
          color:var(--muted);
          font-size:13px;
          line-height:1.95;
          font-weight:700;
        }

        .ar-lens {
          min-height:250px;
          position:relative;
          overflow:hidden;
          border-radius:32px;
          padding:24px;
          color:white;
          background:
            radial-gradient(circle at 20% 20%, rgba(196,181,253,.20), transparent 34%),
            linear-gradient(150deg,#18102e,#281748);
          box-shadow:0 24px 60px rgba(28, 17, 48,.16);
        }

        .ar-lens b {
          display:block;
          color:rgba(255,255,255,.12);
          font-size:64px;
          line-height:1;
          font-weight:950;
          margin-bottom:14px;
        }

        .ar-lens h3 {
          margin:0 0 12px;
          font-size:28px;
          font-weight:950;
          color:#c4b5fd;
        }

        .ar-lens p {
          margin:0;
          color:rgba(196, 181, 253,.88);
          font-size:14px;
          line-height:2;
          font-weight:750;
        }

        .ar-domains-grid,
        .ar-social-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:14px;
        }

        .ar-domain {
          display:grid;
          grid-template-columns:54px 1fr;
          gap:14px;
          align-items:start;
          min-height:150px;
          border-radius:26px;
          padding:18px;
        }

        .ar-domain-mark {
          width:54px;
          height:54px;
          display:grid;
          place-items:center;
          border-radius:20px;
          color:white;
          background:linear-gradient(135deg,var(--gold),var(--gold-deep));
          font-size:18px;
          font-weight:950;
        }

        .ar-domain h3 {
          margin:0 0 8px;
          color:var(--ink);
          font-size:18px;
          line-height:1.4;
          font-weight:950;
        }

        .ar-domain p {
          margin:0;
          color:var(--muted);
          font-size:13px;
          line-height:2;
          font-weight:700;
        }

        .ar-consultation {
          display:grid;
          grid-template-columns:1fr 330px;
          gap:16px;
          align-items:stretch;
        }

        .ar-consultation-copy {
          border-radius:28px;
          padding:22px;
        }

        .ar-consultation-copy h3 {
          margin:0 0 10px;
          color:var(--ink);
          font-size:24px;
          line-height:1.4;
          font-weight:950;
        }

        .ar-consultation-copy p {
          margin:0;
          color:var(--muted);
          font-size:14px;
          line-height:2;
          font-weight:700;
        }

        .ar-consultation-panel {
          border-radius:28px;
          padding:22px;
          color:white;
          background:linear-gradient(150deg,#18102e,#281748);
          box-shadow:0 20px 52px rgba(28, 17, 48,.16);
          display:flex;
          flex-direction:column;
          justify-content:center;
          gap:14px;
        }

        .ar-consultation-panel strong {
          display:block;
          font-size:19px;
          line-height:1.7;
          font-weight:950;
        }

        .ar-consultation-panel p {
          margin:0;
          color:rgba(196, 181, 253,.86);
          font-size:13px;
          line-height:1.9;
          font-weight:750;
        }

        .ar-consultation-button {
          text-decoration:none;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          width:100%;
          min-height:48px;
          border-radius:18px;
          color:#24123f;
          background:linear-gradient(135deg,#c4b5fd,#a855f7);
          font-size:13px;
          font-weight:950;
          transition:.24s ease;
        }

        .ar-consultation-button:hover {
          transform:translateY(-3px);
        }

        .ar-mail-icon {
          width:18px;
          height:18px;
          flex:0 0 18px;
          fill:none;
          stroke:currentColor;
          stroke-width:2;
          stroke-linecap:round;
          stroke-linejoin:round;
        }

        .ar-social {
          text-decoration:none;
          min-height:160px;
          border-radius:28px;
          padding:20px;
          display:grid;
          grid-template-columns:64px 1fr;
          gap:16px;
          align-items:center;
          transition:.24s ease;
          color:inherit;
        }

        .ar-social:hover {
          transform:translateY(-5px);
          box-shadow:0 24px 56px rgba(28, 17, 48,.10);
        }

        .ar-social-icon {
          width:64px;
          height:64px;
          display:grid;
          place-items:center;
          border-radius:22px;
          color:white;
          font-size:22px;
          font-weight:950;
        }

        .ar-social.linkedin .ar-social-icon {
          background:var(--linkedin);
        }

        .ar-social.x .ar-social-icon {
          background:var(--x);
        }

        .ar-social.linkedin span {
          color:var(--linkedin);
        }

        .ar-social.x span {
          color:#5b21b6;
        }

        .ar-social span {
          display:block;
          font-size:12px;
          font-weight:950;
          margin-bottom:6px;
        }

        .ar-social h3 {
          margin:0 0 8px;
          color:var(--ink);
          font-size:20px;
          font-weight:950;
        }

        .ar-social p {
          margin:0;
          color:var(--muted);
          font-size:13px;
          line-height:1.9;
          font-weight:700;
        }

        /* Final theme pass: mixed surfaces keep readable purple-family contrast. */
        html body:not(.od-theme-dark):not(.od-theme-dark) .about-rayan {
          --ar-heading-readable:#24123f;
          --ar-text-readable:#4d3f69;
          --ar-muted-readable:#6a5d85;
          --ar-accent-readable:#6d28d9;
          --ar-border-readable:rgba(124,58,237,.18);
          --ar-light-surface:linear-gradient(180deg,#ffffff 0%,#faf7ff 100%);
          --ar-dark-surface:linear-gradient(150deg,#18102e 0%,#281748 100%);
          --ar-dark-heading:#f7f3fc;
          --ar-dark-text:#e7ddfb;
          --ar-dark-muted:#d8cff2;
          color:var(--ar-text-readable) !important;
        }

        html body.od-theme-dark.od-theme-dark .about-rayan {
          --ar-heading-readable:#f7f3fc;
          --ar-text-readable:#e7ddfb;
          --ar-muted-readable:#cfc3ee;
          --ar-accent-readable:#d9c7ff;
          --ar-border-readable:rgba(196,181,253,.26);
          --ar-light-surface:linear-gradient(180deg,rgba(31,19,55,.96),rgba(22,13,42,.94));
          --ar-dark-surface:linear-gradient(150deg,#18102e 0%,#281748 100%);
          --ar-dark-heading:#f7f3fc;
          --ar-dark-text:#e7ddfb;
          --ar-dark-muted:#d8cff2;
          color:var(--ar-text-readable) !important;
          background:
            radial-gradient(circle at 12% 10%, rgba(139,92,246,.18), transparent 32%),
            radial-gradient(circle at 86% 18%, rgba(139,92,246,.10), transparent 30%),
            linear-gradient(135deg,#0c0717 0%,#160c2a 48%,#10091f 100%) !important;
        }

        html body .about-rayan :is(.ar-title, .ar-section-head h2, .ar-lens h3, .ar-domain h3, .ar-card h3, .ar-social h3, .ar-consultation-copy h3) {
          letter-spacing:0 !important;
          text-wrap:balance;
        }

        html body .about-rayan .ar-title {
          font-size:clamp(2.05rem,4.2vw,4rem) !important;
          line-height:1.16 !important;
          font-weight:850 !important;
        }

        html body .about-rayan .ar-title span {
          color:transparent !important;
          -webkit-text-fill-color:transparent !important;
          background:linear-gradient(90deg,#ffffff,#f4e8ff,#d9c7ff) !important;
          -webkit-background-clip:text !important;
          background-clip:text !important;
        }

        html body .about-rayan :is(.ar-section-head h2, .ar-domain h3, .ar-card h3, .ar-social h3, .ar-consultation-copy h3) {
          color:var(--ar-heading-readable) !important;
          -webkit-text-fill-color:var(--ar-heading-readable) !important;
          font-weight:850 !important;
        }

        html body .about-rayan :is(.ar-section-head p, .ar-domain p, .ar-card p, .ar-social p, .ar-consultation-copy p, .ar-bio-box p) {
          color:var(--ar-muted-readable) !important;
          -webkit-text-fill-color:var(--ar-muted-readable) !important;
          opacity:1 !important;
          font-weight:650 !important;
        }

        html body:not(.od-theme-dark):not(.od-theme-dark) .about-rayan :is(
          .ar-section,
          .ar-dua-section,
          .ar-bio-box,
          .ar-consultation-copy,
          .ar-card,
          .ar-domain,
          .ar-social
        ) {
          background:var(--ar-light-surface) !important;
          border-color:var(--ar-border-readable) !important;
          color:var(--ar-text-readable) !important;
          box-shadow:0 18px 48px rgba(74,45,132,.08) !important;
        }

        html body.od-theme-dark.od-theme-dark .about-rayan :is(
          .ar-section,
          .ar-dua-section,
          .ar-bio-box,
          .ar-consultation-copy,
          .ar-card,
          .ar-domain,
          .ar-social,
          .ar-dua-card
        ) {
          background:var(--ar-light-surface) !important;
          border-color:var(--ar-border-readable) !important;
          color:var(--ar-text-readable) !important;
          box-shadow:0 20px 58px rgba(0,0,0,.24) !important;
        }

        html body .about-rayan :is(.ar-hero, .ar-lens, .ar-consultation-panel) {
          background:var(--ar-dark-surface) !important;
          border-color:rgba(196,181,253,.22) !important;
          color:var(--ar-dark-text) !important;
        }

        html body .about-rayan :is(.ar-hero, .ar-lens, .ar-consultation-panel) :is(h1, h2, h3, strong) {
          color:var(--ar-dark-heading) !important;
          -webkit-text-fill-color:var(--ar-dark-heading) !important;
        }

        html body .about-rayan :is(.ar-hero, .ar-lens, .ar-consultation-panel) :is(p, span:not(.ar-eyebrow), small) {
          color:var(--ar-dark-muted) !important;
          -webkit-text-fill-color:var(--ar-dark-muted) !important;
          opacity:1 !important;
        }

        html body .about-rayan .ar-lens b {
          color:#8b5cf6 !important;
          -webkit-text-fill-color:#8b5cf6 !important;
          opacity:.78 !important;
        }

        html body .about-rayan .ar-lens h3 {
          color:#efe9ff !important;
          -webkit-text-fill-color:#efe9ff !important;
        }

        html body .about-rayan .ar-lens p {
          color:#d8cff2 !important;
          -webkit-text-fill-color:#d8cff2 !important;
          opacity:1 !important;
        }

        html body .about-rayan .ar-title span {
          color:transparent !important;
          -webkit-text-fill-color:transparent !important;
          background:linear-gradient(90deg,#ffffff,#f4e8ff,#d9c7ff) !important;
          -webkit-background-clip:text !important;
          background-clip:text !important;
        }

        html body .about-rayan .ar-domain-mark,
        html body .about-rayan .ar-social-icon {
          color:#ffffff !important;
          -webkit-text-fill-color:#ffffff !important;
        }

        html body .about-rayan .ar-domain-mark {
          background:linear-gradient(135deg,#7c3aed,#4c1d95) !important;
        }

        html body .about-rayan .ar-social-icon * {
          color:currentColor !important;
          fill:currentColor !important;
          stroke:currentColor;
          -webkit-text-fill-color:currentColor !important;
        }

        html body .about-rayan .ar-social.linkedin .ar-social-icon {
          background:#0a66c2 !important;
        }

        html body .about-rayan .ar-social.x .ar-social-icon {
          background:#18102e !important;
        }

        html body .about-rayan .ar-social.linkedin span,
        html body .about-rayan .ar-social.x span,
        html body .about-rayan .ar-section-head span,
        html body .about-rayan .ar-dua-card span,
        html body .about-rayan .ar-card strong {
          color:var(--ar-accent-readable) !important;
          -webkit-text-fill-color:var(--ar-accent-readable) !important;
        }

        html body .about-rayan .ar-dua-card p {
          color:var(--ar-muted-readable) !important;
          -webkit-text-fill-color:var(--ar-muted-readable) !important;
          font-size:15px !important;
          line-height:2.15 !important;
          font-weight:650 !important;
          opacity:1 !important;
        }

        html body .about-rayan :is(.ar-primary-action, .ar-consultation-button) {
          color:#24123f !important;
          -webkit-text-fill-color:#24123f !important;
        }

        html body .about-rayan .ar-secondary-action {
          color:#f7f3fc !important;
          -webkit-text-fill-color:#f7f3fc !important;
          background:rgba(255,255,255,.12) !important;
          border-color:rgba(255,255,255,.22) !important;
        }

        @media (max-width:980px) {
          .ar-hero-inner,
          .ar-identity-grid,
          .ar-lens-grid,
          .ar-domains-grid,
          .ar-social-grid,
          .ar-consultation {
            grid-template-columns:1fr;
          }

          .ar-section-head {
            display:block;
          }

          .ar-signature {
            max-width:100%;
            margin-top:14px;
          }

          .ar-logo-card {
            min-height:auto;
            padding:24px;
          }
        }

        @media (max-width:560px) {
          .about-rayan {
            padding:16px 10px 44px;
          }

          .ar-hero,
          .ar-section,
          .ar-dua-section,
          .ar-dua-card {
            border-radius:28px;
            padding:22px;
          }

          .ar-logo-shell {
            width:210px;
            height:210px;
          }

          .ar-domain,
          .ar-social {
            grid-template-columns:1fr;
          }
        }
      `}</style>

      <div className="ar-wrap">
        <header className="ar-hero">
          <div className="ar-hero-inner">
            <div>
              <span className="ar-eyebrow">عن ريان العجلان</span>

              <h1 className="ar-title">
                قراءة أعمق للمنظمة
                <span>قبل تصميم أي تدخل</span>
              </h1>

              <p className="ar-lead">
                متخصص في الموارد البشرية والتطوير التنظيمي وبناء الأداء، أعمل
                على قراءة المنظمات بوصفها أنظمة حيّة تتداخل فيها الاستراتيجية،
                الأدوار، الصلاحيات، الثقافة، السلوك، التعلم، والقياس. أؤمن أن
                جودة الحل تبدأ من جودة التشخيص، وأن الأثر الحقيقي لا يتحقق
                بكثرة المبادرات، بل بوضوح التصميم وقدرة المنظمة على التعلم
                والاستمرار.
              </p>

              <div className="ar-credentials" aria-label="الاعتمادات المهنية">
                {credentials.map((item) => (
                  <span className="ar-credential" key={item}>
                    {item}
                  </span>
                ))}
              </div>

              <div className="ar-hero-actions">
                <a className="ar-primary-action" href={consultationMailto}>
                  <MailIcon />
                  طلب استشارة
                </a>

                <a
                  className="ar-secondary-action"
                  href="https://www.linkedin.com/in/rayanalajlan/"
                  target="_blank"
                  rel="noreferrer"
                >
                  زيارة LinkedIn
                </a>
              </div>
            </div>

            <aside className="ar-logo-card" aria-label="شعار ريان العجلان">
              <div className="ar-logo-shell">
                {logoLoaded ? (
                  <img
                    src={LOGO_SRC}
                    alt="شعار ريان العجلان"
                    onError={() => setLogoLoaded(false)}
                  />
                ) : (
                  <div className="ar-logo-fallback">RA</div>
                )}
              </div>
            </aside>
          </div>
        </header>

        <section className="ar-dua-section">
          <div className="ar-dua-card">
            <span>طلب دعاء</span>
            <p>{duaText}</p>
          </div>
        </section>

        <section className="ar-section">
          <div className="ar-section-head">
            <div>
              <span>نبذة تعريفية</span>
              <h2>بين الإنسان والمنظمة والأثر</h2>
              <p>
                هذه النبذة توضّح طريقة التفكير المهنية التي يقوم عليها العمل:
                فهم عميق للنظام، ثم تصميم منضبط، ثم قياس للأثر.
              </p>
            </div>

            <div className="ar-signature">
              لا يبدأ التطوير التنظيمي من اسم الحل، بل من فهم ما الذي يجعل
              المشكلة تتكرر داخل النظام.
            </div>
          </div>

          <div className="ar-bio-box">
            <p>
              أعمل في المساحة التي يلتقي فيها الإنسان بالمنظمة وبالاستراتيجية:
              حيث تتشكل القرارات، وتُبنى الأدوار، وتظهر الثقافة في السلوك
              اليومي، وتتحول مؤشرات الأداء إلى رسائل تنظيمية تعلّم الناس ما
              الذي يستحق الانتباه وما الذي يمكن تجاهله.
            </p>

            <p>
              منهجي لا يتعامل مع الموارد البشرية كإجراءات منعزلة، ولا مع
              التطوير التنظيمي كمبادرات عامة، ولا مع التخطيط الاستراتيجي كوثيقة
              بعيدة عن التشغيل؛ بل كمنظومة مترابطة تحتاج قراءة دقيقة قبل
              التدخل، وتصميمًا واضحًا قبل التنفيذ، وقياسًا مستمرًا قبل الحكم
              على النجاح.
            </p>
          </div>
        </section>

        <section className="ar-section">
          <div className="ar-section-head">
            <div>
              <span>منهجيتي</span>
              <h2>منهجيتي: من فهم النظام إلى أثر قابل للقياس</h2>
              <p>
                لا أبدأ من الحل، بل من قراءة النظام الذي يصنع السلوك. ثم أصمم
                تدخلًا عمليًا، وأربطه بأثر يمكن ملاحظته وقياسه.
              </p>
            </div>
          </div>

          <div className="ar-lens-grid">
            {methodologyCards.map((item, index) => (
              <article className="ar-lens" key={item.title}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ar-section">
          <div className="ar-section-head">
            <div>
              <span>مساحات العمل</span>
              <h2>من التشخيص إلى بناء القدرة</h2>
              <p>
                أتعامل مع التحديات التنظيمية كمنظومة مترابطة؛ لذلك لا تُعرض
                المجالات كقوائم منفصلة، بل كمسار يبدأ بالفهم وينتهي بقدرة
                داخلية تستطيع الاستمرار.
              </p>
            </div>
          </div>

          <div className="ar-domains-grid">
            {workDomains.map((domain, index) => (
              <article className="ar-domain" key={domain.title}>
                <div className="ar-domain-mark">{index + 1}</div>
                <div>
                  <h3>{domain.title}</h3>
                  <p>{domain.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ar-section">
          <div className="ar-section-head">
            <div>
              <span>طلب استشارة</span>
              <h2>ابدأ برسالة واضحة</h2>
              <p>
                عند الضغط على الزر، ستفتح رسالة بريد جاهزة تحتوي قالبًا مختصرًا
                يساعد على توضيح موضوع الاستشارة قبل التواصل.
              </p>
            </div>
          </div>

          <div className="ar-consultation">
            <div className="ar-consultation-copy">
              <h3>استشارة مهنية مبنية على فهم السياق</h3>
              <p>
                سواء كان التحدي مرتبطًا بتشخيص تنظيمي، تصميم أدوار وصلاحيات،
                بناء منظومة أداء، تطوير سياسات، قراءة ثقافة، أو تحويل توجه
                استراتيجي إلى تنفيذ؛ تبدأ الاستشارة من فهم السياق لا من وصفة
                جاهزة.
              </p>
            </div>

            <aside className="ar-consultation-panel">
              <strong>هل لديك تحدٍ تنظيمي يحتاج قراءة أعمق؟</strong>
              <p>
                ابدأ برسالة منظمة توضّح السياق، الهدف، والتحدي؛ لتكون نقطة
                البداية أكثر وضوحًا وفائدة.
              </p>

              <a className="ar-consultation-button" href={consultationMailto}>
                <MailIcon />
                إرسال طلب استشارة
              </a>
            </aside>
          </div>
        </section>

        <section className="ar-section">
          <div className="ar-section-head">
            <div>
              <span>أين تجدني مهنياً؟</span>
              <h2>زوايا للقراءة والتأمل المهني</h2>
              <p>
                زوايا أشاركك فيها قناعاتي وتجاربي حول هندسة السلوك، وتصميم
                التجارب، وصياغة التوجهات.
              </p>
            </div>
          </div>

          <div className="ar-social-grid">
            {socialLinks.map((link) => (
              <a
                className={`ar-social ${link.brandClass}`}
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={link.name}
              >
                <div className="ar-social-icon">{link.icon}</div>

                <div>
                  <span>{link.label}</span>
                  <h3>{link.name}</h3>
                  <p>{link.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
