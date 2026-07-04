import { isSupabaseConfigured, supabase } from "./supabaseClient";

export const FEEDBACK_STAGES = {
  month_1: {
    id: "month_1",
    title: "تقييم الشهر الأول",
    badge: "بعد الشهر الأول",
    thresholdLabel: "أكملت 4 أسابيع",
    description: "يساعدنا على تحسين وضوح البداية وترتيب الرحلة."
  },
  month_3: {
    id: "month_3",
    title: "تقييم منتصف الرحلة",
    badge: "منتصف الرحلة",
    thresholdLabel: "أكملت 12 أسبوعًا",
    description: "يعطينا صورة صادقة عن منتصف الرحلة وما يحتاج تحسينًا."
  },
  month_6: {
    id: "month_6",
    title: "تقييم نهاية الرحلة",
    badge: "أكملت الرحلة",
    thresholdLabel: "أكملت الستة أشهر",
    description: "يجمع شهادة أعمق بعد اكتمال التجربة كاملة."
  }
};

const MONTHLY_FEEDBACK_THRESHOLDS = [
  { stage: "month_1", days: 28 },
  { stage: "month_3", days: 84 },
  { stage: "month_6", days: 168 }
];

export function getEligibleFeedbackStages(completedDays = 0, totalDays = 168) {
  const days = Number(completedDays || 0);
  const total = Number(totalDays || 168);
  const monthSize = Math.max(1, Math.round(total / 6));

  return MONTHLY_FEEDBACK_THRESHOLDS
    .map((item) => ({
      ...item,
      days:
        item.stage === "month_1"
          ? monthSize
          : item.stage === "month_3"
            ? monthSize * 3
            : total
    }))
    .filter((item) => days >= item.days)
    .map((item) => item.stage);
}

export function getEligibleFeedbackStage(completedDays = 0, totalDays = 168, submittedStages = []) {
  const submitted = new Set(submittedStages || []);
  return getEligibleFeedbackStages(completedDays, totalDays).find((stage) => !submitted.has(stage)) || null;
}

function normalizeStage(stage) {
  return Object.prototype.hasOwnProperty.call(FEEDBACK_STAGES, stage) ? stage : "month_1";
}

function getStageVariants(stage) {
  const safeStage = normalizeStage(stage);
  const compactStage = safeStage.replace("_", "");
  const numericStage = safeStage.replace("month_", "month");
  const legacyStages = {
    month_1: ["first_month", "month_one", "m1"],
    month_3: ["mid_journey", "third_month", "month_three", "m3"],
    month_6: ["final", "completion", "journey_complete", "sixth_month", "month_six", "m6"]
  };

  return Array.from(new Set([safeStage, compactStage, numericStage, ...(legacyStages[safeStage] || []), "general"]));
}

function isStageConstraintError(error) {
  const message = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""}`;
  return message.includes("journey_feedback_stage_check") || message.includes("stage_check");
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

  const { data: userResult } = await supabase.auth.getUser();
  const userId = userResult?.user?.id;

  if (!userId) {
    return {
      isAdmin: false,
      eligibleStage: null,
      submittedStages: [],
      currentStageSubmitted: false,
      feedbackRows: []
    };
  }

  const [adminResult, feedbackResult] = await Promise.all([
    supabase.rpc("is_site_admin"),
    supabase
      .from("journey_feedback")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false })
  ]);

  const submittedStages = (feedbackResult.data || []).map((item) => item.stage);
  const eligibleStage = getEligibleFeedbackStage(completedDays, totalDays, submittedStages);

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

  let lastError = null;

  for (const stageVariant of getStageVariants(safeStage)) {
    const { data, error } = await supabase
      .from("journey_feedback")
      .upsert(
        {
          ...payload,
          stage: stageVariant,
          metadata: {
            ...(metadata || {}),
            app_stage: safeStage
          }
        },
        { onConflict: "user_id,stage" }
      )
      .select("*")
      .single();

    if (!error) return data;

    lastError = error;

    if (!isStageConstraintError(error)) break;
  }

  if (lastError) {
    if (isStageConstraintError(lastError)) {
      throw new Error("تعذر حفظ التقييم لأن قاعدة البيانات تستخدم قائمة مراحل قديمة. تم تجهيز الواجهة للتوافق، لكن يلزم تحديث قيد journey_feedback_stage_check في Supabase.");
    }

    throw lastError;
  }

  throw new Error("تعذر إرسال التقييم.");
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
    .select("*")
    .order("submitted_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw error;

  const userIds = Array.from(new Set((data || []).map((row) => row.user_id).filter(Boolean)));

  if (!userIds.length) return data || [];

  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("id, email, full_name, certificate_name")
    .in("id", userIds);

  if (profilesError) {
    console.warn("تعذر تحميل بيانات أصحاب التقييمات:", profilesError.message);
    return data || [];
  }

  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return (data || []).map((row) => ({
    ...row,
    user_profiles: profileMap.get(row.user_id) || {}
  }));
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
