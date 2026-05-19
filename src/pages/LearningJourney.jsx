import { useEffect, useMemo, useState } from "react";
import { learningJourneyData, learningJourneyMeta } from "../data/learningJourneyData";

const STORAGE_KEY = "od.learning.journey.progress.v2";
const MASTERY_KEY = "od_mastery_unlocked";
const MASTERY_PROGRESS_KEY = "od_mastery_progress_percent";
const SEED_KEY = "od.learning.journey.shuffle.seed.v2";

const LEVEL_LINES = {
  months: "اختر بوابة شهرية واحدة. كل بوابة لا تفتح لك محتوى فقط، بل تفتح طريقة جديدة في قراءة المنظمة.",
  weeks: "كل أسبوع يمثل مهمة استشارية متكاملة. لا تتعامل معه كدرس؛ تعامل معه كمرحلة بناء قدرة.",
  days: "كل يوم هو خطوة دقيقة في بناء الممارس: فكرة، تطبيق، اختبار، ثم أثر محفوظ في تقدمك.",
  lesson: "اقرأ الدرس بتركيز، ثم اختبر فهمك. لا يُفتح المسار التالي إلا عندما تثبت أنك استوعبت المرحلة."
};

const MONTH_TONES = [
  "من الفوضى إلى العدسة التشخيصية",
  "من الهيكل إلى منطق التشغيل",
  "من الوظيفة إلى الأداء والكفاءة",
  "من قرار التغيير إلى التبنّي",
  "من الثقافة إلى التعلم والقدرة",
  "من القياس إلى الاحتراف والاستدامة"
];

function createDefaultProgress() {
  return {
    completedDays: {},
    quizAttempts: {},
    lastVisited: null,
    learningSeconds: 0,
    startedAt: new Date().toISOString(),
    masteryUnlockedAt: null
  };
}

function safeParse(value, fallback) {
  try {
    if (!value) return fallback;
    return { ...fallback, ...JSON.parse(value) };
  } catch {
    return fallback;
  }
}

function getShuffleSeed() {
  let seed = localStorage.getItem(SEED_KEY);
  if (!seed) {
    seed = String(Date.now()) + String(Math.random()).slice(2);
    localStorage.setItem(SEED_KEY, seed);
  }
  return seed;
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let x = seed || 123456789;
  return function next() {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) / 4294967296);
  };
}

