import { useEffect, useMemo, useState } from "react";
import { courseMap as rawCourseMap } from "../data/courseContent";
import { markDayOpened, updateUserProgress } from "../lib/progressService";

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
          quiz: day.quiz || day.questions || null
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

function parseQuizText(day, quizText) {
  const structured = normalizeStructuredQuiz(day);
  if (structured.length) return structured;

  const text = safeText(quizText);
  if (!text) return [];

  const blocks = text
    .replace(/\r/g, "")
    .split(/(?=السؤال\s+\d+)/g)
    .map((item) => item.trim())
    .filter((item) => /^السؤال\s+\d+/.test(item));

  return blocks.map((block, index) => {
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
        text: match[2].trim(),
        isCorrect: false
      });
    }

    return {
      id: `${day.id}-parsed-q-${index + 1}`,
      question,
      // تعديل مهم: لا نعيد ترتيب الخيارات؛ حتى تبقى كما وردت في المحتوى التعليمي.
      options,
      hasKnownCorrectAnswer: false
    };
  }).filter((q) => q.question && q.options.length);
}


function normalizeAnswerKey(value) {
  const key = String(value || "").trim();
  const map = {
    "أ": "A",
    "ب": "B",
    "ج": "C",
    "د": "D",
    "a": "A",
    "b": "B",
    "c": "C",
    "d": "D"
  };

  return map[key] || key.toUpperCase();
}

function extractDayAnswerMap(week, day) {
  const appendix = safeText(week?.instructorAppendix || "");

  if (!appendix) {
    return {};
  }

  const dayPatterns = [
    new RegExp(`اليوم\\s+${day.dayIndex}\\s*[:：]([\\s\\S]*?)(?=\\n\\s*اليوم\\s+\\d+\\s*[:：]|$)`, "m"),
    new RegExp(`${escapeRegExp(day.label || "")}\\s*[:：]([\\s\\S]*?)(?=\\n\\s*اليوم\\s+(?:الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|\\d+)\\s*[:：]|$)`, "m")
  ];

  let dayBlock = "";

  for (const pattern of dayPatterns) {
    const match = appendix.match(pattern);
    if (match?.[1]) {
      dayBlock = match[1];
      break;
    }
  }

  if (!dayBlock) {
    return {};
  }

  const answerMap = {};
  const answerRegex = /(\\d+)\\s*[-–—:]\\s*([A-Dأبجد])/g;
  let match;

  while ((match = answerRegex.exec(dayBlock)) !== null) {
    answerMap[Number(match[1])] = normalizeAnswerKey(match[2]);
  }

  return answerMap;
}

function buildOptionExplanation({ question, option, isCorrect, selectedIsCorrect }) {
  if (!option?.text) {
    return "راجع الفكرة المركزية في الدرس ثم اربط السؤال بالنمط التشخيصي المطلوب.";
  }

  if (isCorrect) {
    return `الإجابة صحيحة لأنها الأقرب لمنطق الدرس: ${option.text}`;
  }

  if (selectedIsCorrect === false) {
    return "هذا الخيار يبدو قريبًا، لكنه لا يمثل أدق قراءة مهنية للسؤال. ارجع للعنوان والفكرة المركزية في الدرس وميّز بين الرأي، العرض، الفرضية، والدليل.";
  }

  return `الخيار الصحيح هو: ${option.text}`;
}

function applyAnswerKeysToQuiz({ questions, week, day }) {
  const answerMap = extractDayAnswerMap(week, day);

  return questions.map((question, questionIndex) => {
    const correctKey = answerMap[questionIndex + 1];

    if (!correctKey) {
      return {
        ...question,
        options: question.options.map((option) => ({
          ...option,
          explanation:
            option.explanation ||
            "هذا السؤال مخصص للتأمل والفهم. اربط اختيارك بفكرة الدرس قبل الانتقال."
        })),
        hasKnownCorrectAnswer: Boolean(question.hasKnownCorrectAnswer)
      };
    }

    const options = question.options.map((option) => {
      const isCorrect = normalizeAnswerKey(option.id || option.originalKey) === correctKey;

      return {
        ...option,
        isCorrect,
        explanation: buildOptionExplanation({
          question,
          option,
          isCorrect,
          selectedIsCorrect: isCorrect
        })
      };
    });

    return {
      ...question,
      options,
      hasKnownCorrectAnswer: true
    };
  });
}

