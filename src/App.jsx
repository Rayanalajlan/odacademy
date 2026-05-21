import { useEffect, useMemo, useState } from "react";
import { COURSE_TOTALS } from "./data/courseContent";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";
import { loadUserProgress } from "./lib/progressService";
import AuthGate from "./components/AuthGate";
import Home from "./components/Home";
import CourseJourney from "./components/CourseJourney";
import RadarAssessment from "./components/RadarAssessment";
import SimulationLab from "./components/SimulationLab";
import AiMentor from "./components/AiMentor";
import MasteryCertificate from "./components/MasteryCertificate";
import AboutRayan from "./components/AboutRayan";

const pages = [
  { id: "home", label: "الرئيسية" },
  { id: "journey", label: "رحلتك التعليمية" },
  { id: "radar", label: "رادار الأداء" },
  { id: "simulation", label: "المحاكاة" },
  { id: "ai-mentor", label: "الموجه الذكي" },
  { id: "mastery", label: "وثيقة الإتقان" },
  { id: "about", label: "عن ريان" }
];

const BOOT_TIMEOUT_MS = 8000;
const BRAND_LOGO_SRC = "/rayan-logo.png";

function progressKey(row) {
  return `${row.month_index}-${row.week_index}-${row.day_index}`;
}

function getDisplayName(session, fallbackName) {
  return (
    fallbackName ||
    session?.user?.user_metadata?.full_name ||
    session?.user?.email ||
    localStorage.getItem("od_demo_name") ||
    "زميل المهنة"
  );
}

function withTimeout(promise, label, timeoutMs = BOOT_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(
        () => reject(new Error(`${label} استغرق وقتًا أطول من المتوقع.`)),
        timeoutMs
      );
    })
  ]);
}

