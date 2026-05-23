#!/usr/bin/env node
/**
 * Phase 19 - Local verification helper
 * ------------------------------------
 * يفحص الملفات المحلية فقط:
 * - package.json لا يحتوي latest.
 * - .gitignore يحتوي ملفات أسرار Cloudflare المحلية.
 * - public/_headers يحتوي Strict-Transport-Security.
 * - package-lock.json موجود.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function readIfExists(relativePath) {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf8") : null;
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function warn(message) {
  console.log(`⚠️  ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
}

function checkPackage() {
  const text = readIfExists("package.json");
  if (!text) {
    fail("package.json غير موجود.");
    return;
  }

  const pkg = JSON.parse(text);
  const sections = ["dependencies", "devDependencies", "optionalDependencies"];
  let latestCount = 0;
  let rangeCount = 0;

  for (const sectionName of sections) {
    const section = pkg[sectionName] || {};
    for (const [name, spec] of Object.entries(section)) {
      if (spec === "latest") {
        latestCount += 1;
        fail(`${sectionName}.${name} يستخدم latest.`);
      }

      if (typeof spec === "string" && /^[\^~]/.test(spec)) {
        rangeCount += 1;
        warn(`${sectionName}.${name} يستخدم range version: ${spec}`);
      }
    }
  }

  if (latestCount === 0) pass("لا يوجد latest في package.json.");
  if (rangeCount === 0) pass("لا توجد ^ أو ~ في direct dependencies.");

  if (readIfExists("package-lock.json")) {
    pass("package-lock.json موجود.");
  } else {
    warn("package-lock.json غير موجود. شغل npm install لإنشائه وتثبيته في Git.");
  }
}

function checkGitignore() {
  const text = readIfExists(".gitignore");
  if (!text) {
    fail(".gitignore غير موجود.");
    return;
  }

  const required = [".dev.vars", ".dev.vars.local", "*.local", "wrangler.toml.local", ".wrangler/"];

  for (const item of required) {
    if (text.includes(item)) pass(`.gitignore يحتوي ${item}`);
    else warn(`أضف ${item} إلى .gitignore`);
  }
}

function checkHeaders() {
  const text = readIfExists("public/_headers");
  if (!text) {
    warn("public/_headers غير موجود. إذا كنت تستخدم Cloudflare Pages/Assets أضف الملف أو تحقق من مكانه.");
    return;
  }

  if (/Strict-Transport-Security\s*:/i.test(text)) {
    pass("Strict-Transport-Security موجود في public/_headers.");
  } else {
    warn("Strict-Transport-Security غير موجود في public/_headers.");
  }
}

console.log("\nPhase 19 - Project hardening verification\n");
checkPackage();
checkGitignore();
checkHeaders();
console.log("\nانتهى الفحص المحلي. أكمل فحص RLS من Supabase SQL Editor عبر ملف 19_verify_user_progress_rls.sql.\n");
