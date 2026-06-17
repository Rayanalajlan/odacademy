import { useMemo, useState } from "react";
import {
  COURSE_SEARCH_SUGGESTIONS,
  searchCourse
} from "../lib/courseSearchService";
import NeoMetricGauge from "./NeoMetricGauge";

export default function CourseSearch({
  course = [],
  onJump,
  placeholder = "Ø§Ø¨Ø­Ø« Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±Ø­Ù„Ø©..."
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
    <section className="course-search-box" aria-label="Ø§Ù„Ø¨Ø­Ø« Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±Ø­Ù„Ø© Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠØ©">
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
      `}</style>

      <div className="course-search-head">
        <div className="course-search-title">
          <strong>Ø¨Ø­Ø« Ø³Ø±ÙŠØ¹ Ø¯Ø§Ø®Ù„ 180 ÙŠÙˆÙ…Ù‹Ø§</strong>
          <span>
            Ø§Ø¨Ø­Ø« Ø¹Ù† Ù…ÙÙ‡ÙˆÙ… Ø£Ùˆ Ø£Ø¯Ø§Ø© Ø£Ùˆ Ù…ÙˆØ¶ÙˆØ¹ØŒ Ø«Ù… Ø§Ù†ØªÙ‚Ù„ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¥Ù„Ù‰ Ø§Ù„ÙŠÙˆÙ… Ø§Ù„Ù…Ø±ØªØ¨Ø· Ø¥Ø°Ø§ ÙƒØ§Ù† Ù…ÙØªÙˆØ­Ù‹Ø§ ÙÙŠ Ø±Ø­Ù„ØªÙƒ.
          </span>
        </div>

        <NeoMetricGauge
          className="course-search-gauge"
          value={hasQuery ? results.length : 0}
          max={Math.max(1, results.length)}
          progress={hasQuery ? 100 : 0}
          displayValue={hasQuery ? `${results.length} نتيجة` : "جاهز للبحث"}
          label="بحث سريع"
          status={hasQuery ? "readiness" : "locked"}
          size="compact"
        />
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
          aria-label="Ø§Ø¨Ø­Ø« Ø¯Ø§Ø®Ù„ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ø­Ù„Ø©"
        />

        <button
          type="button"
          className="course-search-clear"
          onClick={() => {
            setQuery("");
            setExpanded(false);
          }}
        >
          Ù…Ø³Ø­
        </button>
      </div>

      <div className="course-search-suggestions" aria-label="Ø§Ù‚ØªØ±Ø§Ø­Ø§Øª Ø¨Ø­Ø«">
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
          Ù„Ù… Ø£Ø¬Ø¯ Ù†ØªÙŠØ¬Ø© ÙˆØ§Ø¶Ø­Ø©. Ø¬Ø±Ù‘Ø¨ ÙƒÙ„Ù…Ø© Ø£Ù‚ØµØ± Ù…Ø«Ù„: Ø«Ù‚Ø§ÙØ©ØŒ ØµÙ„Ø§Ø­ÙŠØ§ØªØŒ RACIØŒ Ù‚ÙŠØ§Ø³ØŒ ØªØºÙŠÙŠØ±.
        </div>
      )}
    </section>
  );
}

