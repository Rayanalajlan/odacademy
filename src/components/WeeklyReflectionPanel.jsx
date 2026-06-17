import { useEffect, useMemo, useState } from "react";
import {
  getWeeklyReflection,
  saveWeeklyReflection
} from "../lib/weeklyReflectionService";
import NeoMetricGauge from "./NeoMetricGauge";

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
    return weekTitle || `Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ ${weekIndex || ""}`.trim();
  }, [weekTitle, weekIndex]);

  const progressLabel = `${Number(completedDaysInWeek || 0)} / ${Number(totalDaysInWeek || 7)} Ø£ÙŠØ§Ù…`;

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
      console.warn("ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØ£Ù…Ù„ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ:", error);
      setStatus("ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØªØ£Ù…Ù„ Ø§Ù„Ø³Ø§Ø¨Ù‚ Ù„Ù‡Ø°Ø§ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹.");
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
      setStatus("Ø§Ø®ØªØ± Ø£Ø³Ø¨ÙˆØ¹Ù‹Ø§ ØµØ­ÙŠØ­Ù‹Ø§ Ù‚Ø¨Ù„ Ø§Ù„Ø­ÙØ¸.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const saved = await saveWeeklyReflection({
        monthIndex,
        weekIndex,
        weekTitle: [monthTitle, title].filter(Boolean).join(" Â· "),
        keyLearning: form.keyLearning,
        observedPattern: form.observedPattern,
        applicationIdea: form.applicationIdea,
        nextAction: form.nextAction,
        confidenceScore: form.confidenceScore,
        status: "submitted"
      });

      setSavedAt(saved.updated_at || saved.created_at || new Date().toISOString());
      setStatus("ØªÙ… Ø­ÙØ¸ Ø§Ù„ØªØ£Ù…Ù„ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ ÙˆØ®Ø·Ø© Ø§Ù„ØªØ·Ø¨ÙŠÙ‚.");
    } catch (error) {
      setStatus(error?.message || "ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„ØªØ£Ù…Ù„ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ.");
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
    <section className="weekly-reflection-panel" aria-label="Ø§Ù„ØªØ£Ù…Ù„ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ ÙˆØ®Ø·Ø© Ø§Ù„ØªØ·Ø¨ÙŠÙ‚" dir="rtl">
      <style>{`
        .weekly-reflection-panel {
          margin: 18px 0;
          border-radius: 30px;
          padding: 20px;
          background:
            radial-gradient(circle at 100% 0%, rgba(16,185,129,.12), transparent 34%),
            radial-gradient(circle at 0% 100%, rgba(139, 92, 246,.10), transparent 32%),
            rgba(255,255,255,.95);
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
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
          color: #18102e;
          font-size: 20px;
          line-height: 1.55;
          font-weight: 950;
        }

        .weekly-reflection-head p {
          margin: 6px 0 0;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 780;
        }

        .weekly-reflection-progress {
          min-width: 120px;
          border-radius: 20px;
          padding: 12px;
          color: #fff;
          background: linear-gradient(135deg, #18102e, #064e3b);
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
          color: #463c63;
          font-size: 12px;
          font-weight: 950;
        }

        .weekly-reflection-panel textarea,
        .weekly-reflection-panel input,
        .weekly-reflection-panel select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #c9bdf0;
          border-radius: 18px;
          padding: 12px;
          color: #18102e;
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
          color: #5b4f78;
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
          <span className="weekly-reflection-kicker">ØªØ£Ù…Ù„ Ø£Ø³Ø¨ÙˆØ¹ÙŠ + Ø®Ø·Ø© ØªØ·Ø¨ÙŠÙ‚</span>
          <h3>{title}</h3>
          <p>
            ÙÙŠ Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ØŒ Ø­ÙˆÙ‘Ù„ Ø§Ù„ØªØ¹Ù„Ù… Ø¥Ù„Ù‰ Ø£Ø«Ø±: ÙÙƒØ±Ø© Ø±Ø¦ÙŠØ³ÙŠØ©ØŒ Ù†Ù…Ø· ØªÙ†Ø¸ÙŠÙ…ÙŠ Ø£ØµØ¨Ø­Øª
            ØªØ±Ø§Ù‡ØŒ ÙˆØªØ·Ø¨ÙŠÙ‚ Ø¹Ù…Ù„ÙŠ Ø³ØªÙ†ÙØ°Ù‡ ÙÙŠ Ø¹Ù…Ù„Ùƒ Ø£Ùˆ Ø¯Ø±Ø§Ø³ØªÙƒ.
          </p>
        </div>

        <NeoMetricGauge
          className="weekly-reflection-gauge"
          value={Number(completedDaysInWeek || 0)}
          max={Number(totalDaysInWeek || 7)}
          displayValue={progressLabel}
          label="تقدم هذا الأسبوع"
          status={Number(completedDaysInWeek || 0) >= Number(totalDaysInWeek || 7) ? "complete" : "progress"}
          size="default"
        />
      </div>

      <form onSubmit={handleSave}>
        <div className="weekly-reflection-grid">
          <label>
            Ø£Ù‡Ù… ÙÙƒØ±Ø© ØªØ¹Ù„Ù…ØªÙ‡Ø§ Ù‡Ø°Ø§ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹
            <textarea
              value={form.keyLearning}
              onChange={(event) => updateField("keyLearning", event.target.value)}
              placeholder="Ù…Ø«Ø§Ù„: Ø§Ù„ØªØ´Ø®ÙŠØµ Ù„Ø§ ÙŠØ¨Ø¯Ø£ Ù…Ù† Ø§Ù„Ø´ÙƒÙˆÙ‰ Ø¨Ù„ Ù…Ù† ÙÙ‡Ù… Ø§Ù„Ù†Ø¸Ø§Ù…..."
            />
          </label>

          <label>
            Ù…Ø§ Ø§Ù„Ù†Ù…Ø· Ø£Ùˆ Ø§Ù„Ø®Ø·Ø£ Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ Ø§Ù„Ø°ÙŠ Ø£ØµØ¨Ø­Øª ØªØ±Ø§Ù‡ Ø£ÙˆØ¶Ø­ØŸ
            <textarea
              value={form.observedPattern}
              onChange={(event) => updateField("observedPattern", event.target.value)}
              placeholder="Ù…Ø«Ø§Ù„: Ø§Ù„Ø®Ù„Ø· Ø¨ÙŠÙ† Ø§Ù„Ù…Ø´ÙƒÙ„Ø© Ø§Ù„Ø¸Ø§Ù‡Ø±Ø© ÙˆØ§Ù„Ø³Ø¨Ø¨ Ø§Ù„Ø¬Ø°Ø±ÙŠ..."
            />
          </label>

          <label>
            ÙƒÙŠÙ Ø³ØªØ·Ø¨Ù‚ Ù…Ø§ ØªØ¹Ù„Ù…ØªÙ‡ØŸ
            <textarea
              value={form.applicationIdea}
              onChange={(event) => updateField("applicationIdea", event.target.value)}
              placeholder="Ø§ÙƒØªØ¨ Ù…ÙˆÙ‚ÙÙ‹Ø§ Ø¹Ù…Ù„ÙŠÙ‹Ø§ Ø£Ùˆ ØªØ¬Ø±Ø¨Ø© Ø³ØªØ·Ø¨Ù‚ ÙÙŠÙ‡Ø§ Ø§Ù„ÙÙƒØ±Ø©."
            />
          </label>

          <label>
            Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ø¹Ù…Ù„ÙŠ Ø§Ù„Ù‚Ø§Ø¯Ù…
            <textarea
              value={form.nextAction}
              onChange={(event) => updateField("nextAction", event.target.value)}
              placeholder="Ù…Ø«Ø§Ù„: Ø³Ø£Ø¨Ù†ÙŠ Ø£Ø³Ø¦Ù„Ø© ØªØ´Ø®ÙŠØµÙŠØ© Ù‚Ø¨Ù„ Ø§Ù‚ØªØ±Ø§Ø­ Ø£ÙŠ Ø­Ù„..."
            />
          </label>

          <label className="weekly-reflection-wide">
            Ù…Ø³ØªÙˆÙ‰ Ø«Ù‚ØªÙƒ Ø¨ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ø®Ø·Ø©
            <select
              value={form.confidenceScore}
              onChange={(event) => updateField("confidenceScore", Number(event.target.value))}
            >
              <option value={1}>1 - Ù…Ù†Ø®ÙØ¶ Ø¬Ø¯Ù‹Ø§</option>
              <option value={2}>2 - Ù…Ù†Ø®ÙØ¶</option>
              <option value={3}>3 - Ù…ØªÙˆØ³Ø·</option>
              <option value={4}>4 - Ù…Ø±ØªÙØ¹</option>
              <option value={5}>5 - Ù…Ø±ØªÙØ¹ Ø¬Ø¯Ù‹Ø§</option>
            </select>
          </label>
        </div>

        <div className="weekly-reflection-actions">
          <button type="submit" disabled={saving || loading}>
            {saving ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸..." : "Ø­ÙØ¸ Ø§Ù„ØªØ£Ù…Ù„ ÙˆØ®Ø·Ø© Ø§Ù„ØªØ·Ø¨ÙŠÙ‚"}
          </button>

          {(status || savedAt) && (
            <span className="weekly-reflection-status">
              {status || `Ø¢Ø®Ø± Ø­ÙØ¸: ${formatDate(savedAt)}`}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

