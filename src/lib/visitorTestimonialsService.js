import { isSupabaseConfigured, supabase } from "./supabaseClient";

const TABLE_NAME =
  import.meta.env.VITE_VISITOR_TESTIMONIALS_TABLE || "visitor_testimonials";

function cleanText(value, maxLength = 240) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function normalizeVisitorTestimonial(row = {}) {
  return {
    id: row.id,
    reviewer_name: cleanText(row.reviewer_name, 90),
    reviewer_meta: cleanText(row.reviewer_meta, 120),
    quote: cleanText(row.quote, 360),
    rating: Math.min(5, Math.max(1, Number(row.rating || 5))),
    status: row.status || "published",
    created_at: row.created_at || new Date().toISOString()
  };
}

export async function listPublishedVisitorTestimonials({ limit = 32 } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 32, 1), 80);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, reviewer_name, reviewer_meta, quote, rating, status, created_at")
    .eq("status", "published")
    .order("display_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw error;
  }

  const staticRows = Array.isArray(data) ? data.map(normalizeVisitorTestimonial) : [];
  const journeyRows = await listPublishedJourneyFeedback({ limit: safeLimit });

  return [...journeyRows, ...staticRows]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, safeLimit);
}

function normalizeJourneyFeedback(row = {}) {
  const rating = Number(row.rating || row.overall_rating || row.clarity_rating || 5);
  const displayName = cleanText(row.display_name || row.reviewer_name || "متدرب في منسقة", 90);
  const stageLabel = cleanText(row.badge_label || row.stage_label || row.role_title || "تقييم متدرب", 120);

  return {
    id: `journey-${row.id}`,
    reviewer_name: displayName,
    reviewer_meta: stageLabel,
    quote: cleanText(row.testimonial_text || row.quote, 360),
    rating: Math.min(5, Math.max(1, rating)),
    status: "published",
    created_at: row.submitted_at || row.created_at || new Date().toISOString()
  };
}

async function listPublishedJourneyFeedback({ limit = 32 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 32, 1), 80);

  const { data: rpcRows, error: rpcError } = await supabase.rpc("get_public_testimonials", {
    limit_count: safeLimit
  });

  if (!rpcError && Array.isArray(rpcRows)) {
    return rpcRows
      .map(normalizeJourneyFeedback)
      .filter((item) => item.quote);
  }

  const { data, error } = await supabase
    .from("journey_feedback")
    .select("id, stage, testimonial_text, overall_rating, clarity_rating, status, is_public, publish_consent, submitted_at")
    .eq("status", "published")
    .eq("is_public", true)
    .eq("publish_consent", true)
    .not("testimonial_text", "is", null)
    .order("submitted_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.warn("تعذر تحميل تقييمات الرحلة المنشورة:", rpcError?.message || error.message);
    return [];
  }

  return (data || [])
    .map((row) =>
      normalizeJourneyFeedback({
        ...row,
        display_name: "متدرب في منسقة",
        badge_label: stageToLabel(row.stage)
      })
    )
    .filter((item) => item.quote);
}

function stageToLabel(stage) {
  const labels = {
    month_1: "بعد الشهر الأول",
    month_2: "بعد الشهر الثاني",
    month_3: "منتصف الرحلة",
    month_4: "بعد الشهر الرابع",
    month_5: "بعد الشهر الخامس",
    month_6: "أكمل الرحلة"
  };

  return labels[stage] || "تقييم متدرب";
}

export function subscribeToPublishedVisitorTestimonials(onChange) {
  if (!isSupabaseConfigured || !supabase) {
    return () => undefined;
  }

  const channel = supabase
    .channel("visitor-testimonials-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: TABLE_NAME,
        filter: "status=eq.published"
      },
      () => {
        onChange?.();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
