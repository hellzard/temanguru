# Full Product Build

Description: Execute the roadmap as sequential production-quality vertical slices.

1. Call `/bootstrap`.
2. Call `/plan-wave`.
3. Call `/build-feature` for the single active slice.
4. Call `/release-audit`.
5. Update status and commit.
6. Repeat until the current wave exit criteria pass.
7. Start the next wave only after the previous wave is accepted.
8. Use Preview deployments for meaningful milestones.
9. Do not enable AI.
10. Call `/github-vercel-publish` only for a verified release candidate.
