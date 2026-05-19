import { useEffect, useMemo, useState } from "react";
import { courseMap, COURSE_TOTALS } from "../data/courseContent";
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
    note: "ابدأ من البوابة المفتوحة. كل شهر هو مستوى معرفي مستقل في هندسة التطوير التنظيمي.",
    quote: "لا تبدأ بالحل. افهم النظام أولًا."
  },
  weeks: {
    kicker: "خريطة الشهر",
    title: "اختر الأسبوع داخل هذا الشهر",
    note: "كل أسبوع يعالج زاوية مختلفة من الرحلة: تشخيص، تصميم، تدخل، تغيير، ثقافة، أو قياس.",
    quote: "التقدم الحقيقي ليس كثرة القراءة؛ بل وضوح التفكير."
  },
  days: {
    kicker: "مسار الأسبوع",
    title: "اختر اليوم التعليمي",
    note: "الأيام تُفتح تدريجيًا حتى تُبنى المعرفة بتسلسل مهني منضبط.",
    quote: "كل يوم تنهيه يضيف طبقة جديدة إلى عقلك التشخيصي."
  },
  lesson: {
    kicker: "غرفة الإتقان",
    title: "الدرس الحالي",
    note: "اقرأ بتركيز، ثم أنهِ اليوم حتى تُحفظ رحلتك ويتقدم المسار.",
    quote: "الممارس المحترف لا يستهلك المعرفة؛ يحوّلها إلى حكم مهني."
  }
};

function progressKey(monthIndex, weekIndex, dayIndex) {
  return `${monthIndex}-${weekIndex}-${dayIndex}`;
}

function arabicPercent(value) {
  return `${Math.round(value)}٪`;
}

function calculateCompletedSet(progressRows) {
  return new Set(
    progressRows
      .filter((row) => row.status === "completed")
      .map((row) => progressKey(row.month_index, row.week_index, row.day_index))
  );
}

function countCompletedInMonth(completedSet, monthIndex) {
  let count = 0;
  for (let weekIndex = 1; weekIndex <= COURSE_TOTALS.weeksPerMonth; weekIndex += 1) {
    for (let dayIndex = 1; dayIndex <= COURSE_TOTALS.daysPerWeek; dayIndex += 1) {
      if (completedSet.has(progressKey(monthIndex, weekIndex, dayIndex))) count += 1;
    }
  }
  return count;
}

function countCompletedInWeek(completedSet, monthIndex, weekIndex) {
  let count = 0;
  for (let dayIndex = 1; dayIndex <= COURSE_TOTALS.daysPerWeek; dayIndex += 1) {
    if (completedSet.has(progressKey(monthIndex, weekIndex, dayIndex))) count += 1;
  }
  return count;
}

function firstAvailableDay(week, completedSet) {
  const contentDays = week.days.filter((day) => Boolean(day.content));
  if (!contentDays.length) return week.days[0];

  return (
    contentDays.find((day) => {
      if (day.dayIndex === 1) {
        return !completedSet.has(progressKey(day.monthIndex, day.weekIndex, day.dayIndex));
      }

      const previousKey = progressKey(day.monthIndex, day.weekIndex, day.dayIndex - 1);
      const currentKey = progressKey(day.monthIndex, day.weekIndex, day.dayIndex);

      return completedSet.has(previousKey) && !completedSet.has(currentKey);
    }) || contentDays[contentDays.length - 1]
  );
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
      <div className="jl-mini-track" aria-label={label}>
        <i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {help && <small>{help}</small>}
    </div>
  );
}

