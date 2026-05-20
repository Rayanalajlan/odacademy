import { useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

/**
 * OD Academy Home.jsx
 * نسخة رئيسية كاملة:
 * - تصميم جديد بالكامل.
 * - عداد وقت تعلم ذكي.
 * - يحسب الوقت الفعلي أثناء بقاء المستخدم نشطًا في المنصة.
 * - يتوقف عند الخمول أو إخفاء التبويب.
 * - يحفظ الوقت محليًا في localStorage.
 * - يحدّث المفتاح القديم od_hours حتى تظهر الساعات في وثيقة الإتقان إن كانت تعتمد عليه.
 *
 * ملاحظة مهمة:
 * هذا العداد يعمل كـ Singleton على مستوى نافذة المتصفح بعد تحميل ملف Home.jsx.
 * إذا كان تطبيقك لا يحمّل Home.jsx إلا عند الدخول للرئيسية، سيبدأ العد من أول زيارة للرئيسية.
 * لاحقًا، لو أردت أقوى نسخة على مستوى كل الموقع 100%، ننقل نفس الـ tracker إلى App.jsx أو Layout.
 */

const TIMER_STORAGE_KEY = "od_academy_learning_timer_v1";
const TIMER_STORAGE_KEY_PREFIX = "od_academy_learning_timer_v2_user_";
const LEGACY_HOURS_KEY = "od_hours";
const REMOTE_LEARNING_TIME_TABLE = "user_learning_time";
const REMOTE_SYNC_INTERVAL_MS = 15000;
const TIMER_EVENT = "od-learning-time-update";
const DAILY_GOAL_SECONDS = 45 * 60;
const IDLE_LIMIT_MS = 5 * 60 * 1000;

const cards = [
  {
    title: "رحلتك التعليمية",
    text: "180 يومًا موزعة على 6 أشهر، من العقل التشخيصي إلى الاحتراف كممارس OD.",
    icon: "🧭",
    page: "journey",
    badge: "المسار الرئيسي",
    tone: "indigo"
  },
  {
    title: "رادار الأداء",
    text: "قياس فجوة الجدارات الاستشارية عبر مواقف مهنية حرجة.",
    icon: "📊",
    page: "radar",
    badge: "تشخيص ذاتي",
    tone: "emerald"
  },
  {
    title: "المحاكاة",
    text: "مختبر قرار حي يختبر قراراتك في حالة شركة مسار اللوجستية.",
    icon: "🏢",
    page: "simulation",
    badge: "قرار واقعي",
    tone: "amber"
  },
  {
    title: "الموجه الذكي",
    text: "مناقشة سقراطية مع موجه متخصص في التطوير التنظيمي.",
    icon: "🧠",
    page: "ai-mentor",
    badge: "تفكير سقراطي",
    tone: "violet"
  },
  {
    title: "وثيقة الإتقان",
    text: "سجل ختامي قابل للطباعة والمشاركة بعد إنجاز المسار.",
    icon: "📜",
    page: "mastery",
    badge: "إثبات الأثر",
    tone: "slate"
  },
  {
    title: "عن ريان",
    text: "خلفية المبادرة وفلسفتها المهنية ومنطلقاتها العلمية.",
    icon: "RA",
    page: "about",
    badge: "الفلسفة",
    tone: "rose"
  }
];

const insights = [
  "لا تبدأ بالحل. افهم النظام.",
  "التطوير التنظيمي ليس بحثًا عن الجاني، بل قراءة لهندسة السلوك داخل المنظمة.",
  "ما لا يدخل في الأدوار والصلاحيات والأداء سيبقى شعارًا.",
  "التغيير لا ينجح عند الإطلاق؛ ينجح عندما يصمد تحت الضغط.",
  "الثقافة تظهر عندما تصبح القيمة مكلفة.",
  "الممارس المحترف يقيس الأثر، لا عدد الأنشطة فقط."
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function clampNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function getTimerStorageKey(userId) {
  return userId ? `${TIMER_STORAGE_KEY_PREFIX}${userId}` : TIMER_STORAGE_KEY;
}

function readStoredTimer(storageKey = TIMER_STORAGE_KEY) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeTimerData(raw) {
  const today = getTodayKey();
  const now = new Date().toISOString();

  const base = {
    totalSeconds: 0,
    dailyLog: {},
    sessionsCount: 0,
    longestSessionSeconds: 0,
    createdAt: now,
    updatedAt: now
  };

  const data = raw && typeof raw === "object" ? { ...base, ...raw } : base;

  data.totalSeconds = clampNumber(data.totalSeconds);
  data.sessionsCount = clampNumber(data.sessionsCount);
  data.longestSessionSeconds = clampNumber(data.longestSessionSeconds);
  data.dailyLog = data.dailyLog && typeof data.dailyLog === "object" ? data.dailyLog : {};

  Object.keys(data.dailyLog).forEach((key) => {
    data.dailyLog[key] = clampNumber(data.dailyLog[key]);
  });

  if (!data.dailyLog[today]) data.dailyLog[today] = 0;

  return data;
}

function mergeDailyLogs(...logs) {
  const merged = {};

  logs.forEach((log) => {
    if (!log || typeof log !== "object") return;

    Object.entries(log).forEach(([date, seconds]) => {
      merged[date] = Math.max(clampNumber(merged[date]), clampNumber(seconds));
    });
  });

  return merged;
}

function mergeTimerData(...sources) {
  const normalizedSources = sources
    .filter(Boolean)
    .map((source) => normalizeTimerData(source));

  if (!normalizedSources.length) return normalizeTimerData(null);

  const base = normalizeTimerData(null);
  const dailyLog = mergeDailyLogs(...normalizedSources.map((source) => source.dailyLog));
  const dailyTotal = Object.values(dailyLog).reduce((sum, seconds) => sum + clampNumber(seconds), 0);
  const totalSeconds = Math.max(
    dailyTotal,
    ...normalizedSources.map((source) => clampNumber(source.totalSeconds))
  );

  return {
    ...base,
    totalSeconds,
    dailyLog,
    sessionsCount: Math.max(...normalizedSources.map((source) => clampNumber(source.sessionsCount))),
    longestSessionSeconds: Math.max(...normalizedSources.map((source) => clampNumber(source.longestSessionSeconds))),
    createdAt: normalizedSources.map((source) => source.createdAt).filter(Boolean).sort()[0] || base.createdAt,
    updatedAt: new Date().toISOString()
  };
}

async function fetchRemoteTimerData(userId) {
  if (!userId || !isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from(REMOTE_LEARNING_TIME_TABLE)
      .select("total_seconds, daily_log, sessions_count, longest_session_seconds, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;

    return normalizeTimerData({
      totalSeconds: data.total_seconds,
      dailyLog: data.daily_log,
      sessionsCount: data.sessions_count,
      longestSessionSeconds: data.longest_session_seconds,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  } catch {
    return null;
  }
}

async function pushRemoteTimerData(userId, data) {
  if (!userId || !isSupabaseConfigured || !supabase) return;

  const normalized = normalizeTimerData(data);

  try {
    await supabase.from(REMOTE_LEARNING_TIME_TABLE).upsert(
      {
        user_id: userId,
        total_seconds: Math.floor(clampNumber(normalized.totalSeconds)),
        daily_log: normalized.dailyLog,
        sessions_count: Math.floor(clampNumber(normalized.sessionsCount)),
        longest_session_seconds: Math.floor(clampNumber(normalized.longestSessionSeconds)),
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );
  } catch {
    // فشل المزامنة السحابية لا يوقف العداد؛ النسخة المحلية تبقى محفوظة.
  }
}

function saveTimerData(data, storageKey = TIMER_STORAGE_KEY) {
  if (typeof window === "undefined") return;

  try {
    const normalized = normalizeTimerData(data);
    window.localStorage.setItem(storageKey, JSON.stringify(normalized));

    // نحفظ نسخة عامة أيضًا حتى لا يضيع وقتك لو تغيّر مفتاح المستخدم أو دخلت من نسخة قديمة.
    if (storageKey !== TIMER_STORAGE_KEY) {
      window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(normalized));
    }

    /**
     * مفتاح متوافق مع كود وثيقة الإتقان القديم.
     * نخزن عدد الساعات المكتملة فعليًا، لا الدقائق.
     */
    const completedHours = Math.floor(clampNumber(normalized.totalSeconds) / 3600);
    window.localStorage.setItem(LEGACY_HOURS_KEY, String(completedHours));
  } catch {
    // تجاهل فشل التخزين حتى لا يتعطل الموقع
  }
}

function formatDuration(totalSeconds, compact = false) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (compact) {
    if (hours > 0) return `${hours}س ${minutes}د`;
    if (minutes > 0) return `${minutes}د`;
    return `${remainingSeconds}ث`;
  }

  if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة`;
  if (minutes > 0) return `${minutes} دقيقة و ${remainingSeconds} ثانية`;
  return `${remainingSeconds} ثانية`;
}

function getStreakDays(dailyLog) {
  const dates = Object.keys(dailyLog || {}).filter((date) => clampNumber(dailyLog[date]) > 0);
  if (!dates.length) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (clampNumber(dailyLog[key]) > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getWeeklySeconds(dailyLog) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let sum = 0;

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    sum += clampNumber(dailyLog?.[key]);
  }

  return sum;
}

function buildTimerSnapshot(timer) {
  const data = timer?.data || normalizeTimerData(null);
  const today = getTodayKey();
  const todaySeconds = clampNumber(data.dailyLog?.[today]);
  const totalSeconds = clampNumber(data.totalSeconds);
  const sessionSeconds = clampNumber(timer?.sessionSeconds);
  const weeklySeconds = getWeeklySeconds(data.dailyLog);
  const streakDays = getStreakDays(data.dailyLog);
  const completedHours = Math.floor(totalSeconds / 3600);
  const decimalHours = totalSeconds / 3600;
  const dailyProgress = Math.min(100, Math.round((todaySeconds / DAILY_GOAL_SECONDS) * 100));

  return {
    totalSeconds,
    sessionSeconds,
    todaySeconds,
    weeklySeconds,
    streakDays,
    completedHours,
    decimalHours,
    dailyProgress,
    sessionsCount: data.sessionsCount,
    longestSessionSeconds: data.longestSessionSeconds,
    isPaused: Boolean(timer?.isPaused),
    isIdle: Boolean(timer?.isIdle),
    isVisible: typeof document === "undefined" ? true : document.visibilityState === "visible",
    statusLabel: timer?.isPaused
      ? "متوقف يدويًا"
      : timer?.isIdle
        ? "خامل مؤقتًا"
        : "يحسب الآن",
    statusTone: timer?.isPaused ? "paused" : timer?.isIdle ? "idle" : "active"
  };
}

function createLearningTimer() {
  if (typeof window === "undefined") return null;

  if (window.__OD_ACADEMY_LEARNING_TIMER__) {
    return window.__OD_ACADEMY_LEARNING_TIMER__;
  }

  const timer = {
    userId: null,
    storageKey: TIMER_STORAGE_KEY,
    data: normalizeTimerData(readStoredTimer(TIMER_STORAGE_KEY)),
    intervalId: null,
    authSubscription: null,
    lastTickAt: Date.now(),
    lastInteractionAt: Date.now(),
    lastSaveAt: Date.now(),
    lastRemoteSyncAt: 0,
    syncInFlight: false,
    sessionSeconds: 0,
    isPaused: false,
    isIdle: false,

    async bindCurrentUser() {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        const { data } = await supabase.auth.getUser();
        const userId = data?.user?.id;

        if (!userId || this.userId === userId) return;

        const userStorageKey = getTimerStorageKey(userId);
        const genericLocalData = readStoredTimer(TIMER_STORAGE_KEY);
        const userLocalData = readStoredTimer(userStorageKey);
        const remoteData = await fetchRemoteTimerData(userId);

        this.userId = userId;
        this.storageKey = userStorageKey;
        this.data = mergeTimerData(this.data, genericLocalData, userLocalData, remoteData);
        this.data.updatedAt = new Date().toISOString();

        this.persist(true);
        this.broadcast();
      } catch {
        // لو فشل ربط المستخدم، نستمر بالحفظ المحلي حتى لا يضيع الوقت.
      }
    },

    persist(forceRemote = false) {
      saveTimerData(this.data, this.storageKey);

      const now = Date.now();
      const shouldSyncRemote =
        forceRemote || now - this.lastRemoteSyncAt >= REMOTE_SYNC_INTERVAL_MS;

      if (this.userId && shouldSyncRemote && !this.syncInFlight) {
        this.syncInFlight = true;
        this.lastRemoteSyncAt = now;

        pushRemoteTimerData(this.userId, this.data).finally(() => {
          this.syncInFlight = false;
        });
      }
    },

    start() {
      this.data.sessionsCount += 1;
      this.data.updatedAt = new Date().toISOString();
      this.persist(true);
      this.bindCurrentUser();

      if (isSupabaseConfigured && supabase) {
        const { data } = supabase.auth.onAuthStateChange(() => {
          this.bindCurrentUser();
        });

        this.authSubscription = data?.subscription || null;
      }

      const interactionEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

      const markInteraction = () => {
        this.lastInteractionAt = Date.now();
        this.isIdle = false;
        this.broadcast();
      };

      interactionEvents.forEach((eventName) => {
        window.addEventListener(eventName, markInteraction, { passive: true });
      });

      document.addEventListener("visibilitychange", () => {
        this.lastTickAt = Date.now();
        this.broadcast();
        this.persist();
      });

      window.addEventListener("beforeunload", () => {
        this.persist();
      });

      this.intervalId = window.setInterval(() => this.tick(), 1000);
      this.broadcast();
    },

    tick() {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.floor((now - this.lastTickAt) / 1000));
      this.lastTickAt = now;

      const visible = document.visibilityState === "visible";
      const idle = now - this.lastInteractionAt > IDLE_LIMIT_MS;
      this.isIdle = idle;

      const shouldCount = visible && !idle && !this.isPaused;

      if (shouldCount && elapsedSeconds > 0) {
        /**
         * نحدّ الزيادة القصوى في كل tick حتى لا تُحسب ساعات وهمية
         * لو كان المتصفح معلّقًا ثم عاد دفعة واحدة.
         */
        const safeIncrement = Math.min(elapsedSeconds, 5);
        const today = getTodayKey();

        if (!this.data.dailyLog[today]) this.data.dailyLog[today] = 0;

        this.data.totalSeconds += safeIncrement;
        this.data.dailyLog[today] += safeIncrement;
        this.sessionSeconds += safeIncrement;

        if (this.sessionSeconds > this.data.longestSessionSeconds) {
          this.data.longestSessionSeconds = this.sessionSeconds;
        }

        this.data.updatedAt = new Date().toISOString();
      }

      if (now - this.lastSaveAt >= 5000) {
        this.lastSaveAt = now;
        this.persist();
      }

      this.broadcast();
    },

    pause() {
      this.isPaused = true;
      this.broadcast();
      this.persist();
    },

    resume() {
      this.isPaused = false;
      this.lastInteractionAt = Date.now();
      this.lastTickAt = Date.now();
      this.broadcast();
    },

    resetToday() {
      const today = getTodayKey();
      const todaySeconds = clampNumber(this.data.dailyLog[today]);

      this.data.totalSeconds = Math.max(0, this.data.totalSeconds - todaySeconds);
      this.data.dailyLog[today] = 0;
      this.sessionSeconds = 0;
      this.data.updatedAt = new Date().toISOString();

      this.persist();
      this.broadcast();
    },

    getSnapshot() {
      return buildTimerSnapshot(this);
    },

    broadcast() {
      const snapshot = this.getSnapshot();
      window.dispatchEvent(new CustomEvent(TIMER_EVENT, { detail: snapshot }));
    }
  };

  window.__OD_ACADEMY_LEARNING_TIMER__ = timer;
  timer.start();

  return timer;
}

const learningTimer = createLearningTimer();

function useLearningTimer() {
  const [snapshot, setSnapshot] = useState(() => {
    if (!learningTimer) return buildTimerSnapshot(null);
    return learningTimer.getSnapshot();
  });

  useEffect(() => {
    if (!learningTimer || typeof window === "undefined") return undefined;

    const handleUpdate = (event) => {
      setSnapshot(event.detail || learningTimer.getSnapshot());
    };

    window.addEventListener(TIMER_EVENT, handleUpdate);
    setSnapshot(learningTimer.getSnapshot());

    return () => window.removeEventListener(TIMER_EVENT, handleUpdate);
  }, []);

  return {
    snapshot,
    pause: () => learningTimer?.pause(),
    resume: () => learningTimer?.resume(),
    resetToday: () => learningTimer?.resetToday()
  };
}

function StatCard({ label, value, hint, icon, tone = "indigo" }) {
  return (
    <div className={`od-stat-card od-stat-card--${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint && <small>{hint}</small>}
      </div>
      <i>{icon}</i>
    </div>
  );
}

function ProgressLine({ label, value, hint }) {
  return (
    <div className="od-progress-line">
      <div>
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="od-progress-track">
        <b style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function TimerCommandCenter({ timer, onPause, onResume, onResetToday }) {
  return (
    <section className="od-timer-command">
      <div className="od-timer-orbit">
        <div className={`od-live-core od-live-core--${timer.statusTone}`}>
          <span>{timer.statusLabel}</span>
          <strong>{formatDuration(timer.sessionSeconds, true)}</strong>
          <small>الجلسة الحالية</small>
        </div>
      </div>

      <div className="od-timer-content">
        <div className="od-section-kicker">مرصد الوقت المهني</div>
        <h2>عداد تعلّم ذكي يحسب وجودك النشط داخل المنصة</h2>
        <p>
          لا يحسب الوقت الوهمي عند ترك التبويب أو الخمول الطويل. كل دقيقة نشطة تُضاف إلى رصيدك المعرفي، وتُحفظ محليًا حتى تظهر لاحقًا في وثيقة الإتقان.
        </p>

        <div className="od-timer-grid">
          <StatCard
            label="اليوم"
            value={formatDuration(timer.todaySeconds, true)}
            hint="هدف اليوم 45 دقيقة"
            icon="☀️"
            tone="amber"
          />

          <StatCard
            label="آخر 7 أيام"
            value={formatDuration(timer.weeklySeconds, true)}
            hint="قياس الاستمرارية"
            icon="📈"
            tone="emerald"
          />

          <StatCard
            label="إجمالي الوقت"
            value={formatDuration(timer.totalSeconds, true)}
            hint={`${timer.decimalHours.toFixed(1)} ساعة فعلية`}
            icon="⏳"
            tone="indigo"
          />

          <StatCard
            label="ساعات محتسبة"
            value={`${String(timer.completedHours).padStart(3, "0")} ساعة`}
            hint="تظهر في وثيقة الإتقان"
            icon="🏅"
            tone="violet"
          />
        </div>

        <ProgressLine
          label="إنجاز هدف اليوم"
          value={timer.dailyProgress}
          hint={timer.dailyProgress >= 100 ? "اكتمل هدف اليوم. ممتاز." : "اقترب من إكمال جرعة اليوم المعرفية."}
        />

        <div className="od-timer-actions">
          {timer.isPaused ? (
            <button type="button" className="od-button od-button--primary" onClick={onResume}>
              استئناف العدّ
            </button>
          ) : (
            <button type="button" className="od-button od-button--dark" onClick={onPause}>
              إيقاف مؤقت
            </button>
          )}

          <button type="button" className="od-button od-button--ghost" onClick={onResetToday}>
            تصفير وقت اليوم فقط
          </button>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ card, onOpen, metric }) {
  return (
    <button type="button" className={`od-feature-card od-feature-card--${card.tone}`} onClick={onOpen}>
      <div className="od-feature-top">
        <span className="od-feature-badge">{card.badge}</span>
        <div className="od-feature-icon">{card.icon}</div>
      </div>

      <h3>{card.title}</h3>
      <p>{card.text}</p>

      <div className="od-feature-bottom">
        <span>{metric}</span>
        <b>افتح القسم ←</b>
      </div>
    </button>
  );
}

export default function Home({ userName, setActivePage, completedDays = 0, totalDays = 180 }) {
  const safeTotalDays = totalDays > 0 ? totalDays : 180;
  const safeCompletedDays = Math.max(0, Math.min(completedDays || 0, safeTotalDays));
  const progress = Math.round((safeCompletedDays / safeTotalDays) * 100);

  const { snapshot: timer, pause, resume, resetToday } = useLearningTimer();

  const quote = useMemo(() => {
    const index = Math.floor((safeCompletedDays + timer.completedHours) % insights.length);
    return insights[index];
  }, [safeCompletedDays, timer.completedHours]);

  const learningRank = useMemo(() => {
    if (timer.completedHours >= 100) return "ممارس متقدم";
    if (timer.completedHours >= 50) return "مستشار صاعد";
    if (timer.completedHours >= 20) return "محلل نظامي";
    if (timer.completedHours >= 5) return "متدرّب جاد";
    return "بداية الرحلة";
  }, [timer.completedHours]);

  const cardMetric = (page) => {
    if (page === "journey") return `${safeCompletedDays}/${safeTotalDays} يوم`;
    if (page === "mastery") return `${timer.completedHours} ساعة`;
    if (page === "radar") return "5 جدارات";
    if (page === "simulation") return "مختبر قرار";
    if (page === "ai-mentor") return "موجه سقراطي";
    return "فلسفة المنصة";
  };

  return (
    <section className="od-home-v2" dir="rtl">
      <style>{`
        .od-home-v2 {
          --od-ink: #0f172a;
          --od-muted: #64748b;
          --od-soft: rgba(255,255,255,.76);
          --od-line: rgba(148,163,184,.22);
          --od-indigo: #4f46e5;
          --od-violet: #7c3aed;
          --od-emerald: #10b981;
          --od-amber: #f59e0b;
          --od-rose: #e11d48;
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          padding: 28px 16px 80px;
          color: var(--od-ink);
          background:
            radial-gradient(circle at 14% 12%, rgba(79,70,229,.18), transparent 28%),
            radial-gradient(circle at 82% 10%, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at 52% 92%, rgba(16,185,129,.12), transparent 32%),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 52%, #fff7ed 100%);
        }

        .od-home-v2::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15,23,42,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,.035) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(circle at center, black, transparent 78%);
          pointer-events: none;
        }

        .od-home-wrap {
          position: relative;
          z-index: 1;
          width: min(1220px, 100%);
          margin: 0 auto;
        }

        .od-hero {
          position: relative;
          overflow: hidden;
          border-radius: 42px;
          padding: 36px;
          min-height: 520px;
          color: white;
          background:
            radial-gradient(circle at 16% 20%, rgba(129,140,248,.32), transparent 34%),
            radial-gradient(circle at 85% 15%, rgba(245,158,11,.24), transparent 28%),
            linear-gradient(145deg, #0f172a 0%, #1e1b4b 52%, #312e81 100%);
          box-shadow: 0 28px 90px rgba(15,23,42,.22);
          border: 1px solid rgba(255,255,255,.16);
        }

        .od-hero::before {
          content: "";
          position: absolute;
          width: 720px;
          height: 720px;
          border-radius: 50%;
          right: -260px;
          top: -320px;
          background: conic-gradient(from 120deg, rgba(255,255,255,.18), rgba(245,158,11,.18), rgba(16,185,129,.14), rgba(124,58,237,.22), rgba(255,255,255,.18));
          filter: blur(8px);
          opacity: .75;
          animation: odSpin 18s linear infinite;
        }

        .od-hero::after {
          content: "";
          position: absolute;
          inset: -40%;
          background-image:
            linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
          background-size: 52px 52px;
          transform: rotate(-8deg);
          opacity: .42;
          pointer-events: none;
        }

        @keyframes odSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .od-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.12fr .88fr;
          gap: 34px;
          align-items: center;
        }

        .od-chip {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          width: fit-content;
          border-radius: 999px;
          padding: 9px 14px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.18);
          color: #e0e7ff;
          font-size: 12px;
          font-weight: 950;
          backdrop-filter: blur(10px);
        }

        .od-chip i {
          width: 8px;
          height: 8px;
          display: inline-block;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 6px rgba(34,197,94,.14);
        }

        .od-hero h1 {
          margin: 18px 0 14px;
          font-size: clamp(34px, 6vw, 76px);
          line-height: 1.04;
          letter-spacing: -2px;
          font-weight: 950;
        }

        .od-hero h1 span {
          display: block;
          background: linear-gradient(90deg, #fff, #c7d2fe, #fde68a);
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
        }

        .od-hero-lead {
          max-width: 720px;
          margin: 0;
          color: rgba(226,232,240,.9);
          font-size: 16px;
          line-height: 2.05;
          font-weight: 750;
        }

        .od-hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
          margin-top: 26px;
        }

        .od-button {
          border: 0;
          cursor: pointer;
          font-family: inherit;
          border-radius: 19px;
          padding: 14px 20px;
          font-size: 13px;
          font-weight: 950;
          transition: .25s ease;
        }

        .od-button:hover {
          transform: translateY(-2px);
        }

        .od-button--primary {
          color: white;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 18px 38px rgba(79,70,229,.32);
        }

        .od-button--dark {
          color: white;
          background: #0f172a;
          box-shadow: 0 16px 34px rgba(15,23,42,.24);
        }

        .od-button--light {
          color: #0f172a;
          background: rgba(255,255,255,.92);
          box-shadow: 0 16px 34px rgba(255,255,255,.12);
        }

        .od-button--ghost {
          color: #334155;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(148,163,184,.26);
        }

        .od-hero-note {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 15px;
          border-radius: 20px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.14);
          color: rgba(226,232,240,.88);
          font-size: 12px;
          font-weight: 850;
        }

        .od-command-card {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 24px;
          min-height: 360px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(18px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
        }

        .od-command-card::before {
          content: "";
          position: absolute;
          width: 270px;
          height: 270px;
          border-radius: 50%;
          left: -90px;
          bottom: -120px;
          background: radial-gradient(circle, rgba(16,185,129,.22), transparent 64%);
        }

        .od-rank {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          position: relative;
          z-index: 1;
          margin-bottom: 18px;
        }

        .od-rank span {
          color: rgba(226,232,240,.72);
          font-size: 11px;
          font-weight: 950;
        }

        .od-rank strong {
          color: white;
          font-size: 18px;
          font-weight: 950;
        }

        .od-main-gauge {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          width: 230px;
          height: 230px;
          margin: 10px auto 18px;
          border-radius: 50%;
          background:
            radial-gradient(circle at center, rgba(15,23,42,.94) 0 58%, transparent 59%),
            conic-gradient(#f59e0b 0 ${progress}%, rgba(255,255,255,.16) ${progress}% 100%);
          box-shadow: 0 24px 70px rgba(0,0,0,.22), inset 0 0 0 1px rgba(255,255,255,.14);
        }

        .od-main-gauge::before {
          content: "";
          position: absolute;
          inset: 18px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.16);
        }

        .od-main-gauge strong {
          font-size: 54px;
          line-height: 1;
          font-weight: 950;
        }

        .od-main-gauge span {
          margin-top: 8px;
          display: block;
          color: rgba(226,232,240,.72);
          font-size: 11px;
          font-weight: 950;
          text-align: center;
        }

        .od-command-mini {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .od-command-mini div {
          padding: 13px;
          border-radius: 20px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.12);
        }

        .od-command-mini span {
          display: block;
          color: rgba(226,232,240,.66);
          font-size: 10px;
          font-weight: 950;
          margin-bottom: 5px;
        }

        .od-command-mini strong {
          color: white;
          font-size: 16px;
          font-weight: 950;
        }

        .od-quote-bar {
          margin: 18px 0;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 20px;
          border-radius: 28px;
          background: rgba(255,255,255,.76);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 18px 55px rgba(15,23,42,.08);
          backdrop-filter: blur(18px);
        }

        .od-quote-bar p {
          margin: 0;
          color: #1e293b;
          font-size: 15px;
          line-height: 1.9;
          font-weight: 900;
        }

        .od-quote-bar span {
          width: 54px;
          height: 54px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          color: white;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          font-weight: 950;
          box-shadow: 0 16px 34px rgba(79,70,229,.22);
        }

        .od-timer-command {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 22px;
          align-items: stretch;
          margin: 18px 0;
          padding: 20px;
          border-radius: 36px;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 22px 70px rgba(15,23,42,.08);
          backdrop-filter: blur(20px);
        }

        .od-timer-orbit {
          position: relative;
          min-height: 315px;
          display: grid;
          place-items: center;
          border-radius: 30px;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 50%, rgba(79,70,229,.16), transparent 58%),
            linear-gradient(145deg, #0f172a, #1e293b);
        }

        .od-timer-orbit::before,
        .od-timer-orbit::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.16);
        }

        .od-timer-orbit::before {
          width: 230px;
          height: 230px;
          animation: odOrbit 7s linear infinite;
        }

        .od-timer-orbit::after {
          width: 285px;
          height: 90px;
          transform: rotate(-18deg);
          animation: odOrbit 11s linear infinite reverse;
        }

        @keyframes odOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .od-live-core {
          position: relative;
          z-index: 1;
          width: 190px;
          height: 190px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 18px;
          background:
            radial-gradient(circle at 40% 32%, rgba(255,255,255,.9), rgba(255,255,255,.18) 18%, transparent 46%),
            conic-gradient(from 0deg, #4f46e5, #7c3aed, #10b981, #f59e0b, #4f46e5);
          box-shadow: 0 26px 70px rgba(79,70,229,.28);
        }

        .od-live-core--idle {
          filter: grayscale(.45);
        }

        .od-live-core--paused {
          filter: grayscale(.82);
        }

        .od-live-core span {
          display: block;
          color: rgba(255,255,255,.86);
          font-size: 11px;
          font-weight: 950;
        }

        .od-live-core strong {
          display: block;
          margin: 8px 0;
          color: white;
          font-size: 34px;
          font-weight: 950;
          text-shadow: 0 10px 24px rgba(15,23,42,.32);
        }

        .od-live-core small {
          color: rgba(255,255,255,.82);
          font-size: 10px;
          font-weight: 900;
        }

        .od-timer-content {
          padding: 10px 6px;
        }

        .od-section-kicker {
          display: inline-flex;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          color: #3730a3;
          background: rgba(79,70,229,.1);
          font-size: 11px;
          font-weight: 950;
          margin-bottom: 10px;
        }

        .od-timer-content h2,
        .od-section-head h2 {
          margin: 0;
          color: #0f172a;
          font-size: clamp(24px, 3vw, 38px);
          line-height: 1.25;
          letter-spacing: -.8px;
          font-weight: 950;
        }

        .od-timer-content p,
        .od-section-head p {
          margin: 12px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.9;
          font-weight: 750;
        }

        .od-timer-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 18px 0;
        }

        .od-stat-card {
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          min-height: 126px;
          padding: 15px;
          border-radius: 24px;
          background: white;
          border: 1px solid rgba(148,163,184,.18);
          box-shadow: 0 14px 35px rgba(15,23,42,.06);
        }

        .od-stat-card::before {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          left: -36px;
          bottom: -48px;
          opacity: .16;
          background: currentColor;
        }

        .od-stat-card--indigo { color: #4f46e5; }
        .od-stat-card--violet { color: #7c3aed; }
        .od-stat-card--emerald { color: #10b981; }
        .od-stat-card--amber { color: #f59e0b; }
        .od-stat-card--slate { color: #334155; }
        .od-stat-card--rose { color: #e11d48; }

        .od-stat-card span {
          display: block;
          color: #64748b;
          font-size: 10px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .od-stat-card strong {
          display: block;
          color: #0f172a;
          font-size: 21px;
          font-weight: 950;
          line-height: 1.25;
        }

        .od-stat-card small {
          display: block;
          margin-top: 8px;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 850;
          line-height: 1.5;
        }

        .od-stat-card i {
          font-style: normal;
          font-size: 25px;
        }

        .od-progress-line {
          padding: 15px;
          border-radius: 22px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.16);
        }

        .od-progress-line > div:first-child {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 9px;
        }

        .od-progress-line span {
          color: #64748b;
          font-size: 11px;
          font-weight: 950;
        }

        .od-progress-line strong {
          color: #0f172a;
          font-size: 14px;
          font-weight: 950;
        }

        .od-progress-track {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(148,163,184,.18);
        }

        .od-progress-track b {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #4f46e5, #7c3aed, #f59e0b);
          box-shadow: 0 8px 24px rgba(79,70,229,.22);
        }

        .od-progress-line small {
          display: block;
          margin-top: 8px;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
        }

        .od-timer-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .od-section-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: end;
          margin: 28px 0 16px;
        }

        .od-section-head small {
          color: #64748b;
          font-size: 12px;
          font-weight: 900;
        }

        .od-feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .od-feature-card {
          position: relative;
          min-height: 230px;
          overflow: hidden;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          border: 0;
          padding: 20px;
          border-radius: 30px;
          background: rgba(255,255,255,.84);
          border: 1px solid rgba(255,255,255,.95);
          box-shadow: 0 18px 48px rgba(15,23,42,.08);
          transition: .28s ease;
        }

        .od-feature-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 28px 70px rgba(79,70,229,.14);
        }

        .od-feature-card::before {
          content: "";
          position: absolute;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          left: -70px;
          bottom: -90px;
          opacity: .14;
          background: currentColor;
        }

        .od-feature-card--indigo { color: #4f46e5; }
        .od-feature-card--violet { color: #7c3aed; }
        .od-feature-card--emerald { color: #10b981; }
        .od-feature-card--amber { color: #f59e0b; }
        .od-feature-card--slate { color: #334155; }
        .od-feature-card--rose { color: #e11d48; }

        .od-feature-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .od-feature-badge {
          display: inline-flex;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(15,23,42,.06);
          color: #475569;
          font-size: 10px;
          font-weight: 950;
        }

        .od-feature-icon {
          width: 54px;
          height: 54px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          background: currentColor;
          color: white;
          font-size: 22px;
          font-weight: 950;
          box-shadow: 0 14px 30px rgba(15,23,42,.1);
        }

        .od-feature-card h3 {
          position: relative;
          z-index: 1;
          margin: 24px 0 10px;
          color: #0f172a;
          font-size: 22px;
          line-height: 1.35;
          font-weight: 950;
        }

        .od-feature-card p {
          position: relative;
          z-index: 1;
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.9;
          font-weight: 750;
        }

        .od-feature-bottom {
          position: absolute;
          z-index: 1;
          right: 20px;
          left: 20px;
          bottom: 18px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .od-feature-bottom span {
          color: #64748b;
          font-size: 11px;
          font-weight: 950;
        }

        .od-feature-bottom b {
          color: currentColor;
          font-size: 11px;
          font-weight: 950;
        }

        .od-lab-strip {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 16px;
        }

        .od-lab-card {
          padding: 24px;
          border-radius: 32px;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 18px 52px rgba(15,23,42,.07);
          backdrop-filter: blur(18px);
        }

        .od-lab-card h3 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: 22px;
          line-height: 1.35;
          font-weight: 950;
        }

        .od-lab-card p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.9;
          font-weight: 750;
        }

        .od-milestones {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .od-milestone {
          padding: 13px 10px;
          border-radius: 20px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.16);
          text-align: center;
        }

        .od-milestone.is-done {
          background: #ecfdf5;
          border-color: rgba(16,185,129,.22);
        }

        .od-milestone strong {
          display: block;
          color: #0f172a;
          font-size: 13px;
          font-weight: 950;
        }

        .od-milestone span {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 10px;
          font-weight: 850;
        }

        @media (max-width: 1050px) {
          .od-hero-inner,
          .od-timer-command,
          .od-lab-strip {
            grid-template-columns: 1fr;
          }

          .od-feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .od-timer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .od-home-v2 {
            padding: 16px 10px 48px;
          }

          .od-hero {
            border-radius: 30px;
            padding: 24px;
          }

          .od-command-card {
            border-radius: 28px;
          }

          .od-main-gauge {
            width: 200px;
            height: 200px;
          }

          .od-feature-grid,
          .od-timer-grid,
          .od-milestones {
            grid-template-columns: 1fr;
          }

          .od-section-head,
          .od-quote-bar {
            grid-template-columns: 1fr;
          }

          .od-command-mini {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="od-home-wrap">
        <header className="od-hero">
          <div className="od-hero-inner">
            <div>
              <div className="od-chip">
                <i />
                مرحبًا {userName || "زميل المهنة"} · منصة هندسة التطوير التنظيمي
              </div>

              <h1>
                إتقان هندسة
                <span>التطوير التنظيمي</span>
              </h1>

              <p className="od-hero-lead">
                منصة تعليمية احترافية تجمع رحلة معرفية من ستة أشهر، رادار أداء، محاكاة قرار، موجهًا ذكيًا، وسجل إتقان يوثق أيامك وساعاتك الفعلية داخل المنصة.
              </p>

              <div className="od-hero-actions">
                <button type="button" className="od-button od-button--primary" onClick={() => setActivePage("journey")}>
                  ابدأ رحلة التعلّم
                </button>

                <button type="button" className="od-button od-button--light" onClick={() => setActivePage("radar")}>
                  افحص رادار الأداء
                </button>

                <div className="od-hero-note">
                  ⏱️ وقتك المحتسب الآن: <strong>{formatDuration(timer.totalSeconds, true)}</strong>
                </div>
              </div>
            </div>

            <aside className="od-command-card">
              <div className="od-rank">
                <div>
                  <span>رتبتك المعرفية الحالية</span>
                  <strong>{learningRank}</strong>
                </div>
                <div>
                  <span>سلسلة التعلم</span>
                  <strong>{timer.streakDays} يوم</strong>
                </div>
              </div>

              <div className="od-main-gauge">
                <div>
                  <strong>{progress}%</strong>
                  <span>إنجاز الرحلة التعليمية</span>
                </div>
              </div>

              <div className="od-command-mini">
                <div>
                  <span>أيام مكتملة</span>
                  <strong>{safeCompletedDays} / {safeTotalDays}</strong>
                </div>
                <div>
                  <span>ساعات محتسبة</span>
                  <strong>{timer.completedHours} ساعة</strong>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <section className="od-quote-bar">
          <p>“{quote}”</p>
          <span>RA</span>
        </section>

        <TimerCommandCenter
          timer={timer}
          onPause={pause}
          onResume={resume}
          onResetToday={resetToday}
        />

        <div className="od-section-head">
          <div>
            <div className="od-section-kicker">مركز التحكم</div>
            <h2>أقسام المنصة</h2>
            <p>كل قسم ليس صفحة عادية؛ بل أداة مختلفة لبناء عقلية ممارس تطوير تنظيمي محترف.</p>
          </div>
          <small>اختر بوابتك التالية</small>
        </div>

        <section className="od-feature-grid">
          {cards.map((card) => (
            <FeatureCard
              key={card.page}
              card={card}
              metric={cardMetric(card.page)}
              onOpen={() => setActivePage(card.page)}
            />
          ))}
        </section>

        <section className="od-lab-strip">
          <div className="od-lab-card">
            <div className="od-section-kicker">مؤشرات الإتقان</div>
            <h3>المنصة لا تقيس الحضور فقط، بل تبني أثرًا قابلًا للتوثيق</h3>
            <p>
              العداد يحسب الوقت النشط، الرحلة تقيس الأيام المكتملة، ووثيقة الإتقان تجمع الساعات والإنجازات. الهدف أن يصبح التعلم قابلًا للقراءة، لا مجرد تصفح عابر.
            </p>

            <div className="od-milestones">
              {[1, 5, 10, 25, 50].map((hour) => (
                <div key={hour} className={`od-milestone ${timer.completedHours >= hour ? "is-done" : ""}`}>
                  <strong>{hour} س</strong>
                  <span>{timer.completedHours >= hour ? "مكتمل" : "قادم"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="od-lab-card">
            <div className="od-section-kicker">اقتراح ذكي</div>
            <h3>ماذا تفعل الآن؟</h3>
            <p>
              {progress < 10
                ? "ابدأ من الرحلة التعليمية ولا تتشتت بين الأقسام. ابنِ الأساس أولًا."
                : progress < 60
                  ? "وازن بين الدروس ورادار الأداء. اقرأ، ثم اختبر تفكيرك بالمواقف."
                  : "اقتربت من مرحلة الإتقان. ركّز على المحاكاة ووثيقة الإتقان ومشروعك التطبيقي."}
            </p>

            <div className="od-timer-actions">
              <button type="button" className="od-button od-button--primary" onClick={() => setActivePage("journey")}>
                متابعة الرحلة
              </button>

              <button type="button" className="od-button od-button--ghost" onClick={() => setActivePage("mastery")}>
                فتح وثيقة الإتقان
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}