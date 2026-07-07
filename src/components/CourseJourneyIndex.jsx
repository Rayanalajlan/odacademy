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
    let totalLessons = 0;
    let completedLessons = 0;
    let availableLessons = 0;
    let lockedLessons = 0;
    let completedWeeks = 0;
    let totalWeeks = 0;
    let completedMonths = 0;
    let nextLesson = null;

    course.forEach((month) => {
      const monthStatus = getMonthStatus(month);
      if (monthStatus === "completed") completedMonths += 1;

      getWeeks(month).forEach((week) => {
        totalWeeks += 1;
        const weekStatus = getWeekStatus(week, month);
        if (weekStatus === "completed") completedWeeks += 1;

        getDays(week).forEach((day) => {
          const state = getDayStatus(day, week, month);
          totalLessons += 1;

          if (state === "completed") completedLessons += 1;
          if (state === "active") availableLessons += 1;
          if (state === "locked") lockedLessons += 1;
          if (!nextLesson && state === "active") {
            nextLesson = { month, week, day };
          }
        });
      });
    });

    return {
      totalLessons,
      completedLessons,
      availableLessons,
      lockedLessons,
      completedWeeks,
      totalWeeks,
      completedMonths,
      totalMonths: course.length,
      nextLesson
    };
  }, [course, getDayStatus, getMonthStatus, getWeekStatus]);

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
          margin:18px 0;
          border-radius:30px;
          padding:22px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.11), transparent 30%),
            rgba(255,255,255,.88);
          border:1px solid rgba(167, 139, 250,.22);
          box-shadow:0 18px 48px rgba(28, 17, 48,.07);
          backdrop-filter:blur(18px);
        }

        .jli-head {
          display:grid;
          grid-template-columns:minmax(0, 1fr) auto;
          gap:14px;
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
          background:#efe9fb;
          border:1px solid rgba(139,92,246,.16);
          font-size:11px;
          font-weight:950;
        }

        .jli-title {
          margin:0;
          color:var(--ink, #18102e);
          font-size:clamp(20px,2.4vw,30px);
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
          display:grid;
          gap:5px;
          min-width:230px;
          border-radius:24px;
          padding:14px 16px;
          background:#18102e;
          color:#f8f4ff;
          box-shadow:0 16px 36px rgba(28, 17, 48,.16);
        }

        .jli-current span {
          color:#c4b5fd;
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
          color:rgba(255,255,255,.72);
          font-size:11px;
          line-height:1.7;
          font-weight:800;
        }

        .jli-stats {
          display:grid;
          grid-template-columns:repeat(4,minmax(0,1fr));
          gap:10px;
          margin:0 0 14px;
        }

        .jli-stat {
          border-radius:20px;
          padding:12px 13px;
          background:rgba(255,255,255,.82);
          border:1px solid rgba(167,139,250,.18);
        }

        .jli-stat span {
          display:block;
          color:var(--muted, #7a6c9a);
          font-size:10px;
          font-weight:900;
          line-height:1.7;
        }

        .jli-stat strong {
          display:block;
          color:var(--ink, #18102e);
          font-size:18px;
          font-weight:950;
          line-height:1.3;
        }

        .jli-next {
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin:0 0 14px;
          border-radius:22px;
          padding:13px 14px;
          color:#3b2764;
          background:linear-gradient(135deg,rgba(196,181,253,.36),rgba(255,255,255,.74));
          border:1px solid rgba(139,92,246,.18);
          font-size:12px;
          font-weight:900;
        }

        .jli-next strong {
          color:#4c1d95;
          font-weight:950;
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
          background:#ffffff;
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
          gap:10px;
        }

        .jli-month {
          border-radius:24px;
          overflow:hidden;
          background:rgba(255,255,255,.78);
          border:1px solid rgba(167,139,250,.20);
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
          padding:15px;
        }

        .jli-month-toggle:hover,
        .jli-week-toggle:hover {
          background:rgba(239,233,251,.48);
        }

        .jli-number {
          display:grid;
          place-items:center;
          width:38px;
          height:38px;
          border-radius:15px;
          color:#4c1d95;
          background:#efe9fb;
          border:1px solid rgba(139,92,246,.16);
          font-size:13px;
          font-weight:950;
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
          color:#7c3aed;
          font-size:14px;
          font-weight:950;
          transition:.2s ease;
        }

        .jli-chevron--open {
          transform:rotate(180deg);
        }

        .jli-weeks {
          display:grid;
          gap:9px;
          padding:0 12px 12px;
        }

        .jli-week {
          border-radius:20px;
          overflow:hidden;
          background:rgba(255,255,255,.76);
          border:1px solid rgba(167,139,250,.16);
        }

        .jli-week-toggle {
          padding:12px;
        }

        .jli-week .jli-number {
          width:32px;
          height:32px;
          border-radius:13px;
          font-size:12px;
        }

        .jli-days {
          display:grid;
          gap:8px;
          padding:0 12px 12px;
        }

        .jli-day {
          width:100%;
          border:0;
          cursor:pointer;
          display:grid;
          grid-template-columns:auto minmax(0,1fr);
          gap:10px;
          align-items:start;
          text-align:right;
          font-family:inherit;
          border-radius:18px;
          padding:12px;
          background:#ffffff;
          border:1px solid rgba(167,139,250,.16);
          box-shadow:0 10px 24px rgba(28,17,48,.045);
          transition:.22s ease;
        }

        .jli-day:hover {
          transform:translateY(-2px);
          box-shadow:0 16px 30px rgba(139,92,246,.10);
        }

        .jli-day--locked {
          opacity:.68;
          cursor:not-allowed;
          background:rgba(248,246,252,.82);
        }

        .jli-day--current {
          border-color:rgba(139,92,246,.42);
          box-shadow:0 0 0 4px rgba(139,92,246,.08), 0 16px 34px rgba(139,92,246,.12);
        }

        .jli-day-icon {
          display:grid;
          place-items:center;
          width:30px;
          height:30px;
          border-radius:12px;
          color:#4c1d95;
          background:#efe9fb;
          font-size:12px;
          font-weight:950;
        }

        .jli-day--completed .jli-day-icon {
          color:#065f46;
          background:#ecfdf5;
        }

        .jli-day--locked .jli-day-icon {
          color:#6b6478;
          background:#f1eef7;
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
          font-size:12px;
          line-height:1.8;
          font-weight:950;
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
          color:#6b6478;
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

        html[data-theme="dark"] body.od-theme-dark #root .journey-index {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.16), transparent 32%),
            rgba(24,16,46,.78);
          border-color:rgba(196,181,253,.16);
          box-shadow:0 22px 52px rgba(0,0,0,.20);
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-month,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-week,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-stat,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-day {
          background:rgba(255,255,255,.06);
          border-color:rgba(196,181,253,.14);
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-filter {
          background:rgba(255,255,255,.08);
          color:#ddd6fe;
          border-color:rgba(196,181,253,.18);
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-filter--active,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-filter:hover {
          background:rgba(139,92,246,.22);
          color:#ffffff;
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-day--locked {
          background:rgba(255,255,255,.035);
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-title,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-stat strong,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-month-title strong,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-week-title strong,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-day strong {
          color:#f8f4ff;
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-subtitle,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-stat span,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-month-title small,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-week-title small,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-filter-count,
        html[data-theme="dark"] body.od-theme-dark #root .journey-index .jli-day-meta {
          color:#c4b5fd;
        }

        @media (max-width:980px) {
          .jli-head,
          .jli-stats {
            grid-template-columns:1fr;
          }

          .jli-current {
            min-width:0;
          }
        }

        @media (max-width:640px) {
          .journey-index {
            border-radius:24px;
            padding:16px;
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
        }
      `}</style>

      <div className="jli-head">
        <div>
          <span className="jli-kicker">خريطة الرحلة</span>
          <h2 className="jli-title">فهرس الرحلة التعليمية</h2>
          <p className="jli-subtitle">
            واصل من محطتك الحالية أو استعرض خريطة الرحلة كاملة دون كسر تسلسل التقدّم.
          </p>
        </div>

        <aside className="jli-current" aria-label="محطتك الحالية">
          <span>أنت الآن في</span>
          <strong>
            {selectedMonth?.title || "الشهر الحالي"} · {selectedWeek?.title || "الأسبوع الحالي"} · {getDayLabel(selectedDay)}
          </strong>
          <small>{selectedDay?.title || "واصل من هنا"}</small>
        </aside>
      </div>

      <div className="jli-stats" aria-label="ملخص تقدم الفهرس">
        <div className="jli-stat">
          <span>الأشهر المنجزة</span>
          <strong>{journeyStats.completedMonths} / {journeyStats.totalMonths}</strong>
        </div>
        <div className="jli-stat">
          <span>الأسابيع المنجزة</span>
          <strong>{journeyStats.completedWeeks} / {journeyStats.totalWeeks}</strong>
        </div>
        <div className="jli-stat">
          <span>الدروس المكتملة</span>
          <strong>{journeyStats.completedLessons} / {journeyStats.totalLessons}</strong>
        </div>
        <div className="jli-stat">
          <span>متاحة الآن</span>
          <strong>{journeyStats.availableLessons}</strong>
        </div>
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
