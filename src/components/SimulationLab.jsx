import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "od_academy_simulation_lab_ultra_v1";
const NOTES_KEY = "od_academy_simulation_notes_ultra_v1";
const TIME_KEY = "od_academy_simulation_learning_seconds_v1";

const REFERENCES = [
  {
    key: "cw",
    title: "Cummings & Worley",
    label: "Organization Development & Change",
    idea: "التشخيص، التعاقد، التدخلات، التغيير المخطط، التقييم، والتثبيت المؤسسي."
  },
  {
    key: "schein",
    title: "Edgar Schein",
    label: "Organizational Culture and Leadership",
    idea: "الثقافة عبر المظاهر، القيم المعلنة، القيم المستخدمة، والافتراضات الأساسية."
  },
  {
    key: "edmondson",
    title: "Amy Edmondson",
    label: "Psychological Safety",
    idea: "الأمان النفسي شرط لرفع الأخطاء والمخاطر والتعلم داخل الفرق."
  },
  {
    key: "senge",
    title: "Peter Senge",
    label: "The Fifth Discipline",
    idea: "التفكير النظمي، النماذج الذهنية، الرؤية المشتركة، وتعلم الفريق."
  },
  {
    key: "hackman",
    title: "Hackman & Oldham",
    label: "Job Characteristics Model",
    idea: "تصميم العمل من خلال المعنى، الاستقلالية، التغذية الراجعة، وهوية المهمة."
  },
  {
    key: "kotter",
    title: "John Kotter",
    label: "Leading Change",
    idea: "الجاهزية، الرؤية، التحالف، الانتصارات السريعة، وترسيخ التغيير."
  },
  {
    key: "anderson",
    title: "Anderson",
    label: "Organization Development",
    idea: "الدخول، التعاقد، علاقة العميل، الأخلاقيات، وإنهاء الارتباط."
  },
  {
    key: "weick",
    title: "Karl Weick",
    label: "Sensemaking",
    idea: "التغيير بوصفه صناعة معنى لا مجرد إرسال رسائل."
  },
  {
    key: "argyris",
    title: "Argyris & Schön",
    label: "Organizational Learning",
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
    scoreLabel: "ممارس OD محترف",
    description: "حالة عالية الغموض، سياسية، ثقافية، وتشغيلية في وقت واحد.",
    twist: "أي تدخل خاطئ قد يزيد فقدان الثقة أو يثبت السلوك القديم."
  }
];

