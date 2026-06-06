import {
  MUNSAQAH_ALT_AR,
  MUNSAQAH_ALT_EN,
  MUNSAQAH_ASSETS
} from "../lib/munsaqahBrand";

function sizeClass(context) {
  if (context === "hero") return "munsaqah-logo--hero";
  if (context === "mobile") return "munsaqah-logo--mobile";
  if (context === "footer") return "munsaqah-logo--footer";
  if (context === "loader") return "munsaqah-logo--loader";
  if (context === "compact") return "munsaqah-logo--compact";
  return "munsaqah-logo--header";
}

function assetFor(variant, context) {
  if (variant === "icon" || context === "loader" || context === "compact") {
    return MUNSAQAH_ASSETS.icon;
  }

  if (variant === "vertical") {
    return MUNSAQAH_ASSETS.vertical;
  }

  return MUNSAQAH_ASSETS.horizontal;
}

export default function SiteLogo({
  variant = "horizontal",
  context = "default",
  className = "",
  englishAlt = false
}) {
  const alt = englishAlt ? MUNSAQAH_ALT_EN : MUNSAQAH_ALT_AR;
  const finalVariant = variant === "icon" || context === "loader" || context === "compact"
    ? "icon"
    : variant === "vertical"
      ? "vertical"
      : "horizontal";

  return (
    <span
      className={`munsaqah-logo munsaqah-logo--${finalVariant} ${sizeClass(context)} ${className}`.trim()}
      aria-label={alt}
      role="img"
    >
      <style>{logoStyles}</style>
      <img
        src={assetFor(variant, context)}
        alt={alt}
        decoding="async"
        draggable="false"
      />
    </span>
  );
}

const logoStyles = `
  .munsaqah-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    line-height: 0;
    max-width: 100%;
    min-width: 0;
    overflow: visible;
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
    direction: ltr;
    isolation: isolate;
    white-space: nowrap;
  }

  .munsaqah-logo img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: center;
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
    filter: none !important;
    mix-blend-mode: normal !important;
    image-rendering: auto;
    transform: none !important;
  }

  /*
    Approved logo fix:
    - single image per logo, no split icon/wordmark/divider.
    - icon is already on the RIGHT in horizontal asset.
    - colors are generated from the approved reference image.
  */

  .munsaqah-logo--horizontal img {
    height: clamp(52px, 5.8vw, 76px);
    width: auto;
    max-width: min(360px, 46vw);
  }

  .munsaqah-logo--header img {
    height: clamp(48px, 5.4vw, 72px);
    max-width: min(340px, 42vw);
  }

  .munsaqah-logo--hero img {
    height: clamp(72px, 9vw, 128px);
    max-width: min(520px, 82vw);
  }

  .munsaqah-logo--mobile img {
    height: 54px;
    max-width: min(220px, 62vw);
  }

  .munsaqah-logo--footer img {
    height: 44px;
    max-width: 190px;
  }

  .munsaqah-logo--vertical img {
    height: clamp(116px, 18vw, 240px);
    width: auto;
    max-width: min(260px, 74vw);
  }

  .munsaqah-logo--icon img,
  .munsaqah-logo--compact img {
    height: 42px;
    width: auto;
    max-width: 42px;
  }

  .munsaqah-logo--loader img {
    height: clamp(92px, 12vw, 134px);
    width: auto;
    max-width: clamp(92px, 12vw, 134px);
    animation: munsaqahLogoPulse 1.4s ease-in-out infinite;
  }

  /* Override old broken split-logo classes if cached CSS still exists */
  .munsaqah-logo__mark,
  .munsaqah-logo__divider,
  .munsaqah-logo__wordmarks,
  .munsaqah-logo__ar,
  .munsaqah-logo__en {
    display: none !important;
  }

  .brand .munsaqah-logo,
  .brand-logo .munsaqah-logo,
  .public-brand-logo .munsaqah-logo,
  .site-logo .munsaqah-logo,
  .header-logo .munsaqah-logo,
  .footer-logo .munsaqah-logo {
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
  }

  body.od-theme-dark .munsaqah-logo,
  body.od-theme-dark .munsaqah-logo img {
    background: transparent !important;
    filter: none !important;
    mix-blend-mode: normal !important;
  }

  @keyframes munsaqahLogoPulse {
    0%, 100% { opacity: .78; }
    50% { opacity: 1; }
  }

  @media (max-width: 760px) {
    .munsaqah-logo--header img {
      height: 46px;
      max-width: min(190px, 56vw);
    }

    .munsaqah-logo--hero img {
      height: 64px;
      max-width: min(240px, 74vw);
    }

    .munsaqah-logo--vertical img {
      height: 148px;
      max-width: 200px;
    }
  }

  @media (max-width: 430px) {
    .munsaqah-logo--header img {
      height: 42px;
      max-width: 160px;
    }

    .munsaqah-logo--mobile img {
      height: 46px;
      max-width: 170px;
    }
  }
`;
