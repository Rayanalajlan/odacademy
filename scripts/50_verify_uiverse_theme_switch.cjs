#!/usr/bin/env node

const fs = require("fs");

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
  process.exitCode = 1;
}

const file = "src/components/ThemeToggle.jsx";
const source = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";

if (source.includes("theme-switch__container") && source.includes("theme-switch__sun-moon-container")) {
  pass("تم تركيب زر Uiverse-style theme switch");
} else {
  fail("زر Uiverse-style غير موجود");
}

if (source.includes("checked={isDark}") && source.includes("toggleTheme(theme)")) {
  pass("الزر مربوط بمنطق الوضع الداكن الحالي");
} else {
  fail("الزر غير مربوط بمنطق الوضع الداكن");
}

if (source.includes("prefers-reduced-motion")) {
  pass("يدعم تقليل الحركة");
} else {
  fail("لا يدعم prefers-reduced-motion");
}

if (source.includes("aria-label") && source.includes("title=")) {
  pass("يحتوي accessibility labels");
} else {
  fail("ينقصه aria/title");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nمرحلة 50 جاهزة.");
}
