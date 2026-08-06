# Contributing

1. Gunakan Node.js 22 dan Supabase lokal.
2. Jangan memakai data sekolah atau murid nyata dalam test.
3. Tambahkan migration baru; jangan mengedit migration yang sudah diterapkan di cloud.
4. Jalankan `npm run verify`, `npx supabase test db`, dan `npm run test:e2e`.
5. Uji mode lokal tanpa environment Supabase dan mode akun dengan Supabase.
6. Jangan melemahkan RLS, menambahkan service-role key ke browser, atau menonaktifkan quality gate.
7. Gunakan commit yang menjelaskan perubahan dan risikonya.
