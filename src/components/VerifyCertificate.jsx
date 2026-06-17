import { useEffect, useState } from "react";
import { verifyCertificatePublic } from "../lib/masteryCertificateService";
import NeoMetricGauge from "./NeoMetricGauge";

export default function VerifyCertificate({ slug }) {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verify() {
      setLoading(true);
      setError("");

      try {
        const data = await verifyCertificatePublic(slug);

        if (!active) return;

        if (data) {
          setRecord(data);
        } else {
          setError("Ù„Ù… ÙŠØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ ÙˆØ«ÙŠÙ‚Ø© Ø£Ùˆ Ø´Ù‡Ø§Ø¯Ø© Ù…ÙØ¹Ù‘Ù„Ø© Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø±Ù‚Ù….");
        }
      } catch (err) {
        if (active) setError(err?.message || "ØªØ¹Ø°Ø± Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©.");
      } finally {
        if (active) setLoading(false);
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [slug]);

  const isMonthly =
    record?.certificate_type === "monthly" ||
    Number.isFinite(Number(record?.month_number));

  const certificateTitle = isMonthly
    ? "Ø´Ù‡Ø§Ø¯Ø© Ø¥Ù†Ø¬Ø§Ø² Ø´Ù‡Ø±ÙŠØ© Ù…ÙˆØ«Ù‘Ù‚Ø©"
    : "ÙˆØ«ÙŠÙ‚Ø© Ø¥ØªÙ‚Ø§Ù† Ù…ÙˆØ«Ù‘Ù‚Ø©";

  const certificateDescription = isMonthly
    ? "ØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø´Ù‡Ø§Ø¯Ø© Ø´Ù‡Ø±ÙŠØ© Ù…ÙØ¹Ù‘Ù„Ø© ÙˆØµØ§Ø¯Ø±Ø© Ø¨Ø¹Ø¯ Ø¥ÙƒÙ…Ø§Ù„ Ù…Ø­Ø·Ø© Ø´Ù‡Ø±ÙŠØ© Ù…Ù† Ø±Ø­Ù„Ø© Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ."
    : "ØªÙ… Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ ÙˆØ«ÙŠÙ‚Ø© Ù…ÙØ¹Ù‘Ù„Ø© ÙˆØµØ§Ø¯Ø±Ø© Ø¨Ø¹Ø¯ Ø¥ÙƒÙ…Ø§Ù„ Ø±Ø­Ù„Ø© Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ.";

  return (
    <main className="verify-page" dir="rtl">
      <style>{`
        .verify-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          color: #18102e;
          background:
            radial-gradient(circle at 12% 12%, rgba(139, 92, 246,.16), transparent 30%),
            radial-gradient(circle at 88% 18%, rgba(245,158,11,.14), transparent 28%),
            linear-gradient(135deg, #f4f0fb, #efe9fb);
          font-family: inherit;
        }

        .verify-card {
          width: min(820px, 100%);
          border-radius: 34px;
          padding: 28px;
          background: rgba(255,255,255,.94);
          border: 1px solid rgba(167, 139, 250,.22);
          box-shadow: 0 28px 80px rgba(28, 17, 48,.14);
        }

        .verify-card.success {
          border-color: rgba(16,185,129,.28);
        }

        .verify-mark {
          width: 76px;
          height: 76px;
          border-radius: 26px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          color: #fff;
          font-size: 32px;
          font-weight: 950;
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 18px 42px rgba(16,185,129,.22);
        }

        .verify-card h1 {
          margin: 0 0 12px;
          font-size: clamp(28px, 5vw, 46px);
          line-height: 1.18;
          font-weight: 950;
        }

        .verify-card p {
          margin: 0 0 18px;
          color: #7a6c9a;
          font-size: 14px;
          line-height: 2;
          font-weight: 760;
        }

        .verify-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .verify-field {
          border-radius: 20px;
          padding: 14px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .verify-field span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          font-weight: 850;
          margin-bottom: 6px;
        }

        .verify-field strong {
          display: block;
          color: #18102e;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 950;
          word-break: break-word;
        }

        .verify-state {
          display: inline-flex;
          border-radius: 999px;
          padding: 8px 12px;
          color: #065f46;
          background: #ecfdf5;
          border: 1px solid rgba(16,185,129,.22);
          font-weight: 950;
          font-size: 12px;
          margin-top: 12px;
        }

        .verify-home {
          display: inline-flex;
          margin-top: 20px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 16px;
          padding: 0 16px;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          font-weight: 950;
        }

        .verify-error {
          color: #991b1b;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 22px;
          padding: 16px;
          line-height: 1.9;
          font-weight: 850;
        }

        @media (max-width: 640px) {
          .verify-grid {
            grid-template-columns: 1fr;
          }

          .verify-card {
            padding: 20px;
            border-radius: 26px;
          }
        }
      `}</style>

      <section className={`verify-card ${record ? "success" : ""}`}>
        {loading ? (
          <>
            <div className="verify-mark">â€¦</div>
            <h1>Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©</h1>
            <p>Ù†Ø±Ø§Ø¬Ø¹ Ø±Ù‚Ù… Ø§Ù„ÙˆØ«ÙŠÙ‚Ø© ÙÙŠ Ù‚Ø§Ø¹Ø¯Ø© Ø¨ÙŠØ§Ù†Ø§Øª Ø±Ø­Ù„Ø© Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ.</p>
          </>
        ) : record ? (
          <>
            <div className="verify-mark">âœ“</div>
            <h1>{certificateTitle}</h1>
            <p>{certificateDescription}</p>

            <span className="verify-state">ØµØ§Ù„Ø­Ø© ÙˆÙ…ÙØ¹Ù‘Ù„Ø©</span>

            <div className="verify-grid">
              <NeoMetricGauge
                className="verify-days-gauge"
                value={record.completed_days}
                max={record.total_days}
                displayValue={`${record.completed_days} / ${record.total_days}`}
                label="الأيام المكتملة"
                status={record.completed_days >= record.total_days ? "complete" : "progress"}
                size="compact"
              />

              <div className="verify-field">
                <span>ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥ØµØ¯Ø§Ø±</span>
                <strong>
                  {record.issued_at
                    ? new Intl.DateTimeFormat("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }).format(new Date(record.issued_at))
                    : "ØºÙŠØ± Ù…Ø­Ø¯Ø¯"}
                </strong>
              </div>
            </div>

            <a className="verify-home" href="/">
              Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ù…Ù†ØµØ©
            </a>
          </>
        ) : (
          <>
            <div className="verify-mark" style={{ background: "linear-gradient(135deg,#ef4444,#991b1b)" }}>
              !
            </div>
            <h1>Ù„Ù… ÙŠØªÙ… Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©</h1>
            <div className="verify-error">
              {error || "Ø§Ù„Ø±Ø§Ø¨Ø· ØºÙŠØ± ØµØ­ÙŠØ­ Ø£Ùˆ Ø§Ù„ÙˆØ«ÙŠÙ‚Ø© ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„Ø©."}
            </div>

            <a className="verify-home" href="/">
              Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ù…Ù†ØµØ©
            </a>
          </>
        )}
      </section>
    </main>
  );
}

