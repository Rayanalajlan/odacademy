import { useEffect, useMemo } from "react";
import SiteLogo from "./SiteLogo";

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function firstNameOf(value) {
  const clean = String(value || "متدرب").trim();
  return clean.split(/\s+/)[0] || "متدرب";
}

export default function MobileNavigation({
  open = false,
  pages = [],
  toolPages = [],
  activePage = "home",
  userName = "متدرب",
  completedDays = 0,
  totalDays = 168,
  onNavigate,
  onClose,
  onResumeJourney,
  onSignOut
}) {
  const progress = useMemo(() => {
    const safeTotal = Math.max(1, safeNumber(totalDays, 168));
    const safeCompleted = Math.min(safeTotal, Math.max(0, safeNumber(completedDays, 0)));

    return {
      completed: safeCompleted,
      total: safeTotal,
      percent: Math.round((safeCompleted / safeTotal) * 100)
    };
  }, [completedDays, totalDays]);

  const toolsActive = toolPages.some((page) => page.id === activePage);

  useEffect(() => {
    if (!open || typeof window === "undefined") return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="mobile-nav-layer" dir="rtl">
      <style>{`
        .mobile-nav-layer {
          position: fixed;
          inset: 0;
          z-index: 110;
          display: none;
        }

        .mobile-nav-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(28, 17, 48, 0.60);
          backdrop-filter: blur(12px);
        }

        .mobile-nav-panel {
          position: absolute;
          top: 12px;
          right: 12px;
          bottom: 12px;
          width: min(390px, calc(100vw - 24px));
          overflow: auto;
          border-radius: 30px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.13), transparent 34%),
            radial-gradient(circle at 0% 100%, rgba(245,158,11,.12), transparent 32%),
            #ffffff;
          border: 1px solid rgba(255,255,255,.78);
          box-shadow: 0 34px 100px rgba(0,0,0,.34);
          padding: 18px;
        }

        .mobile-nav-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }
        .mobile-nav-logo {
          margin-bottom: 10px;
        }

        .mobile-nav-title {
          display: grid;
          gap: 4px;
        }

        .mobile-nav-title strong {
          color: #18102e;
          font-size: 20px;
          line-height: 1.5;
          font-weight: 950;
        }

        .mobile-nav-title span {
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 800;
        }

        .mobile-nav-close {
          border: 0;
          cursor: pointer;
          width: 42px;
          height: 42px;
          border-radius: 16px;
          color: #18102e;
          background: #efe9fb;
          font-size: 20px;
          font-weight: 950;
        }

        .mobile-nav-progress {
          border-radius: 24px;
          padding: 16px;
          color: #18102e;
          background:
            radial-gradient(circle at 15% 15%, rgba(245,158,11,.16), transparent 34%),
            linear-gradient(135deg, #ffffff, #f6f2ff);
          border: 1px solid rgba(139, 92, 246, .22);
          box-shadow: 0 18px 42px rgba(28, 17, 48,.10);
          margin-bottom: 14px;
        }

        .mobile-nav-progress-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .mobile-nav-progress-head span {
          color: #5b4f78;
          font-size: 12px;
          font-weight: 850;
        }

        .mobile-nav-progress-head strong {
          color: #18102e;
          font-size: 28px;
          line-height: 1;
          font-weight: 950;
        }

        .mobile-nav-track {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: #e4d8fb;
        }

        .mobile-nav-track i {
          display: block;
          height: 100%;
          width: var(--progress-width);
          border-radius: inherit;
          background: linear-gradient(90deg, #a855f7, #10b981);
        }

        .mobile-nav-progress small {
          display: block;
          margin-top: 10px;
          color: #5b4f78;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 800;
        }

        body.od-theme-dark .mobile-nav-progress {
          color: #ffffff;
          background:
            radial-gradient(circle at 15% 15%, rgba(245,158,11,.24), transparent 34%),
            linear-gradient(135deg, #18102e, #3b1d6e);
          border-color: rgba(255,255,255,.10);
          box-shadow: 0 18px 42px rgba(28, 17, 48,.16);
        }

        body.od-theme-dark .mobile-nav-progress-head span,
        body.od-theme-dark .mobile-nav-progress small {
          color: #c9bdf0;
        }

        body.od-theme-dark .mobile-nav-progress-head strong {
          color: #fbbf24;
        }

        body.od-theme-dark .mobile-nav-track {
          background: rgba(255,255,255,.16);
        }

        .mobile-nav-resume {
          width: 100%;
          border: 0;
          cursor: pointer;
          min-height: 46px;
          border-radius: 18px;
          color: #ffffff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          font-family: inherit;
          font-weight: 950;
          margin-bottom: 14px;
          box-shadow: 0 16px 34px rgba(139, 92, 246,.20);
        }

        .mobile-nav-list {
          display: grid;
          gap: 9px;
        }

        .mobile-nav-item {
          width: 100%;
          border: 1px solid rgba(167, 139, 250,.20);
          cursor: pointer;
          min-height: 50px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 0 14px;
          color: #18102e;
          background: #ffffff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 950;
          text-align: right;
        }

        .mobile-nav-item.active {
          color: #6d28d9;
          background: #efe9fb;
          border-color: rgba(139, 92, 246,.32);
        }

        .mobile-nav-item small {
          color: #9d8fc0;
          font-size: 11px;
          font-weight: 900;
        }

        .mobile-tools-group {
          border-radius: 22px;
          padding: 11px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 34%),
            #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .mobile-tools-group.active {
          border-color: rgba(139, 92, 246,.32);
          background: #efe9fb;
        }

        .mobile-tools-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          padding: 0 3px;
        }

        .mobile-tools-title strong {
          color: #18102e;
          font-size: 13px;
          font-weight: 950;
        }

        .mobile-tools-title span {
          color: #7a6c9a;
          font-size: 10px;
          font-weight: 850;
        }

        .mobile-tool-button {
          width: 100%;
          border: 0;
          cursor: pointer;
          border-radius: 16px;
          padding: 11px;
          display: grid;
          gap: 3px;
          text-align: right;
          font-family: inherit;
          background: transparent;
        }

        .mobile-tool-button.active,
        .mobile-tool-button:hover {
          background: rgba(139, 92, 246,.10);
        }

        .mobile-tool-button strong {
          color: #18102e;
          font-size: 12px;
          line-height: 1.6;
          font-weight: 950;
        }

        .mobile-tool-button span {
          color: #7a6c9a;
          font-size: 10px;
          line-height: 1.7;
          font-weight: 760;
        }

        .mobile-nav-bottom {
          display: grid;
          gap: 10px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(167, 139, 250,.20);
        }

        .mobile-nav-signout {
          border: 1px solid rgba(220, 38, 38, .42);
          cursor: pointer;
          min-height: 46px;
          border-radius: 18px;
          color: #dc2626 !important;
          -webkit-text-fill-color: #dc2626 !important;
          background: rgba(254, 242, 242, .98);
          font-family: inherit;
          font-weight: 950;
        }

        .mobile-nav-signout:hover,
        .mobile-nav-signout:focus-visible {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          background: linear-gradient(135deg, #ef4444, #b91c1c);
          border-color: rgba(185, 28, 28, .52);
        }

        .mobile-nav-note {
          margin: 0;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 760;
          text-align: center;
        }

        body.od-theme-dark .mobile-tools-group {
          background: rgba(30,41,59,.88) !important;
          border-color: rgba(167, 139, 250,.24) !important;
        }

        body.od-theme-dark .mobile-tools-group.active,
        body.od-theme-dark .mobile-tool-button.active,
        body.od-theme-dark .mobile-tool-button:hover {
          background: rgba(139, 92, 246,.22) !important;
        }

        body.od-theme-dark .mobile-tools-title strong,
        body.od-theme-dark .mobile-tool-button strong {
          color: #f4f0fb !important;
        }

        body.od-theme-dark .mobile-tools-title span,
        body.od-theme-dark .mobile-tool-button span {
          color: #c9bdf0 !important;
        }

        @media (max-width: 980px) {
          .mobile-nav-layer {
            display: block;
          }
        }
      `}</style>

      <button
        type="button"
        className="mobile-nav-backdrop"
        aria-label="إغلاق قائمة الجوال"
        onClick={onClose}
      />

      <aside className="mobile-nav-panel" aria-label="قائمة التنقل للجوال">
        <div className="mobile-nav-top">
          <div className="mobile-nav-title">
            <div className="mobile-nav-logo">
              <SiteLogo variant="horizontal" context="mobile" />
            </div>
            <strong>حياك يا {firstNameOf(userName)}</strong>
            <span>تنقل سريع داخل مختبر التطوير التنظيمي</span>
          </div>

          <button type="button" className="mobile-nav-close" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
        </div>

        <div
          className="mobile-nav-progress"
          style={{ "--progress-width": `${progress.percent}%` }}
        >
          <div className="mobile-nav-progress-head">
            <span>تقدم الرحلة</span>
            <strong>{progress.percent}%</strong>
          </div>

          <div className="mobile-nav-track">
            <i />
          </div>

          <small>{progress.completed} من {progress.total} يومًا مكتملًا</small>
        </div>

        <button type="button" className="mobile-nav-resume" onClick={onResumeJourney}>
          متابعة من آخر درس
        </button>

        <nav className="mobile-nav-list" aria-label="أقسام المنصة للجوال">
          {pages.map((page, index) => (
            <FragmentLike
              keyValue={page.id}
              key={page.id}
              showTools={page.id === "journey"}
              toolsActive={toolsActive}
              toolPages={toolPages}
              activePage={activePage}
              onNavigate={onNavigate}
              page={page}
              index={index}
            />
          ))}
        </nav>

        <div className="mobile-nav-bottom">
          <button type="button" className="mobile-nav-signout" onClick={onSignOut}>
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </div>
  );
}

function FragmentLike({
  showTools,
  toolsActive,
  toolPages,
  activePage,
  onNavigate,
  page,
  index
}) {
  return (
    <>
      <button
        type="button"
        className={`mobile-nav-item ${activePage === page.id ? "active" : ""}`}
        onClick={() => onNavigate?.(page.id)}
      >
        <span>{page.label}</span>
        <small>{String(index + 1).padStart(2, "0")}</small>
      </button>

      {showTools && (
        <div className={`mobile-tools-group ${toolsActive ? "active" : ""}`}>
          <div className="mobile-tools-title">
            <strong>الأدوات التعليمية</strong>
            <span>قياس وتطبيق</span>
          </div>

          {toolPages.map((tool) => (
            <button
              key={tool.id}
              type="button"
              className={`mobile-tool-button ${activePage === tool.id ? "active" : ""}`}
              onClick={() => onNavigate?.(tool.id)}
            >
              <strong>{tool.label}</strong>
              <span>{tool.description}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
