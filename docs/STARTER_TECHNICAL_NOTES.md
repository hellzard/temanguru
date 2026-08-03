# Starter Technical Notes

## Next.js

The starter targets Next.js `16.2.11`, the July 2026 Active LTS security patch. Next.js 16 renamed Middleware to `proxy.ts`; Proxy should perform optimistic request checks and session refresh, while database/RLS remains the true authorization layer.

## Supabase

The starter uses `@supabase/ssr` rather than deprecated Auth Helpers. Browser and server clients use the publishable key. Every user-owned table must be protected by RLS. The service-role/secret key must never enter the browser bundle.

## Antigravity

Workspace rules are in `.agents/rules`, skills in `.agents/skills/<skill>/SKILL.md`, workflows in `.agents/workflows`, and custom agents in `.agents/agents`. Workflows are invoked with slash commands.

## Vercel

Connect the existing GitHub repository to Vercel. Use branch/PR Preview deployments and deploy `main` to Production only after Preview smoke tests pass.
