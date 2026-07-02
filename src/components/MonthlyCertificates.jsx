import { useEffect, useMemo, useState } from "react";
import {
  getOrCreateMonthlyCertificates,
  MONTHLY_MILESTONES
} from "../lib/monthlyCertificateService";
import { buildVerificationUrl, copyTextSafely } from "../lib/masteryCertificateService";

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatDate(value) {
  if (!value) return "غير صادر بعد";

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

function buildMonthlyLinkedInPost(record) {
  const monthNumber = safeNumber(record?.month_number, 1);
  const title = record?.month_title || `إنجاز الشهر ${monthNumber}`;
  const verificationUrl = buildVerificationUrl(record?.verification_slug || record?.certificate_code);

  return `الحمد لله، أنجزت ${title} ضمن رحلتي في مختبر التطوير التنظيمي.

شهر جديد خلصته بخطوات صغيرة لكنها ثابتة: قراءة، تطبيق، اختبار، وربط المفاهيم بسياق العمل السعودي.

الشيء الجميل في الرحلة أنها ما تكتفي بالمعلومة، بل تدربك تسأل السؤال الصح قبل تقفز للحل.

شكرًا لمنصة منسقة على هذه التجربة المرتبة والثرية.

${record?.verification_enabled ? `رابط التحقق: ${verificationUrl}` : ""}

#التطوير_التنظيمي
#التعلم_المستمر
#منسقة
#OD`;
}

export default function MonthlyCertificates({
  userName = "متدرب",
  completedDays = 0,
  totalDays = 168
}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");
  const [copiedPostMonth, setCopiedPostMonth] = useState("");

  const safeCompletedDays = Math.max(0, Math.min(safeNumber(totalDays, 168), safeNumber(completedDays)));

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
      console.warn("تعذر مزامنة شهادات الإنجاز الشهرية:", syncError);
      setError(syncError?.message || "تعذر مزامنة شهادات الإنجاز الشهرية الآن.");
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
      alert("لم يتم نسخ رابط التحقق تلقائيًا. انسخه يدويًا من البطاقة.");
    }
  }

  async function copyLinkedInPost(record) {
    const ok = await copyTextSafely(buildMonthlyLinkedInPost(record));

    if (ok) {
      setCopiedPostMonth(record.month_number);
      setTimeout(() => setCopiedPostMonth(""), 2400);
      return;
    }

    alert("لم يتم نسخ نص LinkedIn تلقائيًا. انسخه يدويًا من بطاقة الشهادة.");
  }

  function shareMonthlyOnLinkedIn(record) {
    copyLinkedInPost(record);

    const url = record?.verification_enabled
      ? buildVerificationUrl(record.verification_slug || record.certificate_code)
      : "https://munsaqah.rayansalajlan.workers.dev/";

    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "width=760,height=680"
    );
  }

  function printMonthlyCertificate(record) {
    const style = document.createElement("style");
    style.id = "monthly-certificate-print-style";
    style.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #monthly-certificate-${record.month_number},
        #monthly-certificate-${record.month_number} * { visibility: visible !important; }
        #monthly-certificate-${record.month_number} {
          position: absolute !important;
          inset: 24px !important;
          width: calc(100% - 48px) !important;
          box-shadow: none !important;
        }
      }
    `;

    document.head.appendChild(style);
    window.print();
    window.setTimeout(() => style.remove(), 800);
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
    <section className="monthly-certificates mastery-no-print" aria-label="شهادات الإنجاز الشهرية">
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

        .monthly-certificate-preview {
          margin-top: 14px;
          border-radius: 22px;
          padding: 16px;
          color: #18102e;
          background:
            radial-gradient(circle at 0% 0%, rgba(16,185,129,.18), transparent 36%),
            radial-gradient(circle at 100% 100%, rgba(139,92,246,.18), transparent 36%),
            linear-gradient(135deg, #ffffff, #f8fafc);
          border: 1px solid rgba(139, 92, 246, .20);
        }

        .monthly-certificate-preview span {
          display: block;
          color: #6d28d9;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .monthly-certificate-preview h4 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: 18px;
          line-height: 1.45;
          font-weight: 950;
        }

        .monthly-certificate-preview p {
          margin: 0;
          color: #5b4f78;
          font-size: 12px;
          line-height: 1.8;
        }

        .monthly-certificate-code {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(139, 92, 246, .16);
          color: #18102e;
          font-size: 11px;
          font-weight: 900;
          word-break: break-word;
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
          <span className="monthly-kicker">Phase 22 · Monthly Milestones</span>
          <h2>شهادات إنجاز شهرية قبل وثيقة الإتقان النهائية</h2>
          <p>
            بدل انتظار نهاية الرحلة كاملة، يحصل المتدرب على شهادة إنجاز موثقة
            عند إكمال كل شهر تعليمي من 4 أسابيع. هذه الشهادات مرتبطة بتقدمه الفعلي داخل
            المنصة وتظهر تدريجيًا مع الإنجاز.
          </p>

          <div className="monthly-actions">
            <button
              type="button"
              className="monthly-button"
              onClick={syncMonthlyCertificates}
              disabled={loading}
            >
              {loading ? "جارٍ مزامنة الشهادات..." : "تحديث شهاداتي الشهرية"}
            </button>
          </div>
        </div>

        <div className="monthly-status">
          <strong>{unlockedCount}/6</strong>
          <span>شهادات شهرية مفتوحة</span>
        </div>
      </div>

      {error ? <div className="monthly-warning">{error}</div> : null}

      <div className="monthly-grid">
        {displayRecords.map((record) => {
          const requiredDays = safeNumber(record.required_days, 28);
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
                <span className="monthly-lock">{issued ? "مفتوحة" : "مقفلة"}</span>
              </div>

              <h3>{record.month_title}</h3>
              <p>{record.month_subtitle}</p>

              <div className="monthly-progress" aria-label={`تقدم الشهر ${record.month_number}`}>
                <i style={{ width: `${percent}%` }} />
              </div>

              <div className="monthly-mini">
                <div>
                  <span>شرط الفتح</span>
                  <strong>{Math.min(safeCompletedDays, requiredDays)} / {requiredDays} يومًا</strong>
                </div>

                <div>
                  <span>تاريخ الإصدار</span>
                  <strong>{issued ? formatDate(record.issued_at) : "بعد إكمال الشرط"}</strong>
                </div>

                <div>
                  <span>رقم الشهادة</span>
                  <strong>{issued ? record.certificate_code : "يظهر بعد الفتح"}</strong>
                </div>
              </div>

              {issued ? (
                <>
                  <div
                    className="monthly-certificate-preview"
                    id={`monthly-certificate-${record.month_number}`}
                  >
                    <span>Monthly Achievement Certificate</span>
                    <h4>{record.month_title}</h4>
                    <p>
                      تمنح هذه الشهادة إلى {userName || "المتدرب"} تقديرًا لإكمال محطة شهرية
                      في رحلة منسقة للتطوير التنظيمي.
                    </p>
                    <div className="monthly-certificate-code">
                      {record.certificate_code}
                    </div>
                  </div>

                  <div className="monthly-actions">
                    <button
                      type="button"
                      className="monthly-button ghost"
                      onClick={() => copyVerification(record)}
                      disabled={!canVerify}
                    >
                      {copied ? "تم نسخ رابط التحقق ✅" : canVerify ? "نسخ رابط التحقق" : "التحقق غير مفعل"}
                    </button>
                    <button
                      type="button"
                      className="monthly-button"
                      onClick={() => copyLinkedInPost(record)}
                    >
                      {copiedPostMonth === record.month_number ? "تم نسخ نص LinkedIn" : "نسخ نص LinkedIn"}
                    </button>
                    <button
                      type="button"
                      className="monthly-button"
                      onClick={() => shareMonthlyOnLinkedIn(record)}
                    >
                      مشاركة في LinkedIn
                    </button>
                    <button
                      type="button"
                      className="monthly-button ghost"
                      onClick={() => printMonthlyCertificate(record)}
                    >
                      حفظ / طباعة الشهادة
                    </button>
                  </div>
                </>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
