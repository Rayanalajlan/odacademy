import { isSupabaseConfigured, supabase } from "./supabaseClient";

export function getBadgeIdForCompletedDays(completedDays = 0) {
  const days = Number(completedDays || 0);

  if (days >= 180) return "od_mastery";
  if (days >= 150) return "impact_practitioner";
  if (days >= 120) return "change_leader";
  if (days >= 90) return "intervention_designer";
  if (days >= 30) return "diagnostic_thinker";
  if (days >= 7) return "system_reader";
  return "od_explorer";
}

export async function syncProgressBadge(completedDays = 0) {
  if (!isSupabaseConfigured || !supabase) return null;

  const badgeId = getBadgeIdForCompletedDays(completedDays);

  const { error } = await supabase.rpc("award_badge_if_missing", {
    target_badge_id: badgeId,
    badge_metadata: {
      completedDays
    }
  });

  if (error) {
    console.warn("تعذر منح الشارة:", error.message);
    return null;
  }

  return badgeId;
}

export async function getUserBadges() {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("user_badges")
    .select(`
      badge_id,
      awarded_at,
      metadata,
      badges:badge_id (
        id,
        title,
        description,
        icon,
        badge_order
      )
    `)
    .order("awarded_at", { ascending: false });

  if (error) {
    console.warn("تعذر تحميل الشارات:", error.message);
    return [];
  }

  return data || [];
}
