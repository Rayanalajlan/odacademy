#!/usr/bin/env node

/**
 * Verify Phase 30 Final Fix
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
  process.exitCode = 1;
}

try {
  const pkg = readJson("package.json");

  if (pkg.packageManager === "bun@1.2.15") {
    pass("packageManager مضبوط على bun@1.2.15");
  } else {
    fail(`packageManager الحالي هو ${pkg.packageManager || "غير موجود"} وليس bun@1.2.15`);
  }

  if (!fs.existsSync(path.join(root, "package-lock.json"))) {
    pass("package-lock.json غير موجود، وهذا هو المطلوب حتى لا يستخدم Cloudflare npm clean-install");
  } else {
    fail("package-lock.json ما زال موجودًا. احذفه واعمل Commit للحذف.");
  }

  if (fs.existsSync(path.join(root, "wrangler.toml"))) {
    pass("wrangler.toml موجود");
  } else {
    fail("wrangler.toml غير موجود");
  }

  if (fs.existsSync(path.join(root, "vite.config.js"))) {
    pass("vite.config.js موجود");
  } else {
    fail("vite.config.js غير موجود");
  }

  if (process.exitCode === 1) {
    console.log("\nلا ترفع المشروع قبل إصلاح الأخطاء أعلاه.");
  } else {
    console.log("\nالإصلاح جاهز. ارفع التعديل عبر GitHub Desktop.");
  }
} catch (error) {
  console.error("❌ فشل الفحص:");
  console.error(error.message);
  process.exit(1);
}
