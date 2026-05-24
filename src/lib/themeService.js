const THEME_KEY = "odacademy_theme_mode";
const DARK_CLASS = "od-theme-dark";
const LIGHT_CLASS = "od-theme-light";

function safeWindow() {
  return typeof window !== "undefined" ? window : null;
}

export function getStoredTheme() {
  const win = safeWindow();
  if (!win) return "light";

  try {
    return win.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme = "light") {
  const win = safeWindow();
  if (!win?.document?.body) return "light";

  const normalized = theme === "dark" ? "dark" : "light";
  const { body, documentElement } = win.document;

  body.classList.toggle(DARK_CLASS, normalized === "dark");
  body.classList.toggle(LIGHT_CLASS, normalized !== "dark");
  documentElement.dataset.theme = normalized;
  documentElement.style.colorScheme = normalized;

  return normalized;
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

export function toggleTheme(currentTheme = "light") {
  return saveTheme(currentTheme === "dark" ? "light" : "dark");
}

export function initializeTheme() {
  return applyTheme(getStoredTheme());
}
