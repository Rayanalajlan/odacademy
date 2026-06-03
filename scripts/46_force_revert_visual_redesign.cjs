#!/usr/bin/env node

/**
 * Phase 46 - FORCE revert visual redesign remnants
 *
 * يرجع تصميم الموقع لما قبل Phase 43 / Phase 44 عبر إزالة كل آثار:
 * - ExperienceDesignSkin
 * - od-visual-lab-ready
 * - odacademy-phase44-visual-lab-skin
 * - lab design CSS injection
 *
 * لا يلمس:
 * - Supabase
 * - Auth logic
 * - API/RPC
 * - الشعار
 * - الوضع الداكن
 * - التقييمات
 * - الرادار
 * - التقدم
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const srcDir = path.join(root, "src");

const filesToDelete = [
  path.join(root, "src", "components", "ExperienceDesignSkin.jsx"),
  path.join(root, "src", "components", "ExperienceDesignSkin.tsx"),
  path.join(root, "src", "components", "VisualDesignSkin.jsx"),
  path.join(root, "src", "components", "VisualDesignSkin.tsx"),
  path.join(root, "scripts", "43_apply_visual_redesign.cjs"),
  path.join(root, "scripts", "43_verify_visual_redesign.cjs"),
  path.join(root, "scripts", "44_apply_visual_redesign_cascade_fix.cjs"),
  path.join(root, "scripts", "44_verify_visual_redesign_cascade_fix.cjs")
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".git", ".wrangler"].includes(entry.name)) return [];
      return walk(fullPath);
    }

    if (/\.(jsx|tsx|js|ts|css|html)$/.test(entry.name)) {
      return [fullPath];
    }

    return [];
  });
}

function cleanSource(source) {
  let next = source;

  // 1) إزالة imports لأي skin بصري.
  next = next.replace(
    /\n?import\s+ExperienceDesignSkin\s+from\s+["'][^"']*ExperienceDesignSkin["'];\s*/g,
    "\n"
  );

  next = next.replace(
    /\n?import\s+VisualDesignSkin\s+from\s+["'][^"']*VisualDesignSkin["'];\s*/g,
    "\n"
  );

  // 2) إزالة JSX tags.
  next = next.replace(/\n?\s*<ExperienceDesignSkin\s*\/>\s*/g, "\n");
  next = next.replace(/\n?\s*<VisualDesignSkin\s*\/>\s*/g, "\n");

  // 3) إزالة أي body class أو style id من phase44 لو تم لصقها يدويًا.
  next = next.replace(/od-visual-lab-ready/g, "");
  next = next.replace(/odacademy-phase44-visual-lab-skin/g, "");

  // 4) إزالة style blocks إن وُجدت داخل JSX/HTML وتم نسخها يدويًا.
  next = next.replace(
    /<style[^>]*id=["']?["']?[^>]*>\s*\/\*\s*Phase 4[34][\s\S]*?<\/style>/g,
    ""
  );

  next = next.replace(
    /<style[^>]*>\s*`\s*\/\*\s*Phase 4[34][\s\S]*?`\s*<\/style>/g,
    ""
  );

  // 5) إزالة أي نصوص CSS ضخمة تخص المختبر إذا التصقت داخل ملف.
  next = next.replace(
    /\/\*\s*Phase 4[34][\s\S]*?Design-only layer:[\s\S]*?\*\/[\s\S]*?@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\s*\}\s*`?\s*/g,
    ""
  );

  // 6) تنظيف فراغات زائدة بدون إعادة تنسيق عدوانية.
  next = next.replace(/\n{4,}/g, "\n\n\n");

  return next;
}

let changedFiles = 0;

for (const file of walk(srcDir)) {
  const before = fs.readFileSync(file, "utf8");
  const after = cleanSource(before);

  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changedFiles += 1;
    console.log(`✅ تم تنظيف: ${path.relative(root, file)}`);
  }
}

for (const file of filesToDelete) {
  if (fs.existsSync(file)) {
    fs.rmSync(file, { force: true });
    console.log(`✅ تم حذف: ${path.relative(root, file)}`);
  }
}

// 7) أضف ملف marker حتى تعرف أن السكربت اشتغل.
const marker = path.join(root, "scripts", ".phase46_visual_revert_done");
fs.writeFileSync(marker, new Date().toISOString() + "\n", "utf8");

console.log("\nتمت محاولة الرجوع القسري للتصميم السابق.");
console.log(`عدد الملفات التي تم تنظيفها: ${changedFiles}`);
console.log("الخطوة التالية:");
console.log("npm run build");
