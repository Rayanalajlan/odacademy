import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "od_academy_simulation_lab_ar_v2";
const NOTES_KEY = "od_academy_simulation_notes_ar_v2";
const TIME_KEY = "od_academy_simulation_learning_seconds_ar_v2";

const REFERENCES = [
  {
    key: "cw",
    title: "كمنغز وورلي",
    label: "التطوير التنظيمي والتغيير",
    idea: "التشخيص، التعاقد، التدخلات، التغيير المخطط، التقييم، والتثبيت المؤسسي."
  },
  {
    key: "schein",
    title: "إدغار شاين",
    label: "الثقافة التنظيمية والقيادة",
    idea: "الثقافة عبر المظاهر، القيم المعلنة، القيم المستخدمة، والافتراضات الأساسية."
  },
  {
    key: "edmondson",
    title: "إيمي إدموندسون",
    label: "الأمان النفسي",
    idea: "الأمان النفسي شرط لرفع الأخطاء والمخاطر والتعلم داخل الفرق."
  },
  {
    key: "senge",
    title: "بيتر سنجي",
    label: "التفكير النظمي والمنظمة المتعلمة",
    idea: "التفكير النظمي، النماذج الذهنية، الرؤية المشتركة، وتعلم الفريق."
  },
  {
    key: "hackman",
    title: "هاكمان وأولدهام",
    label: "تصميم العمل وخصائص الوظيفة",
    idea: "تصميم العمل من خلال المعنى، الاستقلالية، التغذية الراجعة، وهوية المهمة."
  },
  {
    key: "kotter",
    title: "جون كوتر",
    label: "قيادة التغيير",
    idea: "الجاهزية، الرؤية، التحالف، الانتصارات السريعة، وترسيخ التغيير."
  },
  {
    key: "anderson",
    title: "أندرسون",
    label: "ممارسة التطوير التنظيمي",
    idea: "الدخول، التعاقد، علاقة العميل، الأخلاقيات، وإنهاء الارتباط."
  },
  {
    key: "weick",
    title: "كارل وايك",
    label: "صناعة المعنى",
    idea: "التغيير بوصفه صناعة معنى لا مجرد إرسال رسائل."
  },
  {
    key: "argyris",
    title: "أرجيرس وشون",
    label: "التعلم التنظيمي",
    idea: "التعلم من الدرجة الواحدة والدرجة الثانية وفحص الافتراضات."
  }
];

const DIFFICULTY_LEVELS = [
  {
    id: "foundation",
    name: "تأسيسي",
    intensity: 1,
    scoreLabel: "قراءة أولية",
    description: "المشكلة واضحة نسبيًا، والراعي يقبل التشخيص، والمخاطر الأخلاقية محدودة.",
    twist: "الحل السريع مغرٍ لكنه غير كارثي إذا أُجّل قليلًا."
  },
  {
    id: "professional",
    name: "مهني",
    intensity: 2,
    scoreLabel: "قرار مهني",
    description: "يوجد أكثر من طرف، وروايات مختلفة، والحل لا يظهر من العرض الأول.",
    twist: "كل إدارة تملك جزءًا من الحقيقة."
  },
  {
    id: "advanced",
    name: "متقدم",
    intensity: 3,
    scoreLabel: "تحليل نظامي",
    description: "المشكلة تمتد بين الهيكل، الثقافة، القيادة، والصلاحيات.",
    twist: "التدخل الظاهر قد ينجح شكليًا ويفشل سلوكيًا."
  },
  {
    id: "complex",
    name: "معقد",
    intensity: 4,
    scoreLabel: "حكم استشاري",
    description: "توجد مصالح متعارضة، وبيانات ناقصة، وخوف من الإفصاح.",
    twist: "الراعي يحاول دفع التشخيص نحو تفسير واحد يخدم موقفه."
  },
  {
    id: "critical",
    name: "حرج",
    intensity: 5,
    scoreLabel: "قرار تحت ضغط",
    description: "القرار قد يمس السلطة أو السمعة أو التقييم أو مستقبل أشخاص.",
    twist: "توجد احتمالية لاستخدام البيانات لمعاقبة طرف بدل تحسين النظام."
  },
  {
    id: "strategic",
    name: "استراتيجي",
    intensity: 6,
    scoreLabel: "قراءة تنفيذية",
    description: "الحالة مرتبطة بالاستراتيجية، نموذج التشغيل، والقدرة المستقبلية.",
    twist: "القيادة تريد توصية سريعة بينما السبب جذري ومتعدد المستويات."
  },
  {
    id: "expert",
    name: "خبير",
    intensity: 7,
    scoreLabel: "ممارس محترف",
    description: "حالة عالية الغموض، سياسية، ثقافية، وتشغيلية في وقت واحد.",
    twist: "أي تدخل خاطئ قد يزيد فقدان الثقة أو يثبت السلوك القديم."
  }
];

const ARCHETYPES = [
  {
    id: "role-clarity",
    name: "غموض أدوار وصلاحيات",
    color: "#4f46e5",
    lens: "تصميم المنظمة ومصفوفة المسؤوليات",
    goodFrame: "إعادة صياغة المشكلة كخلل محتمل في حقوق القرار ونقاط التسليم والصلاحيات، لا كضعف التزام فقط.",
    bestHypothesis: "الخلل الأساسي في حقوق القرار ونقاط التسليم، لا في ضعف التزام الأفراد فقط.",
    bestData: "تحليل قرارات وتصعيدات فعلية، مقابلات مع الأطراف، مراجعة أوصاف وظيفية، وملاحظة اجتماع قرار.",
    bestIntervention: "تصميم مصفوفة مسؤوليات عملية مع تحديث الأدوار والصلاحيات وربطها باجتماعات القرار.",
    bestMetric: "انخفاض التصعيدات غير الضرورية وزمن حسم القرارات العابرة للإدارات.",
    bestEthic: "حماية البيانات من استخدامها لإدانة مدير محدد، وعرض النتائج كنمط نظامي لا كفشل فردي."
  },
  {
    id: "intergroup-conflict",
    name: "صراع بين إدارات",
    color: "#e11d48",
    lens: "تدخلات العمليات الإنسانية والعلاقات بين المجموعات",
    goodFrame: "إعادة صياغة الصراع كاعتماد متبادل غير مصمم ومؤشرات متعارضة وصور نمطية متبادلة.",
    bestHypothesis: "الصراع الظاهر يخفي اعتمادًا متبادلًا غير مصمم ومؤشرات أداء متعارضة.",
    bestData: "مقابلات منفصلة مع الإدارات، تحليل نقاط التسليم، بيانات الشكاوى، وملاحظة اجتماع مشترك.",
    bestIntervention: "تدخل علاقات بين مجموعات مع اتفاق عمل ونقاط تسليم ومؤشرات مشتركة.",
    bestMetric: "تحسن جودة التسليم وانخفاض اللوم المتبادل وزمن حل القضايا المشتركة.",
    bestEthic: "عدم تحويل جلسة العلاقات إلى محاكمة لطرف، وتثبيت قواعد حوار تحمي الأصوات الأقل قوة."
  },
  {
    id: "culture-fear",
    name: "ثقافة خوف وإخفاء أخبار سيئة",
    color: "#7c3aed",
    lens: "الثقافة والأمان النفسي",
    goodFrame: "إعادة صياغة الخوف كمنظومة استجابات قيادية ومكافآت ومعايير تجعل الصمت أكثر أمانًا من الصراحة.",
    bestHypothesis: "إخفاء الأخبار السيئة ناتج عن نظام يعاقب الإنذار المبكر ويكافئ تجميل الواقع.",
    bestData: "مقابلات آمنة، تحليل لحظات الحقيقة، سجل المخاطر، وملاحظة استجابة القيادة للأخبار السيئة.",
    bestIntervention: "تدخل ثقافي سلوكي يغير استجابة القيادة للأخبار السيئة ويؤسس مراجعة أخطاء بلا لوم.",
    bestMetric: "ارتفاع المخاطر المرفوعة مبكرًا وانخفاض المفاجآت والأزمات المتأخرة.",
    bestEthic: "عدم وعد المشاركين بسرية مطلقة غير قابلة للحماية، وعرض النتائج مجمعة دون كشف أصحاب الأقوال."
  },
  {
    id: "process-delay",
    name: "تعطل عملية وإعادة عمل",
    color: "#f59e0b",
    lens: "إعادة تصميم العمليات",
    goodFrame: "إعادة صياغة التأخر كخلل في تدفق العمل والانتظار والقرارات والبيانات، لا ككسل فردي.",
    bestHypothesis: "التأخر ناتج عن تدفق عمل مكسور وموافقات وانتظارات، لا عن بطء فردي فقط.",
    bestData: "رسم الوضع الحالي، قياس زمن الدورة، نقاط الانتظار، إعادة العمل، والقرارات الحرجة.",
    bestIntervention: "إعادة تصميم الوضع المستقبلي للخطوات والبوابات والصلاحيات والبيانات المطلوبة.",
    bestMetric: "انخفاض زمن الدورة ونسبة إعادة العمل وارتفاع الاكتمال من أول مرة.",
    bestEthic: "عدم أتمتة عملية مكسورة كما هي، وعدم تحميل الموظفين أخطاء تصميم العملية."
  },
  {
    id: "learning-loop",
    name: "تكرار أخطاء وضعف تعلم",
    color: "#10b981",
    lens: "التعلم المؤسسي",
    goodFrame: "إعادة صياغة تكرار الأخطاء كفشل في تحويل الخبرة إلى ذاكرة تنظيمية وتعديل نظامي.",
    bestHypothesis: "المنظمة تملك خبرات كثيرة لكنها لا تحولها إلى ذاكرة تنظيمية وتعديل نظامي.",
    bestData: "تحليل آخر ثلاث حالات متكررة، مراجعة الدروس الموثقة، مقابلات مع الخبراء، وتتبع هل طُبقت الدروس.",
    bestIntervention: "بناء نظام مراجعة بعد العمل وقاعدة دروس مطبقة ومجتمع ممارسة ومالك لتطبيق الدروس.",
    bestMetric: "انخفاض تكرار الخطأ نفسه وزيادة الدروس المطبقة لا الموثقة فقط.",
    bestEthic: "توجيه مراجعات التعلم للنظام لا للبحث عن مذنب، وتمييز الخطأ التعلمي من الإهمال المتعمد."
  },
  {
    id: "performance-system",
    name: "نظام أداء شكلي",
    color: "#0ea5e9",
    lens: "إدارة الأداء",
    goodFrame: "إعادة صياغة المشكلة كفجوة بين شكل النظام وجودة الحوار والمساءلة والتغذية الراجعة.",
    bestHypothesis: "النظام يقيس إكمال النماذج ولا يغير جودة الحوار والتغذية الراجعة والمساءلة.",
    bestData: "عينة أهداف، محادثات أداء، مقابلات مديرين وموظفين، ومراجعة ربط النتائج بالسلوكيات.",
    bestIntervention: "تطوير جودة محادثات الأداء والمعايرة وربط المديرين بجودة إدارة الأداء.",
    bestMetric: "تحسن جودة الأهداف والمحادثات وانخفاض مفاجآت نهاية السنة.",
    bestEthic: "عدم استخدام بيانات الأداء الجديدة لمعاقبة الموظفين قبل تدريب المديرين وضبط العدالة."
  },
  {
    id: "change-adoption",
    name: "تغيير أُطلق ولم يُتبنَّ",
    color: "#14b8a6",
    lens: "تبنّي التغيير",
    goodFrame: "إعادة صياغة المشكلة كفجوة بين الإطلاق الرسمي والتبنّي السلوكي في لحظات العمل الحرجة.",
    bestHypothesis: "الإطلاق نجح شكليًا لكن السلوك الجديد لم يدخل في لحظات العمل الحرجة.",
    bestData: "ملاحظة لحظات العمل، بيانات استخدام، مقابلات عن العوائق، وتحليل السلوك القديم العائد.",
    bestIntervention: "خطة تبنّي 30/60/90 مع تجربة محدودة وقياس استخدام وجودة استخدام وحوكمة تنفيذ.",
    bestMetric: "استمرار السلوك الجديد بعد 90 يومًا دون دفع يومي من فريق المشروع.",
    bestEthic: "عدم إعلان فشل الموظفين قبل التأكد من أن النظام الجديد مفهوم وممكن ومكافأ."
  },
  {
    id: "job-design",
    name: "تصميم عمل فقير بالمعنى أو الصلاحية",
    color: "#8b5cf6",
    lens: "تصميم العمل",
    goodFrame: "إعادة صياغة انخفاض الدافعية كخلل محتمل في تصميم العمل والاستقلالية والتغذية الراجعة.",
    bestHypothesis: "انخفاض الدافعية مرتبط بتصميم العمل والاستقلالية والتغذية الراجعة لا بالرغبة فقط.",
    bestData: "تحليل خصائص الوظيفة، مقابلات الموظفين، مراجعة الصلاحيات، وملاحظة الاعتماد المتبادل.",
    bestIntervention: "إثراء وظيفي أو تصميم فريق ذاتي الإدارة مع صلاحيات ومعلومات ومكافآت مناسبة.",
    bestMetric: "تحسن الاستقلالية وجودة المخرجات وانخفاض الدوران أو الشكاوى المرتبطة بالعمل.",
    bestEthic: "عدم إضافة مهام باسم الإثراء دون صلاحية أو دعم أو تعديل في عبء العمل."
  },
  {
    id: "leadership-symbolic",
    name: "فجوة قيادة وسلوك رمزي",
    color: "#ef4444",
    lens: "القيادة والسلوك الرمزي",
    goodFrame: "إعادة صياغة المشكلة كفجوة بين الرسائل القيادية والسلوك القيادي عند الضغط.",
    bestHypothesis: "القادة يعلنون قيمة جديدة لكنهم يرسلون إشارات معاكسة في لحظات الضغط.",
    bestData: "تحليل لحظات الحقيقة القيادية، مقابلات، ملاحظة اجتماعات، وربط المكافآت والترقيات بالسلوك.",
    bestIntervention: "توجيه قيادي وتدخل سلوك رمزي مع مؤشرات اتساق القول والفعل.",
    bestMetric: "تحسن الثقة في القيادة وارتفاع السلوكيات المتوافقة مع القيمة المعلنة.",
    bestEthic: "تقديم تغذية راجعة قيادية تحمي الكرامة وتستند إلى سلوكيات لا أحكام شخصية."
  },
  {
    id: "od-dashboard",
    name: "مؤشرات كثيرة بلا رؤى",
    color: "#334155",
    lens: "لوحة قياس التطوير التنظيمي",
    goodFrame: "إعادة صياغة المشكلة كضعف في قراءة العلاقات بين المؤشرات لا نقص في الأرقام.",
    bestHypothesis: "المؤشرات تقيس النشاط المنفصل ولا تقرأ العلاقات بين الثقافة والأدوار والأداء.",
    bestData: "جرد المؤشرات الحالية، أسئلة القيادة، مصادر البيانات، وحدود التنبيه والقرارات المرتبطة بكل مؤشر.",
    bestIntervention: "بناء لوحة قياس للتطوير التنظيمي مع حدود تنبيه وفرضيات وقرارات متابعة لا مجرد أرقام.",
    bestMetric: "قرارات تنظيمية أفضل مبنية على أنماط وعلاقات بين المؤشرات.",
    bestEthic: "عدم استخدام اللوحة كسلاح ضد الفرق، وعدم إخفاء المؤشرات المزعجة عن القيادة."
  }
];

