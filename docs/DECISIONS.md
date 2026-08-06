# Architecture Decision Log

## ADR-001 — Next.js App Router on Vercel

Chosen for full-stack React, server rendering, route handlers, and direct Git deployment.

## ADR-002 — Supabase with RLS

Chosen for free-tier Postgres/Auth/Storage and database-enforced tenant isolation. RLS is mandatory, not optional defense-in-depth.

## ADR-003 — PWA before native apps

Chosen to support installability and broad device reach while keeping one codebase. Offline private data will be added carefully after core flows.

## ADR-004 — CSV-first export

CSV is the first export because it is portable and inexpensive. Excel/PDF follow once source data and templates stabilize.

## ADR-005 — AI after core workflows

AI is deferred until attendance, journal, scores, reports, privacy, and teacher validation are stable.
