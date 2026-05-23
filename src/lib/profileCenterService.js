import { isSupabaseConfigured, supabase } from "./supabaseClient";

export const PROFILE_TOTAL_DAYS = 180;
export const HOURS_PER_DAY = 4;

export function calculateLearningRank(completedDays = 0) {
  const days = Number(completedDays || 0);
  if (days >= 180) return { title: "متقن الرحلة", subtitle: "أكمل مسار الإتقان كاملًا", nextTitle: "تفعيل وثيقة الإتقان", nextIn: 0 };
  if (days >= 150) return { title: "ممارس أثر", subtitle: "يربط الممارسة بالقياس والاستدامة", nextTitle: "متقن الرحلة", nextIn: 180 - days };
  if (days >= 90) return { title: "مصمم تدخلات", subtitle: "يحوّل التشخيص إلى تدخل قابل للتنفيذ", nextTitle: "ممارس أثر", nextIn: 150 - days };
  if (days >= 30) return { title: "محلل تشخيصي", subtitle: "يميز العرض عن السبب ويبني فرضيات", nextTitle: "مصمم تدخلات", nextIn: 90 - days };
  if (days >= 7) return { title: "قارئ المنظمة", subtitle: "بدأ يقرأ المنظمة كنظام", nextTitle: "محلل تشخيصي", nextIn: 30 - days };
  return { title: "مستكشف OD", subtitle: "في بداية بناء اللغة والمنهجية", nextTitle: "قارئ المنظمة", nextIn: Math.max(0, 7 - days) };
}

export function formatProfileDate(value) {
  if (!value) return "غير متوفر";
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeZone: "Asia/Riyadh" }).format(new Date(value));
}

function uniqueCompletedDays(rows = []) {
  return new Set(rows.filter((r) => r.status === "completed").map((r) => `${r.month_index}-${r.week_index}-${r.day_index}`)).size;
}

export function calculateStreak(rows = []) {
  const dates = Array.from(new Set(rows
    .filter((r) => r.status === "completed")
    .map((r) => r.completed_at || r.updated_at || r.created_at)
    .filter(Boolean)
    .map((v) => new Date(v).toISOString().slice(0, 10))));
  if (!dates.length) return 0;
  const set = new Set(dates);
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const key = d.toISOString().slice(0, 10);
    if (set.has(key)) {
      streak += 1;
      d.setDate(d.getDate() - 1);
      continue;
    }
    if (i === 0) {
      d.setDate(d.getDate() - 1);
      continue;
    }
    break;
  }
  return streak;
}

function radarItems(latestRadar) {
  const r = latestRadar?.result || {};
  const s = r.scores || r.dimensions || r.axes || r.radar || {};
  const items = [
    ["التفكير التشخيصي", s.diagnosticThinking ?? s.diagnosis ?? s["التفكير التشخيصي"]],
    ["تصميم التدخل", s.interventionDesign ?? s.intervention ?? s["تصميم التدخل"]],
    ["قيادة التغيير", s.changeLeadership ?? s.change ?? s["قيادة التغيير"]],
    ["قياس الأثر", s.impactMeasurement ?? s.impact ?? s["قياس الأثر"]],
    ["الحكم المهني", s.professionalJudgment ?? s.judgment ?? s["الحكم المهني"]]
  ];
  return items.map(([label, score]) => ({ label, score: Number.isFinite(Number(score)) ? Math.max(0, Math.min(100, Number(score))) : null }));
}

function achievements({ completedDays, simulationCount, mentorMessagesCount, hoursCounted, certificateStatus }) {
  return [
    { key: "first_week", title: "أكمل أول أسبوع", status: completedDays >= 7 ? "مكتمل" : "قيد التقدم", value: Math.min(completedDays, 7), target: 7 },
    { key: "first_month", title: "أنهى الشهر الأول", status: completedDays >= 30 ? "مكتمل" : "قيد التقدم", value: Math.min(completedDays, 30), target: 30 },
    { key: "first_simulation", title: "جرّب أول محاكاة", status: simulationCount >= 1 ? "مكتمل" : "قيد التقدم", value: Math.min(simulationCount, 1), target: 1 },
    { key: "mentor_5", title: "استخدم الموجه الذكي 5 مرات", status: mentorMessagesCount >= 5 ? "مكتمل" : "قيد التقدم", value: Math.min(mentorMessagesCount, 5), target: 5 },
    { key: "learning_25h", title: "أتم 25 ساعة تعلم", status: hoursCounted >= 25 ? "مكتمل" : "قيد التقدم", value: Math.min(hoursCounted, 25), target: 25 },
    { key: "mastery_doc", title: "وثيقة الإتقان", status: certificateStatus === "ready" || certificateStatus === "issued" ? "جاهزة" : "مقفلة", value: certificateStatus === "ready" || certificateStatus === "issued" ? 1 : 0, target: 1 }
  ];
}

