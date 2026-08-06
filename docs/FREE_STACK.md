# Free-Tier Stack and Guardrails

## Core

- Vercel Hobby: deployment/preview for personal, non-commercial prototype. Review plan terms before school/commercial production.
- Supabase Free: Postgres, Auth, Storage, Realtime, and Edge Functions within current quotas.
- GitHub: repository, issues, Actions, Dependabot.
- Cloudflare Turnstile: optional free bot protection for public forms.

## Browser-first free features

- PWA installability and service worker.
- IndexedDB drafts with Dexie.
- CSV generation with browser APIs.
- Excel export with ExcelJS.
- PDF/print with browser print or pdf-lib.
- WhatsApp deep links rather than paid API automation.
- Web Share API and clipboard where supported.
- ICS calendar export.

## Cost controls

- Keep AI disabled by default and behind provider abstraction.
- Avoid uploading routine photos/video.
- Compress and cap document uploads.
- Prefer client-side small exports.
- Add rate limits before public endpoints.
- Show graceful quota errors and preserve user drafts.

## Current researched limits snapshot

As researched in August 2026, Supabase Free advertises 500 MB database, 1 GB storage, 50,000 MAU, 200 peak Realtime connections, and 500,000 Edge Function invocations, with free projects pausing after inactivity. Verify again before launch because plans change.
