const cards = [
  { title: "رحلتك التعليمية", text: "168 يومًا موزعة على 6 أشهر، من العقل التشخيصي إلى الاحتراف كممارس OD.", icon: "🧭", page: "journey" },
  { title: "رادار الأداء", text: "قياس فجوة الجدارات الاستشارية عبر مواقف مهنية حرجة.", icon: "📊", page: "radar" },
  { title: "المحاكاة", text: "مختبر قرار حي يختبر قراراتك في حالة شركة مسار اللوجستية.", icon: "🏢", page: "simulation" },
  { title: "الموجه الذكي", text: "مناقشة سقراطية مع موجه متخصص في التطوير التنظيمي.", icon: "🧠", page: "ai-mentor" },
  { title: "وثيقة الإتقان", text: "سجل ختامي قابل للطباعة والمشاركة بعد إنجاز المسار.", icon: "📜", page: "mastery" },
  { title: "عن ريان", text: "خلفية المبادرة وفلسفتها المهنية ومنطلقاتها العلمية.", icon: "RA", page: "about" }
];

export default function Home({ userName, setActivePage, completedDays, totalDays }) {
  const progress = Math.round((completedDays / totalDays) * 100);

  return (
    <section className="page-shell home-page">
      <div className="home-hero">
        <span className="welcome-chip">مرحبًا {userName || "زميل المهنة"}</span>
        <h1>إتقان هندسة التطوير التنظيمي <span>OD</span></h1>
        <p>
          منصة متكاملة تجمع التعلم العميق، القياس، المحاكاة، والتوجيه الذكي لبناء عقلية ممارس تطوير تنظيمي محترف.
        </p>
        <div className="hero-actions">
          <button className="primary-button large" onClick={() => setActivePage("journey")}>ابدأ رحلة التعلّم</button>
          <div className="hours-pill">
            <strong>{String(completedDays).padStart(3, "0")}</strong>
            <span>يوم مكتمل من {totalDays} · {progress}٪</span>
          </div>
        </div>
      </div>

      <div className="quote-card">
        <p>“التطوير التنظيمي ليس بحثًا عن الجاني، بل مراجعة لهندسة المنظمة: ما الذي جعل هذا السلوك منطقيًا داخل النظام؟”</p>
        <span>— ريان العجلان</span>
      </div>

      <div className="feature-grid">
        {cards.map((card) => (
          <button key={card.page} className="feature-card" onClick={() => setActivePage(card.page)}>
            <div className="feature-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
