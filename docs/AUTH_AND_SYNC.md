# Arsitektur Login Opsional dan Sinkronisasi

## Mode lokal

- Tidak membuat user anonim di Supabase.
- Data disimpan pada database browser `temanguru-local-workspace`.
- Fallback menggunakan localStorage bila IndexedDB tidak tersedia.
- Pengguna dapat ekspor dan impor backup JSON.
- Keluar dari akun tidak menghapus workspace lokal.

## Mode akun

- Login: `signInWithPassword`.
- Daftar: `signUp` dengan email dan password.
- Lupa sandi: `resetPasswordForEmail`, lalu `verifyOtp` bertipe `recovery`, kemudian `updateUser`.
- Sinkronisasi: snapshot JSON disimpan di `public.user_workspace_snapshots`.
- RLS membatasi setiap row ke `auth.uid()` pemiliknya.

## Strategi konflik

- Perangkat kosong mengambil snapshot cloud.
- Bila cloud lebih baru, data cloud dipulihkan.
- Bila data lokal lebih baru, data lokal diunggah.
- Perubahan lokal setelah login diunggah dengan debounce.
- Backup manual tetap dianjurkan sebelum impor atau penghapusan besar.

## Batasan yang disengaja

Sinkronisasi memakai model snapshot last-write-wins, bukan penggabungan per-record real-time. Hal ini membuat alur lebih sederhana dan mudah dipahami, tetapi dua perangkat yang diedit bersamaan dapat saling menimpa versi terakhir. Gunakan tombol sinkron sebelum berpindah perangkat.
