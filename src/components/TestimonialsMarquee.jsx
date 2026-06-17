import NeoMetricGauge from "./NeoMetricGauge";

const REVIEWS = [
  {
    date: "2026/05/18",
    quote: "Ø§Ù„Ø±Ø­Ù„Ø© ØºÙŠÙ‘Ø±Øª Ø·Ø±ÙŠÙ‚Ø© Ù‚Ø±Ø§Ø¡ØªÙŠ Ù„Ù„Ù…Ø´ÙƒÙ„Ø§Øª. ØµØ±Øª Ø£Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù†Ø¸Ø§Ù… Ù‚Ø¨Ù„ Ø§Ù„Ø´Ø®Øµ.",
    name: "Ø¹Ø¨Ø¯Ø§Ù„Ù„Ù‡ Ø§Ù„Ø­Ø±Ø¨ÙŠ",
    meta: "Ù…Ø¯ÙŠØ± Ù…ÙˆØ§Ø±Ø¯ Ø¨Ø´Ø±ÙŠØ© Â· Ø§Ù„Ø±ÙŠØ§Ø¶"
  },
  {
    date: "2026/05/16",
    quote: "Ø£Ù‚ÙˆÙ‰ Ù…Ø§ ÙÙŠ Ø§Ù„Ù…Ù†ØµØ© Ø£Ù†Ù‡Ø§ Ù„Ø§ ØªØ¹Ø·ÙŠ Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ÙÙ‚Ø·ØŒ Ø¨Ù„ ØªØ¯Ø±Ø¨Ùƒ ÙƒÙŠÙ ØªÙÙƒØ± ÙƒÙ…Ù…Ø§Ø±Ø³ OD.",
    name: "Ù†ÙˆØ±Ø© Ø§Ù„Ø¹ØªÙŠØ¨ÙŠ",
    meta: "Ø£Ø®ØµØ§Ø¦ÙŠØ© ØªØ·ÙˆÙŠØ± ØªÙ†Ø¸ÙŠÙ…ÙŠ Â· Ø¬Ø¯Ø©"
  },
  {
    date: "2026/05/12",
    quote: "Ø§Ù„Ù…Ø­Ø§ÙƒØ§Ø© Ø¬Ø¹Ù„ØªÙ†ÙŠ Ø£ÙƒØªØ´Ù Ø£Ù† Ø§Ù„Ø­Ù„ Ø§Ù„Ø³Ø±ÙŠØ¹ Ø£Ø­ÙŠØ§Ù†Ù‹Ø§ Ù‡Ùˆ Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ù…Ø´ÙƒÙ„Ø©.",
    name: "Ø®Ø§Ù„Ø¯ Ø§Ù„Ø¹Ù…Ø±ÙŠ",
    meta: "Ù‚Ø§Ø¦Ø¯ ÙØ±ÙŠÙ‚ Ø¹Ù…Ù„ÙŠØ§Øª Â· Ø§Ù„Ø¯Ù…Ø§Ù…"
  },
  {
    date: "2026/05/09",
    quote: "Ø±Ø§Ø¯Ø§Ø± Ø§Ù„Ø£Ø¯Ø§Ø¡ ÙˆØ§Ø¶Ø­ ÙˆÙ…Ø¨Ø§Ø´Ø±ØŒ Ø£Ø¹Ø·Ø§Ù†ÙŠ ØµÙˆØ±Ø© Ø¯Ù‚ÙŠÙ‚Ø© Ø¹Ù† ÙØ¬ÙˆØ§ØªÙŠ Ø§Ù„Ù…Ù‡Ù†ÙŠØ©.",
    name: "Ø³Ø§Ø±Ø© Ø§Ù„Ù‚Ø­Ø·Ø§Ù†ÙŠ",
    meta: "HRBP Â· Ø§Ù„Ø®Ø¨Ø±"
  },
  {
    date: "2026/05/07",
    quote: "Ù…Ù„ÙÙŠ Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ Ø±Ø§Ø¦Ø¹Ø› ÙŠØ¬Ù…Ø¹ Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§Øª ÙˆØ§Ù„ØªØ£Ù…Ù„Ø§Øª ÙˆØ§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª ÙÙŠ Ù…ÙƒØ§Ù† ÙˆØ§Ø­Ø¯.",
    name: "ÙÙŠØµÙ„ Ø§Ù„Ø´Ù…Ø±ÙŠ",
    meta: "Ù…Ø³ØªØ´Ø§Ø± Ø¥Ø¯Ø§Ø±ÙŠ Â· Ø§Ù„ÙƒÙˆÙŠØª"
  },
  {
    date: "2026/05/05",
    quote: "Ø£ÙƒØ«Ø± Ù…Ø§ Ø£Ø¹Ø¬Ø¨Ù†ÙŠ Ù‡Ùˆ Ø±Ø¨Ø· Ø§Ù„Ø¯Ø±ÙˆØ³ Ø¨Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠØŒ ÙˆÙ„ÙŠØ³ Ù…Ø¬Ø±Ø¯ Ù‚Ø±Ø§Ø¡Ø©.",
    name: "Ø±ÙŠÙ… Ø§Ù„Ù…Ø·ÙŠØ±ÙŠ",
    meta: "Learning & OD Â· Ø§Ù„Ø±ÙŠØ§Ø¶"
  },
  {
    date: "2026/05/02",
    quote: "Ø§Ù„Ù…ÙˆØ¬Ù‡ Ø§Ù„Ø°ÙƒÙŠ Ø³Ø§Ø¹Ø¯Ù†ÙŠ Ø£Ø¨Ù†ÙŠ Ø£Ø³Ø¦Ù„Ø© ØªØ´Ø®ÙŠØµÙŠØ© Ù‚Ø¨Ù„ Ù…Ø§ Ø£Ù‚ØªØ±Ø­ Ø­Ù„ÙˆÙ„Ù‹Ø§.",
    name: "Ù…Ø­Ù…Ø¯ Ø§Ù„Ø³Ø¨ÙŠØ¹ÙŠ",
    meta: "Ù…Ø¯ÙŠØ± ØªØ¯Ø±ÙŠØ¨ Â· Ø§Ù„Ù‚ØµÙŠÙ…"
  },
  {
    date: "2026/04/29",
    quote: "ØªØµÙ…ÙŠÙ… Ø§Ù„Ø±Ø­Ù„Ø© Ø§Ù„Ø´Ù‡Ø±ÙŠØ© Ø¬Ø¹Ù„ Ø§Ù„ØªØ¹Ù„Ù… Ù‚Ø§Ø¨Ù„Ù‹Ø§ Ù„Ù„Ø§Ø³ØªÙ…Ø±Ø§Ø± Ø¨Ø¯ÙˆÙ† ØªØ´ØªØª.",
    name: "Ø£Ù…Ù„ Ø§Ù„Ø²Ù‡Ø±Ø§Ù†ÙŠ",
    meta: "Ø£Ø®ØµØ§Ø¦ÙŠØ© Ù…ÙˆØ§Ù‡Ø¨ Â· Ù…ÙƒØ©"
  },
  {
    date: "2026/04/27",
    quote: "Ø£Ø®ÙŠØ±Ù‹Ø§ Ù…Ø­ØªÙˆÙ‰ Ø¹Ø±Ø¨ÙŠ ÙÙŠ OD ÙŠØªÙƒÙ„Ù… Ø¨Ù…Ù†Ø·Ù‚ Ø¹Ù…Ù„ÙŠ Ø¹Ù…ÙŠÙ‚ ÙˆÙ„ÙŠØ³ Ø´Ø¹Ø§Ø±Ø§Øª Ø¹Ø§Ù…Ø©.",
    name: "Ø¹Ø¨Ø¯Ø§Ù„Ø¹Ø²ÙŠØ² Ø§Ù„Ù…Ø§Ù„ÙƒÙŠ",
    meta: "Ù…Ù…Ø§Ø±Ø³ ØªØ·ÙˆÙŠØ± Ù…Ø¤Ø³Ø³ÙŠ Â· Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©"
  },
  {
    date: "2026/04/24",
    quote: "ÙƒÙ„ Ø¯Ø±Ø³ ÙŠÙ†ØªÙ‡ÙŠ Ø¨Ø³Ø¤Ø§Ù„ ØªØ·Ø¨ÙŠÙ‚ÙŠ ÙŠØ¬Ø¨Ø±Ùƒ ØªÙ†Ù‚Ù„ Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø¥Ù„Ù‰ Ù…ÙˆÙ‚Ù ÙˆØ§Ù‚Ø¹ÙŠ.",
    name: "Ù„ÙˆÙ„ÙˆØ© Ø§Ù„Ø¯ÙˆØ³Ø±ÙŠ",
    meta: "Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© Ù…ÙˆØ§Ø±Ø¯ Ø¨Ø´Ø±ÙŠØ© Â· Ø§Ù„Ø±ÙŠØ§Ø¶"
  },
  {
    date: "2026/04/20",
    quote: "Ø­Ø§Ø³Ø¨Ø© Ø§Ù„Ø¹Ø§Ø¦Ø¯ Ø¬Ø¹Ù„ØªÙ†ÙŠ Ø£Ø´Ø±Ø­ Ù‚ÙŠÙ…Ø© Ø§Ù„ØªØ¹Ù„Ù… Ø¨Ù„ØºØ© Ø£Ø«Ø± ÙˆÙˆÙ‚ØªØŒ Ù„Ø§ Ø¨Ù„ØºØ© Ø­Ø¶ÙˆØ± ÙÙ‚Ø·.",
    name: "Ø¨Ù†Ø¯Ø± Ø§Ù„Ø¹Ù†Ø²ÙŠ",
    meta: "Ù…Ø¯ÙŠØ± Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ© Ø¯Ø§Ø®Ù„ÙŠØ© Â· Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©"
  },
  {
    date: "2026/04/18",
    quote: "Ø£Ø­Ø¨Ø¨Øª Ø£Ù† Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª Ø§Ù„Ø´Ù‡Ø±ÙŠØ© Ù…Ø±ØªØ¨Ø·Ø© Ø¨Ø§Ù„ØªÙ‚Ø¯Ù… Ø§Ù„ÙØ¹Ù„ÙŠØŒ Ù„Ø§ Ø¨Ù…Ø¬Ø±Ø¯ ÙØªØ­ Ø§Ù„ØµÙØ­Ø©.",
    name: "Ù…Ù‡Ø§ Ø§Ù„Ø­Ø±Ø¨ÙŠ",
    meta: "People Development Â· Ø¬Ø¯Ø©"
  }
];

