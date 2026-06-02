import { Fragment, lazy, Suspense, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";
import * as progressService from "./lib/progressService";
import AuthGate from "./components/AuthGate";
import Home from "./components/Home";
import LearnerProfileCenter from "./components/LearnerProfileCenter";
import { sendWelcomeEmailOnce } from "./lib/welcomeEmailService";
import LearningTimeTracker from "./components/LearningTimeTracker";
import NotificationsCenter from "./components/NotificationsCenter";
import { maybeCreateMilestoneNotification } from "./lib/notificationsService";
import { syncProgressBadge } from "./lib/badgesService";
import { isCurrentUserAdmin } from "./lib/adminDashboardService";
import OnboardingFlow from "./components/OnboardingFlow";
import MobileNavigation from "./components/MobileNavigation";
import ThemeToggle from "./components/ThemeToggle";
import EducationalToolsMenu from "./components/EducationalToolsMenu";
import SiteLogo from "./components/SiteLogo";
import BrandMeta from "./components/BrandMeta";
import ExperienceDesignSkin from "./components/ExperienceDesignSkin";
import {
  completeLocalOnboarding,
  completeOnboarding,
  getLocalOnboardingState,
  getOnboardingState
} from "./lib/onboardingService";

const TOTAL_JOURNEY_DAYS = 180;

const CourseJourney = lazy(() => import("./components/CourseJourney"));
const RadarAssessment = lazy(() => import("./components/RadarAssessment"));
const SimulationLab = lazy(() => import("./components/SimulationLab"));
const AiMentor = lazy(() => import("./components/AiMentor"));
const LearningROICalculator = lazy(() => import("./components/LearningROICalculator"));
const LearningPortfolio = lazy(() => import("./components/LearningPortfolio"));
const MasteryCertificate = lazy(() => import("./components/MasteryCertificate"));
const AboutRayan = lazy(() => import("./components/AboutRayan"));
const VerifyCertificate = lazy(() => import("./components/VerifyCertificate"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));

const pages = [
  { id: "home", label: "الرئيسية" },
  { id: "portfolio", label: "ملفي التعليمي" },
  { id: "journey", label: "رحلتك التعليمية" },
  { id: "mastery", label: "وثيقة الإتقان" },
  { id: "about", label: "عن ريان" }
];

const educationalToolPages = [
  {
    id: "radar",
    label: "رادار الأداء",
    description: "قياس جداراتك وبصمتك المهنية."
  },
  {
    id: "simulation",
    label: "المحاكاة",
    description: "اختبر قراراتك في مواقف تنظيمية."
  },
  {
    id: "ai-mentor",
    label: "الموجه الذكي",
    description: "اسأل واطلب تحليلًا أو قالبًا عمليًا."
  },
  {
    id: "learning-roi",
    label: "حاسبة العائد من التعلم",
    description: "حوّل التقدم إلى أثر ووقت وقيمة."
  }
];

const BOOT_TIMEOUT_MS = 8000;
const BRAND_LOGO_SRC = "/brand/icon.svg";


function getVerificationSlugFromLocation() {
  if (typeof window === "undefined") return "";

  const path = window.location.pathname || "";

  if (path.startsWith("/verify/")) {
    return decodeURIComponent(path.replace("/verify/", "").split("/")[0] || "");
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("verify") || "";
}

function isPasswordRecoveryRequest() {
  if (typeof window === "undefined") return false;

  const path = window.location.pathname || "";
  const search = window.location.search || "";
  const hash = window.location.hash || "";

  return (
    path === "/reset-password" ||
    search.includes("reset_password=true") ||
    search.includes("type=recovery") ||
    hash.includes("type=recovery") ||
    hash.includes("access_token=")
  );
}

function progressKey(row) {
  return `${row.month_index}-${row.week_index}-${row.day_index}`;
}

function getDisplayName(session, fallbackName) {
  return (
    fallbackName ||
    session?.user?.user_metadata?.full_name ||
    session?.user?.email ||
    localStorage.getItem("od_demo_name") ||
    "متدرب"
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

async function readProgressRows() {
  const loader =
    progressService.loadUserProgress ||
    progressService.fetchUserProgress;

  if (typeof loader !== "function") {
    console.warn("لم يتم العثور على دالة تحميل التقدم داخل progressService.");
    return [];
  }

  return loader();
}

function PageLoader({ label = "جارٍ تحميل القسم..." }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <SiteLogo variant="icon" context="loader" englishAlt />
      <span>{label}</span>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [userName, setUserName] = useState(
    localStorage.getItem("od_demo_name") || ""
  );
  const [activePage, setActivePage] = useState("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [progressRows, setProgressRows] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [booting, setBooting] = useState(true);
  const [notice, setNotice] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [resumeJourneyRequest, setResumeJourneyRequest] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const verificationSlug = getVerificationSlugFromLocation();
  const passwordRecoveryMode = isPasswordRecoveryRequest();

  const completedDays = useMemo(() => {
    const unique = new Set(
      progressRows
        .filter((row) => row.status === "completed")
        .map(progressKey)
    );

    return unique.size;
  }, [progressRows]);

  const totalJourneyDays = TOTAL_JOURNEY_DAYS;

  const authenticated = Boolean(
    session?.user || demoMode || (!isSupabaseConfigured && userName)
  );

  async function loadProgressSafely({ showLoader = true } = {}) {
    if (showLoader) setLoadingProgress(true);

    try {
      // Phase 38:
      // لا نضع timeout قصيرًا على تحميل التقدم؛ لأن هذا كان سبب ظهور رسالة
      // "سيعمل الموقع من التخزين المحلي" رغم أن Supabase قد يكون فقط أبطأ من 8 ثوانٍ.
      // خدمة progressService نفسها تعيد المحاولة وتزامن المحلي إلى السحابة.
      const rows = await readProgressRows();
      setProgressRows(Array.isArray(rows) ? rows : []);
      setNotice((current) =>
        current === "تعذر تحميل التقدم من السحابة الآن. سيعمل الموقع مؤقتًا من التخزين المحلي."
          ? ""
          : current
      );
    } catch (error) {
      console.warn("تعذر تحميل التقدم السحابي:", error);

      setNotice(
        "تعذر الاتصال بقاعدة التقدم السحابية. لن يتم احتساب أي تقدم جديد حتى يعود الاتصال أو تُراجع إعدادات Supabase."
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
        if (mounted) {
          setBooting(false);
        }
      }
    }

    boot();

    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!mounted) return;

          setSession(nextSession || null);

          if (nextSession?.user) {
            setUserName(getDisplayName(nextSession));
          }

          loadProgressSafely({ showLoader: true });
        }
      );

      return () => {
        mounted = false;
        data?.subscription?.unsubscribe?.();
      };
    }

    return () => {
      mounted = false;
    };

    // لا نضيف loadProgressSafely هنا حتى لا يدخل التطبيق في حلقة تحميل متكررة.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (!session?.user?.id) return;

    sendWelcomeEmailOnce().catch((error) => {
      console.warn("تعذر تشغيل إيميل الترحيب:", error);
    });
  }, [session?.user?.id]);


  useEffect(() => {
    if (!session?.user?.id) return;

    syncProgressBadge(completedDays).catch((error) => {
      console.warn("تعذر مزامنة الشارة:", error);
    });

    maybeCreateMilestoneNotification(completedDays).catch((error) => {
      console.warn("تعذر إنشاء إشعار المرحلة:", error);
    });
  }, [session?.user?.id, completedDays]);



  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      if (!session?.user?.id || demoMode) {
        setIsAdmin(false);
        return;
      }

      const allowed = await isCurrentUserAdmin();

      if (mounted) {
        setIsAdmin(Boolean(allowed));
      }
    }

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [session?.user?.id, demoMode]);

  useEffect(() => {
    if (booting || !authenticated) {
      setShowOnboarding(false);
      return;
    }

    let mounted = true;

    async function checkOnboarding() {
      setCheckingOnboarding(true);

      try {
        const localKey = session?.user?.id || (demoMode ? "demo" : "guest");
        const localState = getLocalOnboardingState(localKey);
        const cloudState =
          demoMode || !session?.user?.id
            ? null
            : await getOnboardingState();

        const state = cloudState || localState;

        if (mounted) {
          setShowOnboarding(!state?.has_completed);
        }
      } catch (error) {
        console.warn("تعذر قراءة حالة الترحيب الذكي:", error);

        if (mounted) {
          const localKey = session?.user?.id || (demoMode ? "demo" : "guest");
          const localState = getLocalOnboardingState(localKey);
          setShowOnboarding(!localState?.has_completed);
        }
      } finally {
        if (mounted) {
          setCheckingOnboarding(false);
        }
      }
    }

    checkOnboarding();

    return () => {
      mounted = false;
    };
  }, [authenticated, booting, demoMode, session?.user?.id]);

  function handleEnter({ session: nextSession, name, demo } = {}) {
    if (nextSession) {
      setSession(nextSession);
    }

    const nextName = name || getDisplayName(nextSession);

    if (nextName) {
      setUserName(nextName);
    }

    if (demo) {
      setDemoMode(true);
      localStorage.setItem("od_demo_name", nextName || "متدرب");
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

    setMobileNavOpen(false);
    setSession(null);
    setDemoMode(false);
    localStorage.removeItem("od_demo_name");
    setUserName("");
    setActivePage("home");
    setIsAdmin(false);
  }

  function navigate(pageId) {
    setMobileNavOpen(false);
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resumeJourneyFromLastPoint() {
    setMobileNavOpen(false);
    setActivePage("journey");
    setResumeJourneyRequest((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleOnboardingComplete(preferredStart = "later") {
    const normalizedStart = preferredStart || "later";
    const localKey = session?.user?.id || (demoMode ? "demo" : "guest");

    // نحفظ الاختيار محليًا أولًا حتى لا تظهر شاشة الترحيب مرة أخرى
    // حتى لو تعذر الحفظ السحابي مؤقتًا.
    completeLocalOnboarding({
      userKey: localKey,
      preferredStart: normalizedStart
    });

    if (!demoMode && session?.user?.id) {
      completeOnboarding({
        preferredStart: normalizedStart
      }).catch((error) => {
        // لا نزعج المستخدم برسالة عامة؛ التخزين المحلي يكفي لمنع تكرار الشاشة.
        console.warn("تعذر حفظ حالة الترحيب الذكي في السحابة:", error);
      });
    }

    setShowOnboarding(false);

    if (normalizedStart === "pre-assessment") {
      navigate("radar");
      return;
    }

    if (normalizedStart === "journey") {
      resumeJourneyFromLastPoint();
      return;
    }

    if (normalizedStart === "home") {
      navigate("home");
    }
  }


  if (verificationSlug) {
    return (
      <>
        <BrandMeta />
        <ExperienceDesignSkin />
        <Suspense fallback={<PageLoader label="جارٍ فتح صفحة التحقق..." />}>
          <VerifyCertificate slug={verificationSlug} />
        </Suspense>
      </>
    );
  }

  if (passwordRecoveryMode) {
    return (
      <AuthGate
        recoveryMode
        onEnter={handleEnter}
        onAuthenticated={handleAuthenticatedFromOldAuthGate}
        onPasswordUpdated={handleAuthenticatedFromOldAuthGate}
      />
    );
  }

  if (booting) {
    return (
      <>
        <BrandMeta />
        <ExperienceDesignSkin />
        <div className="boot-screen">
          <SiteLogo variant="icon" context="loader" englishAlt />
          <span>جارٍ تجهيز مختبر التطوير التنظيمي...</span>
        </div>
      </>
    );
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
  const visiblePages = isAdmin
    ? [...pages, { id: "admin", label: "لوحة الإدارة" }]
    : pages;

  return (
    <div className="site-frame">
      <BrandMeta />
      <ExperienceDesignSkin />
      <LearningTimeTracker activePage={activePage} />
      <style>{`
        /*
          إصلاح حجم الشعار في الهيدر وبعض البطاقات الصغيرة.
          لا يؤثر على شعار قسم "عن ريان" الكبير لأنه يستخدم ar-logo-shell.
        */


        .brand.brand--munsaqah {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 0;
        }

        .site-header .munsaqah-logo--header {
          max-width: min(220px, 34vw);
        }

        .site-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }

        .site-footer-brand {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .boot-screen {
          display: grid;
          place-items: center;
          gap: 12px;
          text-align: center;
        }

        .mobile-menu-button {
          display: none;
          border: 0;
          cursor: pointer;
          min-height: 44px;
          border-radius: 16px;
          padding: 0 14px;
          color: #ffffff;
          background: linear-gradient(135deg, #4f46e5, #312e81);
          font-family: inherit;
          font-size: 13px;
          font-weight: 950;
          box-shadow: 0 14px 30px rgba(79,70,229,.20);
        }

        .mobile-menu-button span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .mobile-menu-button span::before {
          content: "☰";
          font-size: 18px;
          line-height: 1;
        }

        @media (max-width: 980px) {
          .site-header {
            position: sticky;
            top: 0;
            z-index: 70;
            gap: 10px;
            backdrop-filter: blur(16px);
          }

          .main-nav {
            display: none !important;
          }

          .mobile-menu-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .site-header > .logout-button {
            display: none !important;
          }

          .site-header .brand {
            min-width: 0;
          }

          .site-header .brand strong,
          .site-header .brand span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 170px;
          }
        }

        .page-loader {
          width: min(1180px, calc(100% - 28px));
          margin: 18px auto;
          min-height: 120px;
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #334155;
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.10), transparent 35%),
            #ffffff;
          border: 1px solid rgba(148,163,184,.18);
          box-shadow: 0 16px 42px rgba(15,23,42,.06);
          font-weight: 900;
        }

        .page-loader-dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: #4f46e5;
          box-shadow: 0 0 0 0 rgba(79,70,229,.40);
          animation: odPulse 1.2s infinite;
        }

        @keyframes odPulse {
          0% { transform: scale(.88); box-shadow: 0 0 0 0 rgba(79,70,229,.40); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(79,70,229,0); }
          100% { transform: scale(.88); box-shadow: 0 0 0 0 rgba(79,70,229,0); }
        }

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
        <div className="brand brand--munsaqah" aria-label="منسقة">
          <SiteLogo variant="horizontal" context="header" />
        </div>

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={mobileNavOpen ? "إغلاق قائمة الجوال" : "فتح قائمة الجوال"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          <span>{mobileNavOpen ? "إغلاق" : "القائمة"}</span>
        </button>

        <nav className="main-nav" aria-label="أقسام المنصة">
          {visiblePages.map((page) => (
            <Fragment key={page.id}>
              {page.id === "mastery" && (
                <EducationalToolsMenu
                  toolPages={educationalToolPages}
                  activePage={activePage}
                  onNavigate={navigate}
                />
              )}

              <button
                type="button"
                className={activePage === page.id ? "active" : ""}
                onClick={() => navigate(page.id)}
              >
                {page.label}
              </button>
            </Fragment>
          ))}
        </nav>

        <ThemeToggle />

        <NotificationsCenter setActivePage={navigate} />

        <button
          type="button"
          className="logout-button"
          onClick={handleSignOut}
        >
          خروج
        </button>
      </header>

      <MobileNavigation
        open={mobileNavOpen}
        pages={visiblePages}
        toolPages={educationalToolPages}
        activePage={activePage}
        userName={displayName}
        completedDays={completedDays}
        totalDays={totalJourneyDays}
        onNavigate={navigate}
        onClose={() => setMobileNavOpen(false)}
        onResumeJourney={resumeJourneyFromLastPoint}
        onSignOut={handleSignOut}
      />

      {notice && <div className="global-notice">{notice}</div>}

      <LearnerProfileCenter
        session={session}
        userName={displayName}
        completedDays={completedDays}
        totalDays={totalJourneyDays}
        setActivePage={navigate}
        onResumeJourney={resumeJourneyFromLastPoint}
        onSignOut={handleSignOut}
      />

      {showOnboarding && (
        <OnboardingFlow
          userName={displayName}
          completedDays={completedDays}
          totalDays={totalJourneyDays}
          loading={checkingOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}

      {activePage === "home" && (
        <Home
          userName={displayName}
          setActivePage={navigate}
          completedDays={completedDays}
          totalDays={totalJourneyDays}
        />
      )}

      <Suspense fallback={<PageLoader />}>
        {activePage === "journey" && (
          <CourseJourney
            progressRows={progressRows}
            setProgressRows={setProgressRows}
            loading={loadingProgress}
            resumeRequest={resumeJourneyRequest}
          />
        )}

        {activePage === "radar" && <RadarAssessment setActivePage={navigate} />}

        {activePage === "simulation" && <SimulationLab />}

        {activePage === "ai-mentor" && <AiMentor />}

        {activePage === "learning-roi" && (
          <LearningROICalculator
            completedDays={completedDays}
            totalDays={totalJourneyDays}
          />
        )}

        {activePage === "portfolio" && (
          <LearningPortfolio
            userName={displayName}
            completedDays={completedDays}
            totalDays={totalJourneyDays}
            setActivePage={navigate}
            onResumeJourney={resumeJourneyFromLastPoint}
          />
        )}

        {activePage === "mastery" && (
          <MasteryCertificate
            userName={displayName}
            completedDays={completedDays}
            setActivePage={navigate}
          />
        )}

        {activePage === "admin" && <AdminDashboard />}

        {activePage === "about" && <AboutRayan />}
      </Suspense>

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
