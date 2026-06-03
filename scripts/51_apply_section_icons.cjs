#!/usr/bin/env node

/**
 * Phase 51 - Apply section icons to navigation.
 *
 * يضيف أيقونات الأقسام إلى الهيدر وقائمة الجوال وقائمة الأدوات التعليمية إن وجدت.
 * السكربت محافظ: لا يغير Supabase ولا Auth ولا منطق الرحلة.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(file) {
  const full = path.join(root, file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

function write(file, text) {
  const full = path.join(root, file);
  fs.writeFileSync(full, text, "utf8");
}

function addImport(source, importLine) {
  if (source.includes(importLine)) return source;

  const imports = [...source.matchAll(/^import .+;$/gm)];
  if (!imports.length) return source;
  const last = imports[imports.length - 1];
  return source.slice(0, last.index + last[0].length) + `\n${importLine}` + source.slice(last.index + last[0].length);
}

function patchApp() {
  const file = "src/App.jsx";
  let source = read(file);
  if (!source) {
    console.log(`ℹ️ ${file} غير موجود، تم تجاوزه.`);
    return;
  }

  source = addImport(source, 'import SectionIcon from "./components/SectionIcon";');

  // الهيدر: زر الصفحة الذي يحتوي فقط page.label.
  source = source.replace(
    /<button([\s\S]*?className=\{activePage === page\.id \? "active" : ""\}[\s\S]*?onClick=\{\(\) => navigate\(page\.id\)\}[\s\S]*?)>\s*\{page\.label\}\s*<\/button>/g,
    `<button$1>\n              <SectionIcon pageId={page.id} size="nav" />\n              <span className="nav-label">{page.label}</span>\n            </button>`
  );

  write(file, source);
  console.log(`✅ تم تجهيز ${file}`);
}

function patchMobileNavigation() {
  const file = "src/components/MobileNavigation.jsx";
  let source = read(file);
  if (!source) {
    console.log(`ℹ️ ${file} غير موجود، تم تجاوزه.`);
    return;
  }

  source = addImport(source, 'import SectionIcon from "./SectionIcon";');

  source = source.replace(
    /<span>\{page\.label\}<\/span>\s*<small>\{String\(index \+ 1\)\.padStart\(2, "0"\)\}<\/small>/g,
    `<span className="mobile-nav-label-with-icon">\n          <SectionIcon pageId={page.id} size="mobile" />\n          <span className="nav-label">{page.label}</span>\n        </span>\n        <small>{String(index + 1).padStart(2, "0")}</small>`
  );

  source = source.replace(
    /<strong>\{tool\.label\}<\/strong>\s*<span>\{tool\.description\}<\/span>/g,
    `<span className="mobile-tool-label-with-icon">\n                <SectionIcon pageId={tool.id} size="menu" />\n                <strong>{tool.label}</strong>\n              </span>\n              <span>{tool.description}</span>`
  );

  write(file, source);
  console.log(`✅ تم تجهيز ${file}`);
}

function patchEducationalToolsMenu() {
  const file = "src/components/EducationalToolsMenu.jsx";
  let source = read(file);
  if (!source) {
    console.log(`ℹ️ ${file} غير موجود، تم تجاوزه.`);
    return;
  }

  source = addImport(source, 'import SectionIcon from "./SectionIcon";');

  source = source.replace(
    />\s*الأدوات التعليمية\s*<\/button>/,
    `>\n        <SectionIcon pageId="tools" size="nav" />\n        <span className="nav-label">الأدوات التعليمية</span>\n      </button>`
  );

  source = source.replace(
    /<strong>\{page\.label\}<\/strong>\s*<span>\{page\.description\}<\/span>/g,
    `<span className="educational-tool-option__title">\n                <SectionIcon pageId={page.id} size="menu" />\n                <strong>{page.label}</strong>\n              </span>\n              <span>{page.description}</span>`
  );

  write(file, source);
  console.log(`✅ تم تجهيز ${file}`);
}

patchApp();
patchMobileNavigation();
patchEducationalToolsMenu();

console.log("\nتم تطبيق أيقونات الأقسام. شغّل الآن: npm run build");