function recentActivity({ progressRows, latestRadar, latestSimulation, latestMentorSession, events }) {
  const items = [];
  for (const e of events || []) items.push({ title: e.title, description: e.description || "نشاط محفوظ", time: e.created_at });
  const latestProgress = [...(progressRows || [])].filter((r) => r.status === "completed").sort((a, b) => new Date(b.completed_at || b.updated_at || b.created_at) - new Date(a.completed_at || a.updated_at || a.created_at))[0];
  if (latestProgress) items.push({ title: "أكملت درسًا في الرحلة التعليمية", description: `الشهر ${latestProgress.month_index} · الأسبوع ${latestProgress.week_index} · اليوم ${latestProgress.day_index}`, time: latestProgress.completed_at || latestProgress.updated_at || latestProgress.created_at });
  if (latestRadar) items.push({ title: "حدّثت رادار الجدارات", description: latestRadar.level ? `المستوى: ${latestRadar.level}` : "محاولة رادار محفوظة", time: latestRadar.created_at });
  if (latestSimulation) items.push({ title: "أجريت محاكاة تطبيقية", description: latestSimulation.case_title || latestSimulation.case_id || "محاولة محاكاة", time: latestSimulation.created_at });
  if (latestMentorSession) items.push({ title: "استخدمت الموجه الذكي", description: latestMentorSession.title || "جلسة موجه محفوظة", time: latestMentorSession.updated_at || latestMentorSession.created_at });
  return items.filter((i) => i.time).sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
}

export async function fetchProfileCenterData({ fallbackName = "", completedDaysFallback = 0, totalDays = PROFILE_TOTAL_DAYS } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    const completedDays = Number(completedDaysFallback || 0);
    const hoursCounted = completedDays * HOURS_PER_DAY;
    return { source: "local", profile: { certificate_name: fallbackName, full_name: fallbackName, email: "" }, completedDays, totalDays, progressPercent: Math.round((completedDays / totalDays) * 100), hoursCounted, streak: 0, rank: calculateLearningRank(completedDays), radar: radarItems(null), achievements: achievements({ completedDays, simulationCount: 0, mentorMessagesCount: 0, hoursCounted, certificateStatus: "locked" }), recentActivity: [], mastery: null, counts: { simulations: 0, mentorMessages: 0, quizzes: 0 } };
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError || !userResult?.user) throw userError || new Error("لا يوجد مستخدم مسجل الدخول.");
  const user = userResult.user;

  await supabase.rpc("touch_user_activity", { page_name: "profile-center", user_agent_text: typeof navigator !== "undefined" ? navigator.userAgent : null }).catch(() => null);

  let { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) {
    const fallbackProfile = { id: user.id, email: user.email, full_name: user.user_metadata?.full_name || fallbackName || "", certificate_name: user.user_metadata?.full_name || fallbackName || "" };
    const { data: insertedProfile } = await supabase.from("user_profiles").upsert(fallbackProfile, { onConflict: "id" }).select("*").maybeSingle();
    profile = insertedProfile || fallbackProfile;
  }

  const [progressResult, radarResult, simResult, simCountResult, mentorSessionResult, mentorCountResult, quizCountResult, masteryResult, eventsResult] = await Promise.all([
    supabase.from("user_progress").select("month_index, week_index, day_index, status, score, completed_at, updated_at, created_at").eq("user_id", user.id),
    supabase.from("radar_attempts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("simulation_attempts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("simulation_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("ai_mentor_sessions").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("ai_mentor_messages").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("role", "user"),
    supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("mastery_certificates").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_learning_events").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8)
  ]);

  const progressRows = progressResult.data || [];
  const completedDays = uniqueCompletedDays(progressRows) || Number(completedDaysFallback || 0);
  const progressPercent = Math.min(100, Math.round((completedDays / totalDays) * 100));
  const hoursCounted = completedDays * HOURS_PER_DAY;
  const simulationCount = simCountResult.count || 0;
  const mentorMessagesCount = mentorCountResult.count || 0;
  const mastery = masteryResult.data || null;

  return {
    source: "supabase",
    user,
    profile: { ...profile, email: profile?.email || user.email || "", full_name: profile?.full_name || user.user_metadata?.full_name || fallbackName || "", certificate_name: profile?.certificate_name || profile?.full_name || fallbackName || "" },
    completedDays,
    totalDays,
    progressPercent,
    hoursCounted,
    streak: calculateStreak(progressRows),
    rank: calculateLearningRank(completedDays),
    radar: radarItems(radarResult.data || null),
    achievements: achievements({ completedDays, simulationCount, mentorMessagesCount, hoursCounted, certificateStatus: mastery?.status || "locked" }),
    recentActivity: recentActivity({ progressRows, latestRadar: radarResult.data || null, latestSimulation: simResult.data || null, latestMentorSession: mentorSessionResult.data || null, events: eventsResult.data || [] }),
    mastery,
    counts: { simulations: simulationCount, mentorMessages: mentorMessagesCount, quizzes: quizCountResult.count || 0 }
  };
}

export async function updateProfileCenter(profilePatch = {}) {
  if (!isSupabaseConfigured || !supabase) return { ok: false, error: "Supabase غير مفعّل." };
  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError || !userResult?.user) throw userError || new Error("لا يوجد مستخدم مسجل الدخول.");
  const { data, error } = await supabase.from("user_profiles").upsert({ id: userResult.user.id, ...profilePatch }, { onConflict: "id" }).select("*").maybeSingle();
  if (error) throw error;
  return data;
}
