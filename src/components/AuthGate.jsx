import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import VisitorTestimonialsMarquee from "./VisitorTestimonialsMarquee";
import SiteLogo from "./SiteLogo";
import BrandMeta from "./BrandMeta";
import ExperienceDesignSkin from "./ExperienceDesignSkin";
import ThemeToggle from "./ThemeToggle";

const MONTHS = [
  {
    number: "01",
    title: "تأسيس العقل التنظيمي",
    output: "قراءة المنظمة كنظام حي قبل القفز إلى الحلول."
  },
  {
    number: "02",
    title: "تصميم المنظمة والهياكل والأدوار",
    output: "تحويل التشخيص إلى أدوار وصلاحيات ونظام عمل واضح."
  },
  {
    number: "03",
    title: "تصميم التدخلات التنظيمية",
    output: "اختيار تدخل مناسب يعالج السبب لا العرض."
  },
  {
    number: "04",
    title: "قيادة التغيير والتحول",
    output: "بناء الالتزام وإدارة المقاومة واستدامة التغيير."
  },
  {
    number: "05",
    title: "الثقافة والتعلم وبناء القدرة",
    output: "قراءة الثقة والسلوك والتعلم المؤسسي كقدرة مستمرة."
  },
  {
    number: "06",
    title: "قياس الأثر والاحتراف",
    output: "ربط التدخلات بمؤشرات أثر وممارسة مهنية ناضجة."
  }
];

const FAQ = [
  {
    q: "هل الرحلة مجانية؟",
    a: "نعم، هذه الرحلة مجانية لوجه الله، وهدفها نشر معرفة مهنية نافعة في الموارد البشرية والتطوير التنظيمي."
  },
  {
    q: "كم مدة الرحلة؟",
    a: "الرحلة مصممة على 180 يومًا، موزعة على 6 أشهر، مع دروس واختبارات ومحاكاة تطبيقية."
  },
  {
    q: "كيف أتعلم داخل المنصة؟",
    a: "تتقدم عبر مسار شهري وأسبوعي ويومي، وتحل اختبارًا قصيرًا بعد كل درس، ثم تستخدم الرادار والمحاكاة لربط المعرفة بالممارسة."
  },
  {
    q: "هل توجد شهادة؟",
    a: "تظهر وثيقة الإتقان بعد اكتمال متطلبات الرحلة داخل المنصة. هي وثيقة إنجاز للرحلة وليست شهادة أكاديمية رسمية."
  },
  {
    q: "هل أحتاج خبرة سابقة؟",
    a: "لا. يمكن للخريج والممارس والقائد والمستشار الاستفادة من الرحلة، لكن أثرها يزيد كلما ربطت الدروس بحالات واقعية."
  },
  {
    q: "هل يوجد دعم أو متابعة؟",
    a: "تحتوي المنصة على أدوات مساعدة مثل رادار الجدارات، مختبر المحاكاة، وحاسبة العائد من التعلم. أي متابعة مباشرة يتم الإعلان عنها في المنصة عند توفرها."
  },
  {
    q: "هل تحفظ المنصة تقدمي؟",
    a: "نعم، عند تسجيل الدخول يتم حفظ تقدمك التعليمي حتى تستطيع العودة إلى آخر محطة وصلت إليها."
  },
  {
    q: "ما البيانات التي أحتاج إدخالها؟",
    a: "تحتاج بريدًا إلكترونيًا وكلمة مرور واسمًا عند التسجيل. لا تدخل معلومات سرية أو حساسة داخل الحقول العامة."
  }
];


const LESSON_SAMPLES = [
  {
    title: "لماذا لا تبدأ من الحل؟",
    intro:
      "في التطوير التنظيمي، المشكلة التي تسمعها أولًا غالبًا ليست المشكلة التي يجب أن تعالجها أولًا. عندما يقول المدير: نحتاج ورشة التزام، فقد يكون يصف علاجًا يريده، لا عرضًا تم تشخيصه.",
    cards: [
      {
        label: "01",
        title: "العرض الظاهر",
        text: "انخفاض الالتزام، تأخر التسليم، مقاومة مبادرة، أو دوران وظيفي."
      },
      {
        label: "02",
        title: "النمط المتكرر",
        text: "هل يحدث في فريق واحد، أم يتكرر مع كل مبادرة أو كل قائد؟"
      },
      {
        label: "03",
        title: "الفرضية المهنية",
        text: "قد يكون السبب في الأدوار، القيادة، الحوافز، الثقة، أو ضغط العمل."
      }
    ],
    takeaway:
      "الفكرة العملية: لا تسأل: ما الحل المناسب؟ قبل أن تسأل: ما الذي يجعل هذا السلوك منطقيًا داخل النظام؟ هنا يبدأ الفرق بين منفذ حلول وممارس تطوير تنظيمي.",
    exerciseTitle: "تمرين سريع",
    exercise:
      "اكتب جملة تشخيصية واحدة: يبدو أن العرض هو ضعف الالتزام، لكن الفرضية الأولية أن المشكلة مرتبطة بوضوح الأولويات وحقوق القرار، وسأتحقق منها عبر مقابلات قصيرة وقراءة مؤشرات التسليم."
  },
  {
    title: "كيف تفرّق بين العرض والسبب الجذري؟",
    intro:
      "ليس كل رقم منخفض يعني أن المشكلة في الموظفين. انخفاض الإنتاجية قد يكون نتيجة تداخل صلاحيات، أو هدف غامض، أو أداة عمل سيئة، أو قيادة لا تعطي تغذية راجعة واضحة.",
    cards: [
      {
        label: "01",
        title: "اسأل عن المكان",
        text: "هل يظهر العرض في كل المنظمة أم في إدارة محددة؟ المكان يكشف طبيعة السبب."
      },
      {
        label: "02",
        title: "اسأل عن التوقيت",
        text: "متى بدأ العرض؟ بعد تغيير قائد؟ بعد نظام جديد؟ بعد تعديل حوافز؟"
      },
      {
        label: "03",
        title: "اسأل عن المستفيد والمتضرر",
        text: "من يرتاح لبقاء الوضع كما هو؟ ومن يدفع ثمن الخلل؟"
      }
    ],
    takeaway:
      "الفكرة العملية: السبب الجذري ليس أعمق إجابة تسمعها، بل أكثر فرضية تفسّر النمط وتتأكد منها البيانات.",
    exerciseTitle: "تحدي مصغر",
    exercise:
      "اختر مشكلة في بيئة عملك، واكتب: العرض الظاهر، من يتأثر به، متى يظهر، وما أول دليل تحتاجه قبل أن تقترح حلا."
  },
  {
    title: "التعاقد قبل التشخيص",
    intro:
      "أول خطوة مهنية ليست جمع البيانات، بل ضبط العلاقة: من العميل الحقيقي؟ ما حدود السرية؟ ما القرار الذي سيتأثر بالتشخيص؟ وما الذي لن نتدخل فيه؟",
    cards: [
      {
        label: "01",
        title: "العميل الحقيقي",
        text: "قد يكون طالب الخدمة مديرًا، لكن المتأثر الحقيقي فريق كامل أو إدارة أخرى."
      },
      {
        label: "02",
        title: "حدود السرية",
        text: "لا يبدأ التشخيص الجاد دون اتفاق واضح حول ما سيُشارك وما سيبقى مجهول المصدر."
      },
      {
        label: "03",
        title: "قرار ما بعد التشخيص",
        text: "إذا لم يكن هناك استعداد لاستخدام النتائج، سيتحول التشخيص إلى نشاط بلا أثر."
      }
    ],
    takeaway:
      "الفكرة العملية: التعاقد يحميك من أن تُستخدم كمنفذ لرواية طرف واحد داخل النظام.",
    exerciseTitle: "سؤال ذكي قبل البدء",
    exercise:
      "قبل قبول أي طلب تدخل، اسأل: ما القرار الذي تريدون اتخاذه بعد التشخيص؟ ومن يجب أن يكون حاضرًا في التعاقد حتى لا نسمع رواية واحدة فقط؟"
  }
];

