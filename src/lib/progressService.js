import { supabase, isSupabaseConfigured } from "./supabaseClient";

const PROGRESS_TABLE = import.meta.env.VITE_PROGRESS_TABLE || "user_progress";
const LOCAL_PROGRESS_KEY = "odacademy_local_progress_v3";

function makeProgressKey(monthIndex, weekIndex, dayIndex) {
  return `${Number(monthIndex)}-${Number(weekIndex)}-${Number(dayIndex)}`;
}

function normalizeRow(row) {
  return {
    month_index: Number(row.month_index),
    week_index: Number(row.week_index),
    day_index: Number(row.day_index),
    status: row.status || "opened",
    opened_at: row.opened_at || null,
    completed_at: row.completed_at || null,
    updated_at: row.updated_at || new Date().toISOString()
  };
}

function readLocalProgress() {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeRow) : [];
  } catch {
    return [];
  }
}

function writeLocalProgress(rows) {
  try {
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(rows.map(normalizeRow)));
  } catch {
    // لا نوقف الموقع بسبب localStorage
  }
}

function upsertLocalProgress({ monthIndex, weekIndex, dayIndex, status }) {
  const rows = readLocalProgress();
  const key = makeProgressKey(monthIndex, weekIndex, dayIndex);
  const now = new Date().toISOString();

  const nextRow = {
    month_index: Number(monthIndex),
    week_index: Number(weekIndex),
    day_index: Number(dayIndex),
    status,
    opened_at: now,
    completed_at: status === "completed" ? now : null,
    updated_at: now
  };

  const existingIndex = rows.findIndex(
    (row) => makeProgressKey(row.month_index, row.week_index, row.day_index) === key
  );

  if (existingIndex >= 0) {
    const old = rows[existingIndex];
    rows[existingIndex] = {
      ...old,
      ...nextRow,
      opened_at: old.opened_at || nextRow.opened_at,
      completed_at: status === "completed" ? now : old.completed_at
    };
  } else {
    rows.push(nextRow);
  }

  writeLocalProgress(rows);
  return rows;
}

async function getCurrentUserSafely() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const sessionResponse = await supabase.auth.getSession();
    const session = sessionResponse?.data?.session;

    if (!session) return null;

    const userResponse = await supabase.auth.getUser();
    return userResponse?.data?.user || session.user || null;
  } catch {
    return null;
  }
}

async function fetchRemoteProgress(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from(PROGRESS_TABLE)
      .select("month_index, week_index, day_index, status, opened_at, completed_at, updated_at")
      .eq("user_id", userId)
      .order("month_index", { ascending: true })
      .order("week_index", { ascending: true })
      .order("day_index", { ascending: true });

    if (error) {
      console.warn("تعذر تحميل التقدم من Supabase:", error.message);
      return [];
    }

    return Array.isArray(data) ? data.map(normalizeRow) : [];
  } catch (error) {
    console.warn("تعذر الاتصال بجدول التقدم:", error);
    return [];
  }
}

function mergeProgressRows(localRows, remoteRows) {
  const map = new Map();

  [...localRows, ...remoteRows].forEach((row) => {
    const normalized = normalizeRow(row);
    const key = makeProgressKey(
      normalized.month_index,
      normalized.week_index,
      normalized.day_index
    );

    const existing = map.get(key);

    if (!existing) {
      map.set(key, normalized);
      return;
    }

    if (existing.status === "completed" || normalized.status === "completed") {
      map.set(key, {
        ...existing,
        ...normalized,
        status: "completed",
        completed_at: normalized.completed_at || existing.completed_at || new Date().toISOString()
      });
      return;
    }

    map.set(key, {
      ...existing,
      ...normalized
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    if (a.month_index !== b.month_index) return a.month_index - b.month_index;
    if (a.week_index !== b.week_index) return a.week_index - b.week_index;
    return a.day_index - b.day_index;
  });
}

async function syncRowToSupabase({ monthIndex, weekIndex, dayIndex, status }) {
  const user = await getCurrentUserSafely();

  if (!user || !isSupabaseConfigured || !supabase) return;

  const now = new Date().toISOString();

  const payload = {
    user_id: user.id,
    month_index: Number(monthIndex),
    week_index: Number(weekIndex),
    day_index: Number(dayIndex),
    status,
    opened_at: now,
    completed_at: status === "completed" ? now : null,
    updated_at: now
  };

  try {
    const { error } = await supabase.from(PROGRESS_TABLE).upsert(payload, {
      onConflict: "user_id,month_index,week_index,day_index"
    });

    if (error) {
      console.warn("تعذر مزامنة التقدم مع Supabase:", error.message);
    }
  } catch (error) {
    console.warn("تعذر مزامنة التقدم:", error);
  }
}

export async function loadUserProgress() {
  const localRows = readLocalProgress();
  const user = await getCurrentUserSafely();

  if (!user) {
    return localRows;
  }

  const remoteRows = await fetchRemoteProgress(user.id);
  const merged = mergeProgressRows(localRows, remoteRows);

  writeLocalProgress(merged);
  return merged;
}

export async function markDayOpened({ monthIndex, weekIndex, dayIndex }) {
  const rows = upsertLocalProgress({
    monthIndex,
    weekIndex,
    dayIndex,
    status: "opened"
  });

  syncRowToSupabase({
    monthIndex,
    weekIndex,
    dayIndex,
    status: "opened"
  }).catch(() => undefined);

  return rows;
}

export async function updateUserProgress({ monthIndex, weekIndex, dayIndex, status }) {
  const safeStatus = status || "completed";

  const localRows = upsertLocalProgress({
    monthIndex,
    weekIndex,
    dayIndex,
    status: safeStatus
  });

  await syncRowToSupabase({
    monthIndex,
    weekIndex,
    dayIndex,
    status: safeStatus
  });

  const user = await getCurrentUserSafely();

  if (!user) {
    return localRows;
  }

  const remoteRows = await fetchRemoteProgress(user.id);
  const merged = mergeProgressRows(localRows, remoteRows);

  writeLocalProgress(merged);
  return merged;
}