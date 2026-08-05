import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src");
const findings = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) continue;

    const source = fs.readFileSync(full, "utf8");
    const blocks = source.match(/\.from\(["']school_members["']\)[\s\S]{0,500}?\.single\(\)/g) ?? [];
    if (blocks.length) findings.push(path.relative(process.cwd(), full));
  }
}

walk(root);

if (findings.length) {
  console.error("Membership query memakai .single() dan perlu active-school context:");
  findings.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log("Tidak ada query school_members .single() yang ambigu.");
