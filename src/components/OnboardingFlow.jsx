import { useMemo, useState } from "react";

function clamp(value, min, max) {
  const number = Number(value || 0);
  return Math.min(max, Math.max(min, Number.isFinite(number) ? number : min));
}

export default function OnboardingFlow({
  userName = "متدرب",
  completedDays = 0,
  totalDays = 168,
  loading = false,
  onComplete
}) {
  const [busyChoice, setBusyChoice] = useState("");

  const safeCompleted = clamp(completedDays, 0, totalDays);
  const progress = Math.round((safeCompleted / Math.max(1, totalDays)) * 100);

  const firstName = useMemo(() => {
    const clean = String(userName || "متدرب").trim();
    return clean.split(/\s+/)[0] || "متدرب";
  }, [userName]);

  async function choose(choice) {
    setBusyChoice(choice);

    try {
      await onComplete?.(choice);
    } finally {
      setBusyChoice("");
    }
  }

  const disabled = loading || Boolean(busyChoice);

  return (
    <section className="onboarding-overlay" dir="rtl" aria-label="الترحيب الذكي">
      <style>{`
        .onboarding-overlay {
          position: fixed;
          inset: 0;
          z-index: 120;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(28, 17, 48, 0.62);
          backdrop-filter: blur(14px);
        }

        .onboarding-card {
          width: min(1080px, 100%);
          max-height: 92vh;
          overflow: auto;
          border-radius: 36px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 34%),
            radial-gradient(circle at 0% 100%, rgba(245,158,11,.10), transparent 32%),
            #ffffff;
          border: 1px solid rgba(255,255,255,.72);
          box-shadow: 0 34px 100px rgba(0,0,0,.30);
        }

        .onboarding-inner {
          padding: clamp(22px, 4vw, 38px);
        }

        .onboarding-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(280px, .9fr);
          gap: 22px;
          align-items: stretch;
        }

        .onboarding-badge {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          color: #6d28d9;
          background: #efe9fb;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 12px;
        }

        .onboarding-title {
          margin: 0;
          color: #18102e;
          font-size: clamp(30px, 5vw, 56px);
          line-height: 1.18;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .onboarding-title span {
          color: #8b5cf6;
        }

        .onboarding-lead {
          margin: 16px 0 0;
          color: #5b4f78;
          line-height: 2;
          font-size: 15px;
          font-weight: 760;
        }

        .onboarding-route {
          border-radius: 30px;
          padding: 22px;
          color: #fff;
          background:
            radial-gradient(circle at 15% 15%, rgba(245,158,11,.22), transparent 32%),
            linear-gradient(135deg, #18102e, #1e1b4b 64%, #3b1d6e);
          box-shadow: 0 22px 58px rgba(28, 17, 48,.18);
        }

        .onboarding-route h3 {
          margin: 0 0 12px;
          color: #fff;
          font-size: 22px;
          line-height: 1.5;
          font-weight: 950;
        }

        .onboarding-progress-orb {
          width: 148px;
          height: 148px;
          border-radius: 50%;
          margin: 16px auto;
          display: grid;
          place-items: center;
          background:
            conic-gradient(#a855f7 ${progress * 3.6}deg, rgba(255,255,255,.15) 0deg);
          box-shadow: inset 0 0 0 11px rgba(28, 17, 48,.35);
        }

        .onboarding-progress-orb div {
          width: 106px;
          height: 106px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          text-align: center;
          background: #18102e;
          border: 1px solid rgba(255,255,255,.12);
        }

        .onboarding-progress-orb strong {
          color: #fff;
          font-size: 30px;
          line-height: 1;
          font-weight: 950;
        }

        .onboarding-progress-orb small {
          display: block;
          color: #c9bdf0;
          margin-top: 5px;
          font-weight: 850;
        }

        .onboarding-route p {
          margin: 0;
          color: #c9bdf0;
          line-height: 1.9;
          font-size: 13px;
          font-weight: 780;
        }

        .onboarding-steps {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          margin: 22px 0;
        }

        .onboarding-step {
          border-radius: 22px;
          padding: 14px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .onboarding-step b {
          display: inline-grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border-radius: 12px;
          color: #6d28d9;
          background: #efe9fb;
          font-size: 12px;
          margin-bottom: 9px;
        }

        .onboarding-step strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 950;
          margin-bottom: 6px;
        }

        .onboarding-step span {
          display: block;
          color: #7a6c9a;
          line-height: 1.75;
          font-size: 11px;
          font-weight: 760;
        }

        .onboarding-actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .onboarding-action {
          border: none;
          cursor: pointer;
          border-radius: 24px;
          padding: 18px;
          min-height: 112px;
          text-align: right;
          font-family: inherit;
          color: #18102e;
          background: #ffffff;
          border: 1px solid rgba(167, 139, 250,.22);
          box-shadow: 0 16px 38px rgba(28, 17, 48,.06);
          transition: .2s ease;
        }

        .onboarding-action:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 22px 44px rgba(139, 92, 246,.11);
          border-color: rgba(139, 92, 246,.32);
        }

        .onboarding-action:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .onboarding-action.primary {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
        }

        .onboarding-action.secondary {
          background:
            radial-gradient(circle at 100% 0%, rgba(16,185,129,.12), transparent 32%),
            #ffffff;
        }

        .onboarding-action strong {
          display: block;
          font-size: 16px;
          line-height: 1.6;
          font-weight: 950;
          margin-bottom: 6px;
        }

        .onboarding-action span {
          display: block;
          color: inherit;
          opacity: .76;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .onboarding-skip {
          display: flex;
          justify-content: center;
          margin-top: 14px;
        }

        .onboarding-skip button {
          border: none;
          cursor: pointer;
          color: #7a6c9a;
          background: transparent;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          padding: 10px;
        }

        @media (max-width: 980px) {
          .onboarding-hero,
          .onboarding-actions {
            grid-template-columns: 1fr;
          }

          .onboarding-steps {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 560px) {
          .onboarding-steps {
            grid-template-columns: 1fr;
          }

          .onboarding-card {
            border-radius: 26px;
          }
        }
      `}</style>

      <div className="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <div className="onboarding-inner">
          <div className="onboarding-hero">
            <div>
              <span className="onboarding-badge">بداية ذكية داخل مختبر OD</span>
              <h2 id="onboarding-title" className="onboarding-title">
                حياك يا <span>{firstName}</span>، خلّنا نختصر عليك الطريق.
              </h2>
              <p className="onboarding-lead">
                هذه ليست صفحة ترحيب شكلية. الهدف منها أن تعرف أين تبدأ: تقيس
                مستواك أولًا، أو تدخل الرحلة مباشرة، ثم تتابع تطورك عبر الرادار
                والشهادات الشهرية حتى وثيقة الإتقان.
              </p>
            </div>

            <aside className="onboarding-route" aria-label="ملخص تقدمك الحالي">
              <h3>أنت داخل رحلة من ستة أشهر</h3>
              <div
                className="onboarding-progress-orb od-circular-indicator od-indicator-general"
                style={{ "--od-indicator-progress": `${progress}%` }}
              >
                <div>
                  <span>
                    <strong>{progress}%</strong>
                    <small>{safeCompleted} / {totalDays}</small>
                  </span>
                </div>
              </div>
              <p>
                يمكنك اختيار البداية أو إخفاء هذه الشاشة نهائيًا. سنحفظ اختيارك حتى لا تظهر في كل دخول. تستطيع
                دائمًا الوصول لكل الأقسام من الشريط العلوي.
              </p>
            </aside>
          </div>

          <div className="onboarding-steps" aria-label="خريطة الاستخدام المقترحة">
            <div className="onboarding-step">
              <b>01</b>
              <strong>اختبار قبلي</strong>
              <span>يقيس بصمتك الاستشارية عبر ست جدارات.</span>
            </div>
            <div className="onboarding-step">
              <b>02</b>
              <strong>رحلة يومية</strong>
              <span>تفتح 168 يومًا تعليميًا بالتدرج عبر 24 أسبوعًا.</span>
            </div>
            <div className="onboarding-step">
              <b>03</b>
              <strong>رادار الأداء</strong>
              <span>يربط تقدمك الفعلي بمستوى الجدارات.</span>
            </div>
            <div className="onboarding-step">
              <b>04</b>
              <strong>شهادات شهرية</strong>
              <span>تظهر عند إكمال كل شهر تعليمي من 4 أسابيع.</span>
            </div>
            <div className="onboarding-step">
              <b>05</b>
              <strong>وثيقة الإتقان</strong>
              <span>تفتح عند إكمال كامل الرحلة.</span>
            </div>
          </div>

          <div className="onboarding-actions">
            <button
              type="button"
              className="onboarding-action primary"
              onClick={() => choose("pre-assessment")}
              disabled={disabled}
            >
              <strong>{busyChoice === "pre-assessment" ? "جارٍ التوجيه..." : "ابدأ بالاختبار القبلي"}</strong>
              <span>أفضل بداية لمن يريد قياس مستوى التفكير قبل الدخول في المسار.</span>
            </button>

            <button
              type="button"
              className="onboarding-action secondary"
              onClick={() => choose("journey")}
              disabled={disabled}
            >
              <strong>{busyChoice === "journey" ? "جارٍ التوجيه..." : "ابدأ الرحلة مباشرة"}</strong>
              <span>ينقلك إلى الرحلة التعليمية أو آخر محطة وصلت إليها.</span>
            </button>

            <button
              type="button"
              className="onboarding-action"
              onClick={() => choose("home")}
              disabled={disabled}
            >
              <strong>{busyChoice === "home" ? "جارٍ الحفظ..." : "استكشف الرئيسية أولًا"}</strong>
              <span>يغلق الترحيب ويبقيك في الصفحة الرئيسية لتتعرف على المنصة.</span>
            </button>
          </div>

          <div className="onboarding-skip">
            <button type="button" onClick={() => choose("later")} disabled={disabled}>
              عدم إظهار الترحيب مجددًا
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
