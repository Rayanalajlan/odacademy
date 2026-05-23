import { isSupabaseConfigured, supabase } from "./supabaseClient";

const STORAGE_PREFIX = "odacademy_welcome_email_checked";
const IN_FLIGHT = new Set();

export async function sendWelcomeEmailOnce() {
  if (!isSupabaseConfigured || !supabase) return {
    ok: false,
    skipped: true,
    reason: "supabase_not_configured"
  };

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.warn("تعذر قراءة جلسة الترحيب:", error.message);
    return {
      ok: false,
      skipped: true,
      reason: "session_error"
    };
  }

  const session = data?.session;
  const accessToken = session?.access_token;
  const userId = session?.user?.id;

  if (!accessToken || !userId) return {
    ok: false,
    skipped: true,
    reason: "no_active_session"
  };

  const storageKey = `${STORAGE_PREFIX}_${userId}`;

  if (localStorage.getItem(storageKey) === "done") {
    return {
      ok: true,
      skipped: true,
      reason: "already_checked_locally"
    };
  }

  if (IN_FLIGHT.has(userId)) {
    return {
      ok: true,
      skipped: true,
      reason: "already_in_flight"
    };
  }

  IN_FLIGHT.add(userId);

  try {
    const response = await fetch("/api/welcome-email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        language: navigator.language || "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Riyadh",
        userAgent: navigator.userAgent || ""
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (response.ok || payload?.skipped) {
      localStorage.setItem(storageKey, "done");
      return payload;
    }

    console.warn("تعذر إرسال إيميل الترحيب:", payload?.error || payload);

    return {
      ok: false,
      error: payload?.error || "welcome_email_failed",
      details: payload
    };
  } catch (caughtError) {
    console.warn("تعذر الاتصال بخدمة إيميل الترحيب:", caughtError);

    return {
      ok: false,
      error: caughtError?.message || "welcome_email_request_failed"
    };
  } finally {
    IN_FLIGHT.delete(userId);
  }
}