export default function CourseJourney({ progressRows, setProgressRows, loading }) {
  const [stage, setStage] = useState("months");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(1);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const completedSet = useMemo(() => calculateCompletedSet(progressRows), [progressRows]);

  const selectedMonth =
    courseMap.find((month) => month.monthIndex === selectedMonthIndex) || courseMap[0];

  const selectedWeek =
    selectedMonth.weeks.find((week) => week.weekIndex === selectedWeekIndex) ||
    selectedMonth.weeks[0];

  const selectedDay =
    selectedWeek.days.find((day) => day.dayIndex === selectedDayIndex) || selectedWeek.days[0];

  function isMonthCompleted(month) {
    return countCompletedInMonth(completedSet, month.monthIndex) >= COURSE_TOTALS.daysPerMonth;
  }

  function isMonthUnlocked(month) {
    if (month.monthIndex === 1) return true;

    const previousMonth = courseMap.find((item) => item.monthIndex === month.monthIndex - 1);
    const hasAnyContent = month.weeks.some((week) => week.isContentAvailable);

    return Boolean(previousMonth && isMonthCompleted(previousMonth) && hasAnyContent);
  }

  function monthState(month) {
    if (isMonthCompleted(month)) return "completed";
    if (isMonthUnlocked(month)) return "active";
    return "locked";
  }

  function isWeekCompleted(week) {
    return countCompletedInWeek(completedSet, week.monthIndex, week.weekIndex) >= COURSE_TOTALS.daysPerWeek;
  }

  function isWeekUnlocked(week, monthContext = selectedMonth) {
    if (!isMonthUnlocked(monthContext)) return false;
    if (!week.isContentAvailable) return false;
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

  function isDayUnlocked(day) {
    if (!selectedWeek.isContentAvailable || !day.content) return false;
    if (!isWeekUnlocked(selectedWeek)) return false;
    if (day.dayIndex === 1) return true;

    return completedSet.has(progressKey(day.monthIndex, day.weekIndex, day.dayIndex - 1));
  }

  function dayState(day) {
    if (isDayCompleted(day)) return "completed";
    if (isDayUnlocked(day)) return "active";
    return "locked";
  }

  function isDayUnlockedWithinWeek(day, week, monthContext) {
    if (!week.isContentAvailable || !day.content) return false;
    if (!isWeekUnlocked(week, monthContext)) return false;
    if (day.dayIndex === 1) return true;

    return completedSet.has(progressKey(day.monthIndex, day.weekIndex, day.dayIndex - 1));
  }

  function firstRelevantWeekInMonth(month) {
    const unlockedWeeks = month.weeks.filter((week) => isWeekUnlocked(week, month));
    return unlockedWeeks.find((week) => !isWeekCompleted(week)) || unlockedWeeks[0] || month.weeks[0];
  }

  function firstAvailableLearningPoint() {
    for (const month of courseMap) {
      if (!isMonthUnlocked(month)) continue;

      for (const week of month.weeks) {
        if (!isWeekUnlocked(week, month)) continue;

        const nextDay = week.days.find(
          (day) => day.content && isDayUnlockedWithinWeek(day, week, month) && !isDayCompleted(day)
        );

        if (nextDay) return { month, week, day: nextDay };
      }
    }

    const fallbackMonth = courseMap[0];
    const fallbackWeek = firstRelevantWeekInMonth(fallbackMonth);

    return {
      month: fallbackMonth,
      week: fallbackWeek,
      day: firstAvailableDay(fallbackWeek, completedSet)
    };
  }

  useEffect(() => {
    const nextPoint = firstAvailableLearningPoint();

    setSelectedMonthIndex(nextPoint.month.monthIndex);
    setSelectedWeekIndex(nextPoint.week.weekIndex);
    setSelectedDayIndex(nextPoint.day.dayIndex);

    // لا نفتح الدرس تلقائيًا. نترك المستخدم يبدأ من بوابة الشهور.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressRows.length]);

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
    const nextPoint = firstAvailableLearningPoint();

    setSelectedMonthIndex(nextPoint.month.monthIndex);
    setSelectedWeekIndex(nextPoint.week.weekIndex);
    setSelectedDayIndex(nextPoint.day.dayIndex);
    setStage("lesson");
  }

  function handleMonthClick(month) {
    if (!isMonthUnlocked(month)) return;

    const availableWeek = firstRelevantWeekInMonth(month);
    const availableDay = firstAvailableDay(availableWeek, completedSet);

    setSelectedMonthIndex(month.monthIndex);
    setSelectedWeekIndex(availableWeek.weekIndex);
    setSelectedDayIndex(availableDay.dayIndex);
    setNotice("");
    setStage("weeks");
  }

  function handleWeekClick(week) {
    if (!isWeekUnlocked(week)) return;

    const availableDay = firstAvailableDay(week, completedSet);

    setSelectedWeekIndex(week.weekIndex);
    setSelectedDayIndex(availableDay.dayIndex);
    setNotice("");
    setStage("days");
  }

  function handleDayClick(day) {
    if (!isDayUnlocked(day)) return;

    setSelectedDayIndex(day.dayIndex);
    setNotice("");
    setStage("lesson");
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

      setProgressRows(rows);
      setNotice("تم حفظ تقدمك. محطة جديدة فُتحت في رحلتك.");
    } catch (error) {
      setNotice(error.message || "تعذر حفظ التقدم.");
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    if (stage === "lesson") return setStage("days");
    if (stage === "days") return setStage("weeks");
    if (stage === "weeks") return setStage("months");
    return undefined;
  }

  const monthCompletion = countCompletedInMonth(completedSet, selectedMonth.monthIndex);
  const weekCompletion = countCompletedInWeek(completedSet, selectedMonth.monthIndex, selectedWeek.weekIndex);

  const totalCourseDays = courseMap.length * COURSE_TOTALS.daysPerMonth;
  const totalCompletedDays = courseMap.reduce(
    (sum, month) => sum + countCompletedInMonth(completedSet, month.monthIndex),
    0
  );

  const overallProgress = totalCourseDays ? (totalCompletedDays / totalCourseDays) * 100 : 0;
  const monthProgress = (monthCompletion / COURSE_TOTALS.daysPerMonth) * 100;
  const weekProgress = (weekCompletion / COURSE_TOTALS.daysPerWeek) * 100;

  const currentDayState = dayState(selectedDay);
  const currentMeta = stageMeta[stage];

  return (
    <section className="journey-lab" dir="rtl">
      <style>{`
        .journey-lab {
          --jl-ink: #0f172a;
          --jl-muted: #64748b;
          --jl-soft: rgba(255,255,255,.78);
          --jl-line: rgba(148,163,184,.22);
          --jl-primary: #4f46e5;
          --jl-primary-2: #7c3aed;
          --jl-gold: #f59e0b;
          --jl-green: #10b981;
          --jl-red: #ef4444;
          width: 100%;
          min-height: 100vh;
          color: var(--jl-ink);
          position: relative;
          overflow: hidden;
          padding: 28px 16px 70px;
          background:
            radial-gradient(circle at 12% 12%, rgba(79,70,229,.18), transparent 31%),
            radial-gradient(circle at 86% 18%, rgba(245,158,11,.16), transparent 28%),
            radial-gradient(circle at 50% 88%, rgba(16,185,129,.13), transparent 31%),
            linear-gradient(135deg, #f8fafc 0%, #eef2ff 48%, #f8fafc 100%);
        }

        .journey-lab::before,
        .journey-lab::after {
          content: "";
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 999px;
          filter: blur(16px);
          opacity: .55;
          pointer-events: none;
          background: conic-gradient(from 120deg, rgba(79,70,229,.18), rgba(245,158,11,.12), rgba(16,185,129,.14), rgba(79,70,229,.18));
          animation: jlFloat 12s ease-in-out infinite alternate;
        }

        .journey-lab::before {
          top: -310px;
          right: -230px;
        }

        .journey-lab::after {
          bottom: -340px;
          left: -250px;
          animation-delay: -4s;
        }

        @keyframes jlFloat {
          from { transform: translate3d(0,0,0) rotate(0deg); }
          to { transform: translate3d(24px,34px,0) rotate(18deg); }
        }

        .jl-wrap {
          position: relative;
          z-index: 1;
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .jl-hero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.72);
          background:
            linear-gradient(135deg, rgba(15,23,42,.96), rgba(30,41,59,.92)),
            radial-gradient(circle at top right, rgba(79,70,229,.45), transparent 36%);
          color: white;
          border-radius: 38px;
          padding: 34px;
          box-shadow: 0 24px 70px rgba(15,23,42,.18);
        }

        .jl-hero::before {
          content: "";
          position: absolute;
          inset: -40%;
          background-image:
            linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
          background-size: 42px 42px;
          transform: rotate(-8deg);
          opacity: .45;
        }

        .jl-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.35fr .65fr;
          gap: 26px;
          align-items: center;
        }

        .jl-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          color: #c7d2fe;
          border: 1px solid rgba(255,255,255,.16);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .03em;
        }

        .jl-title {
          margin: 16px 0 12px;
          font-size: clamp(28px, 5vw, 58px);
          line-height: 1.06;
          font-weight: 950;
          letter-spacing: -1.4px;
        }

        .jl-title span {
          display: block;
          background: linear-gradient(90deg, #fff, #c7d2fe, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .jl-hero p {
          max-width: 760px;
          margin: 0;
          color: rgba(226,232,240,.88);
          font-size: 15px;
          line-height: 2;
          font-weight: 700;
        }

        .jl-orb-card {
          position: relative;
          min-height: 250px;
          display: grid;
          place-items: center;
        }

        .jl-orb {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          position: relative;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 38% 32%, rgba(255,255,255,.95), rgba(199,210,254,.35) 18%, rgba(79,70,229,.22) 42%, rgba(15,23,42,.05) 66%),
            conic-gradient(from 0deg, #4f46e5, #7c3aed, #f59e0b, #10b981, #4f46e5);
          box-shadow:
            inset 0 0 38px rgba(255,255,255,.35),
            0 30px 90px rgba(79,70,229,.36);
          animation: jlPulse 5s ease-in-out infinite;
        }

        .jl-orb::before {
          content: "";
          position: absolute;
          inset: 18px;
          border-radius: inherit;
          border: 1px solid rgba(255,255,255,.32);
        }

        .jl-orb::after {
          content: "";
          position: absolute;
          width: 285px;
          height: 78px;
          border: 1px solid rgba(255,255,255,.28);
          border-radius: 50%;
          transform: rotate(-18deg);
        }

        @keyframes jlPulse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.025); }
        }

        .jl-orb strong {
          font-size: 48px;
          font-weight: 950;
          color: white;
          text-shadow: 0 8px 24px rgba(15,23,42,.35);
        }

        .jl-orb small {
          display: block;
          color: rgba(255,255,255,.82);
          text-align: center;
          font-size: 11px;
          font-weight: 900;
        }

        .jl-control-deck {
          margin: 18px 0;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .jl-mini-progress,
        .jl-signal {
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 16px 38px rgba(15,23,42,.08);
          backdrop-filter: blur(18px);
          border-radius: 24px;
          padding: 16px;
        }

        .jl-mini-progress > div:first-child {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .jl-mini-progress span,
        .jl-signal span {
          color: var(--jl-muted);
          font-size: 11px;
          font-weight: 900;
        }

        .jl-mini-progress strong,
        .jl-signal strong {
          color: var(--jl-ink);
          font-size: 18px;
          font-weight: 950;
        }

        .jl-mini-progress small {
          display: block;
          margin-top: 9px;
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
          box-shadow: 0 6px 20px rgba(79,70,229,.28);
        }

        .jl-top-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }

        .jl-breadcrumbs {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .jl-crumb,
        .jl-back,
        .jl-main-btn,
        .jl-ghost-btn {
          border: 0;
          cursor: pointer;
          font-family: inherit;
          transition: .25s ease;
        }

        .jl-crumb {
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(255,255,255,.9);
          color: #475569;
          font-size: 12px;
          font-weight: 950;
          box-shadow: 0 10px 28px rgba(15,23,42,.06);
        }

        .jl-crumb:hover {
          color: var(--jl-primary);
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
          box-shadow: 0 14px 30px rgba(15,23,42,.18);
        }

        .jl-back:hover,
        .jl-main-btn:hover,
        .jl-ghost-btn:hover {
          transform: translateY(-2px);
        }

        .jl-main-btn {
          padding: 13px 18px;
          border-radius: 18px;
          color: white;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 18px 38px rgba(79,70,229,.26);
          font-size: 12px;
          font-weight: 950;
        }

        .jl-ghost-btn {
          padding: 13px 18px;
          border-radius: 18px;
          background: rgba(255,255,255,.8);
          border: 1px solid rgba(148,163,184,.28);
          color: #334155;
          font-size: 12px;
          font-weight: 950;
        }

        .jl-stage-panel {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(255,255,255,.9);
          backdrop-filter: blur(22px);
          border-radius: 34px;
          box-shadow: 0 22px 60px rgba(15,23,42,.08);
          padding: 24px;
          animation: jlReveal .45s ease both;
        }

        @keyframes jlReveal {
          from { opacity: 0; transform: translateY(14px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .jl-stage-head {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: start;
          margin-bottom: 18px;
        }

        .jl-stage-head span {
          display: inline-flex;
          color: var(--jl-primary);
          font-size: 11px;
          font-weight: 950;
          letter-spacing: .06em;
          margin-bottom: 8px;
        }

        .jl-stage-head h2 {
          margin: 0;
          color: var(--jl-ink);
          font-size: clamp(22px, 3vw, 34px);
          line-height: 1.25;
          font-weight: 950;
          letter-spacing: -.7px;
        }

        .jl-stage-head p {
          margin: 10px 0 0;
          color: var(--jl-muted);
          font-size: 13px;
          line-height: 1.9;
          font-weight: 750;
          max-width: 760px;
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
          box-shadow: 0 18px 38px rgba(15,23,42,.16);
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

        .jl-month-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .jl-month-card {
          position: relative;
          min-height: 210px;
          border: 0;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          overflow: hidden;
          border-radius: 30px;
          padding: 18px;
          background:
            linear-gradient(145deg, rgba(255,255,255,.96), rgba(238,242,255,.88));
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 18px 45px rgba(15,23,42,.08);
          transition: .28s ease;
        }

        .jl-month-card::before {
          content: "";
          position: absolute;
          inset: auto -50px -76px auto;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79,70,229,.18), transparent 65%);
        }

        .jl-month-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 26px 60px rgba(79,70,229,.14);
        }

        .jl-month-card:disabled {
          cursor: not-allowed;
          filter: grayscale(.75);
          opacity: .58;
          transform: none;
        }

        .jl-month-card--selected {
          outline: 2px solid rgba(79,70,229,.45);
        }

        .jl-month-top,
        .jl-week-top,
        .jl-day-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
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
          color: rgba(15,23,42,.12);
          font-size: 42px;
          font-weight: 950;
          line-height: 1;
        }

        .jl-month-card h3,
        .jl-week-card h3 {
          position: relative;
          z-index: 1;
          margin: 22px 0 8px;
          color: var(--jl-ink);
          font-size: 19px;
          line-height: 1.45;
          font-weight: 950;
        }

        .jl-month-card p,
        .jl-week-card p {
          position: relative;
          z-index: 1;
          margin: 0;
          color: var(--jl-muted);
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

        .jl-weeks-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .jl-week-card {
          border: 0;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          border-radius: 28px;
          padding: 18px;
          min-height: 178px;
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(148,163,184,.2);
          box-shadow: 0 16px 40px rgba(15,23,42,.07);
          transition: .25s ease;
        }

        .jl-week-card:hover {
          transform: translateY(-5px);
          border-color: rgba(79,70,229,.24);
        }

        .jl-week-card:disabled {
          cursor: not-allowed;
          opacity: .55;
          filter: grayscale(.6);
          transform: none;
        }

        .jl-week-card--selected {
          background: linear-gradient(145deg, rgba(238,242,255,.94), rgba(255,255,255,.92));
          border-color: rgba(79,70,229,.35);
        }

        .jl-days-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 12px;
        }

        .jl-day-card {
          min-height: 148px;
          border: 0;
          cursor: pointer;
          font-family: inherit;
          text-align: center;
          border-radius: 26px;
          padding: 14px 10px;
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(148,163,184,.2);
          box-shadow: 0 14px 32px rgba(15,23,42,.06);
          transition: .25s ease;
        }

        .jl-day-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 22px 48px rgba(79,70,229,.12);
        }

        .jl-day-card:disabled {
          cursor: not-allowed;
          opacity: .55;
          filter: grayscale(.6);
          transform: none;
        }

        .jl-day-number {
          width: 52px;
          height: 52px;
          margin: 0 auto 12px;
          border-radius: 21px;
          display: grid;
          place-items: center;
          color: white;
          font-size: 20px;
          font-weight: 950;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          box-shadow: 0 16px 28px rgba(79,70,229,.2);
        }

        .jl-day-card--completed .jl-day-number {
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 16px 28px rgba(16,185,129,.2);
        }

        .jl-day-card--locked .jl-day-number {
          background: linear-gradient(135deg, #94a3b8, #64748b);
          box-shadow: none;
        }

        .jl-day-card strong {
          display: block;
          color: var(--jl-ink);
          font-size: 12px;
          font-weight: 950;
          line-height: 1.6;
        }

        .jl-day-card small {
          display: block;
          margin-top: 6px;
          color: var(--jl-muted);
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
          border: 1px solid rgba(16,185,129,.24);
        }

        .jl-pill--active {
          color: #e0e7ff;
          background: rgba(79,70,229,.24);
          border: 1px solid rgba(129,140,248,.26);
        }

        .jl-pill--locked {
          color: #e2e8f0;
          background: rgba(148,163,184,.18);
          border: 1px solid rgba(148,163,184,.25);
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
          border: 0;
          cursor: pointer;
          padding: 14px 16px;
          border-radius: 18px;
          color: white;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 16px 34px rgba(16,185,129,.22);
          transition: .24s ease;
        }

        .jl-complete:hover {
          transform: translateY(-2px);
        }

        .jl-complete:disabled {
          cursor: not-allowed;
          opacity: .62;
          transform: none;
        }

        .jl-reader {
          border-radius: 30px;
          padding: 28px;
          background: rgba(255,255,255,.94);
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

        .jl-content-body h1,
        .jl-content-body h2,
        .jl-content-body h3 {
          color: #0f172a;
          line-height: 1.45;
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
          .jl-hero-inner,
          .jl-lesson-shell {
            grid-template-columns: 1fr;
          }

          .jl-orb-card {
            min-height: 170px;
          }

          .jl-orb {
            width: 160px;
            height: 160px;
          }

          .jl-orb::after {
            width: 210px;
            height: 58px;
          }

          .jl-control-deck,
          .jl-month-grid {
            grid-template-columns: 1fr;
          }

          .jl-weeks-grid {
            grid-template-columns: 1fr;
          }

          .jl-days-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .jl-stage-head {
            grid-template-columns: 1fr;
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
          <div className="jl-hero-inner">
            <div>
              <span className="jl-eyebrow">رحلتك التعليمية · 6 أشهر · OD Mastery</span>
              <h1 className="jl-title">
                رحلة لا تُعرض دفعة واحدة
                <span>بل تُفتح كبوابات إتقان</span>
              </h1>
              <p>
                تجربة هرمية جديدة: الشهر أولًا، ثم الأسبوع، ثم اليوم، ثم الدرس. كل محطة تُفتح في وقتها حتى لا يتكدس المحتوى، وتبقى الرحلة واضحة ومُلهمة وقابلة للإنجاز.
              </p>
            </div>

            <div className="jl-orb-card" aria-label="نسبة التقدم الكلية">
              <div className="jl-orb">
                <div>
                  <strong>{arabicPercent(overallProgress)}</strong>
                  <small>من الرحلة الكاملة</small>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="jl-control-deck" aria-label="ملخص التقدم">
          <MiniProgress
            label="التقدم الكلي"
            value={overallProgress}
            help={`${totalCompletedDays} من ${totalCourseDays} يومًا`}
          />

          <MiniProgress
            label={`تقدم ${selectedMonth.title}`}
            value={monthProgress}
            help={`${monthCompletion} من ${COURSE_TOTALS.daysPerMonth} يومًا`}
          />

          <MiniProgress
            label={`تقدم ${selectedWeek.title}`}
            value={weekProgress}
            help={`${weekCompletion} من ${COURSE_TOTALS.daysPerWeek} أيام`}
          />
        </section>

        <div className="jl-top-actions">
          <div className="jl-breadcrumbs" aria-label="مسار التنقل">
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

            <button
              type="button"
              className="jl-crumb"
              onClick={() => setStage("lesson")}
              disabled={stage !== "lesson"}
            >
              {selectedDay.label}
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
            <section className="jl-month-grid" aria-label="اختيار الشهر">
              {courseMap.map((month) => {
                const state = monthState(month);
                const selected = month.monthIndex === selectedMonthIndex;
                const monthDone = countCompletedInMonth(completedSet, month.monthIndex);
                const monthPercent = (monthDone / COURSE_TOTALS.daysPerMonth) * 100;

                return (
                  <button
                    key={month.id}
                    type="button"
                    className={`jl-month-card jl-month-card--${state} ${selected ? "jl-month-card--selected" : ""}`}
                    onClick={() => handleMonthClick(month)}
                    disabled={state === "locked"}
                    aria-label={`${month.title} ${stateLabels[state]}`}
                  >
                    <div className="jl-month-top">
                      <StatusMark state={state} />
                      <span className="jl-index">{month.monthIndex}</span>
                    </div>

                    <h3>{month.title}</h3>
                    <p>{month.subtitle}</p>

                    <div className="jl-card-foot">
                      <span>{stateLabels[state]}</span>
                      <span>{arabicPercent(monthPercent)}</span>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {stage === "weeks" && (
            <section className="jl-weeks-grid" aria-label="اختيار الأسبوع">
              {selectedMonth.weeks.map((week) => {
                const state = weekState(week);
                const selected = week.weekIndex === selectedWeekIndex;
                const done = countCompletedInWeek(completedSet, week.monthIndex, week.weekIndex);
                const percent = (done / COURSE_TOTALS.daysPerWeek) * 100;

                return (
                  <button
                    key={week.id}
                    type="button"
                    className={`jl-week-card jl-week-card--${state} ${selected ? "jl-week-card--selected" : ""}`}
                    onClick={() => handleWeekClick(week)}
                    disabled={state === "locked"}
                    aria-label={`${week.title} ${stateLabels[state]}`}
                  >
                    <div className="jl-week-top">
                      <StatusMark state={state} />
                      <span className="jl-index">0{week.weekIndex}</span>
                    </div>

                    <h3>{week.title}</h3>
                    <p>{week.subtitle}</p>

                    <div className="jl-card-foot">
                      <span>{done} من {COURSE_TOTALS.daysPerWeek} أيام</span>
                      <span>{arabicPercent(percent)}</span>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {stage === "days" && (
            <section className="jl-days-grid" aria-label="اختيار اليوم">
              {selectedWeek.days.map((day) => {
                const state = dayState(day);
                const selected = day.dayIndex === selectedDayIndex;

                return (
                  <button
                    key={day.id}
                    type="button"
                    className={`jl-day-card jl-day-card--${state} ${selected ? "jl-day-card--selected" : ""}`}
                    onClick={() => handleDayClick(day)}
                    disabled={state === "locked"}
                    aria-label={`${day.label} ${stateLabels[state]}`}
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
            <section className="jl-lesson-shell" aria-live="polite">
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