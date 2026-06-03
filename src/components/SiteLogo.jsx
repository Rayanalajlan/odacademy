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
  return "munsaqah-logo--header";
}

export default function SiteLogo({
  variant = "horizontal",
  context = "default",
  className = "",
  englishAlt = false
}) {
  const alt = englishAlt ? MUNSAQAH_ALT_EN : MUNSAQAH_ALT_AR;
  const isIcon = variant === "icon" || context === "loader";
  const isVertical = variant === "vertical";

  if (isIcon) {
    return (
      <span className={`munsaqah-logo munsaqah-logo--icon ${sizeClass(context)} ${className}`.trim()}>
        <style>{logoStyles}</style>
        <img src={MUNSAQAH_ASSETS.icon} alt={alt} decoding="async" draggable="false" />
      </span>
    );
  }

  if (isVertical) {
    return (
      <span className={`munsaqah-logo munsaqah-logo--vertical ${sizeClass(context)} ${className}`.trim()}>
        <style>{logoStyles}</style>
        <img src={MUNSAQAH_ASSETS.vertical} alt={alt} decoding="async" draggable="false" />
      </span>
    );
  }

  return (
    <span className={`munsaqah-logo munsaqah-logo--horizontal ${sizeClass(context)} ${className}`.trim()} aria-label={alt} role="img">
      <style>{logoStyles}</style>

      {/* RTL visual order: icon on the RIGHT, name on the LEFT. */}
      <span className="munsaqah-logo__mark" aria-hidden="true">
        <img src={MUNSAQAH_ASSETS.icon} alt="" decoding="async" draggable="false" />
      </span>

      <span className="munsaqah-logo__divider" aria-hidden="true" />

      <span className="munsaqah-logo__wordmarks" aria-hidden="true">
        <img className="munsaqah-logo__ar" src={MUNSAQAH_ASSETS.wordmarkAr} alt="" decoding="async" draggable="false" />
        <img className="munsaqah-logo__en" src={MUNSAQAH_ASSETS.wordmarkEn} alt="" decoding="async" draggable="false" />
      </span>
    </span>
  );
}

const logoStyles = `
  .munsaqah-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    max-width: 100%;
    flex: 0 0 auto;
    direction: rtl;
    background: transparent !important;
  }

  .munsaqah-logo img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    object-fit: contain;
    object-position: center;
    background: transparent !important;
    border: 0;
    image-rendering: auto;
  }

  .munsaqah-logo--horizontal {
    gap: 12px;
    min-width: 0;
  }

  .munsaqah-logo__mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .munsaqah-logo__divider {
    width: 1.5px;
    flex: 0 0 1.5px;
    border-radius: 99px;
    background: linear-gradient(180deg, rgba(239,228,255,.95), rgba(126,96,205,.85));
    box-shadow: 0 0 0 1px rgba(33,21,50,.18);
  }

  .munsaqah-logo__wordmarks {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    min-width: 0;
    flex: 0 1 auto;
  }

  .munsaqah-logo__ar,
  .munsaqah-logo__en {
    max-width: 100%;
  }

  .munsaqah-logo--header .munsaqah-logo__mark img { height: clamp(36px, 4vw, 48px); }
  .munsaqah-logo--header .munsaqah-logo__divider { height: clamp(32px, 3.6vw, 44px); }
  .munsaqah-logo--header .munsaqah-logo__wordmarks { width: clamp(96px, 12vw, 148px); gap: 4px; }
  .munsaqah-logo--header .munsaqah-logo__ar { height: clamp(20px, 2.3vw, 30px); }
  .munsaqah-logo--header .munsaqah-logo__en { height: clamp(10px, 1.2vw, 15px); }

  .munsaqah-logo--hero .munsaqah-logo__mark img { height: clamp(42px, 5vw, 60px); }
  .munsaqah-logo--hero .munsaqah-logo__divider { height: clamp(38px, 4.6vw, 54px); }
  .munsaqah-logo--hero .munsaqah-logo__wordmarks { width: clamp(118px, 18vw, 184px); gap: 5px; }
  .munsaqah-logo--hero .munsaqah-logo__ar { height: clamp(24px, 3vw, 36px); }
  .munsaqah-logo--hero .munsaqah-logo__en { height: clamp(11px, 1.6vw, 17px); }

  .munsaqah-logo--mobile .munsaqah-logo__mark img { height: 50px; }
  .munsaqah-logo--mobile .munsaqah-logo__divider { height: 46px; }
  .munsaqah-logo--mobile .munsaqah-logo__wordmarks { width: 140px; gap: 4px; }
  .munsaqah-logo--mobile .munsaqah-logo__ar { height: 28px; }
  .munsaqah-logo--mobile .munsaqah-logo__en { height: 14px; }

  .munsaqah-logo--footer .munsaqah-logo__mark img { height: 28px; }
  .munsaqah-logo--footer .munsaqah-logo__divider { height: 26px; }
  .munsaqah-logo--footer .munsaqah-logo__wordmarks { width: 82px; gap: 3px; }
  .munsaqah-logo--footer .munsaqah-logo__ar { height: 17px; }
  .munsaqah-logo--footer .munsaqah-logo__en { height: 8px; }

  .munsaqah-logo--icon img,
  .munsaqah-logo--vertical img {
    max-width: 100%;
    max-height: 100%;
  }

  .munsaqah-logo--loader img {
    height: 52px;
    width: auto;
    animation: munsaqahLogoPulse 1.4s ease-in-out infinite;
  }

  @keyframes munsaqahLogoPulse {
    0%, 100% { transform: scale(.94); opacity: .72; }
    50% { transform: scale(1); opacity: 1; }
  }

  @media (max-width: 720px) {
    .munsaqah-logo--header .munsaqah-logo__mark img { height: 34px; }
    .munsaqah-logo--header .munsaqah-logo__divider { height: 31px; }
    .munsaqah-logo--header .munsaqah-logo__wordmarks { width: 92px; gap: 3px; }
    .munsaqah-logo--header .munsaqah-logo__ar { height: 18px; }
    .munsaqah-logo--header .munsaqah-logo__en { height: 9px; }

    .munsaqah-logo--hero .munsaqah-logo__mark img { height: 38px; }
    .munsaqah-logo--hero .munsaqah-logo__divider { height: 35px; }
    .munsaqah-logo--hero .munsaqah-logo__wordmarks { width: 108px; }
    .munsaqah-logo--hero .munsaqah-logo__ar { height: 22px; }
    .munsaqah-logo--hero .munsaqah-logo__en { height: 10px; }
  }
`;
