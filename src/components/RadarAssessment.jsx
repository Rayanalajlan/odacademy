import { useEffect, useMemo, useState } from "react";
import { courseMap as rawCourseMap } from "../data/courseContent";
import { loadUserProgress } from "../lib/progressService";
import { loadRadarAssessmentHistory, saveRadarAssessmentResult } from "../lib/radarAssessmentService";

const ASSESSMENT_STORAGE_KEY = "odacademy_radar_pre_assessment_v3";
const ASSESSMENT_DRAFT_KEY = "odacademy_radar_pre_assessment_draft_v3";

const competencyLabels = [
  "تفكير نظمي",
  "تشخيص",
  "تصميم تنظيمي",
  "تعاقد وأخلاقيات",
  "تغيير وثقافة",
  "قياس واستدامة"
];

const competencyDescriptions = [
  "قراءة المنظمة كنظام مترابط بدل تفسير المشكلة كحادثة منفصلة.",
  "تحويل الشكوى إلى فرضيات قابلة للاختبار ومصادر بيانات متعددة.",
  "فهم أثر الهيكل، الأدوار، الصلاحيات، العمليات، ومؤشرات الأداء على السلوك.",
  "إدارة الدخول والتعاقد والسرية والقوة دون الانحياز لرواية طرف واحد.",
  "تصميم تدخلات تراعي الثقافة، المقاومة، التعلم، وقيادة التغيير.",
  "ربط التدخل بمؤشرات أثر، تبنٍ، استدامة، وتغذية راجعة مستمرة."
];

