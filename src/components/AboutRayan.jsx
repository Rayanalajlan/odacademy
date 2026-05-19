export default function AboutRayan() {
  return (
    <section className="page-shell">
      <div className="section-hero">
        <span className="eyebrow">عن ريان</span>
        <h2>خلف الفكرة والمبادرة</h2>
        <p>زميل مهنة شغوف بهندسة المنظومات وتفكيك النظم المفتوحة من أمهات المراجع العالمية.</p>
      </div>

      <div className="about-grid">
        <div className="about-main">
          <span className="tag">زميل الرحلة والمهنة</span>
          <h3>ريان العجلان</h3>
          <strong>أخصائي عمليات الموارد البشرية وعلاقات الموظفين | باحث قانوني</strong>

          <p>
            أنطلق في الميدان المهني مدفوعًا بشغف يركز على هندسة المنظومات وتطوير بيئات العمل. أؤمن بأن نجاح المنظمات لا يبدأ
            من تبني الحلول المعلبة، بل من الفهم المنضبط لشروط إنتاج السلوك البشري داخل الأنظمة المفتوحة.
          </p>
          <p>
            من واقع الممارسة اليومية في العمليات وعلاقات الموظفين، وبالتكامل مع الدراسة القانونية، صُمم هذا المختبر المعرفي
            كمبادرة شخصية مستقلة لمشاركة الأطر والمراجع العالمية الحاكمة للتطوير التنظيمي مع زملاء الميدان.
          </p>

          <div className="philosophy-card">
            <span>فلسفتي المهنية</span>
            <p>
              "كثير مما نطلق عليه خللًا ثقافيًا في بيئات العمل هو نتيجة مباشرة لعيوب خفية في التصميم التنظيمي وتوزيع الصلاحيات؛
              لذا لا تسأل ما الحل، بل اسأل: ما الذي جعل هذا السلوك منطقيًا داخل هذا النظام؟"
            </p>
          </div>
        </div>

        <aside className="about-side">
          <div className="credential-card">
            <h4>الاعتمادات المهنية الدولية</h4>
            <div><strong>SHRM-SCP</strong><span>ممارس أول معتمد من جمعية HR الأمريكية</span></div>
            <div><strong>SPHRi</strong><span>محترف أول للموارد البشرية الدولية</span></div>
            <div><strong>CPTD</strong><span>محترف معتمد في تطوير المواهب</span></div>
            <div><strong>PMP</strong><span>محترف إدارة مشاريع</span></div>
          </div>

          <div className="contact-card">
            <h4>طلب الاستشارات وتبادل الفكر</h4>
            <p>لجلسات مراجعة النظم أو تبادل الرؤى المهنية والقانونية.</p>
            <a href="mailto:RayanSAlajlan@gmail.com?subject=طلب استشارة تنظيمية / تبادل فكر مهني" className="primary-button link-button">تواصل عبر البريد المهني 📧</a>
            <div className="social-row">
              <a href="https://www.linkedin.com/in/RayanSAlajlan" target="_blank" rel="noreferrer">LinkedIn 🔗</a>
              <a href="https://twitter.com/RayanSAlajlan" target="_blank" rel="noreferrer">X / Twitter 𝕏</a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
