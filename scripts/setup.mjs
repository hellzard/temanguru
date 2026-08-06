import fs from "node:fs";
import process from "node:process";

const major = Number(process.versions.node.split(".")[0]);
if (major < 22) {
  console.error("Teman Guru starter requires Node.js 22 or newer.");
  process.exit(1);
}

if (!fs.existsSync(".env.local")) {
  fs.copyFileSync(".env.example", ".env.local");
  console.log("Created .env.local from .env.example. Fill Supabase values before using real auth.");
} else {
  console.log(".env.local already exists; no file was overwritten.");
}

console.log("Next steps:");
console.log("1. npm install");
console.log("2. npm run dev");
console.log("3. Apply Supabase migrations when ready");
console.log("4. Run /bootstrap in Antigravity");
