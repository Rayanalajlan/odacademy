import { useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

export default function AuthPanel({ session, onAuthChanged }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <div className="auth-panel auth-panel--demo">
        <strong>وضع تجريبي محلي</strong>
        <span>لم يتم ربط مفاتيح Supabase بعد. سيتم حفظ التقدم في المتصفح مؤقتًا.</span>
      </div>
    );
  }

  async function sendMagicLink(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const redirectTo = import.meta.env.VITE_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });
    setBusy(false);
    setMessage(error ? error.message : "تم إرسال رابط الدخول إلى بريدك.");
  }

  async function signOut() {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    onAuthChanged?.(null);
  }

  if (session?.user) {
    return (
      <div className="auth-panel">
        <div>
          <strong>حساب الطالب</strong>
          <span>{session.user.email}</span>
        </div>
        <button className="ghost-button" type="button" onClick={signOut} disabled={busy}>
          تسجيل الخروج
        </button>
      </div>
    );
  }

  return (
    <form className="auth-panel" onSubmit={sendMagicLink}>
      <div>
        <strong>ربط التقدم بحساب الطالب</strong>
        <span>أدخل البريد لإرسال رابط الدخول وحفظ التقدم في Supabase.</span>
      </div>
      <div className="auth-form-row">
        <input
          type="email"
          placeholder="student@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button type="submit" disabled={busy}>
          {busy ? "جارٍ الإرسال..." : "إرسال الرابط"}
        </button>
      </div>
      {message && <small>{message}</small>}
    </form>
  );
}
