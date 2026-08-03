# Acceptance Matrix

Every vertical slice must satisfy all applicable rows.

| Area | Required evidence |
|---|---|
| Product | User problem, happy path, failure path, done criteria |
| Data | Schema, constraints, indexes, ownership |
| Authorization | RLS positive and negative cases |
| Validation | Server-side validation and safe errors |
| UI | Loading, empty, error, success |
| Mobile | 320×568 and 390×844 |
| Tablet | 768×1024 |
| Desktop | 1440×900 |
| Accessibility | labels, focus, keyboard, contrast, non-drag alternative |
| Offline | explicit supported/unsupported behavior |
| Export | source-to-output data match |
| Privacy | data minimization and logging review |
| Tests | unit plus E2E critical path |
| Build | production build passes |
| Docs | status, decisions, setup updated |

A checkbox in `docs/TASKS.md` may only be checked after the evidence is recorded.
