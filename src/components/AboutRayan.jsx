import React, { useMemo } from "react";

const CONTACT_EMAIL = "rayan.al.ajlan123@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/";
const X_URL = "https://x.com/";

export default function AboutRayan() {
  const mailHref = useMemo(() => {
    const subject = "طلب استشارة مهنية";
    const body = `الأستاذ ريان العجلان المحترم،

السلام عليكم ورحمة الله وبركاته،

أرغب في التواصل معكم بخصوص طلب استشارة مهنية، وفيما يلي ملخص مبدئي:

1. الجهة / المجال:
[اكتب اسم الجهة أو المجال]

2. التحدي الحالي:
[اشرح التحدي أو المشكلة باختصار]

3. الهدف المطلوب:
[ما النتيجة التي ترغب في الوصول إليها؟]

4. نطاق الاستشارة:
[موارد بشرية / تطوير تنظيمي / تخطيط استراتيجي / سياسات / أداء / أدوار وصلاحيات / غير ذلك]

5. الموعد المناسب للتواصل:
[اكتب الأيام أو الأوقات المناسبة]

شاكرًا لكم،
[اسمك]
[رقم التواصل إن رغبت]`;

    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, []);

  return (
    <section className="about-rayan-page" dir="rtl">
      <style>{`
        .about-rayan-page {
          --ink: #0f172a;
          --muted: #64748b;
          --soft: rgba(255, 255, 255, 0.78);
          --line: rgba(148, 163, 184, 0.22);
          --gold: #d6a84f;
          --gold-2: #f5d27a;
          --navy: #111827;
          --blue: #0a66c2;
          --x: #000000;
          --emerald: #10b981;
          --violet: #7c3aed;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 34px 16px 74px;
          color: var(--ink);
          background:
            radial-gradient(circle at 12% 10%, rgba(214,168,79,.18), transparent 32%),
            radial-gradient(circle at 86% 14%, rgba(124,58,237,.15), transparent 30%),
            radial-gradient(circle at 52% 90%, rgba(16,185,129,.12), transparent 32%),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 48%, #f8fafc 100%);
        }

        .about-rayan-page::before {
          content: "";
          position: absolute;
          width: 760px;
          height: 760px;
          border-radius: 999px;
          top: -430px;
          right: -360px;
          background:
            conic-gradient(from 180deg, rgba(214,168,79,.22), rgba(15,23,42,.08), rgba(124,58,237,.16), rgba(214,168,79,.22));
          filter: blur(20px);
          opacity: .75;
          animation: arFloat 14s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .about-rayan-page::after {
          content: "";
          position: absolute;
          width: 640px;
          height: 640px;
          border-radius: 999px;
          bottom: -390px;
          left: -300px;
          background:
            conic-gradient(from 45deg, rgba(16,185,129,.14), rgba(10,102,194,.16), rgba(214,168,79,.16), rgba(16,185,129,.14));
          filter: blur(18px);
          opacity: .72;
          animation: arFloat 16s ease-in-out infinite alternate-reverse;
          pointer-events: none;
        }

        @keyframes arFloat {
          from { transform: translate3d(0,0,0) rotate(0deg); }
          to { transform: translate3d(28px,34px,0) rotate(16deg); }
        }

        .ar-wrap {
          position: relative;
          z-index: 1;
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .ar-hero {
          position: relative;
          overflow: hidden;
          border-radius: 42px;
          padding: 34px;
          color: white;
          border: 1px solid rgba(255,255,255,.16);
          background:
            radial-gradient(circle at 78% 18%, rgba(214,168,79,.32), transparent 32%),
            radial-gradient(circle at 20% 80%, rgba(124,58,237,.22), transparent 34%),
            linear-gradient(135deg, #0f172a 0%, #111827 52%, #1f2937 100%);
          box-shadow: 0 28px 90px rgba(15,23,42,.22);
        }

        .ar-hero::before {
          content: "";
          position: absolute;
          inset: -40%;
          background-image:
            linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
          background-size: 44px 44px;
          opacity: .44;
          transform: rotate(-8deg);
        }

        .ar-hero::after {
          content: "النظام ← السلوك ← الأثر";
          position: absolute;
          left: 28px;
          bottom: 28px;
          padding: 10px 16px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.16);
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.74);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .02em;
          backdrop-filter: blur(14px);
        }

        .ar-hero-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 28px;
          align-items: center;
        }

        .ar-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          padding: 9px 14px;
          border-radius: 999px;
          color: #fde68a;
          font-size: 12px;
          font-weight: 950;
          background: rgba(214,168,79,.14);
          border: 1px solid rgba(214,168,79,.22);
        }

        .ar-title {
          margin: 18px 0 12px;
          font-size: clamp(34px, 6vw, 72px);
          line-height: 1.05;
          letter-spacing: -1.8px;
          font-weight: 950;
        }

        .ar-title span {
          display: block;
          background: linear-gradient(90deg, #fff, #fde68a, #c7d2fe);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .ar-subtitle {
          max-width: 760px;
          margin: 0;
          color: rgba(226,232,240,.88);
          font-size: 16px;
          line-height: 2.05;
          font-weight: 750;
        }

        .ar-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .ar-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 48px;
          padding: 12px 18px;
          border-radius: 18px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 950;
          transition: .25s ease;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .ar-btn:hover {
          transform: translateY(-3px);
        }

        .ar-btn-mail {
          color: #111827;
          background: linear-gradient(135deg, #fde68a, #d6a84f);
          box-shadow: 0 18px 38px rgba(214,168,79,.22);
        }

        .ar-btn-linkedin {
          color: #ffffff;
          background: linear-gradient(135deg, #0a66c2, #004182);
          box-shadow: 0 18px 38px rgba(10,102,194,.24);
        }

        .ar-btn-x {
          color: #ffffff;
          background: linear-gradient(135deg, #000000, #27272a);
          box-shadow: 0 18px 38px rgba(0,0,0,.22);
        }

        .ar-btn-outline {
          color: #f8fafc;
          border-color: rgba(255,255,255,.18);
          background: rgba(255,255,255,.08);
          backdrop-filter: blur(12px);
        }

        .ar-identity-card {
          position: relative;
          min-height: 420px;
          border-radius: 38px;
          padding: 22px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.14);
          backdrop-filter: blur(18px);
          overflow: hidden;
        }

        .ar-identity-card::before {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 999px;
          top: -80px;
          left: -70px;
          background: radial-gradient(circle, rgba(214,168,79,.34), transparent 68%);
        }

        .ar-logo-stage {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 250px;
        }

        .ar-logo-orbit {
          position: relative;
          width: 230px;
          height: 230px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            radial-gradient(circle at 38% 30%, rgba(255,255,255,.95), rgba(255,255,255,.42) 22%, rgba(214,168,79,.20) 44%, rgba(15,23,42,.12) 70%),
            conic-gradient(from 140deg, rgba(214,168,79,.9), rgba(255,255,255,.38), rgba(124,58,237,.55), rgba(214,168,79,.9));
          box-shadow:
            inset 0 0 34px rgba(255,255,255,.35),
            0 30px 80px rgba(0,0,0,.22);
          animation: arPulse 5s ease-in-out infinite;
        }

        .ar-logo-orbit::before {
          content: "";
          position: absolute;
          width: 310px;
          height: 76px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.28);
          transform: rotate(-18deg);
        }

        .ar-logo-orbit::after {
          content: "";
          position: absolute;
          inset: 17px;
          border-radius: inherit;
          border: 1px solid rgba(255,255,255,.30);
        }

        @keyframes arPulse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }

        .ar-monogram {
          position: relative;
          z-index: 2;
          width: 150px;
          height: 150px;
          border-radius: 36px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.96);
          box-shadow: 0 22px 60px rgba(15,23,42,.24);
          padding: 10px;
        }

        .ar-monogram img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .ar-identity-lines {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .ar-id-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 18px;
          background: rgba(255,255,255,.09);
          border: 1px solid rgba(255,255,255,.12);
        }

        .ar-id-line span {
          color: rgba(226,232,240,.75);
          font-size: 11px;
          font-weight: 900;
        }

        .ar-id-line strong {
          color: #fff;
          font-size: 12px;
          font-weight: 950;
          text-align: left;
        }

        .ar-section-grid {
          display: grid;
          grid-template-columns: .9fr 1.1fr;
          gap: 18px;
          margin-top: 18px;
        }

        .ar-card {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 24px;
          background: rgba(255,255,255,.80);
          border: 1px solid rgba(255,255,255,.92);
          backdrop-filter: blur(20px);
          box-shadow: 0 22px 60px rgba(15,23,42,.08);
        }

        .ar-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 92% 8%, rgba(214,168,79,.14), transparent 28%),
            radial-gradient(circle at 10% 92%, rgba(124,58,237,.08), transparent 32%);
        }

        .ar-card > * {
          position: relative;
          z-index: 1;
        }

        .ar-card-kicker {
          display: inline-flex;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(214,168,79,.14);
          color: #92400e;
          font-size: 11px;
          font-weight: 950;
          margin-bottom: 12px;
        }

        .ar-card h2 {
          margin: 0 0 12px;
          color: #0f172a;
          font-size: clamp(22px, 3vw, 34px);
          line-height: 1.3;
          letter-spacing: -.7px;
          font-weight: 950;
        }

        .ar-card h2 span {
          color: #b7791f;
        }

        .ar-card p {
          margin: 0;
          color: #475569;
          font-size: 14px;
          line-height: 2.05;
          font-weight: 750;
        }

        .ar-philosophy {
          min-height: 100%;
          background:
            linear-gradient(145deg, rgba(255,255,255,.92), rgba(255,251,235,.80));
        }

        .ar-philosophy-quote {
          margin-top: 18px;
          padding: 18px;
          border-radius: 24px;
          background: #0f172a;
          color: #f8fafc;
          line-height: 2;
          font-size: 13px;
          font-weight: 850;
          box-shadow: 0 18px 40px rgba(15,23,42,.15);
        }

        .ar-domains {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .ar-domain {
          min-height: 142px;
          padding: 16px;
          border-radius: 24px;
          background: rgba(248,250,252,.92);
          border: 1px solid rgba(148,163,184,.22);
          transition: .25s ease;
        }

        .ar-domain:hover {
          transform: translateY(-4px);
          border-color: rgba(214,168,79,.38);
          box-shadow: 0 18px 36px rgba(15,23,42,.08);
        }

        .ar-domain b {
          display: block;
          color: #0f172a;
          font-size: 15px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .ar-domain span {
          display: block;
          color: #64748b;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 750;
        }

        .ar-credentials {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .ar-credential {
          position: relative;
          overflow: hidden;
          min-height: 118px;
          border-radius: 26px;
          padding: 16px;
          display: grid;
          align-content: space-between;
          background:
            linear-gradient(145deg, #0f172a, #1f2937);
          color: white;
          box-shadow: 0 20px 48px rgba(15,23,42,.13);
        }

        .ar-credential::before {
          content: "";
          position: absolute;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          top: -62px;
          left: -52px;
          background: radial-gradient(circle, rgba(214,168,79,.34), transparent 66%);
        }

        .ar-credential strong {
          position: relative;
          z-index: 1;
          font-size: 23px;
          font-weight: 950;
          letter-spacing: .04em;
        }

        .ar-credential span {
          position: relative;
          z-index: 1;
          color: rgba(226,232,240,.82);
          font-size: 11px;
          line-height: 1.7;
          font-weight: 850;
        }

        .ar-method {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .ar-step {
          position: relative;
          min-height: 165px;
          border-radius: 28px;
          padding: 18px;
          overflow: hidden;
          background: rgba(255,255,255,.84);
          border: 1px solid rgba(148,163,184,.22);
          box-shadow: 0 18px 42px rgba(15,23,42,.06);
        }

        .ar-step::before {
          content: attr(data-step);
          position: absolute;
          top: 12px;
          left: 14px;
          color: rgba(15,23,42,.10);
          font-size: 54px;
          line-height: 1;
          font-weight: 950;
        }

        .ar-step strong {
          display: block;
          color: #0f172a;
          font-size: 16px;
          font-weight: 950;
          margin-bottom: 10px;
        }

        .ar-step span {
          display: block;
          color: #64748b;
          font-size: 12px;
          line-height: 1.95;
          font-weight: 750;
        }

        .ar-contact {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        .ar-contact-card {
          border-radius: 34px;
          padding: 26px;
          background:
            radial-gradient(circle at 90% 10%, rgba(10,102,194,.13), transparent 28%),
            linear-gradient(145deg, rgba(255,255,255,.88), rgba(238,242,255,.84));
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 22px 60px rgba(15,23,42,.08);
        }

        .ar-contact-card h2 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: clamp(24px, 3vw, 38px);
          line-height: 1.25;
          font-weight: 950;
          letter-spacing: -.8px;
        }

        .ar-contact-card p {
          margin: 0;
          color: #475569;
          font-size: 14px;
          line-height: 2.05;
          font-weight: 750;
          max-width: 880px;
        }

        .ar-contact-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        .ar-social-strip {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 16px;
        }

        .ar-social {
          min-height: 92px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px;
          border-radius: 24px;
          text-decoration: none;
          transition: .25s ease;
          color: white;
          overflow: hidden;
          position: relative;
        }

        .ar-social:hover {
          transform: translateY(-4px);
        }

        .ar-social::before {
          content: "";
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 999px;
          top: -90px;
          left: -70px;
          background: rgba(255,255,255,.16);
        }

        .ar-social-linkedin {
          background: linear-gradient(135deg, #0a66c2, #003e7e);
          box-shadow: 0 20px 44px rgba(10,102,194,.22);
        }

        .ar-social-x {
          background: linear-gradient(135deg, #000, #27272a);
          box-shadow: 0 20px 44px rgba(0,0,0,.22);
        }

        .ar-social strong,
        .ar-social span,
        .ar-social b {
          position: relative;
          z-index: 1;
        }

        .ar-social strong {
          font-size: 16px;
          font-weight: 950;
        }

        .ar-social span {
          display: block;
          margin-top: 5px;
          color: rgba(255,255,255,.76);
          font-size: 11px;
          font-weight: 850;
        }

        .ar-social b {
          width: 44px;
          height: 44px;
          border-radius: 17px;
          display: grid;
          place-items: center;
          font-size: 18px;
          font-weight: 950;
          background: rgba(255,255,255,.16);
          border: 1px solid rgba(255,255,255,.18);
        }

        .ar-footer-note {
          margin-top: 18px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
          font-weight: 850;
          line-height: 1.8;
        }

        @media (max-width: 1020px) {
          .ar-hero-grid,
          .ar-section-grid {
            grid-template-columns: 1fr;
          }

          .ar-identity-card {
            min-height: auto;
          }

          .ar-method,
          .ar-credentials {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 680px) {
          .about-rayan-page {
            padding: 18px 10px 48px;
          }

          .ar-hero,
          .ar-card,
          .ar-contact-card {
            border-radius: 28px;
            padding: 20px;
          }

          .ar-hero::after {
            position: relative;
            display: inline-flex;
            left: auto;
            bottom: auto;
            margin-top: 18px;
          }

          .ar-logo-orbit {
            width: 190px;
            height: 190px;
          }

          .ar-logo-orbit::before {
            width: 250px;
            height: 62px;
          }

          .ar-monogram {
            width: 124px;
            height: 124px;
            border-radius: 28px;
          }

          .ar-domains,
          .ar-method,
          .ar-credentials,
          .ar-social-strip {
            grid-template-columns: 1fr;
          }

          .ar-hero-actions,
          .ar-contact-actions {
            flex-direction: column;
          }

          .ar-btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="ar-wrap">
        <header className="ar-hero">
          <div className="ar-hero-grid">
            <div>
              <span className="ar-kicker">عن المصمم · ريان العجلان</span>

              <h1 className="ar-title">
                أقرأ المنظمة
                <span>قبل أن أقترح الحل</span>
              </h1>

              <p className="ar-subtitle">
                متخصص موارد بشرية ومستشار في التطوير التنظيمي والتخطيط الاستراتيجي،
                أعمل على تحويل تحديات المنظمات إلى نماذج واضحة في التشخيص، الأدوار،
                الصلاحيات، الأداء، والثقافة؛ بحيث يرى القائد النظام قبل أن يصدر الحكم.
              </p>

              <div className="ar-hero-actions">
                <a className="ar-btn ar-btn-mail" href={mailHref}>
                  📧 تواصل عبر البريد المهني
                </a>

                <a className="ar-btn ar-btn-linkedin" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                  LinkedIn · لينكدإن
                </a>

                <a className="ar-btn ar-btn-x" href={X_URL} target="_blank" rel="noreferrer">
                  X · منصة إكس
                </a>

                <a className="ar-btn ar-btn-outline" href="#rayan-method">
                  استكشف المنهجية
                </a>
              </div>
            </div>

            <aside className="ar-identity-card" aria-label="بطاقة هوية ريان المهنية">
              <div className="ar-logo-stage">
                <div className="ar-logo-orbit">
                  <div className="ar-monogram">
                    <img src="/rayan-logo.png" alt="شعار ريان العجلان" />
                  </div>
                </div>
              </div>

              <div className="ar-identity-lines">
                <div className="ar-id-line">
                  <span>المجال</span>
                  <strong>الموارد البشرية · التطوير التنظيمي · التخطيط الاستراتيجي</strong>
                </div>

                <div className="ar-id-line">
                  <span>طريقة العمل</span>
                  <strong>تشخيص النظام ثم بناء الحل</strong>
                </div>

                <div className="ar-id-line">
                  <span>التركيز</span>
                  <strong>الأثر · السلوك · القدرة التنظيمية</strong>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <section className="ar-section-grid">
          <article className="ar-card ar-philosophy">
            <span className="ar-card-kicker">الفلسفة التنظيمية</span>

            <h2>
              لا أحاكم السلوك
              <span> قبل أن أقرأ النظام.</span>
            </h2>

            <p>
              في كل منظمة توجد سلوكيات تبدو فردية، لكنها في الحقيقة رسائل من التصميم الداخلي للمنظمة.
              قد يكشف التأخر غموضًا في الصلاحيات، وقد يكشف الصمت خوفًا من العقوبة، وقد يكشف ضعف التعاون
              أن المؤشرات تكافئ الانعزال.
            </p>

            <div className="ar-philosophy-quote">
              لذلك أتعامل مع المنظمة كمنظومة مترابطة: أقرأ ما يحدث، ثم أبحث عن القاعدة الخفية التي تجعله يتكرر.
            </div>
          </article>

          <article className="ar-card">
            <span className="ar-card-kicker">مجالات العمل</span>

            <h2>
              من الفكرة الإدارية
              <span> إلى نظام قابل للتطبيق</span>
            </h2>

            <p>
              لا أتعامل مع الاستشارة كمجموعة نصائح عامة، بل كعملية قراءة دقيقة للسياق، ثم تحويله إلى أدوات وقرارات
              وممارسات يمكن قياسها وتطويرها.
            </p>

            <div className="ar-domains">
              <div className="ar-domain">
                <b>استشارات الموارد البشرية</b>
                <span>سياسات، أطر عمل، أدوار، صلاحيات، أداء، كفاءات، ومسارات تطوير.</span>
              </div>

              <div className="ar-domain">
                <b>التطوير التنظيمي</b>
                <span>تشخيص المنظمات، قراءة الثقافة، تصميم التدخلات، وبناء القدرة المؤسسية.</span>
              </div>

              <div className="ar-domain">
                <b>التخطيط الاستراتيجي</b>
                <span>تحويل التوجهات الكبرى إلى أهداف، مبادرات، مؤشرات، وحوكمة متابعة.</span>
              </div>

              <div className="ar-domain">
                <b>بناء الأداء المؤسسي</b>
                <span>ربط السلوك، المسؤولية، القياس، والتعلم المستمر بنتائج واضحة.</span>
              </div>
            </div>
          </article>
        </section>

        <section className="ar-card" style={{ marginTop: 18 }}>
          <span className="ar-card-kicker">الاعتمادات الاستشارية والمهنية الدولية</span>

          <h2>
            مزيج بين الموارد البشرية
            <span> والتعلم والأداء والقيادة المهنية</span>
          </h2>

          <p>
            الاعتمادات ليست للعرض فقط، بل لتكوين عقل مهني يجمع بين فهم الإنسان، النظام، الأداء، التطوير، والمنهجية.
          </p>

          <div className="ar-credentials">
            <div className="ar-credential">
              <strong>SHRM-SCP</strong>
              <span>اعتماد مهني متقدم في الموارد البشرية الاستراتيجية.</span>
            </div>

            <div className="ar-credential">
              <strong>SPHRi</strong>
              <span>اعتماد دولي في ممارسات الموارد البشرية والسياسات.</span>
            </div>

            <div className="ar-credential">
              <strong>CPTD</strong>
              <span>اعتماد متخصص في تطوير المواهب والتعلم والأداء.</span>
            </div>

            <div className="ar-credential">
              <strong>PMP</strong>
              <span>اعتماد مهني في إدارة المبادرات وتنظيم التنفيذ والحوكمة.</span>
            </div>
          </div>
        </section>

        <section id="rayan-method" className="ar-card" style={{ marginTop: 18 }}>
          <span className="ar-card-kicker">منهجية العمل</span>

          <h2>
            أربع عدسات
            <span> قبل أي توصية</span>
          </h2>

          <p>
            قبل اقتراح أي حل، أقرأ الحالة عبر أربع عدسات مترابطة؛ لأن الحل الذي لا يفهم السياق قد يزيد المشكلة بدل أن يعالجها.
          </p>

          <div className="ar-method">
            <div className="ar-step" data-step="01">
              <strong>تشخيص العرض</strong>
              <span>ما الذي يظهر على السطح؟ انخفاض أداء، غموض أدوار، ضعف تعاون، بطء قرار، أو مقاومة تغيير.</span>
            </div>

            <div className="ar-step" data-step="02">
              <strong>قراءة النظام</strong>
              <span>ما الهيكل، المؤشر، الصلاحية، الثقافة، أو طريقة القيادة التي تجعل السلوك يتكرر؟</span>
            </div>

            <div className="ar-step" data-step="03">
              <strong>تصميم التدخل</strong>
              <span>اختيار تدخل مناسب: سياسة، دور، صلاحية، حوكمة، ثقافة، أداء، تعلم، أو قيادة تغيير.</span>
            </div>

            <div className="ar-step" data-step="04">
              <strong>قياس الأثر</strong>
              <span>لا يكفي إطلاق الحل؛ يجب قياس التبني، السلوك، الأثر، والاستدامة بعد التنفيذ.</span>
            </div>
          </div>
        </section>

        <section className="ar-contact">
          <div className="ar-contact-card">
            <h2>للاستشارات وتبادل الفكر</h2>

            <p>
              للتواصل حول استشارات الموارد البشرية، التطوير التنظيمي، التخطيط الاستراتيجي، بناء السياسات،
              تطوير الأداء، تصميم الأدوار والصلاحيات، أو مناقشة تحديات مؤسسية تحتاج قراءة مهنية أعمق.
            </p>

            <div className="ar-contact-actions">
              <a className="ar-btn ar-btn-mail" href={mailHref}>
                📧 افتح رسالة بريد جاهزة
              </a>

              <a className="ar-btn ar-btn-linkedin" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                تابعني على LinkedIn
              </a>

              <a className="ar-btn ar-btn-x" href={X_URL} target="_blank" rel="noreferrer">
                تابعني على X
              </a>
            </div>

            <div className="ar-social-strip">
              <a className="ar-social ar-social-linkedin" href={LINKEDIN_URL} target="_blank" rel="noreferrer">
                <div>
                  <strong>LinkedIn</strong>
                  <span>مساحة للنقاش المهني والمحتوى المؤسسي</span>
                </div>
                <b>in</b>
              </a>

              <a className="ar-social ar-social-x" href={X_URL} target="_blank" rel="noreferrer">
                <div>
                  <strong>منصة X</strong>
                  <span>أفكار قصيرة حول الموارد، التطوير، والمنظمات</span>
                </div>
                <b>𝕏</b>
              </a>
            </div>
          </div>
        </section>

        <div className="ar-footer-note">
          ريان العجلان · موارد بشرية · تطوير تنظيمي · تخطيط استراتيجي · بناء قدرة مؤسسية
        </div>
      </div>
    </section>
  );
}