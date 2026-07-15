import { useEffect, useMemo, useState } from "react";

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "active", label: "المتاح" },
  { id: "completed", label: "المكتمل" },
  { id: "saved", label: "المحفوظ" },
  { id: "locked", label: "المقفل" }
];

const STATE_LABELS = {
  completed: "مكتمل",
  active: "متاح الآن",
  locked: "يفتح لاحقًا"
};

const STATE_ICONS = {
  completed: "✓",
  active: "•",
  locked: "🔒"
};

const ARABIC_ORDINAL = {
  1: "الأول",
  2: "الثاني",
  3: "الثالث",
  4: "الرابع",
  5: "الخامس",
  6: "السادس",
  7: "السابع"
};

// اسم الملف على الخادم ASCII حتى لا تفشل الروابط العربية في بعض عارضات الجوال؛
// اسم التنزيل الظاهر للمستخدم يبقى عربيًا عبر خاصية download أدناه.
const JOURNEY_INDEX_PDF_URL = "/journey-index.pdf";
const JOURNEY_INDEX_PDF_NAME = "فهرس منسقة - النسخة المطبوعة.pdf";

function progressKey(monthIndex, weekIndex, dayIndex) {
  return `${Number(monthIndex)}-${Number(weekIndex)}-${Number(dayIndex)}`;
}

function getWeeks(month) {
  return Array.isArray(month?.weeks) ? month.weeks : [];
}

function getDays(week) {
  return Array.isArray(week?.days) ? week.days : [];
}

function isSamePoint(day, selectedPoint) {
  return (
    Number(day?.monthIndex) === Number(selectedPoint?.monthIndex) &&
    Number(day?.weekIndex) === Number(selectedPoint?.weekIndex) &&
    Number(day?.dayIndex) === Number(selectedPoint?.dayIndex)
  );
}

function isSavedDay(day, savedSet) {
  return savedSet.has(progressKey(day?.monthIndex, day?.weekIndex, day?.dayIndex));
}

function matchesFilter(day, state, filter, savedSet) {
  if (filter === "all") return true;
  if (filter === "saved") return isSavedDay(day, savedSet);
  return state === filter;
}

function getDayLabel(day) {
  return day?.label || `اليوم ${ARABIC_ORDINAL[day?.dayIndex] || day?.dayIndex || ""}`.trim();
}

function makeWeekKey(month, week) {
  return `m${month?.monthIndex}-w${week?.weekIndex}`;
}

