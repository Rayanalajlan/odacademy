#!/usr/bin/env node
/**
 * Phase 19 - Pin direct dependencies to exact versions
 * ----------------------------------------------------
 * لماذا؟
 * وجود "latest" أو ^ أو ~ في package.json قد يجعل البناء يختلف بين جهاز وآخر
 * أو ينكسر عند صدور نسخة جديدة من مكتبة.
 *
 * ماذا يفعل هذا السكربت؟
 * - يقرأ package-lock.json.
 * - يأخذ الإصدار المثبت فعليًا لكل dependency مباشرة.
 * - يكتب الإصدار كرقم ثابت داخل package.json.
 * - ينشئ نسخة احتياطية قبل التعديل.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const packagePath = path.join(root, "package.json");
const lockPath = path.join(root, "package-lock.json");
const backupPath = path.join(root, "package.json.phase19-backup");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isRegistryDependency(spec) {
  if (!spec || typeof spec !== "string") return false;

  const blockedPrefixes = [
    "file:",
    "link:",
    "workspace:",
    "git:",
    "git+",
    "http:",
    "https:",
    "npm:"
  ];

  return !blockedPrefixes.some((prefix) => spec.startsWith(prefix));
}

function fallbackCleanVersion(spec) {
  if (!isRegistryDependency(spec)) return spec;

  // يحاول تنظيف الإصدارات البسيطة فقط مثل ^1.2.3 أو ~1.2.3 أو =1.2.3.
  const cleaned = spec.replace(/^[\^~=>=\s]+/, "").trim();
  return /^\d+\.\d+\.\d+([-.+][0-9A-Za-z.-]+)?$/.test(cleaned) ? cleaned : spec;
}

function findLockedVersion(lock, packageName) {
  const fromPackages = lock.packages?.[`node_modules/${packageName}`]?.version;
  if (fromPackages) return fromPackages;

  // دعم lockfileVersion قديم.
  const fromDependencies = lock.dependencies?.[packageName]?.version;
  if (fromDependencies) return fromDependencies;

  return null;
}

function pinSection(pkg, lock, sectionName, warnings, changes) {
  const section = pkg[sectionName];
  if (!section || typeof section !== "object") return;

  for (const [name, currentSpec] of Object.entries(section)) {
    if (!isRegistryDependency(currentSpec)) {
      warnings.push(`ترك ${sectionName}.${name} كما هو لأنه ليس dependency من npm registry: ${currentSpec}`);
      continue;
    }

    const lockedVersion = findLockedVersion(lock, name);

    if (lockedVersion) {
      if (currentSpec !== lockedVersion) {
        changes.push(`${sectionName}.${name}: ${currentSpec} -> ${lockedVersion}`);
        section[name] = lockedVersion;
      }
      continue;
    }

    const cleaned = fallbackCleanVersion(currentSpec);
    if (cleaned !== currentSpec) {
      changes.push(`${sectionName}.${name}: ${currentSpec} -> ${cleaned}`);
      section[name] = cleaned;
    } else {
      warnings.push(`لم أجد إصدارًا مثبتًا لـ ${sectionName}.${name}. أبقيته كما هو: ${currentSpec}`);
    }
  }
}

function main() {
  if (!fs.existsSync(packagePath)) {
    console.error("لم أجد package.json. شغل السكربت من جذر المشروع.");
    process.exit(1);
  }

  if (!fs.existsSync(lockPath)) {
    console.error("لم أجد package-lock.json. شغل npm install أولًا ثم أعد المحاولة.");
    process.exit(1);
  }

  const pkg = readJson(packagePath);
  const lock = readJson(lockPath);
  const warnings = [];
  const changes = [];

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(packagePath, backupPath);
  }

  pinSection(pkg, lock, "dependencies", warnings, changes);
  pinSection(pkg, lock, "devDependencies", warnings, changes);
  pinSection(pkg, lock, "optionalDependencies", warnings, changes);

  fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");

  console.log("\nPhase 19 - Pin dependencies completed.\n");

  if (changes.length) {
    console.log("التعديلات:");
    for (const change of changes) console.log(`- ${change}`);
  } else {
    console.log("لا توجد تعديلات؛ يبدو أن الإصدارات مثبتة بالفعل.");
  }

  if (warnings.length) {
    console.log("\nتنبيهات:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  console.log("\nتم إنشاء نسخة احتياطية: package.json.phase19-backup");
  console.log("الخطوة التالية: npm install ثم npm run build\n");
}

main();
