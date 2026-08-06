# Security and Privacy

## Threat model

Protected assets include teacher identity, school membership, student names, attendance, grades, notes, documents, and authentication sessions.

Main risks:

- cross-school data access;
- insecure direct object references;
- leaked service-role/API keys;
- private data in logs, URLs, analytics, caches, or AI prompts;
- malicious CSV/document uploads;
- stale PWA caches on shared devices;
- compromised teacher device/session;
- prompt injection through imported content.

## Required controls

- RLS on every exposed table.
- Server-side auth and authorization on mutations.
- Publishable Supabase key only in browser.
- Secret/service-role keys only in protected server environments, preferably avoided in user flows.
- No student names in telemetry, URLs, filenames, or console output.
- File type, size, and content validation; private Storage buckets.
- Rate limits on email, import, export, and optional AI endpoints.
- Secure headers and same-site cookies through framework/Supabase defaults.
- Service worker never caches authenticated pages or API data.
- Logout clears local private drafts and relevant caches.

## Data minimization

MVP intentionally excludes NIK, full address, health/medical data, parent identity, finance, biometrics, and government credentials.

## AI safeguards

- disabled by default;
- teacher explicitly requests generation;
- redact identifiable data;
- no model training claim unless provider contract proves it;
- output labeled as draft;
- teacher reviews before saving/exporting;
- no automatic disciplinary or grading decision.

## Operational checklist

- Review Supabase Security Advisor.
- Rotate leaked keys immediately.
- Enable MFA for repository, Supabase, Vercel, and domain accounts.
- Keep Dependabot active and review lockfile changes.
- Maintain `SECURITY.md` disclosure process.
- Define retention/deletion before a real school pilot.

This document is an engineering baseline, not legal advice. A real deployment involving schools and minors requires an Indonesian privacy/legal review and clear school agreements.
