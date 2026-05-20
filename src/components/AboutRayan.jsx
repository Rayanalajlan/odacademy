import { useMemo, useState } from "react";

const LOGO_SRC = "/rayan-logo.png";

const credentials = ["SHRM-SCP", "SPHRi", "CPTD", "PMP"];

const identityCards = [
  {
    title: "العدسة",
    value: "قراءة النظام قبل الحكم",
    text: "فهم السياق، والعلاقات، والحوافز، والصلاحيات، والتاريخ التنظيمي قبل تفسير المشكلة أو بناء التدخل."
  },
  {
    title: "البنية",
    value: "تحويل الغموض إلى تصميم",
    text: "توضيح الأدوار، المسؤوليات، نقاط القرار، آليات الحوكمة، ومعايير الأداء حتى يصبح العمل قابلًا للإدارة والتطوير."
  },
  {
    title: "القدرة",
    value: "بناء منظمة تتعلم",
    text: "تثبيت ممارسات تجعل المنظمة تقيس، تتعلم، تصحح، وتطوّر نفسها بدل الاعتماد على مبادرات مؤقتة."
  }
];

const systemLens = [
  {
    title: "النظام",
    text: "قراءة المنظمة كشبكة مترابطة من استراتيجية، هيكل، أدوار، عمليات، ثقافة، وحوافز."
  },
  {
    title: "السلوك",
    text: "فهم ما الذي يجعل الناس يتصرفون بهذه الطريقة داخل التصميم الحالي، لا الاكتفاء بوصف السلوك."
  },
  {
    title: "الأثر",
    text: "ربط كل تدخل بنتيجة قابلة للملاحظة والقياس، لا بمجرد نشاط أو مبادرة جميلة."
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
    description: "مقالات ونقاشات حول الإنسان، المنظمة، الأداء، وبناء القدرة.",
    icon: "in",
    url: "https://www.linkedin.com/in/rayanalajlan/",
    brandClass: "linkedin"
  },
  {
    name: "X",
    label: "الأفكار القصيرة",
    description: "ومضات مركزة حول العمل، التطوير، السلوك، والقرارات التنظيمية.",
    icon: "𝕏",
    url: "https://x.com/Rayan_Alajlan",
    brandClass: "x"
  }
];

