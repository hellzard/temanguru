# Hardening & Theme Engine V2

This branch intentionally separates application hardening from production rollout.

## Included

- trusted-origin magic links and safe internal redirects;
- active-school context for multi-school accounts;
- command-specific RLS policies using active memberships;
- atomic inventory and class-record RPCs;
- server-derived deterministic idempotency for online and offline retries;
- local-only Supabase migration and pgTAP tests;
- theme mode, presets, custom gradients, local wallpaper compression, and scoped device cleanup;
- public-page SEO/PWA assets and CI coverage.

## Rollout rule

Do not run `supabase db push` from this branch against production. Validate with Docker locally, then deploy to a preview/staging project before scheduling a production migration.

## Local database verification

```bash
supabase start
supabase db reset --local
supabase test db
```

The CI database job pins Supabase CLI `2.110.0` for reproducibility.
