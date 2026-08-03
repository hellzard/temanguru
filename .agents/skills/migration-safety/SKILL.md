---
name: migration-safety
description: Designs and reviews backward-compatible Supabase migrations, constraints, indexes, rollback notes, and RLS policy tests.
---
# Migration Safety

- Never edit an applied migration.
- State ownership and access matrix first.
- Add constraints and indexes deliberately.
- Make destructive changes multi-step.
- Include RLS positive and negative tests.
- Regenerate types.
- Record rollback and deployment order.
