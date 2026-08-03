---
name: github-vercel-publish
description: Publishes Teman Guru to GitHub owner hellzard and deploys it to the Vercel project temanguru after all quality and secret checks pass.
---

# GitHub and Vercel Publish

1. Read `docs/RELEASE_RUNBOOK.md`.
2. Confirm GitHub authenticated owner is `hellzard`.
3. Use repository `hellzard/temanguru` and default branch `main`.
4. Run `npm run release:preflight` and `npm run verify` before push.
5. Never commit real environment values or `.vercel` credentials.
6. Import the Git repository to Vercel with project name exactly `temanguru`.
7. Configure environment variables through Vercel settings.
8. Test preview, then production and `/api/health`.
9. Record commit, deployment URL, migration version, and rollback notes.
