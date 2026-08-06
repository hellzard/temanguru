# Kontrak Produk Guest-First

## Tanpa login

- `/workspace` dapat digunakan tanpa akun dan tanpa Supabase cloud.
- Data tamu tersimpan di IndexedDB dengan fallback aman.
- Pengguna dapat mengunduh backup JSON dan memulihkannya.
- Restore memvalidasi versi, struktur, dan ukuran.
- UI menjelaskan bahwa data lokal terikat pada browser/perangkat sampai dibackup.

## Akun opsional

- Login memakai email+sandi melalui `signInWithPassword`.
- Daftar memakai email+sandi.
- Login normal tidak menggunakan magic link.
- Lupa sandi memakai OTP:
  `resetPasswordForEmail` → `verifyOtp` tipe `recovery` → `updateUser`.
- Akun dapat menyinkronkan snapshot antarperangkat.
- RLS membatasi snapshot ke pemiliknya.
- Data perangkat tidak boleh ditimpa diam-diam ketika login.
- Logout biasa tidak menghapus data lokal atau tema.
- Penghapusan data perangkat adalah tindakan terpisah.

## Keutuhan

- Theme Engine, offline/PWA, backup, dan sinkronisasi tetap berfungsi.
- Respons privat tidak boleh disimpan service worker.
- Jangan menambahkan PII berlebihan, AI, tracking invasif, atau iklan.