const preAssessmentQuestions = [
  {
    id: "q01",
    difficulty: "تأسيسي",
    category: "قراءة الطلب الأولي",
    caseText:
      "الرئيس التنفيذي يقول لك في أول لقاء: نحتاج برنامج قيادة عاجل لأن المديرين لا يقودون فرقهم. لا توجد بيانات أخرى حتى الآن، والوقت ضيق قبل اجتماع مجلس الإدارة.",
    prompt: "ما التصرف الأقرب لعقلية ممارس OD محترف؟",
    options: [
      { text: "أحوّل الطلب إلى فرضية، وأتفق على مقابلات وبيانات أولية قبل اختيار التدريب كحل.", scores: [4, 5, 3, 4, 3, 3] },
      { text: "أقبل البرنامج لكن أضيف في نهايته استبيان رضا لقياس جودة التنفيذ.", scores: [2, 2, 2, 2, 2, 2] },
      { text: "أطلب من الموارد البشرية تحديد أسماء المديرين الأضعف حتى يكون التدريب موجهًا.", scores: [1, 2, 2, 1, 2, 1] },
      { text: "أقترح ورشة قيادية قصيرة ثم أقرر لاحقًا إن كان هناك تشخيص أعمق.", scores: [2, 2, 1, 2, 2, 1] }
    ]
  },
  {
    id: "q02",
    difficulty: "تأسيسي",
    category: "التمييز بين العرض والسبب",
    caseText:
      "إدارة خدمة العملاء تعاني من انخفاض رضا المستفيدين. المدير يقول: الموظفون لا يملكون مهارات تواصل كافية.",
    prompt: "أي سؤال يكشف فهمًا أعمق للمشكلة؟",
    options: [
      { text: "هل تم تحليل رحلة الخدمة ونقاط التعطل قبل افتراض أن المشكلة مهارية؟", scores: [5, 5, 4, 3, 3, 4] },
      { text: "ما أفضل مزود تدريب في مهارات التواصل؟", scores: [1, 1, 1, 2, 2, 1] },
      { text: "كم عدد الموظفين الذين لديهم شكاوى مباشرة؟", scores: [2, 3, 2, 2, 2, 2] },
      { text: "هل نستطيع إضافة معيار رضا العملاء في تقييم الموظفين مباشرة؟", scores: [2, 2, 3, 2, 2, 3] }
    ]
  },
  {
    id: "q03",
    difficulty: "تأسيسي",
    category: "مصادر البيانات",
    caseText:
      "وصلتك نتائج استبيان رضا عام تظهر انخفاض الثقة في الإدارة. الراعي يريد منك تفسير النتيجة فورًا.",
    prompt: "كيف تتعامل مع النتيجة؟",
    options: [
      { text: "أتعامل معها كمؤشر أولي وأبحث عن مقابلات ووثائق وأنماط تشغيل تؤكد أو تنفي التفسير.", scores: [4, 5, 3, 4, 3, 4] },
      { text: "أفسرها كدليل كافٍ على ضعف القيادة العليا.", scores: [1, 1, 1, 1, 2, 1] },
      { text: "أقترح حملة تواصل داخلية لرفع الثقة قبل أن تتسع المشكلة.", scores: [2, 2, 1, 2, 3, 2] },
      { text: "أعيد الاستبيان بصياغة أخرى حتى أتأكد أن الموظفين فهموا الأسئلة.", scores: [2, 3, 2, 2, 2, 2] }
    ]
  },
  {
    id: "q04",
    difficulty: "تأسيسي",
    category: "حدود النظام",
    caseText:
      "إدارة المشتريات متهمة بالتأخير، لكن كل طلب يمر على المالية، الجهة الفنية، والمالك التنفيذي قبل الاعتماد.",
    prompt: "ما نطاق التشخيص الأنسب؟",
    options: [
      { text: "تشخيص تدفق عملية الشراء كاملة بين الإدارات، لا أداء المشتريات وحدها.", scores: [5, 4, 5, 3, 3, 4] },
      { text: "تحليل موظفي المشتريات الأكثر تأخيرًا ومقارنتهم بزملائهم.", scores: [2, 2, 2, 2, 1, 2] },
      { text: "إعادة توزيع مهام المشتريات لتقليل الضغط على الفريق.", scores: [2, 2, 3, 2, 2, 2] },
      { text: "إطلاق مؤشر أداء جديد لإدارة المشتريات فقط.", scores: [1, 2, 2, 1, 1, 3] }
    ]
  },
  {
    id: "q05",
    difficulty: "تأسيسي",
    category: "الأخلاقيات والسرية",
    caseText:
      "طلب منك مدير تنفيذي أسماء الموظفين الذين تحدثوا بسلبية عن أسلوب القيادة خلال المقابلات التشخيصية.",
    prompt: "ما الرد المهني؟",
    options: [
      { text: "أرفض كشف الأسماء، وأعرض الأنماط مجمعة مع توضيح حدود السرية المتفق عليها.", scores: [3, 4, 2, 5, 3, 4] },
      { text: "أشاركه الأسماء شريطة ألا يتخذ إجراءً عقابيًا.", scores: [1, 1, 1, 1, 1, 1] },
      { text: "أحذف كل الملاحظات الحساسة حتى لا تتضرر العلاقة مع الراعي.", scores: [1, 2, 1, 2, 1, 1] },
      { text: "أعيد المقابلات بحضور HR لضمان توثيق الكلام رسميًا.", scores: [2, 2, 1, 1, 1, 2] }
    ]
  },
  {
    id: "q06",
    difficulty: "تأسيسي",
    category: "الاستدامة",
    caseText:
      "بعد تنفيذ ورشة تغيير، ارتفعت الحماسة أسبوعين ثم عاد الفريق لنمطه القديم.",
    prompt: "ما السؤال الأهم لتفسير العودة؟",
    options: [
      { text: "هل تغيرت الأنظمة والمؤشرات والروتينات التي تعزز السلوك القديم؟", scores: [5, 4, 4, 3, 5, 5] },
      { text: "هل كان المدرب مؤثرًا بما يكفي؟", scores: [1, 1, 1, 2, 2, 1] },
      { text: "هل حضر جميع الموظفين الورشة؟", scores: [2, 2, 1, 2, 2, 2] },
      { text: "هل كانت مدة الورشة قصيرة؟", scores: [1, 1, 1, 2, 2, 1] }
    ]
  },
  {
    id: "q07",
    difficulty: "متوسط",
    category: "التشخيص متعدد المستويات",
    caseText:
      "فريق مشروع يتأخر باستمرار. قائد المشروع يقول إن الأعضاء غير ملتزمين، بينما الأعضاء يقولون إنهم يتبعون إدارات وظيفية لديها أولويات مختلفة.",
    prompt: "أي فرضية أكثر اتزانًا؟",
    options: [
      { text: "قد يكون التأخير ناتجًا عن تصميم مصفوفي غير واضح بين مسؤولية المشروع وسلطة المديرين الوظيفيين.", scores: [5, 5, 5, 4, 3, 4] },
      { text: "الفريق لا يملك ثقافة التزام ويحتاج ميثاق فريق واضح.", scores: [2, 2, 2, 3, 3, 2] },
      { text: "قائد المشروع لا يستخدم أساليب متابعة كافية.", scores: [2, 2, 2, 2, 2, 2] },
      { text: "الإدارات الوظيفية لا تدعم المشروع ويجب تصعيد الموضوع للإدارة العليا فورًا.", scores: [2, 2, 3, 2, 2, 2] }
    ]
  },
  {
    id: "q08",
    difficulty: "متوسط",
    category: "صياغة القضية التنظيمية",
    caseText:
      "العميل يقول: ثقافتنا ضعيفة. عند سؤاله، يذكر تأخر القرارات، كثرة التصعيد، وانخفاض المبادرة.",
    prompt: "أي صياغة تصلح كبداية تشخيصية؟",
    options: [
      { text: "توجد مؤشرات على بطء قرار وضعف مبادرة قد ترتبط بالصلاحيات، المساءلة، أو نمط القيادة.", scores: [4, 5, 4, 4, 3, 3] },
      { text: "الثقافة الحالية لا تدعم التغيير وتحتاج برنامج قيم.", scores: [2, 2, 1, 2, 3, 2] },
      { text: "الموظفون لا يملكون روح المبادرة الكافية.", scores: [1, 1, 1, 1, 2, 1] },
      { text: "يجب إعادة بناء الهوية الثقافية قبل أي تدخل آخر.", scores: [2, 2, 1, 2, 3, 2] }
    ]
  },
  {
    id: "q09",
    difficulty: "متوسط",
    category: "تضارب المؤشرات",
    caseText:
      "منظمة تطلب تعاونًا عاليًا بين الإدارات، لكنها تكافئ كل إدارة على إنجاز مؤشراتها الخاصة فقط، حتى لو عطلت رحلة العميل.",
    prompt: "ما نقطة الرفع الأقوى؟",
    options: [
      { text: "فحص مواءمة مؤشرات الأداء والحوافز مع رحلة العميل المشتركة.", scores: [5, 4, 5, 3, 4, 5] },
      { text: "تنفيذ ورشة عمل عن مهارات التعاون والتواصل بين الإدارات.", scores: [2, 2, 2, 2, 3, 2] },
      { text: "إطلاق حملة داخلية عن أهمية العمل بروح الفريق.", scores: [1, 1, 1, 2, 3, 1] },
      { text: "إضافة اجتماع أسبوعي بين المدراء لمناقشة التعثرات.", scores: [3, 3, 3, 3, 3, 3] }
    ]
  },
  {
    id: "q10",
    difficulty: "متوسط",
    category: "الدخول والتعاقد",
    caseText:
      "طلبت مقابلة الموظفين، لكن الراعي قال: لا داعي، نحن نعرف المشكلة. فقط نحتاج تقريرًا سريعًا.",
    prompt: "ما موقفك المهني؟",
    options: [
      { text: "أوضح أن التقرير سيكون محدودًا دون مصادر متعددة، وأعيد التعاقد على الحد الأدنى من البيانات.", scores: [4, 5, 3, 5, 3, 4] },
      { text: "أقبل الطلب حفاظًا على العلاقة، ثم أكتب التحفظات في نهاية التقرير.", scores: [2, 2, 1, 2, 1, 2] },
      { text: "أرفض المشروع مباشرة لأن الراعي لا يريد تشخيصًا حقيقيًا.", scores: [2, 2, 1, 3, 2, 1] },
      { text: "أستخدم خبرتي السابقة لتقدير السبب دون مقابلات.", scores: [1, 1, 1, 1, 1, 1] }
    ]
  },
  {
    id: "q11",
    difficulty: "متوسط",
    category: "المقاومة",
    caseText:
      "في مشروع نظام جديد، يرفض موظفو الفروع استخدام النظام. الإدارة تصفهم بأنهم مقاومون للتغيير.",
    prompt: "أي مسار تشخيصي أفضل؟",
    options: [
      { text: "فحص ملاءمة النظام لعمل الفروع، مشاركتهم في التصميم، ودعم المديرين لاستخدامه.", scores: [5, 5, 4, 4, 5, 4] },
      { text: "تطبيق خطة اتصال أقوى تشرح فوائد النظام للفروع.", scores: [3, 2, 2, 3, 4, 2] },
      { text: "رفع الأمر للقيادة لإلزام الفروع باستخدام النظام.", scores: [1, 1, 2, 1, 2, 2] },
      { text: "إعادة تدريب الفروع على النظام حتى تختفي المقاومة.", scores: [2, 2, 1, 2, 3, 2] }
    ]
  },
  {
    id: "q12",
    difficulty: "متوسط",
    category: "اختيار التدخل",
    caseText:
      "بعد تشخيص أولي، تبيّن أن المشكلة في تداخل نقاط التسليم بين إدارتين أكثر من كونها مشكلة علاقة شخصية.",
    prompt: "ما التدخل الأقرب؟",
    options: [
      { text: "إعادة تصميم العملية ونقاط التسليم مع توضيح RACI ومؤشرات مشتركة.", scores: [5, 4, 5, 4, 3, 5] },
      { text: "جلسة بناء فريق لكسر الحواجز النفسية بين الإدارتين.", scores: [2, 2, 1, 2, 3, 2] },
      { text: "توجيه المديرين لتكثيف التواصل اليومي.", scores: [2, 2, 2, 2, 2, 2] },
      { text: "تغيير قائد إحدى الإدارتين لتقليل الاحتكاك.", scores: [1, 1, 1, 1, 1, 1] }
    ]
  },
  {
    id: "q13",
    difficulty: "متقدم",
    category: "السبب الأكثر تفسيرًا",
    caseText:
      "الاستقالات مرتفعة في ثلاث إدارات، لكنها أعلى بوضوح لدى الموظفين الجدد بعد الشهر الرابع. مقابلات الخروج تشير إلى غموض التوقعات وضغط غير متوقع.",
    prompt: "أي فرضية تستحق الاختبار أولًا؟",
    options: [
      { text: "قد توجد فجوة بين الاستقطاب، التهيئة، تصميم الدور، وتوقعات الأداء في الأشهر الأولى.", scores: [5, 5, 5, 4, 4, 5] },
      { text: "سوق العمل أصبح أكثر تنافسية والموظفون الجدد أقل ولاءً.", scores: [2, 2, 1, 1, 2, 2] },
      { text: "المكافآت المالية لا تكفي للاحتفاظ بالموظفين الجدد.", scores: [2, 3, 2, 2, 2, 3] },
      { text: "المديرون يحتاجون تدريبًا على الاحتواء والتحفيز.", scores: [2, 2, 2, 2, 3, 2] }
    ]
  },
  {
    id: "q14",
    difficulty: "متقدم",
    category: "الحياد في عرض النتائج",
    caseText:
      "البيانات تشير إلى أن سلوك القيادة العليا يخلق خوفًا من رفع الأخبار السيئة. الراعي نفسه من القيادة العليا.",
    prompt: "كيف تعرض النتيجة؟",
    options: [
      { text: "أعرضها كنمط نظامي يؤثر على تدفق المعلومات، مع أمثلة مجمعة ومسار حوار آمن.", scores: [5, 5, 3, 5, 5, 4] },
      { text: "أؤجلها حتى لا تخسر القيادة ثقتها في التشخيص.", scores: [1, 1, 1, 2, 1, 1] },
      { text: "أعرضها بشكل مباشر كخلل في شخصية القيادة حتى تكون الرسالة واضحة.", scores: [2, 2, 1, 1, 2, 1] },
      { text: "أرسلها مكتوبة فقط دون نقاش حتى لا يتحول الاجتماع إلى دفاع.", scores: [2, 2, 1, 2, 2, 2] }
    ]
  },
  {
    id: "q15",
    difficulty: "متقدم",
    category: "التصميم التنظيمي",
    caseText:
      "شركة تنمو بسرعة. المؤسسون ما زالوا يوافقون على أغلب القرارات الصغيرة، والموظفون ينتظرون التوجيه قبل المبادرة.",
    prompt: "ما القراءة الأقوى؟",
    options: [
      { text: "النمو تجاوز تصميم القرار الحالي؛ يلزم توضيح الصلاحيات والحوكمة لا مجرد تحفيز المبادرة.", scores: [5, 4, 5, 4, 4, 4] },
      { text: "الموظفون اعتادوا الاعتماد على المؤسسين ويحتاجون تدريبًا على الاستقلالية.", scores: [2, 2, 2, 2, 3, 2] },
      { text: "المؤسسون بحاجة لتقليل اجتماعاتهم التشغيلية.", scores: [3, 3, 3, 2, 3, 2] },
      { text: "ثقافة الشركة أبوية وتحتاج حملة قيم جديدة.", scores: [3, 2, 2, 2, 4, 2] }
    ]
  },
  {
    id: "q16",
    difficulty: "متقدم",
    category: "بناء القدرة الداخلية",
    caseText:
      "بعد مشروع ناجح، يطلب العميل منك الاستمرار شهريًا لحل كل مشكلة تظهر بدل تدريب فريق داخلي على التشخيص.",
    prompt: "ما الموقف الأفضل؟",
    options: [
      { text: "أقترح نموذج دعم انتقالي يبني قدرة داخلية للتشخيص والمتابعة بدل الاعتماد الدائم عليّ.", scores: [4, 4, 3, 5, 4, 5] },
      { text: "أقبل لأن استمرار المستشار يضمن جودة التطبيق.", scores: [2, 2, 1, 2, 2, 2] },
      { text: "أطلب منهم التواصل فقط عندما تظهر مشكلة كبيرة.", scores: [2, 2, 1, 3, 2, 2] },
      { text: "أنقل لهم جميع أدواتي فورًا وأنهي العلاقة بالكامل.", scores: [2, 3, 2, 3, 2, 2] }
    ]
  },
  {
    id: "q17",
    difficulty: "متقدم",
    category: "التدخل متعدد المكونات",
    caseText:
      "التشخيص أظهر أن بطء القرار مرتبط بغموض صلاحيات، خوف من الخطأ، واجتماعات تصعيد طويلة.",
    prompt: "أي تدخل أكثر اكتمالًا؟",
    options: [
      { text: "تحديث مصفوفة القرار، إعادة تصميم اجتماعات الحسم، واتفاق قيادي على التعلم من الخطأ.", scores: [5, 5, 5, 4, 5, 5] },
      { text: "تدريب المديرين على اتخاذ القرار تحت الضغط.", scores: [2, 2, 2, 2, 3, 2] },
      { text: "تقليل عدد الاجتماعات لرفع سرعة الإنجاز.", scores: [3, 2, 3, 2, 2, 3] },
      { text: "توجيه القيادات لإظهار دعم أكبر للمبادرة.", scores: [3, 2, 2, 3, 4, 2] }
    ]
  },
  {
    id: "q18",
    difficulty: "متقدم",
    category: "قياس الأثر",
    caseText:
      "صممت تدخلًا لتحسين التعاون بين الإدارات. العميل يريد قياس النجاح بعدد الحضور ورضا المشاركين فقط.",
    prompt: "ما القياس الأنسب؟",
    options: [
      { text: "أضيف مؤشرات سلوكية وتشغيلية مثل زمن التسليم، إعادة العمل، التصعيدات، ومؤشرات مشتركة.", scores: [5, 4, 4, 3, 4, 5] },
      { text: "أستخدم رضا المشاركين لأنه أسرع وأسهل في التتبع.", scores: [1, 1, 1, 2, 2, 1] },
      { text: "أقيس عدد الاجتماعات المشتركة بعد التدخل فقط.", scores: [2, 2, 2, 2, 2, 2] },
      { text: "أؤجل القياس حتى يكتمل التغيير ثقافيًا.", scores: [2, 1, 1, 2, 2, 1] }
    ]
  },
  {
    id: "q19",
    difficulty: "خبير",
    category: "الاستنتاج من بيانات متعارضة",
    caseText:
      "الاستبيان يقول إن الثقة عالية، لكن المقابلات الفردية تكشف خوفًا من الحديث، ومعدل الأخطاء المخفية ارتفع. القيادة تتمسك بنتيجة الاستبيان.",
    prompt: "كيف تتعامل مع التعارض؟",
    options: [
      { text: "أعرض التناقض كبيانات تحتاج تفسيرًا، وأفحص أمان الاستبيان وطريقة طرح الأسئلة وسياق الخوف.", scores: [5, 5, 4, 5, 5, 5] },
      { text: "أعتمد الاستبيان لأنه يشمل عينة أكبر من المقابلات.", scores: [2, 2, 1, 2, 1, 2] },
      { text: "أعتمد المقابلات لأنها أصدق من الاستبيانات في القضايا الحساسة.", scores: [3, 3, 2, 3, 3, 2] },
      { text: "أعيد الاستبيان بسؤال مباشر عن الخوف من القيادة.", scores: [2, 3, 1, 2, 2, 2] }
    ]
  },
  {
    id: "q20",
    difficulty: "خبير",
    category: "تغيير الثقافة عبر التصميم",
    caseText:
      "المنظمة تريد ثقافة ابتكار. لكنها تعاقب الفشل، تقيس الموظفين على الالتزام بالخطة فقط، وتمنع التجارب الصغيرة دون موافقة عليا.",
    prompt: "ما المسار الأقوى؟",
    options: [
      { text: "تعديل قواعد التجريب، مؤشرات الأداء، آلية التعلم من الفشل، وصلاحيات التجارب الصغيرة.", scores: [5, 4, 5, 4, 5, 5] },
      { text: "إطلاق برنامج إبداع شامل يعزز عقلية الابتكار لدى الموظفين.", scores: [2, 2, 2, 2, 4, 2] },
      { text: "تغيير الرسائل الاتصالية وربطها بقيم المنظمة الجديدة.", scores: [2, 1, 1, 2, 4, 2] },
      { text: "اختيار سفراء ابتكار من كل إدارة لقيادة التغيير.", scores: [3, 3, 2, 3, 4, 3] }
    ]
  },
  {
    id: "q21",
    difficulty: "خبير",
    category: "تعاقد مع راعٍ قوي",
    caseText:
      "الراعي يطلب تشخيصًا لكنه يرفض أن يكون أسلوب القيادة العليا داخل النطاق. معظم المؤشرات تشير إلى أن القيادة جزء من النمط.",
    prompt: "ما القرار المهني الأقوى؟",
    options: [
      { text: "أعيد التعاقد بوضوح: يمكن البدء بنطاق محدود، لكن التقرير سيذكر حدود الاستنتاج إن استُبعدت القيادة.", scores: [4, 5, 3, 5, 4, 4] },
      { text: "أقبل استبعاد القيادة حتى لا يتوقف المشروع، وأركز على المستويات الأدنى.", scores: [2, 2, 1, 2, 2, 2] },
      { text: "أرفض مباشرة لأن التشخيص سيكون غير أخلاقي.", scores: [2, 2, 1, 4, 2, 1] },
      { text: "أجمع مؤشرات عن القيادة بشكل غير مباشر دون إبلاغ الراعي.", scores: [2, 2, 1, 1, 2, 2] }
    ]
  },
  {
    id: "q22",
    difficulty: "خبير",
    category: "تصميم التدخل قبل التنفيذ",
    caseText:
      "لديك ثلاث فرضيات قوية: خلل أدوار، ضعف ثقة، وتضارب مؤشرات. الميزانية تسمح بتدخل واحد فقط في الربع الحالي.",
    prompt: "كيف تختار؟",
    options: [
      { text: "أختار نقطة رافعة تفسر أكبر قدر من النمط، وأصمم تجربة صغيرة قابلة للقياس قبل التوسع.", scores: [5, 5, 5, 4, 5, 5] },
      { text: "أبدأ بالثقة لأنها أساس كل تغيير تنظيمي.", scores: [3, 2, 2, 3, 4, 2] },
      { text: "أبدأ بالأدوار لأنها أكثر وضوحًا وأسهل في التنفيذ.", scores: [3, 3, 4, 3, 2, 3] },
      { text: "أختار التدخل الذي يفضله الراعي حتى يضمن الدعم.", scores: [2, 1, 1, 2, 2, 1] }
    ]
  },
  {
    id: "q23",
    difficulty: "خبير",
    category: "التغذية الراجعة",
    caseText:
      "توجد تقارير أداء شهرية كثيرة، لكن لا يتغير السلوك ولا تتغير القرارات. الجميع يقول إن البيانات موجودة.",
    prompt: "ما السؤال التشخيصي الأهم؟",
    options: [
      { text: "هل توجد حلقة تغذية راجعة حقيقية تربط البيانات بقرار ومسؤولية وتعديل سلوك؟", scores: [5, 5, 4, 3, 4, 5] },
      { text: "هل التقارير مصممة بصريًا بشكل واضح وجذاب؟", scores: [2, 2, 1, 1, 1, 2] },
      { text: "هل يتم إرسال التقارير لكل أصحاب المصلحة؟", scores: [3, 3, 2, 2, 2, 3] },
      { text: "هل عدد المؤشرات كافٍ لتغطية الأداء؟", scores: [2, 2, 2, 2, 1, 3] }
    ]
  },
  {
    id: "q24",
    difficulty: "خبير",
    category: "التعلم التنظيمي",
    caseText:
      "بعد كل مشروع فاشل، تبحث المنظمة عن المسؤول الفردي. لا توجد جلسات تعلم، والناس يخفون الأخطاء مبكرًا.",
    prompt: "ما التدخل الأكثر نظامية؟",
    options: [
      { text: "تصميم روتين مراجعة بلا لوم، مع قواعد مساءلة عادلة وربط الدروس بتعديل العمليات.", scores: [5, 5, 4, 4, 5, 5] },
      { text: "تدريب الموظفين على الشفافية والإبلاغ المبكر عن المخاطر.", scores: [2, 2, 1, 2, 3, 2] },
      { text: "إطلاق قناة سرية للإبلاغ عن الأخطاء دون كشف الأسماء.", scores: [3, 3, 2, 3, 3, 3] },
      { text: "توجيه القادة إلى عدم استخدام اللوم في الاجتماعات.", scores: [3, 2, 2, 3, 4, 2] }
    ]
  },
  {
    id: "q25",
    difficulty: "تكاملي",
    category: "قراءة شبكة الأسباب",
    caseText:
      "تأخر الخدمة يرتبط بمدخلات ناقصة من العميل، موافقات داخلية كثيرة، ومؤشرات أداء تقيس كل إدارة منفردة. الراعي يسأل: أين السبب الجذري؟",
    prompt: "ما الإجابة الأكثر نضجًا؟",
    options: [
      { text: "السبب ليس نقطة واحدة؛ النمط ينتج من تفاعل المدخلات والعملية والصلاحيات والمؤشرات.", scores: [5, 5, 5, 4, 4, 5] },
      { text: "السبب الجذري هو ضعف مالك العملية لأنه لم ينسق بين الأطراف.", scores: [2, 2, 2, 2, 2, 2] },
      { text: "السبب الجذري هو كثرة الموافقات لأنها أوضح عائق في السلسلة.", scores: [3, 3, 4, 2, 2, 3] },
      { text: "السبب الجذري هو نقص بيانات العميل لأنه أول ما يدخل إلى العملية.", scores: [3, 3, 3, 2, 2, 3] }
    ]
  },
  {
    id: "q26",
    difficulty: "تكاملي",
    category: "اختبار صلاحية الفرضية",
    caseText:
      "فرضيتك أن ضعف التعاون ناتج عن مؤشرات متعارضة. لديك وقت محدود لجمع البيانات.",
    prompt: "ما الدليل الأسرع والأقوى نسبيًا؟",
    options: [
      { text: "مقارنة مؤشرات الإدارات بسلوكيات التسليم الفعلية ونقاط التعارض في حالات محددة.", scores: [5, 5, 5, 3, 3, 5] },
      { text: "استبيان عام عن مستوى التعاون بين الإدارات.", scores: [3, 3, 2, 2, 3, 2] },
      { text: "مقابلة المديرين عن أهمية التعاون في ثقافة المنظمة.", scores: [2, 3, 2, 2, 3, 2] },
      { text: "طلب تقرير HR عن شكاوى الموظفين بين الإدارات.", scores: [3, 3, 2, 2, 2, 3] }
    ]
  },
  {
    id: "q27",
    difficulty: "تكاملي",
    category: "إدارة التغيير",
    caseText:
      "تدخلت لتعديل الصلاحيات، لكن بعض المديرين الوسطى يبطئون التطبيق لأنهم يخشون فقدان السيطرة.",
    prompt: "ما التعامل الأفضل؟",
    options: [
      { text: "أفهم خسارتهم المتصورة، وأربط الدور الجديد بمساءلة واضحة ودعم انتقالي ومؤشرات تبنٍ.", scores: [5, 4, 4, 4, 5, 5] },
      { text: "أطلب من الإدارة العليا إلزامهم بالتطبيق السريع.", scores: [2, 1, 2, 1, 2, 3] },
      { text: "أعقد ورشة توعية بأهمية التفويض لهم.", scores: [3, 2, 2, 2, 3, 2] },
      { text: "أستبدلهم كسفراء تغيير بموظفين أكثر حماسًا.", scores: [2, 1, 1, 1, 2, 1] }
    ]
  },
  {
    id: "q28",
    difficulty: "تكاملي",
    category: "التقييم البعدي",
    caseText:
      "بعد ستة أسابيع من تدخل تحسين القرار، تحسن زمن القرار 20٪، لكن ارتفعت أخطاء التنفيذ 12٪.",
    prompt: "ما قراءة الأثر الأنضج؟",
    options: [
      { text: "التدخل حسّن السرعة لكنه ربما أضعف جودة الضبط؛ نحتاج موازنة مؤشرات السرعة والجودة والتعلم.", scores: [5, 5, 4, 3, 4, 5] },
      { text: "التدخل ناجح لأن الهدف الأساسي كان تقليل زمن القرار.", scores: [2, 2, 1, 2, 2, 2] },
      { text: "التدخل فشل لأن الأخطاء ارتفعت ويجب الرجوع للنظام القديم.", scores: [2, 2, 1, 2, 1, 2] },
      { text: "الأخطاء مؤقتة وستنخفض مع الوقت دون تعديل.", scores: [2, 1, 1, 2, 2, 1] }
    ]
  },
  {
    id: "q29",
    difficulty: "تكاملي",
    category: "نضج الممارس",
    caseText:
      "أنت تميل عادة لتفسير المشكلات كقضايا هيكل وصلاحيات. في مشروع جديد، كل المؤشرات الأولية تشير إلى صراع ثقة عميق.",
    prompt: "ما السلوك المهني؟",
    options: [
      { text: "أراجع تحيزي، وأبقي فرضية الهيكل ضمن بدائل لا تسبق البيانات ولا تلغي قراءة الثقة.", scores: [5, 5, 4, 5, 5, 4] },
      { text: "أتمسك بخبرتي لأن مشكلات الثقة غالبًا تخفي خلل تصميم.", scores: [2, 2, 3, 2, 2, 2] },
      { text: "أحوّل التشخيص مباشرة إلى الثقافة لأنها الأقرب للثقة.", scores: [2, 2, 1, 2, 3, 2] },
      { text: "أطلب من طرف آخر قيادة التشخيص حتى لا أتأثر بتحيزي.", scores: [3, 3, 2, 3, 3, 2] }
    ]
  },
  {
    id: "q30",
    difficulty: "تكاملي",
    category: "تصميم مسار OD كامل",
    caseText:
      "منظمة لديها بطء قرار، استقالات، ضعف تعاون، وتغيير تقني متعثر. الراعي يريد خطة تدخل شاملة خلال أسبوع.",
    prompt: "أي مسار هو الأكثر احترافًا؟",
    options: [
      { text: "تعاقد تشخيصي قصير، جمع بيانات متعدد، تحديد نقاط الرفع، تجربة تدخل، ثم قياس وتوسيع تدريجي.", scores: [5, 5, 5, 5, 5, 5] },
      { text: "إطلاق برنامج قيادة وتواصل وتغيير ثقافي يغطي الأعراض الأربعة دفعة واحدة.", scores: [2, 2, 2, 2, 3, 2] },
      { text: "البدء بإعادة هيكلة لأنها تؤثر في القرار والتعاون والاستقالات معًا.", scores: [3, 2, 4, 2, 2, 2] },
      { text: "تشكيل لجنة داخلية ترفع التوصيات خلال شهر دون تدخل خارجي عميق.", scores: [3, 3, 2, 3, 3, 3] }
    ]
  }
];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min = 0, max = 5) {
  return Math.min(max, Math.max(min, value));
}

