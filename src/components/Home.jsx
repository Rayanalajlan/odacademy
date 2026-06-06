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
    text: "180 يومًا موزعة على 6 أشهر، من العقل التشخيصي إلى الاحتراف كممارس OD.",
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

const insights = [
  "القيمة الحقيقية للتعلم تظهر حين يتغير قرارك لا حين تزداد ملاحظاتك.",
  "ابدأ صغيرًا، لكن لا تبدأ عشوائيًا؛ الفوضى تكبر مثل الخطة تمامًا.",
  "كل منظمة تقول ما تؤمن به، لكنها تعمل بما تكافئه.",
  "الفريق لا يحتاج صوتًا أعلى؛ يحتاج معنى أوضح.",
  "حين يتكرر العطل، فتش عن النظام قبل أن تفتش عن الأشخاص.",
  "القرار الجيد لا يلمع في الاجتماع فقط؛ يصمد عند التنفيذ.",
  "ما لا تفهمه بهدوء ستعالجه بعجلة، والعجلة تُخفي السبب.",
  "التغيير ليس إعلانًا جديدًا، بل عادة جديدة تجد من يحميها.",
  "أقوى القادة لا يملكون كل الإجابات، لكنهم يحسنون طرح السؤال الصحيح.",
  "المنظمة التي لا تتعلم من يومها تعيد أخطاء أمس بأسماء حديثة.",
  "لا تقيس النشاط وحده؛ اسأل ماذا تغيّر بعده.",
  "كل فجوة أداء تحمل رسالة من التصميم الداخلي للعمل.",
  "التواصل ليس كثرة رسائل، بل قلة سوء فهم.",
  "حين يتضح الدور، يقل الاحتكاك ويزيد الإنجاز.",
  "الثقافة لا تُكتب على الجدار؛ تُرى في لحظة الضغط.",
  "أحيانًا يكون الحل في إزالة عائق لا في إضافة مبادرة.",
  "لا تطلب من الناس التميز داخل نظام يكافئ النجاة فقط.",
  "الاستماع العميق يوفر أشهرًا من التجارب الخاطئة.",
  "كل مؤشر بلا قرار يتحول إلى زينة رقمية.",
  "التحسين الحقيقي يبدأ حين نتوقف عن الدفاع عن الوضع الحالي.",
  "ما لا يُشرح ببساطة لم يُفهم بما يكفي.",
  "الممارس الناضج يرى العلاقة بين السلوك والسياسة والمكافأة.",
  "لا تعالج العرض بملصق جميل؛ ابحث عن الجذر الهادئ.",
  "التغيير الناجح لا يطلب من الناس القفز قبل أن يرى الجسر.",
  "السرعة مهمة، لكن الاتجاه أهم منها.",
  "كل اجتماع بلا قرار واضح يضيف ضبابًا جديدًا للنظام.",
  "حين تصبح القيم مكلفة، يظهر المؤمنون بها فعلًا.",
  "التطوير التنظيمي الجيد يقلل البطولة الفردية ويزيد قوة النظام.",
  "لا تجعل الحماس بديلًا عن التصميم.",
  "الفهم نصف العلاج، والنصف الآخر شجاعة التطبيق.",
  "البيانات لا تتكلم وحدها؛ تحتاج عقلًا يعرف ماذا يسألها.",
  "كل عادة تنظيمية بدأت يومًا كاستثناء تكرر كثيرًا.",
  "القياس الجيد لا يعاقب الناس؛ يكشف الطريق.",
  "لا تنقل حل منظمة أخرى قبل أن تفهم ألم منظمتك.",
  "أقصر طريق للفشل أن نطبق وصفة ناجحة في سياق مختلف.",
  "القائد الحكيم لا يملأ الفراغ بالضجيج، بل بالوضوح.",
  "قبل أن تدرب الفريق، تأكد أن بيئة العمل تسمح بما تعلمه.",
  "النية الطيبة لا تكفي إذا كان النظام يدفع الناس للعكس.",
  "المشكلة التي لا يملكها أحد ستبقى ضيفة دائمة.",
  "كل تحول يبدأ بسؤال صادق لا بإجابة جاهزة.",
  "لا تطارد كل رقم؛ اختر الرقم الذي يغير السلوك.",
  "الإنجاز المستدام يحتاج إيقاعًا لا اندفاعًا.",
  "أحيانًا يكون أعظم تطوير هو أن تقول: هذا لا يخدم الهدف.",
  "المنظمة القوية تعرف أين تتنازل وأين لا تساوم.",
  "كل خطة لا تعيش في التقويم ستبقى في العرض التقديمي.",
  "المعرفة التي لا تدخل العمل تصبح زخرفة ذهنية.",
  "لا تحكم على الناس قبل أن ترى القيود التي يعملون داخلها.",
  "التحسين يبدأ حين تصبح الحقيقة أقل تهديدًا وأكثر فائدة.",
  "الجودة ليست مرحلة أخيرة؛ هي طريقة تفكير منذ البداية.",
  "كل قرار غامض يخلق عشر تفسيرات متعبة.",
  "حين تتكرر الاستثناءات، فهي لم تعد استثناءات بل سياسة غير مكتوبة.",
  "التطوير الهادئ أعمق من التغيير الصاخب.",
  "اسأل عن السبب الثالث؛ غالبًا الأولان مجرد قشرة.",
  "الأداء لا يتحسن بالخوف؛ يتحسن بالمعنى والقدرة والمساءلة.",
  "لا تصمم تجربة تعلم جميلة ثم تترك المتعلم وحيدًا بعد النهاية.",
  "حين يعرف الناس لماذا، يحتملون كيف أكثر.",
  "المنظمات تنمو بقدر ما تتحمل من صراحة محترمة.",
  "لا تبحث عن الالتزام قبل أن توضح التوقع.",
  "أفضل حل هو الذي يقلل الاعتماد على التذكير المستمر.",
  "كل عملية معقدة أكثر من اللازم تخفي فرصة تبسيط.",
  "التعلم الجاد يغير مفرداتك ثم يغير قراراتك.",
  "الاستراتيجية التي لا يعرفها الصف الأول لم تغادر المكتب بعد.",
  "الوضوح عدالة؛ لأنه يقلل التخمين ويزيد الثقة.",
  "لا تطلب ابتكارًا من بيئة تعاقب السؤال.",
  "التجربة الصغيرة الصادقة أفضل من خطة كبيرة لا تبدأ.",
  "كل مؤشر أداء يجب أن يجيب: ماذا سنفعل لو تغير؟",
  "العمل الجيد ليس أن تنشغل أكثر؛ بل أن تؤثر بوعي أكبر.",
  "ثقافة المنظمة هي ما يحدث عندما لا يراقب أحد.",
  "التحول الحقيقي يغير المحادثات اليومية قبل الشعارات الرسمية.",
  "لا تجعل التدريب تعويضًا عن ضعف الإدارة.",
  "حين يتضح الهدف، يصبح الرفض أسهل والاختيار أنضج.",
  "الممارس الممتاز يبني الثقة قبل أن يطلب التغيير.",
  "كل مقاومة تحمل معلومة؛ لا تهدرها بالغضب.",
  "التغيير الذي لا يحترم تعب الناس سيواجه صمتهم قبل رفضهم.",
  "النظام الجيد يجعل التصرف الصحيح أسهل من الخاطئ.",
  "لا تجعل الأدوات تقود التفكير؛ دع المشكلة تقود اختيار الأداة.",
  "أفضل الأسئلة هي التي تجعل الفريق يرى ما كان أمامه طوال الوقت.",
  "المخرجات الضعيفة غالبًا تبدأ من مدخلات غامضة.",
  "لا يوجد تحسين بلا ترك شيء اعتدنا عليه.",
  "القائد الذي يسمع مبكرًا يدفع أقل لاحقًا.",
  "كل مشروع تغيير يحتاج مالكًا، لا مشجعين فقط.",
  "المهارة تنمو بالتكرار الواعي لا بالتكرار الآلي.",
  "المنظمة التي تخاف من القياس تخاف غالبًا من الحقيقة.",
  "لا تخلط بين الهدوء والرضا؛ بعض الصمت علامة تعب.",
  "التطوير التنظيمي يبدأ من احترام الواقع لا الهروب منه.",
  "كل قرار مؤجل يصبح تكلفة مخفية.",
  "حين تُبنى الثقة، تصبح الملاحظات وقودًا لا تهديدًا.",
  "لا تكثر المبادرات حتى لا يموت المهم تحت ازدحام الجيد.",
  "الفريق يحتاج مساحة آمنة، لكنه يحتاج معيارًا واضحًا أيضًا.",
  "الحل المستدام يعلّم النظام كيف يصلح نفسه.",
  "كل تغيير بلا متابعة يتحول إلى ذكرى جميلة.",
  "التعلم لا يكتمل عند الفهم؛ يكتمل عند السلوك.",
  "من لا يرى العلاقات بين الأشياء سيعالج كل عرض وحده.",
  "التحسين لا يحب الغموض؛ أعطه هدفًا وحدودًا ومالكًا.",
  "في كل منظمة قصة رسمية وقصة يومية؛ ابدأ من اليومية.",
  "لا تجعل الخبرة القديمة تمنعك من سؤال جديد.",
  "التدرج ليس بطئًا؛ أحيانًا هو احترام لطبيعة النظام.",
  "الأثر لا ينتج من كثرة الكلام، بل من وضوح الالتزام.",
  "حين تتعارض الرسائل مع المكافآت، تنتصر المكافآت.",
  "كل تصميم عمل يعلّم الناس سلوكًا ما؛ اختر ما تريد تعليمه.",
  "الإنصات ليس توقفًا عن الكلام فقط، بل توقف عن افتراض الإجابة.",
  "لا تطلب جودة عالية من عملية لا تملك وقتًا للتعلم.",
  "المشكلة الواضحة نصف اجتماع ناجح.",
  "كل نظام له ذاكرة؛ لا تتجاهل تجاربه السابقة.",
  "التحول لا يحتاج بطولة يومية إذا صُمم بذكاء.",
  "الناس يدعمون ما يفهمونه ويثقون بعدالته.",
  "لا تجعل اللغة الكبيرة تخفي الفكرة الصغيرة.",
  "عندما يتكرر السؤال نفسه، فالمعلومة ليست في مكانها الصحيح.",
  "كل فجوة بين القول والفعل تخصم من رصيد الثقة.",
  "المبادرة الناجحة تترك أثرًا بعد أن تنتهي الحملة.",
  "إذا لم تعرف من يتأثر بالقرار، فأنت لم تكمل التفكير.",
  "التطوير الحقيقي يجعل العمل أكثر وضوحًا لا أكثر تعقيدًا.",
  "الخطأ فرصة تعلم فقط عندما لا نخاف من تسميته.",
  "لا تحل مشكلة بسرعة تجعلها تعود بألم أكبر.",
  "كل منظمة تحتاج من يترجم الطموح إلى سلوك يومي.",
  "التحسين الهادئ يبني سمعة لا تحتاج إعلانًا كثيرًا.",
  "لا تحكم على فكرة من أول ارتباك؛ بعض النمو يبدأ مرتبكًا.",
  "القرار الجريء ليس الأعلى صوتًا، بل الأكثر مسؤولية.",
  "حين يصبح الهدف مشتركًا، تقل لعبة اللوم.",
  "الفريق الناضج يختلف بوضوح ويتفق بمسؤولية.",
  "لا تقيس الحضور ثم تسميه أثرًا.",
  "العمل الذي لا يملك تعريفًا للنجاح سيفشل في إرضاء الجميع.",
  "كل قاعدة لا يفهمها الناس ستُلتف حولها يومًا ما.",
  "المسؤولية لا تعني اللوم؛ تعني وضوح من يملك الخطوة التالية.",
  "التعلم الفردي مهم، لكن التعلم التنظيمي يغير اللعبة.",
  "لا تزرع فكرة في أرض لا تسمح بنموها.",
  "الأسئلة الجيدة تمنح الفريق مرآة لا سوطًا.",
  "كل نظام يكافئ شيئًا ما؛ راقب المكافآت تفهم السلوك.",
  "الخطوة الأولى ليست دائمًا الحل، أحيانًا هي تسمية الواقع.",
  "لا تجعل لوحة المؤشرات بديلاً عن المحادثة الصادقة.",
  "الإدارة الجيدة تجعل التعقيد قابلًا للفهم والعمل.",
  "عندما تتضح الأولويات، يقل الإرهاق الناتج عن كل شيء مهم.",
  "التغيير الذي لا يملك قصة مفهومة سيُقاوم حتى لو كان صحيحًا.",
  "كل تحسين يبدأ بتواضع الاعتراف أن الطريقة الحالية ليست النهاية.",
  "المنظمة لا تتغير لأنها سمعت فكرة، بل لأنها أعادت ترتيب عملها حولها.",
  "لا تطلب سرعة من فريق لا يرى الطريق.",
  "الممارسة تبني الثقة أكثر مما تفعل الشعارات.",
  "كل قرار يحتاج ذاكرة: لماذا اخترناه وماذا تعلمنا منه؟",
  "المؤشرات الضعيفة تجعل الناس يتقنون اللعبة بدل العمل.",
  "الجودة تبدأ من تعريف واضح لما لا نقبله.",
  "كل مشروع بلا إغلاق واضح يترك ضبابًا للذي بعده.",
  "التحسين ليس نقدًا للأشخاص؛ هو احترام للعملاء والزملاء والوقت.",
  "عندما يتكرر التصعيد، راجع حدود الصلاحية لا صبر الناس فقط.",
  "المنظمات الذكية تجعل المعرفة تنتقل قبل أن يغادر أصحابها.",
  "لا تبنِ حلًا لا يستطيع الفريق صيانته بعدك.",
  "القرار المتوازن يسمع الإنسان والرقم والسياق معًا.",
  "كل ورشة بلا تطبيق لاحق تبقى حديثًا جميلًا.",
  "القيادة ليست أن تعرف أكثر، بل أن تجعل الفريق يرى أوضح.",
  "التغيير الجيد يخفف مقاومة المستقبل لا يكتفي بإطفاء حريق اليوم.",
  "الخطط القوية تعرف ماذا ستفعل وماذا لن تفعل.",
  "كل بيئة عمل تصنع نوعًا من الناس؛ انتبه لما تصنعه.",
  "التحسين يحتاج إيقاع متابعة، لا لحظة حماس فقط.",
  "إذا تعذر الشرح، تعذر التبني.",
  "المسار الواضح يقلل العبء الذهني ويزيد جودة القرار.",
  "لا تعامل كل مشكلة كأنها نقص تدريب؛ أحيانًا هي نقص تصميم.",
  "كل ملاحظة صادقة هي هدية تحتاج نضجًا لتُفتح.",
  "المنظمة القوية لا تخلو من الخلاف؛ لكنها تعرف كيف تديره.",
  "التأثير لا يبدأ عندما تتكلم، بل عندما يفهم الآخر لماذا يعنيه الأمر.",
  "العمل العميق يحتاج حماية من الضجيج الداخلي.",
  "لا تطلب تعاونًا من أهداف متصارعة.",
  "عندما لا يعرف الناس الأولوية، يصبح كل طلب طارئًا.",
  "التجربة لا تعلّم وحدها؛ التأمل بعدها هو المعلم الحقيقي.",
  "كل نظام عمل يملك ظلالًا؛ مهمة الممارس أن يراها قبل أن تكبر.",
  "الحكمة أن تعرف متى تضيف ومتى تحذف.",
  "التحسين الذي لا يلمسه المستخدم النهائي يحتاج إعادة نظر.",
  "لا تجعل لوحة جميلة تخفي تجربة متعبة.",
  "القوة الهادئة في المنظمة اسمها وضوح المسؤوليات.",
  "كل وعد تنظيمي يحتاج آلية تحميه من النسيان.",
  "الأسلوب المهني لا يعني البرود؛ يعني احترام الحقيقة والناس معًا.",
  "المنظمة التي تتعلم أسرع تخطئ أقل بالطريقة نفسها.",
  "القرار السليم لا يكتمل حتى يعرف الجميع أثره على عملهم.",
  "حين يصعب التنفيذ، اسأل: هل صممنا الطريق أم تمنينا الوصول؟",
  "كل مبادرة ينبغي أن تجيب: ما السلوك الذي نريد رؤيته غدًا؟",
  "التغيير لا يحتاج أن يرضي الجميع، لكنه يحتاج أن يكون مفهومًا وعادلًا.",
  "التحسين الصغير المتكرر يهزم الحملة الكبيرة المنقطعة.",
  "لا تترك القيم وحيدة؛ اربطها بالاختيار والترقية والمكافأة.",
  "الفريق الذي يملك لغة مشتركة يحل مشكلاته بسرعة أكبر.",
  "كل اجتماع يجب أن يقلل الغموض أو لا يستحق الوقت.",
  "التعلم الحقيقي يجعل الإنسان أكثر دقة لا أكثر تعاليًا.",
  "لا تستعجل النتيجة قبل أن تجهز شروطها.",
  "المنظمة التي لا توثق تعلمها تدفع ثمن الدرس أكثر من مرة.",
  "كل مشكلة مزمنة تعيش لأنها وجدت بيئة تسمح لها بالبقاء.",
  "التطوير الناجح يحول النية إلى عادة، والعادة إلى معيار.",
  "إذا أردت تغيير السلوك، غيّر الإشارة والسهولة والمكافأة.",
  "المعرفة لا تكفي؛ يحتاجها الناس في اللحظة التي يقررون فيها.",
  "الفرق بين الفكرة والأثر هو الانضباط الهادئ.",
  "كل نظام يتكلم من خلال نتائجه، حتى لو قالت العروض شيئًا آخر.",
  "لا تبنِ الثقة بالمواعظ؛ ابنها بالتوقعات الواضحة والوفاء بها.",
  "التحسين يبدأ عندما يصبح السؤال: ماذا تعلمنا؟ لا: من أخطأ؟",
  "المبادرة التي لا تملك صاحبًا واضحًا ستعيش ضيفة ثم تختفي.",
  "العمل الجيد لا يحتاج دائمًا المزيد؛ يحتاج أحيانًا أقل لكن أعمق.",
  "كل تحول مستدام يحترم ثلاثية الإنسان والنظام والنتيجة.",
  "كلما زاد الغموض، زادت الحاجة إلى قيادة هادئة لا إلى ضجيج إضافي.",
  "لا تجعل رحلة التعلم سباقًا؛ اجعلها بناءً يتقوى كل يوم.",
  "التطوير التنظيمي فن رؤية الخيوط التي تربط القرار بالسلوك بالأثر.",
  "ما يتكرر بلا مساءلة يصبح ثقافة، حتى لو لم نسمه كذلك.",
  "الأثر العظيم يبدأ غالبًا من سؤال صغير طُرح في الوقت المناسب.",
  "من لا يحسن قراءة الصمت سيفاجأ متأخرًا بالضجيج.",
  "كل فكرة عظيمة تحتاج لغة بسيطة كي تجد طريقها للناس.",
  "التطوير ليس أن تبدو المنظمة أحدث؛ بل أن تصبح أقدر."
];

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

