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

export async function getRecentLearners(limit = 20) {
  ensureSupabase();

  const { data, error } = await supabase.rpc("get_admin_recent_learners", {
    limit_count: limit
  });

  if (error) throw error;

  return data || [];
}

export async function getRecentNotes(limit = 20) {
  ensureSupabase();

  const { data, error } = await supabase.rpc("get_admin_recent_notes", {
    limit_count: limit
  });

  if (error) throw error;

  return data || [];
}

export async function getRecentCertificates(limit = 20) {
  ensureSupabase();

  const { data, error } = await supabase.rpc("get_admin_recent_certificates", {
    limit_count: limit
  });

  if (error) throw error;

  return data || [];
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
