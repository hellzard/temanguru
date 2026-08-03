---
name: vercel-release
description: Prepares and verifies GitHub-to-Vercel deployment, environment variables, preview review, Supabase migrations, and rollback.
---


# Vercel Release

1. Ensure `npm run verify` passes.
2. Review migration order and apply database changes before code only when backward compatible.
3. Confirm Preview environment uses non-production Supabase when available.
4. Add environment variables in Vercel; never commit `.env.local`.
5. Check auth redirect URLs for Preview and Production.
6. Inspect mobile layout, service worker version, and health endpoint.
7. Record deployment URL, commit SHA, migration version, and rollback plan.

