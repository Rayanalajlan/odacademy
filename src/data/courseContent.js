import { learningJourneyData, learningJourneyMeta } from "./learningJourneyData";

/*
  courseContent.js
  ملف ربط آمن بين ملف المحتوى الكامل learningJourneyData.js
  وبين واجهة قسم "رحلتك التعليمية".

  هذا الملف يعالج:
  - مشكلة NaN
  - مشكلة undefined أيام
  - مشكلة قفل أول شهر
  - حساب تقدم الشهر والأسبوع واليوم
  - تجهيز بيانات جاهزة للعرض المتدرج: شهر ← أسبوع ← يوم ← درس
  - دعم فتح وثيقة الإتقان فقط بعد اكتمال 168 يومًا
*/

const RAW_MONTHS = Array.isArray(learningJourneyData) ? learningJourneyData : [];

export const STORAGE_KEYS = {
  progress: "odacademy_learning_progress_v1",
  lastDay: "odacademy_last_opened_day_v1",
  learningSeconds: "odacademy_learning_seconds_v1",
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function uniqueArray(items) {
  return Array.from(new Set(safeArray(items).filter(Boolean)));
}

function countMonthDays(month) {
  return safeArray(month.weeks).reduce((total, week) => {
    return total + safeArray(week.days).length;
  }, 0);
}

function countQuestionsInDay(day) {
  return safeArray(day.quiz).length;
}

function countWeekQuestions(week) {
  return safeArray(week.days).reduce((total, day) => {
    return total + countQuestionsInDay(day);
  }, 0);
}

function countMonthQuestions(month) {
  return safeArray(month.weeks).reduce((total, week) => {
    return total + countWeekQuestions(week);
  }, 0);
}

function normalizeQuiz(day) {
  return safeArray(day.quiz).map((question, index) => {
    const options = safeArray(question.options).map((option, optionIndex) => ({
      id: `${day.id}-q${index + 1}-o${optionIndex + 1}`,
      letter: option.letter || ["A", "B", "C", "D"][optionIndex] || String(optionIndex + 1),
      text: option.text || "",
      isCorrectSource: Boolean(option.isCorrectSource),
    }));

    return {
      id: `${day.id}-q${question.number || index + 1}`,
      number: question.number || index + 1,
      question: question.question || "",
      options,
      correctLetter: question.correctLetter || null,
      hasAnswerKey: Boolean(question.correctLetter),
    };
  });
}

function normalizeJourney() {
  let globalWeekIndex = 0;
  let globalDayIndex = 0;

  return RAW_MONTHS.map((month, monthIndex) => {
    const monthWeeks = safeArray(month.weeks);
    const normalizedWeeks = monthWeeks.map((week, weekIndex) => {
      globalWeekIndex += 1;

      const weekDays = safeArray(week.days);
      const normalizedDays = weekDays.map((day, dayIndex) => {
        globalDayIndex += 1;

        const normalizedDay = {
          ...day,

          id: day.id || `m${monthIndex + 1}w${weekIndex + 1}d${dayIndex + 1}`,
          number: safeNumber(day.number, dayIndex + 1),
          label: day.label || `اليوم ${dayIndex + 1}`,
          title: day.title || "درس اليوم",

          monthId: month.id || `m${monthIndex + 1}`,
          monthNumber: safeNumber(month.number, monthIndex + 1),
          monthLabel: month.label || `الشهر ${monthIndex + 1}`,
          monthTitle: month.title || "",

          weekId: week.id || `m${monthIndex + 1}w${weekIndex + 1}`,
          weekNumber: safeNumber(week.number, weekIndex + 1),
          weekLabel: week.label || `الأسبوع ${weekIndex + 1}`,
          weekTitle: week.title || "",

          globalDayIndex,
          lesson: safeArray(day.lesson),
          quiz: normalizeQuiz(day),
          totalQuestions: countQuestionsInDay(day),

          // حالة فتح افتراضية حتى لا يكون كل شيء مقفلًا عند أول دخول
          unlocked: globalDayIndex === 1,
          locked: globalDayIndex !== 1,

          completed: false,
          progress: 0,
        };

        return normalizedDay;
      });

      return {
        ...week,

        id: week.id || `m${monthIndex + 1}w${weekIndex + 1}`,
        number: safeNumber(week.number, weekIndex + 1),
        label: week.label || `الأسبوع ${weekIndex + 1}`,
        title: week.title || "",

        monthId: month.id || `m${monthIndex + 1}`,
        monthNumber: safeNumber(month.number, monthIndex + 1),
        monthLabel: month.label || `الشهر ${monthIndex + 1}`,
        monthTitle: month.title || "",

        globalWeekIndex,
        days: normalizedDays,
        totalDays: normalizedDays.length,
        dayCount: normalizedDays.length,
        totalQuestions: normalizedDays.reduce((total, day) => total + day.totalQuestions, 0),

        unlocked: globalWeekIndex === 1,
        locked: globalWeekIndex !== 1,

        completed: false,
        progress: 0,
      };
    });

    const monthDays = normalizedWeeks.flatMap((week) => week.days);

    return {
      ...month,

      id: month.id || `m${monthIndex + 1}`,
      number: safeNumber(month.number, monthIndex + 1),
      label: month.label || `الشهر ${monthIndex + 1}`,
      title: month.title || "",

      weeks: normalizedWeeks,
      days: monthDays,

      totalWeeks: normalizedWeeks.length,
      weekCount: normalizedWeeks.length,
      totalDays: monthDays.length,
      dayCount: monthDays.length,
      totalQuestions: normalizedWeeks.reduce((total, week) => total + week.totalQuestions, 0),

      unlocked: monthIndex === 0,
      locked: monthIndex !== 0,

      completed: false,
      progress: 0,
    };
  });
}

export const courseMap = normalizeJourney();

export const COURSE_TOTALS = {
  months: safeNumber(learningJourneyMeta?.months, courseMap.length || 6),
  weeks: safeNumber(
    learningJourneyMeta?.weeks,
    courseMap.reduce((total, month) => total + safeArray(month.weeks).length, 0) || 24
  ),
  days: safeNumber(
    learningJourneyMeta?.days,
    courseMap.reduce((total, month) => total + safeNumber(month.totalDays), 0) || 168
  ),
  questions: safeNumber(
    learningJourneyMeta?.questions,
    courseMap.reduce((total, month) => total + safeNumber(month.totalQuestions), 0) || 504
  ),
  gradedQuestions: safeNumber(learningJourneyMeta?.gradedQuestions, 483),

  totalMonths: safeNumber(learningJourneyMeta?.months, courseMap.length || 6),
  totalWeeks: safeNumber(learningJourneyMeta?.weeks, 24),
  totalDays: safeNumber(learningJourneyMeta?.days, 168),
  totalQuestions: safeNumber(learningJourneyMeta?.questions, 504),
  totalGradedQuestions: safeNumber(learningJourneyMeta?.gradedQuestions, 483),
};

export const learningJourneyTotals = COURSE_TOTALS;

export function getAllMonths() {
  return courseMap;
}

export function getAllWeeks() {
  return courseMap.flatMap((month) => safeArray(month.weeks));
}

export function getAllDays() {
  return courseMap.flatMap((month) =>
    safeArray(month.weeks).flatMap((week) => safeArray(week.days))
  );
}

export function getAllQuestions() {
  return getAllDays().flatMap((day) =>
    safeArray(day.quiz).map((question) => ({
      ...question,
      dayId: day.id,
      dayTitle: day.title,
      weekId: day.weekId,
      weekTitle: day.weekTitle,
      monthId: day.monthId,
      monthTitle: day.monthTitle,
    }))
  );
}

export function getMonthById(monthId) {
  return courseMap.find((month) => month.id === monthId) || null;
}

export function getWeekById(weekId) {
  return getAllWeeks().find((week) => week.id === weekId) || null;
}

export function getDayById(dayId) {
  return getAllDays().find((day) => day.id === dayId) || null;
}

export function getFirstDay() {
  return getAllDays()[0] || null;
}

export function getLastDay() {
  const days = getAllDays();
  return days[days.length - 1] || null;
}

export function getDayIndex(dayId) {
  return getAllDays().findIndex((day) => day.id === dayId);
}

export function getPreviousDay(dayId) {
  const days = getAllDays();
  const index = days.findIndex((day) => day.id === dayId);
  if (index <= 0) return null;
  return days[index - 1] || null;
}

export function getNextDay(dayId) {
  const days = getAllDays();
  const index = days.findIndex((day) => day.id === dayId);
  if (index === -1 || index >= days.length - 1) return null;
  return days[index + 1] || null;
}

export function createEmptyProgress() {
  return {
    completedDayIds: [],
    quizScores: {},
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function readProgressFromStorage() {
  if (typeof window === "undefined") return createEmptyProgress();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.progress);
    if (!raw) return createEmptyProgress();

    const parsed = JSON.parse(raw);

    return {
      completedDayIds: uniqueArray(parsed.completedDayIds),
      quizScores: parsed.quizScores && typeof parsed.quizScores === "object" ? parsed.quizScores : {},
      startedAt: parsed.startedAt || new Date().toISOString(),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgressToStorage(progress) {
  if (typeof window === "undefined") return;

  const safeProgress = {
    completedDayIds: uniqueArray(progress?.completedDayIds),
    quizScores: progress?.quizScores && typeof progress.quizScores === "object" ? progress.quizScores : {},
    startedAt: progress?.startedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(safeProgress));
}

export function calculateProgress(completedDayIds = []) {
  const completed = uniqueArray(completedDayIds);
  const totalDays = COURSE_TOTALS.totalDays || getAllDays().length || 168;
  const completedDays = completed.length;
  const remainingDays = Math.max(totalDays - completedDays, 0);
  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return {
    totalDays,
    completedDays,
    remainingDays,
    percentage: Math.min(Math.max(percentage, 0), 100),
    isCompleted: completedDays >= totalDays,
  };
}

export function calculateMonthProgress(monthId, completedDayIds = []) {
  const month = getMonthById(monthId);
  if (!month) {
    return {
      totalDays: 0,
      completedDays: 0,
      percentage: 0,
      isCompleted: false,
    };
  }

  const completedSet = new Set(uniqueArray(completedDayIds));
  const totalDays = safeNumber(month.totalDays, safeArray(month.days).length);
  const completedDays = safeArray(month.days).filter((day) => completedSet.has(day.id)).length;
  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return {
    totalDays,
    completedDays,
    percentage: Math.min(Math.max(percentage, 0), 100),
    isCompleted: totalDays > 0 && completedDays >= totalDays,
  };
}

export function calculateWeekProgress(weekId, completedDayIds = []) {
  const week = getWeekById(weekId);
  if (!week) {
    return {
      totalDays: 0,
      completedDays: 0,
      percentage: 0,
      isCompleted: false,
    };
  }

  const completedSet = new Set(uniqueArray(completedDayIds));
  const totalDays = safeNumber(week.totalDays, safeArray(week.days).length);
  const completedDays = safeArray(week.days).filter((day) => completedSet.has(day.id)).length;
  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return {
    totalDays,
    completedDays,
    percentage: Math.min(Math.max(percentage, 0), 100),
    isCompleted: totalDays > 0 && completedDays >= totalDays,
  };
}

export function isDayCompleted(dayId, completedDayIds = []) {
  return uniqueArray(completedDayIds).includes(dayId);
}

export function isDayUnlocked(dayId, completedDayIds = []) {
  const days = getAllDays();
  const index = days.findIndex((day) => day.id === dayId);

  if (index === -1) return false;
  if (index === 0) return true;

  const previousDay = days[index - 1];
  return isDayCompleted(previousDay.id, completedDayIds);
}

export function isWeekUnlocked(weekId, completedDayIds = []) {
  const week = getWeekById(weekId);
  if (!week) return false;

  const weeks = getAllWeeks();
  const index = weeks.findIndex((item) => item.id === weekId);

  if (index === -1) return false;
  if (index === 0) return true;

  const previousWeek = weeks[index - 1];
  return calculateWeekProgress(previousWeek.id, completedDayIds).isCompleted;
}

export function isMonthUnlocked(monthId, completedDayIds = []) {
  const month = getMonthById(monthId);
  if (!month) return false;

  const months = getAllMonths();
  const index = months.findIndex((item) => item.id === monthId);

  if (index === -1) return false;
  if (index === 0) return true;

  const previousMonth = months[index - 1];
  return calculateMonthProgress(previousMonth.id, completedDayIds).isCompleted;
}

export function markDayCompleted(dayId) {
  const progress = readProgressFromStorage();
  const completedDayIds = uniqueArray([...progress.completedDayIds, dayId]);

  const updated = {
    ...progress,
    completedDayIds,
    updatedAt: new Date().toISOString(),
  };

  saveProgressToStorage(updated);
  return updated;
}

export function unmarkDayCompleted(dayId) {
  const progress = readProgressFromStorage();
  const completedDayIds = uniqueArray(progress.completedDayIds).filter((id) => id !== dayId);

  const updated = {
    ...progress,
    completedDayIds,
    updatedAt: new Date().toISOString(),
  };

  saveProgressToStorage(updated);
  return updated;
}

export function saveLastOpenedDay(dayId) {
  if (typeof window === "undefined") return;
  if (!dayId) return;
  window.localStorage.setItem(STORAGE_KEYS.lastDay, dayId);
}

export function getLastOpenedDay() {
  if (typeof window === "undefined") return getFirstDay();

  const savedId = window.localStorage.getItem(STORAGE_KEYS.lastDay);
  const savedDay = savedId ? getDayById(savedId) : null;

  return savedDay || getFirstDay();
}

export function getJourneyWithProgress(completedDayIds = []) {
  const completedSet = new Set(uniqueArray(completedDayIds));

  return courseMap.map((month) => {
    const monthProgress = calculateMonthProgress(month.id, completedDayIds);

    const weeks = safeArray(month.weeks).map((week) => {
      const weekProgress = calculateWeekProgress(week.id, completedDayIds);

      const days = safeArray(week.days).map((day) => {
        const completed = completedSet.has(day.id);
        const unlocked = isDayUnlocked(day.id, completedDayIds);

        return {
          ...day,
          completed,
          unlocked,
          locked: !unlocked,
          progress: completed ? 100 : 0,
        };
      });

      const weekUnlocked = isWeekUnlocked(week.id, completedDayIds);

      return {
        ...week,
        days,
        completed: weekProgress.isCompleted,
        unlocked: weekUnlocked,
        locked: !weekUnlocked,
        progress: weekProgress.percentage,
        completedDays: weekProgress.completedDays,
        totalDays: weekProgress.totalDays,
      };
    });

    const monthUnlocked = isMonthUnlocked(month.id, completedDayIds);

    return {
      ...month,
      weeks,
      days: weeks.flatMap((week) => week.days),
      completed: monthProgress.isCompleted,
      unlocked: monthUnlocked,
      locked: !monthUnlocked,
      progress: monthProgress.percentage,
      completedDays: monthProgress.completedDays,
      totalDays: monthProgress.totalDays,
    };
  });
}

export function getCurrentLearningState() {
  const progress = readProgressFromStorage();
  const completedDayIds = uniqueArray(progress.completedDayIds);
  const journeyProgress = calculateProgress(completedDayIds);
  const journey = getJourneyWithProgress(completedDayIds);

  const firstUnlockedIncompleteDay =
    getAllDays().find((day) => {
      return isDayUnlocked(day.id, completedDayIds) && !isDayCompleted(day.id, completedDayIds);
    }) || getLastDay();

  return {
    progress,
    completedDayIds,
    journeyProgress,
    journey,
    currentDay: firstUnlockedIncompleteDay,
    canIssueMasteryDocument: journeyProgress.isCompleted,
  };
}

export function canIssueMasteryDocument(completedDayIds = []) {
  return calculateProgress(completedDayIds).isCompleted;
}

export function resetLearningProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.progress);
  window.localStorage.removeItem(STORAGE_KEYS.lastDay);
}

export default courseMap;