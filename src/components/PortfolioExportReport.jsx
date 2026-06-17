import NeoMetricGauge from "./NeoMetricGauge";

function formatDate(value) {
  if (!value) return "ØºÙŠØ± Ù…Ø­Ø¯Ø¯";

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

function formatDateTime(value) {
  if (!value) return "ØºÙŠØ± Ù…Ø­Ø¯Ø¯";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "ØºÙŠØ± Ù…Ø­Ø¯Ø¯";
  }
}

function shortText(value, limit = 360) {
  const text = String(value || "").replace(/\s+/g, " ").trim();

  if (!text) return "Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù†Øµ Ù…Ø­ÙÙˆØ¸.";
  return text.length > limit ? `${text.slice(0, limit)}â€¦` : text;
}

function locationLabel(item) {
  return `Ø§Ù„Ø´Ù‡Ø± ${item?.month_index || "-"} Â· Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ ${item?.week_index || "-"} Â· Ø§Ù„ÙŠÙˆÙ… ${item?.day_index || "-"}`;
}

function certificateStatus(status) {
  if (status === "issued") return "Ù…ÙØªÙˆØ­Ø©";
  if (status === "revoked") return "Ù…Ù„ØºØ§Ø©";
  return "Ù…Ù‚ÙÙ„Ø©";
}

function printReport() {
  if (typeof window !== "undefined") {
    window.print();
  }
}

