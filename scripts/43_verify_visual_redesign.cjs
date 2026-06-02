#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(file) {
  const full = path.join(root, file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
  process.exitCode = 1;
}

const app = read("src/App.jsx");
const auth = read("src/components/AuthGate.jsx");
const skin = read("src/components/ExperienceDesignSkin.jsx");

if (app.includes("ExperienceDesignSkin") && auth.includes("ExperienceDesignSkin")) {
  pass("تم ربط ExperienceDesignSkin في App.jsx و AuthGate.jsx");
} else {
  fail("ExperienceDesignSkin غير مربوط في أحد الملفات");
}

if (skin.includes("Phase 43 - Visual redesign skin") && skin.includes(".public-hero") && skin.includes(".auth-card")) {
  pass("طبقة التصميم تحتوي إعادة تصميم صفحة الزوار والـ Hero ونموذج الدخول");
} else {
  fail("طبقة التصميم ناقصة أو غير موجودة");
}

if (!skin.includes("font-family:") && !skin.includes("@import")) {
  pass("لا يوجد تغيير لخطوط الموقع أو استيراد خطوط جديدة");
} else {
  fail("وجدت تغييرًا محتملًا للخطوط داخل طبقة التصميم");
}

if (!skin.includes("supabase") && !skin.includes(".from(") && !skin.includes("rpc(") && !skin.includes("fetch(")) {
  pass("لا توجد تغييرات منطقية أو Supabase/API داخل طبقة التصميم");
} else {
  fail("طبقة التصميم تحتوي إشارات منطقية/API غير مسموحة");
}

if (skin.includes("prefers-reduced-motion")) {
  pass("تم احترام prefers-reduced-motion");
} else {
  fail("لا يوجد دعم prefers-reduced-motion");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nمرحلة 43 جاهزة للنشر.");
}
