import { useMemo, useState } from "react";

const TOTAL_JOURNEY_DAYS = 180;
const DEFAULT_INFLATION_RATE = 0.019;

/*
  حاسبة العائد من التعلم
  الفكرة الجديدة:
  - التعلم مجاني، لذلك لا نحسب "استرداد تكلفة دورة".
  - نحسب "قيمة التعلم المجاني" بوصفها فرصة مهنية محافظة:
    موقعك من السوق + تقدمك الفعلي + سنوات خبرتك + قوة تطبيقك.
  - الأداة تقديرية وليست وعدًا وظيفيًا.
*/

const TRACKS = {
  graduate: {
    title: "خريج جديد / باحث عن عمل",
    shortTitle: "بداية المسار",
    description:
      "تقيس الحاسبة هنا جدوى دخولك لمسار الموارد البشرية من نقطة البداية، مع قراءة محافظة لموقعك المتوقع عند بناء أساس مهني منظم.",
    baseRange: { low: 6000, mid: 7500, high: 9000 },
    experienceMode: "entry",
    directIncreaseAllowed: true,
    insight:
      "أنت لا تدفع رسومًا للتعلم، لذلك القيمة هنا تظهر في تقليل التخبط، بناء لغة مهنية، وتحسين جاهزيتك للمنافسة على وظائف البداية."
  },
  practitioner: {
    title: "ممارس موارد بشرية يريد التطوير والترقية",
    shortTitle: "تطوير داخل المجال",
    description:
      "تقيس الحاسبة هنا كيف يلتقي تقدمك في الرحلة مع خبرتك الحالية داخل الموارد البشرية، لتقدير موقعك المحافظ داخل نطاقات السوق.",
    baseRange: { low: 9000, mid: 12000, high: 15000 },
    experienceMode: "hr",
    directIncreaseAllowed: true,
    insight:
      "لأنك داخل المجال أصلًا، فإن العائد المحتمل يظهر في رفع جودة حكمك المهني ودعم انتقالك إلى نطاق أفضل عند توفر الخبرة والتطبيق."
  },
  careerShift: {
    title: "أعمل في مجال آخر وأريد تغيير مساري المهني",
    shortTitle: "تغيير المسار",
    description:
      "تقيس الحاسبة هنا قيمة الانتقال الذكي إلى الموارد البشرية، دون افتراض زيادة مباشرة فوق راتبك الحالي في مجالك القديم.",
    baseRange: { low: 7000, mid: 8250, high: 9500 },
    experienceMode: "transfer",
    directIncreaseAllowed: false,
    insight:
      "إذا كان راتبك الحالي أعلى من نطاق البداية في الموارد البشرية، فالعائد ليس زيادة فورية؛ بل بناء مسار جديد بوعي وتقليل زمن التخبط."
  }
};

const APPLICATION_LEVELS = [
  {
    value: 1,
    title: "أقرأ فقط",
    description: "تستهلك المحتوى دون تطبيق واضح.",
    multiplier: 0.62
  },
  {
    value: 2,
    title: "أدوّن وألخص",
    description: "تحول التعلم إلى ملاحظات منظمة.",
    multiplier: 0.76
  },
  {
    value: 3,
    title: "أحلل حالات",
    description: "تطبق المفاهيم على حالات واقعية أو محاكاة.",
    multiplier: 0.9
  },
  {
    value: 4,
    title: "أبني نماذج عمل",
    description: "تخرج من التعلم بأدوات وقوالب قابلة للاستخدام.",
    multiplier: 1
  },
  {
    value: 5,
    title: "أطبق وأوثّق الأثر",
    description: "تربط التعلم بمخرجات وسلوك وقرارات قابلة للقياس.",
    multiplier: 1.12
  }
];

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

