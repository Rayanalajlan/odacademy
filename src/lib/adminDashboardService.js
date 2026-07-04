import { isSupabaseConfigured, supabase } from "./supabaseClient";

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase غير مفعّل.");
  }
}

export async function isCurrentUserAdmin() {
  if (!isSupabaseConfigured || !supabase) return false;

  const { data, error } = await supabase.rpc("is_platform_admin");

  if (error) {
    console.warn("تعذر التحقق من صلاحية الإدارة:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function getAdminOverview() {
  ensureSupabase();

  const { data, error } = await supabase.rpc("get_admin_overview");

  if (error) throw error;

  return data?.[0] || data || null;
}

export async function getPendingFeedback(limit = 30) {
  ensureSupabase();

  const { data, error } = await supabase.rpc("get_admin_feedback_queue", {
    limit_count: limit
  });

  if (error) throw error;

  return data || [];
}

function normalizeFeedbackRow(row = {}) {
  const profile = row.user_profiles || {};

  return {
    ...row,
    display_name:
      row.display_name ||
      profile.certificate_name ||
      profile.full_name ||
      "متدرب",
    email: row.email || profile.email || "",
    rating: row.rating || row.overall_rating || row.clarity_rating || 0,
    stage_label: row.stage_label || stageToLabel(row.stage),
    submitted_at: row.submitted_at || row.created_at
  };
}

function stageToLabel(stage = "") {
  const labels = {
    month_1: "بعد الشهر الأول",
    month_3: "منتصف الرحلة",
    month_6: "أكمل الرحلة"
  };

  return labels[stage] || "تقييم متدرب";
}

async function loadProfilesByIds(userIds = []) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (!uniqueIds.length) return new Map();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, email, full_name, certificate_name")
    .in("id", uniqueIds);

  if (error) {
    console.warn("تعذر تحميل أسماء المتدربين للتقييمات:", error.message);
    return new Map();
  }

  return new Map((data || []).map((profile) => [profile.id, profile]));
}

export async function getPublishedFeedback(limit = 40) {
  ensureSupabase();

  const safeLimit = Math.min(Math.max(Number(limit) || 40, 1), 100);
  const { data, error } = await supabase
    .from("journey_feedback")
    .select("id, user_id, stage, testimonial_text, improvement_text, completed_percent, submitted_at, moderated_at, published_at, overall_rating, clarity_rating, status")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("submitted_at", { ascending: false })
    .limit(safeLimit);

  if (error) throw error;

  const profileMap = await loadProfilesByIds((data || []).map((row) => row.user_id));

  return (data || []).map((row) =>
    normalizeFeedbackRow({
      ...row,
      user_profiles: profileMap.get(row.user_id) || {}
    })
  );
}

export async function moderateFeedback({ feedbackId, nextStatus, adminNote = "" }) {
  ensureSupabase();

  const { data, error } = await supabase.rpc("moderate_journey_feedback", {
    feedback_id_input: feedbackId,
    next_status: nextStatus,
    admin_note_input: adminNote
  });

  if (error) throw error;

  return data;
}

export async function deleteFeedback(feedbackId) {
  ensureSupabase();

  const { error } = await supabase
    .from("journey_feedback")
    .delete()
    .eq("id", feedbackId);

  if (error) throw error;

  return true;
}

export async function getRecentLearners(limit = 20) {
  ensureSupabase();

  const { data, error } = await supabase.rpc("get_admin_recent_learners", {
    limit_count: limit
  });

  if (error) throw error;

  return (data || []).map((learner) => ({
    ...learner,
    user_id: learner.user_id || learner.id,
    total_seconds: Number(learner.total_seconds ?? learner.total_learning_seconds ?? 0),
    completed_days: Number(learner.completed_days || 0)
  }));
}

export async function getRecentNotes(limit = 20) {
  ensureSupabase();

  const { data, error } = await supabase.rpc("get_admin_recent_notes", {
    limit_count: limit
  });

  if (error) throw error;

  return (data || []).map((note) => ({
    ...note,
    month_index: Number(note.month_index ?? note.month_no ?? 0),
    week_index: Number(note.week_index ?? note.week_no ?? 0),
    day_index: Number(note.day_index ?? note.day_no ?? 0),
    note_title: note.note_title || note.title || "ملاحظة محفوظة",
    note: note.note || note.content || ""
  }));
}

export async function getRecentCertificates(limit = 20) {
  ensureSupabase();

  const { data, error } = await supabase.rpc("get_admin_recent_certificates", {
    limit_count: limit
  });

  if (error) throw error;

  return (data || []).map((certificate) => ({
    ...certificate,
    verification_enabled: certificate.verification_enabled ?? certificate.public_enabled ?? true
  }));
}

export async function createAdminNotification({
  userId,
  title,
  body = "",
  type = "admin",
  actionLabel = null,
  actionPage = null
}) {
  ensureSupabase();

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title,
      body,
      type,
      action_label: actionLabel,
      action_page: actionPage,
      metadata: {
        source: "admin_dashboard"
      }
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}
