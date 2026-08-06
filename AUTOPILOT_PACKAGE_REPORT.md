# Teman Guru Antigravity Autopilot — Package Report

## Versi

- Application: `0.4.1`
- Product model: guest-first + optional account sync
- Automation: Google Antigravity workspace rules, workflows, and skill

## Automation included

- `.agents/rules/00-project-guardrails.md`
- `.agents/rules/10-guest-first-product.md`
- `.agents/rules/20-release-quality.md`
- `.agents/workflows/temanguru-autopilot.md`
- `.agents/workflows/temanguru-local-verify.md`
- `.agents/workflows/temanguru-cloud-setup.md`
- `.agents/workflows/temanguru-deploy.md`
- `.agents/workflows/temanguru-final-audit.md`
- `.agents/skills/temanguru-release/SKILL.md`
- `ANTIGRAVITY_BACA_DULU.txt`
- `PROMPT_ANTIGRAVITY_SATU_KALI.txt`
- `AUTOPILOT_STATUS.md`

## Static checks completed

- Project structure: passed, 13 migrations.
- Guest-first contract scan: passed.
- Login uses email/password and not `signInWithOtp`: passed.
- Recovery OTP flow: passed.
- Backup/restore and cloud sync modules: found.
- JavaScript syntax for new automation scripts: passed.
- Common secret pattern scan: passed.
- Ambiguous `school_members.single()` scan: passed.
- Antigravity rule/workflow files are below the 12,000-character limit.

## Checks delegated to Antigravity

Antigravity must run these on the user's computer:

- dependency installation and lockfile;
- lint and full TypeScript typecheck;
- unit tests and production build;
- Docker/Supabase local reset and pgTAP/RLS;
- Playwright and browser QA;
- GitHub authentication/push and Actions;
- Supabase cloud configuration;
- Vercel Preview and production deployment.

The workflow forbids marking the task complete while any required quality gate is failing.
