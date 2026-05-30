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

function buildFriendlyError(error, action = "تنفيذ العملية") {
  if (!error) return `تعذر ${action} الآن. حاول مرة أخرى بعد لحظات.`;

  const code = String(error.code || "");
  const message = String(error.message || "");

  if (code === "42501" || message.toLowerCase().includes("row-level security")) {
    return "تعذر حفظ البيانات بسبب إعدادات صلاحيات قاعدة البيانات. أعد تشغيل ملف إصلاح Supabase ثم جرّب مرة أخرى.";
  }

  if (code === "23514") {
    return "تعذر الحفظ لأن إحدى القيم لا تطابق شروط قاعدة البيانات.";
  }

  if (code === "42P01") {
    return "تعذر الحفظ لأن جدول البيانات غير موجود في Supabase. شغّل ملف إصلاح Supabase.";
  }

  if (code === "42703") {
    return "تعذر الحفظ لأن بعض أعمدة قاعدة البيانات غير مكتملة. شغّل ملف إصلاح Supabase.";
  }

  if (code === "PGRST301" || message.toLowerCase().includes("jwt")) {
    return "انتهت جلسة الدخول. سجّل خروجك ثم ادخل مرة أخرى.";
  }

  return message || `تعذر ${action} الآن. حاول مرة أخرى بعد لحظات.`;
}

async function requireCurrentUser() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("الاتصال بقاعدة البيانات غير مفعّل حاليًا.");
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(buildFriendlyError(sessionError, "قراءة جلسة الدخول"));
  }

  const sessionUser = sessionData?.session?.user;

  if (!sessionUser?.id) {
    throw new Error("يجب تسجيل الدخول قبل حفظ نتائج الرادار.");
  }

  return sessionUser;
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
    throw new Error(buildFriendlyError(error, "حفظ نتيجة الرادار"));
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
    throw new Error(buildFriendlyError(error, "تحميل سجل الرادار"));
  }

  return Array.isArray(data) ? data : [];
}
