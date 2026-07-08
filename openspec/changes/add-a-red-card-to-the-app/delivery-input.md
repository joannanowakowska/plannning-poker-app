# Delivery Input

> Generated from the source Jira ticket. Do not edit by hand.
> Regenerated on ticket resync; delivery decisions belong in refinement.md.

## Title

Add a red card to the app

## Business Goal

As the Planning Poker Developer, I want to play a red card during a planning poker session so that I can signal to the team that I don't understand the story and need more information before estimating, prompting a discussion rather than a guess.

## Scope

- Add a red card to the card deck available to each participant in a session
- Display the red card immediately on the board when a participant plays it, before the facilitator reveals all votes
- Treat the red card as a purely visual signal; no automated action is triggered

## Acceptance Direction

- A red card is available alongside the standard numeric cards for every participant
- When a participant plays the red card, it is visible to all other participants immediately (not deferred until reveal)
- Playing the red card does not automatically pause, reset, or otherwise affect the session flow
- The red card is a visual signal only; the facilitator decides the next action

## Constraints

- No changes to the backend API are permitted as part of this change
- The red card must not trigger any automated session behaviour

## Dependencies

No dependencies.

## Source Link

Ticket key: AIA-37
Source file: `.backlog/remote/epic-AIA-37-add-a-red-card-to-the-app.ticket`

## Supporting Materials

No supporting materials.
