import { isSupabaseConfigured, supabase } from "./supabaseClient";

export async function getLessonNote({ monthIndex, weekIndex, dayIndex }) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data: userResult } = await supabase.auth.getUser();
  const userId = userResult?.user?.id;

  if (!userId) return null;

  const { data, error } = await supabase
    .from("lesson_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("month_index", monthIndex)
    .eq("week_index", weekIndex)
    .eq("day_index", dayIndex)
    .maybeSingle();

  if (error) {
    console.warn("تعذر قراءة ملاحظة الدرس:", error.message);
    return null;
  }

  return data;
}

export async function getRecentLessonNotes(limit = 6) {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("lesson_notes")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("تعذر قراءة ملاحظات الدروس:", error.message);
    return [];
  }

  return data || [];
}

export async function saveLessonNote({
  monthIndex,
  weekIndex,
  dayIndex,
  noteTitle = "",
  note = "",
  isPinned = false,
  metadata = {}
}) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase غير مفعّل.");
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser();
  const userId = userResult?.user?.id;

  if (userError || !userId) {
    throw userError || new Error("يلزم تسجيل الدخول لحفظ الملاحظة.");
  }

  const cleanNote = String(note || "").trim();

  if (!cleanNote) {
    throw new Error("اكتب ملاحظة قبل الحفظ.");
  }

  const payload = {
    user_id: userId,
    month_index: monthIndex,
    week_index: weekIndex,
    day_index: dayIndex,
    note_title: noteTitle || null,
    note: cleanNote,
    is_pinned: Boolean(isPinned),
    metadata
  };

  const { data, error } = await supabase
    .from("lesson_notes")
    .upsert(payload, {
      onConflict: "user_id,month_index,week_index,day_index"
    })
    .select("*")
    .single();

  if (error) throw error;

  await supabase.rpc("log_learning_event", {
    event_type_text: "note_saved",
    event_title: "حفظت ملاحظة على درس",
    event_description: `الشهر ${monthIndex} · الأسبوع ${weekIndex} · اليوم ${dayIndex}`,
    entity_type_text: "lesson",
    entity_id_text: `${monthIndex}-${weekIndex}-${dayIndex}`,
    event_metadata: {
      monthIndex,
      weekIndex,
      dayIndex
    }
  }).catch(() => null);

  return data;
}

export async function deleteLessonNote(id) {
  if (!isSupabaseConfigured || !supabase) return false;

  const { error } = await supabase
    .from("lesson_notes")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}
