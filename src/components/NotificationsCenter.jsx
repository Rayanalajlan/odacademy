import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationRead
} from "../lib/notificationsService";

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
          color: #334155;
          background: #f1f5f9;
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
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
          border: 1px solid rgba(148,163,184,.22);
          box-shadow: 0 24px 70px rgba(15,23,42,.18);
        }

        .notifications-popover h3 {
          margin: 0 0 10px;
          color: #0f172a;
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
          background: #f8fafc;
          font-family: inherit;
          cursor: pointer;
        }

        .notification-item.unread {
          background: #eef2ff;
        }

        .notification-item strong {
          display: block;
          color: #0f172a;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 950;
        }

        .notification-item span {
          display: block;
          color: #64748b;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 780;
        }

        .notification-empty {
          color: #64748b;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 800;
          padding: 12px;
        }
      `}</style>

      <button type="button" className="notification-button" onClick={() => setOpen((current) => !current)}>
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
