import { useEffect, useRef, useState } from "react";

const TOOLS_MAIN_ICON = (
  <>
    <path d="M5 6h14" />
    <circle cx="9" cy="6" r="2" />
    <path d="M5 12h14" />
    <circle cx="15" cy="12" r="2" />
    <path d="M5 18h14" />
    <circle cx="8" cy="18" r="2" />
  </>
);

const TOOL_ICON_PATHS = {
  radar: (
    <>
      <polygon points="12 3 20 8 17 19 7 19 4 8" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 9.4V3" />
    </>
  ),
  simulation: (
    <>
      <path d="M6 4.6 18.5 12 6 19.4z" />
    </>
  ),
  "ai-mentor": (
    <>
      <rect x="5" y="6.5" width="14" height="11" rx="3.2" />
      <path d="M12 3.2v3.3" />
      <circle cx="9.6" cy="12" r="1.05" />
      <circle cx="14.4" cy="12" r="1.05" />
      <path d="M9.4 15.4h5.2" />
    </>
  ),
  "learning-roi": (
    <>
      <path d="M4 20.2V5" />
      <path d="M4 20.2h16" />
      <rect x="7" y="13" width="2.8" height="4.4" rx="0.6" />
      <rect x="11.6" y="9.4" width="2.8" height="8" rx="0.6" />
      <rect x="16.2" y="15" width="2.8" height="2.4" rx="0.6" />
    </>
  )
};

function ToolIcon({ id, main }) {
  const paths = main ? TOOLS_MAIN_ICON : TOOL_ICON_PATHS[id];
  if (!paths) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  );
}

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
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          box-shadow: 0 14px 30px rgba(139, 92, 246,.18);
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
            linear-gradient(135deg, #8b5cf6, #7c3aed);
          box-shadow: 0 16px 34px rgba(139, 92, 246,.26);
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
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 34%),
            #ffffff;
          border: 1px solid rgba(167, 139, 250,.22);
          box-shadow: 0 26px 74px rgba(28, 17, 48,.20);
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
          border-top: 1px solid rgba(167, 139, 250,.22);
          border-right: 1px solid rgba(167, 139, 250,.22);
        }

        .educational-tools-head {
          padding: 10px 12px 12px;
          border-bottom: 1px solid rgba(167, 139, 250,.16);
          margin-bottom: 8px;
        }

        .educational-tools-head strong {
          display: block;
          color: #18102e;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 950;
        }

        .educational-tools-head span {
          display: block;
          color: #7a6c9a;
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
          background: #efe9fb;
        }

        .educational-tool-option strong {
          color: #18102e;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 950;
        }

        .educational-tool-option span {
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 780;
        }

        .educational-tools-trigger .ett-icon {
          display: inline-flex;
          width: 17px;
          height: 17px;
          flex: none;
        }

        .educational-tools-trigger .ett-icon svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .educational-tool-option {
          grid-template-columns: auto 1fr;
          column-gap: 10px;
          align-items: center;
        }

        .educational-tool-option .eto-icon {
          grid-column: 1;
          grid-row: 1 / 3;
          width: 36px;
          height: 36px;
          border-radius: 11px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.12);
          border: 1px solid rgba(139, 92, 246, 0.2);
          color: #7c3aed;
        }

        .educational-tool-option .eto-icon svg {
          width: 18px;
          height: 18px;
        }

        body.od-theme-dark .educational-tool-option .eto-icon {
          background: rgba(139, 92, 246, 0.18) !important;
          border-color: rgba(167, 139, 250, 0.3) !important;
          color: #c4b5fd !important;
        }

        body.od-theme-dark .educational-tools-dropdown {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.16), transparent 34%),
            rgba(28, 17, 48,.98) !important;
          border-color: rgba(167, 139, 250,.24) !important;
          box-shadow: 0 26px 74px rgba(0,0,0,.42) !important;
        }

        body.od-theme-dark .educational-tools-dropdown::before {
          background: rgba(28, 17, 48,.98) !important;
          border-color: rgba(167, 139, 250,.24) !important;
        }

        body.od-theme-dark .educational-tool-option:hover,
        body.od-theme-dark .educational-tool-option.active {
          background: rgba(139, 92, 246,.22) !important;
        }

        body.od-theme-dark .educational-tools-head strong,
        body.od-theme-dark .educational-tool-option strong {
          color: #f4f0fb !important;
        }

        body.od-theme-dark .educational-tools-head span,
        body.od-theme-dark .educational-tool-option span {
          color: #c9bdf0 !important;
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
        <span className="ett-icon" aria-hidden="true">
          <ToolIcon main />
        </span>
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
              <span className="eto-icon" aria-hidden="true">
                <ToolIcon id={page.id} />
              </span>
              <strong>{page.label}</strong>
              <span>{page.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
