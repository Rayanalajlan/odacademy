import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_ROI_INPUTS,
  loadLearningRoiInputs,
  saveLearningRoiInputs
} from "../lib/learningRoiService";
import {
  formatEnglishCurrency,
  formatEnglishNumber,
  normalizeDigits,
  toEnglishInteger
} from "../lib/numberFormat";

const TOTAL_JOURNEY_DAYS = 180;
const DEFAULT_INFLATION_RATE = 0.019;

const RELATION_GROUPS = {
  outside: {
    title: "لست داخل مجال الموارد البشرية بعد",
    shortTitle: "خارج المجال",
    description:
      "هذه القراءة مناسبة لمن يريد فهم المجال أو الانتقال إليه دون افتراض أنه يملك خبرة مباشرة في الموارد البشرية.",
    baseRange: { low: 6000, mid: 7600, high: 9500 },
    defaultOutcome: "enter"
  },
  inside: {
    title: "داخل مجال الموارد البشرية أو قريب منه",
    shortTitle: "داخل المجال",
    description:
      "هذه القراءة مناسبة لمن يعمل في الموارد البشرية أو التدريب أو شؤون الموظفين أو أدوار قريبة من إدارة الناس.",
    baseRange: { low: 8500, mid: 12500, high: 17000 },
    defaultOutcome: "promotion"
  },
  leader: {
    title: "أعمل في قيادة أو إدارة وأريد فهم الناس والمنظمة كأداة قرار",
    shortTitle: "قائد أو مدير",
    description:
      "هذه القراءة مناسبة لمن لا يريد بالضرورة وظيفة موارد بشرية، بل يريد فهم الأداء والثقافة والهيكل والفرق لتحسين قراراته القيادية.",
    baseRange: { low: 12000, mid: 18000, high: 26000 },
    defaultOutcome: "leadership"
  },
  consultant: {
    title: "أمارس الاستشارات أو أريد بناء مسار استشاري",
    shortTitle: "مسار استشاري",
    description:
      "هذه القراءة مناسبة لمن يريد تحويل المعرفة إلى منهجية تشخيصية وتدخلات ومخرجات قابلة للبيع أو التأثير.",
    baseRange: { low: 10000, mid: 16000, high: 24000 },
    defaultOutcome: "consulting"
  }
};

const LEVELS_BY_RELATION = {
  outside: [
    {
      id: "explorer",
      title: "مستكشف",
      description: "لا تعرف المجال بعد وتريد بناء تصور واضح قبل اختيار المسار.",
      factor: 0.78,
      score: 8
    },
    {
      id: "career-switcher",
      title: "منتقل مهنيا",
      description: "تعمل في مجال آخر وتريد الدخول للموارد البشرية أو التطوير التنظيمي.",
      factor: 0.88,
      score: 12
    },
    {
      id: "first-job",
      title: "باحث عن أول فرصة",
      description: "تستهدف أول وظيفة أو تدريب مهني في المجال.",
      factor: 0.94,
      score: 15
    },
    {
      id: "competition-ready",
      title: "جاهز للمنافسة",
      description: "لديك معرفة أولية وتريد تقوية المقابلات والأدوات واللغة المهنية.",
      factor: 1,
      score: 18
    }
  ],
  inside: [
    {
      id: "coordinator",
      title: "منسق أو مساعد",
      description: "تتعامل مع أعمال تشغيلية وتريد فهم الصورة المهنية الأكبر.",
      factor: 0.9,
      score: 13
    },
    {
      id: "specialist",
      title: "أخصائي",
      description: "تمارس أدوارا محددة وتريد الانتقال من التنفيذ إلى التحليل المهني.",
      factor: 1,
      score: 17
    },
    {
      id: "senior-specialist",
      title: "أخصائي أول أو مشرف",
      description: "تحتاج إلى ربط الممارسات بالنتائج والمؤشرات ومشكلات العمل.",
      factor: 1.12,
      score: 21
    },
    {
      id: "business-partner",
      title: "شريك أعمال أو مدير قسم",
      description: "تحتاج إلى لغة أعمال وتحليل منظمة وتدخلات أكثر نضجا.",
      factor: 1.24,
      score: 24
    },
    {
      id: "hr-leader",
      title: "مدير موارد بشرية أو قائد وظيفة",
      description: "تحتاج إلى قراءة استراتيجية للمنظمة والناس والقدرة المؤسسية.",
      factor: 1.38,
      score: 27
    }
  ],
  leader: [
    {
      id: "team-lead",
      title: "قائد فريق",
      description: "تدير مجموعة صغيرة وتحتاج إلى فهم السلوك والأداء والتغذية الراجعة.",
      factor: 0.95,
      score: 15
    },
    {
      id: "supervisor",
      title: "مشرف تشغيلي",
      description: "تحتاج إلى ربط الناس بالعملية والانضباط والتعلم اليومي.",
      factor: 1.04,
      score: 18
    },
    {
      id: "department-manager",
      title: "مدير قسم",
      description: "تتعامل مع نتائج وفرق وتحتاج إلى قراءة أعمق للأدوار والثقافة.",
      factor: 1.16,
      score: 22
    },
    {
      id: "director",
      title: "مدير إدارة",
      description: "تحتاج إلى فهم العلاقة بين الاستراتيجية والهيكل والقدرات.",
      factor: 1.3,
      score: 25
    },
    {
      id: "executive",
      title: "قائد تنفيذي",
      description: "تحتاج إلى قراءة نظامية عالية تساعدك على قرارات أثرها واسع.",
      factor: 1.5,
      score: 29
    }
  ],
  consultant: [
    {
      id: "consulting-learner",
      title: "متعلم استشاري",
      description: "تريد تعلم لغة التشخيص وصناعة الفرضيات قبل تقديم الحلول.",
      factor: 0.9,
      score: 14
    },
    {
      id: "diagnostic-analyst",
      title: "محلل أو باحث تشخيصي",
      description: "تركز على جمع البيانات وتحليل الأنماط وبناء الاستنتاجات.",
      factor: 1.05,
      score: 18
    },
    {
      id: "junior-consultant",
      title: "مستشار مبتدئ",
      description: "تحتاج إلى تحويل التحليل إلى توصيات ومخرجات قابلة للتطبيق.",
      factor: 1.15,
      score: 22
    },
    {
      id: "practicing-consultant",
      title: "مستشار ممارس",
      description: "تحتاج إلى إدارة العلاقة الاستشارية والتدخل وقياس الأثر.",
      factor: 1.32,
      score: 26
    },
    {
      id: "trusted-advisor",
      title: "مستشار خبير أو شريك موثوق",
      description: "تتعامل مع قضايا غامضة وسياسية واستراتيجية وتحتاج إلى نزاهة تشخيص عالية.",
      factor: 1.52,
      score: 30
    }
  ]
};

