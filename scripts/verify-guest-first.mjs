import fs from "node:fs";

const required = [
  "src/app/workspace/page.tsx",
  "src/components/workspace/workspace-app.tsx",
  "src/lib/workspace/backup.ts",
  "src/lib/workspace/cloud.ts",
  "src/lib/workspace/db.ts",
  "src/app/(auth)/login/login-client.tsx",
  "src/app/(auth)/forgot-password/forgot-password-client.tsx",
  "supabase/migrations/202608060500_user_workspace_snapshots.sql",
];

const missing = required.filter((file) => !fs.existsSync(file));
if (missing.length) {
  missing.forEach((file) => console.error(`Hilang: ${file}`));
  process.exit(1);
}

const login = fs.readFileSync("src/app/(auth)/login/login-client.tsx", "utf8");
const recovery = fs.readFileSync("src/app/(auth)/forgot-password/forgot-password-client.tsx", "utf8");
const workspace = fs.readFileSync("src/components/workspace/workspace-app.tsx", "utf8");
const cloud = fs.readFileSync("src/lib/workspace/cloud.ts", "utf8");

const checks = [
  ["login email+sandi", login.includes("signInWithPassword")],
  ["daftar email+sandi", login.includes("signUp")],
  ["tanpa signInWithOtp login", !login.includes("signInWithOtp")],
  ["request recovery", recovery.includes("resetPasswordForEmail")],
  ["verify recovery OTP", recovery.includes("verifyOtp") && recovery.includes("recovery")],
  ["ubah password", recovery.includes("updateUser")],
  ["backup lokal", /backup|Unduh/i.test(workspace)],
  ["restore lokal", /restore|Pulihkan/i.test(workspace)],
  ["sync cloud", /snapshot|sync/i.test(cloud)],
];

checks.forEach(([name, ok]) => console.log(`${ok ? "✓" : "✗"} ${name}`));
if (checks.some(([, ok]) => !ok)) process.exit(1);
