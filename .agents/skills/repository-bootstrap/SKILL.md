---
name: repository-bootstrap
description: Safely initializes or connects the Teman Guru workspace to the existing hellzard/temanguru repository without losing history.
---
# Repository Bootstrap

1. Inspect Git status, branch, remotes, and existing files.
2. Verify `config/project.identity.json`.
3. Preserve existing remote history and README.
4. Never force-push without explicit user approval.
5. Use `main` as the production branch.
6. Keep secrets and `.vercel/` ignored.
7. Document the chosen bootstrap path in `docs/DECISIONS.md`.