function Stars() {
  return (
    <span className="tm-stars" aria-label="5 Ù†Ø¬ÙˆÙ…">
      â˜…â˜…â˜…â˜…â˜…
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="tm-card">
      <div className="tm-card-top">
        <Stars />
        <time>{review.date}</time>
      </div>

      <p>â€œ{review.quote}â€</p>

      <div className="tm-person">
        <strong>{review.name}</strong>
        <span>{review.meta}</span>
      </div>
    </article>
  );
}

function buildColumns(items, count = 4) {
  return Array.from({ length: count }, (_, columnIndex) =>
    items.filter((_, itemIndex) => itemIndex % count === columnIndex)
  );
}

export default function TestimonialsMarquee() {
  const columns = buildColumns(REVIEWS, 4);

  return (
    <section className="testimonials-marquee" dir="rtl" aria-label="ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø§Ù„Ù…ØªØ¯Ø±Ø¨ÙŠÙ†">
      <style>{`
        .testimonials-marquee {
          --tm-ink: #18102e;
          --tm-muted: #7a6c9a;
          --tm-line: rgba(167, 139, 250,.20);
          position: relative;
          width: min(1220px, calc(100% - 28px));
          margin: 22px auto 76px;
          overflow: hidden;
          border-radius: 28px;
          padding: clamp(22px, 4vw, 34px);
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 30%),
            radial-gradient(circle at 0% 100%, rgba(245,158,11,.10), transparent 32%),
            rgba(255,255,255,.86);
          border: 1px solid rgba(255,255,255,.78);
          box-shadow: 0 22px 70px rgba(28, 17, 48,.08);
        }

        .tm-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: end;
          margin-bottom: 22px;
          position: relative;
          z-index: 2;
        }

        .tm-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 12px;
          color: #6d28d9;
          background: #efe9fb;
          border: 1px solid rgba(139, 92, 246,.16);
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 9px;
        }

        .tm-head h2 {
          margin: 0;
          color: var(--tm-ink);
          font-size: clamp(24px, 4vw, 42px);
          line-height: 1.25;
          font-weight: 950;
          letter-spacing: -0.5px;
        }

        .tm-head p {
          margin: 8px 0 0;
          color: var(--tm-muted);
          font-size: 13px;
          line-height: 1.9;
          font-weight: 780;
        }

        .tm-counter {
          min-width: 118px;
          border-radius: 20px;
          padding: 13px 15px;
          color: #fff;
          background: linear-gradient(135deg, #18102e, #3b1d6e);
          text-align: center;
        }

        .tm-counter strong {
          display: block;
          color: #fbbf24;
          font-size: 26px;
          line-height: 1;
          font-weight: 950;
        }

        .tm-counter span {
          display: block;
          margin-top: 5px;
          color: #c9bdf0;
          font-size: 11px;
          font-weight: 850;
        }

        .tm-wall {
          position: relative;
          height: 520px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          overflow: hidden;
          mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%);
        }

        .tm-wall::before,
        .tm-wall::after {
          content: "";
          position: absolute;
          right: 0;
          left: 0;
          height: 76px;
          z-index: 4;
          pointer-events: none;
        }

        .tm-wall::before {
          top: 0;
          background: linear-gradient(to bottom, rgba(248,250,252,.92), transparent);
        }

        .tm-wall::after {
          bottom: 0;
          background: linear-gradient(to top, rgba(248,250,252,.92), transparent);
        }

        .tm-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
          animation: tmScrollUp var(--tm-duration, 32s) linear infinite;
          will-change: transform;
        }

        .tm-column:nth-child(2),
        .tm-column:nth-child(4) {
          animation-name: tmScrollDown;
        }

        .tm-column:nth-child(1) { --tm-duration: 34s; }
        .tm-column:nth-child(2) { --tm-duration: 40s; }
        .tm-column:nth-child(3) { --tm-duration: 30s; }
        .tm-column:nth-child(4) { --tm-duration: 46s; }

        .testimonials-marquee:hover .tm-column,
        .testimonials-marquee:focus-within .tm-column {
          animation-play-state: paused;
        }

        @keyframes tmScrollUp {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }

        @keyframes tmScrollDown {
          from { transform: translateY(-50%); }
          to { transform: translateY(0); }
        }

        .tm-card {
          border-radius: 22px;
          padding: 15px;
          background: rgba(255,255,255,.92);
          border: 1px solid var(--tm-line);
          box-shadow: 0 14px 30px rgba(28, 17, 48,.07);
        }

        .tm-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .tm-stars {
          color: #a855f7;
          letter-spacing: 1px;
          font-size: 13px;
          line-height: 1;
        }

        .tm-card time {
          color: #9d8fc0;
          font-size: 11px;
          font-weight: 850;
        }

        .tm-card p {
          margin: 0;
          color: #463c63;
          font-size: 13px;
          line-height: 1.9;
          font-weight: 780;
        }

        .tm-person {
          display: grid;
          gap: 2px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(167, 139, 250,.14);
        }

        .tm-person strong {
          color: #18102e;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 950;
        }

        .tm-person span {
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 760;
        }

        body.od-theme-dark .testimonials-marquee {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.14), transparent 30%),
            radial-gradient(circle at 0% 100%, rgba(245,158,11,.08), transparent 32%),
            rgba(28, 17, 48,.94) !important;
          border-color: rgba(167, 139, 250,.22) !important;
          box-shadow: 0 22px 70px rgba(0,0,0,.28) !important;
        }

        body.od-theme-dark .tm-wall::before {
          background: linear-gradient(to bottom, rgba(28, 17, 48,.96), transparent);
        }

        body.od-theme-dark .tm-wall::after {
          background: linear-gradient(to top, rgba(28, 17, 48,.96), transparent);
        }

        body.od-theme-dark .tm-card {
          background: rgba(30,41,59,.88) !important;
          border-color: rgba(167, 139, 250,.22) !important;
          box-shadow: 0 14px 30px rgba(0,0,0,.22) !important;
        }

        body.od-theme-dark .tm-head h2,
        body.od-theme-dark .tm-person strong {
          color: #f4f0fb !important;
        }

        body.od-theme-dark .tm-head p,
        body.od-theme-dark .tm-card p,
        body.od-theme-dark .tm-person span,
        body.od-theme-dark .tm-card time {
          color: #c9bdf0 !important;
        }

        @media (max-width: 1040px) {
          .tm-wall {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .tm-column:nth-child(4) {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .tm-head {
            grid-template-columns: 1fr;
          }

          .tm-counter {
            width: fit-content;
          }

          .tm-wall {
            height: 580px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .tm-column:nth-child(3),
          .tm-column:nth-child(4) {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .tm-wall {
            height: 560px;
            grid-template-columns: 1fr;
          }

          .tm-column:nth-child(2),
          .tm-column:nth-child(3),
          .tm-column:nth-child(4) {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tm-wall {
            height: auto;
            max-height: none;
            overflow: visible;
            mask-image: none;
          }

          .tm-wall::before,
          .tm-wall::after {
            display: none;
          }

          .tm-column {
            animation: none !important;
            transform: none !important;
          }

          .tm-column .tm-card:nth-child(n + 7) {
            display: none;
          }
        }
      `}</style>

      <div className="tm-head">
        <div>
          <span className="tm-kicker">Ø¬Ø¯Ø§Ø± Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª</span>
          <h2>Ø£Ø«Ø± Ø§Ù„ØªØ¬Ø±Ø¨Ø© ÙƒÙ…Ø§ ÙŠØ±Ø§Ù‡ Ø§Ù„Ù…ØªØ¹Ù„Ù…ÙˆÙ†</h2>
          <p>
            Ø¢Ø±Ø§Ø¡ Ù‚ØµÙŠØ±Ø© Ù…Ù† Ù…ØªØ¯Ø±Ø¨ÙŠÙ† ÙˆÙ…Ù…Ø§Ø±Ø³ÙŠÙ† Ø§Ø³ØªØ®Ø¯Ù…ÙˆØ§ Ø§Ù„Ø±Ø­Ù„Ø©ØŒ Ø§Ù„Ø±Ø§Ø¯Ø§Ø±ØŒ Ø§Ù„Ù…Ø­Ø§ÙƒØ§Ø©ØŒ
            ÙˆØ§Ù„Ù…ÙˆØ¬Ù‡ Ø§Ù„Ø°ÙƒÙŠ Ù„Ø¨Ù†Ø§Ø¡ Ø·Ø±ÙŠÙ‚Ø© ØªÙÙƒÙŠØ± Ø£Ø¹Ù…Ù‚ ÙÙŠ Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ.
          </p>
        </div>

        <NeoMetricGauge
          className="tm-counter-gauge"
          value={REVIEWS.length}
          max={REVIEWS.length}
          displayValue={REVIEWS.length}
          label="تقييم مختار"
          status="progress"
          size="default"
        />
      </div>

      <div className="tm-wall" tabIndex={0}>
        {columns.map((column, columnIndex) => {
          const repeated = [...column, ...column, ...column, ...column];

          return (
            <div className="tm-column" key={`column-${columnIndex}`} aria-hidden={columnIndex > 1 ? undefined : false}>
              {repeated.map((review, index) => (
                <ReviewCard
                  key={`${columnIndex}-${review.name}-${index}`}
                  review={review}
                />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

