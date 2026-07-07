import { useEffect, useMemo, useState } from "react";
import { courseMap as rawCourseMap, COURSE_TOTALS } from "../data/courseContent";
import { markDayOpened, updateUserProgress } from "../lib/progressService";
import {
  toOfficialCompletedDays,
  toOfficialMonthCompletedDays
} from "../lib/journeyProgress";
import LessonNotesPanel from "./LessonNotesPanel";
import CourseSearch from "./CourseSearch";
import SavedLessonsPanel from "./SavedLessonsPanel";
import {
  deleteLessonBookmarkByLocation,
  listLessonBookmarks,
  saveLessonBookmark
} from "../lib/lessonBookmarkService";

const stateLabels = {
  locked: "مقفل",
  active: "متاح",
  completed: "مكتمل"
};

const stageMeta = {
  months: {
    kicker: "بوابة الرحلة",
    title: "اختر الشهر",
    note: "لا يظهر لك كل المحتوى دفعة واحدة. ابدأ بالشهر، ثم افتح الأسبوع، ثم اليوم، ثم الدرس والاختبار.",
    quote: "لا تبدأ بالحل. افهم النظام أولًا."
  },
  weeks: {
    kicker: "خريطة الشهر",
    title: "اختر الأسبوع",
    note: "كل أسبوع بوابة معرفية مستقلة. لا تنتقل للبوابة التالية إلا بعد إكمال ما قبلها.",
    quote: "الإتقان ليس سرعة الوصول؛ بل جودة العبور."
  },
  days: {
    kicker: "مسار الأسبوع",
    title: "اختر اليوم",
    note: "كل أسبوع يحتوي على سبعة أيام تعليمية. كل يوم يفتح بعد إكمال اليوم السابق.",
    quote: "اليوم الصغير المتقن يصنع عقلًا مهنيًا كبيرًا."
  },
  lesson: {
    kicker: "غرفة الدرس والاختبار",
    title: "اقرأ الدرس ثم اختبر فهمك",
    note: "الدرس منسق إلى فقرات وأقسام، ثم يأتي اختبار اليوم بثلاثة أسئلة متعددة الخيارات.",
    quote: "لا تحفظ النص؛ استخرج منه حكمًا مهنيًا."
  }
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

const HEADING_PHRASES = [
  "الفكرة المركزية",
  "ما المقصود بالتطوير التنظيمي؟",
  "لماذا لا تبدأ بالحل؟",
  "الفرق بين الشكوى والفرضية والدليل",
  "قاعدة اليوم",
  "تطبيق اليوم",
  "أداة اليوم",
  "مثال تطبيقي",
  "لماذا هذا مهم؟",
  "متى نستخدمه؟",
  "متى لا نستخدمه؟",
  "أخطاء شائعة",
  "مكونات الخطة",
  "مؤشرات النجاح",
  "المهمة النهائية",
  "الحصيلة المعرفية",
  "القراءة المهنية",
  "البيانات المطلوبة",
  "مخاطر التطبيق",
  "خطة التنفيذ",
  "خطة القياس",
  "خطة الاستدامة"
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

function localizeQuizText(value) {
  return safeText(value)
    .replace(/\bEntry & Contracting Brief\b/g, "موجز الدخول والتعاقد")
    .replace(/\bMulti-Level Diagnostic Brief\b/g, "موجز التشخيص متعدد المستويات")
    .replace(/\bDesign Principles & Operating Model Brief\b/g, "موجز مبادئ التصميم ونموذج التشغيل")
    .replace(/\bCulture Diagnostic Brief\b/g, "موجز تشخيص الثقافة")
    .replace(/\bOrganization Design Brief\b/g, "موجز تصميم المنظمة")
    .replace(/\bJob Description Quality Review\b/g, "مراجعة جودة الوصف الوظيفي")
    .replace(/\bOD Impact Measurement Brief\b/g, "موجز قياس أثر التطوير التنظيمي")
    .replace(/\bOD Dashboard & Insight Brief\b/g, "موجز لوحة التطوير التنظيمي والبصيرة")
    .replace(/\bOD Dashboard\b/g, "لوحة التطوير التنظيمي")
    .replace(/\bSustainability & Exit Brief\b/g, "موجز الاستدامة والخروج")
    .replace(/\bCulture Change Intervention Brief\b/g, "موجز تدخل تغيير الثقافة")
    .replace(/\bLearning System Brief\b/g, "موجز نظام التعلم")
    .replace(/\bContinuous Capability Brief\b/g, "موجز القدرة المستمرة")
    .replace(/\bOD Professional Portfolio & Capstone Brief\b/g, "ملف الاحتراف ومشروع التخرج لممارس التطوير التنظيمي")
    .replace(/\bOD Practitioner\b/g, "ممارس التطوير التنظيمي")
    .replace(/\bProfessional Portfolio\b/g, "ملف الاحتراف")
    .replace(/\bCapstone Brief\b/g, "موجز مشروع التخرج")
    .replace(/\bPortfolio\b/g, "ملف الأعمال")
    .replace(/\bAccountable\b/g, "مسؤول نهائيًا")
    .replace(/\bCalibration\b/g, "المعايرة")
    .replace(/\bTeam Charter\b/g, "ميثاق الفريق")
    .replace(/\bCoaching\b/g, "التوجيه الفردي")
    .replace(/\bMentoring\b/g, "الإرشاد المهني")
    .replace(/\bMidpoint Goals\b/g, "الأهداف الوسطية")
    .replace(/\bPilot\b/g, "التجربة المحدودة")
    .replace(/\bRollout\b/g, "التوسع في التطبيق")
    .replace(/\bImplementation Feedback\b/g, "تغذية راجعة عن التنفيذ")
    .replace(/\bEvaluation Feedback\b/g, "تغذية راجعة عن التقييم")
    .replace(/\bAAR\b/g, "مراجعة ما بعد العمل")
    .replace(/\bSurvey Feedback\b/g, "التغذية الراجعة بالاستبيان")
    .replace(/\bOrganization Design\b/g, "تصميم المنظمة")
    .replace(/\bOrganization Structure\b/g, "الهيكل التنظيمي")
    .replace(/\bPeople Analytics\b/g, "تحليلات الأفراد")
    .replace(/\bHRBP\b/g, "شريك الموارد البشرية")
    .replace(/\bHRM\b/g, "إدارة الموارد البشرية")
    .replace(/\bWhat\b/g, "ماذا")
    .replace(/\bHow\b/g, "كيف")
    .replace(/\bSenge\b/g, "سنجي")
    .replace(/\bRACI\b/g, "مصفوفة المسؤوليات")
    .replace(/\bHR\b/g, "الموارد البشرية")
    .replace(/\bOD\b/g, "التطوير التنظيمي")
    .replace(/\bISODC Code of Ethics\b/g, "مدونة أخلاقيات ممارسة التطوير التنظيمي")
    .replace(/\bself mastery\b/gi, "إتقان الذات");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function progressKey(monthIndex, weekIndex, dayIndex) {
  return `${monthIndex}-${weekIndex}-${dayIndex}`;
}

function arabicPercent(value) {
  const clean = Number.isFinite(value) ? value : 0;
  return `${Math.round(clean)}٪`;
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
          label: day.label || `اليوم ${ARABIC_ORDINAL[dayIndex] || dayIndex}`,
          title: day.title || day.name || `اليوم ${ARABIC_ORDINAL[dayIndex] || dayIndex}`,
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
        title: week.title || week.name || `الأسبوع ${ARABIC_ORDINAL[weekIndex] || weekIndex}`,
        subtitle: week.subtitle || week.description || "",
        intro: safeText(week.intro ?? week.summary ?? ""),
        days
      };
    });

    return {
      ...month,
      id: month.id || `m${monthIndex}`,
      monthIndex,
      title: month.title || month.name || `الشهر ${monthIndex}`,
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

function scrollLessonToTop() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const target = document.querySelector(".journey-lab .jl-reader") || document.querySelector(".journey-lab");
      target?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
  });
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
    .replace(/ملحق غير مخصص لنسخة المتدرب[\s\S]*$/g, "")
    .replace(/مفتاح إجابات[\s\S]*$/g, "")
    .trim();

  const quizMatch = cleanText.match(/اختبار\s+اليوم[\s\S]*$/);
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
          text: localizeQuizText(option),
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
        text: localizeQuizText(option.text || option.label || option.value || ""),
        isCorrect:
          Boolean(option.isCorrect) ||
          Boolean(option.correct) ||
          correctKey === key ||
          correctKey === option.text
      };
    });

    return {
      id: q.id || `q-${index + 1}`,
      question: localizeQuizText(q.question || q.title || q.text || ""),
      options,
      hasKnownCorrectAnswer: options.some((option) => option.isCorrect)
    };
  }).filter((q) => q.question && q.options.length);
}

