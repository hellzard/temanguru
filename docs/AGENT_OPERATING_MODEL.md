# Agent Operating Model

## Roles

The primary agent is the orchestrator. Delegate substantial work to:

- product-manager;
- ux-researcher;
- ui-designer;
- frontend-engineer;
- backend-engineer;
- security-reviewer;
- qa-engineer;
- documentation-engineer;
- devops-engineer;
- release-manager.

## Delegation rules

- Use isolated worktrees for large parallel implementation when available.
- Do not assign two writers to the same file.
- Product/UX define acceptance criteria before implementation.
- Security and QA review after implementation.
- Release manager owns final checklist, not feature code.

## Mandatory artifact per slice

1. problem and acceptance criteria;
2. implementation plan;
3. changed-file list;
4. migration/RLS plan;
5. test plan;
6. browser QA evidence;
7. remaining risks;
8. rollback note.

## Context control

Skills use progressive disclosure. Read only relevant `SKILL.md` files. Keep the main agent focused on decisions and integration.

## Stop conditions

Stop and report instead of pushing when:

- tests fail;
- build fails;
- RLS is missing;
- a secret is detected;
- repository identity is wrong;
- Vercel project name is wrong;
- migration is destructive without backup/approval;
- preview smoke test fails.
