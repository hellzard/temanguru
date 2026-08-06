# Teman Guru v0.4 — Guest-First

Teman Guru adalah PWA local-first untuk pencatatan kerja guru. Aplikasi dapat dipakai tanpa login, lalu akun email+sandi dapat ditambahkan bila pengguna membutuhkan backup cloud dan sinkronisasi antarperangkat.

## Cara pakai

- **Tanpa login:** buka `/workspace`; data tersimpan di IndexedDB perangkat.
- **Dengan akun:** login memakai email+sandi; snapshot workspace tersimpan di Supabase.
- **Lupa sandi:** OTP recovery dikirim ke email dan dimasukkan langsung di aplikasi.
- **Backup manual:** ekspor dan impor satu file JSON.

## Modul local-first

- Ringkasan
- Kelas dan murid
- Presensi, materi, dan jurnal
- Penilaian dan nilai murid
- Dokumen lokal
- Acara, rapat, dan tugas
- Inventaris sederhana
- Backup dan sinkronisasi

Modul sekolah multi-user lama tetap tersedia setelah login dan onboarding. Pengguna tanpa akun diarahkan ke workspace lokal, bukan ke halaman login.

## Mulai

Baca berurutan:

1. `START_HERE.md`
2. `docs/INSTALL_STEP_BY_STEP.md`
3. `INSTALL_CHECKLIST.txt`

## Development

```bash
npm install
cp .env.example .env.local
npm run preflight
npm run dev
```

## Validasi

```bash
npm run verify
npm run verify:database
npm run test:e2e
```

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS, IndexedDB (`idb`), Supabase Auth/Postgres/RLS, Vitest, Playwright, dan Vercel.

## Keamanan

Jangan pernah memasukkan Supabase secret/service-role key ke variabel `NEXT_PUBLIC_*`, GitHub, atau source code. Gunakan hanya publishable/anon key pada browser.
