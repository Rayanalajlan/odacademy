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

const radar = read("src/lib/radarAssessmentService.js");
const sql = read("supabase/40_full_supabase_policy_repair.sql");
const app = read("src/App.jsx");

if (radar.includes("شغّل ملف SQL الخاص بمرحلة 21")) {
  fail("رسالة مرحلة 21 القديمة ما زالت موجودة في radarAssessmentService");
} else {
  pass("رسالة الرادار القديمة أزيلت من الواجهة");
}

if (sql.includes("CREATE TABLE IF NOT EXISTS public.radar_assessments") && sql.includes("User inserts own radar assessments")) {
  pass("ملف SQL يحتوي إصلاح جدول وسياسات رادار الأداء");
} else {
  fail("إصلاح رادار الأداء غير مكتمل في SQL");
}

if (sql.includes("CREATE TABLE IF NOT EXISTS public.user_progress") && sql.includes("CREATE TABLE IF NOT EXISTS public.lesson_notes") && sql.includes("CREATE TABLE IF NOT EXISTS public.weekly_reflections")) {
  pass("ملف SQL يغطي جداول التعلم الأساسية");
} else {
  fail("ملف SQL لا يغطي كل جداول التعلم الأساسية");
}

if (sql.includes("verify_mastery_certificate") && sql.includes("get_public_platform_stats") && sql.includes("touch_user_activity")) {
  pass("الدوال العامة/RPC موجودة في ملف الإصلاح");
} else {
  fail("بعض RPC المطلوبة غير موجودة");
}

if (!app.includes("سيعمل الموقع مؤقتًا من التخزين المحلي")) {
  pass("App.jsx لا يحتوي رسالة التخزين المحلي القديمة");
} else {
  fail("App.jsx ما زال يحتوي رسالة التخزين المحلي القديمة");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nمرحلة 40 جاهزة. المهم تشغيل SQL في Supabase أولًا.");
}
