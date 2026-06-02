#!/usr/bin/env node

/**
 * Phase 43 - Apply visual redesign skin safely
 *
 * يضيف طبقة تصميم فقط إلى App.jsx و AuthGate.jsx بدون استبدال الملفات كاملة.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const appPath = path.join(root, "src", "App.jsx");
const authPath = path.join(root, "src", "components", "AuthGate.jsx");

function ensureFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`الملف غير موجود: ${path.relative(root, filePath)}`);
  }
}

function addImport(source, relativePath) {
  const importLine = `import ExperienceDesignSkin from "${relativePath}";`;

  if (source.includes(importLine)) {
    return source;
  }

  const brandMetaImport = source.match(/import BrandMeta from ["'][^"']+["'];/);

  if (brandMetaImport) {
    return source.replace(
      brandMetaImport[0],
      `${brandMetaImport[0]}\n${importLine}`
    );
  }

  const lastImport = [...source.matchAll(/^import .+;$/gm)].pop();

  if (!lastImport) {
    throw new Error("لم أجد imports لإضافة ExperienceDesignSkin.");
  }

  return source.slice(0, lastImport.index + lastImport[0].length)
    + `\n${importLine}`
    + source.slice(lastImport.index + lastImport[0].length);
}

function addSkinAfterBrandMeta(source) {
  if (source.includes("<ExperienceDesignSkin />")) {
    return source;
  }

  const brandMetaTag = "<BrandMeta />";

  if (!source.includes(brandMetaTag)) {
    throw new Error("لم أجد <BrandMeta /> لإدراج ExperienceDesignSkin بعدها.");
  }

  return source.replaceAll(
    brandMetaTag,
    `${brandMetaTag}\n      <ExperienceDesignSkin />`
  );
}

function patchFile(filePath, importPath) {
  ensureFile(filePath);

  let source = fs.readFileSync(filePath, "utf8");
  source = addImport(source, importPath);
  source = addSkinAfterBrandMeta(source);

  fs.writeFileSync(filePath, source, "utf8");
  console.log(`✅ تم تعديل ${path.relative(root, filePath)}`);
}

patchFile(appPath, "./components/ExperienceDesignSkin");
patchFile(authPath, "./ExperienceDesignSkin");

console.log("\nتم تطبيق طبقة إعادة التصميم بصريًا فقط.");
console.log("شغّل الآن: npm run build");
