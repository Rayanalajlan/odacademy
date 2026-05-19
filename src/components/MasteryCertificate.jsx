import { COURSE_TOTALS } from "../data/courseContent";

export default function MasteryCertificate({ userName, completedDays }) {
  const hours = Math.max(0, completedDays * 4);
  const progress = Math.round((completedDays / COURSE_TOTALS.totalDays) * 100);

  function printCertificate() {
    window.print();
  }

  function shareOnLinkedIn() {
    const postText =
      "6 أشهر من الإبحار المعرفي في هندسة التطوير التنظيمي (OD) وتفكيك النظم المفتوحة. أتممت هذا المسار الذاتي الثري، وكل الشكر لريان العجلان على مبادرته في إتاحة هذا المختبر المعرفي.";
    const linkedinProfileUrl = "https://www.linkedin.com/in/RayanSAlajlan";
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(linkedinProfileUrl)}&text=${encodeURIComponent(postText)}`;
    window.open(shareUrl, "_blank", "width=700,height=620");
  }

  return (
    <section className="page-shell no-print">
      <div className="section-hero">
        <span className="eyebrow">وثيقة الإتقان</span>
        <h2>حصاد الأثر والتمكين</h2>
        <p>استخرج سجل رحلتك المعرفية الموثق بعد إنجازك لمسار هندسة التطوير التنظيمي.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><span>ساعات النحت المعرفي</span><strong>{String(hours).padStart(3, "0")} ساعة</strong><em>⏳</em></div>
        <div className="stat-card"><span>نسبة إتمام الرحلة</span><strong>{progress}%</strong><em>📈</em></div>
        <div className="stat-card"><span>نسبة سبر المراجع</span><strong>100%</strong><em>📜</em></div>
      </div>

      <div id="printable-certificate-frame" className="certificate-frame">
        <div className="certificate-inner">
          <div className="certificate-brand">
            <div className="brand-mark small">RA</div>
            <div><strong>OD Engineering LAB</strong><span>مختبر التطوير التنظيمي المستقل</span></div>
          </div>

          <h3>وثيقة تمكين وإنجاز معرفي</h3>
          <p className="muted">هنا يرتسم الأثر المهني.. يؤكد ريان العجلان بأن زميل الرحلة والمهنة:</p>
          <h2>{userName || "زميل المهنة"}</h2>
          <p>
            قد خاض بجدارة وتعمق شخصي كامل غمار المسار المعرفي لمدة 6 أشهر، متتبعًا الجذور العلمية في تفكيك النظم المفتوحة
            من أمهات مراجعها، ليتأهب بأدوات حية في هندسة التطوير التنظيمي.
          </p>

          <div className="certificate-footer">
            <div>
              <strong>المرجعيات العلمية للمسار</strong>
              <span>Cummings & Worley • Donald Anderson • Burke-Litwin • Senge</span>
            </div>
            <div className="signature">
              <strong>توقيع وإثبات الأثر</strong>
              <span>Rayan Alajlan</span>
              <small>SHRM-SCP • SPHRi • CPTD • PMP</small>
            </div>
          </div>
        </div>
      </div>

      <div className="button-row center">
        <button className="secondary-button" onClick={printCertificate}>طباعة السجل المعرفي 🖨️</button>
        <button className="linkedin-button" onClick={shareOnLinkedIn}>مشاركة الإنجاز على LinkedIn 🔗</button>
      </div>
    </section>
  );
}
