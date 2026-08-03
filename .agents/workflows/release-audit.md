# Release Audit

Description: Block unsafe or incomplete releases.

1. Run lint, typecheck, tests, E2E critical paths, secret scan, and production build.
2. Review migrations and RLS with backend/security agents.
3. Check student data in logs, URLs, telemetry, exports, and caches.
4. Confirm private routes/API responses are not cached by the service worker.
5. Run browser QA and Preview smoke tests.
6. Confirm GitHub/Vercel identity.
7. Record findings and rollback instructions.
8. Release only with no unresolved high-severity issue.