const INDUSTRIES = [
  "شركة خدمات تعليمية",
  "مستشفى خاص",
  "منصة تجارة إلكترونية",
  "شركة لوجستية",
  "جهة حكومية خدمية",
  "شركة تقنية مالية",
  "مجموعة مطاعم",
  "شركة تصنيع",
  "جامعة أهلية",
  "شركة استشارات",
  "شركة تأمين",
  "مركز اتصال كبير",
  "شركة مقاولات",
  "شركة سياحة وتجارب",
  "منصة تدريب رقمية",
  "شركة خدمات موارد بشرية",
  "شركة عقارية",
  "مركز طبي متعدد الفروع",
  "شركة صيانة وتشغيل",
  "منظمة غير ربحية"
];

const ORG_SIZES = [
  "120 موظفًا",
  "280 موظفًا",
  "450 موظفًا",
  "900 موظف",
  "1500 موظف",
  "فروع متعددة في ثلاث مناطق",
  "نمو سريع بعد توسع رقمي",
  "كيانان اندمجا حديثًا",
  "فريق موزع بين الرياض وجدة والدمام",
  "إدارة حرجة تخدم عملاء كبار",
  "منظمة انتقلت من عائلية إلى مؤسسية",
  "وحدة أعمال جديدة لم تنضج أدوارها بعد"
];

const TRIGGERS = [
  "شكاوى عملاء متكررة",
  "انخفاض ثقة داخلي",
  "تأخر قرارات حرجة",
  "ارتفاع دوران وظيفي",
  "تكرار أخطاء تشغيلية",
  "فشل مبادرة تغيير سابقة",
  "ضغط من الإدارة العليا",
  "تحول رقمي جديد",
  "نمو سريع",
  "تعارض بين إدارتين قويتين",
  "انخفاض جودة المخرجات",
  "إرهاق تغيير بعد مبادرات كثيرة",
  "غموض في ملكية العملية",
  "ارتفاع الاستثناءات خارج المسار الرسمي",
  "ضعف استخدام نظام جديد",
  "تراجع رضا المستفيدين",
  "زيادة الشكاوى بين الإدارات",
  "تأخر إطلاق منتجات أو خدمات",
  "انخفاض جودة محادثات الأداء",
  "تكرار مغادرة الكفاءات"
];

const STAKEHOLDER_SETS = [
  ["الرئيس التنفيذي", "مدير الموارد البشرية", "مدير العمليات", "مدير المبيعات"],
  ["مدير الجودة", "مدير تجربة العميل", "قادة الفروع", "فريق الخدمة"],
  ["مدير التقنية", "مالك المنتج", "فريق العمليات", "المالية"],
  ["مدير المشروع", "مدير الإدارة المعنية", "شريك الموارد البشرية", "فريق القيادة الوسطى"],
  ["الموظفون الجدد", "المديرون المباشرون", "التعلم والتطوير", "مكتب التحول"],
  ["مجلس الإدارة", "الرئيس التنفيذي", "القيادة الوسطى", "ملاك العمليات"],
  ["المبيعات", "العمليات", "خدمة العملاء", "الجودة"],
  ["التقنية", "الأعمال", "الأمن السيبراني", "تجربة المستخدم"],
  ["إدارة الأداء", "مديرو الإدارات", "الموظفون", "التعويضات والمزايا"],
  ["فريق القيادة", "المستشار الخارجي", "الموارد البشرية", "وكلاء التغيير"]
];

const DATA_SIGNALS = [
  "تقرير شكاوى آخر 90 يومًا",
  "مقابلات مع 12 موظفًا من مستويات مختلفة",
  "ملاحظة اجتماع قيادة",
  "تحليل التصعيدات بين الإدارات",
  "نتائج استبيان نبض قصير",
  "عينة من الأوصاف الوظيفية",
  "زمن دورة العملية قبل وبعد",
  "تحليل قرارات الترقية والمكافآت",
  "سجل أخطاء متكررة",
  "مراجعة مؤشرات تجربة العميل",
  "تحليل استخدام النظام الرقمي",
  "عينة من محادثات الأداء",
  "سجل الاستثناءات",
  "تحليل قرارات متأخرة",
  "مراجعة نتائج مراجعات ما بعد العمل",
  "خريطة أصحاب المصلحة والنفوذ",
  "تحليل شكاوى الموظفين",
  "ملاحظة لقاء بين إدارتين",
  "تتبع رحلة عميل واحدة من البداية للنهاية",
  "مراجعة نظام المكافآت مقابل السلوك المطلوب",
  "تحليل جودة الأهداف الفردية والجماعية",
  "مقابلات خروج معرفية مع موظفين مغادرين"
];

const PRESSURES = [
  "الإدارة تريد حلًا خلال أسبوعين",
  "المدير الأقوى يرفض الاعتراف بدوره في المشكلة",
  "الموظفون يخافون من التصريح",
  "البيانات متضاربة بين الإدارات",
  "هناك مبادرات كثيرة تسبب إرهاقًا",
  "العميل الخارجي بدأ يلاحظ التدهور",
  "الراعي يريد تقريرًا يثبت وجهة نظره",
  "القائد التنفيذي يطلب أسماء المعارضين",
  "الفريق يرى أن المشروع مجرد موجة مؤقتة",
  "الوقت ضيق قبل اجتماع مجلس الإدارة",
  "الموارد البشرية تريد إطلاق تدريب سريع قبل التشخيص",
  "مكتب التحول يقيس الإنجاز لا التبني",
  "أحد الأطراف يحاول تحويل المشروع ضد إدارة أخرى",
  "القيادة الوسطى صامتة لكنها غير مقتنعة"
];

const TRAPS = [
  "القفز إلى ورشة تدريب قبل التشخيص",
  "اعتبار المشكلة شخصية بين مديرين فقط",
  "الاكتفاء بإعلان قيم جديدة",
  "تصميم مصفوفة مسؤوليات كوثيقة لا كممارسة في الاجتماعات",
  "قياس الحضور بدل السلوك",
  "إهمال القيادة الوسطى",
  "استخدام البيانات لإدانة طرف",
  "إغلاق المشروع قبل نقل الملكية",
  "أتمتة عملية مكسورة كما هي",
  "قبول رواية الراعي كحقيقة نهائية",
  "تجاهل أصحاب المصلحة الأقل قوة",
  "إطلاق تجربة محدودة في أسهل مكان فقط",
  "تصميم تدخل ثقيل لا يستطيع النظام حمله",
  "اعتبار انخفاض الأخطاء المعلنة دليلًا على تحسن دون فحص الأمان النفسي"
];

