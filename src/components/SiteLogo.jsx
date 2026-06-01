import {
  MUNSAQAH_ALT_AR,
  MUNSAQAH_ALT_EN,
  MUNSAQAH_ASSETS
} from "../lib/munsaqahBrand";

function logoSource(variant) {
  if (variant === "icon") return MUNSAQAH_ASSETS.icon;
  if (variant === "vertical") return MUNSAQAH_ASSETS.vertical;
  return MUNSAQAH_ASSETS.horizontal;
}

export default function SiteLogo({
  variant = "horizontal",
  context = "default",
  className = "",
  englishAlt = false
}) {
  const src = logoSource(variant);
  const alt = englishAlt ? MUNSAQAH_ALT_EN : MUNSAQAH_ALT_AR;

  return (
    <span className={`munsaqah-logo munsaqah-logo--${variant} munsaqah-logo--${context} ${className}`.trim()}>
      <style>{`
        .munsaqah-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
          max-width: 100%;
          flex: 0 0 auto;
        }

        .munsaqah-logo img {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          object-fit: contain;
          object-position: center;
          background: transparent;
          border: 0;
          transform: translateZ(0);
        }

        .munsaqah-logo--header img {
          height: clamp(40px, 5vw, 58px);
          max-width: min(220px, 34vw);
        }

        .munsaqah-logo--hero img {
          height: clamp(54px, 8vw, 86px);
          max-width: min(320px, 78vw);
        }

        .munsaqah-logo--mobile img {
          height: 48px;
          max-width: 190px;
        }

        .munsaqah-logo--footer img {
          height: 34px;
          max-width: 150px;
        }

        .munsaqah-logo--loader img {
          height: 42px;
          max-width: 58px;
          animation: munsaqahLogoPulse 1.4s ease-in-out infinite;
        }

        .munsaqah-logo--icon img {
          max-height: 54px;
          max-width: 54px;
        }

        body.od-theme-dark .munsaqah-logo img {
          filter: brightness(0) invert(1);
        }

        body.od-theme-dark .munsaqah-logo--loader img {
          filter: brightness(0) invert(1) drop-shadow(0 10px 22px rgba(0,0,0,.25));
        }

        @keyframes munsaqahLogoPulse {
          0%, 100% { transform: scale(.94); opacity: .72; }
          50% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 720px) {
          .munsaqah-logo--header img {
            height: 42px;
            max-width: 136px;
          }

          .munsaqah-logo--hero img {
            height: 58px;
          }

          .munsaqah-logo--mobile img {
            height: 42px;
            max-width: 160px;
          }
        }
      `}</style>

      <img
        src={src}
        alt={alt}
        decoding="async"
        draggable="false"
      />
    </span>
  );
}
