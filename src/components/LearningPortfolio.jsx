import { useEffect, useMemo, useState } from "react";
import { fetchLearningPortfolioData } from "../lib/learningPortfolioService";
import PortfolioExportReport from "./PortfolioExportReport";

function formatDate(value) {
  if (!value) return "غير محدد";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(value));
  } catch {
    return "غير محدد";
  }
}

function hoursLabel(value) {
  const number = Number(value || 0);
  if (number < 1) return "0 ساعة";
  return `${Math.round(number)} ساعة`;
}

function shortText(value, limit = 150) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function locationLabel(item) {
  return `الشهر ${item.month_index || item.monthIndex || "-"} · الأسبوع ${item.week_index || item.weekIndex || "-"} · اليوم ${item.day_index || item.dayIndex || "-"}`;
}

function certificateStatusLabel(status) {
  if (status === "issued") return "مفتوحة";
  if (status === "revoked") return "ملغاة";
  return "مقفلة";
}

export default function LearningPortfolio({
  userName = "متدرب",
  completedDays = 0,
  totalDays = 168,
  setActivePage,
  onResumeJourney
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  async function loadPortfolio() {
    setLoading(true);
    setNotice("");

    try {
      const result = await fetchLearningPortfolioData({
        userName,
        completedDays,
        totalDays
      });

      setData(result);
    } catch (error) {
      console.warn("تعذر تحميل الملف التعليمي:", error);
      setNotice(error?.message || "تعذر تحميل بعض بيانات ملفك التعليمي الآن.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName, completedDays, totalDays]);

  const summary = data?.summary || {
    completedDays,
    totalDays,
    progressPercent: Math.round((Number(completedDays || 0) / Math.max(1, Number(totalDays || 168))) * 100),
    remainingDays: Math.max(0, Number(totalDays || 168) - Number(completedDays || 0)),
    estimatedHours: Number(completedDays || 0) * 4
  };

  const firstName = useMemo(() => {
    const clean = String(userName || "متدرب").trim();
    return clean.split(/\s+/)[0] || "متدرب";
  }, [userName]);

  function go(pageId) {
    if (typeof setActivePage === "function") {
      setActivePage(pageId);
    }
  }

  function resume() {
    if (typeof onResumeJourney === "function") {
      onResumeJourney();
      return;
    }

    go("journey");
  }

  function openBookmark() {
    go("journey");
  }

  return (
    <main className="learning-portfolio" dir="rtl">
      <style>{`
        .learning-portfolio {
          --ink: #18102e;
          --muted: #7a6c9a;
          --line: rgba(167, 139, 250,.22);
          --primary: #8b5cf6;
          --gold: #a855f7;
          --green: #10b981;
          width: min(1180px, calc(100% - 28px));
          margin: 18px auto 70px;
          color: var(--ink);
        }

        .portfolio-hero {
          border-radius: 38px;
          overflow: hidden;
          padding: clamp(24px, 4vw, 38px);
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.24), transparent 34%),
            radial-gradient(circle at 0% 100%, rgba(16,185,129,.14), transparent 34%),
            linear-gradient(135deg, #18102e, #1e1b4b 58%, #3b1d6e);
          box-shadow: 0 28px 90px rgba(28, 17, 48,.22);
        }

        .portfolio-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(260px, .8fr);
          gap: 24px;
          align-items: center;
        }

        .portfolio-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          color: #fde68a;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.15);
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 12px;
        }

        .portfolio-hero h1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 64px);
          line-height: 1.12;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .portfolio-hero h1 span {
          color: #fde68a;
        }

        .portfolio-hero p {
          margin: 14px 0 0;
          color: #dbeafe;
          font-size: 15px;
          line-height: 2;
          font-weight: 760;
          max-width: 780px;
        }

        .portfolio-orb {
          width: 210px;
          height: 210px;
          margin: 0 auto;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            conic-gradient(#a855f7 ${summary.progressPercent * 3.6}deg, rgba(255,255,255,.14) 0deg);
          box-shadow: inset 0 0 0 12px rgba(28, 17, 48,.32), 0 24px 64px rgba(0,0,0,.22);
        }

        .portfolio-orb div {
          width: 145px;
          height: 145px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          text-align: center;
          background: #18102e;
          border: 1px solid rgba(255,255,255,.12);
        }

        .portfolio-orb strong {
          display: block;
          color: #fff;
          font-size: 42px;
          line-height: 1;
          font-weight: 950;
        }

        .portfolio-orb small {
          display: block;
          color: #c9bdf0;
          margin-top: 7px;
          font-size: 12px;
          font-weight: 850;
        }

        .portfolio-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }

        .portfolio-button {
          border: 0;
          cursor: pointer;
          min-height: 46px;
          border-radius: 18px;
          padding: 0 16px;
          font-family: inherit;
          font-weight: 950;
          transition: .18s ease;
        }

        .portfolio-button:hover {
          transform: translateY(-2px);
        }

        .portfolio-button.primary {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          box-shadow: 0 18px 38px rgba(139, 92, 246,.24);
        }

        .portfolio-button.soft {
          color: #18102e;
          background: #ffffff;
        }

        .portfolio-button.dark {
          color: #fff;
          background: #18102e;
        }

        .portfolio-button.export {
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.24), transparent 35%),
            linear-gradient(135deg, #047857, #064e3b);
          box-shadow: 0 18px 38px rgba(16,185,129,.22);
        }

        .portfolio-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 16px 0;
        }

        .portfolio-stat {
          border-radius: 26px;
          padding: 17px;
          background: rgba(255,255,255,.94);
          border: 1px solid var(--line);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
        }

        .portfolio-stat span {
          display: block;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.7;
          font-weight: 850;
        }

        .portfolio-stat strong {
          display: block;
          color: var(--ink);
          font-size: 26px;
          line-height: 1.25;
          margin-top: 5px;
          font-weight: 950;
        }

        .portfolio-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, .55fr);
          gap: 14px;
          align-items: start;
        }

        .portfolio-section {
          border-radius: 30px;
          padding: 20px;
          background: rgba(255,255,255,.94);
          border: 1px solid var(--line);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
          margin-bottom: 14px;
        }

        .portfolio-section-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .portfolio-section h2 {
          margin: 0;
          color: var(--ink);
          font-size: 20px;
          line-height: 1.5;
          font-weight: 950;
        }

        .portfolio-section-head p {
          margin: 4px 0 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .portfolio-mini-tag {
          display: inline-flex;
          border-radius: 999px;
          padding: 7px 10px;
          color: #6d28d9;
          background: #efe9fb;
          font-size: 11px;
          font-weight: 950;
          white-space: nowrap;
        }

        .portfolio-list {
          display: grid;
          gap: 10px;
        }

        .portfolio-row {
          border: 1px solid rgba(167, 139, 250,.18);
          border-radius: 22px;
          padding: 14px;
          background: #f4f0fb;
        }

        .portfolio-row.clickable {
          border: 1px solid rgba(167, 139, 250,.22);
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          width: 100%;
        }

        .portfolio-row.clickable:hover {
          background: #efe9fb;
          border-color: rgba(139, 92, 246,.30);
        }

        .portfolio-row small {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 850;
          margin-bottom: 4px;
        }

        .portfolio-row strong {
          display: block;
          color: #18102e;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 950;
        }

        .portfolio-row p {
          margin: 6px 0 0;
          color: #5b4f78;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 760;
        }

        .portfolio-empty {
          border-radius: 22px;
          padding: 16px;
          color: #7a6c9a;
          background: #f4f0fb;
          border: 1px dashed rgba(167, 139, 250,.38);
          font-size: 12px;
          line-height: 1.9;
          font-weight: 800;
        }

        .portfolio-cert-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .portfolio-cert {
          border-radius: 22px;
          padding: 14px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .portfolio-cert.issued {
          background: #ecfdf5;
          border-color: rgba(16,185,129,.24);
        }

        .portfolio-cert b {
          display: block;
          color: #18102e;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 950;
        }

        .portfolio-cert span {
          display: inline-flex;
          margin-top: 8px;
          border-radius: 999px;
          padding: 5px 8px;
          font-size: 10px;
          font-weight: 950;
          color: #5b4f78;
          background: #e0d8f5;
        }

        .portfolio-cert.issued span {
          color: #065f46;
          background: #d1fae5;
        }

        .portfolio-notice {
          margin-top: 14px;
          border-radius: 20px;
          padding: 14px;
          color: #92400e;
          background: #fffbeb;
          border: 1px solid #fde68a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 850;
        }

        @media (max-width: 980px) {
          .portfolio-hero-grid,
          .portfolio-layout,
          .portfolio-stats {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 680px) {
          .learning-portfolio {
            width: calc(100% - 18px);
          }

          .portfolio-cert-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="portfolio-hero">
        <div className="portfolio-hero-grid">
          <div>
            <span className="portfolio-kicker">Learning Portfolio Center</span>
            <h1>
              ملفك التعليمي يا <span>{firstName}</span>
            </h1>
            <p>
              هنا يتجمع أثر تعلمك: تقدم الرحلة، الدروس التي حفظتها، الملاحظات
              المثبتة، نتائج الرادار، والشهادات الشهرية. هذا هو مكان الرجوع
              الهادئ عندما تريد أن ترى ماذا بنيت فعلًا.
            </p>

            <div className="portfolio-actions">
              <button type="button" className="portfolio-button primary" onClick={resume}>
                متابعة من آخر درس
              </button>
              <button type="button" className="portfolio-button soft" onClick={() => go("journey")}>
                فتح الرحلة
              </button>
              <button type="button" className="portfolio-button soft" onClick={() => go("radar")}>
                فتح الرادار
              </button>
              <button type="button" className="portfolio-button soft" onClick={() => go("mastery")}>
                وثيقة الإتقان
              </button>
              <button
                type="button"
                className="portfolio-button export"
                onClick={() => setReportOpen(true)}
              >
                تصدير تقرير ملفي التعليمي
              </button>
            </div>
          </div>

          <div
            className="portfolio-orb od-circular-indicator od-indicator-general"
            style={{ "--od-indicator-progress": `${summary.progressPercent}%` }}
          >
            <div>
              <span>
                <strong>{summary.progressPercent}%</strong>
                <small>{summary.completedDays} / {summary.totalDays} يوم</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {notice ? <div className="portfolio-notice">{notice}</div> : null}

      {reportOpen && (
        <PortfolioExportReport
          userName={userName}
          generatedAt={new Date().toISOString()}
          data={data}
          summary={summary}
          loading={loading}
          onClose={() => setReportOpen(false)}
        />
      )}

      <section className="portfolio-stats" aria-label="ملخص الملف التعليمي">
        <div className="portfolio-stat">
          <span>الأيام المكتملة</span>
          <strong>{summary.completedDays}</strong>
        </div>
        <div className="portfolio-stat">
          <span>المتبقي في الرحلة</span>
          <strong>{summary.remainingDays}</strong>
        </div>
        <div className="portfolio-stat">
          <span>وقت تعلم تقديري</span>
          <strong>{hoursLabel(summary.estimatedHours)}</strong>
        </div>
        <div className="portfolio-stat">
          <span>الشهادات الشهرية</span>
          <strong>{data?.issuedCertificates?.length || 0}/6</strong>
        </div>
      </section>

      <div className="portfolio-layout">
        <div>
          <section className="portfolio-section">
            <div className="portfolio-section-head">
              <div>
                <h2>الدروس المحفوظة</h2>
                <p>آخر الدروس التي اخترت الرجوع لها لاحقًا.</p>
              </div>
              <span className="portfolio-mini-tag">{data?.bookmarks?.length || 0} محفوظ</span>
            </div>

            {loading ? (
              <div className="portfolio-empty">جارٍ تحميل الدروس المحفوظة...</div>
            ) : data?.bookmarks?.length ? (
              <div className="portfolio-list">
                {data.bookmarks.map((bookmark) => (
                  <button
                    type="button"
                    className="portfolio-row clickable"
                    key={`${bookmark.month_index}-${bookmark.week_index}-${bookmark.day_index}`}
                    onClick={openBookmark}
                  >
                    <small>{bookmark.lesson_path || locationLabel(bookmark)}</small>
                    <strong>{bookmark.lesson_title || "درس محفوظ"}</strong>
                    {bookmark.excerpt ? <p>{shortText(bookmark.excerpt, 170)}</p> : null}
                  </button>
                ))}
              </div>
            ) : (
              <div className="portfolio-empty">
                لا توجد دروس محفوظة بعد. افتح أي درس واضغط "حفظ هذا الدرس".
              </div>
            )}
          </section>

          <section className="portfolio-section">
            <div className="portfolio-section-head">
              <div>
                <h2>الملاحظات المثبتة</h2>
                <p>أفكارك المهمة التي ثبتّها داخل الدروس.</p>
              </div>
              <span className="portfolio-mini-tag">{data?.pinnedNotes?.length || 0} مثبتة</span>
            </div>

            {loading ? (
              <div className="portfolio-empty">جارٍ تحميل الملاحظات...</div>
            ) : data?.pinnedNotes?.length ? (
              <div className="portfolio-list">
                {data.pinnedNotes.map((note) => (
                  <div className="portfolio-row" key={note.id}>
                    <small>{locationLabel(note)} · {formatDate(note.updated_at)}</small>
                    <strong>{note.note_title || "ملاحظة مثبتة"}</strong>
                    <p>{shortText(note.note, 210)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="portfolio-empty">
                لا توجد ملاحظات مثبتة بعد. اكتب ملاحظة داخل أي درس وفعل خيار التثبيت.
              </div>
            )}
          </section>

          <section className="portfolio-section">
            <div className="portfolio-section-head">
              <div>
                <h2>التأملات الأسبوعية وخطط التطبيق</h2>
                <p>أثر التعلم الأسبوعي: فكرة، نمط تنظيمي، وخطوة تطبيق عملية.</p>
              </div>
              <span className="portfolio-mini-tag">{data?.weeklyReflections?.length || 0} تأمل</span>
            </div>

            {loading ? (
              <div className="portfolio-empty">جارٍ تحميل التأملات الأسبوعية...</div>
            ) : data?.weeklyReflections?.length ? (
              <div className="portfolio-list">
                {data.weeklyReflections.map((reflection) => (
                  <div className="portfolio-row" key={reflection.id || `${reflection.month_index}-${reflection.week_index}`}>
                    <small>
                      الشهر {reflection.month_index} · الأسبوع {reflection.week_index}
                      {reflection.updated_at ? ` · ${formatDate(reflection.updated_at)}` : ""}
                    </small>
                    <strong>{reflection.week_title || "تأمل أسبوعي"}</strong>
                    {reflection.key_learning ? (
                      <p><b>أهم فكرة:</b> {shortText(reflection.key_learning, 180)}</p>
                    ) : null}
                    {reflection.next_action ? (
                      <p><b>الإجراء القادم:</b> {shortText(reflection.next_action, 180)}</p>
                    ) : null}
                    {reflection.confidence_score ? (
                      <p>مستوى الثقة بالتطبيق: {reflection.confidence_score} / 5</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="portfolio-empty">
                لا توجد تأملات أسبوعية بعد. افتح الرحلة واكتب تأمل الأسبوع وخطة التطبيق.
              </div>
            )}
          </section>
        </div>

        <aside>
          <section className="portfolio-section">
            <div className="portfolio-section-head">
              <div>
                <h2>آخر نتيجة رادار</h2>
                <p>أحدث تقييم محفوظ من رادار الأداء.</p>
              </div>
              <span className="portfolio-mini-tag">Radar</span>
            </div>

            {loading ? (
              <div className="portfolio-empty">جارٍ تحميل الرادار...</div>
            ) : data?.latestRadar ? (
              <div className="portfolio-row">
                <small>{formatDate(data.latestRadar.created_at)}</small>
                <strong>{data.latestRadar.assessment_title}</strong>
                <p>الدرجة العامة: {data.latestRadar.overall_score} من 5</p>
              </div>
            ) : (
              <div className="portfolio-empty">
                لا توجد نتيجة رادار محفوظة بعد. افتح الرادار واحفظ تقييمك.
              </div>
            )}
          </section>

          <section className="portfolio-section">
            <div className="portfolio-section-head">
              <div>
                <h2>الشهادات</h2>
                <p>حالة الشهادات الشهرية ووثيقة الإتقان.</p>
              </div>
              <span className="portfolio-mini-tag">{data?.issuedCertificates?.length || 0}/6</span>
            </div>

            <div className="portfolio-cert-grid">
              {(data?.monthlyCertificates || []).slice(0, 6).map((certificate) => (
                <div
                  className={`portfolio-cert ${certificate.status === "issued" ? "issued" : ""}`}
                  key={certificate.month_number}
                >
                  <b>{certificate.month_title}</b>
                  <span>{certificateStatusLabel(certificate.status)}</span>
                </div>
              ))}
            </div>

            <div className={`portfolio-cert ${data?.masteryReady ? "issued" : ""}`} style={{ marginTop: 10 }}>
              <b>وثيقة الإتقان النهائية</b>
              <span>{data?.masteryReady ? "جاهزة" : "تفتح بعد إكمال الرحلة"}</span>
            </div>
          </section>

          <section className="portfolio-section">
            <div className="portfolio-section-head">
              <div>
                <h2>اختصارات</h2>
                <p>تنقل سريع لأهم مناطق الأثر.</p>
              </div>
            </div>

            <div className="portfolio-actions" style={{ marginTop: 0 }}>
              <button type="button" className="portfolio-button dark" onClick={() => go("journey")}>
                الرحلة
              </button>
              <button type="button" className="portfolio-button dark" onClick={() => go("radar")}>
                الرادار
              </button>
              <button type="button" className="portfolio-button dark" onClick={() => go("mastery")}>
                الشهادات
              </button>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
