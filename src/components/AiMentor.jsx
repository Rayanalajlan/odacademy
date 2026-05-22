import { useEffect, useMemo, useRef, useState } from "react";

const QUICK_LENSES = [
  {
    id: "symptom",
    title: "فكك العرض",
    prompt:
      "لدي عرض تنظيمي ظاهر، ساعدني على تفكيكه دون القفز للحل. اسألني عن النمط، الأطراف، والبيانات المطلوبة."
  },
  {
    id: "hypotheses",
    title: "ابنِ فرضيات",
    prompt:
      "ساعدني على بناء فرضيات متعددة لحالة تنظيمية، وميّز بين فرضية بشرية، هيكلية، ثقافية، وقيادية."
  },
  {
    id: "data",
    title: "اطلب بيانات",
    prompt:
      "ما البيانات التي يجب جمعها للتحقق من فرضيات التطوير التنظيمي؟ رتّبها حسب الأولوية والسهولة والحساسية."
  },
  {
    id: "intervention",
    title: "صمّم تدخل",
    prompt:
      "بعد التشخيص، ساعدني على تصميم تدخل تنظيمي متدرج، مع مخاطر التنفيذ ومؤشرات قياس الأثر."
  },
  {
    id: "ethics",
    title: "اختبر الأخلاقيات",
    prompt:
      "راجع الحالة من زاوية أخلاقية: السرية، تضارب المصالح، ضغط الإدارة، وحماية الموظفين."
  },
  {
    id: "meeting",
    title: "جهّز اجتماع",
    prompt:
      "ساعدني على تجهيز أسئلة اجتماع تشخيصي مع قائد إدارة، بحيث لا أتورط في تبني رواية واحدة."
  }
];

const STARTER_MESSAGES = [
  {
    role: "assistant",
    content:
      "حيّاك الله يا زميل المهنة. اكتب الحالة كما هي، وسأساعدك بالطريقة السقراطية: العرض، النمط، الفرضيات، البيانات، ثم التدخل. لا تقلق من ترتيب الكلام؛ ابدأ بما تعرفه."
  }
];

const SAUDI_QUOTA_MESSAGE =
  "يا زميل المهنة، واضح أن المختبر عليه ضغط اليوم والموجه أخذ نصيبه من الأسئلة. أعطني فرصة لين تتجدد الحصة، وارجع لي بعدها نكمّل التشخيص بهدوء. حفظت لك طريقة التفكير: لا تقفز للحل، ارجع للعرض والنمط والبيانات.";

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getNextSaudiMidnightIso() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(now).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  const nextRiyadhMidnightUtc = new Date(
    Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day) + 1,
      21,
      5,
      0
    )
  );

  return nextRiyadhMidnightUtc.toISOString();
}

function resolveResetAt(data, response) {
  const directReset = data?.resetAt || data?.reset_at || data?.retryAt || data?.retry_at;

  if (directReset) {
    return new Date(directReset).toISOString();
  }

  const retryAfter = response?.headers?.get?.("Retry-After");
  const retryAfterSeconds = Number(data?.retryAfterSeconds || data?.retry_after_seconds || retryAfter);

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return new Date(Date.now() + retryAfterSeconds * 1000).toISOString();
  }

  return getNextSaudiMidnightIso();
}

