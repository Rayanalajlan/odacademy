const THEME_KEY = "odacademy_theme_mode";
const DARK_CLASS = "od-theme-dark";
const LIGHT_CLASS = "od-theme-light";
const AUTO_THEME = "auto";

function safeWindow() {
  return typeof window !== "undefined" ? window : null;
}

export function getStoredTheme() {
  return getEffectiveTheme(getStoredThemePreference());
}

export function getStoredThemePreference() {
  const win = safeWindow();
  if (!win) return AUTO_THEME;

  try {
    const storedTheme = win.localStorage.getItem(THEME_KEY);
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === AUTO_THEME) {
      return storedTheme;
    }

    return AUTO_THEME;
  } catch {
    return AUTO_THEME;
  }
}

export function getTimeBasedTheme(date = new Date()) {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

export function getEffectiveTheme(preference = AUTO_THEME) {
  if (preference === "light" || preference === "dark") return preference;
  return getTimeBasedTheme();
}

export function applyTheme(theme = "dark") {
  const win = safeWindow();
  if (!win?.document?.body) return "dark";

  const normalized = theme === "dark" ? "dark" : "light";
  const { body, documentElement } = win.document;

  body.classList.toggle(DARK_CLASS, normalized === "dark");
  body.classList.toggle(LIGHT_CLASS, normalized !== "dark");
  documentElement.dataset.theme = normalized;
  documentElement.style.colorScheme = normalized;

  return normalized;
}

export function getThemeState(preference = getStoredThemePreference()) {
  const normalizedPreference =
    preference === "light" || preference === "dark" || preference === AUTO_THEME
      ? preference
      : AUTO_THEME;
  return {
    preference: normalizedPreference,
    theme: getEffectiveTheme(normalizedPreference)
  };
}

export function saveTheme(theme = "light") {
  const win = safeWindow();
  const normalized = applyTheme(theme);

  if (!win) return normalized;

  try {
    win.localStorage.setItem(THEME_KEY, normalized);
  } catch {
    // اختيار بصري فقط؛ لا نوقف الموقع إذا منع المتصفح التخزين.
  }

  return normalized;
}

export function saveThemePreference(preference = AUTO_THEME) {
  const win = safeWindow();
  const state = getThemeState(preference);
  applyTheme(state.theme);

  if (!win) return state;

  try {
    win.localStorage.setItem(THEME_KEY, state.preference);
  } catch {
    // اختيار بصري فقط؛ لا نوقف الموقع إذا منع المتصفح التخزين.
  }

  return state;
}

export function toggleTheme(currentTheme = "light") {
  return saveTheme(currentTheme === "dark" ? "light" : "dark");
}

export function cycleThemePreference(currentPreference = AUTO_THEME) {
  const nextPreference =
    currentPreference === AUTO_THEME
      ? "light"
      : currentPreference === "light"
        ? "dark"
        : AUTO_THEME;

  return saveThemePreference(nextPreference);
}

export function initializeTheme() {
  return applyTheme(getStoredTheme());
}

export function initializeThemeState() {
  const state = getThemeState();
  applyTheme(state.theme);
  return state;
}
