import fs from "node:fs";

function parseEnv(content) {
  const values = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 1) continue;
    values[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
  }
  return values;
}

const candidates = [".env.local", ".env.production.local", ".env"];
const envFile = candidates.find((file) => fs.existsSync(file));
if (!envFile) {
  console.error("Tidak menemukan .env.local. Salin .env.example menjadi .env.local lalu isi nilainya.");
  process.exit(1);
}

const env = parseEnv(fs.readFileSync(envFile, "utf8"));
const errors = [];
const warnings = [];

if (!/^https:\/\/.+\.supabase\.co$/.test(env.NEXT_PUBLIC_SUPABASE_URL ?? "")) {
  errors.push("NEXT_PUBLIC_SUPABASE_URL harus berupa URL project Supabase, contoh https://abc.supabase.co");
}
if (!(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").startsWith("sb_publishable_") && !(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").startsWith("eyJ")) {
  errors.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum tampak seperti publishable/anon key.");
}
if (!/^https?:\/\//.test(env.NEXT_PUBLIC_APP_URL ?? "")) {
  errors.push("NEXT_PUBLIC_APP_URL harus diawali http:// atau https://");
}
if (!(env.APP_ALLOWED_ORIGINS ?? "").includes(env.NEXT_PUBLIC_APP_URL ?? "__missing__")) {
  warnings.push("APP_ALLOWED_ORIGINS sebaiknya memuat NEXT_PUBLIC_APP_URL.");
}
if ((env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").includes("secret") || (env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").includes("service_role")) {
  errors.push("Jangan gunakan secret/service-role key di NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
}

console.log(`Memeriksa ${envFile}...`);
for (const warning of warnings) console.warn(`PERINGATAN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log("Konfigurasi dasar siap. Lanjutkan npm run verify sebelum deploy.");
