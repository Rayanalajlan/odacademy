import { useEffect, useMemo, useState } from "react";
import {
  createAdminNotification,
  deleteFeedback,
  getAdminOverview,
  getPendingFeedback,
  getPublishedFeedback,
  getRecentCertificates,
  getRecentLearners,
  getRecentNotes,
  isCurrentUserAdmin,
  moderateFeedback
} from "../lib/adminDashboardService";

function safeDate(value) {
  if (!value) return "غير محدد";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "غير محدد";
  }
}

function Stars({ value = 0 }) {
  const rating = Number(value || 0);

  return (
    <span className="admin-stars" aria-label={`تقييم ${rating} من 5`}>
      {"★".repeat(Math.max(0, Math.min(5, rating)))}
      {"☆".repeat(Math.max(0, 5 - Math.max(0, Math.min(5, rating))))}
    </span>
  );
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="admin-metric">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function isOnlineLearner(learner = {}) {
  if (!learner.last_seen_at) return false;
  const lastSeen = new Date(learner.last_seen_at).getTime();
  if (!Number.isFinite(lastSeen)) return false;
  return Date.now() - lastSeen <= 10 * 60 * 1000;
}

function learnerStatusText(learner = {}) {
  return isOnlineLearner(learner) ? "متصل الآن" : "غير متصل الآن";
}

export default function AdminDashboard() {
  const [allowed, setAllowed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [publishedFeedback, setPublishedFeedback] = useState([]);
  const [learners, setLearners] = useState([]);
  const [notes, setNotes] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeTab, setActiveTab] = useState("feedback");
  const [notice, setNotice] = useState("");
  const [moderatingId, setModeratingId] = useState("");
  const [notificationDraft, setNotificationDraft] = useState({
    userId: "",
    title: "",
    body: ""
  });

  async function loadAll() {
    setLoading(true);
    setNotice("");

    try {
      const isAdmin = await isCurrentUserAdmin();
      setAllowed(isAdmin);

      if (!isAdmin) return;

      const results = await Promise.allSettled([
        getAdminOverview(),
        getPendingFeedback(40),
        getPublishedFeedback(40),
        getRecentLearners(24),
        getRecentNotes(24),
        getRecentCertificates(24)
      ]);

      const [overviewResult, feedbackResult, publishedFeedbackResult, learnersResult, notesResult, certificatesResult] =
        results.map((result) => (result.status === "fulfilled" ? result.value : null));

      const failed = results.find((result) => result.status === "rejected");

      setOverview(overviewResult || null);
      setFeedback(Array.isArray(feedbackResult) ? feedbackResult : []);
      setPublishedFeedback(Array.isArray(publishedFeedbackResult) ? publishedFeedbackResult : []);
      setLearners(Array.isArray(learnersResult) ? learnersResult : []);
      setNotes(Array.isArray(notesResult) ? notesResult : []);
      setCertificates(Array.isArray(certificatesResult) ? certificatesResult : []);

      if (failed) {
        setNotice(failed.reason?.message || "تم تحميل اللوحة جزئيًا وتعذر تحميل أحد الأقسام.");
      }
    } catch (error) {
      setNotice(error?.message || "تعذر تحميل لوحة الإدارة.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const selectedLearner = useMemo(() => {
    return learners.find((learner) => learner.user_id === notificationDraft.userId);
  }, [learners, notificationDraft.userId]);

  const onlineLearners = useMemo(() => {
    return learners.filter((learner) => isOnlineLearner(learner)).length;
  }, [learners]);

  async function handleModerate(item, nextStatus) {
    setModeratingId(item.id);
    setNotice("");

    try {
      const updated = await moderateFeedback({
        feedbackId: item.id,
        nextStatus,
        adminNote: nextStatus === "published" ? "تم اعتماد التقييم للنشر." : "تم رفض التقييم."
      });

      setFeedback((current) => current.filter((row) => row.id !== item.id));
      if (nextStatus === "published") {
        const publishedItem = {
          ...item,
          ...updated,
          status: "published",
          published_at: updated?.published_at || new Date().toISOString(),
          moderated_at: updated?.moderated_at || new Date().toISOString()
        };

        setPublishedFeedback((current) => [
          publishedItem,
          ...current.filter((row) => row.id !== item.id)
        ]);
      }
      setNotice(nextStatus === "published" ? "تم نشر التقييم." : "تم رفض التقييم.");
      window.setTimeout(() => {
        loadAll();
      }, 400);
    } catch (error) {
      setNotice(error?.message || "تعذر تحديث حالة التقييم.");
    } finally {
      setModeratingId("");
    }
  }

  async function handleDeleteFeedback(item) {
    const confirmed = window.confirm("هل تريد حذف هذا التقييم نهائيًا من صفحة الزوار ولوحة الإدارة؟");
    if (!confirmed) return;

    setModeratingId(item.id);
    setNotice("");

    try {
      await deleteFeedback(item.id);
      setPublishedFeedback((current) => current.filter((row) => row.id !== item.id));
      setFeedback((current) => current.filter((row) => row.id !== item.id));
      setNotice("تم حذف التقييم.");
      await loadAll();
    } catch (error) {
      setNotice(error?.message || "تعذر حذف التقييم.");
    } finally {
      setModeratingId("");
    }
  }

  async function sendNotification(event) {
    event.preventDefault();
    setNotice("");

    try {
      if (!notificationDraft.userId) throw new Error("اختر متدربًا أولًا.");
      if (!notificationDraft.title.trim()) throw new Error("اكتب عنوان التنبيه.");

      await createAdminNotification({
        userId: notificationDraft.userId,
        title: notificationDraft.title,
        body: notificationDraft.body,
        type: "admin",
        actionLabel: "فتح الرحلة",
        actionPage: "journey"
      });

      setNotificationDraft({
        userId: "",
        title: "",
        body: ""
      });
      setNotice("تم إرسال التنبيه للمتدرب.");
      await loadAll();
    } catch (error) {
      setNotice(error?.message || "تعذر إرسال التنبيه.");
    }
  }

  return (
    <section className="admin-dashboard" dir="rtl">
      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          padding: 34px 16px 80px;
          color: #18102e;
          background:
            radial-gradient(circle at 10% 10%, rgba(139, 92, 246,.14), transparent 30%),
            radial-gradient(circle at 90% 15%, rgba(245,158,11,.13), transparent 26%),
            linear-gradient(180deg,#f4f0fb 0%, #efe9fb 55%, #f4f0fb 100%);
        }

        .admin-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .admin-hero {
          border-radius: 34px;
          padding: 28px;
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.22), transparent 34%),
            linear-gradient(135deg, #18102e, #3b1d6e);
          box-shadow: 0 24px 70px rgba(28, 17, 48,.18);
        }

        .admin-hero span,
        .admin-hero-kicker {
          display: inline-flex;
          margin-bottom: 10px;
          color: #fde68a;
          -webkit-text-fill-color: #fde68a !important;
          font-size: 12px;
          font-weight: 950;
        }

        .admin-hero h1,
        .admin-hero-title {
          margin: 0;
          font-size: clamp(28px, 5vw, 52px);
          line-height: 1.14;
          font-weight: 950;
          letter-spacing: -1px;
          color: #f8f2ff !important;
          -webkit-text-fill-color: #f8f2ff !important;
          background-image: none !important;
          text-shadow: 0 12px 34px rgba(0,0,0,.28);
        }

        .admin-hero p {
          margin: 14px 0 0;
          max-width: 820px;
          color: rgba(196, 181, 253,.9);
          -webkit-text-fill-color: rgba(196, 181, 253,.9);
          font-size: 14px;
          line-height: 2;
          font-weight: 760;
        }

        .admin-loading,
        .admin-denied,
        .admin-notice {
          width: min(1180px, 100%);
          margin: 18px auto;
          border-radius: 24px;
          padding: 18px;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.22);
          box-shadow: 0 14px 34px rgba(28, 17, 48,.06);
          color: #463c63;
          font-weight: 850;
          line-height: 1.9;
        }

        .admin-notice {
          color: #6d28d9;
          background: #efe9fb;
        }

        .admin-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 18px 0;
        }

        .admin-metric,
        .admin-panel {
          border-radius: 26px;
          padding: 18px;
          background: rgba(255,255,255,.94);
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
        }

        .admin-metric span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 900;
        }

        .admin-metric strong {
          display: block;
          margin-top: 6px;
          color: #18102e;
          font-size: 28px;
          line-height: 1.1;
          font-weight: 950;
        }

        .admin-metric small {
          display: block;
          margin-top: 8px;
          color: #9d8fc0;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 780;
        }

        .admin-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 18px 0;
        }

        .admin-tabs button,
        .admin-action,
        .admin-soft-button {
          border: 0;
          min-height: 42px;
          border-radius: 16px;
          padding: 0 14px;
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
          transition: .18s ease;
        }

        .admin-tabs button {
          color: #463c63;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.20);
        }

        .admin-tabs button.active {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          border-color: transparent;
        }

        .admin-tabs button:hover,
        .admin-action:hover,
        .admin-soft-button:hover {
          transform: translateY(-1px);
        }

        .admin-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .admin-panel h2,
        .admin-panel h3 {
          margin: 0 0 12px;
          color: #18102e;
          font-size: 18px;
          line-height: 1.6;
          font-weight: 950;
        }

        .admin-table {
          display: grid;
          gap: 10px;
        }

        .admin-row {
          border-radius: 20px;
          padding: 14px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .admin-row-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .admin-row-head strong {
          color: #18102e;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 950;
        }

        .admin-row-head small,
        .admin-row p,
        .admin-row span {
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 780;
        }

        .admin-row p {
          margin: 8px 0 0;
          color: #463c63;
        }

        .admin-stars {
          color: #a855f7;
          letter-spacing: 1px;
          font-size: 14px;
        }

        .admin-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .admin-action.approve {
          color: #fff;
          background: linear-gradient(135deg, #10b981, #047857);
        }

        .admin-action.reject {
          color: #fff;
          background: linear-gradient(135deg, #ef4444, #991b1b);
        }

        .admin-action.delete {
          color: #fff;
          background: linear-gradient(135deg, #dc2626, #7f1d1d);
        }

        .admin-status-pill {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          color: #047857;
          background: #d1fae5;
          border: 1px solid rgba(16, 185, 129, .24);
          font-size: 11px;
          font-weight: 950;
        }

        .admin-online-pill {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 950;
          color: #6b7280;
          background: #f1f5f9;
          border: 1px solid rgba(100, 116, 139, .22);
        }

        .admin-online-pill.online {
          color: #047857;
          background: #d1fae5;
          border-color: rgba(16, 185, 129, .26);
        }

        .admin-soft-button {
          color: #463c63;
          background: #e0d8f5;
        }

        .admin-empty {
          border-radius: 20px;
          padding: 18px;
          color: #7a6c9a;
          background: #f4f0fb;
          border: 1px dashed rgba(100,116,139,.28);
          font-size: 13px;
          line-height: 1.9;
          font-weight: 850;
          text-align: center;
        }

        .admin-form {
          display: grid;
          gap: 10px;
        }

        .admin-form label {
          display: grid;
          gap: 6px;
          color: #463c63;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 900;
        }

        .admin-form input,
        .admin-form select,
        .admin-form textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #c9bdf0;
          border-radius: 16px;
          min-height: 42px;
          padding: 0 12px;
          font-family: inherit;
          font-weight: 800;
          color: #18102e;
          background: #fff;
          outline: none;
        }

        .admin-form textarea {
          min-height: 100px;
          padding-top: 10px;
          line-height: 1.8;
          resize: vertical;
        }

        .admin-form input:focus,
        .admin-form select:focus,
        .admin-form textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,.09);
        }

        .admin-layout-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-dashboard {
          color: #f7f3fc;
          background:
            radial-gradient(circle at 10% 10%, rgba(168, 85, 247,.16), transparent 30%),
            radial-gradient(circle at 90% 14%, rgba(124, 58, 237,.14), transparent 28%),
            linear-gradient(180deg,#10091f 0%, #170d2c 54%, #0d0719 100%);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-hero {
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.18), transparent 34%),
            linear-gradient(135deg, #18102e, #3b1d6e);
          border: 1px solid rgba(196, 181, 253,.18);
          box-shadow: 0 24px 70px rgba(0,0,0,.36);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-metric,
        html[data-theme="dark"] body.od-theme-dark .admin-panel,
        html[data-theme="dark"] body.od-theme-dark .admin-loading,
        html[data-theme="dark"] body.od-theme-dark .admin-denied,
        html[data-theme="dark"] body.od-theme-dark .admin-notice {
          background:
            radial-gradient(circle at 100% 0%, rgba(168, 85, 247,.10), transparent 34%),
            linear-gradient(180deg, rgba(35, 22, 62,.96), rgba(25, 14, 45,.96));
          border-color: rgba(196, 181, 253,.22);
          box-shadow: 0 18px 48px rgba(0,0,0,.28);
          color: #e9ddff;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-metric span,
        html[data-theme="dark"] body.od-theme-dark .admin-metric small,
        html[data-theme="dark"] body.od-theme-dark .admin-row-head small,
        html[data-theme="dark"] body.od-theme-dark .admin-row span,
        html[data-theme="dark"] body.od-theme-dark .admin-empty,
        html[data-theme="dark"] body.od-theme-dark .admin-form label {
          color: #cdbcf8;
          -webkit-text-fill-color: #cdbcf8;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-metric strong,
        html[data-theme="dark"] body.od-theme-dark .admin-panel h2,
        html[data-theme="dark"] body.od-theme-dark .admin-panel h3,
        html[data-theme="dark"] body.od-theme-dark .admin-row-head strong {
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-row,
        html[data-theme="dark"] body.od-theme-dark .admin-empty {
          background: rgba(20, 12, 36,.82);
          border-color: rgba(196, 181, 253,.18);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-row p {
          color: #e9ddff;
          -webkit-text-fill-color: #e9ddff;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-online-pill {
          color: #cdbcf8;
          -webkit-text-fill-color: #cdbcf8;
          background: rgba(100, 116, 139, .16);
          border-color: rgba(196, 181, 253, .18);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-online-pill.online {
          color: #a7f3d0;
          -webkit-text-fill-color: #a7f3d0;
          background: rgba(16, 185, 129, .14);
          border-color: rgba(16, 185, 129, .30);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-tabs button {
          color: #d9cdf2;
          -webkit-text-fill-color: #d9cdf2;
          background: rgba(36, 22, 64,.92);
          border-color: rgba(196, 181, 253,.20);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-tabs button.active {
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border-color: transparent;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-soft-button {
          color: #efe7ff;
          -webkit-text-fill-color: #efe7ff;
          background: rgba(167, 139, 250,.16);
          border: 1px solid rgba(196, 181, 253,.22);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-form input,
        html[data-theme="dark"] body.od-theme-dark .admin-form select,
        html[data-theme="dark"] body.od-theme-dark .admin-form textarea {
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          background: #10091f;
          border-color: rgba(196, 181, 253,.24);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-form input::placeholder,
        html[data-theme="dark"] body.od-theme-dark .admin-form textarea::placeholder {
          color: #a99fce;
          -webkit-text-fill-color: #a99fce;
        }

        @media (max-width: 920px) {
          .admin-metrics,
          .admin-layout-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="admin-shell">
        <header className="admin-hero">
          <span>لوحة إدارة المنصة</span>
          <h1>مركز قرارات سريع للتقييمات، المتدربين، الوثائق، والتنبيهات.</h1>
        </header>

        {loading && <div className="admin-loading">جارٍ تحميل لوحة الإدارة...</div>}

        {!loading && allowed === false && (
          <div className="admin-denied">
            لا تملك صلاحية الوصول إلى لوحة الإدارة. سجّل الدخول بحساب المدير المعتمد.
          </div>
        )}

        {notice && <div className="admin-notice">{notice}</div>}

        {!loading && allowed && (
          <>
            <section className="admin-metrics">
              <MetricCard label="إجمالي المتدربين" value={overview?.total_learners} />
              <MetricCard label="النشطون آخر 10 دقائق" value={overview?.active_now} />
              <MetricCard label="المتصلون الآن في القائمة" value={onlineLearners} />
              <MetricCard label="تقييمات بانتظار المراجعة" value={overview?.pending_feedback} />
              <MetricCard label="وثائق صادرة" value={overview?.issued_certificates} />
            </section>

            <nav className="admin-tabs" aria-label="أقسام لوحة الإدارة">
              <button className={activeTab === "feedback" ? "active" : ""} onClick={() => setActiveTab("feedback")}>
                التقييمات
              </button>
              <button className={activeTab === "published-feedback" ? "active" : ""} onClick={() => setActiveTab("published-feedback")}>
                المعتمدة
              </button>
              <button className={activeTab === "learners" ? "active" : ""} onClick={() => setActiveTab("learners")}>
                المتدربون
              </button>
              <button className={activeTab === "notes" ? "active" : ""} onClick={() => setActiveTab("notes")}>
                الملاحظات
              </button>
              <button className={activeTab === "certificates" ? "active" : ""} onClick={() => setActiveTab("certificates")}>
                الوثائق
              </button>
              <button className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
                إرسال تنبيه
              </button>
              <button onClick={loadAll}>
                تحديث
              </button>
            </nav>

            <div className="admin-grid">
              {activeTab === "feedback" && (
                <section className="admin-panel">
                  <h2>تقييمات بانتظار المراجعة</h2>

                  <div className="admin-table">
                    {feedback.length ? (
                      feedback.map((item) => (
                        <article className="admin-row" key={item.id}>
                          <div className="admin-row-head">
                            <div>
                              <strong>{item.display_name || "متدرب"}</strong>
                              <small>{item.email || "بدون بريد ظاهر"} · {safeDate(item.submitted_at)}</small>
                            </div>
                            <Stars value={item.rating} />
                          </div>

                          <span>{item.stage_label} · نسبة الإكمال: {item.completed_percent || 0}%</span>

                          {item.testimonial_text && <p>{item.testimonial_text}</p>}
                          {item.improvement_text && <p>ملاحظة تحسين: {item.improvement_text}</p>}

                          <div className="admin-actions">
                            <button
                              type="button"
                              className="admin-action approve"
                              disabled={moderatingId === item.id}
                              onClick={() => handleModerate(item, "published")}
                            >
                              اعتماد ونشر
                            </button>
                            <button
                              type="button"
                              className="admin-action reject"
                              disabled={moderatingId === item.id}
                              onClick={() => handleModerate(item, "rejected")}
                            >
                              رفض
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="admin-empty">لا توجد تقييمات بانتظار المراجعة.</div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "published-feedback" && (
                <section className="admin-panel">
                  <h2>تقييمات معتمدة ومنشورة</h2>

                  <div className="admin-table">
                    {publishedFeedback.length ? (
                      publishedFeedback.map((item) => (
                        <article className="admin-row" key={item.id}>
                          <div className="admin-row-head">
                            <div>
                              <strong>{item.display_name || "متدرب"}</strong>
                              <small>{item.email || "بدون بريد ظاهر"} · نُشر: {safeDate(item.published_at || item.moderated_at || item.submitted_at)}</small>
                            </div>
                            <Stars value={item.rating} />
                          </div>

                          <span className="admin-status-pill">تم الاعتماد</span>
                          <span>{item.stage_label} · نسبة الإكمال: {item.completed_percent || 0}%</span>

                          {item.testimonial_text && <p>{item.testimonial_text}</p>}
                          {item.improvement_text && <p>ملاحظة تحسين: {item.improvement_text}</p>}

                          <div className="admin-actions">
                            <button
                              type="button"
                              className="admin-action delete"
                              disabled={moderatingId === item.id}
                              onClick={() => handleDeleteFeedback(item)}
                            >
                              حذف التقييم
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="admin-empty">لا توجد تقييمات معتمدة حاليًا.</div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "learners" && (
                <section className="admin-panel">
                  <h2>آخر المتدربين</h2>

                  <div className="admin-table">
                    {learners.map((learner) => (
                      <article className="admin-row" key={learner.user_id}>
                        <div className="admin-row-head">
                          <div>
                            <strong>{learner.display_name || learner.email || "متدرب"}</strong>
                            <small>{learner.email} · انضم: {safeDate(learner.created_at)}</small>
                          </div>
                          <div className="admin-actions" style={{ marginTop: 0 }}>
                            <span className={`admin-online-pill ${isOnlineLearner(learner) ? "online" : ""}`}>
                              {learnerStatusText(learner)}
                            </span>
                            <span>{learner.completed_days || 0} يوم مكتمل</span>
                          </div>
                        </div>
                        <p>
                          آخر ظهور: {safeDate(learner.last_seen_at)} · وقت التعلم: {Math.round((learner.total_seconds || 0) / 3600)} ساعة
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === "notes" && (
                <section className="admin-panel">
                  <h2>آخر الملاحظات المهنية</h2>

                  <div className="admin-table">
                    {notes.length ? notes.map((note) => (
                      <article className="admin-row" key={note.id}>
                        <div className="admin-row-head">
                          <div>
                            <strong>{note.display_name || note.email || "متدرب"}</strong>
                            <small>{safeDate(note.updated_at || note.created_at)}</small>
                          </div>
                          <span>شهر {note.month_index} · أسبوع {note.week_index} · يوم {note.day_index}</span>
                        </div>
                        <p>{note.note}</p>
                      </article>
                    )) : <div className="admin-empty">لا توجد ملاحظات محفوظة بعد.</div>}
                  </div>
                </section>
              )}

              {activeTab === "certificates" && (
                <section className="admin-panel">
                  <h2>آخر الوثائق</h2>

                  <div className="admin-table">
                    {certificates.length ? certificates.map((cert) => (
                      <article className="admin-row" key={cert.id}>
                        <div className="admin-row-head">
                          <div>
                            <strong>{cert.certificate_name || cert.email || "متدرب"}</strong>
                            <small>{cert.email} · {safeDate(cert.created_at)}</small>
                          </div>
                          <span>{cert.status || "غير محدد"}</span>
                        </div>
                        <p>
                          رقم الوثيقة: {cert.certificate_code || "غير مولّد"} · تحقق: {cert.verification_enabled ? "مفعّل" : "غير مفعّل"}
                        </p>
                      </article>
                    )) : <div className="admin-empty">لا توجد وثائق بعد.</div>}
                  </div>
                </section>
              )}

              {activeTab === "notifications" && (
                <section className="admin-layout-2">
                  <div className="admin-panel">
                    <h2>إرسال تنبيه لمتدرب</h2>

                    <form className="admin-form" onSubmit={sendNotification}>
                      <label>
                        اختر المتدرب
                        <select
                          value={notificationDraft.userId}
                          onChange={(event) =>
                            setNotificationDraft((current) => ({
                              ...current,
                              userId: event.target.value
                            }))
                          }
                        >
                          <option value="">اختر</option>
                          {learners.map((learner) => (
                            <option key={learner.user_id} value={learner.user_id}>
                              {learner.display_name || learner.email}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        عنوان التنبيه
                        <input
                          value={notificationDraft.title}
                          onChange={(event) =>
                            setNotificationDraft((current) => ({
                              ...current,
                              title: event.target.value
                            }))
                          }
                          placeholder="مثال: لديك محطة تعلم جديدة"
                        />
                      </label>

                      <label>
                        نص التنبيه
                        <textarea
                          value={notificationDraft.body}
                          onChange={(event) =>
                            setNotificationDraft((current) => ({
                              ...current,
                              body: event.target.value
                            }))
                          }
                          placeholder="اكتب رسالة قصيرة ومفيدة"
                        />
                      </label>

                      <button type="submit" className="admin-action approve">
                        إرسال التنبيه
                      </button>
                    </form>
                  </div>

                  <div className="admin-panel">
                    <h3>المتدرب المحدد</h3>
                    {selectedLearner ? (
                      <div className="admin-row">
                        <strong>{selectedLearner.display_name || selectedLearner.email}</strong>
                        <p>{selectedLearner.email}</p>
                        <p>أيام مكتملة: {selectedLearner.completed_days || 0}</p>
                      </div>
                    ) : (
                      <div className="admin-empty">اختر متدربًا لعرض ملخصه.</div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
