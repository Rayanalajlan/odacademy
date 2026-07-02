import { useEffect, useState } from "react";
import {
  fetchAdminFeedback,
  isCurrentUserAdmin,
  moderateFeedback
} from "../lib/feedbackService";

const TABS = [
  ["pending", "بانتظار المراجعة"],
  ["published", "منشورة/معتمدة"],
  ["rejected", "مرفوضة"],
  ["hidden", "مخفية"],
  ["all", "الكل"]
];

function stageLabel(stage) {
  if (stage === "month_1") return "تقييم الشهر الأول";
  if (stage === "month_2") return "تقييم الشهر الثاني";
  if (stage === "month_3") return "تقييم الشهر الثالث";
  if (stage === "month_4") return "تقييم الشهر الرابع";
  if (stage === "month_5") return "تقييم الشهر الخامس";
  if (stage === "month_6") return "تقييم نهاية الرحلة";
  if (stage === "initial") return "تقييم البداية";
  if (stage === "mid") return "تقييم منتصف الرحلة";
  if (stage === "final") return "تقييم نهاية الرحلة";
  return "تقييم";
}

export default function FeedbackAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState("pending");
  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState("");

  async function load(nextTab = tab) {
    const admin = await isCurrentUserAdmin();
    setIsAdmin(admin);
    setChecked(true);

    if (admin) {
      const data = await fetchAdminFeedback(nextTab);
      setRows(data);
    }
  }

  useEffect(() => {
    load().catch((error) => console.warn("تعذر تحميل لوحة التقييمات:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(row, action, publish = null) {
    const note = action === "reject" ? window.prompt("سبب الرفض أو الملاحظة، اختياري:") || "" : "";

    setBusyId(row.id);

    try {
      await moderateFeedback({
        feedbackId: row.id,
        action,
        publish,
        note
      });

      await load(tab);
    } catch (error) {
      alert(error?.message || "تعذر تحديث حالة التقييم.");
    } finally {
      setBusyId("");
    }
  }

  if (!checked) {
    return <div className="page-shell">جارٍ التحقق من الصلاحية...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="page-shell" dir="rtl">
        لا تملك صلاحية الوصول إلى إدارة التقييمات.
      </div>
    );
  }

  return (
    <section className="feedback-admin page-shell" dir="rtl">
      <style>{`
        .feedback-admin {
          width: min(1180px, calc(100% - 28px));
          margin: 22px auto;
        }

        .admin-head {
          border-radius: 32px;
          padding: 24px;
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.22), transparent 32%),
            linear-gradient(135deg, #18102e, #3b1d6e);
          box-shadow: 0 22px 60px rgba(28, 17, 48,.16);
        }

        .admin-head h1 {
          margin: 0 0 8px;
          font-size: 34px;
          line-height: 1.35;
          font-weight: 950;
        }

        .admin-head p {
          margin: 0;
          color: #c9bdf0;
          line-height: 1.9;
          font-weight: 760;
        }

        .admin-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 16px 0;
        }

        .admin-tabs button {
          border: 0;
          border-radius: 999px;
          padding: 10px 14px;
          background: #efe9fb;
          color: #463c63;
          font-family: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        .admin-tabs button.active {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
        }

        .feedback-review-list {
          display: grid;
          gap: 12px;
        }

        .feedback-review-card {
          border-radius: 28px;
          padding: 18px;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.22);
          box-shadow: 0 16px 42px rgba(28, 17, 48,.06);
        }

        .review-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .review-top h3 {
          margin: 0;
          color: #18102e;
          font-size: 18px;
          line-height: 1.6;
          font-weight: 950;
        }

        .review-top span {
          color: #7a6c9a;
          font-size: 12px;
          font-weight: 850;
        }

        .review-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin: 8px 0;
        }

        .review-badges b {
          border-radius: 999px;
          padding: 5px 9px;
          background: #efe9fb;
          color: #6d28d9;
          font-size: 11px;
          font-weight: 950;
        }

        .review-text {
          border-radius: 20px;
          padding: 13px;
          background: #f4f0fb;
          color: #463c63;
          line-height: 1.9;
          font-size: 13px;
          font-weight: 780;
          margin-top: 8px;
        }

        .review-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .review-actions button {
          border: 0;
          min-height: 40px;
          border-radius: 15px;
          padding: 0 12px;
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
          background: #efe9fb;
          color: #463c63;
        }

        .review-actions .approve {
          color: #fff;
          background: #16a34a;
        }

        .review-actions .reject {
          color: #fff;
          background: #e11d48;
        }

        .review-actions .hide {
          color: #fff;
          background: #5b4f78;
        }
      `}</style>

      <div className="admin-head">
        <h1>إدارة تقييمات المتدربين</h1>
        <p>راجع التقييمات قبل ظهورها في صفحة الزوار. لا يظهر أي رأي إلا بعد موافقة المتدرب وموافقتك.</p>
      </div>

      <div className="admin-tabs">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "active" : ""}
            onClick={async () => {
              setTab(id);
              await load(id);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="feedback-review-list">
        {rows.length ? (
          rows.map((row) => (
            <article className="feedback-review-card" key={row.id}>
              <div className="review-top">
                <div>
                  <h3>{row.user_profiles?.certificate_name || row.user_profiles?.full_name || row.user_profiles?.email || "متدرب"}</h3>
                  <span>{stageLabel(row.stage)} · {row.completed_percent}% · الحالة: {row.status}</span>
                </div>
                <span>{new Date(row.submitted_at).toLocaleString("ar-SA")}</span>
              </div>

              <div className="review-badges">
                <b>نشر: {row.publish_consent ? "مسموح" : "غير مسموح"}</b>
                <b>عرض الاسم: {row.display_name_preference}</b>
                <b>يوصي: {row.recommend === true ? "نعم" : row.recommend === false ? "لا" : "غير محدد"}</b>
              </div>

              {row.testimonial_text && (
                <div className="review-text">
                  <strong>الشهادة المقترحة:</strong>
                  <br />
                  {row.testimonial_text}
                </div>
              )}

              {row.improvement_text && (
                <div className="review-text">
                  <strong>ملاحظة تحسين:</strong>
                  <br />
                  {row.improvement_text}
                </div>
              )}

              {row.transformation_text && (
                <div className="review-text">
                  <strong>التحول في الفهم:</strong>
                  <br />
                  {row.transformation_text}
                </div>
              )}

              <div className="review-actions">
                <button type="button" className="approve" disabled={busyId === row.id} onClick={() => act(row, "approve", true)}>
                  موافقة ونشر
                </button>
                <button type="button" disabled={busyId === row.id} onClick={() => act(row, "approve", false)}>
                  موافقة دون نشر
                </button>
                <button type="button" className="reject" disabled={busyId === row.id} onClick={() => act(row, "reject", false)}>
                  رفض
                </button>
                <button type="button" className="hide" disabled={busyId === row.id} onClick={() => act(row, "hide", false)}>
                  إخفاء
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="feedback-review-card">لا توجد تقييمات في هذا التصنيف.</div>
        )}
      </div>
    </section>
  );
}
