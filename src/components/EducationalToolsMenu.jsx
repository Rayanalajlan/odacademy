import { useEffect, useRef, useState } from "react";

export default function EducationalToolsMenu({
  toolPages = [],
  activePage = "",
  onNavigate
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const toolsActive = toolPages.some((page) => page.id === activePage);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function chooseTool(pageId) {
    setOpen(false);
    onNavigate?.(pageId);
  }

  return (
    <div className="educational-tools-menu" ref={menuRef}>
      <style>{`
        .educational-tools-menu {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .educational-tools-trigger {
          border: 0;
          cursor: pointer;
          min-height: 42px;
          border-radius: 999px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          background: linear-gradient(135deg, #4f46e5, #312e81);
          box-shadow: 0 14px 30px rgba(79,70,229,.18);
          font-family: inherit;
          font-size: 13px;
          font-weight: 950;
          white-space: nowrap;
        }

        .educational-tools-trigger::after {
          content: "⌄";
          font-size: 14px;
          line-height: 1;
          transform: translateY(-1px);
          opacity: .9;
        }

        .educational-tools-trigger.active {
          background:
            radial-gradient(circle at 0% 100%, rgba(245,158,11,.28), transparent 38%),
            linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 16px 34px rgba(79,70,229,.26);
        }

        .educational-tools-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          z-index: 95;
          width: min(360px, 92vw);
          border-radius: 24px;
          padding: 10px;
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.12), transparent 34%),
            #ffffff;
          border: 1px solid rgba(148,163,184,.22);
          box-shadow: 0 26px 74px rgba(15,23,42,.20);
        }

        .educational-tools-dropdown::before {
          content: "";
          position: absolute;
          top: -7px;
          right: 28px;
          width: 14px;
          height: 14px;
          transform: rotate(45deg);
          background: #ffffff;
          border-top: 1px solid rgba(148,163,184,.22);
          border-right: 1px solid rgba(148,163,184,.22);
        }

        .educational-tools-head {
          padding: 10px 12px 12px;
          border-bottom: 1px solid rgba(148,163,184,.16);
          margin-bottom: 8px;
        }

        .educational-tools-head strong {
          display: block;
          color: #0f172a;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 950;
        }

        .educational-tools-head span {
          display: block;
          color: #64748b;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 800;
        }

        .educational-tool-option {
          width: 100%;
          border: 0;
          cursor: pointer;
          border-radius: 18px;
          padding: 12px;
          display: grid;
          gap: 3px;
          text-align: right;
          font-family: inherit;
          background: transparent;
          transition: .18s ease;
        }

        .educational-tool-option:hover,
        .educational-tool-option.active {
          background: #eef2ff;
        }

        .educational-tool-option strong {
          color: #0f172a;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 950;
        }

        .educational-tool-option span {
          color: #64748b;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 780;
        }

        body.od-theme-dark .educational-tools-dropdown {
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.16), transparent 34%),
            rgba(15,23,42,.98) !important;
          border-color: rgba(148,163,184,.24) !important;
          box-shadow: 0 26px 74px rgba(0,0,0,.42) !important;
        }

        body.od-theme-dark .educational-tools-dropdown::before {
          background: rgba(15,23,42,.98) !important;
          border-color: rgba(148,163,184,.24) !important;
        }

        body.od-theme-dark .educational-tool-option:hover,
        body.od-theme-dark .educational-tool-option.active {
          background: rgba(79,70,229,.22) !important;
        }

        body.od-theme-dark .educational-tools-head strong,
        body.od-theme-dark .educational-tool-option strong {
          color: #f8fafc !important;
        }

        body.od-theme-dark .educational-tools-head span,
        body.od-theme-dark .educational-tool-option span {
          color: #cbd5e1 !important;
        }

        @media (max-width: 980px) {
          .educational-tools-menu {
            display: none;
          }
        }
      `}</style>

      <button
        type="button"
        className={`educational-tools-trigger ${toolsActive ? "active" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        الأدوات التعليمية
      </button>

      {open && (
        <div className="educational-tools-dropdown" role="menu">
          <div className="educational-tools-head">
            <strong>الأدوات التعليمية</strong>
            <span>قياس، محاكاة، توجيه ذكي، وحساب أثر التعلم.</span>
          </div>

          {toolPages.map((page) => (
            <button
              key={page.id}
              type="button"
              role="menuitem"
              className={`educational-tool-option ${activePage === page.id ? "active" : ""}`}
              onClick={() => chooseTool(page.id)}
            >
              <strong>{page.label}</strong>
              <span>{page.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
