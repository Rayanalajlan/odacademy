import { useMemo, useRef, useState } from "react";

const REPORT_LOGO_SRC = "/rayan-logo.png";

const INITIAL_METRICS = {
  health: 60,
  effectiveness: 50,
  trust: 100
};

const metricLabels = {
  health: "الصحة التنظيمية",
  effectiveness: "الفعالية التشغيلية",
  trust: "الثقة والموارد"
};

const stages = [
  {
    id: "entry",
    title: "المرحلة الأولى: الدخول والتعاقد التشخيصي",
    stepLabel: "الدخول",
    scenario:
      "المدير التنفيذي في شركة مسار اللوجستية يطلب منك حلًا عاجلًا: يريد دمج المبيعات والعمليات خلال أسبوعين لأن التأخير في الطلبات أصبح مكلفًا. الفريق التنفيذي منقسم، وكل إدارة تُحمّل الأخرى مسؤولية الأزمة. ما الخطوة المهنية الأولى؟",
    choices: [
      {
        id: "entry-a",
        text:
          "أطلب جلسة تعاقد قصيرة تحدد نطاق التشخيص، الأطراف المؤثرة، معايير النجاح، وحدود السرية قبل أي توصية تنظيمية.",
        impact: { health: 13, effectiveness: 10, trust: -5 },
        quality: "excellent",
        feedback:
          "قرار ناضج؛ بدأت من التعاقد لا من الحل. هذا يحمي العلاقة الاستشارية ويمنع اختطاف التشخيص برواية طرف واحد."
      },
      {
        id: "entry-b",
        text:
          "أبدأ مقابلات منفصلة مع المديرين لمعرفة أكثر طرف يعرقل التنفيذ، ثم أبني تصورًا أوليًا لسبب التعطّل.",
        impact: { health: 2, effectiveness: 4, trust: -8 },
        quality: "fair",
        feedback:
          "الخطوة مفيدة جزئيًا، لكنها قد تحوّل التشخيص إلى بحث عن متهم. كان يلزم تعاقد واضح ومصادر بيانات أوسع."
      },
      {
        id: "entry-c",
        text:
          "أقترح ورشة قيادة عاجلة بين المبيعات والعمليات لتهدئة التوتر وتثبيت لغة مشتركة قبل متابعة القرار.",
        impact: { health: 4, effectiveness: -3, trust: -12 },
        quality: "weak",
        feedback:
          "الورشة قد تهدئ السطح، لكنها لا تكشف آليات إنتاج المشكلة. التسرع هنا يجعل التدخل يبدو لطيفًا لا تشخيصيًا."
      },
      {
        id: "entry-d",
        text:
          "أقبل طلب الدمج مبدئيًا وأضع مسودة هيكل مؤقتة ثم أراجع المخاطر بعد الحصول على موافقة الإدارة العليا.",
        impact: { health: -18, effectiveness: -14, trust: -22 },
        quality: "risky",
        feedback:
          "هذا قفز للحل قبل التشخيص. قد يرضي الاستعجال التنفيذي، لكنه يزيد غموض الأدوار ويخلق مقاومة مبكرة."
      }
    ]
  },
  {
    id: "diagnosis",
    title: "المرحلة الثانية: قراءة النظام بدل الأعراض",
    stepLabel: "التشخيص",
    scenario:
      "بعد جمع أولي للبيانات، ظهر أن المبيعات تُكافأ على عدد العقود، بينما العمليات تُحاسب على خفض التكلفة. كل إدارة تبدو منطقية داخل حوافزها، لكن النتيجة الكلية تعطل متكرر. ما القرار التشخيصي الأعمق؟",
    choices: [
      {
        id: "diagnosis-a",
        text:
          "أرسم خريطة تدفق الطلب من الوعد التجاري إلى التسليم، وأربط كل نقطة تعثر بالحوافز والصلاحيات ومؤشرات الأداء.",
        impact: { health: 16, effectiveness: 18, trust: -7 },
        quality: "excellent",
        feedback:
          "ممتاز؛ انتقلت من وصف الصراع إلى فهم التصميم الذي ينتجه. هذا هو جوهر التفكير النظمي في OD."
      },
      {
        id: "diagnosis-b",
        text:
          "أقارن مؤشرات المبيعات والعمليات خلال ستة أشهر، ثم أحدد الإدارة الأقل التزامًا بمؤشرات الخدمة المتفق عليها.",
        impact: { health: -2, effectiveness: 5, trust: -9 },
        quality: "fair",
        feedback:
          "البيانات مهمة، لكن صياغتها بهذه الطريقة تعيدك لمنطق اللوم. الأفضل ربط المؤشرات بتصميم الحوافز لا بالأشخاص فقط."
      },
      {
        id: "diagnosis-c",
        text:
          "أطلب من كل إدارة إعداد قائمة بالمشكلات التي تراها لدى الإدارة الأخرى، ثم أعرض النتائج في اجتماع مشترك.",
        impact: { health: -8, effectiveness: -4, trust: -16 },
        quality: "weak",
        feedback:
          "هذا قد يوسع ساحة الاتهام. أنت تحتاج بيانات نظامية لا قوائم شكاوى متبادلة تعمق الدفاعية."
      },
      {
        id: "diagnosis-d",
        text:
          "أقترح ميثاق تعاون مؤقت بين الإدارتين، يلتزم فيه الطرفان بتحسين التواصل لحين اكتمال التشخيص.",
        impact: { health: 5, effectiveness: 1, trust: -6 },
        quality: "fair",
        feedback:
          "الميثاق مفيد كإجراء تهدئة، لكنه ليس تشخيصًا كافيًا. المشكلة في التصميم، لا في نبرة التواصل وحدها."
      }
    ]
  },
  {
    id: "intervention",
    title: "المرحلة الثالثة: تصميم التدخل",
    stepLabel: "التدخل",
    scenario:
      "اتضح أن المشكلة ليست نقص تعاون فقط، بل تعارض في مؤشرات النجاح. المبيعات تنجح عند توقيع العقد، والعمليات تنجح عند تقليل التكلفة، ولا يوجد مؤشر مشترك لجودة التسليم. ما التدخل الأنسب؟",
    choices: [
      {
        id: "intervention-a",
        text:
          "أصمم مؤشرًا مشتركًا لنجاح الطلب المكتمل، وأربطه بمراجعة صلاحيات الوعد التجاري قبل توقيع العقود المعقدة.",
        impact: { health: 18, effectiveness: 24, trust: -10 },
        quality: "excellent",
        feedback:
          "قرار قوي؛ عالجت موضع عدم المواءمة بين الوعد والتنفيذ، وربطت المؤشر بالصلاحية لا بمجرد التوعية."
      },
      {
        id: "intervention-b",
        text:
          "أقترح اجتماعات أسبوعية إلزامية بين الإدارتين لمراجعة الطلبات المتأخرة وتحديد مسؤولية كل حالة.",
        impact: { health: 1, effectiveness: 6, trust: -8 },
        quality: "fair",
        feedback:
          "الاجتماعات قد تحسن المتابعة مؤقتًا، لكنها لا تعالج المؤشر والحافز والصلاحية التي تصنع التأخير."
      },
      {
        id: "intervention-c",
        text:
          "أوصي بنقل مدير من العمليات إلى المبيعات لمدة شهرين حتى يفهم كل طرف ضغط الطرف الآخر بشكل مباشر.",
        impact: { health: 3, effectiveness: -2, trust: -14 },
        quality: "weak",
        feedback:
          "التبادل قد يرفع التعاطف، لكنه لا يغير نظام المكافأة ولا نقطة القرار. أثره محدود إذا بقي التصميم كما هو."
      },
      {
        id: "intervention-d",
        text:
          "أدعم دمج الإدارتين تحت قيادة واحدة مع إنشاء وحدة تنسيق صغيرة لتقليل الخلافات وتسريع القرارات.",
        impact: { health: -14, effectiveness: -10, trust: -22 },
        quality: "risky",
        feedback:
          "الدمج قبل إصلاح أسباب التعارض قد ينقل الصراع إلى داخل هيكل أكبر. الشكل التنظيمي لا يحل خلل التصميم تلقائيًا."
      }
    ]
  },
  {
    id: "ethics",
    title: "المرحلة الرابعة: السرية والثقة المهنية",
    stepLabel: "الأخلاقيات",
    scenario:
      "أثناء مقابلة فردية، ذكر مدير العمليات تجاوزات في وعود المبيعات للعملاء. المدير التنفيذي يطلب منك أسماء من أدلوا بهذه المعلومات لأنه يريد معالجة الأمر سريعًا. كيف تتصرف؟",
    choices: [
      {
        id: "ethics-a",
        text:
          "أحافظ على السرية، وأعرض النمط كتحدٍ في الحوكمة وتدفق القرار دون كشف الأسماء أو تحويل البيانات إلى عقوبة.",
        impact: { health: 18, effectiveness: 10, trust: 12 },
        quality: "excellent",
        feedback:
          "هذا يحمي الثقة ويحوّل البيانات من اعترافات فردية إلى تعلم تنظيمي. السرية هنا ليست مجاملة بل شرط للتشخيص."
      },
      {
        id: "ethics-b",
        text:
          "أشارك الأسماء مع المدير التنفيذي فقط، بشرط ألا يستخدمها مباشرة، حتى أفهم منه سياق كل حالة بدقة أكبر.",
        impact: { health: -22, effectiveness: -8, trust: -35 },
        quality: "risky",
        feedback:
          "هذا يكسر عقد الثقة حتى لو كانت النية حسنة. في التشخيص التنظيمي، حماية المصدر جزء من حماية جودة البيانات."
      },
      {
        id: "ethics-c",
        text:
          "أطلب من المدير التنفيذي حضور بعض المقابلات القادمة حتى يسمع المشكلات مباشرة من أصحابها دون وسيط.",
        impact: { health: -16, effectiveness: -5, trust: -28 },
        quality: "weak",
        feedback:
          "وجود السلطة داخل المقابلات يغير طبيعة الإجابات. سيحصل المدير على كلام آمن، لا بيانات صادقة."
      },
      {
        id: "ethics-d",
        text:
          "أعيد صياغة النتائج كمخاطر عامة، ثم أطلب موافقة المشاركين إن احتجت استخدام أمثلة تفصيلية في التقرير.",
        impact: { health: 12, effectiveness: 8, trust: 8 },
        quality: "good",
        feedback:
          "تصرف مهني. أنت تحافظ على السرية وتفتح بابًا لاستخدام أمثلة محسوبة عند الحاجة وبموافقة واضحة."
      }
    ]
  },
  {
    id: "sustainability",
    title: "المرحلة الخامسة: تثبيت الأثر والاستدامة",
    stepLabel: "الاستدامة",
    scenario:
      "بعد تطبيق المؤشرات المشتركة وتعديل الصلاحيات، تحسنت النتائج أول شهر. لكنك تعرف أن التحسن المبكر قد ينهار عند ضغط الطلبات. ما خطوتك لضمان الاستدامة؟",
    choices: [
      {
        id: "sustainability-a",
        text:
          "أبني لوحة متابعة شهرية، ومراجعة تعلم قصيرة بعد الطلبات المتعثرة، ومالكًا واضحًا لكل قرار عابر بين الإدارتين.",
        impact: { health: 18, effectiveness: 20, trust: -5 },
        quality: "excellent",
        feedback:
          "قرار ممتاز؛ أنت لا تكتفي بالإطلاق، بل تصمم آلية تعلم ومساءلة تجعل التحسن يصمد تحت الضغط."
      },
      {
        id: "sustainability-b",
        text:
          "أرفع تقريرًا نهائيًا للإدارة العليا يتضمن التحسن المبكر، وأوصي بتكرار التجربة في بقية الفروع عند الحاجة.",
        impact: { health: 2, effectiveness: 4, trust: 0 },
        quality: "fair",
        feedback:
          "التقرير مهم، لكنه لا يضمن استمرار السلوك الجديد. تحتاج آلية مراجعة لا وثيقة ختامية فقط."
      },
      {
        id: "sustainability-c",
        text:
          "أقترح احتفالًا داخليًا بنجاح الفريقين، مع رسائل تقدير للمديرين الذين تعاونوا في المرحلة الأولى.",
        impact: { health: 4, effectiveness: -2, trust: -4 },
        quality: "weak",
        feedback:
          "التقدير جميل، لكنه لا يحمي النظام عند عودة الضغط. الاستدامة تحتاج قياسًا وروتين تعلم واضح."
      },
      {
        id: "sustainability-d",
        text:
          "أطلب من الموارد البشرية تحويل ما حدث إلى برنامج تدريبي قصير عن التعاون بين الإدارات وإدارة الخلاف.",
        impact: { health: 3, effectiveness: 0, trust: -6 },
        quality: "fair",
        feedback:
          "التدريب قد يدعم الفهم، لكنه لا يكفي إذا لم يرتبط بروتين قياس وقرار ومساءلة داخل العمل اليومي."
      }
    ]
  }
];