function getTimeLeft(resetAt) {
  if (!resetAt) {
    return {
      total: 0,
      label: ""
    };
  }

  const difference = new Date(resetAt).getTime() - Date.now();

  if (difference <= 0) {
    return {
      total: 0,
      label: "جاهز الآن"
    };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    total: difference,
    label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`
  };
}

function formatResetTime(resetAt) {
  if (!resetAt) return "";

  return new Intl.DateTimeFormat("ar-SA", {
    timeZone: "Asia/Riyadh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(new Date(resetAt));
}

function isQuotaMessage(errorMessage = "") {
  const lowered = errorMessage.toLowerCase();

  return (
    lowered.includes("quota") ||
    lowered.includes("limit") ||
    lowered.includes("daily") ||
    lowered.includes("429") ||
    lowered.includes("neurons") ||
    errorMessage.includes("الحصة") ||
    errorMessage.includes("الحد") ||
    errorMessage.includes("الاستخدام")
  );
}

export default function AiMentor() {
  const [messages, setMessages] = useState(STARTER_MESSAGES);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [quota, setQuota] = useState(null);
  const [countdown, setCountdown] = useState({ total: 0, label: "" });
  const [activeLens, setActiveLens] = useState("symptom");
  const endRef = useRef(null);

  const disabledByQuota = quota && countdown.total > 0;

  const selectedLens = useMemo(
    () => QUICK_LENSES.find((item) => item.id === activeLens) || QUICK_LENSES[0],
    [activeLens]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy, error, quota]);

  useEffect(() => {
    if (!quota?.resetAt) return undefined;

    setCountdown(getTimeLeft(quota.resetAt));

    const timer = window.setInterval(() => {
      const next = getTimeLeft(quota.resetAt);
      setCountdown(next);

      if (next.total <= 0) {
        setQuota(null);
        setError("");
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [quota?.resetAt]);

  function addMessage(role, content) {
    setMessages((current) => [
      ...current,
      {
        id: makeId(),
        role,
        content
      }
    ]);
  }

  function applyLens(lens) {
    setActiveLens(lens.id);
    setInput((current) => {
      if (current.trim()) return current;
      return lens.prompt;
    });
  }

  async function askMentor(customMessage) {
    const message = String(customMessage || input || "").trim();

    if (!message) {
      setError("اكتب الحالة أو السؤال أولًا.");
      return;
    }

    if (disabledByQuota) {
      setError(SAUDI_QUOTA_MESSAGE);
      return;
    }

    setBusy(true);
    setError("");
    setInput("");
    addMessage("user", message);

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          lens: selectedLens?.id,
          history: messages.slice(-8).map((item) => ({
            role: item.role,
            content: item.content
          }))
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 429 || data?.code === "AI_QUOTA_EXCEEDED") {
        const resetAt = resolveResetAt(data, response);

        setQuota({
          resetAt,
          message: data?.message || SAUDI_QUOTA_MESSAGE
        });

        addMessage(
          "assistant",
          `${data?.message || SAUDI_QUOTA_MESSAGE}\n\nالعودة المتوقعة: بعد الساعة ${formatResetTime(
            resetAt
          )} بتوقيت السعودية.`
        );

        return;
      }

      if (!response.ok) {
        const messageFromServer =
          data?.error ||
          data?.message ||
          "تعذر الاتصال بالموجه الذكي الآن. حاول بعد قليل.";

        if (isQuotaMessage(messageFromServer)) {
          const resetAt = resolveResetAt(data, response);

          setQuota({
            resetAt,
            message: SAUDI_QUOTA_MESSAGE
          });

          addMessage(
            "assistant",
            `${SAUDI_QUOTA_MESSAGE}\n\nالعودة المتوقعة: بعد الساعة ${formatResetTime(
              resetAt
            )} بتوقيت السعودية.`
          );

          return;
        }

        throw new Error(messageFromServer);
      }

      const answer =
        data?.answer ||
        data?.response ||
        "وصلني سؤالك، لكن لم أستطع توليد إجابة واضحة. أعد صياغة الحالة بتفاصيل أكثر.";

      addMessage("assistant", answer);
    } catch (caughtError) {
      const messageFromError =
        caughtError?.message || "تعذر تشغيل الموجه الذكي الآن.";

      setError(messageFromError);
      addMessage(
        "assistant",
        messageFromError.includes("Workers AI")
          ? messageFromError
          : "واجهتني مشكلة تقنية وأنا أحاول قراءة الحالة. جرّب مرة أخرى بعد قليل، أو اختصر الحالة في نقاط: العرض، الأطراف، ما حدث، وما القرار المطلوب."
      );
    } finally {
      setBusy(false);
    }
  }

  function clearChat() {
    setMessages(STARTER_MESSAGES);
    setError("");
    setQuota(null);
    setInput("");
  }

  return (
    <section className="ai-mentor-page" dir="rtl">
      <style>{`
        .ai-mentor-page {
          min-height: 100vh;
          padding: 30px 14px 70px;
          color: #0f172a;
          background:
            radial-gradient(circle at 12% 10%, rgba(79, 70, 229, 0.14), transparent 31%),
            radial-gradient(circle at 90% 18%, rgba(245, 158, 11, 0.13), transparent 30%),
            radial-gradient(circle at 48% 95%, rgba(16, 185, 129, 0.10), transparent 33%),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #fff7ed 100%);
        }

        .ai-mentor-wrap {
          width: min(1200px, 100%);
          margin: 0 auto;
        }

        .ai-mentor-hero {
          position: relative;
          overflow: hidden;
          border-radius: 38px;
          padding: 30px;
          color: white;
          background:
            radial-gradient(circle at 20% 18%, rgba(129, 140, 248, 0.26), transparent 32%),
            radial-gradient(circle at 86% 12%, rgba(245, 158, 11, 0.18), transparent 30%),
            linear-gradient(135deg, #0f172a, #1e1b4b 56%, #312e81);
          box-shadow: 0 28px 80px rgba(15, 23, 42, 0.20);
        }

        .ai-mentor-hero::before {
          content: "";
          position: absolute;
          inset: -70px;
          opacity: .32;
          background-image:
            linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 46px 46px;
          transform: rotate(-8deg);
        }

        .ai-mentor-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          align-items: center;
        }

        .mentor-kicker {
          display: inline-flex;
          padding: 8px 13px;
          border-radius: 999px;
          color: #fde68a;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.16);
          font-size: 12px;
          font-weight: 950;
        }

        .ai-mentor-hero h1 {
          margin: 16px 0 10px;
          font-size: clamp(32px, 4.8vw, 58px);
          line-height: 1.16;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .ai-mentor-hero p {
          margin: 0;
          max-width: 760px;
          color: rgba(226,232,240,.92);
          font-size: 15px;
          line-height: 2.05;
          font-weight: 760;
        }

        .mentor-status {
          min-width: 220px;
          border-radius: 26px;
          padding: 18px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(14px);
        }

        .mentor-status span {
          display: block;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .mentor-status strong {
          display: block;
          color: #fff;
          font-size: 20px;
          line-height: 1.5;
          font-weight: 950;
        }

        .mentor-status small {
          display: block;
          margin-top: 8px;
          color: #fde68a;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 850;
        }

        .mentor-grid {
          display: grid;
          grid-template-columns: .78fr 1.22fr;
          gap: 18px;
          margin-top: 18px;
        }

        .mentor-panel {
          border-radius: 32px;
          padding: 22px;
          background: rgba(255,255,255,.90);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 22px 60px rgba(15,23,42,.08);
          backdrop-filter: blur(18px);
        }

        .mentor-panel h2 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 24px;
          line-height: 1.45;
          font-weight: 950;
        }

        .mentor-panel p {
          margin: 0;
          color: #64748b;
          line-height: 1.9;
          font-size: 13px;
          font-weight: 750;
        }

        .lens-grid {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .lens-button {
          border: 1px solid rgba(148,163,184,.24);
          border-radius: 22px;
          padding: 14px;
          background: #fff;
          color: #0f172a;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          transition: .18s ease;
        }

        .lens-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 34px rgba(15,23,42,.08);
        }

        .lens-button.active {
          border-color: rgba(79,70,229,.35);
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.13), transparent 34%),
            #ffffff;
        }

        .lens-button strong {
          display: block;
          font-size: 14px;
          font-weight: 950;
          margin-bottom: 5px;
        }

        .lens-button span {
          display: block;
          color: #64748b;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 740;
        }

        .mentor-chat {
          min-height: 620px;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        .chat-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }

        .chat-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .chat-actions button {
          border: 0;
          border-radius: 999px;
          padding: 9px 13px;
          background: #f1f5f9;
          color: #334155;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 900;
        }

        .messages-box {
          overflow: auto;
          max-height: 520px;
          display: grid;
          gap: 12px;
          padding: 14px;
          border-radius: 26px;
          background:
            linear-gradient(180deg, rgba(248,250,252,.95), rgba(241,245,249,.80));
          border: 1px solid rgba(148,163,184,.16);
        }

        .message {
          display: grid;
          gap: 5px;
          max-width: 86%;
          animation: mentorFade .18s ease;
        }

        @keyframes mentorFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
          margin-right: auto;
        }

        .message.assistant {
          margin-left: auto;
        }

        .message-label {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
        }

        .message-bubble {
          white-space: pre-wrap;
          border-radius: 24px;
          padding: 14px 16px;
          line-height: 1.95;
          font-size: 13px;
          font-weight: 780;
          box-shadow: 0 12px 30px rgba(15,23,42,.05);
        }

        .message.user .message-bubble {
          color: #fff;
          background: linear-gradient(135deg, #4f46e5, #312e81);
          border-top-left-radius: 10px;
        }

        .message.assistant .message-bubble {
          color: #1e293b;
          background: #fff;
          border: 1px solid rgba(148,163,184,.22);
          border-top-right-radius: 10px;
        }

        .typing {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .typing i {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #94a3b8;
          animation: bounce 1s infinite ease-in-out;
        }

        .typing i:nth-child(2) {
          animation-delay: .12s;
        }

        .typing i:nth-child(3) {
          animation-delay: .24s;
        }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .45; }
          40% { transform: translateY(-5px); opacity: 1; }
        }

        .quota-card {
          margin-bottom: 14px;
          border-radius: 24px;
          padding: 16px;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.15), transparent 35%),
            #fffbeb;
          border: 1px solid #fde68a;
          color: #78350f;
        }

        .quota-card strong {
          display: block;
          font-size: 15px;
          line-height: 1.7;
          font-weight: 950;
        }

        .quota-card span {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 850;
        }

        .quota-timer {
          display: inline-flex;
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff;
          color: #92400e;
          font-size: 12px;
          font-weight: 950;
        }

        .mentor-error {
          margin-bottom: 12px;
          border-radius: 18px;
          padding: 12px;
          color: #9f1239;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          line-height: 1.8;
          font-size: 12px;
          font-weight: 850;
        }

        .composer {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .composer textarea {
          width: 100%;
          min-height: 112px;
          resize: vertical;
          border-radius: 22px;
          border: 1px solid #cbd5e1;
          padding: 15px;
          background: #fff;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.9;
          font-weight: 760;
          box-sizing: border-box;
        }

        .composer textarea:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79,70,229,.09);
        }

        .composer-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .composer-footer small {
          color: #64748b;
          line-height: 1.7;
          font-size: 11px;
          font-weight: 760;
        }

        .send-button {
          border: 0;
          min-height: 46px;
          border-radius: 17px;
          padding: 0 18px;
          color: #fff;
          background: linear-gradient(135deg, #4f46e5, #312e81);
          cursor: pointer;
          font-family: inherit;
          font-weight: 950;
          box-shadow: 0 16px 35px rgba(79,70,229,.22);
        }

        .send-button:disabled {
          cursor: not-allowed;
          opacity: .55;
          box-shadow: none;
        }

        @media (max-width: 960px) {
          .ai-mentor-hero-inner,
          .mentor-grid {
            grid-template-columns: 1fr;
          }

          .mentor-status {
            min-width: 0;
          }

          .message {
            max-width: 100%;
          }
        }

        @media (max-width: 560px) {
          .ai-mentor-page {
            padding: 18px 10px 46px;
          }

          .ai-mentor-hero,
          .mentor-panel {
            border-radius: 26px;
            padding: 20px;
          }
        }
      `}</style>

      <div className="ai-mentor-wrap">
        <header className="ai-mentor-hero">
          <div className="ai-mentor-hero-inner">
            <div>
              <span className="mentor-kicker">الموجه الذكي</span>
              <h1>مختبر سقراطي لفهم المنظمة قبل وصف العلاج</h1>
              <p>
                هذا ليس روبوت إجابات جاهزة؛ بل رفيق تشخيصي يساعدك على تفكيك
                العرض، بناء الفرضيات، طلب البيانات، ثم تصميم تدخل مهني بحذر.
              </p>
            </div>

            <div className="mentor-status">
              <span>حالة الموجه</span>
              <strong>
                {disabledByQuota ? "استراحة ذكية مؤقتة" : busy ? "يفكر معك..." : "جاهز للتشخيص"}
              </strong>
              <small>
                {disabledByQuota
                  ? `يعود تقريبًا بعد الساعة ${formatResetTime(quota.resetAt)}`
                  : "اكتب الحالة كما حدثت، لا كما تتمنى حلها."}
              </small>
            </div>
          </div>
        </header>

        <div className="mentor-grid">
          <aside className="mentor-panel">
            <h2>اختر عدسة التفكير</h2>
            <p>
              اختر العدسة، ثم اكتب حالتك. العدسة لا تعطيك إجابة، بل تضبط طريقة
              تفكير الموجه.
            </p>

            <div className="lens-grid">
              {QUICK_LENSES.map((lens) => (
                <button
                  key={lens.id}
                  type="button"
                  className={`lens-button ${activeLens === lens.id ? "active" : ""}`}
                  onClick={() => applyLens(lens)}
                >
                  <strong>{lens.title}</strong>
                  <span>{lens.prompt}</span>
                </button>
              ))}
            </div>
          </aside>

          <main className="mentor-panel mentor-chat">
            <div className="chat-top">
              <div>
                <h2>جلسة تشخيص</h2>
                <p>ابدأ بسطر واحد، أو اكتب الحالة كاملة. الأفضل: من؟ ماذا حدث؟ ما القرار المطلوب؟</p>
              </div>

              <div className="chat-actions">
                <button type="button" onClick={clearChat}>
                  مسح الجلسة
                </button>
              </div>
            </div>

            <div>
              {disabledByQuota && (
                <div className="quota-card" role="status" aria-live="polite">
                  <strong>الموجه مزدحم اليوم، بس ما راح نتركك معلّق.</strong>
                  <span>{quota.message || SAUDI_QUOTA_MESSAGE}</span>
                  <span className="quota-timer">
                    يفتح تقريبًا بعد: {countdown.label || "قليل"}
                  </span>
                </div>
              )}

              {error && (
                <div className="mentor-error" role="alert" aria-live="assertive">
                  {error}
                </div>
              )}

              <div className="messages-box" aria-live="polite">
                {messages.map((message, index) => (
                  <div
                    key={message.id || `${message.role}-${index}`}
                    className={`message ${message.role}`}
                  >
                    <span className="message-label">
                      {message.role === "user" ? "أنت" : "الموجه"}
                    </span>
                    <div className="message-bubble">{message.content}</div>
                  </div>
                ))}

                {busy && (
                  <div className="message assistant">
                    <span className="message-label">الموجه</span>
                    <div className="message-bubble">
                      <span className="typing">
                        <i />
                        <i />
                        <i />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>
            </div>

            <form
              className="composer"
              onSubmit={(event) => {
                event.preventDefault();
                askMentor();
              }}
            >
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="مثال: عندنا مقاومة لمبادرة تغيير، الإدارة تقول الموظفون غير متعاونين، والفريق يقول الأولويات غير واضحة..."
                disabled={busy || disabledByQuota}
              />

              <div className="composer-footer">
                <small>
                  الموجه يساعدك على التفكير، لكنه لا يستبدل حكمك المهني ولا قراءة البيانات الواقعية.
                </small>

                <button
                  type="submit"
                  className="send-button"
                  disabled={busy || disabledByQuota || !input.trim()}
                >
                  {busy ? "يفكر..." : "ابدأ التشخيص"}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </section>
  );
}
