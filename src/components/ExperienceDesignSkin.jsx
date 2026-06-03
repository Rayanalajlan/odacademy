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
        --lab-ink: #0b1220;
        --lab-deep: #07111f;
        --lab-navy: #0d1b2d;
        --lab-panel: rgba(10, 22, 38, .88);
        --lab-panel-soft: rgba(255, 255, 255, .78);
        --lab-line: rgba(148, 163, 184, .22);
        --lab-line-strong: rgba(226, 232, 240, .38);
        --lab-warm: #fffaf0;
        --lab-paper: #f7f2e8;
        --lab-muted: #64748b;
        --lab-muted-dark: #b6c2d3;
        --lab-gold: #d6a84f;
        --lab-gold-soft: rgba(214, 168, 79, .16);
        --lab-indigo: #4f46e5;
        --lab-violet: #6d5dfc;
        --lab-cyan: #36d3c5;
        --lab-green: #11b981;
        --lab-radius-xl: 34px;
        --lab-radius-lg: 24px;
        --lab-radius-md: 16px;
        --lab-shadow-deep: 0 30px 110px rgba(2, 6, 23, .30);
        --lab-shadow-soft: 0 20px 60px rgba(15, 23, 42, .10);
        --lab-grid:
          linear-gradient(rgba(148, 163, 184, .075) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, .075) 1px, transparent 1px);
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        background:
          radial-gradient(circle at 7% 4%, rgba(79, 70, 229, .10), transparent 32%),
          radial-gradient(circle at 93% 16%, rgba(214, 168, 79, .12), transparent 30%),
          linear-gradient(180deg, #fffaf0 0%, #eef2ff 46%, #fffaf0 100%) !important;
      }

      body::selection {
        color: #fff;
        background: #4f46e5;
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
        outline: 3px solid rgba(214, 168, 79, .78) !important;
        outline-offset: 3px !important;
      }

      /* =========================
         Public visitor page
      ========================= */

      .public-gate {
        position: relative !important;
        overflow-x: clip !important;
        background:
          radial-gradient(circle at 12% 8%, rgba(126, 96, 205, .18), transparent 30%),
          radial-gradient(circle at 88% 10%, rgba(214, 168, 79, .15), transparent 34%),
          linear-gradient(180deg, #fbf8ff 0%, #efe7ff 42%, #fffaf0 42%, #fffaf0 100%) !important;
        color: #0f172a !important;
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
          radial-gradient(circle at 18% 26%, rgba(214,168,79,.18), transparent 3px),
          radial-gradient(circle at 64% 18%, rgba(54,211,197,.18), transparent 3px),
          radial-gradient(circle at 76% 38%, rgba(109,93,252,.20), transparent 3px),
          linear-gradient(120deg, transparent 0 22%, rgba(226,232,240,.08) 22% 22.2%, transparent 22.4% 100%);
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
        border: 1px solid rgba(226,232,240,.18) !important;
        background:
          radial-gradient(circle at 8% 12%, rgba(126,96,205,.18), transparent 30%),
          radial-gradient(circle at 88% 18%, rgba(214,168,79,.18), transparent 28%),
          linear-gradient(135deg, #ffffff 0%, #f4ecff 48%, #fff7df 100%) !important;
        box-shadow: 0 34px 100px rgba(65, 41, 111, .18) !important;
      }

      .public-hero::before {
        content: "";
        position: absolute;
        inset: -25%;
        z-index: -2;
        background:
          radial-gradient(circle at 25% 35%, rgba(54, 211, 197, .35), transparent 4px),
          radial-gradient(circle at 33% 62%, rgba(214, 168, 79, .38), transparent 3px),
          radial-gradient(circle at 70% 32%, rgba(109, 93, 252, .42), transparent 5px),
          radial-gradient(circle at 80% 66%, rgba(54, 211, 197, .32), transparent 3px),
          linear-gradient(90deg, transparent 0 22%, rgba(255,255,255,.10) 22.1% 22.2%, transparent 22.3% 100%),
          linear-gradient(140deg, transparent 0 37%, rgba(214,168,79,.10) 37.1% 37.3%, transparent 37.4% 100%);
        background-size: 520px 520px, 480px 480px, 620px 620px, 540px 540px, 100% 100%, 100% 100%;
        animation: labNodeDrift 22s ease-in-out infinite alternate;
        opacity: .78;
      }

      .public-hero::after {
        content: "STRATEGY  CULTURE  ROLES  IMPACT  LEARNING";
        position: absolute;
        inset-inline-start: clamp(18px, 4vw, 52px);
        bottom: clamp(14px, 3vw, 30px);
        z-index: -1;
        color: rgba(33,21,50,.07);
        font-size: clamp(42px, 7vw, 96px);
        line-height: 1;
        font-weight: 950;
        letter-spacing: .08em;
        white-space: nowrap;
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
        background: rgba(255, 255, 255, .72) !important;
        border: 1px solid rgba(126, 96, 205, .18) !important;
        box-shadow: 0 16px 40px rgba(65, 41, 111, .08) !important;
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
        color: #f8e5b3 !important;
        background: rgba(214, 168, 79, .12) !important;
        border: 1px solid rgba(214, 168, 79, .28) !important;
        box-shadow: 0 0 40px rgba(214, 168, 79, .10) !important;
      }

      .public-hero h1 {
        max-width: 760px !important;
        margin: clamp(18px, 3vw, 26px) 0 16px !important;
        color: #211532 !important;
        font-size: clamp(46px, 7.8vw, 104px) !important;
        line-height: .98 !important;
        letter-spacing: 0 !important;
        text-wrap: balance !important;
        text-shadow: none !important;
      }

      .public-hero p {
        max-width: 680px !important;
        color: #4a3c5f !important;
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
        background: linear-gradient(90deg, transparent, rgba(54,211,197,.36), rgba(214,168,79,.34), transparent);
        pointer-events: none;
      }

      .hero-point {
        position: relative !important;
        overflow: hidden !important;
        border-radius: 18px !important;
        padding: 18px !important;
        background: rgba(255,255,255,.70) !important;
        border: 1px solid rgba(126,96,205,.18) !important;
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
        background: rgba(54, 211, 197, .12) !important;
        color: #80fff3 !important;
        border: 1px solid rgba(54, 211, 197, .24) !important;
      }

      .hero-point strong {
        color: #211532 !important;
      }

      .hero-point span {
        color: #5f5270 !important;
      }

      .auth-card {
        position: relative !important;
        align-self: center !important;
        width: min(430px, 100%) !important;
        border-radius: 26px !important;
        padding: clamp(18px, 2.6vw, 28px) !important;
        background:
          radial-gradient(circle at 100% 0%, rgba(126,96,205,.12), transparent 34%),
          linear-gradient(180deg, rgba(255,255,255,.96), rgba(246,240,255,.90)) !important;
        border: 1px solid rgba(126,96,205,.20) !important;
        box-shadow:
          0 22px 68px rgba(65,41,111,.16),
          inset 0 1px 0 rgba(255,255,255,.80) !important;
        backdrop-filter: blur(22px) !important;
      }

      .auth-card::before {
        content: "ACCESS PANEL";
        display: block;
        margin-bottom: 12px;
        color: #7e60cd;
        font-size: 11px;
        font-weight: 950;
        letter-spacing: .12em;
      }

      .auth-tabs {
        border-radius: 16px !important;
        background: rgba(126,96,205,.09) !important;
        border: 1px solid rgba(126,96,205,.14) !important;
        padding: 6px !important;
      }

      .auth-tabs button {
        border-radius: 12px !important;
        color: #4a3c5f !important;
        background: transparent !important;
      }

      .auth-tabs button.active {
        color: #07111f !important;
        background: linear-gradient(135deg, #fffaf0, #d6a84f) !important;
        box-shadow: 0 12px 30px rgba(214, 168, 79, .22) !important;
      }

      .auth-title {
        color: #211532 !important;
      }

      .auth-field label {
        color: #4a3c5f !important;
      }

      .auth-field input,
      .password-row input {
        min-height: 48px !important;
        border-radius: 14px !important;
        color: #211532 !important;
        background: rgba(255,255,255,.92) !important;
        border: 1px solid rgba(126,96,205,.20) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.86) !important;
      }

      .auth-field input::placeholder,
      .password-row input::placeholder {
        color: rgba(74,60,95,.62) !important;
      }

      .hint {
        color: #7a6a91 !important;
      }

      .toggle-password,
      .forgot-button,
      .auth-ghost {
        color: #d6a84f !important;
      }

      .auth-primary {
        min-height: 50px !important;
        border-radius: 15px !important;
        color: #07111f !important;
        background: linear-gradient(135deg, #f7d787, #d6a84f) !important;
        box-shadow: 0 18px 46px rgba(214, 168, 79, .28) !important;
      }

      .auth-primary:hover,
      .sample-button:hover,
      .mobile-nav-resume:hover {
        transform: translateY(-2px) !important;
      }

      .auth-notice {
        border-radius: 14px !important;
        background: rgba(54,211,197,.10) !important;
        border-color: rgba(54,211,197,.24) !important;
        color: #c7fff8 !important;
      }

      .public-section {
        position: relative !important;
        margin-top: clamp(24px, 5vw, 54px) !important;
        border-radius: 28px !important;
        padding: clamp(20px, 4vw, 34px) !important;
        background:
          radial-gradient(circle at 100% 0%, rgba(79,70,229,.08), transparent 30%),
          rgba(255, 250, 240, .88) !important;
        border: 1px solid rgba(148,163,184,.16) !important;
        box-shadow: var(--lab-shadow-soft) !important;
      }

      .section-head {
        align-items: end !important;
        gap: 18px !important;
        margin-bottom: clamp(16px, 3vw, 26px) !important;
      }

      .section-head h2 {
        color: #0b1220 !important;
        font-size: clamp(28px, 4.4vw, 58px) !important;
        line-height: 1.08 !important;
        letter-spacing: 0 !important;
        text-wrap: balance !important;
      }

      .section-head p {
        color: #64748b !important;
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
          radial-gradient(circle at 100% 0%, rgba(126,96,205,.12), transparent 34%),
          linear-gradient(135deg, rgba(255,255,255,.96), rgba(246,240,255,.90)) !important;
        border: 1px solid rgba(126,96,205,.18) !important;
        box-shadow: 0 18px 52px rgba(65,41,111,.10) !important;
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
        color: #211532 !important;
        font-size: clamp(34px, 4vw, 54px) !important;
        line-height: 1 !important;
      }

      .counter-card span {
        color: #5f5270 !important;
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
        background: linear-gradient(90deg, rgba(54,211,197,.12), rgba(214,168,79,.42), rgba(79,70,229,.24));
        pointer-events: none;
      }

      .path-card {
        position: relative !important;
        min-height: 210px !important;
        border-radius: 20px !important;
        padding: 18px !important;
        background:
          linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.72)) !important;
        border: 1px solid rgba(148,163,184,.20) !important;
        box-shadow: 0 18px 52px rgba(15,23,42,.08) !important;
      }

      .path-card::after {
        content: "";
        position: absolute;
        inset-inline-end: 18px;
        top: 37px;
        width: 10px;
        height: 10px;
        border-radius: 99px;
        background: #36d3c5;
        box-shadow: 0 0 0 7px rgba(54,211,197,.12), 0 0 22px rgba(54,211,197,.42);
      }

      .path-card b {
        color: #d6a84f !important;
        background: rgba(214,168,79,.12) !important;
        border-color: rgba(214,168,79,.20) !important;
      }

      .path-card strong {
        color: #0b1220 !important;
        font-size: 16px !important;
      }

      .path-card span {
        color: #475569 !important;
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
          radial-gradient(circle at 88% 10%, rgba(126,96,205,.14), transparent 28%),
          linear-gradient(135deg, rgba(255,255,255,.96), rgba(246,240,255,.90)) !important;
        border: 1px solid rgba(126,96,205,.18) !important;
        box-shadow: 0 18px 52px rgba(65,41,111,.10) !important;
      }

      .sample-box::before {
        content: "CASE FILE";
        position: absolute;
        inset-inline-end: 18px;
        top: 18px;
        color: rgba(214,168,79,.62);
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .16em;
      }

      .sample-kicker {
        color: #5b3c8f !important;
        background: rgba(126,96,205,.12) !important;
        border: 1px solid rgba(126,96,205,.18) !important;
      }

      .sample-box h3 {
        color: #211532 !important;
        font-size: clamp(22px, 3vw, 34px) !important;
      }

      .sample-box p,
      .sample-bullets li {
        color: #5f5270 !important;
      }

      .sample-button {
        border-radius: 14px !important;
        color: #07111f !important;
        background: linear-gradient(135deg, #f7d787, #d6a84f) !important;
        box-shadow: 0 18px 42px rgba(214,168,79,.22) !important;
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
          linear-gradient(180deg, rgba(255,255,255,.92), rgba(255,255,255,.72)) !important;
        border: 1px solid rgba(148,163,184,.18) !important;
        box-shadow: 0 16px 44px rgba(15,23,42,.07) !important;
      }

      .info-card strong,
      .legal-card strong,
      .faq-question span:first-child {
        color: #0b1220 !important;
      }

      .info-card span,
      .legal-card span,
      .faq-answer {
        color: #475569 !important;
        line-height: 1.95 !important;
      }

      .about-links a {
        border-radius: 999px !important;
        color: #07111f !important;
        background: rgba(214,168,79,.14) !important;
        border: 1px solid rgba(214,168,79,.20) !important;
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
        background: rgba(79,70,229,.08) !important;
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
        color: #4a3c5f !important;
        background:
          radial-gradient(circle at 0% 100%, rgba(214,168,79,.16), transparent 30%),
          linear-gradient(135deg, rgba(255,255,255,.92), rgba(241,231,255,.90)) !important;
        border: 1px solid rgba(126,96,205,.18) !important;
        box-shadow: 0 18px 52px rgba(65,41,111,.10) !important;
      }

      .public-footer span,
      .site-footer span {
        color: #7a6a91 !important;
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
          radial-gradient(circle at 8% 6%, rgba(126,96,205,.16), transparent 28%),
          radial-gradient(circle at 88% 12%, rgba(214,168,79,.13), transparent 26%),
          linear-gradient(180deg, #fbf8ff 0%, #efe7ff 26%, #fffaf0 26%, #f7f2e8 100%) !important;
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
          linear-gradient(135deg, rgba(255,255,255,.90), rgba(241,231,255,.90)) !important;
        border: 1px solid rgba(126,96,205,.20) !important;
        backdrop-filter: blur(20px) !important;
        box-shadow: 0 18px 52px rgba(65, 41, 111, .12) !important;
      }

      .main-nav {
        gap: 8px !important;
      }

      .main-nav button,
      .educational-tools-trigger {
        min-height: 42px !important;
        border-radius: 999px !important;
        color: #4a3c5f !important;
        background: rgba(255,255,255,.62) !important;
        border: 1px solid rgba(126,96,205,.14) !important;
        box-shadow: none !important;
      }

      .main-nav button:hover,
      .educational-tools-trigger:hover {
        color: #211532 !important;
        transform: translateY(-1px) !important;
        background: rgba(255,255,255,.12) !important;
      }

      .main-nav button.active,
      .educational-tools-trigger.active {
        color: #07111f !important;
        background: linear-gradient(135deg, #f7d787, #d6a84f) !important;
        box-shadow: 0 16px 36px rgba(214,168,79,.22) !important;
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
        border-color: rgba(148,163,184,.18) !important;
        box-shadow: 0 18px 56px rgba(15,23,42,.08) !important;
      }

      .profile-strip {
        width: min(1160px, calc(100% - 28px)) !important;
        margin: 0 auto 18px !important;
        background:
          radial-gradient(circle at 100% 0%, rgba(54,211,197,.08), transparent 28%),
          rgba(255,255,255,.82) !important;
        border: 1px solid rgba(226,232,240,.62) !important;
        backdrop-filter: blur(18px) !important;
      }

      .page-loader {
        background:
          radial-gradient(circle at 100% 0%, rgba(79,70,229,.10), transparent 30%),
          rgba(255,250,240,.92) !important;
      }

      .mobile-menu-button {
        border-radius: 16px !important;
        color: #07111f !important;
        background: linear-gradient(135deg, #f7d787, #d6a84f) !important;
      }

      /* =========================
         Dark mode integration
      ========================= */

      body.od-theme-dark {
        background: #020617 !important;
      }

      body.od-theme-dark .site-frame,
      body.od-theme-dark .public-gate {
        background:
          radial-gradient(circle at 10% 8%, rgba(54,211,197,.10), transparent 28%),
          radial-gradient(circle at 88% 10%, rgba(214,168,79,.10), transparent 26%),
          linear-gradient(180deg, #020617 0%, #07111f 100%) !important;
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
      body.od-theme-dark [class*="panel"] {
        background:
          radial-gradient(circle at 100% 0%, rgba(79,70,229,.10), transparent 28%),
          rgba(15, 23, 42, .94) !important;
        border-color: rgba(148,163,184,.22) !important;
        color: #e5e7eb !important;
        box-shadow: 0 20px 70px rgba(0,0,0,.28) !important;
      }

      body.od-theme-dark h1,
      body.od-theme-dark h2,
      body.od-theme-dark h3,
      body.od-theme-dark strong,
      body.od-theme-dark b {
        color: #fffaf0 !important;
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
        color: #cbd5e1 !important;
      }

      body.od-theme-dark .auth-card,
      body.od-theme-dark .sample-box,
      body.od-theme-dark .counter-card,
      body.od-theme-dark .site-header,
      body.od-theme-dark .public-footer,
      body.od-theme-dark .site-footer {
        background:
          radial-gradient(circle at 100% 0%, rgba(54,211,197,.10), transparent 30%),
          linear-gradient(135deg, #07111f, #111a35) !important;
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

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: .001ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
      }
    `}</style>
  );
}
