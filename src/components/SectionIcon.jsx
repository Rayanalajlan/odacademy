import { getSectionIcon } from "../lib/sectionIcons";

export default function SectionIcon({
  pageId = "home",
  size = "nav",
  className = "",
  decorative = true
}) {
  const icon = getSectionIcon(pageId);
  const alt = decorative ? "" : icon.label;

  return (
    <span className={`section-icon section-icon--${size} ${className}`.trim()}>
      <style>{`
        .section-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          overflow: hidden;
          border-radius: 14px;
          background:
            radial-gradient(circle at 30% 18%, rgba(255,255,255,.78), transparent 42%),
            rgba(245, 239, 255, .72);
          border: 1px solid rgba(124, 58, 237, .24);
          box-shadow: 0 10px 26px rgba(60, 37, 98, .10);
        }

        .section-icon img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          user-select: none;
        }

        .section-icon--nav {
          width: 30px;
          height: 30px;
          border-radius: 16px;
        }

        .section-icon--mobile {
          width: 38px;
          height: 38px;
          border-radius: 14px;
        }

        .section-icon--menu {
          width: 34px;
          height: 34px;
          border-radius: 13px;
        }

        .section-icon--card {
          width: clamp(76px, 9vw, 112px);
          height: clamp(76px, 9vw, 112px);
          border-radius: 24px;
          box-shadow: 0 18px 42px rgba(60, 37, 98, .14);
        }

        .section-icon--hero {
          width: clamp(94px, 12vw, 148px);
          height: clamp(94px, 12vw, 148px);
          border-radius: 30px;
          box-shadow: 0 22px 54px rgba(60, 37, 98, .18);
        }

        .main-nav button,
        .educational-tools-trigger,
        .mobile-nav-item,
        .mobile-tool-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .main-nav button .nav-label,
        .educational-tools-trigger .nav-label,
        .mobile-nav-item .nav-label {
          line-height: 1;
        }

        .mobile-nav-label-with-icon,
        .mobile-tool-label-with-icon,
        .educational-tool-option__title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        body.od-theme-dark .section-icon {
          background:
            radial-gradient(circle at 30% 18%, rgba(255,255,255,.16), transparent 42%),
            rgba(32, 22, 48, .86);
          border-color: rgba(167, 139, 250, .22);
          box-shadow: 0 14px 34px rgba(0, 0, 0, .24);
        }
      `}</style>
      <img
        src={icon.src}
        alt={alt}
        aria-hidden={decorative ? "true" : undefined}
        loading="lazy"
        decoding="async"
        draggable="false"
      />
    </span>
  );
}
