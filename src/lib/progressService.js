import { supabase, isSupabaseConfigured } from "./supabaseClient";

const PROGRESS_TABLE = import.meta.env.VITE_PROGRESS_TABLE || "user_progress";
const LOCAL_PROGRESS_KEY = "odacademy_local_progress_v5_cloud_mirror";
const RETRY_DELAYS_MS = [450, 950, 1600];

function makeProgressKey(monthIndex, weekIndex, dayIndex) {
  return `${Number(monthIndex)}-${Number(weekIndex)}-${Number(dayIndex)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeStatus(status, completed = false) {
  if (status === "completed" || completed === true) return "completed";
  return "opened";
}

function normalizeRow(row = {}) {
  const status = normalizeStatus(row.status, row.completed);
  const openedAt = row.opened_at || row.openedAt || row.created_at || null;
  const completedAt = row.completed_at || row.completedAt || (status === "completed" ? row.updated_at : null);
  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? row.metadata
      : {};

  return {
    month_index: Number(row.month_index ?? row.monthIndex ?? row.month_no ?? row.monthNo),
    week_index: Number(row.week_index ?? row.weekIndex ?? row.week_no ?? row.weekNo),
    day_index: Number(row.day_index ?? row.dayIndex ?? row.day_no ?? row.dayNo),
    status,
    metadata,
    opened_at: openedAt,
    completed_at: completedAt || null,
    updated_at: row.updated_at || row.updatedAt || completedAt || openedAt || nowIso()
  };
}

function isSchemaCompatibilityError(error) {
  const message = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`.toLowerCase();
  return (
    message.includes("column") ||
    message.includes("schema cache") ||
    message.includes("month_index") ||
    message.includes("week_index") ||
    message.includes("day_index") ||
    message.includes("opened_at")
  );
}

function sortProgressRows(rows) {
  return [...rows].sort((a, b) => {
    if (a.month_index !== b.month_index) return a.month_index - b.month_index;
    if (a.week_index !== b.week_index) return a.week_index - b.week_index;
    return a.day_index - b.day_index;
  });
}

function safeLocalStorage() {
  return typeof window !== "undefined" ? window.localStorage : null;
}

