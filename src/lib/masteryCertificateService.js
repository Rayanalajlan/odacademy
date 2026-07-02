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
    verification_slug: fallbackSlug,
    verification_enabled: false,
    status: isUnlocked ? "issued" : "locked",
    completed_days: safeCompleted,
    total_days: totalDays,
    certificate_name: userName || "متدرب"
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
      return issuedCertificate;
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

  if (error) throw error;

  return Array.isArray(data) ? data[0] || null : data;
}
