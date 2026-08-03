import fs from "node:fs";
import path from "node:path";

const ignored = new Set(["node_modules", ".git", ".next", "coverage", "playwright-report"]);
const textExt = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".sql", ".yml", ".yaml", ".env", ".example", ".css"]);
const patterns = [
  { name: "Supabase service role JWT", regex: /eyJ[a-zA-Z0-9_-]{20,}\.eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g },
  { name: "Generic private key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "OpenAI-like key", regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{24,}\b/g },
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (ignored.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

let found = false;
for (const file of walk(".")) {
  if (!textExt.has(path.extname(file)) && !file.endsWith(".env.example")) continue;
  const content = fs.readFileSync(file, "utf8");
  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(content)) {
      console.error(`${pattern.name} pattern found in ${file}`);
      found = true;
    }
  }
}
if (found) process.exit(1);
console.log("No common secret patterns found.");
