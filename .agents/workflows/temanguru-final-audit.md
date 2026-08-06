# Teman Guru Final Audit

1. Cocokkan acceptance criteria dengan implementasi.
2. Pastikan `/workspace` berfungsi tanpa Supabase cloud.
3. Pastikan backup/restore JSON, email+sandi, OTP recovery, dan sync dua perangkat berjalan.
4. Pastikan akun A tidak membaca akun B.
5. Pastikan logout tidak menghapus data lokal tanpa tindakan terpisah.
6. Pastikan PWA tidak cache respons privat.
7. Pastikan test, CI, database, audit dependency, build, preview, dan production sehat.
8. Pastikan SHA `/api/health` sama dengan deployment.
9. Periksa secret tidak bocor di Git, logs, artifact, atau bundle client.
10. Tulis risiko tersisa secara jujur; jika ada kegagalan penting, kembali ke fase perbaikan.
