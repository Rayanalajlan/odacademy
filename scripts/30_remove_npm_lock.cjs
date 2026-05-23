#!/usr/bin/env node

/**
 * Phase 30 Final Fix
 *
 * يحذف package-lock.json لأن وجوده يجعل Cloudflare يستخدم:
 * npm clean-install --progress=false
 *
 * وهذا هو سبب فشل التثبيت الحالي.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();

const filesToRemove = [
  "package-lock.json",
  "npm-shrinkwrap.json"
];

for (const file of filesToRemove) {
  const fullPath = path.join(root, file);

  if (fs.existsSync(fullPath)) {
    fs.rmSync(fullPath, { force: true });
    console.log(`✅ تم حذف ${file}`);
  } else {
    console.log(`ℹ️ لا يوجد ${file}`);
  }
}

const pkgPath = path.join(root, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkg.packageManager = "bun@1.2.15";
pkg.engines = {
  ...(pkg.engines || {}),
  node: ">=22.16.0"
};

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");

console.log("✅ تم تثبيت packageManager على bun@1.2.15");
console.log("✅ الآن افتح GitHub Desktop واعمل Commit لحذف package-lock.json وتعديل package.json");
