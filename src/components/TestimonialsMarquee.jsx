const REVIEWS = [
  {
    date: "2026/05/18",
    quote: "الرحلة غيّرت طريقة قراءتي للمشكلات. صرت أبحث عن النظام قبل الشخص.",
    name: "عبدالله الحربي",
    meta: "مدير موارد بشرية · الرياض"
  },
  {
    date: "2026/05/16",
    quote: "أقوى ما في المنصة أنها لا تعطي معلومات فقط، بل تدربك كيف تفكر كممارس OD.",
    name: "نورة العتيبي",
    meta: "أخصائية تطوير تنظيمي · جدة"
  },
  {
    date: "2026/05/12",
    quote: "المحاكاة جعلتني أكتشف أن الحل السريع أحيانًا هو بداية المشكلة.",
    name: "خالد العمري",
    meta: "قائد فريق عمليات · الدمام"
  },
  {
    date: "2026/05/09",
    quote: "رادار الأداء واضح ومباشر، أعطاني صورة دقيقة عن فجواتي المهنية.",
    name: "سارة القحطاني",
    meta: "HRBP · الخبر"
  },
  {
    date: "2026/05/07",
    quote: "ملفي التعليمي رائع؛ يجمع الملاحظات والتأملات والشهادات في مكان واحد.",
    name: "فيصل الشمري",
    meta: "مستشار إداري · الكويت"
  },
  {
    date: "2026/05/05",
    quote: "أكثر ما أعجبني هو ربط الدروس بالتطبيق الأسبوعي، وليس مجرد قراءة.",
    name: "ريم المطيري",
    meta: "Learning & OD · الرياض"
  },
  {
    date: "2026/05/02",
    quote: "الموجه الذكي ساعدني أبني أسئلة تشخيصية قبل ما أقترح حلولًا.",
    name: "محمد السبيعي",
    meta: "مدير تدريب · القصيم"
  },
  {
    date: "2026/04/29",
    quote: "تصميم الرحلة الشهرية جعل التعلم قابلًا للاستمرار بدون تشتت.",
    name: "أمل الزهراني",
    meta: "أخصائية مواهب · مكة"
  },
  {
    date: "2026/04/27",
    quote: "أخيرًا محتوى عربي في OD يتكلم بمنطق عملي عميق وليس شعارات عامة.",
    name: "عبدالعزيز المالكي",
    meta: "ممارس تطوير مؤسسي · المدينة"
  },
  {
    date: "2026/04/24",
    quote: "كل درس ينتهي بسؤال تطبيقي يجبرك تنقل المعرفة إلى موقف واقعي.",
    name: "لولوة الدوسري",
    meta: "استشارية موارد بشرية · الرياض"
  },
  {
    date: "2026/04/20",
    quote: "حاسبة العائد جعلتني أشرح قيمة التعلم بلغة أثر ووقت، لا بلغة حضور فقط.",
    name: "بندر العنزي",
    meta: "مدير أكاديمية داخلية · السعودية"
  },
  {
    date: "2026/04/18",
    quote: "أحببت أن الشهادات الشهرية مرتبطة بالتقدم الفعلي، لا بمجرد فتح الصفحة.",
    name: "مها الحربي",
    meta: "People Development · جدة"
  }
];

function Stars() {
  return (
    <span className="tm-stars" aria-label="5 نجوم">
      ★★★★★
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

      <p>“{review.quote}”</p>

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
    <section className="testimonials-marquee" dir="rtl" aria-label="تقييمات المتدربين">
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
          border-radius: 8px;
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
          <span className="tm-kicker">جدار التقييمات</span>
          <h2>أثر التجربة كما يراه المتعلمون</h2>
          <p>
            آراء قصيرة من متدربين وممارسين استخدموا الرحلة، الرادار، المحاكاة،
            والموجه الذكي لبناء طريقة تفكير أعمق في التطوير التنظيمي.
          </p>
        </div>

        <div className="tm-counter">
          <strong>{REVIEWS.length}</strong>
          <span>تقييم مختار</span>
        </div>
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
