import { isSupabaseConfigured, supabase } from "./supabaseClient";
import { getRecentLessonNotes } from "./lessonNotesService";
import { getLearningTimeSummary } from "./learningTimeService";
import { getNotifications } from "./notificationsService";
import { getUserBadges } from "./badgesService";

const DEFAULT_RADAR = [
  { label: "التفكير التشخيصي", score: null },
  { label: "تصميم التدخل", score: null },
  { label: "قيادة التغيير", score: null },
  { label: "قياس الأثر", score: null },
  { label: "الحكم المهني", score: null }
];

const RANKS = [
  {
    title: "مستكشف OD",
    subtitle: "بدأت الرحلة",
    minDays: 0,
    nextTitle: "قارئ المنظمة",
    nextAt: 7
  },
  {
    title: "قارئ المنظمة",
    subtitle: "أكملت أول أسبوع",
    minDays: 7,
    nextTitle: "محلل تشخيصي",
    nextAt: 28
  },
  {
    title: "محلل تشخيصي",
    subtitle: "أكملت الشهر الأول",
    minDays: 28,
    nextTitle: "مصمم تدخلات",
    nextAt: 84
  },
  {
    title: "مصمم تدخلات",
    subtitle: "دخلت عمق تصميم التدخل",
    minDays: 84,
    nextTitle: "ممارس أثر",
    nextAt: 140
  },
  {
    title: "ممارس أثر",
    subtitle: "تربط التعلم بالقياس والاستدامة",
    minDays: 140,
    nextTitle: "متقن الرحلة",
    nextAt: 168
  },
  {
    title: "متقن الرحلة",
    subtitle: "أكملت رحلة الإتقان",
    minDays: 168,
    nextTitle: null,
    nextAt: null
  }
];

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getRank(completedDays) {
  const days = safeNumber(completedDays);
  const current = [...RANKS].reverse().find((rank) => days >= rank.minDays) || RANKS[0];

  return {
    ...current,
    nextIn: current.nextAt ? Math.max(0, current.nextAt - days) : 0
  };
}

function buildAchievements({
  completedDays,
  hoursCounted,
  simulationsCount,
  mentorSessionsCount,
  notesCount,
  totalDays
}) {
  return [
    {
      key: "first_week",
      title: "أكمل أول أسبوع",
      status: completedDays >= 7 ? "مكتمل" : "قيد التقدم",
      value: Math.min(completedDays, 7),
      target: 7
    },
    {
      key: "first_month",
      title: "أنهى الشهر الأول",
      status: completedDays >= 28 ? "مكتمل" : "قيد التقدم",
      value: Math.min(completedDays, 28),
      target: 28
    },
    {
      key: "first_simulation",
      title: "جرّب أول محاكاة",
      status: simulationsCount >= 1 ? "مكتمل" : "قيد التقدم",
      value: Math.min(simulationsCount, 1),
      target: 1
    },
    {
      key: "mentor_practice",
      title: "استخدم الموجه الذكي 5 مرات",
      status: mentorSessionsCount >= 5 ? "مكتمل" : "قيد التقدم",
      value: Math.min(mentorSessionsCount, 5),
      target: 5
    },
    {
      key: "notes_habit",
      title: "حفظ 5 ملاحظات مهنية",
      status: notesCount >= 5 ? "مكتمل" : "قيد التقدم",
      value: Math.min(notesCount, 5),
      target: 5
    },
    {
      key: "learning_time",
      title: "أتم 25 ساعة تعلم",
      status: hoursCounted >= 25 ? "مكتمل" : "قيد التقدم",
      value: Math.min(Math.round(hoursCounted), 25),
      target: 25
    },
    {
      key: "mastery_certificate",
      title: "حصل على وثيقة الإتقان",
      status: completedDays >= totalDays ? "جاهزة" : "مقفل",
      value: Math.min(completedDays, totalDays),
      target: totalDays
    }
  ];
}

function mapLearningEvents(events = []) {
  return events.map((event) => ({
    title: event.event_title || event.title || "نشاط تعليمي",
    description: event.event_description || event.description || "",
    time: event.created_at
  }));
}

function mapNotesAsActivity(notes = []) {
  return notes.map((note) => ({
    title: note.note_title || "ملاحظة محفوظة",
    description: `الشهر ${note.month_index} · الأسبوع ${note.week_index} · اليوم ${note.day_index}`,
    time: note.updated_at || note.created_at
  }));
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

async function getProfile(userId) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("تعذر قراءة ملف المتدرب:", error.message);
    return null;
  }

  return data;
}

async function getProgressCount(userId) {
  const { count, error } = await supabase
    .from("user_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed");

  if (error) {
    console.warn("تعذر حساب التقدم:", error.message);
    return 0;
  }

  return count || 0;
}

async function getRadar(userId) {
  const { data, error } = await supabase
    .from("radar_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.warn("تعذر قراءة الرادار:", error.message);
    return DEFAULT_RADAR;
  }

  const latest = data?.[0];

  if (!latest?.result) return DEFAULT_RADAR;

  const result = latest.result;

  if (Array.isArray(result.axes)) {
    return result.axes.map((axis) => ({
      label: axis.label || axis.name || "محور",
      score: axis.score ?? axis.value ?? null
    }));
  }

  const possible = [
    ["diagnostic", "التفكير التشخيصي"],
    ["intervention", "تصميم التدخل"],
    ["change", "قيادة التغيير"],
    ["impact", "قياس الأثر"],
    ["judgment", "الحكم المهني"]
  ];

  return possible.map(([key, label]) => ({
    label,
    score: result[key] ?? result.scores?.[key] ?? null
  }));
}

