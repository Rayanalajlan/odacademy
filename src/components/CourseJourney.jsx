import { useEffect, useMemo, useState } from "react";
import { courseMap as rawCourseMap, COURSE_TOTALS } from "../data/courseContent";
import { markDayOpened, updateUserProgress } from "../lib/progressService";
import LessonNotesPanel from "./LessonNotesPanel";
import CourseSearch from "./CourseSearch";
import SavedLessonsPanel from "./SavedLessonsPanel";
import NeoMetricGauge from "./NeoMetricGauge";
import {
  deleteLessonBookmarkByLocation,
  listLessonBookmarks,
  saveLessonBookmark
} from "../lib/lessonBookmarkService";

const stateLabels = {
  locked: "Ù…Ù‚ÙÙ„",
  active: "Ù…ØªØ§Ø­",
  completed: "Ù…ÙƒØªÙ…Ù„"
};

const stageMeta = {
  months: {
    kicker: "Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø±Ø­Ù„Ø©",
    title: "Ø§Ø®ØªØ± Ø§Ù„Ø´Ù‡Ø±",
    note: "Ù„Ø§ ÙŠØ¸Ù‡Ø± Ù„Ùƒ ÙƒÙ„ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø¯ÙØ¹Ø© ÙˆØ§Ø­Ø¯Ø©. Ø§Ø¨Ø¯Ø£ Ø¨Ø§Ù„Ø´Ù‡Ø±ØŒ Ø«Ù… Ø§ÙØªØ­ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ØŒ Ø«Ù… Ø§Ù„ÙŠÙˆÙ…ØŒ Ø«Ù… Ø§Ù„Ø¯Ø±Ø³ ÙˆØ§Ù„Ø§Ø®ØªØ¨Ø§Ø±.",
    quote: "Ù„Ø§ ØªØ¨Ø¯Ø£ Ø¨Ø§Ù„Ø­Ù„. Ø§ÙÙ‡Ù… Ø§Ù„Ù†Ø¸Ø§Ù… Ø£ÙˆÙ„Ù‹Ø§."
  },
  weeks: {
    kicker: "Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ø´Ù‡Ø±",
    title: "Ø§Ø®ØªØ± Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹",
    note: "ÙƒÙ„ Ø£Ø³Ø¨ÙˆØ¹ Ø¨ÙˆØ§Ø¨Ø© Ù…Ø¹Ø±ÙÙŠØ© Ù…Ø³ØªÙ‚Ù„Ø©. Ù„Ø§ ØªÙ†ØªÙ‚Ù„ Ù„Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„ØªØ§Ù„ÙŠØ© Ø¥Ù„Ø§ Ø¨Ø¹Ø¯ Ø¥ÙƒÙ…Ø§Ù„ Ù…Ø§ Ù‚Ø¨Ù„Ù‡Ø§.",
    quote: "Ø§Ù„Ø¥ØªÙ‚Ø§Ù† Ù„ÙŠØ³ Ø³Ø±Ø¹Ø© Ø§Ù„ÙˆØµÙˆÙ„Ø› Ø¨Ù„ Ø¬ÙˆØ¯Ø© Ø§Ù„Ø¹Ø¨ÙˆØ±."
  },
  days: {
    kicker: "Ù…Ø³Ø§Ø± Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹",
    title: "Ø§Ø®ØªØ± Ø§Ù„ÙŠÙˆÙ…",
    note: "ÙƒÙ„ Ø£Ø³Ø¨ÙˆØ¹ ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø³Ø¨Ø¹Ø© Ø£ÙŠØ§Ù… ØªØ¹Ù„ÙŠÙ…ÙŠØ©. ÙƒÙ„ ÙŠÙˆÙ… ÙŠÙØªØ­ Ø¨Ø¹Ø¯ Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„ÙŠÙˆÙ… Ø§Ù„Ø³Ø§Ø¨Ù‚.",
    quote: "Ø§Ù„ÙŠÙˆÙ… Ø§Ù„ØµØºÙŠØ± Ø§Ù„Ù…ØªÙ‚Ù† ÙŠØµÙ†Ø¹ Ø¹Ù‚Ù„Ù‹Ø§ Ù…Ù‡Ù†ÙŠÙ‹Ø§ ÙƒØ¨ÙŠØ±Ù‹Ø§."
  },
  lesson: {
    kicker: "ØºØ±ÙØ© Ø§Ù„Ø¯Ø±Ø³ ÙˆØ§Ù„Ø§Ø®ØªØ¨Ø§Ø±",
    title: "Ø§Ù‚Ø±Ø£ Ø§Ù„Ø¯Ø±Ø³ Ø«Ù… Ø§Ø®ØªØ¨Ø± ÙÙ‡Ù…Ùƒ",
    note: "Ø§Ù„Ø¯Ø±Ø³ Ù…Ù†Ø³Ù‚ Ø¥Ù„Ù‰ ÙÙ‚Ø±Ø§Øª ÙˆØ£Ù‚Ø³Ø§Ù…ØŒ Ø«Ù… ÙŠØ£ØªÙŠ Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ÙŠÙˆÙ… Ø¨Ø«Ù„Ø§Ø«Ø© Ø£Ø³Ø¦Ù„Ø© Ù…ØªØ¹Ø¯Ø¯Ø© Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª.",
    quote: "Ù„Ø§ ØªØ­ÙØ¸ Ø§Ù„Ù†ØµØ› Ø§Ø³ØªØ®Ø±Ø¬ Ù…Ù†Ù‡ Ø­ÙƒÙ…Ù‹Ø§ Ù…Ù‡Ù†ÙŠÙ‹Ø§."
  }
};

const ARABIC_ORDINAL = {
  1: "Ø§Ù„Ø£ÙˆÙ„",
  2: "Ø§Ù„Ø«Ø§Ù†ÙŠ",
  3: "Ø§Ù„Ø«Ø§Ù„Ø«",
  4: "Ø§Ù„Ø±Ø§Ø¨Ø¹",
  5: "Ø§Ù„Ø®Ø§Ù…Ø³",
  6: "Ø§Ù„Ø³Ø§Ø¯Ø³",
  7: "Ø§Ù„Ø³Ø§Ø¨Ø¹"
};

const HEADING_PHRASES = [
  "Ø§Ù„ÙÙƒØ±Ø© Ø§Ù„Ù…Ø±ÙƒØ²ÙŠØ©",
  "Ù…Ø§ Ø§Ù„Ù…Ù‚ØµÙˆØ¯ Ø¨Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠØŸ",
  "Ù„Ù…Ø§Ø°Ø§ Ù„Ø§ ØªØ¨Ø¯Ø£ Ø¨Ø§Ù„Ø­Ù„ØŸ",
  "Ø§Ù„ÙØ±Ù‚ Ø¨ÙŠÙ† Ø§Ù„Ø´ÙƒÙˆÙ‰ ÙˆØ§Ù„ÙØ±Ø¶ÙŠØ© ÙˆØ§Ù„Ø¯Ù„ÙŠÙ„",
  "Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„ÙŠÙˆÙ…",
  "ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„ÙŠÙˆÙ…",
  "Ø£Ø¯Ø§Ø© Ø§Ù„ÙŠÙˆÙ…",
  "Ù…Ø«Ø§Ù„ ØªØ·Ø¨ÙŠÙ‚ÙŠ",
  "Ù„Ù…Ø§Ø°Ø§ Ù‡Ø°Ø§ Ù…Ù‡Ù…ØŸ",
  "Ù…ØªÙ‰ Ù†Ø³ØªØ®Ø¯Ù…Ù‡ØŸ",
  "Ù…ØªÙ‰ Ù„Ø§ Ù†Ø³ØªØ®Ø¯Ù…Ù‡ØŸ",
  "Ø£Ø®Ø·Ø§Ø¡ Ø´Ø§Ø¦Ø¹Ø©",
  "Ù…ÙƒÙˆÙ†Ø§Øª Ø§Ù„Ø®Ø·Ø©",
  "Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ù†Ø¬Ø§Ø­",
  "Ø§Ù„Ù…Ù‡Ù…Ø© Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©",
  "Ø§Ù„Ø­ØµÙŠÙ„Ø© Ø§Ù„Ù…Ø¹Ø±ÙÙŠØ©",
  "Ø§Ù„Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ù…Ù‡Ù†ÙŠØ©",
  "Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©",
  "Ù…Ø®Ø§Ø·Ø± Ø§Ù„ØªØ·Ø¨ÙŠÙ‚",
  "Ø®Ø·Ø© Ø§Ù„ØªÙ†ÙÙŠØ°",
  "Ø®Ø·Ø© Ø§Ù„Ù‚ÙŠØ§Ø³",
  "Ø®Ø·Ø© Ø§Ù„Ø§Ø³ØªØ¯Ø§Ù…Ø©"
];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join("\n\n");
  if (value && typeof value === "object") {
    if (typeof value.text === "string") return value.text;
    if (typeof value.content === "string") return value.content;
    if (typeof value.body === "string") return value.body;
  }
  return "";
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function progressKey(monthIndex, weekIndex, dayIndex) {
  return `${monthIndex}-${weekIndex}-${dayIndex}`;
}

function arabicPercent(value) {
  const clean = Number.isFinite(value) ? value : 0;
  return `${Math.round(clean)}Ùª`;
}

