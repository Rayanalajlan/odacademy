import { useMemo, useState } from "react";

const scenarios = [
  {
    category: "التفكير النظمي",
    text: "شركة تعاني من تراجع المبيعات بعد دمجها مع شركة أخرى، والمدير التنفيذي يطلب حملة تسويقية فورية. بصفتك مستشار OD، كيف تتصرف؟",
    options: [
      { text: "أوافق وأقترح تصميم حملة تسويقية تدمج هوية الشركتين.", scores: [2, 1, 1, 2, 1] },
      { text: "أطلب فحص أثر الدمج على العمليات، أنظمة الحوافز المشتركة، وثقافة الفريقين قبل أي خطوة.", scores: [5, 4, 3, 3, 2] }
    ]
  },
  {
    category: "المنهجية التشخيصية",
    text: "مدير الموارد البشرية يشتكي من ضعف ولاء الموظفين بسبب ارتفاع الاستقالات ويطلب برنامج ولاء وفعاليات ترفيهية. ما خطوتك الأولى؟",
    options: [
      { text: "أبني فرضيات متعددة وأطلب بيانات الاستقالات حسب الإدارات والمدراء ومدة الخدمة للتحقق من السبب الجذري.", scores: [4, 5, 3, 4, 3] },
      { text: "أصمم استبيان رضا عام ومباشر لمعرفة الفعاليات المفضلة.", scores: [2, 2, 2, 3, 2] }
    ]
  },
  {
    category: "هندسة الهياكل والأدوار",
    text: "منظمة أطلقت استراتيجية تركز على الابتكار السريع، لكن الهيكل الحالي يشترط موافقة 4 مستويات لأي فكرة. ما تحليلك؟",
    options: [
      { text: "المشكلة في خوف الموظفين من المبادرة ويحتاجون ورش تفكير إبداعي.", scores: [1, 2, 1, 3, 1] },
      { text: "هناك خلل مواءمة؛ المركزية العالية والاعتمادات المتعددة تعطل التوجه الاستراتيجي.", scores: [4, 4, 5, 3, 4] }
    ]
  },
  {
    category: "الحياد والأخلاق المهنية",
    text: "المدير العام يطلب منك أسماء الموظفين الذين انتقدوا أسلوبه القيادي أثناء المقابلات. ماذا تفعل؟",
    options: [
      { text: "أرفض كشف الأسماء وأعرض النمط مجمعًا لأن العميل الحقيقي هو النظام والثقة شرط جودة البيانات.", scores: [4, 4, 2, 5, 3] },
      { text: "أشارك الأسماء معه بحذر بشرط ألا يتخذ ضدهم إجراء رسميًا.", scores: [1, 1, 1, 1, 1] }
    ]
  },
  {
    category: "قياس الأثر والاستدامة",
    text: "بعد إطلاق نظام جديد، كيف تضمن أن المنظمة استوعبت التغيير ولم تعد لأسلوبها القديم؟",
    options: [
      { text: "أربط التبني بتقارير أداء، تغذية راجعة دورية، ملاك داخليين، ونظام حوافز داعم.", scores: [3, 4, 4, 3, 5] },
      { text: "أرسل بريد شكر وأعتبر المشروع قد انتهى بنجاح.", scores: [1, 1, 1, 2, 1] }
    ]
  }
];

const labels = ["تفكير نظمي", "تشخيص", "هياكل", "أخلاقيات", "استدامة"];

function RadarSvg({ values }) {
  const size = 300;
  const center = size / 2;
  const max = 5;
  const radius = 105;

  function point(index, value = max) {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / labels.length;
    const r = (value / max) * radius;
    return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
  }

  const polygon = values.map((value, index) => point(index, value).join(",")).join(" ");
  const grid = [1, 2, 3, 4, 5].map((level) =>
    labels.map((_, index) => point(index, level).join(",")).join(" ")
  );

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar-svg" role="img" aria-label="مخطط راداري لجداراتك">
      {grid.map((points, index) => (
        <polygon key={index} points={points} className="radar-grid" />
      ))}
      {labels.map((label, index) => {
        const [x, y] = point(index, 5.6);
        return (
          <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="radar-label">
            {label}
          </text>
        );
      })}
      <polygon points={polygon} className="radar-area" />
      {values.map((value, index) => {
        const [x, y] = point(index, value);
        return <circle key={index} cx={x} cy={y} r="5" className="radar-dot" />;
      })}
    </svg>
  );
}

export default function RadarAssessment({ setActivePage }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);
  const done = started && index >= scenarios.length;

  const finalData = useMemo(() => scores.map((score) => Math.max(0, Math.min(5, Math.round(score / scenarios.length)))), [scores]);

  function start() {
    setStarted(true);
    setIndex(0);
    setScores([0, 0, 0, 0, 0]);
  }

  function select(option) {
    setScores((current) => current.map((score, idx) => score + option.scores[idx]));
    setIndex((current) => current + 1);
  }

  const current = scenarios[index];

  return (
    <section className="page-shell">
      <div className="section-hero">
        <span className="eyebrow">رادار الأداء</span>
        <h2>رادار الجدارات الاستشارية</h2>
        <p>مختبر تقييمي يقيس فجوة الأداء في خمس جدارات كبرى لممارس التطوير التنظيمي.</p>
      </div>

      <div className="assessment-grid">
        <div className="lab-card">
          {!started && (
            <div className="lab-intro">
              <div className="big-icon">📋</div>
              <h3>جاهز لاكتشاف فجوتك الجدارية؟</h3>
              <p>ستمر بخمسة مواقف استشارية حرجة. إجاباتك ستحدد خريطتك التطويرية.</p>
              <button className="primary-button" onClick={start}>ابدأ تقييم الجدارات الآن</button>
            </div>
          )}

          {started && !done && current && (
            <div className="question-panel">
              <div className="question-meta">
                <span>{current.category}</span>
                <small>موقف {index + 1} من {scenarios.length}</small>
              </div>
              <h3>{current.text}</h3>
              <div className="choice-list">
                {current.options.map((option) => (
                  <button key={option.text} onClick={() => select(option)}>{option.text}<span>←</span></button>
                ))}
              </div>
            </div>
          )}

          {done && (
            <div className="lab-intro">
              <div className="big-icon">🎉</div>
              <h3>اكتمل تحليل البصمة الجدارية</h3>
              <p>استخدم الرادار لتحديد مجالات التركيز في رحلتك التعليمية.</p>
              <div className="button-row">
                <button className="primary-button" onClick={() => setActivePage("journey")}>انطلق للرحلة التعليمية</button>
                <button className="secondary-button" onClick={start}>أعد التقييم</button>
              </div>
            </div>
          )}
        </div>

        <div className="radar-card">
          {done ? <RadarSvg values={finalData} /> : <div className="chart-placeholder"><span>📊</span><p>الرادار الشبكي سيظهر بعد اعتماد إجاباتك.</p></div>}
          {done && (
            <div className="score-list">
              {labels.map((label, idx) => <span key={label}>{label}: <strong>{finalData[idx]}/5</strong></span>)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