async function getCounts(userId) {
  const [simulations, mentorSessions, notes] = await Promise.all([
    supabase
      .from("simulation_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("ai_mentor_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("lesson_notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
  ]);

  return {
    simulationsCount: simulations.count || 0,
    mentorSessionsCount: mentorSessions.count || 0,
    notesCount: notes.count || 0
  };
}

async function getMastery(userId) {
  const { data, error } = await supabase
    .from("mastery_certificates")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("تعذر قراءة وثيقة الإتقان:", error.message);
    return null;
  }

  return data;
}

async function getRecentEvents() {
  const { data, error } = await supabase
    .from("user_learning_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    return [];
  }

  return data || [];
}

export async function fetchProfileCenterData({
  fallbackName = "",
  completedDaysFallback = 0,
  totalDays = 168
} = {}) {
  if (!isSupabaseConfigured || !supabase) {
    const completedDays = safeNumber(completedDaysFallback);
    const hoursCounted = Math.round((completedDays * 4) * 10) / 10;

    return {
      profile: {
        full_name: fallbackName,
        certificate_name: fallbackName,
        email: "",
        professional_goal: "",
        professional_track: ""
      },
      completedDays,
      progressPercent: Math.round((completedDays / totalDays) * 100),
      hoursCounted,
      streak: 0,
      rank: getRank(completedDays),
      radar: DEFAULT_RADAR,
      achievements: buildAchievements({
        completedDays,
        hoursCounted,
        simulationsCount: 0,
        mentorSessionsCount: 0,
        notesCount: 0,
        totalDays
      }),
      recentActivity: [],
      recentNotes: [],
      badges: [],
      notifications: [],
      mastery: null
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [
    profile,
    completedDaysFromDb,
    learningTime,
    radar,
    counts,
    mastery,
    recentEvents,
    recentNotes,
    badges
  ] = await Promise.all([
    getProfile(user.id),
    getProgressCount(user.id),
    getLearningTimeSummary(),
    getRadar(user.id),
    getCounts(user.id),
    getMastery(user.id),
    getRecentEvents(),
    getRecentLessonNotes(6),
    getUserBadges()
  ]);

  const completedDays = Math.max(
    safeNumber(completedDaysFallback),
    safeNumber(completedDaysFromDb)
  );
  const seconds = safeNumber(learningTime?.total_seconds);
  const hoursCounted =
    seconds > 0
      ? Math.round((seconds / 3600) * 10) / 10
      : Math.round((completedDays * 4) * 10) / 10;
  const progressPercent = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;
  const notifications = await getNotifications(8, { completedDays });

  const recentActivity = [
    ...mapLearningEvents(recentEvents),
    ...mapNotesAsActivity(recentNotes)
  ]
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
    .slice(0, 8);

  return {
    profile: profile || {
      email: user.email,
      full_name: fallbackName,
      certificate_name: fallbackName
    },
    completedDays,
    progressPercent,
    hoursCounted,
    streak: calculateStreakFromDailyLog(learningTime?.daily_log),
    rank: getRank(completedDays),
    radar,
    achievements: buildAchievements({
      completedDays,
      hoursCounted,
      simulationsCount: counts.simulationsCount,
      mentorSessionsCount: counts.mentorSessionsCount,
      notesCount: counts.notesCount,
      totalDays
    }),
    recentActivity,
    recentNotes,
    badges,
    notifications,
    mastery,
    learningTime
  };
}

export async function updateProfileCenter(payload = {}) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase غير مفعّل.");
  }

  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("يلزم تسجيل الدخول لتعديل الملف.");
  }

  const profilePayload = {
    id: user.id,
    certificate_name: payload.certificate_name || null,
    full_name: payload.full_name || payload.certificate_name || null,
    display_name: payload.display_name || payload.certificate_name || payload.full_name || null,
    professional_goal: payload.professional_goal || null,
    professional_track: payload.professional_track || null,
    experience_level: payload.experience_level || null,
    city: payload.city || null,
    country: payload.country || null,
    profile_completed_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(profilePayload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export function formatProfileDate(value) {
  if (!value) return "غير محدد";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(value));
  } catch {
    return "غير محدد";
  }
}

export function formatProfileDateTime(value) {
  if (!value) return "غير محدد";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "غير محدد";
  }
}

export function formatLearningHours(hours) {
  const value = Number(hours || 0);

  if (value < 1) return "أقل من ساعة";

  if (value < 2) return "ساعة تقريبًا";

  return `${Math.round(value * 10) / 10} ساعة`;
}

export function formatSecondsToHours(seconds) {
  return formatLearningHours(Number(seconds || 0) / 3600);
}

function calculateStreakFromDailyLog(dailyLog) {
  if (!dailyLog || typeof dailyLog !== "object") return 0;

  const days = Object.entries(dailyLog)
    .filter(([, seconds]) => Number(seconds || 0) > 0)
    .map(([date]) => date)
    .sort();

  if (!days.length) return 0;

  let streak = 0;
  const today = new Date();

  for (let index = 0; index < 365; index += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - index);

    const key = d.toISOString().slice(0, 10);

    if (days.includes(key)) {
      streak += 1;
    } else if (index > 0) {
      break;
    }
  }

  return streak;
}
