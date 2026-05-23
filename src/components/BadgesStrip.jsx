import { useEffect, useState } from "react";
import { getUserBadges, syncProgressBadge } from "../lib/badgesService";

export default function BadgesStrip({ completedDays = 0 }) {
  const [badges, setBadges] = useState([]);

  async function load() {
    await syncProgressBadge(completedDays);
    const data = await getUserBadges();
    setBadges(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedDays]);

  if (!badges.length) return null;

  return (
    <section className="badges-strip" dir="rtl">
      <style>{`
        .badges-strip {
          width: min(1180px, calc(100% - 28px));
          margin: 14px auto 0;
          border-radius: 26px;
          padding: 14px;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.12), transparent 34%),
            #ffffff;
          border: 1px solid rgba(148,163,184,.18);
          box-shadow: 0 16px 42px rgba(15,23,42,.055);
        }

        .badges-strip h3 {
          margin: 0 0 10px;
          color: #0f172a;
          font-size: 15px;
          line-height: 1.6;
          font-weight: 950;
        }

        .badges-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border-radius: 999px;
          padding: 8px 11px;
          background: #f8fafc;
          border: 1px solid rgba(148,163,184,.16);
          color: #334155;
          font-size: 12px;
          font-weight: 900;
        }

        .badge-pill b {
          color: #0f172a;
        }
      `}</style>

      <h3>شاراتك المهنية</h3>

      <div className="badges-list">
        {badges.map((item) => (
          <span className="badge-pill" key={item.badge_id}>
            <span>{item.badges?.icon || "🏅"}</span>
            <b>{item.badges?.title || item.badge_id}</b>
          </span>
        ))}
      </div>
    </section>
  );
}
