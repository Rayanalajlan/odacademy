import { useEffect, useMemo, useState } from "react";
import {
  FEEDBACK_STAGES,
  fetchFeedbackState,
  submitJourneyFeedback
} from "../lib/feedbackService";

const SECTION_OPTIONS = [
  "رحلتك التعليمية",
  "المحاكاة",
  "الموجه الذكي",
  "رادار الأداء",
  "وثيقة الإتقان",
  "الواجهة والتنظيم",
  "أخرى"
];

function StarRating({ value, onChange, label }) {
  return (
    <div className="feedback-rating">
      <span>{label}</span>
      <div>
        {[1, 2, 3, 4, 5].map((item) => (
          <button
            key={item}
            type="button"
            className={Number(value) >= item ? "active" : ""}
            onClick={() => onChange(item)}
            aria-label={`${label}: ${item} من 5`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackPrompt({ completedDays = 0, totalDays = 168, onAdminDetected }) {
  const [state, setState] = useState({
    isAdmin: false,
    eligibleStage: null,
    submittedStages: [],
    currentStageSubmitted: false
  });
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    clarityRating: 0,
    odDepthRating: 0,
    overallRating: 0,
    capabilityRating: 0,
    recommend: "",
    mostHelpfulSection: "",
    improvementText: "",
    transformationText: "",
    testimonialText: "",
    publishConsent: false,
    displayNamePreference: "anonymous"
  });

  async function load() {
    const result = await fetchFeedbackState({ completedDays, totalDays });
    setState(result);

    if (result.isAdmin && typeof onAdminDetected === "function") {
      onAdminDetected(true);
    }
  }

  useEffect(() => {
    load().catch((error) => console.warn("تعذر تحميل حالة التقييم:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedDays, totalDays]);

  const stage = state.eligibleStage;
  const config = stage ? FEEDBACK_STAGES[stage] : null;
  const shouldShow = Boolean(stage && !state.currentStageSubmitted && !dismissed && !sent);
  const isFinalStage = stage === "month_6";

  const primaryRatingMissing = useMemo(() => {
    if (isFinalStage) return !form.overallRating || !form.capabilityRating;
    return !form.clarityRating || !form.odDepthRating;
  }, [form, isFinalStage]);

  async function submit(event) {
    event.preventDefault();

    if (primaryRatingMissing) {
      alert("فضلاً أكمل التقييمات الأساسية قبل الإرسال.");
      return;
    }

    setSaving(true);
    setSubmitError("");

    try {
      await submitJourneyFeedback({
        stage,
        completedDays,
        totalDays,
        ...form,
        recommend: form.recommend === "yes"
      });

      setSent(true);
      setOpen(false);
      await load();
    } catch (error) {
      console.warn("تعذر إرسال التقييم:", error);
      setSubmitError(
        error?.message?.includes("journey_feedback")
          ? "تعذر حفظ التقييم بسبب إعداد قديم في قاعدة البيانات. تم حفظ المحاولة في الواجهة، ويلزم تحديث قيد مراحل التقييم في Supabase."
          : error?.message || "تعذر إرسال التقييم الآن. حاول مرة أخرى بعد قليل."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!shouldShow) return null;

  return (
    <section className="feedback-prompt" dir="rtl">
      <style>{`
        .feedback-prompt {
          width: min(1180px, calc(100% - 28px));
          margin: 14px auto;
        }

        .feedback-card {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 14px;
          align-items: center;
          border-radius: 28px;
          padding: 18px;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.15), transparent 34%),
            linear-gradient(135deg, #fff, #f4f0fb);
          border: 1px solid rgba(167, 139, 250,.22);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
        }

        .feedback-card b {
          display: inline-flex;
          margin-bottom: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          color: #6d28d9;
          background: #efe9fb;
          border: 1px solid rgba(167, 139, 250, .22);
          font-size: 11px;
          font-weight: 950;
        }

        .feedback-card h3 {
          margin: 0 0 6px;
          color: #18102e;
          font-size: 20px;
          line-height: 1.5;
          font-weight: 950;
        }

        .feedback-card p {
          margin: 0;
          color: #7a6c9a;
          font-size: 13px;
          line-height: 1.9;
          font-weight: 780;
        }

        .feedback-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .feedback-actions button,
        .feedback-submit {
          border: 0;
          min-height: 42px;
          border-radius: 16px;
          padding: 0 14px;
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
        }

        .feedback-actions .primary,
        .feedback-submit {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
        }

        .feedback-actions .soft {
          color: #463c63;
          background: #efe9fb;
        }

        .feedback-backdrop {
          position: fixed;
          inset: 0;
          z-index: 160;
          background: rgba(28, 17, 48,.46);
          backdrop-filter: blur(8px);
        }

        .feedback-modal {
          position: fixed;
          z-index: 161;
          inset: 28px;
          overflow: auto;
          border-radius: 34px;
          padding: 24px;
          background:
            radial-gradient(circle at 0% 0%, rgba(139, 92, 246,.10), transparent 32%),
            #fff;
          box-shadow: 0 28px 90px rgba(28, 17, 48,.28);
        }

        .feedback-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .feedback-head h2 {
          margin: 0;
          color: #18102e;
          font-size: 26px;
          line-height: 1.5;
          font-weight: 950;
        }

        .feedback-head p {
          margin: 4px 0 0;
          color: #7a6c9a;
          line-height: 1.8;
          font-size: 13px;
          font-weight: 780;
        }

        .feedback-close {
          border: 0;
          width: 38px;
          height: 38px;
          border-radius: 14px;
          background: #efe9fb;
          color: #463c63;
          font-weight: 950;
          cursor: pointer;
        }

        .feedback-form {
          display: grid;
          gap: 14px;
        }

        .feedback-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .feedback-field {
          display: grid;
          gap: 7px;
          color: #463c63;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 900;
        }

        .feedback-field input,
        .feedback-field select,
        .feedback-field textarea {
          border: 1px solid #c9bdf0;
          border-radius: 16px;
          padding: 0 12px;
          min-height: 44px;
          font-family: inherit;
          font-weight: 800;
          color: #18102e;
          outline: none;
        }

        .feedback-field textarea {
          min-height: 96px;
          padding-top: 10px;
          resize: vertical;
        }

        .feedback-field.wide {
          grid-column: 1 / -1;
        }

        .feedback-rating {
          border-radius: 20px;
          padding: 13px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .feedback-rating span {
          display: block;
          color: #463c63;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .feedback-rating button {
          border: 0;
          background: transparent;
          cursor: pointer;
          color: #c9bdf0;
          font-size: 26px;
          line-height: 1;
        }

        .feedback-rating button.active {
          color: #a855f7;
        }

        .feedback-note {
          border-radius: 18px;
          padding: 13px;
          background: #efe9fb;
          color: #6d28d9;
          line-height: 1.8;
          font-size: 12px;
          font-weight: 850;
        }

        .feedback-error {
          border-radius: 18px;
          padding: 13px;
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          line-height: 1.8;
          font-size: 12px;
          font-weight: 900;
        }

        body.od-theme-dark .feedback-card {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, .18), transparent 34%),
            linear-gradient(145deg, rgba(24, 16, 46, .96), rgba(17, 9, 35, .96));
          border-color: rgba(196, 181, 253, .26);
          box-shadow: 0 18px 48px rgba(0, 0, 0, .26);
        }

        body.od-theme-dark .feedback-card b {
          color: #e9d5ff;
          background: rgba(139, 92, 246, .18);
          border-color: rgba(196, 181, 253, .24);
        }

        body.od-theme-dark .feedback-card h3,
        body.od-theme-dark .feedback-head h2 {
          color: #f8f4ff;
        }

        body.od-theme-dark .feedback-card p,
        body.od-theme-dark .feedback-head p {
          color: #c9bdf0;
        }

        body.od-theme-dark .feedback-actions .soft,
        body.od-theme-dark .feedback-close {
          color: #f8f4ff;
          background: rgba(255, 255, 255, .08);
          border: 1px solid rgba(196, 181, 253, .22);
        }

        body.od-theme-dark .feedback-modal {
          background:
            radial-gradient(circle at 0% 0%, rgba(139, 92, 246, .18), transparent 32%),
            linear-gradient(145deg, rgba(24, 16, 46, .98), rgba(17, 9, 35, .98));
          border: 1px solid rgba(196, 181, 253, .22);
          box-shadow: 0 28px 90px rgba(0, 0, 0, .40);
        }

        body.od-theme-dark .feedback-field {
          color: #e9d5ff;
        }

        body.od-theme-dark .feedback-field input,
        body.od-theme-dark .feedback-field select,
        body.od-theme-dark .feedback-field textarea {
          color: #f8f4ff;
          background: rgba(255, 255, 255, .07);
          border-color: rgba(196, 181, 253, .28);
        }

        body.od-theme-dark .feedback-rating {
          background: rgba(255, 255, 255, .07);
          border-color: rgba(196, 181, 253, .20);
        }

        body.od-theme-dark .feedback-rating span {
          color: #f8f4ff;
        }

        body.od-theme-dark .feedback-rating button {
          color: rgba(201, 189, 240, .48);
        }

        body.od-theme-dark .feedback-rating button.active {
          color: #c084fc;
        }

        body.od-theme-dark .feedback-note {
          color: #d8b4fe;
          background: rgba(139, 92, 246, .16);
          border: 1px solid rgba(196, 181, 253, .20);
        }

        body.od-theme-dark .feedback-error {
          color: #fecaca;
          background: rgba(127, 29, 29, .28);
          border-color: rgba(248, 113, 113, .34);
        }

        @media (max-width: 840px) {
          .feedback-card,
          .feedback-grid {
            grid-template-columns: 1fr;
          }

          .feedback-modal {
            inset: 10px;
            border-radius: 24px;
            padding: 16px;
          }
        }
      `}</style>

      <div className="feedback-card">
        <div>
          <b>{config.badge}</b>
          <h3>{config.title}</h3>
          <p>{config.description} لن يظهر رأيك للزوار إلا إذا وافقت على النشر وتمت مراجعته.</p>
        </div>

        <div className="feedback-actions">
          <button type="button" className="soft" onClick={() => setDismissed(true)}>
            لاحقًا
          </button>
          <button type="button" className="primary" onClick={() => setOpen(true)}>
            ابدأ التقييم
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="feedback-backdrop" onClick={() => setOpen(false)} />
          <section className="feedback-modal" role="dialog" aria-modal="true" aria-label={config.title}>
            <div className="feedback-head">
              <div>
                <h2>{config.title}</h2>
                <p>{config.thresholdLabel} · تقييمك يساعد في تطوير الرحلة ويمنح الزوار صورة صادقة عن أثرها.</p>
              </div>

              <button type="button" className="feedback-close" onClick={() => setOpen(false)}>×</button>
            </div>

            <form className="feedback-form" onSubmit={submit}>
              <div className="feedback-grid">
                {!isFinalStage && (
                  <>
                    <StarRating
                      label="كيف تقيم وضوح المسار حتى الآن؟"
                      value={form.clarityRating}
                      onChange={(value) => setForm((current) => ({ ...current, clarityRating: value }))}
                    />

                    <StarRating
                      label="هل ساعدتك الرحلة على فهم OD بشكل أعمق؟"
                      value={form.odDepthRating}
                      onChange={(value) => setForm((current) => ({ ...current, odDepthRating: value }))}
                    />
                  </>
                )}

                {isFinalStage && (
                  <>
                    <StarRating
                      label="كيف تقيم الرحلة كاملة؟"
                      value={form.overallRating}
                      onChange={(value) => setForm((current) => ({ ...current, overallRating: value }))}
                    />

                    <StarRating
                      label="هل أصبحت أكثر قدرة على تحليل المشكلات التنظيمية؟"
                      value={form.capabilityRating}
                      onChange={(value) => setForm((current) => ({ ...current, capabilityRating: value }))}
                    />
                  </>
                )}

                <label className="feedback-field">
                  ما أكثر جزء أفادك؟
                  <select
                    value={form.mostHelpfulSection}
                    onChange={(event) => setForm((current) => ({ ...current, mostHelpfulSection: event.target.value }))}
                  >
                    <option value="">اختر القسم</option>
                    {SECTION_OPTIONS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="feedback-field">
                  هل توصي غيرك بهذه الرحلة؟
                  <select
                    value={form.recommend}
                    onChange={(event) => setForm((current) => ({ ...current, recommend: event.target.value }))}
                  >
                    <option value="">اختر</option>
                    <option value="yes">نعم</option>
                    <option value="no">لا</option>
                  </select>
                </label>

                {isFinalStage && (
                  <label className="feedback-field wide">
                    ما أكبر تحول حصل في فهمك للتطوير التنظيمي؟
                    <textarea
                      value={form.transformationText}
                      onChange={(event) => setForm((current) => ({ ...current, transformationText: event.target.value }))}
                      placeholder="اكتب التحول أو الفرق الذي لاحظته في طريقة تفكيرك..."
                    />
                  </label>
                )}

                <label className="feedback-field wide">
                  ما الذي يحتاج تحسين؟
                  <textarea
                    value={form.improvementText}
                    onChange={(event) => setForm((current) => ({ ...current, improvementText: event.target.value }))}
                    placeholder="اكتب ملاحظة تطويرية صريحة ومفيدة..."
                  />
                </label>

                <label className="feedback-field wide">
                  شهادة قصيرة يمكن نشرها بعد موافقتك
                  <textarea
                    value={form.testimonialText}
                    onChange={(event) => setForm((current) => ({ ...current, testimonialText: event.target.value }))}
                    placeholder="مثال: بعد منتصف الرحلة أصبحت أقرأ المشكلة التنظيمية بطريقة أعمق..."
                  />
                </label>

                <label className="feedback-field">
                  هل تسمح بنشر رأيك في صفحة الزوار؟
                  <select
                    value={form.publishConsent ? "yes" : "no"}
                    onChange={(event) => setForm((current) => ({ ...current, publishConsent: event.target.value === "yes" }))}
                  >
                    <option value="no">لا</option>
                    <option value="yes">نعم، بعد المراجعة</option>
                  </select>
                </label>

                <label className="feedback-field">
                  طريقة عرض الاسم عند النشر
                  <select
                    value={form.displayNamePreference}
                    onChange={(event) => setForm((current) => ({ ...current, displayNamePreference: event.target.value }))}
                    disabled={!form.publishConsent}
                  >
                    <option value="anonymous">مجهول</option>
                    <option value="first">الاسم الأول</option>
                    <option value="full">الاسم كما في الملف</option>
                  </select>
                </label>
              </div>

              <div className="feedback-note">
                التقييم يحفظ أولًا للمراجعة. لن يظهر للزوار إلا بعد موافقتك على النشر وموافقة مدير المنصة.
              </div>

              {submitError ? <div className="feedback-error">{submitError}</div> : null}

              <button type="submit" className="feedback-submit" disabled={saving}>
                {saving ? "جارٍ الإرسال..." : "إرسال التقييم"}
              </button>
            </form>
          </section>
        </>
      )}
    </section>
  );
}
