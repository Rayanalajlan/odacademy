#!/usr/bin/env node

/**
 * Verify Phase 46 force revert.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcDir = path.join(root, "src");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".git", ".wrangler"].includes(entry.name)) return [];
      return walk(full);
    }

    if (/\.(jsx|tsx|js|ts|css|html)$/.test(entry.name)) {
      return [full];
    }

    return [];
  });
}

const forbidden = [
  "ExperienceDesignSkin",
  "VisualDesignSkin",
  "od-visual-lab-ready",
  "odacademy-phase44-visual-lab-skin",
  "Phase 43 - Visual redesign",
  "Phase 44",
  "Visual redesign skin",
  "labNodeDrift",
  "labMetricPulse"
];

let bad = [];

for (const file of walk(srcDir)) {
  const text = fs.readFileSync(file, "utf8");

  for (const token of forbidden) {
    if (text.includes(token)) {
      bad.push(`${path.relative(root, file)} يحتوي: ${token}`);
    }
  }
}

const skinFiles = [
  "src/components/ExperienceDesignSkin.jsx",
  "src/components/ExperienceDesignSkin.tsx",
  "src/components/VisualDesignSkin.jsx",
  "src/components/VisualDesignSkin.tsx"
].filter((file) => fs.existsSync(path.join(root, file)));

if (skinFiles.length) {
  bad.push(`ملفات skin ما زالت موجودة: ${skinFiles.join(", ")}`);
}

if (bad.length) {
  console.log("❌ ما زالت توجد آثار لإعادة التصميم:");
  bad.forEach((item) => console.log(`- ${item}`));
  process.exit(1);
}

console.log("✅ لا توجد آثار ظاهرة لـ Phase 43 / Phase 44 داخل src");
console.log("✅ التصميم يفترض أنه رجع لما قبل طبقة إعادة التصميم البصري");
