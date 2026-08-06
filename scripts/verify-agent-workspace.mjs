import fs from "node:fs";
import path from "node:path";

const quick = process.argv.includes("--quick");
const required = [
  "START_HERE.md",
  "RUN_MODES.md",
  "AGENTS.md",
  "MASTER_PROMPT.md",
  "ANTIGRAVITY_EXECUTION_BRIEF.md",
  "config/project.identity.json",
  "config/agent_build_policy.json",
  "docs/PRD.md",
  "docs/IMPLEMENTATION_WAVES.md",
  "docs/ACCEPTANCE_MATRIX.md",
  ".agents/hooks.json",
  ".agents/workflows/bootstrap.md",
  ".agents/workflows/full-product-build.md",
  ".agents/skills/repository-bootstrap/SKILL.md",
  ".agents/agents/release-manager/agent.md",
  "prompts/00-FIRST_MESSAGE.md"
];

const missing = required.filter((file) => !fs.existsSync(path.resolve(file)));
if (missing.length) {
  console.error("Missing required files:\n" + missing.join("\n"));
  process.exit(1);
}

const identity = JSON.parse(fs.readFileSync("config/project.identity.json", "utf8"));
if (identity.github?.fullName !== "hellzard/temanguru") throw new Error("GitHub identity mismatch");
if (identity.vercel?.projectName !== "temanguru") throw new Error("Vercel project mismatch");
if (identity.ai?.enabled !== false) throw new Error("AI must remain disabled");

for (const forbidden of ["src", "app", "pages", "node_modules", ".next", ".vercel", "supabase/migrations"]) {
  if (fs.existsSync(forbidden)) {
    console.error(`This instruction-only package unexpectedly contains implementation path: ${forbidden}`);
    process.exit(1);
  }
}

if (!quick) {
  for (const skill of fs.readdirSync(".agents/skills")) {
    const file = path.join(".agents/skills", skill, "SKILL.md");
    if (!fs.existsSync(file)) throw new Error(`Missing SKILL.md: ${skill}`);
    const content = fs.readFileSync(file, "utf8");
    if (!content.startsWith("---") || !content.includes("description:")) {
      throw new Error(`Invalid skill frontmatter: ${skill}`);
    }
  }
  for (const agent of fs.readdirSync(".agents/agents")) {
    const file = path.join(".agents/agents", agent, "agent.md");
    if (!fs.existsSync(file)) throw new Error(`Missing agent.md: ${agent}`);
    const content = fs.readFileSync(file, "utf8");
    if (!content.startsWith("---") || !content.includes("description:")) {
      throw new Error(`Invalid agent frontmatter: ${agent}`);
    }
  }
}

console.log("Teman Guru agent workspace verified.");
