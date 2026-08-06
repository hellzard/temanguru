import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const artifactsDir = path.join(root, ".agent-artifacts");
fs.mkdirSync(artifactsDir, { recursive: true });

const status = {
  startedAt: new Date().toISOString(),
  node: process.version,
  steps: [],
  needsSupabaseConnection: false,
  success: false,
};

function record(name, success, detail = "") {
  status.steps.push({ name, success, detail });
  fs.writeFileSync(
    path.join(artifactsDir, "autopilot-setup-status.json"),
    JSON.stringify(status, null, 2) + "\n",
  );
}

function run(command, args, name, options = {}) {
  console.log(`\n▶ ${name}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, CI: options.ci ? "true" : process.env.CI },
  });

  if (result.error || result.status !== 0) {
    record(name, false, result.error?.message ?? `Exit code ${result.status}`);
    console.error(`✖ ${name} gagal.`);
    process.exit(result.status || 1);
  }

  record(name, true);
}

const major = Number(process.versions.node.split(".")[0]);
if (major < 22) {
  record("Periksa Node.js", false, `Butuh Node.js 22+, ditemukan ${process.version}`);
  console.error("Node.js 22 atau lebih baru diperlukan.");
  process.exit(1);
}
record("Periksa Node.js", true, process.version);

if (!fs.existsSync(path.join(root, ".env.local"))) {
  fs.copyFileSync(path.join(root, ".env.example"), path.join(root, ".env.local"));
  record("Buat .env.local", true, "Dibuat dari .env.example tanpa secret.");
} else {
  record("Buat .env.local", true, "File sudah ada dan tidak ditimpa.");
}

if (!fs.existsSync(path.join(root, "node_modules"))) {
  run("npm", ["install"], "Instal dependensi");
} else {
  record("Instal dependensi", true, "node_modules sudah tersedia.");
}

run("npm", ["run", "verify:workspace"], "Verifikasi workspace");
run("npm", ["run", "check:secrets"], "Pindai secret");
run("npm", ["run", "lint"], "Lint");
run("npm", ["run", "typecheck"], "TypeScript");
run("npm", ["run", "test"], "Unit test", { ci: true });
run("npm", ["run", "build"], "Production build", { ci: true });

const env = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const hasUrl = /^NEXT_PUBLIC_SUPABASE_URL=https?:\/\/.+/m.test(env);
const hasKey = /^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=.+/m.test(env);

if (!hasUrl || !hasKey) {
  status.needsSupabaseConnection = true;
  record(
    "Periksa Supabase",
    false,
    "URL atau publishable key belum diisi. Agent harus memakai Supabase MCP/dashboard lalu menulis .env.local secara aman.",
  );
} else {
  record("Periksa Supabase", true, "Konfigurasi publik terdeteksi.");
}

status.success = status.steps.every(
  (step) => step.success || step.name === "Periksa Supabase",
);
status.finishedAt = new Date().toISOString();

fs.writeFileSync(
  path.join(artifactsDir, "autopilot-setup-status.json"),
  JSON.stringify(status, null, 2) + "\n",
);

console.log("\n✓ Setup lokal dan pemeriksaan starter selesai.");
if (status.needsSupabaseConnection) {
  console.log("ℹ Antigravity perlu menyambungkan Supabase sebelum menguji login nyata.");
}
