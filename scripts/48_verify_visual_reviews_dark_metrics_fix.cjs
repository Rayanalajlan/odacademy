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

const auth = read("src/components/AuthGate.jsx");
const visitor = read("src/components/VisitorTestimonialsMarquee.jsx");
const service = read("src/lib/visitorTestimonialsService.js");
const skin = read("src/components/ExperienceDesignSkin.jsx");
const theme = read("src/components/ThemeToggle.jsx");

if (auth.includes('Intl.NumberFormat("en-US")')) {
  pass("مؤشرات الرحلة تستخدم أرقام إنجليزية");
} else {
  fail("مؤشرات الرحلة لا تزال لا تستخدم en-US");
}

if (!visitor.includes("<form") && !visitor.includes("submitVisitorTestimonial") && !visitor.includes("نشر التقييم")) {
  pass("تمت إزالة نموذج نشر التقييم من صفحة الزوار");
} else {
  fail("نموذج نشر التقييم أو دالة الإرسال ما زالت موجودة");
}

if (!service.includes("export async function submitVisitorTestimonial")) {
  pass("خدمة التقييمات أصبحت قراءة/اشتراك فقط");
} else {
  fail("submitVisitorTestimonial ما زالت موجودة في الخدمة");
}

if (!skin.includes("STRATEGY") && !skin.includes("IMPACT") && skin.includes("م ن س ق ة")) {
  pass("أزيلت العبارة الإنجليزية من خلفية Hero واستبدلت بحروف منسقة");
} else {
  fail("ما زالت العبارة الإنجليزية أو لم تظهر حروف منسقة");
}

if (skin.includes("Phase 48 fixes") && theme.includes("Phase 48 dark-background hardening")) {
  pass("تمت إضافة إصلاحات التباين والوضع الداكن");
} else {
  fail("إصلاحات التباين/الوضع الداكن ناقصة");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nمرحلة 48 جاهزة.");
}
