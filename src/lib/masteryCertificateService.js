import { isSupabaseConfigured, supabase } from "./supabaseClient";

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^\u0600-\u06FFa-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function createLocalCertificateCode({ userName = "OD", completedDays = 0 } = {}) {
  const cleanName = String(userName || "OD")
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .slice(0, 18);

  const stamp = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  return `OD-${stamp}-${cleanName || "Learner"}-${completedDays}`;
}

export function buildVerificationUrl(slugOrCode) {
  const clean = slugify(slugOrCode);

  if (typeof window === "undefined") {
    return `/verify/${clean}`;
  }

  return `${window.location.origin}/verify/${encodeURIComponent(clean)}`;
}

export async function copyTextSafely(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.warn("تعذر قراءة المستخدم:", error.message);
    return null;
  }

  return data?.user || null;
}

function makeLocalRecord({ fallbackCode, fallbackSlug, isUnlocked, safeCompleted, totalDays, userName }) {
  return {
    certificate_code: fallbackCode,
    certificate_slug: fallbackSlug,
    verification_slug: fallbackSlug,
    public_enabled: Boolean(isUnlocked),
    verification_enabled: Boolean(isUnlocked),
    status: isUnlocked ? "issued" : "locked",
    completed_days: safeCompleted,
    total_days: totalDays,
    certificate_name: userName || "متدرب",
    certificate_type: "mastery",
    issued_at: isUnlocked ? new Date().toISOString() : null
  };
}

export async function getOrCreateMasteryCertificate({
  userName = "",
  completedDays = 0,
  totalDays = 168,
  isUnlocked = false
} = {}) {
  const safeCompleted = Math.max(0, Math.min(totalDays, safeNumber(completedDays)));
  const fallbackCode = createLocalCertificateCode({
    userName,
    completedDays: safeCompleted
  });
  const fallbackSlug = slugify(fallbackCode);
  const localRecord = makeLocalRecord({
    fallbackCode,
    fallbackSlug,
    isUnlocked,
    safeCompleted,
    totalDays,
    userName
  });

  if (!isSupabaseConfigured || !supabase) return localRecord;

  const user = await getCurrentUser();
  if (!user?.id) return localRecord;

  const { data: existing, error: readError } = await supabase
    .from("mastery_certificates")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    console.warn("تعذر قراءة وثيقة الإتقان:", readError.message);
  }

  if (isUnlocked) {
    const { data: issuedCertificate, error: issueError } = await supabase.rpc(
      "issue_mastery_certificate",
      {
        certificate_name_input: userName || existing?.certificate_name || user.email || "متدرب"
      }
    );

    if (issueError) {
      console.warn("تعذر إصدار وثيقة الإتقان عبر RPC:", issueError.message);
    } else if (issuedCertificate) {
      if (issuedCertificate.status === "issued" && issuedCertificate.verification_enabled !== false) {
        return issuedCertificate;
      }
    }

    const upsertPayload = {
      user_id: user.id,
      certificate_code: existing?.certificate_code || fallbackCode,
      certificate_slug: existing?.certificate_slug || existing?.verification_slug || fallbackSlug,
      verification_slug: existing?.verification_slug || existing?.certificate_slug || fallbackSlug,
      certificate_name: userName || existing?.certificate_name || user.email || "متدرب",
      completed_days: safeCompleted,
      total_days: totalDays,
      status: "issued",
      public_enabled: true,
      verification_enabled: true,
      public_note: "صادرة بعد اكتمال رحلة الستة أشهر داخل المنصة.",
      issued_at: existing?.issued_at || new Date().toISOString()
    };

    const { data: savedCertificate, error: saveError } = await supabase
      .from("mastery_certificates")
      .upsert(upsertPayload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (saveError) {
      console.warn("تعذر حفظ وثيقة الإتقان مباشرة:", saveError.message);
    } else if (savedCertificate) {
      return {
        ...savedCertificate,
        certificate_type: "mastery"
      };
    }
  }

  return existing || localRecord;
}

export async function verifyCertificatePublic(slugOrCode) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("خدمة التحقق غير متصلة.");
  }

  const clean = String(slugOrCode || "").trim();

  if (!clean) {
    throw new Error("رقم الوثيقة أو رابط التحقق غير صحيح.");
  }

  const { data, error } = await supabase.rpc("verify_mastery_certificate", {
    slug_or_code: clean
  });

  if (!error) {
    const record = Array.isArray(data) ? data[0] || null : data;
    if (record) return record;
  }

  const matchCertificate = (query) =>
    query
      .or(
        `certificate_code.eq.${clean},certificate_slug.eq.${clean},verification_slug.eq.${clean}`
      )
      .eq("status", "issued")
      .limit(1)
      .maybeSingle();

  const { data: mastery, error: masteryError } = await matchCertificate(
    supabase
      .from("mastery_certificates")
      .select(
        "certificate_code, certificate_slug, verification_slug, certificate_name, completed_days, total_days, issued_at, status, public_enabled, verification_enabled"
      )
  );

  if (!masteryError && mastery && mastery.verification_enabled !== false && mastery.public_enabled !== false) {
    return {
      ...mastery,
      certificate_type: "mastery",
      month_number: null,
      month_title: null
    };
  }

  const { data: monthly, error: monthlyError } = await matchCertificate(
    supabase
      .from("monthly_certificates")
      .select(
        "month_number, month_title, certificate_code, certificate_slug, verification_slug, certificate_name, completed_days, total_days, issued_at, status, public_enabled, verification_enabled"
      )
  );

  if (!monthlyError && monthly && monthly.verification_enabled !== false && monthly.public_enabled !== false) {
    return {
      ...monthly,
      certificate_type: "monthly"
    };
  }

  if (error && !mastery && !monthly) throw error;

  return null;
}
