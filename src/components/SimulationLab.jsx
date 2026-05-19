import { useState } from "react";

const steps = [
  {
    stage: "المرحلة الأولى: طلب البيانات والتشخيص الأولي",
    text: "المدير التنفيذي يستعجلك ويقول: الصراع بين المبيعات والعمليات يعطلنا، أريد حلاً عاجلاً بإعادة هيكلة الإدارتين أو دمجهم. ما خطوتك الأولى؟",
    choices: [
      {
        text: "أرفض الحل الجاهز، وأطلب مراجعة RACI، وتحليل الاستقالات، ورسم تدفق رحلة الطلب بين الإدارتين.",
        effect: { health: 10, effect: 15, budget: -10 },
        feedback: "قرار حكيم. رفضت القفز للحل وبدأت بفهم شروط إنتاج السلوك."
      },
      {
        text: "أبدأ فورًا برسم هيكل جديد يدمج الإدارتين لتوفير الوقت.",
        effect: { health: -20, effect: -15, budget: -30 },
        feedback: "قفزت إلى الحل قبل التشخيص؛ الدمج العشوائي زاد غموض الأدوار."
      }
    ]
  },
  {
    stage: "المرحلة الثانية: فك شفرة السلوك الخفي",
    text: "اكتشفت أن الحوافز تكافئ المبيعات على عدد العقود، والعمليات على تقليل التكاليف. ما التدخل المناسب؟",
    choices: [
      {
        text: "أقترح تعديل الحوافز نحو العقود المغلقة بنجاح وجودة، وبناء مؤشر أداء مشترك بين الإدارتين.",
        effect: { health: 20, effect: 25, budget: -10 },
        feedback: "عالجت آلية إنتاج المشكلة لا العرض الظاهر."
      },
      {
        text: "أنظم ورشة بناء فريق لتقريب وجهات النظر وكسر الجليد.",
        effect: { health: 5, effect: -10, budget: -20 },
        feedback: "حل سطحي؛ الورشة لا تعالج تعارض المصالح في التصميم."
      }
    ]
  },
  {
    stage: "المرحلة الثالثة: الأخلاق المهنية والسرية",
    text: "أثناء المقابلات، ذكر مدير العمليات معلومات حساسة. المدير التنفيذي يضغط لمعرفة صاحب التصريح. كيف تتصرف؟",
    choices: [
      {
        text: "أتمسك بسرية البيانات، وأعرض المشكلة كنمط حوكمة مجمع دون كشف الاسم.",
        effect: { health: 15, effect: 10, budget: 10 },
        feedback: "حماية السرية رسخت الثقة وجعلت البيانات أكثر صدقًا."
      },
      {
        text: "أخبر المدير التنفيذي بالاسم سرًا لكسب ثقته وتجديد العقد.",
        effect: { health: -40, effect: -20, budget: -40 },
        feedback: "كارثة أخلاقية؛ تضررت الثقة وتوقف الناس عن إعطاء بيانات صادقة."
      }
    ]
  }
];

function Metric({ label, value, kind }) {
  return (
    <div className="metric-block">
      <div><span>{label}</span><strong>{value}%</strong></div>
      <div className="metric-track"><span className={`metric-fill ${kind}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export default function SimulationLab() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [metrics, setMetrics] = useState({ health: 60, effect: 50, budget: 100 });
  const [lastFeedback, setLastFeedback] = useState("");

  function start() {
    setStarted(true);
    setStep(0);
    setMetrics({ health: 60, effect: 50, budget: 100 });
    setLastFeedback("");
  }

  function choose(choice) {
    setMetrics((current) => ({
      health: Math.max(0, Math.min(100, current.health + choice.effect.health)),
      effect: Math.max(0, Math.min(100, current.effect + choice.effect.effect)),
      budget: Math.max(0, Math.min(100, current.budget + choice.effect.budget))
    }));
    setLastFeedback(choice.feedback);
    setStep((current) => current + 1);
  }

  const done = started && step >= steps.length;
  const current = steps[step];
  const winning = metrics.health >= 75 && metrics.effect >= 75;

  return (
    <section className="page-shell">
      <div className="section-hero">
        <span className="eyebrow">المحاكاة</span>
        <h2>مختبر المحاكاة الاستشارية</h2>
        <p>عش تجربة المستشار الاستراتيجي في شركة مسار اللوجستية واتخذ قراراتك تحت ضغط واقعي.</p>
      </div>

      <div className="simulation-grid">
        <aside className="dark-panel">
          <h4>مؤشرات الأثر الحي</h4>
          <Metric label="الصحة التنظيمية" value={metrics.health} kind="green" />
          <Metric label="الفعالية التشغيلية" value={metrics.effect} kind="indigo" />
          <Metric label="رصيد الثقة والميزانية" value={metrics.budget} kind="amber" />
          <div className="mini-card">
            <strong>شركة مسار اللوجستية</strong>
            <p>450 موظفًا · فجوة تنسيق حادة · احتراق وظيفي.</p>
          </div>
        </aside>

        <main className="lab-card">
          {!started && (
            <div className="lab-intro">
              <div className="big-icon">🏢</div>
              <h3>المهمة: إنقاذ مسار اللوجستية</h3>
              <p>الشركة تنمو ماليًا، لكن داخليًا الصراع يشتعل بين المبيعات والعمليات. ميزانيتك ووقتك محدودان.</p>
              <button className="primary-button" onClick={start}>اقبل المهمة الاستشارية</button>
            </div>
          )}

          {started && !done && current && (
            <div className="question-panel">
              <div className="question-meta"><span>{current.stage}</span><small>خطوة {step + 1} من {steps.length}</small></div>
              <h3>{current.text}</h3>
              {lastFeedback && <div className="notice">{lastFeedback}</div>}
              <div className="choice-list">
                {current.choices.map((choice) => <button key={choice.text} onClick={() => choose(choice)}>{choice.text}<span>←</span></button>)}
              </div>
            </div>
          )}

          {done && (
            <div className="lab-intro">
              <div className="big-icon">{winning ? "🏆" : "📉"}</div>
              <h3>{winning ? "مرتبة الخبير الاستراتيجي" : "تحتاج إعادة مراجعة للمنظومة"}</h3>
              <p>
                {winning
                  ? `استطعت إنقاذ مسار اللوجستية بمعايير مهنية وأخلاقية. الصحة التنظيمية ${metrics.health}% والفعالية ${metrics.effect}%.`
                  : `المشروع انتهى لكن المنظمة ما زالت تعاني. الصحة التنظيمية ${metrics.health}% والفعالية ${metrics.effect}%. أعد المحاكاة بمنطق نظمي أعمق.`}
              </p>
              <button className="secondary-button" onClick={start}>أعد خوض المحاكاة</button>
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
