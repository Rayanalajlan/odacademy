import { useEffect, useMemo } from "react";

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
  activePage = "home",
  userName = "متدرب",
  completedDays = 0,
  totalDays = 180,
  onNavigate,
  onClose,
  onResumeJourney,
  onSignOut
}) {
  const progress = useMemo(() => {
    const safeTotal = Math.max(1, safeNumber(totalDays, 180));
    const safeCompleted = Math.min(safeTotal, Math.max(0, safeNumber(completedDays, 0)));

    return {
      completed: safeCompleted,
      total: safeTotal,
      percent: Math.round((safeCompleted / safeTotal) * 100)
    };
  }, [completedDays, totalDays]);

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
          background: rgba(15, 23, 42, 0.60);
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
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.13), transparent 34%),
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

        .mobile-nav-title {
          display: grid;
          gap: 4px;
        }

        .mobile-nav-title strong {
          color: #0f172a;
          font-size: 20px;
          line-height: 1.5;
          font-weight: 950;
        }

        .mobile-nav-title span {
          color: #64748b;
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
          color: #0f172a;
          background: #f1f5f9;
          font-size: 20px;
          font-weight: 950;
        }

        .mobile-nav-progress {
          border-radius: 24px;
          padding: 16px;
          color: #ffffff;
          background:
            radial-gradient(circle at 15% 15%, rgba(245,158,11,.24), transparent 34%),
            linear-gradient(135deg, #0f172a, #312e81);
          box-shadow: 0 18px 42px rgba(15,23,42,.16);
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
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 850;
        }

        .mobile-nav-progress-head strong {
          color: #fbbf24;
          font-size: 28px;
          line-height: 1;
          font-weight: 950;
        }

        .mobile-nav-track {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,.16);
        }

        .mobile-nav-track i {
          display: block;
          height: 100%;
          width: var(--progress-width);
          border-radius: inherit;
          background: linear-gradient(90deg, #f59e0b, #10b981);
        }

        .mobile-nav-progress small {
          display: block;
          margin-top: 10px;
          color: #cbd5e1;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 800;
        }

        .mobile-nav-resume {
          width: 100%;
          border: 0;
          cursor: pointer;
          min-height: 46px;
          border-radius: 18px;
          color: #ffffff;
          background: linear-gradient(135deg, #4f46e5, #312e81);
          font-family: inherit;
          font-weight: 950;
          margin-bottom: 14px;
          box-shadow: 0 16px 34px rgba(79,70,229,.20);
        }

        .mobile-nav-list {
          display: grid;
          gap: 9px;
        }

        .mobile-nav-item {
          width: 100%;
          border: 1px solid rgba(148,163,184,.20);
          cursor: pointer;
          min-height: 50px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 0 14px;
          color: #0f172a;
          background: #ffffff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 950;
          text-align: right;
        }

        .mobile-nav-item.active {
          color: #3730a3;
          background: #eef2ff;
          border-color: rgba(79,70,229,.32);
        }

        .mobile-nav-item small {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 900;
        }

        .mobile-nav-bottom {
          display: grid;
          gap: 10px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(148,163,184,.20);
        }

        .mobile-nav-signout {
          border: 0;
          cursor: pointer;
          min-height: 46px;
          border-radius: 18px;
          color: #991b1b;
          background: #fef2f2;
          font-family: inherit;
          font-weight: 950;
        }

        .mobile-nav-note {
          margin: 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 760;
          text-align: center;
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
          متابعة من آخر محطة
        </button>

        <nav className="mobile-nav-list" aria-label="أقسام المنصة للجوال">
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              className={`mobile-nav-item ${activePage === page.id ? "active" : ""}`}
              onClick={() => onNavigate?.(page.id)}
            >
              <span>{page.label}</span>
              <small>{String(index + 1).padStart(2, "0")}</small>
            </button>
          ))}
        </nav>

        <div className="mobile-nav-bottom">
          <button type="button" className="mobile-nav-signout" onClick={onSignOut}>
            تسجيل الخروج
          </button>

          <p className="mobile-nav-note">
            القائمة تظهر للجوال فقط، أما عرض الكمبيوتر فيبقى كما هو.
          </p>
        </div>
      </aside>
    </div>
  );
}
