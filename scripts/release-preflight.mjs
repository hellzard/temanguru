import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";

const expected = {
  productName: "Teman Guru",
  packageName: "temanguru",
  githubFullName: "hellzard/temanguru",
  vercelProject: "temanguru",
  productionUrl: "https://temanguru.vercel.app",
};

const fail = (message) => {
  console.error(`Preflight failed: ${message}`);
  process.exitCode = 1;
};

try {
  const identity = JSON.parse(await readFile("config/project.identity.json", "utf8"));
  const pkg = JSON.parse(await readFile("package.json", "utf8"));

  if (identity.productName !== expected.productName) fail("product name mismatch");
  if (identity.github?.fullName !== expected.githubFullName) fail("GitHub repository mismatch");
  if (identity.vercel?.projectName !== expected.vercelProject) fail("Vercel project mismatch");
  if (identity.vercel?.productionUrl !== expected.productionUrl) fail("production URL mismatch");
  if (identity.ai?.enabled !== false) fail("AI must remain disabled for current roadmap");
  if (pkg.name !== expected.packageName) fail("package name mismatch");

  await access(".env.example", constants.R_OK);
  await access(".gitignore", constants.R_OK);
  const gitignore = await readFile(".gitignore", "utf8");
  for (const required of [".env", ".vercel"]) {
    if (!gitignore.includes(required)) fail(`.gitignore must include ${required}`);
  }

  if (!process.exitCode) console.log("Release preflight passed.");
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
