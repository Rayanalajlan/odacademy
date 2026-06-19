import { useMemo, useState } from "react";
import {
  COURSE_SEARCH_SUGGESTIONS,
  searchCourse
} from "../lib/courseSearchService";

export default function CourseSearch({
  course = [],
  onJump,
  placeholder = "ابحث داخل الرحلة..."
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const results = useMemo(() => {
    return searchCourse(course, query, 10);
  }, [course, query]);

  const cleanQuery = query.trim();
  const hasQuery = cleanQuery.length >= 2;

  function chooseSuggestion(value) {
    setQuery(value);
    setExpanded(true);
  }

  function jump(result) {
    onJump?.(result);
    setExpanded(false);
  }

  return (
    <section className="course-search-box course-search-box--stable" aria-label="البحث داخل الرحلة التعليمية">
      <style>{`
        .course-search-box {
          margin: 18px 0;
          border-radius: 30px;
          padding: 20px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 32%),
            rgba(255,255,255,.94);
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
        }

        .course-search-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          margin-bottom: 14px;
        }

        .course-search-title {
          display: grid;
          gap: 4px;
        }

        .course-search-title strong {
          color: #18102e;
          font-size: 18px;
          line-height: 1.5;
          font-weight: 950;
        }

        .course-search-title span {
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 780;
        }

        .course-search-counter {
          border-radius: 999px;
          padding: 8px 12px;
          color: #6d28d9;
          background: #efe9fb;
          border: 1px solid rgba(139, 92, 246,.18);
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
        }

        .course-search-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
        }

        .course-search-input {
          width: 100%;
          min-height: 52px;
          border-radius: 18px;
          border: 1px solid #c9bdf0;
          padding: 0 15px;
          color: #18102e;
          background: #ffffff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 850;
          outline: none;
          box-sizing: border-box;
        }

        .course-search-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,.10);
        }

        .course-search-clear {
          border: 0;
          cursor: pointer;
          min-height: 52px;
          border-radius: 18px;
          padding: 0 15px;
          color: #18102e;
          background: #efe9fb;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
        }

        .course-search-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .course-search-suggestions button {
          border: 1px solid rgba(167, 139, 250,.22);
          cursor: pointer;
          border-radius: 999px;
          padding: 8px 11px;
          color: #463c63;
          background: #ffffff;
          font-family: inherit;
          font-size: 11px;
          font-weight: 900;
        }

        .course-search-results {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }

        .course-search-result {
          width: 100%;
          border: 1px solid rgba(167, 139, 250,.20);
          cursor: pointer;
          border-radius: 22px;
          padding: 15px;
          text-align: right;
          font-family: inherit;
          background: #ffffff;
          color: #18102e;
          transition: .2s ease;
        }

        .course-search-result:hover {
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246,.35);
          box-shadow: 0 18px 34px rgba(139, 92, 246,.10);
        }

        .course-search-path {
          display: block;
          color: #8b5cf6;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 950;
          margin-bottom: 6px;
        }

        .course-search-result strong {
          display: block;
          color: #18102e;
          font-size: 15px;
          line-height: 1.7;
          font-weight: 950;
        }

        .course-search-result p {
          margin: 6px 0 0;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 760;
        }

        .course-search-empty {
          margin-top: 14px;
          border-radius: 20px;
          padding: 14px;
          color: #92400e;
          background: #fffbeb;
          border: 1px solid #fde68a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 850;
        }

        @media (max-width: 680px) {
          .course-search-head,
          .course-search-row {
            grid-template-columns: 1fr;
          }

          .course-search-counter {
            width: fit-content;
          }
        }

        html body .course-search-box--stable.course-search-box--stable {
          width: auto !important;
          min-height: 0 !important;
          margin: 18px 0 !important;
          padding: 20px !important;
          border-radius: 30px !important;
          overflow: hidden !important;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 32%),
            rgba(255,255,255,.94) !important;
          border: 1px solid rgba(167, 139, 250,.20) !important;
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07) !important;
          backdrop-filter: none !important;
        }

        html body .course-search-box--stable .course-search-head,
        html body .course-search-box--stable .course-search-row,
        html body .course-search-box--stable .course-search-suggestions {
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
        }

        html body .course-search-box--stable .course-search-head {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          gap: 14px !important;
          align-items: center !important;
          padding: 0 !important;
          margin: 0 0 14px !important;
        }

        html body .course-search-box--stable .course-search-row {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          gap: 10px !important;
          align-items: stretch !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        html body .course-search-box--stable .course-search-title {
          display: grid !important;
          gap: 4px !important;
          padding: 0 !important;
          min-width: 0 !important;
        }

        html body .course-search-box--stable .course-search-title strong {
          color: #18102e !important;
          -webkit-text-fill-color: #18102e !important;
          font-size: 18px !important;
          line-height: 1.5 !important;
          font-weight: 950 !important;
        }

        html body .course-search-box--stable .course-search-title span {
          color: #7a6c9a !important;
          -webkit-text-fill-color: #7a6c9a !important;
          font-size: 12px !important;
          line-height: 1.8 !important;
          font-weight: 780 !important;
        }

        html body .course-search-box--stable .course-search-counter {
          width: fit-content !important;
          min-width: 0 !important;
          min-height: 38px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 8px 14px !important;
          border-radius: 999px !important;
          color: #6d28d9 !important;
          -webkit-text-fill-color: #6d28d9 !important;
          background: #efe9fb !important;
          border: 1px solid rgba(139, 92, 246,.18) !important;
          box-shadow: none !important;
          white-space: nowrap !important;
        }

        html body .course-search-box--stable .course-search-input {
          width: 100% !important;
          height: 52px !important;
          min-height: 52px !important;
          padding: 0 15px !important;
          border-radius: 18px !important;
          color: #18102e !important;
          -webkit-text-fill-color: #18102e !important;
          background: #fff !important;
          border: 1px solid #c9bdf0 !important;
          box-shadow: none !important;
          box-sizing: border-box !important;
        }

        html body .course-search-box--stable .course-search-clear {
          width: auto !important;
          min-width: 72px !important;
          height: 52px !important;
          min-height: 52px !important;
          padding: 0 15px !important;
          border-radius: 18px !important;
          color: #18102e !important;
          -webkit-text-fill-color: #18102e !important;
          background: #efe9fb !important;
          border: 1px solid transparent !important;
          box-shadow: none !important;
        }

        html body .course-search-box--stable .course-search-suggestions {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
          padding: 0 !important;
          margin: 12px 0 0 !important;
        }

        html body .course-search-box--stable .course-search-suggestions button {
          height: 38px !important;
          min-height: 38px !important;
          padding: 8px 11px !important;
          border-radius: 999px !important;
          color: #463c63 !important;
          -webkit-text-fill-color: #463c63 !important;
          background: #fff !important;
          border: 1px solid rgba(167, 139, 250,.22) !important;
          box-shadow: none !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable.course-search-box--stable {
          width: auto !important;
          min-height: 0 !important;
          margin: 18px 0 !important;
          padding: 20px !important;
          border-radius: 30px !important;
          overflow: hidden !important;
          background:
            radial-gradient(circle at 100% 0%, rgba(167, 139, 250,.14), transparent 32%),
            #1b1130 !important;
          border: 1px solid rgba(167, 139, 250,.28) !important;
          box-shadow: 0 18px 48px rgba(0, 0, 0,.18) !important;
          backdrop-filter: none !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-head,
        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-row,
        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-suggestions {
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-head {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          gap: 14px !important;
          align-items: center !important;
          padding: 0 !important;
          margin: 0 0 14px !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-row {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          gap: 10px !important;
          align-items: stretch !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-title strong {
          color: #f7f2ff !important;
          -webkit-text-fill-color: #f7f2ff !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-title span {
          color: #d8ccf3 !important;
          -webkit-text-fill-color: #d8ccf3 !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-counter {
          min-height: 38px !important;
          padding: 8px 14px !important;
          border-radius: 999px !important;
          color: #f4effc !important;
          -webkit-text-fill-color: #f4effc !important;
          background: rgba(167, 139, 250,.12) !important;
          border: 1px solid rgba(167, 139, 250,.30) !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-input {
          height: 52px !important;
          min-height: 52px !important;
          padding: 0 15px !important;
          border-radius: 18px !important;
          color: #f7f2ff !important;
          -webkit-text-fill-color: #f7f2ff !important;
          background: #130b24 !important;
          border: 1px solid rgba(167, 139, 250,.28) !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-clear {
          width: auto !important;
          min-width: 72px !important;
          height: 52px !important;
          min-height: 52px !important;
          padding: 0 15px !important;
          border-radius: 18px !important;
          color: #f4effc !important;
          -webkit-text-fill-color: #f4effc !important;
          background: rgba(167, 139, 250,.12) !important;
          border: 1px solid rgba(167, 139, 250,.30) !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-suggestions {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
          padding: 0 !important;
          margin: 12px 0 0 !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-suggestions button {
          height: 38px !important;
          min-height: 38px !important;
          padding: 8px 11px !important;
          border-radius: 999px !important;
          color: #f7f2ff !important;
          -webkit-text-fill-color: #f7f2ff !important;
          background: #241640 !important;
          border: 1px solid rgba(167, 139, 250,.26) !important;
        }

        @media (max-width: 680px) {
          html body .course-search-box--stable .course-search-head,
          html body .course-search-box--stable .course-search-row,
          html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-head,
          html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-row {
            grid-template-columns: 1fr !important;
          }

          html body .course-search-box--stable .course-search-counter,
          html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-counter {
            justify-self: start !important;
          }
        }
      `}</style>

      <div className="course-search-head">
        <div className="course-search-title">
          <strong>بحث سريع داخل 180 يومًا</strong>
          <span>
            ابحث عن مفهوم أو أداة أو موضوع، ثم انتقل مباشرة إلى اليوم المرتبط إذا كان مفتوحًا في رحلتك.
          </span>
        </div>

        <span className="course-search-counter">
          {hasQuery ? `${results.length} نتيجة` : "جاهز للبحث"}
        </span>
      </div>

      <div className="course-search-row">
        <input
          className="course-search-input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setExpanded(true);
          }}
          onFocus={() => setExpanded(true)}
          placeholder={placeholder}
          type="search"
          aria-label="ابحث داخل محتوى الرحلة"
        />

        <button
          type="button"
          className="course-search-clear"
          onClick={() => {
            setQuery("");
            setExpanded(false);
          }}
        >
          مسح
        </button>
      </div>

      <div className="course-search-suggestions" aria-label="اقتراحات بحث">
        {COURSE_SEARCH_SUGGESTIONS.map((suggestion) => (
          <button
            type="button"
            key={suggestion}
            onClick={() => chooseSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {expanded && hasQuery && results.length > 0 && (
        <div className="course-search-results">
          {results.map((result) => (
            <button
              type="button"
              key={`${result.monthIndex}-${result.weekIndex}-${result.dayIndex}`}
              className="course-search-result"
              onClick={() => jump(result)}
            >
              <span className="course-search-path">{result.path}</span>
              <strong>{result.dayTitle}</strong>
              {result.excerpt ? <p>{result.excerpt}</p> : null}
            </button>
          ))}
        </div>
      )}

      {expanded && hasQuery && results.length === 0 && (
        <div className="course-search-empty">
          لم أجد نتيجة واضحة. جرّب كلمة أقصر مثل: ثقافة، صلاحيات، RACI، قياس، تغيير.
        </div>
      )}
    </section>
  );
}
