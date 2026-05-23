import { isSupabaseConfigured, supabase } from "./supabaseClient";

export const MONTHLY_MILESTONES = [
  {
    monthNumber: 1,
    requiredDays: 30,
    title: "شهادة إنجاز الشهر الأول",
    subtitle: "أساسيات قراءة المنظمة كنظام وتشخيص الطلب الأولي"
  },
  {
    monthNumber: 2,
    requiredDays: 60,
    title: "شهادة إنجاز الشهر الثاني",
    subtitle: "التشخيص التنظيمي وجمع البيانات وصياغة الفرضيات"
  },
  {
    monthNumber: 3,
    requiredDays: 90,
    title: "شهادة إنجاز الشهر الثالث",
    subtitle: "التصميم التنظيمي والأدوار والصلاحيات"
  },
  {
    monthNumber: 4,
    requiredDays: 120,
    title: "شهادة إنجاز الشهر الرابع",
    subtitle: "قيادة التغيير والثقافة والمقاومة والتبني"
  },
  {
    monthNumber: 5,
    requiredDays: 150,
    title: "شهادة إنجاز الشهر الخامس",
    subtitle: "قياس الأثر والاستدامة والتعلم المؤسسي"
  },
  {
    monthNumber: 6,
    requiredDays: 180,
    title: "شهادة إنجاز الشهر السادس",
    subtitle: "اكتمال المسار التطبيقي والجاهزية لوثيقة الإتقان"
  }
];

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
    .slice(0, 90);
}

function cleanName(value) {
  return String(value || "OD")
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .slice(0, 18);
}

function padMonth(monthNumber) {
  return String(monthNumber).padStart(2, "0");
}

function stampToday() {
  return new Date().toISOString().slice(0, 10).replaceAll("-", "");
}

export function createLocalMonthlyCertificateCode({
  userName = "OD",
  monthNumber = 1
} = {}) {
  return `ODM-${stampToday()}-M${padMonth(monthNumber)}-${cleanName(userName) || "Learner"}`;
}

export function isMonthlyMilestoneUnlocked(milestone, completedDays = 0) {
  return safeNumber(completedDays) >= safeNumber(milestone?.requiredDays);
}

function makeLocalRecord(milestone, { userName, completedDays, totalDays }) {
  const unlocked = isMonthlyMilestoneUnlocked(milestone, completedDays);
  const code = createLocalMonthlyCertificateCode({
    userName,
    monthNumber: milestone.monthNumber
  });

  return {
    id: null,
    certificate_type: "monthly",
    month_number: milestone.monthNumber,
    month_title: milestone.title,
    month_subtitle: milestone.subtitle,
    required_days: milestone.requiredDays,
    completed_days: Math.min(safeNumber(completedDays), safeNumber(totalDays, 180)),
    total_days: safeNumber(totalDays, 180),
    certificate_name: userName || "متدرب",
    certificate_code: code,
    verification_slug: slugify(code),
    verification_enabled: false,
    status: unlocked ? "issued" : "locked",
    issued_at: unlocked ? new Date().toISOString() : null,
    public_note: unlocked
      ? "تم فتح الشهادة محليًا، وسيتم توثيقها بعد الاتصال بقاعدة البيانات."
      : "لم يكتمل هذا الشهر بعد."
  };
}

async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.warn("تعذر قراءة المستخدم لشهادات الإنجاز الشهرية:", error.message);
    return null;
  }

  return data?.user || null;
}

export async function getOrCreateMonthlyCertificates({
  userName = "",
  completedDays = 0,
  totalDays = 180
} = {}) {
  const safeCompleted = Math.max(0, Math.min(safeNumber(totalDays, 180), safeNumber(completedDays)));
  const safeTotal = safeNumber(totalDays, 180);
  const learnerName = String(userName || "").trim() || "متدرب";

  const localRecords = MONTHLY_MILESTONES.map((milestone) =>
    makeLocalRecord(milestone, {
      userName: learnerName,
      completedDays: safeCompleted,
      totalDays: safeTotal
    })
  );

  if (!isSupabaseConfigured || !supabase) {
    return localRecords;
  }

  const user = await getCurrentUser();

  if (!user?.id) {
    return localRecords;
  }

  const { data: existingRows, error: readError } = await supabase
    .from("monthly_certificates")
    .select("*")
    .eq("user_id", user.id)
    .order("month_number", { ascending: true });

  if (readError) {
    console.warn("تعذر قراءة الشهادات الشهرية:", readError.message);
    return localRecords;
  }

  const existingByMonth = new Map(
    (existingRows || []).map((row) => [Number(row.month_number), row])
  );

  const unlockedMilestones = MONTHLY_MILESTONES.filter((milestone) =>
    isMonthlyMilestoneUnlocked(milestone, safeCompleted)
  );

  const payloads = unlockedMilestones.map((milestone) => {
    const existing = existingByMonth.get(milestone.monthNumber);
    const fallbackCode =
      existing?.certificate_code ||
      createLocalMonthlyCertificateCode({
        userName: learnerName,
        monthNumber: milestone.monthNumber
      });
    const fallbackSlug = existing?.verification_slug || slugify(fallbackCode);

    return {
      user_id: user.id,
      certificate_name: learnerName || user.email || "متدرب",
      month_number: milestone.monthNumber,
      month_title: milestone.title,
      month_subtitle: milestone.subtitle,
      required_days: milestone.requiredDays,
      completed_days: safeCompleted,
      total_days: safeTotal,
      certificate_code: fallbackCode,
      verification_slug: fallbackSlug,
      verification_enabled: true,
      status: "issued",
      issued_at: existing?.issued_at || new Date().toISOString(),
      public_note: `تم إصدار ${milestone.title} بعد إكمال ${milestone.requiredDays} يومًا من الرحلة.`
    };
  });

  let savedRows = existingRows || [];

  if (payloads.length) {
    const { data: upserted, error: upsertError } = await supabase
      .from("monthly_certificates")
      .upsert(payloads, { onConflict: "user_id,month_number" })
      .select("*");

    if (upsertError) {
      console.warn("تعذر حفظ الشهادات الشهرية:", upsertError.message);
    } else {
      savedRows = upserted || savedRows;
    }
  }

  const savedByMonth = new Map(
    (savedRows || []).map((row) => [Number(row.month_number), row])
  );

  return localRecords.map((localRecord) => {
    const saved = savedByMonth.get(Number(localRecord.month_number));

    if (!saved) return localRecord;

    return {
      ...localRecord,
      ...saved,
      certificate_type: "monthly",
      month_title: saved.month_title || localRecord.month_title,
      month_subtitle: saved.month_subtitle || localRecord.month_subtitle
    };
  });
}
