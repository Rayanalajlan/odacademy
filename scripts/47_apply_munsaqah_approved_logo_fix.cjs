#!/usr/bin/env node

/**
 * Phase 47 - apply approved Munsaqah logo fix
 *
 * مهمته فقط التحقق من وجود ملفات الشعار الجديدة، وتنظيف آثار نظام الشعار القديم
 * إذا كان قد بقي داخل CSS أو JSX.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const required = [
  "public/brand/munsaqah-approved-horizontal.png",
  "public/brand/munsaqah-approved-vertical.png",
  "public/brand/munsaqah-approved-icon.png",
  "public/favicon.ico",
  "src/components/SiteLogo.jsx",
  "src/lib/munsaqahBrand.js"
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`❌ الملف غير موجود: ${file}`);
    process.exit(1);
  }
}

const srcDir = path.join(root, "src");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(js|jsx|ts|tsx|css)$/.test(entry.name) ? [full] : [];
  });
}

let touched = 0;

for (const file of walk(srcDir)) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;

  // إزالة أي filter قد يغيّر لون الشعار فقط إذا كان قريبًا من munsaqah/logo.
  after = after.replace(/(munsaqah[^`{};]*?filter\s*:\s*[^;]+;)/gi, "");
  after = after.replace(/(logo[^`{};]*?filter\s*:\s*[^;]+;)/gi, "");

  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    touched += 1;
    console.log(`✅ تنظيف لون شعار: ${path.relative(root, file)}`);
  }
}

console.log(`✅ ملفات الشعار المعتمدة موجودة. ملفات تم تنظيفها: ${touched}`);
console.log("شغّل الآن: npm run build");
