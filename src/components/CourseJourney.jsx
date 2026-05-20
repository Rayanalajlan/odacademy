import { useEffect, useMemo, useState } from "react";
import { courseMap } from "../data/courseContent";
import { markDayOpened, updateUserProgress } from "../lib/progressService";

const stateLabels = {
  locked: "مقفل",
  active: "متاح",
  completed: "مكتمل"
};

const stageMeta = {
  months: {
    kicker: "بوابة الرحلة",
    title: "اختر الشهر الذي تريد دخوله",
    note: "تبدأ الرحلة من الشهر الأول، ثم تُفتح الشهور التالية بعد إكمال المسار السابق.",
    quote: "لا تبدأ بالحل. افهم النظام أولًا."
  },
  weeks: {
    kicker: "خريطة الشهر",
    title: "اختر الأسبوع داخل هذا الشهر",
    note: "كل أسبوع بوابة مستقلة داخل الشهر. لا يظهر الدرس إلا بعد دخول الأسبوع ثم اختيار اليوم.",
    quote: "التقدم الحقيقي ليس كثرة القراءة؛ بل وضوح التفكير."
  },
  days: {
    kicker: "مسار الأسبوع",
    title: "اختر اليوم التعليمي",
    note: "الأيام تُعرض كمحطات متتابعة، ولا يُفتح اليوم التالي إلا بعد إكمال اليوم الحالي.",
    quote: "كل يوم تنهيه يضيف طبقة جديدة إلى حكمك المهني."
  },
  lesson: {
    kicker: "غرفة الإتقان",
    title: "الدرس الحالي",
    note: "اقرأ الدرس، ثم اضغط إنهاء اليوم حتى تُحفظ المحطة وتُفتح المحطة التالية.",
    quote: "الممارس المحترف لا يستهلك المعرفة؛ يحوّلها إلى ممارسة."
  }
};

const STORAGE_KEY = "odacademy_local_course_progress";

function toInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function progressKey(monthIndex, weekIndex, dayIndex) {
  return `${toInt(monthIndex)}-${toInt(weekIndex)}-${toInt(dayIndex)}`;
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function dayHasContent(day) {
  return hasText(day?.content);
}

function normalizeCourseMap(source) {
  const months = Array.isArray(source) ? source : [];

  return months.map((month, monthPosition) => {
    const monthIndex = toInt(month.monthIndex ?? month.index ?? month.id, monthPosition + 1);

    const weeks = (Array.isArray(month.weeks) ? month.weeks : []).map((week, weekPosition) => {
      const weekIndex = toInt(week.weekIndex ?? week.index ?? week.id, weekPosition + 1);

      const days = (Array.isArray(week.days) ? week.days : []).map((day, dayPosition) => {
        const dayIndex = toInt(day.dayIndex ?? day.index ?? day.id, dayPosition + 1);

        return {
          ...day,
          id: day.id || `m${monthIndex}-w${weekIndex}-d${dayIndex}`,
          monthIndex,
          weekIndex,
          dayIndex,
          label: day.label || `اليوم ${dayIndex}`,
          title: day.title || day.label || `اليوم ${dayIndex}`,
          content: day.content || day.lesson || day.body || day.text || ""
        };
      });

      return {
        ...week,
        id: week.id || `m${monthIndex}-w${weekIndex}`,
        monthIndex,
        weekIndex,
        days,
        title: week.title || `الأسبوع ${weekIndex}`,
        subtitle: week.subtitle || "",
        intro: week.intro || "",
        isContentAvailable: days.some(dayHasContent)
      };
    });

    return {
      ...month,
      id: month.id || `month-${monthIndex}`,
      monthIndex,
      weeks,
      title: month.title || `الشهر ${monthIndex}`,
      subtitle: month.subtitle || ""
    };
  });
}

function weekTotalDays(week) {
  return (week?.days || []).filter(dayHasContent).length;
}

function monthTotalDays(month) {
  return (month?.weeks || []).reduce((sum, week) => sum + weekTotalDays(week), 0);
}

function countCompletedInWeek(completedSet, week) {
  return (week?.days || []).filter((day) => {
    return dayHasContent(day) && completedSet.has(progressKey(day.monthIndex, day.weekIndex, day.dayIndex));
  }).length;
}

function countCompletedInMonth(completedSet, month) {
  return (month?.weeks || []).reduce((sum, week) => sum + countCompletedInWeek(completedSet, week), 0);
}

function arabicPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0٪";
  return `${Math.round(Math.max(0, Math.min(100, n)))}٪`;
}

