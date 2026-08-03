---
name: quality-gate
description: Runs the Teman Guru completion checks for code quality, tests, responsive UI, security, privacy, and documentation.
---


# Quality Gate

Run in order:

```bash
npm run check:secrets
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Then manually verify mobile, tablet, desktop, keyboard, reduced motion, empty/error/offline states, and authorization. Update `docs/IMPLEMENTATION_STATUS.md`. A failed check blocks completion unless documented as an environment limitation with a reproduction command.

