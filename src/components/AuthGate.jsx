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
        setMessage(data.session ? "تم إنشاء الحساب والدخول." : "تم إنشاء الحساب. إذا كانت رسائل التأكيد مفعّلة، راجع بريدك.");
        if (data.session) onEnter({ session: data.session, name: fullName || data.user?.email || "زميل المهنة" });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const name = data.session?.user?.user_metadata?.full_name || data.session?.user?.email || "زميل المهنة";
        onEnter({ session: data.session, name });
      }
    } catch (error) {
      setMessage(error.message || "تعذر إتمام العملية.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-screen">
      <div className="auth-card-integrated">
        <div className="brand-mark">RA</div>
        <h1>إتقان هندسة التطوير التنظيمي</h1>
        <p>منصة تدريبية عربية متكاملة تجمع الرحلة التعليمية، الرادار، المحاكاة، الموجه الذكي، ووثيقة الإتقان.</p>

        <div className="auth-tabs" role="tablist">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>دخول</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>تسجيل جديد</button>
        </div>

        {!isSupabaseConfigured && (
          <div className="notice warning">
            وضع تجريبي: لم يتم إدخال مفاتيح Supabase. سيتم حفظ التقدم محليًا في المتصفح.
          </div>
        )}

        <form onSubmit={submit} className="auth-form-integrated">
          {mode === "signup" && (
            <label>
              <span>الاسم الثلاثي</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="مثال: ريان صالح العجلان" />
            </label>
          )}
          {!isSupabaseConfigured && (
            <label>
              <span>اسم الظهور التجريبي</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="زميل المهنة" />
            </label>
          )}
          {isSupabaseConfigured && (
            <>
              <label>
                <span>البريد الإلكتروني</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label>
                <span>كلمة المرور</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
              </label>
              {mode === "signup" && (
                <div className="notice warning">
                  استخدم كلمة مرور جديدة خاصة بهذه المنصة، ولا تعيد استخدام كلمات مرورك المهمة.
                </div>
              )}
            </>
          )}
          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? "جارٍ المعالجة..." : isSupabaseConfigured ? (mode === "login" ? "ادخل المنصة" : "أنشئ الحساب") : "ادخل تجريبيًا"}
          </button>
        </form>

        {message && <div className="notice">{message}</div>}
      </div>
    </section>
  );
}