const SIMULATION_SAMPLES = [
  {
    title: "اجتماع عاجل قبل مبادرة تغيير",
    context:
      "وصلتك رسالة من مدير إدارة: عندنا مقاومة عالية لمبادرة التحول. نحتاج نشاطًا سريعًا قبل اجتماع الإدارة. وفي المقابل، يذكر أحد المشرفين أن الفريق لا يرفض التغيير، لكنه لا يفهم لماذا تغيرت الأولويات ثلاث مرات خلال شهر واحد.",
    signals: [
      { label: "المعطى الأول", title: "رواية إدارية", text: "الإدارة تفسر السلوك بوصفه مقاومة." },
      { label: "المعطى الثاني", title: "رواية ميدانية", text: "الفريق يتحدث عن غموض وتضارب في الأولويات." },
      { label: "التوتر التشخيصي", title: "دافعية أم تصميم؟", text: "نوع التدخل يعتمد على تفسير النمط لا على أول رواية." }
    ],
    options: [
      { id: "scope_first", title: "أبدأ بجلسة تعاقد قصيرة لتحديد السؤال التشخيصي ومصادر البيانات", feedback: "صحيح. هذا يحميك من تبني رواية واحدة، ويحوّل الطلب من نشاط سريع إلى تشخيص منضبط." },
      { id: "workshop_now", title: "أنفذ النشاط المطلوب ثم أراجع النتائج بعد الاجتماع", feedback: "هذا قد يبدو عمليًا، لكنه يجعل التدخل يسبق التشخيص، وقد يثبت تفسيرًا غير مختبر." },
      { id: "survey_only", title: "أرسل استبيانًا عامًا عن الرضا والالتزام لجميع الموظفين", feedback: "الاستبيان قد يساعد لاحقًا، لكنه وحده لا يكشف سبب تضارب الروايات وتغير الأولويات." }
    ],
    correctOptionId: "scope_first"
  },
  {
    title: "دوران مرتفع في فريق واحد",
    context:
      "ارتفع خروج الموظفين في فريق خدمة العملاء خلال شهرين. المدير يصف المشكلة بأنها ضعف تحمل للضغط، لكن بيانات الموارد البشرية تظهر أن معظم المغادرين كانوا من أصحاب الأداء الأعلى في آخر تقييمين.",
    signals: [
      { label: "المعطى الأول", title: "خروج انتقائي", text: "الخروج يتركز بين أصحاب أداء عال." },
      { label: "المعطى الثاني", title: "تفسير جاهز", text: "المدير يربط المشكلة بقدرة الأفراد على التحمل." },
      { label: "التوتر التشخيصي", title: "ضغط أم عدالة؟", text: "قد يكون الخلل في الحمل أو التقدير أو الصلاحيات." }
    ],
    options: [
      { id: "stress_training", title: "أقترح تدريبًا على إدارة الضغط للفريق خلال الأسبوع القادم", feedback: "هذا يفترض أن المشكلة داخل الأفراد قبل اختبار الحمل والقيادة ونمط العمل." },
      { id: "exit_pattern", title: "أحلل مقابلات الخروج وحمل العمل ونمط القيادة قبل اختيار التدخل", feedback: "صحيح. خروج أصحاب الأداء العالي يحتاج قراءة نمطية لا تفسيرًا سريعًا." },
      { id: "quick_bonus", title: "أوصي بحافز مؤقت للفريق حتى ينخفض الخروج", feedback: "الحافز قد يخفف أثرًا مؤقتًا، لكنه لا يفسر لماذا يغادر أصحاب الأداء العالي." }
    ],
    correctOptionId: "exit_pattern"
  },
  {
    title: "نظام أداء جديد بلا ثقة",
    context:
      "أطلقت الشركة نموذج تقييم أداء جديد. بعد شهر، بدأ الموظفون يكتبون أهدافًا سهلة جدًا. الإدارة ترى ذلك انخفاضًا في الطموح، والموظفون يعتقدون أن التقييم سيستخدم ضدهم في المكافآت.",
    signals: [
      { label: "المعطى الأول", title: "سلوك احترازي", text: "الأهداف أصبحت أسهل بعد إطلاق النظام." },
      { label: "المعطى الثاني", title: "قلق من الاستخدام", text: "الموظفون لا يثقون في طريقة توظيف النتائج." },
      { label: "التوتر التشخيصي", title: "أداة أم مناخ؟", text: "النموذج قد يفشل إذا ارتبط بالعقاب أو الغموض." }
    ],
    options: [
      { id: "force_targets", title: "أطلب رفع الأهداف بنسبة موحدة لضمان الطموح", feedback: "هذا يعالج شكل الرقم، لكنه لا يعالج الثقة وقد يزيد السلوك الدفاعي." },
      { id: "old_system", title: "أوصي بإيقاف النموذج والعودة للنظام السابق مؤقتًا", feedback: "قد يكون مبكرًا. لم نعرف بعد هل المشكلة في الأداة أم في طريقة الإطلاق والرسائل." },
      { id: "trust_governance", title: "أراجع رسائل الإطلاق وحوكمة الاستخدام قبل تعديل النموذج", feedback: "صحيح. المشكلة هنا قد تكون في الثقة وطريقة الاستخدام لا في النموذج وحده." }
    ],
    correctOptionId: "trust_governance"
  },
  {
    title: "صراع بين الموارد والعمليات",
    context:
      "فريق العمليات يشتكي أن الموارد البشرية تؤخر التوظيف، والموارد البشرية تؤكد أن العمليات تغير المتطلبات في كل مقابلة. الرئيس التنفيذي يريد معرفة الطرف المقصر بسرعة.",
    signals: [
      { label: "المعطى الأول", title: "اتهام متبادل", text: "كل طرف يملك رواية تضع الخلل عند الطرف الآخر." },
      { label: "المعطى الثاني", title: "تغير متطلبات", text: "الخلل قد يكون في تعريف الدور وحقوق القرار." },
      { label: "التوتر التشخيصي", title: "أداء أم عملية؟", text: "قبل لوم طرف، يجب فهم مسار القرار." }
    ],
    options: [
      { id: "fault_report", title: "أعد تقريرًا سريعًا يحدد الطرف الأكثر تسببًا في التأخير", feedback: "هذا قد يرضي طلبًا سريعًا، لكنه يزيد الصراع إذا لم نفهم تصميم العملية." },
      { id: "add_recruiters", title: "أقترح زيادة عدد موظفي الاستقطاب لتسريع الطلبات", feedback: "قد لا يحل المشكلة إذا كان التأخير بسبب تغير المتطلبات وغموض القرار." },
      { id: "process_map", title: "أرسم رحلة التوظيف ونقاط تغيير المتطلبات وحقوق الاعتماد", feedback: "صحيح. هذا يحول الاتهام إلى خريطة عملية قابلة للتحسين." }
    ],
    correctOptionId: "process_map"
  },
  {
    title: "برنامج تدريب بلا أثر",
    context:
      "تم تنفيذ برنامج قيادي لمديري الإدارات، وكانت التقييمات ممتازة. بعد شهرين، لم يتغير شيء في اجتماعات الأداء أو تفويض الصلاحيات. الإدارة تسأل: لماذا لم ينجح التدريب؟",
    signals: [
      { label: "المعطى الأول", title: "رضا مرتفع", text: "الحضور أحبوا البرنامج وقيّموه جيدًا." },
      { label: "المعطى الثاني", title: "سلوك ثابت", text: "ممارسات القيادة بعد التدريب لم تتغير." },
      { label: "التوتر التشخيصي", title: "تعلم أم نقل أثر؟", text: "المشكلة قد لا تكون في المحتوى، بل في بيئة التطبيق." }
    ],
    options: [
      { id: "repeat_training", title: "أقترح إعادة البرنامج بصيغة أطول وأكثر تفصيلًا", feedback: "زيادة المحتوى لا تعني أثرًا أعلى إذا كانت بيئة التطبيق لا تدعم السلوك الجديد." },
      { id: "transfer_system", title: "أربط التدريب بمتابعة تطبيق ومؤشرات وسلوكيات مطلوبة من القادة", feedback: "صحيح. أثر التعلم يحتاج نظام نقل أثر، لا رضا عن القاعة فقط." },
      { id: "change_vendor", title: "أغيّر مزود التدريب لأن النتائج لم تظهر بعد شهرين", feedback: "قد يكون المزود جزءًا من المشكلة، لكن الحكم قبل فحص بيئة التطبيق متسرع." }
    ],
    correctOptionId: "transfer_system"
  }
];

