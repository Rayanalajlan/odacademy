import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

/**
 * OD Academy Home.jsx
 * نسخة رئيسية كاملة:
 * - تصميم جديد بالكامل.
 * - عداد وقت تعلم ذكي.
 * - يحسب الوقت الفعلي أثناء بقاء المستخدم نشطًا في المنصة.
 * - يتوقف عند الخمول أو إخفاء التبويب.
 * - يحفظ الوقت محليًا في localStorage.
 * - يحدّث المفتاح القديم od_hours حتى تظهر الساعات في وثيقة الإتقان إن كانت تعتمد عليه.
 *
 * ملاحظة مهمة:
 * هذا العداد يعمل كـ Singleton على مستوى نافذة المتصفح بعد تحميل ملف Home.jsx.
 * إذا كان تطبيقك لا يحمّل Home.jsx إلا عند الدخول للرئيسية، سيبدأ العد من أول زيارة للرئيسية.
 * لاحقًا، لو أردت أقوى نسخة على مستوى كل الموقع 100%، ننقل نفس الـ tracker إلى App.jsx أو Layout.
 */

const TIMER_STORAGE_KEY = "od_academy_learning_timer_v1";
const TIMER_STORAGE_KEY_PREFIX = "od_academy_learning_timer_v2_user_";
const LEGACY_HOURS_KEY = "od_hours";
const REMOTE_LEARNING_TIME_TABLE = "user_learning_stats";
const REMOTE_SYNC_INTERVAL_MS = 15000;
const TIMER_EVENT = "od-learning-time-update";
const DAILY_GOAL_SECONDS = 45 * 60;
const IDLE_LIMIT_MS = 5 * 60 * 1000;
const BRAND_LOGO_SRC = "/rayan-logo.png";

const cards = [
  {
    title: "رحلتك التعليمية",
    text: "ستة أشهر تعليمية عبر 24 أسبوعًا، من العقل التشخيصي إلى الاحتراف كممارس OD.",
    icon: "🧭",
    page: "journey",
    badge: "المسار الرئيسي",
    tone: "indigo"
  },
  {
    title: "رادار الأداء",
    text: "قياس فجوة الجدارات الاستشارية عبر مواقف مهنية حرجة.",
    icon: "📊",
    page: "radar",
    badge: "تشخيص ذاتي",
    tone: "emerald"
  },
  {
    title: "المحاكاة",
    text: "مختبر قرار حي يختبر قراراتك في حالة شركة مسار اللوجستية.",
    icon: "🏢",
    page: "simulation",
    badge: "قرار واقعي",
    tone: "amber"
  },
  {
    title: "الموجه الذكي",
    text: "مناقشة سقراطية مع موجه متخصص في التطوير التنظيمي.",
    icon: "🧠",
    page: "ai-mentor",
    badge: "تفكير سقراطي",
    tone: "violet"
  },
  {
    title: "وثيقة الإتقان",
    text: "سجل ختامي قابل للطباعة والمشاركة بعد إنجاز المسار.",
    icon: "📜",
    page: "mastery",
    badge: "إثبات الأثر",
    tone: "slate"
  },
  {
    title: "عن ريان",
    text: "خلفية المبادرة وفلسفتها المهنية ومنطلقاتها العلمية.",
    icon: "",
    useLogo: true,
    page: "about",
    badge: "الفلسفة",
    tone: "rose"
  }
];

