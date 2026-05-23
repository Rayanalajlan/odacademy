import { isSupabaseConfigured, supabase } from "./supabaseClient";

export async function updateAccountEmail(newEmail) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase غير مفعّل.");
  }

  const cleanEmail = String(newEmail || "").trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("اكتب بريدًا إلكترونيًا صحيحًا.");
  }

  const { data, error } = await supabase.auth.updateUser({
    email: cleanEmail
  });

  if (error) throw error;

  return data;
}

export async function updateAccountPassword(newPassword) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase غير مفعّل.");
  }

  const password = String(newPassword || "");

  if (password.length < 8) {
    throw new Error("كلمة المرور يجب ألا تقل عن 8 أحرف.");
  }

  const { data, error } = await supabase.auth.updateUser({
    password
  });

  if (error) throw error;

  return data;
}
