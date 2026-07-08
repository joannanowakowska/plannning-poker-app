# delivery-lite

Minimal OpenSpec schema for ticket delivery: import the ticket, refine the goal, define BDD acceptance scenarios, implement against a tracked task list. It is the project default (see `openspec/config.yaml`).

## Workflow

`delivery-input` (generated from `.backlog/remote/*.ticket`) → `refinement` (goal, technical decisions, developer-confirmed affected areas) → `bdd` (developer-approved Gherkin scenarios with Verify commands) → `tasks` (ordered checklist tracked by `openspec apply`).

## Known trade-off: no living spec library

Unlike the built-in `spec-driven` schema, this workflow produces no delta specs. The contract for each change is the ticket plus `bdd.md`, and both stay inside the change folder. As a result, archiving a delivery-lite change never updates `openspec/specs/`, and `openspec-sync-specs` has nothing to sync. If you need specs that outlast individual tickets, add a delta-spec artifact modelled on the `specs` artifact in `spec-driven`.