// صيغ أصلية مستندة إلى مبادئ علمية في التعلم التنظيمي، التفكير النظمي، الأمان النفسي،
// القياس الاستراتيجي، إدارة التغيير، اتخاذ القرار، ونقل أثر التعلم إلى العمل.
// لا تُعرض هذه الملاحظة للمتدرب؛ تظهر له العبارة فقط.
const insights = [
  "النظام الذي لا يرى نفسه يطلب من أفراده أن يدفعوا ثمن عماه.",
  "كل قرار يعلّم المنظمة طريقة جديدة للتفكير؛ فاختر ما تريد أن يتعلمه النظام.",
  "ليست المشكلة في كثرة البيانات، بل في السؤال الفقير الذي يطلب منها إجابة عظيمة.",
  "الاستراتيجية الجادة لا تُقاس بما نعلن فعله، بل بما نمتنع عنه بوعي.",
  "عندما يصبح الخطأ قابلًا للفحص لا للفضيحة، يبدأ التعلم التنظيمي الحقيقي.",
  "الثقافة هي الذاكرة العملية للمنظمة: ما كافأته أمس سيقودها غدًا.",
  "كل مؤشر لا يغيّر محادثة أو قرارًا يتحول إلى ديكور رقمي.",
  "التغيير المستدام لا ينتصر على المقاومة؛ يصغي إليها حتى يفهم تصميم النظام.",
  "القائد الناضج لا يطارد الطاعة، بل يصمم وضوحًا يجعل المسؤولية ممكنة.",
  "إذا كانت المكافآت تعاكس الرسالة، فالمكافآت هي الرسالة الحقيقية.",
  "المنظمة لا تتعلم حين تجمع الدروس، بل حين تغيّر افتراضاتها.",
  "أعمق تحسين هو الذي يجعل السلوك الصحيح أسهل من الخطأ.",
  "الوضوح ليس رفاهية إدارية؛ إنه عدالة يومية تقلل التخمين والقلق والهدر.",
  "كل عملية طويلة تحمل سؤالًا مؤجلًا: ما الذي نخاف تبسيطه؟",
  "التعلم الذي لا يصل إلى لحظة القرار يبقى معرفة بلا أثر.",
  "لا تطلب شجاعة من الأفراد داخل نظام يعاقب الصراحة بأدب.",
  "حين لا يعرف الناس لماذا يعملون، سيملؤون الفراغ بتفسيراتهم الخاصة.",
  "الأداء الضعيف غالبًا لا يبدأ من الكسل، بل من تصميم عمل يبدد الطاقة.",
  "كل تحول بلا معيار متابعة يتحول إلى قصة جميلة في عرض تقديمي.",
  "السؤال الاستراتيجي الأقوى ليس ماذا سنضيف، بل ماذا سنتوقف عن فعله؟",
  "المنظمة الذكية لا تبحث عن بطل ينقذها؛ تبني نظامًا لا يحتاج إلى أبطال دائمين.",
  "ما لا تستطيع المؤسسة الحديث عنه بصدق سيعود إليها في هيئة تكلفة.",
  "الاجتماع الجيد ينقص الغموض؛ أما الرديء فيوزعه بالتساوي على الجميع.",
  "كل خطة لا تغيّر جدول الأعمال لا تزال فكرة في ثوب رسمي.",
  "القياس العادل لا يطارد الأشخاص، بل يكشف علاقة العمل بالنتيجة.",
  "إذا تغيرت اللغة ولم يتغير السلوك، فقد زادت المنظمة أناقتها لا قدرتها.",
  "القوة الحقيقية في التعلم أن يصبح السؤال مسموحًا قبل أن تصبح الإجابة جاهزة.",
  "كل نظام يكرر مشكلته يملك سببًا خفيًا لبقائها.",
  "الممارس الحصيف لا يبدأ بالأداة؛ يبدأ بفهم التوتر الذي خلق الحاجة إليها.",
  "حين تتعارض السرعة مع الفهم، فالسرعة غالبًا تؤجل الفاتورة فقط.",
  "الثقة ليست شعورًا عامًا؛ إنها سجل صغير من وعود دقيقة تم الوفاء بها.",
  "الابتكار لا يعيش طويلًا في بيئة ترى الاختلاف تهديدًا لهيبتها.",
  "الفريق الذي لا يجرؤ على تسمية الواقع سيبالغ في تزيين التقارير.",
  "كل قرار غامض يصنع سياسة غير معلنة، ثم يطلب من الناس الالتزام بها.",
  "الاستراتيجية ليست وثيقة عليا؛ إنها طريقة يومية لاختيار ما يستحق الطاقة.",
  "الإنصات العميق يقلل تكلفة التصحيح المتأخر.",
  "إذا لم تُصمم بيئة التطبيق، فلا تطلب من التدريب أن يحمل العبء وحده.",
  "كل تعلم حقيقي يترك أثرًا في المفردات، ثم في الأولويات، ثم في السلوك.",
  "القيادة الهادئة لا تقلل الطموح؛ تمنع الطموح من التحول إلى ضجيج.",
  "حين يتعلم النظام، لا تعود المعرفة حبيسة الأشخاص الأكثر خبرة.",
  "المنظمات لا تتغير لأنها اقتنعت فقط؛ تتغير حين تعيد ترتيب الحوافز والروتين.",
  "كل مقاومة تحمل معلومة عن خوف أو خسارة أو تجربة سابقة لم تُحترم.",
  "المؤشر الجيد يبدأ بسؤال: ما القرار الذي سيصبح أفضل بسببه؟",
  "لا توجد ثقافة مستقلة عن التصميم؛ كل إجراء يربي سلوكًا ما.",
  "الخطأ المتكرر ليس حادثًا؛ إنه نظام صغير يعمل بإتقان ضد نوايانا.",
  "إذا كان الهدف واسعًا إلى درجة أنه لا يرفض شيئًا، فهو ليس هدفًا بعد.",
  "كل مبادرة بلا مالك واضح تعيش على الحماس وتموت عند أول ازدحام.",
  "التعلم التنظيمي يبدأ عندما تصبح الحقيقة أقل تهديدًا وأكثر فائدة.",
  "القرار الناضج يجمع الرقم والإنسان والسياق، ولا يترك أحدها يبتلع الآخر.",
  "القائد الذي يطلب الشفافية عليه أن يثبت أولًا أن الصراحة آمنة.",
  "كل نظام أداء يعلّم الناس لعبة؛ فاجعل اللعبة تشبه القيمة الحقيقية.",
  "لا تعالج ضباب الدور بزيادة التعليمات؛ عالج أصل الغموض في التصميم.",
  "التغيير العميق لا يغيّر اللافتة، بل يغيّر ما يحدث حين لا يراقب أحد.",
  "حين يصبح السؤال أفضل، لا تحتاج الإجابة أن تكون صاخبة.",
  "التطوير التنظيمي ليس تجميلًا للهيكل، بل إعادة وصل النية بالنتيجة.",
  "كل تجربة صغيرة صادقة تحفظ المؤسسة من مقامرة كبيرة متأخرة.",
  "إذا كانت المعرفة لا تنتقل، فالمنظمة تؤجر خبرتها من أفرادها يومًا بيوم.",
  "التحسين الذكي لا يضيف طبقة جديدة؛ أحيانًا يزيل طبقة كانت تخنق العمل.",
  "كل فجوة بين القول والفعل تصبح درسًا ثقافيًا يتعلمه الجميع بسرعة.",
  "لا يبدأ التحول بخطة مثالية، بل بصدق كافٍ لرؤية ما لا يعمل.",
  "المنظمة التي تخاف من الأسئلة ستشتري إجابات كثيرة ولا تستخدمها.",
  "المساءلة الناضجة لا تبحث عن مذنب؛ تبحث عن الخطوة التالية وصاحبها.",
  "كل نظام صامت طويلًا يرسل إشاراته على شكل إنهاك أو دوران أو جودة متراجعة.",
  "الاستراتيجية العميقة تجعل الرفض مهارة مؤسسية لا مزاجًا شخصيًا.",
  "التفكير النظامي يرى الخيط بين القرار والحافز والسلوك والأثر.",
  "إذا كان التعلم لا يغير طريقة توزيع الوقت، فهو لم يدخل المؤسسة بعد.",
  "المنظمة التي لا تراجع افتراضاتها تتحسن داخل القفص نفسه.",
  "الأمان النفسي ليس لطفًا زائدًا؛ إنه شرط لرؤية المخاطر قبل أن تتضخم.",
  "كل تحسين بلا ذاكرة يتحول إلى إعادة اكتشاف مكلفة.",
  "القيم لا تُختبر في الجمل الجميلة، بل في القرار المكلف حين يراقب الجميع.",
  "الفريق القوي لا يتجنب الخلاف؛ يملك لغة تجعل الخلاف منتجًا.",
  "كل هدف بلا تعريف للنجاح يفتح الباب لمئة خيبة مشروعة.",
  "المنظمات تتقدم عندما تصبح الملاحظات مادة بناء لا سلاحًا اجتماعيًا.",
  "التدريب لا يعوض نظامًا يمنع المتدرب من ممارسة ما تعلمه.",
  "كل قرار سريع يجب أن يعرف ما الذي لن يعرفه بعد.",
  "التحول الرشيد يوازن بين استثمار المعروف واستكشاف غير المعروف.",
  "حين تصبح الأولويات كثيرة، تفقد الأولوية معناها وتبدأ الطاقة بالتسرب.",
  "التعلم لا يحدث لأننا أنهينا محتوى؛ يحدث لأننا غيرنا استجابة.",
  "لا تحل المشكلة من ارتفاع واحد؛ بعض الجذور لا تظهر إلا من زاوية أخرى.",
  "كل سياسة لا يفهمها الناس ستنجب طرقًا ملتوية للتعايش معها.",
  "المنظمة التي تسمّي الواقع بدقة تختصر نصف طريق الإصلاح.",
  "القرار الاستراتيجي ليس الأعلى طموحًا، بل الأكثر اتساقًا مع قدرة التنفيذ.",
  "كل لوحة مؤشرات يجب أن تفتح محادثة أشجع، لا أن تغلق النقاش مبكرًا.",
  "المعرفة التي لا تجد طقسًا يوميًا تموت في الذاكرة الشخصية.",
  "إذا كان النظام يربح من المشكلة، فلن يصدق دعوة حلها بسهولة.",
  "التغيير الذي يتجاهل تعب الناس سيواجه امتثالًا هادئًا ومقاومة مؤجلة.",
  "القائد الحكيم يسأل: ما الذي جعل السلوك المنطقي يبدو غير ممكن؟",
  "كل مؤسسة تحتاج من يحمي المساحة بين السرعة والتفكير.",
  "التحسين لا يبدأ بإدانة الماضي، بل بفهم الوظيفة التي كان يؤديها.",
  "حين تصبح التجربة آمنة وصغيرة، يصبح التعلم أسرع وأقل كلفة.",
  "الاستراتيجية التي لا تصل إلى الصف الأول لم تغادر غرفة الاجتماع فعلًا.",
  "كل سلوك متكرر هو نتيجة تصميم، حتى لو ادّعينا أنه مجرد عادة.",
  "المنظمة الناضجة تفرق بين خطأ يستحق التعلم وخطر يستحق المنع.",
  "لا تطلب التزامًا من شخص لم يفهم أثر دوره في الصورة الأكبر.",
  "الأداء يتحسن حين يرى الناس العلاقة بين جهدهم ونتيجة ذات معنى.",
  "كل تحول يحتاج قصة مفهومة، وإلا سيترجمه الناس إلى تهديد.",
  "القواعد الجيدة تقلل الحاجة إلى الذاكرة الفردية والبطولة اليومية.",
  "القياس حين ينفصل عن الهدف يصنع امتثالًا ذكيًا وقيمة ضعيفة.",
  "لا تجعل اللغة اللامعة تخفي قرارًا غير مكتمل.",
  "كل فريق يحتاج حق السؤال قبل واجب التنفيذ.",
  "المسار الواضح لا يقتل الإبداع؛ يحرره من إهدار الطاقة في التخمين.",
  "إذا لم تعرف من سيتأثر بالقرار، فأنت لم تنتهِ من التفكير.",
  "المنظمة التي تتعلم جيدًا تجعل الخبرة قابلة للمشاركة لا للاحتكار.",
  "كل تغيير مستدام يحتاج إيقاعًا: تجربة، قراءة، تعديل، تثبيت.",
  "الفكرة الجيدة تفشل عندما تُزرع في تربة لا تسمح بجذورها.",
  "التصميم الضعيف يجعل الناس يبدون أقل قدرة مما هم عليه.",
  "الأثر لا يحتاج ضجيجًا؛ يحتاج سلسلة قرارات متسقة لا تنقطع.",
  "كل افتراض غير مفحوص يدير جزءًا من المنظمة من خلف الستار.",
  "التحسين الحقيقي يجعل العمل أسهل فهمًا لا أكثر ازدحامًا بالمبادرات.",
  "لا تسأل فقط: هل نجحنا؟ اسأل: ماذا تعلم النظام كي ينجح مرة أخرى؟",
  "القيادة ليست امتلاك الإجابة، بل بناء ظرف يجعل الإجابة الجماعية ممكنة.",
  "كل منظمة تملك خريطة معلنة وخريطة حقيقية؛ الإصلاح يبدأ من الثانية.",
  "عندما تُحمّل الأفراد مسؤولية خلل نظامي، يخسر الجميع الحقيقة.",
  "التغيير الجيد لا يطارد القلوب وحدها؛ يعدل القيود التي تحكم الأيدي.",
  "كل برنامج تعلم يحتاج جسرًا واضحًا بين المعرفة والعمل.",
  "المشكلة المزمنة لا تحتاج حماسًا جديدًا؛ تحتاج قراءة أعمق للعلاقات.",
  "إذا لم تُسأل الأسئلة الصعبة مبكرًا، ستظهر الإجابات المؤلمة لاحقًا.",
  "المنظمة التي لا تعرف ماذا تتجاهل ستتعب من كل شيء.",
  "كل قرار يملك ظلًا؛ الممارس الجيد يقرأ الظل قبل أن يكبر.",
  "الأمان النفسي لا يعني الراحة من التحدي، بل القدرة على دخوله بصدق.",
  "حين تُدار المعرفة كأصل، لا كصدفة، يصبح التعلم أسرع من دوران الأشخاص.",
  "التحول لا ينجح بالاستعارة من الآخرين؛ ينجح بالترجمة الدقيقة للسياق.",
  "كل نظام رقابة يجب أن يسأل: هل نحسن الأداء أم نحسن التمثيل؟",
  "القائد العميق يعرف أن الصمت في الاجتماع قد يكون بيانات غير منطوقة.",
  "الاستراتيجية تبدأ حين نرى الترابط بين ما نريد وما نكافئ وما نقيس.",
  "كل تحسين بلا حدّ واضح يتحول إلى مشروع لا يعرف متى يتوقف.",
  "المنظمة التي تتعلم من الضعف قبل الأزمة تقلل تكلفة الحكمة.",
  "لا تجعل الحل كبيرًا كي يبدو مهمًا؛ اجعله دقيقًا كي يعمل.",
  "كل محادثة صادقة تضيف قدرة؛ وكل مجاملة كاذبة تضيف دينًا مؤجلًا.",
  "التفكير الجيد لا يسرع إلى السبب الأول؛ ينتظر حتى تظهر البنية.",
  "عندما يصبح التعلم جزءًا من العمل، لا يعود التدريب حدثًا منفصلًا.",
  "كل فريق له نمط خفي في تجنب الحقيقة؛ اكتشافه نصف التطوير.",
  "المؤشر الحكيم لا يطلب الكمال؛ يطلب اتجاهًا يمكن فهمه والتصرف عليه.",
  "لا تحكم على السلوك قبل أن ترى ما يجعله مربحًا أو آمنًا أو سهلًا.",
  "المنظمة العادلة تجعل التوقعات مرئية قبل أن تحاسب على النتائج.",
  "كل مبادرة تصنع حملًا إداريًا؛ لا تطلقها قبل أن تعرف ما ستزيله.",
  "التغيير الذكي يحترم الماضي دون أن يسمح له بقيادة المستقبل.",
  "القرار الجيد يترك أثرًا في النظام، لا في ذاكرة صاحبه فقط.",
  "كل تعلم لا يملك ممارسة لاحقة يبقى وعدًا حسن النية.",
  "الاستكشاف بلا انضباط مقامرة، والاستثمار بلا استكشاف جمود أنيق.",
  "حين تصبح الصراحة مكافأة لا مخاطرة، تتغير جودة القرارات.",
  "المنظمة لا تحتاج معلومات أكثر دائمًا؛ تحتاج معنى أصدق لما تعرفه بالفعل.",
  "كل تصميم اجتماع يعلن ضمنيًا من يملك الصوت ومن يملك الصمت.",
  "التطوير التنظيمي يقرأ ما بين الهيكل والسلوك: أين تضيع النية؟",
  "لا تصنع سياسة لعلاج استثناء قبل أن تعرف إن كان الاستثناء رسالة.",
  "كل ضغط يكشف الثقافة التي كانت تعمل بهدوء تحت السطح.",
  "الهدف الذي لا يملك مقياسًا حيًا يصبح أمنية بعبارات رسمية.",
  "عندما تصبح المسؤولية موزعة بلا وضوح، تصبح النتيجة يتيمة.",
  "القيادة الاستراتيجية تجعل الاختيار مفهومًا حتى لمن لم يشارك في صنعه.",
  "كل تحسين ينبغي أن يحرر وقتًا أو يرفع معنى أو يقلل خطرًا.",
  "المعرفة التنظيمية لا تنمو بالتخزين فقط، بل بإعادة الاستخدام في الوقت المناسب.",
  "لا تخلط بين مقاومة التغيير ومقاومة الغموض؛ كثير من الناس يرفضون الثاني.",
  "كل نظام يبالغ في حماية صورته يضعف قدرته على التعلم.",
  "التغيير الموثوق لا يبدأ بشعار؛ يبدأ بسلوك قيادي يمكن ملاحظته.",
  "حين لا تُرى الروابط، تبدو المشكلات كثيرة؛ وحين تُرى، يظهر النظام.",
  "المنظمة التي تتقن التعلم المزدوج لا تصلح الخطأ فقط؛ تصلح طريقة التفكير.",
  "كل خطة تحتاج ذاكرة قرار: لماذا اخترنا، ماذا توقعنا، وماذا حدث؟",
  "القائد الذي يربط المعنى بالقياس يمنع الأرقام من أن تصبح بلا روح.",
  "لا تبنِ حوكمة تجعل العمل الصحيح أبطأ من التحايل عليه.",
  "كل بيئة عمل تُعلّم الناس إما المبادرة أو الانتظار.",
  "التحسين الرزين يختبر الفرضية قبل أن يحولها إلى سياسة.",
  "الاستراتيجية لا تظهر في لحظة الإعلان، بل في آلاف المفاضلات الصغيرة بعدها.",
  "كل نظام مفرط التعقيد يخلق نخبة تفسره وجمهورًا يتحايل عليه.",
  "حين يصبح العميل غائبًا عن المؤشرات، تبدأ المنظمة بقياس نفسها لنفسها.",
  "التعلم العميق يجعلنا أقل ثقة بالإجابات السريعة وأكثر احترامًا للسياق.",
  "كل تحول يحتاج من يترجم الطموح إلى عادات عمل قابلة للتكرار.",
  "الأثر لا يستقر إلا حين يجد مكانًا في الروتين والقياس والمساءلة.",
  "لا تطلب من الناس تغيير السلوك ثم تترك الإشارة القديمة تقودهم.",
  "المنظمة التي تفرط في المبادرات تشبه من يزرع كثيرًا ولا يسقي شيئًا.",
  "كل قرار لا يوضح المقايضة يخبئها لتظهر في التنفيذ.",
  "الأمان الحقيقي في الفرق يظهر عندما يقال الكلام المهم قبل أن يصبح متأخرًا.",
  "التغيير الذي لا يملك لغة مشتركة يتحول إلى ترجمات متنافسة.",
  "كل جودة مستدامة تبدأ من رفض مبكر لما لا يشبه المعيار.",
  "الممارس الذكي لا يبيع حلًا؛ يساعد النظام على رؤية نفسه بصدق.",
  "الاستراتيجية الصلبة تعرف كيف تتغير دون أن تفقد سبب وجودها.",
  "كل قياس يدفع الناس لإخفاء الحقيقة هو خطر يرتدي شكل إدارة.",
  "التطوير لا يعني أن نزيد العمل، بل أن نجعل العمل أكثر قدرة على إنتاج قيمته.",
  "حين يكون السؤال شجاعًا، تصبح الإجابة بداية لا نهاية.",
  "المنظمة المتعلمة لا تفتخر بأنها لا تخطئ؛ تفتخر بأنها لا تكرر الخطأ نفسه بلا فهم.",
  "كل نظام يحتاج مرآة: بيانات صادقة، حوار آمن، وقرار لا يهرب.",
  "لا تسمح للنجاح السابق أن يصبح عقيدة تمنع السؤال التالي.",
  "التغيير العميق يلمس ما نكافئه، ما نسكت عنه، وما نسميه نجاحًا.",
  "كل تجربة محسوبة هي حوار محترم بين الطموح والواقع.",
  "القيادة الناضجة تُنقص الضباب قبل أن تطلب السرعة.",
  "المنظمة التي تملك ذاكرة تعلم تقلل اعتمادها على الصدفة والبطولة.",
  "كل تحول ينجح عندما يصبح السلوك الجديد أسهل وأوضح وأكثر عدلًا.",
  "المؤسسة القوية لا تخاف من تعقيد الواقع؛ تخاف من اختزاله قبل فهمه.",
  "القرار العظيم ليس الذي يرضي الجميع لحظة صدوره، بل الذي يثبت حكمته عند الأثر.",
  "كل معرفة لا تلامس نظام الحوافز ستبقى ضيفًا مهذبًا لا يغير البيت.",
  "التفكير الاستراتيجي يرى ما يجب حمايته بقدر ما يرى ما يجب تغييره.",
  "حين يتعلم الناس كيف يفكر النظام، يصبحون أقل أسرًا لأعراضه.",
  "لا تبدأ بسؤال: من المقصر؟ ابدأ بسؤال: أي تصميم جعل التقصير منطقيًا؟",
  "كل منظمة تحتاج لحظات تقف فيها عن الإنتاج كي تفهم كيف تنتج.",
  "الأثر المركب يبدأ من عادات صغيرة لا تتفاوض مع الغموض.",
  "التطوير الحقيقي يرفع كرامة العمل: يقلل الهدر، يوضح الدور، ويزيد المعنى.",
  "حين يصبح التعلم عادة للنظام، لا يبقى التميز خبرًا نادرًا بل قدرة متكررة.",
  "المنظمة التي تصمم للمعنى تجعل الانضباط نتيجة طبيعية لا أمرًا ثقيلًا.",
  "كل افتراض يعيش طويلًا بلا اختبار يتحول إلى قانون غير مرئي.",
  "التعلم الاستراتيجي لا يطلب معرفة أكثر فقط؛ يطلب طريقة أفضل لاختيار ما يستحق المعرفة.",
  "حين تصبح البنية مفهومة، تقل الدراما ويزيد العمل الذي يمكن الوثوق به."
];

