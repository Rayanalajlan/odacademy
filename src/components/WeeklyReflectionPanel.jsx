import { useEffect, useMemo, useState } from "react";
import {
  getWeeklyReflection,
  saveWeeklyReflection
} from "../lib/weeklyReflectionService";

const initialForm = {
  keyLearning: "",
  observedPattern: "",
  applicationIdea: "",
  nextAction: "",
  confidenceScore: 3
};

export default function WeeklyReflectionPanel({
  monthIndex,
  weekIndex,
  monthTitle = "",
  weekTitle = "",
  completedDaysInWeek = 0,
  totalDaysInWeek = 7
}) {
  const [form, setForm] = useState(initialForm);
  const [savedAt, setSavedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const title = useMemo(() => {
    return weekTitle || `الأسبوع ${weekIndex || ""}`.trim();
  }, [weekTitle, weekIndex]);

  const progressLabel = `${Number(completedDaysInWeek || 0)} / ${Number(totalDaysInWeek || 7)} أيام`;

  async function loadReflection() {
    if (!monthIndex || !weekIndex) return;

    setLoading(true);
    setStatus("");

    try {
      const data = await getWeeklyReflection({
        monthIndex,
        weekIndex
      });

      if (data) {
        setForm({
          keyLearning: data.key_learning || "",
          observedPattern: data.observed_pattern || "",
          applicationIdea: data.application_idea || "",
          nextAction: data.next_action || "",
          confidenceScore: data.confidence_score || 3
        });
        setSavedAt(data.updated_at || data.created_at || "");
      } else {
        setForm(initialForm);
        setSavedAt("");
      }
    } catch (error) {
      console.warn("تعذر تحميل التأمل الأسبوعي:", error);
      setStatus("تعذر تحميل التأمل السابق لهذا الأسبوع.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReflection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthIndex, weekIndex]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!monthIndex || !weekIndex) {
      setStatus("اختر أسبوعًا صحيحًا قبل الحفظ.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const saved = await saveWeeklyReflection({
        monthIndex,
        weekIndex,
        weekTitle: [monthTitle, title].filter(Boolean).join(" · "),
        keyLearning: form.keyLearning,
        observedPattern: form.observedPattern,
        applicationIdea: form.applicationIdea,
        nextAction: form.nextAction,
        confidenceScore: form.confidenceScore,
        status: "submitted"
      });

      setSavedAt(saved.updated_at || saved.created_at || new Date().toISOString());
      setStatus("تم حفظ التأمل الأسبوعي وخطة التطبيق.");
    } catch (error) {
      setStatus(error?.message || "تعذر حفظ التأمل الأسبوعي.");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(value) {
    if (!value) return "";

    try {
      return new Intl.DateTimeFormat("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    } catch {
      return "";
    }
  }

  return (
    <section className="weekly-reflection-panel" aria-label="التأمل الأسبوعي وخطة التطبيق" dir="rtl">
      <style>{`
        .weekly-reflection-panel {
          margin: 18px 0;
          border-radius: 30px;
          padding: 20px;
          background:
            radial-gradient(circle at 100% 0%, rgba(16,185,129,.12), transparent 34%),
            radial-gradient(circle at 0% 100%, rgba(79,70,229,.10), transparent 32%),
            rgba(255,255,255,.95);
          border: 1px solid rgba(148,163,184,.20);
          box-shadow: 0 18px 48px rgba(15,23,42,.07);
        }

        .weekly-reflection-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 14px;
          align-items: start;
          margin-bottom: 14px;
        }

        .weekly-reflection-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 7px 11px;
          color: #065f46;
          background: #ecfdf5;
          border: 1px solid rgba(16,185,129,.22);
          font-size: 11px;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .weekly-reflection-head h3 {
          margin: 0;
          color: #0f172a;
          font-size: 20px;
          line-height: 1.55;
          font-weight: 950;
        }

        .weekly-reflection-head p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 780;
        }

        .weekly-reflection-progress {
          min-width: 120px;
          border-radius: 20px;
          padding: 12px;
          color: #fff;
          background: linear-gradient(135deg, #0f172a, #064e3b);
          text-align: center;
        }

        .weekly-reflection-progress strong {
          display: block;
          color: #fbbf24;
          font-size: 20px;
          font-weight: 950;
          line-height: 1.2;
        }

        .weekly-reflection-progress span {
          display: block;
          margin-top: 4px;
          color: #d1fae5;
          font-size: 10px;
          font-weight: 850;
        }

        .weekly-reflection-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .weekly-reflection-panel label {
          display: grid;
          gap: 7px;
          color: #334155;
          font-size: 12px;
          font-weight: 950;
        }

        .weekly-reflection-panel textarea,
        .weekly-reflection-panel input,
        .weekly-reflection-panel select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #cbd5e1;
          border-radius: 18px;
          padding: 12px;
          color: #0f172a;
          background: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          outline: none;
        }

        .weekly-reflection-panel textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.9;
        }

        .weekly-reflection-panel textarea:focus,
        .weekly-reflection-panel input:focus,
        .weekly-reflection-panel select:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16,185,129,.10);
        }

        .weekly-reflection-wide {
          grid-column: 1 / -1;
        }

        .weekly-reflection-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
        }

        .weekly-reflection-actions button {
          border: 0;
          cursor: pointer;
          min-height: 44px;
          border-radius: 16px;
          padding: 0 15px;
          color: #fff;
          background: linear-gradient(135deg, #10b981, #047857);
          font-family: inherit;
          font-weight: 950;
          box-shadow: 0 14px 30px rgba(16,185,129,.18);
        }

        .weekly-reflection-actions button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .weekly-reflection-status {
          color: #475569;
          font-size: 12px;
          font-weight: 850;
          line-height: 1.8;
        }

        @media (max-width: 760px) {
          .weekly-reflection-head,
          .weekly-reflection-grid {
            grid-template-columns: 1fr;
          }

          .weekly-reflection-progress {
            width: fit-content;
          }
        }
      `}</style>

      <div className="weekly-reflection-head">
        <div>
          <span className="weekly-reflection-kicker">تأمل أسبوعي + خطة تطبيق</span>
          <h3>{title}</h3>
          <p>
            في نهاية الأسبوع، حوّل التعلم إلى أثر: فكرة رئيسية، نمط تنظيمي أصبحت
            تراه، وتطبيق عملي ستنفذه في عملك أو دراستك.
          </p>
        </div>

        <div className="weekly-reflection-progress">
          <strong>{progressLabel}</strong>
          <span>تقدم هذا الأسبوع</span>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="weekly-reflection-grid">
          <label>
            أهم فكرة تعلمتها هذا الأسبوع
            <textarea
              value={form.keyLearning}
              onChange={(event) => updateField("keyLearning", event.target.value)}
              placeholder="مثال: التشخيص لا يبدأ من الشكوى بل من فهم النظام..."
            />
          </label>

          <label>
            ما النمط أو الخطأ التنظيمي الذي أصبحت تراه أوضح؟
            <textarea
              value={form.observedPattern}
              onChange={(event) => updateField("observedPattern", event.target.value)}
              placeholder="مثال: الخلط بين المشكلة الظاهرة والسبب الجذري..."
            />
          </label>

          <label>
            كيف ستطبق ما تعلمته؟
            <textarea
              value={form.applicationIdea}
              onChange={(event) => updateField("applicationIdea", event.target.value)}
              placeholder="اكتب موقفًا عمليًا أو تجربة ستطبق فيها الفكرة."
            />
          </label>

          <label>
            الإجراء العملي القادم
            <textarea
              value={form.nextAction}
              onChange={(event) => updateField("nextAction", event.target.value)}
              placeholder="مثال: سأبني أسئلة تشخيصية قبل اقتراح أي حل..."
            />
          </label>

          <label className="weekly-reflection-wide">
            مستوى ثقتك بتطبيق الخطة
            <select
              value={form.confidenceScore}
              onChange={(event) => updateField("confidenceScore", Number(event.target.value))}
            >
              <option value={1}>1 - منخفض جدًا</option>
              <option value={2}>2 - منخفض</option>
              <option value={3}>3 - متوسط</option>
              <option value={4}>4 - مرتفع</option>
              <option value={5}>5 - مرتفع جدًا</option>
            </select>
          </label>
        </div>

        <div className="weekly-reflection-actions">
          <button type="submit" disabled={saving || loading}>
            {saving ? "جارٍ الحفظ..." : "حفظ التأمل وخطة التطبيق"}
          </button>

          {(status || savedAt) && (
            <span className="weekly-reflection-status">
              {status || `آخر حفظ: ${formatDate(savedAt)}`}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
