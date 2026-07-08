# AIA-56 Epic Breakdown Notes

## Session Summary

**Epic:** AIA-56 — Implement Planning Poker Web Application
**Date:** 2026-07-08

---

## Decisions Made

### Splitting Pattern

**Operations** was chosen as the splitting pattern. The epic describes a set of discrete, independently demoable actions a participant or host can perform within a planning poker session. Slicing by operation gives each story a clear, bounded scope.

Workflow Steps was considered but rejected in favour of Operations, which gives finer-grained, independently testable slices.

### Spike

No spike story was added. The backend WebSocket API contract is already defined and considered well-understood enough to build against directly without a prior investigation spike.

---

## Proposed Stories

| # | Title | Blocked by |
|---|-------|------------|
| 1 | Create a room and get a shareable link | — |
| 2 | Join a room with a display name | 1 |
| 3 | Cast a vote using the character deck | 2 |
| 4 | Reveal votes to all participants | 3 |
| 5 | Reset the room for the next round | 4 |
| 6 | Host handover and participant reconnection | 2 |

Stories are ordered from most independent to most dependent. Stories 1–2 form the foundational join flow. Stories 3–5 follow the voting lifecycle. Story 6 covers connection edge-case behaviour and depends only on participants being in a room (story 2).

---

## Open Questions

- None at the time of breakdown.

---

## Fields Still to Set

The following fields must be set per story via the structured editor in VS Code after creation in Jira:

- **Bucket** (`bucketId`) — not set on the breakdown file
- **Acceptance criteria** — to be added per story after Jira creation
- **Draft flag** — to be toggled when ready to publish