const ARABIC_DAY_NAMES = {
  1: ["الأول", "الاول", "١", "1"],
  2: ["الثاني", "٢", "2"],
  3: ["الثالث", "٣", "3"],
  4: ["الرابع", "٤", "4"],
  5: ["الخامس", "٥", "5"],
  6: ["السادس", "٦", "6"],
  7: ["السابع", "٧", "7"]
};

function normalizeAnswerLetter(value) {
  const letter = safeText(value).trim().toUpperCase();
  const map = {
    "أ": "A",
    "ا": "A",
    "A": "A",
    "ب": "B",
    "B": "B",
    "ج": "C",
    "C": "C",
    "د": "D",
    "D": "D"
  };

  return map[letter] || "";
}

function normalizeArabicDigits(value) {
  const digits = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9"
  };

  return safeText(value).replace(/[٠-٩]/g, (digit) => digits[digit] || digit);
}

function getAnswerKeyBlockForDay(day, fullText) {
  const text = normalizeArabicDigits(fullText);
  const answerKeyIndex = text.search(/مفتاح\s+إجابات|مفتاح\s+الاجابات|مفاتيح\s+الإجابة|مفاتيح\s+الاجابة/);

  if (answerKeyIndex < 0) return "";

  const answerText = text.slice(answerKeyIndex);
  const dayNames = ARABIC_DAY_NAMES[Number(day?.dayIndex)] || [];

  for (const dayName of dayNames) {
    const pattern = new RegExp(`اليوم\\s+${escapeRegExp(dayName)}\\s*[:：]?([\\s\\S]*?)(?=\\n\\s*اليوم\\s+(?:الأول|الاول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|[1-7])\\s*[:：]?|$)`);
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

  const regex = /(?:السؤال\s*)?([1-9]\d*)\s*[-–—:：]\s*([A-Dأابجد])/gi;
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
    .split(/(?=السؤال\s+\d+)/g)
    .map((item) => item.trim())
    .filter((item) => /^السؤال\s+\d+/.test(item));

  const questions = blocks.map((block, index) => {
    const withoutLabel = block.replace(/^السؤال\s+\d+\s*/g, "").trim();

    // يدعم الخيارات الإنجليزية A/B/C/D والخيارات العربية أ/ب/ج/د.
    const questionMatch = withoutLabel.match(/^([\s\S]*?)(?=\s+(?:[A-D]|أ|ب|ج|د)\.)/);
    const question = questionMatch ? questionMatch[1].trim() : withoutLabel;

    const options = [];
    const optionRegex = /([A-D]|أ|ب|ج|د)\.\s*([\s\S]*?)(?=(?:\s+(?:[A-D]|أ|ب|ج|د)\.)|$)/g;
    let match;

    while ((match = optionRegex.exec(withoutLabel)) !== null) {
      const optionKeyMap = {
        "أ": "A",
        "ب": "B",
        "ج": "C",
        "د": "D"
      };

      options.push({
        id: optionKeyMap[match[1]] || match[1],
        originalKey: match[1],
        text: localizeQuizText(match[2].trim()),
        isCorrect: false
      });
    }

    return {
      id: `${day.id}-parsed-q-${index + 1}`,
      question: localizeQuizText(question),
      // تعديل مهم: لا نعيد ترتيب الخيارات؛ حتى تبقى كما وردت في المحتوى التعليمي.
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
    // النص الكامل محفوظ داخليًا للمعالجة، ولا يُعرض للمتدرب كملف مصدر.
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
    .replace(/([^\n])([•·]\s)/g, "$1\n$2")
    .replace(/([^\n])(السؤال\s+\d+)/g, "$1\n\n$2")
    .replace(/([؟.!])(?=[اأإآء-ي])/g, "$1\n")
    .replace(/(:)(?=[اأإآء-ي])/g, "$1\n");

  HEADING_PHRASES.forEach((heading) => {
    const pattern = new RegExp(`(\\d+\\.\\s*${escapeRegExp(heading)})(?=[اأإآء-ي])`, "g");
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
    return <div className="jl-empty">لا يوجد نص لهذا اليوم بعد.</div>;
  }

  return (
    <div className="jl-rich-text">
      {lines.map((line, index) => {
        const key = `${index}-${line.slice(0, 16)}`;

        if (/^الشهر\s+/.test(line)) {
          return <h1 key={key}>{line}</h1>;
        }

        if (/^الأسبوع\s+/.test(line)) {
          return <h2 key={key}>{line}</h2>;
        }

        if (/^اليوم\s+/.test(line)) {
          return <h2 key={key}>{line}</h2>;
        }

        if (/^\d+\.\s/.test(line)) {
          return <h3 key={key}>{line}</h3>;
        }

        if (/^[•·-]\s/.test(line)) {
          return <div key={key} className="jl-bullet">{line.replace(/^[•·-]\s/, "")}</div>;
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
  // لا نعرض النص الخام للمتدرب؛ المحتوى يظهر فقط كدرس منسق.
  return null;
}

function StatusMark({ state }) {
  if (state === "completed") return <span className="jl-status jl-status--completed">✓</span>;
  if (state === "locked") return <span className="jl-status jl-status--locked">🔒</span>;
  return <span className="jl-status jl-status--active">●</span>;
}

function MiniProgress({ label, value, help }) {
  return (
    <div className="jl-mini-progress">
      <div className="jl-mini-head">
        <span>{label}</span>
        <strong>{arabicPercent(value)}</strong>
      </div>

      <div className="jl-mini-track">
        <i style={{ width: `${Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))}%` }} />
      </div>

      {help && <small>{help}</small>}
    </div>
  );
}

function QuizPanel({ day, questions, hasQuizText = false, onPass, completionAction = null }) {
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
  const submittedCompleteAttempt = submitted && allAnswered;
  const showCompletionAction = submittedCompleteAttempt && completionAction?.show;

  function submitQuiz() {
    setSubmitted(true);
    if (allAnswered) onPass(true);
  }

  if (!questions.length) {
    return (
      <div className="jl-quiz jl-quiz-soft">
        <h3>اختبار اليوم</h3>
        {hasQuizText ? (
          <>
            <p>
              يوجد اختبار في النص الأصلي، لكن لم أستطع تحويله تلقائيًا إلى أزرار اختيار.
              اقرأ اختبار اليوم من الدرس، ثم اضغط الزر التالي لتأكيد أنك أجبت عنه.
            </p>
            <button type="button" className="jl-quiz-submit" onClick={() => onPass(true)}>
              أجبت على اختبار اليوم من النص الأصلي
            </button>
          </>
        ) : (
          <p>لم يتم العثور على اختبار منفصل داخل بيانات هذا اليوم. يمكنك إنهاء اليوم بعد قراءة الدرس.</p>
        )}

      </div>
    );
  }

  return (
    <section className="jl-quiz" aria-label="اختبار اليوم">
      <div className="jl-quiz-header">
        <span>اختبار اليوم</span>
        <strong>{answeredCount} / {total}</strong>
      </div>

      <h3>اختبر فهمك قبل حفظ الإنجاز</h3>

      {total !== 3 && (
        <div className="jl-quiz-warning">
          تنبيه: المتوقع أن يحتوي اختبار كل يوم على 3 أسئلة. هذا اليوم ظهر فيه {total} سؤال/أسئلة بعد التحويل الآلي.
          راجع الدرس مرة أخرى إذا احتجت قبل المتابعة.
        </div>
      )}

      {!hasKnownAnswers && (
        <div className="jl-quiz-warning">
          تم استخراج الأسئلة من النص، لكن لم توجد مفاتيح إجابة منظمة في بيانات هذا اليوم. سيتم اعتبار الاختبار مكتملًا بعد الإجابة عن كل الأسئلة.
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
                      <span>{["أ", "ب", "ج", "د"][optionIndex] || optionIndex + 1}</span>
                      <strong>{option.text}</strong>
                    </button>
                  );
                })}
              </div>

              {submitted && hasKnownAnswers && correctOption && (
                <div className={answeredCorrectly ? "jl-answer-note jl-answer-note--correct" : "jl-answer-note jl-answer-note--wrong"}>
                  {answeredCorrectly
                    ? "إجابتك صحيحة."
                    : `الإجابة الصحيحة: ${correctOption.text}`}
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
          تحقق من الاختبار
        </button>

        {submitted && (
          <div className={passed ? "jl-quiz-result jl-quiz-result--pass" : "jl-quiz-result jl-quiz-result--fail"}>
            {hasKnownAnswers
              ? passed
                ? `ممتاز. نتيجتك ${score} من ${total}. يمكنك حفظ إنجاز اليوم.`
                : `نتيجتك ${score} من ${total}. راجع إجاباتك، ويمكنك الانتقال بعد تسجيل المحاولة.`
              : "تم تسجيل محاولة الاختبار. يمكنك حفظ إنجاز اليوم."}
          </div>
        )}

        {showCompletionAction && (
          <button
            type="button"
            className="jl-quiz-submit"
            onClick={completionAction.onClick}
            disabled={completionAction.disabled}
          >
            {completionAction.label}
          </button>
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
      .join(" ← ");
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

  // العدد الفعلي داخل المحتوى يبقى كما هو حتى لا ينكسر فتح الأسابيع والشهور.
  // العرض أمام المتدرب يتبع الخطة المعتمدة: 6 أشهر × 4 أسابيع × 7 أيام = 168 يومًا تعليميًا.
  const actualCourseDays = getCourseTotalDays(course);
  const totalCourseDays = COURSE_TOTALS?.totalDays || 168;
  const daysPerMonth = COURSE_TOTALS?.daysPerMonth || 30;

  const totalCompletedDays = course.reduce(
    (sum, month) => sum + countCompletedInMonth(completedSet, month),
    0
  );
  const officialCompletedDays = toOfficialCompletedDays(totalCompletedDays, {
    actualDays: actualCourseDays,
    officialDays: totalCourseDays
  });

  const actualMonthDays = selectedMonth
    ? selectedMonth.weeks.reduce((sum, week) => sum + getContentDays(week).length, 0)
    : 0;

  const monthTotalDays = selectedMonth ? daysPerMonth : 0;
  const weekTotalDays = selectedWeek ? getContentDays(selectedWeek).length : 0;
  const monthCompletedDays = selectedMonth ? countCompletedInMonth(completedSet, selectedMonth) : 0;
  const officialMonthCompletedDays = selectedMonth
    ? toOfficialMonthCompletedDays(monthCompletedDays, selectedMonth)
    : 0;
  const weekCompletedDays = selectedWeek ? countCompletedInWeek(completedSet, selectedWeek) : 0;

  const overallProgress = totalCourseDays ? (officialCompletedDays / totalCourseDays) * 100 : 0;
  const monthProgress = monthTotalDays ? (officialMonthCompletedDays / monthTotalDays) * 100 : 0;
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

  function openLearningPoint(point) {
    if (!point?.month || !point?.week || !point?.day) return false;

    setSelectedMonthIndex(point.month.monthIndex);
    setSelectedWeekIndex(point.week.weekIndex);
    setSelectedDayIndex(point.day.dayIndex);
    setStage("lesson");
    setNotice("");
    scrollLessonToTop();
    return true;
  }

  function findLearningPointAfter(day) {
    if (!day) return null;

    let passedCurrentDay = false;

    for (const month of course) {
      for (const week of month.weeks) {
        const days = getContentDays(week).sort((a, b) => a.dayIndex - b.dayIndex);

        for (const item of days) {
          if (passedCurrentDay) {
            return { month, week, day: item };
          }

          if (
            item.monthIndex === day.monthIndex &&
            item.weekIndex === day.weekIndex &&
            item.dayIndex === day.dayIndex
          ) {
            passedCurrentDay = true;
          }
        }
      }
    }

    return null;
  }

  function openNextLessonAfter(day = selectedDay) {
    const nextPoint = findLearningPointAfter(day);

    if (!nextPoint?.month || !nextPoint?.week || !nextPoint?.day) {
      setNotice("أكملت الرحلة التعليمية كاملة.");
      return false;
    }

    return openLearningPoint(nextPoint);
  }

  function openNextPoint() {
    return openLearningPoint(firstAvailableLearningPoint());
  }

  function jumpToSearchResult(result) {
    if (!result) return;

    const targetMonth = course.find((month) => month.monthIndex === result.monthIndex);
    const targetWeek = targetMonth?.weeks?.find((week) => week.weekIndex === result.weekIndex);
    const targetDay = targetWeek?.days?.find((day) => day.dayIndex === result.dayIndex);

    if (!targetMonth || !targetWeek || !targetDay) {
      setNotice("لم أستطع العثور على هذه النتيجة داخل خريطة الرحلة.");
      return;
    }

    setSelectedMonthIndex(targetMonth.monthIndex);
    setSelectedWeekIndex(targetWeek.weekIndex);
    setSelectedDayIndex(targetDay.dayIndex);

    if (!isMonthUnlocked(targetMonth)) {
      setStage("months");
      setNotice("هذه النتيجة ضمن شهر لم يُفتح بعد. أكمل الشهر السابق أولًا.");
      return;
    }

    if (!isWeekUnlocked(targetWeek, targetMonth)) {
      setStage("weeks");
      setNotice("هذه النتيجة ضمن أسبوع لم يُفتح بعد. أكمل الأسبوع السابق أولًا.");
      return;
    }

    if (!isDayUnlocked(targetDay, targetWeek, targetMonth)) {
      setStage("days");
      setNotice("هذه النتيجة ضمن يوم لم يُفتح بعد. أكمل اليوم السابق أولًا.");
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
      console.warn("تعذر تحميل الدروس المحفوظة:", error);
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
        setBookmarkStatus("تمت إزالة الدرس من المحفوظات.");
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
      setBookmarkStatus("تم حفظ الدرس في قائمتك.");
    } catch (error) {
      setBookmarkStatus(error?.message || "تعذر تحديث الدروس المحفوظة.");
    } finally {
      setBookmarkSaving(false);
      window.setTimeout(() => setBookmarkStatus(""), 2600);
    }
  }

  async function completeCurrentDay(options = {}) {
    if (!selectedDay) return;
    const shouldOpenNext = Boolean(options?.goNext);
    const completedDay = selectedDay;

    if (!isDayUnlocked(selectedDay, selectedWeek, selectedMonth)) return;
    if (isDayCompleted(selectedDay, completedSet)) {
      if (shouldOpenNext) openNextLessonAfter(completedDay);
      return;
    }

    const hasQuiz = preparedLesson.quiz.length > 0;
    const quizPassed = quizPassedByDay[selectedDay.id];

    if (hasQuiz && !quizPassed) {
      setNotice("أجب عن اختبار اليوم أولًا، ثم احفظ الإنجاز.");
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

      setNotice(
        shouldOpenNext
          ? "تم حفظ إنجاز اليوم. ننتقل الآن للدرس التالي."
          : "تم حفظ إنجاز اليوم. فُتحت لك المحطة التالية."
      );

      if (shouldOpenNext) {
        window.setTimeout(() => openNextLessonAfter(completedDay), 120);
      }
    } catch (error) {
      setNotice(error?.message || "تعذر حفظ التقدم. تأكد من تسجيل الدخول أو إعداد Supabase.");
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
        <div className="jl-empty">لم يتم العثور على محتوى الرحلة داخل courseContent.</div>
      </section>
    );
  }

  const currentMeta = stageMeta[stage];
  const currentDayState = selectedDay ? dayState(selectedDay) : "locked";
  const dayHasQuiz = preparedLesson.hasQuizText || preparedLesson.quiz.length > 0;
  const canCompleteLesson =
    currentDayState === "active" &&
    (!dayHasQuiz || quizPassedByDay[selectedDay?.id]);
  const quizCompletionAction = currentDayState === "completed"
    ? {
        show: true,
        label: "الانتقال للدرس التالي",
        onClick: () => openNextLessonAfter(selectedDay),
        disabled: false
      }
    : {
        show: canCompleteLesson,
        label: saving ? "جارٍ الحفظ..." : "الانتقال للدرس التالي",
        onClick: () => completeCurrentDay({ goNext: true }),
        disabled: saving || currentDayState !== "active" || !canCompleteLesson
      };

  return (
    <section className="journey-lab" dir="rtl">
      <style>{`
        .journey-lab {
          /* الرموز المحلية تُشتقّ الآن من نظام التصميم الموحّد */
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

        .jl-orb-card {
          min-height:230px;
          display:grid;
          place-items:center;
        }

        .jl-orb {
          width:210px;
          height:210px;
          border-radius:999px;
          display:grid;
          place-items:center;
          background:
            radial-gradient(circle at 38% 32%, rgba(255,255,255,.96), rgba(199,210,254,.35) 19%, rgba(139, 92, 246,.24) 42%, rgba(28, 17, 48,.08) 66%),
            conic-gradient(from 0deg,#8b5cf6,#7c3aed,#a855f7,#10b981,#8b5cf6);
          box-shadow:inset 0 0 38px rgba(255,255,255,.35),0 30px 90px rgba(139, 92, 246,.34);
        }

        .jl-orb strong {
          display:block;
          color:white;
          font-size:46px;
          font-weight:950;
          text-align:center;
          text-shadow:0 8px 24px rgba(28, 17, 48,.35);
        }

        .jl-orb small {
          display:block;
          color:rgba(255,255,255,.82);
          font-size:11px;
          font-weight:900;
          text-align:center;
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
          margin-bottom:14px;
          padding:12px 14px;
          border-radius:18px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(196,181,253,.18);
          box-shadow:none;
        }

        .jl-quiz-header span {
          color:#c4b5fd;
          font-size:12px;
          font-weight:950;
          background:transparent;
          border:0;
          padding:0;
          box-shadow:none;
        }

        .jl-quiz-header strong {
          color:white;
          font-size:13px;
          font-weight:950;
          display:inline-flex;
          min-width:72px;
          justify-content:center;
          padding:8px 12px;
          border-radius:999px;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(196,181,253,.24);
          box-shadow:none;
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
          border:0;
          border-radius:18px;
          color:#24123f;
          background:linear-gradient(135deg,#c4b5fd,#a855f7);
          box-shadow:0 14px 30px rgba(139,92,246,.24);
          font-size:12px;
          font-weight:950;
          transition:transform .18s ease, box-shadow .18s ease, filter .18s ease;
        }

        .jl-quiz-submit:hover:not(:disabled),
        .jl-quiz-submit:focus-visible:not(:disabled) {
          transform:translateY(-1px);
          filter:saturate(1.04);
          box-shadow:0 18px 36px rgba(139,92,246,.30);
          outline:0;
        }

        .jl-quiz-submit:active:not(:disabled) {
          transform:translateY(0);
          box-shadow:0 10px 22px rgba(139,92,246,.22);
        }

        .jl-quiz-submit:disabled {
          opacity:.58;
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

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-bullet,
        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-bullet {
          color:#2b2147 !important;
          -webkit-text-fill-color:#2b2147 !important;
          background:linear-gradient(180deg,#fbf9ff,#f4f0fb) !important;
          border-color:rgba(167,139,250,.28) !important;
          box-shadow:none !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-bullet *,
        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-bullet * {
          color:inherit !important;
          -webkit-text-fill-color:inherit !important;
          opacity:1 !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-quiz {
          background:linear-gradient(145deg,#ffffff 0%,#f8f4ff 100%) !important;
          color:#24123f !important;
          -webkit-text-fill-color:#24123f !important;
          border:1px solid rgba(139,92,246,.18) !important;
          box-shadow:0 22px 55px rgba(28,17,48,.10) !important;
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-quiz {
          background:linear-gradient(145deg,rgba(24,16,46,.98),rgba(14,8,32,.98)) !important;
          color:#f8f4ff !important;
          -webkit-text-fill-color:#f8f4ff !important;
          border:1px solid rgba(196,181,253,.18) !important;
          box-shadow:0 22px 55px rgba(0,0,0,.24) !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-quiz-header,
        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-quiz-header {
          padding:12px 14px !important;
          border-radius:18px !important;
          margin-bottom:14px !important;
          border:1px solid rgba(139,92,246,.18) !important;
          box-shadow:none !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-quiz-header {
          background:linear-gradient(135deg,rgba(139,92,246,.12),rgba(255,255,255,.86)) !important;
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-quiz-header {
          background:linear-gradient(135deg,rgba(139,92,246,.24),rgba(255,255,255,.06)) !important;
          border-color:rgba(196,181,253,.22) !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-quiz-header span,
        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-quiz-header span {
          background:transparent !important;
          border:0 !important;
          padding:0 !important;
          box-shadow:none !important;
          font-size:12px !important;
          font-weight:950 !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-quiz-header span {
          color:#5b21b6 !important;
          -webkit-text-fill-color:#5b21b6 !important;
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-quiz-header span {
          color:#ddd6fe !important;
          -webkit-text-fill-color:#ddd6fe !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-quiz-header strong,
        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-quiz-header strong {
          display:inline-flex !important;
          min-width:72px !important;
          justify-content:center !important;
          padding:8px 12px !important;
          border-radius:999px !important;
          font-size:13px !important;
          font-weight:950 !important;
          box-shadow:none !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-quiz-header strong {
          background:#ffffff !important;
          color:#4c1d95 !important;
          -webkit-text-fill-color:#4c1d95 !important;
          border:1px solid rgba(139,92,246,.18) !important;
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-quiz-header strong {
          background:rgba(255,255,255,.10) !important;
          color:#ffffff !important;
          -webkit-text-fill-color:#ffffff !important;
          border:1px solid rgba(196,181,253,.24) !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-quiz h3,
        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-question-title span,
        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-option strong {
          color:#24123f !important;
          -webkit-text-fill-color:#24123f !important;
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-quiz h3,
        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-question-title span,
        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-option strong {
          color:#f8f4ff !important;
          -webkit-text-fill-color:#f8f4ff !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-question {
          background:#ffffff !important;
          color:#24123f !important;
          -webkit-text-fill-color:#24123f !important;
          border:1px solid rgba(139,92,246,.16) !important;
          box-shadow:0 14px 34px rgba(36,22,63,.06) !important;
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-question {
          background:rgba(255,255,255,.07) !important;
          color:#f8f4ff !important;
          -webkit-text-fill-color:#f8f4ff !important;
          border:1px solid rgba(196,181,253,.14) !important;
          box-shadow:none !important;
        }

        html[data-theme="light"] body.od-theme-light #root .journey-lab .jl-option:not(.jl-option--selected):not(.jl-option--correct):not(.jl-option--wrong) {
          background:linear-gradient(180deg,#ffffff,#f6f1ff) !important;
          color:#24123f !important;
          -webkit-text-fill-color:#24123f !important;
          border-color:rgba(139,92,246,.18) !important;
        }

        html[data-theme="dark"] body.od-theme-dark #root .journey-lab .jl-option:not(.jl-option--selected):not(.jl-option--correct):not(.jl-option--wrong) {
          background:rgba(24,16,46,.92) !important;
          color:#f8f4ff !important;
          -webkit-text-fill-color:#f8f4ff !important;
          border-color:rgba(196,181,253,.22) !important;
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
              <span className="jl-eyebrow">رحلتك التعليمية · 6 أشهر · OD Mastery</span>

              <h1 className="jl-title">
                رحلة تعليمية متدرجة
                <span>شهر ← أسبوع ← يوم ← درس ← اختبار</span>
              </h1>

              <p>
                تم تصميم الرحلة كبوابات إتقان لا كصفحة طويلة مشتتة. كل شهر يفتح أسابيعه،
                وكل أسبوع يفتح أيامه، وكل يوم يحتوي على درس منسق واختبار فهم قبل حفظ الإنجاز.
              </p>
            </div>

            <div className="jl-orb-card">
              <div
                className="jl-orb od-circular-indicator od-indicator-general"
                style={{ "--od-indicator-progress": `${Math.min(100, Math.max(0, overallProgress))}%` }}
              >
                <div>
                  <strong>{arabicPercent(overallProgress)}</strong>
                  <small>من الرحلة الكاملة</small>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="jl-control-deck">
          <MiniProgress
            label="التقدم الكلي"
            value={overallProgress}
            help={`${officialCompletedDays} من ${totalCourseDays} يومًا`}
          />

          <MiniProgress
            label={`تقدم ${selectedMonth?.title || "الشهر"}`}
            value={monthProgress}
            help={`${officialMonthCompletedDays} من ${monthTotalDays} يومًا`}
          />

          <MiniProgress
            label={`تقدم ${selectedWeek?.title || "الأسبوع"}`}
            value={weekProgress}
            help={`${weekCompletedDays} من ${weekTotalDays} أيام`}
          />
        </section>

        <CourseSearch
          course={course}
          onJump={jumpToSearchResult}
          placeholder="ابحث عن RACI، الثقافة، التغيير، الوصف الوظيفي، قياس الأثر..."
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
              الشهور
            </button>

            <button
              type="button"
              className="jl-crumb"
              onClick={() => setStage("weeks")}
              disabled={stage === "months"}
            >
              {selectedMonth?.title || "الشهر"}
            </button>

            <button
              type="button"
              className="jl-crumb"
              onClick={() => setStage("days")}
              disabled={stage === "months" || stage === "weeks"}
            >
              {selectedWeek?.title || "الأسبوع"}
            </button>

            <button
              type="button"
              className="jl-crumb"
              disabled={stage !== "lesson"}
            >
              {selectedDay?.label || "اليوم"}
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
        {loading && <div className="jl-notice jl-loading">جارٍ تحميل تقدمك...</div>}

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
                const done = toOfficialMonthCompletedDays(
                  countCompletedInMonth(completedSet, month),
                  month
                );
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
                      <span>{done} من {total} يومًا · {arabicPercent(percent)}</span>
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
                      <span>{done} من {total} أيام · {arabicPercent(percent)}</span>
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
                      {state === "completed" ? "✓" : state === "locked" ? "🔒" : day.dayIndex}
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
                  {selectedMonth.title} · {selectedWeek.title} · {selectedDay.label}
                </p>

                <div className="jl-lesson-actions">
                  <button
                    type="button"
                    className="jl-ghost-btn"
                    onClick={toggleCurrentBookmark}
                    disabled={bookmarkSaving || currentDayState === "locked"}
                  >
                    {bookmarkSaving
                      ? "جارٍ تحديث المحفوظات..."
                      : currentBookmark
                        ? "إزالة من الدروس المحفوظة ★"
                        : "حفظ هذا الدرس ☆"}
                  </button>

                  {bookmarkStatus && <div className="jl-bookmark-status">{bookmarkStatus}</div>}

                  <button
                    type="button"
                    className="jl-quiz-submit"
                    onClick={completeCurrentDay}
                    disabled={saving || currentDayState !== "active" || !canCompleteLesson}
                  >
                    {currentDayState === "completed"
                      ? "تم إكمال اليوم"
                      : saving
                        ? "جارٍ الحفظ..."
                        : dayHasQuiz && !quizPassedByDay[selectedDay.id]
                          ? "أكمل الاختبار أولًا"
                          : "إنهاء اليوم وحفظ التقدم"}
                  </button>

                  {currentDayState === "completed" && (
                    <button type="button" className="jl-quiz-submit" onClick={() => openNextLessonAfter(selectedDay)}>
                      الانتقال للدرس التالي
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

                <RichLesson text={preparedLesson.lessonText} />

                <LessonNotesPanel
                  monthIndex={selectedDay.monthIndex}
                  weekIndex={selectedDay.weekIndex}
                  dayIndex={selectedDay.dayIndex}
                  title="ملاحظتك المهنية على هذا اليوم"
                />

                <QuizPanel
                  day={selectedDay}
                  questions={preparedLesson.quiz}
                  hasQuizText={preparedLesson.hasQuizText}
                  completionAction={quizCompletionAction}
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
