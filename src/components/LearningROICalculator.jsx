import { useMemo, useState } from "react";

const TOTAL_JOURNEY_DAYS = 180;
const DEFAULT_INFLATION_RATE = 0.019;

/*
  حاسبة العائد من التعلم
  نسخة مبتكرة ومجانية:
  - لا توجد تكلفة برنامج لأن المنصة مجانية.
  - تقيس قيمة التعلم من خلال: التقدم الفعلي + سنوات الخبرة + عمق التطبيق + بيئة السوق المستهدفة.
  - تعرض قراءة محافظة، لا وعدا وظيفيا.
*/

const TRACKS = {
  graduate: {
    title: "خريج جديد / باحث عن عمل",
    shortTitle: "بداية المسار",
    description:
      "تقرأ الحاسبة هنا قيمة بناء الأساس المهني من نقطة البداية: لغة الموارد البشرية، فهم الأدوار، وتحسين جاهزية الدخول للمقابلات.",
    baseRange: { low: 6000, mid: 7500, high: 9000 },
    directIncreaseAllowed: true,
    mainValue: "تقليل التشتت وبناء بداية مهنية أوضح"
  },
  practitioner: {
    title: "ممارس موارد بشرية يريد التطوير والترقية",
    shortTitle: "تطوير داخل المجال",
    description:
      "تقرأ الحاسبة أثر تقدمك وخبرتك وتطبيقك على انتقالك من ممارسة تشغيلية إلى حكم مهني أكثر نضجا داخل الموارد البشرية.",
    baseRange: { low: 9000, mid: 12000, high: 15000 },
    directIncreaseAllowed: true,
    mainValue: "رفع جودة الحكم المهني ودعم فرص الترقية"
  },
  careerShift: {
    title: "أعمل في مجال آخر وأريد تغيير مساري المهني",
    shortTitle: "تغيير المسار",
    description:
      "تقرأ الحاسبة قيمة الانتقال الذكي دون افتراض زيادة فورية فوق راتبك الحالي في مجالك القديم.",
    baseRange: { low: 7000, mid: 8250, high: 9500 },
    directIncreaseAllowed: false,
    mainValue: "اختصار التخبط وبناء مسار جديد بوعي"
  }
};

const MARKET_CONTEXTS = {
  conservative: {
    title: "جهة صغيرة أو بداية محافظة",
    multiplier: 0.92,
    text: "قراءة حذرة تناسب البدايات أو الجهات ذات الميزانيات المحدودة."
  },
  balanced: {
    title: "سوق متوازن",
    multiplier: 1,
    text: "قراءة وسطية محافظة تناسب أغلب الفرص المهنية."
  },
  competitive: {
    title: "جهة كبرى أو سوق تنافسي",
    multiplier: 1.12,
    text: "قراءة أعلى قليلا، لكنها تظل مشروطة بجودة الخبرة والمقابلة والتطبيق."
  }
};

const APPLICATION_LEVELS = [
  {
    value: 1,
    title: "أقرأ فقط",
    short: "استهلاك",
    description: "تتعرف على المفاهيم دون تحويلها إلى ممارسة.",
    multiplier: 0.62,
    icon: "قراءة"
  },
  {
    value: 2,
    title: "أدون وألخص",
    short: "تنظيم",
    description: "تحول التعلم إلى ملاحظات ولغة مهنية مرتبة.",
    multiplier: 0.76,
    icon: "تدوين"
  },
  {
    value: 3,
    title: "أحلل حالات",
    short: "تحليل",
    description: "تستخدم المفاهيم في قراءة مواقف ومشكلات حقيقية.",
    multiplier: 0.9,
    icon: "تحليل"
  },
  {
    value: 4,
    title: "أبني نماذج عمل",
    short: "إنتاج",
    description: "تخرج من التعلم بقوالب وأدوات قابلة للاستخدام.",
    multiplier: 1,
    icon: "نماذج"
  },
  {
    value: 5,
    title: "أطبق وأوثق الأثر",
    short: "أثر",
    description: "تربط التعلم بسلوك وقرار ونتيجة قابلة للقياس.",
    multiplier: 1.12,
    icon: "أثر"
  }
];

