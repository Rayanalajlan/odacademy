import { supabase, isSupabaseConfigured } from "./supabaseClient";

const PROGRESS_TABLE = import.meta.env.VITE_PROGRESS_TABLE || "user_progress";
const LOCAL_PROGRESS_KEY = "odacademy_local_progress_v4";

function makeProgressKey(monthIndex, weekIndex, dayIndex) {
  return `${Number(monthIndex)}-${Number(weekIndex)}-${Number(dayIndex)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeStatus(status) {
  return status === "completed" ? "completed" : "opened";
}

function normalizeRow(row) {
  return {
    month_index: Number(row.month_index),
    week_index: Number(row.week_index),
    day_index: Number(row.day_index),
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

function readLocalProgress() {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortProgressRows(parsed.map(normalizeRow));
  } catch (error) {
    console.warn("تعذر قراءة التقدم المحلي:", error);
    return [];
  }
}

function writeLocalProgress(rows) {
  try {
    const safeRows = sortProgressRows(rows.map(normalizeRow));
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(safeRows));
  } catch (error) {
    // لا نوقف الموقع بسبب localStorage.
    console.warn("تعذر حفظ التقدم المحلي:", error);
  }
}

function mergeTwoRows(oldRow, nextRow) {
  const oldNormalized = normalizeRow(oldRow);
  const nextNormalized = normalizeRow(nextRow);

  const oldIsCompleted = oldNormalized.status === "completed";
  const nextIsCompleted = nextNormalized.status === "completed";

  // تعديل مهم:
  // إذا كان اليوم مكتملًا، لا نسمح أبدًا أن يرجع إلى opened.
  if (oldIsCompleted || nextIsCompleted) {
    return {
      ...oldNormalized,
      ...nextNormalized,
      status: "completed",
      opened_at: oldNormalized.opened_at || nextNormalized.opened_at || nowIso(),
      completed_at:
        oldNormalized.completed_at ||
        nextNormalized.completed_at ||
        nowIso(),
      updated_at: nextNormalized.updated_at || nowIso()
    };
  }

  return {
    ...oldNormalized,
    ...nextNormalized,
    status: "opened",
    opened_at: oldNormalized.opened_at || nextNormalized.opened_at || nowIso(),
    completed_at: null,
    updated_at: nextNormalized.updated_at || nowIso()
  };
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

    map.set(key, mergeTwoRows(existing, normalized));
  });

  return sortProgressRows(Array.from(map.values()));
}

function upsertLocalProgress({ monthIndex, weekIndex, dayIndex, status }) {
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

  const existingIndex = rows.findIndex(
    (row) =>
      makeProgressKey(row.month_index, row.week_index, row.day_index) === key
  );

  if (existingIndex >= 0) {
    rows[existingIndex] = mergeTwoRows(rows[existingIndex], nextRow);
  } else {
    rows.push(nextRow);
  }

  const sortedRows = sortProgressRows(rows);
  writeLocalProgress(sortedRows);

  return sortedRows;
}

async function getCurrentUserSafely() {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  try {
    const sessionResponse = await supabase.auth.getSession();
    const session = sessionResponse?.data?.session;

    if (!session) {
      return null;
    }

    const userResponse = await supabase.auth.getUser();

    return userResponse?.data?.user || session.user || null;
  } catch (error) {
    console.warn("تعذر التحقق من مستخدم Supabase:", error);
    return null;
  }
}

async function fetchRemoteProgress(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from(PROGRESS_TABLE)
      .select(
        "month_index, week_index, day_index, status, opened_at, completed_at, updated_at"
      )
      .eq("user_id", userId)
      .order("month_index", { ascending: true })
      .order("week_index", { ascending: true })
      .order("day_index", { ascending: true });

    if (error) {
      console.warn("تعذر تحميل التقدم من Supabase:", error.message);
      return [];
    }

    return Array.isArray(data) ? sortProgressRows(data.map(normalizeRow)) : [];
  } catch (error) {
    console.warn("تعذر الاتصال بجدول التقدم:", error);
    return [];
  }
}

async function fetchSingleRemoteProgress(userId, monthIndex, weekIndex, dayIndex) {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from(PROGRESS_TABLE)
      .select(
        "month_index, week_index, day_index, status, opened_at, completed_at, updated_at"
      )
      .eq("user_id", userId)
      .eq("month_index", Number(monthIndex))
      .eq("week_index", Number(weekIndex))
      .eq("day_index", Number(dayIndex))
      .maybeSingle();

    if (error) {
      console.warn("تعذر قراءة سجل التقدم من Supabase:", error.message);
      return null;
    }

    return data ? normalizeRow(data) : null;
  } catch (error) {
    console.warn("تعذر قراءة سجل التقدم:", error);
    return null;
  }
}

async function syncRowToSupabase({ monthIndex, weekIndex, dayIndex, status }) {
  const user = await getCurrentUserSafely();

  if (!user || !isSupabaseConfigured || !supabase) {
    return;
  }

  const currentTime = nowIso();
  const safeStatus = normalizeStatus(status);

  const existingRemoteRow = await fetchSingleRemoteProgress(
    user.id,
    monthIndex,
    weekIndex,
    dayIndex
  );

  // تعديل مهم:
  // إذا كان اليوم مكتملًا في Supabase، لا نسمح لأي فتح لاحق أن يرجعه إلى opened.
  if (existingRemoteRow?.status === "completed" && safeStatus === "opened") {
    return;
  }

  const nextRow = {
    month_index: Number(monthIndex),
    week_index: Number(weekIndex),
    day_index: Number(dayIndex),
    status: safeStatus,
    opened_at:
      existingRemoteRow?.opened_at ||
      currentTime,
    completed_at:
      safeStatus === "completed"
        ? existingRemoteRow?.completed_at || currentTime
        : existingRemoteRow?.completed_at || null,
    updated_at: currentTime
  };

  const mergedRow = existingRemoteRow
    ? mergeTwoRows(existingRemoteRow, nextRow)
    : nextRow;

  const payload = {
    user_id: user.id,
    month_index: mergedRow.month_index,
    week_index: mergedRow.week_index,
    day_index: mergedRow.day_index,
    status: mergedRow.status,
    opened_at: mergedRow.opened_at,
    completed_at: mergedRow.completed_at,
    updated_at: mergedRow.updated_at
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
  const mergedRows = mergeProgressRows(localRows, remoteRows);

  writeLocalProgress(mergedRows);

  return mergedRows;
}

// اسم إضافي احتياطي.
// لو بقي أي ملف قديم يستورد fetchUserProgress فلن يتعطل الموقع.
export async function fetchUserProgress() {
  return loadUserProgress();
}

export async function markDayOpened({ monthIndex, weekIndex, dayIndex }) {
  const rows = upsertLocalProgress({
    monthIndex,
    weekIndex,
    dayIndex,
    status: "opened"
  });

  // لا ننتظر Supabase هنا حتى لا يبطئ فتح اليوم في الواجهة.
  syncRowToSupabase({
    monthIndex,
    weekIndex,
    dayIndex,
    status: "opened"
  }).catch((error) => {
    console.warn("تعذر حفظ فتح اليوم في الخلفية:", error);
  });

  return rows;
}

export async function updateUserProgress({
  monthIndex,
  weekIndex,
  dayIndex,
  status
}) {
  const safeStatus = normalizeStatus(status || "completed");

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
  const mergedRows = mergeProgressRows(localRows, remoteRows);

  writeLocalProgress(mergedRows);

  return mergedRows;
}