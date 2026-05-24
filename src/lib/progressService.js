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

function normalizeStatus(status) {
  return status === "completed" ? "completed" : "opened";
}

function normalizeRow(row = {}) {
  return {
    month_index: Number(row.month_index ?? row.monthIndex),
    week_index: Number(row.week_index ?? row.weekIndex),
    day_index: Number(row.day_index ?? row.dayIndex),
    status: normalizeStatus(row.status),
    opened_at: row.opened_at || null,
    completed_at: row.completed_at || null,
    updated_at: row.updated_at || nowIso()
  };
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

function readLocalProgress() {
  try {
    const storage = safeLocalStorage();
    if (!storage) return [];

    const raw = storage.getItem(LOCAL_PROGRESS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortProgressRows(parsed.map(normalizeRow)) : [];
  } catch (error) {
    console.warn("تعذر قراءة نسخة التقدم المحلية:", error);
    return [];
  }
}

function writeLocalProgress(rows) {
  try {
    const storage = safeLocalStorage();
    if (!storage) return;

    const safeRows = sortProgressRows(rows.map(normalizeRow));
    storage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(safeRows));
  } catch (error) {
    console.warn("تعذر تحديث نسخة التقدم المحلية:", error);
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

function upsertLocalMirror({ monthIndex, weekIndex, dayIndex, status }) {
  const rows = readLocalProgress();
  const key = makeProgressKey(monthIndex, weekIndex, dayIndex);
  const currentTime = nowIso();
  const safeStatus = normalizeStatus(status);

  const nextRow = {
    month_index: Number(monthIndex),
    week_index: Number(weekIndex),
    day_index: Number(dayIndex),
    status: safeStatus,
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
  writeLocalProgress(sortedRows);
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
    const { data, error } = await supabase
      .from(PROGRESS_TABLE)
      .select("month_index, week_index, day_index, status, opened_at, completed_at, updated_at")
      .eq("user_id", userId)
      .order("month_index", { ascending: true })
      .order("week_index", { ascending: true })
      .order("day_index", { ascending: true });

    if (error) throw error;

    return Array.isArray(data) ? sortProgressRows(data.map(normalizeRow)) : [];
  }, "تحميل التقدم من Supabase");
}

async function fetchSingleRemoteProgress(userId, monthIndex, weekIndex, dayIndex) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return null;
  }

  return withRetry(async () => {
    const { data, error } = await supabase
      .from(PROGRESS_TABLE)
      .select("month_index, week_index, day_index, status, opened_at, completed_at, updated_at")
      .eq("user_id", userId)
      .eq("month_index", Number(monthIndex))
      .eq("week_index", Number(weekIndex))
      .eq("day_index", Number(dayIndex))
      .maybeSingle();

    if (error) throw error;

    return data ? normalizeRow(data) : null;
  }, "قراءة سجل التقدم من Supabase");
}

async function upsertRemoteRows(userId, rows = []) {
  if (!userId || !rows.length) return [];

  const payload = rows.map((row) => {
    const normalized = normalizeRow(row);

    return {
      user_id: userId,
      month_index: normalized.month_index,
      week_index: normalized.week_index,
      day_index: normalized.day_index,
      status: normalized.status,
      opened_at: normalized.opened_at || nowIso(),
      completed_at: normalized.status === "completed"
        ? normalized.completed_at || nowIso()
        : normalized.completed_at,
      updated_at: normalized.updated_at || nowIso()
    };
  });

  await withRetry(async () => {
    const { error } = await supabase.from(PROGRESS_TABLE).upsert(payload, {
      onConflict: "user_id,month_index,week_index,day_index"
    });

    if (error) throw error;
    return true;
  }, "حفظ التقدم في Supabase");

  return fetchRemoteProgress(userId);
}

async function syncRowToSupabase({ monthIndex, weekIndex, dayIndex, status }) {
  const user = await getCurrentUserStrict();

  if (!user?.id) {
    return upsertLocalMirror({ monthIndex, weekIndex, dayIndex, status });
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
    opened_at: existingRemoteRow?.opened_at || currentTime,
    completed_at:
      safeStatus === "completed"
        ? existingRemoteRow?.completed_at || currentTime
        : existingRemoteRow?.completed_at || null,
    updated_at: currentTime
  };

  const mergedRow = existingRemoteRow ? mergeTwoRows(existingRemoteRow, nextRow) : nextRow;
  const remoteRows = await upsertRemoteRows(user.id, [mergedRow]);
  writeLocalProgress(remoteRows);
  return remoteRows;
}

export async function loadUserProgress() {
  const localRows = readLocalProgress();
  const user = await getCurrentUserStrict();

  if (!user?.id) {
    // قبل تسجيل الدخول أو في وضع تجريبي فقط.
    return localRows;
  }

  const remoteRows = await fetchRemoteProgress(user.id);
  const mergedRows = mergeProgressRows(localRows, remoteRows);

  // إذا كانت هناك نسخة محلية قديمة، نرفعها للسحابة ثم نقرأ السحابة مرة أخرى.
  if (mergedRows.length) {
    const syncedRows = await upsertRemoteRows(user.id, mergedRows);
    writeLocalProgress(syncedRows);
    return syncedRows;
  }

  writeLocalProgress(remoteRows);
  return remoteRows;
}

export async function fetchUserProgress() {
  return loadUserProgress();
}

export async function markDayOpened({ monthIndex, weekIndex, dayIndex }) {
  const mirrorRows = upsertLocalMirror({
    monthIndex,
    weekIndex,
    dayIndex,
    status: "opened"
  });

  const user = await getCurrentUserStrict();

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
  status
}) {
  const safeStatus = normalizeStatus(status || "completed");

  const mirrorRows = upsertLocalMirror({
    monthIndex,
    weekIndex,
    dayIndex,
    status: safeStatus
  });

  const user = await getCurrentUserStrict();

  if (!user?.id) {
    return mirrorRows;
  }

  return syncRowToSupabase({
    monthIndex,
    weekIndex,
    dayIndex,
    status: safeStatus
  });
}
