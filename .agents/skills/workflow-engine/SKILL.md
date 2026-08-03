---
name: workflow-engine
description: Implements auditable school request and approval workflows with versioned forms, sequential review, authorization, and complete status history.
---

# Workflow Engine

1. Read `docs/WORKFLOW_ENGINE_SPEC.md`.
2. Build sequential workflow MVP before conditional branching.
3. Bind every instance to an immutable workflow version.
4. Resolve approver authorization on the server/database, never from client claims.
5. Record append-only audit events for every meaningful transition.
6. Include revision loops, cancellation, errors, and overdue states.
7. Test cross-school isolation and unauthorized transitions.
