#!/usr/bin/env node

const fs = require("fs");

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
  process.exitCode = 1;
}

const visitor = read("src/components/VisitorTestimonialsMarquee.jsx");
const skin = read("src/components/ExperienceDesignSkin.jsx");
const theme = read("src/components/ThemeToggle.jsx");
const service = read("src/lib/visitorTestimonialsService.js");
const auth = read("src/components/AuthGate.jsx");

const forbiddenVisitorText = [
  "قاعدة البيانات",
  "اعتمادها",
  "منشورة ومعتمدة",
  "لا يمكن نشر تقييم",
  "لا توجد تقييمات منشورة",
  "نشر التقييم",
  "شارك تقييمك"
];

const visitorTextFound = forbiddenVisitorText.filter((token) => visitor.includes(token) || auth.includes(token));
if (!visitorTextFound.length) {
  pass("لا توجد عبارات داخلية/تقنية ظاهرة في قسم التقييمات");
} else {
  fail(`وجدت عبارات غير مناسبة للزوار: ${visitorTextFound.join(", ")}`);
}

if (visitor.includes("return null") && !visitor.includes("<form") && !visitor.includes("submitVisitorTestimonial")) {
  pass("قسم التقييمات يختفي إذا لا توجد تقييمات ولا يحتوي نموذج نشر");
} else {
  fail("قسم التقييمات لا يخفي نفسه أو لا يزال يحتوي نموذج نشر");
}

const forbiddenColors = ["#d6a84f", "#36d3c5", "#11b981", "#10b981", "#f59e0b", "#fbbf24"];
const colorHits = forbiddenColors.filter((color) => skin.includes(color) || theme.includes(color) || visitor.includes(color));
if (!colorHits.length) {
  pass("تمت إزالة الذهبي/الأخضر/الفيروزي الصريح من ملفات التصميم الأساسية");
} else {
  fail(`ما زالت ألوان غير مرغوبة موجودة: ${colorHits.join(", ")}`);
}

if (!service.includes("export async function submitVisitorTestimonial")) {
  pass("خدمة التقييمات لا تحتوي public submit");
} else {
  fail("submitVisitorTestimonial ما زالت موجودة");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nمرحلة 49 جاهزة.");
}
