export default function ExperienceDesignSkin() {
  return (
    <style>{`
      /*
        Phase 43 - Visual redesign skin
        Design-only layer:
        - لا يغير النصوص.
        - لا يغير المنطق.
        - لا يغير Supabase/Auth/API.
        - لا يضيف dependencies.
        - لا يغير font-family حتى لا تتكرر مشكلة تغيير الخطوط.
      */

      :root {
        --lab-ink: #120a22;
        --lab-deep: #0e0820;
        --lab-navy: #170d2c;
        --lab-panel: rgba(28, 16, 52, .88);
        --lab-panel-soft: rgba(255, 255, 255, .78);
        --lab-line: rgba(167, 139, 250, .22);
        --lab-line-strong: rgba(196, 181, 253, .38);
        --lab-warm: #f7f3fc;
        --lab-paper: #ede6f7;
        --lab-muted: #7a6c9a;
        --lab-muted-dark: #b6a8d6;
        --lab-gold: #a855f7;
        --lab-gold-soft: rgba(168, 85, 247, .16);
        --lab-indigo: #8b5cf6;
        --lab-violet: #a78bfa;
        --lab-cyan: #7c3aed;
        --lab-green: #7c3aed;
        --lab-radius-xl: 34px;
        --lab-radius-lg: 24px;
        --lab-radius-md: 16px;
        --lab-shadow-deep: 0 30px 110px rgba(12, 7, 23, .30);
        --lab-shadow-soft: 0 20px 60px rgba(28, 17, 48, .10);
        --lab-grid:
          linear-gradient(rgba(167, 139, 250, .075) 1px, transparent 1px),
          linear-gradient(90deg, rgba(167, 139, 250, .075) 1px, transparent 1px);
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        background:
          radial-gradient(circle at 7% 4%, rgba(139, 92, 246, .10), transparent 32%),
          radial-gradient(circle at 93% 16%, rgba(168, 85, 247, .12), transparent 30%),
          linear-gradient(180deg, #f7f3fc 0%, #efe9fb 46%, #f7f3fc 100%) !important;
      }

      body::selection {
        color: #fff;
        background: #8b5cf6;
      }

      button,
      a,
      input,
      textarea,
      select {
        transition:
          transform .22s ease,
          box-shadow .22s ease,
          border-color .22s ease,
          background .22s ease,
          color .22s ease,
          opacity .22s ease !important;
      }

      button:focus-visible,
      a:focus-visible,
      input:focus-visible,
      textarea:focus-visible,
      select:focus-visible {
        outline: 3px solid rgba(168, 85, 247, .78) !important;
        outline-offset: 3px !important;
      }

      /* =========================
         Public visitor page
      ========================= */

      .public-gate {
        position: relative !important;
        overflow-x: clip !important;
        background:
          radial-gradient(circle at 12% 8%, rgba(139, 92, 246, .18), transparent 30%),
          radial-gradient(circle at 88% 10%, rgba(168, 85, 247, .15), transparent 34%),
          linear-gradient(180deg, #0c0717 0%, #120a22 60%, #0c0717 100%) !important;
        color: #ece6f8 !important;
        padding-top: clamp(14px, 3vw, 28px) !important;
      }

      .public-gate::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background-image: var(--lab-grid);
        background-size: 34px 34px;
        opacity: .50;
        mask-image: linear-gradient(to bottom, #000 0%, #000 45%, transparent 78%);
      }

      .public-gate::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 18% 26%, rgba(168, 85, 247,.18), transparent 3px),
          radial-gradient(circle at 64% 18%, rgba(124, 58, 237,.18), transparent 3px),
          radial-gradient(circle at 76% 38%, rgba(167, 139, 250,.20), transparent 3px),
          linear-gradient(120deg, transparent 0 22%, rgba(196, 181, 253,.08) 22% 22.2%, transparent 22.4% 100%);
        opacity: .8;
        mask-image: linear-gradient(to bottom, #000 0%, transparent 56%);
      }

      .public-wrap {
        position: relative !important;
        z-index: 1 !important;
        width: min(1220px, calc(100% - 28px)) !important;
      }

      .public-hero {
        position: relative !important;
        isolation: isolate !important;
        min-height: min(760px, calc(100vh - 56px)) !important;
        align-items: stretch !important;
        gap: clamp(18px, 3vw, 34px) !important;
        padding: clamp(24px, 5vw, 58px) !important;
        border-radius: clamp(26px, 4vw, 46px) !important;
        overflow: hidden !important;
        border: 1px solid rgba(196, 181, 253,.18) !important;
        background:
          radial-gradient(circle at 8% 12%, rgba(139, 92, 246,.18), transparent 30%),
          radial-gradient(circle at 88% 18%, rgba(168, 85, 247,.18), transparent 28%),
          linear-gradient(135deg, #160c2a 0%, #120a22 55%, #1a1030 100%) !important;
        box-shadow: 0 34px 100px rgba(59, 29, 110, .18) !important;
      }

      .public-hero::before {
        content: "";
        position: absolute;
        inset: -25%;
        z-index: -2;
        background:
          radial-gradient(circle at 25% 35%, rgba(124, 58, 237, .35), transparent 4px),
          radial-gradient(circle at 33% 62%, rgba(168, 85, 247, .38), transparent 3px),
          radial-gradient(circle at 70% 32%, rgba(167, 139, 250, .42), transparent 5px),
          radial-gradient(circle at 80% 66%, rgba(124, 58, 237, .32), transparent 3px),
          linear-gradient(90deg, transparent 0 22%, rgba(255,255,255,.10) 22.1% 22.2%, transparent 22.3% 100%),
          linear-gradient(140deg, transparent 0 37%, rgba(168, 85, 247,.10) 37.1% 37.3%, transparent 37.4% 100%);
        background-size: 520px 520px, 480px 480px, 620px 620px, 540px 540px, 100% 100%, 100% 100%;
        animation: labNodeDrift 22s ease-in-out infinite alternate;
        opacity: .78;
      }

      .public-hero::after {
        content: "م ن س ق ة  ·  م ن س ق ة  ·  م ن س ق ة  ·  م ن س ق ة";
        position: absolute;
        inset-inline-start: clamp(18px, 4vw, 52px);
        bottom: clamp(14px, 3vw, 30px);
        z-index: -1;
        color: rgba(196, 181, 253,.06);
        font-size: clamp(42px, 7vw, 96px);
        line-height: 1;
        font-weight: 950;
        letter-spacing: 0;
        white-space: nowrap;
        direction: rtl;
        animation: munsaqahLettersFloat 38s linear infinite;
      }

      .public-hero > div:first-child {
        position: relative !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        min-width: 0 !important;
      }

      .public-brand-logo {
        position: relative !important;
        margin-bottom: clamp(20px, 4vw, 34px) !important;
        padding: 8px 12px !important;
        border-radius: 18px !important;
        background: rgba(30, 18, 55, .5) !important;
        border: 1px solid rgba(139, 92, 246, .18) !important;
        box-shadow: 0 16px 40px rgba(59, 29, 110, .08) !important;
        backdrop-filter: blur(12px) !important;
      }

      .public-brand-logo .munsaqah-logo--hero .munsaqah-logo__mark img {
        height: clamp(38px, 5vw, 54px) !important;
      }

      .public-brand-logo .munsaqah-logo--hero .munsaqah-logo__divider {
        height: clamp(34px, 4.6vw, 48px) !important;
      }

      .public-brand-logo .munsaqah-logo--hero .munsaqah-logo__wordmarks {
        width: clamp(108px, 16vw, 170px) !important;
        gap: 4px !important;
      }

      .public-brand-logo .munsaqah-logo--hero .munsaqah-logo__ar {
        height: clamp(22px, 2.8vw, 32px) !important;
      }

      .public-brand-logo .munsaqah-logo--hero .munsaqah-logo__en {
        height: clamp(10px, 1.5vw, 16px) !important;
      }

      .public-badge {
        width: fit-content !important;
        border-radius: 999px !important;
        padding: 9px 15px !important;
        color: #ddd6fe !important;
        background: rgba(168, 85, 247, .12) !important;
        border: 1px solid rgba(168, 85, 247, .28) !important;
        box-shadow: 0 0 40px rgba(168, 85, 247, .10) !important;
      }

      .public-hero h1 {
        max-width: 760px !important;
        margin: clamp(18px, 3vw, 26px) 0 16px !important;
        color: #f1ecfb !important;
        font-size: clamp(46px, 7.8vw, 104px) !important;
        line-height: .98 !important;
        letter-spacing: 0 !important;
        text-wrap: balance !important;
        text-shadow: none !important;
      }

      .public-hero p {
        max-width: 680px !important;
        color: #b6a8d6 !important;
        font-size: clamp(15px, 1.35vw, 18px) !important;
        line-height: 2.05 !important;
      }

      .hero-points {
        position: relative !important;
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 12px !important;
        margin-top: clamp(22px, 4vw, 34px) !important;
      }

      .hero-points::before {
        content: "";
        position: absolute;
        top: 30px;
        inset-inline: 40px;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(124, 58, 237,.36), rgba(168, 85, 247,.34), transparent);
        pointer-events: none;
      }

      .hero-point {
        position: relative !important;
        overflow: hidden !important;
        border-radius: 18px !important;
        padding: 18px !important;
        background: rgba(28, 17, 48, .6) !important;
        border: 1px solid rgba(139, 92, 246,.18) !important;
        backdrop-filter: blur(16px) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.08) !important;
      }

      .hero-point::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.10), transparent);
        transform: translateX(120%);
        animation: labScan 7s ease-in-out infinite;
      }

      .hero-point b {
        background: rgba(124, 58, 237, .12) !important;
        color: #e6daf9 !important;
        border: 1px solid rgba(124, 58, 237, .24) !important;
      }

      .hero-point strong {
        color: #f1ecfb !important;
      }

      .hero-point span {
        color: #b6a8d6 !important;
      }

      .auth-card {
        position: relative !important;
        align-self: center !important;
        width: min(430px, 100%) !important;
        border-radius: 26px !important;
        padding: clamp(18px, 2.6vw, 28px) !important;
        background:
          radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 34%),
          linear-gradient(180deg, rgba(30,18,55,.94), rgba(18,11,34,.96)) !important;
        border: 1px solid rgba(139, 92, 246,.20) !important;
        box-shadow:
          0 22px 68px rgba(59, 29, 110,.16),
          inset 0 1px 0 rgba(255,255,255,.06) !important;
        backdrop-filter: blur(22px) !important;
      }

      .auth-card::before {
        content: "ACCESS PANEL";
        display: block;
        margin-bottom: 12px;
        color: #8b5cf6;
        font-size: 11px;
        font-weight: 950;
        letter-spacing: .12em;
      }

      .auth-tabs {
        border-radius: 16px !important;
        background: rgba(139, 92, 246,.09) !important;
        border: 1px solid rgba(139, 92, 246,.14) !important;
        padding: 6px !important;
      }

      .auth-tabs button {
        border-radius: 12px !important;
        color: #b6a8d6 !important;
        background: transparent !important;
      }

      .auth-tabs button.active {
        color: #ffffff !important;
        background: linear-gradient(135deg, #8b5cf6, #6d28d9) !important;
        box-shadow: 0 12px 30px rgba(168, 85, 247, .22) !important;
      }

      .auth-title {
        color: #f1ecfb !important;
      }

      .auth-field label {
        color: #b6a8d6 !important;
      }

      .auth-field input,
      .password-row input {
        min-height: 48px !important;
        border-radius: 14px !important;
        color: #f1ecfb !important;
        background: rgba(12, 7, 23, .55) !important;
        border: 1px solid rgba(139, 92, 246,.20) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.06) !important;
      }

      .auth-field input::placeholder,
      .password-row input::placeholder {
        color: rgba(111, 99, 145,.62) !important;
      }

      .hint {
        color: #9d8fc0 !important;
      }

      .toggle-password,
      .forgot-button,
      .auth-ghost {
        color: #a855f7 !important;
      }

      .auth-primary {
        min-height: 50px !important;
        border-radius: 15px !important;
        color: #ffffff !important;
        background: linear-gradient(135deg, #8b5cf6, #6d28d9) !important;
        box-shadow: 0 18px 46px rgba(168, 85, 247, .28) !important;
      }

      .auth-primary:hover,
      .sample-button:hover,
      .mobile-nav-resume:hover {
        transform: translateY(-2px) !important;
      }

      .auth-notice {
        border-radius: 14px !important;
        background: rgba(124, 58, 237,.10) !important;
        border-color: rgba(124, 58, 237,.24) !important;
        color: #e6daf9 !important;
      }

      .public-section {
        position: relative !important;
        margin-top: clamp(24px, 5vw, 54px) !important;
        border-radius: 28px !important;
        padding: clamp(20px, 4vw, 34px) !important;
        background:
          radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.08), transparent 30%),
          rgba(18, 11, 34, .82) !important;
        border: 1px solid rgba(167, 139, 250,.16) !important;
        box-shadow: var(--lab-shadow-soft) !important;
      }

      .section-head {
        align-items: end !important;
        gap: 18px !important;
        margin-bottom: clamp(16px, 3vw, 26px) !important;
      }

      .section-head h2 {
        color: #f1ecfb !important;
        font-size: clamp(28px, 4.4vw, 58px) !important;
        line-height: 1.08 !important;
        letter-spacing: 0 !important;
        text-wrap: balance !important;
      }

      .section-head p {
        color: #9d8fc0 !important;
        line-height: 2 !important;
      }

      .counter-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 14px !important;
      }

      .counter-card {
        position: relative !important;
        overflow: hidden !important;
        min-height: 132px !important;
        border-radius: 20px !important;
        padding: 20px !important;
        background:
          radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 34%),
          linear-gradient(135deg, rgba(30,18,55,.94), rgba(18,11,34,.95)) !important;
        border: 1px solid rgba(139, 92, 246,.18) !important;
        box-shadow: 0 18px 52px rgba(59, 29, 110,.10) !important;
      }

      .counter-card::before {
        content: "";
        position: absolute;
        inset-inline: 18px;
        top: 14px;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--lab-cyan), var(--lab-gold), transparent);
        animation: labMetricPulse 3.8s ease-in-out infinite;
      }

      .counter-card strong {
        color: #f1ecfb !important;
        font-size: clamp(34px, 4vw, 54px) !important;
        line-height: 1 !important;
      }

      .counter-card span {
        color: #b6a8d6 !important;
      }

      .path-grid {
        position: relative !important;
        display: grid !important;
        grid-template-columns: repeat(6, minmax(150px, 1fr)) !important;
        gap: 12px !important;
        overflow-x: auto !important;
        padding-bottom: 8px !important;
        scrollbar-width: thin !important;
      }

      .path-grid::before {
        content: "";
        position: absolute;
        top: 42px;
        inset-inline: 30px;
        height: 1px;
        background: linear-gradient(90deg, rgba(124, 58, 237,.12), rgba(168, 85, 247,.42), rgba(139, 92, 246,.24));
        pointer-events: none;
      }

      .path-card {
        position: relative !important;
        min-height: 210px !important;
        border-radius: 20px !important;
        padding: 18px !important;
        background:
          linear-gradient(180deg, rgba(28,17,48,.85), rgba(18,11,34,.92)) !important;
        border: 1px solid rgba(167, 139, 250,.20) !important;
        box-shadow: 0 18px 52px rgba(28, 17, 48,.08) !important;
      }

      .path-card::after {
        content: "";
        position: absolute;
        inset-inline-end: 18px;
        top: 37px;
        width: 10px;
        height: 10px;
        border-radius: 99px;
        background: #7c3aed;
        box-shadow: 0 0 0 7px rgba(124, 58, 237,.12), 0 0 22px rgba(124, 58, 237,.42);
      }

      .path-card b {
        color: #a855f7 !important;
        background: rgba(168, 85, 247,.12) !important;
        border-color: rgba(168, 85, 247,.20) !important;
      }

      .path-card strong {
        color: #f1ecfb !important;
        font-size: 16px !important;
      }

      .path-card span {
        color: #b6a8d6 !important;
        line-height: 1.9 !important;
      }

      .two-grid {
        grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr) !important;
        gap: 16px !important;
      }

      .sample-box {
        position: relative !important;
        overflow: hidden !important;
        border-radius: 22px !important;
        padding: clamp(20px, 3vw, 28px) !important;
        background:
          radial-gradient(circle at 88% 10%, rgba(139, 92, 246,.14), transparent 28%),
          linear-gradient(135deg, rgba(30,18,55,.94), rgba(18,11,34,.95)) !important;
        border: 1px solid rgba(139, 92, 246,.18) !important;
        box-shadow: 0 18px 52px rgba(59, 29, 110,.10) !important;
      }

      .sample-box::before {
        content: "CASE FILE";
        position: absolute;
        inset-inline-end: 18px;
        top: 18px;
        color: rgba(168, 85, 247,.62);
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .16em;
      }

      .sample-kicker {
        color: #6d28d9 !important;
        background: rgba(139, 92, 246,.12) !important;
        border: 1px solid rgba(139, 92, 246,.18) !important;
      }

      .sample-box h3 {
        color: #f1ecfb !important;
        font-size: clamp(22px, 3vw, 34px) !important;
      }

      .sample-box p,
      .sample-bullets li {
        color: #b6a8d6 !important;
      }

      .sample-button {
        border-radius: 14px !important;
        color: #ffffff !important;
        background: linear-gradient(135deg, #8b5cf6, #6d28d9) !important;
        box-shadow: 0 18px 42px rgba(168, 85, 247,.22) !important;
      }

      .about-panel {
        display: grid !important;
        grid-template-columns: 1.2fr .8fr !important;
        gap: 16px !important;
        align-items: stretch !important;
      }

      .info-card,
      .legal-card,
      .faq-item,
      .visitor-testimonials,
      .vt-form,
      .vt-card {
        border-radius: 18px !important;
        background:
          linear-gradient(180deg, rgba(28,17,48,.85), rgba(18,11,34,.92)) !important;
        border: 1px solid rgba(167, 139, 250,.18) !important;
        box-shadow: 0 16px 44px rgba(28, 17, 48,.07) !important;
      }

      .info-card strong,
      .legal-card strong,
      .faq-question span:first-child {
        color: #f1ecfb !important;
      }

      .info-card span,
      .legal-card span,
      .faq-answer {
        color: #b6a8d6 !important;
        line-height: 1.95 !important;
      }

      .about-links a {
        border-radius: 999px !important;
        color: #ffffff !important;
        background: rgba(168, 85, 247,.14) !important;
        border: 1px solid rgba(168, 85, 247,.20) !important;
      }

      .faq-list {
        display: grid !important;
        gap: 10px !important;
      }

      .faq-item {
        overflow: hidden !important;
      }

      .faq-question {
        min-height: 62px !important;
      }

      .faq-question[aria-expanded="true"] {
        background: rgba(139, 92, 246,.08) !important;
      }

      .legal-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 12px !important;
      }

      .public-footer,
      .site-footer {
        position: relative !important;
        margin-top: clamp(26px, 5vw, 60px) !important;
        border-radius: 26px !important;
        padding: 22px !important;
        color: #b6a8d6 !important;
        background:
          radial-gradient(circle at 0% 100%, rgba(168, 85, 247,.16), transparent 30%),
          linear-gradient(135deg, rgba(26,15,48,.92), rgba(16,9,28,.96)) !important;
        border: 1px solid rgba(139, 92, 246,.18) !important;
        box-shadow: 0 18px 52px rgba(59, 29, 110,.10) !important;
      }

      .public-footer span,
      .site-footer span {
        color: #9d8fc0 !important;
      }

      .public-footer-logo .munsaqah-logo--footer .munsaqah-logo__mark img {
        height: 30px !important;
      }

      .public-footer-logo .munsaqah-logo--footer .munsaqah-logo__divider {
        height: 28px !important;
      }

      .public-footer-logo .munsaqah-logo--footer .munsaqah-logo__wordmarks {
        width: 86px !important;
      }

      /* =========================
         Inner authenticated app
      ========================= */

      .site-frame {
        min-height: 100vh !important;
        overflow-x: clip !important;
        background:
          radial-gradient(circle at 8% 6%, rgba(139, 92, 246,.16), transparent 28%),
          radial-gradient(circle at 88% 12%, rgba(168, 85, 247,.13), transparent 26%),
          linear-gradient(180deg, #f7f3fc 0%, #efe9fb 26%, #f7f3fc 26%, #ede6f7 100%) !important;
      }

      .site-frame::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        background-image: var(--lab-grid);
        background-size: 32px 32px;
        opacity: .34;
        mask-image: linear-gradient(to bottom, #000 0%, transparent 65%);
      }

      .site-header {
        position: sticky !important;
        top: 14px !important;
        z-index: 70 !important;
        width: min(1220px, calc(100% - 28px)) !important;
        margin: 14px auto 18px !important;
        border-radius: 26px !important;
        padding: 14px !important;
        background:
          linear-gradient(135deg, rgba(255,255,255,.90), rgba(237, 230, 251,.90)) !important;
        border: 1px solid rgba(139, 92, 246,.20) !important;
        backdrop-filter: blur(20px) !important;
        box-shadow: 0 18px 52px rgba(59, 29, 110, .12) !important;
      }

      .main-nav {
        gap: 8px !important;
      }

      .main-nav button,
      .educational-tools-trigger {
        min-height: 42px !important;
        border-radius: 999px !important;
        color: #6f6391 !important;
        background: rgba(255,255,255,.62) !important;
        border: 1px solid rgba(139, 92, 246,.14) !important;
        box-shadow: none !important;
      }

      .main-nav button:hover,
      .educational-tools-trigger:hover {
        color: #1a1030 !important;
        transform: translateY(-1px) !important;
        background: rgba(255,255,255,.12) !important;
      }

      .main-nav button.active,
      .educational-tools-trigger.active {
        color: #0e0820 !important;
        background: linear-gradient(135deg, #d9c9fa, #a855f7) !important;
        box-shadow: 0 16px 36px rgba(168, 85, 247,.22) !important;
      }

      .logout-button {
        border-radius: 16px !important;
        background: rgba(127,29,29,.36) !important;
        border: 1px solid rgba(248,113,113,.20) !important;
      }

      .global-notice,
      .page-loader,
      .profile-strip,
      .home-card,
      .feature-card,
      .od-card,
      .radar-card,
      .simulation-card,
      .ai-mentor-card,
      .portfolio-section,
      .portfolio-stat,
      .course-search-box,
      .saved-lessons-panel,
      .weekly-reflection-panel,
      .monthly-certificates,
      .jl-card,
      .jl-reader,
      .jl-quiz,
      .jl-hero,
      .jl-month-card,
      .jl-week-card,
      .jl-day-card,
      [class*="card"],
      [class*="panel"] {
        border-radius: 24px !important;
        border-color: rgba(167, 139, 250,.18) !important;
        box-shadow: 0 18px 56px rgba(28, 17, 48,.08) !important;
      }

      .profile-strip {
        width: min(1160px, calc(100% - 28px)) !important;
        margin: 0 auto 18px !important;
        background:
          radial-gradient(circle at 100% 0%, rgba(124, 58, 237,.08), transparent 28%),
          rgba(255,255,255,.82) !important;
        border: 1px solid rgba(196, 181, 253,.62) !important;
        backdrop-filter: blur(18px) !important;
      }

      .page-loader {
        background:
          radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 30%),
          rgba(247, 243, 252,.92) !important;
      }

      .mobile-menu-button {
        border-radius: 16px !important;
        color: #0e0820 !important;
        background: linear-gradient(135deg, #d9c9fa, #a855f7) !important;
      }


      /* =========================
         Phase 48 fixes:
         1) إزالة العبارة الإنجليزية من خلفية البطل واستبدالها بحروف منسقة.
         2) تحسين وضوح الوضع الفاتح.
         3) إجبار الخلفية الداكنة عند تفعيل الوضع الداكن.
      ========================= */

      body:not(.od-theme-dark) .site-frame {
        background:
          radial-gradient(circle at 12% 8%, rgba(139, 92, 246,.14), transparent 30%),
          radial-gradient(circle at 90% 14%, rgba(168, 85, 247,.12), transparent 28%),
          linear-gradient(180deg, #0e0820 0%, #1c1138 34%, #efe9fb 34%, #f7f3fc 100%) !important;
      }

      body:not(.od-theme-dark) .od-timer-command {
        background:
          radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.13), transparent 34%),
          linear-gradient(135deg, rgba(16, 9, 30,.96), rgba(30, 18, 58,.94)) !important;
        border-color: rgba(196, 181, 253,.16) !important;
        box-shadow: 0 24px 80px rgba(12, 7, 23,.22) !important;
      }

      body:not(.od-theme-dark) .od-timer-content h2 {
        color: #f7f3fc !important;
        text-shadow: 0 14px 34px rgba(0,0,0,.24) !important;
      }
      body:not(.od-theme-dark) .od-section-head h2 {
        /* عنوان القسم على سطح فاتح -> نص داكن مقروء (كان فاتحًا فيختفي) */
        color: #1b1233 !important;
        text-shadow: none !important;
      }

      body:not(.od-theme-dark) .od-timer-content p {
        color: #d6cdec !important;
      }
      body:not(.od-theme-dark) .od-section-head p {
        color: #4c4170 !important;
      }

      body:not(.od-theme-dark) .od-section-kicker {
        color: #6d28d9 !important;
        background: rgba(255,255,255,.82) !important;
        border: 1px solid rgba(139, 92, 246,.18) !important;
      }

      body:not(.od-theme-dark) .od-stat-card {
        background: rgba(28, 17, 48,.92) !important;
        border-color: rgba(196, 181, 253,.14) !important;
        color: #f4f0fb !important;
        box-shadow: 0 20px 52px rgba(12, 7, 23,.20) !important;
      }

      body:not(.od-theme-dark) .od-stat-card strong,
      body:not(.od-theme-dark) .od-stat-card b {
        color: #f7f3fc !important;
      }

      body:not(.od-theme-dark) .od-stat-card span,
      body:not(.od-theme-dark) .od-stat-card small,
      body:not(.od-theme-dark) .od-stat-card p {
        color: #c9bdf0 !important;
      }

      body:not(.od-theme-dark) .public-section {
        background:
          radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.07), transparent 30%),
          rgba(247, 243, 252,.92) !important;
      }

      body.od-theme-dark,
      html[data-theme="dark"],
      html[data-theme="dark"] body,
      html[data-theme="dark"] #root,
      body.od-theme-dark #root,
      body.od-theme-dark main,
      body.od-theme-dark .site-frame,
      body.od-theme-dark .public-gate,
      body.od-theme-dark .public-wrap,
      body.od-theme-dark .content,
      body.od-theme-dark .main-content {
        background:
          radial-gradient(circle at 12% 8%, rgba(139, 92, 246,.15), transparent 30%),
          radial-gradient(circle at 88% 14%, rgba(124, 58, 237,.08), transparent 26%),
          #0c0717 !important;
        color: #e9e4f5 !important;
      }

      body.od-theme-dark::before,
      html[data-theme="dark"] body::before {
        content: "";
        position: fixed;
        inset: 0;
        z-index: -1;
        pointer-events: none;
        background:
          radial-gradient(circle at 12% 8%, rgba(139, 92, 246,.22), transparent 30%),
          radial-gradient(circle at 88% 16%, rgba(124, 58, 237,.12), transparent 26%),
          #0c0717 !important;
      }

      @keyframes munsaqahLettersFloat {
        0% { transform: translate3d(18vw, 0, 0) rotate(-1deg); opacity: .045; }
        25% { transform: translate3d(4vw, -18px, 0) rotate(.8deg); opacity: .075; }
        55% { transform: translate3d(-10vw, 12px, 0) rotate(-.6deg); opacity: .055; }
        100% { transform: translate3d(-28vw, -8px, 0) rotate(.4deg); opacity: .07; }
      }


      /* =========================
         Dark mode integration
      ========================= */

      body.od-theme-dark {
        background: #0c0717 !important;
      }

      body.od-theme-dark .site-frame,
      body.od-theme-dark .public-gate,
      body.od-theme-dark .od-home-v2,
      body.od-theme-dark .about-rayan,
      body.od-theme-dark .admin-dashboard,
      body.od-theme-dark .ai-command-page,
      body.od-theme-dark .journey-lab,
      body.od-theme-dark .learning-journey,
      body.od-theme-dark .mastery-page,
      body.od-theme-dark .roi-page,
      body.od-theme-dark .sim-root,
      body.od-theme-dark .verify-page,
      body.od-theme-dark .learning-portfolio {
        background:
          radial-gradient(circle at 10% 8%, rgba(124, 58, 237,.10), transparent 28%),
          radial-gradient(circle at 88% 10%, rgba(168, 85, 247,.10), transparent 26%),
          linear-gradient(180deg, #0c0717 0%, #0e0820 100%) !important;
        color: #ece6f8 !important;
      }

      body.od-theme-dark .od-home-v2::before,
      body.od-theme-dark .about-rayan::before,
      body.od-theme-dark .admin-dashboard::before,
      body.od-theme-dark .ai-command-page::before,
      body.od-theme-dark .journey-lab::before,
      body.od-theme-dark .learning-journey::before,
      body.od-theme-dark .mastery-page::before,
      body.od-theme-dark .roi-page::before,
      body.od-theme-dark .sim-root::before,
      body.od-theme-dark .verify-page::before {
        background-image:
          linear-gradient(rgba(167, 139, 250,.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(167, 139, 250,.05) 1px, transparent 1px) !important;
      }

      body.od-theme-dark .public-section,
      body.od-theme-dark .profile-strip,
      body.od-theme-dark .home-card,
      body.od-theme-dark .feature-card,
      body.od-theme-dark .od-card,
      body.od-theme-dark .info-card,
      body.od-theme-dark .legal-card,
      body.od-theme-dark .faq-item,
      body.od-theme-dark .path-card,
      body.od-theme-dark .visitor-testimonials,
      body.od-theme-dark .vt-form,
      body.od-theme-dark .vt-card,
      body.od-theme-dark [class*="card"],
      body.od-theme-dark [class*="panel"],
      body.od-theme-dark [class*="od-timer"],
      body.od-theme-dark [class*="command"],
      body.od-theme-dark [class*="tracker"],
      body.od-theme-dark [class*="-strip"],
      body.od-theme-dark [class*="-tile"],
      body.od-theme-dark [class*="-box"],
      body.od-theme-dark .profile-metric,
      body.od-theme-dark .profile-stat,
      body.od-theme-dark .day-step,
      body.od-theme-dark .portfolio-stat,
      body.od-theme-dark .portfolio-section,
      body.od-theme-dark .portfolio-notice,
      body.od-theme-dark .roi-reading,
      body.od-theme-dark .roi-source,
      body.od-theme-dark .roi-disclaimer,
      body.od-theme-dark .scenario-node,
      body.od-theme-dark .scenario-mini,
      body.od-theme-dark .message-bubble,
      body.od-theme-dark .archive-item,
      body.od-theme-dark .quota-timer,
      body.od-theme-dark .monthly-certificates,
      body.od-theme-dark .issued,
      body.od-theme-dark .course-search-result,
      body.od-theme-dark .course-search-empty,
      body.od-theme-dark .admin-notice,
      body.od-theme-dark .report-section,
      body.od-theme-dark .report-body,
      body.od-theme-dark .jl-week-intro,
      body.od-theme-dark .jl-reader,
      body.od-theme-dark .jl-mini-progress,
      body.od-theme-dark .ar-section {
        background:
          radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 28%),
          rgba(28, 17, 48, .94) !important;
        border-color: rgba(167, 139, 250,.22) !important;
        color: #e9e4f5 !important;
        box-shadow: 0 20px 70px rgba(0,0,0,.28) !important;
      }

      /* text inside the darkened content cards stays light/readable */
      body.od-theme-dark :is(
        .profile-metric, .profile-stat, .day-step, .portfolio-stat,
        .portfolio-section, .roi-reading, .roi-source, .scenario-node,
        .scenario-mini, .message-bubble, .archive-item, .quota-timer,
        .monthly-certificates, .issued, .course-search-result,
        .jl-week-intro, .jl-reader, .jl-mini-progress
      ) :is(strong, b, span, p, small, label, time, div, h1, h2, h3, h4) {
        color: #ece6f8 !important;
      }

      body.od-theme-dark h1,
      body.od-theme-dark h2,
      body.od-theme-dark h3,
      body.od-theme-dark strong,
      body.od-theme-dark b {
        color: #f7f3fc !important;
      }

      body.od-theme-dark p,
      body.od-theme-dark span,
      body.od-theme-dark li,
      body.od-theme-dark small,
      body.od-theme-dark label,
      body.od-theme-dark .section-head p,
      body.od-theme-dark .info-card span,
      body.od-theme-dark .legal-card span,
      body.od-theme-dark .faq-answer {
        color: #c9bdf0 !important;
      }

      body.od-theme-dark .auth-card,
      body.od-theme-dark .sample-box,
      body.od-theme-dark .counter-card,
      body.od-theme-dark .site-header,
      body.od-theme-dark .public-footer,
      body.od-theme-dark .site-footer {
        background:
          radial-gradient(circle at 100% 0%, rgba(124, 58, 237,.10), transparent 30%),
          linear-gradient(135deg, #0e0820, #1e1240) !important;
      }

      /* =========================
         Motion, responsive, accessibility
      ========================= */

      @keyframes labNodeDrift {
        from { transform: translate3d(0, 0, 0) rotate(0deg); }
        to { transform: translate3d(20px, -18px, 0) rotate(.8deg); }
      }

      @keyframes labScan {
        0%, 72% { transform: translateX(120%); opacity: 0; }
        78% { opacity: .8; }
        100% { transform: translateX(-120%); opacity: 0; }
      }

      @keyframes labMetricPulse {
        0%, 100% { opacity: .35; transform: scaleX(.4); }
        50% { opacity: 1; transform: scaleX(1); }
      }

      @media (max-width: 1060px) {
        .public-hero,
        .two-grid,
        .about-panel {
          grid-template-columns: 1fr !important;
        }

        .path-grid {
          grid-template-columns: repeat(3, minmax(220px, 1fr)) !important;
        }
      }

      @media (max-width: 760px) {
        .public-wrap,
        .site-header,
        .profile-strip {
          width: calc(100% - 18px) !important;
        }

        .public-gate {
          padding-inline: 0 !important;
        }

        .public-hero {
          min-height: auto !important;
          border-radius: 28px !important;
          padding: 22px !important;
        }

        .public-hero h1 {
          font-size: clamp(38px, 13vw, 58px) !important;
          line-height: 1.02 !important;
        }

        .hero-points,
        .counter-grid,
        .legal-grid {
          grid-template-columns: 1fr !important;
        }

        .hero-points::before,
        .path-grid::before {
          display: none !important;
        }

        .path-grid {
          grid-template-columns: 1fr !important;
          overflow-x: visible !important;
        }

        .counter-card,
        .path-card {
          min-height: auto !important;
        }

        .site-header {
          top: 8px !important;
          border-radius: 22px !important;
        }

        .public-section {
          border-radius: 24px !important;
          padding: 18px !important;
        }
      }

      /* =========================
         #5  Light-mode landing (visitor page follows the toggle)
         Base landing is dark; these restore a clean LIGHT landing
         only when the light theme is active.
      ========================= */
      body:not(.od-theme-dark) .public-gate {
        background:
          radial-gradient(circle at 12% 8%, rgba(139, 92, 246, .16), transparent 30%),
          radial-gradient(circle at 88% 10%, rgba(168, 85, 247, .13), transparent 34%),
          linear-gradient(180deg, #f7f3fc 0%, #efe9fb 45%, #f7f3fc 100%) !important;
        color: #18102e !important;
      }
      body:not(.od-theme-dark) .public-hero {
        background:
          radial-gradient(circle at 8% 12%, rgba(139, 92, 246, .16), transparent 30%),
          radial-gradient(circle at 88% 18%, rgba(168, 85, 247, .16), transparent 28%),
          linear-gradient(135deg, #ffffff 0%, #efe9fb 48%, #f3eefb 100%) !important;
      }
      body:not(.od-theme-dark) .public-hero::after { color: rgba(26, 16, 48, .06) !important; }
      body:not(.od-theme-dark) .public-hero h1 { color: #1a1030 !important; }
      body:not(.od-theme-dark) .public-hero p { color: #5b4f78 !important; }
      body:not(.od-theme-dark) .public-brand-logo { background: rgba(255, 255, 255, .72) !important; }
      body:not(.od-theme-dark) .hero-point { background: rgba(255, 255, 255, .72) !important; }
      body:not(.od-theme-dark) .hero-point strong { color: #1a1030 !important; }
      body:not(.od-theme-dark) .hero-point span { color: #5b4f78 !important; }
      body:not(.od-theme-dark) .public-badge {
        color: #5b21b6 !important;
        background: rgba(168, 85, 247, 0.14) !important;
        border-color: rgba(124, 58, 237, 0.32) !important;
      }
      body:not(.od-theme-dark) .hero-point b {
        color: #6d28d9 !important;
        background: rgba(124, 58, 237, 0.12) !important;
        border-color: rgba(124, 58, 237, 0.28) !important;
      }
      body:not(.od-theme-dark) .auth-card {
        background:
          radial-gradient(circle at 100% 0%, rgba(139, 92, 246, .12), transparent 34%),
          linear-gradient(180deg, rgba(255, 255, 255, .97), rgba(243, 236, 253, .92)) !important;
      }
      body:not(.od-theme-dark) .auth-title { color: #1a1030 !important; }
      body:not(.od-theme-dark) .auth-tabs button { color: #5b4f78 !important; }
      body:not(.od-theme-dark) .auth-field label { color: #5b4f78 !important; }
      body:not(.od-theme-dark) .auth-field input,
      body:not(.od-theme-dark) .password-row input {
        color: #1a1030 !important;
        background: rgba(255, 255, 255, .94) !important;
      }
      body:not(.od-theme-dark) .auth-field input::placeholder,
      body:not(.od-theme-dark) .password-row input::placeholder { color: rgba(91, 79, 120, .6) !important; }
      body:not(.od-theme-dark) .hint { color: #6f6391 !important; }
      body:not(.od-theme-dark) .public-section {
        background:
          radial-gradient(circle at 100% 0%, rgba(139, 92, 246, .08), transparent 30%),
          rgba(247, 243, 252, .9) !important;
      }
      body:not(.od-theme-dark) .section-head h2 { color: #120a22 !important; }
      body:not(.od-theme-dark) .section-head p { color: #5b4f78 !important; }
      body:not(.od-theme-dark) .counter-card {
        background:
          radial-gradient(circle at 100% 0%, rgba(139, 92, 246, .12), transparent 34%),
          linear-gradient(135deg, rgba(255, 255, 255, .97), rgba(243, 236, 253, .92)) !important;
      }
      body:not(.od-theme-dark) .counter-card strong { color: #1a1030 !important; }
      body:not(.od-theme-dark) .counter-card span { color: #5b4f78 !important; }
      body:not(.od-theme-dark) .path-card {
        background: linear-gradient(180deg, rgba(255, 255, 255, .94), rgba(255, 255, 255, .76)) !important;
      }
      body:not(.od-theme-dark) .path-card strong { color: #120a22 !important; }
      body:not(.od-theme-dark) .path-card span { color: #5b4f78 !important; }
      body:not(.od-theme-dark) .sample-box {
        background:
          radial-gradient(circle at 88% 10%, rgba(139, 92, 246, .12), transparent 28%),
          linear-gradient(135deg, rgba(255, 255, 255, .97), rgba(243, 236, 253, .92)) !important;
      }
      body:not(.od-theme-dark) .sample-box h3 { color: #1a1030 !important; }
      body:not(.od-theme-dark) .sample-box p,
      body:not(.od-theme-dark) .sample-bullets li { color: #5b4f78 !important; }
      body:not(.od-theme-dark) .info-card,
      body:not(.od-theme-dark) .legal-card,
      body:not(.od-theme-dark) .faq-item,
      body:not(.od-theme-dark) .visitor-testimonials,
      body:not(.od-theme-dark) .vt-form,
      body:not(.od-theme-dark) .vt-card {
        background: linear-gradient(180deg, rgba(255, 255, 255, .94), rgba(255, 255, 255, .76)) !important;
      }
      body:not(.od-theme-dark) .info-card strong,
      body:not(.od-theme-dark) .legal-card strong,
      body:not(.od-theme-dark) .faq-question span:first-child { color: #120a22 !important; }
      body:not(.od-theme-dark) .info-card span,
      body:not(.od-theme-dark) .legal-card span,
      body:not(.od-theme-dark) .faq-answer { color: #5b4f78 !important; }
      body:not(.od-theme-dark) .public-footer,
      body:not(.od-theme-dark) .site-footer {
        color: #5b4f78 !important;
        background:
          radial-gradient(circle at 0% 100%, rgba(168, 85, 247, .14), transparent 30%),
          linear-gradient(135deg, rgba(255, 255, 255, .94), rgba(237, 230, 251, .92)) !important;
      }
      body:not(.od-theme-dark) .public-footer span,
      body:not(.od-theme-dark) .site-footer span { color: #6f6391 !important; }

      /* =========================
         #2  Theme text safety net — guarantees readable contrast both ways.
         High specificity (double class) beats most component rules.
         Targets block-level text only, so accent spans/buttons keep color.
      ========================= */
      html body.od-theme-dark.od-theme-dark :is(h1, h2, h3, h4, h5, h6) { color: #f1ecfb !important; }
      html body.od-theme-dark.od-theme-dark :is(p, li, dd, dt, th, td, blockquote, figcaption) { color: #c9bdf0 !important; }
      html body:not(.od-theme-dark):not(.od-theme-dark) :is(h1, h2, h3, h4, h5, h6) { color: #18102e !important; }
      html body:not(.od-theme-dark):not(.od-theme-dark) :is(p, li, dd, dt, th, td, blockquote, figcaption) { color: #463c63 !important; }

      /* =========================
         Gradient-filled display headings (background-clip:text) were invisible
         in dark mode. Repaint them with a LIGHT gradient so they stay readable.
      ========================= */
      body.od-theme-dark :is(
        .od-hero h1 span, .jl-title span, .ar-title span,
        .roi-hero h1 span, .hero h1 span
      ) {
        /* كان: نص شفّاف بتدرّج (يختفي عند فشل القص). الآن: لون صلب مرئي دائمًا */
        background-image: none !important;
        -webkit-text-fill-color: #f1ecfb !important;
        color: #f1ecfb !important;
      }

      body.od-theme-dark :is(
        .od-timer-content h2, .od-section-head h2, .od-hero h1,
        .jl-title, .ar-title, .roi-hero h1,
        .od-feature-card h3, .od-lab-card h3, .od-quote-bar p
      ) {
        color: #f1ecfb !important;
        -webkit-text-fill-color: #f1ecfb !important;
      }

      /* =========================
         Light mode: unify the home cards to one clean surface
         (was a mix of white + purple-tinted boxes).
      ========================= */
      body:not(.od-theme-dark) :is(
        .od-stat-card, .od-feature-card, .od-quote-bar, .od-lab-card
      ) {
        background: linear-gradient(180deg, #ffffff 0%, #faf7ff 100%) !important;
        border: 1px solid rgba(124, 58, 237, 0.16) !important;
        box-shadow: 0 16px 40px rgba(124, 58, 237, 0.08) !important;
      }

      /* =========================
         Light mode: guarantee the authed surfaces (home / profile / journey)
         render light + consistent. Belt-and-suspenders against any dark leak.
      ========================= */
      body:not(.od-theme-dark) :is(
        .od-home-v2, .about-rayan, .admin-dashboard, .ai-command-page,
        .journey-lab, .learning-journey, .mastery-page, .roi-page,
        .sim-root, .verify-page, .learning-portfolio
      ) {
        color: #18102e !important;
      }

      body:not(.od-theme-dark) :is(
        .profile-strip, .profile-card, .profile-metric, .profile-stat,
        .day-step, .jl-reader, .jl-week-intro, .jl-crumb, .jl-notice,
        .portfolio-stat, .portfolio-section, .roi-reading, .roi-source,
        .scenario-node, .scenario-mini, .message-bubble, .archive-item,
        .monthly-certificates, .issued, .course-search-result
      ) {
        background: linear-gradient(180deg, #ffffff 0%, #faf7ff 100%) !important;
        border-color: rgba(124, 58, 237, 0.16) !important;
        box-shadow: 0 14px 36px rgba(124, 58, 237, 0.08) !important;
      }

      body:not(.od-theme-dark) :is(
        .profile-strip, .profile-card, .profile-metric, .profile-stat,
        .day-step, .portfolio-stat, .portfolio-section
      ) :is(strong, b, span, p, small, label, time, h1, h2, h3, h4) {
        color: #2c2342 !important;
        -webkit-text-fill-color: #2c2342 !important;
      }

      /* ============================================================
         #FINAL — Full contrast + typography treatment (dark + light).
         Supersedes earlier partial fixes: guarantees every text layer
         is readable in BOTH themes, neutralises invisible clipped-text
         headings, restores card numbers + eyebrows, and right-sizes the
         oversized display headings.
      ============================================================ */

      /* 1) Display heading SPANS -> visible, theme-appropriate gradient.
            Catches od-hero / ar-title / roi-hero / jl-title / sim-hero /
            mastery / radar and any other clipped-text heading. */
      html body.od-theme-dark.od-theme-dark
        :is(h1, h2, h3) span:not([class*="eyebrow"]):not([class*="kicker"]):not([class*="badge"]):not([class*="pill"]) {
        /* السبان يتبع لون العنوان (مرئي دائمًا) بدل النص الشفّاف */
        background-image: none !important;
        -webkit-text-fill-color: currentColor !important;
        color: inherit !important;
      }
      html body:not(.od-theme-dark):not(.od-theme-dark)
        :is(h1, h2, h3) span:not([class*="eyebrow"]):not([class*="kicker"]):not([class*="badge"]):not([class*="pill"]) {
        /* السبان يتبع لون العنوان حسب السطح (يمنع نص داكن على لوحة داكنة) */
        background-image: none !important;
        -webkit-text-fill-color: currentColor !important;
        color: inherit !important;
      }

      /* 2) Plain heading text (no span) -> solid, readable, gradients off. */
      html body.od-theme-dark.od-theme-dark :is(h1, h2, h3, h4, h5, h6) {
        color: #f4effc !important;
        background-image: none !important;
      }
      html body:not(.od-theme-dark):not(.od-theme-dark) :is(h1, h2, h3, h4, h5, h6) {
        color: #190f30 !important;
        background-image: none !important;
      }

      /* 3) Decorative numerals / marks (01 02 03, step numbers) -> visible, subtle. */
      html body.od-theme-dark.od-theme-dark
        :is(.ar-lens b, .ar-domain-mark, .hero-point b, .jl-index, [class*="-mark"], [class*="-numeral"]) {
        color: rgba(201, 184, 255, 0.5) !important;
        -webkit-text-fill-color: rgba(201, 184, 255, 0.5) !important;
        background-image: none !important;
      }
      html body:not(.od-theme-dark):not(.od-theme-dark)
        :is(.ar-lens b, .ar-domain-mark, .hero-point b, .jl-index, [class*="-mark"], [class*="-numeral"]) {
        color: rgba(109, 40, 217, 0.42) !important;
        -webkit-text-fill-color: rgba(109, 40, 217, 0.42) !important;
        background-image: none !important;
      }

      /* 4) Eyebrows / kickers -> theme-aware pill + label.
            Fixes the light-mode disappearance (gold / lilac text on light bg). */
      html body.od-theme-dark.od-theme-dark
        :is(.od-section-kicker, .ar-eyebrow, .mastery-eyebrow, [class*="eyebrow"], [class*="kicker"]) {
        color: #ece4ff !important;
        -webkit-text-fill-color: #ece4ff !important;
        background: rgba(139, 92, 246, 0.18) !important;
        border: 1px solid rgba(167, 139, 250, 0.30) !important;
      }
      html body:not(.od-theme-dark):not(.od-theme-dark)
        :is(.od-section-kicker, .ar-eyebrow, .mastery-eyebrow, [class*="eyebrow"], [class*="kicker"]) {
        color: #6d28d9 !important;
        -webkit-text-fill-color: #6d28d9 !important;
        background: rgba(139, 92, 246, 0.12) !important;
        border: 1px solid rgba(124, 58, 237, 0.26) !important;
      }

      /* 5) Body / descriptions -> readable + comfortable line-height. */
      html body.od-theme-dark.od-theme-dark :is(p, li, dd, dt, blockquote, figcaption) {
        color: #d2c7f1 !important;
      }
      html body:not(.od-theme-dark):not(.od-theme-dark) :is(p, li, dd, dt, blockquote, figcaption) {
        color: #443a60 !important;
      }
      :is(.od-hero, .od-section-head, .ar-hero, .ar-section-head, .roi-hero,
          .jl-intro, .hero, .mastery-hero, [class*="section-head"], [class*="-hero"]) p {
        line-height: 1.9 !important;
        font-weight: 600 !important;
      }

      /* 6) Text inside dark/light surfaces stays on-theme (values, labels, captions). */
      html body.od-theme-dark.od-theme-dark
        :is([class*="card"], [class*="panel"], .ar-lens, .ar-domain, .profile-strip,
            .profile-metric, .day-step)
        :is(strong, span, small, label, time, p, li):not([class*="eyebrow"]):not([class*="kicker"]):not([class*="badge"]):not([class*="pill"]):not([class*="-mark"]) {
        color: #e7ddfb !important;
        -webkit-text-fill-color: #e7ddfb !important;
      }
      html body:not(.od-theme-dark):not(.od-theme-dark)
        :is([class*="card"], [class*="panel"], .ar-lens, .ar-domain, .profile-strip,
            .profile-metric, .day-step)
        :is(strong, span, small, label, time, p, li):not([class*="eyebrow"]):not([class*="kicker"]):not([class*="badge"]):not([class*="pill"]):not([class*="-mark"]) {
        color: #2c2342 !important;
        -webkit-text-fill-color: #2c2342 !important;
      }

      /* 7) Right-size oversized display headings to fit the layout. */
      :is(.od-hero h1, .ar-title, .roi-hero h1, .jl-title, .hero h1, .mastery-hero h1) {
        font-size: clamp(1.8rem, 3.8vw, 3rem) !important;
        line-height: 1.22 !important;
        letter-spacing: 0 !important;
      }
      :is(.od-section-head h2, .ar-section-head h2, .od-timer-content h2, [class*="section-head"] h2) {
        font-size: clamp(1.5rem, 3.1vw, 2.45rem) !important;
        line-height: 1.3 !important;
        letter-spacing: 0 !important;
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: .001ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
      }

      /* ============================================================
         PHASE 53 — Contrast & typography hardening (final layer)
         طبقة تقوية نهائية: ألوان وتنسيق فقط — لا منطق، لا نصوص، لا RTL.
         تُحمَّل أخيرًا وبأولوية عالية لتتغلّب على أنماط المكوّنات المحقونة
         بغضّ النظر عن ترتيب الحقن. تضمن قراءة كل عنوان/نص/رقم على سطحه
         في الوضعين، ومصفوفة كاملة لأزرار الأقسام العلوية، وأشرطة تقدّم واضحة.
      ============================================================ */

      /* 0) نظام المتغيّرات الموحّد (هوية بنفسجية/ذهبية، فاتح + داكن) */
      :root,
      html[data-theme="light"],
      html body.od-theme-light {
        --bg: #f3eefb;
        --bg-soft: #ece4f6;
        --surface: #ffffff;
        --surface-elevated: #faf7ff;
        --surface-muted: #f1ebfb;
        --card: #ffffff;
        --card-header: #f3edfc;
        --text: #190f30;
        --text-muted: #4c4170;
        --text-soft: #6f6391;
        --heading: #190f30;
        --border: rgba(124, 58, 237, .18);
        --accent: #7c3aed;
        --accent-hover: #6d28d9;
        --accent-contrast: #ffffff;
        --gold: #9a6a12;
        --gold-soft: rgba(154, 106, 18, .14);
        --success: #1b9c83;
        --warning: #9a6a12;
        --danger: #dc2654;
        --metric-bg: #1c1130;
        --metric-text: #f4f0fb;
        --nav-pill-bg: rgba(124, 58, 237, .07);
        --nav-pill-text: #4c3a82;
        --nav-pill-active-text: #ffffff;
      }
      html[data-theme="dark"],
      html body.od-theme-dark {
        --bg: #0c0717;
        --bg-soft: #0e0820;
        --surface: rgba(28, 17, 48, .94);
        --surface-elevated: rgba(38, 24, 66, .96);
        --surface-muted: rgba(24, 14, 42, .92);
        --card: rgba(28, 17, 48, .94);
        --card-header: rgba(38, 24, 66, .9);
        --text: #ece6f8;
        --text-muted: #c9bdf0;
        --text-soft: #a99fce;
        --heading: #f4effc;
        --border: rgba(167, 139, 250, .22);
        --accent: #a855f7;
        --accent-hover: #bb8ff6;
        --accent-contrast: #10081f;
        --gold: #e7c873;
        --gold-soft: rgba(231, 200, 115, .16);
        --success: #34d3b3;
        --warning: #e7c873;
        --danger: #fb7185;
        --metric-bg: rgba(20, 12, 36, .96);
        --metric-text: #f4f0fb;
        --nav-pill-bg: rgba(167, 139, 250, .10);
        --nav-pill-text: #d9cdf2;
        --nav-pill-active-text: #ffffff;
      }

      /* 1) أمان عام: كل عنوان أو سبان داخل عنوان يرسم نصًّا صلبًا (لا شفافية).
            يبطل أي background-clip:text متبقٍّ في المكوّنات. */
      html body :is(h1, h2, h3, h4, h5, h6),
      html body :is(h1, h2, h3, h4, h5, h6) :is(span, b, strong, em, i, a) {
        -webkit-text-fill-color: currentColor !important;
      }

      /* 2) استثناء اللوحات الداكنة (داكنة في الوضعين) -> نصّها فاتح دائمًا.
            يمنع "نص داكن على لوحة داكنة" في الوضع الفاتح:
            البطل العام، بطل اللوحة، العدّاد الدائري، ومرصد الوقت. */
      html body:not(.od-theme-dark):not(.od-theme-dark)
        :is(.public-hero, .od-hero, .od-main-gauge, .od-timer-command, .od-timer-content)
        :is(h1, h2, h3, h4, h5, h6, span, strong, b, small, p, time, label) {
        color: #f4f0fb !important;
        -webkit-text-fill-color: #f4f0fb !important;
      }
      html body.od-theme-dark.od-theme-dark
        :is(.public-hero, .od-hero, .od-main-gauge, .od-timer-command, .od-timer-content)
        :is(h1, h2, h3, h4, h5, h6, span, strong, b, small, p, time, label) {
        color: #f4f0fb !important;
        -webkit-text-fill-color: #f4f0fb !important;
      }

      /* 3) أزرار الأقسام العلوية (.main-nav) — مصفوفة كاملة لكل حالة وثيم.
            يصلح: تحويم بنص أسود غير مرئي في الداكن + تباين منخفض في الفاتح. */
      /* --- الوضع الفاتح --- */
      html body:not(.od-theme-dark) .main-nav button,
      html body:not(.od-theme-dark) .educational-tools-trigger {
        color: #4c3a82 !important;
        -webkit-text-fill-color: #4c3a82 !important;
        background: rgba(124, 58, 237, .07) !important;
        border: 1px solid rgba(124, 58, 237, .16) !important;
      }
      html body:not(.od-theme-dark) .main-nav button .nav-label,
      html body:not(.od-theme-dark) .main-nav button span,
      html body:not(.od-theme-dark) .educational-tools-trigger span {
        color: #4c3a82 !important;
        -webkit-text-fill-color: #4c3a82 !important;
      }
      html body:not(.od-theme-dark) .main-nav button:hover,
      html body:not(.od-theme-dark) .educational-tools-trigger:hover {
        color: #2a1758 !important;
        -webkit-text-fill-color: #2a1758 !important;
        background: rgba(124, 58, 237, .13) !important;
        border-color: rgba(124, 58, 237, .30) !important;
      }
      html body:not(.od-theme-dark) .main-nav button:hover .nav-label,
      html body:not(.od-theme-dark) .main-nav button:hover span {
        color: #2a1758 !important;
        -webkit-text-fill-color: #2a1758 !important;
      }
      html body:not(.od-theme-dark) .main-nav button.active,
      html body:not(.od-theme-dark) .educational-tools-trigger.active {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
        background: linear-gradient(135deg, #a855f7, #7c3aed) !important;
        border-color: transparent !important;
        box-shadow: 0 16px 36px rgba(124, 58, 237, .26) !important;
      }
      html body:not(.od-theme-dark) .main-nav button.active .nav-label,
      html body:not(.od-theme-dark) .main-nav button.active span {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
      }
      /* --- الوضع الداكن --- */
      html body.od-theme-dark .main-nav button,
      html body.od-theme-dark .educational-tools-trigger {
        color: #d9cdf2 !important;
        -webkit-text-fill-color: #d9cdf2 !important;
        background: rgba(167, 139, 250, .10) !important;
        border: 1px solid rgba(167, 139, 250, .22) !important;
      }
      html body.od-theme-dark .main-nav button .nav-label,
      html body.od-theme-dark .main-nav button span,
      html body.od-theme-dark .educational-tools-trigger span {
        color: #d9cdf2 !important;
        -webkit-text-fill-color: #d9cdf2 !important;
      }
      html body.od-theme-dark .main-nav button:hover,
      html body.od-theme-dark .educational-tools-trigger:hover {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
        background: rgba(167, 139, 250, .20) !important;
        border-color: rgba(196, 181, 253, .42) !important;
      }
      html body.od-theme-dark .main-nav button:hover .nav-label,
      html body.od-theme-dark .main-nav button:hover span {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
      }
      html body.od-theme-dark .main-nav button.active,
      html body.od-theme-dark .educational-tools-trigger.active {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
        background: linear-gradient(135deg, #a855f7, #7c3aed) !important;
        border-color: transparent !important;
        box-shadow: 0 16px 36px rgba(168, 85, 247, .30) !important;
      }
      html body.od-theme-dark .main-nav button.active .nav-label,
      html body.od-theme-dark .main-nav button.active span {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
      }

      /* 4) أشرطة التقدّم — مسار فارغ مرئي في الوضعين (التعبئة تبقى بلونها). */
      html body:not(.od-theme-dark)
        :is(.mini-progress, .profile-progress-line, .mastery-track, .jl-mini-progress,
            .monthly-progress, .weekly-reflection-progress, .mini-bar-track) {
        background-color: rgba(124, 58, 237, .14) !important;
      }
      html body.od-theme-dark
        :is(.mini-progress, .profile-progress-line, .mastery-track, .jl-mini-progress,
            .monthly-progress, .weekly-reflection-progress, .mini-bar-track) {
        background-color: rgba(167, 139, 250, .18) !important;
      }


      /* ============================================================
         PHASE 54 — Surface-aware contrast repair for uploaded build
         يعالج اللوحات الداكنة المتداخلة داخل الوضع الفاتح، ويمنع انقلاب
         نصوص البطاقات البيضاء إلى فاتحة بسبب قواعد الحاوية الداكنة.
      ============================================================ */
      :root,
      html[data-theme="light"],
      html body.od-theme-light {
        --nav-pill-active-bg: linear-gradient(135deg, #7c3aed, #a855f7);
        --metric-bg: #ffffff;
        --metric-text: #18102e;
        --dark-surface: #18102e;
        --dark-surface-2: #281748;
        --dark-text: #f7f3fc;
        --dark-muted: #d8cff2;
      }

      html[data-theme="dark"],
      html body.od-theme-dark {
        --nav-pill-active-bg: linear-gradient(135deg, #a855f7, #7c3aed);
        --metric-bg: rgba(255, 255, 255, .08);
        --metric-text: #f7f3fc;
        --dark-surface: #18102e;
        --dark-surface-2: #281748;
        --dark-text: #f7f3fc;
        --dark-muted: #d8cff2;
      }

      html body {
        color: var(--text) !important;
        line-height: 1.75;
        letter-spacing: 0 !important;
      }

      html body :is(button, input, select, textarea) {
        font-family: inherit;
        line-height: 1.55;
      }

      html body :is(h1, h2, h3, h4, h5, h6, p, li, button, label, small, strong, span) {
        overflow-wrap: anywhere;
      }

      html body :is(.od-button, .portfolio-button, .profile-button, .radar-tab, .radar-actions button,
        .educational-tools-trigger, .main-nav button, .onboarding-action) {
        min-height: 44px;
        white-space: normal !important;
        text-align: center;
      }

      /* Dark visual surfaces that exist in both themes. */
      html body :is(.public-hero, .od-hero, .portfolio-hero, .radar-card-dark,
        .od-main-gauge, .od-command-card, .od-timer-command, .od-timer-content,
        .onboarding-route, .mastery-hero, .ar-hero, .sim-hero, .roi-hero) {
        color: var(--dark-text) !important;
        border-color: rgba(255, 255, 255, .16) !important;
      }

      html body :is(.public-hero, .od-hero, .portfolio-hero, .radar-card-dark,
        .od-main-gauge, .od-command-card, .od-timer-command, .od-timer-content,
        .onboarding-route, .mastery-hero, .ar-hero, .sim-hero, .roi-hero)
        :is(h1, h2, h3, h4, h5, h6, strong, b) {
        color: var(--dark-text) !important;
        -webkit-text-fill-color: var(--dark-text) !important;
        background-image: none !important;
        text-shadow: 0 12px 30px rgba(0, 0, 0, .24);
      }

      html body :is(.public-hero, .od-hero, .portfolio-hero, .radar-card-dark,
        .od-main-gauge, .od-command-card, .od-timer-command, .od-timer-content,
        .onboarding-route, .mastery-hero, .ar-hero, .sim-hero, .roi-hero)
        :is(p, li, small, label, time) {
        color: var(--dark-muted) !important;
        -webkit-text-fill-color: var(--dark-muted) !important;
        opacity: 1 !important;
      }

      html body :is(.public-hero, .od-hero, .portfolio-hero, .radar-card-dark,
        .od-main-gauge, .od-command-card, .od-timer-command, .od-timer-content,
        .onboarding-route, .mastery-hero, .ar-hero, .sim-hero, .roi-hero)
        :is(.od-chip, .portfolio-kicker, .radar-kicker, .od-section-kicker,
            .mastery-eyebrow, .ar-eyebrow, [class*="kicker"], [class*="eyebrow"]) {
        color: #f6db8e !important;
        -webkit-text-fill-color: #f6db8e !important;
        background: rgba(255, 255, 255, .10) !important;
        border: 1px solid rgba(255, 255, 255, .16) !important;
        opacity: 1 !important;
      }

      /* White cards nested inside dark sections must keep dark text in light mode. */
      html body:not(.od-theme-dark) .od-timer-command :is(.od-stat-card, .od-progress-line),
      html body:not(.od-theme-dark) .portfolio-hero :is(.portfolio-button.soft),
      html body:not(.od-theme-dark) .radar-card:not(.radar-card-dark),
      html body:not(.od-theme-dark) .onboarding-card :is(.onboarding-step, .onboarding-action:not(.primary)) {
        color: #18102e !important;
        -webkit-text-fill-color: #18102e !important;
        background: linear-gradient(180deg, #ffffff 0%, #faf7ff 100%) !important;
        border-color: rgba(124, 58, 237, .18) !important;
      }

      html body:not(.od-theme-dark) .od-timer-command :is(.od-stat-card, .od-progress-line)
        :is(span, strong, b, small, label, p),
      html body:not(.od-theme-dark) .radar-card:not(.radar-card-dark)
        :is(h3, strong, b, span, small, p, label),
      html body:not(.od-theme-dark) .onboarding-card :is(.onboarding-step, .onboarding-action:not(.primary))
        :is(strong, b, span, small, p, label) {
        color: #2c2342 !important;
        -webkit-text-fill-color: #2c2342 !important;
        text-shadow: none !important;
        opacity: 1 !important;
      }

      html body:not(.od-theme-dark) .od-timer-command .od-stat-card span,
      html body:not(.od-theme-dark) .od-timer-command .od-progress-line span,
      html body:not(.od-theme-dark) .radar-card:not(.radar-card-dark) p,
      html body:not(.od-theme-dark) .onboarding-card .onboarding-step span,
      html body:not(.od-theme-dark) .onboarding-card .onboarding-action:not(.primary) span {
        color: #5b4f78 !important;
        -webkit-text-fill-color: #5b4f78 !important;
      }

      html body:not(.od-theme-dark) .od-timer-command .od-stat-card small,
      html body:not(.od-theme-dark) .od-timer-command .od-progress-line small {
        color: #6f6391 !important;
        -webkit-text-fill-color: #6f6391 !important;
      }

      /* Metric cards and progress indicators. */
      html body :is(.profile-metric, .portfolio-stat, .od-stat-card, .radar-metrics span,
        .radar-summary-box, .onboarding-step, .od-command-mini > div) {
        min-height: auto !important;
        line-height: 1.65 !important;
      }

      html body:not(.od-theme-dark) :is(.profile-metric, .portfolio-stat, .od-command-mini > div) {
        background: linear-gradient(180deg, #ffffff 0%, #faf7ff 100%) !important;
        border-color: rgba(124, 58, 237, .18) !important;
        color: #18102e !important;
      }

      html body:not(.od-theme-dark) :is(.profile-metric, .portfolio-stat, .od-command-mini > div)
        :is(b, strong, span, small) {
        color: #2c2342 !important;
        -webkit-text-fill-color: #2c2342 !important;
        opacity: 1 !important;
      }

      html body.od-theme-dark :is(.profile-metric, .portfolio-stat, .od-stat-card,
        .od-progress-line, .radar-card, .onboarding-card, .onboarding-step,
        .onboarding-action:not(.primary), .od-command-mini > div) {
        background: rgba(28, 17, 48, .94) !important;
        border-color: rgba(167, 139, 250, .24) !important;
        color: #ece6f8 !important;
      }

      html body.od-theme-dark :is(.profile-metric, .portfolio-stat, .od-stat-card,
        .od-progress-line, .radar-card, .onboarding-card, .onboarding-step,
        .onboarding-action:not(.primary), .od-command-mini > div)
        :is(h1, h2, h3, h4, strong, b, span, small, p, label) {
        color: #ece6f8 !important;
        -webkit-text-fill-color: #ece6f8 !important;
        opacity: 1 !important;
        text-shadow: none !important;
      }

      html body .radar-card-dark :is(.radar-metrics span, .radar-summary-box) {
        background: rgba(255, 255, 255, .10) !important;
        border-color: rgba(255, 255, 255, .16) !important;
        color: #f4f0fb !important;
        -webkit-text-fill-color: #f4f0fb !important;
      }

      html body .radar-card-dark .radar-metrics b {
        color: #f6db8e !important;
        -webkit-text-fill-color: #f6db8e !important;
        text-shadow: none !important;
      }

      html body :is(.od-progress-track, .profile-progress-line, .radar-progress-line,
        .mini-progress, .mastery-track, .monthly-progress, .weekly-reflection-progress) {
        min-height: 8px;
        background-color: rgba(124, 58, 237, .16) !important;
        box-shadow: inset 0 0 0 1px rgba(124, 58, 237, .08);
      }

      html body.od-theme-dark :is(.od-progress-track, .profile-progress-line, .radar-progress-line,
        .mini-progress, .mastery-track, .monthly-progress, .weekly-reflection-progress) {
        background-color: rgba(167, 139, 250, .20) !important;
        box-shadow: inset 0 0 0 1px rgba(196, 181, 253, .12);
      }

      html body :is(.od-progress-track b, .profile-progress-line span, .radar-progress-line i,
        .mini-progress span, .mastery-track span, .monthly-progress span, .weekly-reflection-progress span) {
        background: linear-gradient(90deg, #8b5cf6, #10b981) !important;
      }

      /* Top section pills / tabs. */
      html body:not(.od-theme-dark) :is(.main-nav button, .educational-tools-trigger, .radar-tab) {
        color: #4c3a82 !important;
        -webkit-text-fill-color: #4c3a82 !important;
        background: rgba(124, 58, 237, .08) !important;
        border-color: rgba(124, 58, 237, .18) !important;
      }

      html body:not(.od-theme-dark) :is(.main-nav button:hover, .main-nav button.active,
        .educational-tools-trigger:hover, .educational-tools-trigger.active,
        .radar-tab:hover, .radar-tab.active) {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
        background: var(--nav-pill-active-bg) !important;
        border-color: transparent !important;
        box-shadow: 0 16px 36px rgba(124, 58, 237, .24) !important;
      }

      html body:not(.od-theme-dark) :is(.main-nav button:hover, .main-nav button.active,
        .educational-tools-trigger:hover, .educational-tools-trigger.active,
        .radar-tab:hover, .radar-tab.active) :is(span, strong, small, svg) {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
      }

      html body.od-theme-dark :is(.main-nav button, .educational-tools-trigger, .radar-tab) {
        color: #d9cdf2 !important;
        -webkit-text-fill-color: #d9cdf2 !important;
        background: rgba(167, 139, 250, .10) !important;
        border-color: rgba(167, 139, 250, .22) !important;
      }

      html body.od-theme-dark :is(.main-nav button:hover, .main-nav button.active,
        .educational-tools-trigger:hover, .educational-tools-trigger.active,
        .radar-tab:hover, .radar-tab.active) {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
        background: var(--nav-pill-active-bg) !important;
        border-color: transparent !important;
        box-shadow: 0 16px 36px rgba(168, 85, 247, .28) !important;
      }

      html body.od-theme-dark :is(.main-nav button:hover, .main-nav button.active,
        .educational-tools-trigger:hover, .educational-tools-trigger.active,
        .radar-tab:hover, .radar-tab.active) :is(span, strong, small, svg) {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
      }

      /* Prevent clipping in the Arabic profile strip and hero headings. */
      html body :is(.profile-name strong, .profile-name span, .profile-name small,
        .portfolio-hero h1, .od-hero h1, .radar-card h3, .onboarding-title) {
        white-space: normal !important;
        overflow: visible !important;
        text-overflow: clip !important;
        letter-spacing: 0 !important;
      }

      html body :is(.portfolio-hero h1, .od-hero h1, .onboarding-title, .ar-title,
        .roi-hero h1, .jl-title, .mastery-hero h1) {
        font-size: clamp(1.9rem, 4.2vw, 3.65rem) !important;
        line-height: 1.18 !important;
        text-wrap: balance;
      }

      @media (max-width: 760px) {
        html body :is(.profile-strip, .od-hero-inner, .portfolio-hero-grid,
          .radar-intro-grid, .radar-two-columns, .radar-question-layout,
          .onboarding-hero, .onboarding-actions) {
          grid-template-columns: 1fr !important;
        }

        html body :is(.profile-actions, .od-hero-actions, .portfolio-actions, .radar-actions) {
          width: 100%;
        }

        html body :is(.od-button, .portfolio-button, .profile-button, .radar-actions button) {
          width: 100%;
          justify-content: center;
        }
      }
    `}</style>
  );
}