const LENSES = {
  hr_general: {
    title: "الموارد البشرية العامة",
    description: "سياسات، إجراءات، عمليات، وقرارات يومية مرتبطة بالموظفين.",
    factor: 0.98,
    gap: "ترتيب الممارسات وربطها بأثر واضح."
  },
  performance_rewards: {
    title: "الأداء والمكافآت",
    description: "الأهداف، المحادثات، المساءلة، الحوافز، والعدالة الداخلية.",
    factor: 1.04,
    gap: "ربط القياس بالسلوك لا بالنماذج فقط."
  },
  learning_development: {
    title: "التعلم والتطوير",
    description: "تحليل الاحتياج، بناء البرامج، نقل أثر التعلم إلى العمل.",
    factor: 1.02,
    gap: "تحويل التدريب من حضور إلى أثر."
  },
  employee_experience: {
    title: "تجربة الموظف والثقافة",
    description: "الثقة، المناخ، الصمت التنظيمي، السلوك اليومي، ومعنى العمل.",
    factor: 1.03,
    gap: "قراءة الثقافة من السلوك لا من الشعارات."
  },
  od: {
    title: "التطوير التنظيمي",
    description: "تشخيص، تدخل، تغيير، قدرة مؤسسية، واستدامة.",
    factor: 1.08,
    gap: "بناء فرضيات نظامية قبل اقتراح الحل."
  },
  structures_roles: {
    title: "الهياكل والأدوار والصلاحيات",
    description: "تصميم العمل، حقوق القرار، التداخل، الحوكمة، والمسؤوليات.",
    factor: 1.06,
    gap: "توضيح من يقرر ومتى وكيف."
  },
  leadership_teams: {
    title: "القيادة وإدارة الفرق",
    description: "المساءلة، التعاون، الصراع، الأمان النفسي، وجودة القرار.",
    factor: 1.05,
    gap: "تحويل القيادة من نوايا إلى سلوك قابل للملاحظة."
  },
  strategy_transformation: {
    title: "الاستراتيجية والتحول",
    description: "المواءمة، المبادرات، التحول، القياس، وفقدان التركيز.",
    factor: 1.1,
    gap: "ربط المبادرات بالقدرة التنفيذية لا بالخطة فقط."
  },
  discover: {
    title: "لا أعرف بعد، اقترح لي المسار الأنسب",
    description: "قراءة استكشافية تساعدك على رؤية المسار الأقرب لك.",
    factor: 0.97,
    gap: "تحديد العدسة الأنسب قبل التخصص."
  }
};

