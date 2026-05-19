import { useEffect, useMemo, useState } from "react";
import { COURSE_TOTALS } from "./data/courseContent";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";
import { fetchUserProgress } from "./lib/progressService";
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

export default function App() {
  const [session, setSession] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("od_demo_name") || "");
  const [activePage, setActivePage] = useState("home");
  const [progressRows, setProgressRows] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [booting, setBooting] = useState(true);
  const [notice, setNotice] = useState("");

  const completedDays = useMemo(() => {
    const unique = new Set(progressRows.filter((row) => row.status === "completed").map(progressKey));
    return unique.size;
  }, [progressRows]);

  const authenticated = Boolean(session?.user || demoMode || (!isSupabaseConfigured && userName));

  async function loadProgress() {
    setLoadingProgress(true);
    try {
      const rows = await fetchUserProgress();
      setProgressRows(rows);
    } catch (error) {
      setNotice(error.message || "تعذر جلب تقدم الطالب.");
    } finally {
      setLoadingProgress(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (mounted) {
            setSession(data.session);
            if (data.session?.user) setUserName(getDisplayName(data.session));
          }
        } else {
          const localName = localStorage.getItem("od_demo_name");
          if (localName && mounted) {
            setUserName(localName);
            setDemoMode(true);
          }
        }

        await loadProgress();
      } finally {
        if (mounted) setBooting(false);
      }
    }

    boot();

    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        setSession(nextSession);
        if (nextSession?.user) setUserName(getDisplayName(nextSession));
        await loadProgress();
      });

      return () => {
        mounted = false;
        data.subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  function handleEnter({ session: nextSession, name, demo }) {
    if (nextSession) setSession(nextSession);
    if (name) setUserName(name);
    if (demo) setDemoMode(true);
    setActivePage("home");
    loadProgress();
  }

  async function handleSignOut() {
    if (isSupabaseConfigured && supabase && session) await supabase.auth.signOut();
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
    return <AuthGate onEnter={handleEnter} />;
  }

  const displayName = getDisplayName(session, userName);

  return (
    <div className="site-frame">
      <header className="site-header">
        <div className="brand">
          <div className="brand-mark">RA</div>
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
      {activePage === "mastery" && <MasteryCertificate userName={displayName} completedDays={completedDays} />}
      {activePage === "about" && <AboutRayan />}

      <footer className="site-footer">
        <div>SHRM-SCP · SPHRi · CPTD · PMP</div>
        <span>Mastering OD Engineering Academy © 2026</span>
      </footer>
    </div>
  );
}
