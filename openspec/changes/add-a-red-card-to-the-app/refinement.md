# Refinement

## Goal
A participant in a planning poker session can select a red card from the deck; upon selection, the red card is displayed on their own view immediately, and it is visible to all other participants once the host reveals votes.

## Technical decisions
- The red card is represented as a fixed string vote value (e.g. `"?"` is already a common special card; use a distinct value such as `"red"` to avoid collisions with standard deck values).
- The backend API accepts any string vote value (1–64 chars); no backend changes are required.
- **Immediate display scope:** The `state` message hides all vote values pre-reveal (`votes: null`); only `hasVoted: true` is broadcast. The red card cannot be shown to other participants before reveal without a backend change. "Immediate display" therefore means: the card is shown at once to the participant who played it (client-side selection state), and it is shown to everyone at the standard reveal step. This is consistent with the no-backend-changes constraint.
- The red card is added to the client-side deck definition alongside the standard numeric cards. Deck composition is entirely client-controlled.
- No automated session behaviour (pause, reset, notification) is triggered when the red card is played.

## Affected areas
The project has no source code yet; implementation is greenfield. The areas below are derived from the API contract and will need to be created.

| Area | File (to be created) | Pattern | Why in scope |
|---|---|---|---|
| Deck definition | `src/deck.ts` (or equivalent) | Array of card values passed to the UI | Red card string value must be added here |
| Card selection UI | `src/components/CardPicker.*` | Renders one button/card per deck value | Must render the red card alongside numeric cards |
| Vote dispatch | `src/hooks/useVote.ts` (or equivalent) | Sends `{ type: "vote", value }` over WebSocket | Red card value must pass through unchanged |
| Vote display (pre-reveal) | `src/components/VotingBoard.*` | Shows `hasVoted` indicator per user | No change needed; red card is hidden pre-reveal like any other vote |
| Vote display (post-reveal) | `src/components/VotingBoard.*` | Renders `votes[userId]` value per user at reveal | Must render the red card value distinctively (e.g. red background/icon) |

<!-- CONFIRMED BY DEVELOPER: yes -->

## Out of scope
- Automatically pausing or resetting the voting round when the red card is played
- Sending notifications or prompts to the facilitator
- Showing the red card to other participants before the host reveals votes
- Any backend API changes
