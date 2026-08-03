# Autopilot Setup

Description: Menyiapkan Teman Guru dari workspace baru sampai starter berjalan, Supabase terhubung, pemeriksaan lulus, dan browser dapat dibuka, dengan intervensi pengguna seminimal mungkin.

## Prinsip

- Kerjakan sendiri semua langkah yang dapat dilakukan melalui terminal, file tools, browser, skills, atau MCP.
- Jangan meminta pengguna mengetik command.
- Jangan meminta nilai yang dapat ditemukan melalui connector, project dashboard, repository, atau file.
- Minta pengguna hanya untuk login, memberi authorization, memilih organisasi bila benar-benar diperlukan, atau menyetujui tindakan berisiko.
- Jangan pernah menampilkan, menyalin ke chat, atau commit secret.
- Jangan menurunkan kualitas check hanya agar build terlihat berhasil.
- AI generatif tetap dinonaktifkan.

## Langkah

1. Baca `START_HERE.md`, `AUTOPILOT_GUIDE.md`, `STARTER_CODE_SCOPE.md`, `AGENTS.md`, dan `config/project.identity.json`.
2. Pastikan workspace berada dalam repository `hellzard/temanguru` atau hubungkan secara aman tanpa force-push.
3. Periksa sistem operasi, Node.js, npm, Git, dan akses terminal.
4. Bila Node.js 22+ belum tersedia:
   - gunakan package manager resmi yang cocok jika izin tersedia;
   - bila memerlukan hak administrator, minta satu authorization singkat kepada pengguna;
   - jangan mengunduh installer dari sumber tidak resmi.
5. Jalankan `npm run autopilot:setup`.
6. Bila instalasi atau check gagal:
   - baca error;
   - perbaiki akar masalah;
   - ulangi hanya check yang relevan;
   - lanjutkan sampai lint, typecheck, test, dan build lulus.
7. Temukan Supabase connector/MCP yang tersedia.
8. Jika belum ada project Supabase untuk Teman Guru:
   - buat project development bernama `temanguru`;
   - pilih organisasi pengguna yang tersedia;
   - gunakan free plan bila dapat dipilih dan tidak mengubah billing;
   - bila pilihan organisasi, region, password database, atau persetujuan akun tidak dapat diputuskan aman, minta pengguna hanya untuk keputusan tersebut.
9. Ambil Project URL dan publishable key melalui connector atau Connect panel.
10. Tulis nilainya langsung ke `.env.local` tanpa mencetak nilainya di chat/log.
11. Jangan pernah memasukkan secret/service-role key ke variabel `NEXT_PUBLIC_*`.
12. Terapkan migration `supabase/migrations` secara berurutan melalui Supabase MCP/CLI.
13. Jalankan pemeriksaan SQL dan RLS, termasuk akses pengguna nonanggota.
14. Konfigurasikan Auth redirect lokal dan target produksi sesuai dokumentasi proyek.
15. Jalankan development server pada terminal terpisah/background.
16. Buka `http://localhost:3000` dan `/api/health` melalui browser.
17. Uji landing, login, callback, onboarding sekolah, dashboard, mobile 390 px, dan error states.
18. Perbaiki semua error yang ditemukan dan ulangi build/test/browser checks.
19. Tulis hasil aktual ke `docs/IMPLEMENTATION_STATUS.md`.
20. Buat artifact ringkas berisi:
    - apa yang berhasil;
    - apa yang membutuhkan authorization pengguna;
    - checks dan hasilnya;
    - URL lokal;
    - langkah vertical slice berikutnya.
21. Jangan push atau deploy Production pada workflow ini. Setelah setup lulus, sarankan `/plan-wave`.

## Hasil selesai

Setup dianggap selesai hanya jika:

- dependencies terpasang;
- `.env.local` terisi tanpa secret bocor;
- migration development berhasil;
- lint, typecheck, unit test, dan build lulus;
- development server dapat dibuka;
- `/api/health` sukses;
- login/onboarding diuji atau blocker authorization dicatat jelas.
