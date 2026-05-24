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

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, reviewer_name, reviewer_meta, quote, rating, status, created_at")
    .eq("status", "published")
    .order("display_order", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(Number(limit) || 32, 1), 80));

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data.map(normalizeVisitorTestimonial) : [];
}

export async function submitVisitorTestimonial({
  reviewerName,
  reviewerMeta,
  quote,
  rating = 5,
  website = ""
}) {
  if (website) {
    return {
      ok: true,
      skipped: true,
      reason: "spam_guard"
    };
  }

  if (!isSupabaseConfigured || !supabase) {
    throw new Error("الاتصال بقاعدة البيانات غير متاح الآن.");
  }

  const payload = {
    reviewer_name: cleanText(reviewerName, 90),
    reviewer_meta: cleanText(reviewerMeta, 120),
    quote: cleanText(quote, 360),
    rating: Math.min(5, Math.max(1, Number(rating || 5))),
    status: "published",
    source: "visitor_page"
  };

  if (payload.reviewer_name.length < 2) {
    throw new Error("اكتب اسمًا واضحًا للتقييم.");
  }

  if (payload.reviewer_meta.length < 2) {
    throw new Error("اكتب المدينة أو الدولة أو المسمى.");
  }

  if (payload.quote.length < 18) {
    throw new Error("اكتب تقييمًا قصيرًا لا يقل عن 18 حرفًا.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select("id, reviewer_name, reviewer_meta, quote, rating, status, created_at")
    .single();

  if (error) {
    throw error;
  }

  return {
    ok: true,
    testimonial: normalizeVisitorTestimonial(data)
  };
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
