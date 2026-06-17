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
import NeoMetricGauge from "./NeoMetricGauge";

function firstLetter(name = "") {
  const cleaned = String(name || "").trim();

  if (!cleaned) return "Ù…";

  return cleaned.slice(0, 1).toUpperCase();
}

function progressWidth(value) {
  return `${Math.max(0, Math.min(100, Number(value || 0)))}%`;
}

function fieldValue(value, fallback = "ØºÙŠØ± Ù…Ø­Ø¯Ø¯") {
  return value ? value : fallback;
}

function statusLabel(value) {
  if (value === "issued") return "ØµØ§Ø¯Ø±Ø©";
  if (value === "ready") return "Ø¬Ø§Ù‡Ø²Ø©";
  if (value === "locked") return "ØºÙŠØ± Ù…ÙƒØªÙ…Ù„Ø©";
  return value || "ØºÙŠØ± Ù…ÙƒØªÙ…Ù„Ø©";
}

export default function LearnerProfileCenter({
  session,
  userName = "",
  completedDays = 0,
  totalDays = 180,
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
      console.warn("ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ù…Ø±ÙƒØ² Ù‡ÙˆÙŠØ© Ø§Ù„Ù…ØªØ¯Ø±Ø¨:", error);
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
    "Ù…ØªØ¯Ø±Ø¨";

  const email = profile.email || session?.user?.email || "";
  const rank = data?.rank || {
    title: "Ù…Ø³ØªÙƒØ´Ù OD",
    subtitle: "ÙÙŠ Ø¨Ø¯Ø§ÙŠØ© Ø§Ù„Ø±Ø­Ù„Ø©",
    nextTitle: "Ù‚Ø§Ø±Ø¦ Ø§Ù„Ù…Ù†Ø¸Ù…Ø©",
    nextIn: 7
  };
  const progressPercent =
    data?.progressPercent ??
    Math.round((Number(completedDays || 0) / Number(totalDays || 180)) * 100);
  const hoursCounted = data?.hoursCounted ?? Number(completedDays || 0) * 4;
  const streak = data?.streak || 0;
  const mastery = data?.mastery || null;
  const masteryStatus =
    mastery?.status ||
    (Number(data?.completedDays || completedDays) >= totalDays ? "ready" : "locked");

  const unreadNotifications = (data?.notifications || []).filter((item) => !item.read_at).length;

  const nextActionLabel = useMemo(() => {
    if (Number(data?.completedDays || completedDays) >= totalDays) return "Ù…Ø¹Ø§ÙŠÙ†Ø© ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù†";
    return "Ù…ØªØ§Ø¨Ø¹Ø© Ù…Ù† Ø¢Ø®Ø± Ù…Ø­Ø·Ø©";
  }, [completedDays, data?.completedDays, totalDays]);

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
      alert(error?.message || "ØªØ¹Ø°Ø± Ø­ÙØ¸ Ø§Ù„Ù…Ù„Ù.");
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
      setAccountStatus("ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø±Ø§Ø¨Ø· ØªØ£ÙƒÙŠØ¯ ØªØºÙŠÙŠØ± Ø§Ù„Ø¨Ø±ÙŠØ¯. Ø§ÙØªØ­ Ø¨Ø±ÙŠØ¯Ùƒ Ù„Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„Ø¹Ù…Ù„ÙŠØ©.");
    } catch (error) {
      setAccountStatus(error?.message || "ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ ØªØºÙŠÙŠØ± Ø§Ù„Ø¨Ø±ÙŠØ¯.");
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
        throw new Error("ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù„Ø§ ØªÙ‚Ù„ Ø¹Ù† 8 Ø£Ø­Ø±Ù.");
      }

      if (accountForm.password !== accountForm.confirmPassword) {
        throw new Error("ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± Ù…Ø·Ø§Ø¨Ù‚.");
      }

      await updateAccountPassword(accountForm.password);
      setAccountForm((current) => ({
        ...current,
        password: "",
        confirmPassword: ""
      }));
      setAccountStatus("ØªÙ… ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø¨Ù†Ø¬Ø§Ø­.");
    } catch (error) {
      setAccountStatus(error?.message || "ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.");
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
    if (Number(data?.completedDays || completedDays) >= totalDays) {
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
            <h3>ØªØ¹Ø¯ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù„Ù</h3>
            <p>Ù‡Ø°Ù‡ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ØªØ¸Ù‡Ø± Ø¯Ø§Ø®Ù„ Ù…Ù„ÙÙƒ Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ ÙˆÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù†.</p>
          </div>
          <button type="button" className="tiny-soft-button" onClick={() => setEditing(false)}>
            Ø¥Ù„ØºØ§Ø¡
          </button>
        </div>

        <form className="profile-form" onSubmit={saveProfile}>
          <label>
            Ø§Ù„Ø§Ø³Ù… ÙƒÙ…Ø§ ÙŠØ¸Ù‡Ø± ÙÙŠ Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©
            <input
              value={form.certificate_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, certificate_name: event.target.value }))
              }
              placeholder="Ø§ÙƒØªØ¨ Ø§Ø³Ù…Ùƒ ÙƒÙ…Ø§ ØªØ­Ø¨ Ø¸Ù‡ÙˆØ±Ù‡"
            />
          </label>

          <label>
            Ù‡Ø¯ÙÙƒ Ù…Ù† Ø§Ù„Ø±Ø­Ù„Ø©
            <textarea
              value={form.professional_goal}
              onChange={(event) =>
                setForm((current) => ({ ...current, professional_goal: event.target.value }))
              }
              placeholder="Ù…Ø«Ø§Ù„: Ø¨Ù†Ø§Ø¡ Ù‚Ø¯Ø±Ø© Ø§Ø³ØªØ´Ø§Ø±ÙŠØ© ÙÙŠ Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ"
            />
          </label>

          <div className="two-fields">
            <label>
              Ø§Ù„Ù…Ø¬Ø§Ù„ Ø§Ù„Ø£Ù‚Ø±Ø¨ Ù„Ùƒ
              <select
                value={form.professional_track}
                onChange={(event) =>
                  setForm((current) => ({ ...current, professional_track: event.target.value }))
                }
              >
                <option value="">Ø§Ø®ØªØ± Ø§Ù„Ù…Ø¬Ø§Ù„</option>
                <option value="Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©">Ø§Ù„Ù…ÙˆØ§Ø±Ø¯ Ø§Ù„Ø¨Ø´Ø±ÙŠØ©</option>
                <option value="Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ">Ø§Ù„ØªØ·ÙˆÙŠØ± Ø§Ù„ØªÙ†Ø¸ÙŠÙ…ÙŠ</option>
                <option value="Ø§Ù„Ù‚ÙŠØ§Ø¯Ø© ÙˆØ§Ù„Ø¥Ø¯Ø§Ø±Ø©">Ø§Ù„Ù‚ÙŠØ§Ø¯Ø© ÙˆØ§Ù„Ø¥Ø¯Ø§Ø±Ø©</option>
                <option value="Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª">Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø§Øª</option>
                <option value="Ø·Ø§Ù„Ø¨ / Ø¨Ø§Ø­Ø« Ø¹Ù† ÙØ±ØµØ©">Ø·Ø§Ù„Ø¨ / Ø¨Ø§Ø­Ø« Ø¹Ù† ÙØ±ØµØ©</option>
                <option value="Ù…Ø¬Ø§Ù„ Ø¢Ø®Ø±">Ù…Ø¬Ø§Ù„ Ø¢Ø®Ø±</option>
              </select>
            </label>

            <label>
              Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø®Ø¨Ø±Ø©
              <select
                value={form.experience_level}
                onChange={(event) =>
                  setForm((current) => ({ ...current, experience_level: event.target.value }))
                }
              >
                <option value="">Ø§Ø®ØªØ± Ø§Ù„Ù…Ø³ØªÙˆÙ‰</option>
                <option value="Ù…Ø¨ØªØ¯Ø¦">Ù…Ø¨ØªØ¯Ø¦</option>
                <option value="Ø£Ø®ØµØ§Ø¦ÙŠ">Ø£Ø®ØµØ§Ø¦ÙŠ</option>
                <option value="Ø£Ø®ØµØ§Ø¦ÙŠ Ø£ÙˆÙ„">Ø£Ø®ØµØ§Ø¦ÙŠ Ø£ÙˆÙ„</option>
                <option value="Ù…Ø´Ø±Ù / Ù‚Ø§Ø¦Ø¯ ÙØ±ÙŠÙ‚">Ù…Ø´Ø±Ù / Ù‚Ø§Ø¦Ø¯ ÙØ±ÙŠÙ‚</option>
                <option value="Ù…Ø¯ÙŠØ±">Ù…Ø¯ÙŠØ±</option>
                <option value="Ù‚Ø§Ø¦Ø¯ / Ù…Ø³ØªØ´Ø§Ø±">Ù‚Ø§Ø¦Ø¯ / Ù…Ø³ØªØ´Ø§Ø±</option>
              </select>
            </label>
          </div>

          <div className="two-fields">
            <label>
              Ø§Ù„Ø¯ÙˆÙ„Ø©ØŒ Ø§Ø®ØªÙŠØ§Ø±ÙŠ
              <input
                value={form.country}
                onChange={(event) =>
                  setForm((current) => ({ ...current, country: event.target.value }))
                }
                placeholder="Ù…Ø«Ø§Ù„: Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©"
              />
            </label>

            <label>
              Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©ØŒ Ø§Ø®ØªÙŠØ§Ø±ÙŠ
              <input
                value={form.city}
                onChange={(event) =>
                  setForm((current) => ({ ...current, city: event.target.value }))
                }
                placeholder="Ù…Ø«Ø§Ù„: Ø§Ù„Ø±ÙŠØ§Ø¶"
              />
            </label>
          </div>

          <button type="submit" className="profile-button primary" disabled={saving}>
            {saving ? "Ø¬Ø§Ø±Ù Ø§Ù„Ø­ÙØ¸..." : "Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª"}
          </button>
        </form>
      </div>
    );
  }

  function renderAccountSecurity() {
    return (
      <div className="profile-card account-card">
        <h3>Ø£Ù…Ø§Ù† Ø§Ù„Ø­Ø³Ø§Ø¨</h3>
        <p>ÙŠÙ…ÙƒÙ†Ùƒ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø£Ùˆ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±. ØªØºÙŠÙŠØ± Ø§Ù„Ø¨Ø±ÙŠØ¯ Ù‚Ø¯ ÙŠØ­ØªØ§Ø¬ ØªØ£ÙƒÙŠØ¯Ù‹Ø§ Ù…Ù† Ø±Ø³Ø§Ù„Ø© ØªØµÙ„ Ø¥Ù„Ù‰ Ø¨Ø±ÙŠØ¯Ùƒ.</p>

        <form className="profile-form" onSubmit={handleEmailChange}>
          <label>
            Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ
            <input
              type="email"
              value={accountForm.email}
              onChange={(event) =>
                setAccountForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¬Ø¯ÙŠØ¯"
            />
          </label>

          <button type="submit" className="profile-button soft" disabled={accountSaving}>
            Ø¥Ø±Ø³Ø§Ù„ Ø±Ø§Ø¨Ø· ØªØºÙŠÙŠØ± Ø§Ù„Ø¨Ø±ÙŠØ¯
          </button>
        </form>

        <form className="profile-form account-password-form" onSubmit={handlePasswordChange}>
          <div className="two-fields">
            <label>
              ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©
              <input
                type="password"
                value={accountForm.password}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="8 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„"
              />
            </label>

            <label>
              ØªØ£ÙƒÙŠØ¯ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±
              <input
                type="password"
                value={accountForm.confirmPassword}
                onChange={(event) =>
                  setAccountForm((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                placeholder="Ø£Ø¹Ø¯ ÙƒØªØ§Ø¨Ø© ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±"
              />
            </label>
          </div>

          <button type="submit" className="profile-button primary" disabled={accountSaving}>
            ØªØ­Ø¯ÙŠØ« ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±
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
          aria-label="ÙØªØ­ Ù…Ù„ÙÙŠ"
        >
          <div className="profile-avatar" aria-hidden="true">{firstLetter(displayName)}</div>
          <div className="profile-name">
            <strong>{loading ? "Ø¬Ø§Ø±Ù ØªØ­Ù…ÙŠÙ„ Ù…Ù„ÙÙƒ..." : displayName}</strong>
            <span>{rank.title} Â· {rank.subtitle}</span>
            <small>Ø§Ø¶ØºØ· Ù„ÙØªØ­ Ù…Ù„ÙÙƒ</small>
          </div>
        </button>

        <div className="profile-metrics">
          <NeoMetricGauge
            value={progressPercent}
            max={100}
            displayValue={`${progressPercent}%`}
            label="إنجاز الرحلة"
            status={progressPercent >= 100 ? "complete" : "progress"}
            size="compact"
          />
          <NeoMetricGauge
            value={data?.completedDays ?? completedDays}
            max={totalDays}
            displayValue={`${data?.completedDays ?? completedDays} / ${totalDays}`}
            label="الأيام المكتملة"
            status={(data?.completedDays ?? completedDays) >= totalDays ? "complete" : "progress"}
            size="compact"
          />
          <NeoMetricGauge
            value={1}
            max={1}
            progress={100}
            displayValue={formatLearningHours(hoursCounted)}
            label="وقت التعلم"
            status="readiness"
            size="compact"
          />
          <NeoMetricGauge
            value={unreadNotifications}
            max={Math.max(1, unreadNotifications)}
            displayValue={unreadNotifications}
            label="تنبيهات جديدة"
            status={unreadNotifications > 0 ? "warning" : "complete"}
            size="compact"
          />
        </div>

        <div className="profile-actions">
          <button type="button" className="profile-button myfile" onClick={() => navigate("portfolio")}>
            Ù…Ù„ÙÙŠ Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ
          </button>
          <button type="button" className="profile-button soft" onClick={openDrawer}>
            Ù…Ù„ÙÙŠ
          </button>
          <button type="button" className="profile-button soft" onClick={resumeJourney}>
            {nextActionLabel}
          </button>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div className="profile-drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <aside className="profile-drawer" role="dialog" aria-modal="true" aria-label="Ù…Ù„ÙÙŠ">
            <div className="drawer-head">
              <div>
                <h2>Ù…Ù„ÙÙŠ</h2>
                <p>Ù…Ù„Ø®Øµ Ø³Ø±ÙŠØ¹ Ù„ØªÙ‚Ø¯Ù…ÙƒØŒ ÙˆÙ‚ØªÙƒØŒ Ø´Ø§Ø±Ø§ØªÙƒØŒ ÙˆØ¢Ø®Ø± Ù†Ø´Ø§Ø·Ø§ØªÙƒ.</p>
              </div>
              <button type="button" className="close-button" onClick={() => setDrawerOpen(false)}>Ã—</button>
            </div>

            <div className="profile-card gradient">
              <div className="identity-line">
                <div className="profile-avatar">{firstLetter(displayName)}</div>
                <div>
                  <h3>{displayName}</h3>
                  <p>{email || "Ø§Ù„Ø¨Ø±ÙŠØ¯ ØºÙŠØ± Ù…ØªÙˆÙØ±"}</p>
                  <span className="rank-pill">{rank.title}</span>
                </div>
              </div>
            </div>

            <div className="profile-card">
              <h3>Ø§Ù„ØªÙ‚Ø¯Ù… Ø§Ù„Ø¹Ø§Ù…</h3>
              <div className="profile-stats-grid">
                <NeoMetricGauge
                  value={progressPercent}
                  max={100}
                  displayValue={`${progressPercent}%`}
                  label="نسبة الرحلة"
                  status={progressPercent >= 100 ? "complete" : "progress"}
                  size="compact"
                />
                <NeoMetricGauge
                  value={data?.completedDays ?? completedDays}
                  max={totalDays}
                  displayValue={`${data?.completedDays ?? completedDays} / ${totalDays}`}
                  label="الأيام المكتملة"
                  status={(data?.completedDays ?? completedDays) >= totalDays ? "complete" : "progress"}
                  size="compact"
                />
                <NeoMetricGauge
                  value={1}
                  max={1}
                  progress={100}
                  displayValue={formatLearningHours(hoursCounted)}
                  label="وقت التعلم الحقيقي"
                  status="readiness"
                  size="compact"
                />
                <NeoMetricGauge
                  value={streak}
                  max={Math.max(1, streak)}
                  progress={streak > 0 ? 100 : 0}
                  displayValue={`${streak} أيام`}
                  label="سلسلة التعلم"
                  status={streak > 0 ? "complete" : "locked"}
                  size="compact"
                />
              </div>
            </div>

            <div className="profile-card">
              <h3>Ø§Ù„Ø®Ø·ÙˆØ© Ø§Ù„ØªØ§Ù„ÙŠØ©</h3>
              <p>
                {rank.nextIn > 0
                  ? `Ø£ÙƒÙ…Ù„ ${rank.nextIn} ÙŠÙˆÙ…Ù‹Ø§ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ø±ØªØ¨Ø© ${rank.nextTitle}.`
                  : "Ø£Ù†Øª ÙÙŠ Ø£Ø¹Ù„Ù‰ Ø±ØªØ¨Ø© Ø­Ø§Ù„ÙŠØ© Ø¯Ø§Ø®Ù„ Ø§Ù„Ø±Ø­Ù„Ø©."}
              </p>

              <div className="quick-links">
                <button type="button" onClick={resumeJourney}>Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø±Ø­Ù„Ø©</button>
                <button type="button" onClick={() => navigate("mastery")}>ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù†</button>
                <button type="button" className="important" onClick={openEditDirectly}>ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª</button>
                <button type="button" onClick={openFullProfile}>Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù„Ù Ø§Ù„ÙƒØ§Ù…Ù„</button>
              </div>
            </div>

            {!!(data?.badges || []).length && (
              <div className="profile-card">
                <h3>Ø¢Ø®Ø± Ø§Ù„Ø´Ø§Ø±Ø§Øª</h3>
                <div className="badge-list">
                  {data.badges.slice(0, 4).map((item) => (
                    <div className="badge-row" key={item.badge_id}>
                      <div className="badge-row-top">
                        <span>{item.badges?.title || item.badge_id}</span>
                        <span>{item.badges?.icon || "ðŸ…"}</span>
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
          <section className="full-profile-modal" role="dialog" aria-modal="true" aria-label="Ø§Ù„Ù…Ù„Ù Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ Ø§Ù„ÙƒØ§Ù…Ù„">
            <div className="profile-modal-head">
              <div>
                <h2>Ø§Ù„Ù…Ù„Ù Ø§Ù„ØªØ¹Ù„ÙŠÙ…ÙŠ Ø§Ù„ÙƒØ§Ù…Ù„</h2>
                <p>Ù…Ø±ÙƒØ² Ø§Ù„Ù‡ÙˆÙŠØ©ØŒ Ø§Ù„ØªÙ‚Ø¯Ù…ØŒ Ø§Ù„ÙˆÙ‚ØªØŒ Ø§Ù„Ø±Ø§Ø¯Ø§Ø±ØŒ Ø§Ù„Ø´Ø§Ø±Ø§ØªØŒ Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§ØªØŒ Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©ØŒ ÙˆØ£Ù…Ø§Ù† Ø§Ù„Ø­Ø³Ø§Ø¨.</p>
              </div>
              <button type="button" className="close-button" onClick={() => setFullOpen(false)}>Ã—</button>
            </div>

            <div className="full-profile-grid">
              <div className="profile-card gradient">
                <div className="identity-line">
                  <div className="profile-avatar">{firstLetter(displayName)}</div>
                  <div>
                    <h3>{displayName}</h3>
                    <p>{fieldValue(profile.professional_goal, "Ù„Ù… ØªØ­Ø¯Ø¯ Ù‡Ø¯ÙÙƒ Ù…Ù† Ø§Ù„Ø±Ø­Ù„Ø© Ø¨Ø¹Ø¯.")}</p>
                    <span className="rank-pill">{rank.title}</span>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <h3>Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…ØªØ¯Ø±Ø¨</h3>
                <div className="field-grid">
                  <div className="field-item">
                    <b>Ø§Ù„Ø¨Ø±ÙŠØ¯</b>
                    <span>{fieldValue(email)}</span>
                  </div>
                  <div className="field-item">
                    <b>ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ù†Ø¶Ù…Ø§Ù…</b>
                    <span>{formatProfileDate(profile.created_at)}</span>
                  </div>
                  <div className="field-item">
                    <b>Ø§Ù„Ù…Ø¬Ø§Ù„</b>
                    <span>{fieldValue(profile.professional_track)}</span>
                  </div>
                  <div className="field-item">
                    <b>Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ø®Ø¨Ø±Ø©</b>
                    <span>{fieldValue(profile.experience_level)}</span>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <h3>Ù…Ù„Ø®Øµ Ø§Ù„Ø±Ø­Ù„Ø©</h3>
                <div className="profile-stats-grid">
                  <NeoMetricGauge
                    value={progressPercent}
                    max={100}
                    displayValue={`${progressPercent}%`}
                    label="نسبة الإنجاز"
                    status={progressPercent >= 100 ? "complete" : "progress"}
                    size="compact"
                  />
                  <NeoMetricGauge
                    value={data?.completedDays ?? completedDays}
                    max={totalDays}
                    displayValue={`${data?.completedDays ?? completedDays} / ${totalDays}`}
                    label="الأيام المكتملة"
                    status={(data?.completedDays ?? completedDays) >= totalDays ? "complete" : "progress"}
                    size="compact"
                  />
                  <NeoMetricGauge
                    value={1}
                    max={1}
                    progress={100}
                    displayValue={formatLearningHours(hoursCounted)}
                    label="وقت التعلم الحقيقي"
                    status="readiness"
                    size="compact"
                  />
                  <NeoMetricGauge
                    value={streak}
                    max={Math.max(1, streak)}
                    progress={streak > 0 ? 100 : 0}
                    displayValue={`${streak} أيام`}
                    label="سلسلة التعلم"
                    status={streak > 0 ? "complete" : "locked"}
                    size="compact"
                  />
                </div>
              </div>

              <div className="profile-card">
                <h3>Ø±Ø§Ø¯Ø§Ø± Ø§Ù„Ø¬Ø¯Ø§Ø±Ø§Øª</h3>
                <div className="radar-list">
                  {(data?.radar || []).map((item) => (
                    <div className="radar-row" key={item.label}>
                      <div className="radar-row-top">
                        <span>{item.label}</span>
                        <span>{item.score === null ? "Ù„Ù… ÙŠÙ‚Ø§Ø³ Ø¨Ø¹Ø¯" : `${item.score}%`}</span>
                      </div>
                      <NeoMetricGauge
                        value={item.score || 0}
                        max={100}
                        displayValue={item.score === null ? "لم يقاس بعد" : `${item.score}%`}
                        label="درجة الرادار"
                        status={(item.score || 0) >= 100 ? "complete" : "score"}
                        size="compact"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-card">
                <h3>Ø§Ù„Ø´Ø§Ø±Ø§Øª Ø§Ù„Ù…Ù‡Ù†ÙŠØ©</h3>
                <div className="badge-list">
                  {(data?.badges || []).length ? (
                    data.badges.map((item) => (
                      <div className="badge-row" key={item.badge_id}>
                        <div className="badge-row-top">
                          <span>{item.badges?.title || item.badge_id}</span>
                          <span>{item.badges?.icon || "ðŸ…"}</span>
                        </div>
                        <small>{item.badges?.description || "Ø´Ø§Ø±Ø© Ù…Ù‡Ù†ÙŠØ© Ø¶Ù…Ù† Ø§Ù„Ø±Ø­Ù„Ø©."}</small>
                        <small>{formatProfileDate(item.awarded_at)}</small>
                      </div>
                    ))
                  ) : (
                    <p>Ù„Ù… ØªØ­ØµÙ„ Ø¹Ù„Ù‰ Ø´Ø§Ø±Ø§Øª Ø¨Ø¹Ø¯. Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø±Ø­Ù„Ø© Ù„ØªØ¸Ù‡Ø± Ù‡Ù†Ø§.</p>
                  )}
                </div>
              </div>

              <div className="profile-card">
                <h3>Ø¥Ù†Ø¬Ø§Ø²Ø§Øª Ù…Ø¹Ø±ÙÙŠØ©</h3>
                <div className="achievement-list">
                  {(data?.achievements || []).map((item) => (
                    <div className="achievement-row" key={item.key}>
                      <div className="achievement-row-top">
                        <span>{item.title}</span>
                        <span>{item.status}</span>
                      </div>
                      <small>{item.value} / {item.target}</small>
                      <NeoMetricGauge
                        value={(item.value / item.target) * 100}
                        max={100}
                        displayValue={`${item.value} / ${item.target}`}
                        label="تقدم الإنجاز"
                        status={item.value >= item.target ? "complete" : "progress"}
                        size="compact"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-card">
                <h3>Ù…Ù„Ø§Ø­Ø¸Ø§ØªÙƒ Ø§Ù„Ù…Ù‡Ù†ÙŠØ© Ø§Ù„Ø£Ø®ÙŠØ±Ø©</h3>
                <div className="notes-list">
                  {(data?.recentNotes || []).length ? (
                    data.recentNotes.map((note) => (
                      <div className="note-row" key={note.id}>
                        <strong>{note.note_title || "Ù…Ù„Ø§Ø­Ø¸Ø© Ø¯Ø±Ø³"}</strong>
                        <small>{`Ø§Ù„Ø´Ù‡Ø± ${note.month_index} Â· Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ ${note.week_index} Â· Ø§Ù„ÙŠÙˆÙ… ${note.day_index}`}</small>
                        <small>{String(note.note || "").slice(0, 130)}{String(note.note || "").length > 130 ? "..." : ""}</small>
                      </div>
                    ))
                  ) : (
                    <p>Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ù…Ø­ÙÙˆØ¸Ø© Ø¨Ø¹Ø¯.</p>
                  )}
                </div>
              </div>

              <div className="profile-card">
                <h3>Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ø£Ø®ÙŠØ±Ø©</h3>
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
                    <p>Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø­Ø§Ù„ÙŠÙ‹Ø§.</p>
                  )}
                </div>
              </div>

              <div className="profile-card">
                <h3>ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù†</h3>
                <div className="field-grid">
                  <div className="field-item">
                    <b>Ø­Ø§Ù„Ø© Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©</b>
                    <span>{statusLabel(masteryStatus)}</span>
                  </div>
                  <div className="field-item">
                    <b>Ø±Ù‚Ù… Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©</b>
                    <span>{fieldValue(mastery?.certificate_code, "ÙŠØ¸Ù‡Ø± Ø¨Ø¹Ø¯ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©")}</span>
                  </div>
                  <div className="field-item">
                    <b>Ø±Ø§Ø¨Ø· Ø§Ù„ØªØ­Ù‚Ù‚</b>
                    <span>{mastery?.verification_enabled ? "Ù…ÙØ¹Ù‘Ù„" : "ØºÙŠØ± Ù…ÙØ¹Ù‘Ù„"}</span>
                  </div>
                  <div className="field-item">
                    <b>Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«</b>
                    <span>{formatProfileDate(mastery?.updated_at || mastery?.created_at)}</span>
                  </div>
                </div>
                <div className="quick-links">
                  <button type="button" onClick={() => navigate("mastery")}>Ù…Ø¹Ø§ÙŠÙ†Ø© Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©</button>
                  <button type="button" disabled>Ø±Ø§Ø¨Ø· ØªØ­Ù‚Ù‚ Ù„Ø§Ø­Ù‚Ù‹Ø§</button>
                </div>
              </div>

              <div className="profile-card">
                <h3>Ø¢Ø®Ø± Ø§Ù„Ù†Ø´Ø§Ø·</h3>
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
                    <p>Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù†Ø´Ø§Ø· Ù…Ø­ÙÙˆØ¸ Ø¨Ø¹Ø¯. Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø±Ø­Ù„Ø© Ù„ÙŠØ¸Ù‡Ø± Ø§Ù„Ø³Ø¬Ù„ Ù‡Ù†Ø§.</p>
                  )}
                </div>
              </div>

              <div className="profile-card wide">
                <h3>Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆØ§Ù„Ø®ØµÙˆØµÙŠØ©</h3>
                <div className="quick-links">
                  <button type="button" className="important" onClick={startEditInsideFullProfile}>
                    ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø§Ø³Ù… ÙˆØ§Ù„Ù‡Ø¯Ù
                  </button>
                  <button type="button" onClick={() => navigate("mastery")}>ÙˆØ«ÙŠÙ‚Ø© Ø§Ù„Ø¥ØªÙ‚Ø§Ù†</button>
                  <button type="button" onClick={onSignOut}>ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬</button>
                  <button type="button" disabled>Ø·Ù„Ø¨ Ø­Ø°Ù Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù„Ø§Ø­Ù‚Ù‹Ø§</button>
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



