import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationRead
} from "../lib/notificationsService";

function BellIcon() {
  return (
    <span className="notification-button-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 9.8a6 6 0 0 0-12 0c0 6-2.2 6.8-2.2 6.8h16.4S18 15.8 18 9.8" />
        <path d="M10 19.2a2.2 2.2 0 0 0 4 0" />
        <path d="M12 3.2V2" />
      </svg>
    </span>
  );
}

export default function NotificationsCenter({ setActivePage }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  async function load() {
    const data = await getNotifications(12);
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  const unreadCount = items.filter((item) => !item.read_at).length;

  async function handleItemClick(item) {
    if (!item.read_at) {
      await markNotificationRead(item.id);
      await load();
    }

    if (item.action_page && typeof setActivePage === "function") {
      setActivePage(item.action_page);
      setOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="notifications-center" dir="rtl">
      <style>{`
        .notifications-center {
          position: relative;
        }

        .notification-button {
          position: relative;
          border: 0;
          min-height: 42px;
          border-radius: 16px;
          padding: 0 14px;
          color: #463c63;
          background: #efe9fb;
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
          border: 1px solid rgba(139, 92, 246, .18);
        }

        .notification-button-icon {
          width: 19px;
          height: 19px;
          display: inline-grid;
          place-items: center;
          color: inherit;
        }

        .notification-button-icon svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .notification-count {
          position: absolute;
          top: -6px;
          left: -6px;
          min-width: 20px;
          height: 20px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #e11d48;
          color: #fff;
          font-size: 11px;
          font-weight: 950;
        }

        .notifications-popover {
          position: absolute;
          z-index: 60;
          top: calc(100% + 10px);
          left: 0;
          width: min(360px, 88vw);
          border-radius: 24px;
          padding: 12px;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.22);
          box-shadow: 0 24px 70px rgba(28, 17, 48,.18);
        }

        .notifications-popover h3 {
          margin: 0 0 10px;
          color: #18102e;
          font-size: 16px;
          line-height: 1.6;
          font-weight: 950;
        }

        .notification-list {
          display: grid;
          gap: 8px;
          max-height: 380px;
          overflow: auto;
        }

        .notification-item {
          border: 0;
          width: 100%;
          text-align: right;
          border-radius: 18px;
          padding: 12px;
          background: #f4f0fb;
          font-family: inherit;
          cursor: pointer;
        }

        .notification-item.unread {
          background: #efe9fb;
        }

        .notification-item strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 950;
        }

        .notification-item span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 780;
        }

        .notification-empty {
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 800;
          padding: 12px;
        }

        body.od-theme-dark .notification-button {
          color: #efe9ff;
          background: rgba(241, 236, 251, .10);
          border-color: rgba(196, 181, 253, .24);
        }

        body.od-theme-dark .notifications-popover {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, .16), transparent 36%),
            linear-gradient(145deg, rgba(24, 16, 46, .98), rgba(17, 9, 35, .98));
          border-color: rgba(196, 181, 253, .26);
          box-shadow: 0 24px 70px rgba(0, 0, 0, .34);
        }

        body.od-theme-dark .notifications-popover h3 {
          color: #f8f4ff;
        }

        body.od-theme-dark .notification-item {
          background: rgba(255, 255, 255, .07);
          border: 1px solid rgba(196, 181, 253, .16);
        }

        body.od-theme-dark .notification-item.unread {
          background: linear-gradient(135deg, rgba(139, 92, 246, .22), rgba(16, 185, 129, .10));
          border-color: rgba(196, 181, 253, .28);
        }

        body.od-theme-dark .notification-item strong {
          color: #f8f4ff;
        }

        body.od-theme-dark .notification-item span,
        body.od-theme-dark .notification-empty {
          color: #c9bdf0;
        }
      `}</style>

      <button
        type="button"
        className="notification-button"
        aria-label="فتح التنبيهات"
        onClick={() => setOpen((current) => !current)}
      >
        <BellIcon />
        التنبيهات
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notifications-popover">
          <h3>تنبيهاتك</h3>

          <div className="notification-list">
            {items.length ? (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`notification-item ${item.read_at ? "" : "unread"}`}
                  onClick={() => handleItemClick(item)}
                >
                  <strong>{item.title}</strong>
                  {item.body && <span>{item.body}</span>}
                </button>
              ))
            ) : (
              <div className="notification-empty">لا توجد تنبيهات حاليًا.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
