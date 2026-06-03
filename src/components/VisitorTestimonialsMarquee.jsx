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
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function loadTestimonials({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    }

    try {
      const rows = await listPublishedVisitorTestimonials({ limit: 40 });
      setItems(rows);
      setNotice("");
    } catch (error) {
      console.warn("تعذر تحميل تقييمات الزوار:", error);
      setNotice("تعذر تحميل التقييمات الآن.");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadTestimonials();

    const unsubscribe = subscribeToPublishedVisitorTestimonials(() => {
      loadTestimonials({ silent: true });
    });

    const interval = window.setInterval(() => {
      loadTestimonials({ silent: true });
    }, 60000);

    return () => {
      unsubscribe?.();
      window.clearInterval(interval);
    };
  }, []);

  const columns = useMemo(() => buildColumns(items, 4), [items]);
  const hasItems = items.length > 0;

  return (
    <section className="visitor-testimonials" dir="rtl" aria-label="تقييمات الزوار">
      <style>{`
        .visitor-testimonials {
          --vt-ink: #0f172a;
          --vt-muted: #64748b;
          --vt-line: rgba(148,163,184,.20);
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          padding: clamp(22px, 4vw, 34px);
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.10), transparent 30%),
            radial-gradient(circle at 0% 100%, rgba(245,158,11,.10), transparent 32%),
            rgba(255,255,255,.86);
          border: 1px solid rgba(255,255,255,.78);
          box-shadow: 0 22px 70px rgba(15,23,42,.08);
          margin: 18px 0;
        }

        .vt-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
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
          color: #3730a3;
          background: #eef2ff;
          border: 1px solid rgba(79,70,229,.16);
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

        .vt-source-note {
          width: min(250px, 100%);
          border-radius: 14px;
          padding: 12px 14px;
          color: #3730a3;
          background: rgba(238,242,255,.78);
          border: 1px solid rgba(79,70,229,.16);
          font-size: 11px;
          line-height: 1.8;
          font-weight: 850;
        }

        .vt-empty {
          border-radius: 8px;
          padding: 16px;
          color: #475569;
          background: rgba(248,250,252,.84);
          border: 1px dashed rgba(148,163,184,.38);
          font-size: 13px;
          line-height: 1.9;
          font-weight: 800;
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
          background: linear-gradient(to bottom, rgba(248,250,252,.92), transparent);
        }

        .vt-wall::after {
          bottom: 0;
          background: linear-gradient(to top, rgba(248,250,252,.92), transparent);
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
          box-shadow: 0 14px 30px rgba(15,23,42,.07);
        }

        .vt-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .vt-stars {
          color: #f59e0b;
          letter-spacing: 1px;
          font-size: 13px;
          line-height: 1;
        }

        .vt-card time {
          color: #94a3b8;
          font-size: 11px;
          font-weight: 850;
        }

        .vt-card p {
          margin: 0;
          color: #334155;
          font-size: 13px;
          line-height: 1.9;
          font-weight: 780;
        }

        .vt-person {
          display: grid;
          gap: 2px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(148,163,184,.14);
        }

        .vt-person strong {
          color: #0f172a;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 950;
        }

        .vt-person span {
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 760;
        }

        body.od-theme-dark .visitor-testimonials {
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.14), transparent 30%),
            radial-gradient(circle at 0% 100%, rgba(245,158,11,.08), transparent 32%),
            rgba(15,23,42,.94) !important;
          border-color: rgba(148,163,184,.22) !important;
          box-shadow: 0 22px 70px rgba(0,0,0,.28) !important;
        }

        body.od-theme-dark .vt-wall::before {
          background: linear-gradient(to bottom, rgba(15,23,42,.96), transparent);
        }

        body.od-theme-dark .vt-wall::after {
          background: linear-gradient(to top, rgba(15,23,42,.96), transparent);
        }

        body.od-theme-dark .vt-card,
        body.od-theme-dark .vt-empty,
        body.od-theme-dark .vt-source-note {
          background: rgba(30,41,59,.88) !important;
          border-color: rgba(148,163,184,.22) !important;
          box-shadow: 0 14px 30px rgba(0,0,0,.22) !important;
        }

        body.od-theme-dark .vt-head h2,
        body.od-theme-dark .vt-person strong {
          color: #f8fafc !important;
        }

        body.od-theme-dark .vt-head p,
        body.od-theme-dark .vt-card p,
        body.od-theme-dark .vt-person span,
        body.od-theme-dark .vt-card time,
        body.od-theme-dark .vt-empty,
        body.od-theme-dark .vt-source-note {
          color: #cbd5e1 !important;
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

          .vt-source-note {
            width: 100%;
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
          <span className="vt-kicker">تقييمات حقيقية</span>
          <h2>ما يقوله الزوار والمتعلمون عن التجربة</h2>
          <p>
            التقييمات المعروضة هنا تأتي من قاعدة البيانات فقط بعد اعتمادها،
            ولا يمكن نشر تقييم عام مباشرة من صفحة الزوار.
          </p>
        </div>

        <div className="vt-source-note">
          تظهر البطاقات تلقائيًا عند وجود تقييمات منشورة ومعتمدة في قاعدة البيانات.
        </div>
      </div>

      {loading ? (
        <div className="vt-empty">جارٍ تحميل التقييمات الحقيقية...</div>
      ) : !hasItems ? (
        <div className="vt-empty">
          لا توجد تقييمات منشورة بعد. عند اعتماد أول تقييم فعلي سيظهر هنا تلقائيًا.
        </div>
      ) : (
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
      )}

      {notice ? <div className="vt-empty" style={{ marginTop: 12 }}>{notice}</div> : null}
    </section>
  );
}
