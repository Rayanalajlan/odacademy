import { useEffect, useRef, useState } from "react";

const REQUEST_TIMEOUT_MS = 45000;

const starterMessages = [
  {
    id: "starter-mentor",
    role: "mentor",
    text:
      "حيّاك الله يا زميل المهنة. اطرح عليّ حالة تنظيمية وسأساعدك بالطريقة السقراطية: العرض، النمط، الفرضيات، البيانات، ثم التدخل."
  }
];

function createMessage(role, text) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text
  };
}

async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getFriendlyError(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("timeout") || message.includes("aborted")) {
    return "الموجه الذكي استغرق وقتًا أطول من المتوقع. جرّب تقصير السؤال أو أعد المحاولة بعد لحظات.";
  }

  if (message.includes("failed to fetch") || message.includes("network")) {
    return "تعذر الاتصال بالموجه الذكي. تحقق من اتصال الإنترنت أو من نشر Cloudflare الأخير.";
  }

  if (message.includes("gemini_api_key")) {
    return "مفتاح GEMINI_API_KEY غير مضبوط في Cloudflare. أضفه كـ Secret / Encrypted ثم أعد النشر.";
  }

  return (
    error?.message ||
    "تعذر تشغيل الموجه السحابي الآن. استخدم الأسئلة يدويًا: ما العرض؟ ما النمط؟ ما الفرضيات؟ ما البيانات المطلوبة قبل الحل؟"
  );
}

function getMentorText(data) {
  if (typeof data?.text === "string" && data.text.trim()) {
    return data.text.trim();
  }

  if (typeof data?.error === "string" && data.error.trim()) {
    throw new Error(data.error.trim());
  }

  throw new Error("لم يصل رد واضح من الموجه الذكي.");
}

export default function AiMentor() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, busy]);

  async function send(event) {
    event.preventDefault();

    const userText = input.trim();

    if (!userText || busy) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    setMessages((current) => [...current, createMessage("user", userText)]);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userText
        })
      });

      const data = await readJsonSafely(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `تعذر الاتصال بالموجه الذكي. رمز الخطأ: ${response.status}`
        );
      }

      const mentorText = getMentorText(data);

      setMessages((current) => [
        ...current,
        createMessage("mentor", mentorText)
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        createMessage("mentor", getFriendlyError(error))
      ]);
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      send(event);
    }
  }

  function clearConversation() {
    setMessages(starterMessages);
    setInput("");
  }

  return (
    <section className="page-shell">
      <div className="section-hero">
        <span className="eyebrow">الموجه الذكي</span>
        <h2>موجه OD سقراطي</h2>
        <p>
          مساعد حواري لا يعطي حلولًا جاهزة، بل يساعدك على تفكيك الأعراض وفحص
          الفرضيات قبل التدخل.
        </p>
      </div>

      <div className="chat-shell">
        <div className="chat-messages" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`chat-message ${message.role}`}>
              <span>{message.role === "mentor" ? "الموجه" : "أنت"}</span>
              <p>{message.text}</p>
            </div>
          ))}

          {busy && (
            <div className="chat-message mentor">
              <span>الموجه</span>
              <p>يفكر في أسئلة تشخيصية مناسبة...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input" onSubmit={send}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب الحالة: ما العرض؟ أين يظهر؟ ما التفسيرات المتداولة؟"
            rows={3}
            disabled={busy}
          />

          <div style={{ display: "grid", gap: "10px" }}>
            <button
              className="primary-button"
              type="submit"
              disabled={busy || !input.trim()}
            >
              {busy ? "تفكير..." : "مناقشة 🧭"}
            </button>

            <button
              className="secondary-button"
              type="button"
              onClick={clearConversation}
              disabled={busy || messages.length === starterMessages.length}
            >
              مسح الحوار
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}