import { supabase } from "./supabaseClient";

const REQUEST_TYPES = new Set([
  "delete_data",
  "correct_data",
  "export_data",
  "withdraw_consent",
  "other"
]);

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function isValidEmail(email) {
  return email.length >= 5 && email.length <= 254 && email.includes("@");
}

function buildFriendlyError(error) {
  if (!error) {
    return "حدث خطأ غير متوقع أثناء إرسال الطلب.";
  }

  if (error.code === "42501") {
    return "تعذر إرسال الطلب بسبب سياسة الأمان في Supabase. تأكد من تشغيل ملف SQL الخاص بمرحلة الخصوصية.";
  }

  if (error.code === "23514") {
    return "بعض الحقول لا تطابق الشروط المطلوبة. راجع الاسم والبريد ونص الطلب.";
  }

  return error.message || "تعذر إرسال الطلب الآن. حاول مرة أخرى لاحقًا.";
}

export async function submitPrivacyRequest(formValues) {
  if (!supabase) {
    throw new Error("Supabase غير مضبوط حاليًا، لذلك لا يمكن إرسال طلب الخصوصية.");
  }

  const requestType = normalizeText(formValues.requestType);
  const requesterName = normalizeText(formValues.requesterName);
  const requesterEmail = normalizeEmail(formValues.requesterEmail);
  const preferredContact = normalizeText(formValues.preferredContact || "email");
  const message = normalizeText(formValues.message);

  if (!REQUEST_TYPES.has(requestType)) {
    throw new Error("نوع الطلب غير صحيح.");
  }

  if (requesterName.length < 2) {
    throw new Error("اكتب الاسم بشكل أوضح.");
  }

  if (!isValidEmail(requesterEmail)) {
    throw new Error("اكتب بريدًا إلكترونيًا صحيحًا.");
  }

  if (message.length < 10) {
    throw new Error("اكتب تفاصيل الطلب بشكل أوضح.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const currentUser = sessionData?.session?.user || null;

  const payload = {
    // إذا كان المستخدم مسجلًا نربط الطلب بحسابه، وإذا كان زائرًا تبقى null.
    user_id: currentUser?.id || null,
    request_type: requestType,
    requester_name: requesterName,
    requester_email: requesterEmail,
    preferred_contact: preferredContact === "platform" ? "platform" : "email",
    message,
    status: "new",
    source_path:
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : null,
    user_agent:
      typeof navigator !== "undefined"
        ? navigator.userAgent
        : null
  };

  const { data, error } = await supabase
    .from("privacy_requests")
    .insert(payload)
    .select("id, request_type, status, created_at")
    .single();

  if (error) {
    console.error("Privacy request insert failed:", error);
    throw new Error(buildFriendlyError(error));
  }

  return data;
}