export default function PortfolioExportReport({
  userName = "Ù…ØªØ¯Ø±Ø¨",
  generatedAt = new Date().toISOString(),
  data,
  summary,
  loading = false,
  onClose
}) {
  const safeSummary = summary || {
    completedDays: 0,
    totalDays: 180,
    progressPercent: 0,
    remainingDays: 180,
    estimatedHours: 0
  };

  const bookmarks = data?.bookmarks || [];
  const pinnedNotes = data?.pinnedNotes || [];
  const weeklyReflections = data?.weeklyReflections || [];
  const radarHistory = data?.radarHistory || [];
  const monthlyCertificates = data?.monthlyCertificates || [];
  const issuedCertificates = data?.issuedCertificates || [];
  const latestRadar = data?.latestRadar || null;

  return (
    <section className="portfolio-export-shell" dir="rtl" aria-label="ØªÙ‚Ø±ÙŠØ± Ù…Ù„ÙÙŠ Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ">
      <style>{`
        .portfolio-export-shell {
          position: fixed;
          inset: 0;
          z-index: 160;
          overflow: auto;
          background: rgba(28, 17, 48,.58);
          backdrop-filter: blur(10px);
          padding: 18px;
        }

        .portfolio-export-report {
          width: min(1040px, 100%);
          margin: 0 auto;
          border-radius: 32px;
          overflow: hidden;
          background: #ffffff;
          color: #18102e;
          box-shadow: 0 34px 110px rgba(0,0,0,.34);
          border: 1px solid rgba(167, 139, 250,.24);
        }

        .report-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: #f4f0fb;
          border-bottom: 1px solid rgba(167, 139, 250,.22);
        }

        .report-toolbar strong {
          color: #18102e;
          font-size: 14px;
          font-weight: 950;
        }

        .report-toolbar-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .report-toolbar button {
          border: 0;
          cursor: pointer;
          min-height: 40px;
          border-radius: 14px;
          padding: 0 13px;
          font-family: inherit;
          font-weight: 950;
          color: #18102e;
          background: #e0d8f5;
        }

        .report-toolbar button.primary {
          color: #fff;
          background: linear-gradient(135deg, #047857, #064e3b);
        }

        .report-cover {
          padding: 34px;
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.26), transparent 34%),
            radial-gradient(circle at 0% 100%, rgba(16,185,129,.18), transparent 34%),
            linear-gradient(135deg, #18102e, #1e1b4b 58%, #3b1d6e);
        }

        .report-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 12px;
          color: #fde68a;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.15);
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 12px;
        }

        .report-cover h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 58px);
          line-height: 1.15;
          font-weight: 950;
        }

        .report-cover p {
          margin: 12px 0 0;
          color: #dbeafe;
          line-height: 1.9;
          font-size: 14px;
          font-weight: 760;
        }

        .report-meta {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .report-meta div,
        .report-stat {
          border-radius: 18px;
          padding: 13px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.14);
        }

        .report-meta span,
        .report-stat span {
          display: block;
          color: #c9bdf0;
          font-size: 11px;
          font-weight: 850;
          margin-bottom: 5px;
        }

        .report-meta strong,
        .report-stat strong {
          display: block;
          color: #fff;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 950;
        }

        .report-body {
          padding: 26px 34px 36px;
          background: #ffffff;
        }

        .report-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }

        .report-stats-grid .report-stat {
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .report-stats-grid .report-stat span {
          color: #7a6c9a;
        }

        .report-stats-grid .report-stat strong {
          color: #18102e;
          font-size: 24px;
        }

        .report-section {
          break-inside: avoid;
          page-break-inside: avoid;
          border-radius: 24px;
          padding: 18px;
          background: #ffffff;
          border: 1px solid rgba(167, 139, 250,.20);
          margin-top: 14px;
        }

        .report-section h2 {
          margin: 0 0 6px;
          color: #18102e;
          font-size: 20px;
          line-height: 1.5;
          font-weight: 950;
        }

        .report-section > p {
          margin: 0 0 12px;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .report-list {
          display: grid;
          gap: 9px;
        }

        .report-row {
          break-inside: avoid;
          page-break-inside: avoid;
          border-radius: 18px;
          padding: 12px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .report-row small {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 850;
          margin-bottom: 4px;
        }

        .report-row strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 950;
        }

        .report-row p {
          margin: 6px 0 0;
          color: #5b4f78;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 760;
        }

        .report-cert-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
        }

        .report-cert {
          border-radius: 16px;
          padding: 12px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .report-cert.issued {
          background: #ecfdf5;
          border-color: rgba(16,185,129,.24);
        }

        .report-cert b {
          display: block;
          color: #18102e;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 950;
        }

        .report-cert span {
          display: inline-flex;
          width: fit-content;
          margin-top: 7px;
          border-radius: 999px;
          padding: 5px 8px;
          color: #5b4f78;
          background: #e0d8f5;
          font-size: 10px;
          font-weight: 950;
        }

        .report-cert.issued span {
          color: #065f46;
          background: #d1fae5;
        }

        .report-empty {
          border-radius: 18px;
          padding: 13px;
          background: #f4f0fb;
          border: 1px dashed rgba(167, 139, 250,.38);
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 800;
        }

        .report-footer-note {
          margin-top: 18px;
          border-radius: 20px;
          padding: 14px;
          color: #5b4f78;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
          font-size: 11px;
          line-height: 1.8;
          font-weight: 760;
        }

        @media (max-width: 780px) {
          .report-meta,
          .report-stats-grid,
          .report-cert-grid {
            grid-template-columns: 1fr;
          }

          .report-cover,
          .report-body {
            padding: 22px;
          }

          .report-toolbar {
            display: grid;
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body * {
            visibility: hidden !important;
          }

          .portfolio-export-shell,
          .portfolio-export-shell *,
          .portfolio-export-report,
          .portfolio-export-report * {
            visibility: visible !important;
          }

          .portfolio-export-shell {
            position: static !important;
            inset: auto !important;
            z-index: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            background: #fff !important;
            backdrop-filter: none !important;
          }

          .portfolio-export-report {
            width: 100% !important;
            margin: 0 !important;
            border-radius: 24px !important;
            box-shadow: none !important;
            border: 0 !important;
          }

          .report-no-print,
          .report-toolbar {
            display: none !important;
          }

          .report-cover {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .report-section {
            box-shadow: none !important;
          }
        }
      `}</style>

      <article className="portfolio-export-report">
        <div className="report-toolbar report-no-print">
          <strong>ØªÙ‚Ø±ÙŠØ± Ù…Ù„ÙÙŠ Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ</strong>
          <div className="report-toolbar-actions">
            <button type="button" className="primary" onClick={printReport}>
              Ø·Ø¨Ø§Ø¹Ø© / Ø­ÙØ¸ PDF
            </button>
            <button type="button" onClick={onClose}>
              Ø¥ØºÙ„Ø§Ù‚
            </button>
          </div>
        </div>

        <header className="report-cover">
          <span className="report-kicker">OD Academy Â· Learning Portfolio Report</span>
          <h1>ØªÙ‚Ø±ÙŠØ± Ø§Ù„Ù…Ù„Ù Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ</h1>
          <p>
            ØªÙ‚Ø±ÙŠØ± Ù…ÙˆØ¬Ø² ÙŠØ¬Ù…Ø¹ Ø£Ø«Ø± Ø§Ù„ØªØ¹Ù„Ù… Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ù†ØµØ©: Ø§Ù„ØªÙ‚Ø¯Ù…ØŒ Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø§ØªØŒ Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§ØªØŒ
            Ø§Ù„Ø±Ø§Ø¯Ø§Ø±ØŒ Ø§Ù„ØªØ£Ù…Ù„Ø§Øª Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠØ©ØŒ ÙˆØ§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª.
          </p>

          <div className="report-meta">
            <div>
              <span>Ø§Ø³Ù… Ø§Ù„Ù…ØªØ¯Ø±Ø¨</span>
              <strong>{userName || "Ù…ØªØ¯Ø±Ø¨"}</strong>
            </div>
            <div>
              <span>ØªØ§Ø±ÙŠØ® Ø§Ù„ØªÙˆÙ„ÙŠØ¯</span>
              <strong>{formatDateTime(generatedAt)}</strong>
            </div>
            <div>
              <span>Ø­Ø§Ù„Ø© Ø§Ù„ØªÙ‚Ø±ÙŠØ±</span>
              <strong>{loading ? "Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª" : "Ø¬Ø§Ù‡Ø² Ù„Ù„ØªØµØ¯ÙŠØ±"}</strong>
            </div>
          </div>
        </header>

        <div className="report-body">
          <section className="report-stats-grid" aria-label="ملخص التقرير">
            <NeoMetricGauge
              value={safeSummary.progressPercent}
              max={100}
              displayValue={`${safeSummary.progressPercent}%`}
              label="نسبة الإنجاز"
              status={safeSummary.progressPercent >= 100 ? "complete" : "progress"}
              size="compact"
            />
            <NeoMetricGauge
              value={safeSummary.completedDays}
              max={safeSummary.totalDays}
              displayValue={`${safeSummary.completedDays} / ${safeSummary.totalDays}`}
              label="الأيام المكتملة"
              status={safeSummary.completedDays >= safeSummary.totalDays ? "complete" : "progress"}
              size="compact"
            />
            <NeoMetricGauge
              value={safeSummary.remainingDays}
              max={safeSummary.totalDays}
              displayValue={safeSummary.remainingDays}
              label="المتبقي"
              status={safeSummary.remainingDays === 0 ? "complete" : "warning"}
              size="compact"
            />
            <NeoMetricGauge
              value={1}
              max={1}
              progress={100}
              displayValue={`${Math.round(Number(safeSummary.estimatedHours || 0))} ساعة`}
              label="وقت تعلم تقديري"
              status="readiness"
              size="compact"
            />
          </section>

          <section className="report-section">
            <h2>Ø§Ù„Ø¯Ø±ÙˆØ³ Ø§Ù„Ù…Ø­ÙÙˆØ¸Ø©</h2>
            <p>Ø£Ø¨Ø±Ø² Ø§Ù„Ø¯Ø±ÙˆØ³ Ø§Ù„ØªÙŠ Ø§Ø®ØªØ§Ø± Ø§Ù„Ù…ØªØ¯Ø±Ø¨ Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù‡Ø§ Ù„Ø§Ø­Ù‚Ù‹Ø§.</p>

            {bookmarks.length ? (
              <div className="report-list">
                {bookmarks.slice(0, 8).map((bookmark) => (
                  <div className="report-row" key={`${bookmark.month_index}-${bookmark.week_index}-${bookmark.day_index}`}>
                    <small>{bookmark.lesson_path || locationLabel(bookmark)}</small>
                    <strong>{bookmark.lesson_title || "Ø¯Ø±Ø³ Ù…Ø­ÙÙˆØ¸"}</strong>
                    <p>{shortText(bookmark.excerpt, 260)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="report-empty">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø¯Ø±ÙˆØ³ Ù…Ø­ÙÙˆØ¸Ø© Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.</div>
            )}
          </section>

          <section className="report-section">
            <h2>Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø§Ù„Ù…Ø«Ø¨ØªØ©</h2>
            <p>Ø£Ù‡Ù… Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø§Ù„ØªÙŠ Ø§Ø®ØªØ§Ø± Ø§Ù„Ù…ØªØ¯Ø±Ø¨ ØªØ«Ø¨ÙŠØªÙ‡Ø§ Ø¯Ø§Ø®Ù„ Ø§Ù„Ø¯Ø±ÙˆØ³.</p>

            {pinnedNotes.length ? (
              <div className="report-list">
                {pinnedNotes.slice(0, 6).map((note) => (
                  <div className="report-row" key={note.id}>
                    <small>{locationLabel(note)} Â· {formatDate(note.updated_at)}</small>
                    <strong>{note.note_title || "Ù…Ù„Ø§Ø­Ø¸Ø© Ù…Ø«Ø¨ØªØ©"}</strong>
                    <p>{shortText(note.note, 300)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="report-empty">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ù…Ø«Ø¨ØªØ© Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.</div>
            )}
          </section>

          <section className="report-section">
            <h2>Ø§Ù„ØªØ£Ù…Ù„Ø§Øª Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠØ© ÙˆØ®Ø·Ø· Ø§Ù„ØªØ·Ø¨ÙŠÙ‚</h2>
            <p>ØªØ£Ù…Ù„Ø§Øª Ø§Ù„Ù…ØªØ¯Ø±Ø¨ Ø§Ù„ØªÙŠ ØªØ±Ø¨Ø· Ø§Ù„Ù…ÙØ§Ù‡ÙŠÙ… Ø¨ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù…Ù„ÙŠ.</p>

            {weeklyReflections.length ? (
              <div className="report-list">
                {weeklyReflections.slice(0, 8).map((reflection) => (
                  <div className="report-row" key={reflection.id || `${reflection.month_index}-${reflection.week_index}`}>
                    <small>Ø§Ù„Ø´Ù‡Ø± {reflection.month_index} Â· Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ {reflection.week_index} Â· {formatDate(reflection.updated_at)}</small>
                    <strong>{reflection.week_title || "ØªØ£Ù…Ù„ Ø£Ø³Ø¨ÙˆØ¹ÙŠ"}</strong>
                    <p><b>Ø£Ù‡Ù… ÙÙƒØ±Ø©:</b> {shortText(reflection.key_learning, 260)}</p>
                    <p><b>Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ù‚Ø§Ø¯Ù…:</b> {shortText(reflection.next_action, 260)}</p>
                    <p>Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø«Ù‚Ø© Ø¨Ø§Ù„ØªØ·Ø¨ÙŠÙ‚: {reflection.confidence_score || "-"} / 5</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="report-empty">Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ£Ù…Ù„Ø§Øª Ø£Ø³Ø¨ÙˆØ¹ÙŠØ© Ù…Ø­ÙÙˆØ¸Ø© Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.</div>
            )}
          </section>

          <section className="report-section">
            <h2>Ø±Ø§Ø¯Ø§Ø± Ø§Ù„Ø£Ø¯Ø§Ø¡</h2>
            <p>Ø¢Ø®Ø± ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ù…Ø­ÙÙˆØ¸Ø© ÙÙŠ Ø±Ø§Ø¯Ø§Ø± Ø§Ù„Ø£Ø¯Ø§Ø¡.</p>

            {latestRadar ? (
              <div className="report-row">
                <small>Ø¢Ø®Ø± ØªÙ‚ÙŠÙŠÙ… Â· {formatDate(latestRadar.created_at)}</small>
                <strong>{latestRadar.assessment_title}</strong>
                <p>Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø¹Ø§Ù…Ø©: {latestRadar.overall_score} Ù…Ù† 5</p>
              </div>
            ) : (
              <div className="report-empty">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªÙŠØ¬Ø© Ø±Ø§Ø¯Ø§Ø± Ù…Ø­ÙÙˆØ¸Ø© Ø­ØªÙ‰ Ø§Ù„Ø¢Ù†.</div>
            )}

            {radarHistory.length > 1 ? (
              <div className="report-list" style={{ marginTop: 10 }}>
                {radarHistory.slice(1, 4).map((item) => (
                  <div className="report-row" key={item.id}>
                    <small>{formatDate(item.created_at)}</small>
                    <strong>{item.assessment_title}</strong>
                    <p>Ø§Ù„Ø¯Ø±Ø¬Ø© Ø§Ù„Ø¹Ø§Ù…Ø©: {item.overall_score} Ù…Ù† 5</p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="report-section">
            <h2>Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª ÙˆØ§Ù„Ø¥Ù†Ø¬Ø§Ø²Ø§Øª</h2>
            <p>Ø­Ø§Ù„Ø© Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª Ø§Ù„Ø´Ù‡Ø±ÙŠØ© ÙˆÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù† Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©.</p>

            <div className="report-cert-grid">
              {monthlyCertificates.slice(0, 6).map((certificate) => (
                <div
                  className={`report-cert ${certificate.status === "issued" ? "issued" : ""}`}
                  key={certificate.month_number}
                >
                  <b>{certificate.month_title}</b>
                  <span>{certificateStatus(certificate.status)}</span>
                </div>
              ))}
            </div>

            <div
              className={`report-cert ${data?.masteryReady ? "issued" : ""}`}
              style={{ marginTop: 10 }}
            >
              <b>ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù† Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠØ©</b>
              <span>{data?.masteryReady ? "Ø¬Ø§Ù‡Ø²Ø©" : "ØªÙØªØ­ Ø¨Ø¹Ø¯ Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„Ø±Ø­Ù„Ø©"}</span>
            </div>

            <p className="report-footer-note">
              Ø¹Ø¯Ø¯ Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª Ø§Ù„Ø´Ù‡Ø±ÙŠØ© Ø§Ù„Ù…ÙØªÙˆØ­Ø©: {issuedCertificates.length} Ù…Ù† 6. Ù‡Ø°Ø§ Ø§Ù„ØªÙ‚Ø±ÙŠØ± ÙŠØ¹ÙƒØ³ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø© ÙˆÙ‚Øª Ø§Ù„ØªÙˆÙ„ÙŠØ¯ Ø¯Ø§Ø®Ù„ Ø§Ù„Ù…Ù†ØµØ©.
            </p>
          </section>
        </div>
      </article>
    </section>
  );
}

