import { isSupabaseConfigured, supabase } from "./supabaseClient";

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

export async function requestEmailChange(newEmail) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase غير مفعّل.");
  }

  const email = normalizeEmail(newEmail);

  if (!email || !email.includes("@")) {
    throw new Error("اكتب بريدًا إلكترونيًا صحيحًا.");
  }

  const { data, error } = await supabase.auth.updateUser({ email });

  if (error) throw error;

  return data;
}

export async function updateAccountPassword({ password, confirmPassword }) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase غير مفعّل.");
  }

  const cleanPassword = String(password || "");
  const cleanConfirm = String(confirmPassword || "");

  if (cleanPassword.length < 8) {
    throw new Error("كلمة المرور يجب ألا تقل عن 8 أحرف.");
  }

  if (cleanPassword !== cleanConfirm) {
    throw new Error("كلمتا المرور غير متطابقتين.");
  }

  const { data, error } = await supabase.auth.updateUser({ password: cleanPassword });

  if (error) throw error;

  return data;
}