function seededHash(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function seededShuffle(items, seedText) {
  const arr = [...items];
  let seed = seededHash(seedText || "od");
  for (let i = arr.length - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeCourse(raw = []) {
  if (!Array.isArray(raw)) return [];

  return raw.map((month, monthArrayIndex) => {
    const monthIndex = toNumber(
      month.monthIndex ?? month.month_index ?? month.index ?? month.number,
      monthArrayIndex + 1
    );

    const rawWeeks = Array.isArray(month.weeks)
      ? month.weeks
      : Array.isArray(month.children)
        ? month.children
        : Array.isArray(month.units)
          ? month.units
          : [];

    const weeks = rawWeeks.map((week, weekArrayIndex) => {
      const weekIndex = toNumber(
        week.weekIndex ?? week.week_index ?? week.index ?? week.number,
        weekArrayIndex + 1
      );

      const rawDays = Array.isArray(week.days)
        ? week.days
        : Array.isArray(week.lessons)
          ? week.lessons
          : Array.isArray(week.children)
            ? week.children
            : [];

      const days = rawDays.map((day, dayArrayIndex) => {
        const dayIndex = toNumber(
          day.dayIndex ?? day.day_index ?? day.index ?? day.number,
          dayArrayIndex + 1
        );

        const content = safeText(
          day.content ??
          day.lesson ??
          day.body ??
          day.text ??
          day.markdown ??
          ""
        );

        return {
          ...day,
          id: day.id || `m${monthIndex}-w${weekIndex}-d${dayIndex}`,
          monthIndex,
          weekIndex,
          dayIndex,
          label: day.label || `Ø§Ù„ÙŠÙˆÙ… ${ARABIC_ORDINAL[dayIndex] || dayIndex}`,
          title: day.title || day.name || `Ø§Ù„ÙŠÙˆÙ… ${ARABIC_ORDINAL[dayIndex] || dayIndex}`,
          content,
          quiz: day.quiz || day.questions || null,
          quizAnswerKey: day.quizAnswerKey || day.answerKey || day.correctAnswers || null
        };
      });

      return {
        ...week,
        id: week.id || `m${monthIndex}-w${weekIndex}`,
        monthIndex,
        weekIndex,
        title: week.title || week.name || `Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ ${ARABIC_ORDINAL[weekIndex] || weekIndex}`,
        subtitle: week.subtitle || week.description || "",
        intro: safeText(week.intro ?? week.summary ?? ""),
        days
      };
    });

    return {
      ...month,
      id: month.id || `m${monthIndex}`,
      monthIndex,
      title: month.title || month.name || `Ø§Ù„Ø´Ù‡Ø± ${monthIndex}`,
      subtitle: month.subtitle || month.description || "",
      weeks
    };
  });
}

function getDayContent(day) {
  return safeText(day?.content || "");
}

function getContentDays(week) {
  if (!week?.days) return [];
  return week.days.filter((day) => Boolean(getDayContent(day)) || Boolean(day.quiz));
}

function hasWeekContent(week) {
  return getContentDays(week).length > 0;
}

function getCourseTotalDays(course) {
  return course.reduce((total, month) => {
    return total + month.weeks.reduce((weekTotal, week) => weekTotal + getContentDays(week).length, 0);
  }, 0);
}

function normalizeProgressRows(progressRows) {
  if (!Array.isArray(progressRows)) return [];
  return progressRows.map((row) => ({
    ...row,
    month_index: toNumber(row.month_index ?? row.monthIndex, 0),
    week_index: toNumber(row.week_index ?? row.weekIndex, 0),
    day_index: toNumber(row.day_index ?? row.dayIndex, 0),
    status: row.status || "opened"
  }));
}

function calculateCompletedSet(progressRows) {
  return new Set(
    normalizeProgressRows(progressRows)
      .filter((row) => row.status === "completed")
      .map((row) => progressKey(row.month_index, row.week_index, row.day_index))
  );
}

function countCompletedInWeek(completedSet, week) {
  return getContentDays(week).filter((day) =>
    completedSet.has(progressKey(day.monthIndex, day.weekIndex, day.dayIndex))
  ).length;
}

function countCompletedInMonth(completedSet, month) {
  return month.weeks.reduce((total, week) => total + countCompletedInWeek(completedSet, week), 0);
}

function isDayCompleted(day, completedSet) {
  return completedSet.has(progressKey(day.monthIndex, day.weekIndex, day.dayIndex));
}

function splitQuizFromText(rawText) {
  const text = safeText(rawText);

  const cleanText = text
    .replace(/Ù…Ù„Ø­Ù‚ ØºÙŠØ± Ù…Ø®ØµØµ Ù„Ù†Ø³Ø®Ø© Ø§Ù„Ù…ØªØ¯Ø±Ø¨[\s\S]*$/g, "")
    .replace(/Ù…ÙØªØ§Ø­ Ø¥Ø¬Ø§Ø¨Ø§Øª[\s\S]*$/g, "")
    .trim();

  const quizMatch = cleanText.match(/Ø§Ø®ØªØ¨Ø§Ø±\s+Ø§Ù„ÙŠÙˆÙ…[\s\S]*$/);
  if (!quizMatch) {
    return { lessonText: cleanText, quizText: "" };
  }

  const quizText = quizMatch[0].trim();
  const lessonText = cleanText.slice(0, quizMatch.index).trim();

  return { lessonText, quizText };
}

function normalizeStructuredQuiz(day) {
  const rawQuiz = day?.quiz;

  if (!rawQuiz) return [];

  const questions = Array.isArray(rawQuiz)
    ? rawQuiz
    : Array.isArray(rawQuiz.questions)
      ? rawQuiz.questions
      : [];

  return questions.map((q, index) => {
    const originalOptions = Array.isArray(q.options) ? q.options : [];

    const correctKey =
      q.correctKey ??
      q.correct ??
      q.answer ??
      q.correctAnswer ??
      q.correct_option ??
      null;

    const options = originalOptions.map((option, optionIndex) => {
      if (typeof option === "string") {
        const key = ["A", "B", "C", "D"][optionIndex] || String(optionIndex + 1);
        return {
          id: key,
          originalKey: key,
          text: option,
          isCorrect:
            correctKey === key ||
            correctKey === optionIndex ||
            correctKey === optionIndex + 1 ||
            correctKey === option
        };
      }

      const key = option.key || option.id || ["A", "B", "C", "D"][optionIndex] || String(optionIndex + 1);

      return {
        id: key,
        originalKey: key,
        text: option.text || option.label || option.value || "",
        isCorrect:
          Boolean(option.isCorrect) ||
          Boolean(option.correct) ||
          correctKey === key ||
          correctKey === option.text
      };
    });

    return {
      id: q.id || `q-${index + 1}`,
      question: q.question || q.title || q.text || "",
      options,
      hasKnownCorrectAnswer: options.some((option) => option.isCorrect)
    };
  }).filter((q) => q.question && q.options.length);
}

const ARABIC_DAY_NAMES = {
  1: ["Ø§Ù„Ø£ÙˆÙ„", "Ø§Ù„Ø§ÙˆÙ„", "Ù¡", "1"],
  2: ["Ø§Ù„Ø«Ø§Ù†ÙŠ", "Ù¢", "2"],
  3: ["Ø§Ù„Ø«Ø§Ù„Ø«", "Ù£", "3"],
  4: ["Ø§Ù„Ø±Ø§Ø¨Ø¹", "Ù¤", "4"],
  5: ["Ø§Ù„Ø®Ø§Ù…Ø³", "Ù¥", "5"],
  6: ["Ø§Ù„Ø³Ø§Ø¯Ø³", "Ù¦", "6"],
  7: ["Ø§Ù„Ø³Ø§Ø¨Ø¹", "Ù§", "7"]
};

function normalizeAnswerLetter(value) {
  const letter = safeText(value).trim().toUpperCase();
  const map = {
    "Ø£": "A",
    "Ø§": "A",
    "A": "A",
    "Ø¨": "B",
    "B": "B",
    "Ø¬": "C",
    "C": "C",
    "Ø¯": "D",
    "D": "D"
  };

  return map[letter] || "";
}

function normalizeArabicDigits(value) {
  const digits = {
    "Ù ": "0",
    "Ù¡": "1",
    "Ù¢": "2",
    "Ù£": "3",
    "Ù¤": "4",
    "Ù¥": "5",
    "Ù¦": "6",
    "Ù§": "7",
    "Ù¨": "8",
    "Ù©": "9"
  };

  return safeText(value).replace(/[Ù -Ù©]/g, (digit) => digits[digit] || digit);
}

function getAnswerKeyBlockForDay(day, fullText) {
  const text = normalizeArabicDigits(fullText);
  const answerKeyIndex = text.search(/Ù…ÙØªØ§Ø­\s+Ø¥Ø¬Ø§Ø¨Ø§Øª|Ù…ÙØªØ§Ø­\s+Ø§Ù„Ø§Ø¬Ø§Ø¨Ø§Øª|Ù…ÙØ§ØªÙŠØ­\s+Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø©|Ù…ÙØ§ØªÙŠØ­\s+Ø§Ù„Ø§Ø¬Ø§Ø¨Ø©/);

  if (answerKeyIndex < 0) return "";

  const answerText = text.slice(answerKeyIndex);
  const dayNames = ARABIC_DAY_NAMES[Number(day?.dayIndex)] || [];

  for (const dayName of dayNames) {
    const pattern = new RegExp(`Ø§Ù„ÙŠÙˆÙ…\\s+${escapeRegExp(dayName)}\\s*[:ï¼š]?([\\s\\S]*?)(?=\\n\\s*Ø§Ù„ÙŠÙˆÙ…\\s+(?:Ø§Ù„Ø£ÙˆÙ„|Ø§Ù„Ø§ÙˆÙ„|Ø§Ù„Ø«Ø§Ù†ÙŠ|Ø§Ù„Ø«Ø§Ù„Ø«|Ø§Ù„Ø±Ø§Ø¨Ø¹|Ø§Ù„Ø®Ø§Ù…Ø³|Ø§Ù„Ø³Ø§Ø¯Ø³|Ø§Ù„Ø³Ø§Ø¨Ø¹|[1-7])\\s*[:ï¼š]?|$)`);
    const match = answerText.match(pattern);
    if (match?.[1]) return match[1];
  }

  return answerText;
}

function normalizeAnswerKeyMap(sourceMap) {
  if (!sourceMap || typeof sourceMap !== "object") return {};

  const entries = Array.isArray(sourceMap)
    ? sourceMap.map((value, index) => [index + 1, value])
    : Object.entries(sourceMap);

  return entries.reduce((map, [key, value]) => {
    const questionNumber = Number(normalizeArabicDigits(String(key)));
    const answerLetter = normalizeAnswerLetter(value);

    if (questionNumber && answerLetter) {
      map[questionNumber] = answerLetter;
    }

    return map;
  }, {});
}

function extractAnswerKeyMap(day, fullText) {
  const knownAnswerMap = normalizeAnswerKeyMap(
    day?.quizAnswerKey || day?.answerKey || day?.correctAnswers
  );

  if (Object.keys(knownAnswerMap).length) return knownAnswerMap;

  const block = getAnswerKeyBlockForDay(day, fullText);
  const map = {};

  if (!block) return map;

  const regex = /(?:Ø§Ù„Ø³Ø¤Ø§Ù„\s*)?([1-9]\d*)\s*[-â€“â€”:ï¼š]\s*([A-DØ£Ø§Ø¨Ø¬Ø¯])/gi;
  let match;

  while ((match = regex.exec(block)) !== null) {
    const questionNumber = Number(match[1]);
    const answerLetter = normalizeAnswerLetter(match[2]);

    if (questionNumber && answerLetter) {
      map[questionNumber] = answerLetter;
    }
  }

  return map;
}

function applyAnswerKeyMap(questions, answerKeyMap) {
  if (!answerKeyMap || !Object.keys(answerKeyMap).length) return questions;

  return questions.map((question, index) => {
    const correctLetter = answerKeyMap[index + 1];
    if (!correctLetter) return question;

    const options = question.options.map((option) => ({
      ...option,
      isCorrect:
        normalizeAnswerLetter(option.id) === correctLetter ||
        normalizeAnswerLetter(option.originalKey) === correctLetter
    }));

    return {
      ...question,
      options,
      hasKnownCorrectAnswer: options.some((option) => option.isCorrect)
    };
  });
}

function parseQuizText(day, quizText, fullText = "") {
  const answerKeyMap = extractAnswerKeyMap(day, fullText);
  const structured = normalizeStructuredQuiz(day);
  if (structured.length) return applyAnswerKeyMap(structured, answerKeyMap);

  const text = safeText(quizText);
  if (!text) return [];

  const blocks = text
    .replace(/\r/g, "")
    .split(/(?=Ø§Ù„Ø³Ø¤Ø§Ù„\s+\d+)/g)
    .map((item) => item.trim())
    .filter((item) => /^Ø§Ù„Ø³Ø¤Ø§Ù„\s+\d+/.test(item));

  const questions = blocks.map((block, index) => {
    const withoutLabel = block.replace(/^Ø§Ù„Ø³Ø¤Ø§Ù„\s+\d+\s*/g, "").trim();

    // ÙŠØ¯Ø¹Ù… Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© A/B/C/D ÙˆØ§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø£/Ø¨/Ø¬/Ø¯.
    const questionMatch = withoutLabel.match(/^([\s\S]*?)(?=\s+(?:[A-D]|Ø£|Ø¨|Ø¬|Ø¯)\.)/);
    const question = questionMatch ? questionMatch[1].trim() : withoutLabel;

    const options = [];
    const optionRegex = /([A-D]|Ø£|Ø¨|Ø¬|Ø¯)\.\s*([\s\S]*?)(?=(?:\s+(?:[A-D]|Ø£|Ø¨|Ø¬|Ø¯)\.)|$)/g;
    let match;

    while ((match = optionRegex.exec(withoutLabel)) !== null) {
      const optionKeyMap = {
        "Ø£": "A",
        "Ø¨": "B",
        "Ø¬": "C",
        "Ø¯": "D"
      };

      options.push({
        id: optionKeyMap[match[1]] || match[1],
        originalKey: match[1],
        text: match[2].trim(),
        isCorrect: false
      });
    }

    return {
      id: `${day.id}-parsed-q-${index + 1}`,
      question,
      // ØªØ¹Ø¯ÙŠÙ„ Ù…Ù‡Ù…: Ù„Ø§ Ù†Ø¹ÙŠØ¯ ØªØ±ØªÙŠØ¨ Ø§Ù„Ø®ÙŠØ§Ø±Ø§ØªØ› Ø­ØªÙ‰ ØªØ¨Ù‚Ù‰ ÙƒÙ…Ø§ ÙˆØ±Ø¯Øª ÙÙŠ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ.
      options,
      hasKnownCorrectAnswer: false
    };
  }).filter((q) => q.question && q.options.length);

  return applyAnswerKeyMap(questions, answerKeyMap);
}

function prepareLesson(day) {
  const fullText = getDayContent(day);
  const { lessonText, quizText } = splitQuizFromText(fullText);
  const parsedQuiz = parseQuizText(day, quizText, fullText);

  return {
    // Ø§Ù„Ù†Øµ Ø§Ù„ÙƒØ§Ù…Ù„ Ù…Ø­ÙÙˆØ¸ Ø¯Ø§Ø®Ù„ÙŠÙ‹Ø§ Ù„Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©ØŒ ÙˆÙ„Ø§ ÙŠÙØ¹Ø±Ø¶ Ù„Ù„Ù…ØªØ¯Ø±Ø¨ ÙƒÙ…Ù„Ù Ù…ØµØ¯Ø±.
    fullText,
    lessonText,
    quizText,
    hasQuizText: Boolean(quizText),
    quiz: parsedQuiz
  };
}

function prepareReadableText(rawText) {
  let text = safeText(rawText)
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/([^\n])(\d+\.\s)/g, "$1\n\n$2")
    .replace(/([^\n])([â€¢Â·]\s)/g, "$1\n$2")
    .replace(/([^\n])(Ø§Ù„Ø³Ø¤Ø§Ù„\s+\d+)/g, "$1\n\n$2")
    .replace(/([ØŸ.!])(?=[Ø§Ø£Ø¥Ø¢Ø¡-ÙŠ])/g, "$1\n")
    .replace(/(:)(?=[Ø§Ø£Ø¥Ø¢Ø¡-ÙŠ])/g, "$1\n");

  HEADING_PHRASES.forEach((heading) => {
    const pattern = new RegExp(`(\\d+\\.\\s*${escapeRegExp(heading)})(?=[Ø§Ø£Ø¥Ø¢Ø¡-ÙŠ])`, "g");
    text = text.replace(pattern, "$1\n");
  });

  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function RichLesson({ text }) {
  const lines = prepareReadableText(text);

  if (!lines.length) {
    return <div className="jl-empty">Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù†Øµ Ù„Ù‡Ø°Ø§ Ø§Ù„ÙŠÙˆÙ… Ø¨Ø¹Ø¯.</div>;
  }

  return (
    <div className="jl-rich-text">
      {lines.map((line, index) => {
        const key = `${index}-${line.slice(0, 16)}`;

        if (/^Ø§Ù„Ø´Ù‡Ø±\s+/.test(line)) {
          return <h1 key={key}>{line}</h1>;
        }

        if (/^Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹\s+/.test(line)) {
          return <h2 key={key}>{line}</h2>;
        }

        if (/^Ø§Ù„ÙŠÙˆÙ…\s+/.test(line)) {
          return <h2 key={key}>{line}</h2>;
        }

        if (/^\d+\.\s/.test(line)) {
          return <h3 key={key}>{line}</h3>;
        }

        if (/^[â€¢Â·-]\s/.test(line)) {
          return <div key={key} className="jl-bullet">{line.replace(/^[â€¢Â·-]\s/, "")}</div>;
        }

        if (line.endsWith(":") && line.length < 80) {
          return <h4 key={key}>{line}</h4>;
        }

        return <p key={key}>{line}</p>;
      })}
    </div>
  );
}

function ExactSourcePanel() {
  // Ù„Ø§ Ù†Ø¹Ø±Ø¶ Ø§Ù„Ù†Øµ Ø§Ù„Ø®Ø§Ù… Ù„Ù„Ù…ØªØ¯Ø±Ø¨Ø› Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙŠØ¸Ù‡Ø± ÙÙ‚Ø· ÙƒØ¯Ø±Ø³ Ù…Ù†Ø³Ù‚.
  return null;
}

function StatusMark({ state }) {
  if (state === "completed") return <span className="jl-status jl-status--completed">âœ“</span>;
  if (state === "locked") return <span className="jl-status jl-status--locked">ðŸ”’</span>;
  return <span className="jl-status jl-status--active">â—</span>;
}

function MiniProgress({ label, value, help }) {
  const safeValue = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

  return (
    <NeoMetricGauge
      className="jl-neo-metric-inline"
      value={safeValue}
      max={100}
      displayValue={arabicPercent(value)}
      label={label}
      subLabel={help}
      status={safeValue >= 100 ? "complete" : "progress"}
      size="compact"
    />
  );
}

function QuizPanel({ day, questions, hasQuizText = false, onPass }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
  }, [day.id]);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = total > 0 && answeredCount === total;
  const hasKnownAnswers = questions.every((q) => q.hasKnownCorrectAnswer);

  const score = questions.reduce((sum, question) => {
    const selected = answers[question.id];
    const option = question.options.find((item) => item.id === selected);
    return sum + (option?.isCorrect ? 1 : 0);
  }, 0);

  const passed = hasKnownAnswers ? score === total : allAnswered;

  function submitQuiz() {
    setSubmitted(true);
    if (passed) onPass(true);
  }

  if (!questions.length) {
    return (
      <div className="jl-quiz jl-quiz-soft">
        <h3>Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ÙŠÙˆÙ…</h3>
        {hasQuizText ? (
          <>
            <p>
              ÙŠÙˆØ¬Ø¯ Ø§Ø®ØªØ¨Ø§Ø± ÙÙŠ Ø§Ù„Ù†Øµ Ø§Ù„Ø£ØµÙ„ÙŠØŒ Ù„ÙƒÙ† Ù„Ù… Ø£Ø³ØªØ·Ø¹ ØªØ­ÙˆÙŠÙ„Ù‡ ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§ Ø¥Ù„Ù‰ Ø£Ø²Ø±Ø§Ø± Ø§Ø®ØªÙŠØ§Ø±.
              Ø§Ù‚Ø±Ø£ Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ÙŠÙˆÙ… Ù…Ù† Ø§Ù„Ø¯Ø±Ø³ØŒ Ø«Ù… Ø§Ø¶ØºØ· Ø§Ù„Ø²Ø± Ø§Ù„ØªØ§Ù„ÙŠ Ù„ØªØ£ÙƒÙŠØ¯ Ø£Ù†Ùƒ Ø£Ø¬Ø¨Øª Ø¹Ù†Ù‡.
            </p>
            <button type="button" className="jl-quiz-submit" onClick={() => onPass(true)}>
              Ø£Ø¬Ø¨Øª Ø¹Ù„Ù‰ Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ÙŠÙˆÙ… Ù…Ù† Ø§Ù„Ù†Øµ Ø§Ù„Ø£ØµÙ„ÙŠ
            </button>
          </>
        ) : (
          <p>Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ø®ØªØ¨Ø§Ø± Ù…Ù†ÙØµÙ„ Ø¯Ø§Ø®Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ù‡Ø°Ø§ Ø§Ù„ÙŠÙˆÙ…. ÙŠÙ…ÙƒÙ†Ùƒ Ø¥Ù†Ù‡Ø§Ø¡ Ø§Ù„ÙŠÙˆÙ… Ø¨Ø¹Ø¯ Ù‚Ø±Ø§Ø¡Ø© Ø§Ù„Ø¯Ø±Ø³.</p>
        )}
      </div>
    );
  }

  return (
    <section className="jl-quiz" aria-label="Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ÙŠÙˆÙ…">
      <div className="jl-quiz-header">
        <span>Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ÙŠÙˆÙ…</span>
        <strong>{answeredCount} / {total}</strong>
      </div>

      <h3>Ø§Ø®ØªØ¨Ø± ÙÙ‡Ù…Ùƒ Ù‚Ø¨Ù„ Ø­ÙØ¸ Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²</h3>

      {total !== 3 && (
        <div className="jl-quiz-warning">
          ØªÙ†Ø¨ÙŠÙ‡: Ø§Ù„Ù…ØªÙˆÙ‚Ø¹ Ø£Ù† ÙŠØ­ØªÙˆÙŠ Ø§Ø®ØªØ¨Ø§Ø± ÙƒÙ„ ÙŠÙˆÙ… Ø¹Ù„Ù‰ 3 Ø£Ø³Ø¦Ù„Ø©. Ù‡Ø°Ø§ Ø§Ù„ÙŠÙˆÙ… Ø¸Ù‡Ø± ÙÙŠÙ‡ {total} Ø³Ø¤Ø§Ù„/Ø£Ø³Ø¦Ù„Ø© Ø¨Ø¹Ø¯ Ø§Ù„ØªØ­ÙˆÙŠÙ„ Ø§Ù„Ø¢Ù„ÙŠ.
          Ø±Ø§Ø¬Ø¹ Ø§Ù„Ø¯Ø±Ø³ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ Ø¥Ø°Ø§ Ø§Ø­ØªØ¬Øª Ù‚Ø¨Ù„ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø©.
        </div>
      )}

      {!hasKnownAnswers && (
        <div className="jl-quiz-warning">
          ØªÙ… Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„Ø£Ø³Ø¦Ù„Ø© Ù…Ù† Ø§Ù„Ù†ØµØŒ Ù„ÙƒÙ† Ù„Ù… ØªÙˆØ¬Ø¯ Ù…ÙØ§ØªÙŠØ­ Ø¥Ø¬Ø§Ø¨Ø© Ù…Ù†Ø¸Ù…Ø© ÙÙŠ Ø¨ÙŠØ§Ù†Ø§Øª Ù‡Ø°Ø§ Ø§Ù„ÙŠÙˆÙ…. Ø³ÙŠØªÙ… Ø§Ø¹ØªØ¨Ø§Ø± Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± Ù…ÙƒØªÙ…Ù„Ù‹Ø§ Ø¨Ø¹Ø¯ Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø¹Ù† ÙƒÙ„ Ø§Ù„Ø£Ø³Ø¦Ù„Ø©.
        </div>
      )}

      <div className="jl-question-list">
        {questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const selectedOption = question.options.find((option) => option.id === selected);
          const correctOption = question.options.find((option) => option.isCorrect);
          const answeredCorrectly = Boolean(selectedOption?.isCorrect);

          return (
            <div className="jl-question" key={question.id}>
              <div className="jl-question-title">
                <b>{questionIndex + 1}</b>
                <span>{question.question}</span>
              </div>

              <div className="jl-options">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selected === option.id;
                  const showCorrect = submitted && hasKnownAnswers && option.isCorrect;
                  const showWrong = submitted && hasKnownAnswers && isSelected && !option.isCorrect;

                  return (
                    <button
                      key={`${question.id}-${option.id}-${optionIndex}`}
                      type="button"
                      className={[
                        "jl-option",
                        isSelected ? "jl-option--selected" : "",
                        showCorrect ? "jl-option--correct" : "",
                        showWrong ? "jl-option--wrong" : ""
                      ].join(" ")}
                      onClick={() => {
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: option.id
                        }));
                      }}
                    >
                      <span>{["Ø£", "Ø¨", "Ø¬", "Ø¯"][optionIndex] || optionIndex + 1}</span>
                      <strong>{option.text}</strong>
                    </button>
                  );
                })}
              </div>

              {submitted && hasKnownAnswers && correctOption && (
                <div className={answeredCorrectly ? "jl-answer-note jl-answer-note--correct" : "jl-answer-note jl-answer-note--wrong"}>
                  {answeredCorrectly
                    ? "Ø¥Ø¬Ø§Ø¨ØªÙƒ ØµØ­ÙŠØ­Ø©."
                    : `Ø§Ù„Ø¥Ø¬Ø§Ø¨Ø© Ø§Ù„ØµØ­ÙŠØ­Ø©: ${correctOption.text}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="jl-quiz-footer">
        <button
          type="button"
          className="jl-quiz-submit"
          disabled={!allAnswered}
          onClick={submitQuiz}
        >
          ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±
        </button>

        {submitted && (
          <div className={passed ? "jl-quiz-result jl-quiz-result--pass" : "jl-quiz-result jl-quiz-result--fail"}>
            {hasKnownAnswers
              ? passed
                ? `Ù…Ù…ØªØ§Ø². Ù†ØªÙŠØ¬ØªÙƒ ${score} Ù…Ù† ${total}. ÙŠÙ…ÙƒÙ†Ùƒ Ø­ÙØ¸ Ø¥Ù†Ø¬Ø§Ø² Ø§Ù„ÙŠÙˆÙ….`
                : `Ù†ØªÙŠØ¬ØªÙƒ ${score} Ù…Ù† ${total}. Ø±Ø§Ø¬Ø¹ Ø¥Ø¬Ø§Ø¨Ø§ØªÙƒ Ø«Ù… Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.`
              : "ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ù…Ø­Ø§ÙˆÙ„Ø© Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø±. ÙŠÙ…ÙƒÙ†Ùƒ Ø­ÙØ¸ Ø¥Ù†Ø¬Ø§Ø² Ø§Ù„ÙŠÙˆÙ…."}
          </div>
        )}
      </div>
    </section>
  );
}

export default function CourseJourney({
  progressRows = [],
  setProgressRows = () => {},
  loading = false,
  resumeRequest = 0
}) {
  const course = useMemo(() => normalizeCourse(rawCourseMap), []);
  const [stage, setStage] = useState("months");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(1);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [quizPassedByDay, setQuizPassedByDay] = useState({});
  const [lessonBookmarks, setLessonBookmarks] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [bookmarkSaving, setBookmarkSaving] = useState(false);
  const [bookmarkStatus, setBookmarkStatus] = useState("");

  const completedSet = useMemo(() => calculateCompletedSet(progressRows), [progressRows]);

  const selectedMonth =
    course.find((month) => month.monthIndex === selectedMonthIndex) || course[0];

  const selectedWeek =
    selectedMonth?.weeks?.find((week) => week.weekIndex === selectedWeekIndex) ||
    selectedMonth?.weeks?.[0];

  const selectedDay =
    selectedWeek?.days?.find((day) => day.dayIndex === selectedDayIndex) ||
    selectedWeek?.days?.[0];

  const preparedLesson = useMemo(
    () => prepareLesson(selectedDay || {}),
    [selectedDay?.id, selectedDay?.content, selectedDay?.quiz]
  );

  const currentLessonPath = useMemo(() => {
    return [selectedMonth?.title, selectedWeek?.title, selectedDay?.title]
      .filter(Boolean)
      .join(" â† ");
  }, [selectedMonth?.title, selectedWeek?.title, selectedDay?.title]);

  const currentLessonExcerpt = useMemo(() => {
    return String(preparedLesson.lessonText || preparedLesson.fullText || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220);
  }, [preparedLesson.lessonText, preparedLesson.fullText]);

  const currentBookmark = useMemo(() => {
    if (!selectedDay) return null;

    return lessonBookmarks.find((bookmark) => {
      return (
        Number(bookmark.month_index) === Number(selectedDay.monthIndex) &&
        Number(bookmark.week_index) === Number(selectedDay.weekIndex) &&
        Number(bookmark.day_index) === Number(selectedDay.dayIndex)
      );
    }) || null;
  }, [lessonBookmarks, selectedDay]);

  // Ø§Ù„Ø¹Ø¯Ø¯ Ø§Ù„ÙØ¹Ù„ÙŠ Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ø­ØªÙˆÙ‰ ÙŠØ¨Ù‚Ù‰ ÙƒÙ…Ø§ Ù‡Ùˆ Ø­ØªÙ‰ Ù„Ø§ ÙŠÙ†ÙƒØ³Ø± ÙØªØ­ Ø§Ù„Ø£Ø³Ø§Ø¨ÙŠØ¹ ÙˆØ§Ù„Ø´Ù‡ÙˆØ±.
  // Ø£Ù…Ø§ Ø§Ù„Ø¹Ø±Ø¶ Ø£Ù…Ø§Ù… Ø§Ù„Ù…ØªØ¯Ø±Ø¨ ÙÙŠÙƒÙˆÙ† Ø­Ø³Ø¨ Ø§Ù„Ø®Ø·Ø© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©: 6 Ø£Ø´Ù‡Ø± Ã— 30 ÙŠÙˆÙ… = 180 ÙŠÙˆÙ…Ù‹Ø§.
  const actualCourseDays = getCourseTotalDays(course);
  const totalCourseDays = COURSE_TOTALS?.totalDays || 180;
  const daysPerMonth = COURSE_TOTALS?.daysPerMonth || 30;

  const totalCompletedDays = course.reduce(
    (sum, month) => sum + countCompletedInMonth(completedSet, month),
    0
  );

  const actualMonthDays = selectedMonth
    ? selectedMonth.weeks.reduce((sum, week) => sum + getContentDays(week).length, 0)
    : 0;

  const monthTotalDays = selectedMonth ? daysPerMonth : 0;
  const weekTotalDays = selectedWeek ? getContentDays(selectedWeek).length : 0;
  const monthCompletedDays = selectedMonth ? countCompletedInMonth(completedSet, selectedMonth) : 0;
  const weekCompletedDays = selectedWeek ? countCompletedInWeek(completedSet, selectedWeek) : 0;

  const overallProgress = totalCourseDays ? (totalCompletedDays / totalCourseDays) * 100 : 0;
  const monthProgress = monthTotalDays ? (monthCompletedDays / monthTotalDays) * 100 : 0;
  const weekProgress = weekTotalDays ? (weekCompletedDays / weekTotalDays) * 100 : 0;

  function isMonthCompleted(month) {
    const total = month.weeks.reduce((sum, week) => sum + getContentDays(week).length, 0);
    if (!total) return false;
    return countCompletedInMonth(completedSet, month) >= total;
  }

  function isMonthUnlocked(month) {
    if (month.monthIndex === 1) return true;

    const previousMonth = course.find((item) => item.monthIndex === month.monthIndex - 1);
    return Boolean(previousMonth && isMonthCompleted(previousMonth));
  }

  function monthState(month) {
    if (isMonthCompleted(month)) return "completed";
    if (isMonthUnlocked(month)) return "active";
    return "locked";
  }

  function isWeekCompleted(week) {
    const total = getContentDays(week).length;
    if (!total) return false;
    return countCompletedInWeek(completedSet, week) >= total;
  }

  function isWeekUnlocked(week, monthContext = selectedMonth) {
    if (!monthContext || !isMonthUnlocked(monthContext)) return false;
    if (!hasWeekContent(week)) return false;
    if (week.weekIndex === 1) return true;

    const previousWeek = monthContext.weeks.find((item) => item.weekIndex === week.weekIndex - 1);
    return Boolean(previousWeek && isWeekCompleted(previousWeek));
  }

  function weekState(week, monthContext = selectedMonth) {
    if (isWeekCompleted(week)) return "completed";
    if (isWeekUnlocked(week, monthContext)) return "active";
    return "locked";
  }

  function previousContentDay(day, week) {
    const contentDays = getContentDays(week).sort((a, b) => a.dayIndex - b.dayIndex);
    const currentIndex = contentDays.findIndex((item) => item.dayIndex === day.dayIndex);
    return currentIndex > 0 ? contentDays[currentIndex - 1] : null;
  }

  function isDayUnlocked(day, weekContext = selectedWeek, monthContext = selectedMonth) {
    if (!day || !weekContext || !monthContext) return false;
    if (!getDayContent(day) && !day.quiz) return false;
    if (!isWeekUnlocked(weekContext, monthContext)) return false;

    const prev = previousContentDay(day, weekContext);
    if (!prev) return true;

    return isDayCompleted(prev, completedSet);
  }

  function dayState(day, weekContext = selectedWeek, monthContext = selectedMonth) {
    if (isDayCompleted(day, completedSet)) return "completed";
    if (isDayUnlocked(day, weekContext, monthContext)) return "active";
    return "locked";
  }

  function firstRelevantWeekInMonth(month) {
    const weeksWithContent = month.weeks.filter(hasWeekContent);
    const unlockedWeeks = weeksWithContent.filter((week) => isWeekUnlocked(week, month));

    return (
      unlockedWeeks.find((week) => !isWeekCompleted(week)) ||
      unlockedWeeks[0] ||
      weeksWithContent[0] ||
      month.weeks[0]
    );
  }

  function firstAvailableDayInWeek(week, monthContext) {
    const contentDays = getContentDays(week).sort((a, b) => a.dayIndex - b.dayIndex);

    return (
      contentDays.find((day) =>
        isDayUnlocked(day, week, monthContext) &&
        !isDayCompleted(day, completedSet)
      ) ||
      contentDays[0] ||
      week.days[0]
    );
  }

  function firstAvailableLearningPoint() {
    for (const month of course) {
      if (!isMonthUnlocked(month)) continue;

      for (const week of month.weeks) {
        if (!isWeekUnlocked(week, month)) continue;

        const nextDay = getContentDays(week)
          .sort((a, b) => a.dayIndex - b.dayIndex)
          .find((day) =>
            isDayUnlocked(day, week, month) &&
            !isDayCompleted(day, completedSet)
          );

        if (nextDay) return { month, week, day: nextDay };
      }
    }

    const fallbackMonth = course[0];
    const fallbackWeek = firstRelevantWeekInMonth(fallbackMonth);
    const fallbackDay = firstAvailableDayInWeek(fallbackWeek, fallbackMonth);

    return { month: fallbackMonth, week: fallbackWeek, day: fallbackDay };
  }

  useEffect(() => {
    if (!course.length) return;

    const nextPoint = firstAvailableLearningPoint();

    if (nextPoint?.month && nextPoint?.week && nextPoint?.day) {
      setSelectedMonthIndex(nextPoint.month.monthIndex);
      setSelectedWeekIndex(nextPoint.week.weekIndex);
      setSelectedDayIndex(nextPoint.day.dayIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.length, progressRows.length]);

  useEffect(() => {
    if (!resumeRequest || loading || !course.length) return;

    openNextPoint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeRequest, loading, course.length, progressRows.length]);

  useEffect(() => {
    if (stage !== "lesson") return;
    if (!selectedDay?.id) return;
    if (!isDayUnlocked(selectedDay, selectedWeek, selectedMonth)) return;

    markDayOpened({
      monthIndex: selectedDay.monthIndex,
      weekIndex: selectedDay.weekIndex,
      dayIndex: selectedDay.dayIndex
    }).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, selectedDay?.id]);

  useEffect(() => {
    loadBookmarksSafely();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMonthClick(month) {
    if (!isMonthUnlocked(month)) return;

    const week = firstRelevantWeekInMonth(month);
    const day = firstAvailableDayInWeek(week, month);

    setSelectedMonthIndex(month.monthIndex);
    setSelectedWeekIndex(week.weekIndex);
    setSelectedDayIndex(day.dayIndex);
    setNotice("");
    setStage("weeks");
  }

  function handleWeekClick(week) {
    if (!isWeekUnlocked(week, selectedMonth)) return;

    const day = firstAvailableDayInWeek(week, selectedMonth);

    setSelectedWeekIndex(week.weekIndex);
    setSelectedDayIndex(day.dayIndex);
    setNotice("");
    setStage("days");
  }

  function handleDayClick(day) {
    if (!isDayUnlocked(day, selectedWeek, selectedMonth)) return;

    setSelectedDayIndex(day.dayIndex);
    setNotice("");
    setStage("lesson");
  }

  function openNextPoint() {
    const nextPoint = firstAvailableLearningPoint();
    if (!nextPoint?.month || !nextPoint?.week || !nextPoint?.day) return;

    setSelectedMonthIndex(nextPoint.month.monthIndex);
    setSelectedWeekIndex(nextPoint.week.weekIndex);
    setSelectedDayIndex(nextPoint.day.dayIndex);
    setStage("lesson");
    setNotice("");
  }

  function jumpToSearchResult(result) {
    if (!result) return;

    const targetMonth = course.find((month) => month.monthIndex === result.monthIndex);
    const targetWeek = targetMonth?.weeks?.find((week) => week.weekIndex === result.weekIndex);
    const targetDay = targetWeek?.days?.find((day) => day.dayIndex === result.dayIndex);

    if (!targetMonth || !targetWeek || !targetDay) {
      setNotice("Ù„Ù… Ø£Ø³ØªØ·Ø¹ Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø¯Ø§Ø®Ù„ Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ø±Ø­Ù„Ø©.");
      return;
    }

    setSelectedMonthIndex(targetMonth.monthIndex);
    setSelectedWeekIndex(targetWeek.weekIndex);
    setSelectedDayIndex(targetDay.dayIndex);

    if (!isMonthUnlocked(targetMonth)) {
      setStage("months");
      setNotice("Ù‡Ø°Ù‡ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø¶Ù…Ù† Ø´Ù‡Ø± Ù„Ù… ÙŠÙÙØªØ­ Ø¨Ø¹Ø¯. Ø£ÙƒÙ…Ù„ Ø§Ù„Ø´Ù‡Ø± Ø§Ù„Ø³Ø§Ø¨Ù‚ Ø£ÙˆÙ„Ù‹Ø§.");
      return;
    }

    if (!isWeekUnlocked(targetWeek, targetMonth)) {
      setStage("weeks");
      setNotice("Ù‡Ø°Ù‡ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø¶Ù…Ù† Ø£Ø³Ø¨ÙˆØ¹ Ù„Ù… ÙŠÙÙØªØ­ Ø¨Ø¹Ø¯. Ø£ÙƒÙ…Ù„ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ Ø§Ù„Ø³Ø§Ø¨Ù‚ Ø£ÙˆÙ„Ù‹Ø§.");
      return;
    }

    if (!isDayUnlocked(targetDay, targetWeek, targetMonth)) {
      setStage("days");
      setNotice("Ù‡Ø°Ù‡ Ø§Ù„Ù†ØªÙŠØ¬Ø© Ø¶Ù…Ù† ÙŠÙˆÙ… Ù„Ù… ÙŠÙÙØªØ­ Ø¨Ø¹Ø¯. Ø£ÙƒÙ…Ù„ Ø§Ù„ÙŠÙˆÙ… Ø§Ù„Ø³Ø§Ø¨Ù‚ Ø£ÙˆÙ„Ù‹Ø§.");
      return;
    }

    setStage("lesson");
    setNotice("");
    window.requestAnimationFrame(() => {
      const lessonElement = document.querySelector(".jl-reader");
      lessonElement?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  }

  async function loadBookmarksSafely() {
    setBookmarksLoading(true);

    try {
      const rows = await listLessonBookmarks();
      setLessonBookmarks(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.warn("ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¯Ø±ÙˆØ³ Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø©:", error);
    } finally {
      setBookmarksLoading(false);
    }
  }

  function jumpToBookmark(bookmark) {
    jumpToSearchResult({
      monthIndex: Number(bookmark?.month_index),
      weekIndex: Number(bookmark?.week_index),
      dayIndex: Number(bookmark?.day_index)
    });
  }

  async function toggleCurrentBookmark() {
    if (!selectedDay) return;

    setBookmarkSaving(true);
    setBookmarkStatus("");

    try {
      if (currentBookmark) {
        await deleteLessonBookmarkByLocation({
          monthIndex: selectedDay.monthIndex,
          weekIndex: selectedDay.weekIndex,
          dayIndex: selectedDay.dayIndex
        });

        setLessonBookmarks((current) => current.filter((bookmark) => {
          return !(
            Number(bookmark.month_index) === Number(selectedDay.monthIndex) &&
            Number(bookmark.week_index) === Number(selectedDay.weekIndex) &&
            Number(bookmark.day_index) === Number(selectedDay.dayIndex)
          );
        }));
        setBookmarkStatus("ØªÙ…Øª Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø¯Ø±Ø³ Ù…Ù† Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø§Øª.");
        return;
      }

      const saved = await saveLessonBookmark({
        monthIndex: selectedDay.monthIndex,
        weekIndex: selectedDay.weekIndex,
        dayIndex: selectedDay.dayIndex,
        lessonTitle: selectedDay.title,
        lessonPath: currentLessonPath,
        excerpt: currentLessonExcerpt
      });

      setLessonBookmarks((current) => {
        const filtered = current.filter((bookmark) => {
          return !(
            Number(bookmark.month_index) === Number(selectedDay.monthIndex) &&
            Number(bookmark.week_index) === Number(selectedDay.weekIndex) &&
            Number(bookmark.day_index) === Number(selectedDay.dayIndex)
          );
        });

        return [saved, ...filtered];
      });
      setBookmarkStatus("ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø¯Ø±Ø³ ÙÙŠ Ù‚Ø§Ø¦Ù…ØªÙƒ.");
    } catch (error) {
      setBookmarkStatus(error?.message || "ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¯Ø±ÙˆØ³ Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø©.");
    } finally {
      setBookmarkSaving(false);
      window.setTimeout(() => setBookmarkStatus(""), 2600);
    }
  }

  async function completeCurrentDay() {
    if (!selectedDay) return;
    if (!isDayUnlocked(selectedDay, selectedWeek, selectedMonth)) return;
    if (isDayCompleted(selectedDay, completedSet)) return;

    const hasQuiz = preparedLesson.quiz.length > 0;
    const quizPassed = quizPassedByDay[selectedDay.id];

    if (hasQuiz && !quizPassed) {
      setNotice("Ø£Ø¬Ø¨ Ø¹Ù† Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„ÙŠÙˆÙ… Ø£ÙˆÙ„Ù‹Ø§ØŒ Ø«Ù… Ø§Ø­ÙØ¸ Ø§Ù„Ø¥Ù†Ø¬Ø§Ø².");
      return;
    }

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
      } else {
        const currentRows = normalizeProgressRows(progressRows).filter((row) => {
          return !(
            row.month_index === selectedDay.monthIndex &&
            row.week_index === selectedDay.weekIndex &&
            row.day_index === selectedDay.dayIndex
          );
        });

        setProgressRows([
          ...currentRows,
          {
            month_index: selectedDay.monthIndex,
            week_index: selectedDay.weekIndex,
            day_index: selectedDay.dayIndex,
            status: "completed"
          }
        ]);
      }

      setNotice("ØªÙ… Ø­ÙØ¸ Ø¥Ù†Ø¬Ø§Ø² Ø§Ù„ÙŠÙˆÙ…. ÙÙØªØ­Øª Ù„Ùƒ Ø§Ù„Ù…Ø­Ø·Ø© Ø§Ù„ØªØ§Ù„ÙŠØ©.");
    } catch (error) {
      setNotice(error?.message || "ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„ØªÙ‚Ø¯Ù…. ØªØ£ÙƒØ¯ Ù…Ù† ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£Ùˆ Ø¥Ø¹Ø¯Ø§Ø¯ Supabase.");
    } finally {
      setSaving(false);
    }
  }

  function goBack() {
    if (stage === "lesson") setStage("days");
    else if (stage === "days") setStage("weeks");
    else if (stage === "weeks") setStage("months");
  }

  if (!course.length) {
    return (
      <section className="journey-lab" dir="rtl">
        <div className="jl-empty">Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø±Ø­Ù„Ø© Ø¯Ø§Ø®Ù„ courseContent.</div>
      </section>
    );
  }

  const currentMeta = stageMeta[stage];
  const currentDayState = selectedDay ? dayState(selectedDay) : "locked";
  const dayHasQuiz = preparedLesson.hasQuizText || preparedLesson.quiz.length > 0;
  const canCompleteLesson =
    currentDayState === "active" &&
    (!dayHasQuiz || quizPassedByDay[selectedDay?.id]);

  return (
    <section className="journey-lab" dir="rtl">
      <style>{`
        .journey-lab {
          /* Ø§Ù„Ø±Ù…ÙˆØ² Ø§Ù„Ù…Ø­Ù„ÙŠØ© ØªÙØ´ØªÙ‚Ù‘ Ø§Ù„Ø¢Ù† Ù…Ù† Ù†Ø¸Ø§Ù… Ø§Ù„ØªØµÙ…ÙŠÙ… Ø§Ù„Ù…ÙˆØ­Ù‘Ø¯ */
          --ink:var(--text);
          --muted:var(--text-muted);
          --line:var(--border);
          --primary:var(--accent);
          --violet:var(--accent-hover);
          --gold:var(--accent);
          --green:var(--success);
          --red:var(--danger);
          min-height:100vh;
          position:relative;
          overflow:hidden;
          color:var(--ink);
          padding:28px 16px 70px;
          background:
            radial-gradient(circle at 12% 12%, rgba(139, 92, 246,.18), transparent 31%),
            radial-gradient(circle at 86% 18%, rgba(139,92,246,.16), transparent 28%),
            radial-gradient(circle at 50% 88%, rgba(168, 85, 247,.13), transparent 31%),
            linear-gradient(135deg,#f4f0fb 0%,#efe9fb 48%,#f4f0fb 100%);
        }

        .jl-wrap {
          width:min(1180px,100%);
          margin:0 auto;
          position:relative;
          z-index:1;
        }

        .jl-hero {
          border-radius:38px;
          padding:34px;
          color:white;
          overflow:hidden;
          position:relative;
          background:
            radial-gradient(circle at top left, rgba(139,92,246,.24), transparent 35%),
            linear-gradient(135deg,#18102e,#281748 54%,#111827);
          box-shadow:0 28px 90px rgba(28, 17, 48,.22);
        }

        .jl-hero::before {
          content:"";
          position:absolute;
          inset:-40%;
          background-image:
            linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
          background-size:42px 42px;
          transform:rotate(-8deg);
          opacity:.45;
        }

        .jl-hero-inner {
          position:relative;
          z-index:1;
          display:grid;
          grid-template-columns:1.35fr .65fr;
          gap:26px;
          align-items:center;
        }

        .jl-eyebrow {
          display:inline-flex;
          width:fit-content;
          padding:8px 14px;
          border-radius:999px;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.16);
          color:#c4b5fd;
          font-size:12px;
          font-weight:950;
        }

        .jl-title {
          margin:16px 0 12px;
          font-size:clamp(30px,5vw,62px);
          line-height:1.06;
          font-weight:950;
          letter-spacing:-1.2px;
        }

        .jl-title span {
          display:block;
          color:transparent;
          background:linear-gradient(90deg,#fff,#c3b5e8,#c4b5fd);
          -webkit-background-clip:text;
          background-clip:text;
        }

        .jl-hero p {
          margin:0;
          max-width:780px;
          color:rgba(196, 181, 253,.88);
          font-size:15px;
          line-height:2;
          font-weight:750;
        }

        .jl-gauge-stage {
          min-height:230px;
          display:grid;
          place-items:center;
        }

        .jl-control-deck {
          margin:18px 0;
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:12px;
        }

        .jl-mini-progress {
          border-radius:24px;
          padding:16px;
          background:var(--surface);
          border:1px solid var(--line);
          box-shadow:0 16px 38px rgba(28, 17, 48,.08);
          backdrop-filter:blur(18px);
        }

        .jl-mini-head {
          display:flex;
          justify-content:space-between;
          gap:12px;
          align-items:center;
          margin-bottom:10px;
        }

        .jl-mini-head span {
          color:var(--muted);
          font-size:11px;
          font-weight:900;
          line-height:1.6;
        }

        .jl-mini-head strong {
          color:var(--ink);
          font-size:18px;
          font-weight:950;
        }

        .jl-mini-track {
          height:9px;
          border-radius:999px;
          background:rgba(167, 139, 250,.18);
          overflow:hidden;
        }

        .jl-mini-track i {
          display:block;
          height:100%;
          border-radius:inherit;
          background:linear-gradient(90deg,#8b5cf6,#7c3aed,#a855f7);
        }

        .jl-mini-progress small {
          display:block;
          margin-top:9px;
          color:#9d8fc0;
          font-size:11px;
          font-weight:850;
        }

        .jl-top-actions {
          margin:20px 0;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          flex-wrap:wrap;
        }

        .jl-breadcrumbs {
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          align-items:center;
        }

        .jl-crumb,
        .jl-back,
        .jl-main-btn,
        .jl-ghost-btn,
        .jl-complete,
        .jl-quiz-submit {
          font-family:inherit;
          border:0;
          cursor:pointer;
          transition:.24s ease;
        }

        .jl-crumb {
          padding:10px 14px;
          border-radius:999px;
          background:var(--surface);
          border:1px solid var(--line);
          color:var(--muted);
          font-size:12px;
          font-weight:950;
          box-shadow:0 10px 28px rgba(28, 17, 48,.06);
        }

        .jl-crumb:hover,
        .jl-back:hover,
        .jl-main-btn:hover,
        .jl-ghost-btn:hover,
        .jl-complete:hover,
        .jl-quiz-submit:hover {
          transform:translateY(-2px);
        }

        .jl-crumb:disabled,
        .jl-complete:disabled,
        .jl-quiz-submit:disabled {
          opacity:.55;
          cursor:not-allowed;
          transform:none;
        }

        .jl-back {
          padding:11px 15px;
          border-radius:16px;
          background:#18102e;
          color:white;
          font-size:12px;
          font-weight:950;
        }

        .jl-main-btn {
          padding:13px 18px;
          border-radius:18px;
          color:white;
          background:linear-gradient(135deg,#8b5cf6,#7c3aed);
          box-shadow:0 18px 38px rgba(139, 92, 246,.24);
          font-size:12px;
          font-weight:950;
        }

        .jl-stage-panel {
          border-radius:34px;
          padding:24px;
          background:rgba(255,255,255,.76);
          border:1px solid rgba(255,255,255,.94);
          box-shadow:0 22px 60px rgba(28, 17, 48,.08);
          backdrop-filter:blur(22px);
        }

        .jl-stage-head {
          display:grid;
          grid-template-columns:1fr auto;
          gap:16px;
          align-items:start;
          margin-bottom:18px;
        }

        .jl-stage-head span {
          display:inline-flex;
          margin-bottom:8px;
          color:var(--primary);
          font-size:11px;
          font-weight:950;
        }

        .jl-stage-head h2 {
          margin:0;
          color:var(--ink);
          font-size:clamp(22px,3vw,34px);
          line-height:1.25;
          font-weight:950;
        }

        .jl-stage-head p {
          margin:10px 0 0;
          max-width:760px;
          color:var(--muted);
          font-size:13px;
          line-height:1.9;
          font-weight:750;
        }

        .jl-quote {
          max-width:310px;
          padding:14px 16px;
          border-radius:22px;
          background:#18102e;
          color:#f4f0fb;
          font-size:12px;
          line-height:1.8;
          font-weight:900;
        }

        .jl-notice {
          margin:12px 0;
          border-radius:20px;
          padding:13px 15px;
          background:#ecfdf5;
          color:#065f46;
          border:1px solid rgba(16,185,129,.22);
          font-size:12px;
          font-weight:900;
        }

        .jl-loading {
          background:#f5f0ff;
          color:#5b21b6;
          border-color:rgba(139,92,246,.24);
        }

        .jl-month-grid {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:16px;
        }

        .jl-weeks-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
        }

        .jl-days-grid {
          display:grid;
          grid-template-columns:repeat(7,minmax(0,1fr));
          gap:12px;
        }

        .jl-month-card,
        .jl-week-card,
        .jl-day-card {
          font-family:inherit;
          cursor:pointer;
          text-align:right;
          border:0;
          border-radius:30px;
          background:rgba(255,255,255,.90);
          border:1px solid rgba(167, 139, 250,.20);
          box-shadow:0 18px 45px rgba(28, 17, 48,.07);
          transition:.25s ease;
          position:relative;
          overflow:hidden;
        }

        .jl-month-card:hover,
        .jl-week-card:hover,
        .jl-day-card:hover {
          transform:translateY(-6px);
          box-shadow:0 26px 60px rgba(139, 92, 246,.12);
        }

        .jl-month-card:disabled,
        .jl-week-card:disabled,
        .jl-day-card:disabled {
          cursor:not-allowed;
          opacity:.55;
          filter:grayscale(.65);
          transform:none;
        }

        .jl-month-card {
          min-height:220px;
          padding:18px;
        }

        .jl-week-card {
          min-height:188px;
          padding:18px;
        }

        .jl-day-card {
          min-height:148px;
          padding:14px 10px;
          text-align:center;
        }

        .jl-month-top,
        .jl-week-top {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        }

        .jl-status {
          width:34px;
          height:34px;
          display:inline-grid;
          place-items:center;
          border-radius:14px;
          font-size:13px;
          font-weight:950;
        }

        .jl-status--completed {
          color:#065f46;
          background:rgba(16,185,129,.12);
        }

        .jl-status--active {
          color:#6d28d9;
          background:rgba(139, 92, 246,.12);
        }

        .jl-status--locked {
          color:#7a6c9a;
          background:rgba(100,116,139,.12);
        }

        .jl-index {
          color:rgba(28, 17, 48,.13);
          font-size:42px;
          font-weight:950;
          line-height:1;
        }

        .jl-month-card h3,
        .jl-week-card h3 {
          margin:22px 0 8px;
          color:var(--ink);
          font-size:18px;
          line-height:1.45;
          font-weight:950;
        }

        .jl-month-card p,
        .jl-week-card p {
          margin:0 0 36px;
          color:var(--muted);
          font-size:12px;
          line-height:1.8;
          font-weight:750;
        }

        .jl-card-foot {
          position:absolute;
          right:18px;
          left:18px;
          bottom:16px;
          display:flex;
          justify-content:space-between;
          gap:12px;
          color:#7a6c9a;
          font-size:11px;
          font-weight:900;
        }

        .jl-day-number {
          width:52px;
          height:52px;
          margin:0 auto 12px;
          border-radius:21px;
          display:grid;
          place-items:center;
          color:white;
          font-size:20px;
          font-weight:950;
          background:linear-gradient(135deg,#8b5cf6,#7c3aed);
        }

        .jl-day-card--completed .jl-day-number {
          background:linear-gradient(135deg,#10b981,#059669);
        }

        .jl-day-card--locked .jl-day-number {
          background:linear-gradient(135deg,#9d8fc0,#7a6c9a);
        }

        .jl-day-card strong {
          display:block;
          color:var(--ink);
          font-size:12px;
          line-height:1.6;
          font-weight:950;
        }

        .jl-day-card small {
          display:block;
          margin-top:6px;
          color:var(--muted);
          font-size:10px;
          font-weight:850;
        }

        .jl-lesson-shell {
          display:grid;
          grid-template-columns:300px minmax(0,1fr);
          gap:18px;
          align-items:start;
        }

        .jl-lesson-side {
          position:sticky;
          top:20px;
          border-radius:30px;
          padding:18px;
          color:white;
          background:
            radial-gradient(circle at top right, rgba(139,92,246,.22), transparent 36%),
            linear-gradient(160deg,#18102e,#281748);
          box-shadow:0 22px 55px rgba(28, 17, 48,.18);
        }

        .jl-pill {
          display:inline-flex;
          width:fit-content;
          padding:8px 12px;
          border-radius:999px;
          font-size:11px;
          font-weight:950;
          margin-bottom:14px;
        }

        .jl-pill--completed {
          color:#d1fae5;
          background:rgba(16,185,129,.18);
        }

        .jl-pill--active {
          color:#e0e7ff;
          background:rgba(139, 92, 246,.24);
        }

        .jl-pill--locked {
          color:#e0d8f5;
          background:rgba(167, 139, 250,.18);
        }

        .jl-lesson-side h3 {
          margin:0 0 10px;
          font-size:22px;
          line-height:1.4;
          font-weight:950;
        }

        .jl-lesson-side p {
          margin:0;
          color:rgba(196, 181, 253,.86);
          font-size:12px;
          line-height:1.9;
          font-weight:750;
        }

        .jl-lesson-actions {
          display:grid;
          gap:10px;
          margin-top:16px;
        }

        .jl-bookmark-status {
          border-radius: 16px;
          padding: 10px 12px;
          color: #e0e7ff;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.16);
          font-size: 11px;
          line-height: 1.7;
          font-weight: 850;
        }

        .jl-complete {
          padding:14px 16px;
          border-radius:18px;
          color:white;
          background:linear-gradient(135deg,#10b981,#059669);
          font-size:12px;
          font-weight:950;
        }

        .jl-ghost-btn {
          padding:13px 16px;
          border-radius:18px;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.18);
          color:white;
          font-size:12px;
          font-weight:950;
        }

        .jl-reader {
          border-radius:30px;
          padding:28px;
          background:rgba(255,255,255,.96);
          border:1px solid rgba(167, 139, 250,.18);
          box-shadow:0 20px 55px rgba(28, 17, 48,.07);
        }

        .jl-week-intro {
          margin:0 0 18px;
          border-radius:24px;
          padding:18px;
          background:#f5f0ff;
          border:1px solid #c4b5fd;
          color:#4c1d95;
          line-height:2;
          font-size:13px;
          font-weight:800;
          white-space:pre-wrap;
        }

        .jl-rich-text {
          display:grid;
          gap:12px;
        }

        .jl-rich-text h1,
        .jl-rich-text h2,
        .jl-rich-text h3,
        .jl-rich-text h4 {
          margin:0;
          color:#18102e;
          line-height:1.55;
          font-weight:950;
        }

        .jl-rich-text h1 {
          font-size:30px;
          padding:20px;
          border-radius:24px;
          color:white;
          background:linear-gradient(135deg,#18102e,#281748);
        }

        .jl-rich-text h2 {
          font-size:24px;
          padding:16px 18px;
          border-radius:22px;
          background:#efe9fb;
          color:#6d28d9;
          border:1px solid rgba(139, 92, 246,.12);
        }

        .jl-rich-text h3 {
          font-size:18px;
          margin-top:8px;
          padding:14px 16px;
          border-radius:20px;
          background:#f4f0fb;
          border-right:5px solid #8b5cf6;
        }

        .jl-rich-text h4 {
          font-size:15px;
          color:#5b21b6;
          padding:12px 14px;
          border-radius:18px;
          background:#f5f0ff;
        }

        .jl-rich-text p {
          margin:0;
          color:#281748;
          font-size:15px;
          line-height:2.12;
          font-weight:650;
          padding:0 2px;
        }

        .jl-bullet {
          position:relative;
          padding:12px 42px 12px 14px;
          border-radius:18px;
          color:#463c63;
          background:#f4f0fb;
          border:1px solid rgba(167, 139, 250,.18);
          font-size:14px;
          line-height:1.9;
          font-weight:750;
        }

        .jl-bullet::before {
          content:"";
          position:absolute;
          right:16px;
          top:22px;
          width:9px;
          height:9px;
          border-radius:999px;
          background:linear-gradient(135deg,#8b5cf6,#7c3aed);
        }

        .jl-quiz {
          margin-top:24px;
          padding:22px;
          border-radius:28px;
          background:#18102e;
          color:white;
          box-shadow:0 22px 55px rgba(28, 17, 48,.16);
        }

        .jl-quiz-soft {
          background:#f4f0fb;
          color:#463c63;
          border:1px dashed rgba(100,116,139,.35);
          box-shadow:none;
        }

        .jl-quiz-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:10px;
        }

        .jl-quiz-header span {
          color:#c4b5fd;
          font-size:12px;
          font-weight:950;
        }

        .jl-quiz-header strong {
          color:white;
          font-size:13px;
          font-weight:950;
        }

        .jl-quiz h3 {
          margin:0 0 14px;
          font-size:23px;
          line-height:1.4;
          font-weight:950;
        }

        .jl-quiz-warning {
          margin:0 0 14px;
          padding:12px 14px;
          border-radius:18px;
          background:rgba(139,92,246,.14);
          color:#c4b5fd;
          font-size:12px;
          line-height:1.8;
          font-weight:850;
        }

        .jl-question-list {
          display:grid;
          gap:14px;
        }

        .jl-question {
          padding:16px;
          border-radius:22px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.10);
        }

        .jl-question-title {
          display:flex;
          gap:12px;
          align-items:flex-start;
          margin-bottom:12px;
        }

        .jl-question-title b {
          flex:0 0 auto;
          width:32px;
          height:32px;
          border-radius:13px;
          display:grid;
          place-items:center;
          background:linear-gradient(135deg,#a855f7,#c4b5fd);
          color:#24123f;
          font-weight:950;
        }

        .jl-question-title span {
          color:#f4f0fb;
          font-size:14px;
          line-height:1.9;
          font-weight:850;
        }

        .jl-options {
          display:grid;
          gap:10px;
        }

        .jl-option {
          width:100%;
          display:flex;
          align-items:center;
          gap:10px;
          text-align:right;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.08);
          color:white;
          border-radius:18px;
          padding:12px;
          font-family:inherit;
          cursor:pointer;
          transition:.22s ease;
        }

        .jl-option:hover {
          background:rgba(255,255,255,.13);
        }

        .jl-option span {
          width:30px;
          height:30px;
          border-radius:12px;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.12);
          color:#c4b5fd;
          font-size:12px;
          font-weight:950;
          flex:0 0 auto;
        }

        .jl-option strong {
          font-size:13px;
          line-height:1.8;
          font-weight:850;
        }

        .jl-option--selected {
          border-color:rgba(139,92,246,.65);
          background:rgba(139,92,246,.14);
        }

        .jl-option--correct {
          border-color:rgba(16,185,129,.72);
          background:rgba(16,185,129,.18);
        }

        .jl-option--wrong {
          border-color:rgba(239,68,68,.72);
          background:rgba(239,68,68,.18);
        }

        .jl-answer-note {
          margin-top:10px;
          border-radius:16px;
          padding:10px 12px;
          font-size:12px;
          line-height:1.8;
          font-weight:900;
        }

        .jl-answer-note--correct {
          background:rgba(16,185,129,.14);
          color:#d1fae5;
          border:1px solid rgba(16,185,129,.28);
        }

        .jl-answer-note--wrong {
          background:rgba(239,68,68,.14);
          color:#fecaca;
          border:1px solid rgba(239,68,68,.28);
        }

        .jl-quiz-footer {
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          gap:12px;
          margin-top:16px;
        }

        .jl-quiz-submit {
          padding:13px 18px;
          border-radius:18px;
          color:#24123f;
          background:linear-gradient(135deg,#c4b5fd,#a855f7);
          font-size:12px;
          font-weight:950;
        }

        .jl-quiz-result {
          flex:1;
          min-width:220px;
          border-radius:18px;
          padding:12px 14px;
          font-size:12px;
          line-height:1.8;
          font-weight:900;
        }

        .jl-quiz-result--pass {
          background:rgba(16,185,129,.14);
          color:#d1fae5;
        }

        .jl-quiz-result--fail {
          background:rgba(239,68,68,.14);
          color:#fecaca;
        }

        .jl-exact-source {
          margin-top:24px;
          border-radius:24px;
          background:#f4f0fb;
          border:1px solid rgba(167, 139, 250,.28);
          overflow:hidden;
        }

        .jl-exact-source summary {
          cursor:pointer;
          padding:16px 18px;
          color:#6d28d9;
          background:#efe9fb;
          font-size:13px;
          font-weight:950;
        }

        .jl-exact-source pre {
          margin:0;
          padding:18px;
          white-space:pre-wrap;
          word-break:break-word;
          overflow:auto;
          color:#18102e;
          background:white;
          font-family:Tajawal, Arial, Tahoma, sans-serif;
          font-size:14px;
          line-height:2;
          font-weight:650;
        }

        .jl-empty {
          border-radius:24px;
          padding:22px;
          background:#f4f0fb;
          color:#7a6c9a;
          border:1px dashed rgba(100,116,139,.35);
          font-size:13px;
          font-weight:900;
          text-align:center;
        }

        @media (max-width:980px) {
          .jl-hero-inner,
          .jl-lesson-shell {
            grid-template-columns:1fr;
          }

          .jl-control-deck,
          .jl-month-grid {
            grid-template-columns:1fr;
          }

          .jl-weeks-grid {
            grid-template-columns:1fr;
          }

          .jl-days-grid {
            grid-template-columns:repeat(2,minmax(0,1fr));
          }

          .jl-stage-head {
            grid-template-columns:1fr;
          }

          .jl-quote {
            max-width:100%;
          }

          .jl-lesson-side {
            position:relative;
            top:auto;
          }
        }

        @media (max-width:560px) {
          .journey-lab {
            padding:16px 10px 44px;
          }

          .jl-hero,
          .jl-stage-panel,
          .jl-reader {
            border-radius:26px;
            padding:20px;
          }

          .jl-days-grid {
            grid-template-columns:1fr;
          }
        }
      `}</style>

      <div className="jl-wrap">
        <header className="jl-hero">
          <div className="jl-hero-inner">
            <div>
              <span className="jl-eyebrow">Ø±Ø­Ù„ØªÙƒ Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠØ© Â· 6 Ø£Ø´Ù‡Ø± Â· OD Mastery</span>

              <h1 className="jl-title">
                Ø±Ø­Ù„Ø© ØªØ¹Ù„ÙŠÙ…ÙŠØ© Ù…ØªØ¯Ø±Ø¬Ø©
                <span>Ø´Ù‡Ø± â† Ø£Ø³Ø¨ÙˆØ¹ â† ÙŠÙˆÙ… â† Ø¯Ø±Ø³ â† Ø§Ø®ØªØ¨Ø§Ø±</span>
              </h1>

              <p>
                ØªÙ… ØªØµÙ…ÙŠÙ… Ø§Ù„Ø±Ø­Ù„Ø© ÙƒØ¨ÙˆØ§Ø¨Ø§Øª Ø¥ØªÙ‚Ø§Ù† Ù„Ø§ ÙƒØµÙØ­Ø© Ø·ÙˆÙŠÙ„Ø© Ù…Ø´ØªØªØ©. ÙƒÙ„ Ø´Ù‡Ø± ÙŠÙØªØ­ Ø£Ø³Ø§Ø¨ÙŠØ¹Ù‡ØŒ
                ÙˆÙƒÙ„ Ø£Ø³Ø¨ÙˆØ¹ ÙŠÙØªØ­ Ø£ÙŠØ§Ù…Ù‡ØŒ ÙˆÙƒÙ„ ÙŠÙˆÙ… ÙŠØ­ØªÙˆÙŠ Ø¹Ù„Ù‰ Ø¯Ø±Ø³ Ù…Ù†Ø³Ù‚ ÙˆØ§Ø®ØªØ¨Ø§Ø± ÙÙ‡Ù… Ù‚Ø¨Ù„ Ø­ÙØ¸ Ø§Ù„Ø¥Ù†Ø¬Ø§Ø².
              </p>
            </div>

            <div className="jl-gauge-stage">
              <NeoMetricGauge
                className="jl-hero-gauge"
                value={Math.min(100, Math.max(0, overallProgress))}
                max={100}
                displayValue={arabicPercent(overallProgress)}
                label="من الرحلة الكاملة"
                status={overallProgress >= 100 ? "complete" : "progress"}
                size="hero"
              />
              </div>
            </div>
        </header>

        <section className="jl-control-deck">
          <MiniProgress
            label="Ø§Ù„ØªÙ‚Ø¯Ù… Ø§Ù„ÙƒÙ„ÙŠ"
            value={overallProgress}
            help={`${totalCompletedDays} Ù…Ù† ${totalCourseDays} ÙŠÙˆÙ…Ù‹Ø§`}
          />

          <MiniProgress
            label={`ØªÙ‚Ø¯Ù… ${selectedMonth?.title || "Ø§Ù„Ø´Ù‡Ø±"}`}
            value={monthProgress}
            help={`${monthCompletedDays} Ù…Ù† ${monthTotalDays} ÙŠÙˆÙ…Ù‹Ø§`}
          />

          <MiniProgress
            label={`ØªÙ‚Ø¯Ù… ${selectedWeek?.title || "Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹"}`}
            value={weekProgress}
            help={`${weekCompletedDays} Ù…Ù† ${weekTotalDays} Ø£ÙŠØ§Ù…`}
          />
        </section>

        <CourseSearch
          course={course}
          onJump={jumpToSearchResult}
          placeholder="Ø§Ø¨Ø­Ø« Ø¹Ù† RACIØŒ Ø§Ù„Ø«Ù‚Ø§ÙØ©ØŒ Ø§Ù„ØªØºÙŠÙŠØ±ØŒ Ø§Ù„ÙˆØµÙ Ø§Ù„ÙˆØ¸ÙŠÙÙŠØŒ Ù‚ÙŠØ§Ø³ Ø§Ù„Ø£Ø«Ø±..."
        />

        <SavedLessonsPanel
          bookmarks={lessonBookmarks}
          loading={bookmarksLoading}
          onRefresh={loadBookmarksSafely}
          onJump={jumpToBookmark}
        />

        <div className="jl-top-actions">
          <div className="jl-breadcrumbs">
            <button type="button" className="jl-crumb" onClick={() => setStage("months")}>
              Ø§Ù„Ø´Ù‡ÙˆØ±
            </button>

            <button
              type="button"
              className="jl-crumb"
              onClick={() => setStage("weeks")}
              disabled={stage === "months"}
            >
              {selectedMonth?.title || "Ø§Ù„Ø´Ù‡Ø±"}
            </button>

            <button
              type="button"
              className="jl-crumb"
              onClick={() => setStage("days")}
              disabled={stage === "months" || stage === "weeks"}
            >
              {selectedWeek?.title || "Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹"}
            </button>

            <button
              type="button"
              className="jl-crumb"
              disabled={stage !== "lesson"}
            >
              {selectedDay?.label || "Ø§Ù„ÙŠÙˆÙ…"}
            </button>
          </div>

          <div className="jl-breadcrumbs">
            {stage !== "months" && (
              <button type="button" className="jl-back" onClick={goBack}>
                Ø±Ø¬ÙˆØ¹ Ø®Ø·ÙˆØ©
              </button>
            )}

            <button type="button" className="jl-main-btn" onClick={openNextPoint}>
              ÙˆØ§ØµÙ„ Ù…Ù† Ø¢Ø®Ø± Ù…Ø­Ø·Ø©
            </button>
          </div>
        </div>

        {notice && <div className="jl-notice">{notice}</div>}
        {loading && <div className="jl-notice jl-loading">Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ ØªÙ‚Ø¯Ù…Ùƒ...</div>}

        <main className="jl-stage-panel">
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
              {course.map((month) => {
                const state = monthState(month);
                const total = daysPerMonth;
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
                      <span>{done} Ù…Ù† {total} ÙŠÙˆÙ…Ù‹Ø§ Â· {arabicPercent(percent)}</span>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {stage === "weeks" && (
            <section className="jl-weeks-grid">
              {selectedMonth.weeks.map((week) => {
                const state = weekState(week, selectedMonth);
                const total = getContentDays(week).length;
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
                      <span>{stateLabels[state]}</span>
                      <span>{done} Ù…Ù† {total} Ø£ÙŠØ§Ù… Â· {arabicPercent(percent)}</span>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {stage === "days" && (
            <section className="jl-days-grid">
              {selectedWeek.days.map((day) => {
                const state = dayState(day, selectedWeek, selectedMonth);

                return (
                  <button
                    key={day.id}
                    type="button"
                    className={`jl-day-card jl-day-card--${state}`}
                    onClick={() => handleDayClick(day)}
                    disabled={state === "locked"}
                  >
                    <div className="jl-day-number">
                      {state === "completed" ? "âœ“" : state === "locked" ? "ðŸ”’" : day.dayIndex}
                    </div>

                    <strong>{day.label}</strong>
                    <small>{stateLabels[state]}</small>
                  </button>
                );
              })}
            </section>
          )}

          {stage === "lesson" && selectedDay && (
            <section className="jl-lesson-shell">
              <aside className="jl-lesson-side">
                <span className={`jl-pill jl-pill--${currentDayState}`}>
                  {stateLabels[currentDayState]}
                </span>

                <h3>{selectedDay.title}</h3>

                <p>
                  {selectedMonth.title} Â· {selectedWeek.title} Â· {selectedDay.label}
                </p>

                <div className="jl-lesson-actions">
                  <button
                    type="button"
                    className="jl-ghost-btn"
                    onClick={toggleCurrentBookmark}
                    disabled={bookmarkSaving || currentDayState === "locked"}
                  >
                    {bookmarkSaving
                      ? "Ø¬Ø§Ø±Ù ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø§Øª..."
                      : currentBookmark
                        ? "Ø¥Ø²Ø§Ù„Ø© Ù…Ù† Ø§Ù„Ø¯Ø±ÙˆØ³ Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø© â˜…"
                        : "Ø­ÙØ¸ Ù‡Ø°Ø§ Ø§Ù„Ø¯Ø±Ø³ â˜†"}
                  </button>

                  {bookmarkStatus && <div className="jl-bookmark-status">{bookmarkStatus}</div>}

                  <button
                    type="button"
                    className="jl-complete"
                    onClick={completeCurrentDay}
                    disabled={saving || currentDayState !== "active" || !canCompleteLesson}
                  >
                    {currentDayState === "completed"
                      ? "ØªÙ… Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„ÙŠÙˆÙ…"
                      : saving
                        ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸..."
                        : dayHasQuiz && !quizPassedByDay[selectedDay.id]
                          ? "Ø£ÙƒÙ…Ù„ Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± Ø£ÙˆÙ„Ù‹Ø§"
                          : "Ø¥Ù†Ù‡Ø§Ø¡ Ø§Ù„ÙŠÙˆÙ… ÙˆØ­ÙØ¸ Ø§Ù„ØªÙ‚Ø¯Ù…"}
                  </button>

                  {currentDayState === "completed" && (
                    <button type="button" className="jl-ghost-btn" onClick={openNextPoint}>
                      Ø§ÙØªØ­ Ø§Ù„Ù…Ø­Ø·Ø© Ø§Ù„ØªØ§Ù„ÙŠØ©
                    </button>
                  )}

                  <button type="button" className="jl-ghost-btn" onClick={() => setStage("days")}>
                    Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ø£ÙŠØ§Ù… Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹
                  </button>
                </div>
              </aside>

              <article className="jl-reader">
                {selectedWeek.intro && selectedDay.dayIndex === 1 && (
                  <div className="jl-week-intro">{selectedWeek.intro}</div>
                )}

                <RichLesson text={preparedLesson.lessonText} />

                <LessonNotesPanel
                  monthIndex={selectedDay.monthIndex}
                  weekIndex={selectedDay.weekIndex}
                  dayIndex={selectedDay.dayIndex}
                  title="Ù…Ù„Ø§Ø­Ø¸ØªÙƒ Ø§Ù„Ù…Ù‡Ù†ÙŠØ© Ø¹Ù„Ù‰ Ù‡Ø°Ø§ Ø§Ù„ÙŠÙˆÙ…"
                />

                <QuizPanel
                  day={selectedDay}
                  questions={preparedLesson.quiz}
                  hasQuizText={preparedLesson.hasQuizText}
                  onPass={() => {
                    setQuizPassedByDay((current) => ({
                      ...current,
                      [selectedDay.id]: true
                    }));
                  }}
                />

              </article>
            </section>
          )}
        </main>
      </div>
    </section>
  );
}

