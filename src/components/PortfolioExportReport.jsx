function formatDate(value) {
  if (!value) return "غير محدد";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(value));
  } catch {
    return "غير محدد";
  }
}

function formatDateTime(value) {
  if (!value) return "غير محدد";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "غير محدد";
  }
}

function shortText(value, limit = 360) {
  const text = String(value || "").replace(/\s+/g, " ").trim();

  if (!text) return "لا يوجد نص محفوظ.";
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function locationLabel(item) {
  return `الشهر ${item?.month_index || "-"} · الأسبوع ${item?.week_index || "-"} · اليوم ${item?.day_index || "-"}`;
}

function certificateStatus(status) {
  if (status === "issued") return "مفتوحة";
  if (status === "revoked") return "ملغاة";
  return "مقفلة";
}

function printReport() {
  if (typeof window !== "undefined") {
    window.print();
  }
}

export default function PortfolioExportReport({
  userName = "متدرب",
  generatedAt = new Date().toISOString(),
  data,
  summary,
  loading = false,
  onClose
}) {
  const safeSummary = summary || {
    completedDays: 0,
    totalDays: 168,
    progressPercent: 0,
    remainingDays: 168,
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
    <section className="portfolio-export-shell" dir="rtl" aria-label="تقرير ملفي التعليمي">
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
          <strong>تقرير ملفي التعليمي</strong>
          <div className="report-toolbar-actions">
            <button type="button" className="primary" onClick={printReport}>
              طباعة / حفظ PDF
            </button>
            <button type="button" onClick={onClose}>
              إغلاق
            </button>
          </div>
        </div>

        <header className="report-cover">
          <span className="report-kicker">منسقة · تقرير الملف التعليمي</span>
          <h1>تقرير الملف التعليمي</h1>
          <p>
            تقرير موجز يجمع أثر التعلم داخل المنصة: التقدم، المحفوظات، الملاحظات،
            الرادار، التأملات الأسبوعية، والشهادات.
          </p>

          <div className="report-meta">
            <div>
              <span>اسم المتدرب</span>
              <strong>{userName || "متدرب"}</strong>
            </div>
            <div>
              <span>تاريخ التوليد</span>
              <strong>{formatDateTime(generatedAt)}</strong>
            </div>
            <div>
              <span>حالة التقرير</span>
              <strong>{loading ? "جارٍ تحميل البيانات" : "جاهز للتصدير"}</strong>
            </div>
          </div>
        </header>

        <div className="report-body">
          <section className="report-stats-grid" aria-label="ملخص التقرير">
            <div className="report-stat">
              <span>نسبة الإنجاز</span>
              <strong>{safeSummary.progressPercent}%</strong>
            </div>
            <div className="report-stat">
              <span>الأيام المكتملة</span>
              <strong>{safeSummary.completedDays} / {safeSummary.totalDays}</strong>
            </div>
            <div className="report-stat">
              <span>المتبقي</span>
              <strong>{safeSummary.remainingDays}</strong>
            </div>
            <div className="report-stat">
              <span>وقت تعلم تقديري</span>
              <strong>{Math.round(Number(safeSummary.estimatedHours || 0))} ساعة</strong>
            </div>
          </section>

          <section className="report-section">
            <h2>الدروس المحفوظة</h2>
            <p>أبرز الدروس التي اختار المتدرب العودة لها لاحقًا.</p>

            {bookmarks.length ? (
              <div className="report-list">
                {bookmarks.slice(0, 8).map((bookmark) => (
                  <div className="report-row" key={`${bookmark.month_index}-${bookmark.week_index}-${bookmark.day_index}`}>
                    <small>{bookmark.lesson_path || locationLabel(bookmark)}</small>
                    <strong>{bookmark.lesson_title || "درس محفوظ"}</strong>
                    <p>{shortText(bookmark.excerpt, 260)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="report-empty">لا توجد دروس محفوظة حتى الآن.</div>
            )}
          </section>

          <section className="report-section">
            <h2>الملاحظات المثبتة</h2>
            <p>أهم الملاحظات التي اختار المتدرب تثبيتها داخل الدروس.</p>

            {pinnedNotes.length ? (
              <div className="report-list">
                {pinnedNotes.slice(0, 6).map((note) => (
                  <div className="report-row" key={note.id}>
                    <small>{locationLabel(note)} · {formatDate(note.updated_at)}</small>
                    <strong>{note.note_title || "ملاحظة مثبتة"}</strong>
                    <p>{shortText(note.note, 300)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="report-empty">لا توجد ملاحظات مثبتة حتى الآن.</div>
            )}
          </section>

          <section className="report-section">
            <h2>التأملات الأسبوعية وخطط التطبيق</h2>
            <p>تأملات المتدرب التي تربط المفاهيم بتطبيق عملي.</p>

            {weeklyReflections.length ? (
              <div className="report-list">
                {weeklyReflections.slice(0, 8).map((reflection) => (
                  <div className="report-row" key={reflection.id || `${reflection.month_index}-${reflection.week_index}`}>
                    <small>الشهر {reflection.month_index} · الأسبوع {reflection.week_index} · {formatDate(reflection.updated_at)}</small>
                    <strong>{reflection.week_title || "تأمل أسبوعي"}</strong>
                    <p><b>أهم فكرة:</b> {shortText(reflection.key_learning, 260)}</p>
                    <p><b>الإجراء القادم:</b> {shortText(reflection.next_action, 260)}</p>
                    <p>مستوى الثقة بالتطبيق: {reflection.confidence_score || "-"} / 5</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="report-empty">لا توجد تأملات أسبوعية محفوظة حتى الآن.</div>
            )}
          </section>

          <section className="report-section">
            <h2>رادار الأداء</h2>
            <p>آخر تقييمات محفوظة في رادار الأداء.</p>

            {latestRadar ? (
              <div className="report-row">
                <small>آخر تقييم · {formatDate(latestRadar.created_at)}</small>
                <strong>{latestRadar.assessment_title}</strong>
                <p>الدرجة العامة: {latestRadar.overall_score} من 5</p>
              </div>
            ) : (
              <div className="report-empty">لا توجد نتيجة رادار محفوظة حتى الآن.</div>
            )}

            {radarHistory.length > 1 ? (
              <div className="report-list" style={{ marginTop: 10 }}>
                {radarHistory.slice(1, 4).map((item) => (
                  <div className="report-row" key={item.id}>
                    <small>{formatDate(item.created_at)}</small>
                    <strong>{item.assessment_title}</strong>
                    <p>الدرجة العامة: {item.overall_score} من 5</p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="report-section">
            <h2>الشهادات والإنجازات</h2>
            <p>حالة الشهادات الشهرية ووثيقة الإتقان النهائية.</p>

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
              <b>وثيقة الإتقان النهائية</b>
              <span>{data?.masteryReady ? "جاهزة" : "تفتح بعد إكمال الرحلة"}</span>
            </div>

            <p className="report-footer-note">
              عدد الشهادات الشهرية المفتوحة: {issuedCertificates.length} من 6. هذا التقرير يعكس البيانات المتاحة وقت التوليد داخل المنصة.
            </p>
          </section>
        </div>
      </article>
    </section>
  );
}
