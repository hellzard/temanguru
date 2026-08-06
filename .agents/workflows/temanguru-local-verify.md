# Teman Guru Local Verify

## Langkah

1. Pastikan root project benar dan Git status dipahami.
2. Gunakan Node 22.x.
3. Bersihkan hanya `.next`, report test, dan `supabase/.temp`.
4. Gunakan `npm ci` bila lockfile valid; jika tidak, `npm install`, review, lalu verifikasi ulang.
5. Jalankan doctor, verify workspace, verify guest-first, secret scan, tenant scan, lint, typecheck, unit, build, dan audit dependency.
6. Nyalakan Docker/Supabase lokal. Minta pengguna hanya bila OS meminta interaksi.
7. Jalankan `npx supabase start`, `npx supabase db reset --local`, dan `npx supabase test db`.
8. Gunakan output `supabase status -o env` untuk `.env.local` tanpa menampilkan secret.
9. Jalankan aplikasi, Playwright desktop/mobile, dan Browser Agent.
10. Uji mode tamu, backup/restore, email+sandi, OTP inbox lokal, sinkronisasi, tema, responsif, aksesibilitas, console, dan network.
11. Perbaiki seluruh kegagalan dan ulangi sampai hijau.
12. Perbarui `AUTOPILOT_STATUS.md`.
