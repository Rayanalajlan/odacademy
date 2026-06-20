import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "odacademy_ai_mentor_sessions_v2";
const ACTIVE_KEY = "odacademy_ai_mentor_active_session_v2";

const THINKING_MODES = [
  {
    id: "job_description",
    title: "بناء وصف وظيفي",
    subtitle: "من الغرض إلى المخرجات والصلاحيات والمؤشرات",
    prompt:
      "أريد وصفًا وظيفيًا عمليًا. أعطني خلاصة، 3 إلى 5 خطوات، قالبًا مختصرًا، ومثالًا قريبًا من الواقع. اسأل سؤالًا واحدًا فقط إذا كان ضروريًا.",
    badge: "1"
  },
  {
    id: "org_diagnosis",
    title: "تشخيص مشكلة تنظيمية",
    subtitle: "عرض، نمط، فرضيات، بيانات، قرار",
    prompt:
      "لدي مشكلة تنظيمية. شخّصها باختصار من زاوية العرض، النمط، السبب المحتمل، البيانات المطلوبة، وأول تدخل عملي. لا تطل ولا تسأل أكثر من سؤال واحد.",
    badge: "2"
  },
  {
    id: "intervention_design",
    title: "تصميم تدخل",
    subtitle: "تدخل متدرج لا يقفز فوق التشخيص",
    prompt:
      "أريد تصميم تدخل تنظيمي عملي بعد التشخيص. أعطني خطوات قصيرة، تجربة صغيرة، مؤشرات أثر، وخطرًا مهنيًا يجب الانتباه له.",
    badge: "3"
  },
  {
    id: "change",
    title: "إدارة تغيير",
    subtitle: "رسائل، مقاومة، أصحاب مصلحة، تثبيت",
    prompt:
      "أريد التعامل مع مقاومة تغيير. أعطني خلاصة عملية، قراءة مختصرة للمقاومة، خطة تواصل من 3 إلى 5 خطوات، وصياغة جاهزة عند الحاجة.",
    badge: "4"
  },
  {
    id: "performance",
    title: "أداء ومساءلة",
    subtitle: "أهداف، مؤشرات، تغذية راجعة، سلوك",
    prompt:
      "أريد تحليل مشكلة أداء دون لوم الموظف. أعطني تشخيصًا مختصرًا، خطوات عملية، مؤشرًا مناسبًا، وسلوكًا واحدًا نبدأ بتعديله.",
    badge: "5"
  },
  {
    id: "culture",
    title: "ثقافة ومناخ",
    subtitle: "ثقة، صمت تنظيمي، سلوك متكرر",
    prompt:
      "أريد قراءة مشكلة ثقافة أو مناخ تنظيمي. أعطني خلاصة، السلوك المتكرر، ما يكشفه عن النظام، وتدخلًا صغيرًا يمكن تجربته.",
    badge: "6"
  }
];

const STARTER_MESSAGE = {
  id: "starter",
  role: "assistant",
  content:
    "اختر الأداة المناسبة أو اكتب سؤالك مباشرة. سأتعامل مع طلبك كمسألة عمل: أوضح لك المنهجية، أعطيك خطوات قابلة للتنفيذ، ثم أختم بأسئلة تضبط التطبيق على حالتك."
};

const QUOTA_MESSAGE =
  "المختبر مزدحم اليوم ووصل إلى الحد المتاح من تشغيل الذكاء الاصطناعي. ارجع بعد تجدد الحصة وسنكمل من نفس المحادثة؛ محفوظة هنا ولن تضيع.";

const FRIENDLY_STARTER_MESSAGE = {
  ...STARTER_MESSAGE,
  content:
    "أبشر، اكتب سؤالك كما هو. بعطيك خلاصة عملية، خطوات مختصرة، ومثال يساعدك تطبق. وإذا احتجت تفاصيل بسألك سؤال واحد يضبط الاتجاه."
};

function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Riyadh"
  }).format(new Date(value));
}

function makeTitle(text) {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "جلسة جديدة";

  return cleaned.length > 44 ? `${cleaned.slice(0, 44)}...` : cleaned;
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

  return new Date(
    Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day) + 1,
      21,
      5,
      0
    )
  ).toISOString();
}