const OUTCOMES = {
  enter: {
    title: "دخول المجال لأول مرة",
    description: "هدفك بناء بوابة دخول واضحة للمجال.",
    factor: 0.95
  },
  interview: {
    title: "رفع فرصي في المقابلات",
    description: "هدفك بناء لغة مهنية وأمثلة عملية تقنع جهات التوظيف.",
    factor: 1
  },
  promotion: {
    title: "ترقية أو انتقال لدور أعلى",
    description: "هدفك تحويل التعلم إلى جاهزية لدور أوسع ومسؤوليات أعلى.",
    factor: 1.06
  },
  salary: {
    title: "تحسين الراتب",
    description: "هدفك قراءة موقعك من السوق وبناء مبررات مهنية للتحسن.",
    factor: 1.03
  },
  tools: {
    title: "بناء أدوات ونماذج عملية",
    description: "هدفك الخروج بقوالب ومنتجات عمل يمكن استخدامها.",
    factor: 1.04
  },
  leadership: {
    title: "تحسين قراراتي كقائد",
    description: "هدفك فهم الناس والمنظمة لاتخاذ قرارات أفضل.",
    factor: 1.08
  },
  consulting: {
    title: "بناء مسار استشاري",
    description: "هدفك تحويل المعرفة إلى تشخيص وتوصية ومخرجات قابلة للبيع أو التأثير.",
    factor: 1.1
  },
  deep_understanding: {
    title: "فهم المنظمات بعمق",
    description: "هدفك بناء عدسة مهنية تقرأ النظام خلف السلوك.",
    factor: 1.02
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
    multiplier: 0.62
  },
  {
    value: 2,
    title: "أدون وألخص",
    short: "تنظيم",
    description: "تحول التعلم إلى ملاحظات ولغة مهنية مرتبة.",
    multiplier: 0.76
  },
  {
    value: 3,
    title: "أحلل حالات",
    short: "تحليل",
    description: "تستخدم المفاهيم في قراءة مواقف ومشكلات حقيقية.",
    multiplier: 0.9
  },
  {
    value: 4,
    title: "أبني نماذج عمل",
    short: "إنتاج",
    description: "تخرج من التعلم بقوالب وأدوات قابلة للاستخدام.",
    multiplier: 1
  },
  {
    value: 5,
    title: "أطبق وأوثق الأثر",
    short: "أثر",
    description: "تربط التعلم بسلوك وقرار ونتيجة قابلة للقياس.",
    multiplier: 1.12
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
    name: "CIPD Profession Map",
    type: "مستويات الأثر المهني وتطور مهنة الناس",
    year: "2025 - 2026",
    url: "https://www.cipd.org/en/the-people-profession/the-profession-map/explore-the-profession-map/"
  },
  {
    name: "SHRM Certification",
    type: "إطار كفاءات وممارسات الموارد البشرية",
    year: "2025 - 2026",
    url: "https://www.shrm.org/credentials/certification"
  }
];

function formatCurrency(value) {
  return formatEnglishCurrency(value);
}

function formatCurrencyRange(low, high) {
  return (
    <>
      <span>من </span>
      <bdi dir="ltr">{formatCurrency(low)}</bdi>
      <span> إلى </span>
      <bdi dir="ltr">{formatCurrency(high)}</bdi>
    </>
  );
}

function formatNumber(value) {
  return formatEnglishNumber(Math.max(0, Math.round(Number(value || 0))));
}