const SOURCES = [
  {
    name: "الهيئة العامة للإحصاء",
    type: "المرجع الرسمي للإحصاءات في السعودية",
    year: "2025 - 2026",
    url: "https://www.stats.gov.sa"
  },
  {
    name: "نشرة سوق العمل من الهيئة العامة للإحصاء",
    type: "مؤشرات العمل والأجور والبطالة",
    year: "2025",
    url: "https://www.stats.gov.sa/documents/d/guest/labor-market-statistics-q2-2025-en"
  },
  {
    name: "مؤشر أسعار المستهلك من الهيئة العامة للإحصاء",
    type: "تضخم وقيمة حقيقية للدخل",
    year: "2025",
    url: "https://www.stats.gov.sa/en/w/news/116"
  },
  {
    name: "منصة البيانات السعودية",
    type: "مؤشرات وطنية مساندة",
    year: "2025 - 2026",
    url: "https://datasaudi.sa"
  },
  {
    name: "وزارة الموارد البشرية والتنمية الاجتماعية",
    type: "تنظيمات العمل والتوطين",
    year: "2025 - 2026",
    url: "https://hrsd.gov.sa"
  },
  {
    name: "منصة قوى",
    type: "منصة رسمية للعقود والعمل والخدمات",
    year: "2025 - 2026",
    url: "https://www.qiwa.sa"
  },
  {
    name: "قرار احتساب السعودي في نطاقات",
    type: "حد تنظيمي مرجعي لا يعبر وحده عن راتب السوق",
    year: "مرجع تنظيمي",
    url: "https://www.spa.gov.sa/2160616"
  },
  {
    name: "Cooper Fitch KSA Salary Guide",
    type: "دليل رواتب السعودية",
    year: "2026",
    url: "https://cooperfitch.ae/2026-ksa-salary-guide/"
  },
  {
    name: "Cooper Fitch Saudi Arabia Salary Guide",
    type: "منهجية وتعويضات وسوق السعودية",
    year: "سنوي",
    url: "https://cooperfitch.ae/salary-guides/kingdom-of-saudi-arabia/"
  },
  {
    name: "Hays Saudi Arabia Salary Guide",
    type: "أكثر من 200 دور ومؤشرات توظيف",
    year: "2026",
    url: "https://www.hays.ae/salary-guide/saudi-arabia-salary-guide"
  },
  {
    name: "Robert Walters Saudi Arabia Salary Survey",
    type: "استطلاع رواتب واتجاهات مهنية",
    year: "2026",
    url: "https://www.robertwalters.ae/our-services/saudi-arabia-salary-survey.html"
  },
  {
    name: "Mercer Total Remuneration Survey",
    type: "تعويضات ومزايا ومقارنات سوقية",
    year: "2025 - 2026",
    url: "https://www.mercer.com/en-sa/insights/events/mercer-compensation-and-benefits-survey/"
  },
  {
    name: "Mercer Global Compensation Data",
    type: "قاعدة بيانات عالمية للتعويضات والمزايا",
    year: "2025 - 2026",
    url: "https://www.mercer.com/en-sa/solutions/talent-and-rewards/rewards-strategy/global-compensation-and-benefits-data/"
  },
  {
    name: "Michael Page Saudi Arabia Jobs and Salary Guide",
    type: "سوق التوظيف وروابط أدلة الرواتب",
    year: "2026",
    url: "https://www.michaelpage.ae/jobs/saudi-arabia"
  },
  {
    name: "CIPD Learning and Development",
    type: "أثر التعلم والتطوير على المهنة",
    year: "2025",
    url: "https://www.cipd.org/en/knowledge/factsheets/strategy-development-factsheet/"
  },
  {
    name: "SHRM Certification",
    type: "مرجعية مهنية في الموارد البشرية",
    year: "2025 - 2026",
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
      score: 10,
      description: "خبرتك ما زالت في البداية، لذلك تقرأ الحاسبة النطاق بحذر أكبر."
    };
  }

  if (value < 3) {
    return {
      label: "خبرة ناشئة",
      factor: 0.95,
      score: 15,
      description: "لديك بداية خبرة تساعدك على فهم بيئة العمل، لكنها تحتاج إلى توثيق وتطبيق."
    };
  }

  if (value < 6) {
    return {
      label: "خبرة متوسطة",
      factor: 1.08,
      score: 20,
      description: "خبرتك تساعدك على ربط التعلم بسياقات العمل ومشكلات المنظمات."
    };
  }

  if (value < 10) {
    return {
      label: "خبرة ناضجة",
      factor: 1.2,
      score: 23,
      description: "لديك رصيد مهني يساعدك على تحويل التعلم إلى أحكام أعمق ومخرجات أقوى."
    };
  }

  return {
    label: "خبرة قيادية أو ممتدة",
    factor: 1.32,
    score: 25,
    description: "خبرتك الكبيرة تجعل أثر التعلم أعلى عندما تربطه بالتشخيص والقيادة وصناعة القرار."
  };
}

