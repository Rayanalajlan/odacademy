import { useMemo, useState } from "react";

const CONTACT_EMAIL = "rayan.al.ajlan123@gmail.com";

/*
  عدّل هذه الروابط فقط:
  - ضع رابط لينكدإن الحقيقي بدل #
  - ضع رابط X / تويتر الحقيقي بدل #
*/
const LINKEDIN_URL = "#";
const X_URL = "#";

const credentials = [
  "SHRM-SCP",
  "SPHRi",
  "CPTD",
  "PMP"
];

const specialtyCards = [
  {
    title: "هندسة التطوير التنظيمي",
    text: "تحويل التشخيص إلى تصميم مؤسسي واضح: هيكل، أدوار، صلاحيات، مؤشرات، وسلوكيات قابلة للقياس.",
    icon: "✦"
  },
  {
    title: "الأداء والحوكمة",
    text: "ربط الأداء بالاستراتيجية، وتفكيك التداخلات، وتصميم مساءلة عادلة لا تعتمد على الانطباع.",
    icon: "◎"
  },
  {
    title: "الثقافة والتغيير",
    text: "قراءة ما وراء الشعارات: ما الذي يُكافأ؟ ما الذي يُخاف منه؟ وما السلوك الذي ينتجه النظام؟",
    icon: "◈"
  },
  {
    title: "الأوصاف والكفاءات",
    text: "بناء أدوار ووثائق وظيفية لا تبقى في الأرشيف، بل تدخل في التوظيف، الأداء، التعلم، والمسارات.",
    icon: "▧"
  }
];

const thinkingPrinciples = [
  "لا أتعامل مع العرض كأنه السبب.",
  "لا أبدأ بالتدريب إذا كانت المشكلة في التصميم.",
  "لا أعالج الثقافة بالشعارات إذا كانت الأنظمة تكافئ عكسها.",
  "لا أكتب وصفًا وظيفيًا قبل فهم القيمة والصلاحية والمساءلة.",
  "لا أقيس النشاط إذا كان المطلوب قياس الأثر.",
  "لا أترك العميل معتمدًا عليّ؛ أبني قدرة داخلية تستمر بعدي."
];

const signatureBlocks = [
  {
    label: "عدستي المهنية",
    title: "أرى المنظمة كنظام لا كأفراد منفصلين",
    body:
      "السلوك الذي يبدو غريبًا من الخارج قد يكون منطقيًا جدًا داخل نظام صُمم بطريقة خاطئة. لذلك يبدأ عملي من سؤال: ما القاعدة أو الحافز أو الصلاحية أو الخوف الذي جعل هذا السلوك قابلًا للتكرار؟"
  },
  {
    label: "فلسفتي في التدخل",
    title: "التدخل الجيد يغيّر شروط السلوك",
    body:
      "لا يكفي أن نطلب من الناس التعاون، أو المبادرة، أو الشفافية. يجب أن نجعل هذه السلوكيات ممكنة وآمنة ومكافأة داخل الهيكل، الاجتماعات، المؤشرات، والقرارات اليومية."
  },
  {
    label: "معياري في الاحتراف",
    title: "الأثر لا يكتمل حتى ينتقل للملكية الداخلية",
    body:
      "نجاح أي تدخل تنظيمي لا يظهر في جمال الوثيقة، بل في استمرار السلوك بعد انتهاء المشروع، ووضوح من يملكه، وكيف يُقاس، وكيف يُحدّث."
  }
];

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.86-3.04-1.86 0-2.14 1.45-2.14 2.95v5.67H9.33V9h3.42v1.56h.05c.48-.9 1.64-1.86 3.37-1.86 3.6 0 4.27 2.37 4.27 5.46v6.29ZM5.31 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.52V9h3.57v11.45Z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 2.8h3.25l-7.1 8.11 8.35 11.04h-6.54l-5.12-6.69-5.86 6.69H2.62l7.6-8.68L2.2 2.8h6.7l4.63 6.12 5.37-6.12Zm-1.14 17.2h1.8L7.91 4.65H5.98L17.76 20Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-.4 4.25-7.08 4.42a1 1 0 0 1-1.04 0L4.4 8.25V6.7l7.6 4.75 7.6-4.75v1.55Z"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"
      />
    </svg>
  );
}

