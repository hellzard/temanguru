---
name: supabase-rls
description: Designs Supabase tables, migrations, indexes, server-side authentication, and Row Level Security for school-tenant data.
---


# Supabase and RLS

1. Every table exposed through the Data API must enable RLS.
2. Use `school_members` to authorize tenant access.
3. Teacher-level ownership may narrow access further than school membership.
4. Never use a service-role key in browser code.
5. Add foreign keys, unique constraints, checks, and useful indexes.
6. Prefer soft archival (`archived_at`) for academic records; document retention.
7. Test policies as anonymous, authenticated non-member, teacher member, and school admin.
8. Add migration comments and update `docs/DATABASE.md`.

