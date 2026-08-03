# Resume Project

Description: Safely continue Teman Guru after a new session or interruption.

1. Read implementation status, decisions, tasks, Git status, and recent commits.
2. Inspect CI and deployment state if available.
3. Verify no unfinished migration or half-completed slice.
4. Resume the current active slice; do not restart completed work.
5. If no active slice exists, call `/plan-wave`.
6. Run relevant quality checks before making new changes.