const DELIVERABLES = [
  "موجز تشخيص تنظيمي",
  "موجز تدخل في العمليات الإنسانية",
  "موجز تدخل تقني هيكلي",
  "موجز تشخيص ثقافي",
  "خطة تنفيذ وتبنّي التغيير",
  "موجز لوحة التطوير التنظيمي والرؤى",
  "موجز الاستدامة والخروج",
  "حزمة وضوح الأدوار ومصفوفة المسؤوليات",
  "موجز نظام التعلم المؤسسي",
  "موجز التدخل الثقافي",
  "خريطة أصحاب المصلحة والقوة",
  "موجز قياس أثر التطوير التنظيمي",
  "موجز القدرة المستمرة",
  "مراجعة جودة الأوصاف الوظيفية",
  "خطة اتصال وإشراك التغيير"
];

const WRONG_FRAMES = [
  "تأطير الحالة كفجوة تنسيق بين الأطراف مع التركيز على تحسين قنوات التواصل قبل فحص حقوق القرار.",
  "اعتبار المشكلة ناتجة عن اختلاف توقعات العمل بين الإدارات، مع الاكتفاء بورشة اتفاق على الأولويات.",
  "وصف التحدي كضعف التزام تشغيلي يحتاج إلى ضبط متابعة يومية دون مراجعة تصميم الدور والصلاحية.",
  "قراءة الوضع كخلل في الرسائل القيادية، مع تأجيل تحليل المؤشرات والسلوكيات إلى مرحلة لاحقة.",
  "صياغة المشكلة كتباين في أساليب المديرين، مع اقتراح توحيد الممارسات قبل اختبار الفرضيات النظامية.",
  "اعتبار الاعتراضات مقاومة طبيعية للتغيير، مع بناء خطة تواصل قبل فحص أسباب الاعتراض ومصالح الأطراف.",
  "تعريف القضية كحاجة إلى رفع الوعي بالمبادرة، مع إبقاء تصميم العملية والصلاحيات خارج نطاق التشخيص.",
  "تفسير العرض كضعف في نضج الفريق، مع اقتراح تدخل تدريبي قبل تحديد السلوك المتكرر ومصدره النظامي."
];

const WRONG_HYPOTHESES = [
  "السبب الأرجح أن الفرق لا تملك لغة مشتركة كافية، لذلك ستتحسن النتائج بمجرد توحيد المصطلحات والاجتماعات.",
  "الخلل الأساسي في انخفاض الحماس العام، ويكفي رفع الدافعية دون فحص العلاقة بين الحوافز والقرارات اليومية.",
  "المشكلة ناتجة غالبًا عن نقص المعلومات، لذلك سيكون التعميم الرسمي كافيًا إذا صيغ بوضوح ووزع على الجميع.",
  "السبب الأقوى أن بعض المديرين لا يطبقون السياسة كما يجب، مع عدم الحاجة الآن لفحص قابلية السياسة للتطبيق.",
  "التحدي مرتبط بضعف مهارات الفريق، ولذلك يجب البدء بتدريب شامل قبل اختبار أثر الهيكل والصلاحيات.",
  "المشكلة مؤقتة بسبب ضغط العمل الحالي، ومن المتوقع أن تنخفض تلقائيًا بعد انتهاء المرحلة التشغيلية المزدحمة.",
  "الروايات المتعارضة دليل على ضعف الثقة بين الأشخاص، ولذلك يكفي التركيز على المصالحة قبل فحص نظام العمل.",
  "رأي الراعي التنفيذي يعطي تفسيرًا كافيًا للسبب الجذري، مع إمكانية استخدام بيانات محدودة لتأكيد اتجاهه."
];

const WRONG_DATA = [
  "جمع انطباعات سريعة من القيادات العليا ثم بناء تصور أولي، مع تأجيل مقابلات المستويات الأخرى إلى ما بعد التوصية.",
  "إرسال استبيان عام عن الرضا والتعاون، دون ربط الأسئلة بلحظات العمل أو قرارات التسليم بين الأطراف.",
  "مراجعة وثائق السياسات والعروض السابقة فقط، باعتبارها كافية لتحديد الفجوة بين التصميم والتطبيق.",
  "طلب قائمة بالمواقف المتعثرة من الراعي، ثم اختيار أمثلة تمثل وجهة نظره لتسريع بناء التقرير.",
  "الاعتماد على مؤشر مالي أو تشغيلي واحد بوصفه دليلًا رئيسيًا، مع عدم تتبع السلوكيات التي أنتجت الرقم.",
  "جمع كمية كبيرة من البيانات المتنوعة دون سؤال تشخيصي محدد، ثم فرزها لاحقًا لاستخراج النمط المناسب.",
  "مقابلة الطرف الأعلى صوتًا أولًا وبناء الفرضية حول روايته، ثم استخدام بقية البيانات للتأكد من التفاصيل.",
  "تأجيل الملاحظة الميدانية إلى ما بعد تنفيذ الحل، والاكتفاء الآن بتقارير الأداء والاجتماعات الرسمية."
];

const WRONG_INTERVENTIONS = [
  "تنفيذ ورشة مواءمة بين الأطراف لتوحيد اللغة والتوقعات، دون تعديل واضح في حقوق القرار أو نقاط التسليم.",
  "إطلاق حملة داخلية عن التعاون والمساءلة، مع إبقاء العمليات والصلاحيات كما هي لتجنب إرباك الفرق.",
  "تغيير الهيكل بسرعة لتقليل الاحتكاك الظاهر، قبل اختبار أثر التغيير على تدفق العمل والاعتماد المتبادل.",
  "تقديم برنامج تدريبي عام للمديرين والموظفين، باعتباره مدخلًا آمنًا قبل التعامل مع مصادر الخلل النظامية.",
  "إنشاء لجنة متابعة مشتركة لمعالجة القضايا، دون تحديد مالك قرار أو معايير تصعيد أو زمن حسم واضح.",
  "توحيد النماذج والقوالب بين الإدارات، مع ترك مؤشرات الأداء والحوافز الحالية حتى لا تتعطل الأعمال.",
  "إطلاق نظام تقني جديد لتجميع الطلبات، قبل إعادة تصميم العملية وتحديد البيانات المطلوبة في كل مرحلة.",
  "تطبيق اجتماع أسبوعي إلزامي بين الأطراف، مع افتراض أن كثافة التواصل ستعالج سبب التداخل أو التأخير."
];

const WRONG_METRICS = [
  "قياس عدد الاجتماعات المشتركة المنعقدة بعد التدخل، مع اعتبار انتظامها مؤشرًا كافيًا على تحسن التعاون.",
  "متابعة نسبة حضور الورش واللقاءات التعريفية، دون قياس تغير القرارات أو السلوك في لحظات العمل الحرجة.",
  "حساب عدد الوثائق أو النماذج التي تم اعتمادها، مع تأجيل قياس استخدامها الفعلي إلى مرحلة لاحقة.",
  "قياس الانطباع العام بعد الجلسة مباشرة، ثم استخدام النتيجة لتقدير نجاح التدخل على مستوى المنظمة.",
  "متابعة عدد الرسائل والتعاميم المنشورة عن المبادرة، باعتبار كثافة التواصل دليلًا على وضوح الاتجاه.",
  "احتساب عدد المستخدمين الذين دخلوا النظام الجديد، دون فحص جودة الاستخدام أو أثره على القرار والعمل.",
  "قياس انخفاض الشكاوى الرسمية فقط، دون التأكد هل انخفضت المشكلة فعلًا أم انتقلت إلى قنوات غير رسمية.",
  "استخدام اكتمال خطة التنفيذ كمؤشر أثر رئيسي، مع عدم فصل النشاط المنجز عن التغير السلوكي المتوقع."
];

const WRONG_ETHICS = [
  "تقديم أمثلة تفصيلية للراعي لزيادة قوة التقرير، مع إزالة الأسماء فقط دون اختبار إمكانية معرفة أصحابها.",
  "مشاركة ملاحظات الفرق كما وردت لإثبات الشفافية، مع افتراض أن القيادة ستستخدمها لتحسين النظام فقط.",
  "وعد المشاركين بسرية كاملة في كل الظروف، حتى لو ظهرت معلومات تستلزم حدودًا واضحة لاستخدام البيانات.",
  "تركيز العرض على الطرف الأكثر تأثيرًا في المشكلة، لأن تحديد المسؤول المباشر سيسرّع قبول التوصيات.",
  "استبعاد الأصوات الأقل قوة من العينة الأساسية لتقليل الحساسية، ثم تعويض ذلك بتحليل بيانات عامة لاحقًا.",
  "تلطيف النتائج السلبية في التقرير حتى لا تتوتر العلاقة مع الراعي، مع الاحتفاظ بالتفاصيل في الملاحظات الداخلية.",
  "توسيع نطاق المقابلات أثناء المشروع دون إعادة توضيح الغرض وحدود الاستخدام، لأن ذلك يخدم جودة التشخيص.",
  "استخدام بيانات الثقة لتحديد الفرق الأقل نضجًا، ثم اقتراح تدخل مخصص لها قبل مناقشة مخاطر الوصم."
];

const QUESTION_FLOW = [
  {
    key: "frame",
    title: "تأطير المشكلة",
    weight: 15,
    hint: "كيف ستعيد صياغة طلب العميل دون أن تقفز للحل؟"
  },
  {
    key: "hypothesis",
    title: "الفرضية التشخيصية",
    weight: 20,
    hint: "ما السبب النظامي الأكثر احتمالًا؟"
  },
  {
    key: "data",
    title: "البيانات المطلوبة",
    weight: 15,
    hint: "ما البيانات التي تحتاجها قبل الحكم؟"
  },
  {
    key: "intervention",
    title: "التدخل الأنسب",
    weight: 20,
    hint: "ما التدخل الذي يعالج السبب لا العرض؟"
  },
  {
    key: "metric",
    title: "مؤشر الأثر",
    weight: 20,
    hint: "كيف ستعرف أن السلوك أو النتيجة تغيرت؟"
  },
  {
    key: "ethic",
    title: "القرار الأخلاقي",
    weight: 10,
    hint: "كيف تحمي الثقة والسرية والكرامة المهنية؟"
  }
];

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return function rand() {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function seededShuffle(list, seedText) {
  const arr = [...list];
  const rand = seededRandom(hashString(seedText));
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(list, index) {
  return list[Math.abs(index) % list.length];
}

function uniqueOptions(correct, wrongPool, seedText, count = 4) {
  const wrong = seededShuffle(
    wrongPool.filter((item) => item && item !== correct),
    seedText + "-خطأ"
  );

  const selected = [correct, ...wrong].filter(Boolean);
  const unique = Array.from(new Set(selected)).slice(0, count);

  while (unique.length < count) {
    unique.push(`خيار ناقص ${unique.length + 1}`);
  }

  return seededShuffle(unique, seedText + "-نهائي");
}

function safeReadJSON(key, fallback) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJSON(key, value) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // تجاهل فشل التخزين المحلي
  }
}

function safeReadNumber(key, fallback = 0) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? Number(raw) || fallback : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteNumber(key, value) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, String(value));
    }
  } catch {
    // تجاهل فشل التخزين المحلي
  }
}