function getExperienceStage(years) {
  const value = clamp(years, 0, 25);

  if (value < 1) {
    return {
      label: "بداية مهنية",
      factor: 0.86,
      description: "خبرتك ما زالت في بدايتها، لذلك تقرأ الحاسبة النطاق بحذر أكبر."
    };
  }

  if (value < 3) {
    return {
      label: "خبرة ناشئة",
      factor: 0.95,
      description: "لديك بداية خبرة تساعدك على فهم بيئة العمل، لكن ما زالت تحتاج إلى توثيق وتطبيق."
    };
  }

  if (value < 6) {
    return {
      label: "خبرة متوسطة",
      factor: 1.08,
      description: "خبرتك تعطيك قدرة أفضل على ربط التعلم بسياقات العمل ومشكلات المنظمات."
    };
  }

  if (value < 10) {
    return {
      label: "خبرة ناضجة",
      factor: 1.2,
      description: "لديك رصيد مهني يساعدك على تحويل التعلم إلى أحكام أعمق ومخرجات أقوى."
    };
  }

  return {
    label: "خبرة قيادية / ممتدة",
    factor: 1.32,
    description: "خبرتك الكبيرة قد تجعل أثر التعلم أكبر إذا ربطته بالتشخيص والقيادة وصناعة القرار."
  };
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
    text: "راتبك الحالي أعلى من النطاق المحافظ لهذا المسار؛ لذلك لا يصح تقديم النتيجة كزيادة مباشرة."
  };
}

function getCommitmentMessage(days, readiness) {
  if (days < 30) {
    return "التزامك الحالي يعطيك لمحة تأسيسية، لكنه غير كافٍ لبناء جاهزية مهنية مؤثرة.";
  }

  if (days < 90) {
    return "التزامك جيد كبداية، لكنه يحتاج استمرارًا حتى يظهر أثر أقوى في اللغة المهنية والحكم الاستشاري.";
  }

  if (days < 180) {
    return "أنت في منطقة جدية؛ كلما اقتربت من إتمام الرحلة زادت موثوقية الأثر المهني المتوقع.";
  }

  return "أكملت عامل الالتزام الكامل؛ هذا يعطي أعلى جاهزية تعليمية داخل هذه الحاسبة.";
}

function getReadinessLabel(score) {
  if (score >= 85) return "جاهزية عالية";
  if (score >= 68) return "جاهزية جيدة";
  if (score >= 50) return "جاهزية نامية";
  if (score >= 30) return "جاهزية أولية";
  return "جاهزية محدودة";
}

