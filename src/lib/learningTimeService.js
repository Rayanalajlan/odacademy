import { isSupabaseConfigured, supabase } from "./supabaseClient";

const FLUSH_INTERVAL_MS = 30000;
const MIN_VISIBLE_SECONDS_TO_SAVE = 10;
const MAX_SINGLE_FLUSH_SECONDS = 600;

let activeTracker = null;

function clampSeconds(value) {
  return Math.max(0, Math.min(MAX_SINGLE_FLUSH_SECONDS, Math.floor(Number(value || 0))));
}

export async function recordLearningTime({
  seconds,
  page = null,
  entityType = null,
  entityId = null,
  monthIndex = null,
  weekIndex = null,
  dayIndex = null,
  metadata = {}
}) {
  if (!isSupabaseConfigured || !supabase) return { ok: false, skipped: true };

  const safeSeconds = clampSeconds(seconds);

  if (safeSeconds < MIN_VISIBLE_SECONDS_TO_SAVE) {
    return { ok: true, skipped: true, reason: "too_short" };
  }

  const { error } = await supabase.rpc("record_learning_time", {
    seconds_spent: safeSeconds,
    page_name: page,
    entity_type_text: entityType,
    entity_id_text: entityId,
    month_no: monthIndex,
    week_no: weekIndex,
    day_no: dayIndex,
    event_metadata: metadata
  });

  if (error) {
    console.warn("تعذر حفظ وقت التعلم:", error.message);
    return { ok: false, error };
  }

  return { ok: true };
}

export async function getLearningTimeSummary() {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data: userResult } = await supabase.auth.getUser();
  const userId = userResult?.user?.id;

  if (!userId) return null;

  const { data: statsData, error: statsError } = await supabase
    .from("user_learning_stats")
    .select("total_seconds, daily_log, sessions_count, longest_session_seconds, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!statsError && statsData) {
    return statsData;
  }

  const { data, error } = await supabase
    .from("user_learning_time")
    .select("seconds_spent, created_at")
    .eq("user_id", userId)
    .limit(1000);

  if (error) {
    console.warn("تعذر قراءة وقت التعلم:", error.message);
    return null;
  }

  const rows = Array.isArray(data) ? data : [];
  const dailyLog = rows.reduce((acc, row) => {
    const key = String(row.created_at || new Date().toISOString()).slice(0, 10);
    acc[key] = (acc[key] || 0) + Number(row.seconds_spent || 0);
    return acc;
  }, {});

  return {
    total_seconds: rows.reduce((sum, row) => sum + Number(row.seconds_spent || 0), 0),
    daily_log: dailyLog,
    sessions_count: rows.length,
    longest_session_seconds: rows.reduce(
      (max, row) => Math.max(max, Number(row.seconds_spent || 0)),
      0
    )
  };
}

export function startLearningTimeTracker({
  page = "home",
  entityType = null,
  entityId = null,
  monthIndex = null,
  weekIndex = null,
  dayIndex = null,
  metadata = {}
} = {}) {
  stopLearningTimeTracker();

  let visibleStartedAt = Date.now();
  let accumulatedMs = 0;
  let stopped = false;

  function isVisible() {
    return typeof document === "undefined" || document.visibilityState === "visible";
  }

  function pauseVisibleTime() {
    if (!isVisible() || !visibleStartedAt) return;

    accumulatedMs += Date.now() - visibleStartedAt;
    visibleStartedAt = null;
  }

  function resumeVisibleTime() {
    if (!isVisible()) return;
    if (!visibleStartedAt) visibleStartedAt = Date.now();
  }

  async function flush(reason = "interval") {
    if (stopped) return;

    if (isVisible() && visibleStartedAt) {
      accumulatedMs += Date.now() - visibleStartedAt;
      visibleStartedAt = Date.now();
    }

    const seconds = clampSeconds(accumulatedMs / 1000);

    if (seconds < MIN_VISIBLE_SECONDS_TO_SAVE) return;

    accumulatedMs = 0;

    await recordLearningTime({
      seconds,
      page,
      entityType,
      entityId,
      monthIndex,
      weekIndex,
      dayIndex,
      metadata: {
        ...metadata,
        reason
      }
    });
  }

  function onVisibilityChange() {
    if (isVisible()) {
      resumeVisibleTime();
    } else {
      pauseVisibleTime();
      flush("hidden");
    }
  }

  function onBeforeUnload() {
    // sendBeacon لا يناسب rpc مباشرة هنا، لذلك نعتمد flush الدوري.
    pauseVisibleTime();
  }

  const intervalId = window.setInterval(() => {
    flush("interval");
  }, FLUSH_INTERVAL_MS);

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("beforeunload", onBeforeUnload);

  activeTracker = {
    async stop() {
      stopped = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);

      if (isVisible() && visibleStartedAt) {
        accumulatedMs += Date.now() - visibleStartedAt;
        visibleStartedAt = null;
      }

      const seconds = clampSeconds(accumulatedMs / 1000);

      if (seconds >= MIN_VISIBLE_SECONDS_TO_SAVE) {
        await recordLearningTime({
          seconds,
          page,
          entityType,
          entityId,
          monthIndex,
          weekIndex,
          dayIndex,
          metadata: {
            ...metadata,
            reason: "stop"
          }
        });
      }
    },

    flush
  };

  return activeTracker;
}

export async function stopLearningTimeTracker() {
  if (!activeTracker) return;

  const tracker = activeTracker;
  activeTracker = null;

  await tracker.stop();
}
