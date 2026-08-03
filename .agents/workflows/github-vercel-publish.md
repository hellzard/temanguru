# GitHub and Vercel Publish

Description: Publish only a verified Teman Guru release to `hellzard/temanguru` and Vercel project `temanguru`.

1. Read `docs/RELEASE_RUNBOOK.md`, `docs/DEPLOYMENT.md`, and `config/project.identity.json`.
2. Confirm authenticated GitHub user has push permission to `hellzard/temanguru`.
3. Confirm remote, branch, clean status, and intended commits.
4. Confirm release audit passed.
5. Ensure real `.env*` values and `.vercel/` are ignored.
6. Push feature branch or verified `main` as appropriate.
7. Link/import the existing repository into Vercel project named exactly `temanguru`.
8. Configure environment values through Vercel, not files.
9. Deploy Preview and smoke-test.
10. Merge/deploy Production only if Preview passes.
11. Verify `https://temanguru.vercel.app/api/health`.
12. Record commit SHA, deployment URL/ID, migration version, and rollback.
