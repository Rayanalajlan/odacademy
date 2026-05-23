import { useEffect, useState } from "react";
import { verifyCertificatePublic } from "../lib/masteryCertificateService";

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
          setError("لم يتم العثور على وثيقة مفعّلة بهذا الرقم.");
        }
      } catch (err) {
        if (active) setError(err?.message || "تعذر التحقق من الوثيقة.");
      } finally {
        if (active) setLoading(false);
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <main className="verify-page" dir="rtl">
      <style>{`
        .verify-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          color: #0f172a;
          background:
            radial-gradient(circle at 12% 12%, rgba(79,70,229,.16), transparent 30%),
            radial-gradient(circle at 88% 18%, rgba(245,158,11,.14), transparent 28%),
            linear-gradient(135deg, #f8fafc, #eef2ff);
          font-family: inherit;
        }

        .verify-card {
          width: min(760px, 100%);
          border-radius: 34px;
          padding: 28px;
          background: rgba(255,255,255,.94);
          border: 1px solid rgba(148,163,184,.22);
          box-shadow: 0 28px 80px rgba(15,23,42,.14);
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
          color: #64748b;
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
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.16);
        }

        .verify-field span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 850;
          margin-bottom: 6px;
        }

        .verify-field strong {
          display: block;
          color: #0f172a;
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
          background: linear-gradient(135deg, #4f46e5, #312e81);
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
            <div className="verify-mark">…</div>
            <h1>جارٍ التحقق من الوثيقة</h1>
            <p>نراجع رقم الوثيقة في قاعدة بيانات رحلة التطوير التنظيمي.</p>
          </>
        ) : record ? (
          <>
            <div className="verify-mark">✓</div>
            <h1>وثيقة إتقان موثّقة</h1>
            <p>
              تم العثور على وثيقة مفعّلة وصادرة بعد إكمال رحلة التطوير التنظيمي.
            </p>

            <span className="verify-state">صالحة ومفعّلة</span>

            <div className="verify-grid">
              <div className="verify-field">
                <span>رقم الوثيقة</span>
                <strong>{record.certificate_code}</strong>
              </div>
              <div className="verify-field">
                <span>اسم المتدرب</span>
                <strong>{record.certificate_name}</strong>
              </div>
              <div className="verify-field">
                <span>الأيام المكتملة</span>
                <strong>{record.completed_days} / {record.total_days}</strong>
              </div>
              <div className="verify-field">
                <span>تاريخ الإصدار</span>
                <strong>
                  {record.issued_at
                    ? new Intl.DateTimeFormat("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      }).format(new Date(record.issued_at))
                    : "غير محدد"}
                </strong>
              </div>
            </div>

            <a className="verify-home" href="/">
              العودة للمنصة
            </a>
          </>
        ) : (
          <>
            <div className="verify-mark" style={{ background: "linear-gradient(135deg,#ef4444,#991b1b)" }}>
              !
            </div>
            <h1>لم يتم التحقق من الوثيقة</h1>
            <div className="verify-error">
              {error || "الرابط غير صحيح أو الوثيقة غير مفعّلة."}
            </div>

            <a className="verify-home" href="/">
              العودة للمنصة
            </a>
          </>
        )}
      </section>
    </main>
  );
}
