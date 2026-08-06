# Model keamanan

## Mode lokal

- Data utama tersimpan di IndexedDB browser.
- Data tidak otomatis dikirim ke Supabase sebelum pengguna login.
- Membersihkan site data/browser dapat menghapus ruang kerja lokal.
- Backup JSON tidak dienkripsi; simpan di tempat aman dan jangan bagikan sembarangan.

## Mode akun

- Login memakai email dan kata sandi melalui Supabase Auth.
- Recovery memakai OTP email bertipe `recovery`.
- Snapshot cloud memiliki `user_id` sebagai primary key.
- RLS hanya mengizinkan pengguna authenticated membaca, membuat, mengubah, atau menghapus snapshot dengan `user_id = auth.uid()`.
- Browser hanya memakai publishable/anon key; service-role key dilarang.

## Tenant sekolah

Setiap data sekolah membawa `school_id` dan bergantung pada `school_members` aktif. Role owner, admin, dan teacher dibedakan. RLS tetap menjadi sumber otorisasi utama walau UI menyembunyikan tombol yang tidak berhak digunakan.

## Cache dan logout

- Route/API privat tidak disimpan service worker.
- Logout hanya mengakhiri sesi cloud dan mempertahankan data lokal agar pekerjaan tidak hilang.
- Penghapusan data lokal dilakukan secara eksplisit melalui menu Backup & Sinkron.

## Risiko operasional

Aktifkan rate limit, bot protection/CAPTCHA bila diperlukan, Custom SMTP untuk production, backup database, monitoring error, dan pengujian silang dua akun sebelum digunakan dengan data nyata.