function getRowKey(row) {
  return progressKey(
    row.month_index ?? row.monthIndex,
    row.week_index ?? row.weekIndex,
    row.day_index ?? row.dayIndex
  );
}

function calculateCompletedSet(rows) {
  return new Set(
    (Array.isArray(rows) ? rows : [])
      .filter((row) => row?.status === "completed")
      .map(getRowKey)
  );
}

function loadLocalRows() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalRows(rows) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // لا نوقف الواجهة إذا تعذر الحفظ المحلي
  }
}

function upsertCompletedRow(rows, day) {
  const nextRow = {
    month_index: day.monthIndex,
    week_index: day.weekIndex,
    day_index: day.dayIndex,
    status: "completed"
  };

  const map = new Map((Array.isArray(rows) ? rows : []).map((row) => [getRowKey(row), row]));
  map.set(getRowKey(nextRow), nextRow);

  return Array.from(map.values());
}

function StatusMark({ state }) {
  if (state === "completed") return <span className="jl-status jl-status--completed">✓</span>;
  if (state === "locked") return <span className="jl-status jl-status--locked">🔒</span>;
  return <span className="jl-status jl-status--active">●</span>;
}

function MiniProgress({ label, value, help }) {
  return (
    <div className="jl-mini-progress">
      <div>
        <span>{label}</span>
        <strong>{arabicPercent(value)}</strong>
      </div>
      <div className="jl-mini-track">
        <i style={{ width: `${Math.min(100, Math.max(0, Number(value) || 0))}%` }} />
      </div>
      {help && <small>{help}</small>}
    </div>
  );
}

