import { createClient } from "@supabase/supabase-js";

// مهم:
// Vite لا يقرأ متغيرات الواجهة إلا إذا بدأت بـ VITE_.
// لا تضع هنا Service Role Key أو أي مفتاح سري.
function readRuntimeConfigValue(name) {
  if (typeof window === "undefined") return "";

  return window.__ODACADEMY_CONFIG__?.[name] || "";
}

const rawSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  readRuntimeConfigValue("VITE_SUPABASE_URL") ||
  readRuntimeConfigValue("SUPABASE_URL") ||
  "";

const rawSupabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  readRuntimeConfigValue("VITE_SUPABASE_ANON_KEY") ||
  readRuntimeConfigValue("SUPABASE_ANON_KEY") ||
  "";

const supabaseUrl = rawSupabaseUrl.trim();
const supabaseAnonKey = rawSupabaseAnonKey.trim();

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

// هذا المتغير يخبر باقي التطبيق هل Supabase مضبوط أم لا.
// لو لم يكن مضبوطًا، سيعمل الموقع بوضع تجريبي محلي بدل أن ينهار.
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    isValidHttpUrl(supabaseUrl)
);

// هذا العميل هو نقطة الاتصال الوحيدة مع Supabase من الواجهة.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // يحفظ جلسة المستخدم في المتصفح حتى لا يضطر لتسجيل الدخول كل مرة.
        persistSession: true,

        // يجدد التوكن تلقائيًا قبل انتهائه.
        autoRefreshToken: true,

        // مهم لروابط تأكيد البريد واستعادة كلمة المرور.
        detectSessionInUrl: true,

        // اسم واضح للتخزين حتى لا يتعارض مع مشاريع أخرى.
        storageKey: "odacademy-auth-session"
      }
    })
  : null;

// رسائل تشخيصية تظهر فقط أثناء التطوير المحلي.
// لا تظهر في نسخة الإنتاج.
if (import.meta.env.DEV) {
  if (!supabaseUrl) {
    console.warn("VITE_SUPABASE_URL غير موجود في ملف البيئة.");
  }

  if (supabaseUrl && !isValidHttpUrl(supabaseUrl)) {
    console.warn("VITE_SUPABASE_URL ليس رابطًا صحيحًا.");
  }

  if (!supabaseAnonKey) {
    console.warn("VITE_SUPABASE_ANON_KEY غير موجود في ملف البيئة.");
  }

  if (!isSupabaseConfigured) {
    console.warn("Supabase غير مضبوط. سيعمل الموقع بوضع تجريبي محلي.");
  }
}