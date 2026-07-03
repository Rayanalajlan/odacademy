import { isSupabaseConfigured, supabase } from "./supabaseClient";

export const MONTHLY_MILESTONES = [
  {
    monthNumber: 1,
    requiredDays: 28,
    title: "شهادة إنجاز الشهر الأول",
    subtitle: "أساسيات قراءة المنظمة كنظام وتشخيص الطلب الأولي"
  },
  {
    monthNumber: 2,
    requiredDays: 56,
    title: "شهادة إنجاز الشهر الثاني",
    subtitle: "التشخيص التنظيمي وجمع البيانات وصياغة الفرضيات"
  },
  {
    monthNumber: 3,
    requiredDays: 84,
    title: "شهادة إنجاز الشهر الثالث",
    subtitle: "التصميم التنظيمي والأدوار والصلاحيات"
  },
  {
    monthNumber: 4,
    requiredDays: 112,
    title: "شهادة إنجاز الشهر الرابع",
    subtitle: "قيادة التغيير والثقافة والمقاومة والتبني"
  },
  {
    monthNumber: 5,
    requiredDays: 140,
    title: "شهادة إنجاز الشهر الخامس",
    subtitle: "قياس الأثر والاستدامة والتعلم المؤسسي"
  },
  {
    monthNumber: 6,
    requiredDays: 168,
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
    completed_days: Math.min(safeNumber(completedDays), safeNumber(totalDays, 168)),
    total_days: safeNumber(totalDays, 168),
    certificate_name: userName || "متدرب",
    certificate_code: code,
    certificate_slug: slugify(code),
    verification_slug: slugify(code),
    public_enabled: Boolean(unlocked),
    verification_enabled: Boolean(unlocked),
    status: unlocked ? "issued" : "locked",
    issued_at: unlocked ? new Date().toISOString() : null,
    public_note: unlocked
      ? "تم فتح الشهادة محلياً، وتصبح موثقة بعد إصدارها من قاعدة البيانات."
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
  totalDays = 168
} = {}) {
  const safeTotal = safeNumber(totalDays, 168);
  const safeCompleted = Math.max(0, Math.min(safeTotal, safeNumber(completedDays)));
  const learnerName = String(userName || "").trim() || "متدرب";

  const localRecords = MONTHLY_MILESTONES.map((milestone) =>
    makeLocalRecord(milestone, {
      userName: learnerName,
      completedDays: safeCompleted,
      totalDays: safeTotal
    })
  );

  if (!isSupabaseConfigured || !supabase) return localRecords;

  const user = await getCurrentUser();
  if (!user?.id) return localRecords;

  const { data: existingRows, error: readError } = await supabase
    .from("monthly_certificates")
    .select("*")
    .eq("user_id", user.id)
    .order("month_number", { ascending: true });

  if (readError) {
    console.warn("تعذر قراءة الشهادات الشهرية:", readError.message);
    return localRecords;
  }

  let savedRows = existingRows || [];

  if (safeCompleted >= 28) {
    const { data: issuedRows, error: issueError } = await supabase.rpc(
      "issue_monthly_certificates",
      {
        certificate_name_input: learnerName || user.email || "متدرب"
      }
    );

    if (issueError) {
      console.warn("تعذر إصدار الشهادات الشهرية عبر RPC:", issueError.message);
    } else {
      savedRows = Array.isArray(issuedRows) ? issuedRows : savedRows;
    }

    const savedByMonthBeforeUpsert = new Map(
      (savedRows || []).map((row) => [Number(row.month_number), row])
    );
    const unlockedRows = localRecords
      .filter((record) => record.status === "issued")
      .map((record) => {
        const saved = savedByMonthBeforeUpsert.get(Number(record.month_number));
        const slug = saved?.verification_slug || saved?.certificate_slug || record.verification_slug;

        return {
          user_id: user.id,
          month_number: record.month_number,
          month_title: record.month_title,
          certificate_code: saved?.certificate_code || record.certificate_code,
          certificate_slug: saved?.certificate_slug || slug,
          verification_slug: slug,
          certificate_name: learnerName || user.email || "متدرب",
          required_days: record.required_days,
          completed_days: safeCompleted,
          total_days: safeTotal,
          status: "issued",
          public_enabled: true,
          verification_enabled: true,
          public_note: `شهادة شهرية صادرة بعد إكمال الشهر ${record.month_number} من رحلة منسقة.`,
          issued_at: saved?.issued_at || new Date().toISOString()
        };
      });

    if (unlockedRows.length) {
      const { data: directlySavedRows, error: directSaveError } = await supabase
        .from("monthly_certificates")
        .upsert(unlockedRows, { onConflict: "user_id,month_number" })
        .select("*")
        .order("month_number", { ascending: true });

      if (directSaveError) {
        console.warn("تعذر حفظ الشهادات الشهرية مباشرة:", directSaveError.message);
      } else if (Array.isArray(directlySavedRows)) {
        savedRows = directlySavedRows;
      }
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
