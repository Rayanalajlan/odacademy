import SectionIcon from "./SectionIcon";
import { SECTION_ICON_LIST } from "../lib/sectionIcons";

export default function SectionIconGrid({ onNavigate }) {
  return (
    <section className="section-icon-grid" aria-label="أقسام المنصة">
      <style>{`
        .section-icon-grid {
          width: min(1120px, calc(100% - 28px));
          margin: 28px auto;
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 14px;
        }

        .section-icon-grid__item {
          border: 1px solid rgba(124, 58, 237, .20);
          border-radius: 24px;
          padding: 16px 12px;
          background:
            radial-gradient(circle at 100% 0%, rgba(124, 58, 237, .10), transparent 34%),
            rgba(255,255,255,.78);
          box-shadow: 0 18px 44px rgba(60, 37, 98, .08);
          display: grid;
          place-items: center;
          gap: 10px;
          color: #211336;
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
        }

        .section-icon-grid__item:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 54px rgba(60, 37, 98, .14);
        }

        .section-icon-grid__item span:last-child {
          text-align: center;
          font-size: 13px;
          line-height: 1.5;
        }

        body.od-theme-dark .section-icon-grid__item {
          color: #fbf7ff;
          background:
            radial-gradient(circle at 100% 0%, rgba(124, 58, 237, .14), transparent 34%),
            rgba(15, 10, 25, .88);
          border-color: rgba(167, 139, 250, .18);
        }

        @media (max-width: 980px) {
          .section-icon-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 560px) {
          .section-icon-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>

      {SECTION_ICON_LIST.map((item) => (
        <button
          key={item.id}
          type="button"
          className="section-icon-grid__item"
          onClick={() => onNavigate?.(item.id)}
        >
          <SectionIcon pageId={item.id} size="card" />
          <span>{item.label}</span>
        </button>
      ))}
    </section>
  );
}
