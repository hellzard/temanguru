import { spawnSync } from "node:child_process";
import fs from "node:fs";

const checks = [];
function command(name, args = ["--version"]) {
  const result = spawnSync(name, args, { encoding: "utf8", shell: process.platform === "win32" });
  checks.push({
    name,
    ok: result.status === 0,
    detail: (result.stdout || result.stderr || "").trim().split(/\r?\n/)[0] || "tidak ditemukan",
  });
}

command("node");
command("npm");
command("git");
command("docker");
command("npx", ["supabase", "--version"]);

checks.push({ name: "Node 22.x", ok: Number(process.versions.node.split(".")[0]) === 22, detail: process.version });

for (const file of [
  "package.json",
  "src/app/workspace/page.tsx",
  "src/app/(auth)/login/page.tsx",
  "src/app/(auth)/forgot-password/page.tsx",
  "supabase/config.toml",
  ".agents/workflows/temanguru-autopilot.md",
]) checks.push({ name: file, ok: fs.existsSync(file), detail: fs.existsSync(file) ? "tersedia" : "hilang" });

console.table(checks);
if (checks.some((item) => !item.ok)) {
  console.error("\nPrasyarat belum siap. Antigravity harus memperbaikinya.");
  process.exit(1);
}
console.log("\nLingkungan dasar siap.");
