import { useMemo, useState } from "react";

const CONSULTATION_EMAIL = "rayansalajlan@gmail.com";

const credentials = [
  {
    code: "CIPD Level 7",
    title: "الزمالة العليا في إدارة الموارد البشرية",
    issuer: "المعهد البريطاني المعتمد لتنمية الأفراد",
    note: "تأصيل استراتيجي لممارسات رأس المال البشري والحوكمة المؤسسية."
  },
  {
    code: "SHRM-SCP",
    title: "خبير أول معتمد في الموارد البشرية",
    issuer: "جمعية إدارة الموارد البشرية الأمريكية",
    note: "ربط قرارات الموارد البشرية بالأثر الاستراتيجي والنضج المؤسسي."
  },
  {
    code: "SPHRi",
    title: "محترف أول دولي في الموارد البشرية",
    issuer: "معهد اعتماد الموارد البشرية",
    note: "خبرة متقدمة في السياسات، الامتثال، التعويضات، الأداء، والتصميم المؤسسي."
  },
  {
    code: "CPTD",
    title: "محترف معتمد في تطوير المواهب",
    issuer: "جمعية تطوير المواهب",
    note: "تصميم التعلم والتطوير بوصفه قدرة مؤسسية لا نشاطًا تدريبيًا فقط."
  },
  {
    code: "PMP",
    title: "محترف إدارة المشاريع",
    issuer: "معهد إدارة المشاريع",
    note: "إدارة المبادرات التحولية بمنهجية تنفيذ وقياس ومخاطر وحوكمة."
  }
];

const capabilityCards = [
  {
    title: "مصمم أنظمة لا منفذ قوالب",
    text: "لا أبدأ من النموذج الجاهز؛ أبدأ من السؤال الأصعب: ما التصميم الذي يجعل السلوك الحالي منطقيًا؟"
  },
  {
    title: "أقرأ السلوك كأثر للنظام",
    text: "ضعف الأداء، الصمت، التصعيد، أو مقاومة التغيير ليست أحكامًا على الأشخاص؛ غالبًا هي إشارات إلى خلل في الأدوار أو الصلاحيات أو الحوافز."
  },
  {
    title: "أحوّل التشخيص إلى تدخل قابل للحمل",
    text: "التدخل الجيد ليس الأكثر أناقة، بل الذي يستطيع النظام استخدامه بعد انتهاء الورشة وخروج المستشار."
  },
  {
    title: "أوازن بين الإنسان والنتيجة",
    text: "لا أتعامل مع الكرامة الإنسانية كترف، ولا مع الأداء كقيمة ثانوية. المنظمة الناضجة تحفظ الاثنين معًا."
  }
];

const designLayers = [
  {
    label: "أقرأ",
    title: "قراءة النظام",
    text: "تفكيك الأعراض إلى أنماط، والأنماط إلى أسباب تصميمية وثقافية وسلوكية."
  },
  {
    label: "أصمم",
    title: "تصميم التدخل",
    text: "اختيار تدخل مناسب: هيكل، أدوار، صلاحيات، ثقافة، تعلم، أداء، أو قيادة تغيير."
  },
  {
    label: "أقيس",
    title: "قياس الأثر",
    text: "التمييز بين النشاط والتبنّي والأثر، وربط كل تدخل بسلسلة قياس واضحة."
  },
  {
    label: "أثبت",
    title: "تثبيت الاستدامة",
    text: "نقل الملكية إلى النظام، وإدخال التغيير في الأداء والاجتماعات والحوكمة والتعلم."
  }
];

const metrics = [
  {
    value: "+9",
    unit: "سنوات",
    title: "خبرة قيادية وتنفيذية",
    text: "في رأس المال البشري، إدارة الأداء، السياسات، الحوكمة، والتطوير المؤسسي."
  },
  {
    value: "+600",
    unit: "ساعة",
    title: "نقل معرفة وتأهيل مهني",
    text: "في برامج وشهادات وممارسات الموارد البشرية والتطوير التنظيمي."
  },
  {
    value: "+300",
    unit: "ممارس",
    title: "تمكين وتطوير كفاءات",
    text: "عبر التدريب، التوجيه، تصميم المسارات، وبناء الجاهزية المهنية."
  },
  {
    value: "360°",
    unit: "منظور",
    title: "قراءة شمولية للنظام",
    text: "من الاستراتيجية إلى السلوك، ومن الهيكل إلى الثقافة، ومن التشخيص إلى الأثر."
  }
];

