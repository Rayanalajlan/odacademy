#!/usr/bin/env node

const fs = require("fs");
const required = [
  "public/section-icons/home.png",
  "public/section-icons/portfolio.png",
  "public/section-icons/journey.png",
  "public/section-icons/tools.png",
  "public/section-icons/mastery.png",
  "public/section-icons/about.png",
  "src/lib/sectionIcons.js",
  "src/components/SectionIcon.jsx",
  "src/components/SectionIconGrid.jsx",
  "src/components/ThemeToggle.jsx"
];

function pass(message) { console.log(`✅ ${message}`); }
function fail(message) { console.log(`❌ ${message}`); process.exitCode = 1; }

for (const file of required) {
  fs.existsSync(file) ? pass(`${file} موجود`) : fail(`${file} غير موجود`);
}

const theme = fs.existsSync("src/components/ThemeToggle.jsx") ? fs.readFileSync("src/components/ThemeToggle.jsx", "utf8") : "";
if (theme.includes("--sun-bg: #ECCA2F") && theme.includes("#fff7a8")) {
  pass("الشمس في زر الوضع الداكن أصبحت بلون طبيعي");
} else {
  fail("لون الشمس الطبيعي غير موجود في ThemeToggle.jsx");
}

const app = fs.existsSync("src/App.jsx") ? fs.readFileSync("src/App.jsx", "utf8") : "";
if (!app || app.includes("SectionIcon")) {
  pass("App.jsx جاهز أو لم يتم فحصه");
} else {
  console.log("ℹ️ لم يظهر SectionIcon داخل App.jsx. شغّل: node scripts/51_apply_section_icons.cjs");
}

if (process.exitCode === 1) {
  console.log("\nراجع الأخطاء قبل النشر.");
} else {
  console.log("\nحزمة الأيقونات جاهزة.");
}
