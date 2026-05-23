import { isSupabaseConfigured, supabase } from "./supabaseClient";

const BOOKMARKS_TABLE = import.meta.env.VITE_LESSON_BOOKMARKS_TABLE || "lesson_bookmarks";
const LOCAL_BOOKMARKS_KEY = "odacademy_lesson_bookmarks_v1";

function nowIso() {
  return new Date().toISOString();
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeText(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function makeBookmarkKey(monthIndex, weekIndex, dayIndex) {
  return `${normalizeNumber(monthIndex)}-${normalizeNumber(weekIndex)}-${normalizeNumber(dayIndex)}`;
}

function normalizeBookmark(row = {}) {
  const monthIndex = normalizeNumber(row.month_index ?? row.monthIndex);
  const weekIndex = normalizeNumber(row.week_index ?? row.weekIndex);
  const dayIndex = normalizeNumber(row.day_index ?? row.dayIndex);
  const createdAt = row.created_at || nowIso();
  const updatedAt = row.updated_at || createdAt;

  return {
    id: row.id || makeBookmarkKey(monthIndex, weekIndex, dayIndex),
    user_id: row.user_id || null,
    month_index: monthIndex,
    week_index: weekIndex,
    day_index: dayIndex,
    lesson_title: normalizeText(row.lesson_title ?? row.lessonTitle, 260),
    lesson_path: normalizeText(row.lesson_path ?? row.lessonPath, 420),
    excerpt: normalizeText(row.excerpt, 600),
    created_at: createdAt,
    updated_at: updatedAt
  };
}

function sortBookmarks(rows = []) {
  return [...rows].sort((a, b) => {
    const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
    const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
    return dateB - dateA;
  });
}

function readLocalBookmarks() {
  try {
    const raw = window.localStorage.getItem(LOCAL_BOOKMARKS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? sortBookmarks(parsed.map(normalizeBookmark))
      : [];
  } catch {
    return [];
  }
}

function writeLocalBookmarks(rows) {
  try {
    window.localStorage.setItem(
      LOCAL_BOOKMARKS_KEY,
      JSON.stringify(sortBookmarks(rows.map(normalizeBookmark)))
    );
  } catch {
    // التخزين المحلي تحسين لا يجب أن يوقف المنصة.
  }
}

function upsertLocalBookmark(payload) {
  const rows = readLocalBookmarks();
  const normalized = normalizeBookmark({
    ...payload,
    created_at: payload.created_at || nowIso(),
    updated_at: nowIso()
  });

  const key = makeBookmarkKey(
    normalized.month_index,
    normalized.week_index,
    normalized.day_index
  );

  const filtered = rows.filter((row) => {
    return makeBookmarkKey(row.month_index, row.week_index, row.day_index) !== key;
  });

  const nextRows = sortBookmarks([normalized, ...filtered]);
  writeLocalBookmarks(nextRows);

  return normalized;
}

function deleteLocalBookmarkByLocation({ monthIndex, weekIndex, dayIndex }) {
  const key = makeBookmarkKey(monthIndex, weekIndex, dayIndex);
  const nextRows = readLocalBookmarks().filter((row) => {
    return makeBookmarkKey(row.month_index, row.week_index, row.day_index) !== key;
  });

  writeLocalBookmarks(nextRows);
}

async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.warn("تعذر قراءة المستخدم للدروس المحفوظة:", error.message);
      return null;
    }

    return data?.user || null;
  } catch (error) {
    console.warn("تعذر الاتصال بمستخدم Supabase:", error);
    return null;
  }
}

export async function listLessonBookmarks() {
  const localRows = readLocalBookmarks();

  if (!isSupabaseConfigured || !supabase) {
    return localRows;
  }

  const user = await getCurrentUser();

  if (!user?.id) {
    return localRows;
  }

  const { data, error } = await supabase
    .from(BOOKMARKS_TABLE)
    .select("id, user_id, month_index, week_index, day_index, lesson_title, lesson_path, excerpt, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.warn("تعذر تحميل الدروس المحفوظة من Supabase:", error.message);
    return localRows;
  }

  const remoteRows = Array.isArray(data) ? data.map(normalizeBookmark) : [];

  // لو كان لدى المستخدم محفوظات محلية قبل تسجيل الدخول، ندمجها بهدوء.
  if (localRows.length) {
    for (const localBookmark of localRows) {
      const existsRemotely = remoteRows.some((remoteBookmark) => {
        return (
          remoteBookmark.month_index === localBookmark.month_index &&
          remoteBookmark.week_index === localBookmark.week_index &&
          remoteBookmark.day_index === localBookmark.day_index
        );
      });

      if (!existsRemotely) {
        await saveLessonBookmark(localBookmark).catch(() => undefined);
      }
    }
  }

  return sortBookmarks(remoteRows.length ? remoteRows : localRows);
}

export async function saveLessonBookmark({
  monthIndex,
  weekIndex,
  dayIndex,
  lessonTitle = "",
  lessonPath = "",
  excerpt = ""
}) {
  const payload = normalizeBookmark({
    month_index: monthIndex,
    week_index: weekIndex,
    day_index: dayIndex,
    lesson_title: lessonTitle,
    lesson_path: lessonPath,
    excerpt
  });

  if (!isSupabaseConfigured || !supabase) {
    return upsertLocalBookmark(payload);
  }

  const user = await getCurrentUser();

  if (!user?.id) {
    return upsertLocalBookmark(payload);
  }

  const remotePayload = {
    user_id: user.id,
    month_index: payload.month_index,
    week_index: payload.week_index,
    day_index: payload.day_index,
    lesson_title: payload.lesson_title,
    lesson_path: payload.lesson_path,
    excerpt: payload.excerpt,
    updated_at: nowIso()
  };

  const { data, error } = await supabase
    .from(BOOKMARKS_TABLE)
    .upsert(remotePayload, {
      onConflict: "user_id,month_index,week_index,day_index"
    })
    .select("id, user_id, month_index, week_index, day_index, lesson_title, lesson_path, excerpt, created_at, updated_at")
    .single();

  if (error) {
    console.warn("تعذر حفظ الدرس في Supabase:", error.message);
    return upsertLocalBookmark(payload);
  }

  return normalizeBookmark(data);
}

export async function deleteLessonBookmarkByLocation({
  monthIndex,
  weekIndex,
  dayIndex
}) {
  deleteLocalBookmarkByLocation({ monthIndex, weekIndex, dayIndex });

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  const user = await getCurrentUser();

  if (!user?.id) {
    return;
  }

  const { error } = await supabase
    .from(BOOKMARKS_TABLE)
    .delete()
    .eq("user_id", user.id)
    .eq("month_index", normalizeNumber(monthIndex))
    .eq("week_index", normalizeNumber(weekIndex))
    .eq("day_index", normalizeNumber(dayIndex));

  if (error) {
    throw error;
  }
}
