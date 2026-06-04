import LegalLayout from "./LegalLayout";

const sectionStyle = {
  marginTop: "26px",
  paddingTop: "22px",
  borderTop: "1px solid #e0d8f5"
};

const h2Style = {
  margin: "0 0 12px",
  color: "#111827",
  fontSize: "1.25rem"
};

const pStyle = {
  color: "#5b4f78",
  lineHeight: 1.95,
  margin: "0 0 12px"
};

const listStyle = {
  color: "#5b4f78",
  lineHeight: 2,
  margin: "0",
  paddingRight: "22px"
};

export default function TermsOfUse() {
  return (
    <LegalLayout
      eyebrow="شروط الاستخدام"
      title="شروط استخدام منصة OD Academy"
      intro="هذه الشروط توضّح طبيعة المنصة وحدود استخدامها وما الذي ينبغي عليك معرفته قبل بدء الرحلة التعليمية."
    >
      <p style={pStyle}>
        آخر تحديث: مايو 2026. باستخدامك لمنصة OD Academy فإنك تقر بأنك قرأت
        هذه الشروط وفهمت طبيعة المنصة التعليمية وحدودها.
      </p>

      <section style={sectionStyle}>
        <h2 style={h2Style}>1) طبيعة المنصة</h2>
        <p style={pStyle}>
          OD Academy منصة تعليمية مجانية تهدف إلى نشر المعرفة المهنية في
          التطوير التنظيمي والموارد البشرية. المحتوى مصمم للتعلم والتطبيق
          الذاتي، وليس بديلًا عن الاستشارة المهنية المتخصصة في الحالات التي
          تتطلب رأيًا قانونيًا أو ماليًا أو تنظيميًا رسميًا.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>2) لا توجد شهادة أكاديمية رسمية</h2>
        <p style={pStyle}>
          قد توفر المنصة وثيقة إتقان أو إنجاز عند إكمال المتطلبات، لكنها ليست
          شهادة أكاديمية رسمية، وليست اعتمادًا جامعيًا أو مهنيًا صادرًا من جهة
          مانحة رسمية، ولا تمثل وعدًا وظيفيًا أو ترقية أو قبولًا في أي جهة.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>3) الحساب والمسؤولية</h2>
        <ul style={listStyle}>
          <li>أنت مسؤول عن صحة البيانات التي تدخلها في حسابك.</li>
          <li>لا تشارك كلمة المرور أو حسابك مع الآخرين.</li>
          <li>لا تستخدم المنصة لإدخال بيانات سرية أو معلومات تخص طرفًا ثالثًا دون حق.</li>
          <li>قد يتم تقييد الوصول عند إساءة الاستخدام أو محاولة تعطيل الخدمة.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>4) استخدام المحتوى</h2>
        <p style={pStyle}>
          المحتوى مخصص للتعلم الشخصي والمهني. لا يجوز نسخ المحتوى أو إعادة
          نشره أو بيعه أو تحويله إلى منتج تجاري دون إذن مكتوب. يمكنك استخدام
          الأفكار والمفاهيم في تطوير ممارستك المهنية مع الإشارة للمصدر عند
          الاقتباس المباشر.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>5) الموجه الذكي</h2>
        <p style={pStyle}>
          الموجه الذكي يقدم ردودًا تعليمية مساعدة وقد يخطئ أو يعطي إجابة غير
          مكتملة. لذلك يجب مراجعة المخرجات بعقل مهني وعدم اعتبارها قرارًا
          نهائيًا أو توصية ملزمة.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>6) التوفر والتحديثات</h2>
        <p style={pStyle}>
          قد تتوقف بعض الميزات مؤقتًا بسبب الصيانة أو حدود الخدمات التقنية أو
          التحديثات. كما يمكن تحديث المحتوى أو إعادة تنظيم الرحلة لتحسين
          التجربة التعليمية.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>7) الخصوصية</h2>
        <p style={pStyle}>
          استخدامك للمنصة يخضع أيضًا لسياسة الخصوصية، ويمكنك الاطلاع عليها من
          هنا:
        </p>
        <p style={pStyle}>
          <a href="/privacy" style={{ color: "#8b5cf6", fontWeight: 900 }}>
            سياسة الخصوصية
          </a>
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={h2Style}>8) تعديل الشروط</h2>
        <p style={pStyle}>
          قد يتم تحديث هذه الشروط عند إضافة خدمات أو ميزات جديدة. استمرارك في
          استخدام المنصة بعد نشر التحديث يعني قبولك للنسخة المحدثة.
        </p>
      </section>
    </LegalLayout>
  );
}
