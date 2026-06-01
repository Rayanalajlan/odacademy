#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const requiredFiles = [
  "public/brand/logo-horizontal.svg",
  "public/brand/logo.svg",
  "public/brand/icon.svg",
  "public/favicon.ico",
  "public/favicon-32.png",
  "public/favicon-16.png",
  "public/site-icon.svg",
  "public/apple-touch-icon.png",
  "public/site.webmanifest",
  "public/icons/app-icon-512.png",
  "src/components/SiteLogo.jsx",
  "src/components/BrandMeta.jsx",
  "src/lib/munsaqahBrand.js"
];

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    pass(`${file} موجود`);
  } else {
    fail(`${file} مفقود`);
  }
}

const app = fs.existsSync("src/App.jsx") ? fs.readFileSync("src/App.jsx", "utf8") : "";
const auth = fs.existsSync("src/components/AuthGate.jsx") ? fs.readFileSync("src/components/AuthGate.jsx", "utf8") : "";
const mobile = fs.existsSync("src/components/MobileNavigation.jsx") ? fs.readFileSync("src/components/MobileNavigation.jsx", "utf8") : "";
const manifest = fs.existsSync("public/site.webmanifest") ? fs.readFileSync("public/site.webmanifest", "utf8") : "";

if (app.includes("SiteLogo") && app.includes("BrandMeta")) {
  pass("App.jsx يستخدم شعار منسقة وmetadata");
} else {
  fail("App.jsx لا يستخدم SiteLogo/BrandMeta");
}

if (!app.includes('src={BRAND_LOGO_SRC}') && !app.includes("/rayan-logo.png")) {
  pass("الهيدر لم يعد يستخدم rayan-logo.png مباشرة");
} else {
  fail("ما زال App.jsx يستخدم شعارًا قديمًا مباشرة");
}

if (auth.includes("SiteLogo") && auth.includes("BrandMeta")) {
  pass("صفحة الزوار تستخدم شعار منسقة وmetadata");
} else {
  fail("AuthGate لا يستخدم SiteLogo/BrandMeta");
}

if (mobile.includes("SiteLogo")) {
  pass("قائمة الجوال تستخدم شعار منسقة");
} else {
  fail("MobileNavigation لا يستخدم SiteLogo");
}

if (manifest.includes("/icons/app-icon-512.png") && manifest.includes("/favicon-32.png")) {
  pass("manifest يشير إلى أيقونات منسقة الجديدة");
} else {
  fail("manifest لا يشير إلى الأيقونات الجديدة");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء أعلاه قبل النشر.");
} else {
  console.log("\nاستبدال شعار منسقة جاهز.");
}
