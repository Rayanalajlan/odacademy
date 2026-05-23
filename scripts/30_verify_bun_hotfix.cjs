#!/usr/bin/env node

/**
 * Phase 30 Hotfix - Bun install stability verification
 *
 * هذا الفحص يتأكد أن Cloudflare سيعود لاستخدام Bun بدل npm clean-install،
 * مع بقاء package-lock.json داخل المستودع كـ lockfile.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`الملف غير موجود: ${relativePath}`);
  }

  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
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
    pass("packageManager مضبوط على bun@1.2.15 حتى يستخدم Cloudflare bun install");
  } else {
    fail("packageManager يجب أن يكون bun@1.2.15 في هذا الإصلاح.");
  }

  if (fs.existsSync(path.join(root, "package-lock.json"))) {
    pass("package-lock.json موجود داخل المستودع");
  } else {
    fail("package-lock.json غير موجود. أبقه داخل المستودع حتى لا تظهر ملاحظة lockfile مرة أخرى.");
  }

  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {})
  };

  const floating = Object.entries(allDeps).filter(([, version]) => {
    return (
      typeof version === "string" &&
      (version === "latest" || version.startsWith("^") || version.startsWith("~"))
    );
  });

  if (floating.length === 0) {
    pass("كل إصدارات الحزم مثبتة");
  } else {
    fail(`توجد إصدارات غير مثبتة: ${floating.map(([name]) => name).join(", ")}`);
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
    console.log("\nراجع الأخطاء بالأعلى قبل النشر.");
  } else {
    console.log("\nإصلاح مرحلة 30 جاهز. المفترض أن يرجع Cloudflare إلى bun install بدل npm clean-install.");
  }
} catch (error) {
  console.error("❌ فشل فحص إصلاح مرحلة 30:");
  console.error(error.message);
  process.exit(1);
}
