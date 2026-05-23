import { isSupabaseConfigured, supabase } from "./supabaseClient";

export const ONBOARDING_VERSION = "2026-05-v1";

const LOCAL_PREFIX = `odacademy_onboarding_${ONBOARDING_VERSION}`;

function nowIso() {
  return new Date().toISOString();
}

function normalizePreferredStart(value) {
  const allowed = new Set(["pre-assessment", "journey", "home", "later"]);

  return allowed.has(value) ? value : "later";
}

function localKey(userKey = "guest") {
  return `${LOCAL_PREFIX}_${userKey || "guest"}`;
}

export function getLocalOnboardingState(userKey = "guest") {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(localKey(userKey));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function completeLocalOnboarding({
  userKey = "guest",
  preferredStart = "later"
} = {}) {
  const payload = {
    onboarding_version: ONBOARDING_VERSION,
    has_completed: true,
    preferred_start: normalizePreferredStart(preferredStart),
    completed_at: nowIso(),
    last_seen_at: nowIso(),
    source: "local"
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(localKey(userKey), JSON.stringify(payload));
    } catch {
      // لا نوقف التجربة إذا منع المتصفح التخزين المحلي.
    }
  }

  return payload;
}

async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.warn("تعذر قراءة المستخدم لحالة الترحيب:", error.message);
    return null;
  }

  return data?.user || null;
}

export async function getOnboardingState() {
  if (!isSupabaseConfigured || !supabase) {
    return getLocalOnboardingState("guest");
  }

  const user = await getCurrentUser();

  if (!user?.id) {
    return getLocalOnboardingState("guest");
  }

  const { data, error } = await supabase
    .from("user_onboarding")
    .select("*")
    .eq("user_id", user.id)
    .eq("onboarding_version", ONBOARDING_VERSION)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data || null;
}

export async function completeOnboarding({
  preferredStart = "later",
  stepsSeen = ["welcome", "path", "next-action"],
  metadata = {}
} = {}) {
  const normalizedStart = normalizePreferredStart(preferredStart);

  if (!isSupabaseConfigured || !supabase) {
    return completeLocalOnboarding({
      userKey: "guest",
      preferredStart: normalizedStart
    });
  }

  const user = await getCurrentUser();

  if (!user?.id) {
    return completeLocalOnboarding({
      userKey: "guest",
      preferredStart: normalizedStart
    });
  }

  const payload = {
    user_id: user.id,
    onboarding_version: ONBOARDING_VERSION,
    has_completed: true,
    preferred_start: normalizedStart,
    completed_at: nowIso(),
    last_seen_at: nowIso(),
    steps_seen: stepsSeen,
    metadata
  };

  const { data, error } = await supabase
    .from("user_onboarding")
    .upsert(payload, {
      onConflict: "user_id,onboarding_version"
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