function buildEmailTemplate() {
  return `السلام عليكم أ. ريان،

أرغب في طلب استشارة أو تبادل فكر مهني حول موضوع يرتبط بالتطوير التنظيمي.

الاسم:
الجهة / القطاع:
المسمى الوظيفي:
وسيلة التواصل المناسبة:

نوع الطلب:
[ ] تشخيص تنظيمي
[ ] مراجعة هيكل أو نموذج تشغيل
[ ] تصميم أو مراجعة أوصاف وظيفية
[ ] حوكمة أدوار وصلاحيات
[ ] قياس أداء أو بناء مؤشرات
[ ] قيادة تغيير أو تبنّي سلوكي
[ ] ثقافة تنظيمية أو تعلم مؤسسي
[ ] تبادل فكر مهني عام

وصف مختصر للوضع الحالي:
- 

ما العرض أو المشكلة الظاهرة؟
- 

ما الأثر الحالي على العمل أو الناس أو العميل؟
- 

ما الذي تمّت تجربته سابقًا؟
- 

ما النتيجة المتوقعة من التواصل؟
- 

الوقت المناسب للتواصل:
- 

شكرًا لك،`;
}

function encodeMailto({ subject, body }) {
  return `mailto:${CONSULTATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function AboutRayan() {
  const [copied, setCopied] = useState(false);
  const [activeLayer, setActiveLayer] = useState(0);

  const emailBody = useMemo(() => buildEmailTemplate(), []);
  const mailtoLink = useMemo(
    () =>
      encodeMailto({
        subject: "طلب استشارة تنظيمية أو تبادل فكر مهني",
        body: emailBody
      }),
    [emailBody]
  );

  async function copyEmailTemplate() {
    try {
      await navigator.clipboard.writeText(emailBody);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("لم يتم النسخ تلقائيًا. يمكنك نسخ النص من قالب البريد يدويًا.");
    }
  }

  return (
    <section className="rayan-about-page" dir="rtl">
      <style>{`
        .rayan-about-page {
          --rayan-ink: #0f172a;
          --rayan-muted: #64748b;
          --rayan-soft: #f8fafc;
          --rayan-card: rgba(255,255,255,.88);
          --rayan-line: rgba(148,163,184,.22);
          --rayan-indigo: #4f46e5;
          --rayan-violet: #7c3aed;
          --rayan-gold: #f59e0b;
          --rayan-green: #10b981;
          --rayan-red: #ef4444;

          min-height: 100vh;
          padding: 28px 14px 80px;
          color: var(--rayan-ink);
          background:
            radial-gradient(circle at 8% 8%, rgba(79,70,229,.16), transparent 28%),
            radial-gradient(circle at 92% 12%, rgba(245,158,11,.16), transparent 28%),
            radial-gradient(circle at 46% 96%, rgba(16,185,129,.14), transparent 32%),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 52%, #fff7ed 100%);
          font-family: inherit;
          overflow: hidden;
        }

        .rayan-shell {
          width: min(1280px, 100%);
          margin: 0 auto;
        }

        .blessing-banner {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          padding: 18px 22px;
          margin-bottom: 20px;
          background:
            radial-gradient(circle at 12% 10%, rgba(251,191,36,.20), transparent 32%),
            linear-gradient(135deg, rgba(255,255,255,.88), rgba(255,247,237,.88));
          border: 1px solid rgba(245,158,11,.26);
          box-shadow: 0 18px 45px rgba(15,23,42,.06);
          backdrop-filter: blur(18px);
        }

        .blessing-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(90deg, rgba(245,158,11,.08) 1px, transparent 1px),
            linear-gradient(rgba(245,158,11,.08) 1px, transparent 1px);
          background-size: 38px 38px;
          opacity: .65;
        }

        .blessing-banner p {
          position: relative;
          z-index: 1;
          margin: 0;
          color: #78350f;
          font-size: 1rem;
          line-height: 2;
          font-weight: 850;
          text-align: center;
        }

        .hero-stage {
          position: relative;
          overflow: hidden;
          border-radius: 44px;
          padding: 38px;
          min-height: 520px;
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          gap: 28px;
          align-items: stretch;
          color: white;
          background:
            radial-gradient(circle at 15% 12%, rgba(129,140,248,.26), transparent 30%),
            radial-gradient(circle at 82% 8%, rgba(251,191,36,.19), transparent 28%),
            linear-gradient(145deg, #0f172a, #1e1b4b 58%, #312e81);
          box-shadow: 0 30px 85px rgba(15,23,42,.24);
        }

        .hero-stage::before {
          content: "";
          position: absolute;
          inset: -90px;
          background-image:
            linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 58px 58px;
          transform: rotate(-8deg);
          opacity: .36;
        }

        .hero-stage::after {
          content: "";
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          left: -210px;
          bottom: -250px;
          background: radial-gradient(circle, rgba(251,191,36,.25), transparent 64%);
        }

        .hero-content,
        .system-orbit {
          position: relative;
          z-index: 1;
        }

        .eyebrow {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 999px;
          color: #e0e7ff;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.16);
          font-size: 12px;
          font-weight: 950;
        }

        .hero-content h1 {
          margin: 18px 0 14px;
          font-size: clamp(38px, 6vw, 74px);
          line-height: 1.03;
          font-weight: 950;
          letter-spacing: -1.7px;
        }

        .hero-content h1 span {
          display: block;
          color: #fde68a;
        }

        .hero-lead {
          max-width: 760px;
          margin: 0;
          color: rgba(226,232,240,.90);
          font-size: 16px;
          line-height: 2.05;
          font-weight: 750;
        }

        .hero-signature {
          margin-top: 26px;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 16px;
          align-items: center;
        }

        .signature-mark {
          width: 72px;
          height: 72px;
          border-radius: 26px;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 30% 20%, rgba(255,255,255,.23), transparent 28%),
            linear-gradient(135deg, #f59e0b, #7c2d12);
          color: #fff7ed;
          font-size: 27px;
          font-weight: 950;
          box-shadow: 0 18px 42px rgba(245,158,11,.27);
        }

        .hero-signature strong {
          display: block;
          font-size: 20px;
          font-weight: 950;
          color: white;
        }

        .hero-signature small {
          display: block;
          margin-top: 5px;
          color: rgba(226,232,240,.76);
          font-size: 12px;
          font-weight: 850;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .rayan-btn {
          cursor: pointer;
          border: 0;
          border-radius: 18px;
          padding: 13px 18px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: .22s ease;
        }

        .rayan-btn:hover {
          transform: translateY(-2px);
        }

        .rayan-btn.primary {
          color: white;
          background: linear-gradient(135deg, var(--rayan-indigo), var(--rayan-violet));
          box-shadow: 0 16px 38px rgba(79,70,229,.32);
        }

        .rayan-btn.gold {
          color: #422006;
          background: linear-gradient(135deg, #fbbf24, #fde68a);
          box-shadow: 0 16px 38px rgba(245,158,11,.25);
        }

        .rayan-btn.dark {
          color: white;
          background: #0f172a;
          box-shadow: 0 16px 38px rgba(15,23,42,.18);
        }

        .rayan-btn.light {
          color: #0f172a;
          background: white;
          border: 1px solid rgba(148,163,184,.22);
        }

        .system-orbit {
          min-height: 430px;
          border-radius: 36px;
          background:
            radial-gradient(circle at center, rgba(255,255,255,.18), transparent 38%),
            rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(16px);
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .orbit-ring {
          position: relative;
          width: min(430px, 100%);
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.18);
          display: grid;
          place-items: center;
        }

        .orbit-ring::before,
        .orbit-ring::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1px dashed rgba(255,255,255,.22);
        }

        .orbit-ring::before {
          inset: 48px;
        }

        .orbit-ring::after {
          inset: 96px;
        }

        .orbit-core {
          position: relative;
          z-index: 3;
          width: 160px;
          height: 160px;
          border-radius: 42px;
          display: grid;
          place-items: center;
          text-align: center;
          background:
            radial-gradient(circle at 30% 18%, rgba(255,255,255,.24), transparent 26%),
            linear-gradient(135deg, #111827, #4f46e5);
          box-shadow:
            0 28px 60px rgba(0,0,0,.28),
            inset 0 0 0 1px rgba(255,255,255,.18);
        }

        .orbit-core b {
          display: block;
          font-size: 26px;
          font-weight: 950;
          color: white;
          line-height: 1.1;
        }

        .orbit-core small {
          display: block;
          margin-top: 8px;
          color: #c7d2fe;
          font-size: 11px;
          font-weight: 900;
        }

        .orbit-node {
          position: absolute;
          z-index: 4;
          width: 96px;
          min-height: 84px;
          border-radius: 24px;
          padding: 12px;
          background: rgba(255,255,255,.92);
          color: #0f172a;
          box-shadow: 0 18px 35px rgba(0,0,0,.18);
          border: 1px solid rgba(255,255,255,.9);
          display: grid;
          align-content: center;
          text-align: center;
        }

        .orbit-node b {
          display: block;
          font-size: 18px;
          font-weight: 950;
          color: #4f46e5;
        }

        .orbit-node span {
          display: block;
          margin-top: 6px;
          font-size: 10px;
          font-weight: 950;
          color: #475569;
          line-height: 1.45;
        }

        .node-1 { top: 6px; right: 50%; transform: translateX(50%); }
        .node-2 { top: 25%; left: 4px; }
        .node-3 { bottom: 25%; left: 4px; }
        .node-4 { bottom: 6px; right: 50%; transform: translateX(50%); }
        .node-5 { bottom: 25%; right: 4px; }
        .node-6 { top: 25%; right: 4px; }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin: 18px 0;
        }

        .metric-card,
        .section-card,
        .philosophy-card,
        .credential-card,
        .contact-card,
        .designer-card,
        .layer-panel,
        .capability-card {
          background: var(--rayan-card);
          border: 1px solid rgba(255,255,255,.90);
          box-shadow: 0 18px 50px rgba(15,23,42,.07);
          backdrop-filter: blur(18px);
        }

        .metric-card {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 20px;
        }

        .metric-card::before {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          left: -54px;
          top: -56px;
          background: rgba(79,70,229,.12);
        }

        .metric-card strong {
          position: relative;
          z-index: 1;
          display: block;
          color: var(--rayan-indigo);
          font-size: 36px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .metric-card strong span {
          font-size: 13px;
          color: var(--rayan-muted);
          font-weight: 900;
          margin-inline-start: 4px;
        }

        .metric-card h3 {
          position: relative;
          z-index: 1;
          margin: 14px 0 7px;
          font-size: 15px;
          color: var(--rayan-ink);
          font-weight: 950;
        }

        .metric-card p {
          position: relative;
          z-index: 1;
          margin: 0;
          color: var(--rayan-muted);
          font-size: 12px;
          line-height: 1.85;
          font-weight: 750;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1.2fr .8fr;
          gap: 18px;
          margin-top: 18px;
          align-items: start;
        }

        .section-card {
          border-radius: 34px;
          padding: 28px;
        }

        .section-card .tag {
          display: inline-flex;
          padding: 8px 13px;
          border-radius: 999px;
          background: rgba(79,70,229,.10);
          color: #3730a3;
          font-size: 11px;
          font-weight: 950;
        }

        .section-card h2,
        .designer-card h2,
        .philosophy-card h2,
        .credential-card h2,
        .contact-card h2 {
          margin: 14px 0 12px;
          color: var(--rayan-ink);
          font-size: clamp(26px, 3.8vw, 44px);
          line-height: 1.18;
          letter-spacing: -1px;
          font-weight: 950;
        }

        .section-card h3 {
          margin: 18px 0 8px;
          color: var(--rayan-ink);
          font-size: 24px;
          font-weight: 950;
        }

        .section-card strong.subtitle {
          display: block;
          color: #334155;
          font-size: 15px;
          line-height: 1.9;
          font-weight: 950;
          margin-bottom: 14px;
        }

        .section-card p,
        .designer-card p,
        .philosophy-card p,
        .credential-card p,
        .contact-card p,
        .layer-panel p,
        .capability-card p {
          color: #475569;
          font-size: 14px;
          line-height: 2.05;
          font-weight: 750;
        }

        .about-paragraphs {
          display: grid;
          gap: 12px;
        }

        .philosophy-card {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 30px;
          margin-top: 18px;
          color: white;
          background:
            radial-gradient(circle at 10% 15%, rgba(251,191,36,.22), transparent 32%),
            radial-gradient(circle at 92% 0%, rgba(129,140,248,.20), transparent 30%),
            linear-gradient(135deg, #111827, #312e81);
        }

        .philosophy-card::before {
          content: "؟";
          position: absolute;
          left: 24px;
          top: -22px;
          font-size: 180px;
          line-height: 1;
          font-weight: 950;
          color: rgba(255,255,255,.045);
        }

        .philosophy-card span {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.14);
          color: #fde68a;
          font-size: 11px;
          font-weight: 950;
        }

        .philosophy-card h2 {
          color: white;
          max-width: 760px;
          margin-top: 16px;
        }

        .philosophy-card blockquote {
          position: relative;
          z-index: 1;
          margin: 22px 0 0;
          padding: 0;
        }

        .philosophy-card blockquote p {
          margin: 0;
          color: rgba(255,255,255,.92);
          font-size: clamp(20px, 3vw, 34px);
          line-height: 1.8;
          font-weight: 950;
          letter-spacing: -.3px;
        }

        .philosophy-card blockquote p mark {
          background: linear-gradient(180deg, transparent 48%, rgba(251,191,36,.36) 48%);
          color: #fff7ed;
          padding: 0 4px;
        }

        .philosophy-footer {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 24px;
        }

        .philosophy-footer div {
          border-radius: 22px;
          padding: 14px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
        }

        .philosophy-footer b {
          display: block;
          color: #fde68a;
          font-size: 13px;
          font-weight: 950;
          margin-bottom: 6px;
        }

        .philosophy-footer small {
          color: rgba(226,232,240,.84);
          font-size: 11px;
          line-height: 1.7;
          font-weight: 850;
        }

        .designer-card {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 26px;
          background:
            radial-gradient(circle at 12% 12%, rgba(79,70,229,.12), transparent 30%),
            rgba(255,255,255,.88);
        }

        .designer-card::after {
          content: "";
          position: absolute;
          width: 210px;
          height: 210px;
          border-radius: 50%;
          left: -110px;
          bottom: -120px;
          background: rgba(245,158,11,.13);
        }

        .designer-title {
          position: relative;
          z-index: 1;
        }

        .designer-title span {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(245,158,11,.13);
          color: #92400e;
          font-size: 11px;
          font-weight: 950;
        }

        .designer-map {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .capability-card {
          border-radius: 24px;
          padding: 16px;
          background: rgba(248,250,252,.88);
          border: 1px solid rgba(148,163,184,.16);
          box-shadow: none;
        }

        .capability-card b {
          display: block;
          color: var(--rayan-ink);
          font-size: 14px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .capability-card p {
          margin: 0;
          font-size: 12px;
          line-height: 1.85;
        }

        .layer-panel {
          margin-top: 18px;
          border-radius: 34px;
          padding: 24px;
        }

        .layer-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }

        .layer-buttons button {
          cursor: pointer;
          border: 1px solid rgba(148,163,184,.22);
          border-radius: 18px;
          padding: 12px 10px;
          background: #f8fafc;
          color: #475569;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          transition: .2s ease;
        }

        .layer-buttons button.active {
          color: white;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 14px 30px rgba(79,70,229,.22);
        }

        .layer-panel h3 {
          margin: 0 0 10px;
          font-size: 24px;
          font-weight: 950;
          color: var(--rayan-ink);
        }

        .side-stack {
          display: grid;
          gap: 18px;
        }

        .credential-card,
        .contact-card {
          border-radius: 34px;
          padding: 24px;
        }

        .credential-card h2,
        .contact-card h2 {
          font-size: 27px;
        }

        .credential-list {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        .credential-item {
          position: relative;
          overflow: hidden;
          border-radius: 22px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.16);
        }

        .credential-item::before {
          content: "";
          position: absolute;
          right: 0;
          top: 0;
          width: 5px;
          height: 100%;
          background: linear-gradient(180deg, #4f46e5, #f59e0b);
        }

        .credential-item strong {
          display: block;
          color: #0f172a;
          font-size: 17px;
          font-weight: 950;
          margin-bottom: 6px;
          direction: ltr;
          text-align: right;
        }

        .credential-item b {
          display: block;
          color: #334155;
          font-size: 12px;
          line-height: 1.6;
          font-weight: 950;
        }

        .credential-item span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 800;
        }

        .credential-item p {
          margin: 8px 0 0;
          color: #475569;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 750;
        }

        .contact-card {
          background:
            radial-gradient(circle at 12% 12%, rgba(16,185,129,.11), transparent 32%),
            rgba(255,255,255,.88);
        }

        .contact-subtitle {
          border-radius: 22px;
          padding: 15px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.16);
          margin: 14px 0;
        }

        .contact-subtitle p {
          margin: 0;
          color: #475569;
          font-size: 13px;
          line-height: 1.95;
          font-weight: 850;
        }

        .contact-subtitle b {
          color: #0f172a;
          font-weight: 950;
        }

        .email-template-box {
          border-radius: 22px;
          padding: 14px;
          background: #0f172a;
          color: white;
          margin-top: 12px;
          box-shadow: 0 18px 42px rgba(15,23,42,.15);
        }

        .email-template-box span {
          display: block;
          color: #fde68a;
          font-size: 11px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .email-template-box pre {
          margin: 0;
          white-space: pre-wrap;
          color: rgba(226,232,240,.88);
          font-family: inherit;
          font-size: 11px;
          line-height: 1.85;
          max-height: 270px;
          overflow: auto;
        }

        .contact-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 14px;
        }

        .social-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .social-row a {
          flex: 1;
          min-width: 140px;
          text-align: center;
          text-decoration: none;
          color: #0f172a;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.18);
          border-radius: 16px;
          padding: 12px;
          font-size: 12px;
          font-weight: 950;
          transition: .2s ease;
        }

        .social-row a:hover {
          transform: translateY(-2px);
          background: white;
        }

        .method-strip {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .method-item {
          border-radius: 24px;
          padding: 15px;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(255,255,255,.88);
          box-shadow: 0 14px 34px rgba(15,23,42,.06);
          text-align: center;
        }

        .method-item b {
          display: block;
          color: #4f46e5;
          font-size: 18px;
          font-weight: 950;
          margin-bottom: 7px;
        }

        .method-item span {
          color: #475569;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 850;
        }

        @media (max-width: 1160px) {
          .hero-stage,
          .content-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid,
          .method-strip {
            grid-template-columns: repeat(2, 1fr);
          }

          .system-orbit {
            min-height: 480px;
          }
        }

        @media (max-width: 760px) {
          .rayan-about-page {
            padding: 16px 8px 48px;
          }

          .hero-stage,
          .section-card,
          .philosophy-card,
          .designer-card,
          .credential-card,
          .contact-card {
            border-radius: 28px;
            padding: 22px;
          }

          .metrics-grid,
          .designer-map,
          .philosophy-footer,
          .method-strip,
          .layer-buttons,
          .contact-actions {
            grid-template-columns: 1fr;
          }

          .system-orbit {
            min-height: 390px;
          }

          .orbit-ring {
            transform: scale(.82);
          }

          .orbit-node {
            width: 86px;
            min-height: 76px;
          }
        }
      `}</style>

      <div className="rayan-shell">
        <div className="blessing-banner">
          <p>
            ✨ عزيزي الزائر، فضلاً وليس أمرًا.. قُبيل إبحارك في هذا المختبر، أسألك أن تهبَ والديّ الغاليين، وللمسلمين والمسلمات، الأحياء منهم والأموات، دعوةً صادقة بظهر الغيب بالرحمة والمغفرة والعفو والمثوبة.
          </p>
        </div>

        <div className="hero-stage">
          <div className="hero-content">
            <span className="eyebrow">المصمم خلف المختبر</span>
            <h1>
              ريان العجلان
              <span>مصمم أنظمة تنظيمية</span>
            </h1>

            <p className="hero-lead">
              لا أتعامل مع المنظمة كهيكل جامد، ولا مع الإنسان كرقم في لوحة أداء. أقرأ ما بين السلوك والتصميم: أين تنكسر الصلاحية؟ أين تُكافأ العادة القديمة؟ أين يتحول الخوف إلى ثقافة؟ وأين يمكن أن يولد نظام أكثر وضوحًا وعدلًا وأثرًا؟
            </p>

            <div className="hero-signature">
              <div className="signature-mark">ر</div>
              <div>
                <strong>خبير ومستشار إدارة المنظومات وتطوير المنظمات</strong>
                <small>
                  خبرة في رأس المال البشري، الأداء، السياسات، الحوكمة، تصميم الأدوار، قيادة التغيير، وبناء القدرة المؤسسية المستمرة.
                </small>
              </div>
            </div>

            <div className="hero-actions">
              <a className="rayan-btn gold" href={mailtoLink}>
                ابدأ طلبًا مهنيًا عبر البريد
              </a>
              <button className="rayan-btn light" type="button" onClick={copyEmailTemplate}>
                {copied ? "تم نسخ قالب الطلب" : "نسخ قالب الطلب"}
              </button>
            </div>
          </div>

          <div className="system-orbit" aria-label="منهج ريان في قراءة النظام">
            <div className="orbit-ring">
              <div className="orbit-core">
                <div>
                  <b>النظام</b>
                  <small>قبل الحل</small>
                </div>
              </div>

              <div className="orbit-node node-1">
                <b>01</b>
                <span>تشخيص العرض</span>
              </div>
              <div className="orbit-node node-2">
                <b>02</b>
                <span>قراءة النمط</span>
              </div>
              <div className="orbit-node node-3">
                <b>03</b>
                <span>فحص التصميم</span>
              </div>
              <div className="orbit-node node-4">
                <b>04</b>
                <span>تحديد التدخل</span>
              </div>
              <div className="orbit-node node-5">
                <b>05</b>
                <span>قياس الأثر</span>
              </div>
              <div className="orbit-node node-6">
                <b>06</b>
                <span>تثبيت الملكية</span>
              </div>
            </div>
          </div>
        </div>

        <div className="metrics-grid">
          {metrics.map((item) => (
            <div className="metric-card" key={item.title}>
              <strong>
                {item.value}
                <span>{item.unit}</span>
              </strong>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="content-grid">
          <div>
            <div className="section-card">
              <span className="tag">الهوية المهنية</span>
              <h2>من خلف مختبر التطوير التنظيمي؟</h2>
              <h3>ريان العجلان</h3>
              <strong className="subtitle">
                ممارس تنفيذي واستشاري في تطوير المنظمات، يربط بين الإنسان، التصميم، الحوكمة، والنتائج.
              </strong>

              <div className="about-paragraphs">
                <p>
                  أعمل على قراءة المنظمات بوصفها أنظمة حيّة لا مخططات جامدة. ما يظهر أمامنا كضعف تعاون، بطء قرار، مقاومة تغيير، انخفاض إنتاجية، أو خلل ثقافي؛ غالبًا يخفي وراءه تصميمًا غير مكتمل في الأدوار، الصلاحيات، الحوافز، مؤشرات الأداء، أو طريقة القيادة.
                </p>

                <p>
                  لذلك يتجه عملي إلى ما هو أعمق من المعالجة السطحية: تشخيص الفجوة، فهم أنماط السلوك، مراجعة نموذج التشغيل، تصميم الأدوار والصلاحيات، بناء مؤشرات قابلة للقرار، وتحويل التدخلات إلى ممارسات تستطيع المنظمة حملها بعد انتهاء المشروع.
                </p>

                <p>
                  يجمع هذا المختبر بين خبرة تنفيذية في رأس المال البشري وإدارة الأداء والسياسات والحوكمة، وبين منهجية تطوير تنظيمي ترفض القفز إلى الحلول قبل فهم النظام. الهدف ليس تقديم محتوى معرفي فقط، بل بناء عقل مهني يستطيع أن يسأل السؤال الصحيح قبل أن يصمم التدخل الصحيح.
                </p>
              </div>
            </div>

            <div className="philosophy-card">
              <span>الفلسفة التنظيمية</span>
              <h2>لا تبحث عن المذنب قبل أن تفهم المسرح الذي جعل السلوك ممكنًا.</h2>

              <blockquote>
                <p>
                  “كل سلوك متكرر داخل المنظمة يحمل منطقًا خفيًا. قبل أن تسميه مقاومة، كسلًا، ضعف ثقافة، أو انخفاض إنتاجية؛ اسأل: <mark>ما القاعدة غير المرئية التي تحميه؟</mark> ما الحافز الذي يكافئه؟ ما الصلاحية التي تمنعه؟ وما التصميم الذي جعله يبدو الخيار الأكثر أمانًا؟”
                </p>
              </blockquote>

              <div className="philosophy-footer">
                <div>
                  <b>السلوك ليس صدفة</b>
                  <small>إذا تكرر، فهناك نظام يجعله قابلًا للتكرار.</small>
                </div>
                <div>
                  <b>الثقافة ليست ملصقًا</b>
                  <small>إنها ما يحدث عند الضغط لا ما يُكتب في القيم.</small>
                </div>
                <div>
                  <b>التدخل ليس نشاطًا</b>
                  <small>هو تعديل مقصود في شروط العمل والسلوك والأثر.</small>
                </div>
              </div>
            </div>

            <div className="designer-card">
              <div className="designer-title">
                <span>عن المصمم</span>
                <h2>مصمم تجربة تعلم تُدرّب العقل قبل أن تملأ الذاكرة</h2>
                <p>
                  هذا الموقع ليس منصة محتوى تقليدية، بل مختبر ممارسة. صُمّم ليأخذ المتعلم من القراءة إلى المحاكاة، ومن الحفظ إلى التشخيص، ومن الإعجاب بالأدوات إلى القدرة على استخدامها بوعي وسياق وأخلاق.
                </p>
              </div>

              <div className="designer-map">
                {capabilityCards.map((item) => (
                  <div className="capability-card" key={item.title}>
                    <b>{item.title}</b>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="layer-panel">
              <div className="layer-buttons">
                {designLayers.map((layer, index) => (
                  <button
                    key={layer.label}
                    type="button"
                    className={activeLayer === index ? "active" : ""}
                    onClick={() => setActiveLayer(index)}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>

              <h3>{designLayers[activeLayer].title}</h3>
              <p>{designLayers[activeLayer].text}</p>
            </div>
          </div>

          <aside className="side-stack">
            <div className="credential-card">
              <h2>الاعتمادات الاستشارية والمهنية الدولية</h2>
              <p>
                مزيج من الاعتمادات المهنية المتقدمة التي تدعم ممارسة التطوير التنظيمي من زاوية الموارد البشرية، تطوير المواهب، إدارة المشاريع، والحوكمة الاستراتيجية.
              </p>

              <div className="credential-list">
                {credentials.map((item) => (
                  <div className="credential-item" key={item.code}>
                    <strong>{item.code}</strong>
                    <b>{item.title}</b>
                    <span>{item.issuer}</span>
                    <p>{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="contact-card">
              <h2>طلب استشارة أو تبادل فكر مهني</h2>

              <div className="contact-subtitle">
                <p>
                  للتواصل حول <b>تشخيص منظومة عمل</b>، أو <b>مراجعة هيكل وأدوار وصلاحيات</b>، أو <b>تصميم أوصاف وظيفية ومؤشرات أداء</b>، أو <b>مناقشة تحديات التغيير والثقافة والتعلم المؤسسي</b>.
                </p>
              </div>

              <div className="contact-actions">
                <a className="rayan-btn primary" href={mailtoLink}>
                  فتح البريد بقالب جاهز
                </a>
                <button className="rayan-btn dark" type="button" onClick={copyEmailTemplate}>
                  {copied ? "تم النسخ" : "نسخ نص الطلب"}
                </button>
              </div>

              <div className="email-template-box">
                <span>قالب الطلب المقترح</span>
                <pre>{emailBody}</pre>
              </div>

              <div className="social-row">
                <a href="https://linkedin.com/in/rayanalajlan" target="_blank" rel="noreferrer">
                  لينكدإن
                </a>
                <a href="https://x.com/Rayan_Alajlan" target="_blank" rel="noreferrer">
                  منصة إكس
                </a>
              </div>
            </div>
          </aside>
        </div>

        <div className="method-strip">
          <div className="method-item">
            <b>01</b>
            <span>لا تبدأ بالحل؛ ابدأ بتعريف العرض والنمط.</span>
          </div>
          <div className="method-item">
            <b>02</b>
            <span>لا تتهم الثقافة قبل أن تفحص التصميم والحوافز.</span>
          </div>
          <div className="method-item">
            <b>03</b>
            <span>لا تكتب وصفًا وظيفيًا قبل فهم الدور والقيمة والصلاحية.</span>
          </div>
          <div className="method-item">
            <b>04</b>
            <span>لا تقِس النشاط إذا كان المطلوب أثرًا وسلوكًا مستمرًا.</span>
          </div>
          <div className="method-item">
            <b>05</b>
            <span>لا تغادر قبل نقل الملكية إلى النظام.</span>
          </div>
        </div>
      </div>
    </section>
  );
}