function clamp(value, min, max) {
  const numeric = Number(value || 0);
  if (Number.isNaN(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}

function getExperienceStage(experienceMonths) {
  const value = clamp(experienceMonths, 0, 720) / 12;

  if (value < 1) {
    return {
      label: "بداية مهنية",
      factor: 0.9,
      score: 8,
      description: "خبرتك ما زالت في البداية، لذلك تقرأ الحاسبة النطاق بحذر أكبر."
    };
  }

  if (value < 3) {
    return {
      label: "خبرة ناشئة",
      factor: 0.98,
      score: 12,
      description: "لديك بداية خبرة تساعدك على فهم بيئة العمل، لكنها تحتاج إلى توثيق وتطبيق."
    };
  }

  if (value < 6) {
    return {
      label: "خبرة متوسطة",
      factor: 1.08,
      score: 16,
      description: "خبرتك تساعدك على ربط التعلم بسياقات العمل ومشكلات المنظمات."
    };
  }

  if (value < 10) {
    return {
      label: "خبرة ناضجة",
      factor: 1.18,
      score: 19,
      description: "لديك رصيد مهني يساعدك على تحويل التعلم إلى أحكام أعمق ومخرجات أقوى."
    };
  }

  return {
    label: "خبرة قيادية أو ممتدة",
    factor: 1.28,
    score: 21,
    description: "خبرتك الكبيرة تجعل أثر التعلم أعلى عندما تربطه بالتشخيص والقيادة وصناعة القرار."
  };
}

function getPositionLabel(currentSalary, range) {
  if (currentSalary <= 0) {
    return {
      label: "راتب غير مدخل",
      text: "ستقرأ النتيجة دون مقارنة راتب مباشرة. هذا مناسب للخريج أو من لا يريد مشاركة راتبه."
    };
  }

  if (currentSalary < range.low) {
    return {
      label: "أقل من النطاق المحافظ",
      text: "توجد فجوة بين وضعك الحالي والحد الأدنى المحافظ للنطاق المستهدف."
    };
  }

  if (currentSalary <= range.high) {
    return {
      label: "داخل النطاق السوقي",
      text: "أنت داخل النطاق المتوقع تقريبا، والعائد يعتمد على انتقالك داخل النطاق لا مجرد دخوله."
    };
  }

  return {
    label: "أعلى من النطاق المحافظ",
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

function getNextMove(score, relation, outcome, lens) {
  if (score < 36) {
    return "ابدأ بتثبيت الأساس: أكمل أول شهر، واكتب ملخصا عمليا بعد كل درس، ولا تتعجل مقارنة نفسك بالسوق.";
  }

  if (score < 54) {
    return "انتقل من القراءة إلى التحليل: اختر حالة من المحاكاة يوميا، واكتب فرضية وبيانات وتدخل ومؤشر أثر.";
  }

  if (score < 70) {
    return "ابن ملفا مهنيا صغيرا: وصف وظيفي، نموذج تشخيص، مصفوفة صلاحيات، ومؤشر قياس أثر.";
  }

  if (relation === "outside" && outcome === "enter") {
    return "جهز قصة دخولك للمجال: لماذا هذا المسار؟ ما الذي تعلمته؟ وما أول دور تستهدفه؟";
  }

  if (relation === "consultant" || outcome === "consulting") {
    return "ابن محفظة استشارية صغيرة: حالة تشخيص، خريطة أصحاب مصلحة، توصية، ومؤشر أثر.";
  }

  if (lens === "od" || lens === "structures_roles") {
    return "وثق أداة واحدة قابلة للاستخدام: نموذج تشخيص، مصفوفة أدوار، أو خريطة تدخل تنظيمي.";
  }

  return "ركز الآن على السيرة المهنية، أمثلة المقابلات، وتوثيق تطبيقات صغيرة تثبت فهمك.";
}

function getDefaultLevel(relation) {
  const levels = LEVELS_BY_RELATION[relation] || LEVELS_BY_RELATION.outside;
  return levels[0]?.id || "";
}

function getLevelObject(relation, levelId) {
  const levels = LEVELS_BY_RELATION[relation] || LEVELS_BY_RELATION.outside;
  return levels.find((item) => item.id === levelId) || levels[0];
}

export default function LearningROICalculator({
  completedDays = 0,
  totalDays = TOTAL_JOURNEY_DAYS
}) {
  const safeTotalDays = Math.max(1, Number(totalDays || TOTAL_JOURNEY_DAYS));
  const actualCompletedDays = clamp(completedDays, 0, safeTotalDays);

  const [relation, setRelation] = useState(DEFAULT_ROI_INPUTS.relation);
  const [levelId, setLevelId] = useState(DEFAULT_ROI_INPUTS.level_id);
  const [lens, setLens] = useState(DEFAULT_ROI_INPUTS.lens);
  const [outcome, setOutcome] = useState(DEFAULT_ROI_INPUTS.outcome);
  const [experienceYears, setExperienceYears] = useState(0);
  const [experienceMonthsRemainder, setExperienceMonthsRemainder] = useState(0);
  const [currentSalary, setCurrentSalary] = useState(DEFAULT_ROI_INPUTS.current_salary);
  const [applicationLevel, setApplicationLevel] = useState(DEFAULT_ROI_INPUTS.application_level);
  const [marketContext, setMarketContext] = useState(DEFAULT_ROI_INPUTS.market_context);
  const [useActualProgress, setUseActualProgress] = useState(DEFAULT_ROI_INPUTS.use_actual_progress);
  const [scenarioDays, setScenarioDays] = useState(DEFAULT_ROI_INPUTS.scenario_days);
  const [hasUserInput, setHasUserInput] = useState(DEFAULT_ROI_INPUTS.has_user_input);
  const [roiLoading, setRoiLoading] = useState(true);
  const [roiError, setRoiError] = useState("");
  const [showSources, setShowSources] = useState(false);

  const experienceMonths = experienceYears * 12 + experienceMonthsRemainder;

  function applyInputs(inputs) {
    const safeInputs = { ...DEFAULT_ROI_INPUTS, ...(inputs || {}) };
    const safeExperienceMonths = clamp(safeInputs.experience_months, 0, 720);

    setRelation(safeInputs.relation);
    setLevelId(safeInputs.level_id || getDefaultLevel(safeInputs.relation));
    setLens(safeInputs.lens);
    setOutcome(safeInputs.outcome);
    setExperienceYears(Math.floor(safeExperienceMonths / 12));
    setExperienceMonthsRemainder(safeExperienceMonths % 12);
    setCurrentSalary(safeInputs.current_salary);
    setApplicationLevel(safeInputs.application_level);
    setMarketContext(safeInputs.market_context);
    setUseActualProgress(Boolean(safeInputs.use_actual_progress));
    setScenarioDays(safeInputs.scenario_days);
    setHasUserInput(Boolean(safeInputs.has_user_input));
  }

  function markUserInput(updater) {
    setHasUserInput(true);
    updater();
  }

  const activeRelation = RELATION_GROUPS[relation];
  const activeLevel = getLevelObject(relation, levelId);
  const activeLens = LENSES[lens];
  const activeOutcome = OUTCOMES[outcome];
  const activeMarket = MARKET_CONTEXTS[marketContext];
  const activeApplication =
    APPLICATION_LEVELS.find((item) => item.value === Number(applicationLevel)) ||
    APPLICATION_LEVELS[2];

  const effectiveDays = useActualProgress
    ? actualCompletedDays
    : clamp(scenarioDays, 0, safeTotalDays);

  useEffect(() => {
    let mounted = true;

    async function loadInputs() {
      setRoiLoading(true);
      setRoiError("");

      try {
        const { inputs } = await loadLearningRoiInputs();

        if (mounted) {
          applyInputs(inputs || DEFAULT_ROI_INPUTS);
        }
      } catch (error) {
        console.warn("Unable to load learning ROI inputs:", error);

        if (mounted) {
          setRoiError("تعذر تحميل بيانات الحاسبة الخاصة بحسابك. حاول تحديث الصفحة.");
          applyInputs(DEFAULT_ROI_INPUTS);
        }
      } finally {
        if (mounted) {
          setRoiLoading(false);
        }
      }
    }

    loadInputs();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (roiLoading || roiError) return undefined;

    const timeoutId = window.setTimeout(() => {
      saveLearningRoiInputs({
        relation,
        level_id: levelId,
        lens,
        outcome,
        experience_months: experienceMonths,
        current_salary: currentSalary,
        application_level: applicationLevel,
        market_context: marketContext,
        use_actual_progress: useActualProgress,
        scenario_days: scenarioDays,
        has_user_input: hasUserInput
      }).catch((error) => {
        console.warn("Unable to save learning ROI inputs:", error);
        setRoiError("تعذر حفظ بيانات الحاسبة الخاصة بحسابك. لن يتم نقل أي بيانات بين المستخدمين.");
      });
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [
    applicationLevel,
    currentSalary,
    experienceMonths,
    hasUserInput,
    lens,
    levelId,
    marketContext,
    outcome,
    relation,
    roiError,
    roiLoading,
    scenarioDays,
    useActualProgress
  ]);

  function changeRelation(nextRelation) {
    markUserInput(() => {
      setRelation(nextRelation);
      setLevelId(getDefaultLevel(nextRelation));

      const defaultOutcome = RELATION_GROUPS[nextRelation]?.defaultOutcome;
      if (defaultOutcome && OUTCOMES[defaultOutcome]) {
        setOutcome(defaultOutcome);
      }
    });
  }

  const result = useMemo(() => {
    if (!hasUserInput) {
      return {
        progressFactor: 0,
        readinessPercent: 0,
        readinessScore: 0,
        readinessLabel: getReadinessLabel(0),
        nextMove: getNextMove(0, relation, outcome, lens),
        experienceStage: getExperienceStage(0),
        nominalLow: 0,
        nominalMid: 0,
        nominalHigh: 0,
        realLow: 0,
        realMid: 0,
        realHigh: 0,
        monthlyOpportunity: 0,
        annualOpportunity: 0,
        valueMode: "empty",
        position: getPositionLabel(0, { low: 0, mid: 0, high: 0 }),
        commitmentMessage: getCommitmentMessage(0)
      };
    }

    const progressFactor = clamp(effectiveDays / safeTotalDays, 0, 1);
    const experienceStage = getExperienceStage(experienceMonths);

    const rawRange = activeRelation.baseRange;
    const progressLift = 0.74 + progressFactor * 0.26;
    const inflationFactor = 1 + DEFAULT_INFLATION_RATE;

    const combinedFactor =
      experienceStage.factor *
      activeLevel.factor *
      activeLens.factor *
      activeOutcome.factor *
      activeApplication.multiplier *
      activeMarket.multiplier;

    const adjustedLow = rawRange.low * combinedFactor * progressLift;
    const adjustedMid =
      rawRange.mid * combinedFactor * (0.8 + progressFactor * 0.2);
    const adjustedHigh =
      rawRange.high * combinedFactor * (0.82 + progressFactor * 0.18);

    const realLow = adjustedLow / inflationFactor;
    const realMid = adjustedMid / inflationFactor;
    const realHigh = adjustedHigh / inflationFactor;

    const current = Number(currentSalary || 0);

    let monthlyOpportunity = Math.max(0, realLow - current);
    let valueMode = "direct";

    if ((relation === "outside" || relation === "leader") && current > realLow) {
      valueMode = "non-direct";
      monthlyOpportunity = 0;
    }

    const position = getPositionLabel(current, {
      low: realLow,
      mid: realMid,
      high: realHigh
    });

    const progressScore = progressFactor * 34;
    const experienceScore = experienceStage.score;
    const levelScore = Math.min(22, activeLevel.score);
    const applicationScore = (Number(applicationLevel) / 5) * 18;
    const marketScore = current <= realHigh ? 5 : 3;

    const readinessScore = Math.round(
      clamp(
        progressScore + experienceScore + levelScore + applicationScore + marketScore,
        0,
        100
      )
    );

    return {
      progressFactor,
      readinessPercent: Math.round(progressFactor * 100),
      readinessScore,
      readinessLabel: getReadinessLabel(readinessScore),
      nextMove: getNextMove(readinessScore, relation, outcome, lens),
      experienceStage,
      nominalLow: adjustedLow,
      nominalMid: adjustedMid,
      nominalHigh: adjustedHigh,
      realLow,
      realMid,
      realHigh,
      monthlyOpportunity,
      annualOpportunity: monthlyOpportunity * 12,
      valueMode,
      position,
      commitmentMessage: getCommitmentMessage(effectiveDays)
    };
  }, [
    activeApplication,
    activeLevel,
    activeLens,
    activeMarket,
    activeOutcome,
    activeRelation,
    applicationLevel,
    currentSalary,
    effectiveDays,
    experienceMonths,
    hasUserInput,
    lens,
    outcome,
    relation,
    safeTotalDays
  ]);

  const professionalPosition = `${activeLevel.title} · ${activeLens.title}`;

  if (roiLoading) {
    return (
      <section className="roi-page" dir="rtl">
        <div className="roi-wrap">
          <div className="roi-panel" role="status" aria-live="polite">
            <h2>جاري تحميل بيانات الحاسبة</h2>
            <p>نقرأ بيانات حاسبة العائد المرتبطة بحسابك فقط.</p>
          </div>
        </div>
      </section>
    );
  }

  if (roiError) {
    return (
      <section className="roi-page" dir="rtl">
        <div className="roi-wrap">
          <div className="roi-panel" role="alert">
            <h2>تعذر تحميل الحاسبة</h2>
            <p>{roiError}</p>
            <button type="button" onClick={() => window.location.reload()}>
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="roi-page" dir="rtl">
      <style>{`
        .roi-page {
          min-height: 100vh;
          padding: 34px 16px 70px;
          color: #18102e;
          background:
            radial-gradient(circle at 10% 10%, rgba(139, 92, 246,.12), transparent 30%),
            radial-gradient(circle at 94% 14%, rgba(245,158,11,.13), transparent 28%),
            radial-gradient(circle at 48% 96%, rgba(16,185,129,.10), transparent 34%),
            linear-gradient(135deg, #f4f0fb 0%, #efe9fb 54%, #fff7ed 100%);
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
            linear-gradient(135deg, #18102e, #1e1b4b 58%, #3b1d6e);
          box-shadow: 0 26px 80px rgba(28, 17, 48, 0.20);
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
          background: linear-gradient(90deg, #fff, #c3b5e8, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
          padding-top: 3px;
        }

        .roi-hero p {
          margin: 0;
          max-width: 780px;
          color: rgba(196, 181, 253,.9);
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
            inset 0 0 0 15px rgba(28, 17, 48,.42),
            0 24px 70px rgba(0,0,0,.20);
        }

        .roi-orbit-inner {
          width: 205px;
          height: 205px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          text-align: center;
          background: #18102e;
          border: 1px solid rgba(255,255,255,.14);
          padding: 18px;
        }

        .roi-orbit-inner span {
          color: #9d8fc0;
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
          box-shadow: 0 22px 60px rgba(28, 17, 48,.08);
          backdrop-filter: blur(18px);
        }

        .roi-panel h2 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: 26px;
          font-weight: 950;
          line-height: 1.35;
        }

        .roi-panel > p {
          margin: 0 0 18px;
          color: #7a6c9a;
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
          color: #463c63;
          font-size: 13px;
          font-weight: 950;
        }

        .roi-field select,
        .roi-field input,
        .roi-number-input {
          width: 100%;
          min-height: 48px;
          border-radius: 18px;
          border: 1px solid #c9bdf0;
          background: #fff;
          color: #18102e;
          padding: 0 14px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 850;
          outline: none;
        }

        .roi-number-input {
          direction: ltr;
          text-align: left;
          unicode-bidi: plaintext;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .roi-experience-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .roi-subfield span {
          display: block;
          margin-bottom: 6px;
          color: #6d5f8c;
          font-size: 12px;
          font-weight: 900;
        }

        .roi-field select:focus,
        .roi-field input:focus,
        .roi-number-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,.09);
        }

        .roi-range {
          width: 100%;
          accent-color: #8b5cf6;
        }

        .roi-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 7px;
          border-radius: 22px;
          background: #efe9fb;
          margin-bottom: 16px;
        }

        .roi-switch button {
          border: 0;
          cursor: pointer;
          border-radius: 16px;
          min-height: 42px;
          padding: 10px 12px;
          color: #5b4f78;
          background: transparent;
          font-family: inherit;
          font-weight: 950;
        }

        .roi-switch button.active {
          color: white;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          box-shadow: 0 12px 28px rgba(139, 92, 246,.20);
        }

        .application-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          margin-top: 8px;
        }

        .application-pill {
          border: 1px solid rgba(167, 139, 250,.22);
          border-radius: 16px;
          padding: 10px 8px;
          background: #fff;
          color: #463c63;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 950;
          line-height: 1.5;
          min-height: 58px;
        }

        .application-pill.active {
          color: white;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
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
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 14px 38px rgba(28, 17, 48,.06);
        }

        .roi-result-card::before {
          content: "";
          position: absolute;
          top: -70px;
          right: -70px;
          width: 150px;
          height: 150px;
          border-radius: 999px;
          background: rgba(139, 92, 246,.10);
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
          color: #7a6c9a;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 9px;
        }

        .roi-result-card strong {
          position: relative;
          z-index: 1;
          display: block;
          color: #18102e;
          font-size: 21px;
          line-height: 1.35;
          font-weight: 950;
        }

        .roi-result-card p {
          position: relative;
          z-index: 1;
          margin: 9px 0 0;
          color: #7a6c9a;
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
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.20);
        }

        .value-step b {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          color: white;
          background: #8b5cf6;
          margin-bottom: 8px;
          font-size: 11px;
          line-height: 1;
        }

        .value-step strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          font-weight: 950;
          line-height: 1.6;
        }

        .value-step span {
          display: block;
          margin-top: 5px;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.75;
          font-weight: 750;
        }

        .roi-reading {
          margin-top: 14px;
          border-radius: 26px;
          padding: 18px;
          color: #281748;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 34%),
            #ffffff;
          border: 1px solid rgba(167, 139, 250,.22);
        }

        .roi-reading h3 {
          margin: 0 0 10px;
          color: #18102e;
          font-size: 19px;
          font-weight: 950;
        }

        .roi-reading p {
          margin: 0;
          color: #5b4f78;
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
          background: #18102e;
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
          border: 1px solid rgba(167, 139, 250,.22);
          color: #18102e;
          transition: .2s ease;
        }

        .roi-source:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(28, 17, 48,.08);
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
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 750;
        }

        .roi-source small {
          display: inline-flex;
          margin-top: 8px;
          padding: 4px 8px;
          border-radius: 999px;
          color: #6d28d9;
          background: #efe9fb;
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
                تبدأ الحاسبة من علاقتك بمجال الموارد البشرية والتطوير التنظيمي،
                ثم تقرأ مستواك وعدستك وهدفك وتقدمك الفعلي لتنتج قراءة مهنية
                محافظة، لا وعدا وظيفيا.
              </p>
            </div>

            <div className="roi-orbit" aria-label="مؤشر الجاهزية المهنية">
              <div
                className="roi-orbit-card od-circular-indicator od-indicator-readiness"
                style={{
                  "--roi-readiness-deg": `${result.readinessScore * 3.6}deg`,
                  "--od-indicator-progress": `${result.readinessScore}%`
                }}
              >
                <div className="roi-orbit-inner">
                  <span>مؤشر الجاهزية</span>
                  <strong dir="ltr" lang="en">{formatNumber(result.readinessScore)}%</strong>
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
              اختر علاقتك بالمجال أولا، ثم سيظهر مستوى مناسب لهذه العلاقة بدون
              تكرار أو خلط بين المسارات.
            </p>

            <div className="roi-field">
              <label>أولا: أين تقف من مجال الموارد البشرية والتطوير التنظيمي؟</label>
              <select
                value={relation}
                onChange={(event) => changeRelation(event.target.value)}
              >
                {Object.entries(RELATION_GROUPS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="roi-field">
              <label>ثانيا: ما المستوى الأقرب لوضعك الحالي؟</label>
              <select value={levelId} onChange={(event) => markUserInput(() => setLevelId(event.target.value))}>
                {(LEVELS_BY_RELATION[relation] || []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="roi-field">
              <label>ثالثا: ما العدسة التي تريد تقويتها؟</label>
              <select value={lens} onChange={(event) => markUserInput(() => setLens(event.target.value))}>
                {Object.entries(LENSES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="roi-field">
              <label>رابعا: ما العائد الذي تبحث عنه من هذه الرحلة؟</label>
              <select value={outcome} onChange={(event) => markUserInput(() => setOutcome(event.target.value))}>
                {Object.entries(OUTCOMES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="roi-field">
              <label>مدة الخبرة العملية</label>
              <div className="roi-experience-grid">
                <label className="roi-subfield">
                  <span>سنوات الخبرة</span>
                  <input
                    className="roi-number-input"
                    type="text"
                    min="0"
                    max="60"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    dir="ltr"
                    lang="en"
                    value={String(experienceYears)}
                    onChange={(event) =>
                      markUserInput(() =>
                        setExperienceYears(clamp(toEnglishInteger(normalizeDigits(event.target.value)), 0, 60))
                      )
                    }
                  />
                </label>
                <label className="roi-subfield">
                  <span>أشهر الخبرة</span>
                  <input
                    className="roi-number-input"
                    type="text"
                    min="0"
                    max="11"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    dir="ltr"
                    lang="en"
                    value={String(experienceMonthsRemainder)}
                    onChange={(event) =>
                      markUserInput(() =>
                        setExperienceMonthsRemainder(clamp(toEnglishInteger(normalizeDigits(event.target.value)), 0, 11))
                      )
                    }
                  />
                </label>
              </div>
            </div>

            <div className="roi-field">
              <label>راتبك الشهري الحالي - اختياري</label>
              <input
                className="roi-number-input"
                type="text"
                min="0"
                max="50000"
                inputMode="numeric"
                pattern="[0-9]*"
                dir="ltr"
                lang="en"
                value={String(currentSalary)}
                onChange={(event) =>
                  markUserInput(() =>
                    setCurrentSalary(clamp(toEnglishInteger(normalizeDigits(event.target.value)), 0, 50000))
                  )
                }
              />
            </div>

            <div className="roi-field">
              <label>بيئة السوق المستهدفة</label>
              <select
                value={marketContext}
                onChange={(event) => markUserInput(() => setMarketContext(event.target.value))}
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
                    onClick={() => markUserInput(() => setApplicationLevel(item.value))}
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
                onClick={() => markUserInput(() => setUseActualProgress(true))}
              >
                تقدمي الفعلي
              </button>

              <button
                type="button"
                className={!useActualProgress ? "active" : ""}
                onClick={() => markUserInput(() => setUseActualProgress(false))}
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
                  min="0"
                  max={safeTotalDays}
                  value={scenarioDays}
                  onChange={(event) =>
                    markUserInput(() =>
                      setScenarioDays(clamp(toEnglishInteger(normalizeDigits(event.target.value)), 0, safeTotalDays))
                    )
                  }
                />
              </div>
            )}

            <div className="roi-reading">
              <h3>{activeRelation.shortTitle}</h3>
              <p>{activeRelation.description}</p>
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
                <span>تموضعك المهني</span>
                <strong>{professionalPosition}</strong>
                <p>{activeLevel.description}</p>
              </div>

              <div className="roi-result-card gold">
                <span>فجوة التعلم الأقرب</span>
                <strong>{activeLens.gap}</strong>
                <p>{activeLens.description}</p>
              </div>

              <div className="roi-result-card green">
                <span>النطاق الحقيقي المحافظ</span>
                <strong>
                  {formatCurrencyRange(result.realLow, result.realHigh)}
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
                {result.valueMode === "non-direct"
                  ? "لأن وضعك الحالي لا يقرأ كزيادة راتب مباشرة، فالقيمة هنا تظهر في وضوح المسار، ونضج الحكم المهني، وتقليل التخبط، وبناء لغة ومخرجات قابلة للاستخدام."
                  : `${activeOutcome.description} ${activeMarket.text}`}
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
                  <strong>علاقة بالمجال</strong>
                  <span>{activeRelation.shortTitle}</span>
                </div>

                <div className="value-step">
                  <b>02</b>
                  <strong>مستوى مهني</strong>
                  <span>{activeLevel.title}</span>
                </div>

                <div className="value-step">
                  <b>03</b>
                  <strong>عدسة التعلم</strong>
                  <span>{activeLens.title}</span>
                </div>

                <div className="value-step">
                  <b>04</b>
                  <strong>تقدم فعلي</strong>
                  <span>{formatNumber(effectiveDays)} من {formatNumber(safeTotalDays)} يوم</span>
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
