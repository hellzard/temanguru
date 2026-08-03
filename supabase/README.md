# Supabase Setup

Apply migrations in order with the Supabase CLI or SQL editor. Use `seed.sql` only in development.

After applying migrations:

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.generated.ts
```

Review every RLS policy with authenticated users from two different schools before using real data.