const ARCHETYPES = [
  {
    id: "role-clarity",
    name: "غموض أدوار وصلاحيات",
    color: "#4f46e5",
    lens: "Organization Design / RACI",
    goodFrame: "إعادة صياغة المشكلة كخلل محتمل في حقوق القرار ونقاط التسليم والصلاحيات، لا كضعف التزام فقط.",
    bestHypothesis: "الخلل الأساسي في حقوق القرار ونقاط التسليم، لا في ضعف التزام الأفراد فقط.",
    bestData: "تحليل قرارات وتصعيدات فعلية، مقابلات مع الأطراف، مراجعة أوصاف وظيفية، وملاحظة اجتماع قرار.",
    bestIntervention: "تصميم RACI عملي مع تحديث الأدوار والصلاحيات وربطه باجتماعات القرار.",
    bestMetric: "انخفاض التصعيدات غير الضرورية وزمن حسم القرارات العابرة للإدارات.",
    bestEthic: "حماية البيانات من استخدامها لإدانة مدير محدد، وعرض النتائج كنمط نظامي لا كفشل فردي."
  },
  {
    id: "intergroup-conflict",
    name: "صراع بين إدارات",
    color: "#e11d48",
    lens: "Human Process / Intergroup Relations",
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
    lens: "Culture / Psychological Safety",
    goodFrame: "إعادة صياغة الخوف كمنظومة استجابات قيادية ومكافآت ومعايير تجعل الصمت أكثر أمانًا من الصراحة.",
    bestHypothesis: "إخفاء الأخبار السيئة ناتج عن نظام يعاقب الإنذار المبكر ويكافئ تجميل الواقع.",
    bestData: "مقابلات آمنة، تحليل لحظات الحقيقة، سجل المخاطر، وملاحظة استجابة القيادة للأخبار السيئة.",
    bestIntervention: "تدخل ثقافي سلوكي يغير استجابة القيادة للأخبار السيئة ويؤسس AAR بلا لوم.",
    bestMetric: "ارتفاع المخاطر المرفوعة مبكرًا وانخفاض المفاجآت والأزمات المتأخرة.",
    bestEthic: "عدم وعد المشاركين بسرية مطلقة غير قابلة للحماية، وعرض النتائج مجمعة دون كشف أصحاب الأقوال."
  },
  {
    id: "process-delay",
    name: "تعطل عملية وإعادة عمل",
    color: "#f59e0b",
    lens: "Process Reengineering",
    goodFrame: "إعادة صياغة التأخر كخلل في تدفق العمل والانتظار والقرارات والبيانات، لا ككسل فردي.",
    bestHypothesis: "التأخر ناتج عن تدفق عمل مكسور وموافقات وانتظارات، لا عن بطء فردي فقط.",
    bestData: "رسم As-Is، قياس زمن الدورة، نقاط الانتظار، إعادة العمل، والقرارات الحرجة.",
    bestIntervention: "إعادة تصميم To-Be للخطوات والبوابات والصلاحيات والبيانات المطلوبة.",
    bestMetric: "انخفاض زمن الدورة ونسبة إعادة العمل وارتفاع الاكتمال من أول مرة.",
    bestEthic: "عدم أتمتة عملية مكسورة كما هي، وعدم تحميل الموظفين أخطاء تصميم العملية."
  },
  {
    id: "learning-loop",
    name: "تكرار أخطاء وضعف تعلم",
    color: "#10b981",
    lens: "Organizational Learning",
    goodFrame: "إعادة صياغة تكرار الأخطاء كفشل في تحويل الخبرة إلى ذاكرة تنظيمية وتعديل نظامي.",
    bestHypothesis: "المنظمة تملك خبرات كثيرة لكنها لا تحولها إلى ذاكرة تنظيمية وتعديل نظامي.",
    bestData: "تحليل آخر ثلاث حالات متكررة، مراجعة الدروس الموثقة، مقابلات مع الخبراء، وتتبع هل طُبقت الدروس.",
    bestIntervention: "بناء نظام AAR وقاعدة دروس مطبقة ومجتمع ممارسة ومالك لتطبيق الدروس.",
    bestMetric: "انخفاض تكرار الخطأ نفسه وزيادة الدروس المطبقة لا الموثقة فقط.",
    bestEthic: "توجيه مراجعات التعلم للنظام لا للبحث عن مذنب، وتمييز الخطأ التعلمي من الإهمال المتعمد."
  },
  {
    id: "performance-system",
    name: "نظام أداء شكلي",
    color: "#0ea5e9",
    lens: "Performance Management",
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
    lens: "Change Adoption",
    goodFrame: "إعادة صياغة المشكلة كفجوة بين الإطلاق الرسمي والتبنّي السلوكي في لحظات العمل الحرجة.",
    bestHypothesis: "الإطلاق نجح شكليًا لكن السلوك الجديد لم يدخل في لحظات العمل الحرجة.",
    bestData: "ملاحظة لحظات العمل، بيانات استخدام، مقابلات عن العوائق، وتحليل السلوك القديم العائد.",
    bestIntervention: "خطة تبنّي 30/60/90 مع Pilot وقياس استخدام وجودة استخدام وحوكمة تنفيذ.",
    bestMetric: "استمرار السلوك الجديد بعد 90 يومًا دون دفع يومي من فريق المشروع.",
    bestEthic: "عدم إعلان فشل الموظفين قبل التأكد من أن النظام الجديد مفهوم وممكن ومكافأ."
  },
  {
    id: "job-design",
    name: "تصميم عمل فقير بالمعنى أو الصلاحية",
    color: "#8b5cf6",
    lens: "Work Design",
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
    lens: "Leadership / Symbolic Action",
    goodFrame: "إعادة صياغة المشكلة كفجوة بين الرسائل القيادية والسلوك القيادي عند الضغط.",
    bestHypothesis: "القادة يعلنون قيمة جديدة لكنهم يرسلون إشارات معاكسة في لحظات الضغط.",
    bestData: "تحليل لحظات الحقيقة القيادية، مقابلات، ملاحظة اجتماعات، وربط المكافآت والترقيات بالسلوك.",
    bestIntervention: "Coaching قيادي وتدخل سلوك رمزي مع مؤشرات اتساق القول والفعل.",
    bestMetric: "تحسن الثقة في القيادة وارتفاع السلوكيات المتوافقة مع القيمة المعلنة.",
    bestEthic: "تقديم تغذية راجعة قيادية تحمي الكرامة وتستند إلى سلوكيات لا أحكام شخصية."
  },
  {
    id: "od-dashboard",
    name: "مؤشرات كثيرة بلا رؤى",
    color: "#334155",
    lens: "OD Dashboard",
    goodFrame: "إعادة صياغة المشكلة كضعف في قراءة العلاقات بين المؤشرات لا نقص في الأرقام.",
    bestHypothesis: "المؤشرات تقيس النشاط المنفصل ولا تقرأ العلاقات بين الثقافة والأدوار والأداء.",
    bestData: "جرد المؤشرات الحالية، أسئلة القيادة، مصادر البيانات، وحدود التنبيه والقرارات المرتبطة بكل مؤشر.",
    bestIntervention: "بناء OD Dashboard مع حدود تنبيه وفرضيات وقرارات متابعة لا مجرد أرقام.",
    bestMetric: "قرارات تنظيمية أفضل مبنية على أنماط وعلاقات بين المؤشرات.",
    bestEthic: "عدم استخدام اللوحة كسلاح ضد الفرق، وعدم إخفاء المؤشرات المزعجة عن القيادة."
  },
  {
    id: "merger-integration",
    name: "دمج إدارات أو كيانات",
    color: "#db2777",
    lens: "Integration / Culture Clash",
    goodFrame: "إعادة صياغة التعثر كصدام هويات ومعايير وحقوق قرار بعد الدمج.",
    bestHypothesis: "التعثر ناتج عن صدام هويات ومعايير وحقوق قرار وليس عن رفض التغيير فقط.",
    bestData: "تشخيص الثقافات الفرعية، مقابلات قيادية، تحليل الصلاحيات، ونقاط التعارض بعد الدمج.",
    bestIntervention: "خطة دمج ثقافي وتشغيلي تربط الهوية الجديدة بالأدوار والحوكمة والسلوك.",
    bestMetric: "انخفاض التعارضات المتكررة وتحسن وضوح القرار والثقة بين الفرق المدمجة.",
    bestEthic: "عدم تصوير ثقافة أحد الكيانين كالأفضل مطلقًا، وحماية هوية الأطراف أثناء الدمج."
  },
  {
    id: "talent-capability",
    name: "فجوة قدرات ومواهب",
    color: "#0891b2",
    lens: "Capability / Talent System",
    goodFrame: "إعادة صياغة الفجوة كقدرات استراتيجية وأدوار ومسارات، لا تدريب منفصل فقط.",
    bestHypothesis: "الفجوة ليست تدريبًا فقط؛ بل مرتبطة بتصميم أدوار ومسارات وقدرات مطلوبة للاستراتيجية.",
    bestData: "تحليل القدرات المطلوبة، فجوات الكفاءات، جاهزية المواهب، ومسارات التعاقب.",
    bestIntervention: "بناء نموذج قدرات ومسارات تعلم وتحديث أدوار وتخطيط تعاقب للمناصب الحرجة.",
    bestMetric: "تحسن جاهزية المواهب وانخفاض الاعتماد على أفراد محددين.",
    bestEthic: "عدم وصم الأفراد بعدم الكفاءة قبل توضيح توقعات الدور وفرص التعلم."
  },
  {
    id: "governance-politics",
    name: "حوكمة وسياسة تنظيمية",
    color: "#ea580c",
    lens: "Governance / Power",
    goodFrame: "إعادة صياغة التعطل كغموض في السلطة والمصالح وحقوق القرار، لا كقلة اجتماعات.",
    bestHypothesis: "التعطل ناتج عن مصالح وسلطة غير مصممة بوضوح لا عن نقص اجتماعات فقط.",
    bestData: "تحليل أصحاب المصلحة والقوة، سجل القرارات العالقة، ومراجعة مسارات التصعيد.",
    bestIntervention: "تصميم حوكمة قرار واضحة مع مصفوفة تصعيد وحدود استثناءات وملاك قرارات.",
    bestMetric: "انخفاض القرارات العالقة والاستثناءات غير الموثقة وزمن الحسم.",
    bestEthic: "إظهار ديناميكيات القوة دون فضح الأشخاص أو الدخول في تحالفات تلاعبية."
  },
  {
    id: "digital-adoption",
    name: "تحول رقمي بلا تبنّي",
    color: "#2563eb",
    lens: "Digital Adoption / Sociotechnical",
    goodFrame: "إعادة صياغة ضعف الاستخدام كخلل اجتماعي-تقني بين النظام والعمل والحوافز.",
    bestHypothesis: "النظام التقني أُطلق، لكن تصميم العمل والحوافز والدعم لم تتغير.",
    bestData: "رحلة المستخدم، بيانات جودة الاستخدام، مقابلات المستخدمين، ومراجعة الحوافز والعمليات.",
    bestIntervention: "تصميم تبنّي رقمي اجتماعي-تقني يربط النظام بالعمل والصلاحيات والمكافآت.",
    bestMetric: "ارتفاع جودة الاستخدام لا تسجيل الدخول فقط وانخفاض الرجوع للمسارات القديمة.",
    bestEthic: "عدم مراقبة المستخدمين عقابيًا قبل فهم العوائق التقنية والسلوكية."
  },
  {
    id: "job-description",
    name: "أوصاف وظيفية لا تُستخدم",
    color: "#64748b",
    lens: "Job Description / Role System",
    goodFrame: "إعادة صياغة الوصف الوظيفي كأداة استراتيجية تربط الدور بالأداء والتوظيف والتعلم.",
    bestHypothesis: "الأوصاف موجودة كوثائق لكنها لم تدخل في الأداء والتوظيف والصلاحيات والحوكمة.",
    bestData: "مراجعة عينة أوصاف، مقابلات مديرين، تحليل أهداف الأداء، وإعلانات التوظيف.",
    bestIntervention: "حوكمة أوصاف وظيفية تربط الوصف بالأداء والتوظيف والكفاءات والمراجعة الدورية.",
    bestMetric: "تحسن وضوح الدور وانخفاض تداخل المسؤوليات واستخدام الوصف في قرارات HR.",
    bestEthic: "عدم استخدام الوصف الجديد لمحاسبة الموظف بأثر رجعي قبل التوضيح والتدرج."
  },
  {
    id: "trust-breakdown",
    name: "انهيار ثقة داخل النظام",
    color: "#dc2626",
    lens: "Trust / Organizational Health",
    goodFrame: "إعادة صياغة انخفاض الثقة كنتاج لاتساق القيادة والعدالة والشفافية لا كمزاج عام فقط.",
    bestHypothesis: "انخفاض الثقة مرتبط بتجارب متكررة من عدم الاتساق أو ضعف العدالة أو استخدام البيانات ضد الناس.",
    bestData: "Pulse Survey آمن، مقابلات، تحليل قرارات حساسة، ومراجعة اتساق الرسائل والسلوك.",
    bestIntervention: "خطة استعادة ثقة تركّز على شفافية القرارات، عدالة الإجراءات، وتعهدات قيادية قابلة للقياس.",
    bestMetric: "تحسن الثقة في القيادة واتساق القول والفعل وانخفاض الشائعات.",
    bestEthic: "حماية سرية المشاركين لأن قياس الثقة دون أمان قد ينتج بيانات مزيفة."
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
  ["مدير المشروع", "مدير الإدارة المعنية", "HRBP", "فريق القيادة الوسطى"],
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
  "نتائج Pulse Survey",
  "عينة من الأوصاف الوظيفية",
  "زمن دورة العملية قبل وبعد",
  "تحليل قرارات الترقية والمكافآت",
  "سجل أخطاء متكررة",
  "مراجعة مؤشرات تجربة العميل",
  "تحليل استخدام النظام الرقمي",
  "عينة من محادثات الأداء",
  "سجل الاستثناءات",
  "تحليل قرارات متأخرة",
  "مراجعة نتائج AAR",
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
  "HR تريد إطلاق تدريب سريع قبل التشخيص",
  "مكتب التحول يقيس الإنجاز لا التبني",
  "أحد الأطراف يحاول تحويل المشروع ضد إدارة أخرى",
  "القيادة الوسطى صامتة لكنها غير مقتنعة"
];

const TRAPS = [
  "القفز إلى ورشة تدريب قبل التشخيص",
  "اعتبار المشكلة شخصية بين مديرين فقط",
  "الاكتفاء بإعلان قيم جديدة",
  "تصميم RACI كوثيقة لا كممارسة في الاجتماعات",
  "قياس الحضور بدل السلوك",
  "إهمال القيادة الوسطى",
  "استخدام البيانات لإدانة طرف",
  "إغلاق المشروع قبل نقل الملكية",
  "أتمتة عملية مكسورة كما هي",
  "قبول رواية الراعي كحقيقة نهائية",
  "تجاهل أصحاب المصلحة الأقل قوة",
  "إطلاق Pilot في أسهل مكان فقط",
  "تصميم تدخل ثقيل لا يستطيع النظام حمله",
  "اعتبار انخفاض الأخطاء المعلنة دليلًا على تحسن دون فحص الأمان النفسي"
];

const DELIVERABLES = [
  "Diagnostic Brief",
  "Human Process Intervention Brief",
  "Technostructural Intervention Brief",
  "Culture Diagnostic Brief",
  "Change Implementation & Adoption Plan",
  "OD Dashboard & Insight Brief",
  "Sustainability & Exit Brief",
  "RACI & Role Clarity Pack",
  "Learning System Brief",
  "Culture Change Intervention Brief",
  "Stakeholder & Power Map",
  "OD Impact Measurement Brief",
  "Continuous Capability Brief",
  "Job Description Quality Review",
  "Change Communication & Engagement Plan",
  "Culture Change Intervention Brief",
  "Learning System Brief",
  "Sustainability & Exit Brief"
];

const WRONG_FRAMES = [
  "المشكلة واضحة: الموظفون لا يلتزمون، والحل محاسبة مباشرة.",
  "المطلوب تنفيذ طلب الراعي كما هو دون توسيع التشخيص.",
  "القضية بسيطة ولا تحتاج إلا رسالة توعوية عامة.",
  "المشكلة في ثقافة الناس عمومًا، ولا حاجة لتحديد سلوك محدد.",
  "السبب هو نقص حماس، لذلك الحل حملة تحفيزية.",
  "يكفي مقارنة أداء الإدارات واختيار الإدارة الأضعف للمساءلة.",
  "الأهم الآن سرعة الإعلان، أما التشخيص فيمكن لاحقًا.",
  "يجب التعامل مع الاعتراضات كدليل مقاومة لا كبيانات."
];

const WRONG_HYPOTHESES = [
  "المشكلة في الأشخاص، لذلك يجب استبدالهم سريعًا.",
  "الموظفون لا يحبون التغيير بطبيعتهم، ولا توجد حاجة لتشخيص إضافي.",
  "يكفي إرسال تعميم رسمي لأن المشكلة في نقص المعلومات فقط.",
  "المشكلة مؤقتة وستنتهي إذا توقفنا عن الحديث عنها.",
  "كل الأطراف مخطئة بنفس الدرجة، لذلك لا حاجة لتحليل النظام.",
  "السبب هو ضعف الحماس، والحل حملة تحفيزية عامة.",
  "السبب الوحيد هو ضعف التدريب، ولا داعي لفحص الهيكل أو الصلاحيات.",
  "رأي الراعي التنفيذي يكفي لتحديد السبب الجذري."
];

const WRONG_DATA = [
  "الاكتفاء برأي الراعي التنفيذي لأنه يملك الصورة الكاملة.",
  "إرسال استبيان عام دون توضيح السرية أو استخدام البيانات.",
  "جمع أسماء المعارضين لمعرفة مصدر المقاومة.",
  "مراجعة عرض المشروع فقط دون مقابلات أو ملاحظة.",
  "قياس رضا عام بعد الورشة بدل السلوك في العمل.",
  "جمع بيانات كثيرة بلا سؤال تشخيصي واضح.",
  "الاعتماد على مؤشر مالي واحد لتفسير المشكلة كاملة.",
  "تأجيل جمع البيانات إلى ما بعد تنفيذ الحل."
];

const WRONG_INTERVENTIONS = [
  "ورشة تحفيزية عامة دون تعديل أي نظام أو صلاحية.",
  "حملة شعارات عن التعاون والتميز.",
  "إعادة هيكلة سريعة دون فهم نموذج التشغيل.",
  "تدريب عام لكل الموظفين بغض النظر عن السبب.",
  "إغلاق الموضوع حتى لا تزيد المقاومة.",
  "تغيير أسماء الإدارات دون تعديل العمل أو القرار.",
  "إنشاء لجنة جديدة دون حقوق قرار أو مالك واضح.",
  "إطلاق نظام تقني جديد دون إعادة تصميم العملية."
];

const WRONG_METRICS = [
  "عدد الحاضرين في العرض التعريفي فقط.",
  "عدد الشرائح المستخدمة في الورشة.",
  "عدد رسائل البريد المرسلة.",
  "عدد الملصقات المنشورة في المكاتب.",
  "نسبة اكتمال الوثائق دون قياس استخدامها.",
  "رضا عام بعد الورشة فقط.",
  "عدد الاجتماعات المنعقدة دون قياس القرار أو السلوك.",
  "عدد المستخدمين الذين سجلوا دخولًا دون قياس جودة الاستخدام."
];

const WRONG_ETHICS = [
  "تسليم أسماء المشاركين المنتقدين للراعي لضمان الشفافية.",
  "استخدام المقابلات لإثبات أن طرفًا واحدًا هو سبب المشكلة.",
  "وعد المشاركين بسرية مطلقة حتى لو كان ذلك غير ممكن.",
  "عرض اقتباسات تكشف أصحابها لأن التقرير سيكون أقوى.",
  "تجاهل الأصوات الأقل قوة لأنها ستبطئ المشروع.",
  "إخفاء النتائج السلبية حتى لا تنزعج القيادة.",
  "توسيع نطاق المشروع دون إفصاح لأن المستشار يحتاج وقتًا أطول.",
  "استخدام بيانات الثقة لمعاقبة الفريق الأقل تقييمًا."
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
    seedText + "-wrong"
  );

  const selected = [correct, ...wrong].filter(Boolean);
  const unique = Array.from(new Set(selected)).slice(0, count);

  while (unique.length < count) {
    unique.push(`خيار ناقص ${unique.length + 1}`);
  }

  return seededShuffle(unique, seedText + "-final");
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
        ? "توجد روايات متعارضة بين الأطراف، وبعض البيانات صحيحة لكنها قد تستخدم سياسيًا أو تُفهم خارج سياقها."
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
      id: `OD-SIM-${caseNumber}`,
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
        "تصميم تدخل لا يستطيع النظام حمله بعد خروج OD"
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
    "OD Simulation Consulting Brief",
    "==============================",
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
    "هل صممت تدخلًا يستطيع النظام حمله بعد خروج OD؟"
  ];

  return lines.join("\n");
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