export default function Home({ userName, setActivePage, completedDays = 0, totalDays = 180 }) {
  const safeTotalDays = totalDays > 0 ? totalDays : 180;
  const safeCompletedDays = Math.max(0, Math.min(completedDays || 0, safeTotalDays));
  const progress = Math.round((safeCompletedDays / safeTotalDays) * 100);

  const { snapshot: timer, pause, resume, resetToday } = useLearningTimer();

  const initialQuoteIndex = useMemo(() => {
    return Math.abs(Math.floor((safeCompletedDays + timer.completedHours) % insights.length));
  }, [safeCompletedDays, timer.completedHours]);

  const [quoteIndex, setQuoteIndex] = useState(initialQuoteIndex);
  const [isQuotePaused, setIsQuotePaused] = useState(false);

  useEffect(() => {
    setQuoteIndex(initialQuoteIndex);
  }, [initialQuoteIndex]);

  useEffect(() => {
    if (isQuotePaused || typeof window === "undefined") return undefined;

    const intervalId = window.setInterval(() => {
      setQuoteIndex((currentIndex) => (currentIndex + 1) % insights.length);
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, [isQuotePaused]);

  const quote = insights[quoteIndex % insights.length];

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
          --od-ink: #18102e;
          --od-muted: #7a6c9a;
          --od-soft: rgba(255,255,255,.76);
          --od-line: rgba(167, 139, 250,.22);
          --od-indigo: #8b5cf6;
          --od-violet: #7c3aed;
          --od-emerald: #10b981;
          --od-amber: #a855f7;
          --od-rose: #e11d48;
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          padding: 28px 16px 80px;
          color: var(--od-ink);
          font-size: clamp(15px, 1.05vw, 17px);
          line-height: 1.75;
          background:
            radial-gradient(circle at 14% 12%, rgba(139, 92, 246,.18), transparent 28%),
            radial-gradient(circle at 82% 10%, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at 52% 92%, rgba(16,185,129,.12), transparent 32%),
            linear-gradient(135deg, #f4f0fb 0%, #efe9fb 52%, #fff7ed 100%);
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
          color: #463c63;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(167, 139, 250,.26);
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
          margin: 20px 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 18px;
          align-items: center;
          min-height: 172px;
          padding: clamp(20px, 3vw, 30px);
          border-radius: 32px;
          overflow: hidden;
          color: #fff7ed;
          background:
            radial-gradient(circle at 8% 0%, rgba(251, 191, 36, .28), transparent 32%),
            radial-gradient(circle at 92% 100%, rgba(139, 92, 246, .35), transparent 34%),
            linear-gradient(135deg, #24143f 0%, #3b1d6e 55%, #18102e 100%);
          border: 1px solid rgba(255, 255, 255, .16);
          box-shadow: 0 24px 70px rgba(28, 17, 48, .18);
          backdrop-filter: blur(18px);
          isolation: isolate;
        }

        .od-quote-bar::before {
          content: "";
          position: absolute;
          inset: 12px;
          border-radius: 26px;
          border: 1px solid rgba(255, 255, 255, .10);
          pointer-events: none;
          z-index: -1;
        }

        .od-quote-bar::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          left: -72px;
          top: -84px;
          background: conic-gradient(from 120deg, rgba(251, 191, 36, .35), rgba(139, 92, 246, .22), rgba(16, 185, 129, .16), rgba(251, 191, 36, .35));
          filter: blur(3px);
          opacity: .74;
          animation: odQuoteGlow 16s linear infinite;
          pointer-events: none;
        }

        .od-quote-bar.is-paused::after,
        .od-quote-bar:hover::after,
        .od-quote-bar:focus-visible::after {
          animation-play-state: paused;
        }

        @keyframes odQuoteGlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .od-quote-copy {
          min-width: 0;
        }

        .od-quote-kicker {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .od-quote-kicker span {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          border-radius: 999px;
          padding: 7px 11px;
          color: #fde68a;
          background: rgba(255, 255, 255, .11);
          border: 1px solid rgba(255, 255, 255, .14);
          font-size: clamp(11px, 1.5vw, 12px);
          font-weight: 950;
        }

        .od-quote-kicker small {
          color: rgba(237, 233, 254, .72);
          font-size: clamp(10px, 1.4vw, 12px);
          font-weight: 850;
        }

        .od-quote-text {
          margin: 0;
          color: #ffffff;
          font-size: clamp(18px, 2.35vw, 26px);
          line-height: 1.85;
          font-weight: 850;
          letter-spacing: 0;
          text-wrap: pretty;
          overflow-wrap: break-word;
          word-break: normal;
          animation: odQuoteTextIn .46s ease both;
        }

        @keyframes odQuoteTextIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .od-quote-side {
          width: 88px;
          min-height: 112px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 5px;
          border-radius: 24px;
          background: rgba(255, 255, 255, .10);
          border: 1px solid rgba(255, 255, 255, .13);
        }

        .od-quote-logo {
          width: 46px;
          height: 46px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: #ffffff;
          overflow: hidden;
          box-shadow: 0 16px 34px rgba(28, 17, 48,.18);
          border: 1px solid rgba(255,255,255,.48);
        }

        .od-quote-side strong {
          color: #fde68a;
          font-size: 18px;
          font-weight: 950;
          line-height: 1;
        }

        .od-quote-side span {
          color: rgba(237, 233, 254, .68);
          font-size: 10px;
          font-weight: 850;
        }

        .od-timer-command {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 22px;
          align-items: stretch;
          margin: 18px 0;
          padding: 20px;
          border-radius: 36px;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(255,255,255,.92);
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
          background: rgba(255,255,255,.88);
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
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 18px 52px rgba(28, 17, 48,.07);
          backdrop-filter: blur(18px);
        }

        .od-lab-card h3 {
          margin: 0 0 10px;
          color: #18102e;
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

          .od-section-head,
          .od-quote-bar {
            grid-template-columns: 1fr;
          }

          .od-quote-side {
            width: 100%;
            min-height: auto;
            grid-template-columns: auto auto auto;
            justify-content: start;
            padding: 12px;
          }

          .od-quote-text {
            font-size: clamp(17px, 5vw, 22px);
            line-height: 1.8;
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

              <div className="od-main-gauge">
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
          className={isQuotePaused ? "od-quote-bar is-paused" : "od-quote-bar"}
          onMouseEnter={() => setIsQuotePaused(true)}
          onMouseLeave={() => setIsQuotePaused(false)}
          onFocus={() => setIsQuotePaused(true)}
          onBlur={() => setIsQuotePaused(false)}
          tabIndex={0}
          aria-label="عبارات ملهمة متجددة"
        >
          <div className="od-quote-copy">
            <div className="od-quote-kicker">
              <span>عبارات ملهمة</span>
              <small>{isQuotePaused ? "متوقفة مؤقتًا" : "تتجدد تلقائيًا"}</small>
            </div>
            <p key={quoteIndex} className="od-quote-text">“{quote}”</p>
          </div>
          <div className="od-quote-side" aria-hidden="true">
            <div className="od-quote-logo">
              <img src={BRAND_LOGO_SRC} alt="" />
            </div>
            <strong>{String((quoteIndex % insights.length) + 1).padStart(3, "0")}</strong>
            <span>من {insights.length}</span>
          </div>
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
