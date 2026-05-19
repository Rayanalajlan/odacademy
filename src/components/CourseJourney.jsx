import { useEffect, useMemo, useState } from "react";
import { courseMap, COURSE_TOTALS } from "../data/courseContent";
import { markDayOpened, updateUserProgress } from "../lib/progressService";

const stateLabels = {
  locked: "مقفل",
  active: "متاح",
  completed: "مكتمل"
};

function progressKey(monthIndex, weekIndex, dayIndex) {
  return `${monthIndex}-${weekIndex}-${dayIndex}`;
}

function arabicPercent(value) {
  return `${Math.round(value)}٪`;
}

function ProgressBar({ label, value, help }) {
  return (
    <div className="progress-card">
      <div className="progress-header">
        <span>{label}</span>
        <strong>{arabicPercent(value)}</strong>
      </div>
      <div className="progress-track" aria-label={label}>
        <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      {help && <small>{help}</small>}
    </div>
  );
}

function StatusIcon({ state }) {
  if (state === "completed") return <span className="status-icon status-icon--completed">✓</span>;
  if (state === "locked") return <span className="status-icon status-icon--locked">🔒</span>;
  return <span className="status-icon status-icon--active">●</span>;
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
      if (day.dayIndex === 1) return !completedSet.has(progressKey(day.monthIndex, day.weekIndex, day.dayIndex));
      const previousKey = progressKey(day.monthIndex, day.weekIndex, day.dayIndex - 1);
      const currentKey = progressKey(day.monthIndex, day.weekIndex, day.dayIndex);
      return completedSet.has(previousKey) && !completedSet.has(currentKey);
    }) || contentDays[contentDays.length - 1]
  );
}

