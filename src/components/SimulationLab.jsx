import { useMemo, useState } from "react";

const STORAGE_KEY = "od_academy_simulation_lab_v2";

const REFERENCES = [
  {
    key: "cw-change",
    title: "Cummings & Worley — Organization Development & Change",
    idea: "التشخيص متعدد المستويات، التدخلات الإنسانية، التقنية-الهيكلية، التقييم، والتثبيت المؤسسي."
  },
  {
    key: "schein-culture",
    title: "Edgar Schein — Organizational Culture and Leadership",
    idea: "قراءة الثقافة عبر المظاهر، القيم المعلنة، القيم المستخدمة، والافتراضات الأساسية."
  },
  {
    key: "edmondson-psych-safety",
    title: "Amy Edmondson — Psychological Safety and Learning Behavior in Work Teams",
    idea: "الأمان النفسي كشرط لقول الحقيقة، التعلم من الخطأ، وتحسين أداء الفرق."
  },
  {
    key: "senge-learning",
    title: "Peter Senge — The Fifth Discipline",
    idea: "التفكير النظمي، النماذج الذهنية، تعلم الفريق، الرؤية المشتركة، والبراعة الشخصية."
  },
  {
    key: "hackman-oldham",
    title: "Hackman & Oldham — Job Characteristics Model",
    idea: "تصميم العمل عبر تنوع المهارات، هوية المهمة، أهمية المهمة، الاستقلالية، والتغذية الراجعة."
  },
  {
    key: "kotter-change",
    title: "John Kotter — Leading Change",
    idea: "الجاهزية، التحالف، الرؤية، الانتصارات السريعة، وترسيخ التغيير."
  }
];

