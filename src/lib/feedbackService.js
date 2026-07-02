import { isSupabaseConfigured, supabase } from "./supabaseClient";

export const FEEDBACK_STAGES = {
  initial: {
    id: "initial",
    title: "تقييم البداية",
    badge: "انطباع البداية",
    thresholdLabel: "بعد أول أسبوع",
    description: "يساعدنا على تحسين وضوح التجربة في بدايتها."
  },
  mid: {
    id: "mid",
    title: "تقييم منتصف الرحلة",
    badge: "أكمل 50%",
    thresholdLabel: "منتصف الرحلة",
    description: "يقيس أثر المسار أثناء التعلم قبل نهاية التجربة."
  },
  final: {
    id: "final",
    title: "تقييم نهاية الرحلة",
    badge: "أكمل الرحلة",
    thresholdLabel: "نهاية الرحلة",
    description: "يجمع شهادة أعمق بعد اكتمال التجربة."
  }
};

export function getEligibleFeedbackStage(completedDays = 0, totalDays = 168) {
  const days = Number(completedDays || 0);
  const total = Number(totalDays || 168);
  const percent = total > 0 ? Math.round((days / total) * 100) : 0;

  if (days >= total || percent >= 100) return "final";
  if (days >= 84 || percent >= 50) return "mid";
  if (days >= 7 || percent >= 10) return "initial";
  return null;
}

function normalizeStage(stage) {
  return ["initial", "mid", "final"].includes(stage) ? stage : "initial";
}

export async function isCurrentUserAdmin() {
  if (!isSupabaseConfigured || !supabase) return false;

  const { data, error } = await supabase.rpc("is_site_admin");

  if (error) {
    console.warn("تعذر التحقق من صلاحية المدير:", error.message);
    return false;
  }

  return Boolean(data);
}

export async function fetchFeedbackState({ completedDays = 0, totalDays = 168 } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isAdmin: false,
      eligibleStage: null,
      submittedStages: [],
      currentStageSubmitted: false
    };
  }

  const eligibleStage = getEligibleFeedbackStage(completedDays, totalDays);
  const [adminResult, feedbackResult] = await Promise.all([
    supabase.rpc("is_site_admin"),
    supabase.from("journey_feedback").select("*").order("submitted_at", { ascending: false })
  ]);

  const submittedStages = (feedbackResult.data || []).map((item) => item.stage);

  return {
    isAdmin: Boolean(adminResult.data),
    eligibleStage,
    submittedStages,
    currentStageSubmitted: eligibleStage ? submittedStages.includes(eligibleStage) : false,
    feedbackRows: feedbackResult.data || []
  };
}

export async function submitJourneyFeedback({
  stage,
  completedDays = 0,
  totalDays = 168,
  clarityRating,
  odDepthRating,
  overallRating,
  capabilityRating,
  recommend,
  mostHelpfulSection,
  improvementText,
  transformationText,
  testimonialText,
  publishConsent,
  displayNamePreference,
  metadata
}) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase غير مفعّل.");
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser();

  if (userError || !userResult?.user) {
    throw userError || new Error("يلزم تسجيل الدخول لإرسال التقييم.");
  }

  const safeStage = normalizeStage(stage);
  const total = Number(totalDays || 168);
  const completed = Number(completedDays || 0);
  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const payload = {
    user_id: userResult.user.id,
    stage: safeStage,
    clarity_rating: clarityRating || null,
    od_depth_rating: odDepthRating || null,
    overall_rating: overallRating || null,
    capability_rating: capabilityRating || null,
    recommend: typeof recommend === "boolean" ? recommend : null,
    most_helpful_section: mostHelpfulSection || null,
    improvement_text: improvementText || null,
    transformation_text: transformationText || null,
    testimonial_text: testimonialText || null,
    publish_consent: Boolean(publishConsent),
    display_name_preference: displayNamePreference || "anonymous",
    status: "pending",
    is_public: false,
    completed_days: completed,
    completed_percent: completedPercent,
    metadata: metadata || {}
  };

  const { data, error } = await supabase
    .from("journey_feedback")
    .upsert(payload, { onConflict: "user_id,stage" })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function fetchPublicTestimonials(limit = 9) {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase.rpc("get_public_testimonials", {
    limit_count: limit
  });

  if (error) {
    console.warn("تعذر تحميل شهادات الزوار:", error.message);
    return [];
  }

  return data || [];
}

export async function fetchAdminFeedback(status = "pending") {
  if (!isSupabaseConfigured || !supabase) return [];

  let query = supabase
    .from("journey_feedback")
    .select(`
      *,
      user_profiles:user_id (
        email,
        full_name,
        certificate_name
      )
    `)
    .order("submitted_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
}

export async function moderateFeedback({ feedbackId, action, note = "", publish = null }) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase غير مفعّل.");
  }

  const { data, error } = await supabase.rpc("moderate_feedback", {
    feedback_id: feedbackId,
    moderation_action: action,
    note,
    publish
  });

  if (error) throw error;

  return data;
}
