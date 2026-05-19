import { useState } from "react";

export default function AboutRayan() {
  return (
    <section className="page-shell">
      {/* لفتة بر وفاء إنسانية في صدر الصفحة لوالديك الغاليين */}
      <div className="blessing-banner" style={{ textAlign: 'center', backgroundColor: 'var(--surface-subtle)', padding: '15px', borderRadius: '8px', marginBottom: '40px', border: '1px dashed var(--accent)' }}>
        <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: '500' }}>
          ✨ عزيزي الزائر، فضلاً وليس أمراً.. قُبيل إبحارك في المختبر، أسألك أن تهبَ والديّ الغاليين، وللمسلمين والمسلمات والأحياء منهم والأموات، دعوةً صادقة بظهر الغيب بالرحمة والمغفرة والعفو والمثوبة.
        </p>
      </div>

      <div className="section-hero">
        <span className="eyebrow">المبادرة والفكرة</span>
        <h2>من خلف مختبر التطوير التنظيمي؟</h2>
        <p>رؤية استراتيجية تفكك النظم المؤسسية المعقدة، وتقود تحول المنظومات بالأطر والمعايير الدولية الحاكمة.</p>
      </div>

      {/* لوحة المؤشرات الإبداعية والإنجازات الرقمية */}
      <div className="metrics-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="metric-item-card" style={{ backgroundColor: 'var(--surface-card)', padding: '20px', borderRadius: '8px', borderLeft: '4px solid var(--accent)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '2.2rem', color: 'var(--accent)', fontWeight: '700' }}>+9 <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)' }}>سنوات</span></h4>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>قيادة رأس المال البشري</p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>في البيئات التحولية والمنشآت متعددة الفروع.</span>
        </div>

        <div className="metric-item-card" style={{ backgroundColor: 'var(--surface-card)', padding: '20px', borderRadius: '8px', borderLeft: '4px solid var(--accent)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '2.2rem', color: 'var(--accent)', fontWeight: '700' }}>+600 <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)' }}>ساعة</span></h4>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>نقل المعرفة وتأهيل الخبراء</p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ساعات تدريبية رصينة لتأهيل قادة المستقبل للمؤهلات الدولية.</span>
        </div>

        <div className="metric-item-card" style={{ backgroundColor: 'var(--surface-card)', padding: '20px', borderRadius: '8px', borderLeft: '4px solid var(--accent)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '2.2rem', color: 'var(--accent)', fontWeight: '700' }}>+300 <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)' }}>ممارس</span></h4>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>تطوير وتمكين الكفاءات</p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>تم قيادة جاهزيتهم المهنية واجتيازهم لأعقد أطر الكفاءة العالمية.</span>
        </div>

        <div className="metric-item-card" style={{ backgroundColor: 'var(--surface-card)', padding: '20px', borderRadius: '8px', borderLeft: '4px solid var(--accent)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '2.2rem', color: 'var(--accent)', fontWeight: '700' }}>98% <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)' }}>مؤشر</span></h4>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)' }}>كفاءة المخرجات الاستشارية</p>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>معدل الرضا ونقل الأثر التطبيقي لورش العمل وهندسة السياسات.</span>
        </div>
      </div>

      <div className="about-grid">
        <div className="about-main">
          <span className="tag">مؤسس المختبر المعرفي</span>
          <h3>ريان العجلان</h3>
          <strong>خبير ومستشار إدارة المنظومات وتطوير المنظمات</strong>

          <p>
            مسيرة قيادية وعملية ممتدة في هندسة الأطر الحاكمة للمنظمات، وتصميم استراتيجيات رأس المال البشري التي تخدم البنى المؤسسية المعقدة والمنشآت التحولية. يرتكز المنظور الاستشاري لدي على الفهم المنضبط لشروط إنتاج السلوك البشري، وهيكلة نظم الحوكمة والامتثال، والتصميم الهيكلي الفعّال داخل الأنظمة المفتوحة لتجاوز المعالجات التقليدية نحو حلول جذرية مستدامة.
          </p>

          <p>
            توليت تصميم وتنفيذ مبادرات استراتيجية شاملة شملت إعادة الهيكلة التنظيمية كاملة، وبناء مصفوفات الجدارة وبطاقات الأداء المتوازن ومؤشرات الأداء المستدامة (KPIs & OKRs)، وحوكمة التكاليف الرأسمالية الكلية للأيدي العاملة (TCOW)، وتأصيل الامتثال الكلي لأنظمة وتشريعات العمل ومواءمتها مع الأهداف الاستراتيجية العليا للمنظمات.
          </p>

          <p>
            بالتوازي مع العمل الاستشاري والتنفيذي، أنقل المعرفة التراكمية كمحاضر معتمد طوّر مئات الكفاءات المهنية لتأهيلهم للحصول على أعلى الشهادات المهنية والاعتمادات الدولية في إدارة الموارد البشرية وتطوير المواهب؛ ومن واقع هذا التكامل بين الممارسة الميدانية القيادية والدراسة المعمقة لعلوم الإدارة والحوكمة، يأتي هذا المختبر كمبادرة شخصية مستقلة لتفكيك الفجوات المؤسسية باحترافية.
          </p>

          <div className="philosophy-card">
            <span>الفلسفة التنظيمية</span>
            <p>
              "كثير مما نطلق عليه خللاً ثقافياً أو انخفاضاً في إنتاجية العنصر البشري، هو نتيجة مباشرة لعيوب خفية في التصميم التنظيمي وتوزيع الصلاحيات؛ لذا لا تسأل ما الحل، بل اسأل: ما الذي جعل هذا السلوك يبدو منطقياً داخل هذا النظام؟"
            </p>
          </div>
        </div>

        <aside className="about-side">
          <div className="credential-card">
            <h4>الاعتمادات الاستشارية والمهنية الدولية</h4>
            <div><strong>CIPD Level 7</strong><span>الزمالة العليا لإدارة الموارد البشرية - لندن</span></div>
            <div><strong>SHRM-SCP</strong><span>خبير أول معتمد من جمعية الموارد البشرية الأمريكية</span></div>
            <div><strong>SPHRi</strong><span>محترف أول للموارد البشرية الدولية - معهد HRCI</span></div>
            <div><strong>CPTD</strong><span>الشهادة الدولية الاحترافية لتطوير المواهب - منظمة ATD</span></div>
          </div>

          <div className="contact-card">
            <h4>طلب الاستشارات وتبادل الفكر</h4>
            <p>لتشخيص المنظومات، مراجعة وتصميم الأطر والسياسات المؤسسية، وحوكمة الامتثال والأداء.</p>
            <a href="mailto:rayansalajlan@gmail.com?subject=طلب استشارة تنظيمية / تبادل فكر مهني" className="primary-button link-button">تواصل عبر البريد المهني 📧</a>
            <div className="social-row">
              <a href="https://linkedin.com/in/rayanalajlan" target="_blank" rel="noreferrer">LinkedIn 🔗</a>
              <a href="https://x.com/Rayan_Alajlan" target="_blank" rel="noreferrer">X / Twitter 𝕏</a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}