# Acceptance scenarios

```gherkin
Feature: Red card in planning poker deck

Scenario: Red card appears in the deck alongside numeric cards
  Given a participant opens the card picker in an active session
  When the deck is rendered
  Then a red card option is visible in the deck alongside the standard numeric cards

Verify: `grep -r '"red"' src/deck.ts` → exits 0 and prints a line containing `"red"`

Scenario: Participant selects the red card and it is shown immediately in their own view
  Given a participant is in an active session and has not yet voted
  When the participant clicks the red card
  Then the red card is marked as selected in the participant's own UI without waiting for the host to reveal votes

Verify: Component test — render `<CardPicker deck={[...,"red"]} onVote={spy} />`, simulate click on the red card button, assert `spy` was called with `"red"` and the red card element has the selected state class/attribute

Scenario: Red card value is transmitted as a vote over the WebSocket
  Given a participant has clicked the red card
  When the vote is dispatched
  Then a WebSocket message `{ "type": "vote", "value": "red" }` is sent to the server

Verify: Unit test on `useVote` (or equivalent) — mock the WebSocket, call `sendVote("red")`, assert the mock received exactly `{ type: "vote", value: "red" }`

Scenario: Red card is shown distinctively to all participants after the host reveals votes
  Given all participants have voted and one participant played the red card
  When the host triggers vote reveal
  Then the red card voter's card is rendered with a visually distinct treatment (e.g. red background or red-card icon) in the VotingBoard for all participants

Verify: Component test — render `<VotingBoard votes={{ user1: "5", user2: "red" }} revealed={true} />`, assert the element for `user2` has the CSS class or data attribute indicating the red-card style (e.g. `data-card-value="red"` or class `card--red`)

Scenario: Red card is hidden from other participants before reveal, consistent with all other votes
  Given a participant has played the red card
  When the session state is broadcast with `hasVoted: true` and votes not yet revealed
  Then other participants see only that the participant has voted, not the value "red"

Verify: Component test — render `<VotingBoard votes={null} hasVoted={{ user1: true }} revealed={false} />`, assert no element contains the text `"red"` or the red-card style

Scenario: Playing the red card does not trigger automated session behaviour
  Given a participant plays the red card
  When the vote is dispatched
  Then no pause, reset, or notification action is triggered in the client

Verify: Unit test — mock session state handlers, call `sendVote("red")`, assert none of `pause`, `reset`, or `notify` handlers were called
```

<!-- APPROVED BY DEVELOPER: yes -->
