import { useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export default function AuthGate({ onEnter }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      if (!isSupabaseConfigured || !supabase) {
        const name = fullName.trim() || "زميل المهنة";
        localStorage.setItem("od_demo_name", name);
        onEnter({ session: null, name, demo: true });
        return;
      }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName || "زميل المهنة" } }
        });
        if (error) throw error;
        setMessage(data.session ? "أهلاً بك.. تم تفعيل الحساب والدخول بنجاح! 🚀" : "أرسلنا لك رابط التحقق السحابي.. شيك على إيميلك الحين لتأكيد الموثوقية الكلية 📨");
        if (data.session) onEnter({ session: data.session, name: fullName || data.user?.email || "زميل المهنة" });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const name = data.session?.user?.user_metadata?.full_name || data.session?.user?.email || "زميل المهنة";
        onEnter({ session: data.session, name });
      }
    } catch (error) {
      setMessage(error.message || "المعذرة.. تعذر إتمام العملية، تأكد من البيانات.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-card-integrated">
        <div className="brand-mark">RA</div>
        <h1>إتقان هندسة التطوير التنظيمي</h1>
        <p>مختبر معرفي بنكهة استشارية.. هنا نفكك الأعراض، ونقيس الفجوات، ونحاكي الواقع بعيداً عن الحلول المعلبة!</p>

        <div className="auth-tabs" role="tablist">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>حيّاك.. اقلط معنا ☕</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>عضو جديد؟ ابدأ رحلتك 🧭</button>
        </div>

        {!isSupabaseConfigured && (
          <div className="notice warning">
            وضع تجريبي محلي: لم نلتقط مفاتيح السيرفر بعد.. سيتم تتبع أثرك مؤقتاً داخل المتصفح.
          </div>
        )}

        <form onSubmit={submit} className="auth-form-integrated">
          {mode === "signup" && (
            <label>
              <span>الاسم الكريم (الثلاثي)</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="مثال: زميل المهنة البطل" required />
            </label>
          )}
          {!isSupabaseConfigured && (
            <label>
              <span>اسمك في الميدان</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="زميل المهنة" />
            </label>
          )}
          {isSupabaseConfigured && (
            <>
              <label>
                <span>البريد الإلكتروني المهني</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your-email@domain.com" required />
              </label>
              <label>
                <span>مفتاح العبور (كلمة المرور)</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} placeholder="••••••••" required />
              </label>
              {mode === "signup" && (
                <div className="notice warning">
                  💡 حط لك باسوورد جديد وخاص بهالمنصة عشان حوكمة حسابك، وخل مفاتيحك الباقية بأمان!
                </div>
              )}
            </>
          )}
          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? "يرتب الأوراق في الكواليس..." : isSupabaseConfigured ? (mode === "login" ? "ادخل المختبر الاستشاري 🏢" : "سمّ بالله وانطلق للرحلة 🚀") : "اقلط تجريبياً"}
          </button>
        </form>

        {message && <div className="notice" style={{ marginTop: '15px', borderRight: '4px solid var(--accent)' }}>{message}</div>}
      </div>
    </section>
  );
}