import { isSupabaseConfigured, supabase } from "./supabaseClient";

export const ROI_TABLE = "learning_roi_inputs";

export const DEFAULT_ROI_INPUTS = {
  relation: "outside",
  level_id: "explorer",
  lens: "discover",
  outcome: "enter",
  experience_months: 0,
  current_salary: 0,
  application_level: 0,
  market_context: "balanced",
  use_actual_progress: true,
  scenario_days: 0,
  has_user_input: false
};

function normalizeInputs(row = {}) {
  const legacyExperienceMonths =
    row.experience_months ??
    (row.experience_years == null ? undefined : Number(row.experience_years) * 12);

  return {
    ...DEFAULT_ROI_INPUTS,
    relation: row.relation || DEFAULT_ROI_INPUTS.relation,
    level_id: row.level_id || row.levelId || DEFAULT_ROI_INPUTS.level_id,
    lens: row.lens || DEFAULT_ROI_INPUTS.lens,
    outcome: row.outcome || DEFAULT_ROI_INPUTS.outcome,
    experience_months: Math.max(0, Math.min(720, Number(legacyExperienceMonths || 0))),
    current_salary: Math.max(0, Number(row.current_salary ?? row.currentSalary ?? 0)),
    application_level: Math.max(0, Math.min(5, Number(row.application_level ?? row.applicationLevel ?? 0))),
    market_context: row.market_context || row.marketContext || DEFAULT_ROI_INPUTS.market_context,
    use_actual_progress: row.use_actual_progress ?? row.useActualProgress ?? true,
    scenario_days: Math.max(0, Number(row.scenario_days ?? row.scenarioDays ?? 0)),
    has_user_input: Boolean(row.has_user_input ?? row.hasUserInput ?? false)
  };
}

async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user || null;
}

export async function loadLearningRoiInputs() {
  const user = await getCurrentUser();

  if (!isSupabaseConfigured || !supabase) {
    return { user: null, inputs: normalizeInputs(), isLocalOnly: true };
  }

  if (!user?.id) {
    return { user: null, inputs: null, isLocalOnly: false };
  }

  const { data, error } = await supabase
    .from(ROI_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return { user, inputs: normalizeInputs(data), isLocalOnly: false };
  }

  const payload = {
    user_id: user.id,
    ...DEFAULT_ROI_INPUTS
  };

  const { data: created, error: createError } = await supabase
    .from(ROI_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (createError) throw createError;

  return { user, inputs: normalizeInputs(created), isLocalOnly: false };
}

export async function saveLearningRoiInputs(inputs) {
  const user = await getCurrentUser();
  if (!isSupabaseConfigured || !supabase || !user?.id) {
    return normalizeInputs(inputs);
  }

  const normalized = normalizeInputs(inputs);
  const payload = {
    user_id: user.id,
    relation: normalized.relation,
    level_id: normalized.level_id,
    lens: normalized.lens,
    outcome: normalized.outcome,
    experience_months: normalized.experience_months,
    current_salary: normalized.current_salary,
    application_level: normalized.application_level,
    market_context: normalized.market_context,
    use_actual_progress: normalized.use_actual_progress,
    scenario_days: normalized.scenario_days,
    has_user_input: normalized.has_user_input,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(ROI_TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw error;

  return normalizeInputs(data);
}
