#!/usr/bin/env node

const fs = require("fs");
const file = "src/components/ThemeToggle.jsx";
const source = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
  process.exitCode = 1;
}

if (source.includes("--sun-bg: #ECCA2F") && source.includes("--sun-highlight: #FFF6B2")) {
  pass("تم ضبط لون الشمس إلى لون طبيعي");
} else {
  fail("لون الشمس الطبيعي غير موجود");
}

if (source.includes("toggleTheme(theme)") && source.includes("checked={isDark}")) {
  pass("منطق الزر ما زال سليمًا");
} else {
  fail("الربط مع منطق الثيم مفقود");
}

if (source.includes("theme-switch__sun-moon-container")) {
  pass("مكوّن الزر موجود");
} else {
  fail("مكوّن الزر غير موجود");
}

if (process.exitCode === 1) {
  console.log("\\nراجع الملف قبل النشر.");
} else {
  console.log("\\nمرحلة 52 جاهزة.");
}
