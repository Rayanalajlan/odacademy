const ARABIC_INDIC_DIGITS = /[\u0660-\u0669]/g;
const EASTERN_ARABIC_INDIC_DIGITS = /[\u06f0-\u06f9]/g;

export function normalizeDigits(value) {
  return String(value ?? "")
    .replace(ARABIC_INDIC_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(EASTERN_ARABIC_INDIC_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x06f0));
}

export function toEnglishNumber(value, fallback = 0) {
  const normalized = normalizeDigits(value).replace(/[^\d.-]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : fallback;
}

export function toEnglishInteger(value, fallback = 0) {
  return Math.trunc(toEnglishNumber(value, fallback));
}

export function formatEnglishNumber(value, options = {}) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    ...options
  }).format(number);
}

export function formatEnglishCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0
  }).format(Math.max(0, Math.round(Number(value || 0))));
}
