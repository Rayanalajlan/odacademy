#!/usr/bin/env node

/**
 * Phase 30 - Build stability verification
 *
 * يفحص أن المشروع يستخدم npm lockfile وأن الإصدارات مثبتة.
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
  const lock = readJson("package-lock.json");

  if (pkg.packageManager && pkg.packageManager.startsWith("npm@")) {
    pass(`packageManager مضبوط على ${pkg.packageManager}`);
  } else {
    fail("packageManager يجب أن يكون npm@10.9.2 أو إصدار npm واضح.");
  }

  if (lock.lockfileVersion >= 3) {
    pass(`package-lock.json موجود ونسخته ${lock.lockfileVersion}`);
  } else {
    fail("package-lock.json موجود لكن نسخته قديمة أو غير متوقعة.");
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
    pass("كل إصدارات dependencies و devDependencies مثبتة بدون latest أو ^ أو ~");
  } else {
    fail(`توجد إصدارات غير مثبتة: ${floating.map(([name]) => name).join(", ")}`);
  }

  const rootPackage = lock.packages?.[""];
  if (rootPackage?.dependencies && Object.keys(rootPackage.dependencies).length) {
    pass("package-lock.json يحتوي dependencies الأساسية للمشروع");
  } else {
    fail("package-lock.json لا يحتوي dependencies الأساسية.");
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
    console.log("\nكل شيء أساسي في مرحلة 30 مضبوط.");
  }
} catch (error) {
  console.error("❌ فشل فحص مرحلة 30:");
  console.error(error.message);
  process.exit(1);
}