export default function App() {
  const [session, setSession] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [userName, setUserName] = useState(
    localStorage.getItem("od_demo_name") || ""
  );
  const [activePage, setActivePage] = useState("home");
  const [progressRows, setProgressRows] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [booting, setBooting] = useState(true);
  const [notice, setNotice] = useState("");

  const completedDays = useMemo(() => {
    const unique = new Set(
      progressRows
        .filter((row) => row.status === "completed")
        .map(progressKey)
    );

    return unique.size;
  }, [progressRows]);

  const authenticated = Boolean(
    session?.user || demoMode || (!isSupabaseConfigured && userName)
  );

  async function loadProgressSafely({ showLoader = true } = {}) {
    if (showLoader) setLoadingProgress(true);

    try {
      const rows = await withTimeout(loadUserProgress(), "تحميل تقدمك");
      setProgressRows(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.warn("تعذر تحميل التقدم:", error);
      setNotice(
        "تعذر تحميل التقدم من السحابة الآن. سيعمل الموقع مؤقتًا من التخزين المحلي."
      );
    } finally {
      if (showLoader) setLoadingProgress(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await withTimeout(
            supabase.auth.getSession(),
            "فحص جلسة الدخول"
          );

          if (error) {
            console.warn("تعذر فحص جلسة Supabase:", error.message);
          }

          if (mounted) {
            setSession(data?.session || null);

            if (data?.session?.user) {
              setUserName(getDisplayName(data.session));
            }
          }
        } else {
          const localName = localStorage.getItem("od_demo_name");

          if (localName && mounted) {
            setUserName(localName);
            setDemoMode(true);
          }
        }

        if (mounted) {
          await loadProgressSafely({ showLoader: false });
        }
      } catch (error) {
        console.warn("تعذر تجهيز التطبيق:", error);

        if (mounted) {
          setNotice(
            "تم تجاوز فحص الدخول لأنه استغرق وقتًا طويلًا. إذا لم تظهر بياناتك، حدّث الصفحة مرة واحدة."
          );
        }
      } finally {
        if (mounted) setBooting(false);
      }
    }

    boot();

    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!mounted) return;

        setSession(nextSession || null);

        if (nextSession?.user) {
          setUserName(getDisplayName(nextSession));
        }

        loadProgressSafely({ showLoader: true });
      });

      return () => {
        mounted = false;
        data?.subscription?.unsubscribe?.();
      };
    }

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEnter({ session: nextSession, name, demo } = {}) {
    if (nextSession) setSession(nextSession);

    const nextName = name || getDisplayName(nextSession);

    if (nextName) setUserName(nextName);

    if (demo) {
      setDemoMode(true);
      localStorage.setItem("od_demo_name", nextName || "زميل المهنة");
    }

    setActivePage("home");
    setNotice("");
    loadProgressSafely({ showLoader: true });
  }

  function handleAuthenticatedFromOldAuthGate(nextSession) {
    handleEnter({
      session: nextSession,
      name: getDisplayName(nextSession)
    });
  }

  async function handleSignOut() {
    try {
      if (isSupabaseConfigured && supabase && session) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.warn("تعذر تسجيل الخروج من Supabase:", error);
    }

    setSession(null);
    setDemoMode(false);
    localStorage.removeItem("od_demo_name");
    setUserName("");
    setActivePage("home");
  }

  function navigate(pageId) {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (booting) {
    return <div className="boot-screen">جارٍ تجهيز مختبر التطوير التنظيمي...</div>;
  }

  if (!authenticated) {
    return (
      <AuthGate
        onEnter={handleEnter}
        onAuthenticated={handleAuthenticatedFromOldAuthGate}
      />
    );
  }

  const displayName = getDisplayName(session, userName);

  return (
    <div className="site-frame">
      <style>{`
        .brand .brand-mark,
        .brand .brand-mark.image-mark {
          width: 52px !important;
          height: 52px !important;
          min-width: 52px !important;
          max-width: 52px !important;
          min-height: 52px !important;
          max-height: 52px !important;
          flex: 0 0 52px !important;
          border-radius: 18px !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #ffffff !important;
          padding: 4px !important;
          box-sizing: border-box !important;
        }

        .brand-logo-image,
        .brand .brand-mark img {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
          display: block !important;
        }

        .od-feature-icon.od-feature-icon--logo,
        .od-quote-logo,
        .logo-badge,
        .mini-badge.logo-badge,
        .feature-icon.logo-badge,
        .card-icon.logo-badge {
          width: 58px !important;
          height: 58px !important;
          min-width: 58px !important;
          max-width: 58px !important;
          min-height: 58px !important;
          max-height: 58px !important;
          flex: 0 0 58px !important;
          border-radius: 20px !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #ffffff !important;
          padding: 5px !important;
          box-sizing: border-box !important;
        }

        .od-feature-icon.od-feature-icon--logo img,
        .od-quote-logo img,
        .logo-badge img,
        .mini-badge-logo {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
          display: block !important;
        }
      `}</style>

      <header className="site-header">
        <div className="brand">
          <div className="brand-mark image-mark">
            <img
              src={BRAND_LOGO_SRC}
              alt="شعار ريان العجلان"
              className="brand-logo-image"
            />
          </div>

          <div>
            <strong>OD Engineering</strong>
            <span>إتقان التطوير التنظيمي</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="أقسام المنصة">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              className={activePage === page.id ? "active" : ""}
              onClick={() => navigate(page.id)}
            >
              {page.label}
            </button>
          ))}
        </nav>

        <button type="button" className="logout-button" onClick={handleSignOut}>
          خروج
        </button>
      </header>

      {notice && <div className="global-notice">{notice}</div>}

      {activePage === "home" && (
        <Home
          userName={displayName}
          setActivePage={navigate}
          completedDays={completedDays}
          totalDays={COURSE_TOTALS.totalDays}
        />
      )}

      {activePage === "journey" && (
        <CourseJourney
          progressRows={progressRows}
          setProgressRows={setProgressRows}
          loading={loadingProgress}
        />
      )}

      {activePage === "radar" && <RadarAssessment setActivePage={navigate} />}
      {activePage === "simulation" && <SimulationLab />}
      {activePage === "ai-mentor" && <AiMentor />}

      {activePage === "mastery" && (
     <MasteryCertificate
  userName={displayName}
  completedDays={completedDays}
  setActivePage={navigate}
/>
      )}

      {activePage === "about" && <AboutRayan />}

      <footer className="site-footer">
        <div>
          صنع بواسطة ريان العجلان كأثر معرفي هادئ؛ لمن يبحث عن المعنى خلف
          السلوك، والنظام خلف المشكلة.
        </div>
        <span>© 2026 — جميع الحقوق محفوظة</span>
      </footer>
    </div>
  );
}