function TabButton({ active, onClick, children }) {
  return (
    <button type="button" className={`od-tab ${active ? "active" : ""}`} onClick={onClick}>
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
          <marker id="arrowHeadUltra" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
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

function ChoiceGroup({ title, options, correct, selected, onSelect, locked, weight }) {
  const letters = ["أ", "ب", "ج", "د"];

  return (
    <div className="choice-group">
      <div className="choice-title">
        <h4>{title}</h4>
        <span>{weight} نقطة</span>
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

function MasteryCard({ title, value, subtitle, color }) {
  return (
    <div className="mastery-card" style={{ "--accent": color }}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{subtitle}</p>
    </div>
  );
}

export default function Simulation() {
  const scenarioBank = useMemo(() => buildScenarioBank(), []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [activeTab, setActiveTab] = useState("case");
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
      frame: uniqueOptions(
        scenario.correct.frame,
        WRONG_FRAMES,
        `${scenario.id}-frame-${scenario.category}`
      ),
      hypothesis: uniqueOptions(
        scenario.correct.hypothesis,
        WRONG_HYPOTHESES,
        `${scenario.id}-hypothesis-${scenario.level.id}`
      ),
      data: uniqueOptions(
        scenario.correct.data,
        WRONG_DATA,
        `${scenario.id}-data-${scenario.reference.key}`
      ),
      intervention: uniqueOptions(
        scenario.correct.intervention,
        WRONG_INTERVENTIONS,
        `${scenario.id}-intervention-${scenario.archetype.id}`
      ),
      metric: uniqueOptions(
        scenario.correct.metric,
        WRONG_METRICS,
        `${scenario.id}-metric-${scenario.pressure}`
      ),
      ethic: uniqueOptions(
        scenario.correct.ethic,
        WRONG_ETHICS,
        `${scenario.id}-ethic-${scenario.trap}`
      )
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

  function openScenario(id) {
    setCurrentId(id);
    setAnswers({});
    setLocked(false);
    setActiveTab("case");
  }

  function randomScenario() {
    const pool = filtered.length ? filtered : scenarioBank;
    const index = Math.floor(Math.random() * pool.length);
    openScenario(pool[index].id);
  }

  function hardRandomScenario() {
    const pool = scenarioBank.filter((item) => item.level.intensity >= 5);
    const index = Math.floor(Math.random() * pool.length);
    openScenario(pool[index].id);
  }

  function answerQuestion(key, value) {
    if (locked) return;
    setAnswers((prev) => ({ ...prev, [key]: value }));
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
    setActiveTab("debrief");
  }

  function resetAttempt() {
    setAnswers({});
    setLocked(false);
    setActiveTab("decision");
  }

  function updateNotes(value) {
    const next = { ...notes, [scenario.id]: value };
    setNotes(next);
    safeWriteJSON(NOTES_KEY, next);
  }

  function downloadBrief() {
    const text = buildBriefText({
      scenario,
      answers,
      score,
      notes: currentNotes
    });

    downloadTextFile(`${scenario.id}-OD-Consulting-Brief.txt`, text);
  }

  function clearProgress() {
    const next = { attempts: 0, bestScore: 0, completed: [], history: [], categoryScores: {} };
    setProgress(next);
    safeWriteJSON(STORAGE_KEY, next);
  }

  return (
    <section className="od-sim" dir="rtl">
      <style>{`
        .od-sim {
          min-height: 100vh;
          padding: 26px 14px 80px;
          color: #0f172a;
          background:
            radial-gradient(circle at 8% 10%, rgba(79,70,229,.18), transparent 28%),
            radial-gradient(circle at 92% 12%, rgba(245,158,11,.16), transparent 28%),
            radial-gradient(circle at 50% 98%, rgba(16,185,129,.13), transparent 34%),
            linear-gradient(135deg, #f8fafc, #eef2ff 55%, #fff7ed);
          overflow: hidden;
          font-family: inherit;
        }

        .od-wrap {
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

        .hero-kicker,
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

        .hero-actions,
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

        .layout {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 18px;
          align-items: start;
        }

        .sidebar,
        .main,
        .card {
          border-radius: 32px;
          background: rgba(255,255,255,.84);
          border: 1px solid rgba(255,255,255,.95);
          box-shadow: 0 18px 55px rgba(15,23,42,.08);
          backdrop-filter: blur(18px);
        }

        .sidebar {
          padding: 18px;
          position: sticky;
          top: 14px;
        }

        .main {
          padding: 20px;
          overflow: hidden;
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
          min-height: 180px;
          resize: vertical;
          line-height: 1.8;
        }

        .category-list {
          display: grid;
          gap: 8px;
          max-height: 460px;
          overflow: auto;
          padding-left: 4px;
        }

        .category {
          border: 0;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          padding: 12px;
          border-radius: 18px;
          background: #f8fafc;
          color: #0f172a;
          border: 1px solid rgba(148,163,184,.16);
          transition: .2s ease;
        }

        .category:hover,
        .category.active {
          background: #eef2ff;
          border-color: rgba(79,70,229,.24);
        }

        .category b {
          display: block;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 5px;
        }

        .category span {
          display: block;
          color: #64748b;
          font-size: 10px;
          font-weight: 850;
          line-height: 1.6;
        }

        .tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .od-tab {
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

        .od-tab.active {
          color: white;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border-color: transparent;
        }

        .scenario-head {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .scenario-head h2 {
          margin: 0;
          color: #0f172a;
          font-size: clamp(26px, 4vw, 46px);
          line-height: 1.2;
          font-weight: 950;
          letter-spacing: -.8px;
        }

        .scenario-head p {
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
          box-shadow: none;
          background: #fff;
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

        .scenario-map {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin: 16px 0;
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
          marker-end: url(#arrowHeadUltra);
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

        .challenge {
          padding: 18px;
          border-radius: 32px;
          background:
            radial-gradient(circle at 15% 15%, rgba(79,70,229,.35), transparent 30%),
            radial-gradient(circle at 88% 0%, rgba(16,185,129,.22), transparent 30%),
            #0f172a;
          color: white;
          box-shadow: 0 22px 52px rgba(15,23,42,.18);
        }

        .challenge h3 {
          margin: 0 0 8px;
          font-size: 24px;
          font-weight: 950;
        }

        .challenge p {
          margin: 0;
          color: rgba(226,232,240,.78);
          line-height: 1.8;
          font-size: 13px;
          font-weight: 750;
        }

        .choice-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 14px;
        }

        .choice-group {
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 24px;
          padding: 14px;
        }

        .choice-title {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: center;
          margin-bottom: 10px;
        }

        .choice-title h4 {
          margin: 0;
          color: white;
          font-size: 14px;
          font-weight: 950;
        }

        .choice-title span {
          color: #fde68a;
          font-size: 10px;
          font-weight: 950;
        }

        .choice-list {
          display: grid;
          gap: 8px;
        }

        .choice {
          cursor: pointer;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.08);
          color: rgba(255,255,255,.84);
          border-radius: 16px;
          padding: 11px;
          font-family: inherit;
          text-align: right;
          line-height: 1.6;
          font-size: 11px;
          font-weight: 850;
          transition: .2s ease;
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 8px;
          align-items: start;
        }

        .choice:hover {
          background: rgba(255,255,255,.13);
        }

        .choice-letter {
          width: 24px;
          height: 24px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.12);
          color: white;
          font-weight: 950;
        }

        .choice.selected {
          border-color: rgba(129,140,248,.9);
          background: rgba(129,140,248,.16);
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

        .scenario-list {
          margin-top: 18px;
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
          .layout,
          .grid-2,
          .grid-3,
          .choice-grid {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: relative;
            top: auto;
          }

          .scenario-map,
          .scenario-list,
          .mastery-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 720px) {
          .od-sim {
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

          .scenario-head {
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

      <div className="od-wrap">
        <header className="hero">
          <div className="hero-inner">
            <div>
              <span className="hero-kicker">مختبر المحاكاة الاستشارية · 350 سيناريو · قرارات متغيرة المواقع</span>
              <h1>
                محاكاة OD متقدمة
                <span>تختبر الحكم الاستشاري لا الحفظ</span>
              </h1>
              <p>
                هذا القسم يحوّل المتدرب من متلقي محتوى إلى ممارس يفكر تحت ضغط: تأطير المشكلة، بناء فرضية، اختيار بيانات، تصميم تدخل، قياس أثر، وحماية أخلاقيات العلاقة الاستشارية.
              </p>

              <div className="hero-actions">
                <button className="btn primary" type="button" onClick={randomScenario}>ولّد سيناريو عشوائي</button>
                <button className="btn light" type="button" onClick={hardRandomScenario}>تحدي صعب</button>
                <button className="btn light" type="button" onClick={() => setActiveTab("library")}>افتح المكتبة</button>
              </div>
            </div>

            <div className="hero-metrics">
              <div className="hero-metric">
                <span>مكتبة السيناريوهات</span>
                <strong>{scenarioBank.length}</strong>
              </div>
              <div className="hero-metric">
                <span>وقت التعلم داخل المختبر</span>
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

        <div className="layout">
          <aside className="sidebar">
            <div className="field">
              <label>ابحث داخل المختبر</label>
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
              <label>المجال الاستشاري</label>
              <div className="category-list">
                <button
                  className={`category ${category === "all" ? "active" : ""}`}
                  type="button"
                  onClick={() => setCategory("all")}
                >
                  <b>كل المجالات</b>
                  <span>{scenarioBank.length} سيناريو تدريبي</span>
                </button>

                {categoryStats.map((type) => (
                  <button
                    key={type.id}
                    className={`category ${category === type.id ? "active" : ""}`}
                    type="button"
                    onClick={() => setCategory(type.id)}
                  >
                    <b>{type.name}</b>
                    <span>{type.completed}/{type.count} مكتمل · {type.lens}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <h3>لوحة تقدمك</h3>
              <MiniBar label="إنجاز المكتبة" value={completionRate} color="#4f46e5" />
              <MiniBar label="متوسط محاولاتك" value={avgScore} color="#10b981" />
              <MiniBar label="أفضل أداء" value={progress.bestScore || 0} color="#f59e0b" />
              <div className="actions">
                <button className="btn danger" type="button" onClick={clearProgress}>تصفير التقدم</button>
              </div>
            </div>
          </aside>

          <main className="main">
            <div className="tabs">
              <TabButton active={activeTab === "case"} onClick={() => setActiveTab("case")}>ملف الحالة</TabButton>
              <TabButton active={activeTab === "decision"} onClick={() => setActiveTab("decision")}>غرفة القرار</TabButton>
              <TabButton active={activeTab === "debrief"} onClick={() => setActiveTab("debrief")}>التغذية الراجعة</TabButton>
              <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")}>مذكرة المستشار</TabButton>
              <TabButton active={activeTab === "library"} onClick={() => setActiveTab("library")}>المكتبة</TabButton>
              <TabButton active={activeTab === "mastery"} onClick={() => setActiveTab("mastery")}>لوحة الإتقان</TabButton>
            </div>

            {activeTab === "case" && (
              <>
                <div className="scenario-head">
                  <div>
                    <span className="od-kicker">{scenario.id} · {scenario.level.name} · {scenario.level.scoreLabel}</span>
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

                <ScenarioMap scenario={scenario} />

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

                <div className="grid-2">
                  <div className="card">
                    <h3>خريطة سببية مبسطة</h3>
                    <CausalLoop scenario={scenario} />
                  </div>

                  <div className="card">
                    <h3>أصحاب المصلحة</h3>
                    <ul>
                      {scenario.stakeholders.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="actions">
                  <button className="btn primary" type="button" onClick={() => setActiveTab("decision")}>ابدأ القرار الاستشاري</button>
                  <button className="btn ghost" type="button" onClick={randomScenario}>حالة أخرى</button>
                </div>
              </>
            )}

            {activeTab === "decision" && (
              <section className="challenge">
                <h3>غرفة القرار الاستشاري</h3>
                <p>{scenario.decisionMoment}</p>

                <div className="choice-grid">
                  <ChoiceGroup
                    title="1) تأطير المشكلة"
                    weight={15}
                    options={choiceSets.frame}
                    correct={scenario.correct.frame}
                    selected={answers.frame}
                    locked={locked}
                    onSelect={(value) => answerQuestion("frame", value)}
                  />

                  <ChoiceGroup
                    title="2) الفرضية التشخيصية"
                    weight={20}
                    options={choiceSets.hypothesis}
                    correct={scenario.correct.hypothesis}
                    selected={answers.hypothesis}
                    locked={locked}
                    onSelect={(value) => answerQuestion("hypothesis", value)}
                  />

                  <ChoiceGroup
                    title="3) البيانات المطلوبة"
                    weight={15}
                    options={choiceSets.data}
                    correct={scenario.correct.data}
                    selected={answers.data}
                    locked={locked}
                    onSelect={(value) => answerQuestion("data", value)}
                  />

                  <ChoiceGroup
                    title="4) التدخل الأنسب"
                    weight={20}
                    options={choiceSets.intervention}
                    correct={scenario.correct.intervention}
                    selected={answers.intervention}
                    locked={locked}
                    onSelect={(value) => answerQuestion("intervention", value)}
                  />

                  <ChoiceGroup
                    title="5) مؤشر الأثر"
                    weight={20}
                    options={choiceSets.metric}
                    correct={scenario.correct.metric}
                    selected={answers.metric}
                    locked={locked}
                    onSelect={(value) => answerQuestion("metric", value)}
                  />

                  <ChoiceGroup
                    title="6) القرار الأخلاقي"
                    weight={10}
                    options={choiceSets.ethic}
                    correct={scenario.correct.ethic}
                    selected={answers.ethic}
                    locked={locked}
                    onSelect={(value) => answerQuestion("ethic", value)}
                  />
                </div>

                <div className="actions">
                  <button className="btn success" type="button" disabled={!completed || locked} onClick={submitAttempt}>
                    اعتماد الإجابة وكشف التصحيح
                  </button>
                  <button className="btn light" type="button" onClick={resetAttempt}>
                    إعادة المحاولة
                  </button>
                  <button className="btn light" type="button" onClick={randomScenario}>
                    سيناريو جديد
                  </button>
                </div>

                {!completed && (
                  <div className="feedback-panel" style={{ marginTop: 14, background: "rgba(255,255,255,.08)", color: "white" }}>
                    <p style={{ color: "rgba(255,255,255,.82)" }}>
                      بقيت بعض القرارات غير مكتملة. المختبر لا يقبل محاولة ناقصة لأن ممارسة OD تتطلب سلسلة قرار كاملة: تأطير، فرضية، بيانات، تدخل، قياس، وأخلاقيات.
                    </p>
                  </div>
                )}
              </section>
            )}

            {activeTab === "debrief" && (
              <section className="feedback-panel">
                <div className="scenario-head">
                  <div>
                    <span className="od-kicker">تقرير التغذية الراجعة</span>
                    <h2>{score}% · {getGrade(score)}</h2>
                    <p>
                      التصحيح هنا لا يقيس الحفظ، بل يقيس جودة القرار الاستشاري. كل إجابة صحيحة مرتبطة بمنطق OD: فهم النظام، حماية العلاقة، اختيار تدخل ملائم، وقياس أثر لا نشاط.
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
                    تنزيل تقرير المحاولة
                  </button>
                  <button className="btn ghost" type="button" onClick={() => setActiveTab("decision")}>
                    مراجعة الإجابات
                  </button>
                  <button className="btn ghost" type="button" onClick={randomScenario}>
                    حالة جديدة
                  </button>
                </div>
              </section>
            )}

            {activeTab === "notes" && (
              <section>
                <div className="scenario-head">
                  <div>
                    <span className="od-kicker">مذكرة المستشار</span>
                    <h2>اكتب تفكيرك قبل الحكم</h2>
                    <p>
                      استخدم هذه المساحة لكتابة ملاحظاتك: ما العرض؟ ما النمط؟ ما الفرضيات؟ ما البيانات؟ ما الخطر الأخلاقي؟ وما السلوك الذي يجب قياسه؟
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

            {activeTab === "library" && (
              <section>
                <div className="scenario-head">
                  <div>
                    <span className="od-kicker">مكتبة المحاكاة</span>
                    <h2>{filtered.length} سيناريو مطابق</h2>
                    <p>
                      استخدم الفلترة للوصول إلى المجال أو المستوى المطلوب. المعروض أدناه أول 48 سيناريو حتى تبقى الصفحة سريعة وواضحة.
                    </p>
                  </div>
                </div>

                <div className="scenario-list">
                  {filtered.slice(0, 48).map((item) => (
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

            {activeTab === "mastery" && (
              <section>
                <div className="scenario-head">
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
                    <h3>روبرك الإتقان</h3>
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
              </section>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}