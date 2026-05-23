import { useMemo, useState } from "react";
import LegalLayout from "./LegalLayout";
import { submitPrivacyRequest } from "../lib/privacyRequestService";

const fieldStyle = {
  display: "grid",
  gap: "8px",
  marginBottom: "16px"
};

const labelStyle = {
  color: "#0f172a",
  fontWeight: 900
};

const inputStyle = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: "16px",
  padding: "13px 14px",
  fontSize: "1rem",
  outline: "none",
  background: "#ffffff",
  color: "#0f172a",
  boxSizing: "border-box"
};

const helperStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: "0.9rem",
  lineHeight: 1.7
};

const alertBase = {
  borderRadius: "18px",
  padding: "14px 16px",
  lineHeight: 1.8,
  marginBottom: "18px",
  fontWeight: 800
};

const initialForm = {
  requestType: "delete_data",
  requesterName: "",
  requesterEmail: "",
  preferredContact: "email",
  message: "",
  consent: false,
  company: ""
};

const requestTypeLabels = {
  delete_data: "حذف بياناتي",
  correct_data: "تصحيح بياناتي",
  export_data: "طلب نسخة من بياناتي",
  withdraw_consent: "سحب أو تعديل الموافقة",
  other: "طلب آخر متعلق بالخصوصية"
};

export default function DataDeletionRequest() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({
    type: "idle",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedRequestLabel = useMemo(
    () => requestTypeLabels[form.requestType] || "طلب خصوصية",
    [form.requestType]
  );

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function validate() {
    if (form.company) {
      return "تعذر إرسال الطلب.";
    }

    if (!form.requesterName.trim()) {
      return "اكتب الاسم.";
    }

    if (!form.requesterEmail.trim() || !form.requesterEmail.includes("@")) {
      return "اكتب بريدًا إلكترونيًا صحيحًا.";
    }

    if (form.message.trim().length < 10) {
      return "اكتب تفاصيل الطلب بما لا يقل عن 10 أحرف.";
    }

    if (!form.consent) {
      return "يجب تأكيد أن البيانات المدخلة صحيحة وأنك صاحب الطلب أو مخول بتقديمه.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      setStatus({
        type: "error",
        message: validationMessage
      });
      return;
    }

    setSubmitting(true);
    setStatus({
      type: "idle",
      message: ""
    });

    try {
      const result = await submitPrivacyRequest(form);

      setStatus({
        type: "success",
        message: `تم استلام طلبك بنجاح. رقم الطلب: ${result.id}. سنراجع الطلب ونتعامل معه حسب نوعه وإمكانية التحقق من الهوية.`
      });

      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "تعذر إرسال الطلب الآن."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LegalLayout
      eyebrow="طلب حذف أو تصحيح البيانات"
      title="أرسل طلبًا متعلقًا ببياناتك"
      intro="استخدم هذا النموذج لطلب حذف بياناتك، تصحيحها، الحصول على نسخة منها، أو إرسال طلب آخر متعلق بالخصوصية."
    >
      <div
        style={{
          background: "#eef2ff",
          border: "1px solid #c7d2fe",
          borderRadius: "20px",
          padding: "16px",
          color: "#312e81",
          lineHeight: 1.9,
          marginBottom: "22px"
        }}
      >
        <strong>تنبيه مهم:</strong> قد نطلب منك التحقق من هويتك قبل تنفيذ طلب
        مرتبط بحساب مسجل، حتى لا يتم حذف أو تعديل بيانات شخص آخر بالخطأ.
      </div>

      {status.type !== "idle" ? (
        <div
          role="alert"
          style={{
            ...alertBase,
            background: status.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: status.type === "success" ? "#065f46" : "#991b1b",
            border:
              status.type === "success"
                ? "1px solid #a7f3d0"
                : "1px solid #fecaca"
          }}
        >
          {status.message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit}>
        {/* حقل مخفي بسيط لتقليل الإرسال الآلي. لا تعبئه الواجهة الطبيعية. */}
        <input
          type="text"
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
          tabIndex="-1"
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            opacity: 0
          }}
        />

        <label style={fieldStyle}>
          <span style={labelStyle}>نوع الطلب</span>
          <select
            value={form.requestType}
            onChange={(event) => updateField("requestType", event.target.value)}
            style={inputStyle}
          >
            <option value="delete_data">حذف بياناتي</option>
            <option value="correct_data">تصحيح بياناتي</option>
            <option value="export_data">طلب نسخة من بياناتي</option>
            <option value="withdraw_consent">سحب أو تعديل الموافقة</option>
            <option value="other">طلب آخر متعلق بالخصوصية</option>
          </select>
          <p style={helperStyle}>الطلب المحدد حاليًا: {selectedRequestLabel}</p>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>الاسم</span>
          <input
            type="text"
            value={form.requesterName}
            onChange={(event) => updateField("requesterName", event.target.value)}
            style={inputStyle}
            placeholder="اكتب اسمك"
            autoComplete="name"
            required
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>البريد الإلكتروني</span>
          <input
            type="email"
            value={form.requesterEmail}
            onChange={(event) => updateField("requesterEmail", event.target.value)}
            style={inputStyle}
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
          <p style={helperStyle}>
            يفضل استخدام البريد المرتبط بحسابك في المنصة حتى نستطيع مطابقة الطلب.
          </p>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>طريقة التواصل المفضلة</span>
          <select
            value={form.preferredContact}
            onChange={(event) => updateField("preferredContact", event.target.value)}
            style={inputStyle}
          >
            <option value="email">البريد الإلكتروني</option>
            <option value="platform">داخل المنصة إذا كان الحساب مسجلًا</option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>تفاصيل الطلب</span>
          <textarea
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            style={{
              ...inputStyle,
              minHeight: "160px",
              resize: "vertical",
              lineHeight: 1.8
            }}
            placeholder="مثال: أطلب حذف حسابي وبيانات التقدم المرتبطة بهذا البريد..."
            required
          />
        </label>

        <label
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            color: "#334155",
            lineHeight: 1.8,
            marginBottom: "18px"
          }}
        >
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(event) => updateField("consent", event.target.checked)}
            style={{
              marginTop: "7px",
              width: "18px",
              height: "18px"
            }}
          />
          <span>
            أؤكد أن البيانات التي أدخلتها صحيحة، وأنني صاحب الطلب أو مخول
            بتقديمه، وأفهم أنه قد يلزم التحقق من هويتي قبل تنفيذ الطلب.
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            border: "none",
            borderRadius: "18px",
            padding: "15px 18px",
            background: submitting ? "#94a3b8" : "#4f46e5",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: "1rem",
            cursor: submitting ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "جارٍ إرسال الطلب..." : "إرسال الطلب"}
        </button>
      </form>
    </LegalLayout>
  );
}