const duaText =
  "أجمل ما قد يهديه لي العابرون بعد الفائدة: دعوة صادقة بظهر الغيب لوالديّ، وللمسلمين والمسلمات، الأحياء منهم والأموات؛ أن يشملهم الله بعفوه، ويعمّهم برضوانه.";

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
          --ink:#0f172a;
          --muted:#64748b;
          --line:rgba(148,163,184,.22);
          --gold:#b48a5a;
          --gold-deep:#7c4a20;
          --gold-light:#d6bb95;
          --gold-soft:rgba(180,138,90,.13);
          --linkedin:#0a66c2;
          --x:#000000;
          min-height:100vh;
          position:relative;
          overflow:hidden;
          padding:30px 16px 72px;
          color:var(--ink);
          background:
            radial-gradient(circle at 12% 10%, rgba(180,138,90,.18), transparent 32%),
            radial-gradient(circle at 90% 18%, rgba(79,70,229,.13), transparent 30%),
            radial-gradient(circle at 45% 92%, rgba(16,185,129,.10), transparent 34%),
            linear-gradient(135deg,#f8fafc 0%,#fffaf3 46%,#eef2ff 100%);
        }

        .about-rayan * { box-sizing:border-box; }

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
            radial-gradient(circle at 14% 20%, rgba(214,187,149,.26), transparent 32%),
            linear-gradient(135deg,#0f172a,#1e293b 58%,#111827);
          box-shadow:0 30px 90px rgba(15,23,42,.22);
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
          color:#fde68a;
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
          background:linear-gradient(90deg,#fff,#fde68a,#d6bb95);
          -webkit-background-clip:text;
          background-clip:text;
        }

        .ar-lead {
          margin:0;
          max-width:820px;
          color:rgba(226,232,240,.88);
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
          color:#fde68a;
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
          border-radius:18px;
          padding:13px 18px;
          font-size:13px;
          font-weight:950;
          transition:.24s ease;
        }

        .ar-primary-action {
          color:#111827;
          background:linear-gradient(135deg,#fde68a,#f59e0b);
          box-shadow:0 18px 42px rgba(245,158,11,.20);
        }

        .ar-secondary-action {
          color:white;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.16);
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
            inset 0 0 0 1px rgba(180,138,90,.10),
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
          border:12px solid rgba(180,138,90,.42);
          border-radius:999px;
          background:white;
        }

        .ar-section {
          margin-top:20px;
          border-radius:34px;
          padding:26px;
          background:rgba(255,255,255,.84);
          border:1px solid rgba(255,255,255,.94);
          box-shadow:0 22px 60px rgba(15,23,42,.08);
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
          background:linear-gradient(135deg,#0f172a,#334155);
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
          box-shadow:0 16px 44px rgba(15,23,42,.06);
        }

        .ar-bio-box {
          border-radius:28px;
          padding:22px;
        }

        .ar-bio-box p {
          margin:0;
          color:#1e293b;
          font-size:15px;
          line-height:2.15;
          font-weight:700;
        }

        .ar-bio-box p + p { margin-top:14px; }

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
          color:#78350f;
          background:#fffbeb;
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
            radial-gradient(circle at 20% 20%, rgba(253,230,138,.20), transparent 34%),
            linear-gradient(150deg,#0f172a,#1e293b);
          box-shadow:0 24px 60px rgba(15,23,42,.16);
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
          color:#fde68a;
        }

        .ar-lens p {
          margin:0;
          color:rgba(226,232,240,.88);
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
          background:linear-gradient(150deg,#0f172a,#1e293b);
          box-shadow:0 20px 52px rgba(15,23,42,.16);
        }

        .ar-consultation-panel small {
          display:block;
          color:#fde68a;
          font-size:12px;
          font-weight:950;
          margin-bottom:10px;
        }

        .ar-consultation-panel strong {
          display:block;
          font-size:18px;
          line-height:1.6;
          font-weight:950;
          margin-bottom:14px;
        }

        .ar-consultation-button {
          text-decoration:none;
          display:flex;
          align-items:center;
          justify-content:center;
          width:100%;
          min-height:48px;
          border-radius:18px;
          color:#111827;
          background:linear-gradient(135deg,#fde68a,#f59e0b);
          font-size:13px;
          font-weight:950;
          transition:.24s ease;
        }

        .ar-consultation-button:hover { transform:translateY(-3px); }

        .ar-dua-card {
          position:relative;
          overflow:hidden;
          border-radius:34px;
          padding:28px;
          background:
            radial-gradient(circle at top left, rgba(180,138,90,.18), transparent 34%),
            linear-gradient(135deg,#ffffff,#fffbeb);
        }

        .ar-dua-card::before {
          content:"";
          position:absolute;
          top:-90px;
          left:-90px;
          width:220px;
          height:220px;
          border-radius:999px;
          background:rgba(180,138,90,.14);
        }

        .ar-dua-card span {
          position:relative;
          z-index:1;
          display:inline-flex;
          margin-bottom:10px;
          color:#92400e;
          font-size:12px;
          font-weight:950;
        }

        .ar-dua-card p {
          position:relative;
          z-index:1;
          margin:0;
          color:#78350f;
          font-size:18px;
          line-height:2.15;
          font-weight:900;
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
          box-shadow:0 24px 56px rgba(15,23,42,.10);
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

        .ar-social.linkedin .ar-social-icon { background:var(--linkedin); }
        .ar-social.x .ar-social-icon { background:var(--x); }
        .ar-social.linkedin span { color:var(--linkedin); }
        .ar-social.x span { color:#111827; }

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

        @media (max-width:980px) {
          .ar-hero-inner,
          .ar-identity-grid,
          .ar-lens-grid,
          .ar-domains-grid,
          .ar-social-grid,
          .ar-consultation {
            grid-template-columns:1fr;
          }

          .ar-section-head { display:block; }

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
          .about-rayan { padding:16px 10px 44px; }

          .ar-hero,
          .ar-section {
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
              <h2>الفهم أولًا، ثم التصميم، ثم الأثر</h2>
              <p>
                لا أبدأ من اسم الحل؛ أبدأ من السؤال الأهم: ما الذي يجعل هذا
                السلوك منطقيًا داخل هذا النظام؟ عندما يتضح النظام، يصبح التدخل
                أكثر دقة، وأقل ضجيجًا، وأقرب للأثر الحقيقي.
              </p>
            </div>
          </div>

          <div className="ar-identity-grid">
            {identityCards.map((card, index) => (
              <article className="ar-card" key={card.title}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <h3>{card.title}</h3>
                <strong>{card.value}</strong>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ar-section">
          <div className="ar-section-head">
            <div>
              <span>الرسم التشخيصي</span>
              <h2>النظام، السلوك، الأثر</h2>
              <p>
                هذه ليست كلمات جانبية؛ بل عدسات رئيسية لقراءة أي تحدٍ تنظيمي.
                فالسلوك لا يظهر في فراغ، والأثر لا يُصنع بمجرد إعلان مبادرة.
              </p>
            </div>
          </div>

          <div className="ar-lens-grid">
            {systemLens.map((item, index) => (
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
              <small>البريد المعتمد</small>
              <strong>Rayansalajlan@gmail.com</strong>

              <a className="ar-consultation-button" href={consultationMailto}>
                فتح قالب طلب الاستشارة
              </a>
            </aside>
          </div>
        </section>

        <section className="ar-section">
          <div className="ar-dua-card">
            <span>طلب دعاء</span>
            <p>{duaText}</p>
          </div>
        </section>

        <section className="ar-section">
          <div className="ar-section-head">
            <div>
              <span>الحضور المهني</span>
              <h2>تابع الأفكار والنقاشات</h2>
              <p>
                مساحات أشارك فيها قراءات مهنية حول الإنسان، الأداء، التعلم،
                التصميم، والقدرة التنظيمية.
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