function shuffleOptions(options, seedText) {
  const arr = [...options];
  const rand = seededRandom(hashString(seedText));
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function flattenDays(data) {
  return data.flatMap((month) =>
    month.weeks.flatMap((week) =>
      week.days.map((day) => ({ month, week, day }))
    )
  );
}

function formatHours(seconds) {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} دقيقة`;
  return `${hours} ساعة و ${minutes} دقيقة`;
}

function normalizePercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ProgressRing({ percent, label }) {
  const p = normalizePercent(percent);
  return (
    <div className="journey-ring" style={{ "--p": `${p}%` }} aria-label={`${label}: ${p}%`}>
      <span>{p}%</span>
    </div>
  );
}

function StatusPill({ status }) {
  const labels = {
    done: "مكتمل",
    open: "مفتوح",
    locked: "مغلق"
  };
  return <span className={`journey-pill ${status}`}>{labels[status]}</span>;
}

function BackButton({ children, onClick }) {
  return (
    <button className="journey-back" type="button" onClick={onClick}>
      <span>→</span> {children}
    </button>
  );
}

export default function LearningJourney() {
  const [progress, setProgress] = useState(() => safeParse(localStorage.getItem(STORAGE_KEY), createDefaultProgress()));
  const [selectedMonthId, setSelectedMonthId] = useState(null);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [quizMessage, setQuizMessage] = useState(null);
  const [showReferences, setShowReferences] = useState(false);
  const [seed] = useState(() => getShuffleSeed());

  const allDays = useMemo(() => flattenDays(learningJourneyData), []);
  const totalDays = allDays.length;
  const completedCount = Object.keys(progress.completedDays || {}).length;
  const totalPercent = normalizePercent((completedCount / totalDays) * 100);
  const selectedMonth = learningJourneyData.find((m) => m.id === selectedMonthId) || null;
  const selectedWeek = selectedMonth?.weeks.find((w) => w.id === selectedWeekId) || null;
  const selectedDay = selectedWeek?.days.find((d) => d.id === selectedDayId) || null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    localStorage.setItem(MASTERY_PROGRESS_KEY, String(totalPercent));

    const detail = {
      completedDays: completedCount,
      totalDays,
      percent: totalPercent,
      learningSeconds: progress.learningSeconds || 0,
      masteryUnlocked: totalPercent === 100
    };
    window.dispatchEvent(new CustomEvent("od-learning-progress", { detail }));

    if (totalPercent === 100 && !progress.masteryUnlockedAt) {
      const unlockedAt = new Date().toISOString();
      localStorage.setItem(MASTERY_KEY, "true");
      setProgress((prev) => ({ ...prev, masteryUnlockedAt: unlockedAt }));
      window.dispatchEvent(new CustomEvent("od-mastery-unlocked", { detail: { unlockedAt } }));
    }
  }, [progress, totalPercent, completedCount, totalDays]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((prev) => ({ ...prev, learningSeconds: (prev.learningSeconds || 0) + 5 }));
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (selectedDayId) {
      setAnswers({});
      setQuizMessage(null);
    }
  }, [selectedDayId]);

  function saveLastVisited(payload) {
    setProgress((prev) => ({ ...prev, lastVisited: payload }));
  }

  function dayIsComplete(dayId) {
    return Boolean(progress.completedDays?.[dayId]);
  }

  function weekIsComplete(week) {
    return week.days.every((d) => dayIsComplete(d.id));
  }

  function monthIsComplete(month) {
    return month.weeks.every((w) => weekIsComplete(w));
  }

  function getMonthStatus(month, monthIndex) {
    if (monthIsComplete(month)) return "done";
    const previousMonths = learningJourneyData.slice(0, monthIndex);
    return previousMonths.every((m) => monthIsComplete(m)) ? "open" : "locked";
  }

  function getWeekStatus(week, weekIndex) {
    if (weekIsComplete(week)) return "done";
    const monthIndex = learningJourneyData.findIndex((m) => m.id === selectedMonth?.id);
    const monthOpen = getMonthStatus(selectedMonth, monthIndex) !== "locked";
    const previousWeeks = selectedMonth.weeks.slice(0, weekIndex);
    return monthOpen && previousWeeks.every((w) => weekIsComplete(w)) ? "open" : "locked";
  }

  function getDayStatus(day, dayIndex) {
    if (dayIsComplete(day.id)) return "done";
    const weekIndex = selectedMonth.weeks.findIndex((w) => w.id === selectedWeek?.id);
    const weekOpen = getWeekStatus(selectedWeek, weekIndex) !== "locked";
    const previousDays = selectedWeek.days.slice(0, dayIndex);
    return weekOpen && previousDays.every((d) => dayIsComplete(d.id)) ? "open" : "locked";
  }

  function openMonth(month, index) {
    const status = getMonthStatus(month, index);
    if (status === "locked") return;
    setSelectedMonthId(month.id);
    setSelectedWeekId(null);
    setSelectedDayId(null);
    setShowReferences(false);
    saveLastVisited({ monthId: month.id });
  }

  function openWeek(week, index) {
    const status = getWeekStatus(week, index);
    if (status === "locked") return;
    setSelectedWeekId(week.id);
    setSelectedDayId(null);
    setShowReferences(false);
    saveLastVisited({ monthId: selectedMonth.id, weekId: week.id });
  }

  function openDay(day, index) {
    const status = getDayStatus(day, index);
    if (status === "locked") return;
    setSelectedDayId(day.id);
    setQuizMessage(null);
    saveLastVisited({ monthId: selectedMonth.id, weekId: selectedWeek.id, dayId: day.id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function completeDay(dayId, result) {
    setProgress((prev) => ({
      ...prev,
      completedDays: {
        ...prev.completedDays,
        [dayId]: new Date().toISOString()
      },
      quizAttempts: {
        ...prev.quizAttempts,
        [dayId]: [ ...(prev.quizAttempts?.[dayId] || []), result ]
      }
    }));
  }

  function submitQuiz() {
    if (!selectedDay) return;
    const quiz = selectedDay.quiz || [];
    if (!quiz.length) {
      completeDay(selectedDay.id, { score: 0, total: 0, at: new Date().toISOString(), note: "لا يوجد اختبار" });
      setQuizMessage({ type: "success", text: "تم حفظ إكمال اليوم." });
      return;
    }

    const missing = quiz.filter((q) => !answers[`${selectedDay.id}-${q.number}`]);
    if (missing.length) {
      setQuizMessage({ type: "warn", text: "أكمل جميع الأسئلة قبل اعتماد اليوم." });
      return;
    }

    const graded = quiz.filter((q) => q.correctLetter);
    const correct = graded.filter((q) => answers[`${selectedDay.id}-${q.number}`] === q.correctLetter).length;
    const ungraded = quiz.length - graded.length;
    const passed = graded.length ? correct === graded.length : true;

    const attempt = {
      score: correct,
      total: graded.length,
      ungraded,
      answers,
      passed,
      at: new Date().toISOString()
    };

    if (passed) {
      completeDay(selectedDay.id, attempt);
      setQuizMessage({
        type: "success",
        text: ungraded
          ? "تم إكمال اليوم. هذا الاختبار غير محسوب آليًا لأن مفتاح إجاباته غير موجود في المصدر المعتمد."
          : `إتقان ممتاز. نتيجتك ${correct}/${graded.length} وتم فتح الخطوة التالية.`
      });
    } else {
      setProgress((prev) => ({
        ...prev,
        quizAttempts: {
          ...prev.quizAttempts,
          [selectedDay.id]: [ ...(prev.quizAttempts?.[selectedDay.id] || []), attempt ]
        }
      }));
      setQuizMessage({ type: "error", text: `تحتاج إعادة المحاولة. نتيجتك ${correct}/${graded.length}. راجع الدرس ثم أعد الاختبار.` });
    }
  }

  function resetCurrentQuiz() {
    setAnswers({});
    setQuizMessage(null);
  }

  function goToNextUnlocked() {
    if (!selectedDay) return;
    const currentIndex = allDays.findIndex(({ day }) => day.id === selectedDay.id);
    const next = allDays[currentIndex + 1];
    if (!next) return;
    setSelectedMonthId(next.month.id);
    setSelectedWeekId(next.week.id);
    setSelectedDayId(next.day.id);
    setQuizMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="learning-journey" dir="rtl">
      <style>{journeyCss}</style>

      <div className="journey-shell">
        <header className="journey-hero">
          <div className="journey-hero-text">
            <span className="journey-eyebrow">رحلتك التعليمية</span>
            <h1>منهج التطوير التنظيمي في مسار تفاعلي مقفل بالإنجاز</h1>
            <p>
              ستتحرك عبر ستة أشهر، أربعة وعشرين أسبوعًا، ومئة وثمانية وستين يومًا تدريبيًا. لا يظهر المحتوى كله دفعة واحدة؛ كل طبقة تفتح التي تليها بعد قراءة واختبار وإتقان.
            </p>
          </div>

          <div className="journey-dashboard-card">
            <ProgressRing percent={totalPercent} label="إجمالي التقدم" />
            <div>
              <b>{completedCount} / {totalDays}</b>
              <span>أيام مكتملة</span>
              <small>وقت التعلم داخل الرحلة: {formatHours(progress.learningSeconds || 0)}</small>
            </div>
          </div>
        </header>

        <div className="mastery-gate">
          <div>
            <span>{totalPercent === 100 ? "وثيقة الإتقان مفتوحة" : "وثيقة الإتقان مغلقة"}</span>
            <h2>{totalPercent === 100 ? "أتممت الرحلة بالكامل" : "أكمل الرحلة حتى النهاية لفتح وثيقة الإتقان"}</h2>
            <p>
              يتم تحديث مفتاح الإتقان تلقائيًا في التخزين المحلي عند إكمال جميع الأيام. يستطيع قسم وثيقة الإتقان قراءة المفتاح: <code>{MASTERY_KEY}</code>.
            </p>
          </div>
          <StatusPill status={totalPercent === 100 ? "done" : "locked"} />
        </div>

        {!selectedMonth && renderMonths()}
        {selectedMonth && !selectedWeek && renderWeeks()}
        {selectedMonth && selectedWeek && !selectedDay && renderDays()}
        {selectedMonth && selectedWeek && selectedDay && renderLesson()}
      </div>
    </section>
  );

  function renderMonths() {
    return (
      <main className="journey-stage">
        <div className="stage-heading">
          <span>بوابات الأشهر الستة</span>
          <h2>اختر الشهر الذي تريد فتحه</h2>
          <p>{LEVEL_LINES.months}</p>
        </div>

        <div className="months-grid">
          {learningJourneyData.map((month, index) => {
            const status = getMonthStatus(month, index);
            const weeksDone = month.weeks.filter((w) => weekIsComplete(w)).length;
            const percent = (weeksDone / month.weeks.length) * 100;
            return (
              <button
                key={month.id}
                type="button"
                className={`month-card ${status}`}
                onClick={() => openMonth(month, index)}
                disabled={status === "locked"}
              >
                <div className="card-topline">
                  <span>{month.label}</span>
                  <StatusPill status={status} />
                </div>
                <h3>{month.title}</h3>
                <p>{MONTH_TONES[index]}</p>
                <div className="mini-progress"><i style={{ width: `${normalizePercent(percent)}%` }} /></div>
                <small>{weeksDone} من {month.weeks.length} أسابيع مكتملة</small>
              </button>
            );
          })}
        </div>

        <div className="journey-note">
          <b>قاعدة الرحلة:</b> كل شهر يفتح بعد إكمال الشهر السابق، حتى تبنى المعرفة كطبقات لا كمحتوى متكدس.
        </div>
      </main>
    );
  }

  function renderWeeks() {
    return (
      <main className="journey-stage">
        <BackButton onClick={() => setSelectedMonthId(null)}>العودة إلى الأشهر</BackButton>
        <div className="stage-heading">
          <span>{selectedMonth.label}</span>
          <h2>{selectedMonth.title}</h2>
          <p>{LEVEL_LINES.weeks}</p>
        </div>

        <div className="intro-panel">
          <b>عبارة المرحلة</b>
          <p>هذا الشهر ليس قائمة دروس؛ إنه انتقال في عقل الممارس. أكمل أسابيعه بالترتيب حتى تتضح الخريطة كاملة.</p>
        </div>

        <div className="weeks-grid">
          {selectedMonth.weeks.map((week, index) => {
            const status = getWeekStatus(week, index);
            const daysDone = week.days.filter((d) => dayIsComplete(d.id)).length;
            const percent = (daysDone / week.days.length) * 100;
            return (
              <button
                key={week.id}
                type="button"
                className={`week-card ${status}`}
                onClick={() => openWeek(week, index)}
                disabled={status === "locked"}
              >
                <div className="card-topline">
                  <span>{week.label}</span>
                  <StatusPill status={status} />
                </div>
                <h3>{week.title}</h3>
                <p>{week.intro?.[0] || "أسبوع تطبيقي ضمن مسار التطوير التنظيمي."}</p>
                <div className="mini-progress"><i style={{ width: `${normalizePercent(percent)}%` }} /></div>
                <small>{daysDone} من {week.days.length} أيام مكتملة</small>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  function renderDays() {
    return (
      <main className="journey-stage">
        <div className="double-back">
          <BackButton onClick={() => setSelectedWeekId(null)}>العودة إلى أسابيع الشهر</BackButton>
          <BackButton onClick={() => { setSelectedMonthId(null); setSelectedWeekId(null); }}>الأشهر</BackButton>
        </div>

        <div className="stage-heading">
          <span>{selectedMonth.label} / {selectedWeek.label}</span>
          <h2>{selectedWeek.title}</h2>
          <p>{LEVEL_LINES.days}</p>
        </div>

        <div className="week-intro-reader">
          <h3>مدخل الأسبوع</h3>
          {(selectedWeek.intro || []).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>

        <div className="days-ladder">
          {selectedWeek.days.map((day, index) => {
            const status = getDayStatus(day, index);
            return (
              <button
                key={day.id}
                type="button"
                className={`day-step ${status}`}
                onClick={() => openDay(day, index)}
                disabled={status === "locked"}
              >
                <div className="day-number">{day.number}</div>
                <div>
                  <span>{day.label}</span>
                  <h3>{day.title}</h3>
                  <small>{day.quiz?.length || 0} أسئلة تثبيت</small>
                </div>
                <StatusPill status={status} />
              </button>
            );
          })}
        </div>

        {!!selectedWeek.references?.length && (
          <div className="references-panel">
            <button type="button" onClick={() => setShowReferences((v) => !v)}>
              {showReferences ? "إخفاء مراجع الأسبوع" : "عرض مراجع الأسبوع"}
            </button>
            {showReferences && selectedWeek.references.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        )}
      </main>
    );
  }

  function renderLesson() {
    const dayIndex = selectedWeek.days.findIndex((d) => d.id === selectedDay.id);
    const isDone = dayIsComplete(selectedDay.id);
    const quiz = selectedDay.quiz || [];
    const gradedCount = quiz.filter((q) => q.correctLetter).length;
    const currentIndex = allDays.findIndex(({ day }) => day.id === selectedDay.id);
    const hasNext = currentIndex >= 0 && currentIndex < allDays.length - 1;

    return (
      <main className="lesson-layout">
        <div className="double-back">
          <BackButton onClick={() => setSelectedDayId(null)}>العودة إلى أيام الأسبوع</BackButton>
          <BackButton onClick={() => { setSelectedWeekId(null); setSelectedDayId(null); }}>أسابيع الشهر</BackButton>
        </div>

        <article className="lesson-reader">
          <div className="lesson-head">
            <div>
              <span>{selectedMonth.label} / {selectedWeek.label} / {selectedDay.label}</span>
              <h2>{selectedDay.title}</h2>
              <p>{LEVEL_LINES.lesson}</p>
            </div>
            <StatusPill status={isDone ? "done" : "open"} />
          </div>

          <div className="lesson-body">
            {(selectedDay.lesson || []).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>

        <aside className="quiz-panel">
          <div className="quiz-head">
            <span>اختبار اليوم</span>
            <h3>{gradedCount ? "أسئلة اختيار من متعدد" : "اختبار مراجعة غير محسوب آليًا"}</h3>
            <p>
              {gradedCount
                ? "تتغير أماكن الإجابات تلقائيًا حتى لا يحفظ المتدرب موضع الإجابة بدل فهمها."
                : "لا يوجد مفتاح إجابات لهذا اليوم في المصدر، لذلك يُستخدم الاختبار للمراجعة ويُسمح بالإكمال بعد الإجابة."}
            </p>
          </div>

          <div className="quiz-list">
            {quiz.map((question) => {
              const key = `${selectedDay.id}-${question.number}`;
              const shuffled = shuffleOptions(question.options, `${seed}-${selectedDay.id}-${question.number}`);
              const selected = answers[key];
              const submitted = Boolean(quizMessage);
              return (
                <div className="question-card" key={key}>
                  <b>السؤال {question.number}</b>
                  <p>{question.question}</p>
                  <div className="options-grid">
                    {shuffled.map((option, optionIndex) => {
                      const isSelected = selected === option.letter;
                      const isCorrect = question.correctLetter && option.letter === question.correctLetter;
                      const reveal = submitted && question.correctLetter;
                      return (
                        <button
                          key={`${key}-${option.letter}`}
                          type="button"
                          className={`option-button ${isSelected ? "selected" : ""} ${reveal && isCorrect ? "correct" : ""} ${reveal && isSelected && !isCorrect ? "wrong" : ""}`}
                          onClick={() => {
                            if (isDone) return;
                            setAnswers((prev) => ({ ...prev, [key]: option.letter }));
                          }}
                        >
                          <span>{String.fromCharCode(1633 + optionIndex)}</span>
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {quizMessage && <div className={`quiz-message ${quizMessage.type}`}>{quizMessage.text}</div>}

          <div className="quiz-actions">
            {!isDone && <button className="journey-primary" type="button" onClick={submitQuiz}>اعتماد اليوم</button>}
            {!isDone && <button className="journey-secondary" type="button" onClick={resetCurrentQuiz}>إعادة اختيار الإجابات</button>}
            {isDone && hasNext && <button className="journey-primary" type="button" onClick={goToNextUnlocked}>الانتقال إلى اليوم التالي</button>}
            {isDone && !hasNext && <button className="journey-primary" type="button" onClick={() => setSelectedDayId(null)}>العودة للرحلة</button>}
          </div>

          <div className="lesson-progress-card">
            <b>موقعك داخل الأسبوع</b>
            <div className="mini-progress"><i style={{ width: `${normalizePercent(((dayIndex + (isDone ? 1 : 0)) / selectedWeek.days.length) * 100)}%` }} /></div>
            <small>{selectedWeek.days.filter((d) => dayIsComplete(d.id)).length} من {selectedWeek.days.length} أيام مكتملة في هذا الأسبوع</small>
          </div>
        </aside>
      </main>
    );
  }
}

const journeyCss = `
.learning-journey {
  --bg: #f8fafc;
  --ink: #0f172a;
  --muted: #64748b;
  --line: rgba(148, 163, 184, .24);
  --card: rgba(255, 255, 255, .88);
  --indigo: #4f46e5;
  --violet: #7c3aed;
  --gold: #f59e0b;
  --green: #10b981;
  --red: #ef4444;
  --blue-soft: #eef2ff;
  min-height: 100vh;
  padding: 26px 12px 72px;
  color: var(--ink);
  background:
    radial-gradient(circle at 7% 8%, rgba(79, 70, 229, .15), transparent 28%),
    radial-gradient(circle at 96% 7%, rgba(245, 158, 11, .13), transparent 30%),
    radial-gradient(circle at 48% 100%, rgba(16, 185, 129, .11), transparent 34%),
    linear-gradient(135deg, #f8fafc 0%, #eef2ff 52%, #fff7ed 100%);
}
.journey-shell { width: min(1320px, 100%); margin: 0 auto; }
.journey-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: 18px;
  padding: 34px;
  border-radius: 42px;
  color: white;
  background:
    radial-gradient(circle at 12% 10%, rgba(129,140,248,.22), transparent 32%),
    radial-gradient(circle at 90% 0%, rgba(251,191,36,.18), transparent 30%),
    linear-gradient(145deg, #0f172a, #1e1b4b 58%, #312e81);
  box-shadow: 0 30px 80px rgba(15, 23, 42, .22);
}
.journey-hero::before {
  content: "";
  position: absolute;
  inset: -80px;
  background-image: linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
  background-size: 48px 48px;
  transform: rotate(-8deg);
  opacity: .38;
}
.journey-hero-text, .journey-dashboard-card { position: relative; z-index: 1; }
.journey-eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.18);
  color: #e0e7ff;
  font-size: 12px;
  font-weight: 950;
}
.journey-hero h1 {
  max-width: 850px;
  margin: 18px 0 14px;
  font-size: clamp(34px, 5vw, 68px);
  line-height: 1.08;
  letter-spacing: -1.5px;
  font-weight: 950;
}
.journey-hero p { max-width: 840px; margin: 0; color: rgba(226,232,240,.88); font-size: 15px; line-height: 2.05; font-weight: 750; }
.journey-dashboard-card {
  align-self: stretch;
  border-radius: 32px;
  padding: 20px;
  display: grid;
  gap: 14px;
  place-items: center;
  text-align: center;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.15);
  backdrop-filter: blur(16px);
}
.journey-dashboard-card b { display:block; color: white; font-size: 26px; font-weight: 950; }
.journey-dashboard-card span { display:block; color: #c7d2fe; font-size: 12px; font-weight: 950; margin-top: 4px; }
.journey-dashboard-card small { display:block; color: rgba(255,255,255,.72); font-size: 11px; font-weight: 800; margin-top: 10px; }
.journey-ring {
  width: 126px;
  height: 126px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: conic-gradient(#f59e0b var(--p), rgba(255,255,255,.16) 0);
  box-shadow: inset 0 0 0 12px rgba(255,255,255,.10), 0 18px 40px rgba(0,0,0,.18);
}
.journey-ring span {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #0f172a;
  color: #fde68a;
  font-size: 24px;
  font-weight: 950;
}
.mastery-gate {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  margin: 18px 0;
  padding: 22px;
  border-radius: 30px;
  background: rgba(255,255,255,.86);
  border: 1px solid rgba(255,255,255,.9);
  box-shadow: 0 18px 50px rgba(15,23,42,.07);
  backdrop-filter: blur(16px);
}
.mastery-gate span { display:inline-flex; color: #92400e; background: rgba(245,158,11,.13); padding: 7px 12px; border-radius: 999px; font-size: 11px; font-weight: 950; }
.mastery-gate h2 { margin: 10px 0 6px; font-size: 25px; font-weight: 950; }
.mastery-gate p { margin: 0; color: var(--muted); line-height: 1.9; font-size: 13px; font-weight: 750; }
.mastery-gate code { direction: ltr; display: inline-flex; color: #3730a3; background: #eef2ff; padding: 2px 7px; border-radius: 8px; }
.journey-stage, .lesson-layout { margin-top: 18px; }
.stage-heading { margin-bottom: 18px; }
.stage-heading span, .lesson-head span, .quiz-head span {
  display: inline-flex;
  width: fit-content;
  padding: 8px 13px;
  border-radius: 999px;
  background: rgba(79,70,229,.10);
  color: #3730a3;
  font-size: 11px;
  font-weight: 950;
}
.stage-heading h2 { margin: 13px 0 8px; font-size: clamp(28px, 4vw, 48px); line-height: 1.2; font-weight: 950; letter-spacing: -.8px; }
.stage-heading p { max-width: 820px; margin: 0; color: #475569; line-height: 2; font-size: 14px; font-weight: 780; }
.months-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.weeks-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.month-card, .week-card, .day-step {
  cursor: pointer;
  text-align: right;
  font-family: inherit;
  color: var(--ink);
  border: 1px solid rgba(255,255,255,.92);
  background: rgba(255,255,255,.88);
  box-shadow: 0 18px 50px rgba(15,23,42,.07);
  backdrop-filter: blur(16px);
  transition: .22s ease;
}
.month-card:hover, .week-card:hover, .day-step:hover { transform: translateY(-3px); box-shadow: 0 26px 62px rgba(15,23,42,.10); }
.month-card:disabled, .week-card:disabled, .day-step:disabled { cursor: not-allowed; opacity: .55; transform: none; }
.month-card { min-height: 260px; border-radius: 34px; padding: 22px; position: relative; overflow: hidden; }
.month-card::before {
  content: "";
  position: absolute;
  width: 170px;
  height: 170px;
  border-radius: 50%;
  left: -80px;
  top: -90px;
  background: rgba(79,70,229,.11);
}
.month-card.done::before { background: rgba(16,185,129,.14); }
.month-card.locked::before { background: rgba(100,116,139,.13); }
.card-topline { position: relative; display:flex; justify-content:space-between; gap: 12px; align-items:center; margin-bottom: 20px; }
.card-topline > span { font-size: 12px; color: #475569; font-weight: 950; }
.journey-pill { display:inline-flex; align-items:center; justify-content:center; padding: 7px 10px; border-radius: 999px; font-size: 10px; font-weight: 950; }
.journey-pill.done { background: rgba(16,185,129,.12); color: #047857; }
.journey-pill.open { background: rgba(79,70,229,.10); color: #3730a3; }
.journey-pill.locked { background: rgba(100,116,139,.12); color: #475569; }
.month-card h3, .week-card h3 { position: relative; margin: 0 0 12px; font-size: 22px; line-height: 1.45; font-weight: 950; }
.month-card p, .week-card p { position: relative; margin: 0 0 18px; color: #64748b; font-size: 13px; line-height: 1.9; font-weight: 750; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.mini-progress { height: 9px; border-radius: 999px; overflow:hidden; background: rgba(148,163,184,.18); }
.mini-progress i { display:block; height:100%; border-radius:999px; background: linear-gradient(90deg, #4f46e5, #f59e0b); }
.month-card small, .week-card small { display:block; margin-top: 12px; color: #64748b; font-weight: 850; font-size: 11px; }
.journey-note, .intro-panel, .week-intro-reader, .references-panel, .lesson-progress-card {
  margin-top: 16px;
  border-radius: 28px;
  padding: 20px;
  background: rgba(255,255,255,.82);
  border: 1px solid rgba(255,255,255,.92);
  box-shadow: 0 14px 40px rgba(15,23,42,.06);
}
.journey-note, .intro-panel p, .week-intro-reader p, .references-panel p, .lesson-progress-card small { color: #475569; line-height: 2; font-size: 13px; font-weight: 780; }
.journey-note b, .intro-panel b, .lesson-progress-card b { color: var(--ink); font-weight: 950; }
.week-card { border-radius: 30px; padding: 22px; min-height: 230px; }
.journey-back {
  cursor: pointer;
  border: 0;
  border-radius: 16px;
  padding: 11px 15px;
  margin-bottom: 16px;
  background: #0f172a;
  color: white;
  font-family: inherit;
  font-size: 12px;
  font-weight: 950;
  box-shadow: 0 14px 32px rgba(15,23,42,.16);
}
.double-back { display:flex; flex-wrap:wrap; gap: 10px; align-items:center; }
.days-ladder { display:grid; gap: 12px; }
.day-step { width: 100%; border-radius: 26px; padding: 16px; display:grid; grid-template-columns: 58px 1fr auto; gap: 16px; align-items:center; }
.day-number { width: 56px; height: 56px; border-radius: 20px; display:grid; place-items:center; color:white; background: linear-gradient(135deg, #4f46e5, #7c3aed); font-size: 22px; font-weight: 950; }
.day-step.done .day-number { background: linear-gradient(135deg, #10b981, #047857); }
.day-step.locked .day-number { background: #94a3b8; }
.day-step span { color:#64748b; font-size:11px; font-weight:950; }
.day-step h3 { margin:5px 0 4px; font-size:17px; line-height:1.45; font-weight:950; }
.day-step small { color:#64748b; font-size:11px; font-weight:850; }
.references-panel button {
  cursor:pointer; border:0; border-radius:16px; padding:12px 16px; color:#3730a3; background:#eef2ff; font-family:inherit; font-size:12px; font-weight:950;
}
.lesson-layout { display:grid; grid-template-columns: minmax(0, 1fr) 430px; gap: 18px; align-items:start; }
.lesson-reader, .quiz-panel {
  border-radius: 34px;
  padding: 24px;
  background: rgba(255,255,255,.88);
  border: 1px solid rgba(255,255,255,.92);
  box-shadow: 0 18px 50px rgba(15,23,42,.07);
  backdrop-filter: blur(16px);
}
.lesson-head { display:flex; justify-content:space-between; gap:14px; align-items:flex-start; margin-bottom: 18px; padding-bottom: 18px; border-bottom:1px solid rgba(148,163,184,.18); }
.lesson-head h2 { margin: 12px 0 8px; font-size: clamp(25px, 3vw, 42px); line-height: 1.25; font-weight: 950; }
.lesson-head p, .quiz-head p { margin: 0; color:#64748b; line-height:1.9; font-size:13px; font-weight:780; }
.lesson-body { display:grid; gap: 12px; }
.lesson-body p { margin:0; color:#334155; font-size:15px; line-height:2.15; font-weight:730; white-space: pre-line; }
.quiz-panel { position: sticky; top: 16px; max-height: calc(100vh - 32px); overflow:auto; }
.quiz-head h3 { margin: 12px 0 8px; font-size: 25px; line-height:1.3; font-weight:950; }
.quiz-list { display:grid; gap: 14px; margin-top: 16px; }
.question-card { border-radius: 24px; padding: 16px; background:#f8fafc; border:1px solid rgba(148,163,184,.16); }
.question-card b { display:block; color:#4f46e5; font-size:12px; font-weight:950; margin-bottom: 8px; }
.question-card p { margin:0 0 12px; color:#0f172a; font-size:13px; line-height:1.9; font-weight:850; white-space: pre-line; }
.options-grid { display:grid; gap:8px; }
.option-button { cursor:pointer; width:100%; border:1px solid rgba(148,163,184,.22); border-radius:16px; padding:11px 12px; background:white; color:#334155; font-family:inherit; text-align:right; line-height:1.75; font-size:12px; font-weight:800; display:grid; grid-template-columns:28px 1fr; gap:9px; align-items:start; transition:.18s ease; }
.option-button:hover { border-color:rgba(79,70,229,.38); transform: translateY(-1px); }
.option-button span { width:28px; height:28px; border-radius:10px; display:grid; place-items:center; background:#eef2ff; color:#3730a3; font-weight:950; }
.option-button.selected { border-color:#4f46e5; background:#eef2ff; color:#1e1b4b; }
.option-button.correct { border-color:rgba(16,185,129,.55); background:rgba(16,185,129,.10); }
.option-button.wrong { border-color:rgba(239,68,68,.55); background:rgba(239,68,68,.08); }
.quiz-message { margin-top:14px; border-radius:18px; padding:13px; font-size:12px; line-height:1.8; font-weight:900; }
.quiz-message.success { background:rgba(16,185,129,.12); color:#047857; }
.quiz-message.error { background:rgba(239,68,68,.10); color:#b91c1c; }
.quiz-message.warn { background:rgba(245,158,11,.12); color:#92400e; }
.quiz-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px; }
.journey-primary, .journey-secondary { cursor:pointer; border:0; border-radius:17px; padding:13px 14px; font-family:inherit; font-size:12px; font-weight:950; transition:.18s ease; }
.journey-primary { color:white; background:linear-gradient(135deg,#4f46e5,#7c3aed); box-shadow:0 14px 30px rgba(79,70,229,.22); }
.journey-secondary { color:#0f172a; background:#f1f5f9; }
.journey-primary:hover, .journey-secondary:hover { transform:translateY(-2px); }
@media (max-width: 1100px) {
  .journey-hero, .lesson-layout { grid-template-columns: 1fr; }
  .months-grid { grid-template-columns: repeat(2, 1fr); }
  .quiz-panel { position: static; max-height: none; }
}
@media (max-width: 760px) {
  .learning-journey { padding: 14px 8px 42px; }
  .journey-hero, .mastery-gate, .lesson-reader, .quiz-panel { border-radius: 28px; padding: 20px; }
  .months-grid, .weeks-grid { grid-template-columns: 1fr; }
  .day-step { grid-template-columns: 48px 1fr; }
  .day-step .journey-pill { grid-column: 1 / -1; width: fit-content; }
  .quiz-actions { grid-template-columns: 1fr; }
  .mastery-gate { align-items:flex-start; flex-direction:column; }
}
`;
