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

function buildColumns(items, count = 4) {
  return Array.from({ length: count }, (_, columnIndex) =>
    items.filter((_, itemIndex) => itemIndex % count === columnIndex)
  );
}

export default function VisitorTestimonialsMarquee() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  async function loadTestimonials() {
    try {
      const rows = await listPublishedVisitorTestimonials({ limit: 40 });
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

  const columns = useMemo(() => buildColumns(items, 4), [items]);

  // لا نعرض القسم إطلاقًا إذا لا توجد تقييمات منشورة؛ حتى لا يرى الزائر أي رسائل داخلية.
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
          border-radius: 28px;
          padding: clamp(22px, 4vw, 34px);
          background:
            radial-gradient(circle at 100% 0%, rgba(124, 58, 237,.16), transparent 30%),
            radial-gradient(circle at 0% 100%, rgba(220,199,255,.18), transparent 32%),
            rgba(250,247,255,.92);
          border: 1px solid rgba(213,196,247,.72);
          box-shadow: 0 22px 70px rgba(60,37,98,.10);
          margin: 18px 0;
        }

        .vt-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 18px;
          align-items: end;
          margin-bottom: 22px;
          position: relative;
          z-index: 2;
        }

        .vt-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 12px;
          color: #5b2bbd;
          background: rgba(240,232,255,.86);
          border: 1px solid rgba(139, 92, 246,.18);
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 9px;
        }

        .vt-head h2 {
          margin: 0;
          color: var(--vt-ink);
          font-size: clamp(24px, 4vw, 42px);
          line-height: 1.25;
          font-weight: 950;
          letter-spacing: 0;
        }

        .vt-head p {
          margin: 8px 0 0;
          color: var(--vt-muted);
          font-size: 13px;
          line-height: 1.9;
          font-weight: 780;
        }

        .vt-wall {
          position: relative;
          height: 520px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          overflow: hidden;
          mask-image: linear-gradient(to bottom, transparent 0%, #000 12%, #000 88%, transparent 100%);
        }

        .vt-wall::before,
        .vt-wall::after {
          content: "";
          position: absolute;
          right: 0;
          left: 0;
          height: 76px;
          z-index: 4;
          pointer-events: none;
        }

        .vt-wall::before {
          top: 0;
          background: linear-gradient(to bottom, rgba(250,247,255,.96), transparent);
        }

        .vt-wall::after {
          bottom: 0;
          background: linear-gradient(to top, rgba(250,247,255,.96), transparent);
        }

        .vt-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 0;
          animation: vtScrollUp var(--vt-duration, 32s) linear infinite;
          will-change: transform;
        }

        .vt-column:nth-child(2),
        .vt-column:nth-child(4) {
          animation-name: vtScrollDown;
        }

        .vt-column:nth-child(1) { --vt-duration: 34s; }
        .vt-column:nth-child(2) { --vt-duration: 40s; }
        .vt-column:nth-child(3) { --vt-duration: 30s; }
        .vt-column:nth-child(4) { --vt-duration: 46s; }

        .visitor-testimonials:hover .vt-column,
        .visitor-testimonials:focus-within .vt-column {
          animation-play-state: paused;
        }

        @keyframes vtScrollUp {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }

        @keyframes vtScrollDown {
          from { transform: translateY(-50%); }
          to { transform: translateY(0); }
        }

        .vt-card {
          border-radius: 8px;
          padding: 15px;
          background: rgba(255,255,255,.92);
          border: 1px solid var(--vt-line);
          box-shadow: 0 14px 30px rgba(60,37,98,.08);
        }

        .vt-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .vt-stars {
          color: #7c3aed;
          letter-spacing: 1px;
          font-size: 13px;
          line-height: 1;
        }

        .vt-card time {
          color: #8f7ca3;
          font-size: 11px;
          font-weight: 850;
        }

        .vt-card p {
          margin: 0;
          color: #3d2a54;
          font-size: 13px;
          line-height: 1.9;
          font-weight: 780;
        }

        .vt-person {
          display: grid;
          gap: 2px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(139, 92, 246,.14);
        }

        .vt-person strong {
          color: #211336;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 950;
        }

        .vt-person span {
          color: #6d607d;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 760;
        }

        body.od-theme-dark .visitor-testimonials {
          background:
            radial-gradient(circle at 100% 0%, rgba(124, 58, 237,.16), transparent 30%),
            radial-gradient(circle at 0% 100%, rgba(139, 92, 246,.12), transparent 32%),
            rgba(15,10,25,.94) !important;
          border-color: rgba(124, 58, 237,.22) !important;
          box-shadow: 0 22px 70px rgba(0,0,0,.28) !important;
        }

        body.od-theme-dark .vt-wall::before {
          background: linear-gradient(to bottom, rgba(15,10,25,.96), transparent);
        }

        body.od-theme-dark .vt-wall::after {
          background: linear-gradient(to top, rgba(15,10,25,.96), transparent);
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

        @media (max-width: 1040px) {
          .vt-wall {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .vt-column:nth-child(4) {
            display: none;
          }
        }

        @media (max-width: 760px) {
          .vt-head {
            grid-template-columns: 1fr;
          }

          .vt-wall {
            height: 580px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .vt-column:nth-child(3),
          .vt-column:nth-child(4) {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .vt-wall {
            height: 560px;
            grid-template-columns: 1fr;
          }

          .vt-column:nth-child(2),
          .vt-column:nth-child(3),
          .vt-column:nth-child(4) {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .vt-wall {
            height: auto;
            max-height: none;
            overflow: visible;
            mask-image: none;
          }

          .vt-wall::before,
          .vt-wall::after {
            display: none;
          }

          .vt-column {
            animation: none !important;
            transform: none !important;
          }

          .vt-column .vt-card:nth-child(n + 7) {
            display: none;
          }
        }
      `}</style>

      <div className="vt-head">
        <div>
          <span className="vt-kicker">تجارب الزوار</span>
          <h2>أصوات من تجربة منسقة</h2>
          <p>
            مقتطفات قصيرة من تجارب حقيقية تعكس وضوح الرحلة وأثرها المعرفي.
          </p>
        </div>
      </div>

      <div className="vt-wall" tabIndex={0}>
        {columns.map((column, columnIndex) => {
          const repeated = [...column, ...column, ...column, ...column];

          return (
            <div className="vt-column" key={`column-${columnIndex}`}>
              {repeated.map((review, index) => (
                <ReviewCard
                  key={`${columnIndex}-${review.id}-${index}`}
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
