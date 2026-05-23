import { isSupabaseConfigured, supabase } from "./supabaseClient";

const WEEKLY_REFLECTIONS_TABLE =
  import.meta.env.VITE_WEEKLY_REFLECTIONS_TABLE || "weekly_reflections";

const LOCAL_KEY = "odacademy_weekly_reflections_v1";

function nowIso() {
  return new Date().toISOString();
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function cleanText(value, max = 3000) {
  return String(value || "").trim().slice(0, max);
}

function reflectionKey(monthIndex, weekIndex) {
  return `${safeNumber(monthIndex)}-${safeNumber(weekIndex)}`;
}

function normalizeReflection(row = {}) {
  const monthIndex = safeNumber(row.month_index ?? row.monthIndex);
  const weekIndex = safeNumber(row.week_index ?? row.weekIndex);
  const createdAt = row.created_at || nowIso();
  const updatedAt = row.updated_at || createdAt;

  return {
    id: row.id || reflectionKey(monthIndex, weekIndex),
    user_id: row.user_id || null,
    month_index: monthIndex,
    week_index: weekIndex,
    week_title: cleanText(row.week_title ?? row.weekTitle, 220),
    key_learning: cleanText(row.key_learning ?? row.keyLearning),
    observed_pattern: cleanText(row.observed_pattern ?? row.observedPattern),
    application_idea: cleanText(row.application_idea ?? row.applicationIdea),
    next_action: cleanText(row.next_action ?? row.nextAction),
    confidence_score: Math.min(5, Math.max(1, safeNumber(row.confidence_score ?? row.confidenceScore, 3))),
    status: row.status === "submitted" ? "submitted" : "draft",
    created_at: createdAt,
    updated_at: updatedAt
  };
}

function sortReflections(rows = []) {
  return [...rows].sort((a, b) => {
    const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
    const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
    return bDate - aDate;
  });
}

function readLocal() {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? sortReflections(parsed.map(normalizeReflection))
      : [];
  } catch {
    return [];
  }
}

function writeLocal(rows) {
  try {
    window.localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify(sortReflections(rows.map(normalizeReflection)))
    );
  } catch {
    // لا نوقف تجربة التعلم بسبب التخزين المحلي.
  }
}

function upsertLocal(payload) {
  const rows = readLocal();
  const normalized = normalizeReflection({
    ...payload,
    created_at: payload.created_at || nowIso(),
    updated_at: nowIso()
  });

  const key = reflectionKey(normalized.month_index, normalized.week_index);
  const filtered = rows.filter((row) => reflectionKey(row.month_index, row.week_index) !== key);
  const nextRows = sortReflections([normalized, ...filtered]);

  writeLocal(nextRows);

  return normalized;
}

async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.warn("تعذر قراءة المستخدم للتأمل الأسبوعي:", error.message);
      return null;
    }

    return data?.user || null;
  } catch (error) {
    console.warn("تعذر الاتصال بمستخدم Supabase:", error);
    return null;
  }
}

export async function getWeeklyReflection({ monthIndex, weekIndex }) {
  const localRows = readLocal();
  const localMatch = localRows.find((row) => {
    return (
      Number(row.month_index) === Number(monthIndex) &&
      Number(row.week_index) === Number(weekIndex)
    );
  }) || null;

  if (!isSupabaseConfigured || !supabase) {
    return localMatch;
  }

  const user = await getCurrentUser();

  if (!user?.id) {
    return localMatch;
  }

  const { data, error } = await supabase
    .from(WEEKLY_REFLECTIONS_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .eq("month_index", Number(monthIndex))
    .eq("week_index", Number(weekIndex))
    .maybeSingle();

  if (error) {
    console.warn("تعذر تحميل التأمل الأسبوعي:", error.message);
    return localMatch;
  }

  return data ? normalizeReflection(data) : localMatch;
}

export async function listWeeklyReflections({ limit = 10 } = {}) {
  const localRows = readLocal();

  if (!isSupabaseConfigured || !supabase) {
    return localRows.slice(0, limit);
  }

  const user = await getCurrentUser();

  if (!user?.id) {
    return localRows.slice(0, limit);
  }

  const { data, error } = await supabase
    .from(WEEKLY_REFLECTIONS_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(Math.min(Math.max(Number(limit) || 10, 1), 30));

  if (error) {
    console.warn("تعذر تحميل التأملات الأسبوعية:", error.message);
    return localRows.slice(0, limit);
  }

  const remoteRows = Array.isArray(data) ? data.map(normalizeReflection) : [];

  return sortReflections(remoteRows.length ? remoteRows : localRows).slice(0, limit);
}

export async function saveWeeklyReflection({
  monthIndex,
  weekIndex,
  weekTitle = "",
  keyLearning = "",
  observedPattern = "",
  applicationIdea = "",
  nextAction = "",
  confidenceScore = 3,
  status = "submitted"
}) {
  const payload = normalizeReflection({
    month_index: monthIndex,
    week_index: weekIndex,
    week_title: weekTitle,
    key_learning: keyLearning,
    observed_pattern: observedPattern,
    application_idea: applicationIdea,
    next_action: nextAction,
    confidence_score: confidenceScore,
    status
  });

  if (!payload.key_learning && !payload.application_idea && !payload.next_action) {
    throw new Error("اكتب على الأقل فكرة تعلم أو تطبيق أو إجراء قادم.");
  }

  if (!isSupabaseConfigured || !supabase) {
    return upsertLocal(payload);
  }

  const user = await getCurrentUser();

  if (!user?.id) {
    return upsertLocal(payload);
  }

  const remotePayload = {
    user_id: user.id,
    month_index: payload.month_index,
    week_index: payload.week_index,
    week_title: payload.week_title,
    key_learning: payload.key_learning,
    observed_pattern: payload.observed_pattern,
    application_idea: payload.application_idea,
    next_action: payload.next_action,
    confidence_score: payload.confidence_score,
    status: payload.status,
    updated_at: nowIso()
  };

  const { data, error } = await supabase
    .from(WEEKLY_REFLECTIONS_TABLE)
    .upsert(remotePayload, {
      onConflict: "user_id,month_index,week_index"
    })
    .select("*")
    .single();

  if (error) {
    console.warn("تعذر حفظ التأمل الأسبوعي في Supabase:", error.message);
    return upsertLocal(payload);
  }

  return normalizeReflection(data);
}