function normalizeSummaryText(value) {
  return String(value || "")
    .replace(/\r/g, "\n")
    .replace(/اختبار\s+اليوم[\s\S]*$/g, "")
    .replace(/مفتاح\s+إجابات[\s\S]*$/g, "")
    .replace(/ملحق\s+غير\s+مخصص[\s\S]*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SUMMARY_HEADINGS = [
  "الفكرة المركزية",
  "الفكرة الأساسية",
  "المقصود",
  "ما المقصود",
  "لماذا هذا مهم",
  "قاعدة اليوم",
  "تطبيق اليوم",
  "أداة اليوم",
  "مثال تطبيقي",
  "القراءة المهنية",
  "الحصيلة المعرفية",
  "المهمة النهائية",
  "مؤشرات النجاح",
  "خطة التنفيذ",
  "خطة القياس",
  "خطة الاستدامة",
  "مخاطر التطبيق",
  "أخطاء شائعة",
  "مكونات الخطة"
];

const SUMMARY_TEMPLATES = [
  ({ topic, detail }) => `يفكك الدرس ${topic} بطريقة عملية، ويقرّب لك ${detail}`,
  ({ topic, detail }) => `تتعرّف هنا على ${topic} من زاوية تطبيقية تساعدك على تحويل الفكرة إلى ممارسة. ${detail}`,
  ({ topic, detail }) => `هذه المحطة توضّح كيف تتعامل مهنيًا مع ${topic}، بدل الاكتفاء بفهمه كنظرية. ${detail}`,
  ({ topic, detail }) => `يربط الدرس ${topic} بسياق العمل الحقيقي داخل المنظمة، مع إبراز ${detail}`,
  ({ topic, detail }) => `تنتقل في هذا اليوم من العنوان العام إلى قراءة أعمق لـ ${topic}. ${detail}`,
  ({ topic, detail }) => `يساعدك الدرس على بناء حكم مهني حول ${topic}، خصوصًا عندما تختلط الأعراض بالأسباب. ${detail}`,
  ({ topic, detail }) => `محطة قصيرة لفهم ${topic} كما يظهر في القرارات والسلوك والأنظمة، لا كما يرد في المصطلحات فقط. ${detail}`,
  ({ topic, detail }) => `يضع هذا الدرس ${topic} تحت عدسة التشخيص والتطبيق، مع تنبيهك إلى ${detail}`
];

function stripSummaryHeadings(text) {
  let clean = normalizeSummaryText(text);

  SUMMARY_HEADINGS.forEach((heading) => {
    const pattern = new RegExp(`(^|[.؟!؛،]\\s*)${heading}\\s*[:：-]?\\s*`, "gi");
    clean = clean.replace(pattern, "$1");
  });

  return clean
    .replace(/^(كثير\s+من|ليس\s+كل|لا\s+يكفي|اختيار|التدخلات|المنظمات)\s+/g, (match) => match)
    .replace(/^[:：\-–—]\s*/g, "")
    .trim();
}

function removeRepeatedHeadings(text, day) {
  const title = normalizeSummaryText(day?.title);
  const label = normalizeSummaryText(day?.label);

  return stripSummaryHeadings(text)
    .replace(title, "")
    .replace(label, "")
    .replace(/^الشهر\s+[^:：]+[:：]?\s*/g, "")
    .replace(/^الأسبوع\s+[^:：]+[:：]?\s*/g, "")
    .replace(/^اليوم\s+[^:：]+[:：]?\s*/g, "")
    .replace(/^\d+\.\s*/g, "")
    .trim();
}

function truncateSummary(text, maxLength = 145) {
  const clean = normalizeSummaryText(text);
  if (!clean) return "";
  if (clean.length <= maxLength) return clean;

  const sliced = clean.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 35 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
}

function getLessonTopic(day) {
  const title = normalizeSummaryText(day?.title || getDayLabel(day));
  const parts = title.split(/[:：؟?]/).map((part) => part.trim()).filter(Boolean);

  if (parts.length > 1 && parts[0].length <= 70) return parts[0];
  return truncateSummary(title, 82);
}

function getLessonDetail(day) {
  const explicitSummary = day?.summary || day?.excerpt || day?.description || day?.intro;
  const content = removeRepeatedHeadings(explicitSummary || day?.content, day);

  if (!content) return "";

  const title = normalizeSummaryText(day?.title);
  const sentences = content
    .split(/(?<=[.؟!])\s+|\n+/)
    .map((item) => removeRepeatedHeadings(item, day))
    .map((item) => item.replace(title, "").trim())
    .filter((item) => item.length >= 24)
    .filter((item) => !SUMMARY_HEADINGS.some((heading) => item === heading || item.startsWith(`${heading} `)));

  return truncateSummary(sentences[0] || content, 110);
}

function getTemplateIndex(day) {
  const month = Number(day?.monthIndex) || 0;
  const week = Number(day?.weekIndex) || 0;
  const dayNumber = Number(day?.dayIndex) || 0;
  return Math.abs((month * 11) + (week * 5) + dayNumber) % SUMMARY_TEMPLATES.length;
}

function getLessonSummary(day) {
  const topic = getLessonTopic(day);
  const detail = getLessonDetail(day);
  const fallbackDetail = "ما الذي يجب ملاحظته، وما الخطأ الشائع، وكيف تستخدم المفهوم في موقف تنظيمي واقعي.";

  return truncateSummary(
    SUMMARY_TEMPLATES[getTemplateIndex(day)]({
      topic,
      detail: detail || fallbackDetail
    }),
    178
  );
}

export default function CourseJourneyIndex({
  course = [],
  selectedPoint = {},
  lessonBookmarks = [],
  getMonthStatus = () => "locked",
  getWeekStatus = () => "locked",
  getDayStatus = () => "locked",
  onSelectDay = () => {}
}) {
  const [openMonthIndex, setOpenMonthIndex] = useState(Number(selectedPoint?.monthIndex) || 1);
  const [openWeeks, setOpenWeeks] = useState(() => ({
    [`m${Number(selectedPoint?.monthIndex) || 1}-w${Number(selectedPoint?.weekIndex) || 1}`]: true
  }));
  const [filter, setFilter] = useState("all");
  const [hint, setHint] = useState("");

  useEffect(() => {
    const nextMonthIndex = Number(selectedPoint?.monthIndex) || 1;
    const nextWeekIndex = Number(selectedPoint?.weekIndex) || 1;

    setOpenMonthIndex(nextMonthIndex);
    setOpenWeeks((current) => ({
      ...current,
      [`m${nextMonthIndex}-w${nextWeekIndex}`]: true
    }));
  }, [selectedPoint?.monthIndex, selectedPoint?.weekIndex]);

  const savedSet = useMemo(() => {
    return new Set(
      lessonBookmarks.map((bookmark) => progressKey(
        bookmark?.month_index ?? bookmark?.monthIndex,
        bookmark?.week_index ?? bookmark?.weekIndex,
        bookmark?.day_index ?? bookmark?.dayIndex
      ))
    );
  }, [lessonBookmarks]);

  const journeyStats = useMemo(() => {
    let lockedLessons = 0;
    let nextLesson = null;

    course.forEach((month) => {
      getWeeks(month).forEach((week) => {
        getDays(week).forEach((day) => {
          const state = getDayStatus(day, week, month);
          if (state === "locked") lockedLessons += 1;
          if (!nextLesson && state === "active") {
            nextLesson = { month, week, day };
          }
        });
      });
    });

    return { lockedLessons, nextLesson };
  }, [course, getDayStatus]);

  const selectedMonth = course.find((month) => Number(month.monthIndex) === Number(selectedPoint?.monthIndex));
  const selectedWeek = getWeeks(selectedMonth).find((week) => Number(week.weekIndex) === Number(selectedPoint?.weekIndex));
  const selectedDay = getDays(selectedWeek).find((day) => Number(day.dayIndex) === Number(selectedPoint?.dayIndex));

  const filteredCount = useMemo(() => {
    let count = 0;

    course.forEach((month) => {
      getWeeks(month).forEach((week) => {
        getDays(week).forEach((day) => {
          const state = getDayStatus(day, week, month);
          if (matchesFilter(day, state, filter, savedSet)) count += 1;
        });
      });
    });

    return count;
  }, [course, filter, getDayStatus, savedSet]);

  function toggleMonth(monthIndex) {
    setOpenMonthIndex((current) => Number(current) === Number(monthIndex) ? null : Number(monthIndex));
    setHint("");
  }

  function toggleWeek(month, week) {
    const key = makeWeekKey(month, week);
    setOpenWeeks((current) => ({
      ...current,
      [key]: !current[key]
    }));
    setHint("");
  }

  function handleDayClick(month, week, day) {
    const state = getDayStatus(day, week, month);

    if (state === "locked") {
      setHint("هذا الدرس سيفتح بعد إكمال المحطات السابقة.");
      window.setTimeout(() => setHint(""), 3200);
      return;
    }

    setHint("");
    onSelectDay({ month, week, day });
  }

  function renderDay(month, week, day) {
    const state = getDayStatus(day, week, month);
    const saved = isSavedDay(day, savedSet);
    const current = isSamePoint(day, selectedPoint);

    if (!matchesFilter(day, state, filter, savedSet)) return null;

    return (
      <button
        key={day.id || progressKey(day.monthIndex, day.weekIndex, day.dayIndex)}
        type="button"
        className={`jli-day jli-day--${state}${current ? " jli-day--current" : ""}`}
        onClick={() => handleDayClick(month, week, day)}
        aria-label={`${getDayLabel(day)} - ${day?.title || "درس"} - ${STATE_LABELS[state] || state}`}
      >
        <span className="jli-day-icon" aria-hidden="true">
          {STATE_ICONS[state] || "•"}
        </span>

        <span className="jli-day-body">
          <span className="jli-day-meta">
            <span>{getDayLabel(day)}</span>
            {current && <i>محطتك الحالية</i>}
          </span>

          <strong>{day?.title || getDayLabel(day)}</strong>
          <span className="jli-day-summary">{getLessonSummary(day)}</span>

          <span className="jli-badges">
            <em className={`jli-badge jli-badge--${state}`}>{STATE_LABELS[state] || state}</em>
            {saved && <em className="jli-badge jli-badge--saved">محفوظ</em>}
          </span>
        </span>
      </button>
    );
  }

  return (
    <section className="journey-index" aria-label="فهرس الرحلة التعليمية">
      <style>{`
        .journey-index {
          direction:rtl;
          position:relative;
          isolation:isolate;
          overflow:hidden;
          margin:18px 0;
          border-radius:34px;
          padding:24px;
          background:
            radial-gradient(circle at 98% 0%, rgba(139, 92, 246,.16), transparent 30%),
            radial-gradient(circle at 0% 100%, rgba(16, 185, 129,.10), transparent 28%),
            linear-gradient(135deg, rgba(255,255,255,.92), rgba(250,248,255,.82));
          border:1px solid rgba(167, 139, 250,.24);
          box-shadow:0 20px 56px rgba(28, 17, 48,.08);
          backdrop-filter:blur(18px);
        }

        .journey-index::before {
          content:"";
          position:absolute;
          inset:18px 24px auto auto;
          width:170px;
          height:170px;
          border-radius:50%;
          background:
            linear-gradient(135deg, rgba(139,92,246,.18), transparent 58%),
            repeating-conic-gradient(from 10deg, rgba(139,92,246,.12) 0deg 12deg, transparent 12deg 28deg);
          opacity:.65;
          filter:blur(.2px);
          pointer-events:none;
          z-index:-1;
        }

        .journey-index::after {
          content:"";
          position:absolute;
          inset:auto auto -70px -50px;
          width:230px;
          height:230px;
          border-radius:50%;
          background:radial-gradient(circle, rgba(16,185,129,.14), transparent 66%);
          pointer-events:none;
          z-index:-1;
        }

        .jli-head {
          display:grid;
          grid-template-columns:minmax(0, 1fr) minmax(220px, 330px);
          gap:16px;
          align-items:start;
          margin-bottom:16px;
        }

        .jli-kicker {
          display:inline-flex;
          width:fit-content;
          margin-bottom:8px;
          padding:7px 12px;
          border-radius:999px;
          color:#6d28d9;
          background:rgba(239,233,251,.90);
          border:1px solid rgba(139,92,246,.18);
          font-size:11px;
          font-weight:950;
          box-shadow:0 8px 18px rgba(139,92,246,.08);
        }

        .jli-title {
          margin:0;
          color:var(--ink, #18102e);
          font-size:clamp(21px,2.4vw,31px);
          line-height:1.35;
          font-weight:950;
        }

        .jli-subtitle {
          margin:8px 0 0;
          max-width:760px;
          color:var(--muted, #7a6c9a);
          font-size:13px;
          line-height:1.9;
          font-weight:800;
        }

        .jli-current {
          position:relative;
          display:grid;
          gap:5px;
          min-width:0;
          border-radius:26px;
          padding:16px 18px 16px 58px;
          background:
            radial-gradient(circle at 15% 20%, rgba(255,255,255,.18), transparent 24%),
            linear-gradient(135deg, #24183f, #161024);
          color:#f8f4ff;
          box-shadow:0 18px 40px rgba(28, 17, 48,.20);
          overflow:hidden;
        }

        .jli-current::before {
          content:"";
          position:absolute;
          left:18px;
          top:50%;
          width:24px;
          height:24px;
          border-radius:50%;
          transform:translateY(-50%);
          background:#d9ccff;
          box-shadow:
            0 0 0 8px rgba(216,204,255,.12),
            0 0 0 16px rgba(216,204,255,.08);
        }

        .jli-current span {
          color:#d8ccff;
          font-size:11px;
          font-weight:950;
        }

        .jli-current strong {
          color:#ffffff;
          font-size:13px;
          line-height:1.8;
          font-weight:950;
        }

        .jli-current small {
          color:rgba(255,255,255,.76);
          font-size:11px;
          line-height:1.7;
          font-weight:800;
        }

        .jli-next {
          position:relative;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin:0 0 14px;
          border-radius:24px;
          padding:14px 16px;
          color:#3b2764;
          background:
            linear-gradient(90deg, rgba(139,92,246,.12), transparent 42%),
            linear-gradient(135deg,rgba(196,181,253,.34),rgba(255,255,255,.78));
          border:1px solid rgba(139,92,246,.18);
          font-size:12px;
          font-weight:900;
        }

        .jli-next::before {
          content:"";
          width:10px;
          height:10px;
          border-radius:50%;
          flex:0 0 auto;
          background:#7c3aed;
          box-shadow:0 0 0 6px rgba(124,58,237,.10);
        }

        .jli-next strong {
          color:#4c1d95;
          font-weight:950;
        }

        .jli-download {
          display:flex;
          align-items:center;
          flex-wrap:wrap;
          gap:12px;
          margin:0 0 14px;
          border-radius:24px;
          padding:14px 16px;
          background:
            linear-gradient(90deg, rgba(139,92,246,.10), transparent 46%),
            linear-gradient(135deg, rgba(196,181,253,.26), rgba(255,255,255,.82));
          border:1px solid rgba(139,92,246,.18);
        }

        .jli-download-icon {
          flex:0 0 auto;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:46px;
          height:46px;
          border-radius:15px;
          color:#ffffff;
          background:linear-gradient(145deg, #8b5cf6, #6d28d9);
          border:1px solid rgba(255,255,255,.22);
          box-shadow:0 10px 22px rgba(124,58,237,.22);
        }

        .jli-download-icon svg {
          width:24px;
          height:24px;
        }

        .jli-download-copy {
          flex:1 1 220px;
          display:grid;
          gap:3px;
          min-width:0;
        }

        .jli-download-copy strong {
          color:#4c1d95;
          font-size:13px;
          line-height:1.7;
          font-weight:950;
        }

        .jli-download-copy span {
          color:#574874;
          font-size:11.5px;
          line-height:1.8;
          font-weight:700;
        }

        /* منطاق تحت .journey-index لتجاوز أي قاعدة روابط عامة في الثيم
           (وإلا ظهر نص الزر بلون الروابط البنفسجي على خلفية بنفسجية). */
        .journey-index a.jli-download-link {
          flex:0 0 auto;
          margin-inline-start:auto;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:7px;
          min-height:40px;
          padding:9px 20px;
          border-radius:999px;
          color:#ffffff;
          background:#7c3aed;
          border:1px solid rgba(124,58,237,.30);
          box-shadow:0 12px 24px rgba(124,58,237,.24);
          font-size:12px;
          font-weight:800;
          text-decoration:none;
          transition:background var(--motion-fast, 150ms) var(--motion-ease, ease), transform var(--motion-fast, 150ms) var(--motion-ease, ease);
        }

        .journey-index a.jli-download-link svg {
          width:16px;
          height:16px;
        }

        .journey-index a.jli-download-link:hover {
          background:#6d28d9;
          color:#ffffff;
          transform:translateY(-1px);
        }

        .jli-filters {
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          gap:8px;
          margin:0 0 14px;
        }

        .jli-filter {
          font-family:inherit;
          cursor:pointer;
          border-radius:999px;
          border:1px solid rgba(167,139,250,.24);
          padding:8px 12px;
          background:rgba(255,255,255,.86);
          color:#5f527c;
          font-size:11px;
          font-weight:950;
          transition:.2s ease;
        }

        .jli-filter:hover,
        .jli-filter--active {
          transform:translateY(-1px);
          color:#4c1d95;
          background:#efe9fb;
          border-color:rgba(139,92,246,.28);
          box-shadow:0 10px 22px rgba(139,92,246,.10);
        }

        .jli-filter-count {
          margin-inline-start:auto;
          color:#8a7aa8;
          font-size:11px;
          font-weight:900;
        }

        .jli-hint {
          margin:0 0 12px;
          border-radius:18px;
          padding:11px 13px;
          color:#5b21b6;
          background:#f5f0ff;
          border:1px solid rgba(139,92,246,.20);
          font-size:12px;
          font-weight:900;
        }

        .jli-months {
          display:grid;
          gap:12px;
        }

        .jli-month {
          border-radius:28px;
          overflow:hidden;
          background:rgba(255,255,255,.72);
          border:1px solid rgba(167,139,250,.20);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.65);
        }

        .jli-month-toggle,
        .jli-week-toggle {
          width:100%;
          border:0;
          cursor:pointer;
          font-family:inherit;
          text-align:right;
          display:grid;
          grid-template-columns:auto minmax(0,1fr) auto;
          gap:12px;
          align-items:center;
          background:transparent;
          transition:.2s ease;
        }

        .jli-month-toggle {
          padding:16px;
        }

        .jli-month-toggle:hover,
        .jli-week-toggle:hover {
          background:rgba(239,233,251,.50);
        }

        .jli-number {
          position:relative;
          display:grid;
          place-items:center;
          width:42px;
          height:42px;
          border-radius:17px;
          color:#4c1d95;
          background:
            radial-gradient(circle at 30% 25%, #ffffff 0%, #efe9fb 52%, #d8ccff 100%);
          border:1px solid rgba(139,92,246,.18);
          font-size:13px;
          font-weight:950;
          box-shadow:0 10px 26px rgba(139,92,246,.12);
        }

        .jli-number::after {
          content:"";
          position:absolute;
          inset:-5px;
          border-radius:21px;
          border:1px solid rgba(139,92,246,.10);
        }

        .jli-month-title,
        .jli-week-title {
          display:grid;
          gap:4px;
          min-width:0;
        }

        .jli-month-title strong,
        .jli-week-title strong {
          color:var(--ink, #18102e);
          font-size:14px;
          line-height:1.6;
          font-weight:950;
        }

        .jli-month-title small,
        .jli-week-title small {
          color:var(--muted, #7a6c9a);
          font-size:11px;
          line-height:1.7;
          font-weight:800;
        }

        .jli-month-meta,
        .jli-week-meta {
          display:flex;
          gap:7px;
          align-items:center;
          justify-content:flex-end;
          flex-wrap:wrap;
        }

        .jli-chevron {
          display:inline-grid;
          place-items:center;
          width:24px;
          height:24px;
          border-radius:999px;
          color:#6d28d9;
          background:rgba(239,233,251,.78);
          font-size:14px;
          font-style:normal;
          font-weight:950;
          transition:.2s ease;
        }

        .jli-chevron--open {
          transform:rotate(180deg);
        }

        .jli-weeks {
          display:grid;
          gap:10px;
          padding:0 14px 14px;
        }

        .jli-week {
          border-radius:22px;
          overflow:hidden;
          background:rgba(255,255,255,.70);
          border:1px solid rgba(167,139,250,.16);
        }

        .jli-week-toggle {
          padding:13px;
        }

        .jli-week .jli-number {
          width:34px;
          height:34px;
          border-radius:14px;
          font-size:12px;
        }

        .jli-days {
          position:relative;
          display:grid;
          gap:9px;
          padding:4px 18px 14px 12px;
        }

        .jli-days::before {
          content:"";
          position:absolute;
          top:6px;
          bottom:16px;
          right:32px;
          width:2px;
          border-radius:999px;
          background:linear-gradient(180deg, rgba(124,58,237,.32), rgba(16,185,129,.24), rgba(124,58,237,.10));
        }

        .jli-day {
          position:relative;
          width:100%;
          border:0;
          cursor:pointer;
          display:grid;
          grid-template-columns:auto minmax(0,1fr);
          gap:11px;
          align-items:start;
          text-align:right;
          font-family:inherit;
          border-radius:20px;
          padding:13px;
          background:
            linear-gradient(135deg, rgba(255,255,255,.96), rgba(250,248,255,.82));
          border:1px solid rgba(167,139,250,.16);
          box-shadow:0 12px 26px rgba(28,17,48,.05);
          transition:.22s ease;
          overflow:hidden;
        }

        .jli-day::after {
          content:"";
          position:absolute;
          inset:0 auto 0 0;
          width:4px;
          background:linear-gradient(180deg, rgba(139,92,246,.45), rgba(16,185,129,.28));
          opacity:.55;
        }

        .jli-day:hover {
          transform:translateY(-2px);
          box-shadow:0 18px 34px rgba(139,92,246,.12);
          border-color:rgba(139,92,246,.26);
        }

        .jli-day--locked {
          opacity:.78;
          cursor:not-allowed;
          background:rgba(248,246,252,.82);
        }

        .jli-day--current {
          border-color:rgba(139,92,246,.42);
          box-shadow:0 0 0 4px rgba(139,92,246,.08), 0 18px 36px rgba(139,92,246,.13);
        }

        .jli-day--current::after {
          opacity:1;
          width:5px;
        }

        .jli-day-icon {
          position:relative;
          z-index:1;
          display:grid;
          place-items:center;
          width:32px;
          height:32px;
          border-radius:13px;
          color:#4c1d95;
          background:#efe9fb;
          border:1px solid rgba(139,92,246,.14);
          font-size:12px;
          font-weight:950;
          box-shadow:0 0 0 5px rgba(255,255,255,.86);
        }

        .jli-day--completed .jli-day-icon {
          color:#065f46;
          background:#ecfdf5;
          border-color:rgba(16,185,129,.22);
        }

        .jli-day--locked .jli-day-icon {
          color:#6b6478;
          background:#f1eef7;
          border-color:rgba(107,100,120,.16);
        }

        .jli-day-body {
          display:grid;
          gap:6px;
          min-width:0;
        }

        .jli-day-meta {
          display:flex;
          flex-wrap:wrap;
          gap:6px;
          align-items:center;
          color:#8a7aa8;
          font-size:10px;
          font-weight:950;
          line-height:1.6;
        }

        .jli-day-meta i {
          font-style:normal;
          color:#6d28d9;
          background:#f5f0ff;
          border:1px solid rgba(139,92,246,.14);
          border-radius:999px;
          padding:2px 7px;
        }

        .jli-day strong {
          color:var(--ink, #18102e);
          font-size:12.5px;
          line-height:1.8;
          font-weight:950;
        }

        .jli-day-summary {
          color:var(--muted, #7a6c9a);
          font-size:11px;
          line-height:1.85;
          font-weight:800;
        }

        .jli-badges {
          display:flex;
          flex-wrap:wrap;
          gap:6px;
        }

        .jli-badge {
          display:inline-flex;
          width:fit-content;
          border-radius:999px;
          padding:4px 8px;
          font-style:normal;
          font-size:10px;
          line-height:1.4;
          font-weight:950;
          border:1px solid transparent;
        }

        .jli-badge--active {
          color:#4c1d95;
          background:#efe9fb;
          border-color:rgba(139,92,246,.16);
        }

        .jli-badge--completed {
          color:#065f46;
          background:#ecfdf5;
          border-color:rgba(16,185,129,.20);
        }

        .jli-badge--locked {
          color:#51485f;
          background:#f1eef7;
          border-color:rgba(107,100,120,.16);
        }

        .jli-badge--saved {
          color:#92400e;
          background:#fffbeb;
          border-color:rgba(245,158,11,.20);
        }

        .jli-empty {
          border-radius:18px;
          padding:14px;
          text-align:center;
          color:#8a7aa8;
          background:rgba(255,255,255,.70);
          border:1px dashed rgba(167,139,250,.28);
          font-size:12px;
          font-weight:900;
        }

        html[data-theme="dark"] .journey-index,
        body.od-theme-dark .journey-index,
        .od-theme-dark .journey-index,
        .dark .journey-index {
          background:
            radial-gradient(circle at 98% 0%, rgba(139, 92, 246,.18), transparent 32%),
            radial-gradient(circle at 0% 100%, rgba(16, 185, 129,.11), transparent 30%),
            linear-gradient(135deg, rgba(28,20,50,.92), rgba(19,13,34,.88));
          border-color:rgba(196,181,253,.18);
          box-shadow:0 24px 58px rgba(0,0,0,.22);
        }

        html[data-theme="dark"] .journey-index .jli-month,
        html[data-theme="dark"] .journey-index .jli-week,
        html[data-theme="dark"] .journey-index .jli-day,
        body.od-theme-dark .journey-index .jli-month,
        body.od-theme-dark .journey-index .jli-week,
        body.od-theme-dark .journey-index .jli-day,
        .od-theme-dark .journey-index .jli-month,
        .od-theme-dark .journey-index .jli-week,
        .od-theme-dark .journey-index .jli-day,
        .dark .journey-index .jli-month,
        .dark .journey-index .jli-week,
        .dark .journey-index .jli-day {
          background:rgba(255,255,255,.065);
          border-color:rgba(196,181,253,.16);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
        }

        html[data-theme="dark"] .journey-index .jli-month-toggle:hover,
        html[data-theme="dark"] .journey-index .jli-week-toggle:hover,
        body.od-theme-dark .journey-index .jli-month-toggle:hover,
        body.od-theme-dark .journey-index .jli-week-toggle:hover,
        .od-theme-dark .journey-index .jli-month-toggle:hover,
        .od-theme-dark .journey-index .jli-week-toggle:hover,
        .dark .journey-index .jli-month-toggle:hover,
        .dark .journey-index .jli-week-toggle:hover {
          background:rgba(255,255,255,.055);
        }

        html[data-theme="dark"] .journey-index .jli-next,
        body.od-theme-dark .journey-index .jli-next,
        .od-theme-dark .journey-index .jli-next,
        .dark .journey-index .jli-next {
          color:#f5f3ff;
          background:linear-gradient(135deg,rgba(139,92,246,.22),rgba(255,255,255,.06));
          border-color:rgba(196,181,253,.20);
        }

        html[data-theme="dark"] .journey-index .jli-next strong,
        body.od-theme-dark .journey-index .jli-next strong,
        .od-theme-dark .journey-index .jli-next strong,
        .dark .journey-index .jli-next strong {
          color:#ffffff;
        }

        html[data-theme="dark"] .journey-index .jli-download,
        body.od-theme-dark .journey-index .jli-download,
        .od-theme-dark .journey-index .jli-download,
        .dark .journey-index .jli-download {
          background:linear-gradient(135deg, rgba(255,255,255,.07), rgba(139,92,246,.14));
          border-color:rgba(196,181,253,.18);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
        }

        html[data-theme="dark"] .journey-index .jli-download-copy strong,
        body.od-theme-dark .journey-index .jli-download-copy strong,
        .od-theme-dark .journey-index .jli-download-copy strong,
        .dark .journey-index .jli-download-copy strong {
          color:#ffffff;
        }

        html[data-theme="dark"] .journey-index .jli-download-copy span,
        body.od-theme-dark .journey-index .jli-download-copy span,
        .od-theme-dark .journey-index .jli-download-copy span,
        .dark .journey-index .jli-download-copy span {
          color:#cfc4ff;
        }

        html[data-theme="dark"] .journey-index a.jli-download-link,
        body.od-theme-dark .journey-index a.jli-download-link,
        .od-theme-dark .journey-index a.jli-download-link,
        .dark .journey-index a.jli-download-link {
          color:#ffffff;
          background:linear-gradient(145deg, #8b5cf6, #6d28d9);
          border-color:rgba(196,181,253,.28);
        }

        html[data-theme="dark"] .journey-index .jli-filter,
        body.od-theme-dark .journey-index .jli-filter,
        .od-theme-dark .journey-index .jli-filter,
        .dark .journey-index .jli-filter {
          background:rgba(255,255,255,.08);
          color:#ddd6fe;
          border-color:rgba(196,181,253,.18);
        }

        html[data-theme="dark"] .journey-index .jli-filter--active,
        html[data-theme="dark"] .journey-index .jli-filter:hover,
        body.od-theme-dark .journey-index .jli-filter--active,
        body.od-theme-dark .journey-index .jli-filter:hover,
        .od-theme-dark .journey-index .jli-filter--active,
        .od-theme-dark .journey-index .jli-filter:hover,
        .dark .journey-index .jli-filter--active,
        .dark .journey-index .jli-filter:hover {
          background:rgba(139,92,246,.24);
          color:#ffffff;
        }

        html[data-theme="dark"] .journey-index .jli-title,
        html[data-theme="dark"] .journey-index .jli-month-title strong,
        html[data-theme="dark"] .journey-index .jli-week-title strong,
        html[data-theme="dark"] .journey-index .jli-day strong,
        body.od-theme-dark .journey-index .jli-title,
        body.od-theme-dark .journey-index .jli-month-title strong,
        body.od-theme-dark .journey-index .jli-week-title strong,
        body.od-theme-dark .journey-index .jli-day strong,
        .od-theme-dark .journey-index .jli-title,
        .od-theme-dark .journey-index .jli-month-title strong,
        .od-theme-dark .journey-index .jli-week-title strong,
        .od-theme-dark .journey-index .jli-day strong,
        .dark .journey-index .jli-title,
        .dark .journey-index .jli-month-title strong,
        .dark .journey-index .jli-week-title strong,
        .dark .journey-index .jli-day strong {
          color:#f8f4ff;
        }

        html[data-theme="dark"] .journey-index .jli-subtitle,
        html[data-theme="dark"] .journey-index .jli-month-title small,
        html[data-theme="dark"] .journey-index .jli-week-title small,
        html[data-theme="dark"] .journey-index .jli-filter-count,
        html[data-theme="dark"] .journey-index .jli-day-meta,
        html[data-theme="dark"] .journey-index .jli-day-summary,
        body.od-theme-dark .journey-index .jli-subtitle,
        body.od-theme-dark .journey-index .jli-month-title small,
        body.od-theme-dark .journey-index .jli-week-title small,
        body.od-theme-dark .journey-index .jli-filter-count,
        body.od-theme-dark .journey-index .jli-day-meta,
        body.od-theme-dark .journey-index .jli-day-summary,
        .od-theme-dark .journey-index .jli-subtitle,
        .od-theme-dark .journey-index .jli-month-title small,
        .od-theme-dark .journey-index .jli-week-title small,
        .od-theme-dark .journey-index .jli-filter-count,
        .od-theme-dark .journey-index .jli-day-meta,
        .od-theme-dark .journey-index .jli-day-summary,
        .dark .journey-index .jli-subtitle,
        .dark .journey-index .jli-month-title small,
        .dark .journey-index .jli-week-title small,
        .dark .journey-index .jli-filter-count,
        .dark .journey-index .jli-day-meta,
        .dark .journey-index .jli-day-summary {
          color:#cfc4ff;
        }

        html[data-theme="dark"] .journey-index .jli-number,
        body.od-theme-dark .journey-index .jli-number,
        .od-theme-dark .journey-index .jli-number,
        .dark .journey-index .jli-number {
          color:#ffffff;
          background:linear-gradient(135deg, rgba(196,181,253,.28), rgba(139,92,246,.16));
          border-color:rgba(216,204,255,.32);
          box-shadow:0 10px 24px rgba(0,0,0,.16);
        }

        html[data-theme="dark"] .journey-index .jli-chevron,
        body.od-theme-dark .journey-index .jli-chevron,
        .od-theme-dark .journey-index .jli-chevron,
        .dark .journey-index .jli-chevron {
          color:#ffffff;
          background:rgba(196,181,253,.18);
          border:1px solid rgba(196,181,253,.20);
        }

        html[data-theme="dark"] .journey-index .jli-day-icon,
        body.od-theme-dark .journey-index .jli-day-icon,
        .od-theme-dark .journey-index .jli-day-icon,
        .dark .journey-index .jli-day-icon {
          color:#ffffff;
          background:rgba(196,181,253,.16);
          border-color:rgba(196,181,253,.22);
          box-shadow:0 0 0 5px rgba(19,13,34,.84);
        }

        html[data-theme="dark"] .journey-index .jli-day--completed .jli-day-icon,
        body.od-theme-dark .journey-index .jli-day--completed .jli-day-icon,
        .od-theme-dark .journey-index .jli-day--completed .jli-day-icon,
        .dark .journey-index .jli-day--completed .jli-day-icon {
          color:#d1fae5;
          background:rgba(16,185,129,.16);
          border-color:rgba(16,185,129,.24);
        }

        html[data-theme="dark"] .journey-index .jli-day--locked .jli-day-icon,
        body.od-theme-dark .journey-index .jli-day--locked .jli-day-icon,
        .od-theme-dark .journey-index .jli-day--locked .jli-day-icon,
        .dark .journey-index .jli-day--locked .jli-day-icon {
          color:#f5f3ff;
          background:rgba(255,255,255,.10);
          border-color:rgba(196,181,253,.18);
        }

        html[data-theme="dark"] .journey-index .jli-badge--active,
        body.od-theme-dark .journey-index .jli-badge--active,
        .od-theme-dark .journey-index .jli-badge--active,
        .dark .journey-index .jli-badge--active {
          color:#ffffff;
          background:rgba(139,92,246,.24);
          border-color:rgba(196,181,253,.20);
        }

        html[data-theme="dark"] .journey-index .jli-badge--completed,
        body.od-theme-dark .journey-index .jli-badge--completed,
        .od-theme-dark .journey-index .jli-badge--completed,
        .dark .journey-index .jli-badge--completed {
          color:#d1fae5;
          background:rgba(16,185,129,.16);
          border-color:rgba(16,185,129,.24);
        }

        html[data-theme="dark"] .journey-index .jli-badge--locked,
        body.od-theme-dark .journey-index .jli-badge--locked,
        .od-theme-dark .journey-index .jli-badge--locked,
        .dark .journey-index .jli-badge--locked {
          color:#f5f3ff;
          background:rgba(255,255,255,.11);
          border-color:rgba(196,181,253,.18);
        }

        html[data-theme="dark"] .journey-index .jli-badge--saved,
        body.od-theme-dark .journey-index .jli-badge--saved,
        .od-theme-dark .journey-index .jli-badge--saved,
        .dark .journey-index .jli-badge--saved {
          color:#fde68a;
          background:rgba(245,158,11,.16);
          border-color:rgba(245,158,11,.24);
        }


        html[data-theme="dark"] .journey-index .jli-download,
        body.od-theme-dark .journey-index .jli-download,
        .od-theme-dark .journey-index .jli-download,
        .dark .journey-index .jli-download {
          background:linear-gradient(135deg, rgba(255,255,255,.075), rgba(139,92,246,.13));
          border-color:rgba(196,181,253,.18);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
        }

        html[data-theme="dark"] .journey-index .jli-download-icon,
        body.od-theme-dark .journey-index .jli-download-icon,
        .od-theme-dark .journey-index .jli-download-icon,
        .dark .journey-index .jli-download-icon {
          color:#ffffff;
          background:rgba(196,181,253,.16);
          border-color:rgba(196,181,253,.24);
        }

        html[data-theme="dark"] .journey-index .jli-download-copy strong,
        body.od-theme-dark .journey-index .jli-download-copy strong,
        .od-theme-dark .journey-index .jli-download-copy strong,
        .dark .journey-index .jli-download-copy strong {
          color:#ffffff;
        }

        html[data-theme="dark"] .journey-index .jli-download-copy span,
        body.od-theme-dark .journey-index .jli-download-copy span,
        .od-theme-dark .journey-index .jli-download-copy span,
        .dark .journey-index .jli-download-copy span {
          color:#cfc4ff;
        }

        html[data-theme="dark"] .journey-index .jli-download-link,
        html[data-theme="dark"] .journey-index .jli-download-link:visited,
        body.od-theme-dark .journey-index .jli-download-link,
        body.od-theme-dark .journey-index .jli-download-link:visited,
        .od-theme-dark .journey-index .jli-download-link,
        .od-theme-dark .journey-index .jli-download-link:visited,
        .dark .journey-index .jli-download-link,
        .dark .journey-index .jli-download-link:visited {
          color:#ffffff !important;
          background:linear-gradient(135deg, rgba(139,92,246,.95), rgba(91,33,182,.95));
          border-color:rgba(196,181,253,.22);
          text-decoration:none !important;
        }

        @media (max-width:980px) {
          .jli-head {
            grid-template-columns:1fr;
          }
        }

        @media (max-width:640px) {
          .journey-index {
            border-radius:26px;
            padding:16px;
          }

          .jli-current {
            padding-inline-start:52px;
          }

          .jli-month-toggle,
          .jli-week-toggle {
            grid-template-columns:auto minmax(0,1fr);
          }

          .jli-month-meta,
          .jli-week-meta {
            grid-column:1 / -1;
            justify-content:flex-start;
          }

          .jli-filter-count {
            width:100%;
            margin-inline-start:0;
          }

          .jli-next {
            align-items:flex-start;
            flex-direction:column;
          }

          .jli-download {
            grid-template-columns:auto minmax(0,1fr);
            align-items:start;
          }

          .jli-download-link {
            grid-column:1 / -1;
            width:100%;
          }

          .jli-days {
            padding-inline-end:12px;
          }

          .jli-days::before {
            right:26px;
          }
        }
      `}</style>

      <div className="jli-head">
        <div>
          <span className="jli-kicker">خريطة الرحلة</span>
          <h2 className="jli-title">فهرس الرحلة التعليمية</h2>
          <p className="jli-subtitle">
            واصل من محطتك الحالية أو استعرض مسار الرحلة كاملًا كمحطات متتابعة دون كسر منطق التقدّم.
          </p>
        </div>

        <aside className="jli-current" aria-label="محطتك الحالية">
          <span>محطتك الحالية</span>
          <strong>
            {selectedMonth?.title || "الشهر الحالي"} · {selectedWeek?.title || "الأسبوع الحالي"} · {getDayLabel(selectedDay)}
          </strong>
          <small>{selectedDay?.title || "واصل من هنا"}</small>
        </aside>
      </div>
      <div className="jli-download" aria-label="تحميل النسخة المطبوعة من فهرس الرحلة التعليمية">
        <span className="jli-download-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2.6h8L19 7v12.8A1.6 1.6 0 0 1 17.4 21H6A1.6 1.6 0 0 1 4.4 19.4V4.2A1.6 1.6 0 0 1 6 2.6Z" />
            <path d="M13.6 2.6V7H19" />
            <path d="M11.5 11v6" />
            <path d="M8.8 14.4 11.5 17l2.7-2.6" />
          </svg>
        </span>

        <div className="jli-download-copy">
          <strong>الفهرس المطبوع</strong>
          <span>نسخة PDF أنيقة وجاهزة للتحميل والطباعة كمرجع سريع للرحلة.</span>
        </div>

        <a
          className="jli-download-link jli-download-button"
          href={JOURNEY_INDEX_PDF_URL}
          download={JOURNEY_INDEX_PDF_NAME}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4v10" />
            <path d="M8 11l4 4 4-4" />
            <path d="M5 19h14" />
          </svg>
          تحميل المطبوع
        </a>
      </div>

      <div className="jli-next">
        <span>
          القادم في رحلتك: <strong>{journeyStats.nextLesson?.day?.title || "لا يوجد درس متاح جديد حاليًا"}</strong>
        </span>
        <span>{journeyStats.lockedLessons} محطة تفتح تدريجيًا</span>
      </div>

      <div className="jli-filters" role="tablist" aria-label="تصفية فهرس الدروس">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`jli-filter${filter === item.id ? " jli-filter--active" : ""}`}
            onClick={() => {
              setFilter(item.id);
              setHint("");
            }}
            aria-pressed={filter === item.id}
          >
            {item.label}
          </button>
        ))}
        <span className="jli-filter-count">{filteredCount} درس مطابق</span>
      </div>

      {hint && <div className="jli-hint">{hint}</div>}

      <div className="jli-months">
        {course.map((month) => {
          const monthOpen = Number(openMonthIndex) === Number(month.monthIndex);
          const monthStatus = getMonthStatus(month);
          const monthDays = getWeeks(month).flatMap(getDays);
          const monthCompleted = monthDays.filter((day) => getDayStatus(day, getWeeks(month).find((week) => Number(week.weekIndex) === Number(day.weekIndex)), month) === "completed").length;

          return (
            <article key={month.id || month.monthIndex} className={`jli-month jli-month--${monthStatus}`}>
              <button
                type="button"
                className="jli-month-toggle"
                onClick={() => toggleMonth(month.monthIndex)}
                aria-expanded={monthOpen}
              >
                <span className="jli-number">{month.monthIndex}</span>
                <span className="jli-month-title">
                  <strong>{month.title}</strong>
                  <small>{month.subtitle}</small>
                </span>
                <span className="jli-month-meta">
                  <em className={`jli-badge jli-badge--${monthStatus}`}>{STATE_LABELS[monthStatus] || monthStatus}</em>
                  <em className="jli-badge jli-badge--active">{monthCompleted} / {monthDays.length} درس</em>
                  <i className={`jli-chevron${monthOpen ? " jli-chevron--open" : ""}`}>⌄</i>
                </span>
              </button>

              {monthOpen && (
                <div className="jli-weeks">
                  {getWeeks(month).map((week) => {
                    const weekKey = makeWeekKey(month, week);
                    const weekOpen = Boolean(openWeeks[weekKey]);
                    const weekStatus = getWeekStatus(week, month);
                    const weekDays = getDays(week);
                    const weekVisibleDays = weekDays.filter((day) => matchesFilter(day, getDayStatus(day, week, month), filter, savedSet));
                    const weekCompleted = weekDays.filter((day) => getDayStatus(day, week, month) === "completed").length;

                    return (
                      <section key={week.id || weekKey} className={`jli-week jli-week--${weekStatus}`}>
                        <button
                          type="button"
                          className="jli-week-toggle"
                          onClick={() => toggleWeek(month, week)}
                          aria-expanded={weekOpen}
                        >
                          <span className="jli-number">{week.weekIndex}</span>
                          <span className="jli-week-title">
                            <strong>{week.title}</strong>
                            <small>{week.subtitle}</small>
                          </span>
                          <span className="jli-week-meta">
                            <em className={`jli-badge jli-badge--${weekStatus}`}>{STATE_LABELS[weekStatus] || weekStatus}</em>
                            <em className="jli-badge jli-badge--active">{weekCompleted} / {weekDays.length}</em>
                            <i className={`jli-chevron${weekOpen ? " jli-chevron--open" : ""}`}>⌄</i>
                          </span>
                        </button>

                        {weekOpen && (
                          <div className="jli-days">
                            {weekVisibleDays.length ? (
                              weekDays.map((day) => renderDay(month, week, day))
                            ) : (
                              <div className="jli-empty">لا توجد دروس مطابقة لهذا الفلتر داخل هذا الأسبوع.</div>
                            )}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
