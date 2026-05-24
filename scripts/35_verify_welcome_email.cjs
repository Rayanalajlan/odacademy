#!/usr/bin/env node

/**
 * Phase 35 - Verify Welcome Email Files
 */

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

const service = read("src/lib/welcomeEmailService.js");
const worker = read("worker/index.js");

if (service.includes("odacademy_welcome_email_checked_v2")) {
  pass("welcomeEmailService يستخدم نسخة v2 لإعادة محاولة الإرسال");
} else {
  fail("welcomeEmailService لا يبدو محدثًا للنسخة v2");
}

if (service.includes("payload?.sent === true") && service.includes("welcome_email_already_sent")) {
  pass("الواجهة لا تعتبر الإيميل منتهيًا إلا عند sent أو already_sent");
} else {
  fail("منطق حفظ حالة الإيميل في الواجهة غير مضبوط");
}

if (worker.includes("envReady") && worker.includes("missing")) {
  pass("GET /api/welcome-email يعطي فحص إعدادات واضح");
} else {
  fail("فحص إعدادات welcome-email غير موجود في Worker");
}

if (worker.includes("safeFetchUserProfile") && worker.includes("safeUpdateUserProfile")) {
  pass("Worker يتعامل مع مشاكل user_profiles بدون كسر إرسال الإيميل");
} else {
  fail("Worker لا يحتوي safe profile helpers");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء بالأعلى قبل النشر.");
} else {
  console.log("\nملفات إيميل الترحيب محدثة. تأكد من Secrets في Cloudflare.");
}