export default function AboutRayan() {
  const [copied, setCopied] = useState(false);
  const [activeBlock, setActiveBlock] = useState(0);

  const emailSubject = "طلب استشارة أو نقاش مهني في التطوير التنظيمي";
  const emailBody = `الأستاذ ريان العجلان،

تحية طيبة،

أرغب في التواصل معك بخصوص طلب استشارة / نقاش مهني في مجال التطوير التنظيمي.

ملخص السياق:
- اسم الجهة / المشروع:
- التحدي الحالي:
- الهدف المتوقع:
- نطاق العمل المقترح:
- الموعد المناسب للتواصل:

شاكرًا لك،
`;

  const mailtoUrl = useMemo(() => {
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  }, []);

  async function copyEmailTemplate() {
    const template = `إلى: ${CONTACT_EMAIL}

الموضوع: ${emailSubject}

${emailBody}`;

    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      alert("تعذر النسخ تلقائيًا. يمكنك نسخ القالب يدويًا من زر البريد.");
    }
  }

  return (
    <section className="about-rayan-page" dir="rtl">
      <style>{`
        .about-rayan-page {
          --ink: #0f172a;
          --muted: #64748b;
          --line: rgba(148, 163, 184, .22);
          --soft: rgba(255, 255, 255, .78);
          --white: #ffffff;
          --blue: #0a66c2;
          --xblack: #050505;
          --gold: #f59e0b;
          --indigo: #4f46e5;
          --violet: #7c3aed;
          --green: #10b981;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          color: var(--ink);
          padding: 34px 16px 80px;
          background:
            radial-gradient(circle at 14% 10%, rgba(79,70,229,.18), transparent 30%),
            radial-gradient(circle at 82% 14%, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at 48% 88%, rgba(16,185,129,.12), transparent 32%),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%);
        }

        .about-rayan-page::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15,23,42,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,.035) 1px, transparent 1px);
          background-size: 54px 54px;
          mask-image: linear-gradient(to bottom, black, transparent 88%);
          pointer-events: none;
        }

        .ar-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .ar-hero {
          position: relative;
          overflow: hidden;
          border-radius: 42px;
          padding: clamp(24px, 4vw, 44px);
          background:
            radial-gradient(circle at 80% 10%, rgba(245,158,11,.28), transparent 30%),
            radial-gradient(circle at 20% 5%, rgba(124,58,237,.32), transparent 34%),
            linear-gradient(135deg, rgba(15,23,42,.98), rgba(30,41,59,.95));
          color: white;
          box-shadow: 0 30px 90px rgba(15,23,42,.22);
          border: 1px solid rgba(255,255,255,.12);
        }

        .ar-hero::before {
          content: "";
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          right: -250px;
          top: -300px;
          background:
            conic-gradient(from 80deg, rgba(79,70,229,.35), rgba(245,158,11,.22), rgba(16,185,129,.18), rgba(79,70,229,.35));
          filter: blur(12px);
          opacity: .65;
        }

        .ar-hero::after {
          content: "";
          position: absolute;
          inset: -40%;
          background-image:
            linear-gradient(rgba(255,255,255,.052) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.052) 1px, transparent 1px);
          background-size: 42px 42px;
          transform: rotate(-9deg);
          opacity: .45;
        }

        .ar-hero-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 30px;
          align-items: center;
        }

        .ar-kicker {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.14);
          color: #c7d2fe;
          font-size: 12px;
          font-weight: 950;
        }

        .ar-title {
          margin: 18px 0 12px;
          font-size: clamp(34px, 5.4vw, 72px);
          line-height: 1.05;
          letter-spacing: -1.5px;
          font-weight: 1000;
        }

        .ar-title span {
          display: block;
          background: linear-gradient(90deg, #fff, #c7d2fe, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .ar-lead {
          margin: 0;
          max-width: 760px;
          color: rgba(226,232,240,.9);
          font-size: 15px;
          line-height: 2.05;
          font-weight: 750;
        }

        .ar-identity-card {
          position: relative;
          overflow: hidden;
          min-height: 340px;
          border-radius: 34px;
          padding: 22px;
          background: rgba(255,255,255,.09);
          border: 1px solid rgba(255,255,255,.14);
          backdrop-filter: blur(16px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
        }

        .ar-monogram {
          width: 112px;
          height: 112px;
          display: grid;
          place-items: center;
          border-radius: 34px;
          color: white;
          font-size: 34px;
          font-weight: 1000;
          letter-spacing: -1px;
          background:
            radial-gradient(circle at 30% 25%, rgba(255,255,255,.9), rgba(255,255,255,.16) 20%, transparent 35%),
            linear-gradient(135deg, #4f46e5, #7c3aed 52%, #f59e0b);
          box-shadow: 0 24px 50px rgba(79,70,229,.34);
          margin-bottom: 18px;
        }

        .ar-identity-card h2 {
          margin: 0;
          color: white;
          font-size: 28px;
          font-weight: 1000;
        }

        .ar-identity-card p {
          margin: 10px 0 0;
          color: rgba(226,232,240,.84);
          line-height: 1.95;
          font-size: 13px;
          font-weight: 750;
        }

        .ar-credentials {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 18px;
        }

        .ar-credentials span {
          padding: 8px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.13);
          color: #f8fafc;
          font-size: 11px;
          font-weight: 950;
        }

        .ar-social-strip {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 18px;
        }

        .ar-social {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px;
          border-radius: 24px;
          color: white;
          text-decoration: none;
          transition: .24s ease;
          border: 1px solid rgba(255,255,255,.14);
        }

        .ar-social:hover {
          transform: translateY(-4px);
          filter: brightness(1.04);
        }

        .ar-social svg {
          width: 30px;
          height: 30px;
          flex: 0 0 auto;
        }

        .ar-social strong {
          display: block;
          font-size: 14px;
          font-weight: 1000;
        }

        .ar-social small {
          display: block;
          margin-top: 2px;
          font-size: 10px;
          font-weight: 850;
          opacity: .84;
        }

        .ar-linkedin {
          background: linear-gradient(135deg, #0a66c2, #004182);
          box-shadow: 0 18px 35px rgba(10,102,194,.28);
        }

        .ar-x {
          background: linear-gradient(135deg, #050505, #1f2937);
          box-shadow: 0 18px 35px rgba(0,0,0,.22);
        }

        .ar-section {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        .ar-panel {
          border-radius: 34px;
          padding: clamp(20px, 3vw, 30px);
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 22px 60px rgba(15,23,42,.08);
          backdrop-filter: blur(18px);
        }

        .ar-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 18px;
          margin-bottom: 18px;
        }

        .ar-panel-head span {
          color: #4f46e5;
          font-size: 11px;
          font-weight: 1000;
          letter-spacing: .04em;
        }

        .ar-panel-head h2 {
          margin: 7px 0 0;
          color: #0f172a;
          font-size: clamp(22px, 3vw, 36px);
          line-height: 1.25;
          font-weight: 1000;
        }

        .ar-panel-head p {
          margin: 0;
          color: #64748b;
          line-height: 1.85;
          font-size: 13px;
          font-weight: 750;
          max-width: 560px;
        }

        .ar-philosophy {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: .85fr 1.15fr;
          gap: 18px;
          align-items: stretch;
          background:
            radial-gradient(circle at 15% 18%, rgba(245,158,11,.17), transparent 28%),
            radial-gradient(circle at 85% 18%, rgba(79,70,229,.15), transparent 30%),
            rgba(255,255,255,.82);
        }

        .ar-orbit {
          min-height: 340px;
          border-radius: 30px;
          display: grid;
          place-items: center;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(15,23,42,.96), rgba(30,41,59,.92));
        }

        .ar-orbit::before {
          content: "";
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 35% 30%, rgba(255,255,255,.9), rgba(199,210,254,.22) 20%, transparent 38%),
            conic-gradient(from 0deg, #4f46e5, #7c3aed, #f59e0b, #10b981, #4f46e5);
          box-shadow: 0 30px 85px rgba(79,70,229,.32);
        }

        .ar-orbit::after {
          content: "System → Behavior → Impact";
          position: absolute;
          color: rgba(255,255,255,.74);
          font-size: 12px;
          font-weight: 1000;
          letter-spacing: .08em;
          transform: rotate(-18deg);
          border: 1px solid rgba(255,255,255,.24);
          width: 310px;
          height: 90px;
          border-radius: 50%;
          display: grid;
          place-items: center;
        }

        .ar-philosophy-copy {
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .ar-philosophy-copy h2 {
          margin: 0 0 14px;
          font-size: clamp(26px, 3.4vw, 44px);
          line-height: 1.25;
          font-weight: 1000;
          letter-spacing: -.8px;
          color: #0f172a;
        }

        .ar-philosophy-copy h2 span {
          color: #4f46e5;
        }

        .ar-philosophy-copy p {
          margin: 0;
          color: #334155;
          font-size: 16px;
          line-height: 2.15;
          font-weight: 850;
        }

        .ar-manifesto {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .ar-manifesto button {
          text-align: right;
          font-family: inherit;
          border: 0;
          cursor: pointer;
          min-height: 148px;
          padding: 16px;
          border-radius: 26px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.22);
          transition: .24s ease;
        }

        .ar-manifesto button:hover,
        .ar-manifesto button.active {
          transform: translateY(-4px);
          background: linear-gradient(135deg, #eef2ff, #ffffff);
          border-color: rgba(79,70,229,.25);
          box-shadow: 0 18px 42px rgba(79,70,229,.12);
        }

        .ar-manifesto button span {
          color: #4f46e5;
          font-size: 11px;
          font-weight: 1000;
        }

        .ar-manifesto button strong {
          display: block;
          margin-top: 10px;
          color: #0f172a;
          font-size: 16px;
          line-height: 1.55;
          font-weight: 1000;
        }

        .ar-block-reader {
          margin-top: 12px;
          border-radius: 28px;
          padding: 20px;
          background:
            radial-gradient(circle at top right, rgba(79,70,229,.12), transparent 26%),
            #0f172a;
          color: white;
        }

        .ar-block-reader span {
          color: #fde68a;
          font-size: 11px;
          font-weight: 1000;
        }

        .ar-block-reader h3 {
          margin: 8px 0 8px;
          font-size: 24px;
          line-height: 1.4;
          font-weight: 1000;
        }

        .ar-block-reader p {
          margin: 0;
          color: rgba(226,232,240,.88);
          font-size: 14px;
          line-height: 2;
          font-weight: 760;
        }

        .ar-specialty-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .ar-specialty-card {
          min-height: 210px;
          padding: 18px;
          border-radius: 28px;
          background:
            linear-gradient(145deg, rgba(255,255,255,.96), rgba(238,242,255,.82));
          border: 1px solid rgba(148,163,184,.2);
          box-shadow: 0 16px 38px rgba(15,23,42,.06);
          transition: .24s ease;
        }

        .ar-specialty-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(79,70,229,.12);
        }

        .ar-specialty-card b {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          color: white;
          font-size: 22px;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 14px 28px rgba(79,70,229,.22);
        }

        .ar-specialty-card h3 {
          margin: 18px 0 8px;
          color: #0f172a;
          font-size: 17px;
          line-height: 1.55;
          font-weight: 1000;
        }

        .ar-specialty-card p {
          margin: 0;
          color: #64748b;
          font-size: 12.5px;
          line-height: 1.9;
          font-weight: 760;
        }

        .ar-principles {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .ar-principle {
          display: flex;
          align-items: start;
          gap: 10px;
          padding: 14px;
          border-radius: 22px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.2);
          color: #334155;
          font-size: 13px;
          line-height: 1.8;
          font-weight: 850;
        }

        .ar-principle i {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 9px;
          color: white;
          background: linear-gradient(135deg, #10b981, #059669);
          font-style: normal;
          font-size: 12px;
          font-weight: 1000;
        }

        .ar-contact {
          display: grid;
          grid-template-columns: 1fr .75fr;
          gap: 18px;
          align-items: stretch;
        }

        .ar-contact-main {
          border-radius: 30px;
          padding: 24px;
          color: white;
          background:
            radial-gradient(circle at top right, rgba(245,158,11,.25), transparent 32%),
            linear-gradient(135deg, #111827, #0f172a);
        }

        .ar-contact-main h2 {
          margin: 0 0 10px;
          font-size: clamp(24px, 3.2vw, 40px);
          line-height: 1.25;
          font-weight: 1000;
        }

        .ar-contact-main p {
          margin: 0;
          max-width: 680px;
          color: rgba(226,232,240,.88);
          font-size: 14px;
          line-height: 2;
          font-weight: 760;
        }

        .ar-contact-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .ar-email-btn,
        .ar-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          min-height: 52px;
          padding: 0 16px;
          border-radius: 18px;
          color: white;
          text-decoration: none;
          font-size: 12px;
          font-weight: 1000;
          border: 1px solid rgba(255,255,255,.14);
          cursor: pointer;
          transition: .24s ease;
          font-family: inherit;
        }

        .ar-email-btn {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
        }

        .ar-copy-btn {
          background: rgba(255,255,255,.1);
        }

        .ar-email-btn:hover,
        .ar-copy-btn:hover {
          transform: translateY(-3px);
        }

        .ar-email-btn svg,
        .ar-copy-btn svg {
          width: 21px;
          height: 21px;
        }

        .ar-contact-note {
          border-radius: 30px;
          padding: 22px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #78350f;
        }

        .ar-contact-note strong {
          display: block;
          font-size: 18px;
          font-weight: 1000;
          margin-bottom: 8px;
        }

        .ar-contact-note p {
          margin: 0;
          font-size: 13px;
          line-height: 1.95;
          font-weight: 800;
        }

        .ar-footer {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          color: #64748b;
          font-size: 12px;
          font-weight: 850;
        }

        .ar-footer span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        @media (max-width: 1040px) {
          .ar-hero-grid,
          .ar-philosophy,
          .ar-contact {
            grid-template-columns: 1fr;
          }

          .ar-specialty-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ar-panel-head {
            align-items: start;
            flex-direction: column;
          }
        }

        @media (max-width: 720px) {
          .about-rayan-page {
            padding: 18px 10px 48px;
          }

          .ar-hero,
          .ar-panel {
            border-radius: 28px;
            padding: 20px;
          }

          .ar-social-strip,
          .ar-specialty-grid,
          .ar-manifesto,
          .ar-principles {
            grid-template-columns: 1fr;
          }

          .ar-orbit {
            min-height: 250px;
          }

          .ar-orbit::before {
            width: 165px;
            height: 165px;
          }

          .ar-orbit::after {
            width: 235px;
            height: 70px;
            font-size: 10px;
          }
        }
      `}</style>

      <div className="ar-shell">
        <header className="ar-hero">
          <div className="ar-hero-grid">
            <div>
              <span className="ar-kicker">عن المصمم · ريان العجلان</span>
              <h1 className="ar-title">
                لا أصمم صفحات
                <span>أصمم طريقة تفكير</span>
              </h1>
              <p className="ar-lead">
                هذه المنصة ليست محتوى تعليميًا فقط؛ إنها تجربة مبنية على عقلية التطوير التنظيمي:
                قراءة النظام، فهم السلوك، تصميم التدخل، قياس الأثر، وتثبيت ما ينجح.
              </p>
            </div>

            <aside className="ar-identity-card">
              <div className="ar-monogram">RA</div>
              <h2>ريان العجلان</h2>
              <p>
                ممارس في الموارد البشرية والتطوير التنظيمي وإدارة المشاريع، يعمل على تحويل المفاهيم التنظيمية
                إلى أدوات عملية تساعد القادة والمتدربين على رؤية النظام قبل القفز إلى الحل.
              </p>

              <div className="ar-credentials" aria-label="الاعتمادات المهنية">
                {credentials.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <div className="ar-social-strip">
                <a
                  className="ar-social ar-linkedin"
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="حساب ريان على لينكدإن"
                >
                  <div>
                    <strong>LinkedIn</strong>
                    <small>مساحة الفكر المهني</small>
                  </div>
                  <LinkedInIcon />
                </a>

                <a
                  className="ar-social ar-x"
                  href={X_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="حساب ريان على منصة X"
                >
                  <div>
                    <strong>منصة X</strong>
                    <small>ومضات وملاحظات قصيرة</small>
                  </div>
                  <XIcon />
                </a>
              </div>
            </aside>
          </div>
        </header>

        <section className="ar-section">
          <div className="ar-panel ar-philosophy">
            <div className="ar-orbit" aria-hidden="true" />

            <div className="ar-philosophy-copy">
              <h2>
                فلسفتي التنظيمية:
                <span> السلوك ليس لغزًا… إنه نتيجة تصميم.</span>
              </h2>
              <p>
                عندما يتكرر خلل داخل منظمة، لا أبدأ بسؤال: من المقصر؟
                بل أسأل: ما الذي جعل هذا السلوك منطقيًا داخل هذا النظام؟
                قد يكون السبب صلاحية ناقصة، مؤشرًا خاطئًا، خوفًا غير معلن، دورًا غامضًا،
                أو هيكلًا يكافئ الانعزال ثم يطلب التعاون.
              </p>
            </div>
          </div>

          <div className="ar-panel">
            <div className="ar-panel-head">
              <div>
                <span>بصمة العمل</span>
                <h2>ثلاث عدسات لا أتنازل عنها</h2>
              </div>
              <p>
                بدل عرض كل شيء دفعة واحدة، اختر العدسة التي تريد قراءتها. هكذا يبقى القسم نظيفًا وغير مزدحم.
              </p>
            </div>

            <div className="ar-manifesto">
              {signatureBlocks.map((block, index) => (
                <button
                  key={block.title}
                  type="button"
                  className={activeBlock === index ? "active" : ""}
                  onClick={() => setActiveBlock(index)}
                >
                  <span>{block.label}</span>
                  <strong>{block.title}</strong>
                </button>
              ))}
            </div>

            <div className="ar-block-reader">
              <span>{signatureBlocks[activeBlock].label}</span>
              <h3>{signatureBlocks[activeBlock].title}</h3>
              <p>{signatureBlocks[activeBlock].body}</p>
            </div>
          </div>

          <div className="ar-panel">
            <div className="ar-panel-head">
              <div>
                <span>مجالات التركيز</span>
                <h2>ماذا يصمم ريان داخل المنظمات؟</h2>
              </div>
              <p>
                التركيز هنا ليس على التنظير، بل على بناء أدوات قابلة للاستخدام داخل الواقع التنظيمي.
              </p>
            </div>

            <div className="ar-specialty-grid">
              {specialtyCards.map((card) => (
                <article className="ar-specialty-card" key={card.title}>
                  <b>{card.icon}</b>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="ar-panel">
            <div className="ar-panel-head">
              <div>
                <span>قواعد الممارسة</span>
                <h2>ما الذي يحكم طريقة التفكير؟</h2>
              </div>
              <p>
                هذه ليست شعارات. إنها قواعد تمنع العمل التنظيمي من التحول إلى حلول سريعة بلا أثر.
              </p>
            </div>

            <div className="ar-principles">
              {thinkingPrinciples.map((item, index) => (
                <div className="ar-principle" key={item}>
                  <i>{index + 1}</i>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ar-panel ar-contact">
            <div className="ar-contact-main">
              <h2>طلب استشارة أو تبادل فكر مهني</h2>
              <p>
                للتواصل حول تشخيص تنظيمي، تصميم أدوار وصلاحيات، قياس أثر تدخلات OD،
                مراجعة أوصاف وظيفية، أو نقاش مهني حول بناء القدرة التنظيمية.
              </p>

              <div className="ar-contact-actions">
                <a className="ar-email-btn" href={mailtoUrl}>
                  <MailIcon />
                  افتح بريدًا بقالب جاهز
                </a>

                <button type="button" className="ar-copy-btn" onClick={copyEmailTemplate}>
                  <CopyIcon />
                  {copied ? "تم نسخ القالب" : "انسخ قالب الطلب"}
                </button>
              </div>
            </div>

            <aside className="ar-contact-note">
              <strong>قالب الطلب ليس رسالة عادية</strong>
              <p>
                عند الضغط على زر البريد ستُفتح رسالة جاهزة فيها سياق، تحدي، هدف، نطاق العمل،
                وموعد مناسب للتواصل؛ حتى يبدأ النقاش بطريقة مهنية لا عشوائية.
              </p>
            </aside>
          </div>
        </section>

        <footer className="ar-footer">
          <span>Mastering OD Engineering Academy © 2026</span>
          <span>SHRM-SCP · SPHRi · CPTD · PMP</span>
        </footer>
      </div>
    </section>
  );
}