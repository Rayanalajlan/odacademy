import { COURSE_TOTALS, courseMap } from "../data/courseContent";

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function dayHasContent(day) {
  if (!day) return false;
  if (Array.isArray(day.quiz) && day.quiz.length) return true;
  if (typeof day.content === "string" && day.content.trim()) return true;
  if (Array.isArray(day.lesson) && day.lesson.length) return true;
  return false;
}

export function getActualJourneyDays(course = courseMap) {
  if (!Array.isArray(course)) return 0;

  return course.reduce((monthTotal, month) => {
    const weeks = Array.isArray(month?.weeks) ? month.weeks : [];

    return monthTotal + weeks.reduce((weekTotal, week) => {
      const days = Array.isArray(week?.days) ? week.days : [];
      return weekTotal + days.filter(dayHasContent).length;
    }, 0);
  }, 0);
}

export function getMonthContentDays(month) {
  const weeks = Array.isArray(month?.weeks) ? month.weeks : [];

  return weeks.reduce((total, week) => {
    const days = Array.isArray(week?.days) ? week.days : [];
    return total + days.filter(dayHasContent).length;
  }, 0);
}

export function getOfficialJourneyDays() {
  return safeNumber(COURSE_TOTALS?.totalDays, 168);
}

export function getOfficialMonthDays() {
  return safeNumber(COURSE_TOTALS?.daysPerMonth, 28);
}

export function toOfficialCompletedDays(
  completedDays,
  {
    actualDays = getActualJourneyDays(),
    officialDays = getOfficialJourneyDays()
  } = {}
) {
  const actual = Math.max(1, safeNumber(actualDays, officialDays));
  const official = Math.max(1, safeNumber(officialDays, actual));
  const completed = Math.max(0, Math.min(actual, safeNumber(completedDays, 0)));

  if (completed >= actual) return official;

  return Math.min(official, Math.floor((completed / actual) * official));
}

export function toOfficialMonthCompletedDays(completedDays, month) {
  return toOfficialCompletedDays(completedDays, {
    actualDays: getMonthContentDays(month),
    officialDays: getOfficialMonthDays()
  });
}
