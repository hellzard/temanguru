# Plan Wave

Description: Turn the earliest incomplete implementation wave into safe, testable vertical slices.

1. Read status, waves, tasks, PRD, architecture, and acceptance matrix.
2. Identify the earliest incomplete wave.
3. Verify exit criteria and dependencies.
4. Split it into the smallest end-to-end vertical slices.
5. For each slice, list UI, data, authorization, states, tests, browser checks, and rollback.
6. Mark one slice active in `docs/IMPLEMENTATION_STATUS.md`.
7. Do not implement more than one active slice at a time.
