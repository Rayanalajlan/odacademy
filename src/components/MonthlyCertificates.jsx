import { useEffect, useMemo, useState } from "react";
import {
  getOrCreateMonthlyCertificates,
  MONTHLY_MILESTONES
} from "../lib/monthlyCertificateService";
import { buildVerificationUrl, copyTextSafely } from "../lib/masteryCertificateService";
import NeoMetricGauge from "./NeoMetricGauge";

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatDate(value) {
  if (!value) return "ØºÙŠØ± ØµØ§Ø¯Ø± Ø¨Ø¹Ø¯";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(value));
  } catch {
    return "ØºÙŠØ± Ù…Ø­Ø¯Ø¯";
  }
}

export default function MonthlyCertificates({
  userName = "Ù…ØªØ¯Ø±Ø¨",
  completedDays = 0,
  totalDays = 180
}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");

  const safeCompletedDays = Math.max(0, Math.min(safeNumber(totalDays, 180), safeNumber(completedDays)));

  async function syncMonthlyCertificates() {
    setLoading(true);
    setError("");

    try {
      const data = await getOrCreateMonthlyCertificates({
        userName,
        completedDays: safeCompletedDays,
        totalDays
      });

      setRecords(data);
    } catch (syncError) {
      console.warn("ØªØ¹Ø°Ø± Ù…Ø²Ø§Ù…Ù†Ø© Ø´Ù‡Ø§Ø¯Ø§Øª Ø§Ù„Ø¥Ù†Ø¬Ø§Ø² Ø§Ù„Ø´Ù‡Ø±ÙŠØ©:", syncError);
      setError(syncError?.message || "ØªØ¹Ø°Ø± Ù…Ø²Ø§Ù…Ù†Ø© Ø´Ù‡Ø§Ø¯Ø§Øª Ø§Ù„Ø¥Ù†Ø¬Ø§Ø² Ø§Ù„Ø´Ù‡Ø±ÙŠØ© Ø§Ù„Ø¢Ù†.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    syncMonthlyCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName, safeCompletedDays, totalDays]);

  const unlockedCount = useMemo(() => {
    return records.filter((record) => record.status === "issued").length;
  }, [records]);

  async function copyVerification(record) {
    const url = buildVerificationUrl(record.verification_slug || record.certificate_code);
    const ok = await copyTextSafely(url);

    if (ok) {
      setCopiedSlug(record.verification_slug || record.certificate_code);
      setTimeout(() => setCopiedSlug(""), 2400);
    } else {
      alert("Ù„Ù… ÙŠØªÙ… Ù†Ø³Ø® Ø±Ø§Ø¨Ø· Ø§Ù„ØªØ­Ù‚Ù‚ ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§. Ø§Ù†Ø³Ø®Ù‡ ÙŠØ¯ÙˆÙŠÙ‹Ø§ Ù…Ù† Ø§Ù„Ø¨Ø·Ø§Ù‚Ø©.");
    }
  }

  const displayRecords = records.length
    ? records
    : MONTHLY_MILESTONES.map((milestone) => ({
        certificate_type: "monthly",
        month_number: milestone.monthNumber,
        month_title: milestone.title,
        month_subtitle: milestone.subtitle,
        required_days: milestone.requiredDays,
        completed_days: safeCompletedDays,
        total_days: totalDays,
        status: safeCompletedDays >= milestone.requiredDays ? "issued" : "locked",
        verification_enabled: false
      }));

  return (
    <section className="monthly-certificates mastery-no-print" aria-label="Ø´Ù‡Ø§Ø¯Ø§Øª Ø§Ù„Ø¥Ù†Ø¬Ø§Ø² Ø§Ù„Ø´Ù‡Ø±ÙŠØ©">
      <style>{`
        .monthly-certificates {
          margin-top: 24px;
          border-radius: 32px;
          padding: 24px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 34%),
            linear-gradient(135deg, rgba(255,255,255,.96), rgba(248,250,252,.94));
          border: 1px solid rgba(167, 139, 250, 0.22);
          box-shadow: 0 18px 55px rgba(28, 17, 48, 0.08);
        }

        .monthly-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: start;
          margin-bottom: 18px;
        }

        .monthly-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          background: #efe9fb;
          color: #6d28d9;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 10px;
        }

        .monthly-head h2 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: clamp(22px, 3vw, 34px);
          line-height: 1.35;
          font-weight: 950;
        }

        .monthly-head p {
          margin: 0;
          color: #7a6c9a;
          line-height: 1.9;
          font-size: 14px;
          font-weight: 760;
        }

        .monthly-status {
          min-width: 150px;
          border-radius: 24px;
          padding: 16px;
          text-align: center;
          background: #18102e;
          color: #fff;
          box-shadow: 0 18px 38px rgba(28, 17, 48,.14);
        }

        .monthly-status strong {
          display: block;
          color: #fbbf24;
          font-size: 34px;
          line-height: 1;
          margin-bottom: 6px;
        }

        .monthly-status span {
          display: block;
          color: #c9bdf0;
          font-size: 12px;
          font-weight: 850;
        }

        .monthly-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .monthly-card {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          padding: 18px;
          background: #ffffff;
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 16px 38px rgba(28, 17, 48,.06);
        }

        .monthly-card.issued {
          border-color: rgba(16,185,129,.28);
          background:
            radial-gradient(circle at top left, rgba(16,185,129,.12), transparent 35%),
            #ffffff;
        }

        .monthly-card.locked {
          background: #f4f0fb;
        }

        .monthly-card-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .monthly-badge {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          font-weight: 950;
          box-shadow: 0 14px 30px rgba(139, 92, 246,.18);
        }

        .monthly-lock {
          display: inline-flex;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 950;
          background: #efe9fb;
          color: #5b4f78;
          border: 1px solid rgba(167, 139, 250,.25);
        }

        .monthly-card.issued .monthly-lock {
          background: #ecfdf5;
          color: #065f46;
          border-color: rgba(16,185,129,.24);
        }

        .monthly-card h3 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: 18px;
          line-height: 1.55;
          font-weight: 950;
        }

        .monthly-card p {
          margin: 0 0 12px;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .monthly-mini {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }

        .monthly-mini div {
          border-radius: 16px;
          padding: 11px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.14);
        }

        .monthly-mini span {
          display: block;
          color: #7a6c9a;
          font-size: 10px;
          font-weight: 850;
          margin-bottom: 4px;
        }

        .monthly-mini strong {
          display: block;
          color: #18102e;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 950;
          word-break: break-word;
        }

        .monthly-progress {
          height: 10px;
          border-radius: 999px;
          background: #e0d8f5;
          overflow: hidden;
          margin-top: 12px;
        }

        .monthly-progress i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #8b5cf6, #10b981);
        }

        .monthly-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .monthly-button {
          border: none;
          cursor: pointer;
          border-radius: 16px;
          padding: 11px 13px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          color: #fff;
          background: linear-gradient(135deg,#8b5cf6,#3b1d6e);
        }

        .monthly-button.ghost {
          background: #efe9fb;
          color: #18102e;
          border: 1px solid rgba(167, 139, 250,.22);
        }

        .monthly-button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .monthly-warning {
          margin-top: 14px;
          border-radius: 20px;
          padding: 14px 16px;
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          font-weight: 850;
          line-height: 1.8;
        }

        @media (max-width: 980px) {
          .monthly-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 680px) {
          .monthly-head,
          .monthly-grid {
            grid-template-columns: 1fr;
          }

          .monthly-status {
            width: 100%;
            box-sizing: border-box;
          }
        }
      `}</style>

      <div className="monthly-head">
        <div>
          <span className="monthly-kicker">Phase 22 Â· Monthly Milestones</span>
          <h2>Ø´Ù‡Ø§Ø¯Ø§Øª Ø¥Ù†Ø¬Ø§Ø² Ø´Ù‡Ø±ÙŠØ© Ù‚Ø¨Ù„ ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù† Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©</h2>
          <p>
            Ø¨Ø¯Ù„ Ø§Ù†ØªØ¸Ø§Ø± Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ø±Ø­Ù„Ø© ÙƒØ§Ù…Ù„Ø©ØŒ ÙŠØ­ØµÙ„ Ø§Ù„Ù…ØªØ¯Ø±Ø¨ Ø¹Ù„Ù‰ Ø´Ù‡Ø§Ø¯Ø© Ø¥Ù†Ø¬Ø§Ø² Ù…ÙˆØ«Ù‚Ø©
            Ø¹Ù†Ø¯ Ø¥ÙƒÙ…Ø§Ù„ ÙƒÙ„ 30 ÙŠÙˆÙ…Ù‹Ø§. Ù‡Ø°Ù‡ Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª Ù…Ø±ØªØ¨Ø·Ø© Ø¨ØªÙ‚Ø¯Ù…Ù‡ Ø§Ù„ÙØ¹Ù„ÙŠ Ø¯Ø§Ø®Ù„
            Ø§Ù„Ù…Ù†ØµØ© ÙˆØªØ¸Ù‡Ø± ØªØ¯Ø±ÙŠØ¬ÙŠÙ‹Ø§ Ù…Ø¹ Ø§Ù„Ø¥Ù†Ø¬Ø§Ø².
          </p>

          <div className="monthly-actions">
            <button
              type="button"
              className="monthly-button"
              onClick={syncMonthlyCertificates}
              disabled={loading}
            >
              {loading ? "Ø¬Ø§Ø±Ù Ù…Ø²Ø§Ù…Ù†Ø© Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª..." : "ØªØ­Ø¯ÙŠØ« Ø´Ù‡Ø§Ø¯Ø§ØªÙŠ Ø§Ù„Ø´Ù‡Ø±ÙŠØ©"}
            </button>
          </div>
        </div>

        <NeoMetricGauge
          className="monthly-status-gauge"
          value={unlockedCount}
          max={6}
          displayValue={`${unlockedCount}/6`}
          label="شهادات شهرية مفتوحة"
          status={unlockedCount >= 6 ? "complete" : "progress"}
          size="default"
        />
      </div>

      {error ? <div className="monthly-warning">{error}</div> : null}

      <div className="monthly-grid">
        {displayRecords.map((record) => {
          const requiredDays = safeNumber(record.required_days, 30);
          const percent = Math.min(100, Math.round((safeCompletedDays / requiredDays) * 100));
          const issued = record.status === "issued";
          const canVerify = issued && record.verification_enabled;
          const copied =
            copiedSlug &&
            copiedSlug === (record.verification_slug || record.certificate_code);

          return (
            <article
              className={`monthly-card ${issued ? "issued" : "locked"}`}
              key={record.month_number}
            >
              <div className="monthly-card-top">
                <div className="monthly-badge">M{record.month_number}</div>
                <span className="monthly-lock">{issued ? "Ù…ÙØªÙˆØ­Ø©" : "Ù…Ù‚ÙÙ„Ø©"}</span>
              </div>

              <h3>{record.month_title}</h3>
              <p>{record.month_subtitle}</p>

              <NeoMetricGauge
                className="monthly-card-gauge"
                value={percent}
                max={100}
                displayValue={`${percent}%`}
                label="تقدم الشهر"
                subLabel={`${Math.min(safeCompletedDays, requiredDays)} / ${requiredDays} يومًا`}
                status={issued ? "complete" : "progress"}
                size="compact"
                ariaLabel={`تقدم الشهر ${record.month_number}`}
              />

              <div className="monthly-mini">
                <div>
                  <span>Ø´Ø±Ø· Ø§Ù„ÙØªØ­</span>
                  <strong>{Math.min(safeCompletedDays, requiredDays)} / {requiredDays} ÙŠÙˆÙ…Ù‹Ø§</strong>
                </div>

                <div>
                  <span>ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥ØµØ¯Ø§Ø±</span>
                  <strong>{issued ? formatDate(record.issued_at) : "Ø¨Ø¹Ø¯ Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„Ø´Ø±Ø·"}</strong>
                </div>

                <div>
                  <span>Ø±Ù‚Ù… Ø§Ù„Ø´Ù‡Ø§Ø¯Ø©</span>
                  <strong>{issued ? record.certificate_code : "ÙŠØ¸Ù‡Ø± Ø¨Ø¹Ø¯ Ø§Ù„ÙØªØ­"}</strong>
                </div>
              </div>

              {issued ? (
                <div className="monthly-actions">
                  <button
                    type="button"
                    className="monthly-button ghost"
                    onClick={() => copyVerification(record)}
                    disabled={!canVerify}
                  >
                    {copied ? "ØªÙ… Ù†Ø³Ø® Ø±Ø§Ø¨Ø· Ø§Ù„ØªØ­Ù‚Ù‚ âœ…" : canVerify ? "Ù†Ø³Ø® Ø±Ø§Ø¨Ø· Ø§Ù„ØªØ­Ù‚Ù‚" : "Ø§Ù„ØªØ­Ù‚Ù‚ ØºÙŠØ± Ù…ÙØ¹Ù„"}
                  </button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}


