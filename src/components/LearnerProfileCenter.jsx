import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchProfileCenterData,
  formatLearningHours,
  formatProfileDate,
  formatProfileDateTime,
  updateProfileCenter
} from "../lib/profileCenterService";
import {
  updateAccountEmail,
  updateAccountPassword
} from "../lib/accountSecurityService";

function firstLetter(name = "") {
  const cleaned = String(name || "").trim();

  if (!cleaned) return "م";

  return cleaned.slice(0, 1).toUpperCase();
}

function progressWidth(value) {
  return `${Math.max(0, Math.min(100, Number(value || 0)))}%`;
}

function fieldValue(value, fallback = "غير محدد") {
  return value ? value : fallback;
}

function statusLabel(value) {
  if (value === "issued") return "صادرة";
  if (value === "ready") return "جاهزة";
  if (value === "locked") return "غير مكتملة";
  return value || "غير مكتملة";
}

export default function LearnerProfileCenter({
  session,
  userName = "",
  completedDays = 0,
  totalDays = 168,
  setActivePage,
  onResumeJourney,
  onSignOut
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const editPanelRef = useRef(null);

  const [form, setForm] = useState({
    certificate_name: "",
    professional_goal: "",
    professional_track: "",
    experience_level: "",
    city: "",
    country: ""
  });

  const [accountForm, setAccountForm] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [accountStatus, setAccountStatus] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);

  async function loadProfile() {
    setLoading(true);

    try {
      const result = await fetchProfileCenterData({
        fallbackName: userName,
        completedDaysFallback: completedDays,
        totalDays
      });

      setData(result);
      setForm({
        certificate_name: result?.profile?.certificate_name || result?.profile?.full_name || "",
        professional_goal: result?.profile?.professional_goal || "",
        professional_track: result?.profile?.professional_track || "",
        experience_level: result?.profile?.experience_level || "",
        city: result?.profile?.city || "",
        country: result?.profile?.country || ""
      });
      setAccountForm((current) => ({
        ...current,
        email: result?.profile?.email || session?.user?.email || ""
      }));
    } catch (error) {
      console.warn("تعذر تحميل مركز هوية المتدرب:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, completedDays, totalDays]);

  useEffect(() => {
    if (!editing) return;

    window.setTimeout(() => {
      editPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 120);
  }, [editing, drawerOpen, fullOpen]);

  const profile = data?.profile || {};
  const displayName =
    profile.display_name ||
    profile.certificate_name ||
    profile.full_name ||
    userName ||
    session?.user?.email ||
    "متدرب";

  const email = profile.email || session?.user?.email || "";
  const rank = data?.rank || {
    title: "مستكشف OD",
    subtitle: "في بداية الرحلة",
    nextTitle: "قارئ المنظمة",
    nextIn: 7
  };
  const displayCompletedDays = Math.min(
    Number(totalDays || 168),
    Math.max(Number(completedDays || 0), Number(data?.completedDays || 0))
  );
  const progressPercent = Math.max(
    Number(data?.progressPercent || 0),
    Math.round((displayCompletedDays / Number(totalDays || 168)) * 100)
  );
  const hoursCounted = data?.hoursCounted ?? displayCompletedDays * 4;
  const streak = data?.streak || 0;
  const mastery = data?.mastery || null;
  const masteryStatus =
    mastery?.status ||
    (displayCompletedDays >= totalDays ? "ready" : "locked");

  const unreadNotifications = (data?.notifications || []).filter((item) => !item.read_at).length;

  const nextActionLabel = useMemo(() => {
    if (displayCompletedDays >= totalDays) return "معاينة وثيقة الإتقان";
    return "متابعة من آخر درس";
  }, [displayCompletedDays, totalDays]);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);

    try {
      await updateProfileCenter({
        certificate_name: form.certificate_name,
        full_name: form.certificate_name,
        display_name: form.certificate_name,
        professional_goal: form.professional_goal,
        professional_track: form.professional_track,
        experience_level: form.experience_level,
        city: form.city,
        country: form.country
      });

      setEditing(false);
      await loadProfile();
    } catch (error) {
      alert(error?.message || "تعذر حفظ الملف.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEmailChange(event) {
    event.preventDefault();
    setAccountSaving(true);
    setAccountStatus("");

    try {
      await updateAccountEmail(accountForm.email);
      setAccountStatus("تم إرسال رابط تأكيد تغيير البريد. افتح بريدك لإكمال العملية.");
    } catch (error) {
      setAccountStatus(error?.message || "تعذر إرسال طلب تغيير البريد.");
    } finally {
      setAccountSaving(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();
    setAccountSaving(true);
    setAccountStatus("");

    try {
      if (!accountForm.password || accountForm.password.length < 8) {
        throw new Error("كلمة المرور يجب ألا تقل عن 8 أحرف.");
      }

      if (accountForm.password !== accountForm.confirmPassword) {
        throw new Error("تأكيد كلمة المرور غير مطابق.");
      }

      await updateAccountPassword(accountForm.password);
      setAccountForm((current) => ({
        ...current,
        password: "",
        confirmPassword: ""
      }));
      setAccountStatus("تم تحديث كلمة المرور بنجاح.");
    } catch (error) {
      setAccountStatus(error?.message || "تعذر تحديث كلمة المرور.");
    } finally {
      setAccountSaving(false);
    }
  }

  function navigate(pageId) {
    if (typeof setActivePage === "function") {
      setActivePage(pageId);
      setDrawerOpen(false);
      setFullOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function resumeJourney() {
    if (displayCompletedDays >= totalDays) {
      navigate("mastery");
      return;
    }

    if (typeof onResumeJourney === "function") {
      onResumeJourney();
      setDrawerOpen(false);
      setFullOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate("journey");
  }

  function openDrawer() {
    setDrawerOpen(true);
  }

  function openFullProfile() {
    setFullOpen(true);
    setDrawerOpen(false);
  }

  function openEditDirectly() {
    setEditing(true);
    setFullOpen(false);
    setDrawerOpen(true);
  }

  function startEditInsideFullProfile() {
    setEditing(true);
    window.setTimeout(() => {
      editPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 120);
  }

  function renderEditForm() {
    return (
      <div className="profile-card edit-card" ref={editPanelRef}>
        <div className="edit-card-head">
          <div>
            <h3>تعديل بيانات الملف</h3>
            <p>هذه البيانات تظهر داخل ملفك التعليمي ووثيقة الإتقان.</p>
          </div>
          <button type="button" className="tiny-soft-button" onClick={() => setEditing(false)}>
            إلغاء
          </button>
        </div>

        <form className="profile-form" onSubmit={saveProfile}>
          <label>
            الاسم كما يظهر في الوثيقة
            <input
              value={form.certificate_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, certificate_name: event.target.value }))
              }
              placeholder="اكتب اسمك كما تحب ظهوره"
            />
          </label>

          <label>
            هدفك من الرحلة
            <textarea
              value={form.professional_goal}
              onChange={(event) =>
                setForm((current) => ({ ...current, professional_goal: event.target.value }))
              }
              placeholder="مثال: بناء قدرة استشارية في التطوير التنظيمي"
            />
          </label>

          <div className="two-fields">
            <label>
              المجال الأقرب لك
              <select
                value={form.professional_track}
                onChange={(event) =>
                  setForm((current) => ({ ...current, professional_track: event.target.value }))
                }
              >
                <option value="">اختر المجال</option>
                <option value="الموارد البشرية">الموارد البشرية</option>
                <option value="التطوير التنظيمي">التطوير التنظيمي</option>
                <option value="القيادة والإدارة">القيادة والإدارة</option>
                <option value="الاستشارات">الاستشارات</option>
                <option value="طالب / باحث عن فرصة">طالب / باحث عن فرصة</option>
                <option value="مجال آخر">مجال آخر</option>
              </select>
            </label>

            <label>
              مستوى الخبرة
              <select
                value={form.experience_level}
                onChange={(event) =>
                  setForm((current) => ({ ...current, experience_level: event.target.value }))
                }
              >
                <option value="">اختر المستوى</option>
                <option value="مبتدئ">مبتدئ</option>
                <option value="أخصائي">أخصائي</option>
                <option value="أخصائي أول">أخصائي أول</option>
                <option value="مشرف / قائد فريق">مشرف / قائد فريق</option>
                <option value="مدير">مدير</option>
                <option value="قائد / مستشار">قائد / مستشار</option>
              </select>
            </label>
          </div>

          <div className="two-fields">
            <label>
              الدولة، اختياري
              <input
                value={form.country}
                onChange={(event) =>
                  setForm((current) => ({ ...current, country: event.target.value }))
                }
                placeholder="مثال: السعودية"
              />
            </label>

            <label>
              المدينة، اختياري
              <input
                value={form.city}
                onChange={(event) =>
                  setForm((current) => ({ ...current, city: event.target.value }))
                }
                placeholder="مثال: الرياض"
              />
            </label>
          </div>

          <button type="submit" className="profile-button primary" disabled={saving}>
            {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </button>
        </form>
      </div>
    );
  }

  function renderAccountSecurity() {
    return (
      <div className="profile-card account-card">
        <h3>أمان الحساب</h3>
        <p>يمكنك تحديث البريد أو كلمة المرور. تغيير البريد قد يحتاج تأكيدًا من رسالة تصل إلى بريدك.</p>

        <form className="profile-form" onSubmit={handleEmailChange}>
          <label>
            البريد الإلكتروني
            <input
              type="email"
              value={accountForm.email}
              onChange={(event) =>
                setAccountForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="البريد الجديد"
            />
          </label>

          <button type="submit" className="profile-button soft" disabled={accountSaving}>
            إرسال رابط تغيير البريد
          </button>
        </form>

        <form className="profile-form account-password-form" onSubmit={handlePasswordChange}>
          <div className="two-fields">
            <label>
              كلمة المرور الجديدة
              <input
                type="password"
                value={accountForm.password}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="8 أحرف على الأقل"
              />
            </label>

            <label>
              تأكيد كلمة المرور
              <input
                type="password"
                value={accountForm.confirmPassword}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                placeholder="أعد كتابة كلمة المرور"
              />
            </label>
          </div>

          <button type="submit" className="profile-button primary" disabled={accountSaving}>
            تحديث كلمة المرور
          </button>
        </form>

        {accountStatus && <div className="account-status">{accountStatus}</div>}
      </div>
    );
  }

  return (
    <section className="learner-profile-center" dir="rtl">
      <style>{`
        .learner-profile-center {
          width: min(1180px, calc(100% - 28px));
          margin: 14px auto 0;
          color: #18102e;
        }

        .profile-strip {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 14px;
          align-items: center;
          border-radius: 30px;
          padding: 14px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 35%),
            radial-gradient(circle at 0% 100%, rgba(245,158,11,.11), transparent 30%),
            rgba(255,255,255,.94);
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
          backdrop-filter: blur(18px);
        }

        .profile-identity {
          display: flex;
          gap: 12px;
          align-items: center;
          min-width: 0;
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
        }

        .profile-identity:hover .profile-avatar {
          transform: translateY(-1px);
          box-shadow: 0 16px 34px rgba(139, 92, 246,.26);
        }

        .profile-avatar {
          width: 54px;
          height: 54px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          font-size: 22px;
          font-weight: 950;
          box-shadow: 0 14px 30px rgba(139, 92, 246,.22);
          transition: .18s ease;
        }

        .profile-name {
          min-width: 0;
        }

        .profile-name strong {
          display: block;
          color: #18102e;
          font-size: 15px;
          line-height: 1.6;
          font-weight: 950;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-name span {
          display: block;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.6;
          font-weight: 800;
        }

        .profile-name small {
          display: inline-flex;
          margin-top: 5px;
          padding: 4px 8px;
          border-radius: 999px;
          background: #efe9fb;
          color: #6d28d9;
          font-size: 10px;
          line-height: 1;
          font-weight: 950;
        }

        .profile-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .profile-metric {
          border-radius: 20px;
          padding: 10px 12px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .profile-metric b {
          display: block;
          color: #7a6c9a;
          font-size: 10px;
          line-height: 1.5;
          font-weight: 900;
        }

        .profile-metric strong {
          display: block;
          margin-top: 3px;
          color: #18102e;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 950;
        }

        .profile-progress-line {
          grid-column: 1 / -1;
          height: 7px;
          border-radius: 999px;
          overflow: hidden;
          background: #e0d8f5;
        }

        .profile-progress-line span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #8b5cf6, #22c55e);
        }

        .profile-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          min-width: 170px;
        }

        .profile-button {
          border: 0;
          min-height: 42px;
          border-radius: 16px;
          padding: 0 14px;
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
          transition: .18s ease;
        }

        .profile-button:hover {
          transform: translateY(-1px);
        }

        .profile-button.primary {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          box-shadow: 0 14px 30px rgba(139, 92, 246,.18);
        }

        .profile-button.myfile {
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.25), transparent 38%),
            linear-gradient(135deg, #18102e, #3b1d6e);
          min-height: 48px;
        }

        .profile-button.soft {
          color: #463c63;
          background: #efe9fb;
        }

        .profile-drawer-backdrop,
        .profile-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 130;
          background: rgba(28, 17, 48,.42);
          backdrop-filter: blur(8px);
        }

        .profile-drawer {
          position: fixed;
          z-index: 131;
          top: 0;
          right: 0;
          width: min(470px, 94vw);
          height: 100vh;
          overflow: auto;
          padding: 22px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 34%),
            #ffffff;
          box-shadow: -24px 0 70px rgba(28, 17, 48,.22);
        }

        .drawer-head,
        .profile-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }

        .drawer-head h2,
        .profile-modal-head h2 {
          margin: 0;
          color: #18102e;
          font-size: 24px;
          line-height: 1.45;
          font-weight: 950;
        }

        .drawer-head p,
        .profile-modal-head p {
          margin: 4px 0 0;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .close-button {
          border: 0;
          width: 38px;
          height: 38px;
          border-radius: 14px;
          background: #efe9fb;
          color: #463c63;
          cursor: pointer;
          font-weight: 950;
        }

        .profile-card {
          border-radius: 26px;
          padding: 17px;
          margin-top: 12px;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.18);
          box-shadow: 0 14px 34px rgba(28, 17, 48,.055);
        }

        .profile-card.gradient {
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.22), transparent 32%),
            linear-gradient(135deg, #18102e, #3b1d6e);
          border: 0;
        }

        .profile-card h3 {
          margin: 0 0 10px;
          color: inherit;
          font-size: 16px;
          line-height: 1.6;
          font-weight: 950;
        }

        .profile-card p {
          margin: 0;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 760;
        }

        .profile-card.gradient p {
          color: rgba(196, 181, 253,.92);
        }

        .identity-line {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: center;
        }

        .identity-line .profile-avatar {
          width: 62px;
          height: 62px;
          border-radius: 22px;
        }

        .rank-pill {
          display: inline-flex;
          margin-top: 10px;
          padding: 7px 11px;
          border-radius: 999px;
          color: #fde68a;
          background: rgba(255,255,255,.12);
          font-size: 12px;
          font-weight: 950;
        }

        .profile-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .profile-stat {
          border-radius: 20px;
          padding: 12px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .profile-stat b {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 850;
        }

        .profile-stat strong {
          display: block;
          color: #18102e;
          margin-top: 4px;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 950;
        }

        .mini-progress {
          height: 8px;
          border-radius: 999px;
          overflow: hidden;
          margin-top: 10px;
          background: #e0d8f5;
        }

        .mini-progress span {
          display: block;
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #22c55e);
        }

        .quick-links {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 12px;
        }

        .quick-links button {
          border: 0;
          border-radius: 16px;
          min-height: 42px;
          background: #efe9fb;
          color: #463c63;
          font-family: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .quick-links button.important {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
        }

        .full-profile-modal {
          position: fixed;
          inset: 28px;
          z-index: 132;
          overflow: auto;
          border-radius: 34px;
          padding: 24px;
          background:
            radial-gradient(circle at 0% 0%, rgba(139, 92, 246,.10), transparent 30%),
            #fff;
          box-shadow: 0 28px 90px rgba(28, 17, 48,.28);
        }

        .full-profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .full-profile-grid .wide {
          grid-column: 1 / -1;
        }

        .field-grid,
        .two-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .field-item {
          border-radius: 18px;
          padding: 12px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .field-item b {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          font-weight: 850;
          margin-bottom: 5px;
        }

        .field-item span {
          color: #18102e;
          font-size: 13px;
          font-weight: 900;
          line-height: 1.7;
        }

        .radar-list,
        .achievement-list,
        .activity-list,
        .notes-list,
        .badge-list,
        .notification-list {
          display: grid;
          gap: 9px;
        }

        .radar-row,
        .achievement-row,
        .activity-row,
        .note-row,
        .badge-row,
        .notification-row {
          border-radius: 18px;
          padding: 12px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .radar-row-top,
        .achievement-row-top,
        .badge-row-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          color: #18102e;
          font-size: 12px;
          font-weight: 950;
        }

        .radar-row small,
        .achievement-row small,
        .activity-row small,
        .note-row small,
        .badge-row small,
        .notification-row small {
          display: block;
          margin-top: 4px;
          color: #7a6c9a;
          line-height: 1.7;
          font-size: 11px;
          font-weight: 760;
        }

        .activity-row strong,
        .note-row strong,
        .notification-row strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 950;
        }

        .edit-card,
        .account-card {
          border: 1px solid rgba(139, 92, 246,.24);
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.09), transparent 34%),
            #fff;
        }

        .edit-card-head {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .tiny-soft-button {
          border: 0;
          border-radius: 999px;
          padding: 7px 10px;
          background: #efe9fb;
          color: #463c63;
          font-family: inherit;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .profile-form {
          display: grid;
          gap: 10px;
          margin-top: 10px;
        }

        .profile-form label {
          display: grid;
          gap: 6px;
          color: #463c63;
          font-size: 12px;
          font-weight: 900;
        }

        .profile-form input,
        .profile-form select,
        .profile-form textarea {
          border: 1px solid #c9bdf0;
          border-radius: 16px;
          min-height: 42px;
          padding: 0 12px;
          font-family: inherit;
          font-weight: 800;
          color: #18102e;
          outline: none;
        }

        .profile-form textarea {
          padding-top: 10px;
          min-height: 86px;
          resize: vertical;
        }

        .profile-form input:focus,
        .profile-form select:focus,
        .profile-form textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,.09);
        }

        .account-password-form {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(167, 139, 250,.18);
        }

        .account-status {
          margin-top: 12px;
          border-radius: 16px;
          padding: 10px 12px;
          color: #6d28d9;
          background: #efe9fb;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 850;
        }

        @media (max-width: 940px) {
          .profile-strip,
          .profile-metrics,
          .full-profile-grid,
          .field-grid,
          .two-fields {
            grid-template-columns: 1fr;
          }

          .profile-actions {
            min-width: 0;
          }

          .profile-button {
            width: 100%;
          }

          .full-profile-modal {
            inset: 10px;
            border-radius: 24px;
            padding: 16px;
          }
        }

        @media (max-width: 520px) {
          .learner-profile-center {
            width: calc(100% - 18px);
          }

          .quick-links,
          .profile-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="profile-strip">
        <button
          type="button"
          className="profile-identity"
          onClick={openDrawer}
          aria-label="فتح حسابي"
        >
          <div className="profile-avatar" aria-hidden="true">{firstLetter(displayName)}</div>
          <div className="profile-name">
            <strong>{loading ? "جارٍ تحميل ملفك..." : displayName}</strong>
            <span>{rank.title} · {rank.subtitle}</span>
            <small>اضغط لفتح حسابك</small>
          </div>
        </button>

        <div className="profile-metrics">
          <div className="profile-metric">
            <b>إنجاز الرحلة</b>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="profile-metric">
            <b>الأيام المكتملة</b>
            <strong>{displayCompletedDays} / {totalDays}</strong>
          </div>
          <div className="profile-metric">
            <b>وقت التعلم</b>
            <strong>{formatLearningHours(hoursCounted)}</strong>
          </div>
          <div className="profile-metric">
            <b>تنبيهات جديدة</b>
            <strong>{unreadNotifications}</strong>
          </div>
          <div className="profile-progress-line" aria-label={`إنجاز الرحلة ${progressPercent}%`}>
            <span style={{ width: progressWidth(progressPercent) }} />
          </div>
        </div>

        <div className="profile-actions">
          <button type="button" className="profile-button myfile" onClick={() => navigate("portfolio")}>
            ملفي التعليمي
          </button>
          <button type="button" className="profile-button soft" onClick={openDrawer}>
            حسابي
          </button>
          <button type="button" className="profile-button soft" onClick={resumeJourney}>
            {nextActionLabel}
          </button>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="profile-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <aside className="profile-drawer" role="dialog" aria-modal="true" aria-label="حسابي">
            <div className="drawer-head">
              <div>
                <h2>حسابي</h2>
                <p>ملخص سريع لتقدمك، وقتك، شاراتك، وآخر نشاطاتك.</p>
              </div>
              <button type="button" className="close-button" onClick={() => setDrawerOpen(false)}>×</button>
            </div>

            <div className="profile-card gradient">
              <div className="identity-line">
                <div className="profile-avatar">{firstLetter(displayName)}</div>
                <div>
                  <h3>{displayName}</h3>
                  <p>{email || "البريد غير متوفر"}</p>
                  <span className="rank-pill">{rank.title}</span>
                </div>
              </div>
            </div>

            <div className="profile-card">
              <h3>التقدم العام</h3>
              <div className="profile-stats-grid">
                <div className="profile-stat">
                  <b>نسبة الرحلة</b>
                  <strong>{progressPercent}%</strong>
                </div>
                <div className="profile-stat">
                  <b>الأيام المكتملة</b>
                  <strong>{displayCompletedDays} / {totalDays}</strong>
                </div>
                <div className="profile-stat">
                  <b>وقت التعلم الحقيقي</b>
                  <strong>{formatLearningHours(hoursCounted)}</strong>
                </div>
                <div className="profile-stat">
                  <b>سلسلة التعلم</b>
                  <strong>{streak} أيام</strong>
                </div>
              </div>
              <div className="mini-progress">
                <span style={{ width: progressWidth(progressPercent) }} />
              </div>
            </div>

            <div className="profile-card">
              <h3>الخطوة التالية</h3>
              <p>
                {rank.nextIn > 0
                  ? `أكمل ${rank.nextIn} يومًا للوصول إلى رتبة ${rank.nextTitle}.`
                  : "أنت في أعلى رتبة حالية داخل الرحلة."}
              </p>

              <div className="quick-links">
                <button type="button" onClick={resumeJourney}>متابعة الرحلة</button>
                <button type="button" onClick={() => navigate("mastery")}>وثيقة الإتقان</button>
                <button type="button" className="important" onClick={openEditDirectly}>تعديل البيانات</button>
                <button type="button" onClick={openFullProfile}>عرض الملف الكامل</button>
              </div>
            </div>

            {!!(data?.badges || []).length && (
              <div className="profile-card">
                <h3>آخر الشارات</h3>
                <div className="badge-list">
                  {data.badges.slice(0, 4).map((item) => (
                    <div className="badge-row" key={item.badge_id}>
                      <div className="badge-row-top">
                        <span>{item.badges?.title || item.badge_id}</span>
                        <span>{item.badges?.icon || "🏅"}</span>
                      </div>
                      <small>{formatProfileDate(item.awarded_at)}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editing && renderEditForm()}
          </aside>
        </>
      )}

      {fullOpen && (
        <>
          <div className="profile-modal-backdrop" onClick={() => setFullOpen(false)} />
          <section className="full-profile-modal" role="dialog" aria-modal="true" aria-label="الملف التعليمي الكامل">
            <div className="profile-modal-head">
              <div>
                <h2>الملف التعليمي الكامل</h2>
                <p>مركز الهوية، التقدم، الوقت، الرادار، الشارات، الملاحظات، الوثيقة، وأمان الحساب.</p>
              </div>
              <button type="button" className="close-button" onClick={() => setFullOpen(false)}>×</button>
            </div>

            <div className="full-profile-grid">
              <div className="profile-card gradient">
                <div className="identity-line">
                  <div className="profile-avatar">{firstLetter(displayName)}</div>
                  <div>
                    <h3>{displayName}</h3>
                    <p>{fieldValue(profile.professional_goal, "لم تحدد هدفك من الرحلة بعد.")}</p>
                    <span className="rank-pill">{rank.title}</span>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <h3>بطاقة المتدرب</h3>
                <div className="field-grid">
                  <div className="field-item">
                    <b>البريد</b>
                    <span>{fieldValue(email)}</span>
                  </div>
                  <div className="field-item">
                    <b>تاريخ الانضمام</b>
                    <span>{formatProfileDate(profile.created_at)}</span>
                  </div>
                  <div className="field-item">
                    <b>المجال</b>
                    <span>{fieldValue(profile.professional_track)}</span>
                  </div>
                  <div className="field-item">
                    <b>مستوى الخبرة</b>
                    <span>{fieldValue(profile.experience_level)}</span>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <h3>ملخص الرحلة</h3>
                <div className="profile-stats-grid">
                  <div className="profile-stat">
                    <b>نسبة الإنجاز</b>
                    <strong>{progressPercent}%</strong>
                  </div>
                  <div className="profile-stat">
                    <b>الأيام المكتملة</b>
                    <strong>{displayCompletedDays} / {totalDays}</strong>
                  </div>
                  <div className="profile-stat">
                    <b>وقت التعلم الحقيقي</b>
                    <strong>{formatLearningHours(hoursCounted)}</strong>
                  </div>
                  <div className="profile-stat">
                    <b>سلسلة التعلم</b>
                    <strong>{streak} أيام</strong>
                  </div>
                </div>
                <div className="mini-progress">
                  <span style={{ width: progressWidth(progressPercent) }} />
                </div>
              </div>

              <div className="profile-card">
                <h3>رادار الجدارات</h3>
                <div className="radar-list">
                  {(data?.radar || []).map((item) => (
                    <div className="radar-row" key={item.label}>
                      <div className="radar-row-top">
                        <span>{item.label}</span>
                        <span>{item.score === null ? "لم يقاس بعد" : `${item.score}%`}</span>
                      </div>
                      <div className="mini-progress">
                        <span style={{ width: progressWidth(item.score || 0) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-card">
                <h3>الشارات المهنية</h3>
                <div className="badge-list">
                  {(data?.badges || []).length ? (
                    data.badges.map((item) => (
                      <div className="badge-row" key={item.badge_id}>
                        <div className="badge-row-top">
                          <span>{item.badges?.title || item.badge_id}</span>
                          <span>{item.badges?.icon || "🏅"}</span>
                        </div>
                        <small>{item.badges?.description || "شارة مهنية ضمن الرحلة."}</small>
                        <small>{formatProfileDate(item.awarded_at)}</small>
                      </div>
                    ))
                  ) : (
                    <p>لم تحصل على شارات بعد. ابدأ الرحلة لتظهر هنا.</p>
                  )}
                </div>
              </div>

              <div className="profile-card">
                <h3>إنجازات معرفية</h3>
                <div className="achievement-list">
                  {(data?.achievements || []).map((item) => (
                    <div className="achievement-row" key={item.key}>
                      <div className="achievement-row-top">
                        <span>{item.title}</span>
                        <span>{item.status}</span>
                      </div>
                      <small>{item.value} / {item.target}</small>
                      <div className="mini-progress">
                        <span style={{ width: progressWidth((item.value / item.target) * 100) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-card">
                <h3>ملاحظاتك المهنية الأخيرة</h3>
                <div className="notes-list">
                  {(data?.recentNotes || []).length ? (
                    data.recentNotes.map((note) => (
                      <div className="note-row" key={note.id}>
                        <strong>{note.note_title || "ملاحظة درس"}</strong>
                        <small>{`الشهر ${note.month_index} · الأسبوع ${note.week_index} · اليوم ${note.day_index}`}</small>
                        <small>{String(note.note || "").slice(0, 130)}{String(note.note || "").length > 130 ? "..." : ""}</small>
                      </div>
                    ))
                  ) : (
                    <p>لا توجد ملاحظات محفوظة بعد.</p>
                  )}
                </div>
              </div>

              <div className="profile-card">
                <h3>التنبيهات الأخيرة</h3>
                <div className="notification-list">
                  {(data?.notifications || []).length ? (
                    data.notifications.slice(0, 6).map((item) => (
                      <div className="notification-row" key={item.id}>
                        <strong>{item.title}</strong>
                        {item.body && <small>{item.body}</small>}
                        <small>{formatProfileDateTime(item.created_at)}</small>
                      </div>
                    ))
                  ) : (
                    <p>لا توجد تنبيهات حاليًا.</p>
                  )}
                </div>
              </div>

              <div className="profile-card">
                <h3>وثيقة الإتقان</h3>
                <div className="field-grid">
                  <div className="field-item">
                    <b>حالة الوثيقة</b>
                    <span>{statusLabel(masteryStatus)}</span>
                  </div>
                  <div className="field-item">
                    <b>رقم الوثيقة</b>
                    <span>{fieldValue(mastery?.certificate_code, "يظهر بعد إنشاء الوثيقة")}</span>
                  </div>
                  <div className="field-item">
                    <b>رابط التحقق</b>
                    <span>{mastery?.verification_enabled ? "مفعّل" : "غير مفعّل"}</span>
                  </div>
                  <div className="field-item">
                    <b>آخر تحديث</b>
                    <span>{formatProfileDate(mastery?.updated_at || mastery?.created_at)}</span>
                  </div>
                </div>
                <div className="quick-links">
                  <button type="button" onClick={() => navigate("mastery")}>معاينة الوثيقة</button>
                  <button type="button" disabled>رابط تحقق لاحقًا</button>
                </div>
              </div>

              <div className="profile-card">
                <h3>آخر النشاط</h3>
                <div className="activity-list">
                  {(data?.recentActivity || []).length ? (
                    data.recentActivity.map((item, index) => (
                      <div className="activity-row" key={`${item.title}-${index}`}>
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                        <small>{formatProfileDateTime(item.time)}</small>
                      </div>
                    ))
                  ) : (
                    <p>لا يوجد نشاط محفوظ بعد. ابدأ الرحلة ليظهر السجل هنا.</p>
                  )}
                </div>
              </div>

              <div className="profile-card wide">
                <h3>إعدادات الحساب والخصوصية</h3>
                <div className="quick-links">
                  <button type="button" className="important" onClick={startEditInsideFullProfile}>
                    تعديل الاسم والهدف
                  </button>
                  <button type="button" onClick={() => navigate("mastery")}>وثيقة الإتقان</button>
                  <button type="button" onClick={onSignOut}>تسجيل الخروج</button>
                  <button type="button" disabled>طلب حذف البيانات لاحقًا</button>
                </div>
              </div>

              {renderAccountSecurity()}

              {editing && (
                <div className="wide">
                  {renderEditForm()}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
