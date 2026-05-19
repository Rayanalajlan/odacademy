import { useState } from "react";

const starterMessages = [
  {
    role: "mentor",
    text: "حيّاك الله يا زميل المهنة. اطرح عليّ حالة تنظيمية وسأساعدك بالطريقة السقراطية: العرض، النمط، الفرضيات، البيانات، ثم التدخل."
  }
];

export default function AiMentor() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(event) {
    event.preventDefault();
    const userText = input.trim();
    if (!userText || busy) return;

    setMessages((current) => [...current, { role: "user", text: userText }]);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر الاتصال بالموجه الذكي.");

      setMessages((current) => [...current, { role: "mentor", text: data.text }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "mentor",
          text:
            "تعذر تشغيل الموجه السحابي الآن. تأكد من ضبط متغير GEMINI_API_KEY في Cloudflare Pages Functions، أو استخدم هذا السؤال يدويًا: ما العرض؟ ما النمط؟ ما الفرضيات؟ ما البيانات المطلوبة قبل الحل؟"
        }
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-shell">
      <div className="section-hero">
        <span className="eyebrow">الموجه الذكي</span>
        <h2>موجه OD سقراطي</h2>
        <p>مساعد حواري لا يعطي حلولًا جاهزة، بل يساعدك على تفكيك الأعراض وفحص الفرضيات قبل التدخل.</p>
      </div>

      <div className="chat-shell">
        <div className="chat-messages">
          {messages.map((message, idx) => (
            <div key={idx} className={`chat-message ${message.role}`}>
              <span>{message.role === "mentor" ? "الموجه" : "أنت"}</span>
              <p>{message.text}</p>
            </div>
          ))}
          {busy && <div className="chat-message mentor"><span>الموجه</span><p>يفكر في أسئلة تشخيصية مناسبة...</p></div>}
        </div>

        <form className="chat-input" onSubmit={send}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="اكتب الحالة: ما العرض؟ أين يظهر؟ ما التفسيرات المتداولة؟"
            rows={3}
          />
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "تفكير..." : "مناقشة 🧭"}
          </button>
        </form>
      </div>
    </section>
  );
}
