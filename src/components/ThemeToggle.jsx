import { useEffect, useState } from "react";
import { initializeTheme, toggleTheme } from "../lib/themeService";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(initializeTheme());
  }, []);

  function handleToggle() {
    setTheme(toggleTheme(theme));
  }

  const isDark = theme === "dark";

  return (
    <>
      <style>{`
        .theme-toggle-button {
          border: 0;
          cursor: pointer;
          min-height: 44px;
          min-width: 44px;
          border-radius: 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #0f172a;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.28), transparent 36%),
            #ffffff;
          border: 1px solid rgba(148,163,184,.22);
          box-shadow: 0 14px 30px rgba(15,23,42,.08);
          font-family: inherit;
          font-size: 18px;
          font-weight: 950;
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
        }

        .theme-toggle-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 38px rgba(79,70,229,.14);
        }

        .theme-toggle-label {
          display: none;
          font-size: 12px;
          font-weight: 950;
        }

        .theme-toggle-icon {
          display: inline-grid;
          place-items: center;
          width: 24px;
          height: 24px;
          line-height: 1;
        }

        /*
          Phase 36:
          المشكلة في الصورة كانت أن بعض الحاويات الخارجية بقيت بيضاء.
          لذلك هنا نعالج html + body + root + wrappers العامة وليس البطاقات فقط.
        */
        html[data-theme="dark"],
        html[data-theme="dark"] body,
        body.od-theme-dark {
          min-height: 100%;
          color-scheme: dark;
          background: #020617 !important;
        }

        html[data-theme="dark"] body::before,
        body.od-theme-dark::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            radial-gradient(circle at 12% 8%, rgba(79,70,229,.22), transparent 30%),
            radial-gradient(circle at 88% 16%, rgba(16,185,129,.12), transparent 26%),
            radial-gradient(circle at 50% 100%, rgba(245,158,11,.08), transparent 32%),
            #020617 !important;
        }

        body.od-theme-dark,
        body.od-theme-dark #root,
        body.od-theme-dark .site-frame,
        body.od-theme-dark .app,
        body.od-theme-dark .app-shell,
        body.od-theme-dark .page,
        body.od-theme-dark .page-shell,
        body.od-theme-dark .page-wrap,
        body.od-theme-dark .page-wrapper,
        body.od-theme-dark .main-page,
        body.od-theme-dark .main-shell,
        body.od-theme-dark .main-content,
        body.od-theme-dark .content,
        body.od-theme-dark .content-area,
        body.od-theme-dark .dashboard,
        body.od-theme-dark .dashboard-shell,
        body.od-theme-dark .container,
        body.od-theme-dark .wrapper,
        body.od-theme-dark main {
          background:
            radial-gradient(circle at 10% 0%, rgba(79,70,229,.14), transparent 28%),
            radial-gradient(circle at 90% 10%, rgba(16,185,129,.08), transparent 30%),
            #020617 !important;
          color: #e5e7eb !important;
        }

        /*
          رحلة التعلم كانت أكثر مكان يظهر فيه الأبيض.
          نغطي كل الطبقات الخاصة بها بأسماء عامة ومباشرة.
        */
        body.od-theme-dark .learning-journey,
        body.od-theme-dark .course-journey,
        body.od-theme-dark .journey,
        body.od-theme-dark .journey-shell,
        body.od-theme-dark .journey-page,
        body.od-theme-dark .journey-lab,
        body.od-theme-dark .jl-shell,
        body.od-theme-dark .jl-page,
        body.od-theme-dark .jl-main,
        body.od-theme-dark .jl-content,
        body.od-theme-dark .jl-stage,
        body.od-theme-dark .jl-section,
        body.od-theme-dark .jl-months,
        body.od-theme-dark .jl-weeks,
        body.od-theme-dark .jl-days,
        body.od-theme-dark .jl-grid,
        body.od-theme-dark .jl-top-actions,
        body.od-theme-dark [class*="journey"],
        body.od-theme-dark [class*="Journey"],
        body.od-theme-dark [class*="course"],
        body.od-theme-dark [class*="Course"],
        body.od-theme-dark [class*="learning"],
        body.od-theme-dark [class*="Learning"] {
          background-color: transparent !important;
          color: #e5e7eb !important;
        }

        body.od-theme-dark .site-header,
        body.od-theme-dark .site-footer,
        body.od-theme-dark .profile-strip,
        body.od-theme-dark .profile-card,
        body.od-theme-dark .profile-drawer,
        body.od-theme-dark .profile-panel,
        body.od-theme-dark .portfolio-section,
        body.od-theme-dark .portfolio-stat,
        body.od-theme-dark .course-search-box,
        body.od-theme-dark .saved-lessons-panel,
        body.od-theme-dark .weekly-reflection-panel,
        body.od-theme-dark .monthly-certificates,
        body.od-theme-dark .page-loader,
        body.od-theme-dark .global-notice,
        body.od-theme-dark .mobile-nav-panel,
        body.od-theme-dark .onboarding-card,
        body.od-theme-dark .verify-card,
        body.od-theme-dark .portfolio-export-report,
        body.od-theme-dark .jl-hero,
        body.od-theme-dark .jl-card,
        body.od-theme-dark .jl-reader,
        body.od-theme-dark .jl-quiz,
        body.od-theme-dark .radar-card,
        body.od-theme-dark .simulation-card,
        body.od-theme-dark .ai-mentor-card,
        body.od-theme-dark .od-card,
        body.od-theme-dark .home-card,
        body.od-theme-dark .feature-card,
        body.od-theme-dark [class*="card"],
        body.od-theme-dark [class*="Card"],
        body.od-theme-dark [class*="panel"],
        body.od-theme-dark [class*="Panel"],
        body.od-theme-dark [class*="box"],
        body.od-theme-dark [class*="Box"] {
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.12), transparent 32%),
            rgba(15, 23, 42, .95) !important;
          border-color: rgba(148,163,184,.24) !important;
          box-shadow: 0 18px 58px rgba(0,0,0,.32) !important;
          color: #e5e7eb !important;
        }

        body.od-theme-dark .portfolio-row,
        body.od-theme-dark .portfolio-cert,
        body.od-theme-dark .report-row,
        body.od-theme-dark .report-cert,
        body.od-theme-dark .saved-lesson-card,
        body.od-theme-dark .course-search-result,
        body.od-theme-dark .profile-metric,
        body.od-theme-dark .profile-stat,
        body.od-theme-dark .weekly-reflection-progress,
        body.od-theme-dark .monthly-card,
        body.od-theme-dark .verify-field,
        body.od-theme-dark .report-stat,
        body.od-theme-dark .mobile-nav-item,
        body.od-theme-dark .onboarding-step,
        body.od-theme-dark .jl-month-card,
        body.od-theme-dark .jl-week-card,
        body.od-theme-dark .jl-day-card,
        body.od-theme-dark .jl-stat,
        body.od-theme-dark .jl-breadcrumb,
        body.od-theme-dark [class*="item"],
        body.od-theme-dark [class*="Item"],
        body.od-theme-dark [class*="row"],
        body.od-theme-dark [class*="Row"],
        body.od-theme-dark [class*="stat"],
        body.od-theme-dark [class*="Stat"],
        body.od-theme-dark [class*="tile"],
        body.od-theme-dark [class*="Tile"] {
          background: rgba(30, 41, 59, .88) !important;
          border-color: rgba(148,163,184,.24) !important;
          color: #e5e7eb !important;
        }

        /*
          منع أي صندوق أبيض صريح داخل الوضع الداكن.
          نترك الصور والشعارات بدون تغيير.
        */
        body.od-theme-dark div:not(.brand-mark):not(.image-mark):not(.logo-badge):not([class*="avatar"]):not([class*="Avatar"]):not([class*="logo"]):not([class*="Logo"]) {
          border-color: rgba(148,163,184,.20);
        }

        body.od-theme-dark h1,
        body.od-theme-dark h2,
        body.od-theme-dark h3,
        body.od-theme-dark h4,
        body.od-theme-dark strong,
        body.od-theme-dark b {
          color: #f8fafc !important;
        }

        body.od-theme-dark p,
        body.od-theme-dark span,
        body.od-theme-dark small,
        body.od-theme-dark label,
        body.od-theme-dark li {
          color: #cbd5e1 !important;
        }

        body.od-theme-dark input,
        body.od-theme-dark textarea,
        body.od-theme-dark select {
          background: rgba(2, 6, 23, .90) !important;
          color: #f8fafc !important;
          border-color: rgba(148,163,184,.36) !important;
        }

        body.od-theme-dark input::placeholder,
        body.od-theme-dark textarea::placeholder {
          color: #94a3b8 !important;
        }

        body.od-theme-dark .main-nav button {
          color: #cbd5e1 !important;
          background: rgba(30,41,59,.72) !important;
          border-color: rgba(148,163,184,.18) !important;
        }

        body.od-theme-dark .main-nav button.active {
          color: #ffffff !important;
          background: linear-gradient(135deg, #4f46e5, #312e81) !important;
        }

        body.od-theme-dark button:not(.active):not(.portfolio-button.primary):not(.profile-button.primary):not(.theme-toggle-button):not(.logout-button):not(.mobile-menu-button) {
          background: rgba(30, 41, 59, .88) !important;
          border-color: rgba(148,163,184,.24) !important;
          color: #e5e7eb !important;
        }

        body.od-theme-dark .logout-button {
          color: #fecaca !important;
          background: rgba(127,29,29,.34) !important;
          border-color: rgba(248,113,113,.22) !important;
        }

        body.od-theme-dark .theme-toggle-button {
          color: #fde68a !important;
          background:
            radial-gradient(circle at 0% 100%, rgba(245,158,11,.24), transparent 38%),
            linear-gradient(135deg, #0f172a, #312e81) !important;
          border-color: rgba(253,230,138,.22) !important;
          box-shadow: 0 18px 40px rgba(0,0,0,.28) !important;
        }

        body.od-theme-dark .brand .brand-mark,
        body.od-theme-dark .brand .brand-mark.image-mark,
        body.od-theme-dark .logo-badge,
        body.od-theme-dark .od-feature-icon.od-feature-icon--logo {
          background: #f8fafc !important;
        }

        body.od-theme-dark a {
          color: #93c5fd !important;
        }


        /* Phase 48 dark-background hardening */
        html[data-theme="dark"],
        html[data-theme="dark"] body,
        html[data-theme="dark"] #root,
        body.od-theme-dark,
        body.od-theme-dark #root,
        body.od-theme-dark .site-frame,
        body.od-theme-dark .public-gate,
        body.od-theme-dark .public-wrap,
        body.od-theme-dark main {
          background:
            radial-gradient(circle at 12% 8%, rgba(79,70,229,.15), transparent 30%),
            radial-gradient(circle at 88% 14%, rgba(16,185,129,.08), transparent 26%),
            #020617 !important;
          color: #e5e7eb !important;
        }

        @media (min-width: 1180px) {
          .theme-toggle-label {
            display: inline;
          }

          .theme-toggle-button {
            padding: 0 13px;
          }
        }

        @media (max-width: 980px) {
          .theme-toggle-button {
            min-width: 44px;
            padding: 0 10px;
          }
        }
      `}</style>

      <button
        type="button"
        className="theme-toggle-button"
        onClick={handleToggle}
        aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
        title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {isDark ? "☀️" : "🌙"}
        </span>
        <span className="theme-toggle-label">
          {isDark ? "فاتح" : "داكن"}
        </span>
      </button>
    </>
  );
}
