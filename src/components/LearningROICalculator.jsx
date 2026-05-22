import { useMemo, useState } from "react";

const TOTAL_JOURNEY_DAYS = 180;
const DEFAULT_INFLATION_RATE = 0.019;

/*
  حاسبة العائد من التعلم
  - أداة تفاعلية تقديرية ومحافظة.
  - مربوطة بتقدم المتدرب الفعلي داخل الرحلة التعليمية عبر completedDays.
  - لا تستخدم ذكاء اصطناعي ولا مفاتيح خارجية، لذلك لا تتعطل ولا تحتاج API.
*/

const TRACKS = {
  graduate: {
    title: "خريج جديد / باحث عن عمل",
    shortTitle: "بداية المسار",
    description:
      "تقيس الحاسبة هنا جدوى دخولك لمسار الموارد البشرية من نقطة البداية، مع مقارنة محافظة بين وضعك الحالي ونطاقات دخول السوق.",
    salaryRange: { low: 6000, mid: 7500, high: 9000 },
    directIncreaseAllowed: true,
    insight:
      "العائد هنا يتمثل في بناء جاهزية دخول السوق: لغة مهنية، فهم للممارسات، وقدرة أفضل على المنافسة في المقابلات."
  },
  practitioner: {
    title: "ممارس موارد بشرية يريد التطوير والترقية",
    shortTitle: "تطوير داخل المجال",
    description:
      "تقيس الحاسبة هنا موقعك الحالي داخل المجال، وتقدّر أثر التعلم على تحسين جاهزيتك للترقية أو الانتقال إلى دور أعلى.",
    salaryRange: { low: 9000, mid: 12000, high: 15000 },
    directIncreaseAllowed: true,
    insight:
      "العائد هنا أقرب للعائد المالي المباشر؛ لأنك تعمل داخل المجال أصلًا، والتعلم يمكن أن يدعم انتقالك لدور أكثر نضجًا."
  },
  careerShift: {
    title: "أعمل في مجال آخر وأريد تغيير مساري المهني",
    shortTitle: "تغيير المسار",
    description:
      "تقيس الحاسبة هنا جدوى الانتقال لمسار الموارد البشرية دون افتراض زيادة مباشرة فوق راتبك الحالي في مجالك القديم.",
    salaryRange: { low: 7000, mid: 8250, high: 9500 },
    directIncreaseAllowed: false,
    insight:
      "العائد هنا ليس وعدًا بزيادة فورية؛ بل تقليل التخبط، بناء لغة مهنية، ورفع جاهزيتك للمنافسة على بداية صحيحة في المسار الجديد."
  }
};

const SOURCES = [
  {
    name: "الهيئة العامة للإحصاء",
    type: "أجور وسوق عمل وتضخم",
    url: "https://www.stats.gov.sa"
  },
  {
    name: "منصة البيانات السعودية",
    type: "مؤشرات وطنية مساندة",
    url: "https://datasaudi.sa"
  },
  {
    name: "وزارة الموارد البشرية والتنمية الاجتماعية",
    type: "تنظيمات العمل والتوطين",
    url: "https://hrsd.gov.sa"
  },
  {
    name: "قرار احتساب السعودي في نطاقات",
    type: "حد تنظيمي مرجعي",
    url: "https://www.spa.gov.sa/2160616"
  },
  {
    name: "Cooper Fitch Salary Guide",
    type: "نطاقات رواتب سوقية",
    url: "https://cooperfitch.ae/salary-guides/kingdom-of-saudi-arabia/"
  },
  {
    name: "Hays Saudi Arabia Salary Guide",
    type: "مؤشرات رواتب وتوظيف",
    url: "https://www.hays.ae/salary-guide/saudi-arabia-salary-guide"
  },
  {
    name: "Robert Walters Saudi Arabia Salary Survey",
    type: "استطلاع رواتب مهني",
    url: "https://www.robertwalters.ae/our-services/saudi-arabia-salary-survey.html"
  },
  {
    name: "Mercer Compensation & Benefits Survey",
    type: "تعويضات ومزايا ومقارنة سوقية",
    url: "https://www.mercer.com/en-sa/insights/events/mercer-compensation-and-benefits-survey/"
  },
  {
    name: "SHRM Certification",
    type: "مرجعية مهنية للموارد البشرية",
    url: "https://www.shrm.org/credentials/certification"
  }
];

