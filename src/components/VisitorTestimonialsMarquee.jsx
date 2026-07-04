import { useEffect, useMemo, useState } from "react";
import {
  listPublishedVisitorTestimonials,
  subscribeToPublishedVisitorTestimonials
} from "../lib/visitorTestimonialsService";

function formatDate(value) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function Stars() {
  return (
    <span className="vt-stars" aria-label="5 نجوم">
      ★★★★★
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="vt-card">
      <div className="vt-card-top">
        <Stars />
        <time>{formatDate(review.created_at)}</time>
      </div>

      <p>“{review.quote}”</p>

      <div className="vt-person">
        <strong>{review.reviewer_name}</strong>
        <span>{review.reviewer_meta}</span>
      </div>
    </article>
  );
}

export default function VisitorTestimonialsMarquee() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  async function loadTestimonials() {
    try {
      const rows = await listPublishedVisitorTestimonials({ limit: 32 });
      setItems(rows);
    } catch (error) {
      console.warn("تعذر تحميل تقييمات الزوار:", error);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    loadTestimonials();

    const unsubscribe = subscribeToPublishedVisitorTestimonials(() => {
      loadTestimonials();
    });

    const interval = window.setInterval(loadTestimonials, 60000);

    return () => {
      unsubscribe?.();
      window.clearInterval(interval);
    };
  }, []);

  const marqueeItems = useMemo(() => {
    const baseItems = items.length >= 4 ? items : [...items, ...items, ...items].slice(0, 6);
    return [...baseItems, ...baseItems];
  }, [items]);

  if (!ready || items.length === 0) {
    return null;
  }

  return (
    <section className="visitor-testimonials" dir="rtl" aria-label="تقييمات الزوار">
      <style>{`
        .visitor-testimonials {
          --vt-ink: #211336;
          --vt-muted: #6d607d;
          --vt-line: rgba(139, 92, 246, .18);
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: clamp(18px, 3vw, 26px);
          background:
            radial-gradient(circle at 100% 0%, rgba(124, 58, 237,.14), transparent 28%),
            radial-gradient(circle at 0% 100%, rgba(220,199,255,.14), transparent 30%),
            rgba(250,247,255,.94);
          border: 1px solid rgba(213,196,247,.72);
          box-shadow: 0 18px 52px rgba(60,37,98,.08);
          margin: 18px 0;
        }

        .vt-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-end;
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
        }

        .vt-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 7px 11px;
          color: #5b2bbd;
          background: rgba(240,232,255,.86);
          border: 1px solid rgba(139, 92, 246,.18);
          font-size: 11px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .vt-head h2 {
          margin: 0;
          color: var(--vt-ink);
          font-size: clamp(22px, 3.2vw, 34px);
          line-height: 1.25;
          font-weight: 950;
          letter-spacing: 0;
        }

        .vt-head p {
          margin: 7px 0 0;
          color: var(--vt-muted);
          font-size: 12px;
          line-height: 1.8;
          font-weight: 780;
        }

        .vt-wall {
          position: relative;
          min-height: 204px;
          overflow: hidden;
          mask-image: linear-gradient(to left, transparent 0%, #000 8%, #000 92%, transparent 100%);
        }

        .vt-track {
          display: flex;
          width: max-content;
          gap: 14px;
          animation: vtMoveLeft 38s linear infinite;
          will-change: transform;
        }

        .visitor-testimonials:hover .vt-track,
        .visitor-testimonials:focus-within .vt-track {
          animation-play-state: paused;
        }

        @keyframes vtMoveLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .vt-card {
          flex: 0 0 clamp(230px, 22vw, 292px);
          min-height: 166px;
          border-radius: 20px;
          padding: 14px;
          background: rgba(255,255,255,.94);
          border: 1px solid var(--vt-line);
          box-shadow: 0 12px 26px rgba(60,37,98,.07);
        }

        .vt-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 9px;
        }

        .vt-stars {
          color: #7c3aed;
          letter-spacing: 1px;
          font-size: 12px;
          line-height: 1;
        }

        .vt-card time {
          color: #8f7ca3;
          font-size: 10px;
          font-weight: 850;
        }

        .vt-card p {
          margin: 0;
          color: #3d2a54;
          font-size: 12px;
          line-height: 1.85;
          font-weight: 780;
        }

        .vt-person {
          display: grid;
          gap: 2px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(139, 92, 246,.14);
        }

        .vt-person strong {
          color: #211336;
          font-size: 12px;
          line-height: 1.55;
          font-weight: 950;
        }

        .vt-person span {
          color: #6d607d;
          font-size: 10px;
          line-height: 1.55;
          font-weight: 760;
        }

        body.od-theme-dark .visitor-testimonials {
          background:
            radial-gradient(circle at 100% 0%, rgba(124, 58, 237,.16), transparent 30%),
            radial-gradient(circle at 0% 100%, rgba(139, 92, 246,.12), transparent 32%),
            rgba(15,10,25,.94) !important;
          border-color: rgba(124, 58, 237,.22) !important;
          box-shadow: 0 22px 70px rgba(0,0,0,.26) !important;
        }

        body.od-theme-dark .vt-card {
          background: rgba(32,22,48,.90) !important;
          border-color: rgba(124, 58, 237,.20) !important;
          box-shadow: 0 14px 30px rgba(0,0,0,.22) !important;
        }

        body.od-theme-dark .vt-head h2,
        body.od-theme-dark .vt-person strong {
          color: #fbf7ff !important;
        }

        body.od-theme-dark .vt-head p,
        body.od-theme-dark .vt-card p,
        body.od-theme-dark .vt-person span,
        body.od-theme-dark .vt-card time {
          color: #d9c9ef !important;
        }

        @media (max-width: 760px) {
          .vt-head {
            display: grid;
            grid-template-columns: 1fr;
          }

          .vt-card {
            flex-basis: 252px;
          }
        }

        @media (max-width: 480px) {
          .vt-card {
            flex-basis: 236px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vt-wall {
            min-height: auto;
            overflow: visible;
            mask-image: none;
          }

          .vt-track {
            width: auto;
            flex-wrap: wrap;
            animation: none !important;
          }
        }
      `}</style>

      <div className="vt-head">
        <div>
          <span className="vt-kicker">تجارب الزوار</span>
          <h2>أصوات من تجربة منسقة</h2>
          <p>مقتطفات قصيرة تتحرك بهدوء وتعرض أثر الرحلة بدون ازدحام بصري.</p>
        </div>
      </div>

      <div className="vt-wall" tabIndex={0}>
        <div className="vt-track">
          {marqueeItems.map((review, index) => (
            <ReviewCard review={review} key={`${review.id}-${index}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
