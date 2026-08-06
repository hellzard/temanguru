# Supabase

Folder ini berisi konfigurasi local stack, migration, seed aman, dan pgTAP tests.

```bash
npx supabase start
npx supabase db reset --local
npx supabase test db
```

Jangan menjalankan `db push` ke production sebelum reset lokal dan seluruh test lulus.
