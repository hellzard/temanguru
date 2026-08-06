# Setup Supabase

Panduan klik-per-klik dan perintah lengkap tersedia di `docs/INSTALL_STEP_BY_STEP.md`, Bagian B sampai F.

## Perintah utama

```bash
npm install
npx supabase@latest login
npx supabase@latest link --project-ref PROJECT_REF_KAMU
npx supabase@latest db push --dry-run
npx supabase@latest db push
```

Migration terakhir membuat `public.user_workspace_snapshots`, yaitu tempat snapshot milik akun disimpan. RLS membatasi setiap baris kepada `auth.uid()` pemiliknya.

## Authentication

Di **Authentication → Providers → Email**:

- Enable Email provider: ON
- Allow new users to sign up: ON
- Confirm Email: OFF untuk pendaftaran langsung tanpa membuka email

Di **Authentication → Email Templates → Reset Password**, gunakan `{{ .Token }}` agar email berisi kode OTP yang diketik pada aplikasi. Template siap salin juga tersedia di `supabase/templates/recovery.html`.

## Environment browser

Gunakan hanya URL project dan publishable/anon key. Jangan pernah menggunakan secret key atau `service_role` pada browser, GitHub, atau variabel `NEXT_PUBLIC_*`.

## Pengujian lokal database

Docker diperlukan untuk pengujian Supabase lokal:

```bash
npx supabase start
npx supabase db reset --local
npx supabase test db
```

Jangan menjalankan remote reset pada database production.
