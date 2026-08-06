# Quality Gate Teman Guru

Sebelum commit produksi atau deploy production, wajib lulus:

## Aplikasi

- dependency dan lockfile konsisten;
- `npm run doctor`;
- `npm run verify:workspace`;
- `npm run verify:guest-first`;
- secret scan dan tenant-context scan;
- lint, typecheck, unit test, production build;
- `npm audit --omit=dev --audit-level=high`;
- Playwright desktop dan mobile.

## Database

- Docker dan Supabase lokal berjalan;
- `supabase db reset --local`;
- `supabase test db`;
- akun/sekolah A tidak membaca B;
- suspended member ditolak;
- snapshot akun lain ditolak;
- inventaris dan Catat Kelas idempotent;
- RLS tidak dinonaktifkan.

## Browser

Uji `/`, `/workspace`, backup/restore, login, signup, OTP recovery, sinkronisasi dua sesi, logout, tema, responsif 320–1440 px, keyboard, reduced motion, console, dan network.

## Deployment

Preview Vercel diuji dahulu. `/api/health`, SHA, runtime logs, GitHub Actions, dan rollback harus benar sebelum production.