function getPositionLabel(currentSalary, range) {
  if (currentSalary <= 0) {
    return {
      label: "نقطة بداية",
      tone: "neutral",
      text: "ستقرأ النتيجة باعتبارك في بداية أو انتقال، وليس كمقارنة مباشرة مع راتب قائم."
    };
  }

  if (currentSalary < range.low) {
    return {
      label: "أقل من النطاق المحافظ",
      tone: "positive",
      text: "توجد فجوة واضحة بين وضعك الحالي والحد الأدنى المحافظ للنطاق المستهدف."
    };
  }

  if (currentSalary <= range.high) {
    return {
      label: "داخل النطاق السوقي",
      tone: "balanced",
      text: "أنت داخل النطاق المتوقع تقريبا، والعائد يعتمد على انتقالك داخل النطاق لا مجرد دخوله."
    };
  }

  return {
    label: "أعلى من النطاق المحافظ",
    tone: "caution",
    text: "راتبك الحالي أعلى من النطاق المحافظ، لذلك لا يصح تقديم النتيجة كزيادة مباشرة."
  };
}

function getCommitmentMessage(days) {
  if (days < 30) {
    return "تقدمك الحالي يعطي لمحة تأسيسية، لكنه لا يكفي وحده لصناعة نقلة مهنية واضحة.";
  }

  if (days < 90) {
    return "تقدمك جيد كبداية، لكنه يحتاج استمرار حتى يظهر أثر أقوى في اللغة المهنية والحكم الاستشاري.";
  }

  if (days < 180) {
    return "أنت في منطقة جدية. الاقتراب من إتمام الرحلة يزيد موثوقية الأثر المهني المتوقع.";
  }

  return "أكملت عامل الالتزام الكامل. هذه أعلى جاهزية تعليمية داخل الحاسبة.";
}

function getReadinessLabel(score) {
  if (score >= 86) return "جاهزية عالية";
  if (score >= 70) return "جاهزية قوية";
  if (score >= 54) return "جاهزية نامية";
  if (score >= 36) return "جاهزية أولية";
  return "جاهزية محدودة";
}