export default function CourseJourney({
  progressRows = [],
  setProgressRows = () => {},
  loading = false
}) {
  const months = useMemo(() => normalizeCourseMap(courseMap), []);
  const [localRows, setLocalRows] = useState(() => loadLocalRows());

  const allRows = useMemo(() => {
    const map = new Map();

    [...(Array.isArray(progressRows) ? progressRows : []), ...localRows].forEach((row) => {
      if (row?.status === "completed") {
        map.set(getRowKey(row), row);
      }
    });

    return Array.from(map.values());
  }, [progressRows, localRows]);

  const completedSet = useMemo(() => calculateCompletedSet(allRows), [allRows]);

  const firstMonth = months[0] || {
    id: "empty-month",
    monthIndex: 1,
    title: "لا يوجد محتوى",
    subtitle: "",
    weeks: []
  };

  const [stage, setStage] = useState("months");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(firstMonth.monthIndex);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const selectedMonth =
    months.find((month) => month.monthIndex === selectedMonthIndex) || firstMonth;

  const selectedWeek =
    selectedMonth.weeks.find((week) => week.weekIndex === selectedWeekIndex) ||
    selectedMonth.weeks[0] ||
    {
      id: "empty-week",
      monthIndex: selectedMonth.monthIndex,
      weekIndex: 1,
      title: "لا يوجد أسبوع متاح",
      subtitle: "",
      intro: "",
      days: [],
      isContentAvailable: false
    };

  const selectedDay =
    selectedWeek.days.find((day) => day.dayIndex === selectedDayIndex) ||
    selectedWeek.days[0] ||
    {
      id: "empty-day",
      monthIndex: selectedMonth.monthIndex,
      weekIndex: selectedWeek.weekIndex,
      dayIndex: 1,
      label: "اليوم الأول",
      title: "لا يوجد درس متاح",
      content: ""
    };

  function isMonthCompleted(month) {
    const total = monthTotalDays(month);
    if (!total) return false;
    return countCompletedInMonth(completedSet, month) >= total;
  }

  function isMonthUnlocked(month) {
    if (month.monthIndex === 1) return true;

    const previousMonth = months.find((item) => item.monthIndex === month.monthIndex - 1);
    return Boolean(previousMonth && isMonthCompleted(previousMonth));
  }

  function monthState(month) {
    if (isMonthCompleted(month)) return "completed";
    if (isMonthUnlocked(month)) return "active";
    return "locked";
  }

  function isWeekCompleted(week) {
    const total = weekTotalDays(week);
    if (!total) return false;
    return countCompletedInWeek(completedSet, week) >= total;
  }

  function isWeekUnlocked(week, monthContext = selectedMonth) {
    if (!isMonthUnlocked(monthContext)) return false;
    if (!week?.isContentAvailable) return false;
    if (week.weekIndex === 1) return true;

    const previousWeek = monthContext.weeks.find((item) => item.weekIndex === week.weekIndex - 1);
    return Boolean(previousWeek && isWeekCompleted(previousWeek));
  }

  function weekState(week) {
    if (isWeekCompleted(week)) return "completed";
    if (isWeekUnlocked(week)) return "active";
    return "locked";
  }

  function isDayCompleted(day) {
    return completedSet.has(progressKey(day.monthIndex, day.weekIndex, day.dayIndex));
  }

  function isDayUnlockedWithin(day, week, month) {
    if (!dayHasContent(day)) return false;
    if (!isWeekUnlocked(week, month)) return false;

    const contentDays = week.days.filter(dayHasContent);
    const position = contentDays.findIndex((item) => item.dayIndex === day.dayIndex);

    if (position <= 0) return true;

    const previousDay = contentDays[position - 1];
    return isDayCompleted(previousDay);
  }

  function isDayUnlocked(day) {
    return isDayUnlockedWithin(day, selectedWeek, selectedMonth);
  }

  function dayState(day) {
    if (isDayCompleted(day)) return "completed";
    if (isDayUnlocked(day)) return "active";
    return "locked";
  }

  function firstAvailableDay(week, month) {
    const contentDays = (week?.days || []).filter(dayHasContent);
    if (!contentDays.length) return week?.days?.[0] || selectedDay;

    return (
      contentDays.find((day) => isDayUnlockedWithin(day, week, month) && !isDayCompleted(day)) ||
      contentDays.find((day) => !isDayCompleted(day)) ||
      contentDays[0]
    );
  }

  function firstRelevantWeekInMonth(month) {
    const unlockedWeeks = (month?.weeks || []).filter((week) => isWeekUnlocked(week, month));
    return unlockedWeeks.find((week) => !isWeekCompleted(week)) || unlockedWeeks[0] || month.weeks[0];
  }

  function firstAvailableLearningPoint() {
    for (const month of months) {
      if (!isMonthUnlocked(month)) continue;

      for (const week of month.weeks) {
        if (!isWeekUnlocked(week, month)) continue;

        const day = week.days.find((item) => {
          return dayHasContent(item) && isDayUnlockedWithin(item, week, month) && !isDayCompleted(item);
        });

        if (day) return { month, week, day };
      }
    }

    const month = months.find(isMonthUnlocked) || firstMonth;
    const week = firstRelevantWeekInMonth(month) || month.weeks[0] || selectedWeek;
    const day = firstAvailableDay(week, month) || selectedDay;

    return { month, week, day };
  }

  useEffect(() => {
    const next = firstAvailableLearningPoint();

    if (next?.month?.monthIndex) setSelectedMonthIndex(next.month.monthIndex);
    if (next?.week?.weekIndex) setSelectedWeekIndex(next.week.weekIndex);
    if (next?.day?.dayIndex) setSelectedDayIndex(next.day.dayIndex);
    // نترك المستخدم في بوابة الشهور ولا نفتح الدرس تلقائيًا
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months.length, completedSet.size]);

  useEffect(() => {
    if (stage !== "lesson") return;
    if (!selectedDay?.content) return;

    markDayOpened({
      monthIndex: selectedDay.monthIndex,
      weekIndex: selectedDay.weekIndex,
      dayIndex: selectedDay.dayIndex
    }).catch(() => undefined);
  }, [stage, selectedDay?.id]);

  function openNextPoint() {
    const next = firstAvailableLearningPoint();

    setSelectedMonthIndex(next.month.monthIndex);
    setSelectedWeekIndex(next.week.weekIndex);
    setSelectedDayIndex(next.day.dayIndex);
    setStage("lesson");
    setNotice("");
  }

  function handleMonthClick(month) {
    if (!isMonthUnlocked(month)) return;

    const week = firstRelevantWeekInMonth(month) || month.weeks[0];
    const day = firstAvailableDay(week, month);

    setSelectedMonthIndex(month.monthIndex);
    setSelectedWeekIndex(week.weekIndex);
    setSelectedDayIndex(day.dayIndex);
    setStage("weeks");
    setNotice("");
  }

  function handleWeekClick(week) {
    if (!isWeekUnlocked(week)) return;

    const day = firstAvailableDay(week, selectedMonth);

    setSelectedWeekIndex(week.weekIndex);
    setSelectedDayIndex(day.dayIndex);
    setStage("days");
    setNotice("");
  }

  function handleDayClick(day) {
    if (!isDayUnlocked(day)) return;

    setSelectedDayIndex(day.dayIndex);
    setStage("lesson");
    setNotice("");
  }

  async function completeCurrentDay() {
    if (!selectedDay?.content || isDayCompleted(selectedDay) || !isDayUnlocked(selectedDay)) return;

    setSaving(true);
    setNotice("");

    try {
      const rows = await updateUserProgress({
        monthIndex: selectedDay.monthIndex,
        weekIndex: selectedDay.weekIndex,
        dayIndex: selectedDay.dayIndex,
        status: "completed"
      });

      if (Array.isArray(rows)) {
        setProgressRows(rows);
      }

      setNotice("تم حفظ تقدمك وفتح المحطة التالية.");
    } catch {
      const nextLocalRows = upsertCompletedRow(localRows, selectedDay);
      setLocalRows(nextLocalRows);
      saveLocalRows(nextLocalRows);
      setProgressRows([...progressRows, ...nextLocalRows]);
      setNotice("تم حفظ التقدم محليًا. لاحقًا نضبط Supabase حتى يُحفظ التقدم سحابيًا.");
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    if (stage === "lesson") setStage("days");
    else if (stage === "days") setStage("weeks");
    else if (stage === "weeks") setStage("months");
  }

  const totalCourseDays = months.reduce((sum, month) => sum + monthTotalDays(month), 0);
  const totalCompletedDays = months.reduce(
    (sum, month) => sum + countCompletedInMonth(completedSet, month),
    0
  );

  const monthTotal = monthTotalDays(selectedMonth);
  const weekTotal = weekTotalDays(selectedWeek);

  const monthCompleted = countCompletedInMonth(completedSet, selectedMonth);
  const weekCompleted = countCompletedInWeek(completedSet, selectedWeek);

  const overallProgress = totalCourseDays ? (totalCompletedDays / totalCourseDays) * 100 : 0;
  const monthProgress = monthTotal ? (monthCompleted / monthTotal) * 100 : 0;
  const weekProgress = weekTotal ? (weekCompleted / weekTotal) * 100 : 0;

  const currentMeta = stageMeta[stage];
  const currentDayState = dayState(selectedDay);

  return (
    <section className="journey-lab" dir="rtl">
      <style>{`
        .journey-lab {
          min-height: 100vh;
          padding: 28px 16px 70px;
          color: #0f172a;
          background:
            radial-gradient(circle at 10% 10%, rgba(79,70,229,.18), transparent 32%),
            radial-gradient(circle at 90% 20%, rgba(245,158,11,.14), transparent 30%),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 52%, #f8fafc 100%);
        }

        .jl-wrap {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .jl-hero {
          border-radius: 36px;
          padding: 34px;
          overflow: hidden;
          color: white;
          background:
            radial-gradient(circle at top left, rgba(124,58,237,.35), transparent 35%),
            linear-gradient(135deg, #0f172a, #1e293b);
          box-shadow: 0 25px 70px rgba(15,23,42,.18);
        }

        .jl-hero-grid {
          display: grid;
          grid-template-columns: 1.35fr .65fr;
          gap: 24px;
          align-items: center;
        }

        .jl-eyebrow {
          display: inline-flex;
          width: fit-content;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          color: #c7d2fe;
          font-size: 12px;
          font-weight: 900;
        }

        .jl-hero h1 {
          margin: 18px 0 12px;
          font-size: clamp(30px, 5vw, 58px);
          line-height: 1.08;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .jl-hero h1 span {
          display: block;
          color: #fde68a;
        }

        .jl-hero p {
          margin: 0;
          max-width: 760px;
          color: rgba(226,232,240,.88);
          line-height: 2;
          font-size: 15px;
          font-weight: 700;
        }

        .jl-orb {
          width: 210px;
          height: 210px;
          margin: auto;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background:
            radial-gradient(circle at 35% 30%, rgba(255,255,255,.88), rgba(255,255,255,.15) 20%, transparent 38%),
            conic-gradient(from 0deg, #4f46e5, #7c3aed, #f59e0b, #10b981, #4f46e5);
          box-shadow: 0 30px 90px rgba(79,70,229,.36);
        }

        .jl-orb strong {
          display: block;
          font-size: 44px;
          font-weight: 950;
          text-align: center;
        }

        .jl-orb small {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          font-weight: 900;
          text-align: center;
          color: rgba(255,255,255,.86);
        }

        .jl-control-deck {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: 18px 0;
        }

        .jl-mini-progress {
          border-radius: 24px;
          padding: 16px;
          background: rgba(255,255,255,.84);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 16px 38px rgba(15,23,42,.08);
        }

        .jl-mini-progress > div:first-child {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .jl-mini-progress span {
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
        }

        .jl-mini-progress strong {
          color: #0f172a;
          font-size: 18px;
          font-weight: 950;
        }

        .jl-mini-progress small {
          display: block;
          margin-top: 8px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
        }

        .jl-mini-track {
          height: 9px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(148,163,184,.18);
        }

        .jl-mini-track i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #4f46e5, #7c3aed, #f59e0b);
        }

        .jl-top-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin: 20px 0;
        }

        .jl-breadcrumbs {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .jl-crumb,
        .jl-back,
        .jl-main-btn,
        .jl-ghost-btn,
        .jl-complete {
          font-family: inherit;
          border: 0;
          cursor: pointer;
          transition: .22s ease;
        }

        .jl-crumb {
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.76);
          border: 1px solid rgba(255,255,255,.95);
          color: #475569;
          font-size: 12px;
          font-weight: 950;
        }

        .jl-crumb:hover,
        .jl-back:hover,
        .jl-main-btn:hover,
        .jl-ghost-btn:hover,
        .jl-complete:hover {
          transform: translateY(-2px);
        }

        .jl-crumb:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .jl-back {
          padding: 11px 15px;
          border-radius: 16px;
          background: #0f172a;
          color: white;
          font-size: 12px;
          font-weight: 950;
        }

        .jl-main-btn {
          padding: 13px 18px;
          border-radius: 18px;
          color: white;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          font-size: 12px;
          font-weight: 950;
        }

        .jl-ghost-btn {
          padding: 13px 18px;
          border-radius: 18px;
          color: #334155;
          background: rgba(255,255,255,.84);
          border: 1px solid rgba(148,163,184,.28);
          font-size: 12px;
          font-weight: 950;
        }

        .jl-notice {
          margin: 12px 0;
          border-radius: 20px;
          padding: 13px 15px;
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid rgba(16,185,129,.22);
          font-size: 12px;
          font-weight: 900;
        }

        .jl-loading {
          background: #fffbeb;
          color: #92400e;
          border-color: rgba(245,158,11,.24);
        }

        .jl-stage-panel {
          border-radius: 34px;
          padding: 24px;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 22px 60px rgba(15,23,42,.08);
        }

        .jl-stage-head {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: start;
          margin-bottom: 18px;
        }

        .jl-stage-head span {
          color: #4f46e5;
          font-size: 11px;
          font-weight: 950;
        }

        .jl-stage-head h2 {
          margin: 8px 0 0;
          color: #0f172a;
          font-size: clamp(22px, 3vw, 34px);
          line-height: 1.25;
          font-weight: 950;
        }

        .jl-stage-head p {
          margin: 10px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.9;
          font-weight: 750;
        }

        .jl-quote {
          max-width: 310px;
          padding: 14px 16px;
          border-radius: 22px;
          background: #0f172a;
          color: #f8fafc;
          font-size: 12px;
          font-weight: 900;
          line-height: 1.8;
        }

        .jl-month-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .jl-weeks-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .jl-days-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 12px;
        }

        .jl-month-card,
        .jl-week-card,
        .jl-day-card {
          font-family: inherit;
          text-align: right;
          border: 0;
          cursor: pointer;
          border-radius: 28px;
          background: rgba(255,255,255,.9);
          border: 1px solid rgba(148,163,184,.2);
          box-shadow: 0 16px 40px rgba(15,23,42,.07);
          transition: .24s ease;
        }

        .jl-month-card {
          position: relative;
          min-height: 215px;
          padding: 18px;
        }

        .jl-week-card {
          position: relative;
          min-height: 178px;
          padding: 18px;
        }

        .jl-day-card {
          min-height: 148px;
          padding: 14px 10px;
          text-align: center;
        }

        .jl-month-card:hover,
        .jl-week-card:hover,
        .jl-day-card:hover {
          transform: translateY(-6px);
          border-color: rgba(79,70,229,.3);
        }

        .jl-month-card:disabled,
        .jl-week-card:disabled,
        .jl-day-card:disabled {
          cursor: not-allowed;
          opacity: .55;
          filter: grayscale(.7);
          transform: none;
        }

        .jl-month-top,
        .jl-week-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .jl-status {
          width: 32px;
          height: 32px;
          display: inline-grid;
          place-items: center;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 950;
        }

        .jl-status--completed {
          color: #065f46;
          background: rgba(16,185,129,.12);
        }

        .jl-status--active {
          color: #3730a3;
          background: rgba(79,70,229,.12);
        }

        .jl-status--locked {
          color: #64748b;
          background: rgba(100,116,139,.12);
        }

        .jl-index {
          color: rgba(15,23,42,.13);
          font-size: 42px;
          font-weight: 950;
          line-height: 1;
        }

        .jl-month-card h3,
        .jl-week-card h3 {
          margin: 22px 0 8px;
          color: #0f172a;
          font-size: 19px;
          line-height: 1.45;
          font-weight: 950;
        }

        .jl-month-card p,
        .jl-week-card p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 750;
        }

        .jl-card-foot {
          position: absolute;
          right: 18px;
          left: 18px;
          bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          color: #64748b;
          font-size: 11px;
          font-weight: 900;
        }

        .jl-day-number {
          width: 52px;
          height: 52px;
          margin: 0 auto 12px;
          display: grid;
          place-items: center;
          border-radius: 21px;
          color: white;
          font-size: 20px;
          font-weight: 950;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
        }

        .jl-day-card--completed .jl-day-number {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .jl-day-card--locked .jl-day-number {
          background: linear-gradient(135deg, #94a3b8, #64748b);
        }

        .jl-day-card strong {
          display: block;
          color: #0f172a;
          font-size: 12px;
          font-weight: 950;
          line-height: 1.6;
        }

        .jl-day-card small {
          display: block;
          margin-top: 6px;
          color: #64748b;
          font-size: 10px;
          font-weight: 850;
        }

        .jl-lesson-shell {
          display: grid;
          grid-template-columns: 290px minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        .jl-lesson-side {
          position: sticky;
          top: 20px;
          border-radius: 30px;
          padding: 18px;
          color: white;
          background:
            radial-gradient(circle at top right, rgba(245,158,11,.22), transparent 36%),
            linear-gradient(160deg, #0f172a, #1e293b);
          box-shadow: 0 22px 55px rgba(15,23,42,.18);
        }

        .jl-pill {
          display: inline-flex;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 950;
          margin-bottom: 14px;
        }

        .jl-pill--completed {
          color: #d1fae5;
          background: rgba(16,185,129,.18);
        }

        .jl-pill--active {
          color: #e0e7ff;
          background: rgba(79,70,229,.24);
        }

        .jl-pill--locked {
          color: #e2e8f0;
          background: rgba(148,163,184,.18);
        }

        .jl-lesson-side h3 {
          margin: 0 0 10px;
          font-size: 22px;
          line-height: 1.4;
          font-weight: 950;
        }

        .jl-lesson-side p {
          color: rgba(226,232,240,.86);
          font-size: 12px;
          line-height: 1.9;
          font-weight: 750;
          margin: 0;
        }

        .jl-lesson-actions {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .jl-complete {
          padding: 14px 16px;
          border-radius: 18px;
          color: white;
          background: linear-gradient(135deg, #10b981, #059669);
          font-size: 12px;
          font-weight: 950;
        }

        .jl-complete:disabled {
          cursor: not-allowed;
          opacity: .62;
          transform: none;
        }

        .jl-reader {
          border-radius: 30px;
          padding: 28px;
          background: rgba(255,255,255,.95);
          border: 1px solid rgba(148,163,184,.18);
          box-shadow: 0 20px 55px rgba(15,23,42,.07);
        }

        .jl-week-intro {
          margin: 0 0 18px;
          border-radius: 24px;
          padding: 18px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #78350f;
          line-height: 2;
          font-size: 13px;
          font-weight: 800;
          white-space: pre-wrap;
        }

        .jl-content-body {
          color: #1e293b;
          font-size: 15px;
          line-height: 2.15;
          font-weight: 650;
          white-space: pre-wrap;
        }

        .jl-empty {
          border-radius: 24px;
          padding: 22px;
          background: #f8fafc;
          color: #64748b;
          border: 1px dashed rgba(100,116,139,.35);
          font-size: 13px;
          font-weight: 900;
          text-align: center;
        }

        @media (max-width: 980px) {
          .jl-hero-grid,
          .jl-lesson-shell,
          .jl-stage-head {
            grid-template-columns: 1fr;
          }

          .jl-control-deck,
          .jl-month-grid,
          .jl-weeks-grid {
            grid-template-columns: 1fr;
          }

          .jl-days-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .jl-quote {
            max-width: 100%;
          }

          .jl-lesson-side {
            position: relative;
            top: auto;
          }
        }

        @media (max-width: 560px) {
          .journey-lab {
            padding: 16px 10px 44px;
          }

          .jl-hero,
          .jl-stage-panel {
            border-radius: 26px;
            padding: 20px;
          }

          .jl-days-grid {
            grid-template-columns: 1fr;
          }

          .jl-reader {
            padding: 18px;
            border-radius: 24px;
          }
        }
      `}</style>

      <div className="jl-wrap">
        <header className="jl-hero">
          <div className="jl-hero-grid">
            <div>
              <span className="jl-eyebrow">رحلتك التعليمية · 6 أشهر · OD Mastery</span>
              <h1>
                رحلة لا تُعرض دفعة واحدة
                <span>بل تُفتح كبوابات إتقان</span>
              </h1>
              <p>
                الشهر أولًا، ثم الأسبوع، ثم اليوم، ثم الدرس. هكذا تبقى الرحلة منظمة ومشوقة وقابلة للإنجاز دون تشتيت أو تكديس.
              </p>
            </div>

            <div className="jl-orb">
              <div>
                <strong>{arabicPercent(overallProgress)}</strong>
                <small>من الرحلة الكاملة</small>
              </div>
            </div>
          </div>
        </header>

        <section className="jl-control-deck">
          <MiniProgress
            label="التقدم الكلي"
            value={overallProgress}
            help={`${totalCompletedDays} من ${totalCourseDays || 0} يومًا`}
          />

          <MiniProgress
            label={`تقدم ${selectedMonth.title}`}
            value={monthProgress}
            help={`${monthCompleted} من ${monthTotal || 0} يومًا`}
          />

          <MiniProgress
            label={`تقدم ${selectedWeek.title}`}
            value={weekProgress}
            help={`${weekCompleted} من ${weekTotal || 0} أيام`}
          />
        </section>

        <div className="jl-top-actions">
          <div className="jl-breadcrumbs">
            <button type="button" className="jl-crumb" onClick={() => setStage("months")}>
              الشهور
            </button>

            <button
              type="button"
              className="jl-crumb"
              onClick={() => setStage("weeks")}
              disabled={stage === "months"}
            >
              {selectedMonth.title}
            </button>

            <button
              type="button"
              className="jl-crumb"
              onClick={() => setStage("days")}
              disabled={stage === "months" || stage === "weeks"}
            >
              {selectedWeek.title}
            </button>

            <button type="button" className="jl-crumb" disabled>
              {stage === "lesson" ? selectedDay.label : "الدرس"}
            </button>
          </div>

          <div className="jl-breadcrumbs">
            {stage !== "months" && (
              <button type="button" className="jl-back" onClick={goBack}>
                رجوع خطوة
              </button>
            )}

            <button type="button" className="jl-main-btn" onClick={openNextPoint}>
              واصل من آخر محطة
            </button>
          </div>
        </div>

        {notice && <div className="jl-notice">{notice}</div>}
        {loading && <div className="jl-notice jl-loading">جارٍ تحميل حالة الطالب...</div>}

        <main className="jl-stage-panel" key={stage}>
          <div className="jl-stage-head">
            <div>
              <span>{currentMeta.kicker}</span>
              <h2>{currentMeta.title}</h2>
              <p>{currentMeta.note}</p>
            </div>

            <aside className="jl-quote">{currentMeta.quote}</aside>
          </div>

          {stage === "months" && (
            <section className="jl-month-grid">
              {months.map((month) => {
                const state = monthState(month);
                const total = monthTotalDays(month);
                const done = countCompletedInMonth(completedSet, month);
                const percent = total ? (done / total) * 100 : 0;

                return (
                  <button
                    key={month.id}
                    type="button"
                    className={`jl-month-card jl-month-card--${state}`}
                    onClick={() => handleMonthClick(month)}
                    disabled={state === "locked"}
                  >
                    <div className="jl-month-top">
                      <StatusMark state={state} />
                      <span className="jl-index">{month.monthIndex}</span>
                    </div>

                    <h3>{month.title}</h3>
                    <p>{month.subtitle}</p>

                    <div className="jl-card-foot">
                      <span>{stateLabels[state]}</span>
                      <span>{arabicPercent(percent)}</span>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {stage === "weeks" && (
            <section className="jl-weeks-grid">
              {selectedMonth.weeks.map((week) => {
                const state = weekState(week);
                const total = weekTotalDays(week);
                const done = countCompletedInWeek(completedSet, week);
                const percent = total ? (done / total) * 100 : 0;

                return (
                  <button
                    key={week.id}
                    type="button"
                    className={`jl-week-card jl-week-card--${state}`}
                    onClick={() => handleWeekClick(week)}
                    disabled={state === "locked"}
                  >
                    <div className="jl-week-top">
                      <StatusMark state={state} />
                      <span className="jl-index">0{week.weekIndex}</span>
                    </div>

                    <h3>{week.title}</h3>
                    <p>{week.subtitle}</p>

                    <div className="jl-card-foot">
                      <span>{done} من {total} أيام</span>
                      <span>{arabicPercent(percent)}</span>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {stage === "days" && (
            <section className="jl-days-grid">
              {selectedWeek.days.filter(dayHasContent).map((day) => {
                const state = dayState(day);

                return (
                  <button
                    key={day.id}
                    type="button"
                    className={`jl-day-card jl-day-card--${state}`}
                    onClick={() => handleDayClick(day)}
                    disabled={state === "locked"}
                  >
                    <div className="jl-day-number">
                      {state === "completed" ? "✓" : state === "locked" ? "🔒" : day.dayIndex}
                    </div>

                    <strong>{day.label}</strong>
                    <small>{stateLabels[state]}</small>
                  </button>
                );
              })}
            </section>
          )}

          {stage === "lesson" && (
            <section className="jl-lesson-shell">
              <aside className="jl-lesson-side">
                <span className={`jl-pill jl-pill--${currentDayState}`}>
                  {stateLabels[currentDayState]}
                </span>

                <h3>{selectedDay.title}</h3>

                <p>
                  {selectedMonth.title} · {selectedWeek.title} · {selectedDay.label}
                </p>

                <div className="jl-lesson-actions">
                  <button
                    type="button"
                    className="jl-complete"
                    onClick={completeCurrentDay}
                    disabled={saving || currentDayState === "locked" || currentDayState === "completed"}
                  >
                    {currentDayState === "completed"
                      ? "تم إكمال اليوم"
                      : saving
                        ? "جارٍ الحفظ..."
                        : "إنهاء اليوم وحفظ التقدم"}
                  </button>

                  {currentDayState === "completed" && (
                    <button type="button" className="jl-ghost-btn" onClick={openNextPoint}>
                      افتح المحطة التالية
                    </button>
                  )}

                  <button type="button" className="jl-ghost-btn" onClick={() => setStage("days")}>
                    العودة لأيام الأسبوع
                  </button>
                </div>
              </aside>

              <article className="jl-reader">
                {selectedWeek.intro && selectedDay.dayIndex === 1 && (
                  <div className="jl-week-intro">{selectedWeek.intro}</div>
                )}

                {selectedDay.content ? (
                  <div className="jl-content-body">{selectedDay.content}</div>
                ) : (
                  <div className="jl-empty">هذا المحتوى غير متاح بعد.</div>
                )}
              </article>
            </section>
          )}
        </main>
      </div>
    </section>
  );
}