export default function CourseJourney({ progressRows, setProgressRows, loading }) {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(1);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const completedSet = useMemo(() => calculateCompletedSet(progressRows), [progressRows]);
  const selectedMonth = courseMap.find((month) => month.monthIndex === selectedMonthIndex) || courseMap[0];
  const selectedWeek = selectedMonth.weeks.find((week) => week.weekIndex === selectedWeekIndex) || selectedMonth.weeks[0];
  const selectedDay = selectedWeek.days.find((day) => day.dayIndex === selectedDayIndex) || selectedWeek.days[0];

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
    const previousWeekIndex = week.weekIndex - 1;
    const previousWeek = monthContext.weeks.find((item) => item.weekIndex === previousWeekIndex);
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
    return { month: fallbackMonth, week: fallbackWeek, day: firstAvailableDay(fallbackWeek, completedSet) };
  }

  useEffect(() => {
    const nextPoint = firstAvailableLearningPoint();
    setSelectedMonthIndex(nextPoint.month.monthIndex);
    setSelectedWeekIndex(nextPoint.week.weekIndex);
    setSelectedDayIndex(nextPoint.day.dayIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressRows.length]);

  useEffect(() => {
    if (!selectedDay?.content) return;
    markDayOpened({
      monthIndex: selectedDay.monthIndex,
      weekIndex: selectedDay.weekIndex,
      dayIndex: selectedDay.dayIndex
    }).catch(() => undefined);
  }, [selectedDay?.id]);

  function handleMonthClick(month) {
    if (!isMonthUnlocked(month)) return;
    const availableWeek = firstRelevantWeekInMonth(month);
    const availableDay = firstAvailableDay(availableWeek, completedSet);
    setSelectedMonthIndex(month.monthIndex);
    setSelectedWeekIndex(availableWeek.weekIndex);
    setSelectedDayIndex(availableDay.dayIndex);
  }

  function handleWeekClick(week) {
    if (!isWeekUnlocked(week)) return;
    const availableDay = firstAvailableDay(week, completedSet);
    setSelectedWeekIndex(week.weekIndex);
    setSelectedDayIndex(availableDay.dayIndex);
  }

  function handleDayClick(day) {
    if (!isDayUnlocked(day)) return;
    setSelectedDayIndex(day.dayIndex);
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
      setNotice("تم حفظ تقدمك بنجاح.");
    } catch (error) {
      setNotice(error.message || "تعذر حفظ التقدم.");
    } finally {
      setSaving(false);
    }
  }

  const monthCompletion = countCompletedInMonth(completedSet, selectedMonth.monthIndex);
  const weekCompletion = countCompletedInWeek(completedSet, selectedMonth.monthIndex, selectedWeek.weekIndex);
  const monthProgress = (monthCompletion / COURSE_TOTALS.daysPerMonth) * 100;
  const weekProgress = (weekCompletion / COURSE_TOTALS.daysPerWeek) * 100;
  const currentDayState = dayState(selectedDay);

  return (
    <section className="page-shell">
      <div className="section-hero">
        <span className="eyebrow">رحلتك التعليمية</span>
        <h2>مسار التطوير التنظيمي الكامل خلال 6 أشهر</h2>
        <p>
          تنقّل هرمي من الشهر إلى الأسبوع ثم اليوم، مع حفظ التقدم وربط الحالة البصرية ببيانات Supabase أو التخزين المحلي.
        </p>
      </div>

      <section className="progress-grid" aria-label="مؤشرات التقدم">
        <ProgressBar label={`تقدم ${selectedMonth.title}`} value={monthProgress} help={`${monthCompletion} من ${COURSE_TOTALS.daysPerMonth} يومًا`} />
        <ProgressBar label={`تقدم ${selectedWeek.title}`} value={weekProgress} help={`${weekCompletion} من ${COURSE_TOTALS.daysPerWeek} أيام`} />
      </section>

      {notice && <div className="notice">{notice}</div>}
      {loading && <div className="notice">جارٍ تحميل حالة الطالب...</div>}

      <section className="navigation-card">
        <div className="section-title">
          <span>المستوى الأول</span>
          <h2>الشهور</h2>
        </div>
        <div className="months-grid">
          {courseMap.map((month) => {
            const state = monthState(month);
            const selected = month.monthIndex === selectedMonthIndex;
            return (
              <button
                key={month.id}
                type="button"
                className={`nav-tile nav-tile--${state} ${selected ? "nav-tile--selected" : ""}`}
                onClick={() => handleMonthClick(month)}
                disabled={state === "locked"}
                aria-label={`${month.title} ${stateLabels[state]}`}
              >
                <StatusIcon state={state} />
                <span>{month.title}</span>
                <small>{month.subtitle}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="navigation-card animate-in">
        <div className="section-title">
          <span>المستوى الثاني</span>
          <h2>{selectedMonth.title}: الأسابيع</h2>
        </div>
        <div className="weeks-list">
          {selectedMonth.weeks.map((week) => {
            const state = weekState(week);
            const selected = week.weekIndex === selectedWeekIndex;
            return (
              <button
                key={week.id}
                type="button"
                className={`week-row week-row--${state} ${selected ? "week-row--selected" : ""}`}
                onClick={() => handleWeekClick(week)}
                disabled={state === "locked"}
              >
                <StatusIcon state={state} />
                <span>{week.title}</span>
                <small>{week.subtitle}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="navigation-card animate-in">
        <div className="section-title">
          <span>المستوى الثالث</span>
          <h2>{selectedWeek.title}: الأيام</h2>
        </div>
        <div className="timeline" aria-label="أيام الأسبوع">
          {selectedWeek.days.map((day) => {
            const state = dayState(day);
            const selected = day.dayIndex === selectedDayIndex;
            return (
              <button
                key={day.id}
                type="button"
                className={`day-node day-node--${state} ${selected ? "day-node--selected" : ""}`}
                onClick={() => handleDayClick(day)}
                disabled={state === "locked"}
                aria-label={`${day.label} ${stateLabels[state]}`}
              >
                <span>{state === "completed" ? "✓" : state === "locked" ? "🔒" : day.dayIndex}</span>
                <small>{day.label}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="content-container animate-in" aria-live="polite">
        <div className="content-toolbar">
          <div>
            <span className={`pill pill--${currentDayState}`}>{stateLabels[currentDayState]}</span>
            <h2>{selectedDay.title}</h2>
          </div>
          <button
            type="button"
            className="complete-button"
            onClick={completeCurrentDay}
            disabled={saving || currentDayState === "locked" || currentDayState === "completed"}
          >
            {currentDayState === "completed" ? "تم الإكمال" : saving ? "جارٍ الحفظ..." : "إنهاء اليوم"}
          </button>
        </div>

        {selectedWeek.intro && selectedDay.dayIndex === 1 && (
          <article className="week-intro">{selectedWeek.intro}</article>
        )}

        {selectedDay.content ? (
          <article className="content-body">{selectedDay.content}</article>
        ) : (
          <article className="empty-content">هذا المحتوى غير متاح بعد.</article>
        )}
      </section>
    </section>
  );
}
