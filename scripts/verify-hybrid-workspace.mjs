import fs from "node:fs";
import path from "node:path";

const required = [
  "AGENTS.md",
  "START_HERE.md",
  "STARTER_CODE_SCOPE.md",
  "package.json",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/(auth)/login/page.tsx",
  "src/app/(auth)/onboarding/page.tsx",
  "src/app/api/health/route.ts",
  "src/lib/supabase/server.ts",
  "proxy.ts",
  "public/sw.js",
  "supabase/migrations/202608030001_initial_schema.sql",
  "supabase/migrations/202608030002_rls_policies.sql",
  ".agents/workflows/bootstrap.md",
  ".agents/skills/repository-bootstrap/SKILL.md",
];

const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error("Missing required hybrid files:\n" + missing.join("\n"));
  process.exit(1);
}

const identity = JSON.parse(fs.readFileSync("config/project.identity.json", "utf8"));
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

if (identity.github?.fullName !== "hellzard/temanguru") throw new Error("GitHub identity mismatch");
if (identity.vercel?.projectName !== "temanguru") throw new Error("Vercel identity mismatch");
if (identity.ai?.enabled !== false) throw new Error("AI gate must remain closed");
if (pkg.name !== "temanguru") throw new Error("Package identity mismatch");

const skillDirs = fs.readdirSync(".agents/skills");
for (const skill of skillDirs) {
  if (!fs.statSync(path.join(".agents/skills", skill)).isDirectory()) continue;
  const file = path.join(".agents/skills", skill, "SKILL.md");
  if (!fs.existsSync(file)) throw new Error(`Missing SKILL.md: ${skill}`);
  const content = fs.readFileSync(file, "utf8");
  if (!content.startsWith("---") || !content.includes("description:")) {
    throw new Error(`Invalid skill frontmatter: ${skill}`);
  }
}

console.log("Teman Guru hybrid workspace verified.");
