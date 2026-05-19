import { supabase, isSupabaseConfigured } from "./supabaseClient";

const LOCAL_PROGRESS_KEY = "learning_journey_progress_v1";

function readLocalProgress() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocalProgress(records) {
  localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(records));
}

function normalizeProgressRow(row) {
  return {
    id: row.id || `${row.month_index}-${row.week_index}-${row.day_index}`,
    user_id: row.user_id || "local-demo-user",
    month_index: Number(row.month_index),
    week_index: Number(row.week_index),
    day_index: Number(row.day_index),
    status: row.status || "completed",
    completed_at: row.completed_at || null,
    last_opened_at: row.last_opened_at || null
  };
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function fetchUserProgress() {
  if (!isSupabaseConfigured || !supabase) {
    return readLocalProgress().map(normalizeProgressRow);
  }

  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_progress")
    .select("id,user_id,month_index,week_index,day_index,status,completed_at,last_opened_at")
    .eq("user_id", user.id)
    .order("month_index", { ascending: true })
    .order("week_index", { ascending: true })
    .order("day_index", { ascending: true });

  if (error) throw error;
  return (data || []).map(normalizeProgressRow);
}

export async function updateUserProgress({ monthIndex, weekIndex, dayIndex, status = "completed" }) {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured || !supabase) {
    const current = readLocalProgress().map(normalizeProgressRow);
    const filtered = current.filter(
      (row) => !(row.month_index === monthIndex && row.week_index === weekIndex && row.day_index === dayIndex)
    );
    const next = [
      ...filtered,
      normalizeProgressRow({
        id: `local-${monthIndex}-${weekIndex}-${dayIndex}`,
        user_id: "local-demo-user",
        month_index: monthIndex,
        week_index: weekIndex,
        day_index: dayIndex,
        status,
        completed_at: status === "completed" ? now : null,
        last_opened_at: now
      })
    ];
    writeLocalProgress(next);
    return next;
  }

  const user = await getCurrentUser();
  if (!user) throw new Error("يلزم تسجيل الدخول لحفظ تقدم الطالب في Supabase.");

  const payload = {
    user_id: user.id,
    month_index: monthIndex,
    week_index: weekIndex,
    day_index: dayIndex,
    status,
    completed_at: status === "completed" ? now : null,
    last_opened_at: now,
    updated_at: now
  };

  const { error } = await supabase
    .from("user_progress")
    .upsert(payload, { onConflict: "user_id,month_index,week_index,day_index" });

  if (error) throw error;
  return fetchUserProgress();
}

export async function markDayOpened({ monthIndex, weekIndex, dayIndex }) {
  if (!isSupabaseConfigured || !supabase) return;
  const user = await getCurrentUser();
  if (!user) return;

  const now = new Date().toISOString();
  await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      month_index: monthIndex,
      week_index: weekIndex,
      day_index: dayIndex,
      status: "started",
      last_opened_at: now,
      updated_at: now
    },
    { onConflict: "user_id,month_index,week_index,day_index", ignoreDuplicates: true }
  );
}
