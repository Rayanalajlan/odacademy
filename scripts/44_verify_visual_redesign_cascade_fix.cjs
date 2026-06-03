#!/usr/bin/env node

const fs = require("fs");

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function pass(message) { console.log(`✅ ${message}`); }
function fail(message) { console.log(`❌ ${message}`); process.exitCode = 1; }

const skin = read("src/components/ExperienceDesignSkin.jsx");
const app = read("src/App.jsx");
const auth = read("src/components/AuthGate.jsx");

if (skin.includes("document.body.appendChild(style)")) {
  pass("ExperienceDesignSkin يحقن CSS في آخر body، وبالتالي يتغلب على style الداخلي القديم");
} else {
  fail("ExperienceDesignSkin لا يستخدم late CSS injection");
}

if (skin.includes("od-visual-lab-ready") && skin.includes("LAB_SKIN_STYLE_ID")) {
  pass("تمت إضافة marker class و style id للتحقق من التطبيق");
} else {
  fail("marker class أو style id غير موجود");
}

if (app.includes("ExperienceDesignSkin") && auth.includes("ExperienceDesignSkin")) {
  pass("ExperienceDesignSkin مربوط في App.jsx و AuthGate.jsx");
} else {
  fail("ExperienceDesignSkin غير مربوط في App/AuthGate");
}

if (!skin.includes("font-family:") && !skin.includes("@import")) {
  pass("لا يوجد تغيير للخطوط أو استيراد خطوط جديدة");
} else {
  fail("يوجد font-family أو @import داخل التصميم");
}

if (!skin.includes("supabase") && !skin.includes(".from(") && !skin.includes("rpc(") && !skin.includes("fetch(")) {
  pass("لا توجد تغييرات منطقية أو Supabase/API داخل طبقة التصميم");
} else {
  fail("طبقة التصميم تحتوي منطق/API غير مسموح");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nمرحلة 44 جاهزة. بعد النشر افتح DevTools وابحث عن style#odacademy-phase44-visual-lab-skin.");
}