function createRandomInsightOrder() {
  const order = insights.map((_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }

  return order;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function clampNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function getTimerStorageKey(userId) {
  return userId ? `${TIMER_STORAGE_KEY_PREFIX}${userId}` : TIMER_STORAGE_KEY;
}

function readStoredTimer(storageKey = TIMER_STORAGE_KEY) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeTimerData(raw) {
  const today = getTodayKey();
  const now = new Date().toISOString();

  const base = {
    totalSeconds: 0,
    dailyLog: {},
    sessionsCount: 0,
    longestSessionSeconds: 0,
    createdAt: now,
    updatedAt: now
  };

  const data = raw && typeof raw === "object" ? { ...base, ...raw } : base;

  data.totalSeconds = clampNumber(data.totalSeconds);
  data.sessionsCount = clampNumber(data.sessionsCount);
  data.longestSessionSeconds = clampNumber(data.longestSessionSeconds);
  data.dailyLog = data.dailyLog && typeof data.dailyLog === "object" ? data.dailyLog : {};

  Object.keys(data.dailyLog).forEach((key) => {
    data.dailyLog[key] = clampNumber(data.dailyLog[key]);
  });

  if (!data.dailyLog[today]) data.dailyLog[today] = 0;

  return data;
}

function mergeDailyLogs(...logs) {
  const merged = {};

  logs.forEach((log) => {
    if (!log || typeof log !== "object") return;

    Object.entries(log).forEach(([date, seconds]) => {
      merged[date] = Math.max(clampNumber(merged[date]), clampNumber(seconds));
    });
  });

  return merged;
}

function mergeTimerData(...sources) {
  const normalizedSources = sources
    .filter(Boolean)
    .map((source) => normalizeTimerData(source));

  if (!normalizedSources.length) return normalizeTimerData(null);

  const base = normalizeTimerData(null);
  const dailyLog = mergeDailyLogs(...normalizedSources.map((source) => source.dailyLog));
  const dailyTotal = Object.values(dailyLog).reduce((sum, seconds) => sum + clampNumber(seconds), 0);
  const totalSeconds = Math.max(
    dailyTotal,
    ...normalizedSources.map((source) => clampNumber(source.totalSeconds))
  );

  return {
    ...base,
    totalSeconds,
    dailyLog,
    sessionsCount: Math.max(...normalizedSources.map((source) => clampNumber(source.sessionsCount))),
    longestSessionSeconds: Math.max(...normalizedSources.map((source) => clampNumber(source.longestSessionSeconds))),
    createdAt: normalizedSources.map((source) => source.createdAt).filter(Boolean).sort()[0] || base.createdAt,
    updatedAt: new Date().toISOString()
  };
}

async function fetchRemoteTimerData(userId) {
  if (!userId || !isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from(REMOTE_LEARNING_TIME_TABLE)
      .select("total_seconds, daily_log, sessions_count, longest_session_seconds, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;

    return normalizeTimerData({
      totalSeconds: data.total_seconds,
      dailyLog: data.daily_log,
      sessionsCount: data.sessions_count,
      longestSessionSeconds: data.longest_session_seconds,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  } catch {
    return null;
  }
}

async function pushRemoteTimerData(userId, data) {
  if (!userId || !isSupabaseConfigured || !supabase) return;

  const normalized = normalizeTimerData(data);

  try {
    await supabase.from(REMOTE_LEARNING_TIME_TABLE).upsert(
      {
        user_id: userId,
        total_seconds: Math.floor(clampNumber(normalized.totalSeconds)),
        daily_log: normalized.dailyLog,
        sessions_count: Math.floor(clampNumber(normalized.sessionsCount)),
        longest_session_seconds: Math.floor(clampNumber(normalized.longestSessionSeconds)),
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );
  } catch {
    // فشل المزامنة السحابية لا يوقف العداد؛ النسخة المحلية تبقى محفوظة.
  }
}

function saveTimerData(data, storageKey = TIMER_STORAGE_KEY) {
  if (typeof window === "undefined") return;

  try {
    const normalized = normalizeTimerData(data);
    window.localStorage.setItem(storageKey, JSON.stringify(normalized));

    // نحفظ نسخة عامة أيضًا حتى لا يضيع وقتك لو تغيّر مفتاح المستخدم أو دخلت من نسخة قديمة.
    if (storageKey !== TIMER_STORAGE_KEY) {
      window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(normalized));
    }

    /**
     * مفتاح متوافق مع كود وثيقة الإتقان القديم.
     * نخزن عدد الساعات المكتملة فعليًا، لا الدقائق.
     */
    const completedHours = Math.floor(clampNumber(normalized.totalSeconds) / 3600);
    window.localStorage.setItem(LEGACY_HOURS_KEY, String(completedHours));
  } catch {
    // تجاهل فشل التخزين حتى لا يتعطل الموقع
  }
}

function formatDuration(totalSeconds, compact = false) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (compact) {
    if (hours > 0) return `${hours}س ${minutes}د`;
    if (minutes > 0) return `${minutes}د`;
    return `${remainingSeconds}ث`;
  }

  if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة`;
  if (minutes > 0) return `${minutes} دقيقة و ${remainingSeconds} ثانية`;
  return `${remainingSeconds} ثانية`;
}

function getStreakDays(dailyLog) {
  const dates = Object.keys(dailyLog || {}).filter((date) => clampNumber(dailyLog[date]) > 0);
  if (!dates.length) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (clampNumber(dailyLog[key]) > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getWeeklySeconds(dailyLog) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let sum = 0;

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    sum += clampNumber(dailyLog?.[key]);
  }

  return sum;
}

function buildTimerSnapshot(timer) {
  const data = timer?.data || normalizeTimerData(null);
  const today = getTodayKey();
  const todaySeconds = clampNumber(data.dailyLog?.[today]);
  const totalSeconds = clampNumber(data.totalSeconds);
  const sessionSeconds = clampNumber(timer?.sessionSeconds);
  const weeklySeconds = getWeeklySeconds(data.dailyLog);
  const streakDays = getStreakDays(data.dailyLog);
  const completedHours = Math.floor(totalSeconds / 3600);
  const decimalHours = totalSeconds / 3600;
  const dailyProgress = Math.min(100, Math.round((todaySeconds / DAILY_GOAL_SECONDS) * 100));

  return {
    totalSeconds,
    sessionSeconds,
    todaySeconds,
    weeklySeconds,
    streakDays,
    completedHours,
    decimalHours,
    dailyProgress,
    sessionsCount: data.sessionsCount,
    longestSessionSeconds: data.longestSessionSeconds,
    isPaused: Boolean(timer?.isPaused),
    isIdle: Boolean(timer?.isIdle),
    isVisible: typeof document === "undefined" ? true : document.visibilityState === "visible",
    statusLabel: timer?.isPaused
      ? "متوقف يدويًا"
      : timer?.isIdle
        ? "خامل مؤقتًا"
        : "يحسب الآن",
    statusTone: timer?.isPaused ? "paused" : timer?.isIdle ? "idle" : "active"
  };
}

function createLearningTimer() {
  if (typeof window === "undefined") return null;

  if (window.__OD_ACADEMY_LEARNING_TIMER__) {
    return window.__OD_ACADEMY_LEARNING_TIMER__;
  }

  const timer = {
    userId: null,
    storageKey: TIMER_STORAGE_KEY,
    data: normalizeTimerData(readStoredTimer(TIMER_STORAGE_KEY)),
    intervalId: null,
    authSubscription: null,
    lastTickAt: Date.now(),
    lastInteractionAt: Date.now(),
    lastSaveAt: Date.now(),
    lastRemoteSyncAt: 0,
    syncInFlight: false,
    sessionSeconds: 0,
    isPaused: false,
    isIdle: false,

    async bindCurrentUser() {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        const { data } = await supabase.auth.getUser();
        const userId = data?.user?.id;

        if (!userId || this.userId === userId) return;

        const userStorageKey = getTimerStorageKey(userId);
        const genericLocalData = readStoredTimer(TIMER_STORAGE_KEY);
        const userLocalData = readStoredTimer(userStorageKey);
        const remoteData = await fetchRemoteTimerData(userId);

        this.userId = userId;
        this.storageKey = userStorageKey;
        this.data = mergeTimerData(this.data, genericLocalData, userLocalData, remoteData);
        this.data.updatedAt = new Date().toISOString();

        this.persist(true);
        this.broadcast();
      } catch {
        // لو فشل ربط المستخدم، نستمر بالحفظ المحلي حتى لا يضيع الوقت.
      }
    },

    persist(forceRemote = false) {
      saveTimerData(this.data, this.storageKey);

      const now = Date.now();
      const shouldSyncRemote =
        forceRemote || now - this.lastRemoteSyncAt >= REMOTE_SYNC_INTERVAL_MS;

      if (this.userId && shouldSyncRemote && !this.syncInFlight) {
        this.syncInFlight = true;
        this.lastRemoteSyncAt = now;

        pushRemoteTimerData(this.userId, this.data).finally(() => {
          this.syncInFlight = false;
        });
      }
    },

    start() {
      this.data.sessionsCount += 1;
      this.data.updatedAt = new Date().toISOString();
      this.persist(true);
      this.bindCurrentUser();

      if (isSupabaseConfigured && supabase) {
        const { data } = supabase.auth.onAuthStateChange(() => {
          this.bindCurrentUser();
        });

        this.authSubscription = data?.subscription || null;
      }

      const interactionEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

      const markInteraction = () => {
        this.lastInteractionAt = Date.now();
        this.isIdle = false;
        this.broadcast();
      };

      interactionEvents.forEach((eventName) => {
        window.addEventListener(eventName, markInteraction, { passive: true });
      });

      document.addEventListener("visibilitychange", () => {
        this.lastTickAt = Date.now();
        this.broadcast();
        this.persist();
      });

      window.addEventListener("beforeunload", () => {
        this.persist();
      });

      this.intervalId = window.setInterval(() => this.tick(), 1000);
      this.broadcast();
    },

    tick() {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.floor((now - this.lastTickAt) / 1000));
      this.lastTickAt = now;

      const visible = document.visibilityState === "visible";
      const idle = now - this.lastInteractionAt > IDLE_LIMIT_MS;
      this.isIdle = idle;

      const shouldCount = visible && !idle && !this.isPaused;

      if (shouldCount && elapsedSeconds > 0) {
        /**
         * نحدّ الزيادة القصوى في كل tick حتى لا تُحسب ساعات وهمية
         * لو كان المتصفح معلّقًا ثم عاد دفعة واحدة.
         */
        const safeIncrement = Math.min(elapsedSeconds, 5);
        const today = getTodayKey();

        if (!this.data.dailyLog[today]) this.data.dailyLog[today] = 0;

        this.data.totalSeconds += safeIncrement;
        this.data.dailyLog[today] += safeIncrement;
        this.sessionSeconds += safeIncrement;

        if (this.sessionSeconds > this.data.longestSessionSeconds) {
          this.data.longestSessionSeconds = this.sessionSeconds;
        }

        this.data.updatedAt = new Date().toISOString();
      }

      if (now - this.lastSaveAt >= 5000) {
        this.lastSaveAt = now;
        this.persist();
      }

      this.broadcast();
    },

    pause() {
      this.isPaused = true;
      this.broadcast();
      this.persist();
    },

    resume() {
      this.isPaused = false;
      this.lastInteractionAt = Date.now();
      this.lastTickAt = Date.now();
      this.broadcast();
    },

    resetToday() {
      const today = getTodayKey();
      const todaySeconds = clampNumber(this.data.dailyLog[today]);

      this.data.totalSeconds = Math.max(0, this.data.totalSeconds - todaySeconds);
      this.data.dailyLog[today] = 0;
      this.sessionSeconds = 0;
      this.data.updatedAt = new Date().toISOString();

      this.persist();
      this.broadcast();
    },

    getSnapshot() {
      return buildTimerSnapshot(this);
    },

    broadcast() {
      const snapshot = this.getSnapshot();
      window.dispatchEvent(new CustomEvent(TIMER_EVENT, { detail: snapshot }));
    }
  };

  window.__OD_ACADEMY_LEARNING_TIMER__ = timer;
  timer.start();

  return timer;
}

const learningTimer = createLearningTimer();

function useLearningTimer() {
  const [snapshot, setSnapshot] = useState(() => {
    if (!learningTimer) return buildTimerSnapshot(null);
    return learningTimer.getSnapshot();
  });

  useEffect(() => {
    if (!learningTimer || typeof window === "undefined") return undefined;

    const handleUpdate = (event) => {
      setSnapshot(event.detail || learningTimer.getSnapshot());
    };

    window.addEventListener(TIMER_EVENT, handleUpdate);
    setSnapshot(learningTimer.getSnapshot());

    return () => window.removeEventListener(TIMER_EVENT, handleUpdate);
  }, []);

  return {
    snapshot,
    pause: () => learningTimer?.pause(),
    resume: () => learningTimer?.resume(),
    resetToday: () => learningTimer?.resetToday()
  };
}

function StatCard({ label, value, hint, icon, tone = "indigo" }) {
  return (
    <div className={`od-stat-card od-stat-card--${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint && <small>{hint}</small>}
      </div>
      <i>{icon}</i>
    </div>
  );
}

function ProgressLine({ label, value, hint }) {
  return (
    <div className="od-progress-line">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="od-progress-track">
        <b style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function TimerCommandCenter({ timer, onPause, onResume, onResetToday }) {
  return (
    <section className="od-timer-command">
      <div className="od-timer-orbit">
        <div className={`od-live-core od-live-core--${timer.statusTone}`}>
          <span>{timer.statusLabel}</span>
          <strong>{formatDuration(timer.sessionSeconds, true)}</strong>
          <small>الجلسة الحالية</small>
        </div>
      </div>

      <div className="od-timer-content">
        <div className="od-section-kicker">مرصد الوقت المهني</div>
        <h2>عداد تعلّم ذكي يحسب وجودك النشط داخل المنصة</h2>
        <p>
          لا يحسب الوقت الوهمي عند ترك التبويب أو الخمول الطويل. كل دقيقة نشطة تُضاف إلى رصيدك المعرفي، وتُحفظ محليًا حتى تظهر لاحقًا في وثيقة الإتقان.
        </p>

        <div className="od-timer-grid">
          <StatCard
            label="اليوم"
            value={formatDuration(timer.todaySeconds, true)}
            hint="هدف اليوم 45 دقيقة"
            icon="☀️"
            tone="amber"
          />

          <StatCard
            label="آخر 7 أيام"
            value={formatDuration(timer.weeklySeconds, true)}
            hint="قياس الاستمرارية"
            icon="📈"
            tone="emerald"
          />

          <StatCard
            label="إجمالي الوقت"
            value={formatDuration(timer.totalSeconds, true)}
            hint={`${timer.decimalHours.toFixed(1)} ساعة فعلية`}
            icon="⏳"
            tone="indigo"
          />

          <StatCard
            label="ساعات محتسبة"
            value={`${String(timer.completedHours).padStart(3, "0")} ساعة`}
            hint="تظهر في وثيقة الإتقان"
            icon="🏅"
            tone="violet"
          />
        </div>

        <ProgressLine
          label="إنجاز هدف اليوم"
          value={timer.dailyProgress}
          hint={timer.dailyProgress >= 100 ? "اكتمل هدف اليوم. ممتاز." : "اقترب من إكمال جرعة اليوم المعرفية."}
        />

        <div className="od-timer-actions">
          {timer.isPaused ? (
            <button type="button" className="od-button od-button--primary" onClick={onResume}>
              استئناف العدّ
            </button>
          ) : (
            <button type="button" className="od-button od-button--dark" onClick={onPause}>
              إيقاف مؤقت
            </button>
          )}

          <button type="button" className="od-button od-button--ghost" onClick={onResetToday}>
            تصفير وقت اليوم فقط
          </button>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ card, onOpen, metric }) {
  return (
    <button type="button" className={`od-feature-card od-feature-card--${card.tone}`} onClick={onOpen}>
      <div className="od-feature-top">
        <span className="od-feature-badge">{card.badge}</span>
        <div className={card.useLogo ? "od-feature-icon od-feature-icon--logo" : "od-feature-icon"}>
          {card.useLogo ? (
            <img src={BRAND_LOGO_SRC} alt="شعار ريان العجلان" />
          ) : (
            card.icon
          )}
        </div>
      </div>

      <h3>{card.title}</h3>
      <p>{card.text}</p>

      <div className="od-feature-bottom">
        <span>{metric}</span>
        <b>افتح القسم ←</b>
      </div>
    </button>
  );
}

export default function Home({ userName, setActivePage, completedDays = 0, totalDays = 168 }) {
  const safeTotalDays = totalDays > 0 ? totalDays : 168;
  const safeCompletedDays = Math.max(0, Math.min(completedDays || 0, safeTotalDays));
  const progress = Math.round((safeCompletedDays / safeTotalDays) * 100);

  const { snapshot: timer, pause, resume, resetToday } = useLearningTimer();

  const quoteOrder = useMemo(() => createRandomInsightOrder(), []);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isQuotePaused, setIsQuotePaused] = useState(false);

  useEffect(() => {
    if (isQuotePaused || typeof window === "undefined") return undefined;

    const intervalId = window.setInterval(() => {
      setQuoteIndex((currentIndex) => (currentIndex + 1) % quoteOrder.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, [isQuotePaused, quoteOrder.length]);

  const quote = insights[quoteOrder[quoteIndex % quoteOrder.length]];
  const quoteVariant = quoteIndex % 6;

  const learningRank = useMemo(() => {
    if (timer.completedHours >= 100) return "ممارس متقدم";
    if (timer.completedHours >= 50) return "مستشار صاعد";
    if (timer.completedHours >= 20) return "محلل نظامي";
    if (timer.completedHours >= 5) return "متدرّب جاد";
    return "بداية الرحلة";
  }, [timer.completedHours]);

  const cardMetric = (page) => {
    if (page === "journey") return `${safeCompletedDays}/${safeTotalDays} يوم`;
    if (page === "mastery") return `${timer.completedHours} ساعة`;
    if (page === "radar") return "5 جدارات";
    if (page === "simulation") return "مختبر قرار";
    if (page === "ai-mentor") return "موجه سقراطي";
    return "فلسفة المنصة";
  };

  return (
    <section className="od-home-v2" dir="rtl">
      <style>{`
        .od-home-v2 {
          /* الرموز المحلية تُشتقّ الآن من نظام التصميم الموحّد (يتبدّل تلقائياً بين الوضعين) */
          --od-ink: var(--text);
          --od-muted: var(--text-muted);
          --od-soft: var(--surface);
          --od-line: var(--border);
          --od-indigo: var(--accent);
          --od-violet: var(--accent-hover);
          --od-emerald: var(--success);
          --od-amber: var(--accent);
          --od-rose: var(--danger);
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          padding: 28px 16px 80px;
          color: var(--od-ink);
          font-size: clamp(15px, 1.05vw, 17px);
          line-height: 1.75;
          background:
            radial-gradient(circle at 14% 12%, rgba(139, 92, 246,.18), transparent 28%),
            radial-gradient(circle at 82% 10%, rgba(124, 58, 237,.14), transparent 30%),
            radial-gradient(circle at 52% 92%, rgba(168, 85, 247,.12), transparent 32%),
            linear-gradient(135deg, #f4f0fb 0%, #efe9fb 52%, #f3edfb 100%);
        }

        .od-home-v2::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(28, 17, 48,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(28, 17, 48,.035) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(circle at center, black, transparent 78%);
          pointer-events: none;
        }

        .od-home-wrap {
          position: relative;
          z-index: 1;
          width: min(1220px, 100%);
          margin: 0 auto;
        }

        .od-hero {
          position: relative;
          overflow: hidden;
          border-radius: 42px;
          padding: 36px;
          min-height: 520px;
          color: white;
          background:
            radial-gradient(circle at 16% 20%, rgba(129,140,248,.32), transparent 34%),
            radial-gradient(circle at 85% 15%, rgba(245,158,11,.24), transparent 28%),
            linear-gradient(145deg, #18102e 0%, #1e1b4b 52%, #3b1d6e 100%);
          box-shadow: 0 28px 90px rgba(28, 17, 48,.22);
          border: 1px solid rgba(255,255,255,.16);
        }

        .od-hero::before {
          content: "";
          position: absolute;
          width: 720px;
          height: 720px;
          border-radius: 50%;
          right: -260px;
          top: -320px;
          background: conic-gradient(from 120deg, rgba(255,255,255,.18), rgba(245,158,11,.18), rgba(16,185,129,.14), rgba(124,58,237,.22), rgba(255,255,255,.18));
          filter: blur(8px);
          opacity: .75;
          animation: odSpin 18s linear infinite;
        }

        .od-hero::after {
          content: "";
          position: absolute;
          inset: -40%;
          background-image:
            linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
          background-size: 52px 52px;
          transform: rotate(-8deg);
          opacity: .42;
          pointer-events: none;
        }

        @keyframes odSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .od-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.12fr .88fr;
          gap: 34px;
          align-items: center;
        }

        .od-chip {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          width: fit-content;
          border-radius: 999px;
          padding: 9px 14px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.18);
          color: #e0e7ff;
          font-size: 12px;
          font-weight: 950;
          backdrop-filter: blur(10px);
        }

        .od-chip i {
          width: 8px;
          height: 8px;
          display: inline-block;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 6px rgba(34,197,94,.14);
        }

        .od-hero h1 {
          margin: 18px 0 14px;
          font-size: clamp(34px, 5.15vw, 64px);
          line-height: 1.12;
          letter-spacing: 0;
          font-weight: 950;
        }

        .od-hero h1 span {
          display: block;
          background: linear-gradient(90deg, #fff, #c3b5e8, #fde68a);
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
        }

        .od-hero-lead {
          max-width: 720px;
          margin: 0;
          color: rgba(196, 181, 253,.9);
          font-size: clamp(14px, 1.45vw, 16px);
          line-height: 1.95;
          font-weight: 700;
        }

        .od-hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
          margin-top: 26px;
        }

        .od-button {
          border: 0;
          cursor: pointer;
          font-family: inherit;
          border-radius: 19px;
          padding: 14px 20px;
          font-size: clamp(12px, 1.25vw, 13px);
          font-weight: 950;
          line-height: 1.45;
          white-space: normal;
          transition: .25s ease;
        }

        .od-button:hover {
          transform: translateY(-2px);
        }

        .od-button--primary {
          color: white;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          box-shadow: 0 18px 38px rgba(139, 92, 246,.32);
        }

        .od-button--dark {
          color: white;
          background: #18102e;
          box-shadow: 0 16px 34px rgba(28, 17, 48,.24);
        }

        .od-button--light {
          color: #18102e;
          background: rgba(255,255,255,.92);
          box-shadow: 0 16px 34px rgba(255,255,255,.12);
        }

        .od-button--ghost {
          color: var(--od-ink);
          background: var(--od-soft);
          border: 1px solid var(--od-line);
        }

        .od-hero-note {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 15px;
          border-radius: 20px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.14);
          color: rgba(196, 181, 253,.88);
          font-size: 12px;
          font-weight: 850;
        }

        .od-command-card {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 24px;
          min-height: 360px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(18px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
        }

        .od-command-card::before {
          content: "";
          position: absolute;
          width: 270px;
          height: 270px;
          border-radius: 50%;
          left: -90px;
          bottom: -120px;
          background: radial-gradient(circle, rgba(16,185,129,.22), transparent 64%);
        }

        .od-rank {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          position: relative;
          z-index: 1;
          margin-bottom: 18px;
        }

        .od-rank span {
          color: rgba(196, 181, 253,.72);
          font-size: 11px;
          font-weight: 950;
        }

        .od-rank strong {
          color: white;
          font-size: 18px;
          font-weight: 950;
        }

        .od-main-gauge {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          width: 230px;
          height: 230px;
          margin: 10px auto 18px;
          border-radius: 50%;
          background:
            radial-gradient(circle at center, rgba(28, 17, 48,.94) 0 58%, transparent 59%),
            conic-gradient(#a855f7 0 ${progress}%, rgba(255,255,255,.16) ${progress}% 100%);
          box-shadow: 0 24px 70px rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,255,255,.14);
        }

        .od-main-gauge::before {
          content: "";
          position: absolute;
          inset: 18px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.16);
        }

        .od-main-gauge strong {
          font-size: clamp(38px, 5vw, 52px);
          line-height: 1;
          font-weight: 950;
        }

        .od-main-gauge span {
          margin-top: 8px;
          display: block;
          color: rgba(196, 181, 253,.72);
          font-size: 11px;
          font-weight: 950;
          text-align: center;
        }

        .od-command-mini {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .od-command-mini div {
          padding: 13px;
          border-radius: 20px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.12);
        }

        .od-command-mini span {
          display: block;
          color: rgba(196, 181, 253,.66);
          font-size: 10px;
          font-weight: 950;
          margin-bottom: 5px;
        }

        .od-command-mini strong {
          color: white;
          font-size: 16px;
          font-weight: 950;
        }

        .od-quote-bar {
          position: relative;
          margin: 22px 0;
          display: grid;
          place-items: center;
          min-height: clamp(148px, 18vw, 218px);
          padding: clamp(24px, 4vw, 42px);
          border-radius: clamp(26px, 3vw, 40px);
          overflow: hidden;
          isolation: isolate;
          color: #ffffff;
          background:
            radial-gradient(circle at 12% 18%, rgba(125, 92, 255, .24), transparent 30%),
            radial-gradient(circle at 86% 74%, rgba(20, 184, 166, .18), transparent 30%),
            linear-gradient(135deg, #130922 0%, #241341 42%, #071728 100%);
          border: 1px solid rgba(255, 255, 255, .18);
          box-shadow: 0 24px 70px rgba(17, 24, 39, .22);
          backdrop-filter: blur(18px);
          cursor: default;
        }

        .od-quote-bar::before {
          content: "";
          position: absolute;
          inset: 12px;
          border-radius: inherit;
          border: 1px solid rgba(255, 255, 255, .10);
          background:
            linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent),
            radial-gradient(circle at center, rgba(255,255,255,.05), transparent 58%);
          opacity: .9;
          pointer-events: none;
          z-index: -1;
        }

        .od-quote-bar::after {
          content: "";
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 999px;
          left: clamp(-120px, -8vw, -70px);
          top: clamp(-118px, -8vw, -68px);
          background: conic-gradient(from 120deg, rgba(251, 191, 36, .36), rgba(14, 165, 233, .22), rgba(168, 85, 247, .28), rgba(251, 191, 36, .36));
          filter: blur(10px);
          opacity: .62;
          animation: odQuoteOrbit 18s linear infinite;
          pointer-events: none;
        }

        .od-quote-bar.is-paused::after,
        .od-quote-bar:hover::after,
        .od-quote-bar:focus-visible::after {
          animation-play-state: paused;
        }

        .od-quote-mark {
          position: absolute;
          inset-inline-start: clamp(18px, 4vw, 44px);
          top: clamp(4px, 2vw, 20px);
          font-family: Georgia, serif;
          font-size: clamp(72px, 12vw, 150px);
          line-height: 1;
          font-weight: 900;
          color: rgba(255, 255, 255, .075);
          pointer-events: none;
          user-select: none;
        }

        @keyframes odQuoteOrbit {
          0% { transform: rotate(0deg) translate3d(0, 0, 0) scale(1); }
          35% { transform: rotate(126deg) translate3d(18px, 10px, 0) scale(1.08); }
          70% { transform: rotate(252deg) translate3d(-8px, 18px, 0) scale(.94); }
          100% { transform: rotate(360deg) translate3d(0, 0, 0) scale(1); }
        }

        .od-quote-text {
          position: relative;
          z-index: 1;
          width: min(100%, 1220px);
          margin: 0;
          color: #ffffff;
          text-shadow: 0 2px 18px rgba(0,0,0,.18);
          font-size: clamp(19px, 2.25vw, 31px);
          line-height: 1.95;
          font-weight: 850;
          letter-spacing: 0;
          text-align: center;
          text-wrap: balance;
          overflow-wrap: anywhere;
          word-break: normal;
          hyphens: auto;
          animation-duration: .72s;
          animation-timing-function: cubic-bezier(.2,.8,.2,1);
          animation-fill-mode: both;
        }

        .od-quote-text--0 { animation-name: odQuoteRise; }
        .od-quote-text--1 { animation-name: odQuoteSlideSoft; }
        .od-quote-text--2 { animation-name: odQuoteScale; }
        .od-quote-text--3 { animation-name: odQuoteFloat; }
        .od-quote-text--4 { animation-name: odQuoteReveal; }
        .od-quote-text--5 { animation-name: odQuoteFocus; }

        @keyframes odQuoteRise {
          from { opacity: 0; transform: translateY(16px); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        @keyframes odQuoteSlideSoft {
          from { opacity: 0; transform: translateX(28px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes odQuoteScale {
          from { opacity: 0; transform: scale(.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes odQuoteFloat {
          from { opacity: 0; transform: translate3d(-10px, 14px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        @keyframes odQuoteReveal {
          from { opacity: 0; clip-path: inset(0 0 100% 0); }
          to { opacity: 1; clip-path: inset(0 0 0 0); }
        }

        @keyframes odQuoteFocus {
          from { opacity: 0; letter-spacing: .08em; filter: blur(5px); }
          to { opacity: 1; letter-spacing: 0; filter: blur(0); }
        }

        .od-quote-variant-1 {
          background:
            radial-gradient(circle at 16% 84%, rgba(251, 191, 36, .18), transparent 30%),
            radial-gradient(circle at 90% 14%, rgba(59, 130, 246, .22), transparent 30%),
            linear-gradient(135deg, #0f172a 0%, #1e1b4b 48%, #111827 100%);
        }

        .od-quote-variant-2 {
          background:
            radial-gradient(circle at 82% 20%, rgba(16, 185, 129, .20), transparent 30%),
            radial-gradient(circle at 8% 80%, rgba(168, 85, 247, .22), transparent 32%),
            linear-gradient(135deg, #111827 0%, #1f2937 46%, #0f172a 100%);
        }

        .od-quote-variant-3 {
          background:
            radial-gradient(circle at 12% 18%, rgba(244, 114, 182, .18), transparent 30%),
            radial-gradient(circle at 88% 78%, rgba(34, 211, 238, .18), transparent 32%),
            linear-gradient(135deg, #1e102d 0%, #2e1065 46%, #07111f 100%);
        }

        .od-quote-variant-4 {
          background:
            radial-gradient(circle at 15% 20%, rgba(245, 158, 11, .20), transparent 30%),
            radial-gradient(circle at 82% 75%, rgba(99, 102, 241, .22), transparent 32%),
            linear-gradient(135deg, #1c1917 0%, #292524 45%, #111827 100%);
        }

        .od-quote-variant-5 {
          background:
            radial-gradient(circle at 18% 80%, rgba(45, 212, 191, .18), transparent 30%),
            radial-gradient(circle at 86% 18%, rgba(232, 121, 249, .18), transparent 32%),
            linear-gradient(135deg, #082f49 0%, #172554 44%, #12091f 100%);
        }

        .od-timer-command {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 22px;
          align-items: stretch;
          margin: 18px 0;
          padding: 20px;
          border-radius: 36px;
          background: var(--od-soft);
          border: 1px solid var(--od-line);
          box-shadow: 0 22px 70px rgba(28, 17, 48,.08);
          backdrop-filter: blur(20px);
        }

        .od-timer-orbit {
          position: relative;
          min-height: 315px;
          display: grid;
          place-items: center;
          border-radius: 30px;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 50%, rgba(139, 92, 246,.16), transparent 58%),
            linear-gradient(145deg, #18102e, #281748);
        }

        .od-timer-orbit::before,
        .od-timer-orbit::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.16);
        }

        .od-timer-orbit::before {
          width: 230px;
          height: 230px;
          animation: odOrbit 7s linear infinite;
        }

        .od-timer-orbit::after {
          width: 285px;
          height: 90px;
          transform: rotate(-18deg);
          animation: odOrbit 11s linear infinite reverse;
        }

        @keyframes odOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .od-live-core {
          position: relative;
          z-index: 1;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 18px;
          background:
            radial-gradient(circle at 40% 32%, rgba(255,255,255,.9), rgba(255,255,255,.18) 18%, transparent 46%),
            conic-gradient(from 0deg, #8b5cf6, #7c3aed, #10b981, #a855f7, #8b5cf6);
          box-shadow: 0 26px 70px rgba(139, 92, 246,.28);
        }

        .od-live-core--idle {
          filter: grayscale(.45);
        }

        .od-live-core--paused {
          filter: grayscale(.82);
        }

        .od-live-core span {
          display: block;
          color: rgba(255,255,255,.86);
          font-size: 11px;
          font-weight: 950;
        }

        .od-live-core strong {
          display: block;
          margin: 8px 0;
          color: white;
          font-size: 34px;
          font-weight: 950;
          text-shadow: 0 10px 24px rgba(28, 17, 48,.32);
        }

        .od-live-core small {
          color: rgba(255,255,255,.82);
          font-size: 10px;
          font-weight: 900;
        }

        .od-timer-content {
          padding: 10px 6px;
        }

        .od-section-kicker {
          display: inline-flex;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          color: #6d28d9;
          background: rgba(139, 92, 246,.1);
          font-size: 11px;
          font-weight: 950;
          margin-bottom: 10px;
        }

        .od-timer-content h2,
        .od-section-head h2 {
          margin: 0;
          color: #18102e;
          font-size: clamp(24px, 3vw, 38px);
          line-height: 1.25;
          letter-spacing: 0;
          font-weight: 950;
        }

        .od-timer-content p,
        .od-section-head p {
          margin: 12px 0 0;
          color: #7a6c9a;
          font-size: 14px;
          line-height: 1.9;
          font-weight: 750;
        }

        .od-timer-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 18px 0;
        }

        .od-stat-card {
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          min-height: 126px;
          padding: 15px;
          border-radius: 24px;
          background: white;
          border: 1px solid rgba(167, 139, 250,.18);
          box-shadow: 0 14px 35px rgba(28, 17, 48,.06);
        }

        .od-stat-card::before {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          left: -36px;
          bottom: -48px;
          opacity: .16;
          background: currentColor;
        }

        .od-stat-card--indigo { color: #8b5cf6; }
        .od-stat-card--violet { color: #7c3aed; }
        .od-stat-card--emerald { color: #10b981; }
        .od-stat-card--amber { color: #a855f7; }
        .od-stat-card--slate { color: #463c63; }
        .od-stat-card--rose { color: #e11d48; }

        .od-stat-card span {
          display: block;
          color: #7a6c9a;
          font-size: 10px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .od-stat-card strong {
          display: block;
          color: #18102e;
          font-size: 21px;
          font-weight: 950;
          line-height: 1.25;
        }

        .od-stat-card small {
          display: block;
          margin-top: 8px;
          color: #9d8fc0;
          font-size: 10px;
          font-weight: 850;
          line-height: 1.5;
        }

        .od-stat-card i {
          font-style: normal;
          font-size: 25px;
        }

        .od-progress-line {
          padding: 15px;
          border-radius: 22px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .od-progress-line > div:first-child {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 9px;
        }

        .od-progress-line span {
          color: #7a6c9a;
          font-size: 11px;
          font-weight: 950;
        }

        .od-progress-line strong {
          color: #18102e;
          font-size: 14px;
          font-weight: 950;
        }

        .od-progress-track {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(167, 139, 250,.18);
        }

        .od-progress-track b {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #8b5cf6, #7c3aed, #a855f7);
          box-shadow: 0 8px 24px rgba(139, 92, 246,.22);
        }

        .od-progress-line small {
          display: block;
          margin-top: 8px;
          color: #7a6c9a;
          font-size: 11px;
          font-weight: 800;
        }

        .od-timer-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .od-section-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: end;
          margin: 28px 0 16px;
        }

        .od-section-head small {
          color: #7a6c9a;
          font-size: 12px;
          font-weight: 900;
        }

        .od-feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .od-feature-card {
          position: relative;
          min-height: 260px;
          overflow: hidden;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          border: 0;
          padding: 22px;
          border-radius: 30px;
          background: var(--od-soft);
          border: 1px solid rgba(255,255,255,.95);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.08);
          transition: .28s ease;
          display: flex;
          flex-direction: column;
        }

        .od-feature-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 28px 70px rgba(139, 92, 246,.14);
        }

        .od-feature-card::before {
          content: "";
          position: absolute;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          left: -70px;
          bottom: -90px;
          opacity: .14;
          background: currentColor;
        }

        .od-feature-card--indigo { color: #8b5cf6; }
        .od-feature-card--violet { color: #7c3aed; }
        .od-feature-card--emerald { color: #10b981; }
        .od-feature-card--amber { color: #a855f7; }
        .od-feature-card--slate { color: #463c63; }
        .od-feature-card--rose { color: #e11d48; }

        .od-feature-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .od-feature-badge {
          display: inline-flex;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(28, 17, 48,.06);
          color: #5b4f78;
          font-size: 10px;
          font-weight: 950;
        }

        .od-feature-icon {
          width: 54px;
          height: 54px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          background: currentColor;
          color: white;
          font-size: 22px;
          font-weight: 950;
          box-shadow: 0 14px 30px rgba(28, 17, 48,.1);
          overflow: hidden;
        }

        .od-feature-icon--logo {
          background: #ffffff;
          padding: 0;
          color: inherit;
        }

        .od-feature-icon img,
        .od-quote-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .od-feature-card h3 {
          position: relative;
          z-index: 1;
          margin: 24px 0 10px;
          color: #18102e;
          font-size: clamp(18px, 2vw, 22px);
          line-height: 1.42;
          font-weight: 950;
        }

        .od-feature-card p {
          position: relative;
          z-index: 1;
          margin: 0;
          color: #7a6c9a;
          font-size: clamp(12px, 1.28vw, 13px);
          line-height: 1.85;
          font-weight: 700;
        }

        .od-feature-bottom {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-top: auto;
          padding-top: 20px;
        }

        .od-feature-bottom span {
          color: #7a6c9a;
          font-size: 11px;
          font-weight: 950;
        }

        .od-feature-bottom b {
          color: currentColor;
          font-size: 11px;
          font-weight: 950;
        }

        .od-lab-strip {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 16px;
        }

        .od-lab-card {
          padding: 24px;
          border-radius: 32px;
          background: var(--od-soft);
          border: 1px solid var(--od-line);
          box-shadow: 0 18px 52px rgba(28, 17, 48,.07);
          backdrop-filter: blur(18px);
        }

        .od-lab-card h3 {
          margin: 0 0 10px;
          color: var(--od-ink);
          font-size: 22px;
          line-height: 1.35;
          font-weight: 950;
        }

        .od-lab-card p {
          margin: 0;
          color: #7a6c9a;
          font-size: 13px;
          line-height: 1.9;
          font-weight: 750;
        }

        .od-milestones {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .od-milestone {
          padding: 13px 10px;
          border-radius: 20px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
          text-align: center;
        }

        .od-milestone.is-done {
          background: #ecfdf5;
          border-color: rgba(16,185,129,.22);
        }

        .od-milestone strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          font-weight: 950;
        }

        .od-milestone span {
          display: block;
          margin-top: 5px;
          color: #7a6c9a;
          font-size: 10px;
          font-weight: 850;
        }

        @media (max-width: 1050px) {
          .od-hero-inner,
          .od-timer-command,
          .od-lab-strip {
            grid-template-columns: 1fr;
          }

          .od-feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .od-timer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .od-home-v2 {
            padding: 16px 10px 48px;
          }

          .od-hero {
            border-radius: 30px;
            padding: 24px;
          }

          .od-command-card {
            border-radius: 28px;
          }

          .od-main-gauge {
            width: 200px;
            height: 200px;
          }

          .od-feature-grid,
          .od-timer-grid,
          .od-milestones {
            grid-template-columns: 1fr;
          }

          .od-section-head {
            grid-template-columns: 1fr;
          }

          .od-quote-bar {
            min-height: 168px;
            padding: 24px 18px;
            border-radius: 26px;
          }

          .od-quote-text {
            font-size: clamp(17px, 5vw, 22px);
            line-height: 1.9;
            text-align: start;
          }

          .od-command-mini {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="od-home-wrap">
        <header className="od-hero">
          <div className="od-hero-inner">
            <div>
              <div className="od-chip">
                <i />
                مرحبًا {userName || "زميل المهنة"} · منصة هندسة التطوير التنظيمي
              </div>

              <h1>
                إتقان هندسة
                <span>التطوير التنظيمي</span>
              </h1>

              <p className="od-hero-lead">
                منصة تعليمية احترافية تجمع رحلة معرفية من ستة أشهر، رادار أداء، محاكاة قرار، موجهًا ذكيًا، وسجل إتقان يوثق أيامك وساعاتك الفعلية داخل المنصة.
              </p>

              <div className="od-hero-actions">
                <button type="button" className="od-button od-button--primary" onClick={() => setActivePage("journey")}>
                  ابدأ رحلة التعلّم
                </button>

                <button type="button" className="od-button od-button--light" onClick={() => setActivePage("radar")}>
                  افحص رادار الأداء
                </button>

                <div className="od-hero-note">
                  ⏱️ وقتك المحتسب الآن: <strong>{formatDuration(timer.totalSeconds, true)}</strong>
                </div>
              </div>
            </div>

            <aside className="od-command-card">
              <div className="od-rank">
                <div>
                  <span>رتبتك المعرفية الحالية</span>
                  <strong>{learningRank}</strong>
                </div>
                <div>
                  <span>سلسلة التعلم</span>
                  <strong>{timer.streakDays} يوم</strong>
                </div>
              </div>

              <div
                className="od-main-gauge od-circular-indicator od-indicator-general"
                style={{ "--od-indicator-progress": `${progress}%` }}
              >
                <div>
                  <strong>{progress}%</strong>
                  <span>إنجاز الرحلة التعليمية</span>
                </div>
              </div>

              <div className="od-command-mini">
                <div>
                  <span>أيام مكتملة</span>
                  <strong>{safeCompletedDays} / {safeTotalDays}</strong>
                </div>
                <div>
                  <span>ساعات محتسبة</span>
                  <strong>{timer.completedHours} ساعة</strong>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <section
          className={`od-quote-bar ${isQuotePaused ? "is-paused" : ""} od-quote-variant-${quoteVariant}`}
          onMouseEnter={() => setIsQuotePaused(true)}
          onMouseLeave={() => setIsQuotePaused(false)}
          onFocus={() => setIsQuotePaused(true)}
          onBlur={() => setIsQuotePaused(false)}
          tabIndex={0}
          aria-label="اقتباس معرفي متجدد"
        >
          <span className="od-quote-mark" aria-hidden="true">“</span>
          <p key={quoteIndex} className={`od-quote-text od-quote-text--${quoteVariant}`}>{quote}</p>
        </section>

        <TimerCommandCenter
          timer={timer}
          onPause={pause}
          onResume={resume}
          onResetToday={resetToday}
        />

        <div className="od-section-head">
          <div>
            <div className="od-section-kicker">مركز التحكم</div>
            <h2>أقسام المنصة</h2>
            <p>كل قسم ليس صفحة عادية؛ بل أداة مختلفة لبناء عقلية ممارس تطوير تنظيمي محترف.</p>
          </div>
          <small>اختر بوابتك التالية</small>
        </div>

        <section className="od-feature-grid">
          {cards.map((card) => (
            <FeatureCard
              key={card.page}
              card={card}
              metric={cardMetric(card.page)}
              onOpen={() => setActivePage(card.page)}
            />
          ))}
        </section>

        <section className="od-lab-strip">
          <div className="od-lab-card">
            <div className="od-section-kicker">مؤشرات الإتقان</div>
            <h3>المنصة لا تقيس الحضور فقط، بل تبني أثرًا قابلًا للتوثيق</h3>
            <p>
              العداد يحسب الوقت النشط، الرحلة تقيس الأيام المكتملة، ووثيقة الإتقان تجمع الساعات والإنجازات. الهدف أن يصبح التعلم قابلًا للقراءة، لا مجرد تصفح عابر.
            </p>

            <div className="od-milestones">
              {[1, 5, 10, 25, 50].map((hour) => (
                <div key={hour} className={`od-milestone ${timer.completedHours >= hour ? "is-done" : ""}`}>
                  <strong>{hour} س</strong>
                  <span>{timer.completedHours >= hour ? "مكتمل" : "قادم"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="od-lab-card">
            <div className="od-section-kicker">اقتراح ذكي</div>
            <h3>ماذا تفعل الآن؟</h3>
            <p>
              {progress < 10
                ? "ابدأ من الرحلة التعليمية ولا تتشتت بين الأقسام. ابنِ الأساس أولًا."
                : progress < 60
                  ? "وازن بين الدروس ورادار الأداء. اقرأ، ثم اختبر تفكيرك بالمواقف."
                  : "اقتربت من مرحلة الإتقان. ركّز على المحاكاة ووثيقة الإتقان ومشروعك التطبيقي."}
            </p>

            <div className="od-timer-actions">
              <button type="button" className="od-button od-button--primary" onClick={() => setActivePage("journey")}>
                متابعة الرحلة
              </button>

              <button type="button" className="od-button od-button--ghost" onClick={() => setActivePage("mastery")}>
                فتح وثيقة الإتقان
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
