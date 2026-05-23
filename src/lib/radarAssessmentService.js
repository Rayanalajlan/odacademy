import { supabase, isSupabaseConfigured } from "./supabaseClient";

const ALLOWED_TYPES = new Set(["pre_assessment", "learning_radar"]);
const MAX_SCORE_COUNT = 12;

function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(5, Math.max(0, Math.round(number * 10) / 10));
}

function normalizeScores(scores) {
  const list = Array.isArray(scores) ? scores : [];
  return list.slice(0, MAX_SCORE_COUNT).map(clampScore);
}

function normalizeText(value, fallback = "") {
  return String(value || fallback).trim();
}

function friendlySupabaseError(error) {
  if (!error) return "حدث خطأ غير متوقع.";

  if (error.code === "42501") {
    return "تعذر الحفظ بسبب سياسات الأمان في Supabase. شغّل ملف SQL الخاص بمرحلة 21 أولًا.";
  }

  if (error.code === "23514") {
    return "تعذر الحفظ لأن إحدى القيم لا تطابق شروط جدول رادار الأداء.";
  }

  return error.message || "تعذر تنفيذ العملية الآن.";
}

async function requireCurrentUser() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase غير مضبوط حاليًا، لذلك لا يمكن حفظ نتائج الرادار.");
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(friendlySupabaseError(error));
  }

  const user = data?.session?.user;

  if (!user?.id) {
    throw new Error("يجب تسجيل الدخول قبل حفظ نتائج الرادار.");
  }

  return user;
}

export async function saveRadarAssessmentResult({
  assessmentType,
  assessmentTitle,
  scores,
  overallScore,
  notes = [],
  metadata = {}
}) {
  const user = await requireCurrentUser();

  if (!ALLOWED_TYPES.has(assessmentType)) {
    throw new Error("نوع تقييم الرادار غير صحيح.");
  }

  const normalizedScores = normalizeScores(scores);

  if (!normalizedScores.length) {
    throw new Error("لا توجد درجات صالحة للحفظ.");
  }

  const normalizedOverall = clampScore(
    Number.isFinite(Number(overallScore))
      ? Number(overallScore)
      : normalizedScores.reduce((sum, value) => sum + value, 0) / normalizedScores.length
  );

  const payload = {
    user_id: user.id,
    assessment_type: assessmentType,
    assessment_title: normalizeText(assessmentTitle, "رادار الأداء"),
    scores: normalizedScores,
    overall_score: normalizedOverall,
    notes: Array.isArray(notes) ? notes : [],
    metadata: metadata && typeof metadata === "object" ? metadata : {}
  };

  const { data, error } = await supabase
    .from("radar_assessments")
    .insert(payload)
    .select("id, assessment_type, assessment_title, scores, overall_score, notes, metadata, created_at")
    .single();

  if (error) {
    console.error("Save radar assessment failed:", error);
    throw new Error(friendlySupabaseError(error));
  }

  return data;
}

export async function loadRadarAssessmentHistory({ assessmentType = "", limit = 10 } = {}) {
  const user = await requireCurrentUser();

  let query = supabase
    .from("radar_assessments")
    .select("id, assessment_type, assessment_title, scores, overall_score, notes, metadata, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(Number(limit) || 10, 1), 30));

  if (assessmentType && ALLOWED_TYPES.has(assessmentType)) {
    query = query.eq("assessment_type", assessmentType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Load radar assessment history failed:", error);
    throw new Error(friendlySupabaseError(error));
  }

  return Array.isArray(data) ? data : [];
}
