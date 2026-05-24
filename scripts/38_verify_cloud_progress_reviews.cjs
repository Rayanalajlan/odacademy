#!/usr/bin/env node

const fs = require("fs");

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
  process.exitCode = 1;
}

const app = fs.readFileSync("src/App.jsx", "utf8");
const progress = fs.readFileSync("src/lib/progressService.js", "utf8");
const testimonials = fs.readFileSync("src/components/TestimonialsMarquee.jsx", "utf8");

if (app.includes("TestimonialsMarquee")) {
  pass("TestimonialsMarquee مربوط في الصفحة الرئيسية");
} else {
  fail("TestimonialsMarquee غير مربوط في App.jsx");
}

if (!app.includes("سيعمل الموقع مؤقتًا من التخزين المحلي")) {
  pass("رسالة fallback القديمة أزيلت من App.jsx");
} else {
  fail("رسالة fallback القديمة ما زالت موجودة");
}

if (progress.includes("withRetry") && progress.includes("upsertRemoteRows")) {
  pass("progressService يستخدم retry ويرفع النسخة المحلية إلى Supabase");
} else {
  fail("progressService لا يحتوي منطق retry/sync المطلوب");
}

if (testimonials.includes("prefers-reduced-motion") && testimonials.includes("tmScrollUp") && testimonials.includes("tmScrollDown")) {
  pass("جدار التقييمات يحتوي حركة لا نهائية مع احترام تقليل الحركة");
} else {
  fail("جدار التقييمات لا يحتوي الأنيميشن المطلوب كاملًا");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nمرحلة 38 جاهزة.");
}