function buildScenarioBank() {
  const bank = [];

  for (let i = 0; i < 350; i += 1) {
    const archetype = pick(ARCHETYPES, i * 3);
    const level = pick(DIFFICULTY_LEVELS, i * 5);
    const industry = pick(INDUSTRIES, i * 7);
    const size = pick(ORG_SIZES, i * 11);
    const trigger = pick(TRIGGERS, i * 13);
    const stakeholders = pick(STAKEHOLDER_SETS, i * 17);
    const pressure = pick(PRESSURES, i * 19);
    const mainSignal = pick(DATA_SIGNALS, i * 23);
    const secondarySignal = pick(DATA_SIGNALS, i * 29 + 1);
    const thirdSignal = pick(DATA_SIGNALS, i * 31 + 2);
    const fourthSignal = pick(DATA_SIGNALS, i * 37 + 3);
    const trap = pick(TRAPS, i * 41);
    const deliverable = pick(DELIVERABLES, i * 43);
    const reference = pick(REFERENCES, i * 47);

    const caseNumber = String(i + 1).padStart(3, "0");

    const extraAmbiguity =
      level.intensity >= 4
        ? "توجد روايات متعارضة بين الأطراف، وبعض البيانات صحيحة لكنها قد تُستخدم سياسيًا أو تُفهم خارج سياقها."
        : "المعطيات الأولية تسمح ببداية تشخيص مهنية، لكنها لا تسمح بحكم نهائي بعد.";

    const ethicalPressure =
      level.intensity >= 5
        ? "يوجد خطر أن تُستخدم نتائج التشخيص لمعاقبة طرف أو تثبيت قرار مسبق بدل تحسين النظام."
        : "الخطر الأخلاقي متوسط، لكنه يتطلب وضوح السرية وحدود استخدام البيانات.";

    const boardDemand =
      level.intensity >= 6
        ? "مجلس الإدارة يريد توصية تنفيذية، لكن التوصية المتسرعة قد تعالج العرض وتترك السبب الجذري."
        : "الراعي يريد فهمًا عمليًا يساعده على اختيار التدخل المناسب.";

    bank.push({
      id: `حالة-${caseNumber}`,
      title: `${archetype.name} في ${industry}`,
      archetype,
      level,
      category: archetype.id,
      industry,
      size,
      trigger,
      stakeholders,
      pressure,
      mainSignal,
      secondarySignal,
      thirdSignal,
      fourthSignal,
      trap,
      deliverable,
      reference,
      situation: `تعمل مع ${industry} بحجم ${size}. ظهرت مشكلة مركزية: ${trigger}. الإدارة تصف الوضع بأنه خلل في الالتزام أو الانضباط، لكن المؤشرات الأولية تشير إلى احتمال وجود سبب نظامي أعمق مرتبط بالعمل أو الثقافة أو السلطة أو التعلم.`,
      complexityNote: `${level.description} ${extraAmbiguity}`,
      boardQuestion: `${boardDemand} المطلوب منك تقديم قراءة مهنية: ما التأطير الصحيح؟ ما الفرضية الأقوى؟ ما البيانات؟ ما التدخل؟ كيف تقيس؟ وكيف تحمي الأخلاقيات؟`,
      hiddenDynamic: archetype.bestHypothesis,
      ethicalRisk: `${ethicalPressure} الضغط الحالي: ${pressure}.`,
      decisionMoment: "لحظة القرار: هل تقبل التفسير السهل وتنفذ حلًا سريعًا، أم تعيد صياغة الطلب كفرضيات تشخيصية وتبني تدخلًا قابلًا للقياس والاستدامة؟",
      correct: {
        frame: archetype.goodFrame,
        hypothesis: archetype.bestHypothesis,
        data: archetype.bestData,
        intervention: archetype.bestIntervention,
        metric: archetype.bestMetric,
        ethic: archetype.bestEthic
      },
      dataNeeded: [
        mainSignal,
        secondarySignal,
        thirdSignal,
        fourthSignal,
        "مقابلات مع أصحاب مصلحة من مستويات مختلفة",
        "ملاحظة لحظة عمل حقيقية لا الاكتفاء بالتصريحات",
        "مراجعة مؤشر سلوكي ومؤشر أثر"
      ],
      mistakes: [
        trap,
        "تفسير العرض كسبب جذري",
        "الاعتماد على رأي صاحب السلطة وحده",
        "تصميم تدخل لا يستطيع النظام حمله بعد خروج الممارس"
      ],
      successMeasures: [
        archetype.bestMetric,
        "وضوح السلوك الجديد المطلوب",
        "نقل الملكية إلى مالك داخلي",
        "وجود مؤشر تبنّي ومؤشر أثر",
        "انخفاض الاعتماد على التدخل الخارجي"
      ]
    });
  }

  return bank;
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}س ${minutes}د`;
  if (minutes > 0) return `${minutes}د ${seconds}ث`;
  return `${seconds}ث`;
}

function getGrade(score) {
  if (score >= 92) return "خبير استشاري";
  if (score >= 82) return "ممارس ناضج";
  if (score >= 70) return "جيد مع فجوات";
  if (score >= 55) return "متسرع جزئيًا";
  return "يحتاج رجوع للتشخيص";
}

function getScoreBreakdown(answers, scenario) {
  const checks = [
    { key: "frame", label: "تأطير المشكلة", weight: 15 },
    { key: "hypothesis", label: "الفرضية", weight: 20 },
    { key: "data", label: "خطة البيانات", weight: 15 },
    { key: "intervention", label: "التدخل", weight: 20 },
    { key: "metric", label: "القياس", weight: 20 },
    { key: "ethic", label: "الأخلاقيات", weight: 10 }
  ];

  return checks.map((item) => {
    const correct = scenario.correct[item.key];
    const selected = answers[item.key];
    const earned = selected === correct ? item.weight : 0;

    return {
      ...item,
      correct,
      selected,
      earned,
      isCorrect: earned === item.weight
    };
  });
}

function getTotalScore(answers, scenario) {
  return getScoreBreakdown(answers, scenario).reduce((sum, item) => sum + item.earned, 0);
}

function buildBriefText({ scenario, answers, score, notes }) {
  const lines = [
    "تقرير محاكاة استشارية",
    "======================",
    "",
    `رقم الحالة: ${scenario.id}`,
    `العنوان: ${scenario.title}`,
    `الصعوبة: ${scenario.level.name}`,
    `المرجع المفاهيمي: ${scenario.reference.title} - ${scenario.reference.label}`,
    "",
    "وصف الحالة:",
    scenario.situation,
    "",
    "تعقيد الحالة:",
    scenario.complexityNote,
    "",
    "الخطر الأخلاقي:",
    scenario.ethicalRisk,
    "",
    "إجابات المتدرب:",
    `1. تأطير المشكلة: ${answers.frame || "غير مجاب"}`,
    `2. الفرضية: ${answers.hypothesis || "غير مجاب"}`,
    `3. البيانات: ${answers.data || "غير مجاب"}`,
    `4. التدخل: ${answers.intervention || "غير مجاب"}`,
    `5. القياس: ${answers.metric || "غير مجاب"}`,
    `6. الأخلاقيات: ${answers.ethic || "غير مجاب"}`,
    "",
    `الدرجة: ${score}% - ${getGrade(score)}`,
    "",
    "التصحيح المهني:",
    `تأطير المشكلة: ${scenario.correct.frame}`,
    `الفرضية: ${scenario.correct.hypothesis}`,
    `خطة البيانات: ${scenario.correct.data}`,
    `التدخل: ${scenario.correct.intervention}`,
    `القياس: ${scenario.correct.metric}`,
    `الأخلاقيات: ${scenario.correct.ethic}`,
    "",
    "ملاحظات المستشار:",
    notes || "لا توجد ملاحظات.",
    "",
    "أسئلة تأمل:",
    "ما الذي جعلني أختار هذه الفرضية؟",
    "هل سمعت صوت الأطراف الأقل قوة؟",
    "هل قست النشاط أم السلوك والأثر؟",
    "هل صممت تدخلًا يستطيع النظام حمله بعد خروجي؟"
  ];

  return lines.join("\n");
}

function escapeReportHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPresentationReportHTML({ scenario, answers, score, notes, breakdown }) {
  const safeScenarioTitle = escapeReportHtml(scenario.title);
  const safeScenarioId = escapeReportHtml(scenario.id);
  const safeGrade = escapeReportHtml(getGrade(score));
  const safeSituation = escapeReportHtml(scenario.situation);
  const safeComplexity = escapeReportHtml(scenario.complexityNote);
  const safeEthicalRisk = escapeReportHtml(scenario.ethicalRisk);
  const safeNotes = escapeReportHtml(notes || "لا توجد ملاحظات.");
  const safeReference = escapeReportHtml(`${scenario.reference.title} — ${scenario.reference.label}: ${scenario.reference.idea}`);

  const rows = breakdown
    .map((item) => {
      const status = item.isCorrect ? "ناضج" : "يحتاج مراجعة";
      const statusClass = item.isCorrect ? "good" : "watch";
      return `
        <tr>
          <td>${escapeReportHtml(item.label)}</td>
          <td>${escapeReportHtml(item.selected || "غير مجاب")}</td>
          <td>${escapeReportHtml(item.correct)}</td>
          <td class="${statusClass}">${status}</td>
          <td>${item.earned}/${item.weight}</td>
        </tr>
      `;
    })
    .join("");

  const mistakes = scenario.mistakes.map((item) => `<li>${escapeReportHtml(item)}</li>`).join("");
  const successMeasures = scenario.successMeasures.map((item) => `<li>${escapeReportHtml(item)}</li>`).join("");
  const dataNeeded = scenario.dataNeeded.map((item) => `<li>${escapeReportHtml(item)}</li>`).join("");

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>تقرير المحاكاة - ${safeScenarioId}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #eef2ff;
      color: #0f172a;
      font-family: Tahoma, Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .deck { display: grid; gap: 18px; padding: 18px; }
    .slide {
      min-height: 690px;
      border-radius: 30px;
      padding: 34px;
      background: #fff;
      border: 1px solid #dbe4ff;
      box-shadow: 0 18px 55px rgba(15,23,42,.12);
      page-break-after: always;
      overflow: hidden;
      position: relative;
    }
    .slide.dark {
      color: white;
      background:
        radial-gradient(circle at 20% 15%, rgba(245,158,11,.28), transparent 34%),
        linear-gradient(135deg, #0f172a, #1e293b 60%, #111827);
      border: 0;
    }
    .kicker {
      display: inline-flex;
      padding: 8px 14px;
      border-radius: 999px;
      background: #eef2ff;
      color: #3730a3;
      font-size: 13px;
      font-weight: 900;
      margin-bottom: 18px;
    }
    .dark .kicker { background: rgba(255,255,255,.12); color: #fde68a; }
    h1, h2, h3 { margin: 0; font-weight: 950; line-height: 1.35; }
    h1 { font-size: 46px; max-width: 880px; }
    h2 { font-size: 34px; margin-bottom: 18px; }
    h3 { font-size: 22px; margin-bottom: 10px; }
    p { margin: 0; line-height: 1.9; font-size: 17px; font-weight: 650; color: #334155; }
    .dark p { color: #dbeafe; }
    .score {
      width: 156px;
      height: 156px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      text-align: center;
      background: conic-gradient(#10b981 0 ${score}%, rgba(255,255,255,.18) ${score}% 100%);
      box-shadow: 0 22px 70px rgba(16,185,129,.22);
      margin-top: 26px;
    }
    .score > div {
      width: 118px;
      height: 118px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: #0f172a;
    }
    .score strong { display: block; color: white; font-size: 36px; line-height: 1; }
    .score span { display: block; margin-top: 6px; color: #cbd5e1; font-size: 12px; font-weight: 800; }
    .meta {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-top: 26px;
    }
    .box {
      border-radius: 22px;
      padding: 18px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .dark .box { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.12); }
    .box b { display: block; margin-bottom: 8px; color: #4f46e5; font-size: 13px; }
    .dark .box b { color: #fde68a; }
    .box span { font-size: 15px; line-height: 1.8; font-weight: 750; }
    table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 18px; font-size: 13px; }
    th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; vertical-align: top; line-height: 1.7; }
    th { color: #312e81; background: #eef2ff; font-weight: 950; }
    tr:nth-child(even) td { background: #f8fafc; }
    .good { color: #047857; font-weight: 950; }
    .watch { color: #b45309; font-weight: 950; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    ul { margin: 0; padding: 0 22px 0 0; }
    li { margin: 0 0 10px; color: #334155; line-height: 1.8; font-weight: 700; }
    .footer {
      position: absolute;
      bottom: 20px;
      left: 34px;
      right: 34px;
      display: flex;
      justify-content: space-between;
      gap: 20px;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 800;
    }
    @media print {
      body { background: white; }
      .deck { padding: 0; gap: 0; }
      .slide { box-shadow: none; border-radius: 0; min-height: auto; height: calc(100vh - 24mm); }
    }
  </style>
</head>
<body>
  <main class="deck">
    <section class="slide dark">
      <span class="kicker">تقرير محاكاة استشارية</span>
      <h1>${safeScenarioTitle}</h1>
      <p style="margin-top:18px;max-width:880px;">${safeSituation}</p>
      <div class="score"><div><strong>${score}%</strong><span>${safeGrade}</span></div></div>
      <div class="meta">
        <div class="box"><b>رقم الحالة</b><span>${safeScenarioId}</span></div>
        <div class="box"><b>الصعوبة</b><span>${escapeReportHtml(scenario.level.name)}</span></div>
        <div class="box"><b>المرجع</b><span>${safeReference}</span></div>
      </div>
      <div class="footer"><span>OD Engineering Simulation</span><span>صنع بواسطة ريان العجلان</span></div>
    </section>

    <section class="slide">
      <span class="kicker">قراءة الحالة</span>
      <h2>التعقيد والمخاطر المهنية</h2>
      <div class="grid">
        <div class="box"><h3>تعقيد الحالة</h3><p>${safeComplexity}</p></div>
        <div class="box"><h3>الخطر الأخلاقي</h3><p>${safeEthicalRisk}</p></div>
      </div>
      <div class="box" style="margin-top:16px;"><h3>البيانات التي تستحق الانتباه</h3><ul>${dataNeeded}</ul></div>
      <div class="footer"><span>${safeScenarioId}</span><span>قراءة تشخيصية قبل التوصية</span></div>
    </section>

    <section class="slide">
      <span class="kicker">سجل القرار</span>
      <h2>اختيارات المتدرب والتصحيح المهني</h2>
      <table>
        <thead>
          <tr>
            <th>المحور</th>
            <th>اختيار المتدرب</th>
            <th>الأفضل مهنيًا</th>
            <th>التقييم</th>
            <th>الدرجة</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="footer"><span>${score}% · ${safeGrade}</span><span>تقرير المحاولة</span></div>
    </section>

    <section class="slide">
      <span class="kicker">التعلم من المحاولة</span>
      <h2>ما الذي يجب تجنبه؟ وما علامات النجاح؟</h2>
      <div class="grid">
        <div class="box"><h3>أخطاء يجب تجنبها</h3><ul>${mistakes}</ul></div>
        <div class="box"><h3>علامات النجاح</h3><ul>${successMeasures}</ul></div>
      </div>
      <div class="box" style="margin-top:16px;"><h3>ملاحظات المستشار</h3><p>${safeNotes}</p></div>
      <div class="footer"><span>تأملات ما بعد القرار</span><span>© 2026</span></div>
    </section>
  </main>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 500);
    });
  </script>
</body>
</html>`;
}

