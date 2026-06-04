import { useEffect, useState } from "react";
import { fetchPublicTestimonials } from "../lib/feedbackService";

function stars(value) {
  const count = Math.max(1, Math.min(5, Number(value || 5)));
  return "★★★★★".slice(0, count);
}

export default function PublicTestimonials({ limit = 9 }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchPublicTestimonials(limit).then(setItems);
  }, [limit]);

  if (!items.length) return null;

  return (
    <section className="public-section testimonials-section" dir="rtl">
      <style>{`
        .testimonials-section .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .testimonial-card {
          border-radius: 26px;
          padding: 18px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 34%),
            #fff;
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 16px 42px rgba(28, 17, 48,.06);
        }

        .testimonial-card b {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          color: #6d28d9;
          background: #efe9fb;
          font-size: 11px;
          font-weight: 950;
        }

        .testimonial-card p {
          margin: 12px 0;
          color: #463c63;
          line-height: 2;
          font-size: 13px;
          font-weight: 800;
        }

        .testimonial-footer {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          color: #7a6c9a;
          font-size: 12px;
          font-weight: 850;
        }

        .testimonial-stars {
          color: #a855f7;
          letter-spacing: 1px;
        }

        @media (max-width: 900px) {
          .testimonials-section .testimonial-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="section-head">
        <div>
          <h2>أثر الرحلة كما يصفه المتدربون</h2>
          <p>آراء نُشرت بعد موافقة أصحابها ومراجعتها قبل الظهور للزوار.</p>
        </div>
      </div>

      <div className="testimonial-grid">
        {items.map((item) => (
          <article className="testimonial-card" key={item.id}>
            <b>{item.badge_label}</b>
            <p>“{item.testimonial_text}”</p>
            <div className="testimonial-footer">
              <span>{item.display_name}</span>
              <span className="testimonial-stars">{stars(item.rating)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
