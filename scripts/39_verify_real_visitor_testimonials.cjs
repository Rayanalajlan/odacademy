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

const app = read("src/App.jsx");
const auth = read("src/components/AuthGate.jsx");
const service = read("src/lib/visitorTestimonialsService.js");
const visitor = read("src/components/VisitorTestimonialsMarquee.jsx");

if (!app.includes("TestimonialsMarquee")) {
  pass("أزيل جدار التقييمات من صفحة المتدرب الداخلية");
} else {
  fail("ما زال TestimonialsMarquee مربوطًا داخل App.jsx");
}

if (auth.includes("VisitorTestimonialsMarquee")) {
  pass("جدار التقييمات الحقيقي مربوط في صفحة الزوار AuthGate");
} else {
  fail("VisitorTestimonialsMarquee غير مربوط في AuthGate");
}

if (service.includes("visitor_testimonials") && service.includes("listPublishedVisitorTestimonials")) {
  pass("خدمة التقييمات تقرأ من Supabase مباشرة");
} else {
  fail("خدمة التقييمات غير مكتملة");
}

if (!visitor.includes("const REVIEWS") && visitor.includes("listPublishedVisitorTestimonials")) {
  pass("لا توجد تقييمات وهمية hardcoded داخل المكون");
} else {
  fail("يبدو أن هناك تقييمات ثابتة أو لا يتم الجلب من Supabase");
}

if (visitor.includes("prefers-reduced-motion") && visitor.includes("vtScrollUp") && visitor.includes("vtScrollDown")) {
  pass("الحركة اللانهائية واحترام تقليل الحركة موجودان");
} else {
  fail("حركة التقييمات ناقصة");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nمرحلة 39 جاهزة.");
}
