import { learningJourneyData, learningJourneyMeta } from "./learningJourneyData";

/*
  ملف توافق وسيط
  الهدف منه أن يبقى باقي الموقع يستخدم:
  import { courseMap, COURSE_TOTALS } from "./data/courseContent";
  بينما مصدر البيانات الحقيقي هو learningJourneyData.js
*/

export const courseMap = learningJourneyData;

export const COURSE_TOTALS = {
  months: learningJourneyMeta?.months ?? 6,
  weeks: learningJourneyMeta?.weeks ?? 24,
  days: learningJourneyMeta?.days ?? 168,
  questions: learningJourneyMeta?.questions ?? 504,
  gradedQuestions: learningJourneyMeta?.gradedQuestions ?? 483,

  totalMonths: learningJourneyMeta?.months ?? 6,
  totalWeeks: learningJourneyMeta?.weeks ?? 24,
  totalDays: learningJourneyMeta?.days ?? 168,
  totalQuestions: learningJourneyMeta?.questions ?? 504,
  totalGradedQuestions: learningJourneyMeta?.gradedQuestions ?? 483,
};

export const LEARNING_JOURNEY_META = learningJourneyMeta;
export const LEARNING_JOURNEY_DATA = learningJourneyData;

export function getAllMonths() {
  return learningJourneyData || [];
}

export function getAllWeeks() {
  return (learningJourneyData || []).flatMap((month) =>
    (month.weeks || []).map((week) => ({
      ...week,
      monthId: month.id,
      monthNumber: month.number,
      monthLabel: month.label,
      monthTitle: month.title,
    }))
  );
}

export function getAllDays() {
  return (learningJourneyData || []).flatMap((month) =>
    (month.weeks || []).flatMap((week) =>
      (week.days || []).map((day) => ({
        ...day,
        monthId: month.id,
        monthNumber: month.number,
        monthLabel: month.label,
        monthTitle: month.title,
        weekId: week.id,
        weekNumber: week.number,
        weekLabel: week.label,
        weekTitle: week.title,
      }))
    )
  );
}

export function getAllQuestions() {
  return getAllDays().flatMap((day) =>
    (day.quiz || []).map((question) => ({
      ...question,
      dayId: day.id,
      dayNumber: day.number,
      dayLabel: day.label,
      dayTitle: day.title,
      weekId: day.weekId,
      weekNumber: day.weekNumber,
      weekLabel: day.weekLabel,
      weekTitle: day.weekTitle,
      monthId: day.monthId,
      monthNumber: day.monthNumber,
      monthLabel: day.monthLabel,
      monthTitle: day.monthTitle,
    }))
  );
}

export function getMonthById(monthId) {
  return (learningJourneyData || []).find((month) => month.id === monthId) || null;
}

export function getWeekById(weekId) {
  for (const month of learningJourneyData || []) {
    const week = (month.weeks || []).find((item) => item.id === weekId);
    if (week) {
      return {
        ...week,
        monthId: month.id,
        monthNumber: month.number,
        monthLabel: month.label,
        monthTitle: month.title,
      };
    }
  }

  return null;
}

export function getDayById(dayId) {
  for (const month of learningJourneyData || []) {
    for (const week of month.weeks || []) {
      const day = (week.days || []).find((item) => item.id === dayId);
      if (day) {
        return {
          ...day,
          monthId: month.id,
          monthNumber: month.number,
          monthLabel: month.label,
          monthTitle: month.title,
          weekId: week.id,
          weekNumber: week.number,
          weekLabel: week.label,
          weekTitle: week.title,
        };
      }
    }
  }

  return null;
}

export function getWeekDays(weekId) {
  const week = getWeekById(weekId);
  return week?.days || [];
}

export function getMonthWeeks(monthId) {
  const month = getMonthById(monthId);
  return month?.weeks || [];
}

export function getDayIndex(dayId) {
  return getAllDays().findIndex((day) => day.id === dayId);
}

export function getNextDay(dayId) {
  const days = getAllDays();
  const index = days.findIndex((day) => day.id === dayId);
  if (index === -1 || index === days.length - 1) return null;
  return days[index + 1];
}

export function getPreviousDay(dayId) {
  const days = getAllDays();
  const index = days.findIndex((day) => day.id === dayId);
  if (index <= 0) return null;
  return days[index - 1];
}

export function getJourneyStats() {
  const months = getAllMonths();
  const weeks = getAllWeeks();
  const days = getAllDays();
  const questions = getAllQuestions();

  return {
    monthsCount: months.length,
    weeksCount: weeks.length,
    daysCount: days.length,
    questionsCount: questions.length,
    officialMonthsCount: COURSE_TOTALS.months,
    officialWeeksCount: COURSE_TOTALS.weeks,
    officialDaysCount: COURSE_TOTALS.days,
    officialQuestionsCount: COURSE_TOTALS.questions,
    officialGradedQuestionsCount: COURSE_TOTALS.gradedQuestions,
  };
}

export function calculateProgress(completedDayIds = []) {
  const totalDays = COURSE_TOTALS.days || getAllDays().length || 168;
  const completedCount = Array.isArray(completedDayIds)
    ? new Set(completedDayIds).size
    : 0;

  const percentage = totalDays > 0
    ? Math.round((completedCount / totalDays) * 100)
    : 0;

  return {
    totalDays,
    completedDays: completedCount,
    remainingDays: Math.max(totalDays - completedCount, 0),
    percentage: Math.min(Math.max(percentage, 0), 100),
    isCompleted: completedCount >= totalDays,
  };
}

export function isJourneyCompleted(completedDayIds = []) {
  return calculateProgress(completedDayIds).isCompleted;
}

export default learningJourneyData;