const ARCHETYPES = [
  {
    id: "role-clarity",
    name: "غموض أدوار وصلاحيات",
    color: "#4f46e5",
    lens: "تصميم منظمة / RACI / Operating Model",
    bestHypothesis: "الخلل في حقوق القرار ونقاط التسليم وليس في نية الأشخاص.",
    bestIntervention: "إعادة تصميم الأدوار والصلاحيات ونقاط التسليم مع RACI تطبيقي.",
    bestMetric: "انخفاض التصعيدات غير الضرورية وزمن الحسم."
  },
  {
    id: "trust-conflict",
    name: "ثقة وصراع بين الإدارات",
    color: "#e11d48",
    lens: "Human Process / Intergroup Relations",
    bestHypothesis: "الصراع الظاهر يخفي صورًا نمطية ومؤشرات متعارضة.",
    bestIntervention: "تدخل علاقات بين مجموعات مع اتفاق عمل ومؤشرات مشتركة.",
    bestMetric: "تحسن جودة التسليم وانخفاض اللوم المتبادل."
  },
  {
    id: "culture-fear",
    name: "ثقافة خوف وإخفاء أخبار سيئة",
    color: "#7c3aed",
    lens: "Culture / Psychological Safety",
    bestHypothesis: "الناس لا يخفون الحقائق عبثًا؛ النظام يعاقب الإنذار المبكر.",
    bestIntervention: "تغيير لحظات الحقيقة القيادية وبناء آلية رفع مخاطر بلا لوم.",
    bestMetric: "ارتفاع المخاطر المرفوعة مبكرًا وانخفاض المفاجآت."
  },
  {
    id: "process-delay",
    name: "تعطل عملية وتكرار إعادة العمل",
    color: "#f59e0b",
    lens: "Process Reengineering / Workflow",
    bestHypothesis: "المشكلة في تدفق العمل والاعتمادات لا في اجتهاد الفريق فقط.",
    bestIntervention: "تحليل As-Is/To-Be وإعادة تصميم العملية والبوابات والصلاحيات.",
    bestMetric: "زمن الدورة ونسبة الاكتمال من أول مرة."
  },
  {
    id: "learning-loop",
    name: "تكرار الأخطاء وضعف التعلم",
    color: "#10b981",
    lens: "Organizational Learning / AAR",
    bestHypothesis: "الخبرة موجودة لكنها لا تتحول إلى ذاكرة تنظيمية وتعديل نظامي.",
    bestIntervention: "بناء نظام AAR وقاعدة دروس ومجتمع ممارسة ومالك لتطبيق الدروس.",
    bestMetric: "عدد الدروس المطبقة وانخفاض تكرار الخطأ نفسه."
  },
  {
    id: "performance-system",
    name: "نظام أداء شكلي",
    color: "#0ea5e9",
    lens: "Performance Management / Adoption",
    bestHypothesis: "النظام يقيس الامتثال للنموذج لا جودة الحوار والتغذية الراجعة.",
    bestIntervention: "تدريب المديرين على محادثات الأداء وربط الجودة بالتقييم والمعايرة.",
    bestMetric: "جودة الأهداف والمحادثات وانخفاض مفاجآت نهاية السنة."
  },
  {
    id: "change-adoption",
    name: "تغيير أُطلق ولم يُتبنَّ",
    color: "#14b8a6",
    lens: "Change Adoption / Sustainability",
    bestHypothesis: "الإطلاق نجح، لكن السلوك الجديد لم يدخل في العمل اليومي.",
    bestIntervention: "خطة تبنّي 30/60/90 مع Pilot ومؤشرات استخدام وجودة استخدام.",
    bestMetric: "استمرار السلوك بعد 90 يومًا دون دفع من فريق المشروع."
  },
  {
    id: "job-design",
    name: "وظائف فقيرة بالمعنى أو الصلاحية",
    color: "#8b5cf6",
    lens: "Work Design / Motivation",
    bestHypothesis: "انخفاض الدافعية مرتبط بتصميم العمل لا بالرغبة الشخصية فقط.",
    bestIntervention: "إثراء وظيفي أو فرق ذاتية الإدارة مع دعم المعلومات والصلاحيات.",
    bestMetric: "تحسن الاستقلالية والتغذية الراجعة وجودة المخرجات."
  },
  {
    id: "leadership-behavior",
    name: "فجوة قيادة وسلوك رمزي",
    color: "#ef4444",
    lens: "Leadership / Symbolic Action",
    bestHypothesis: "القادة يعلنون قيمة ويمارسون عكسها في لحظات الضغط.",
    bestIntervention: "تدخل قيادة رمزية مع Coaching ولحظات حقيقة ومقاييس سلوكية.",
    bestMetric: "اتساق القول والفعل وثقة الفريق في القيادة."
  },
  {
    id: "od-measurement",
    name: "مؤشرات كثيرة بلا معنى",
    color: "#334155",
    lens: "OD Dashboard / Impact Measurement",
    bestHypothesis: "المؤشرات تقيس النشاط لا السلوك والأثر والعلاقات النظامية.",
    bestIntervention: "بناء OD Dashboard تربط الفعالية والصحة والثقافة والتعلم.",
    bestMetric: "قرارات تنظيمية أفضل مبنية على مؤشرات مترابطة."
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
  "مركز اتصال كبير"
];

const ORG_SIZES = [
  "120 موظفًا",
  "350 موظفًا",
  "900 موظف",
  "1500 موظف",
  "فروع متعددة في ثلاث مناطق",
  "نمو سريع بعد توسع رقمي"
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
  "تعارض بين إدارتين قويتين"
];

const STAKEHOLDERS = [
  ["الرئيس التنفيذي", "مدير الموارد البشرية", "مدير العمليات", "مدير المبيعات"],
  ["مدير الجودة", "مدير تجربة العميل", "قادة الفروع", "فريق الخدمة"],
  ["مدير التقنية", "مالك المنتج", "فريق العمليات", "المالية"],
  ["مدير المشروع", "مدير الإدارة المعنية", "HRBP", "فريق القيادة الوسطى"],
  ["الموظفون الجدد", "المديرون المباشرون", "التعلم والتطوير", "مكتب التحول"]
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
  "مراجعة مؤشرات تجربة العميل"
];

const PRESSURES = [
  "الإدارة تريد حلًا خلال أسبوعين",
  "المدير الأقوى يرفض الاعتراف بدوره في المشكلة",
  "الموظفون يخافون من التصريح",
  "البيانات متضاربة بين الإدارات",
  "هناك مبادرات كثيرة تسبب إرهاقًا",
  "العميل الخارجي بدأ يلاحظ التدهور"
];

const TRAPS = [
  "القفز إلى ورشة تدريب قبل التشخيص",
  "اعتبار المشكلة شخصية بين مديرين فقط",
  "الاكتفاء بإعلان قيم جديدة",
  "تصميم RACI كوثيقة لا كممارسة في الاجتماعات",
  "قياس الحضور بدل السلوك",
  "إهمال القيادة الوسطى",
  "استخدام البيانات لإدانة طرف",
  "إغلاق المشروع قبل نقل الملكية"
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
  "Culture Change Intervention Brief"
];

const HYPOTHESIS_OPTIONS = [
  "الخلل في الأشخاص، لذلك يجب استبدالهم سريعًا.",
  "الخلل في حقوق القرار ونقاط التسليم وليس في نية الأشخاص.",
  "المشكلة مؤقتة وستنتهي بإرسال بريد رسمي.",
  "الموظفون لا يحبون التغيير بطبيعتهم."
];

const INTERVENTION_OPTIONS = [
  "ورشة تحفيزية عامة للجميع دون تعديل أي نظام.",
  "إعادة تصميم الأدوار والصلاحيات ونقاط التسليم مع RACI تطبيقي.",
  "حملة شعارات عن التعاون والتميز.",
  "إغلاق الموضوع حتى لا تزيد المقاومة."
];

const METRIC_OPTIONS = [
  "عدد الحاضرين في العرض التعريفي فقط.",
  "انخفاض التصعيدات غير الضرورية وزمن الحسم.",
  "عدد الشرائح المستخدمة في الورشة.",
  "عدد رسائل البريد المرسلة."
];

function pick(list, index) {
  return list[Math.abs(index) % list.length];
}

function buildScenarioBank() {
  const bank = [];

  for (let i = 0; i < 240; i += 1) {
    const archetype = pick(ARCHETYPES, i);
    const industry = pick(INDUSTRIES, i * 3);
    const size = pick(ORG_SIZES, i * 5);
    const trigger = pick(TRIGGERS, i * 7);
    const stakeholders = pick(STAKEHOLDERS, i * 11);
    const pressure = pick(PRESSURES, i * 13);
    const mainSignal = pick(DATA_SIGNALS, i * 17);
    const secondarySignal = pick(DATA_SIGNALS, i * 19 + 1);
    const trap = pick(TRAPS, i * 23);
    const deliverable = pick(DELIVERABLES, i * 29);
    const ref = pick(REFERENCES, i * 31);

    const complexity = ["سهل", "متوسط", "متقدم", "حرج"][i % 4];

    bank.push({
      id: `OD-SIM-${String(i + 1).padStart(3, "0")}`,
      title: `${archetype.name} في ${industry}`,
      archetype,
      category: archetype.id,
      industry,
      size,
      complexity,
      trigger,
      stakeholders,
      pressure,
      mainSignal,
      secondarySignal,
      trap,
      deliverable,
      reference: ref,
      situation: `تعمل مع ${industry} بحجم ${size}. ظهرت مشكلة واضحة: ${trigger}. الإدارة تصف الوضع بأنه "ضعف التزام"، لكن البيانات الأولية تشير إلى أن السلوك المتكرر قد يكون مرتبطًا بتصميم العمل والسلطة والثقافة وليس بالأفراد فقط.`,
      boardQuestion: `طلب منك الراعي التنفيذي أن تقدم قراءة مهنية خلال 10 أيام: هل المشكلة تحتاج تدخلًا إنسانيًا، تقنيًا-هيكليًا، ثقافيًا، أم مزيجًا؟`,
      hiddenDynamic: archetype.bestHypothesis,
      ethicalRisk: `الخطر الأخلاقي: قد تستخدم القيادة التشخيص لإدانة طرف واحد بدل فهم النظام، خصوصًا مع وجود ضغط: ${pressure}.`,
      decisionMoment: `لحظة القرار الحرجة: هل تقبل طلب القيادة بحل سريع، أم تحول الطلب إلى فرضيات تشخيصية قابلة للفحص؟`,
      bestHypothesis: archetype.bestHypothesis,
      bestIntervention: archetype.bestIntervention,
      bestMetric: archetype.bestMetric,
      dataNeeded: [
        mainSignal,
        secondarySignal,
        "مقابلات مع أصحاب مصلحة من مستويات مختلفة",
        "ملاحظة اجتماع أو لحظة قرار حقيقية",
        "مراجعة مؤشر أداء مرتبط بالسلوك المطلوب"
      ],
      mistakes: [
        trap,
        "تفسير العرض كسبب جذري",
        "الاعتماد على رأي الراعي وحده",
        "تصميم تدخل لا يملك النظام القدرة على حمله"
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

function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { attempts: 0, bestScore: 0, completed: [] };
  } catch {
    return { attempts: 0, bestScore: 0, completed: [] };
  }
}

function saveProgress(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // تجاهل فشل التخزين
  }
}

function Badge({ children }) {
  return <span className="sim-badge">{children}</span>;
}

function DataPill({ children }) {
  return <span className="sim-data-pill">{children}</span>;
}

function ScenarioMap({ scenario }) {
  const nodes = [
    { label: "العرض", text: scenario.trigger, color: "#f59e0b" },
    { label: "النمط", text: scenario.hiddenDynamic, color: scenario.archetype.color },
    { label: "الضغط", text: scenario.pressure, color: "#e11d48" },
    { label: "المخرج", text: scenario.deliverable, color: "#10b981" }
  ];

  return (
    <div className="sim-map">
      {nodes.map((node, index) => (
        <div className="sim-node" key={node.label} style={{ "--node": node.color }}>
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
      <svg viewBox="0 0 560 250" role="img" aria-label="خريطة سببية">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="currentColor" />
          </marker>
        </defs>

        <path d="M120 70 C220 10, 340 10, 440 70" />
        <path d="M445 80 C520 145, 415 220, 305 185" />
        <path d="M295 185 C205 220, 85 185, 115 88" />

        <circle cx="110" cy="75" r="38" />
        <circle cx="450" cy="75" r="38" />
        <circle cx="300" cy="185" r="38" />

        <text x="110" y="68">عرض</text>
        <text x="110" y="88">{scenario.trigger.slice(0, 14)}</text>

        <text x="450" y="68">نظام</text>
        <text x="450" y="88">{scenario.archetype.name.slice(0, 14)}</text>

        <text x="300" y="178">أثر</text>
        <text x="300" y="198">تكرار المشكلة</text>
      </svg>
    </div>
  );
}

function ChoiceGroup({ title, options, correct, selected, onSelect }) {
  return (
    <div className="choice-group">
      <h4>{title}</h4>
      <div className="choice-list">
        {options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = selected && option === correct;
          const isWrong = isSelected && option !== correct;

          return (
            <button
              key={option}
              type="button"
              className={`choice ${isSelected ? "is-selected" : ""} ${isCorrect ? "is-correct" : ""} ${isWrong ? "is-wrong" : ""}`}
              onClick={() => onSelect(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Simulation() {
  const scenarioBank = useMemo(() => buildScenarioBank(), []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [complexity, setComplexity] = useState("all");
  const [currentId, setCurrentId] = useState(scenarioBank[0].id);
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState(() => readProgress());

  const filtered = useMemo(() => {
    return scenarioBank.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesComplexity = complexity === "all" || item.complexity === complexity;
      const q = query.trim();
      const matchesQuery =
        !q ||
        item.title.includes(q) ||
        item.industry.includes(q) ||
        item.trigger.includes(q) ||
        item.archetype.name.includes(q);

      return matchesCategory && matchesComplexity && matchesQuery;
    });
  }, [scenarioBank, category, complexity, query]);

  const scenario = useMemo(() => {
    return scenarioBank.find((item) => item.id === currentId) || scenarioBank[0];
  }, [scenarioBank, currentId]);

  const score = useMemo(() => {
    let value = 0;
    if (answers.hypothesis === scenario.bestHypothesis) value += 35;
    if (answers.intervention === scenario.bestIntervention) value += 35;
    if (answers.metric === scenario.bestMetric) value += 30;
    return value;
  }, [answers, scenario]);

  const completed = Boolean(answers.hypothesis && answers.intervention && answers.metric);

  function openScenario(id) {
    setCurrentId(id);
    setAnswers({});
  }

  function randomScenario() {
    const pool = filtered.length ? filtered : scenarioBank;
    const random = pool[Math.floor(Math.random() * pool.length)];
    openScenario(random.id);
  }

  function submitAttempt() {
    const next = {
      attempts: (progress.attempts || 0) + 1,
      bestScore: Math.max(progress.bestScore || 0, score),
      completed: Array.from(new Set([...(progress.completed || []), scenario.id]))
    };

    setProgress(next);
    saveProgress(next);
  }

  const categoryStats = ARCHETYPES.map((type) => ({
    ...type,
    count: scenarioBank.filter((item) => item.category === type.id).length
  }));

  return (
    <section className="sim-lab" dir="rtl">
      <style>{`
        .sim-lab {
          min-height: 100vh;
          padding: 26px 14px 80px;
          color: #0f172a;
          background:
            radial-gradient(circle at 12% 10%, rgba(79,70,229,.18), transparent 28%),
            radial-gradient(circle at 88% 15%, rgba(245,158,11,.15), transparent 28%),
            radial-gradient(circle at 50% 95%, rgba(16,185,129,.12), transparent 30%),
            linear-gradient(135deg, #f8fafc, #eef2ff 55%, #fff7ed);
          overflow: hidden;
        }

        .sim-wrap {
          width: min(1240px, 100%);
          margin: 0 auto;
        }

        .sim-hero {
          position: relative;
          overflow: hidden;
          border-radius: 42px;
          padding: 34px;
          color: white;
          background:
            radial-gradient(circle at 18% 22%, rgba(129,140,248,.28), transparent 32%),
            radial-gradient(circle at 85% 5%, rgba(16,185,129,.18), transparent 28%),
            linear-gradient(145deg, #0f172a, #1e1b4b 56%, #312e81);
          box-shadow: 0 28px 90px rgba(15,23,42,.22);
        }

        .sim-hero::before {
          content: "";
          position: absolute;
          inset: -60px;
          background-image:
            linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 50px 50px;
          transform: rotate(-8deg);
          opacity: .38;
        }

        .sim-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.08fr .92fr;
          gap: 28px;
          align-items: center;
        }

        .sim-kicker {
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

        .sim-hero h1 {
          margin: 18px 0 12px;
          font-size: clamp(34px, 6vw, 72px);
          line-height: 1.05;
          letter-spacing: -2px;
          font-weight: 950;
        }

        .sim-hero h1 span {
          display: block;
          color: transparent;
          background: linear-gradient(90deg, #fff, #c7d2fe, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .sim-hero p {
          margin: 0;
          max-width: 720px;
          color: rgba(226,232,240,.9);
          font-size: 15px;
          line-height: 2;
          font-weight: 750;
        }

        .sim-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
        }

        .sim-btn {
          cursor: pointer;
          border: 0;
          border-radius: 18px;
          padding: 13px 18px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          transition: .22s ease;
        }

        .sim-btn:hover { transform: translateY(-2px); }
        .sim-btn.primary { color: white; background: linear-gradient(135deg, #4f46e5, #7c3aed); box-shadow: 0 16px 35px rgba(79,70,229,.35); }
        .sim-btn.light { color: #0f172a; background: rgba(255,255,255,.92); }
        .sim-btn.dark { color: white; background: #0f172a; }
        .sim-btn.ghost { color: #334155; background: rgba(255,255,255,.78); border: 1px solid rgba(148,163,184,.24); }

        .sim-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .sim-metric {
          padding: 18px;
          border-radius: 28px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(14px);
        }

        .sim-metric span {
          display: block;
          color: rgba(226,232,240,.7);
          font-size: 11px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .sim-metric strong {
          display: block;
          color: white;
          font-size: 34px;
          line-height: 1;
          font-weight: 950;
        }

        .sim-panel {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 18px;
          align-items: start;
        }

        .sim-sidebar,
        .sim-main,
        .sim-card {
          border-radius: 32px;
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(255,255,255,.95);
          box-shadow: 0 18px 55px rgba(15,23,42,.08);
          backdrop-filter: blur(18px);
        }

        .sim-sidebar {
          padding: 18px;
          position: sticky;
          top: 14px;
        }

        .sim-main {
          padding: 20px;
          overflow: hidden;
        }

        .sim-field {
          display: grid;
          gap: 8px;
          margin-bottom: 12px;
        }

        .sim-field label {
          color: #475569;
          font-size: 11px;
          font-weight: 950;
        }

        .sim-field input,
        .sim-field select {
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

        .sim-category-list {
          display: grid;
          gap: 8px;
          max-height: 440px;
          overflow: auto;
          padding-left: 4px;
        }

        .sim-category {
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

        .sim-category:hover,
        .sim-category.is-active {
          background: #eef2ff;
          border-color: rgba(79,70,229,.24);
        }

        .sim-category b {
          display: block;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 5px;
        }

        .sim-category span {
          display: block;
          color: #64748b;
          font-size: 10px;
          font-weight: 850;
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
          font-size: clamp(26px, 4vw, 44px);
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

        .sim-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .sim-badge,
        .sim-data-pill {
          display: inline-flex;
          width: fit-content;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 950;
          line-height: 1.3;
        }

        .sim-badge {
          background: rgba(79,70,229,.1);
          color: #3730a3;
        }

        .sim-data-pill {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid rgba(148,163,184,.16);
        }

        .score-orb {
          flex: 0 0 126px;
          height: 126px;
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
          font-size: 30px;
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

        .sim-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 14px;
        }

        .sim-card {
          padding: 18px;
          box-shadow: none;
          background: #fff;
        }

        .sim-card h3 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: 18px;
          font-weight: 950;
        }

        .sim-card p,
        .sim-card li {
          color: #64748b;
          font-size: 13px;
          line-height: 1.9;
          font-weight: 750;
        }

        .sim-card ul {
          margin: 0;
          padding: 0 18px 0 0;
        }

        .sim-map {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin: 16px 0;
        }

        .sim-node {
          position: relative;
          overflow: hidden;
          min-height: 150px;
          border-radius: 26px;
          padding: 16px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.16);
        }

        .sim-node::before {
          content: "";
          position: absolute;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          left: -52px;
          bottom: -70px;
          background: var(--node);
          opacity: .12;
        }

        .sim-node b {
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

        .sim-node span {
          display: block;
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .sim-node p {
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
          marker-end: url(#arrow);
          opacity: .62;
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
          margin-top: 16px;
          padding: 18px;
          border-radius: 30px;
          background: #0f172a;
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
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 14px;
        }

        .choice-group {
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 24px;
          padding: 14px;
        }

        .choice-group h4 {
          margin: 0 0 10px;
          color: white;
          font-size: 14px;
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
        }

        .choice:hover {
          background: rgba(255,255,255,.13);
        }

        .choice.is-selected {
          border-color: rgba(129,140,248,.9);
        }

        .choice.is-correct {
          background: rgba(16,185,129,.18);
          border-color: rgba(16,185,129,.7);
        }

        .choice.is-wrong {
          background: rgba(239,68,68,.16);
          border-color: rgba(239,68,68,.62);
        }

        .feedback {
          margin-top: 14px;
          padding: 14px;
          border-radius: 20px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
        }

        .feedback strong {
          display: block;
          margin-bottom: 5px;
          color: white;
          font-size: 14px;
          font-weight: 950;
        }

        .feedback span {
          color: rgba(226,232,240,.78);
          font-size: 12px;
          line-height: 1.8;
          font-weight: 750;
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
          min-height: 132px;
          border-radius: 22px;
          background: #fff;
          border: 1px solid rgba(148,163,184,.16);
          transition: .2s ease;
        }

        .scenario-mini:hover,
        .scenario-mini.is-active {
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
        }

        @media (max-width: 1080px) {
          .sim-hero-inner,
          .sim-panel,
          .sim-grid-2,
          .choice-grid {
            grid-template-columns: 1fr;
          }

          .sim-sidebar {
            position: relative;
            top: auto;
          }

          .sim-map,
          .scenario-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 720px) {
          .sim-lab { padding: 14px 8px 48px; }
          .sim-hero { border-radius: 30px; padding: 24px; }
          .sim-metrics,
          .sim-map,
          .scenario-list {
            grid-template-columns: 1fr;
          }

          .scenario-head {
            display: grid;
          }

          .score-orb {
            width: 126px;
            justify-self: start;
          }
        }
      `}</style>

      <div className="sim-wrap">
        <header className="sim-hero">
          <div className="sim-hero-inner">
            <div>
              <span className="sim-kicker">مختبر المحاكاة الاستشارية · 240 سيناريو ديناميكي</span>
              <h1>
                لا تقرأ الحالة فقط
                <span>ادخل النظام واتخذ القرار</span>
              </h1>
              <p>
                مختبر تفاعلي يحوّل مراجع التطوير التنظيمي إلى مواقف مهنية: تشخيص، فرضيات، تدخل، قياس، أخلاقيات، واستدامة. كل سيناريو يضعك أمام ضغط حقيقي: هل تقفز للحل أم تفهم النظام؟
              </p>

              <div className="sim-actions">
                <button className="sim-btn primary" type="button" onClick={randomScenario}>ولّد سيناريو عشوائي</button>
                <button className="sim-btn light" type="button" onClick={() => setCategory("all")}>فتح كل المكتبة</button>
              </div>
            </div>

            <div className="sim-metrics">
              <div className="sim-metric">
                <span>حجم المكتبة</span>
                <strong>{scenarioBank.length}</strong>
              </div>
              <div className="sim-metric">
                <span>عدد المجالات</span>
                <strong>{ARCHETYPES.length}</strong>
              </div>
              <div className="sim-metric">
                <span>محاولاتك</span>
                <strong>{progress.attempts || 0}</strong>
              </div>
              <div className="sim-metric">
                <span>أفضل نتيجة</span>
                <strong>{progress.bestScore || 0}%</strong>
              </div>
            </div>
          </div>
        </header>

        <div className="sim-panel">
          <aside className="sim-sidebar">
            <div className="sim-field">
              <label>ابحث داخل السيناريوهات</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="مثال: ثقافة، مبيعات، أداء..." />
            </div>

            <div className="sim-field">
              <label>مستوى التعقيد</label>
              <select value={complexity} onChange={(e) => setComplexity(e.target.value)}>
                <option value="all">كل المستويات</option>
                <option value="سهل">سهل</option>
                <option value="متوسط">متوسط</option>
                <option value="متقدم">متقدم</option>
                <option value="حرج">حرج</option>
              </select>
            </div>

            <div className="sim-field">
              <label>مجالات المحاكاة</label>
              <div className="sim-category-list">
                <button className={`sim-category ${category === "all" ? "is-active" : ""}`} type="button" onClick={() => setCategory("all")}>
                  <b>كل المجالات</b>
                  <span>{scenarioBank.length} سيناريو</span>
                </button>

                {categoryStats.map((type) => (
                  <button
                    key={type.id}
                    className={`sim-category ${category === type.id ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setCategory(type.id)}
                  >
                    <b>{type.name}</b>
                    <span>{type.count} سيناريو · {type.lens}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="sim-main">
            <div className="scenario-head">
              <div>
                <span className="sim-kicker" style={{ background: "rgba(79,70,229,.1)", color: "#3730a3", borderColor: "rgba(79,70,229,.12)" }}>
                  {scenario.id} · {scenario.complexity}
                </span>

                <h2>{scenario.title}</h2>
                <p>{scenario.situation}</p>

                <div className="sim-badges">
                  <Badge>{scenario.industry}</Badge>
                  <Badge>{scenario.size}</Badge>
                  <Badge>{scenario.archetype.lens}</Badge>
                  <Badge>{scenario.reference.title}</Badge>
                </div>
              </div>

              <div className="score-orb" style={{ "--score": `${score}%` }}>
                <div>
                  <strong>{score}%</strong>
                  <span>نضج القرار</span>
                </div>
              </div>
            </div>

            <ScenarioMap scenario={scenario} />

            <div className="sim-grid-2">
              <div className="sim-card">
                <h3>سؤال مجلس الإدارة</h3>
                <p>{scenario.boardQuestion}</p>
                <div className="sim-badges">
                  <DataPill>{scenario.mainSignal}</DataPill>
                  <DataPill>{scenario.secondarySignal}</DataPill>
                </div>
              </div>

              <div className="sim-card">
                <h3>الخطر الأخلاقي</h3>
                <p>{scenario.ethicalRisk}</p>
              </div>
            </div>

            <div className="sim-grid-2">
              <div className="sim-card">
                <h3>خريطة سببية مبسطة</h3>
                <CausalLoop scenario={scenario} />
              </div>

              <div className="sim-card">
                <h3>بيانات لا تبدأ بدونها</h3>
                <ul>
                  {scenario.dataNeeded.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

            <section className="challenge">
              <h3>تحدي القرار الاستشاري</h3>
              <p>{scenario.decisionMoment}</p>

              <div className="choice-grid">
                <ChoiceGroup
                  title="1) اختر الفرضية الأقوى"
                  options={HYPOTHESIS_OPTIONS.map((option) => option === HYPOTHESIS_OPTIONS[1] ? scenario.bestHypothesis : option)}
                  correct={scenario.bestHypothesis}
                  selected={answers.hypothesis}
                  onSelect={(value) => setAnswers((prev) => ({ ...prev, hypothesis: value }))}
                />

                <ChoiceGroup
                  title="2) اختر التدخل الأنسب"
                  options={INTERVENTION_OPTIONS.map((option) => option === INTERVENTION_OPTIONS[1] ? scenario.bestIntervention : option)}
                  correct={scenario.bestIntervention}
                  selected={answers.intervention}
                  onSelect={(value) => setAnswers((prev) => ({ ...prev, intervention: value }))}
                />

                <ChoiceGroup
                  title="3) اختر مؤشر الأثر"
                  options={METRIC_OPTIONS.map((option) => option === METRIC_OPTIONS[1] ? scenario.bestMetric : option)}
                  correct={scenario.bestMetric}
                  selected={answers.metric}
                  onSelect={(value) => setAnswers((prev) => ({ ...prev, metric: value }))}
                />
              </div>

              {completed && (
                <div className="feedback">
                  <strong>{score >= 80 ? "قرار ناضج جدًا" : score >= 50 ? "قرار مقبول يحتاج تعميق" : "قرار متسرّع يحتاج عودة للتشخيص"}</strong>
                  <span>
                    القراءة المرجعية: {scenario.reference.idea} أفضل ممارس OD لا يكتفي باختيار تدخل؛ بل يربط الفرضية بالسلوك والنظام والقياس والاستدامة.
                  </span>

                  <div className="sim-actions">
                    <button className="sim-btn primary" type="button" onClick={submitAttempt}>حفظ المحاولة</button>
                    <button className="sim-btn light" type="button" onClick={randomScenario}>سيناريو جديد</button>
                  </div>
                </div>
              )}
            </section>

            <div className="sim-grid-2">
              <div className="sim-card">
                <h3>أخطاء يقع فيها المستشار الضعيف</h3>
                <ul>
                  {scenario.mistakes.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div className="sim-card">
                <h3>علامات النجاح</h3>
                <ul>
                  {scenario.successMeasures.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>

            <div className="sim-card" style={{ marginTop: 14 }}>
              <h3>مكتبة السيناريوهات المطابقة للفلتر الحالي</h3>
              <p>المعروض أدناه أول 12 سيناريو فقط من نتائج الفلترة حتى لا تتحول الصفحة إلى فوضى.</p>

              <div className="scenario-list">
                {filtered.slice(0, 12).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`scenario-mini ${item.id === scenario.id ? "is-active" : ""}`}
                    onClick={() => openScenario(item.id)}
                  >
                    <span>{item.id} · {item.complexity}</span>
                    <strong>{item.title}</strong>
                    <small>{item.trigger}</small>
                  </button>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}