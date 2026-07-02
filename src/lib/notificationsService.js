import { isSupabaseConfigured, supabase } from "./supabaseClient";

export async function getNotifications(limit = 12) {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("تعذر قراءة الإشعارات:", error.message);
    return [];
  }

  return data || [];
}

export async function createNotification({
  title,
  body = "",
  type = "info",
  actionLabel = null,
  actionPage = null,
  metadata = {}
}) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data: userResult } = await supabase.auth.getUser();
  const userId = userResult?.user?.id;

  if (!userId) return null;

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title,
      body,
      type,
      action_label: actionLabel,
      action_page: actionPage,
      metadata
    })
    .select("*")
    .single();

  if (error) {
    console.warn("تعذر إنشاء الإشعار:", error.message);
    return null;
  }

  return data;
}

export async function markNotificationRead(id) {
  if (!isSupabaseConfigured || !supabase) return;

  const { error } = await supabase.rpc("mark_notification_read", {
    notification_id: id
  });

  if (error) {
    console.warn("تعذر تحديث الإشعار:", error.message);
  }
}

export async function maybeCreateMilestoneNotification(completedDays = 0) {
  if (!isSupabaseConfigured || !supabase) return null;

  const day = Number(completedDays || 0);
  const milestones = {
    7: {
      title: "أكملت أول أسبوع 🌿",
      body: "بدأت تقرأ المنظمة كنظام. واصل بنفس الهدوء والانضباط.",
      actionPage: "journey"
    },
    28: {
      title: "أنهيت الشهر الأول 🧭",
      body: "انتقلت من القراءة العامة إلى التفكير التشخيصي المنظم.",
      actionPage: "journey"
    },
    84: {
      title: "وصلت منتصف الرحلة تقريبًا 🚀",
      body: "هذه محطة ممتازة لتقييم تجربتك ومراجعة أثر التعلم.",
      actionPage: "journey"
    },
    140: {
      title: "اقتربت من الإتقان 📈",
      body: "أصبحت في مرحلة ربط التعلم بالأثر والقياس والاستدامة.",
      actionPage: "mastery"
    },
    168: {
      title: "أتممت الرحلة 🏅",
      body: "وثيقة الإتقان أصبحت جاهزة للمراجعة والتفعيل.",
      actionPage: "mastery"
    }
  };

  const milestone = milestones[day];

  if (!milestone) return null;

  const { data: userResult } = await supabase.auth.getUser();
  const userId = userResult?.user?.id;

  if (!userId) return null;

  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "milestone")
    .eq("metadata->>completedDays", String(day))
    .limit(1);

  if (existing?.length) return existing[0];

  return createNotification({
    title: milestone.title,
    body: milestone.body,
    type: "milestone",
    actionLabel: "فتح القسم",
    actionPage: milestone.actionPage,
    metadata: {
      completedDays: day
    }
  });
}