const DEFAULT_STATS = {
  total_joined: 0,
  active_now: 0,
  completed_count: 0
};

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function passwordIssue(password) {
  if (!password || password.length < 8) return "كلمة المرور يجب ألا تقل عن 8 أحرف.";
  if (!/[A-Za-z]/.test(password)) return "كلمة المرور يجب أن تحتوي على حرف واحد على الأقل.";
  if (!/[0-9]/.test(password)) return "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل.";
  return "";
}

function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-US").format(number);
}

function shuffleArray(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function normalizeStats(payload) {
  const row = Array.isArray(payload) ? payload[0] : payload;

  return {
    total_joined: Number(row?.total_joined || 0),
    active_now: Number(row?.active_now || 0),
    completed_count: Number(row?.completed_count || 0)
  };
}

export default function AuthGate({
  onEnter,
  onAuthenticated,
  recoveryMode = false,
  onPasswordUpdated
}) {
  const [mode, setMode] = useState(recoveryMode ? "recover" : "signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [statsReady, setStatsReady] = useState(false);
  const [activeSample, setActiveSample] = useState({ type: "", index: 0, selectedOption: "", optionOrder: [] });
  const [openFaq, setOpenFaq] = useState("هل الرحلة مجانية؟");

  const passwordHint = useMemo(() => passwordIssue(password), [password]);
  const recoveryPasswordHint = useMemo(() => passwordIssue(newPassword), [newPassword]);

  useEffect(() => {
    setMode(recoveryMode ? "recover" : "signin");
  }, [recoveryMode]);

  async function loadPublicStats() {
    if (!isSupabaseConfigured || !supabase) {
      setStatsReady(true);
      return;
    }

    const { data, error } = await supabase.rpc("get_public_platform_stats");

    if (!error && data) {
      setStats(normalizeStats(data));
    }

    setStatsReady(true);
  }

  useEffect(() => {
    loadPublicStats();

    const timer = window.setInterval(() => {
      loadPublicStats();
    }, 30000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function touchActivity() {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.rpc("touch_user_activity");
  }


  function openSample(type) {
    const bank = type === "lesson" ? LESSON_SAMPLES : SIMULATION_SAMPLES;

    setActiveSample((current) => {
      let nextIndex = Math.floor(Math.random() * bank.length);

      if (bank.length > 1 && current.type === type && current.index === nextIndex) {
        nextIndex = (nextIndex + 1) % bank.length;
      }

      const selectedSimulation = type === "simulation" ? bank[nextIndex] : null;

      return {
        type,
        index: nextIndex,
        selectedOption: "",
        optionOrder: selectedSimulation
          ? shuffleArray(selectedSimulation.options.map((option) => option.id))
          : []
      };
    });
  }

  function closeSample() {
    setActiveSample({ type: "", index: 0, selectedOption: "", optionOrder: [] });
  }

  function chooseSimulationOption(optionId) {
    setActiveSample((current) => ({
      ...current,
      selectedOption: optionId
    }));
  }

  function showNotice(message) {
    setNotice(message);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setNotice("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");

    if (nextMode === "signin") {
      setFullName("");
    }
  }

  async function handleForgotPassword() {
    setNotice("");

    if (!isSupabaseConfigured || !supabase) {
      showNotice("استعادة كلمة المرور تحتاج تفعيل Supabase.");
      return;
    }

    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail) {
      showNotice("اكتب بريدك الإلكتروني أولًا، ثم اضغط نسيت كلمة المرور.");
      return;
    }

    setBusy(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo
      });

      if (error) throw error;

      showNotice("أرسلنا رابط استعادة كلمة المرور إلى بريدك. افتح الرابط وسيظهر لك نموذج تعيين كلمة مرور جديدة.");
    } catch (error) {
      showNotice(error?.message || "تعذر إرسال رابط استعادة كلمة المرور.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRecoverySubmit(event) {
    event.preventDefault();
    setNotice("");

    const issue = passwordIssue(newPassword);
    if (issue) {
      showNotice(issue);
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotice("كلمتا المرور غير متطابقتين.");
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      showNotice("تحديث كلمة المرور يحتاج تفعيل Supabase.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      const { data } = await supabase.auth.getSession();
      await touchActivity();

      showNotice("تم تحديث كلمة المرور بنجاح.");

      window.history.replaceState({}, document.title, window.location.origin + "/");

      onPasswordUpdated?.(data?.session || null);

      if (data?.session) {
        onEnter?.({
          session: data.session,
          name:
            data.session?.user?.user_metadata?.full_name ||
            data.session?.user?.email ||
            "زميل المهنة"
        });
        onAuthenticated?.(data.session);
      }
    } catch (error) {
      showNotice(error?.message || "تعذر تحديث كلمة المرور.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");

    if (mode === "recover") {
      await handleRecoverySubmit(event);
      return;
    }

    const cleanEmail = normalizeEmail(email);
    const cleanName = fullName.trim();

    if (!isSupabaseConfigured || !supabase) {
      const demoName = cleanName || "زميل المهنة";
      localStorage.setItem("od_demo_name", demoName);
      onEnter?.({ name: demoName, demo: true });
      return;
    }

    if (mode === "signup" && !cleanName) {
      showNotice("اكتب اسمك كما تحب أن تراه في شهادتك.");
      return;
    }

    if (!cleanEmail) {
      showNotice("أدخل البريد الإلكتروني.");
      return;
    }

    if (passwordIssue(password)) {
      showNotice(passwordIssue(password));
      return;
    }

    setBusy(true);

    try {
      if (mode === "signup") {
        const redirectTo = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: { full_name: cleanName }
          }
        });

        if (error) throw error;

        if (data?.session) {
          await supabase.auth.signOut();
        }

        showNotice("تم إنشاء الحساب. أرسلنا لك رابط تأكيد على البريد. افتح الرابط لتفعيل الحساب، ثم سجل الدخول.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) throw error;

      await touchActivity();
      await loadPublicStats();

      const session = data?.session;
      const name =
        session?.user?.user_metadata?.full_name ||
        session?.user?.email ||
        "زميل المهنة";

      onEnter?.({ session, name });
      onAuthenticated?.(session);
    } catch (error) {
      showNotice(error?.message || "تعذر تنفيذ العملية. تحقق من البيانات وحاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  function enterDemo() {
    const demoName = fullName.trim() || "زميل المهنة";
    localStorage.setItem("od_demo_name", demoName);
    onEnter?.({ name: demoName, demo: true });
  }


  const activeLesson =
    activeSample.type === "lesson" ? LESSON_SAMPLES[activeSample.index] : null;

  const activeSimulation =
    activeSample.type === "simulation" ? SIMULATION_SAMPLES[activeSample.index] : null;

  const activeSimulationOptions =
    activeSimulation && activeSample.optionOrder.length
      ? activeSample.optionOrder
          .map((optionId) =>
            activeSimulation.options.find((option) => option.id === optionId)
          )
          .filter(Boolean)
      : activeSimulation?.options || [];

  return (
    <main className="public-gate" dir="rtl">
      <BrandMeta />
      <ExperienceDesignSkin />
      <style>{`
        /*
          OD Academy — Visual redesign (Design-only)
          مختبر التشخيص التنظيمي | Organizational Diagnostic Lab
          - لا يغيّر النصوص ولا المنطق ولا Supabase/Auth/API/RPC/Routes.
          - تعديل CSS فقط داخل نفس البلوك.
        */

        .public-gate {
          --ink: #0c0717;
          --ink-2: #120a22;
          --navy: #160c2a;
          --panel: rgba(28, 17, 50, 0.72);
          --panel-2: rgba(34, 20, 60, 0.66);
          --line: rgba(167, 139, 250, 0.14);
          --line-2: rgba(167, 139, 250, 0.26);
          --indigo: #8b5cf6;
          --indigo-2: #a78bfa;
          --indigo-soft: rgba(139, 92, 246, 0.14);
          --gold: #a855f7;
          --gold-2: #c4b5fd;
          --gold-soft: rgba(168, 85, 247, 0.13);
          --teal: #7c3aed;
          --teal-2: #c4b5fd;
          --teal-soft: rgba(124, 58, 237, 0.12);
          --warm: #f1ecfb;
          --text: #ece6f8;
          --muted: #b6a8d6;
          --muted-2: #7a6c9a;

          position: relative;
          min-height: 100vh;
          color: var(--text);
          padding: 26px 14px 72px;
          font-family: var(--font-body, inherit);
          background:
            radial-gradient(circle at 14% 6%, rgba(139, 92, 246, 0.12), transparent 32%),
            radial-gradient(circle at 88% 10%, rgba(124, 58, 237, 0.08), transparent 30%),
            linear-gradient(180deg, #0c0717 0%, #120a22 48%, #0c0717 100%);
        }

        /* blueprint grid texture for the whole gate */
        .public-gate::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.55;
          background-image:
            linear-gradient(rgba(167, 139, 250, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(167, 139, 250, 0.05) 1px, transparent 1px);
          background-size: 46px 46px, 46px 46px;
          -webkit-mask-image: radial-gradient(130% 90% at 50% 0%, #000 35%, transparent 80%);
                  mask-image: radial-gradient(130% 90% at 50% 0%, #000 35%, transparent 80%);
        }

        .public-wrap {
          position: relative;
          z-index: 1;
          width: min(1200px, 100%);
          margin: 0 auto;
        }

        /* ===== Hero — مختبر الفهم ===== */
        .public-hero {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 26px;
          align-items: center;
          border-radius: 30px;
          padding: clamp(24px, 4vw, 44px);
          color: var(--text);
          border: 1px solid var(--line-2);
          background:
            radial-gradient(120% 150% at 88% -20%, rgba(139, 92, 246, 0.18), transparent 52%),
            radial-gradient(90% 130% at -5% 120%, rgba(124, 58, 237, 0.10), transparent 55%),
            linear-gradient(155deg, #160c2a 0%, #130a24 55%, #1a1030 100%);
          box-shadow: 0 40px 120px rgba(8, 5, 18, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .public-hero > * {
          position: relative;
          z-index: 2;
        }

        .public-brand-logo {
          margin-bottom: 20px;
          width: fit-content;
          max-width: 100%;
          border-radius: 16px;
          padding: 9px 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--line);
          box-shadow: 0 12px 34px rgba(8, 5, 18, 0.4);
        }

        .public-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 15px 8px 13px;
          border-radius: 999px;
          background: var(--indigo-soft);
          border: 1px solid rgba(139, 92, 246, 0.32);
          color: #d6c9fb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0;
        }

        .public-badge::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--teal);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.18);
          animation: labPulse 2.6s ease-in-out infinite;
        }

        .public-hero h1 {
          margin: 20px 0 16px;
          font-family: var(--font-display, inherit);
          font-size: clamp(34px, 5.2vw, 66px);
          line-height: 1.16;
          font-weight: 800;
          letter-spacing: 0;
          color: var(--warm);
          text-wrap: balance;
        }

        .public-hero p {
          margin: 0;
          max-width: 540px;
          color: var(--muted);
          line-height: 2.05;
          font-size: clamp(14px, 1.4vw, 16px);
          font-weight: 600;
        }

        .hero-points {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 26px;
        }

        .hero-point {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          padding: 16px 16px 18px;
          background: var(--panel);
          border: 1px solid var(--line);
          backdrop-filter: blur(8px);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .hero-point::before {
          content: "";
          position: absolute;
          inset-inline: 16px;
          top: 0;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--indigo), var(--teal));
          opacity: 0.5;
        }

        .hero-point:hover {
          transform: translateY(-3px);
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 18px 44px rgba(8, 5, 18, 0.5);
        }

        .hero-point b {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 11px;
          margin-bottom: 12px;
          color: var(--gold-2);
          background: var(--gold-soft);
          border: 1px solid rgba(168, 85, 247, 0.3);
          font-size: 13px;
          font-weight: 900;
          font-family: var(--font-display, inherit);
        }

        .hero-point strong {
          display: block;
          color: var(--text);
          font-size: 15px;
          line-height: 1.6;
          font-weight: 800;
          margin-bottom: 7px;
        }

        .hero-point span {
          display: block;
          color: var(--muted-2);
          font-size: 12.5px;
          line-height: 1.9;
          font-weight: 600;
        }

        /* ===== Access panel — بوابة الوصول ===== */
        .auth-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: clamp(20px, 2.4vw, 26px);
          background:
            linear-gradient(180deg, rgba(36, 22, 66, 0.92), rgba(26, 15, 48, 0.96));
          color: var(--text);
          border: 1px solid var(--line-2);
          box-shadow: 0 36px 90px rgba(8, 5, 18, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .auth-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 3px;
          background: linear-gradient(90deg, var(--indigo), var(--teal) 60%, var(--gold));
          opacity: 0.85;
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          padding: 6px;
          border-radius: 16px;
          background: rgba(16, 9, 30, 0.6);
          border: 1px solid var(--line);
          margin-bottom: 18px;
        }

        .auth-tabs button {
          border: 0;
          cursor: pointer;
          border-radius: 12px;
          padding: 12px;
          font-family: inherit;
          color: var(--muted);
          font-weight: 800;
          background: transparent;
          transition: 0.2s ease;
        }

        .auth-tabs button:hover {
          color: var(--text);
        }

        .auth-tabs button.active {
          color: #fff;
          background: linear-gradient(135deg, #7c3aed, #3b1d6e);
          box-shadow: 0 10px 26px rgba(124, 58, 237, 0.32);
        }

        .auth-title {
          margin: 0 0 16px;
          color: var(--warm);
          font-family: var(--font-display, inherit);
          font-size: 22px;
          line-height: 1.5;
          font-weight: 800;
        }

        .auth-field {
          margin-bottom: 13px;
        }

        .auth-field label {
          display: block;
          margin-bottom: 8px;
          color: var(--muted);
          font-size: 12.5px;
          font-weight: 800;
          letter-spacing: 0;
        }

        .auth-field input {
          width: 100%;
          min-height: 50px;
          border-radius: 14px;
          border: 1px solid var(--line-2);
          padding: 0 14px;
          font-family: inherit;
          font-weight: 700;
          color: var(--text);
          background: rgba(16, 9, 30, 0.7);
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .auth-field input::placeholder {
          color: #6f6391;
          font-weight: 600;
        }

        .auth-field input:focus {
          border-color: var(--indigo);
          background: rgba(18, 11, 34, 0.92);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.16);
        }

        .password-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        .toggle-password {
          border: 1px solid var(--line-2);
          border-radius: 14px;
          padding: 0 16px;
          background: var(--indigo-soft);
          color: #d6c9fb;
          font-family: inherit;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .toggle-password:hover {
          background: rgba(139, 92, 246, 0.22);
        }

        .hint {
          display: block;
          margin-top: 8px;
          color: var(--muted-2);
          font-size: 11px;
          line-height: 1.7;
          font-weight: 600;
        }

        .forgot-button {
          border: 0;
          background: transparent;
          color: var(--teal-2);
          font-family: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          padding: 6px 0 0;
          text-align: right;
        }

        .forgot-button:hover {
          color: var(--teal);
          text-decoration: underline;
        }

        .auth-notice {
          margin: 11px 0;
          border-radius: 14px;
          padding: 12px 14px;
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.32);
          color: var(--gold-2);
          font-size: 12px;
          line-height: 1.8;
          font-weight: 700;
        }

        .auth-actions {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .auth-actions button {
          border: 0;
          border-radius: 15px;
          min-height: 52px;
          cursor: pointer;
          font-family: inherit;
          font-weight: 900;
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
        }

        .auth-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-primary {
          position: relative;
          color: #fff;
          background: linear-gradient(135deg, #7c3aed, #3b1d6e);
          box-shadow: 0 16px 38px rgba(59, 29, 110, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.14);
        }

        .auth-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 22px 50px rgba(59, 29, 110, 0.5);
        }

        .auth-ghost {
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--line-2);
        }

        .auth-ghost:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.09);
        }

        /* ===== Sections ===== */
        .public-section {
          position: relative;
          margin-top: 16px;
          border-radius: 26px;
          padding: clamp(22px, 3vw, 34px);
          background: linear-gradient(180deg, rgba(26, 15, 48, 0.86), rgba(22, 13, 42, 0.9));
          border: 1px solid var(--line);
          box-shadow: 0 26px 70px rgba(8, 5, 18, 0.4);
        }

        .section-head {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--line);
        }

        .section-head h2 {
          position: relative;
          margin: 0;
          padding-inline-start: 18px;
          font-family: var(--font-display, inherit);
          font-size: clamp(23px, 3vw, 36px);
          color: var(--warm);
          font-weight: 800;
          line-height: 1.3;
        }

        .section-head h2::before {
          content: "";
          position: absolute;
          inset-inline-start: 0;
          top: 0.12em;
          bottom: 0.12em;
          width: 4px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--indigo), var(--teal));
        }

        .section-head p {
          margin: 7px 0 0;
          color: var(--muted);
          line-height: 1.9;
          font-size: 13px;
          font-weight: 600;
        }

        /* ===== Counters — لوحة مؤشرات حية ===== */
        .counter-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .counter-card {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          padding: 22px 22px 20px;
          background:
            radial-gradient(120% 140% at 100% 0%, rgba(124, 58, 237, 0.1), transparent 50%),
            linear-gradient(180deg, rgba(30, 18, 55, 0.9), rgba(22, 13, 42, 0.94));
          border: 1px solid var(--line);
        }

        .counter-card::before {
          content: "";
          position: absolute;
          inset-inline: 0;
          top: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--teal), transparent);
          opacity: 0.7;
          animation: labScanX 4.5s linear infinite;
        }

        .counter-card::after {
          content: "";
          position: absolute;
          top: 16px;
          inset-inline-end: 16px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--teal);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.16);
          animation: labPulse 2.6s ease-in-out infinite;
        }

        .counter-card strong {
          position: relative;
          display: block;
          font-family: var(--font-display, inherit);
          font-size: clamp(30px, 4vw, 40px);
          color: var(--warm);
          font-weight: 800;
          letter-spacing: 0;
          line-height: 1.1;
        }

        .counter-card span {
          position: relative;
          display: block;
          margin-top: 8px;
          color: var(--muted);
          font-size: 12.5px;
          line-height: 1.8;
          font-weight: 700;
        }

        /* ===== Path — سلّم النضج التنظيمي ===== */
        .path-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .path-card,
        .info-card,
        .faq-card {
          position: relative;
          border-radius: 20px;
          padding: 20px;
          background: linear-gradient(180deg, rgba(30, 18, 55, 0.78), rgba(22, 13, 42, 0.85));
          border: 1px solid var(--line);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .path-card {
          padding-top: 22px;
        }

        .path-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 246, 0.4);
          box-shadow: 0 22px 54px rgba(8, 5, 18, 0.5);
        }

        .path-card b {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          margin-bottom: 14px;
          padding: 0 6px;
          border-radius: 13px;
          background: var(--indigo-soft);
          border: 1px solid rgba(139, 92, 246, 0.34);
          color: var(--indigo-2);
          font-family: var(--font-display, inherit);
          font-size: 16px;
          font-weight: 900;
          box-shadow: 0 0 0 5px rgba(139, 92, 246, 0.07);
        }

        .path-card strong,
        .info-card strong {
          display: block;
          margin-bottom: 9px;
          color: var(--warm);
          font-family: var(--font-display, inherit);
          font-size: 16.5px;
          line-height: 1.55;
          font-weight: 800;
        }

        .path-card span,
        .info-card span {
          display: block;
          color: var(--muted);
          line-height: 1.9;
          font-size: 13px;
          font-weight: 600;
        }

        /* ===== Free sample — معاينة غرفة تشخيص ===== */
        .two-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .sample-box {
          position: relative;
          overflow: hidden;
          border-radius: 22px;
          padding: 24px;
          background: linear-gradient(180deg, rgba(30, 18, 55, 0.86), rgba(22, 13, 42, 0.92));
          border: 1px solid var(--line-2);
        }

        .sample-box::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 3px;
          opacity: 0.85;
        }

        .sample-lesson::before {
          background: linear-gradient(90deg, var(--indigo), transparent);
        }

        .sample-simulation::before {
          background: linear-gradient(90deg, var(--teal), transparent);
        }

        .sample-lesson {
          background:
            radial-gradient(120% 130% at 100% 0%, rgba(139, 92, 246, 0.12), transparent 48%),
            linear-gradient(180deg, rgba(30, 18, 55, 0.86), rgba(22, 13, 42, 0.92));
        }

        .sample-simulation {
          background:
            radial-gradient(120% 130% at 100% 0%, rgba(124, 58, 237, 0.12), transparent 48%),
            linear-gradient(180deg, rgba(30, 18, 55, 0.86), rgba(22, 13, 42, 0.92));
        }

        .sample-box h3 {
          margin: 0 0 12px;
          color: var(--warm);
          font-family: var(--font-display, inherit);
          font-size: 20px;
          line-height: 1.5;
          font-weight: 800;
        }

        .sample-box p {
          margin: 0;
          color: var(--muted);
          line-height: 2;
          font-size: 13px;
          font-weight: 600;
        }

        .sample-kicker {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(16, 9, 30, 0.6);
          border: 1px solid var(--line-2);
          color: var(--muted);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0;
        }

        .sample-kicker::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 2px;
          background: var(--gold);
        }

        .sample-bullets {
          margin: 16px 0 0;
          padding: 0;
          list-style: none;
          color: var(--muted);
          line-height: 1.9;
          font-size: 12.5px;
          font-weight: 700;
        }

        .sample-bullets li {
          position: relative;
          padding-inline-start: 22px;
          margin-bottom: 8px;
        }

        .sample-bullets li::before {
          content: "";
          position: absolute;
          inset-inline-start: 4px;
          top: 0.55em;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          border: 2px solid var(--teal);
        }

        .sample-button {
          margin-top: 18px;
          border: 0;
          border-radius: 15px;
          padding: 14px 20px;
          color: #fff;
          background: linear-gradient(135deg, #7c3aed, #3b1d6e);
          font-family: inherit;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 16px 36px rgba(59, 29, 110, 0.34);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .sample-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 22px 48px rgba(59, 29, 110, 0.46);
        }

        /* ===== About — ملف الحضور المهني ===== */
        .about-panel {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 14px;
        }

        .info-card strong {
          font-size: 19px;
        }

        .about-links {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 18px;
        }

        .about-links a {
          text-decoration: none;
          border-radius: 999px;
          padding: 10px 16px;
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--line-2);
          font-size: 12.5px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .about-links a.social-link {
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
        }

        .about-links a.social-link svg {
          width: 17px;
          height: 17px;
          flex: none;
        }

        .about-links a.social-linkedin {
          color: #ffffff !important;
          background: #0a66c2 !important;
          border: 1px solid #0a66c2 !important;
        }

        .about-links a.social-linkedin:hover {
          background: #0958a8 !important;
          border-color: #0958a8 !important;
          transform: translateY(-2px);
        }

        .about-links a.social-x {
          color: #ffffff !important;
          background: #000000 !important;
          border: 1px solid rgba(255, 255, 255, 0.22) !important;
        }

        .about-links a.social-x:hover {
          background: #141414 !important;
          transform: translateY(-2px);
        }

        body.od-theme-dark .about-links a.social-x {
          color: #000000 !important;
          background: #ffffff !important;
          border-color: rgba(0, 0, 0, 0.12) !important;
        }

        .about-links a.social-mail {
          color: #7c3aed !important;
          background: rgba(139, 92, 246, 0.12) !important;
          border: 1px solid rgba(139, 92, 246, 0.28) !important;
        }

        body.od-theme-dark .about-links a.social-mail {
          color: #d6c9fb !important;
          background: rgba(139, 92, 246, 0.16) !important;
          border-color: rgba(167, 139, 250, 0.34) !important;
        }

        .about-links a.social-mail:hover {
          transform: translateY(-2px);
        }

        .cred-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .info-card .cred-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.01em;
          color: #7c3aed;
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.28);
          box-shadow: 0 6px 18px rgba(124, 58, 237, 0.1);
        }

        .info-card .cred-badge svg {
          width: 14px;
          height: 14px;
          flex: none;
          opacity: 0.95;
        }

        body.od-theme-dark .info-card .cred-badge {
          color: #d6c9fb !important;
          background: rgba(139, 92, 246, 0.16) !important;
          border-color: rgba(167, 139, 250, 0.34) !important;
        }

        .about-links a:hover {
          color: #fff;
          border-color: rgba(139, 92, 246, 0.45);
          background: var(--indigo-soft);
          transform: translateY(-2px);
        }

        /* ===== FAQ — أسئلة ما قبل الرحلة ===== */
        .faq-list {
          display: grid;
          gap: 11px;
        }

        .faq-item {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(30, 18, 55, 0.7), rgba(22, 13, 42, 0.82));
          border: 1px solid var(--line);
          transition: border-color 0.22s ease, box-shadow 0.22s ease;
        }

        .faq-item:hover {
          border-color: var(--line-2);
        }

        .faq-item:has(.faq-question[aria-expanded="true"]) {
          border-color: rgba(139, 92, 246, 0.42);
          box-shadow: 0 18px 44px rgba(8, 5, 18, 0.4);
        }

        .faq-item:has(.faq-question[aria-expanded="true"])::before {
          content: "";
          position: absolute;
          inset-inline-start: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, var(--indigo), var(--teal));
        }

        .faq-question {
          width: 100%;
          border: 0;
          background: transparent;
          padding: 17px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          color: var(--text);
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 800;
          text-align: right;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .faq-question:hover {
          color: var(--warm);
        }

        .faq-question > span:last-child {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: none;
          width: 30px;
          height: 30px;
          border-radius: 10px;
          background: rgba(16, 9, 30, 0.6);
          border: 1px solid var(--line-2);
          color: var(--teal-2);
          font-size: 18px;
          font-weight: 900;
          line-height: 1;
        }

        .faq-question[aria-expanded="true"] > span:last-child {
          color: var(--gold-2);
          background: var(--gold-soft);
          border-color: rgba(168, 85, 247, 0.34);
        }

        .faq-question:focus-visible {
          outline: 2px solid var(--indigo);
          outline-offset: -2px;
        }

        .faq-answer {
          padding: 2px 20px 18px;
          color: var(--muted);
          line-height: 2;
          font-size: 13px;
          font-weight: 600;
          animation: faqReveal 0.28s ease both;
        }

        /* ===== Legal — طمأنينة وثقة ===== */
        .legal-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .legal-card {
          position: relative;
          border-radius: 18px;
          padding: 20px;
          padding-inline-start: 22px;
          background: linear-gradient(180deg, rgba(28, 17, 50, 0.7), rgba(22, 13, 42, 0.82));
          border: 1px solid var(--line);
        }

        .legal-card::before {
          content: "";
          position: absolute;
          inset-inline-start: 0;
          top: 18px;
          bottom: 18px;
          width: 3px;
          border-radius: 999px;
          background: linear-gradient(180deg, var(--gold), rgba(168, 85, 247, 0.2));
        }

        .legal-card strong {
          display: block;
          color: var(--warm);
          font-weight: 800;
          font-size: 15px;
          margin-bottom: 9px;
        }

        .legal-card span {
          color: var(--muted);
          line-height: 1.9;
          font-size: 13px;
          font-weight: 600;
        }

        /* ===== Footer — توقيع فاخر ===== */
        .public-footer-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 14px;
        }

        .public-footer-tagline {
          max-width: 640px;
          margin: 0 auto;
          color: inherit;
          line-height: 2;
          font-size: 13px;
          font-weight: 700;
        }

        .public-footer {
          position: relative;
          overflow: hidden;
          margin-top: 16px;
          text-align: center;
          color: var(--muted);
          line-height: 2;
          font-size: 13px;
          font-weight: 700;
          border-radius: 24px;
          padding: 34px 26px;
          background:
            radial-gradient(120% 160% at 50% -40%, rgba(139, 92, 246, 0.1), transparent 55%),
            linear-gradient(180deg, rgba(26, 15, 48, 0.92), rgba(16, 9, 28, 0.96));
          border: 1px solid var(--line-2);
        }

        .public-footer::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--indigo), var(--teal), transparent);
          opacity: 0.7;
        }

        .public-footer span {
          display: block;
          color: var(--muted-2);
          margin-top: 6px;
          font-size: 12px;
        }

        /* ===== Sample modal — ملف الحالة ===== */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 90;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(10, 6, 20, 0.72);
          backdrop-filter: blur(12px);
          animation: faqReveal 0.2s ease both;
        }

        .sample-modal {
          position: relative;
          width: min(900px, 100%);
          max-height: 88vh;
          overflow: auto;
          border-radius: 26px;
          background: linear-gradient(180deg, #1a1030, #130a24);
          border: 1px solid var(--line-2);
          box-shadow: 0 40px 110px rgba(0, 0, 0, 0.6);
          padding: clamp(22px, 3vw, 30px);
          color: var(--text);
        }

        .sample-modal::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 3px;
          background: linear-gradient(90deg, var(--indigo), var(--teal) 55%, var(--gold));
        }

        .sample-modal h2 {
          margin: 0 0 12px;
          color: var(--warm);
          font-family: var(--font-display, inherit);
          font-size: clamp(22px, 3vw, 28px);
          line-height: 1.45;
          font-weight: 800;
        }

        .sample-modal p,
        .sample-modal li {
          color: var(--muted);
          line-height: 2;
          font-size: 14px;
          font-weight: 600;
        }

        .sample-modal-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 11px;
          margin: 18px 0;
        }

        .sample-modal-card {
          border-radius: 16px;
          padding: 16px;
          background: rgba(16, 9, 30, 0.55);
          border: 1px solid var(--line);
        }

        .sample-modal-card b {
          display: inline-flex;
          margin-bottom: 10px;
          padding: 5px 10px;
          border-radius: 999px;
          background: var(--indigo-soft);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: var(--indigo-2);
          font-size: 11px;
          font-weight: 900;
        }

        .sample-modal-card strong {
          display: block;
          color: var(--text);
          line-height: 1.7;
          font-size: 13px;
          font-weight: 800;
        }

        .sample-modal-card span {
          display: block;
          margin-top: 7px;
          color: var(--muted-2);
          line-height: 1.8;
          font-size: 12px;
          font-weight: 600;
        }

        .simulation-choice {
          width: 100%;
          border-radius: 16px;
          padding: 15px 16px;
          margin-top: 11px;
          background: rgba(16, 9, 30, 0.5);
          border: 1px solid var(--line-2);
          text-align: right;
          font-family: inherit;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .simulation-choice:hover {
          transform: translateY(-1px);
          border-color: rgba(139, 92, 246, 0.42);
          box-shadow: 0 14px 32px rgba(8, 5, 18, 0.5);
        }

        .simulation-choice.correct {
          border-color: rgba(34, 197, 94, 0.5);
          background: rgba(34, 197, 94, 0.1);
        }

        .simulation-choice.warning {
          border-color: rgba(245, 158, 11, 0.5);
          background: rgba(245, 158, 11, 0.1);
        }

        .simulation-choice.wrong {
          border-color: rgba(244, 99, 122, 0.55);
          background: rgba(244, 99, 122, 0.1);
        }

        .simulation-choice strong {
          display: block;
          color: var(--text);
          font-size: 13px;
          line-height: 1.7;
          font-weight: 800;
        }

        .simulation-choice span {
          display: block;
          margin-top: 6px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.8;
          font-weight: 600;
        }

        .simulation-feedback {
          margin-top: 16px;
          border-radius: 16px;
          padding: 15px 16px;
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.26);
          color: var(--text);
          font-size: 13px;
          line-height: 1.9;
          font-weight: 700;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }

        .modal-actions button {
          border: 1px solid var(--line-2);
          border-radius: 14px;
          padding: 12px 18px;
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
          font-family: inherit;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .modal-actions button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* ===== Motion keyframes ===== */
        @keyframes labPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.16); opacity: 1; }
          50% { box-shadow: 0 0 0 8px rgba(124, 58, 237, 0.04); opacity: 0.78; }
        }

        @keyframes labScanX {
          0% { transform: translateX(-60%); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translateX(60%); opacity: 0; }
        }

        @keyframes faqReveal {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ===== Responsive ===== */
        @media (max-width: 980px) {
          .public-hero,
          .about-panel {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 920px) {
          .counter-grid,
          .path-grid,
          .two-grid,
          .legal-grid,
          .hero-points,
          .sample-modal-grid {
            grid-template-columns: 1fr;
          }

          .section-head {
            display: block;
          }
        }

        @media (max-width: 560px) {
          .public-gate {
            padding: 18px 11px 56px;
          }

          .hero-points {
            gap: 10px;
          }

          .auth-tabs {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .public-badge::before,
          .counter-card::before,
          .counter-card::after,
          .faq-answer,
          .modal-backdrop {
            animation: none !important;
          }
        }

      `}</style>

      <div className="public-wrap">
        <div
          className="visitor-theme-toggle"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "8px",
            position: "relative",
            zIndex: 3
          }}
        >
          <ThemeToggle />
        </div>
        <section className="public-hero">
          <div>
            <div className="public-brand-logo">
              <SiteLogo variant="horizontal" context="hero" />
            </div>
            <span className="public-badge">رحلة معرفية متكاملة في التطوير التنظيمي</span>
            <h1>حياك في مساحة الفهم قبل الحل</h1>
            <p>
              هنا لا تدخل لتقرأ محتوى متراكمًا، بل لتتقدم عبر مسار مصمم بعقلية
              استشارية: تشخيص، تصميم، تغيير، ثقافة، قياس، واستدامة.
            </p>

            <div className="hero-points" aria-label="مرتكزات الرحلة">
              <div className="hero-point">
                <b>01</b>
                <strong>اقرأ المنظمة كنظام</strong>
                <span>
                  افهم العلاقات بين الاستراتيجية، الهيكل، الأدوار، الثقافة،
                  والحوافز قبل بناء أي تدخل.
                </span>
              </div>

              <div className="hero-point">
                <b>02</b>
                <strong>ابنِ حكمًا مهنيًا</strong>
                <span>
                  تدرّب على تحليل الأعراض، اختبار الفرضيات، وطلب البيانات
                  المناسبة قبل إصدار التوصية.
                </span>
              </div>

              <div className="hero-point">
                <b>03</b>
                <strong>حوّل التعلم إلى أثر</strong>
                <span>
                  انتقل من فهم المفاهيم إلى تطبيقها في قرارات تنظيمية أوضح
                  وأكثر قابلية للقياس.
                </span>
              </div>
            </div>
          </div>

          <form className="auth-card" onSubmit={mode === "recover" ? handleRecoverySubmit : handleSubmit}>
            {mode !== "recover" && (
              <div className="auth-tabs">
                <button
                  type="button"
                  className={mode === "signin" ? "active" : ""}
                  onClick={() => switchMode("signin")}
                >
                  دخول
                </button>
                <button
                  type="button"
                  className={mode === "signup" ? "active" : ""}
                  onClick={() => switchMode("signup")}
                >
                  تسجيل جديد
                </button>
              </div>
            )}

            {mode === "recover" && (
              <>
                <h2 className="auth-title">تعيين كلمة مرور جديدة</h2>

                <div className="auth-field">
                  <label htmlFor="newPassword">كلمة المرور الجديدة</label>
                  <div className="password-row">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="8 أحرف على الأقل وفيها حرف ورقم"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      aria-label={showNewPassword ? "إخفاء كلمة المرور الجديدة" : "إظهار كلمة المرور الجديدة"}
                      aria-pressed={showNewPassword}
                      onClick={() => setShowNewPassword((value) => !value)}
                    >
                      {showNewPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                  <span className="hint">{recoveryPasswordHint || "كلمة المرور مناسبة."}</span>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
                  <input
                    id="confirmPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </>
            )}

            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor="fullName">اكتب اسمك كما تحب أن تراه في شهادتك</label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="اكتب الاسم هنا"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            {mode !== "recover" && isSupabaseConfigured && (
              <>
                <div className="auth-field">
                  <label htmlFor="email">البريد الإلكتروني</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="example@email.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="password">كلمة المرور</label>
                  <div className="password-row">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="8 أحرف على الأقل وفيها حرف ورقم"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? "إخفاء" : "إظهار"}
                    </button>
                  </div>

                  {mode === "signup" && (
                    <span className="hint">
                      {passwordHint || "كلمة المرور مناسبة."}
                    </span>
                  )}

                  {mode === "signin" && (
                    <button
                      type="button"
                      className="forgot-button"
                      onClick={handleForgotPassword}
                      disabled={busy}
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
              </>
            )}

            {notice && (
              <div className="auth-notice" role="alert" aria-live="assertive">
                {notice}
              </div>
            )}

            <div className="auth-actions">
              <button className="auth-primary" type="submit" disabled={busy}>
                {busy
                  ? "جار المعالجة..."
                  : mode === "recover"
                    ? "تحديث كلمة المرور"
                    : mode === "signin"
                      ? "دخول إلى الرحلة"
                      : "إنشاء حساب"}
              </button>

              {mode === "recover" && (
                <button className="auth-ghost" type="button" onClick={() => switchMode("signin")}>
                  العودة لتسجيل الدخول
                </button>
              )}

              {!isSupabaseConfigured && mode !== "recover" && (
                <button className="auth-ghost" type="button" onClick={enterDemo}>
                  دخول تجريبي
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>مؤشرات الرحلة</h2>
              <p>نبض حي يوضح حركة المتعلمين داخل المسار.</p>
            </div>
          </div>

          <div className="counter-grid" aria-live="polite">
            <div className="counter-card">
              <strong>{statsReady ? formatNumber(stats.total_joined) : "..."}</strong>
              <span>متدرب ومتدربة بدأوا رحلتهم</span>
            </div>
            <div className="counter-card">
              <strong>{statsReady ? formatNumber(stats.active_now) : "..."}</strong>
              <span>يدرسون معك في هذه اللحظة</span>
            </div>
            <div className="counter-card">
              <strong>{statsReady ? formatNumber(stats.completed_count) : "..."}</strong>
              <span>أتموا الـ 180 يوما بنجاح</span>
            </div>
          </div>
        </section>

        <VisitorTestimonialsMarquee />

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>خريطة مختصرة للمسار</h2>
              <p>ستة أشهر تبني قدرة متدرجة في قراءة المنظمة وتصميم التدخل وقياس الأثر.</p>
            </div>
          </div>

          <div className="path-grid">
            {MONTHS.map((month) => (
              <div className="path-card" key={month.number}>
                <b>{month.number}</b>
                <strong>{month.title}</strong>
                <span>{month.output}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>عينة مجانية من التجربة</h2>
              <p>كل نقرة تفتح عينة مختلفة: مرة درس تشخيصي، ومرة موقف محاكاة تختار فيه إجابتك وترى التصحيح فورًا.</p>
            </div>
          </div>

          <div className="two-grid">
            <div className="sample-box sample-lesson">
              <span className="sample-kicker">عينة درس</span>
              <h3>لماذا لا تبدأ من الحل؟</h3>
              <p>
                ستتعلم كيف تفرّق بين العرض الظاهر والسبب الجذري، وكيف تحوّل
                مشكلة عامة مثل ضعف الالتزام إلى أسئلة تشخيصية قابلة للتحقق.
              </p>
              <ul className="sample-bullets">
                <li>فكرة مركزة من درس فعلي.</li>
                <li>إطار تشخيصي مختصر.</li>
                <li>سؤال تطبيقي قبل الانتقال للحل.</li>
              </ul>
              <button className="sample-button" type="button" onClick={() => openSample("lesson")}>
                فتح الدرس التجريبي
              </button>
            </div>

            <div className="sample-box sample-simulation">
              <span className="sample-kicker">عينة محاكاة</span>
              <h3>اجتماع عاجل قبل إطلاق مبادرة تغيير</h3>
              <p>
                ستدخل موقفًا قصيرًا فيه ضغط من الإدارة، بيانات ناقصة، وروايات
                مختلفة. المطلوب أن تختار تصرفًا مهنيًا وتعرف لماذا هو الأقرب.
              </p>
              <ul className="sample-bullets">
                <li>موقف تشخيصي مصغر.</li>
                <li>ثلاثة اختيارات غير مفضوحة.</li>
                <li>تصحيح فوري يوضح منطق الإجابة.</li>
              </ul>
              <button className="sample-button" type="button" onClick={() => openSample("simulation")}>
                تجربة الموقف
              </button>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>عن ريان</h2>
              <p>الجهة التي تقف خلف بناء هذه الرحلة المعرفية.</p>
            </div>
          </div>

          <div className="about-panel">
            <div className="info-card">
              <strong>ريان العجلان</strong>
              <span>
                صانع هذه الرحلة كأثر معرفي هادئ؛ لمن يبحث عن المعنى خلف السلوك،
                والنظام خلف المشكلة. يجمع اهتمامه بين الموارد البشرية، التطوير
                التنظيمي، الأداء، التعلم، وبناء القدرة المؤسسية.
              </span>

              <div className="about-links">
                <a
                  className="social-link social-linkedin"
                  href="https://www.linkedin.com/in/rayanalajlan/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a
                  className="social-link social-x"
                  href="https://x.com/Rayan_Alajlan"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="منصة X"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>منصة X</span>
                </a>
                <a className="social-link social-mail" href="mailto:Rayansalajlan@gmail.com">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" />
                    <path d="m3.5 7 8.5 6 8.5-6" />
                  </svg>
                  <span>طلب استشارة</span>
                </a>
              </div>
            </div>

            <div className="info-card">
              <strong>اعتمادات مهنية</strong>
              <div className="cred-badges">
                {["SHRM-SCP", "SPHRi", "CPTD", "PMP"].map((cred) => (
                  <span className="cred-badge" key={cred}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="9" r="5.2" />
                      <path d="M9 13.3 7.7 21 12 18.5 16.3 21 15 13.3" />
                      <path d="m9.8 9 1.5 1.6 3-3.2" />
                    </svg>
                    {cred}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>أسئلة شائعة</h2>
              <p>إجابات مختصرة تساعدك قبل بدء الرحلة.</p>
            </div>
          </div>

          <div className="faq-list">
            {FAQ.map((item, index) => {
              const open = openFaq === item.q;
              const panelId = `faq-panel-${index}`;

              return (
                <div className="faq-item" key={item.q}>
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(open ? "" : item.q)}
                  >
                    <span>{item.q}</span>
                    <span>{open ? "−" : "+"}</span>
                  </button>

                  {open && (
                    <div id={panelId} className="faq-answer">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="public-section">
          <div className="section-head">
            <div>
              <h2>الخصوصية وشروط الاستخدام</h2>
              <p>وضوح مبكر حول الحسابات والتقدم التعليمي والبيانات.</p>
            </div>
          </div>

          <div className="legal-grid">
            <div className="legal-card">
              <strong>حفظ التقدم</strong>
              <span>
                تُستخدم بيانات الحساب والتقدم التعليمي لحفظ إنجازك وإعادتك إلى
                آخر محطة وصلت إليها.
              </span>
            </div>

            <div className="legal-card">
              <strong>حدود الوثيقة</strong>
              <span>
                وثيقة الإتقان تثبت إتمام الرحلة داخل المنصة، ولا تمثل شهادة
                أكاديمية أو وعدا وظيفيا.
              </span>
            </div>

            <div className="legal-card">
              <strong>سلامة البيانات</strong>
              <span>
                لا تدخل معلومات سرية أو حساسة داخل الحقول العامة، واستخدم
                بياناتك التعليمية لغرض التعلم فقط.
              </span>
            </div>
          </div>
        </section>

        <footer className="public-footer">
          <div className="public-footer-logo">
            <SiteLogo variant="horizontal" context="footer" />
          </div>
          <p className="public-footer-tagline">
            صنع بواسطة ريان العجلان كأثر معرفي هادئ؛ لمن يبحث عن المعنى خلف السلوك، والنظام خلف المشكلة.
          </p>
          <span>© 2026 — جميع الحقوق محفوظة</span>
        </footer>
      </div>
      {activeSample.type && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={activeSample.type === "lesson" ? "درس تجريبي" : "محاكاة تجريبية"}
        >
          <div className="sample-modal">
            {activeLesson && (
              <>
                <h2>درس تجريبي: {activeLesson.title}</h2>

                <p>{activeLesson.intro}</p>

                <div className="sample-modal-grid">
                  {activeLesson.cards.map((card) => (
                    <div className="sample-modal-card" key={card.label}>
                      <b>{card.label}</b>
                      <strong>{card.title}</strong>
                      <span>{card.text}</span>
                    </div>
                  ))}
                </div>

                <p>{activeLesson.takeaway}</p>

                <div className="sample-modal-card">
                  <b>{activeLesson.exerciseTitle}</b>
                  <strong>طبّق الفكرة قبل أن تغلق النافذة:</strong>
                  <span>{activeLesson.exercise}</span>
                </div>
              </>
            )}

            {activeSimulation && (
              <>
                <h2>محاكاة تجريبية: {activeSimulation.title}</h2>

                <p>{activeSimulation.context}</p>

                <div className="sample-modal-grid">
                  {activeSimulation.signals.map((signal) => (
                    <div className="sample-modal-card" key={signal.label}>
                      <b>{signal.label}</b>
                      <strong>{signal.title}</strong>
                      <span>{signal.text}</span>
                    </div>
                  ))}
                </div>

                <p>
                  اختر التصرف الأقرب مهنيًا. بعد اختيارك سيظهر لك التصحيح
                  مباشرة داخل نفس النافذة.
                </p>

                {activeSimulationOptions.map((option) => {
                  const selected = activeSample.selectedOption === option.id;
                  const revealed = Boolean(activeSample.selectedOption);
                  const correct = option.id === activeSimulation.correctOptionId;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`simulation-choice ${
                        revealed && correct ? "correct" : ""
                      } ${revealed && selected && !correct ? "wrong" : ""}`}
                      onClick={() => chooseSimulationOption(option.id)}
                    >
                      <strong>{option.title}</strong>
                      {revealed && (
                        <span>
                          {selected && correct
                            ? "اختيارك صحيح. "
                            : selected && !correct
                              ? "اختيارك يحتاج مراجعة. "
                              : correct
                                ? "الإجابة الأقرب: "
                                : ""}
                          {option.feedback}
                        </span>
                      )}
                    </button>
                  );
                })}

                {activeSample.selectedOption && (
                  <div className="simulation-feedback" role="status" aria-live="polite">
                    {activeSample.selectedOption === activeSimulation.correctOptionId
                      ? "ممتاز. أنت لم تنجذب للحل الأسرع، بل بدأت من التعاقد والتشخيص قبل تصميم التدخل."
                      : "الفكرة ليست اختيار الحل الأجمل، بل اختيار الخطوة التي تحمي التشخيص من القفز إلى تفسير واحد."}
                  </div>
                )}
              </>
            )}

            <div className="modal-actions">
              <button type="button" onClick={() => closeSample()}>
                إغلاق العينة
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