function getNextMove(score, track, applicationLevel) {
  if (score < 36) {
    return "ابدأ بتثبيت الأساس: أكمل أول شهر، واكتب ملخصا عمليا بعد كل درس، ولا تتعجل مقارنة نفسك بالسوق.";
  }

  if (score < 54) {
    return "انتقل من القراءة إلى التحليل: اختر حالة من المحاكاة يوميا، واكتب فرضية وبيانات وتدخل ومؤشر أثر.";
  }

  if (score < 70) {
    return "ابن ملفا مهنيا صغيرا: وصف وظيفي، نموذج تشخيص، مصفوفة صلاحيات، ومؤشر قياس أثر.";
  }

  if (score < 86) {
    return "حول التعلم إلى دليل عمل: اربط كل مفهوم بمشكلة واقعية، وجهز أمثلة مقابلات من تطبيقك الشخصي.";
  }

  if (track === "careerShift") {
    return "جهز قصة انتقالك المهني: لماذا الموارد البشرية؟ ما القيمة المنقولة من خبرتك السابقة؟ وما أول دور تستهدفه؟";
  }

  if (applicationLevel < 5) {
    return "للوصول إلى أثر أعلى، وثق تطبيقاتك: ما المشكلة؟ ما الفرضية؟ ما التدخل؟ وما تغير بعده؟";
  }

  return "جاهزيتك قوية. ركز الآن على السيرة المهنية، محاكاة المقابلات، وتوثيق مشاريع صغيرة تثبت فهمك.";
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
  const [marketContext, setMarketContext] = useState("balanced");
  const [useActualProgress, setUseActualProgress] = useState(true);
  const [scenarioDays, setScenarioDays] = useState(actualCompletedDays || 30);
  const [showSources, setShowSources] = useState(false);

  const activeTrack = TRACKS[track];
  const activeMarket = MARKET_CONTEXTS[marketContext];
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

    const progressLift = 0.74 + progressFactor * 0.26;
    const marketFactor = activeMarket.multiplier;

    const adjustedLow =
      rawRange.low * experienceStage.factor * progressLift * marketFactor;
    const adjustedMid =
      rawRange.mid *
      experienceStage.factor *
      (0.8 + progressFactor * 0.2) *
      applicationFactor *
      marketFactor;
    const adjustedHigh =
      rawRange.high *
      experienceStage.factor *
      (0.82 + progressFactor * 0.18) *
      applicationFactor *
      marketFactor;

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

    const progressScore = progressFactor * 42;
    const experienceScore = experienceStage.score;
    const applicationScore = (Number(applicationLevel) / 5) * 23;
    const marketScore = current <= realHigh ? 10 : 5;

    const readinessScore = Math.round(
      clamp(progressScore + experienceScore + applicationScore + marketScore, 0, 100)
    );

    return {
      progressFactor,
      readinessPercent: Math.round(progressFactor * 100),
      readinessScore,
      readinessLabel: getReadinessLabel(readinessScore),
      nextMove: getNextMove(readinessScore, track, Number(applicationLevel)),
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
      commitmentMessage: getCommitmentMessage(effectiveDays)
    };
  }, [
    activeApplication,
    activeMarket,
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
            radial-gradient(circle at 10% 10%, rgba(79,70,229,.12), transparent 30%),
            radial-gradient(circle at 94% 14%, rgba(245,158,11,.13), transparent 28%),
            radial-gradient(circle at 48% 96%, rgba(16,185,129,.10), transparent 34%),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 54%, #fff7ed 100%);
        }

        .roi-wrap {
          width: min(1200px, 100%);
          margin: 0 auto;
        }

        .roi-hero {
          position: relative;
          overflow: hidden;
          border-radius: 42px;
          padding: 34px;
          color: white;
          background:
            radial-gradient(circle at 15% 18%, rgba(129,140,248,.26), transparent 32%),
            radial-gradient(circle at 85% 15%, rgba(245,158,11,.17), transparent 30%),
            linear-gradient(135deg, #0f172a, #1e1b4b 58%, #312e81);
          box-shadow: 0 26px 80px rgba(15, 23, 42, 0.20);
        }

        .roi-hero::before {
          content: "";
          position: absolute;
          inset: -60px;
          opacity: .30;
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
          grid-template-columns: 1.12fr .88fr;
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
          line-height: 1.16;
          font-weight: 950;
          letter-spacing: -1.1px;
          padding-top: 4px;
          overflow: visible;
        }

        .roi-hero h1 span {
          display: block;
          color: transparent;
          background: linear-gradient(90deg, #fff, #c7d2fe, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
          padding-top: 3px;
        }

        .roi-hero p {
          margin: 0;
          max-width: 780px;
          color: rgba(226,232,240,.9);
          font-size: 15px;
          line-height: 2.05;
          font-weight: 750;
        }

        .roi-orbit {
          display: grid;
          place-items: center;
          min-height: 310px;
        }

        .roi-orbit-card {
          position: relative;
          width: min(300px, 100%);
          aspect-ratio: 1;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background:
            conic-gradient(#10b981 ${result.readinessScore * 3.6}deg, rgba(255,255,255,.13) 0deg);
          box-shadow:
            inset 0 0 0 15px rgba(15,23,42,.42),
            0 24px 70px rgba(0,0,0,.20);
        }

        .roi-orbit-inner {
          width: 205px;
          height: 205px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          text-align: center;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,.14);
          padding: 18px;
        }

        .roi-orbit-inner span {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 900;
        }

        .roi-orbit-inner strong {
          display: block;
          color: #fff;
          font-size: 48px;
          line-height: 1;
          font-weight: 950;
          margin: 8px 0;
        }

        .roi-orbit-inner b {
          color: #fde68a;
          font-size: 13px;
          font-weight: 950;
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
          min-height: 58px;
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
          font-size: 21px;
          line-height: 1.35;
          font-weight: 950;
        }

        .roi-result-card p {
          position: relative;
          z-index: 1;
          margin: 9px 0 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.85;
          font-weight: 750;
        }

        .value-map {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
        }

        .value-step {
          border-radius: 22px;
          padding: 15px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.20);
        }

        .value-step b {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          color: white;
          background: #4f46e5;
          margin-bottom: 8px;
          font-size: 11px;
          line-height: 1;
        }

        .value-step strong {
          display: block;
          color: #0f172a;
          font-size: 13px;
          font-weight: 950;
          line-height: 1.6;
        }

        .value-step span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.75;
          font-weight: 750;
        }

        .roi-reading {
          margin-top: 14px;
          border-radius: 26px;
          padding: 18px;
          color: #1e293b;
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.10), transparent 34%),
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

        .roi-sources-toggle {
          display: flex;
          justify-content: center;
          margin-top: 14px;
        }

        .roi-sources-toggle button {
          border: 0;
          cursor: pointer;
          border-radius: 18px;
          padding: 12px 16px;
          color: #fff;
          background: #0f172a;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
        }

        .roi-sources-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
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

        .roi-source small {
          display: inline-flex;
          margin-top: 8px;
          padding: 4px 8px;
          border-radius: 999px;
          color: #3730a3;
          background: #eef2ff;
          font-size: 10px;
          font-weight: 950;
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

        @media (max-width: 980px) {
          .roi-hero-inner,
          .roi-grid,
          .roi-result-grid,
          .roi-sources-grid,
          .value-map {
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

          .roi-orbit-card {
            width: 240px;
          }

          .roi-orbit-inner {
            width: 165px;
            height: 165px;
          }
        }
      `}</style>

      <div className="roi-wrap">
        <header className="roi-hero">
          <div className="roi-hero-inner">
            <div>
              <span className="roi-kicker">حاسبة العائد من التعلم</span>

              <h1>
                التعلم مجاني
                <span>لكن قيمته المهنية تقرأ بذكاء</span>
              </h1>

              <p>
                هذه الأداة لا تحسب استرداد رسوم. تقرأ أثر تقدمك الفعلي، وخبرتك،
                وعمق تطبيقك، وبيئة السوق المستهدفة؛ ثم تعطيك قراءة محافظة لموقعك
                المهني دون وعود مبالغ فيها.
              </p>
            </div>

            <div className="roi-orbit" aria-label="مؤشر الجاهزية المهنية">
              <div className="roi-orbit-card">
                <div className="roi-orbit-inner">
                  <span>مؤشر الجاهزية</span>
                  <strong>{result.readinessScore}%</strong>
                  <b>{result.readinessLabel}</b>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="roi-grid">
          <aside className="roi-panel">
            <h2>مدخلات القراءة</h2>
            <p>
              عدل القيم حسب وضعك. كل تغيير يظهر أثره مباشرة في مؤشر الجاهزية
              ونطاق السوق المحافظ.
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
              <label>بيئة السوق المستهدفة</label>
              <select
                value={marketContext}
                onChange={(event) => setMarketContext(event.target.value)}
              >
                {Object.entries(MARKET_CONTEXTS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
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
                    {item.short}
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
                تقدمي الفعلي
              </button>

              <button
                type="button"
                className={!useActualProgress ? "active" : ""}
                onClick={() => setUseActualProgress(false)}
              >
                سيناريو افتراضي
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
              القراءة محافظة، وتستخدم تضخما افتراضيا قدره{" "}
              {(DEFAULT_INFLATION_RATE * 100).toFixed(1)}% لعرض القيمة الحقيقية.
            </p>

            <div className="roi-result-grid">
              <div className="roi-result-card">
                <span>تقدم الرحلة</span>
                <strong>
                  {formatNumber(effectiveDays)} / {formatNumber(safeTotalDays)}
                </strong>
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
                <p>نطاق تقديري بعد أثر التضخم، وليس ضمانا للدخل.</p>
              </div>

              <div className="roi-result-card">
                <span>موقعك الحالي من النطاق</span>
                <strong>{result.position.label}</strong>
                <p>{result.position.text}</p>
              </div>

              <div className="roi-result-card green">
                <span>فرصة التحسن الشهرية المحافظة</span>
                <strong>{formatCurrency(result.monthlyOpportunity)}</strong>
                <p>تظهر عندما يكون الراتب الحالي أقل من الحد المحافظ للنطاق.</p>
              </div>

              <div className="roi-result-card red">
                <span>قيمة التعلم المجاني</span>
                <strong>
                  {result.annualOpportunity > 0
                    ? formatCurrency(result.annualOpportunity)
                    : "قيمة غير مالية مباشرة"}
                </strong>
                <p>القيمة قد تكون مالية، أو مهنية مثل تقليل التخبط ورفع الجاهزية.</p>
              </div>
            </div>

            <div className="roi-reading">
              <h3>التفسير المهني</h3>
              <p>
                {track === "careerShift" && result.mode === "career-shift-non-direct"
                  ? "بما أنك قادم من مجال آخر وراتبك الحالي أعلى من نطاق الدخول المحافظ في الموارد البشرية، فالعائد المالي المباشر ليس القراءة الصحيحة. القيمة هنا في بناء مسار جديد بوعي، واختصار التخبط، ورفع جاهزيتك للمنافسة على بداية صحيحة."
                  : activeTrack.mainValue + ". " + activeTrack.description}
              </p>
            </div>

            <div className="roi-reading">
              <h3>حركة واحدة ترفع نتيجتك</h3>
              <p>{result.nextMove}</p>
            </div>

            <div className="roi-reading">
              <h3>خريطة القيمة</h3>
              <div className="value-map">
                <div className="value-step">
                  <b>01</b>
                  <strong>تقدم فعلي</strong>
                  <span>{formatNumber(effectiveDays)} يوم من أصل {formatNumber(safeTotalDays)}</span>
                </div>

                <div className="value-step">
                  <b>02</b>
                  <strong>خبرة وسياق</strong>
                  <span>{result.experienceStage.label} · {activeMarket.title}</span>
                </div>

                <div className="value-step">
                  <b>03</b>
                  <strong>تطبيق عملي</strong>
                  <span>{activeApplication.title}</span>
                </div>

                <div className="value-step">
                  <b>04</b>
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
            هذه المصادر لا تعني أن الأرقام وعد نهائي، لكنها تجعل القراءة أقرب
            إلى السوق وأكثر تحفظا. آخر تحديث منهجي مستهدف: 2025 - 2026.
          </p>

          <div className="roi-sources-toggle">
            <button type="button" onClick={() => setShowSources((value) => !value)}>
              {showSources ? "إخفاء المراجع" : "عرض المراجع الموسعة"}
            </button>
          </div>

          {showSources && (
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
                  <small>{source.year}</small>
                </a>
              ))}
            </div>
          )}

          <div className="roi-disclaimer">
            تنويه: هذه الحاسبة أداة تقديرية محافظة، ولا تمثل وعدا وظيفيا أو
            ضمانا للدخل. النتائج الفعلية تتأثر بتوفيق الله، ثم المدينة، نوع
            الجهة، سنوات الخبرة، جودة السيرة الذاتية، المقابلات، مستوى التطبيق،
            والظروف السوقية وقت التقديم.
          </div>
        </section>
      </div>
    </section>
  );
}