function clampMetric(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyImpact(metrics, impact) {
  return {
    health: clampMetric(metrics.health + (impact.health || 0)),
    effectiveness: clampMetric(metrics.effectiveness + (impact.effectiveness || 0)),
    trust: clampMetric(metrics.trust + (impact.trust || 0))
  };
}

function getAttemptId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hashString(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let value = seed || 123456789;
  return function next() {
    value += 0x6d2b79f5;
    let temp = value;
    temp = Math.imul(temp ^ (temp >>> 15), temp | 1);
    temp ^= temp + Math.imul(temp ^ (temp >>> 7), temp | 61);
    return ((temp ^ (temp >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(items, seedText) {
  const random = seededRandom(hashString(seedText));
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
}

function getScoreLabel(score) {
  if (score >= 85) return "أداء استشاري متقدم";
  if (score >= 70) return "أداء مهني جيد";
  if (score >= 55) return "أداء متوسط يحتاج ضبطًا";
  return "تحتاج إعادة بناء النهج";
}

function getScoreColor(score) {
  if (score >= 85) return "#10b981";
  if (score >= 70) return "#4f46e5";
  if (score >= 55) return "#f59e0b";
  return "#ef4444";
}

function calculateScore(metrics, history) {
  const averageMetrics = Math.round((metrics.health + metrics.effectiveness + metrics.trust) / 3);
  const decisionQuality = history.reduce((sum, item) => {
    if (item.choice.quality === "excellent") return sum + 18;
    if (item.choice.quality === "good") return sum + 15;
    if (item.choice.quality === "fair") return sum + 10;
    if (item.choice.quality === "weak") return sum + 5;
    return sum + 0;
  }, 0);
  const maxDecisionQuality = stages.length * 18;
  const decisionScore = Math.round((decisionQuality / maxDecisionQuality) * 100);
  return Math.round(averageMetrics * 0.55 + decisionScore * 0.45);
}

function metricAdvice(metrics) {
  const weakest = Object.entries(metrics).sort((a, b) => a[1] - b[1])[0]?.[0];
  if (weakest === "health") return "أضعف منطقة لديك هي الصحة التنظيمية؛ ركّز على الثقة، السرية، والعدالة في جمع البيانات.";
  if (weakest === "effectiveness") return "أضعف منطقة لديك هي الفعالية التشغيلية؛ اربط التدخل بمؤشرات العمل وتدفق القرار لا بالأنشطة فقط.";
  return "أضعف منطقة لديك هي الثقة والموارد؛ راقب أثر قراراتك على العلاقة الاستشارية وميزانية التدخل.";
}

function formatDateTime(date = new Date()) {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(date);
}

function qualityLabel(quality) {
  const labels = {
    excellent: "ممتاز",
    good: "جيد جدًا",
    fair: "مقبول",
    weak: "ضعيف",
    risky: "خطر"
  };
  return labels[quality] || "غير محدد";
}

function loadHtml2Pdf() {
  if (window.html2pdf) return Promise.resolve(window.html2pdf);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-html2pdf='true']");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.html2pdf));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.async = true;
    script.dataset.html2pdf = "true";
    script.onload = () => {
      if (window.html2pdf) resolve(window.html2pdf);
      else reject(new Error("تعذر تحميل مكتبة PDF."));
    };
    script.onerror = () => reject(new Error("تعذر تحميل مكتبة PDF."));
    document.head.appendChild(script);
  });
}

function openPrintableReport(reportHtml) {
  const printWindow = window.open("", "_blank", "width=1100,height=800");
  if (!printWindow) return;
  printWindow.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>تقرير المحاكاة</title></head><body>${reportHtml}<script>window.onload=function(){window.print();};<\/script></body></html>`);
  printWindow.document.close();
}

function MetricBar({ label, value, tone }) {
  return (
    <div className="sim-metric">
      <div className="sim-metric-head">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="sim-track">
        <i className={`sim-track-fill sim-track-fill--${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ReportDeck({ metrics, history, finalScore, reportDate }) {
  return (
    <div className="sim-report-deck" dir="rtl">
      <style>{`
        .sim-report-deck {
          width: 794px;
          min-height: 1123px;
          color: #0f172a;
          background: #f8fafc;
          font-family: Tajawal, Arial, Tahoma, sans-serif;
          padding: 0;
          box-sizing: border-box;
        }
        .sim-report-slide {
          width: 794px;
          min-height: 1123px;
          padding: 48px;
          box-sizing: border-box;
          background:
            radial-gradient(circle at 10% 10%, rgba(79,70,229,.18), transparent 30%),
            radial-gradient(circle at 90% 20%, rgba(245,158,11,.16), transparent 26%),
            linear-gradient(135deg, #ffffff, #eef2ff);
          page-break-after: always;
        }
        .sim-report-cover {
          min-height: 1027px;
          border-radius: 34px;
          color: white;
          padding: 44px;
          box-sizing: border-box;
          background: linear-gradient(145deg, #0f172a, #1e293b 54%, #312e81);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          position: relative;
        }
        .sim-report-cover:before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          left: -160px;
          top: -120px;
          border-radius: 999px;
          background: rgba(245,158,11,.18);
        }
        .sim-report-brand { position: relative; z-index: 1; display:flex; align-items:center; gap:16px; }
        .sim-report-logo { width:72px; height:72px; border-radius:24px; background:white; padding:7px; object-fit:contain; }
        .sim-report-brand b { display:block; font-size:22px; }
        .sim-report-brand span { display:block; margin-top:6px; color:#cbd5e1; font-size:13px; font-weight:700; }
        .sim-report-title { position: relative; z-index: 1; }
        .sim-report-title small { color:#fde68a; font-size:14px; font-weight:900; }
        .sim-report-title h1 { margin:18px 0 16px; font-size:48px; line-height:1.25; }
        .sim-report-title p { margin:0; color:#e2e8f0; font-size:17px; line-height:2; font-weight:700; }
        .sim-report-score { position: relative; z-index: 1; display:grid; grid-template-columns: 1fr 1fr; gap:18px; }
        .sim-report-score-card { background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.14); border-radius:26px; padding:22px; }
        .sim-report-score-card span { display:block; color:#cbd5e1; font-size:12px; font-weight:800; }
        .sim-report-score-card strong { display:block; margin-top:10px; color:#fff; font-size:34px; }
        .sim-report-section { background:white; border:1px solid #e2e8f0; border-radius:30px; padding:28px; box-shadow:0 18px 48px rgba(15,23,42,.08); }
        .sim-report-section h2 { margin:0 0 18px; font-size:28px; }
        .sim-report-section p { margin:0 0 14px; color:#475569; font-size:15px; line-height:2; font-weight:700; }
        .sim-report-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:20px; }
        .sim-report-metric { border-radius:22px; padding:18px; background:#f8fafc; border:1px solid #e2e8f0; }
        .sim-report-metric span { display:block; color:#64748b; font-size:12px; font-weight:800; }
        .sim-report-metric strong { display:block; margin-top:8px; font-size:28px; }
        .sim-report-decision { margin-top:14px; border-radius:22px; padding:18px; background:#f8fafc; border:1px solid #e2e8f0; }
        .sim-report-decision h3 { margin:0 0 10px; font-size:17px; }
        .sim-report-decision p { margin:0 0 8px; font-size:13px; line-height:1.9; }
        .sim-report-decision small { display:inline-block; margin-top:8px; padding:7px 10px; border-radius:999px; background:#eef2ff; color:#3730a3; font-weight:900; }
      `}</style>

      <section className="sim-report-slide">
        <div className="sim-report-cover">
          <div className="sim-report-brand">
            <img className="sim-report-logo" src={REPORT_LOGO_SRC} alt="Rayan logo" />
            <div>
              <b>OD Engineering</b>
              <span>مختبر المحاكاة الاستشارية</span>
            </div>
          </div>

          <div className="sim-report-title">
            <small>تقرير محاولة محاكاة</small>
            <h1>شركة مسار اللوجستية</h1>
            <p>
              تقرير مصمم كعرض مختصر يوضح قراراتك، أثرها على المؤشرات، وجودة النهج الاستشاري في التعامل مع التشخيص، التدخل، السرية، والاستدامة.
            </p>
          </div>

          <div className="sim-report-score">
            <div className="sim-report-score-card">
              <span>التقييم النهائي</span>
              <strong>{finalScore}%</strong>
            </div>
            <div className="sim-report-score-card">
              <span>المستوى</span>
              <strong style={{ fontSize: 23 }}>{getScoreLabel(finalScore)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="sim-report-slide">
        <div className="sim-report-section">
          <h2>ملخص الأثر النهائي</h2>
          <p>تاريخ التصدير: {reportDate}</p>
          <p>{metricAdvice(metrics)}</p>
          <div className="sim-report-grid">
            <div className="sim-report-metric"><span>{metricLabels.health}</span><strong>{metrics.health}%</strong></div>
            <div className="sim-report-metric"><span>{metricLabels.effectiveness}</span><strong>{metrics.effectiveness}%</strong></div>
            <div className="sim-report-metric"><span>{metricLabels.trust}</span><strong>{metrics.trust}%</strong></div>
          </div>
        </div>

        <div className="sim-report-section" style={{ marginTop: 22 }}>
          <h2>قراءة مهنية مختصرة</h2>
          <p>
            لا تقيس هذه المحاكاة صحة الإجابة فقط، بل تقيس طريقة التفكير: هل بدأت بالتعاقد؟ هل قرأت النظام؟ هل عالجت التصميم؟ هل حافظت على السرية؟ وهل بنيت آلية تستمر بعد انتهاء التدخل؟
          </p>
          <p>
            كل قرار يغيّر مؤشرات الصحة التنظيمية، الفعالية التشغيلية، والثقة والموارد. لذلك فالمؤشر النهائي هو أثر تراكمي للنهج لا نتيجة خطوة واحدة.
          </p>
        </div>
      </section>

      <section className="sim-report-slide">
        <div className="sim-report-section">
          <h2>سجل القرارات</h2>
          {history.map((item, index) => (
            <div className="sim-report-decision" key={item.stage.id}>
              <h3>{index + 1}. {item.stage.title}</h3>
              <p><b>اختيارك:</b> {item.choice.text}</p>
              <p><b>الأثر:</b> صحة {item.choice.impact.health >= 0 ? "+" : ""}{item.choice.impact.health} · فعالية {item.choice.impact.effectiveness >= 0 ? "+" : ""}{item.choice.impact.effectiveness} · ثقة/موارد {item.choice.impact.trust >= 0 ? "+" : ""}{item.choice.impact.trust}</p>
              <p><b>التغذية الراجعة:</b> {item.choice.feedback}</p>
              <small>جودة القرار: {qualityLabel(item.choice.quality)}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function SimulationLab() {
  const [started, setStarted] = useState(false);
  const [attemptId, setAttemptId] = useState(() => getAttemptId());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  const currentStage = stages[currentIndex];

  const shuffledChoices = useMemo(() => {
    if (!currentStage) return [];
    return shuffleWithSeed(currentStage.choices, `${attemptId}-${currentStage.id}`);
  }, [attemptId, currentStage]);

  const finalScore = useMemo(() => calculateScore(metrics, history), [metrics, history]);
  const reportDate = useMemo(() => formatDateTime(new Date()), [done]);

  function startSimulation() {
    setAttemptId(getAttemptId());
    setStarted(true);
    setCurrentIndex(0);
    setMetrics(INITIAL_METRICS);
    setHistory([]);
    setFeedback(null);
    setDone(false);
  }

  function resetSimulation() {
    startSimulation();
    window.setTimeout(() => {
      document.querySelector(".sim-workspace-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function chooseOption(choice) {
    const nextMetrics = applyImpact(metrics, choice.impact);
    const record = {
      stage: currentStage,
      choice,
      metricsBefore: metrics,
      metricsAfter: nextMetrics
    };

    setMetrics(nextMetrics);
    setHistory((items) => [...items, record]);
    setFeedback({ choice, metricsAfter: nextMetrics });
  }

  function continueAfterFeedback() {
    const nextIndex = currentIndex + 1;
    setFeedback(null);

    if (nextIndex >= stages.length) {
      setDone(true);
      setCurrentIndex(nextIndex);
      window.setTimeout(() => {
        document.querySelector(".sim-result-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return;
    }

    setCurrentIndex(nextIndex);
    window.setTimeout(() => {
      document.querySelector(".sim-workspace-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  async function downloadPdfReport() {
    if (!reportRef.current) return;

    setExporting(true);

    try {
      const html2pdf = await loadHtml2Pdf();
      await html2pdf()
        .set({
          margin: 0,
          filename: `OD-Simulation-Report-${new Date().toISOString().slice(0, 10)}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#f8fafc"
          },
          jsPDF: {
            unit: "px",
            format: [794, 1123],
            orientation: "portrait"
          },
          pagebreak: { mode: ["css", "legacy"] }
        })
        .from(reportRef.current)
        .save();
    } catch (error) {
      console.warn("تعذر إنشاء PDF تلقائيًا، سيتم فتح نسخة قابلة للطباعة:", error);
      openPrintableReport(reportRef.current.outerHTML);
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="simulation-lab" dir="rtl">
      <style>{`
        .simulation-lab {
          --ink:#0f172a;
          --muted:#64748b;
          --line:rgba(148,163,184,.22);
          --primary:#4f46e5;
          --violet:#7c3aed;
          --emerald:#10b981;
          --amber:#f59e0b;
          --rose:#e11d48;
          min-height:100vh;
          position:relative;
          overflow:hidden;
          padding:30px 16px 78px;
          color:var(--ink);
          background:
            radial-gradient(circle at 12% 10%, rgba(79,70,229,.16), transparent 31%),
            radial-gradient(circle at 88% 18%, rgba(245,158,11,.15), transparent 28%),
            linear-gradient(135deg,#f8fafc 0%,#eef2ff 48%,#fff7ed 100%);
        }

        .sim-wrap {
          width:min(1180px,100%);
          margin:0 auto;
          position:relative;
          z-index:1;
        }

        .sim-hero {
          border-radius:40px;
          padding:34px;
          color:white;
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.20), transparent 32%),
            linear-gradient(145deg,#0f172a,#1e293b 58%,#111827);
          box-shadow:0 28px 82px rgba(15,23,42,.20);
          overflow:hidden;
          position:relative;
        }

        .sim-hero h2 {
          margin:14px 0 12px;
          font-size:clamp(30px,4vw,56px);
          line-height:1.1;
          font-weight:950;
        }

        .sim-hero p {
          max-width:850px;
          margin:0;
          color:rgba(226,232,240,.88);
          font-size:15px;
          line-height:2;
          font-weight:750;
        }

        .sim-kicker {
          display:inline-flex;
          border-radius:999px;
          padding:8px 13px;
          color:#fde68a;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.16);
          font-size:12px;
          font-weight:950;
        }

        .sim-grid {
          margin-top:18px;
          display:grid;
          grid-template-columns:310px minmax(0,1fr);
          gap:18px;
          align-items:start;
        }

        .sim-side,
        .sim-card {
          border-radius:32px;
          background:rgba(255,255,255,.82);
          border:1px solid rgba(255,255,255,.94);
          box-shadow:0 22px 58px rgba(15,23,42,.08);
          backdrop-filter:blur(18px);
        }

        .sim-side {
          padding:20px;
          display:grid;
          gap:14px;
          position:sticky;
          top:20px;
        }

        .sim-metrics-panel {
          border-radius:28px;
          padding:20px;
          color:white;
          background:linear-gradient(150deg,#0f172a,#1e293b);
        }

        .sim-metrics-panel h3 {
          margin:0 0 18px;
          color:#c7d2fe;
          font-size:12px;
          font-weight:950;
          letter-spacing:.3px;
        }

        .sim-metric {
          display:grid;
          gap:8px;
          margin-top:14px;
        }

        .sim-metric-head {
          display:flex;
          justify-content:space-between;
          gap:10px;
          align-items:center;
          font-size:12px;
          font-weight:900;
        }

        .sim-track {
          height:9px;
          border-radius:999px;
          overflow:hidden;
          background:rgba(255,255,255,.12);
        }

        .sim-track-fill {
          display:block;
          height:100%;
          border-radius:inherit;
          transition:.35s ease;
        }

        .sim-track-fill--health { background:#10b981; }
        .sim-track-fill--effectiveness { background:#6366f1; }
        .sim-track-fill--trust { background:#f59e0b; }

        .sim-org-card {
          border-radius:26px;
          padding:18px;
          background:white;
          border:1px solid var(--line);
        }

        .sim-org-card span {
          display:block;
          color:#94a3b8;
          font-size:11px;
          font-weight:900;
          margin-bottom:8px;
        }

        .sim-org-card strong {
          display:block;
          color:#0f172a;
          font-size:15px;
          font-weight:950;
        }

        .sim-org-card p {
          margin:8px 0 0;
          color:#64748b;
          font-size:12px;
          line-height:1.8;
          font-weight:750;
        }

        .sim-card {
          padding:28px;
          min-height:560px;
        }

        .sim-intro-icon {
          width:62px;
          height:62px;
          border-radius:24px;
          display:grid;
          place-items:center;
          font-size:28px;
          background:#eef2ff;
          color:#3730a3;
          margin-bottom:18px;
        }

        .sim-card h3 {
          margin:0 0 12px;
          color:#0f172a;
          font-size:28px;
          line-height:1.35;
          font-weight:950;
        }

        .sim-card p {
          margin:0;
          color:#475569;
          font-size:14px;
          line-height:2;
          font-weight:750;
        }

        .sim-start-button,
        .sim-choice,
        .sim-action,
        .sim-export-button {
          font-family:inherit;
          border:0;
          cursor:pointer;
          transition:.24s ease;
        }

        .sim-start-button,
        .sim-action,
        .sim-export-button {
          margin-top:22px;
          border-radius:20px;
          padding:15px 20px;
          color:white;
          background:linear-gradient(135deg,#4f46e5,#7c3aed);
          font-size:13px;
          font-weight:950;
          box-shadow:0 18px 42px rgba(79,70,229,.22);
        }

        .sim-export-button {
          background:linear-gradient(135deg,#f59e0b,#d97706);
          color:#111827;
        }

        .sim-start-button:hover,
        .sim-action:hover,
        .sim-export-button:hover,
        .sim-choice:hover {
          transform:translateY(-3px);
        }

        .sim-workspace-head {
          display:flex;
          justify-content:space-between;
          gap:12px;
          align-items:center;
          padding-bottom:16px;
          border-bottom:1px solid var(--line);
          margin-bottom:18px;
        }

        .sim-stage-title {
          color:#4f46e5;
          font-size:12px;
          font-weight:950;
        }

        .sim-step-pill {
          border-radius:999px;
          padding:8px 11px;
          background:#f8fafc;
          color:#64748b;
          font-size:11px;
          font-weight:900;
        }

        .sim-scenario {
          padding:18px;
          border-radius:24px;
          background:#f8fafc;
          border:1px solid var(--line);
          color:#1e293b !important;
          font-size:15px !important;
          line-height:2.05 !important;
        }

        .sim-choices {
          display:grid;
          gap:12px;
          margin-top:18px;
        }

        .sim-choice {
          width:100%;
          text-align:right;
          border-radius:22px;
          padding:16px;
          display:grid;
          grid-template-columns:38px 1fr;
          gap:12px;
          align-items:start;
          background:white;
          border:1px solid #e2e8f0;
          box-shadow:0 12px 30px rgba(15,23,42,.05);
        }

        .sim-choice b {
          width:38px;
          height:38px;
          border-radius:15px;
          display:grid;
          place-items:center;
          color:#3730a3;
          background:#eef2ff;
          font-size:13px;
          font-weight:950;
        }

        .sim-choice span {
          color:#334155;
          font-size:13px;
          line-height:1.9;
          font-weight:850;
        }

        .sim-result-card {
          text-align:center;
        }

        .sim-result-score {
          width:170px;
          height:170px;
          border-radius:999px;
          display:grid;
          place-items:center;
          margin:0 auto 18px;
          color:white;
          box-shadow:0 24px 64px rgba(15,23,42,.18);
        }

        .sim-result-score strong {
          display:block;
          font-size:42px;
          font-weight:950;
        }

        .sim-result-actions {
          margin-top:20px;
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          justify-content:center;
        }

        .sim-modal-backdrop {
          position:fixed;
          inset:0;
          z-index:9999;
          display:grid;
          place-items:center;
          padding:18px;
          background:rgba(15,23,42,.66);
          backdrop-filter:blur(10px);
        }

        .sim-modal {
          width:min(650px,100%);
          border-radius:32px;
          padding:26px;
          background:white;
          box-shadow:0 30px 90px rgba(0,0,0,.30);
        }

        .sim-modal small {
          display:inline-flex;
          margin-bottom:10px;
          color:#4f46e5;
          font-size:12px;
          font-weight:950;
        }

        .sim-modal h3 {
          margin:0 0 12px;
          color:#0f172a;
          font-size:24px;
          line-height:1.4;
          font-weight:950;
        }

        .sim-modal p {
          margin:0;
          color:#475569;
          font-size:14px;
          line-height:2;
          font-weight:750;
        }

        .sim-impact-row {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:10px;
          margin:16px 0;
        }

        .sim-impact-box {
          border-radius:18px;
          padding:12px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
        }

        .sim-impact-box span {
          display:block;
          color:#64748b;
          font-size:11px;
          font-weight:850;
        }

        .sim-impact-box strong {
          display:block;
          margin-top:5px;
          font-size:18px;
          font-weight:950;
        }

        .sim-report-holder {
          position:fixed;
          left:-99999px;
          top:0;
          width:794px;
          z-index:-1;
          opacity:1;
          pointer-events:none;
        }

        @media (max-width:980px) {
          .sim-grid { grid-template-columns:1fr; }
          .sim-side { position:relative; top:auto; }
          .sim-impact-row { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="sim-wrap">
        <header className="sim-hero">
          <span className="sim-kicker">مختبر قرار حي</span>
          <h2>المحاكاة الاستشارية</h2>
          <p>
            واجه حالة تنظيمية مركبة، واتخذ قراراتك كمستشار تطوير تنظيمي. الخيارات هنا متقاربة ومموّهة حتى لا تكون الإجابة مكشوفة، والنتيجة تُقاس بأثر قراراتك على النظام لا بطول العبارة.
          </p>
        </header>

        <div className="sim-grid">
          <aside className="sim-side">
            <div className="sim-metrics-panel">
              <h3>مؤشرات الأثر الحي</h3>
              <MetricBar label={metricLabels.health} value={metrics.health} tone="health" />
              <MetricBar label={metricLabels.effectiveness} value={metrics.effectiveness} tone="effectiveness" />
              <MetricBar label={metricLabels.trust} value={metrics.trust} tone="trust" />
            </div>

            <div className="sim-org-card">
              <span>المنظمة المستهدفة</span>
              <strong>شركة مسار اللوجستية</strong>
              <p>450 موظفًا · فجوة تنسيق حادة · احتراق وظيفي · تضارب مؤشرات بين المبيعات والعمليات.</p>
            </div>
          </aside>

          <main className="sim-card sim-workspace-card">
            {!started && (
              <div>
                <div className="sim-intro-icon">🏢</div>
                <h3>المهمة: إنقاذ مسار اللوجستية</h3>
                <p>
                  تم استدعاؤك كمستشار تطوير تنظيمي رئيسي. الشركة تنمو ماليًا، لكن داخليًا تتصاعد الأزمة بين المبيعات والعمليات. المطلوب ليس اختيار إجابة واضحة، بل قراءة النظام واتخاذ قرارات مهنية تحفظ الثقة وتبني أثرًا قابلًا للاستدامة.
                </p>
                <button type="button" className="sim-start-button" onClick={startSimulation}>
                  اقبل المهمة الاستشارية
                </button>
              </div>
            )}

            {started && !done && currentStage && (
              <div>
                <div className="sim-workspace-head">
                  <span className="sim-stage-title">{currentStage.title}</span>
                  <span className="sim-step-pill">خطوة {currentIndex + 1} من {stages.length}</span>
                </div>

                <p className="sim-scenario">{currentStage.scenario}</p>

                <div className="sim-choices">
                  {shuffledChoices.map((choice, index) => (
                    <button
                      type="button"
                      className="sim-choice"
                      key={choice.id}
                      onClick={() => chooseOption(choice)}
                    >
                      <b>{["أ", "ب", "ج", "د"][index]}</b>
                      <span>{choice.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {done && (
              <div className="sim-result-card">
                <div className="sim-result-score" style={{ background: getScoreColor(finalScore) }}>
                  <div>
                    <strong>{finalScore}%</strong>
                    <span>{getScoreLabel(finalScore)}</span>
                  </div>
                </div>
                <h3>تقرير الختام الاستشاري</h3>
                <p>
                  {metricAdvice(metrics)} يمكنك الآن تنزيل تقرير المحاولة بصيغة PDF مصمم كعرض مختصر يحتوي ملخص الأثر وسجل قراراتك.
                </p>

                <div className="sim-result-actions">
                  <button type="button" className="sim-export-button" onClick={downloadPdfReport} disabled={exporting}>
                    {exporting ? "جارٍ تجهيز PDF..." : "تنزيل تقرير PDF"}
                  </button>
                  <button type="button" className="sim-action" onClick={resetSimulation}>
                    أعد خوض المحاكاة بنهج جديد
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {feedback && (
        <div className="sim-modal-backdrop" role="dialog" aria-modal="true">
          <div className="sim-modal">
            <small>تغذية راجعة فورية</small>
            <h3>جودة القرار: {qualityLabel(feedback.choice.quality)}</h3>
            <p>{feedback.choice.feedback}</p>

            <div className="sim-impact-row">
              <div className="sim-impact-box">
                <span>{metricLabels.health}</span>
                <strong>{feedback.metricsAfter.health}%</strong>
              </div>
              <div className="sim-impact-box">
                <span>{metricLabels.effectiveness}</span>
                <strong>{feedback.metricsAfter.effectiveness}%</strong>
              </div>
              <div className="sim-impact-box">
                <span>{metricLabels.trust}</span>
                <strong>{feedback.metricsAfter.trust}%</strong>
              </div>
            </div>

            <button type="button" className="sim-action" onClick={continueAfterFeedback}>
              {currentIndex + 1 >= stages.length ? "عرض التقرير النهائي" : "الانتقال للمرحلة التالية"}
            </button>
          </div>
        </div>
      )}

      <div className="sim-report-holder">
        <div ref={reportRef}>
          <ReportDeck metrics={metrics} history={history} finalScore={finalScore} reportDate={reportDate} />
        </div>
      </div>
    </section>
  );
}
