import { isSupabaseConfigured, supabase } from "./supabaseClient";

/**
 * Phase 35 - Welcome email final fix
 *
 * مبدأ مهم:
 * لا نعتبر الإيميل "انتهى" محليًا إلا إذا قال السيرفر:
 * - sent = true
 * - أو skipped بسبب welcome_email_already_sent
 *
 * استخدمنا v2 حتى نحاول الإرسال من جديد لمن كان عنده localStorage قديم منع المحاولة.
 */
const STORAGE_PREFIX = "odacademy_welcome_email_checked_v2";
const IN_FLIGHT = new Set();
const HEALTH_CACHE_MS = 6 * 60 * 60 * 1000;
let welcomeEmailHealthCache = null;

function getTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Riyadh";
  } catch {
    return "Asia/Riyadh";
  }
}

function getUserAgent() {
  try {
    return navigator.userAgent || "";
  } catch {
    return "";
  }
}

function markDone(storageKey, payload) {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        done: true,
        at: new Date().toISOString(),
        reason: payload?.reason || (payload?.sent ? "sent" : "done")
      })
    );
  } catch {
    // لا نوقف الموقع بسبب التخزين المحلي.
  }
}

function readDone(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);

    if (!raw) return false;
    if (raw === "done") return true;

    const parsed = JSON.parse(raw);
    return Boolean(parsed?.done);
  } catch {
    return false;
  }
}

export async function checkWelcomeEmailHealth() {
  try {
    const response = await fetch("/api/welcome-email", {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    return await response.json().catch(() => ({
      ok: false,
      error: "invalid_health_response"
    }));
  } catch (error) {
    return {
      ok: false,
      error: error?.message || "welcome_health_request_failed"
    };
  }
}

async function checkWelcomeEmailHealthCached({ force = false } = {}) {
  const now = Date.now();

  if (
    !force &&
    welcomeEmailHealthCache &&
    now - welcomeEmailHealthCache.checkedAt < HEALTH_CACHE_MS
  ) {
    return welcomeEmailHealthCache.payload;
  }

  const payload = await checkWelcomeEmailHealth();
  welcomeEmailHealthCache = {
    checkedAt: now,
    payload
  };

  return payload;
}

function isWelcomeEmailConfigMissing(payload) {
  const text = [
    payload?.error,
    payload?.message,
    payload?.reason,
    payload?.details
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    payload?.configured === false ||
    payload?.emailConfigured === false ||
    text.includes("environment variables are incomplete") ||
    text.includes("incomplete") ||
    text.includes("missing")
  );
}

export async function sendWelcomeEmailOnce({ force = false } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      skipped: true,
      reason: "supabase_not_configured"
    };
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.warn("تعذر قراءة جلسة الترحيب:", error.message);
    return {
      ok: false,
      skipped: true,
      reason: "session_error",
      details: error.message
    };
  }

  const session = data?.session;
  const accessToken = session?.access_token;
  const userId = session?.user?.id;

  if (!accessToken || !userId) {
    return {
      ok: false,
      skipped: true,
      reason: "no_active_session"
    };
  }

  const storageKey = `${STORAGE_PREFIX}_${userId}`;

  if (!force && readDone(storageKey)) {
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
    const health = await checkWelcomeEmailHealthCached({ force });

    if (!force && isWelcomeEmailConfigMissing(health)) {
      return {
        ok: true,
        skipped: true,
        reason: "welcome_email_service_not_configured",
        details: health
      };
    }

    const response = await fetch("/api/welcome-email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        force,
        timezone: getTimezone(),
        userAgent: getUserAgent()
      })
    });

    const payload = await response.json().catch(() => ({}));

    const alreadySent =
      payload?.skipped === true &&
      payload?.reason === "welcome_email_already_sent";

    if (payload?.sent === true || alreadySent) {
      markDone(storageKey, payload);
      return payload;
    }

    if (!response.ok) {
      console.warn("تعذر إرسال إيميل الترحيب:", payload?.error || payload);
      return {
        ok: false,
        error: payload?.error || "welcome_email_failed",
        details: payload
      };
    }

    return payload;
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