function resolveResetAt(data, response) {
  const directReset = data?.resetAt || data?.reset_at || data?.retryAt || data?.retry_at;

  if (directReset) return new Date(directReset).toISOString();

  const retryAfter = response?.headers?.get?.("Retry-After");
  const retryAfterSeconds = Number(data?.retryAfterSeconds || data?.retry_after_seconds || retryAfter);

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return new Date(Date.now() + retryAfterSeconds * 1000).toISOString();
  }

  return getNextSaudiMidnightIso();
}

function getTimeLeft(resetAt) {
  if (!resetAt) return { total: 0, label: "" };

  const difference = new Date(resetAt).getTime() - Date.now();

  if (difference <= 0) return { total: 0, label: "جاهز الآن" };

  const totalSeconds = Math.floor(difference / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    total: difference,
    label: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`
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
  const lowered = String(errorMessage).toLowerCase();

  return (
    lowered.includes("quota") ||
    lowered.includes("limit") ||
    lowered.includes("daily") ||
    lowered.includes("429") ||
    lowered.includes("neurons") ||
    String(errorMessage).includes("الحصة") ||
    String(errorMessage).includes("الحد") ||
    String(errorMessage).includes("الاستخدام")
  );
}

function cleanAssistantReply(value = "") {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`{1,3}/g, "")
    .replace(/\.{3,}/g, ".")
    .replace(/…/g, ".")
    .replace(/[ \t]+([،؛؟.!])/g, "$1")
    .replace(/([،؛؟.!])(?=\S)/g, "$1 ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function isStarterAssistantMessage(item) {
  if (!item || item.role !== "assistant") return false;

  const content = String(item.content || "").trim();

  return (
    item.id === STARTER_MESSAGE.id ||
    content === STARTER_MESSAGE.content ||
    content === FRIENDLY_STARTER_MESSAGE.content
  );
}

function serializeMentorHistory(messages = []) {
  const normalized = Array.isArray(messages)
    ? messages
        .filter((item) => !isStarterAssistantMessage(item))
        .map((item) => {
          const role = item?.role === "assistant" ? "assistant" : "user";
          const content = String(item?.content || "").trim();
          return content ? { role, content } : null;
        })
        .filter(Boolean)
    : [];

  while (normalized.length && normalized[0].role !== "user") {
    normalized.shift();
  }

  const compact = [];

  for (const item of normalized) {
    const previous = compact[compact.length - 1];

    if (previous?.role === item.role) {
      previous.content = `${previous.content}\n\n${item.content}`;
    } else {
      compact.push(item);
    }
  }

  return compact.slice(-8);
}

function createLocalMentorReply(message = "", modeTitle = "") {
  const topic = String(message || "").trim().slice(0, 220);
  const mode = String(modeTitle || "").trim();

  return [
    mode ? `أتعامل مع سؤالك من زاوية: ${mode}.` : "أتعامل مع سؤالك كحالة تنظيمية تحتاج تشخيصًا سريعًا.",
    "",
    topic ? `الخلاصة: السؤال يدور حول ${topic}.` : "الخلاصة: نحتاج تحديد العرض المتكرر قبل اختيار التدخل.",
    "",
    "الخطوة العملية:",
    "1. حدّد أين يظهر التعارض بالضبط: هدف، هيكل، صلاحية، قرار، أو سلوك.",
    "2. اكتب مثالين حديثين يوضحان أثر التعارض على العمل.",
    "3. اسأل: من يملك القرار؟ وما المعيار الذي يحسم الأولوية؟",
    "4. جرّب تعديلًا صغيرًا قابلًا للقياس قبل أي تغيير كبير.",
    "",
    "صياغة جاهزة: خلونا نفصل بين التعارض في الاتجاه والتعارض في الصلاحيات. إذا عرفنا القرار المتعطل ومن يملكه، نقدر نختبر حلًا صغيرًا ونقيس أثره."
  ].join("\n");
}

function makeSession(modeId = "job_description") {
  const timestamp = nowIso();

  return {
    id: makeId("session"),
    title: "جلسة جديدة",
    modeId,
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [FRIENDLY_STARTER_MESSAGE]
  };
}

function loadInitialState() {
  if (typeof window === "undefined") {
    const session = makeSession();

    return {
      sessions: [session],
      activeSessionId: session.id
    };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    const validSessions = Array.isArray(parsed)
      ? parsed.filter((session) => session?.id && Array.isArray(session?.messages))
      : [];

    if (validSessions.length) {
      const savedActive = window.localStorage.getItem(ACTIVE_KEY);
      const activeSessionId = validSessions.some((session) => session.id === savedActive)
        ? savedActive
        : validSessions[0].id;

      return {
        sessions: validSessions,
        activeSessionId
      };
    }
  } catch {
    // ignore corrupted storage
  }

  const session = makeSession();

  return {
    sessions: [session],
    activeSessionId: session.id
  };
}

export default function AiMentor() {
  const initialState = useMemo(() => loadInitialState(), []);
  const [sessions, setSessions] = useState(initialState.sessions);
  const [activeSessionId, setActiveSessionId] = useState(initialState.activeSessionId);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [quota, setQuota] = useState(null);
  const [countdown, setCountdown] = useState({ total: 0, label: "" });
  const [archiveQuery, setArchiveQuery] = useState("");
  const endRef = useRef(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  );

  const activeMode = useMemo(() => {
    const modeId = activeSession?.modeId || "job_description";
    return THINKING_MODES.find((mode) => mode.id === modeId) || THINKING_MODES[0];
  }, [activeSession?.modeId]);

  const filteredSessions = useMemo(() => {
    const query = archiveQuery.trim().toLowerCase();

    if (!query) return sessions;

    return sessions.filter((session) => {
      const haystack = [
        session.title,
        session.createdAt,
        session.updatedAt,
        ...(session.messages || []).map((message) => message.content)
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [archiveQuery, sessions]);

  const disabledByQuota = quota && countdown.total > 0;

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.localStorage.setItem(ACTIVE_KEY, activeSessionId || "");
  }, [sessions, activeSessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeSession?.messages, busy, error, quota]);

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

  function updateActiveSession(updater) {
    setSessions((current) =>
      current.map((session) => {
        if (session.id !== activeSessionId) return session;

        const updated = updater(session);

        return {
          ...session,
          ...updated,
          updatedAt: nowIso()
        };
      })
    );
  }

  function addMessage(role, content, options = {}) {
    const nextMessage = {
      id: makeId(role),
      role,
      content
    };

    updateActiveSession((session) => {
      const nextMessages = [...session.messages, nextMessage];
      const shouldRetitle =
        options.retitle ||
        (role === "user" && (!session.title || session.title === "جلسة جديدة"));

      return {
        messages: nextMessages,
        title: shouldRetitle ? makeTitle(content) : session.title
      };
    });
  }

  function setMode(modeId) {
    const mode = THINKING_MODES.find((item) => item.id === modeId) || THINKING_MODES[0];

    updateActiveSession(() => ({
      modeId: mode.id
    }));

    setInput((current) => current || mode.prompt);
  }

  function createSession(modeId = activeMode?.id || "job_description") {
    const session = makeSession(modeId);

    setSessions((current) => [session, ...current]);
    setActiveSessionId(session.id);
    setInput("");
    setError("");
    setQuota(null);
  }

  function deleteSession(sessionId) {
    setSessions((current) => {
      const next = current.filter((session) => session.id !== sessionId);

      if (!next.length) {
        const replacement = makeSession();
        setActiveSessionId(replacement.id);
        return [replacement];
      }

      if (sessionId === activeSessionId) {
        setActiveSessionId(next[0].id);
      }

      return next;
    });
  }

  function clearActiveSession() {
    updateActiveSession((session) => ({
      title: "جلسة جديدة",
      messages: [FRIENDLY_STARTER_MESSAGE],
      modeId: session.modeId || "job_description"
    }));

    setInput("");
    setError("");
    setQuota(null);
  }

  async function askMentor(customMessage) {
    const message = String(customMessage || input || "").trim();

    if (!message) {
      setError("اكتب الطلب أو الحالة أولًا.");
      return;
    }

    if (disabledByQuota) {
      setError(QUOTA_MESSAGE);
      return;
    }

    const previousMessages = activeSession?.messages || [];

    setBusy(true);
    setError("");
    setInput("");
    addMessage("user", message, { retitle: true });

    try {
      const compactHistory = serializeMentorHistory(previousMessages);

      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message,
          mode: activeMode?.id,
          modeTitle: activeMode?.title,
          messages: compactHistory
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 429 || data?.code === "AI_QUOTA_EXCEEDED") {
        const resetAt = resolveResetAt(data, response);
        const quotaMessage = data?.message || QUOTA_MESSAGE;

        setQuota({
          resetAt,
          message: quotaMessage
        });

        addMessage(
          "assistant",
          `${quotaMessage}\n\nالعودة المتوقعة: بعد الساعة ${formatResetTime(resetAt)} بتوقيت السعودية.`
        );

        return;
      }

      if (!response.ok) {
        const serverMessage =
          data?.error ||
          data?.message ||
          "تعذر تشغيل الموجه الآن. جرّب بعد قليل.";

        if (isQuotaMessage(serverMessage)) {
          const resetAt = resolveResetAt(data, response);

          setQuota({
            resetAt,
            message: QUOTA_MESSAGE
          });

          addMessage(
            "assistant",
            `${QUOTA_MESSAGE}\n\nالعودة المتوقعة: بعد الساعة ${formatResetTime(resetAt)} بتوقيت السعودية.`
          );

          return;
        }

        addMessage("assistant", cleanAssistantReply(createLocalMentorReply(message, activeMode?.title)));
        return;
      }

      const answer =
        data?.reply ||
        data?.answer ||
        data?.response ||
        data?.text ||
        "وصلني طلبك، لكن الرد لم يكن واضحًا. أعد صياغته بتفاصيل أكثر.";

      addMessage("assistant", cleanAssistantReply(answer));
    } catch (caughtError) {
      setError("");
      addMessage("assistant", cleanAssistantReply(createLocalMentorReply(message, activeMode?.title)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ai-command-page" dir="rtl">
      <style>{`
        .ai-command-page {
          min-height: 100vh;
          padding: 30px 14px 72px;
          color: #18102e;
          background:
            radial-gradient(circle at 10% 8%, rgba(139, 92, 246, 0.16), transparent 30%),
            radial-gradient(circle at 92% 13%, rgba(245, 158, 11, 0.15), transparent 28%),
            radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.10), transparent 36%),
            linear-gradient(135deg, #f4f0fb 0%, #efe9fb 52%, #fff7ed 100%);
        }

        .ai-command-wrap {
          width: min(1280px, 100%);
          margin: 0 auto;
        }

        .command-hero {
          position: relative;
          overflow: hidden;
          border-radius: 40px;
          padding: 32px;
          color: #fff;
          background:
            radial-gradient(circle at 18% 18%, rgba(129, 140, 248, .28), transparent 30%),
            radial-gradient(circle at 82% 8%, rgba(245, 158, 11, .20), transparent 30%),
            linear-gradient(135deg, #0c0717, #1e1b4b 58%, #3b1d6e);
          box-shadow: 0 28px 82px rgba(28, 17, 48, .22);
        }

        .command-hero::before {
          content: "";
          position: absolute;
          inset: -70px;
          opacity: .30;
          background-image:
            linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 46px 46px;
          transform: rotate(-8deg);
        }

        .command-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: center;
        }

        .command-kicker {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.16);
          color: #fde68a;
          font-size: 12px;
          font-weight: 950;
        }

        .command-hero h1 {
          margin: 16px 0 12px;
          font-size: clamp(34px, 5vw, 62px);
          line-height: 1.14;
          font-weight: 950;
          letter-spacing: -1.1px;
        }

        .command-hero p {
          margin: 0;
          max-width: 820px;
          color: rgba(196, 181, 253, .92);
          line-height: 2.05;
          font-size: 15px;
          font-weight: 760;
        }

        .command-live-card {
          min-width: 235px;
          border-radius: 28px;
          padding: 18px;
          background: rgba(255, 255, 255, .11);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(16px);
        }

        .command-live-card span {
          display: block;
          color: #c9bdf0;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .command-live-card strong {
          display: block;
          color: #fff;
          font-size: 20px;
          line-height: 1.5;
          font-weight: 950;
        }

        .command-live-card small {
          display: block;
          margin-top: 8px;
          color: #fde68a;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 850;
        }

        .command-layout {
          display: grid;
          grid-template-columns: 290px minmax(0, 1fr) 320px;
          gap: 16px;
          margin-top: 18px;
        }

        .command-panel {
          border-radius: 32px;
          padding: 20px;
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 22px 60px rgba(28, 17, 48,.08);
          backdrop-filter: blur(18px);
        }

        .command-panel h2 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: 22px;
          line-height: 1.45;
          font-weight: 950;
        }

        .command-panel p {
          margin: 0;
          color: #7a6c9a;
          line-height: 1.85;
          font-size: 12.5px;
          font-weight: 760;
        }

        .mode-grid {
          display: grid;
          gap: 9px;
          margin-top: 14px;
        }

        .mode-button {
          border: 1px solid rgba(167, 139, 250, .22);
          border-radius: 22px;
          padding: 13px;
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          background: #fff;
          color: #18102e;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          transition: .18s ease;
          overflow: hidden;
        }

        .mode-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 34px rgba(28, 17, 48,.08);
        }

        .mode-button.active {
          border-color: rgba(139, 92, 246,.36);
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 34%),
            #fff;
        }

        .mode-badge {
          width: 42px;
          height: 42px;
          min-width: 42px;
          max-width: 42px;
          min-height: 42px;
          max-height: 42px;
          flex: 0 0 42px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          font-size: 12px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: 0;
          direction: ltr;
          unicode-bidi: isolate;
          white-space: nowrap;
          overflow: hidden;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }

        .mode-copy {
          min-width: 0;
          display: block;
          overflow: hidden;
        }

        .mode-button strong {
          display: block;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 950;
        }

        .mode-button span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.65;
          font-weight: 750;
        }


        .mode-copy > span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.65;
          font-weight: 750;
          overflow-wrap: anywhere;
        }

        .chat-panel {
          min-height: 680px;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .chat-title strong {
          display: block;
          color: #18102e;
          font-size: 22px;
          line-height: 1.45;
          font-weight: 950;
        }

        .chat-title span {
          display: block;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .soft-button {
          border: 0;
          border-radius: 999px;
          padding: 9px 13px;
          background: #efe9fb;
          color: #463c63;
          font-family: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .messages-box {
          overflow: auto;
          max-height: 560px;
          display: grid;
          gap: 12px;
          padding: 14px;
          border-radius: 28px;
          background:
            linear-gradient(180deg, rgba(248,250,252,.96), rgba(241,245,249,.84));
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .message {
          display: grid;
          gap: 5px;
          max-width: 88%;
          animation: fadeIn .18s ease;
        }

        @keyframes fadeIn {
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
          color: #9d8fc0;
          font-size: 11px;
          font-weight: 900;
        }

        .message-bubble {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: normal;
          border-radius: 24px;
          padding: 14px 16px;
          line-height: 1.95;
          font-size: 13px;
          font-weight: 780;
          box-shadow: 0 12px 30px rgba(28, 17, 48,.05);
        }

        .message.user .message-bubble {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          border-top-left-radius: 10px;
        }

        .message.assistant .message-bubble {
          direction: rtl;
          text-align: right;
          unicode-bidi: plaintext;
          color: #281748;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.22);
          border-top-right-radius: 10px;
        }

        .typing {
          display: inline-flex;
          gap: 5px;
          align-items: center;
        }

        .typing i {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #9d8fc0;
          animation: bounce 1s infinite ease-in-out;
        }

        .typing i:nth-child(2) { animation-delay: .12s; }
        .typing i:nth-child(3) { animation-delay: .24s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .45; }
          40% { transform: translateY(-5px); opacity: 1; }
        }

        .quota-card,
        .error-card {
          margin-bottom: 12px;
          border-radius: 22px;
          padding: 14px;
          line-height: 1.85;
          font-size: 12px;
          font-weight: 850;
        }

        .quota-card {
          color: #78350f;
          background: #fffbeb;
          border: 1px solid #fde68a;
        }

        .error-card {
          color: #9f1239;
          background: #fff1f2;
          border: 1px solid #fecdd3;
        }

        .quota-timer {
          display: inline-flex;
          margin-top: 9px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff;
          color: #92400e;
          font-size: 12px;
          font-weight: 950;
        }

        .composer {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .composer textarea {
          width: 100%;
          min-height: 120px;
          resize: vertical;
          border-radius: 24px;
          border: 1px solid #c9bdf0;
          padding: 15px;
          background: #fff;
          color: #18102e;
          outline: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.9;
          font-weight: 760;
          box-sizing: border-box;
        }

        .composer textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,.09);
        }

        .composer-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .composer-footer small {
          color: #7a6c9a;
          line-height: 1.7;
          font-size: 11px;
          font-weight: 780;
        }

        .send-button {
          border: 0;
          min-height: 46px;
          border-radius: 18px;
          padding: 0 18px;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          cursor: pointer;
          font-family: inherit;
          font-weight: 950;
          box-shadow: 0 16px 35px rgba(139, 92, 246,.22);
        }

        .send-button:disabled {
          cursor: not-allowed;
          opacity: .55;
          box-shadow: none;
        }

        .archive-search {
          width: 100%;
          box-sizing: border-box;
          margin-top: 14px;
          min-height: 42px;
          border-radius: 16px;
          border: 1px solid #c9bdf0;
          padding: 0 12px;
          font-family: inherit;
          font-weight: 800;
          outline: none;
        }

        .archive-list {
          display: grid;
          gap: 9px;
          margin-top: 12px;
          max-height: 520px;
          overflow: auto;
          padding-left: 2px;
        }

        .archive-item {
          border: 1px solid rgba(167, 139, 250,.22);
          border-radius: 20px;
          padding: 12px;
          background: #fff;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          transition: .16s ease;
        }

        .archive-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(28, 17, 48,.07);
        }

        .archive-item.active {
          border-color: rgba(139, 92, 246,.36);
          background: #efe9fb;
        }

        .archive-item strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          line-height: 1.65;
          font-weight: 950;
        }

        .archive-item span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.65;
          margin-top: 4px;
          font-weight: 740;
        }

        .archive-item-footer {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: center;
          margin-top: 8px;
        }

        .delete-mini {
          border: 0;
          border-radius: 999px;
          padding: 5px 8px;
          background: #fff1f2;
          color: #be123c;
          font-family: inherit;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        @media (max-width: 1180px) {
          .command-layout {
            grid-template-columns: 1fr;
          }

          .command-hero-inner {
            grid-template-columns: 1fr;
          }

          .command-live-card {
            min-width: 0;
          }

          .message {
            max-width: 100%;
          }
        }

        @media (max-width: 560px) {
          .ai-command-page {
            padding: 18px 10px 46px;
          }

          .command-hero,
          .command-panel {
            border-radius: 26px;
            padding: 20px;
          }

          .chat-header,
          .composer-footer {
            display: block;
          }

          .header-actions {
            margin-top: 10px;
          }

          .send-button {
            width: 100%;
            margin-top: 10px;
          }
        }
      `}</style>

      <div className="ai-command-wrap">
        <header className="command-hero">
          <div className="command-hero-inner">
            <div>
              <span className="command-kicker">الموجه الذكي</span>
              <h1>الموجه الذكي</h1>
              <p>
                غرفة عمل ذكية داخل قسم الموجه الذكي: اكتب طلبك كما هو؛ وصف وظيفي،
                مشكلة أداء، تدخل تنظيمي، أو موقف تغيير. الموجه يعطيك إطار عمل
                واضحًا، ثم يسألك فقط عما يلزم لتخصيصه.
              </p>
            </div>

            <div className="command-live-card">
              <span>حالة المختبر</span>
              <strong>{disabledByQuota ? "استراحة مؤقتة" : busy ? "يبني الرد..." : "جاهز للعمل"}</strong>
              <small>
                {disabledByQuota
                  ? `يعود تقريبًا بعد الساعة ${formatResetTime(quota.resetAt)}`
                  : "المحادثات محفوظة تلقائيًا في الأرشيف."}
              </small>
            </div>
          </div>
        </header>

        <div className="command-layout">
          <aside className="command-panel">
            <h2>أدوات جاهزة</h2>
            <p>اختر نوع المهمة، وسيضبط الموجه طريقة الرد بدل إجابات عامة.</p>

            <div className="mode-grid">
              {THINKING_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`mode-button ${activeMode.id === mode.id ? "active" : ""}`}
                  onClick={() => setMode(mode.id)}
                >
                  <span className="mode-badge">{mode.badge}</span>
                  <span className="mode-copy">
                    <strong>{mode.title}</strong>
                    <span>{mode.subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <main className="command-panel chat-panel">
            <div className="chat-header">
              <div className="chat-title">
                <strong>{activeSession?.title || "جلسة جديدة"}</strong>
                <span>
                  {activeMode.title} · محفوظ تلقائيًا · آخر تحديث:{" "}
                  {formatDate(activeSession?.updatedAt)}
                </span>
              </div>

              <div className="header-actions">
                <button type="button" className="soft-button" onClick={() => createSession()}>
                  جلسة جديدة
                </button>
                <button type="button" className="soft-button" onClick={clearActiveSession}>
                  مسح هذه الجلسة
                </button>
              </div>
            </div>

            <div>
              {disabledByQuota && (
                <div className="quota-card" role="status" aria-live="polite">
                  <strong>الموجه مزدحم مؤقتًا.</strong>
                  <div>{quota.message || QUOTA_MESSAGE}</div>
                  <span className="quota-timer">يعود تقريبًا بعد: {countdown.label || "قليل"}</span>
                </div>
              )}

              {error && (
                <div className="error-card" role="alert" aria-live="assertive">
                  {error}
                </div>
              )}

              <div className="messages-box" aria-live="polite">
                {(activeSession?.messages || []).map((message, index) => (
                  <div key={message.id || `${message.role}-${index}`} className={`message ${message.role}`}>
                    <span className="message-label">{message.role === "user" ? "أنت" : "الموجه"}</span>
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
                placeholder="مثال: كيف أبني وصفًا وظيفيًا احترافيًا لأي دور؟ أو: عندي دوران مرتفع في قسم محدد وأريد تشخيص السبب..."
                disabled={busy || disabledByQuota}
              />

              <div className="composer-footer">
                <small>
                  محفوظ محليًا في هذا المتصفح. لا تدخل بيانات سرية أو أسماء أشخاص حقيقية داخل المحادثة.
                </small>

                <button
                  type="submit"
                  className="send-button"
                  disabled={busy || disabledByQuota || !input.trim()}
                >
                  {busy ? "يبني الرد..." : "إرسال للموجه"}
                </button>
              </div>
            </form>
          </main>

          <aside className="command-panel">
            <h2>أرشيف المحادثات</h2>
            <p>ابحث في محادثاتك السابقة أو ارجع لأي جلسة محفوظة.</p>

            <input
              className="archive-search"
              value={archiveQuery}
              onChange={(event) => setArchiveQuery(event.target.value)}
              placeholder="ابحث بكلمة أو فكرة..."
            />

            <div className="archive-list">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  className={`archive-item ${session.id === activeSessionId ? "active" : ""}`}
                  onClick={() => setActiveSessionId(session.id)}
                >
                  <strong>{session.title || "جلسة بدون عنوان"}</strong>
                  <span>{formatDate(session.updatedAt)}</span>
                  <div className="archive-item-footer">
                    <span>{Math.max(0, (session.messages?.length || 1) - 1)} رسالة</span>
                    <button
                      type="button"
                      className="delete-mini"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
