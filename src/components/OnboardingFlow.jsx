import { useMemo, useState } from "react";
import NeoMetricGauge from "./NeoMetricGauge";

function clamp(value, min, max) {
  const number = Number(value || 0);
  return Math.min(max, Math.max(min, Number.isFinite(number) ? number : min));
}

export default function OnboardingFlow({
  userName = "Ù…ØªØ¯Ø±Ø¨",
  completedDays = 0,
  totalDays = 180,
  loading = false,
  onComplete
}) {
  const [busyChoice, setBusyChoice] = useState("");

  const safeCompleted = clamp(completedDays, 0, totalDays);
  const progress = Math.round((safeCompleted / Math.max(1, totalDays)) * 100);

  const firstName = useMemo(() => {
    const clean = String(userName || "Ù…ØªØ¯Ø±Ø¨").trim();
    return clean.split(/\s+/)[0] || "Ù…ØªØ¯Ø±Ø¨";
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
    <section className="onboarding-overlay" dir="rtl" aria-label="Ø§Ù„ØªØ±Ø­ÙŠØ¨ Ø§Ù„Ø°ÙƒÙŠ">
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
              <span className="onboarding-badge">Ø¨Ø¯Ø§ÙŠØ© Ø°ÙƒÙŠØ© Ø¯Ø§Ø®Ù„ Ù…Ø®ØªØ¨Ø± OD</span>
              <h2 id="onboarding-title" className="onboarding-title">
                Ø­ÙŠØ§Ùƒ ÙŠØ§ <span>{firstName}</span>ØŒ Ø®Ù„Ù‘Ù†Ø§ Ù†Ø®ØªØµØ± Ø¹Ù„ÙŠÙƒ Ø§Ù„Ø·Ø±ÙŠÙ‚.
              </h2>
              <p className="onboarding-lead">
                Ù‡Ø°Ù‡ Ù„ÙŠØ³Øª ØµÙØ­Ø© ØªØ±Ø­ÙŠØ¨ Ø´ÙƒÙ„ÙŠØ©. Ø§Ù„Ù‡Ø¯Ù Ù…Ù†Ù‡Ø§ Ø£Ù† ØªØ¹Ø±Ù Ø£ÙŠÙ† ØªØ¨Ø¯Ø£: ØªÙ‚ÙŠØ³
                Ù…Ø³ØªÙˆØ§Ùƒ Ø£ÙˆÙ„Ù‹Ø§ØŒ Ø£Ùˆ ØªØ¯Ø®Ù„ Ø§Ù„Ø±Ø­Ù„Ø© Ù…Ø¨Ø§Ø´Ø±Ø©ØŒ Ø«Ù… ØªØªØ§Ø¨Ø¹ ØªØ·ÙˆØ±Ùƒ Ø¹Ø¨Ø± Ø§Ù„Ø±Ø§Ø¯Ø§Ø±
                ÙˆØ§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª Ø§Ù„Ø´Ù‡Ø±ÙŠØ© Ø­ØªÙ‰ ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù†.
              </p>
            </div>

            <aside className="onboarding-route" aria-label="Ù…Ù„Ø®Øµ ØªÙ‚Ø¯Ù…Ùƒ Ø§Ù„Ø­Ø§Ù„ÙŠ">
              <h3>Ø£Ù†Øª Ø¯Ø§Ø®Ù„ Ø±Ø­Ù„Ø© Ù…Ù† 180 ÙŠÙˆÙ…Ù‹Ø§</h3>
              <NeoMetricGauge
                className="onboarding-progress-gauge"
                value={progress}
                max={100}
                displayValue={`${progress}%`}
                label="إنجاز الرحلة"
                subLabel={`${safeCompleted} / ${totalDays}`}
                status={progress >= 100 ? "complete" : "progress"}
                size="default"
              />
              <p>
                ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø¨Ø¯Ø§ÙŠØ© Ø£Ùˆ Ø¥Ø®ÙØ§Ø¡ Ù‡Ø°Ù‡ Ø§Ù„Ø´Ø§Ø´Ø© Ù†Ù‡Ø§Ø¦ÙŠÙ‹Ø§. Ø³Ù†Ø­ÙØ¸ Ø§Ø®ØªÙŠØ§Ø±Ùƒ Ø­ØªÙ‰ Ù„Ø§ ØªØ¸Ù‡Ø± ÙÙŠ ÙƒÙ„ Ø¯Ø®ÙˆÙ„. ØªØ³ØªØ·ÙŠØ¹
                Ø¯Ø§Ø¦Ù…Ù‹Ø§ Ø§Ù„ÙˆØµÙˆÙ„ Ù„ÙƒÙ„ Ø§Ù„Ø£Ù‚Ø³Ø§Ù… Ù…Ù† Ø§Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø¹Ù„ÙˆÙŠ.
              </p>
            </aside>
          </div>

          <div className="onboarding-steps" aria-label="Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ù‚ØªØ±Ø­Ø©">
            <div className="onboarding-step">
              <b>01</b>
              <strong>Ø§Ø®ØªØ¨Ø§Ø± Ù‚Ø¨Ù„ÙŠ</strong>
              <span>ÙŠÙ‚ÙŠØ³ Ø¨ØµÙ…ØªÙƒ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© Ø¹Ø¨Ø± Ø³Øª Ø¬Ø¯Ø§Ø±Ø§Øª.</span>
            </div>
            <div className="onboarding-step">
              <b>02</b>
              <strong>Ø±Ø­Ù„Ø© ÙŠÙˆÙ…ÙŠØ©</strong>
              <span>ØªÙØªØ­ Ø§Ù„Ø£ÙŠØ§Ù… ÙˆØªÙƒÙ…Ù„Ù‡Ø§ Ø¨Ø§Ù„ØªØ¯Ø±Ø¬ Ø­ØªÙ‰ 180 ÙŠÙˆÙ…Ù‹Ø§.</span>
            </div>
            <div className="onboarding-step">
              <b>03</b>
              <strong>Ø±Ø§Ø¯Ø§Ø± Ø§Ù„Ø£Ø¯Ø§Ø¡</strong>
              <span>ÙŠØ±Ø¨Ø· ØªÙ‚Ø¯Ù…Ùƒ Ø§Ù„ÙØ¹Ù„ÙŠ Ø¨Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø¬Ø¯Ø§Ø±Ø§Øª.</span>
            </div>
            <div className="onboarding-step">
              <b>04</b>
              <strong>Ø´Ù‡Ø§Ø¯Ø§Øª Ø´Ù‡Ø±ÙŠØ©</strong>
              <span>ØªØ¸Ù‡Ø± Ø¹Ù†Ø¯ ÙƒÙ„ 30 ÙŠÙˆÙ…Ù‹Ø§ Ù…ÙƒØªÙ…Ù„Ù‹Ø§.</span>
            </div>
            <div className="onboarding-step">
              <b>05</b>
              <strong>ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù†</strong>
              <span>ØªÙØªØ­ Ø¹Ù†Ø¯ Ø¥ÙƒÙ…Ø§Ù„ ÙƒØ§Ù…Ù„ Ø§Ù„Ø±Ø­Ù„Ø©.</span>
            </div>
          </div>

          <div className="onboarding-actions">
            <button
              type="button"
              className="onboarding-action primary"
              onClick={() => choose("pre-assessment")}
              disabled={disabled}
            >
              <strong>{busyChoice === "pre-assessment" ? "Ø¬Ø§Ø±Ù Ø§Ù„ØªÙˆØ¬ÙŠÙ‡..." : "Ø§Ø¨Ø¯Ø£ Ø¨Ø§Ù„Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ù‚Ø¨Ù„ÙŠ"}</strong>
              <span>Ø£ÙØ¶Ù„ Ø¨Ø¯Ø§ÙŠØ© Ù„Ù…Ù† ÙŠØ±ÙŠØ¯ Ù‚ÙŠØ§Ø³ Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ØªÙÙƒÙŠØ± Ù‚Ø¨Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„ ÙÙŠ Ø§Ù„Ù…Ø³Ø§Ø±.</span>
            </button>

            <button
              type="button"
              className="onboarding-action secondary"
              onClick={() => choose("journey")}
              disabled={disabled}
            >
              <strong>{busyChoice === "journey" ? "Ø¬Ø§Ø±Ù Ø§Ù„ØªÙˆØ¬ÙŠÙ‡..." : "Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø±Ø­Ù„Ø© Ù…Ø¨Ø§Ø´Ø±Ø©"}</strong>
              <span>ÙŠÙ†Ù‚Ù„Ùƒ Ø¥Ù„Ù‰ Ø§Ù„Ø±Ø­Ù„Ø© Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠØ© Ø£Ùˆ Ø¢Ø®Ø± Ù…Ø­Ø·Ø© ÙˆØµÙ„Øª Ø¥Ù„ÙŠÙ‡Ø§.</span>
            </button>

            <button
              type="button"
              className="onboarding-action"
              onClick={() => choose("home")}
              disabled={disabled}
            >
              <strong>{busyChoice === "home" ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸..." : "Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ø£ÙˆÙ„Ù‹Ø§"}</strong>
              <span>ÙŠØºÙ„Ù‚ Ø§Ù„ØªØ±Ø­ÙŠØ¨ ÙˆÙŠØ¨Ù‚ÙŠÙƒ ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ù„ØªØªØ¹Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ù…Ù†ØµØ©.</span>
            </button>
          </div>

          <div className="onboarding-skip">
            <button type="button" onClick={() => choose("later")} disabled={disabled}>
              Ø¹Ø¯Ù… Ø¥Ø¸Ù‡Ø§Ø± Ø§Ù„ØªØ±Ø­ÙŠØ¨ Ù…Ø¬Ø¯Ø¯Ù‹Ø§
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