function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0
  }).format(Math.max(0, Math.round(number)));
}

function formatNumber(value) {
  return new Intl.NumberFormat("ar-SA", {
    maximumFractionDigits: 0
  }).format(Math.max(0, Math.round(Number(value || 0))));
}

function clamp(value, min, max) {
  const numeric = Number(value || 0);
  if (Number.isNaN(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}

function getPositionLabel(currentSalary, range) {
  if (currentSalary <= 0) {
    return {
      label: "لا يوجد دخل حالي مدخل",
      tone: "neutral",
      text: "ستُقرأ النتيجة باعتبارك في نقطة بداية أو انتقال، وليس كمقارنة مباشرة مع راتب قائم."
    };
  }

  if (currentSalary < range.low) {
    return {
      label: "أقل من النطاق المحافظ",
      tone: "positive",
      text: "توجد فجوة واضحة بين وضعك الحالي والحد الأدنى المحافظ للنطاق المستهدف، لذلك قد يظهر أثر التعلم ماليًا بشكل أوضح."
    };
  }

  if (currentSalary <= range.high) {
    return {
      label: "داخل النطاق السوقي",
      tone: "balanced",
      text: "أنت داخل النطاق المتوقع تقريبًا. العائد هنا يعتمد على انتقالك داخل النطاق، لا على مجرد دخول المجال."
    };
  }

  return {
    label: "أعلى من النطاق المحافظ",
    tone: "caution",
    text: "راتبك الحالي أعلى من النطاق المحافظ لهذا المسار؛ لذلك لا يصح تسويق العائد كزيادة مباشرة في الراتب."
  };
}

function getCommitmentMessage(days, readiness) {
  if (days < 30) {
    return "التزامك الحالي يعطيك لمحة تأسيسية، لكنه غير كافٍ لبناء جاهزية مهنية مؤثرة.";
  }

  if (days < 90) {
    return "التزامك جيد كبداية، لكنه يحتاج استمرارًا حتى تظهر أثرًا أقوى في اللغة المهنية والحكم الاستشاري.";
  }

  if (days < 180) {
    return "أنت في منطقة جدية؛ كلما اقتربت من إتمام الرحلة زادت موثوقية الأثر المهني المتوقع.";
  }

  return "أكملت عامل الالتزام الكامل؛ هذا يعطي أعلى جاهزية تعليمية داخل هذه الحاسبة.";
}

export default function LearningROICalculator({
  completedDays = 0,
  totalDays = TOTAL_JOURNEY_DAYS
}) {
  const safeTotalDays = Math.max(1, Number(totalDays || TOTAL_JOURNEY_DAYS));
  const actualCompletedDays = clamp(completedDays, 0, safeTotalDays);

  const [track, setTrack] = useState("practitioner");
  const [currentSalary, setCurrentSalary] = useState(8000);
  const [courseCost, setCourseCost] = useState(1500);
  const [useActualProgress, setUseActualProgress] = useState(true);
  const [scenarioDays, setScenarioDays] = useState(actualCompletedDays || 30);

  const activeTrack = TRACKS[track];
  const effectiveDays = useActualProgress
    ? actualCompletedDays
    : clamp(scenarioDays, 1, safeTotalDays);

  const result = useMemo(() => {
    const readiness = clamp(effectiveDays / safeTotalDays, 0, 1);
    const range = activeTrack.salaryRange;
    const inflationFactor = 1 + DEFAULT_INFLATION_RATE;

    const realLow = range.low / inflationFactor;
    const realMid = range.mid / inflationFactor;
    const realHigh = range.high / inflationFactor;

    const conservativeTarget = realLow + (realMid - realLow) * readiness;
    const aspirationalTarget = realMid + (realHigh - realMid) * readiness;

    const current = Number(currentSalary || 0);
    const cost = Math.max(0, Number(courseCost || 0));

    let monthlyDelta = 0;
    let roi = null;
    let paybackWeeks = null;
    let mode = "direct";

    if (track === "careerShift" && current > conservativeTarget) {
      mode = "career-shift-non-direct";
      monthlyDelta = 0;
    } else {
      monthlyDelta = Math.max(0, conservativeTarget - current);
    }

    if (cost > 0 && monthlyDelta > 0) {
      roi = ((monthlyDelta * 12 - cost) / cost) * 100;
      paybackWeeks = (cost / monthlyDelta) * 4.33;
    }

    const position = getPositionLabel(current, {
      low: realLow,
      mid: realMid,
      high: realHigh
    });

    return {
      readiness,
      readinessPercent: Math.round(readiness * 100),
      nominalLow: range.low,
      nominalMid: range.mid,
      nominalHigh: range.high,
      realLow,
      realMid,
      realHigh,
      conservativeTarget,
      aspirationalTarget,
      monthlyDelta,
      annualDelta: monthlyDelta * 12,
      roi,
      paybackWeeks,
      mode,
      position,
      commitmentMessage: getCommitmentMessage(effectiveDays, readiness)
    };
  }, [activeTrack, currentSalary, courseCost, effectiveDays, safeTotalDays, track]);

  return (
    <section className="roi-page" dir="rtl">
      <style>{`
        .roi-page {
          min-height: 100vh;
          padding: 34px 16px 70px;
          color: #0f172a;
          background:
            radial-gradient(circle at 10% 10%, rgba(79,70,229,.16), transparent 30%),
            radial-gradient(circle at 92% 18%, rgba(245,158,11,.16), transparent 28%),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 54%, #fff7ed 100%);
        }

        .roi-wrap {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .roi-hero {
          position: relative;
          overflow: hidden;
          border-radius: 38px;
          padding: 34px;
          color: white;
          background:
            radial-gradient(circle at 15% 18%, rgba(129,140,248,.26), transparent 32%),
            radial-gradient(circle at 85% 15%, rgba(245,158,11,.18), transparent 30%),
            linear-gradient(135deg, #0f172a, #1e1b4b 58%, #312e81);
          box-shadow: 0 26px 80px rgba(15, 23, 42, 0.22);
        }

        .roi-hero::before {
          content: "";
          position: absolute;
          inset: -60px;
          opacity: .34;
          background-image:
            linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 48px 48px;
          transform: rotate(-8deg);
        }

        .roi-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.15fr .85fr;
          gap: 24px;
          align-items: center;
        }

        .roi-kicker {
          display: inline-flex;
          padding: 8px 13px;
          border-radius: 999px;
          color: #fde68a;
          background: rgba(255, 255, 255, .11);
          border: 1px solid rgba(255, 255, 255, .16);
          font-size: 12px;
          font-weight: 950;
        }

        .roi-hero h1 {
          margin: 16px 0 12px;
          font-size: clamp(34px, 5vw, 64px);
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: -1.2px;
        }

        .roi-hero h1 span {
          display: block;
          color: transparent;
          background: linear-gradient(90deg, #fff, #c7d2fe, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .roi-hero p {
          margin: 0;
          max-width: 780px;
          color: rgba(226,232,240,.9);
          font-size: 15px;
          line-height: 2.05;
          font-weight: 750;
        }

        .roi-progress-card {
          border-radius: 30px;
          padding: 22px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(16px);
        }

        .roi-progress-card span {
          display: block;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .roi-progress-card strong {
          display: block;
          color: #fff;
          font-size: 42px;
          line-height: 1;
          font-weight: 950;
        }

        .roi-progress-track {
          height: 13px;
          border-radius: 999px;
          background: rgba(255,255,255,.14);
          overflow: hidden;
          margin-top: 16px;
        }

        .roi-progress-track i {
          display: block;
          height: 100%;
          border-radius: 999px;
          width: ${result.readinessPercent}%;
          background: linear-gradient(90deg, #fbbf24, #10b981);
        }

        .roi-grid {
          display: grid;
          grid-template-columns: .95fr 1.05fr;
          gap: 18px;
          margin-top: 18px;
        }

        .roi-panel {
          border-radius: 32px;
          padding: 24px;
          background: rgba(255,255,255,.88);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 22px 60px rgba(15,23,42,.08);
          backdrop-filter: blur(18px);
        }

        .roi-panel h2 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 26px;
          font-weight: 950;
          line-height: 1.35;
        }

        .roi-panel > p {
          margin: 0 0 18px;
          color: #64748b;
          line-height: 1.9;
          font-size: 13px;
          font-weight: 750;
        }

        .roi-field {
          margin-bottom: 16px;
        }

        .roi-field label {
          display: block;
          margin-bottom: 8px;
          color: #334155;
          font-size: 13px;
          font-weight: 950;
        }

        .roi-field select,
        .roi-field input[type="number"] {
          width: 100%;
          min-height: 48px;
          border-radius: 18px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #0f172a;
          padding: 0 14px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 850;
          outline: none;
        }

        .roi-field select:focus,
        .roi-field input[type="number"]:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79,70,229,.09);
        }

        .roi-range {
          width: 100%;
          accent-color: #4f46e5;
        }

        .roi-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 7px;
          border-radius: 22px;
          background: #f1f5f9;
          margin-bottom: 16px;
        }

        .roi-switch button {
          border: 0;
          cursor: pointer;
          border-radius: 16px;
          min-height: 42px;
          padding: 10px 12px;
          color: #475569;
          background: transparent;
          font-family: inherit;
          font-weight: 950;
        }

        .roi-switch button.active {
          color: white;
          background: linear-gradient(135deg, #4f46e5, #312e81);
          box-shadow: 0 12px 28px rgba(79,70,229,.20);
        }

        .roi-result-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .roi-result-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 18px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.20);
          box-shadow: 0 14px 38px rgba(15,23,42,.06);
        }

        .roi-result-card::before {
          content: "";
          position: absolute;
          top: -70px;
          right: -70px;
          width: 150px;
          height: 150px;
          border-radius: 999px;
          background: rgba(79,70,229,.10);
        }

        .roi-result-card.gold::before {
          background: rgba(245,158,11,.15);
        }

        .roi-result-card.green::before {
          background: rgba(16,185,129,.14);
        }

        .roi-result-card.red::before {
          background: rgba(244,63,94,.13);
        }

        .roi-result-card span {
          position: relative;
          z-index: 1;
          display: block;
          color: #64748b;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 9px;
        }

        .roi-result-card strong {
          position: relative;
          z-index: 1;
          display: block;
          color: #0f172a;
          font-size: 22px;
          line-height: 1.35;
          font-weight: 950;
        }

        .roi-result-card p {
          position: relative;
          z-index: 1;
          margin: 9px 0 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 750;
        }

        .roi-reading {
          margin-top: 14px;
          border-radius: 26px;
          padding: 18px;
          color: #1e293b;
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.11), transparent 34%),
            #ffffff;
          border: 1px solid rgba(148,163,184,.22);
        }

        .roi-reading h3 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: 19px;
          font-weight: 950;
        }

        .roi-reading p {
          margin: 0;
          color: #475569;
          line-height: 2;
          font-size: 13px;
          font-weight: 800;
        }

        .roi-sources {
          margin-top: 18px;
        }

        .roi-sources-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 12px;
        }

        .roi-source {
          text-decoration: none;
          border-radius: 20px;
          padding: 13px;
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(148,163,184,.22);
          color: #0f172a;
          transition: .2s ease;
        }

        .roi-source:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
        }

        .roi-source strong {
          display: block;
          font-size: 12px;
          line-height: 1.6;
          font-weight: 950;
        }

        .roi-source span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 750;
        }

        .roi-disclaimer {
          margin-top: 16px;
          border-radius: 24px;
          padding: 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #78350f;
          font-size: 12px;
          line-height: 1.95;
          font-weight: 850;
        }

        @media (max-width: 920px) {
          .roi-hero-inner,
          .roi-grid,
          .roi-result-grid,
          .roi-sources-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .roi-page {
            padding: 18px 10px 46px;
          }

          .roi-hero,
          .roi-panel {
            border-radius: 26px;
            padding: 20px;
          }

          .roi-switch {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="roi-wrap">
        <header className="roi-hero">
          <div className="roi-hero-inner">
            <div>
              <span className="roi-kicker">حاسبة العائد من التعلم</span>

              <h1>
                اقرأ جدوى رحلتك
                <span>بأرقام محافظة لا وعود مبالغ فيها</span>
              </h1>

              <p>
                هذه الأداة تربط بين تقدمك الفعلي في رحلة الـ 180 يومًا وبين
                نطاقات سوقية محافظة في الموارد البشرية. الهدف ليس وعدك براتب،
                بل مساعدتك على فهم موقعك الحالي وجدوى الاستثمار في التعلم.
              </p>
            </div>

            <div className="roi-progress-card">
              <span>تقدمك الفعلي داخل الرحلة التعليمية</span>
              <strong>
                {formatNumber(actualCompletedDays)} / {formatNumber(safeTotalDays)}
              </strong>
              <div className="roi-progress-track">
                <i />
              </div>
              <span style={{ marginTop: 12 }}>
                جاهزية التقدم الحالي: {result.readinessPercent}%
              </span>
            </div>
          </div>
        </header>

        <div className="roi-grid">
          <aside className="roi-panel">
            <h2>مدخلات الحاسبة</h2>
            <p>
              عدّل القيم حسب وضعك. يمكنك استخدام تقدمك الفعلي، أو تجربة سيناريو
              افتراضي دون أن يؤثر ذلك على تقدمك الحقيقي في المنصة.
            </p>

            <div className="roi-field">
              <label>المسار الحالي</label>
              <select value={track} onChange={(event) => setTrack(event.target.value)}>
                {Object.entries(TRACKS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="roi-field">
              <label>راتبك الشهري الحالي</label>
              <input
                type="number"
                min="0"
                max="30000"
                value={currentSalary}
                onChange={(event) => setCurrentSalary(Number(event.target.value))}
              />
            </div>

            <div className="roi-field">
              <label>تكلفة البرنامج أو الاستثمار التعليمي</label>
              <input
                type="number"
                min="0"
                max="50000"
                value={courseCost}
                onChange={(event) => setCourseCost(Number(event.target.value))}
              />
            </div>

            <div className="roi-switch" aria-label="مصدر عامل الالتزام">
              <button
                type="button"
                className={useActualProgress ? "active" : ""}
                onClick={() => setUseActualProgress(true)}
              >
                استخدم تقدمي الفعلي
              </button>

              <button
                type="button"
                className={!useActualProgress ? "active" : ""}
                onClick={() => setUseActualProgress(false)}
              >
                جرّب سيناريو التزام
              </button>
            </div>

            {!useActualProgress && (
              <div className="roi-field">
                <label>أيام الالتزام الافتراضية: {formatNumber(effectiveDays)} يوم</label>
                <input
                  className="roi-range"
                  type="range"
                  min="1"
                  max={safeTotalDays}
                  value={scenarioDays}
                  onChange={(event) => setScenarioDays(Number(event.target.value))}
                />
              </div>
            )}

            <div className="roi-reading">
              <h3>{activeTrack.shortTitle}</h3>
              <p>{activeTrack.description}</p>
            </div>
          </aside>

          <main className="roi-panel">
            <h2>قراءة النتيجة</h2>
            <p>
              النتائج أدناه تقديرية ومحافظة. تم تعديل النطاقات بالقيمة الحقيقية
              بعد تضخم افتراضي قدره {(DEFAULT_INFLATION_RATE * 100).toFixed(1)}%.
            </p>

            <div className="roi-result-grid">
              <div className="roi-result-card">
                <span>مستوى الالتزام</span>
                <strong>{result.readinessPercent}%</strong>
                <p>{result.commitmentMessage}</p>
              </div>

              <div className="roi-result-card gold">
                <span>النطاق السوقي الاسمي</span>
                <strong>
                  {formatCurrency(result.nominalLow)} - {formatCurrency(result.nominalHigh)}
                </strong>
                <p>يعرض النطاق العام قبل خصم أثر التضخم.</p>
              </div>

              <div className="roi-result-card green">
                <span>النطاق الحقيقي بعد التضخم</span>
                <strong>
                  {formatCurrency(result.realLow)} - {formatCurrency(result.realHigh)}
                </strong>
                <p>تقدير أكثر تحفظًا للقيمة الشرائية الفعلية.</p>
              </div>

              <div className="roi-result-card">
                <span>موقعك الحالي من النطاق</span>
                <strong>{result.position.label}</strong>
                <p>{result.position.text}</p>
              </div>

              <div className="roi-result-card green">
                <span>الزيادة الشهرية المحافظة المحتملة</span>
                <strong>{formatCurrency(result.monthlyDelta)}</strong>
                <p>
                  مرتبطة بعامل الالتزام، وليست ضمانًا لزيادة الراتب.
                </p>
              </div>

              <div className="roi-result-card red">
                <span>فترة استرداد الاستثمار</span>
                <strong>
                  {result.paybackWeeks
                    ? `${formatNumber(result.paybackWeeks)} أسبوع`
                    : "غير مناسبة للحساب المباشر"}
                </strong>
                <p>
                  تظهر فقط عندما توجد زيادة شهرية محافظة قابلة للحساب.
                </p>
              </div>
            </div>

            <div className="roi-reading">
              <h3>التفسير المهني</h3>
              <p>
                {track === "careerShift" && result.mode === "career-shift-non-direct"
                  ? "بما أنك قادم من مجال آخر وراتبك الحالي أعلى من نطاق الدخول المحافظ في الموارد البشرية، فالعائد المالي المباشر ليس القراءة الصحيحة. القراءة الأصدق هنا هي جدوى بناء مسار جديد وتقليل التخبط ورفع جاهزيتك للمنافسة."
                  : activeTrack.insight}
              </p>
            </div>

            <div className="roi-reading">
              <h3>العائد الصافي التقديري</h3>
              <p>
                {result.roi === null
                  ? "لا يظهر عائد صافي مباشر لأن الزيادة الشهرية المحافظة غير موجبة أو لأن تكلفة البرنامج غير مدخلة. هذا لا يعني أن التعلم بلا قيمة، بل يعني أن العائد هنا غير مالي مباشر أو يحتاج مسارًا مهنيًا مختلفًا."
                  : `العائد الصافي التقديري يساوي تقريبًا ${formatNumber(result.roi)}% وفق المدخلات الحالية، بعد خصم تكلفة البرنامج من الزيادة السنوية المحافظة.`}
              </p>
            </div>
          </main>
        </div>

        <section className="roi-panel roi-sources">
          <h2>منهجية الحاسبة ومصادر البيانات</h2>
          <p>
            اعتمدت الأداة على نطاقات محافظة قابلة للتحديث، وعلى مصادر رسمية
            وسوقية متعددة. راجع هذه المصادر دوريًا قبل تثبيت أي نطاقات نهائية.
          </p>

          <div className="roi-sources-grid">
            {SOURCES.map((source) => (
              <a
                className="roi-source"
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                <strong>{source.name}</strong>
                <span>{source.type}</span>
              </a>
            ))}
          </div>

          <div className="roi-disclaimer">
            تنويه: هذه الحاسبة أداة تقديرية محافظة، ولا تمثل وعدًا وظيفيًا أو
            ضمانًا للدخل. النتائج الفعلية تتأثر بتوفيق الله، ثم المدينة، نوع
            الجهة، سنوات الخبرة، جودة السيرة الذاتية، المقابلات، مستوى التطبيق،
            والظروف السوقية وقت التقديم.
          </div>
        </section>
      </div>
    </section>
  );
}
