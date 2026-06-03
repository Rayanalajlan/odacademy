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
