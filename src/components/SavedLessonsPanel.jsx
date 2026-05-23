function formatBookmarkDate(value) {
  if (!value) return "غير محدد";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(value));
  } catch {
    return "غير محدد";
  }
}

function shortPath(value) {
  const text = String(value || "").trim();
  if (!text) return "درس محفوظ";
  return text.length > 95 ? `${text.slice(0, 95)}…` : text;
}

export default function SavedLessonsPanel({
  bookmarks = [],
  loading = false,
  onRefresh,
  onJump
}) {
  const hasBookmarks = bookmarks.length > 0;

  return (
    <section className="saved-lessons-panel" aria-label="الدروس المحفوظة" dir="rtl">
      <style>{`
        .saved-lessons-panel {
          margin: 18px 0;
          border-radius: 30px;
          padding: 20px;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.12), transparent 34%),
            rgba(255,255,255,.94);
          border: 1px solid rgba(148,163,184,.20);
          box-shadow: 0 18px 48px rgba(15,23,42,.07);
        }

        .saved-lessons-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 12px;
        }

        .saved-lessons-title {
          display: grid;
          gap: 4px;
        }

        .saved-lessons-title strong {
          color: #0f172a;
          font-size: 18px;
          line-height: 1.5;
          font-weight: 950;
        }

        .saved-lessons-title span {
          color: #64748b;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 780;
        }

        .saved-lessons-refresh {
          border: 0;
          cursor: pointer;
          min-height: 40px;
          border-radius: 16px;
          padding: 0 13px;
          color: #0f172a;
          background: #f1f5f9;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
        }

        .saved-lessons-empty {
          border-radius: 20px;
          padding: 14px;
          color: #475569;
          background: #f8fafc;
          border: 1px dashed rgba(148,163,184,.38);
          font-size: 12px;
          line-height: 1.9;
          font-weight: 800;
        }

        .saved-lessons-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .saved-lesson-card {
          border: 1px solid rgba(148,163,184,.20);
          cursor: pointer;
          border-radius: 22px;
          padding: 15px;
          text-align: right;
          font-family: inherit;
          background: #ffffff;
          color: #0f172a;
          transition: .2s ease;
        }

        .saved-lesson-card:hover {
          transform: translateY(-2px);
          border-color: rgba(245,158,11,.42);
          box-shadow: 0 18px 34px rgba(245,158,11,.10);
        }

        .saved-lesson-card small {
          display: block;
          color: #92400e;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 950;
          margin-bottom: 5px;
        }

        .saved-lesson-card strong {
          display: block;
          color: #0f172a;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 950;
        }

        .saved-lesson-card p {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.85;
          font-weight: 760;
        }

        .saved-lesson-meta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 900;
        }

        @media (max-width: 820px) {
          .saved-lessons-grid {
            grid-template-columns: 1fr;
          }

          .saved-lessons-head {
            display: grid;
          }

          .saved-lessons-refresh {
            width: fit-content;
          }
        }
      `}</style>

      <div className="saved-lessons-head">
        <div className="saved-lessons-title">
          <strong>دروسي المحفوظة</strong>
          <span>احفظ الدروس المهمة ثم عد إليها بسرعة دون البحث كل مرة.</span>
        </div>

        <button
          type="button"
          className="saved-lessons-refresh"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "جارٍ التحديث..." : "تحديث"}
        </button>
      </div>

      {!hasBookmarks ? (
        <div className="saved-lessons-empty">
          لم تحفظ أي درس بعد. افتح أي درس واضغط زر "حفظ هذا الدرس" ليظهر هنا.
        </div>
      ) : (
        <div className="saved-lessons-grid">
          {bookmarks.slice(0, 8).map((bookmark) => (
            <button
              type="button"
              className="saved-lesson-card"
              key={`${bookmark.month_index}-${bookmark.week_index}-${bookmark.day_index}`}
              onClick={() => onJump?.(bookmark)}
            >
              <small>{shortPath(bookmark.lesson_path)}</small>
              <strong>{bookmark.lesson_title || "درس محفوظ"}</strong>
              {bookmark.excerpt ? <p>{bookmark.excerpt}</p> : null}

              <span className="saved-lesson-meta">
                <span>
                  الشهر {bookmark.month_index} · الأسبوع {bookmark.week_index} · اليوم {bookmark.day_index}
                </span>
                <span>{formatBookmarkDate(bookmark.updated_at || bookmark.created_at)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
