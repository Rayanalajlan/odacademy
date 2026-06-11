import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const failures = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`الملف غير موجود: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function includesAll(content, values, fileLabel) {
  for (const value of values) {
    assert(content.includes(value), `${fileLabel} لا يحتوي على: ${value}`);
  }
}

const packageJson = JSON.parse(read("package.json") || "{}");
const wrangler = read("wrangler.toml");
const envExample = read(".env.example");
const gitignore = read(".gitignore");
const worker = read("worker/index.js");

assert(packageJson.scripts?.deploy?.includes("wrangler deploy"), "أمر deploy يجب أن يعتمد wrangler deploy.");
assert(packageJson.scripts?.build === "vite build", "أمر build يجب أن يبقى vite build.");
assert(packageJson.scripts?.["check:worker"]?.includes("worker/index.js"), "check:worker يجب أن يفحص worker/index.js.");

includesAll(
  wrangler,
  [
    'main = "worker/index.js"',
    '[assets]',
    'directory = "./dist"',
    'not_found_handling = "single-page-application"',
    'binding = "RATE_LIMIT_KV"',
    '[ai]'
  ],
  "wrangler.toml"
);

function hasUncommentedAssignment(content, key) {
  return content
    .split(/\r?\n/)
    .some((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith("#") && new RegExp(`^${key}\\s*=`).test(trimmed);
    });
}

assert(!hasUncommentedAssignment(wrangler, "BREVO_API_KEY"), "لا تضع BREVO_API_KEY داخل wrangler.toml [vars]. استخدم wrangler secret put.");
assert(!hasUncommentedAssignment(wrangler, "GEMINI_API_KEY"), "لا تضع GEMINI_API_KEY داخل wrangler.toml [vars]. استخدم wrangler secret put.");
assert(!hasUncommentedAssignment(wrangler, "SUPABASE_SERVICE_ROLE_KEY"), "لا تضع SUPABASE_SERVICE_ROLE_KEY داخل wrangler.toml أو الواجهة.");

includesAll(
  envExample,
  [
    "VITE_SUPABASE_URL=",
    "VITE_SUPABASE_ANON_KEY=",
    "VITE_SITE_URL=",
    "SUPABASE_URL=",
    "SUPABASE_ANON_KEY=",
    "BREVO_API_KEY=",
    "GEMINI_API_KEY=",
    "ALLOWED_ORIGINS=",
    "MENTOR_RATE_LIMIT_PER_MINUTE=",
    "EMAIL_RATE_LIMIT_PER_MINUTE="
  ],
  ".env.example"
);

includesAll(gitignore, [".env", ".env.local", ".dev.vars", ".wrangler/"], ".gitignore");

includesAll(
  worker,
  ["/api/mentor", "/api/login-notice", "/api/welcome-email", "RATE_LIMIT_KV", "env.ASSETS"],
  "worker/index.js"
);

for (const legacyPath of ["functions/api/mentor.js", "functions/api/welcome-email.js", "functions/api/login-notice.js"]) {
  const legacyContent = read(legacyPath);
  assert(
    legacyContent.includes("PAGES_FUNCTION_DISABLED"),
    `${legacyPath} يجب أن يكون معطلاً بوضوح حتى لا يعمل مسار Pages Functions بالتوازي مع Worker.`
  );
}

const supabaseDir = path.join(root, "supabase");
if (fs.existsSync(supabaseDir)) {
  const sqlFiles = fs
    .readdirSync(supabaseDir)
    .filter((fileName) => fileName.endsWith(".sql"))
    .map((fileName) => path.join(supabaseDir, fileName));

  const sqlContent = sqlFiles.map((filePath) => fs.readFileSync(filePath, "utf8").toLowerCase()).join("\n");
  assert(sqlContent.includes("enable row level security"), "لم يتم العثور على أوامر ENABLE ROW LEVEL SECURITY داخل ملفات supabase/*.sql.");
  assert(sqlContent.includes("create policy") || sqlContent.includes("alter policy"), "لم يتم العثور على سياسات RLS داخل ملفات supabase/*.sql.");
} else {
  failures.push("مجلد supabase غير موجود؛ لا يمكن التحقق من وجود سكربتات RLS محليًا.");
}

if (failures.length) {
  console.error("\nفشل فحص جاهزية الإنتاج:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("\nأصلح النقاط أعلاه ثم أعد تشغيل: npm run check:production-config\n");
  process.exit(1);
}

console.log("Production configuration checks passed.");