function getLocalProgressKey(userId = "guest") {
  const safeUserId = String(userId || "guest").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${LOCAL_PROGRESS_KEY}_${safeUserId}`;
}

function readLocalProgress(userId = "guest") {
  try {
    const storage = safeLocalStorage();
    if (!storage) return [];

    const scopedKey = getLocalProgressKey(userId);
    const raw = storage.getItem(scopedKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? sortProgressRows(parsed.map(normalizeRow)) : [];

    return rows;
  } catch (error) {
    console.warn("تعذر قراءة نسخة التقدم المحلية:", error);
    return [];
  }
}

function writeLocalProgress(rows, userId = "guest") {
  try {
    const storage = safeLocalStorage();
    if (!storage) return;

    const safeRows = sortProgressRows(rows.map(normalizeRow));
    storage.setItem(getLocalProgressKey(userId), JSON.stringify(safeRows));
  } catch (error) {
    console.warn("تعذر تحديث نسخة التقدم المحلية:", error);
  }
}

export function clearLocalProgressForUser(userId = "guest") {
  try {
    const storage = safeLocalStorage();
    if (!storage) return;

    storage.removeItem(getLocalProgressKey(userId));
  } catch (error) {
    console.warn("تعذر مسح نسخة التقدم المحلية:", error);
  }
}

function mergeTwoRows(oldRow, nextRow) {
  const oldNormalized = normalizeRow(oldRow);
  const nextNormalized = normalizeRow(nextRow);

  const oldCompleted = oldNormalized.status === "completed";
  const nextCompleted = nextNormalized.status === "completed";

  if (oldCompleted || nextCompleted) {
    return {
      ...oldNormalized,
      ...nextNormalized,
      status: "completed",
      opened_at: oldNormalized.opened_at || nextNormalized.opened_at || nowIso(),
      completed_at:
        oldNormalized.completed_at ||
        nextNormalized.completed_at ||
        nowIso(),
      updated_at: nextNormalized.updated_at || oldNormalized.updated_at || nowIso()
    };
  }

  return {
    ...oldNormalized,
    ...nextNormalized,
    status: "opened",
    opened_at: oldNormalized.opened_at || nextNormalized.opened_at || nowIso(),
    completed_at: null,
    updated_at: nextNormalized.updated_at || oldNormalized.updated_at || nowIso()
  };
}

function mergeProgressRows(localRows, remoteRows) {
  const map = new Map();

  [...localRows, ...remoteRows].forEach((row) => {
    const normalized = normalizeRow(row);
    if (!normalized.month_index || !normalized.week_index || !normalized.day_index) return;

    const key = makeProgressKey(
      normalized.month_index,
      normalized.week_index,
      normalized.day_index
    );

    const existing = map.get(key);
    map.set(key, existing ? mergeTwoRows(existing, normalized) : normalized);
  });

  return sortProgressRows(Array.from(map.values()));
}

function upsertLocalMirror({ monthIndex, weekIndex, dayIndex, status, userId = "guest", metadata = {} }) {
  const rows = readLocalProgress(userId);
  const key = makeProgressKey(monthIndex, weekIndex, dayIndex);
  const currentTime = nowIso();
  const safeStatus = normalizeStatus(status);

  const nextRow = {
    month_index: Number(monthIndex),
    week_index: Number(weekIndex),
    day_index: Number(dayIndex),
    status: safeStatus,
    metadata,
    opened_at: currentTime,
    completed_at: safeStatus === "completed" ? currentTime : null,
    updated_at: currentTime
  };

  const index = rows.findIndex((row) => {
    return makeProgressKey(row.month_index, row.week_index, row.day_index) === key;
  });

  if (index >= 0) {
    rows[index] = mergeTwoRows(rows[index], nextRow);
  } else {
    rows.push(nextRow);
  }

  const sortedRows = sortProgressRows(rows);
  writeLocalProgress(sortedRows, userId);
  return sortedRows;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function withRetry(operation, label) {
  let lastError = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
      }
    }
  }

  throw new Error(`${label}: ${lastError?.message || "فشل غير معروف"}`);
}

async function getCurrentUserStrict() {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const session = sessionData?.session;
  if (!session) return null;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  return userData?.user || session.user || null;
}

async function fetchRemoteProgress(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return [];
  }

  return withRetry(async () => {
    const modern = await supabase
      .from(PROGRESS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("month_index", { ascending: true })
      .order("week_index", { ascending: true })
      .order("day_index", { ascending: true });

    if (!modern.error) {
      return Array.isArray(modern.data) ? sortProgressRows(modern.data.map(normalizeRow)) : [];
    }

    if (!isSchemaCompatibilityError(modern.error)) throw modern.error;

    const legacy = await supabase
      .from(PROGRESS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .order("month_no", { ascending: true })
      .order("week_no", { ascending: true })
      .order("day_no", { ascending: true });

    if (legacy.error) throw legacy.error;

    return Array.isArray(legacy.data) ? sortProgressRows(legacy.data.map(normalizeRow)) : [];
  }, "تحميل التقدم من Supabase");
}

async function fetchSingleRemoteProgress(userId, monthIndex, weekIndex, dayIndex) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return null;
  }

  return withRetry(async () => {
    const modernQuery = supabase
      .from(PROGRESS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("month_index", Number(monthIndex))
      .eq("week_index", Number(weekIndex))
      .eq("day_index", Number(dayIndex))
      .maybeSingle();

    const { data, error } = await modernQuery;

    if (!error) {
      return data ? normalizeRow(data) : null;
    }

    if (!isSchemaCompatibilityError(error)) throw error;

    const legacy = await supabase
      .from(PROGRESS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("month_no", Number(monthIndex))
      .eq("week_no", Number(weekIndex))
      .eq("day_no", Number(dayIndex))
      .maybeSingle();

    if (legacy.error) throw legacy.error;
    return legacy.data ? normalizeRow(legacy.data) : null;
  }, "قراءة سجل التقدم من Supabase");
}

async function upsertRemoteRows(userId, rows = []) {
  if (!userId || !rows.length) return [];

  const currentTime = nowIso();
  const normalizedRows = rows.map(normalizeRow);

  const modernPayload = normalizedRows.map((normalized) => ({
    user_id: userId,
    month_index: normalized.month_index,
    week_index: normalized.week_index,
    day_index: normalized.day_index,
    month_no: normalized.month_index,
    week_no: normalized.week_index,
    day_no: normalized.day_index,
    status: normalized.status,
    completed: normalized.status === "completed",
    metadata: normalized.metadata || {},
    opened_at: normalized.opened_at || currentTime,
    completed_at:
      normalized.status === "completed"
        ? normalized.completed_at || currentTime
        : normalized.completed_at,
    updated_at: normalized.updated_at || currentTime
  }));

  const legacyPayload = normalizedRows.map((normalized) => ({
    user_id: userId,
    month_no: normalized.month_index,
    week_no: normalized.week_index,
    day_no: normalized.day_index,
    status: normalized.status,
    completed: normalized.status === "completed",
    completed_at:
      normalized.status === "completed"
        ? normalized.completed_at || currentTime
        : normalized.completed_at || currentTime,
    updated_at: normalized.updated_at || currentTime
  }));

  await withRetry(async () => {
    const modern = await supabase.from(PROGRESS_TABLE).upsert(modernPayload, {
      onConflict: "user_id,month_index,week_index,day_index"
    });

    if (!modern.error) return true;
    if (!isSchemaCompatibilityError(modern.error)) throw modern.error;

    const legacy = await supabase.from(PROGRESS_TABLE).upsert(legacyPayload, {
      onConflict: "user_id,month_no,week_no,day_no"
    });

    if (legacy.error) throw legacy.error;
    return true;
  }, "حفظ التقدم في Supabase");

  return fetchRemoteProgress(userId);
}

async function syncRowToSupabase({ monthIndex, weekIndex, dayIndex, status, metadata = {} }) {
  const user = await getCurrentUserStrict();

  if (!user?.id) {
    return upsertLocalMirror({ monthIndex, weekIndex, dayIndex, status, metadata });
  }

  const currentTime = nowIso();
  const safeStatus = normalizeStatus(status);

  const existingRemoteRow = await fetchSingleRemoteProgress(
    user.id,
    monthIndex,
    weekIndex,
    dayIndex
  );

  if (existingRemoteRow?.status === "completed" && safeStatus === "opened") {
    return fetchRemoteProgress(user.id);
  }

  const nextRow = {
    month_index: Number(monthIndex),
    week_index: Number(weekIndex),
    day_index: Number(dayIndex),
    status: safeStatus,
    metadata,
    opened_at: existingRemoteRow?.opened_at || currentTime,
    completed_at:
      safeStatus === "completed"
        ? existingRemoteRow?.completed_at || currentTime
        : existingRemoteRow?.completed_at || null,
    updated_at: currentTime
  };

  const mergedRow = existingRemoteRow ? mergeTwoRows(existingRemoteRow, nextRow) : nextRow;
  const remoteRows = await upsertRemoteRows(user.id, [mergedRow]);
  writeLocalProgress(remoteRows, user.id);
  return remoteRows;
}

export async function loadUserProgress() {
  const user = await getCurrentUserStrict();
  const localRows = user?.id ? readLocalProgress(user.id) : [];

  if (!user?.id) {
    // قبل تسجيل الدخول أو في وضع تجريبي فقط.
    return [];
  }

  const remoteRows = await fetchRemoteProgress(user.id);
  const mergedRows = mergeProgressRows(localRows, remoteRows);

  // إذا كانت هناك نسخة محلية قديمة، نرفعها للسحابة ثم نقرأ السحابة مرة أخرى.
  if (mergedRows.length) {
    const syncedRows = await upsertRemoteRows(user.id, mergedRows);
    writeLocalProgress(syncedRows, user.id);
    return syncedRows;
  }

  writeLocalProgress(remoteRows, user.id);
  return remoteRows;
}

export async function fetchUserProgress() {
  return loadUserProgress();
}

export async function markDayOpened({ monthIndex, weekIndex, dayIndex }) {
  const user = await getCurrentUserStrict();
  const mirrorRows = upsertLocalMirror({
    monthIndex,
    weekIndex,
    dayIndex,
    status: "opened",
    userId: user?.id || "guest"
  });

  if (!user?.id) {
    return mirrorRows;
  }

  return syncRowToSupabase({
    monthIndex,
    weekIndex,
    dayIndex,
    status: "opened"
  });
}

export async function updateUserProgress({
  monthIndex,
  weekIndex,
  dayIndex,
  status,
  metadata = {}
}) {
  const safeStatus = normalizeStatus(status || "completed");
  const user = await getCurrentUserStrict();

  const mirrorRows = upsertLocalMirror({
    monthIndex,
    weekIndex,
    dayIndex,
    status: safeStatus,
    userId: user?.id || "guest",
    metadata
  });

  if (!user?.id) {
    return mirrorRows;
  }

  return syncRowToSupabase({
    monthIndex,
    weekIndex,
    dayIndex,
    status: safeStatus,
    metadata
  });
}