function openPresentationPdfReport({ scenario, answers, score, notes, breakdown }) {
  const html = buildPresentationReportHTML({ scenario, answers, score, notes, breakdown });
  const reportWindow = window.open("", "_blank", "width=1200,height=900");

  if (!reportWindow) {
    window.alert("لم يتم فتح نافذة التقرير. اسمح بالنوافذ المنبثقة ثم حاول مرة أخرى.");
    return;
  }

  reportWindow.document.open();
  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.focus();
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function Pill({ children }) {
  return <span className="od-pill">{children}</span>;
}

function DataPill({ children }) {
  return <span className="od-data-pill">{children}</span>;
}

function NavButton({ active, onClick, children }) {
  return (
    <button type="button" className={`nav-btn ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function PanelButton({ active, onClick, children }) {
  return (
    <button type="button" className={`panel-btn ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function MiniBar({ label, value, color }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="mini-bar">
      <div className="mini-bar-top">
        <span>{label}</span>
        <b>{safeValue}%</b>
      </div>
      <div className="mini-bar-track">
        <i style={{ width: `${safeValue}%`, background: color }} />
      </div>
    </div>
  );
}

function MasteryCard({ title, value, subtitle, color }) {
  return (
    <div className="mastery-card" style={{ "--accent": color }}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{subtitle}</p>
    </div>
  );
}

function ScenarioMap({ scenario }) {
  const nodes = [
    { label: "العرض", text: scenario.trigger, color: "#f59e0b" },
    { label: "النمط", text: scenario.hiddenDynamic, color: scenario.archetype.color },
    { label: "الضغط", text: scenario.pressure, color: "#e11d48" },
    { label: "المخرج", text: scenario.deliverable, color: "#10b981" }
  ];

  return (
    <div className="scenario-map">
      {nodes.map((node, index) => (
        <div className="scenario-node" key={node.label} style={{ "--node": node.color }}>
          <b>{index + 1}</b>
          <span>{node.label}</span>
          <p>{node.text}</p>
        </div>
      ))}
    </div>
  );
}

function CausalLoop({ scenario }) {
  return (
    <div className="causal-loop">
      <svg viewBox="0 0 680 310" role="img" aria-label="خريطة سببية">
        <defs>
          <marker id="arrowHeadArabic" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="currentColor" />
          </marker>
        </defs>

        <path d="M150 85 C260 20, 415 20, 530 85" />
        <path d="M540 98 C630 165, 490 265, 340 225" />
        <path d="M330 225 C205 262, 78 190, 138 102" />
        <path d="M155 105 C235 165, 420 165, 520 108" className="dashed" />

        <circle cx="145" cy="88" r="52" />
        <circle cx="540" cy="88" r="52" />
        <circle cx="340" cy="225" r="52" />

        <text x="145" y="74">حدث</text>
        <text x="145" y="98">{scenario.trigger.slice(0, 16)}</text>

        <text x="540" y="74">بنية</text>
        <text x="540" y="98">{scenario.archetype.name.slice(0, 16)}</text>

        <text x="340" y="211">نتيجة</text>
        <text x="340" y="235">تكرار النمط</text>
      </svg>
    </div>
  );
}

function ChoiceStep({ question, options, correct, selected, locked, onSelect }) {
  const letters = ["أ", "ب", "ج", "د"];

  return (
    <div className="decision-card">
      <div className="decision-top">
        <div>
          <span className="od-kicker">قرار استشاري</span>
          <h2>{question.title}</h2>
          <p>{question.hint}</p>
        </div>
        <div className="points-badge">{question.weight} نقطة</div>
      </div>

      <div className="choice-list">
        {options.map((option, index) => {
          const isSelected = selected === option;
          const isCorrect = locked && option === correct;
          const isWrong = locked && isSelected && option !== correct;

          return (
            <button
              key={option}
              type="button"
              className={`choice ${isSelected ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
              onClick={() => onSelect(option)}
            >
              <span className="choice-letter">{letters[index]}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Simulation() {
  const scenarioBank = useMemo(() => buildScenarioBank(), []);

  const [activeView, setActiveView] = useState("home");
  const [casePanel, setCasePanel] = useState("summary");
  const [decisionStep, setDecisionStep] = useState(0);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [currentId, setCurrentId] = useState(scenarioBank[0].id);
  const [answers, setAnswers] = useState({});
  const [locked, setLocked] = useState(false);

  const [progress, setProgress] = useState(() =>
    safeReadJSON(STORAGE_KEY, {
      attempts: 0,
      bestScore: 0,
      completed: [],
      history: [],
      categoryScores: {}
    })
  );

  const [notes, setNotes] = useState(() => safeReadJSON(NOTES_KEY, {}));
  const [baseSeconds] = useState(() => safeReadNumber(TIME_KEY, 0));
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const totalSeconds = baseSeconds + sessionSeconds;

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setSessionSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    safeWriteNumber(TIME_KEY, totalSeconds);
  }, [totalSeconds]);

  const scenario = useMemo(() => {
    return scenarioBank.find((item) => item.id === currentId) || scenarioBank[0];
  }, [scenarioBank, currentId]);

  const filtered = useMemo(() => {
    return scenarioBank.filter((item) => {
      const q = query.trim();
      const matchesQuery =
        !q ||
        item.title.includes(q) ||
        item.industry.includes(q) ||
        item.trigger.includes(q) ||
        item.archetype.name.includes(q) ||
        item.level.name.includes(q) ||
        item.reference.title.includes(q);

      const matchesCategory = category === "all" || item.category === category;
      const matchesLevel = level === "all" || item.level.id === level;

      return matchesQuery && matchesCategory && matchesLevel;
    });
  }, [scenarioBank, query, category, level]);

  const categoryStats = useMemo(() => {
    return ARCHETYPES.map((type) => ({
      ...type,
      count: scenarioBank.filter((item) => item.category === type.id).length,
      completed: (progress.completed || []).filter((id) => {
        const sc = scenarioBank.find((item) => item.id === id);
        return sc?.category === type.id;
      }).length
    }));
  }, [scenarioBank, progress.completed]);

  const levelStats = useMemo(() => {
    return DIFFICULTY_LEVELS.map((item) => ({
      ...item,
      count: scenarioBank.filter((scenarioItem) => scenarioItem.level.id === item.id).length
    }));
  }, [scenarioBank]);

  const choiceSets = useMemo(() => {
    return {
      frame: uniqueOptions(scenario.correct.frame, WRONG_FRAMES, `${scenario.id}-تأطير`),
      hypothesis: uniqueOptions(scenario.correct.hypothesis, WRONG_HYPOTHESES, `${scenario.id}-فرضية`),
      data: uniqueOptions(scenario.correct.data, WRONG_DATA, `${scenario.id}-بيانات`),
      intervention: uniqueOptions(scenario.correct.intervention, WRONG_INTERVENTIONS, `${scenario.id}-تدخل`),
      metric: uniqueOptions(scenario.correct.metric, WRONG_METRICS, `${scenario.id}-قياس`),
      ethic: uniqueOptions(scenario.correct.ethic, WRONG_ETHICS, `${scenario.id}-أخلاقيات`)
    };
  }, [scenario]);

  const breakdown = useMemo(() => getScoreBreakdown(answers, scenario), [answers, scenario]);
  const score = useMemo(() => getTotalScore(answers, scenario), [answers, scenario]);
  const completed = breakdown.every((item) => Boolean(answers[item.key]));
  const currentNotes = notes[scenario.id] || "";

  const completedCount = progress.completed?.length || 0;
  const completionRate = Math.round((completedCount / scenarioBank.length) * 100);

  const avgScore =
    progress.history && progress.history.length > 0
      ? Math.round(progress.history.reduce((sum, item) => sum + item.score, 0) / progress.history.length)
      : 0;

  const masteryByCategory = useMemo(() => {
    return categoryStats
      .map((item) => ({
        name: item.name,
        value: item.count ? Math.round((item.completed / item.count) * 100) : 0,
        color: item.color
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [categoryStats]);

  const currentQuestion = QUESTION_FLOW[decisionStep];
  const currentOptions = choiceSets[currentQuestion.key];

  function openScenario(id) {
    setCurrentId(id);
    setAnswers({});
    setLocked(false);
    setDecisionStep(0);
    setCasePanel("summary");
    setActiveView("case");
  }

  function randomScenario() {
    const pool = filtered.length ? filtered : scenarioBank;
    const index = Math.floor(Math.random() * pool.length);
    openScenario(pool[index].id);
  }

  function answerQuestion(key, value) {
    if (locked) return;
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function nextQuestion() {
    setDecisionStep((prev) => Math.min(QUESTION_FLOW.length - 1, prev + 1));
  }

  function previousQuestion() {
    setDecisionStep((prev) => Math.max(0, prev - 1));
  }

  function submitAttempt() {
    if (!completed) return;

    const scoreNow = getTotalScore(answers, scenario);
    const nextCompleted = Array.from(new Set([...(progress.completed || []), scenario.id]));

    const nextHistory = [
      ...(progress.history || []),
      {
        id: scenario.id,
        title: scenario.title,
        category: scenario.category,
        level: scenario.level.id,
        score: scoreNow,
        date: new Date().toISOString()
      }
    ].slice(-80);

    const previousCategory = progress.categoryScores?.[scenario.category] || [];
    const nextCategoryScores = {
      ...(progress.categoryScores || {}),
      [scenario.category]: [...previousCategory, scoreNow].slice(-20)
    };

    const next = {
      attempts: (progress.attempts || 0) + 1,
      bestScore: Math.max(progress.bestScore || 0, scoreNow),
      completed: nextCompleted,
      history: nextHistory,
      categoryScores: nextCategoryScores
    };

    setLocked(true);
    setProgress(next);
    safeWriteJSON(STORAGE_KEY, next);
    setActiveView("debrief");
  }

  function resetAttempt() {
    setAnswers({});
    setLocked(false);
    setDecisionStep(0);
    setActiveView("decision");
  }

  function updateNotes(value) {
    const next = { ...notes, [scenario.id]: value };
    setNotes(next);
    safeWriteJSON(NOTES_KEY, next);
  }

  function downloadBrief() {
    openPresentationPdfReport({
      scenario,
      answers,
      score,
      notes: currentNotes,
      breakdown
    });
  }

  function clearProgress() {
    const next = { attempts: 0, bestScore: 0, completed: [], history: [], categoryScores: {} };
    setProgress(next);
    safeWriteJSON(STORAGE_KEY, next);
  }

  return (
    <section className="sim-root" dir="rtl">
      <style>{`
        .sim-root {
          min-height: 100vh;
          padding: 26px 14px 80px;
          color: #0f172a;
          background:
            radial-gradient(circle at 8% 10%, rgba(79,70,229,.18), transparent 28%),
            radial-gradient(circle at 92% 12%, rgba(245,158,11,.16), transparent 28%),
            radial-gradient(circle at 50% 98%, rgba(16,185,129,.13), transparent 34%),
            linear-gradient(135deg, #f8fafc, #eef2ff 55%, #fff7ed);
          font-family: inherit;
        }

        .sim-wrap {
          width: min(1320px, 100%);
          margin: 0 auto;
        }

        .hero {
          position: relative;
          overflow: hidden;
          border-radius: 44px;
          padding: 34px;
          color: white;
          background:
            radial-gradient(circle at 18% 20%, rgba(129,140,248,.30), transparent 32%),
            radial-gradient(circle at 85% 5%, rgba(16,185,129,.18), transparent 28%),
            radial-gradient(circle at 60% 90%, rgba(245,158,11,.12), transparent 30%),
            linear-gradient(145deg, #0f172a, #1e1b4b 55%, #312e81);
          box-shadow: 0 30px 90px rgba(15,23,42,.22);
        }

        .hero::before {
          content: "";
          position: absolute;
          inset: -70px;
          background-image:
            linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 54px 54px;
          transform: rotate(-8deg);
          opacity: .40;
        }

        .hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.08fr .92fr;
          gap: 28px;
          align-items: center;
        }

        .kicker,
        .od-kicker {
          display: inline-flex;
          width: fit-content;
          padding: 8px 13px;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.16);
          color: #e0e7ff;
          font-size: 11px;
          font-weight: 950;
        }

        .hero h1 {
          margin: 18px 0 12px;
          font-size: clamp(34px, 6vw, 74px);
          line-height: 1.05;
          letter-spacing: -2px;
          font-weight: 950;
        }

        .hero h1 span {
          display: block;
          color: transparent;
          background: linear-gradient(90deg, #fff, #c7d2fe, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .hero p {
          margin: 0;
          max-width: 780px;
          color: rgba(226,232,240,.9);
          font-size: 15px;
          line-height: 2;
          font-weight: 750;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
        }

        .btn {
          cursor: pointer;
          border: 0;
          border-radius: 18px;
          padding: 13px 18px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          transition: .22s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
        }

        .btn.primary {
          color: white;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 16px 35px rgba(79,70,229,.35);
        }

        .btn.success {
          color: white;
          background: linear-gradient(135deg, #059669, #10b981);
          box-shadow: 0 16px 35px rgba(16,185,129,.25);
        }

        .btn.light {
          color: #0f172a;
          background: rgba(255,255,255,.92);
        }

        .btn.dark {
          color: white;
          background: #0f172a;
        }

        .btn.ghost {
          color: #334155;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(148,163,184,.24);
        }

        .btn.danger {
          color: #991b1b;
          background: #fee2e2;
        }

        .btn:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .hero-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .hero-metric {
          padding: 18px;
          border-radius: 28px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(14px);
        }

        .hero-metric span {
          display: block;
          color: rgba(226,232,240,.72);
          font-size: 11px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .hero-metric strong {
          display: block;
          color: white;
          font-size: 34px;
          line-height: 1;
          font-weight: 950;
        }

        .nav {
          margin: 18px 0;
          padding: 10px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          border-radius: 26px;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 12px 35px rgba(15,23,42,.06);
          backdrop-filter: blur(16px);
        }

        .nav-btn,
        .panel-btn {
          border: 0;
          cursor: pointer;
          padding: 11px 14px;
          border-radius: 999px;
          font-family: inherit;
          font-weight: 950;
          font-size: 11px;
          color: #475569;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.16);
          transition: .2s ease;
        }

        .nav-btn.active,
        .panel-btn.active {
          color: white;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-color: transparent;
        }

        .page {
          border-radius: 34px;
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(255,255,255,.94);
          box-shadow: 0 18px 55px rgba(15,23,42,.08);
          backdrop-filter: blur(18px);
          padding: 22px;
          overflow: hidden;
        }

        .page-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .page-head h2 {
          margin: 0;
          color: #0f172a;
          font-size: clamp(26px, 4vw, 46px);
          line-height: 1.2;
          font-weight: 950;
          letter-spacing: -.8px;
        }

        .page-head p {
          margin: 10px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.9;
          font-weight: 750;
        }

        .od-kicker {
          background: rgba(79,70,229,.10);
          color: #3730a3;
          border-color: rgba(79,70,229,.12);
          margin-bottom: 12px;
        }

        .home-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .home-card {
          cursor: pointer;
          border: 0;
          text-align: right;
          font-family: inherit;
          min-height: 210px;
          border-radius: 30px;
          padding: 20px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.16);
          box-shadow: 0 14px 35px rgba(15,23,42,.06);
          transition: .22s ease;
          position: relative;
          overflow: hidden;
        }

        .home-card::before {
          content: "";
          position: absolute;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          left: -68px;
          bottom: -88px;
          background: var(--accent);
          opacity: .13;
        }

        .home-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 22px 45px rgba(15,23,42,.11);
        }

        .home-card b {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 17px;
          color: white;
          background: var(--accent);
          font-size: 18px;
          margin-bottom: 14px;
        }

        .home-card strong {
          display: block;
          font-size: 18px;
          font-weight: 950;
          color: #0f172a;
          margin-bottom: 10px;
        }

        .home-card span {
          display: block;
          font-size: 12px;
          line-height: 1.8;
          color: #64748b;
          font-weight: 750;
        }

        .pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .od-pill,
        .od-data-pill {
          display: inline-flex;
          width: fit-content;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 950;
          line-height: 1.3;
        }

        .od-pill {
          background: rgba(79,70,229,.1);
          color: #3730a3;
        }

        .od-data-pill {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid rgba(148,163,184,.16);
        }

        .score-orb {
          flex: 0 0 138px;
          height: 138px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          text-align: center;
          color: white;
          background:
            radial-gradient(circle at center, #0f172a 0 58%, transparent 59%),
            conic-gradient(#10b981 0 var(--score), rgba(148,163,184,.22) var(--score) 100%);
          box-shadow: 0 20px 45px rgba(15,23,42,.16);
        }

        .score-orb strong {
          display: block;
          font-size: 31px;
          line-height: 1;
          font-weight: 950;
        }

        .score-orb span {
          display: block;
          margin-top: 6px;
          color: rgba(226,232,240,.78);
          font-size: 10px;
          font-weight: 950;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 14px;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 14px;
        }

        .card {
          padding: 18px;
          border-radius: 28px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.16);
        }

        .card h3 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: 18px;
          font-weight: 950;
        }

        .card p,
        .card li {
          color: #64748b;
          font-size: 13px;
          line-height: 1.9;
          font-weight: 750;
        }

        .card ul {
          margin: 0;
          padding: 0 18px 0 0;
        }

        .panel-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }

        .scenario-map {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .scenario-node {
          position: relative;
          overflow: hidden;
          min-height: 160px;
          border-radius: 26px;
          padding: 16px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.16);
        }

        .scenario-node::before {
          content: "";
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          left: -58px;
          bottom: -75px;
          background: var(--node);
          opacity: .12;
        }

        .scenario-node b {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: white;
          background: var(--node);
          font-size: 14px;
          font-weight: 950;
          margin-bottom: 12px;
        }

        .scenario-node span {
          display: block;
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .scenario-node p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 750;
        }

        .causal-loop {
          border-radius: 28px;
          background:
            radial-gradient(circle at 50% 50%, rgba(79,70,229,.08), transparent 58%),
            #f8fafc;
          border: 1px solid rgba(148,163,184,.16);
          padding: 12px;
        }

        .causal-loop svg {
          width: 100%;
          height: auto;
          color: #4f46e5;
        }

        .causal-loop path {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          marker-end: url(#arrowHeadArabic);
          opacity: .62;
        }

        .causal-loop path.dashed {
          stroke-dasharray: 8 8;
          opacity: .35;
        }

        .causal-loop circle {
          fill: white;
          stroke: #c7d2fe;
          stroke-width: 3;
        }

        .causal-loop text {
          text-anchor: middle;
          font-size: 12px;
          font-weight: 900;
          fill: #0f172a;
        }

        .decision-shell {
          border-radius: 34px;
          padding: 18px;
          background:
            radial-gradient(circle at 12% 10%, rgba(79,70,229,.30), transparent 32%),
            radial-gradient(circle at 88% 0%, rgba(16,185,129,.20), transparent 30%),
            #0f172a;
          color: white;
        }

        .decision-progress {
          height: 10px;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          overflow: hidden;
          margin-bottom: 14px;
        }

        .decision-progress i {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #10b981, #a7f3d0);
        }

        .decision-card {
          padding: 20px;
          border-radius: 28px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
        }

        .decision-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .decision-top h2 {
          margin: 0;
          font-size: clamp(24px, 4vw, 40px);
          font-weight: 950;
        }

        .decision-top p {
          margin: 8px 0 0;
          color: rgba(226,232,240,.78);
          line-height: 1.8;
          font-size: 13px;
          font-weight: 750;
        }

        .points-badge {
          padding: 12px 14px;
          border-radius: 18px;
          background: rgba(253,230,138,.16);
          color: #fde68a;
          font-weight: 950;
          font-size: 12px;
          white-space: nowrap;
        }

        .choice-list {
          display: grid;
          gap: 10px;
        }

        .choice {
          cursor: pointer;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.88);
          border-radius: 18px;
          padding: 13px;
          font-family: inherit;
          text-align: right;
          line-height: 1.7;
          font-size: 12px;
          font-weight: 850;
          transition: .2s ease;
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 10px;
          align-items: start;
        }

        .choice:hover {
          background: rgba(255,255,255,.13);
        }

        .choice-letter {
          width: 26px;
          height: 26px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.12);
          color: white;
          font-weight: 950;
        }

        .choice.selected {
          border-color: rgba(129,140,248,.9);
          background: rgba(129,140,248,.18);
        }

        .choice.correct {
          background: rgba(16,185,129,.18);
          border-color: rgba(16,185,129,.7);
        }

        .choice.wrong {
          background: rgba(239,68,68,.16);
          border-color: rgba(239,68,68,.62);
        }

        .feedback-panel {
          padding: 18px;
          border-radius: 32px;
          background:
            radial-gradient(circle at 10% 20%, rgba(16,185,129,.14), transparent 32%),
            #fff;
          border: 1px solid rgba(148,163,184,.16);
        }

        .breakdown-list {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }

        .breakdown {
          padding: 12px;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.16);
        }

        .breakdown-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          margin-bottom: 6px;
        }

        .breakdown-top b {
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
        }

        .breakdown-top span {
          color: #475569;
          font-size: 11px;
          font-weight: 950;
        }

        .breakdown p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 750;
        }

        .field {
          display: grid;
          gap: 8px;
          margin-bottom: 12px;
        }

        .field label {
          color: #475569;
          font-size: 11px;
          font-weight: 950;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(148,163,184,.24);
          background: #f8fafc;
          border-radius: 16px;
          padding: 12px;
          font-family: inherit;
          color: #0f172a;
          font-weight: 850;
          outline: none;
        }

        .field textarea {
          min-height: 220px;
          resize: vertical;
          line-height: 1.8;
        }

        .filters {
          display: grid;
          grid-template-columns: 1.4fr .8fr .8fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .scenario-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .scenario-mini {
          cursor: pointer;
          border: 0;
          text-align: right;
          font-family: inherit;
          padding: 14px;
          min-height: 146px;
          border-radius: 22px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.16);
          transition: .2s ease;
        }

        .scenario-mini:hover,
        .scenario-mini.active {
          transform: translateY(-3px);
          border-color: rgba(79,70,229,.26);
          box-shadow: 0 14px 32px rgba(15,23,42,.08);
        }

        .scenario-mini span {
          color: #64748b;
          font-size: 10px;
          font-weight: 950;
        }

        .scenario-mini strong {
          display: block;
          margin: 7px 0;
          color: #0f172a;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 950;
        }

        .scenario-mini small {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 850;
          line-height: 1.6;
        }

        .mastery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 14px;
        }

        .mastery-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 16px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.16);
        }

        .mastery-card::before {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          left: -50px;
          bottom: -68px;
          background: var(--accent);
          opacity: .12;
        }

        .mastery-card span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .mastery-card strong {
          display: block;
          color: #0f172a;
          font-size: 30px;
          font-weight: 950;
          line-height: 1;
        }

        .mastery-card p {
          margin: 8px 0 0;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 850;
        }

        .mini-bar {
          margin-top: 12px;
        }

        .mini-bar-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 7px;
        }

        .mini-bar-top span,
        .mini-bar-top b {
          font-size: 11px;
          font-weight: 950;
        }

        .mini-bar-top span {
          color: #64748b;
        }

        .mini-bar-track {
          height: 9px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .mini-bar-track i {
          display: block;
          height: 100%;
          border-radius: 999px;
        }

        .rubric {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }

        .rubric-item {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 12px;
          align-items: start;
          padding: 12px;
          border-radius: 18px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.16);
        }

        .rubric-item b {
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
        }

        .rubric-item p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 750;
        }

        @media (max-width: 1120px) {
          .hero-inner,
          .home-grid,
          .grid-2,
          .grid-3,
          .filters {
            grid-template-columns: 1fr;
          }

          .scenario-map,
          .scenario-list,
          .mastery-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 720px) {
          .sim-root {
            padding: 14px 8px 48px;
          }

          .hero {
            border-radius: 30px;
            padding: 24px;
          }

          .hero-metrics,
          .scenario-map,
          .scenario-list,
          .mastery-grid {
            grid-template-columns: 1fr;
          }

          .page-head,
          .decision-top {
            display: grid;
          }

          .score-orb {
            width: 138px;
            justify-self: start;
          }

          .rubric-item {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="sim-wrap">
        <header className="hero">
          <div className="hero-inner">
            <div>
              <span className="kicker">مختبر المحاكاة الاستشارية · 350 حالة · قرارات متغيرة</span>
              <h1>
                اختبر حكمك الاستشاري
                <span>لا حفظك للمصطلحات</span>
              </h1>
              <p>
                واجهة تدريبية تحاكي عمل ممارس التطوير التنظيمي: تقرأ الحالة، تبني فرضية، تختار البيانات، تصمم تدخلًا، تقيس الأثر، وتحمي أخلاقيات العلاقة الاستشارية.
              </p>

              <div className="actions">
                <button className="btn primary" type="button" onClick={randomScenario}>
                  ولّد سيناريو عشوائي
                </button>
                <button className="btn light" type="button" onClick={() => setActiveView("library")}>
                  استكشف الحالات
                </button>
              </div>
            </div>

            <div className="hero-metrics">
              <div className="hero-metric">
                <span>عدد الحالات</span>
                <strong>{scenarioBank.length}</strong>
              </div>
              <div className="hero-metric">
                <span>وقت التعلم</span>
                <strong>{formatTime(totalSeconds)}</strong>
              </div>
              <div className="hero-metric">
                <span>أفضل درجة</span>
                <strong>{progress.bestScore || 0}%</strong>
              </div>
              <div className="hero-metric">
                <span>نسبة الإنجاز</span>
                <strong>{completionRate}%</strong>
              </div>
            </div>
          </div>
        </header>

        <nav className="nav">
          <NavButton active={activeView === "home"} onClick={() => setActiveView("home")}>الواجهة</NavButton>
          <NavButton active={activeView === "case"} onClick={() => setActiveView("case")}>ملف الحالة</NavButton>
          <NavButton active={activeView === "decision"} onClick={() => setActiveView("decision")}>غرفة القرار</NavButton>
          <NavButton active={activeView === "debrief"} onClick={() => setActiveView("debrief")}>التغذية الراجعة</NavButton>
          <NavButton active={activeView === "notes"} onClick={() => setActiveView("notes")}>ملاحظاتي</NavButton>
          <NavButton active={activeView === "library"} onClick={() => setActiveView("library")}>استكشف الحالات</NavButton>
          <NavButton active={activeView === "mastery"} onClick={() => setActiveView("mastery")}>الإتقان</NavButton>
        </nav>

        {activeView === "home" && (
          <section className="page">
            <div className="page-head">
              <div>
                <span className="od-kicker">واجهة المختبر</span>
                <h2>اختر مسارك داخل المحاكاة</h2>
                <p>
                  بدل عرض كل شيء تحت بعض، هذا المختبر يعمل كغرف منفصلة. ابدأ من الواجهة، ثم انتقل إلى الحالة، ثم القرار، ثم التغذية الراجعة.
                </p>
              </div>
            </div>

            <div className="home-grid">
              <button className="home-card" style={{ "--accent": "#4f46e5" }} type="button" onClick={randomScenario}>
                <b>1</b>
                <strong>ابدأ حالة جديدة</strong>
                <span>يولد لك المختبر سيناريو تدريبيًا عشوائيًا من 350 حالة.</span>
              </button>

              <button className="home-card" style={{ "--accent": "#10b981" }} type="button" onClick={() => setActiveView("case")}>
                <b>2</b>
                <strong>ادخل ملف الحالة</strong>
                <span>اقرأ الملخص والخريطة والبيانات والمخاطر دون تشتيت.</span>
              </button>

              <button className="home-card" style={{ "--accent": "#f59e0b" }} type="button" onClick={() => setActiveView("decision")}>
                <b>3</b>
                <strong>افتح غرفة القرار</strong>
                <span>أجب سؤالًا وراء سؤال مثل مستشار يعمل تحت ضغط.</span>
              </button>

              <button className="home-card" style={{ "--accent": "#e11d48" }} type="button" onClick={() => setActiveView("library")}>
                <b>4</b>
                <strong>استكشف الحالات</strong>
                <span>ابحث وفلتر حسب المجال والصعوبة واختر الحالة المناسبة.</span>
              </button>
            </div>
          </section>
        )}

        {activeView === "case" && (
          <section className="page">
            <div className="page-head">
              <div>
                <span className="od-kicker">{scenario.id} · {scenario.level.name}</span>
                <h2>{scenario.title}</h2>
                <p>{scenario.situation}</p>
                <div className="pills">
                  <Pill>{scenario.industry}</Pill>
                  <Pill>{scenario.size}</Pill>
                  <Pill>{scenario.archetype.lens}</Pill>
                  <Pill>{scenario.reference.title}: {scenario.reference.label}</Pill>
                </div>
              </div>

              <div className="score-orb" style={{ "--score": `${score}%` }}>
                <div>
                  <strong>{score}%</strong>
                  <span>{getGrade(score)}</span>
                </div>
              </div>
            </div>

            <div className="panel-tabs">
              <PanelButton active={casePanel === "summary"} onClick={() => setCasePanel("summary")}>ملخص الحالة</PanelButton>
              <PanelButton active={casePanel === "map"} onClick={() => setCasePanel("map")}>الخريطة السببية</PanelButton>
              <PanelButton active={casePanel === "data"} onClick={() => setCasePanel("data")}>البيانات والمخاطر</PanelButton>
              <PanelButton active={casePanel === "people"} onClick={() => setCasePanel("people")}>أصحاب المصلحة</PanelButton>
            </div>

            {casePanel === "summary" && (
              <div className="grid-2">
                <div className="card">
                  <h3>تعقيد الحالة</h3>
                  <p>{scenario.complexityNote}</p>
                  <p><strong>الالتواء المهني:</strong> {scenario.level.twist}</p>
                </div>

                <div className="card">
                  <h3>سؤال القيادة</h3>
                  <p>{scenario.boardQuestion}</p>
                </div>
              </div>
            )}

            {casePanel === "map" && (
              <>
                <ScenarioMap scenario={scenario} />
                <div className="card" style={{ marginTop: 14 }}>
                  <h3>خريطة سببية مبسطة</h3>
                  <CausalLoop scenario={scenario} />
                </div>
              </>
            )}

            {casePanel === "data" && (
              <div className="grid-2">
                <div className="card">
                  <h3>إشارات بيانات أولية</h3>
                  <div className="pills">
                    <DataPill>{scenario.mainSignal}</DataPill>
                    <DataPill>{scenario.secondarySignal}</DataPill>
                    <DataPill>{scenario.thirdSignal}</DataPill>
                    <DataPill>{scenario.fourthSignal}</DataPill>
                  </div>
                </div>

                <div className="card">
                  <h3>الخطر الأخلاقي</h3>
                  <p>{scenario.ethicalRisk}</p>
                </div>
              </div>
            )}

            {casePanel === "people" && (
              <div className="grid-2">
                <div className="card">
                  <h3>أصحاب المصلحة</h3>
                  <ul>
                    {scenario.stakeholders.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h3>المخرج المتوقع</h3>
                  <p>{scenario.deliverable}</p>
                  <p>المخرج ليس وثيقة جميلة فقط، بل قرار تنظيمي قابل للتنفيذ والقياس والاستدامة.</p>
                </div>
              </div>
            )}

            <div className="actions">
              <button className="btn primary" type="button" onClick={() => setActiveView("decision")}>انتقل إلى غرفة القرار</button>
              <button className="btn ghost" type="button" onClick={randomScenario}>حالة أخرى</button>
            </div>
          </section>
        )}

        {activeView === "decision" && (
          <section className="decision-shell">
            <div className="decision-progress">
              <i style={{ width: `${((decisionStep + 1) / QUESTION_FLOW.length) * 100}%` }} />
            </div>

            <ChoiceStep
              question={currentQuestion}
              options={currentOptions}
              correct={scenario.correct[currentQuestion.key]}
              selected={answers[currentQuestion.key]}
              locked={locked}
              onSelect={(value) => answerQuestion(currentQuestion.key, value)}
            />

            <div className="actions">
              <button className="btn light" type="button" onClick={previousQuestion} disabled={decisionStep === 0}>
                السابق
              </button>

              {decisionStep < QUESTION_FLOW.length - 1 && (
                <button className="btn light" type="button" onClick={nextQuestion}>
                  التالي
                </button>
              )}

              {decisionStep === QUESTION_FLOW.length - 1 && (
                <button className="btn success" type="button" disabled={!completed || locked} onClick={submitAttempt}>
                  اعتماد الإجابة وكشف التصحيح
                </button>
              )}

              <button className="btn light" type="button" onClick={resetAttempt}>
                إعادة المحاولة
              </button>
            </div>

            {!completed && (
              <div className="card" style={{ marginTop: 14, background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.12)" }}>
                <p style={{ color: "rgba(255,255,255,.82)" }}>
                  بقيت قرارات غير مكتملة. يجب إكمال السلسلة كاملة: التأطير، الفرضية، البيانات، التدخل، القياس، والأخلاقيات.
                </p>
              </div>
            )}
          </section>
        )}

        {activeView === "debrief" && (
          <section className="page">
            <div className="page-head">
              <div>
                <span className="od-kicker">تقرير التغذية الراجعة</span>
                <h2>{score}% · {getGrade(score)}</h2>
                <p>
                  التصحيح يقيس جودة الحكم الاستشاري: هل فهمت النظام؟ هل اخترت البيانات الصحيحة؟ هل صممت تدخلًا مناسبًا؟ وهل حميت الأخلاقيات؟
                </p>
              </div>

              <div className="score-orb" style={{ "--score": `${score}%` }}>
                <div>
                  <strong>{score}%</strong>
                  <span>نضج القرار</span>
                </div>
              </div>
            </div>

            <div className="breakdown-list">
              {breakdown.map((item) => (
                <div className="breakdown" key={item.key}>
                  <div className="breakdown-top">
                    <b>{item.label}</b>
                    <span>{item.earned}/{item.weight}</span>
                  </div>
                  <p>
                    <strong>اختيارك:</strong> {item.selected || "غير مجاب"}
                  </p>
                  {!item.isCorrect && (
                    <p>
                      <strong>الأفضل مهنيًا:</strong> {item.correct}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid-2">
              <div className="card">
                <h3>أخطاء كان يجب تجنبها</h3>
                <ul>
                  {scenario.mistakes.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div className="card">
                <h3>علامات النجاح في هذه الحالة</h3>
                <ul>
                  {scenario.successMeasures.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h3>المرجع المفاهيمي</h3>
              <p>
                {scenario.reference.title} — {scenario.reference.label}: {scenario.reference.idea}
              </p>
            </div>

            <div className="actions">
              <button className="btn primary" type="button" onClick={downloadBrief} disabled={!locked}>
                تنزيل تقرير PDF
              </button>
              <button className="btn ghost" type="button" onClick={() => setActiveView("decision")}>
                مراجعة الإجابات
              </button>
              <button className="btn ghost" type="button" onClick={randomScenario}>
                حالة جديدة
              </button>
            </div>
          </section>
        )}

        {activeView === "notes" && (
          <section className="page">
            <div className="page-head">
              <div>
                <span className="od-kicker">مذكرة المستشار</span>
                <h2>اكتب تفكيرك قبل الحكم</h2>
                <p>
                  اكتب ملاحظاتك: ما العرض؟ ما النمط؟ ما الفرضيات؟ ما البيانات؟ ما الخطر الأخلاقي؟ وما السلوك الذي يجب قياسه؟
                </p>
              </div>
            </div>

            <div className="field">
              <label>ملاحظاتك على {scenario.id}</label>
              <textarea
                value={currentNotes}
                onChange={(e) => updateNotes(e.target.value)}
                placeholder="مثال: لا أعتقد أن المشكلة تدريبية فقط؛ هناك احتمال أن الصلاحيات والمؤشرات تعيد إنتاج السلوك القديم..."
              />
            </div>

            <div className="grid-2">
              <div className="card">
                <h3>أسئلة تساعدك</h3>
                <ul>
                  <li>ما الذي يجعل السلوك القديم منطقيًا داخل النظام؟</li>
                  <li>من يربح من الوضع الحالي؟ ومن يخسر؟</li>
                  <li>ما البيانات التي لو ظهرت ستغيّر فرضيتي؟</li>
                  <li>كيف أحمي المشاركين من استخدام البيانات ضدهم؟</li>
                  <li>ما السلوك القابل للملاحظة الذي سأقيسه؟</li>
                </ul>
              </div>

              <div className="card">
                <h3>المخرج المتوقع</h3>
                <p>{scenario.deliverable}</p>
                <p>الهدف ليس وثيقة جميلة، بل قرار تنظيمي أفضل قابل للتنفيذ والقياس والاستدامة.</p>
              </div>
            </div>
          </section>
        )}

        {activeView === "library" && (
          <section className="page">
            <div className="page-head">
              <div>
                <span className="od-kicker">استكشاف الحالات</span>
                <h2>{filtered.length} حالة مطابقة</h2>
                <p>
                  اختر المجال والصعوبة أو ابحث بكلمة مفتاحية. عند اختيار حالة ستنتقل مباشرة إلى ملفها المستقل.
                </p>
              </div>
            </div>

            <div className="filters">
              <div className="field">
                <label>البحث</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ثقافة، صلاحيات، أداء، تعلم..."
                />
              </div>

              <div className="field">
                <label>مستوى الصعوبة</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="all">كل المستويات</option>
                  {levelStats.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.count} حالة
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>المجال</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="all">كل المجالات</option>
                  {categoryStats.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="scenario-list">
              {filtered.slice(0, 60).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`scenario-mini ${item.id === scenario.id ? "active" : ""}`}
                  onClick={() => openScenario(item.id)}
                >
                  <span>{item.id} · {item.level.name}</span>
                  <strong>{item.title}</strong>
                  <small>{item.trigger}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeView === "mastery" && (
          <section className="page">
            <div className="page-head">
              <div>
                <span className="od-kicker">لوحة الإتقان</span>
                <h2>هل تتقدم كحافظ أم كممارس؟</h2>
                <p>
                  هذه اللوحة تقرأ رحلتك داخل المختبر: عدد المحاولات، أفضل درجة، متوسط الأداء، المجالات التي مارستها، ووقت التعلم.
                </p>
              </div>
            </div>

            <div className="mastery-grid">
              <MasteryCard title="المحاولات" value={progress.attempts || 0} subtitle="كل محاولة كاملة" color="#4f46e5" />
              <MasteryCard title="أفضل درجة" value={`${progress.bestScore || 0}%`} subtitle="أعلى نضج قرار" color="#10b981" />
              <MasteryCard title="متوسط الأداء" value={`${avgScore}%`} subtitle="آخر المحاولات" color="#f59e0b" />
              <MasteryCard title="وقت التعلم" value={formatTime(totalSeconds)} subtitle="داخل المختبر" color="#e11d48" />
            </div>

            <div className="grid-2">
              <div className="card">
                <h3>أفضل المجالات تدريبًا</h3>
                {masteryByCategory.map((item) => (
                  <MiniBar key={item.name} label={item.name} value={item.value} color={item.color} />
                ))}
              </div>

              <div className="card">
                <h3>معيار الإتقان</h3>
                <div className="rubric">
                  <div className="rubric-item">
                    <b>أقل من 55%</b>
                    <p>توجد سرعة في القفز للحلول أو ضعف في حماية الأخلاقيات أو قياس النشاط بدل الأثر.</p>
                  </div>
                  <div className="rubric-item">
                    <b>55% - 69%</b>
                    <p>يوجد فهم جزئي، لكن القرار ما زال يحتاج ربطًا أوضح بين التشخيص والتدخل والقياس.</p>
                  </div>
                  <div className="rubric-item">
                    <b>70% - 81%</b>
                    <p>قرار جيد، مع فجوات محددة غالبًا في البيانات أو الأخلاقيات أو الاستدامة.</p>
                  </div>
                  <div className="rubric-item">
                    <b>82% - 91%</b>
                    <p>ممارسة ناضجة وقادرة على قراءة النظام وتجنب الحلول السطحية.</p>
                  </div>
                  <div className="rubric-item">
                    <b>92%+</b>
                    <p>حكم استشاري قوي يجمع الفرضية والبيانات والتدخل والقياس والأخلاق.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="actions">
              <button className="btn danger" type="button" onClick={clearProgress}>
                تصفير التقدم
              </button>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}