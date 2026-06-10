#!/usr/bin/env node

const fs = require("fs");

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
  process.exitCode = 1;
}

const auth = read("src/components/AuthGate.jsx");
const skin = read("src/components/ExperienceDesignSkin.jsx");
const legal = read("src/components/LegalLayout.jsx");
const theme = read("src/components/ThemeToggle.jsx");

const forbiddenVisibleSample = [
  "عينة مجانية من التجربة",
  "كل نقرة تفتح عينة مختلفة",
  "فكرة مركزة من درس فعلي.",
  "إطار تشخيصي مختصر.",
  "سؤال تطبيقي قبل الانتقال للحل.",
  "موقف تشخيصي مصغر.",
  "ثلاثة اختيارات غير مفضوحة.",
  "تصحيح فوري يوضح منطق الإجابة.",
  "اختر التصرف الأقرب مهنيًا"
];

const hits = forbiddenVisibleSample.filter((text) => auth.includes(text));
if (!hits.length) {
  pass("تمت إزالة عينة التجربة ونصوصها الظاهرة من صفحة الزوار");
} else {
  fail(`ما زالت نصوص العينة موجودة: ${hits.join(" | ")}`);
}

if (!auth.includes("activeSample.type &&")) {
  pass("تمت إزالة نافذة العينة التجريبية من AuthGate");
} else {
  fail("نافذة العينة التجريبية ما زالت موجودة");
}

if (skin.includes("Phase 53 - Visitor + Light Mode Contrast Fix")) {
  pass("تمت إضافة إصلاحات تباين الوضع الفاتح");
} else {
  fail("إصلاحات تباين الوضع الفاتح غير موجودة");
}

if (legal.includes("fbf7ff") && legal.includes("شعار منسقة") && legal.includes("munsaqah-approved-horizontal")) {
  pass("تم تحديث LegalLayout بخلفية فاتحة وشعار واضح");
} else {
  fail("LegalLayout غير محدّث بالشكل المطلوب");
}

if (theme.includes("--sun-bg: #ECCA2F") && theme.includes("toggleTheme(theme)")) {
  pass("زر الثيم ما زال بنسخة الشمس الطبيعية ومنطقه محفوظ");
} else {
  fail("ThemeToggle لا يحتوي إصلاح الشمس الطبيعية أو منطق الثيم");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nمرحلة 53 جاهزة.");
}
