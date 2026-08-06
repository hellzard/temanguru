# Deploy ke Vercel

Panduan lengkap untuk pemula tersedia di `docs/INSTALL_STEP_BY_STEP.md`, Bagian H sampai J.

## Ringkasan

1. Pastikan migration Supabase sudah dipasang.
2. Upload source ke GitHub, bukan file ZIP.
3. Di Vercel pilih **Add New → Project** dan import repository.
4. Framework: Next.js. Root Directory kosong bila `package.json` ada di root.
5. Runtime mengikuti `package.json`: Node.js 22.x.
6. Tambahkan environment variable untuk Production dan Preview:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_KEY_KAMU
NEXT_PUBLIC_APP_URL=https://NAMA-PROJECT.vercel.app
APP_ALLOWED_ORIGINS=https://NAMA-PROJECT.vercel.app
NEXT_PUBLIC_APP_STAGE=production
```

7. Deploy.
8. Salin URL Vercel ke Supabase **Authentication → URL Configuration**.
9. Uji `/`, `/workspace`, `/login`, `/forgot-password`, `/api/health`, manifest, robots, dan sitemap.

Mode lokal tetap dapat dibuka ketika Supabase belum terhubung. Login, OTP, dan sinkronisasi baru aktif setelah environment Supabase benar.