function arabicPercent(value) {
  const number = Number.isFinite(value) ? value : 0;
  return `${Math.round(number)}٪`;
}

function makeStorageKey(base, userId) {
  return userId ? `${base}_${userId}` : base;
}

function readJsonStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // لا نوقف الصفحة إذا امتلأ التخزين المحلي أو منع المتصفح التخزين.
  }
}

function hashText(text) {
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return Math.abs(hash >>> 0);
}

function seededShuffle(items, seedText) {
  const result = [...items];
  let seed = hashText(seedText || "odacademy");

  for (let index = result.length - 1; index > 0; index -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const randomIndex = Math.floor((seed / 233280) * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}


const OPTION_BALANCE_SUFFIXES = [
  "مع توثيق ما يحتاج إلى تحقق لاحقًا.",
  "دون اعتباره تفسيرًا نهائيًا للمشكلة.",
  "مع مراجعة أثره قبل تحويله إلى تدخل.",
  "ضمن قراءة أولية قابلة للمراجعة.",
  "مع الانتباه لحدود البيانات المتاحة.",
  "مع ربطه بسياق العمل قبل اعتماده.",
  "مع اختبار أثره على أكثر من طرف.",
  "وفق نطاق واضح ومسؤوليات محددة."
];

const OPTION_BALANCE_QUESTION_SUFFIXES = [
  "ضمن قراءة أولية لا تفترض السبب مسبقًا.",
  "مع ربط الإجابة بسياق العمل لا بالرأي العام.",
  "قبل تحويل الملاحظة إلى تدخل أو توصية.",
  "مع تحديد نوع البيانات اللازمة للتحقق.",
  "دون إغلاق احتمالات تفسيرية أخرى."
];

function balanceOptionText(text, seedText) {
  const original = String(text || "").replace(/\s+/g, " ").trim();

  if (!original) return original;

  const startsLikeQuestion = /^(هل|ما|كم|لماذا|كيف|أي)\b/.test(original);
  const suffixPool = startsLikeQuestion ? OPTION_BALANCE_QUESTION_SUFFIXES : OPTION_BALANCE_SUFFIXES;

  // الهدف هنا ليس تغيير معنى البديل، بل منع ظهور دليل شكلي مثل أن تكون الإجابة الأفضل هي الأطول دائمًا.
  // يوصي دليل NBME بمراجعة طول وتفصيل البدائل حتى لا تبرز الإجابة الصحيحة شكليًا.
  const targetLength = 92 + (hashText(seedText) % 22);
  let balanced = original;
  let suffixIndex = hashText(`${seedText}-suffix`) % suffixPool.length;

  while (balanced.length < targetLength && suffixIndex < suffixPool.length + 3) {
    const suffix = suffixPool[suffixIndex % suffixPool.length];

    if (!balanced.includes(suffix)) {
      balanced = `${balanced} ${suffix}`.trim();
    }

    suffixIndex += 1;
  }

  return balanced;
}

function createAssessmentRun(seed = String(Date.now())) {
  return preAssessmentQuestions.map((question, index) => ({
    ...question,
    displayNumber: index + 1,
    options: seededShuffle(
      question.options.map((option, optionIndex) => ({
        ...option,
        // نعرض نسخة متوازنة الطول من البديل حتى لا تكون الإجابة الأفضل مفضوحة من شكلها.
        text: balanceOptionText(option.text, `${seed}-${question.id}-${optionIndex}`),
        optionId: `${question.id}-option-${optionIndex + 1}`
      })),
      `${seed}-${question.id}`
    )
  }));
}

function normalizeAverageScores(totalScores, divisor) {
  const safeDivisor = Math.max(1, divisor);

  return totalScores.map((score) => {
    return clamp(Math.round((score / safeDivisor) * 10) / 10, 0, 5);
  });
}

function calculatePreAssessmentResult(answers) {
  const totals = new Array(competencyLabels.length).fill(0);

  answers.forEach((answer) => {
    safeArray(answer?.scores).forEach((score, index) => {
      totals[index] += safeNumber(score, 0);
    });
  });

  const values = normalizeAverageScores(totals, preAssessmentQuestions.length);
  const overall = values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    values,
    overall: Math.round(overall * 10) / 10,
    completedAt: new Date().toISOString()
  };
}

function levelFromScore(score) {
  if (score >= 4.4) return "متقدم جدًا";
  if (score >= 3.6) return "متقدم";
  if (score >= 2.8) return "متوسط";
  if (score >= 2) return "نامٍ";
  return "تأسيسي";
}

function recommendationFor(index, score) {
  const recommendations = [
    "ركّز على تحويل كل مشكلة إلى خريطة نظام: بيئة، مدخلات، عمليات، مخرجات، تغذية راجعة، ومواءمة.",
    "درّب نفسك على بناء ثلاث فرضيات على الأقل قبل قبول أي تفسير، وحدد لكل فرضية نوع البيانات المطلوب.",
    "راجع علاقة الاستراتيجية بالهيكل والصلاحيات ومؤشرات الأداء؛ السلوك غالبًا نتيجة تصميم متكرر.",
    "شدّد على التعاقد والسرية وتعدد الأطراف؛ لا تجعل الراعي وحده مصدر الحقيقة.",
    "اربط أي تدخل بخطة تبنٍ وتواصل ومقاومة وتعلم، وليس بنشاط تدريبي فقط.",
    "لا تعتمد على رضا المشاركين وحده؛ صمم مؤشرات أثر تشغيلية وسلوكية واستدامة بعد التدخل."
  ];

  if (score >= 4) {
    return "نقطة قوة واضحة. حافظ عليها عبر تطبيقها في حالات أكثر تعقيدًا وتوثيق طريقة تفكيرك.";
  }

  return recommendations[index] || "حوّل هذه الجدارة إلى ممارسة أسبوعية قابلة للقياس.";
}

function normalizeCourse(raw = []) {
  if (!Array.isArray(raw)) return [];

  return raw.map((month, monthArrayIndex) => {
    const monthIndex = safeNumber(
      month.monthIndex ?? month.month_index ?? month.monthNumber ?? month.number,
      monthArrayIndex + 1
    );

    const weeks = safeArray(month.weeks).map((week, weekArrayIndex) => {
      const weekIndex = safeNumber(
        week.weekIndex ?? week.week_index ?? week.weekNumber ?? week.number,
        weekArrayIndex + 1
      );

      const days = safeArray(week.days).map((day, dayArrayIndex) => ({
        ...day,
        monthIndex,
        weekIndex,
        dayIndex: safeNumber(
          day.dayIndex ?? day.day_index ?? day.dayNumber ?? day.number,
          dayArrayIndex + 1
        )
      }));

      return {
        ...week,
        monthIndex,
        weekIndex,
        days
      };
    });

    return {
      ...month,
      monthIndex,
      weeks
    };
  });
}

function makeProgressKey(rowOrDay) {
  return `${safeNumber(rowOrDay.month_index ?? rowOrDay.monthIndex)}-${safeNumber(
    rowOrDay.week_index ?? rowOrDay.weekIndex
  )}-${safeNumber(rowOrDay.day_index ?? rowOrDay.dayIndex)}`;
}

function normalizeProgressRows(rows) {
  return safeArray(rows).map((row) => ({
    month_index: safeNumber(row.month_index ?? row.monthIndex),
    week_index: safeNumber(row.week_index ?? row.weekIndex),
    day_index: safeNumber(row.day_index ?? row.dayIndex),
    status: row.status || "opened"
  }));
}

function flattenCourseDays(course) {
  return course.flatMap((month) => {
    return safeArray(month.weeks).flatMap((week) => safeArray(week.days));
  });
}

function dimensionForDay(day) {
  const month = safeNumber(day.monthIndex, 1);
  const week = safeNumber(day.weekIndex, 1);

  if (month === 1 && week === 1) return 0;
  if (month === 1 && week >= 2) return 1;
  if (month === 2) return 2;
  if (month === 3) return 3;
  if (month === 4) return 4;
  if (month === 5) return 5;
  if (month === 6) return week <= 2 ? 4 : 5;

  return Math.min(5, Math.max(0, month - 1));
}

function calculateLearningRadar(course, progressRows) {
  const days = flattenCourseDays(course);
  const progressMap = new Map();

  normalizeProgressRows(progressRows).forEach((row) => {
    progressMap.set(makeProgressKey(row), row.status);
  });

  const totals = new Array(competencyLabels.length).fill(0);
  const points = new Array(competencyLabels.length).fill(0);
  let completedDays = 0;
  let openedDays = 0;

  days.forEach((day) => {
    const dimension = dimensionForDay(day);
    const status = progressMap.get(makeProgressKey(day));

    totals[dimension] += 1;

    if (status === "completed") {
      points[dimension] += 1;
      completedDays += 1;
    } else if (status === "opened") {
      points[dimension] += 0.25;
      openedDays += 1;
    }
  });

  const values = points.map((point, index) => {
    if (!totals[index]) return 0;
    return clamp(Math.round((point / totals[index]) * 5 * 10) / 10, 0, 5);
  });

  // الرقم المعتمد للبرنامج كاملًا: 180 يومًا.
  // لا نعتمد هنا على عدد الأيام الموجودة في مصفوفة المحتوى لأن بعض الأسابيع ممثلة كـ 7 أيام داخل ملف البيانات.
  const totalDays = 180;
  const progressPercentage = totalDays ? (completedDays / totalDays) * 100 : 0;

  return {
    values,
    totals,
    points,
    totalDays,
    completedDays,
    openedDays,
    progressPercentage
  };
}

function RadarSvg({ values, secondaryValues = null, title = "مخطط راداري" }) {
  const size = 360;
  const center = size / 2;
  const max = 5;
  const radius = 122;

  function point(index, value = max) {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / competencyLabels.length;
    const r = (value / max) * radius;
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
  }

  const primaryPolygon = values.map((value, index) => point(index, value).join(",")).join(" ");

  const secondaryPolygon = secondaryValues
    ? secondaryValues.map((value, index) => point(index, value).join(",")).join(" ")
    : "";

  const grid = [1, 2, 3, 4, 5].map((level) => {
    return competencyLabels.map((_, index) => point(index, level).join(",")).join(" ");
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar-svg" role="img" aria-label={title}>
      {grid.map((points, index) => (
        <polygon key={index} points={points} className="radar-grid" />
      ))}

      {competencyLabels.map((label, index) => {
        const [x, y] = point(index, 5.75);

        return (
          <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="radar-label">
            {label}
          </text>
        );
      })}

      {secondaryValues && <polygon points={secondaryPolygon} className="radar-area-secondary" />}
      <polygon points={primaryPolygon} className="radar-area" />

      {values.map((value, index) => {
        const [x, y] = point(index, value);
        return <circle key={index} cx={x} cy={y} r="5" className="radar-dot" />;
      })}
    </svg>
  );
}

function ScoreBars({ values, title, notes = [] }) {
  return (
    <div className="radar-score-bars">
      <h3>{title}</h3>

      {competencyLabels.map((label, index) => {
        const value = safeNumber(values[index], 0);
        const width = (value / 5) * 100;

        return (
          <div className="radar-score-row" key={label}>
            <div className="radar-score-head">
              <span>{label}</span>
              <strong>{value}/5</strong>
            </div>
            <div className="radar-score-track">
              <i style={{ width: `${width}%` }} />
            </div>
            <small>{notes[index] || competencyDescriptions[index]}</small>
          </div>
        );
      })}
    </div>
  );
}

function averageScore(values = []) {
  const safeValues = safeArray(values).map((value) => clamp(safeNumber(value, 0), 0, 5));
  if (!safeValues.length) return 0;

  const average = safeValues.reduce((sum, value) => sum + value, 0) / safeValues.length;
  return Math.round(average * 10) / 10;
}

function formatArabicDate(value) {
  if (!value) return "غير محدد";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return "غير محدد";
  }
}

function SaveNotice({ state }) {
  if (!state?.message) return null;

  return (
    <div className={`radar-save-notice ${state.type === "error" ? "error" : "success"}`} role="status">
      {state.message}
    </div>
  );
}

function RadarHistoryPanel({ items = [], loading = false, title = "سجل تقييماتي السابقة" }) {
  return (
    <div className="radar-history-panel">
      <div className="radar-history-head">
        <h3>{title}</h3>
        {loading ? <span>جارٍ التحميل...</span> : <span>{items.length} نتيجة</span>}
      </div>

      {!loading && !items.length ? (
        <p className="radar-history-empty">
          لا توجد نتائج محفوظة بعد. اضغط زر حفظ النتيجة ليظهر السجل هنا.
        </p>
      ) : null}

      <div className="radar-history-list">
        {items.map((item) => {
          const score = safeNumber(item.overall_score ?? item.overallScore, 0);
          const typeLabel = item.assessment_type === "learning_radar" ? "رادار الرحلة" : "اختبار قبلي";

          return (
            <article className="radar-history-item" key={item.id}>
              <div>
                <strong>{item.assessment_title || typeLabel}</strong>
                <span>{formatArabicDate(item.created_at || item.createdAt)}</span>
              </div>
              <b>{score}/5</b>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PreAssessmentPanel({ setActivePage }) {
  const [runSeed, setRunSeed] = useState(() => {
    const draft = readJsonStorage(ASSESSMENT_DRAFT_KEY, null);
    return draft?.runSeed || String(Date.now());
  });

  const questions = useMemo(() => createAssessmentRun(runSeed), [runSeed]);

  const [started, setStarted] = useState(() => {
    const draft = readJsonStorage(ASSESSMENT_DRAFT_KEY, null);
    return Boolean(draft?.started);
  });

  const [index, setIndex] = useState(() => {
    const draft = readJsonStorage(ASSESSMENT_DRAFT_KEY, null);
    return safeNumber(draft?.index, 0);
  });

  const [answers, setAnswers] = useState(() => {
    const draft = readJsonStorage(ASSESSMENT_DRAFT_KEY, null);
    return safeArray(draft?.answers);
  });

  const [savedResult, setSavedResult] = useState(() => readJsonStorage(ASSESSMENT_STORAGE_KEY, null));
  const [saveState, setSaveState] = useState({ type: "idle", message: "", loading: false });
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const done = started && index >= questions.length;

  const current = questions[index];

  const result = useMemo(() => {
    if (!done) return savedResult;
    return calculatePreAssessmentResult(answers);
  }, [answers, done, savedResult]);

  async function refreshHistory() {
    setHistoryLoading(true);

    try {
      const rows = await loadRadarAssessmentHistory({
        assessmentType: "pre_assessment",
        limit: 6
      });

      setHistory(rows);
    } catch (historyError) {
      // لا نوقف الرادار إذا تعذر تحميل السجل، لأن حفظ النتيجة المحلي ما زال يعمل.
      console.warn("Unable to load radar pre-assessment history:", historyError);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    writeJsonStorage(ASSESSMENT_DRAFT_KEY, {
      started,
      index,
      answers,
      runSeed
    });
  }, [started, index, answers, runSeed]);

  useEffect(() => {
    if (!done) return;

    const nextResult = calculatePreAssessmentResult(answers);
    writeJsonStorage(ASSESSMENT_STORAGE_KEY, nextResult);
    setSavedResult(nextResult);
  }, [answers, done]);

  async function savePreAssessmentResult(targetResult) {
    if (!targetResult?.values?.length) {
      setSaveState({
        type: "error",
        message: "لا توجد نتيجة جاهزة للحفظ بعد.",
        loading: false
      });
      return;
    }

    setSaveState({
      type: "idle",
      message: "",
      loading: true
    });

    try {
      await saveRadarAssessmentResult({
        assessmentType: "pre_assessment",
        assessmentTitle: "الاختبار القبلي لرادار الجدارات",
        scores: targetResult.values,
        overallScore: targetResult.overall,
        notes: targetResult.values.map((value, valueIndex) => recommendationFor(valueIndex, value)),
        metadata: {
          source: "RadarAssessment",
          version: "v3",
          completedAt: targetResult.completedAt,
          answeredQuestions: answers.length || preAssessmentQuestions.length,
          runSeed
        }
      });

      setSaveState({
        type: "success",
        message: "تم حفظ نتيجة الاختبار القبلي في حسابك.",
        loading: false
      });

      refreshHistory();
    } catch (saveError) {
      setSaveState({
        type: "error",
        message: saveError?.message || "تعذر حفظ النتيجة الآن.",
        loading: false
      });
    }
  }

  function startNew() {
    const seed = String(Date.now());
    setRunSeed(seed);
    setStarted(true);
    setIndex(0);
    setAnswers([]);
    setSaveState({ type: "idle", message: "", loading: false });
    writeJsonStorage(ASSESSMENT_DRAFT_KEY, {
      started: true,
      index: 0,
      answers: [],
      runSeed: seed
    });
  }

  function continueDraft() {
    setStarted(true);
  }

  function resetAssessment() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ASSESSMENT_DRAFT_KEY);
      window.localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
    }

    const seed = String(Date.now());
    setRunSeed(seed);
    setStarted(false);
    setIndex(0);
    setAnswers([]);
    setSavedResult(null);
    setSaveState({ type: "idle", message: "", loading: false });
  }

  function selectOption(option) {
    const answer = {
      questionId: current.id,
      optionId: option.optionId,
      scores: option.scores,
      difficulty: current.difficulty,
      category: current.category,
      answeredAt: new Date().toISOString()
    };

    setAnswers((existing) => [...existing, answer]);
    setIndex((currentIndex) => currentIndex + 1);
  }

  if (!started && savedResult) {
    const notes = savedResult.values.map((value, valueIndex) => recommendationFor(valueIndex, value));

    return (
      <div className="radar-two-columns">
        <div className="radar-card radar-card-dark">
          <span className="radar-kicker">نتيجتك القبلية محفوظة</span>
          <h3>بصمتك الاستشارية الحالية</h3>
          <p>
            المتوسط العام: <strong>{savedResult.overall}/5</strong> · المستوى: <strong>{levelFromScore(savedResult.overall)}</strong>
          </p>
          <div className="radar-actions">
            <button type="button" className="primary-button" onClick={continueDraft}>عرض النتيجة</button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => savePreAssessmentResult(savedResult)}
              disabled={saveState.loading}
            >
              {saveState.loading ? "جارٍ الحفظ..." : "حفظ النتيجة في حسابي"}
            </button>
            <button type="button" className="secondary-button" onClick={startNew}>إعادة الاختبار من جديد</button>
            <button type="button" className="secondary-button danger" onClick={resetAssessment}>مسح النتيجة</button>
          </div>
          <SaveNotice state={saveState} />
        </div>

        <div className="radar-card">
          <RadarSvg values={savedResult.values} title="نتيجة الاختبار القبلي" />
          <ScoreBars values={savedResult.values} title="تفصيل النتيجة" notes={notes} />
          <RadarHistoryPanel items={history} loading={historyLoading} />
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="radar-intro-grid">
        <div className="radar-card radar-card-dark">
          <span className="radar-kicker">اختبار قبلي</span>
          <h3>قياس عميق قبل بداية أو متابعة الرحلة</h3>
          <p>
            هذا الاختبار يتكون من 30 سؤالًا وحالة، ويتدرج من مواقف تأسيسية إلى حالات تكاملية.
            الإجابات ليست صح أو خطأ بشكل مكشوف؛ كل خيار يقيس طريقة تفكيرك عبر ست جدارات.
          </p>
          <div className="radar-metrics">
            <span><b>30</b> سؤالًا وحالة</span>
            <span><b>6</b> جدارات</span>
            <span><b>5</b> مستويات صعوبة</span>
          </div>
          <button type="button" className="primary-button" onClick={startNew}>ابدأ الاختبار القبلي الآن</button>
        </div>

        <div className="radar-card">
          <h3>ما الذي سيقيسه؟</h3>
          <div className="radar-chip-list">
            {competencyLabels.map((label, labelIndex) => (
              <div className="radar-chip" key={label}>
                <strong>{label}</strong>
                <span>{competencyDescriptions[labelIndex]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (done && result) {
    const notes = result.values.map((value, valueIndex) => recommendationFor(valueIndex, value));

    return (
      <div className="radar-two-columns">
        <div className="radar-card radar-card-dark">
          <span className="radar-kicker">اكتمل الاختبار القبلي</span>
          <h3>تحليل البصمة الاستشارية</h3>
          <p>
            نتيجتك لا تعني حكمًا نهائيًا عليك؛ هي خط أساس ذكي يساعدك تعرف أين تبدأ، وأين تحتاج ممارسة أعمق خلال الرحلة.
          </p>
          <div
            className="radar-summary-box od-circular-indicator od-indicator-score"
            style={{ "--od-indicator-progress": `${clamp(result.overall, 0, 5) * 20}%` }}
          >
            <span>المتوسط العام</span>
            <strong>{result.overall}/5</strong>
            <small>{levelFromScore(result.overall)}</small>
          </div>
          <div className="radar-actions">
            <button type="button" className="primary-button" onClick={() => setActivePage?.("journey")}>اذهب للرحلة التعليمية</button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => savePreAssessmentResult(result)}
              disabled={saveState.loading}
            >
              {saveState.loading ? "جارٍ الحفظ..." : "حفظ النتيجة في حسابي"}
            </button>
            <button type="button" className="secondary-button" onClick={startNew}>إعادة الاختبار</button>
            <button type="button" className="secondary-button danger" onClick={resetAssessment}>مسح النتيجة</button>
          </div>
          <SaveNotice state={saveState} />
        </div>

        <div className="radar-card">
          <RadarSvg values={result.values} title="نتيجة الاختبار القبلي" />
          <ScoreBars values={result.values} title="تفصيل النتيجة" notes={notes} />
          <RadarHistoryPanel items={history} loading={historyLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="radar-question-layout">
      <div className="radar-card radar-question-card">
        <div className="radar-question-meta">
          <span>{current.difficulty}</span>
          <strong>{current.category}</strong>
          <small>سؤال {index + 1} من {questions.length}</small>
        </div>

        <h3>{current.caseText}</h3>
        <p>{current.prompt}</p>

        <div className="radar-progress-line">
          <i style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="radar-card">
        <div className="radar-options-list">
          {current.options.map((option, optionIndex) => (
            <button type="button" key={option.optionId} onClick={() => selectOption(option)}>
              <span>{["أ", "ب", "ج", "د"][optionIndex]}</span>
              <strong>{option.text}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LearningRadarPanel({ progressRows: progressRowsProp }) {
  const course = useMemo(() => normalizeCourse(rawCourseMap), []);
  const [progressRows, setProgressRows] = useState(() => normalizeProgressRows(progressRowsProp));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState({ type: "idle", message: "", loading: false });
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const preResult = readJsonStorage(ASSESSMENT_STORAGE_KEY, null);

  useEffect(() => {
    if (Array.isArray(progressRowsProp) && progressRowsProp.length) {
      setProgressRows(normalizeProgressRows(progressRowsProp));
    }
  }, [progressRowsProp]);

  async function refreshHistory() {
    setHistoryLoading(true);

    try {
      const rows = await loadRadarAssessmentHistory({
        assessmentType: "learning_radar",
        limit: 6
      });

      setHistory(rows);
    } catch (historyError) {
      console.warn("Unable to load learning radar history:", historyError);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function refreshProgress() {
    setLoading(true);
    setError("");

    try {
      const rows = await loadUserProgress();
      setProgressRows(normalizeProgressRows(rows));
    } catch (loadError) {
      setError(loadError?.message || "تعذر تحديث رادار الرحلة التعليمية الآن.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshProgress();
    refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const learningRadar = useMemo(() => {
    return calculateLearningRadar(course, progressRows);
  }, [course, progressRows]);

  const learningOverall = useMemo(() => averageScore(learningRadar.values), [learningRadar.values]);

  const learningNotes = learningRadar.values.map((value, index) => {
    const total = learningRadar.totals[index] || 0;
    const point = learningRadar.points[index] || 0;
    const completedEquivalent = Math.round(point * 10) / 10;

    if (!total) return "لا توجد أيام كافية مرتبطة بهذه الجدارة في خريطة المحتوى الحالية.";

    return `تقدم الرحلة المرتبط بهذه الجدارة: ${completedEquivalent} من ${total} يوم/نقطة تعلم.`;
  });

  async function saveLearningRadar() {
    setSaveState({
      type: "idle",
      message: "",
      loading: true
    });

    try {
      await saveRadarAssessmentResult({
        assessmentType: "learning_radar",
        assessmentTitle: "رادار الرحلة التعليمية",
        scores: learningRadar.values,
        overallScore: learningOverall,
        notes: learningNotes,
        metadata: {
          source: "RadarAssessment",
          version: "v1",
          completedDays: learningRadar.completedDays,
          openedDays: learningRadar.openedDays,
          totalDays: learningRadar.totalDays,
          progressPercentage: Math.round(learningRadar.progressPercentage * 10) / 10,
          totals: learningRadar.totals,
          points: learningRadar.points
        }
      });

      setSaveState({
        type: "success",
        message: "تم حفظ رادار الرحلة التعليمية في حسابك.",
        loading: false
      });

      refreshHistory();
    } catch (saveError) {
      setSaveState({
        type: "error",
        message: saveError?.message || "تعذر حفظ رادار الرحلة الآن.",
        loading: false
      });
    }
  }

  return (
    <div className="radar-two-columns">
      <div className="radar-card radar-card-dark">
        <span className="radar-kicker">رادار مرتبط بالرحلة</span>
        <h3>رادار الأداء التعليمي الفعلي</h3>
        <p>
          هذا الرادار لا يعتمد على رأيك في نفسك، بل على تقدمك داخل الرحلة: الأيام المفتوحة تعطي أثرًا بسيطًا، والأيام المكتملة ترفع الجدارة المرتبطة بها.
        </p>

        <div
          className="radar-summary-box od-circular-indicator od-indicator-general"
          style={{ "--od-indicator-progress": `${clamp(learningRadar.progressPercentage, 0, 100)}%` }}
        >
          <span>إنجاز الرحلة</span>
          <strong>{arabicPercent(learningRadar.progressPercentage)}</strong>
          <small>{learningRadar.completedDays} من {learningRadar.totalDays} يومًا مكتملًا · متوسط الرادار {learningOverall}/5</small>
        </div>

        <div className="radar-actions">
          <button type="button" className="primary-button" onClick={refreshProgress} disabled={loading}>
            {loading ? "جارٍ التحديث..." : "تحديث الرادار من الرحلة"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={saveLearningRadar}
            disabled={saveState.loading}
          >
            {saveState.loading ? "جارٍ الحفظ..." : "حفظ الرادار في حسابي"}
          </button>
        </div>

        <SaveNotice state={saveState} />

        {error && <div className="radar-warning">{error}</div>}

        <div className="radar-legend-box">
          <span><i className="legend-primary" /> تقدم الرحلة التعليمية</span>
          {preResult?.values && <span><i className="legend-secondary" /> نتيجة الاختبار القبلي للمقارنة</span>}
        </div>
      </div>

      <div className="radar-card">
        <RadarSvg
          values={learningRadar.values}
          secondaryValues={preResult?.values || null}
          title="رادار الأداء المرتبط بالرحلة التعليمية"
        />
        <ScoreBars values={learningRadar.values} title="تفصيل رادار الرحلة" notes={learningNotes} />
        <RadarHistoryPanel items={history} loading={historyLoading} />
      </div>
    </div>
  );
}

export default function RadarAssessment({ setActivePage, progressRows = [] }) {
  const [activeSection, setActiveSection] = useState("pre");

  return (
    <section className="page-shell radar-assessment-page" dir="rtl">
      <style>{`
        .radar-assessment-page {
          --ink:#18102e;
          --muted:#7a6c9a;
          --line:rgba(167, 139, 250,.24);
          --primary:#8b5cf6;
          --violet:#7c3aed;
          --gold:#a855f7;
          --green:#10b981;
          --red:#ef4444;
        }

        .radar-assessment-page .section-hero {
          position:relative;
          overflow:hidden;
        }

        .radar-tabs {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:12px;
          margin:18px 0;
        }

        .radar-tab {
          border:1px solid rgba(167, 139, 250,.22);
          background:rgba(255,255,255,.9);
          color:var(--ink);
          border-radius:24px;
          padding:16px;
          cursor:pointer;
          text-align:right;
          font-family:inherit;
          box-shadow:0 14px 34px rgba(28, 17, 48,.06);
          transition:.22s ease;
        }

        .radar-tab:hover,
        .radar-tab.active {
          transform:translateY(-3px);
          border-color:rgba(139, 92, 246,.35);
          box-shadow:0 20px 44px rgba(139, 92, 246,.11);
        }

        .radar-tab.active {
          background:linear-gradient(135deg,#a855f7,#7c3aed);
          color:#ffffff;
        }

        .radar-tab.active :is(strong, span) {
          color:#ffffff;
        }

        .radar-tab strong {
          display:block;
          font-size:16px;
          font-weight:950;
          margin-bottom:6px;
        }

        .radar-tab span {
          display:block;
          color:var(--muted);
          font-size:12px;
          line-height:1.8;
          font-weight:750;
        }

        .radar-intro-grid,
        .radar-two-columns,
        .radar-question-layout {
          display:grid;
          grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);
          gap:18px;
          align-items:start;
        }

        .radar-card {
          border-radius:30px;
          padding:24px;
          background:rgba(255,255,255,.92);
          border:1px solid rgba(167, 139, 250,.20);
          box-shadow:0 22px 58px rgba(28, 17, 48,.08);
        }

        .radar-card-dark {
          color:white;
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.22), transparent 34%),
            linear-gradient(145deg,#18102e,#281748 58%,#111827);
          border-color:rgba(255,255,255,.14);
        }

        .radar-kicker {
          display:inline-flex;
          width:fit-content;
          border-radius:999px;
          padding:8px 13px;
          margin-bottom:14px;
          background:rgba(139, 92, 246,.12);
          color:#6d28d9;
          font-size:11px;
          font-weight:950;
        }

        .radar-card-dark .radar-kicker {
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.16);
          color:#fde68a;
        }

        .radar-card h3 {
          margin:0 0 12px;
          color:var(--ink);
          font-size:24px;
          line-height:1.45;
          font-weight:950;
        }

        .radar-card-dark h3 {
          color:white;
        }

        .radar-card p {
          margin:0 0 16px;
          color:var(--muted);
          font-size:14px;
          line-height:2;
          font-weight:750;
        }

        .radar-card-dark p {
          color:rgba(196, 181, 253,.86);
        }

        .radar-metrics {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:10px;
          margin:18px 0;
        }

        .radar-metrics span,
        .radar-summary-box,
        .radar-legend-box,
        .radar-warning {
          border-radius:20px;
          padding:14px;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.14);
          color:rgba(255,255,255,.9);
          font-size:12px;
          font-weight:850;
          line-height:1.7;
        }

        .radar-metrics b {
          display:block;
          font-size:24px;
          color:#fde68a;
          margin-bottom:4px;
        }

        .radar-chip-list {
          display:grid;
          gap:10px;
        }

        .radar-chip {
          border-radius:20px;
          padding:14px;
          background:#f4f0fb;
          border:1px solid rgba(167, 139, 250,.18);
        }

        .radar-chip strong {
          display:block;
          color:#18102e;
          font-size:13px;
          font-weight:950;
          margin-bottom:5px;
        }

        .radar-chip span {
          display:block;
          color:#7a6c9a;
          font-size:12px;
          line-height:1.8;
          font-weight:750;
        }

        .radar-question-meta {
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          align-items:center;
          margin-bottom:16px;
        }

        .radar-question-meta span,
        .radar-question-meta strong,
        .radar-question-meta small {
          border-radius:999px;
          padding:8px 12px;
          background:#efe9fb;
          color:#6d28d9;
          font-size:11px;
          font-weight:950;
        }

        .radar-question-meta strong {
          background:#fffbeb;
          color:#92400e;
        }

        .radar-question-meta small {
          background:#ecfdf5;
          color:#047857;
        }

        .radar-question-card h3 {
          font-size:22px;
          line-height:1.8;
        }

        .radar-progress-line {
          height:10px;
          border-radius:999px;
          background:rgba(167, 139, 250,.20);
          overflow:hidden;
          margin-top:16px;
        }

        .radar-progress-line i {
          display:block;
          height:100%;
          border-radius:inherit;
          background:linear-gradient(90deg,#8b5cf6,#7c3aed,#a855f7);
        }

        .radar-options-list {
          display:grid;
          gap:12px;
        }

        .radar-options-list button {
          width:100%;
          display:flex;
          gap:12px;
          align-items:flex-start;
          text-align:right;
          border:1px solid rgba(167, 139, 250,.22);
          background:#ffffff;
          color:#18102e;
          border-radius:20px;
          padding:15px;
          font-family:inherit;
          cursor:pointer;
          transition:.22s ease;
        }

        .radar-options-list button:hover {
          transform:translateY(-2px);
          border-color:rgba(139, 92, 246,.42);
          box-shadow:0 16px 35px rgba(139, 92, 246,.10);
        }

        .radar-options-list span {
          flex:0 0 auto;
          width:34px;
          height:34px;
          display:grid;
          place-items:center;
          border-radius:14px;
          background:#efe9fb;
          color:#6d28d9;
          font-weight:950;
        }

        .radar-options-list strong {
          font-size:13px;
          line-height:1.9;
          font-weight:850;
        }

        .radar-actions {
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          margin-top:16px;
        }

        .radar-actions .primary-button,
        .radar-actions .secondary-button,
        .radar-card .primary-button,
        .radar-card .secondary-button {
          border:0;
          border-radius:18px;
          padding:13px 16px;
          cursor:pointer;
          font-family:inherit;
          font-size:12px;
          font-weight:950;
        }

        .radar-actions .primary-button,
        .radar-card .primary-button {
          color:white;
          background:linear-gradient(135deg,#8b5cf6,#7c3aed);
          box-shadow:0 18px 38px rgba(139, 92, 246,.22);
        }

        .radar-actions .secondary-button,
        .radar-card .secondary-button {
          color:#463c63;
          background:#f4f0fb;
          border:1px solid rgba(167, 139, 250,.22);
        }

        .radar-actions .danger {
          color:#991b1b;
          background:#fef2f2;
        }

        .radar-summary-box {
          margin:16px 0;
          display:grid;
          gap:5px;
        }

        .radar-summary-box span {
          color:rgba(196, 181, 253,.82);
          font-size:12px;
          font-weight:850;
        }

        .radar-summary-box strong {
          font-size:42px;
          color:#fde68a;
          line-height:1;
        }

        .radar-summary-box small {
          color:white;
          font-size:13px;
          font-weight:950;
        }

        .radar-warning {
          margin-top:14px;
          background:rgba(239,68,68,.16);
          color:#fecaca;
        }

        .radar-legend-box {
          margin-top:16px;
          display:grid;
          gap:8px;
        }

        .radar-legend-box span {
          display:flex;
          align-items:center;
          gap:8px;
        }

        .radar-legend-box i {
          width:14px;
          height:14px;
          border-radius:999px;
          display:inline-block;
        }

        .legend-primary { background:#8b5cf6; }
        .legend-secondary { background:#a855f7; }

        .radar-svg {
          width:100%;
          max-width:430px;
          display:block;
          margin:0 auto 18px;
        }

        .radar-grid {
          fill:none;
          stroke:rgba(100,116,139,.26);
          stroke-width:1;
        }

        .radar-label {
          fill:#463c63;
          font-size:10px;
          font-weight:900;
        }

        .radar-area {
          fill:rgba(139, 92, 246,.28);
          stroke:#8b5cf6;
          stroke-width:3;
        }

        .radar-area-secondary {
          fill:rgba(245,158,11,.18);
          stroke:#a855f7;
          stroke-width:2;
          stroke-dasharray:7 5;
        }

        .radar-dot {
          fill:#8b5cf6;
          stroke:white;
          stroke-width:2;
        }

        .radar-score-bars {
          display:grid;
          gap:14px;
        }

        .radar-score-bars h3 {
          margin-top:6px;
          font-size:20px;
        }

        .radar-score-row {
          display:grid;
          gap:8px;
        }

        .radar-score-head {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
        }

        .radar-score-head span {
          color:#463c63;
          font-size:12px;
          font-weight:950;
        }

        .radar-score-head strong {
          color:#18102e;
          font-size:13px;
          font-weight:950;
        }

        .radar-score-track {
          height:9px;
          border-radius:999px;
          background:rgba(167, 139, 250,.20);
          overflow:hidden;
        }

        .radar-score-track i {
          display:block;
          height:100%;
          border-radius:inherit;
          background:linear-gradient(90deg,#8b5cf6,#7c3aed,#a855f7);
        }

        .radar-score-row small {
          color:#7a6c9a;
          font-size:11px;
          line-height:1.7;
          font-weight:750;
        }


        .radar-save-notice {
          margin-top:14px;
          border-radius:18px;
          padding:13px 15px;
          font-size:12px;
          font-weight:900;
          line-height:1.8;
          border:1px solid rgba(255,255,255,.16);
        }

        .radar-save-notice.success {
          background:rgba(16,185,129,.16);
          color:#d1fae5;
        }

        .radar-save-notice.error {
          background:rgba(239,68,68,.16);
          color:#fecaca;
        }

        .radar-history-panel {
          margin-top:22px;
          border-top:1px solid rgba(167, 139, 250,.22);
          padding-top:18px;
        }

        .radar-history-head {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          margin-bottom:12px;
        }

        .radar-history-head h3 {
          margin:0;
          font-size:18px;
        }

        .radar-history-head span {
          border-radius:999px;
          padding:6px 10px;
          background:#efe9fb;
          color:#6d28d9;
          font-size:11px;
          font-weight:950;
        }

        .radar-history-empty {
          margin:0;
          color:#7a6c9a;
          font-size:12px;
          line-height:1.9;
          font-weight:750;
        }

        .radar-history-list {
          display:grid;
          gap:10px;
        }

        .radar-history-item {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          border-radius:18px;
          padding:12px;
          background:#f4f0fb;
          border:1px solid rgba(167, 139, 250,.18);
        }

        .radar-history-item strong {
          display:block;
          color:#18102e;
          font-size:12px;
          font-weight:950;
          margin-bottom:4px;
        }

        .radar-history-item span {
          display:block;
          color:#7a6c9a;
          font-size:11px;
          font-weight:750;
        }

        .radar-history-item b {
          flex:0 0 auto;
          border-radius:14px;
          padding:8px 10px;
          background:#efe9fb;
          color:#6d28d9;
          font-size:12px;
          font-weight:950;
        }

        @media (max-width:980px) {
          .radar-tabs,
          .radar-intro-grid,
          .radar-two-columns,
          .radar-question-layout {
            grid-template-columns:1fr;
          }
        }
      `}</style>

      <div className="section-hero">
        <span className="eyebrow">رادار الأداء</span>
        <h2>رادار الجدارات الاستشارية</h2>
        <p>
          يقدّم رادار الأداء قراءة مزدوجة: قياسًا قبليًا لمستوى الجاهزية قبل الانطلاق، ومؤشر متابعة ذكيًا يُحدَّث تلقائيًا وفق التقدم الفعلي داخل الرحلة التعليمية.
        </p>
      </div>

      <div className="radar-tabs" role="tablist" aria-label="أقسام رادار الأداء">
        <button
          type="button"
          className={activeSection === "pre" ? "radar-tab active" : "radar-tab"}
          onClick={() => setActiveSection("pre")}
        >
          <strong>الاختبار القبلي</strong>
          <span>30 سؤالًا وحالة لقياس خط الأساس قبل أو أثناء الرحلة.</span>
        </button>

        <button
          type="button"
          className={activeSection === "learning" ? "radar-tab active" : "radar-tab"}
          onClick={() => setActiveSection("learning")}
        >
          <strong>رادار الرحلة التعليمية</strong>
          <span>رادار متغير حسب الأيام المفتوحة والمكتملة في مسارك التعليمي.</span>
        </button>
      </div>

      {activeSection === "pre" ? (
        <PreAssessmentPanel setActivePage={setActivePage} />
      ) : (
        <LearningRadarPanel progressRows={progressRows} />
      )}
    </section>
  );
}
