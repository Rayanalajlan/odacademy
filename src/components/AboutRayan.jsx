import { useState } from "react";

const LOGO_SRC = "/rayan-logo.png";

const identityCards = [
  {
    title: "العدسة",
    value: "قراءة النظام قبل الحكم",
    text: "فهم السياق، العلاقات، الحوافز، الصلاحيات، والتاريخ التنظيمي قبل القفز إلى أي حل."
  },
  {
    title: "البنية",
    value: "تحويل الغموض إلى تصميم",
    text: "توضيح الأدوار، المسؤوليات، الحوكمة، آليات القرار، ومعايير الأداء بطريقة تجعل العمل قابلاً للإدارة والتطوير."
  },
  {
    title: "القدرة",
    value: "بناء منظمة تتعلم",
    text: "تثبيت ممارسات تجعل المنظمة تقيس، تتعلم، تصحح، وتطوّر نفسها بدل الاعتماد على حلول مؤقتة."
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
    title: "تشخيص المنظمة",
    text: "قراءة الأعراض، الأنماط، الفرضيات، ومصادر البيانات للوصول إلى فهم مهني قبل اختيار التدخل."
  },
  {
    title: "تصميم العمل والحوكمة",
    text: "بناء وضوح الأدوار، الصلاحيات، نقاط القرار، التداخلات، ومصفوفات المسؤولية بما يخدم الهدف لا الشكل."
  },
  {
    title: "منظومة الأداء والتعلم",
    text: "تحويل الأداء من متابعة أرقام منفصلة إلى نظام يربط المسؤولية، السلوك، التغذية الراجعة، والتطور المستمر."
  },
  {
    title: "التحول وبناء القدرة",
    text: "تصميم تدخلات تساعد المنظمة على تبنّي التغيير، تثبيت الممارسات، وبناء قدرة داخلية قابلة للاستمرار."
  }
];

const socialLinks = [
  {
    name: "LinkedIn",
    label: "المساحة المهنية",
    description: "مقالات، تأملات، ونقاشات حول الإنسان والمنظمة وبناء القدرة.",
    icon: "in",
    url: "https://www.linkedin.com/in/rayanalajlan/"
  },
  {
    name: "X",
    label: "الأفكار القصيرة",
    description: "ومضات مركزة حول العمل، الأداء، التطوير، والسلوك التنظيمي.",
    icon: "𝕏",
    url: "https://x.com/Rayan_Alajlan"
  }
];

export default function AboutRayan() {
  const [logoLoaded, setLogoLoaded] = useState(true);

  return (
    <section className="about-rayan" dir="rtl">
      <style>{`
        .about-rayan {
          --ink:#0f172a;
          --muted:#64748b;
          --soft:#f8fafc;
          --line:rgba(148,163,184,.22);
          --gold:#b48a5a;
          --gold-light:#d6bb95;
          --gold-soft:rgba(180,138,90,.13);
          --primary:#4f46e5;
          --green:#10b981;
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
          background:
            radial-gradient(circle at 14% 20%, rgba(214,187,149,.26), transparent 32%),
            linear-gradient(135deg,#0f172a,#1e293b 58%,#111827);
          box-shadow:0 30px 90px rgba(15,23,42,.22);
          color:white;
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
          max-width:780px;
          color:rgba(226,232,240,.88);
          font-size:16px;
          line-height:2.15;
          font-weight:700;
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
          background:rgba(255,255,255,.82);
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
          max-width:760px;
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
          max-width:290px;
        }

        .ar-identity-grid {
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
          background:white;
          border:1px solid var(--line);
          box-shadow:0 16px 44px rgba(15,23,42,.07);
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

        .ar-card h3 {
          position:relative;
          z-index:1;
          margin:0 0 8px;
          color:var(--ink);
          font-size:18px;
          line-height:1.45;
          font-weight:950;
        }

        .ar-card strong {
          position:relative;
          z-index:1;
          display:block;
          color:var(--gold);
          font-size:14px;
          line-height:1.7;
          font-weight:950;
          margin-bottom:10px;
        }

        .ar-card p {
          position:relative;
          z-index:1;
          margin:0;
          color:var(--muted);
          font-size:13px;
          line-height:1.95;
          font-weight:700;
        }

        .ar-lens-grid {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:16px;
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

        .ar-domains-grid {
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
          background:white;
          border:1px solid var(--line);
          box-shadow:0 14px 38px rgba(15,23,42,.06);
        }

        .ar-domain-mark {
          width:54px;
          height:54px;
          display:grid;
          place-items:center;
          border-radius:20px;
          color:white;
          background:linear-gradient(135deg,var(--gold),#7c4a20);
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

        .ar-social-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:14px;
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
          background:white;
          border:1px solid var(--line);
          box-shadow:0 16px 42px rgba(15,23,42,.07);
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
          background:#0f172a;
          font-size:22px;
          font-weight:950;
        }

        .ar-social span {
          display:block;
          color:var(--gold);
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
          .ar-social-grid {
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
                أعمل عند تقاطع الإنسان والمنظمة والاستراتيجية؛ حيث لا تكفي
                المبادرات المنفصلة ولا الشعارات العامة لصناعة أثر مستدام.
                أتعامل مع المنظمة بوصفها نظامًا حيًا: تتداخل فيه القرارات،
                الأدوار، الصلاحيات، الثقافة، التعلم، الأداء، وتجربة الإنسان.
                لذلك يبدأ عملي من فهم ما يحدث فعلًا داخل النظام، ثم تحويل هذا
                الفهم إلى وضوح في التصميم، وانضباط في التنفيذ، وقدرة قابلة
                للنمو والاستمرار.
              </p>
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
              <span>منهجيتي</span>
              <h2>الفهم أولًا، ثم التصميم، ثم الأثر</h2>
              <p>
                لا أبدأ من اسم الحل؛ أبدأ من السؤال الأهم: ما الذي يجعل هذا
                السلوك منطقيًا داخل هذا النظام؟ عندما يتضح النظام، يصبح التدخل
                أكثر دقة، وأقل ضجيجًا، وأقرب للأثر الحقيقي.
              </p>
            </div>

            <div className="ar-signature">
              ممارستي تقوم على تحويل الغموض التنظيمي إلى قراءة واضحة، ثم إلى
              تصميم قابل للتطبيق والقياس.
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
                className="ar-social"
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
