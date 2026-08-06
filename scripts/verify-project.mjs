import fs from "node:fs";
import path from "node:path";

const requiredFiles = [
  "package.json",
  "next.config.ts",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/(dashboard)/layout.tsx",
  "src/app/workspace/page.tsx",
  "src/lib/workspace/workspace-provider.tsx",
  "src/lib/supabase/server.ts",
  "src/lib/schools/active-school.ts",
  "supabase/config.toml",
  "supabase/migrations/202608030001_initial_schema.sql",
  "supabase/migrations/202608060100_security_hardening.sql",
  "supabase/migrations/202608060200_atomic_workflows.sql",
  "supabase/migrations/202608060400_authenticated_privileges.sql",
  "supabase/migrations/202608060500_user_workspace_snapshots.sql",
  "tests/e2e/smoke.spec.ts",
];

const forbiddenPaths = [
  ".next",
  "supabase/.temp",
  ".vercel",
  "playwright-report",
  "test-results",
];

const errors = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.resolve(file))) errors.push(`Berkas wajib tidak ditemukan: ${file}`);
}
for (const file of forbiddenPaths) {
  if (fs.existsSync(path.resolve(file))) errors.push(`Artefak lokal tidak boleh dikomit: ${file}`);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (packageJson.private !== true) errors.push("package.json harus private=true");
if (!packageJson.engines?.node?.includes("22.x")) errors.push("Node.js harus mendukung 22.x");
if (packageJson.dependencies?.exceljs) errors.push("ExcelJS tidak boleh kembali tanpa audit keamanan baru");
if (packageJson.dependencies?.["date-fns"]) errors.push("date-fns tidak digunakan dan harus dihapus");

const migrationNames = fs
  .readdirSync("supabase/migrations")
  .filter((name) => name.endsWith(".sql"))
  .sort();
const prefixes = migrationNames.map((name) => name.split("_")[0]);
if (new Set(prefixes).size !== prefixes.length) errors.push("Versi migration Supabase harus unik");

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Project structure valid (${migrationNames.length} migrations).`);
