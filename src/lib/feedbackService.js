import { isSupabaseConfigured, supabase } from "./supabaseClient";

export const FEEDBACK_STAGES = {
  month_1: {
    id: "month_1",
    title: "تقييم الشهر الأول",
    badge: "بعد الشهر الأول",
    thresholdLabel: "أكملت 4 أسابيع",
    description: "يساعدنا على تحسين وضوح البداية وترتيب الرحلة."
  },
  month_2: {
    id: "month_2",
    title: "تقييم الشهر الثاني",
    badge: "بعد الشهر الثاني",
    thresholdLabel: "أكملت 8 أسابيع",
    description: "يقيس أثر المسار بعد الدخول في عمق التشخيص والتصميم."
  },
  month_3: {
    id: "month_3",
    title: "تقييم الشهر الثالث",
    badge: "منتصف الرحلة",
    thresholdLabel: "أكملت 12 أسبوعًا",
    description: "يعطينا صورة صادقة عن منتصف الرحلة وما يحتاج تحسينًا."
  },
  month_4: {
    id: "month_4",
    title: "تقييم الشهر الرابع",
    badge: "بعد الشهر الرابع",
    thresholdLabel: "أكملت 16 أسبوعًا",
    description: "يساعدنا على قراءة أثر التعلم في قيادة التغيير والتطبيق."
  },
  month_5: {
    id: "month_5",
    title: "تقييم الشهر الخامس",
    badge: "بعد الشهر الخامس",
    thresholdLabel: "أكملت 20 أسبوعًا",
    description: "يرصد جودة التجربة قبل محطة الإتقان النهائية."
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
  { stage: "month_2", days: 56 },
  { stage: "month_3", days: 84 },
  { stage: "month_4", days: 112 },
  { stage: "month_5", days: 140 },
  { stage: "month_6", days: 168 }
];

export function getEligibleFeedbackStages(completedDays = 0, totalDays = 168) {
  const days = Number(completedDays || 0);
  const total = Number(totalDays || 168);
  const monthSize = Math.max(1, Math.round(total / 6));

  return MONTHLY_FEEDBACK_THRESHOLDS
    .map((item, index) => ({
      ...item,
      days: index === 5 ? total : monthSize * (index + 1)
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

  const [adminResult, feedbackResult] = await Promise.all([
    supabase.rpc("is_site_admin"),
    supabase.from("journey_feedback").select("*").order("submitted_at", { ascending: false })
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
