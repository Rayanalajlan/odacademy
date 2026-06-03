#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(file) {
  const full = path.join(root, file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
  process.exitCode = 1;
}

const siteLogo = read("src/components/SiteLogo.jsx");
const brand = read("src/lib/munsaqahBrand.js");

[
  "public/brand/munsaqah-approved-horizontal.png",
  "public/brand/munsaqah-approved-vertical.png",
  "public/brand/munsaqah-approved-icon.png",
  "public/favicon.ico",
  "public/favicon-32.png",
  "public/favicon-16.png",
  "public/site.webmanifest",
  "public/icons/app-icon-512.png"
].forEach((file) => {
  exists(file) ? pass(`${file} موجود`) : fail(`${file} مفقود`);
});

if (brand.includes("munsaqah-approved-horizontal.png") && brand.includes("munsaqah-approved-vertical.png")) {
  pass("munsaqahBrand.js يستخدم أصول الشعار المعتمدة");
} else {
  fail("munsaqahBrand.js لا يستخدم الأصول المعتمدة");
}

if (!siteLogo.includes("munsaqah-logo__divider") && !siteLogo.includes("wordmarkAr") && !siteLogo.includes("wordmarkEn")) {
  pass("SiteLogo لم يعد يستخدم النظام المكسور split icon/divider/wordmarks");
} else {
  fail("SiteLogo ما زال يحتوي نظام الشعار القديم المكسور");
}

if (siteLogo.includes("icon is already on the RIGHT") || siteLogo.includes("horizontal asset")) {
  pass("SiteLogo يعتمد صورة أفقية واحدة بأيقونة يمين واسم يسار");
} else {
  fail("لم أجد تأكيد استخدام الصورة الأفقية الواحدة");
}

if (!/filter\s*:\s*(invert|hue-rotate|brightness|contrast)/i.test(siteLogo)) {
  pass("SiteLogo لا يغيّر لون الشعار عبر CSS filters");
} else {
  fail("SiteLogo يحتوي filter قد يغيّر لون الشعار");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nتصحيح الشعار جاهز.");
}