export default function LearningROICalculator({
  completedDays = 0,
  totalDays = TOTAL_JOURNEY_DAYS
}) {
  const safeTotalDays = Math.max(1, Number(totalDays || TOTAL_JOURNEY_DAYS));
  const actualCompletedDays = clamp(completedDays, 0, safeTotalDays);

  const [track, setTrack] = useState("practitioner");
  const [yearsOfExperience, setYearsOfExperience] = useState(2);
  const [currentSalary, setCurrentSalary] = useState(8000);
  const [applicationLevel, setApplicationLevel] = useState(3);
  const [useActualProgress, setUseActualProgress] = useState(true);
  const [scenarioDays, setScenarioDays] = useState(actualCompletedDays || 30);

  const activeTrack = TRACKS[track];
  const activeApplication =
    APPLICATION_LEVELS.find((item) => item.value === Number(applicationLevel)) ||
    APPLICATION_LEVELS[2];

  const effectiveDays = useActualProgress
    ? actualCompletedDays
    : clamp(scenarioDays, 1, safeTotalDays);

  const result = useMemo(() => {
    const progressFactor = clamp(effectiveDays / safeTotalDays, 0, 1);
    const experienceStage = getExperienceStage(yearsOfExperience);
    const applicationFactor = activeApplication.multiplier;
    const rawRange = activeTrack.baseRange;

    const adjustedLow = rawRange.low * experienceStage.factor * (0.78 + progressFactor * 0.22);
    const adjustedMid = rawRange.mid * experienceStage.factor * (0.82 + progressFactor * 0.18) * applicationFactor;
    const adjustedHigh = rawRange.high * experienceStage.factor * (0.84 + progressFactor * 0.16) * applicationFactor;

    const inflationFactor = 1 + DEFAULT_INFLATION_RATE;

    const realLow = adjustedLow / inflationFactor;
    const realMid = adjustedMid / inflationFactor;
    const realHigh = adjustedHigh / inflationFactor;

    const current = Number(currentSalary || 0);

    let monthlyOpportunity = Math.max(0, realLow - current);
    let mode = "direct";

    if (track === "careerShift" && current > realLow) {
      mode = "career-shift-non-direct";
      monthlyOpportunity = 0;
    }

    const position = getPositionLabel(current, {
      low: realLow,
      mid: realMid,
      high: realHigh
    });

    const progressScore = progressFactor * 45;
    const experienceScore = Math.min(25, experienceStage.factor * 18);
    const applicationScore = (applicationLevel / 5) * 20;
    const marketScore = current <= realHigh ? 10 : 5;
    const readinessScore = Math.round(
      clamp(progressScore + experienceScore + applicationScore + marketScore, 0, 100)
    );

    return {
      progressFactor,
      readinessPercent: Math.round(progressFactor * 100),
      readinessScore,
      readinessLabel: getReadinessLabel(readinessScore),
      experienceStage,
      nominalLow: adjustedLow,
      nominalMid: adjustedMid,
      nominalHigh: adjustedHigh,
      realLow,
      realMid,
      realHigh,
      monthlyOpportunity,
      annualOpportunity: monthlyOpportunity * 12,
      mode,
      position,
      commitmentMessage: getCommitmentMessage(effectiveDays, progressFactor)
    };
  }, [
    activeApplication,
    activeTrack,
    applicationLevel,
    currentSalary,
    effectiveDays,
    safeTotalDays,
    track,
    yearsOfExperience
  ]);

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

        .application-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          margin-top: 8px;
        }

        .application-pill {
          border: 1px solid rgba(148,163,184,.22);
          border-radius: 16px;
          padding: 10px 8px;
          background: #fff;
          color: #334155;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 950;
          line-height: 1.5;
        }

        .application-pill.active {
          color: white;
          background: linear-gradient(135deg, #4f46e5, #312e81);
          border-color: transparent;
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

        .impact-path {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 14px;
        }

        .impact-step {
          border-radius: 20px;
          padding: 14px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.20);
        }

        .impact-step b {
          display: inline-flex;
          width: 26px;
          height: 26px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: white;
          background: #4f46e5;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .impact-step strong {
          display: block;
          color: #0f172a;
          font-size: 13px;
          font-weight: 950;
          line-height: 1.6;
        }

        .impact-step span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 750;
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
          .roi-sources-grid,
          .impact-path {
            grid-template-columns: 1fr;
          }

          .application-grid {
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
                تعلّم مجاني
                <span>وقيمة مهنية تُقاس بذكاء</span>
              </h1>

              <p>
                هذه الأداة لا تحسب استرداد رسوم؛ لأن التعلم هنا مجاني. بدلًا من
                ذلك، تقرأ أثر تقدمك، سنوات خبرتك، ومستوى تطبيقك على جاهزيتك
                المهنية وموقعك المحافظ داخل سوق الموارد البشرية.
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
            <h2>مدخلات القراءة</h2>
            <p>
              عدّل القيم حسب وضعك. لا توجد تكلفة برنامج هنا؛ الحاسبة تقيس قيمة
              التعلم المجاني عندما يتحول إلى تقدم وخبرة وتطبيق.
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
              <label>سنوات الخبرة العملية</label>
              <input
                type="number"
                min="0"
                max="25"
                value={yearsOfExperience}
                onChange={(event) => setYearsOfExperience(Number(event.target.value))}
              />
            </div>

            <div className="roi-field">
              <label>راتبك الشهري الحالي</label>
              <input
                type="number"
                min="0"
                max="50000"
                value={currentSalary}
                onChange={(event) => setCurrentSalary(Number(event.target.value))}
              />
            </div>

            <div className="roi-field">
              <label>كيف تطبق ما تتعلمه؟</label>
              <div className="application-grid">
                {APPLICATION_LEVELS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`application-pill ${
                      item.value === Number(applicationLevel) ? "active" : ""
                    }`}
                    onClick={() => setApplicationLevel(item.value)}
                    title={item.description}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
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
              القراءة تقديرية ومحافظة، وتخصم أثر تضخم افتراضي قدره{" "}
              {(DEFAULT_INFLATION_RATE * 100).toFixed(1)}% من القيمة السوقية.
            </p>

            <div className="roi-result-grid">
              <div className="roi-result-card">
                <span>مؤشر الجاهزية المهنية</span>
                <strong>{result.readinessScore}% · {result.readinessLabel}</strong>
                <p>{result.commitmentMessage}</p>
              </div>

              <div className="roi-result-card gold">
                <span>مرحلة الخبرة</span>
                <strong>{result.experienceStage.label}</strong>
                <p>{result.experienceStage.description}</p>
              </div>

              <div className="roi-result-card green">
                <span>النطاق الحقيقي المحافظ</span>
                <strong>
                  {formatCurrency(result.realLow)} - {formatCurrency(result.realHigh)}
                </strong>
                <p>نطاق تقديري بعد أثر التضخم، وليس وعدًا وظيفيًا.</p>
              </div>

              <div className="roi-result-card">
                <span>موقعك الحالي من النطاق</span>
                <strong>{result.position.label}</strong>
                <p>{result.position.text}</p>
              </div>

              <div className="roi-result-card green">
                <span>فرصة التحسن الشهرية المحافظة</span>
                <strong>{formatCurrency(result.monthlyOpportunity)}</strong>
                <p>
                  تظهر فقط عندما يكون الراتب الحالي أقل من الحد المحافظ للنطاق.
                </p>
              </div>

              <div className="roi-result-card red">
                <span>قيمة التعلم المجاني</span>
                <strong>
                  {result.annualOpportunity > 0
                    ? formatCurrency(result.annualOpportunity)
                    : "قيمة غير مالية مباشرة"}
                </strong>
                <p>
                  لأن التعلم مجاني، لا نحسب استرداد تكلفة، بل نقرأ فرصة التحسن أو تقليل التخبط.
                </p>
              </div>
            </div>

            <div className="roi-reading">
              <h3>التفسير المهني</h3>
              <p>
                {track === "careerShift" && result.mode === "career-shift-non-direct"
                  ? "بما أنك قادم من مجال آخر وراتبك الحالي أعلى من نطاق الدخول المحافظ في الموارد البشرية، فالعائد المالي المباشر ليس القراءة الصحيحة. القيمة هنا في بناء مسار جديد بوعي، واختصار التخبط، ورفع جاهزيتك للمنافسة على بداية صحيحة."
                  : activeTrack.insight}
              </p>
            </div>

            <div className="roi-reading">
              <h3>مسار الأثر داخل الأداة</h3>
              <div className="impact-path">
                <div className="impact-step">
                  <b>1</b>
                  <strong>تقدم فعلي</strong>
                  <span>{formatNumber(effectiveDays)} يوم من أصل {formatNumber(safeTotalDays)}</span>
                </div>

                <div className="impact-step">
                  <b>2</b>
                  <strong>خبرة وتطبيق</strong>
                  <span>{result.experienceStage.label} · {activeApplication.title}</span>
                </div>

                <div className="impact-step">
                  <b>3</b>
                  <strong>جاهزية مهنية</strong>
                  <span>{result.readinessScore}% · {result.readinessLabel}</span>
                </div>

                <div className="impact-step">
                  <b>4</b>
                  <strong>قراءة سوقية</strong>
                  <span>{result.position.label}</span>
                </div>
              </div>
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
