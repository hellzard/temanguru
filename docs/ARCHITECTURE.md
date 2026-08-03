# Architecture

## System overview

```text
Browser / Installed PWA
  ├─ Next.js Server Components and Client Islands
  ├─ IndexedDB drafts/outbox (phase 2)
  └─ Service worker: static shell only
          │
          ▼
Vercel / Next.js 16
  ├─ Server Actions and Route Handlers
  ├─ Supabase SSR session handling via proxy.ts
  └─ Export and validation services
          │
          ▼
Supabase
  ├─ Auth
  ├─ Postgres + Row Level Security
  ├─ Storage for limited documents
  └─ Realtime only where justified
```

## Rendering rules

- Server Components fetch private data.
- Client Components handle forms, browser storage, charts, and interactive navigation.
- No private data is statically generated or stored in public caches.
- Auth refresh occurs in root `proxy.ts`.

## Domain boundaries

- Identity: profiles and sessions.
- Tenancy: schools and school_members.
- Academic setup: academic_years, classes, subjects, teaching_assignments, schedules.
- Daily teaching: attendance_sessions, attendance_records, teaching_journals.
- Assessment: assessments, assessment_scores, remedial_attempts.
- Support: student_notes, export_jobs, document_templates.

## Mutation pipeline

```text
UI form
→ client validation
→ Server Action / Route Handler
→ Zod validation
→ authenticated user lookup
→ membership/role check
→ Postgres mutation under RLS
→ domain result
→ revalidate relevant path/tag
→ success/error UI
```

## Offline strategy

Phase 1 provides installability and an offline shell. Phase 2 adds IndexedDB drafts and outbox for attendance/journals.

- Server remains source of truth.
- Mutations carry an idempotency key.
- Outbox entries contain minimal data and user/school scope.
- Conflicts require an explicit user choice.
- Logout clears local private drafts.

## AI boundary

Optional provider adapter only after core product stabilizes. Redact names and IDs before sending. The server controls prompt templates, rate limits, allowed fields, audit metadata, and provider keys. Output is a draft requiring teacher review.

## Scalability

Free-tier pilot: one Supabase project, Vercel Hobby, client-side small exports. When limits approach, move large report generation to queued jobs and upgrade deliberately.