function prepareLesson(day, week) {
  const fullText = getDayContent(day);
  const { lessonText, quizText } = splitQuizFromText(fullText);
  const parsedQuiz = parseQuizText(day, quizText);
  const quizWithAnswers = applyAnswerKeysToQuiz({
    questions: parsedQuiz,
    week,
    day
  });

  return {
    fullText,
    lessonText,
    quizText,
    hasQuizText: Boolean(quizText),
    quiz: quizWithAnswers
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

function QuizPanel({ day, questions, hasQuizText = false, completed = false, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [savingAfterCheck, setSavingAfterCheck] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setSavingAfterCheck(false);
  }, [day.id]);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = total > 0 && answeredCount === total;
  const hasKnownAnswers = total > 0 && questions.every((q) => q.hasKnownCorrectAnswer);

  const score = questions.reduce((sum, question) => {
    const selected = answers[question.id];
    const option = question.options.find((item) => item.id === selected);
    return sum + (option?.isCorrect ? 1 : 0);
  }, 0);

  function chooseAnswer(questionId, optionId) {
    if (submitted || completed) return;

    setAnswers((current) => ({
      ...current,
      [questionId]: optionId
    }));
  }

  async function verifyAnswers() {
    if (!allAnswered || submitted || completed) return;

    setSubmitted(true);
    setSavingAfterCheck(true);

    try {
      await onComplete?.({ score, total, hasKnownAnswers });
    } finally {
      setSavingAfterCheck(false);
    }
  }

  if (!questions.length) {
    return (
      <div className="jl-quiz jl-quiz-soft">
        <h3>اختبار اليوم</h3>
        {hasQuizText ? (
          <p>
            اختبار هذا اليوم يحتاج مراجعة في بيانات المحتوى حتى يظهر للمتدرب
            بصيغة تفاعلية واضحة.
          </p>
        ) : (
          <p>لا يوجد اختبار مضاف لهذا اليوم داخل بيانات المحتوى.</p>
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

      <h3>أجب عن الأسئلة ثم تحقّق من إجاباتك</h3>
      <p className="jl-quiz-note">
        بعد الإجابة عن الأسئلة الثلاثة، اضغط زر التحقق لتظهر لك الإجابة الصحيحة
        وسببها، ثم يُحفظ إنجاز اليوم تلقائيًا.
      </p>

      <div className="jl-question-list">
        {questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const selectedOption = question.options.find((option) => option.id === selected);
          const correctOption = question.options.find((option) => option.isCorrect);
          const selectedIsCorrect = Boolean(selectedOption?.isCorrect);

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
                      disabled={submitted || completed}
                      onClick={() => chooseAnswer(question.id, option.id)}
                    >
                      <span>{["أ", "ب", "ج", "د"][optionIndex] || optionIndex + 1}</span>
                      <strong>{option.text}</strong>
                    </button>
                  );
                })}
              </div>

              {submitted && hasKnownAnswers && (
                <div className={selectedIsCorrect ? "jl-feedback jl-feedback--correct" : "jl-feedback jl-feedback--wrong"}>
                  <strong>{selectedIsCorrect ? "إجابة صحيحة" : "الإجابة الأدق"}</strong>
                  <p>
                    {selectedIsCorrect
                      ? selectedOption?.explanation || "اختيارك متسق مع منطق الدرس."
                      : correctOption?.explanation || `الإجابة الصحيحة هي: ${correctOption?.text || "غير محددة"}`}
                  </p>
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
          disabled={!allAnswered || submitted || completed || savingAfterCheck}
          onClick={verifyAnswers}
        >
          {savingAfterCheck ? "جارٍ حفظ الإنجاز..." : "تحقق من الإجابات وحفظ الإنجاز"}
        </button>

        {!allAnswered && !submitted && (
          <div className="jl-quiz-result jl-quiz-result--neutral">
            أجب عن جميع الأسئلة حتى يظهر لك التصحيح.
          </div>
        )}

        {submitted && (
          <div className="jl-quiz-result jl-quiz-result--pass">
            {hasKnownAnswers
              ? `تم التحقق من إجاباتك. نتيجتك ${score} من ${total}.`
              : "تم التحقق من إجاباتك وحفظ إنجاز اليوم."}
          </div>
        )}
      </div>
    </section>
  );
}

export default function CourseJourney({ progressRows = [], setProgressRows = () => {}, loading = false }) {
  const course = useMemo(() => normalizeCourse(rawCourseMap), []);
  const [stage, setStage] = useState("months");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(1);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [quizPassedByDay, setQuizPassedByDay] = useState({});

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
    () => prepareLesson(selectedDay || {}, selectedWeek || {}),
    [selectedDay?.id, selectedDay?.content, selectedDay?.quiz, selectedWeek?.instructorAppendix]
  );

  const totalCourseDays = getCourseTotalDays(course);
  const totalCompletedDays = course.reduce(
    (sum, month) => sum + countCompletedInMonth(completedSet, month),
    0
  );

  const monthTotalDays = selectedMonth
    ? selectedMonth.weeks.reduce((sum, week) => sum + getContentDays(week).length, 0)
    : 0;

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

  function getRelativeDay(direction) {
    if (!selectedWeek || !selectedDay) return null;

    const contentDays = getContentDays(selectedWeek).sort((a, b) => a.dayIndex - b.dayIndex);
    const currentIndex = contentDays.findIndex((day) => day.dayIndex === selectedDay.dayIndex);

    if (currentIndex === -1) return null;

    const targetDay = contentDays[currentIndex + direction];

    if (!targetDay) return null;

    return targetDay;
  }

  function moveToRelativeDay(direction) {
    const targetDay = getRelativeDay(direction);

    if (!targetDay) return;
    if (!isDayUnlocked(targetDay, selectedWeek, selectedMonth)) return;

    setSelectedDayIndex(targetDay.dayIndex);
    setNotice("");
    setStage("lesson");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  async function completeCurrentDay({ forceQuizPassed = false, silent = false } = {}) {
    if (!selectedDay) return;
    if (!isDayUnlocked(selectedDay, selectedWeek, selectedMonth)) return;
    if (isDayCompleted(selectedDay, completedSet)) return;

    const hasQuiz = preparedLesson.hasQuizText || preparedLesson.quiz.length > 0;
    const quizPassed = forceQuizPassed || quizPassedByDay[selectedDay.id];

    if (hasQuiz && !quizPassed) {
      setNotice("أكمل اختبار اليوم أولًا؛ سيتم حفظ إنجازك تلقائيًا بعد آخر سؤال.");
      return;
    }

    setSaving(true);
    if (!silent) setNotice("");

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

      if (!silent) {
        setNotice("تم حفظ إنجاز اليوم.");
      }
    } catch (error) {
      setNotice(error?.message || "تعذر حفظ التقدم. تأكد من تسجيل الدخول أو إعداد Supabase.");
    } finally {
      setSaving(false);
    }
  }

  async function handleQuizComplete() {
    if (!selectedDay?.id) return;

    setQuizPassedByDay((current) => ({
      ...current,
      [selectedDay.id]: true
    }));

    await completeCurrentDay({
      forceQuizPassed: true,
      silent: true
    });
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

  const previousDay = getRelativeDay(-1);
  const nextDay = getRelativeDay(1);
  const canOpenPreviousDay = Boolean(
    previousDay && isDayUnlocked(previousDay, selectedWeek, selectedMonth)
  );
  const canOpenNextDay = Boolean(
    nextDay && isDayUnlocked(nextDay, selectedWeek, selectedMonth)
  );

  return (
    <section className="journey-lab" dir="rtl">
      <style>{`
        .journey-lab {
          --ink:#0f172a;
          --muted:#64748b;
          --line:rgba(148,163,184,.23);
          --primary:#4f46e5;
          --violet:#7c3aed;
          --gold:#f59e0b;
          --green:#10b981;
          --red:#ef4444;
          min-height:100vh;
          position:relative;
          overflow:hidden;
          color:var(--ink);
          padding:28px 16px 70px;
          background:
            radial-gradient(circle at 12% 12%, rgba(79,70,229,.18), transparent 31%),
            radial-gradient(circle at 86% 18%, rgba(245,158,11,.16), transparent 28%),
            radial-gradient(circle at 50% 88%, rgba(16,185,129,.13), transparent 31%),
            linear-gradient(135deg,#f8fafc 0%,#eef2ff 48%,#f8fafc 100%);
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
            radial-gradient(circle at top left, rgba(245,158,11,.24), transparent 35%),
            linear-gradient(135deg,#0f172a,#1e293b 54%,#111827);
          box-shadow:0 28px 90px rgba(15,23,42,.22);
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
          color:#fde68a;
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
          background:linear-gradient(90deg,#fff,#c7d2fe,#fde68a);
          -webkit-background-clip:text;
          background-clip:text;
        }

        .jl-hero p {
          margin:0;
          max-width:780px;
          color:rgba(226,232,240,.88);
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
            radial-gradient(circle at 38% 32%, rgba(255,255,255,.96), rgba(199,210,254,.35) 19%, rgba(79,70,229,.24) 42%, rgba(15,23,42,.08) 66%),
            conic-gradient(from 0deg,#4f46e5,#7c3aed,#f59e0b,#10b981,#4f46e5);
          box-shadow:inset 0 0 38px rgba(255,255,255,.35),0 30px 90px rgba(79,70,229,.34);
        }

        .jl-orb strong {
          display:block;
          color:white;
          font-size:46px;
          font-weight:950;
          text-align:center;
          text-shadow:0 8px 24px rgba(15,23,42,.35);
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
          background:rgba(255,255,255,.80);
          border:1px solid rgba(255,255,255,.92);
          box-shadow:0 16px 38px rgba(15,23,42,.08);
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
          background:rgba(148,163,184,.18);
          overflow:hidden;
        }

        .jl-mini-track i {
          display:block;
          height:100%;
          border-radius:inherit;
          background:linear-gradient(90deg,#4f46e5,#7c3aed,#f59e0b);
        }

        .jl-mini-progress small {
          display:block;
          margin-top:9px;
          color:#94a3b8;
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
          background:rgba(255,255,255,.78);
          border:1px solid rgba(255,255,255,.92);
          color:#475569;
          font-size:12px;
          font-weight:950;
          box-shadow:0 10px 28px rgba(15,23,42,.06);
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
          background:#0f172a;
          color:white;
          font-size:12px;
          font-weight:950;
        }

        .jl-main-btn {
          padding:13px 18px;
          border-radius:18px;
          color:white;
          background:linear-gradient(135deg,#4f46e5,#7c3aed);
          box-shadow:0 18px 38px rgba(79,70,229,.24);
          font-size:12px;
          font-weight:950;
        }

        .jl-stage-panel {
          border-radius:34px;
          padding:24px;
          background:rgba(255,255,255,.76);
          border:1px solid rgba(255,255,255,.94);
          box-shadow:0 22px 60px rgba(15,23,42,.08);
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
          background:#0f172a;
          color:#f8fafc;
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
          background:#fffbeb;
          color:#92400e;
          border-color:rgba(245,158,11,.24);
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
          border:1px solid rgba(148,163,184,.20);
          box-shadow:0 18px 45px rgba(15,23,42,.07);
          transition:.25s ease;
          position:relative;
          overflow:hidden;
        }

        .jl-month-card:hover,
        .jl-week-card:hover,
        .jl-day-card:hover {
          transform:translateY(-6px);
          box-shadow:0 26px 60px rgba(79,70,229,.12);
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
          color:#3730a3;
          background:rgba(79,70,229,.12);
        }

        .jl-status--locked {
          color:#64748b;
          background:rgba(100,116,139,.12);
        }

        .jl-index {
          color:rgba(15,23,42,.13);
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
          color:#64748b;
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
          background:linear-gradient(135deg,#4f46e5,#7c3aed);
        }

        .jl-day-card--completed .jl-day-number {
          background:linear-gradient(135deg,#10b981,#059669);
        }

        .jl-day-card--locked .jl-day-number {
          background:linear-gradient(135deg,#94a3b8,#64748b);
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
            radial-gradient(circle at top right, rgba(245,158,11,.22), transparent 36%),
            linear-gradient(160deg,#0f172a,#1e293b);
          box-shadow:0 22px 55px rgba(15,23,42,.18);
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
          background:rgba(79,70,229,.24);
        }

        .jl-pill--locked {
          color:#e2e8f0;
          background:rgba(148,163,184,.18);
        }

        .jl-lesson-side h3 {
          margin:0 0 10px;
          font-size:22px;
          line-height:1.4;
          font-weight:950;
        }

        .jl-lesson-side p {
          margin:0;
          color:rgba(226,232,240,.86);
          font-size:12px;
          line-height:1.9;
          font-weight:750;
        }

        .jl-lesson-actions {
          display:grid;
          gap:10px;
          margin-top:16px;
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

        .jl-day-nav-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
        }

        .jl-day-nav {
          border:0;
          cursor:pointer;
          padding:12px 13px;
          border-radius:17px;
          font-family:inherit;
          color:#0f172a;
          background:#f8fafc;
          font-size:12px;
          font-weight:950;
          transition:.22s ease;
        }

        .jl-day-nav:hover {
          transform:translateY(-2px);
          background:#ffffff;
        }

        .jl-day-nav:disabled {
          opacity:.45;
          cursor:not-allowed;
          transform:none;
        }

        .jl-reader {
          border-radius:30px;
          padding:28px;
          background:rgba(255,255,255,.96);
          border:1px solid rgba(148,163,184,.18);
          box-shadow:0 20px 55px rgba(15,23,42,.07);
        }

        .jl-week-intro-card {
          margin:0 0 22px;
          border-radius:26px;
          padding:18px;
          background:linear-gradient(135deg,#f8fafc,#eef2ff);
          border:1px solid rgba(79,70,229,.12);
          box-shadow:0 14px 38px rgba(15,23,42,.05);
        }

        .jl-week-intro-card > span {
          display:inline-flex;
          width:fit-content;
          margin-bottom:12px;
          padding:7px 12px;
          border-radius:999px;
          background:white;
          color:#3730a3;
          border:1px solid rgba(79,70,229,.12);
          font-size:11px;
          font-weight:950;
        }

        .jl-week-intro-card .jl-rich-text h1 {
          font-size:22px;
          padding:16px;
        }

        .jl-week-intro-card .jl-rich-text h2 {
          font-size:18px;
          padding:13px 15px;
        }

        .jl-week-intro-card .jl-rich-text h3 {
          font-size:15px;
        }

        .jl-week-intro-card .jl-rich-text p {
          font-size:14px;
          line-height:2;
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
          color:#0f172a;
          line-height:1.55;
          font-weight:950;
        }

        .jl-rich-text h1 {
          font-size:30px;
          padding:20px;
          border-radius:24px;
          color:white;
          background:linear-gradient(135deg,#0f172a,#1e293b);
        }

        .jl-rich-text h2 {
          font-size:24px;
          padding:16px 18px;
          border-radius:22px;
          background:#eef2ff;
          color:#3730a3;
          border:1px solid rgba(79,70,229,.12);
        }

        .jl-rich-text h3 {
          font-size:18px;
          margin-top:8px;
          padding:14px 16px;
          border-radius:20px;
          background:#f8fafc;
          border-right:5px solid #4f46e5;
        }

        .jl-rich-text h4 {
          font-size:15px;
          color:#92400e;
          padding:12px 14px;
          border-radius:18px;
          background:#fffbeb;
        }

        .jl-rich-text p {
          margin:0;
          color:#1e293b;
          font-size:15px;
          line-height:2.12;
          font-weight:650;
          padding:0 2px;
        }

        .jl-bullet {
          position:relative;
          padding:12px 42px 12px 14px;
          border-radius:18px;
          color:#334155;
          background:#f8fafc;
          border:1px solid rgba(148,163,184,.18);
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
          background:linear-gradient(135deg,#4f46e5,#7c3aed);
        }

        .jl-quiz {
          margin-top:24px;
          padding:22px;
          border-radius:28px;
          background:#0f172a;
          color:white;
          box-shadow:0 22px 55px rgba(15,23,42,.16);
        }

        .jl-quiz-soft {
          background:#f8fafc;
          color:#334155;
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
          color:#fde68a;
          font-size:12px;
          font-weight:950;
        }

        .jl-quiz-header strong {
          color:white;
          font-size:13px;
          font-weight:950;
        }

        .jl-quiz h3 {
          margin:0 0 10px;
          font-size:23px;
          line-height:1.4;
          font-weight:950;
        }

        .jl-quiz-note {
          margin:0 0 16px;
          color:rgba(226,232,240,.86);
          font-size:13px;
          line-height:1.9;
          font-weight:750;
        }

        .jl-quiz-warning {
          margin:0 0 14px;
          padding:12px 14px;
          border-radius:18px;
          background:rgba(245,158,11,.14);
          color:#fde68a;
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
          background:linear-gradient(135deg,#f59e0b,#facc15);
          color:#111827;
          font-weight:950;
        }

        .jl-question-title span {
          color:#f8fafc;
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
          color:#fde68a;
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
          border-color:rgba(245,158,11,.65);
          background:rgba(245,158,11,.14);
        }

        .jl-option--correct {
          border-color:rgba(16,185,129,.72);
          background:rgba(16,185,129,.18);
        }

        .jl-option--wrong {
          border-color:rgba(239,68,68,.72);
          background:rgba(239,68,68,.18);
        }


        .jl-feedback {
          margin-top:12px;
          border-radius:18px;
          padding:12px 14px;
          font-size:12px;
          line-height:1.8;
          font-weight:850;
        }

        .jl-feedback strong {
          display:block;
          margin-bottom:4px;
          font-size:12px;
          font-weight:950;
        }

        .jl-feedback p {
          margin:0;
        }

        .jl-feedback--correct {
          background:rgba(16,185,129,.14);
          color:#d1fae5;
          border:1px solid rgba(16,185,129,.22);
        }

        .jl-feedback--wrong {
          background:rgba(245,158,11,.14);
          color:#fde68a;
          border:1px solid rgba(245,158,11,.22);
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
          color:#111827;
          background:linear-gradient(135deg,#fde68a,#f59e0b);
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

        .jl-quiz-result--neutral {
          background:rgba(148,163,184,.14);
          color:#e2e8f0;
        }
        .jl-empty {
          border-radius:24px;
          padding:22px;
          background:#f8fafc;
          color:#64748b;
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
                رحلة إتقان التطوير التنظيمي
                <span>تعلّم متدرّج يصنع حكمًا مهنيًا</span>
              </h1>

              <p>
                مسار معرفي وعملي يقود المتدرب من فهم المنظمة كنظام، إلى تشخيص
                الأعراض، وبناء الفرضيات، وتصميم التدخل، وقياس الأثر. كل محطة
                مصممة لتراكم الفهم لا لتكديس المحتوى.
              </p>
            </div>

            <div className="jl-orb-card">
              <div className="jl-orb">
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
            help={`${totalCompletedDays} من ${totalCourseDays} يومًا`}
          />

          <MiniProgress
            label={`تقدم ${selectedMonth?.title || "الشهر"}`}
            value={monthProgress}
            help={`${monthCompletedDays} من ${monthTotalDays} يومًا`}
          />

          <MiniProgress
            label={`تقدم ${selectedWeek?.title || "الأسبوع"}`}
            value={weekProgress}
            help={`${weekCompletedDays} من ${weekTotalDays} أيام`}
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
                const total = month.weeks.reduce((sum, week) => sum + getContentDays(week).length, 0);
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
                    className="jl-complete"
                    onClick={() => completeCurrentDay()}
                    disabled={
                      saving ||
                      currentDayState !== "active" ||
                      (dayHasQuiz && !canCompleteLesson)
                    }
                  >
                    {currentDayState === "completed"
                      ? "تم إكمال اليوم"
                      : saving
                        ? "جارٍ الحفظ..."
                        : dayHasQuiz && !quizPassedByDay[selectedDay.id]
                          ? "سيُحفظ تلقائيًا بعد الاختبار"
                          : "إنهاء اليوم"}
                  </button>

                  {currentDayState === "completed" && (
                    <button type="button" className="jl-ghost-btn" onClick={openNextPoint}>
                      افتح المحطة التالية
                    </button>
                  )}

                  <div className="jl-day-nav-grid">
                    <button
                      type="button"
                      className="jl-day-nav"
                      onClick={() => moveToRelativeDay(-1)}
                      disabled={!canOpenPreviousDay}
                    >
                      اليوم السابق
                    </button>

                    <button
                      type="button"
                      className="jl-day-nav"
                      onClick={() => moveToRelativeDay(1)}
                      disabled={!canOpenNextDay}
                    >
                      اليوم التالي
                    </button>
                  </div>

                  <button type="button" className="jl-ghost-btn" onClick={() => setStage("days")}>
                    عرض أيام الأسبوع
                  </button>
                </div>
              </aside>

              <article className="jl-reader">
                {selectedWeek.intro && selectedDay.dayIndex === 1 && (
                  <section className="jl-week-intro-card">
                    <span>تمهيد الأسبوع</span>
                    <RichLesson text={selectedWeek.intro} />
                  </section>
                )}

                <RichLesson text={preparedLesson.lessonText} />

                <QuizPanel
                  day={selectedDay}
                  questions={preparedLesson.quiz}
                  hasQuizText={preparedLesson.hasQuizText}
                  completed={currentDayState === "completed"}
                  onComplete={handleQuizComplete}
                />
              </article>
            </section>
          )}
        </main>
      </div>
    </section>
  );
}