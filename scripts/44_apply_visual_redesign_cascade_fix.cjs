#!/usr/bin/env node

/**
 * Phase 44 - Ensure visual lab skin is mounted
 * يضمن أن ExperienceDesignSkin مربوط في App.jsx و AuthGate.jsx.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const appPath = path.join(root, "src", "App.jsx");
const authPath = path.join(root, "src", "components", "AuthGate.jsx");

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`الملف غير موجود: ${path.relative(root, file)}`);
  return fs.readFileSync(file, "utf8");
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function addImport(source, importPath) {
  const line = `import ExperienceDesignSkin from "${importPath}";`;
  if (source.includes(line)) return source;

  const matches = [...source.matchAll(/^import .+;$/gm)];
  if (!matches.length) throw new Error("لم أجد import لإضافة ExperienceDesignSkin");
  const last = matches[matches.length - 1];
  return source.slice(0, last.index + last[0].length) + `\n${line}` + source.slice(last.index + last[0].length);
}

function addMount(source) {
  if (source.includes("<ExperienceDesignSkin />")) return source;

  if (source.includes("<BrandMeta />")) {
    return source.replace("<BrandMeta />", "<BrandMeta />\n      <ExperienceDesignSkin />");
  }

  // fallback داخل أول fragment return
  return source.replace("return (", "return (\n    <>\n      <ExperienceDesignSkin />").replace(/\);\s*$/, "    </>\n  );");
}

let app = read(appPath);
app = addImport(app, "./components/ExperienceDesignSkin");
app = addMount(app);
write(appPath, app);
console.log("✅ تم التأكد من ربط ExperienceDesignSkin داخل src/App.jsx");

let auth = read(authPath);
auth = addImport(auth, "./ExperienceDesignSkin");
auth = addMount(auth);
write(authPath, auth);
console.log("✅ تم التأكد من ربط ExperienceDesignSkin داخل src/components/AuthGate.jsx");
