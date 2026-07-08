# Tasks

- [x] 1.1 Add `"red"` to the client-side deck definition in `src/deck.ts` (create file if it does not exist)
- [x] 2.1 Create `src/components/CardPicker` component that renders one button per deck value, accepting `deck: string[]` and `onVote: (value: string) => void` props
- [x] 2.2 Style the red card button distinctively (e.g. red background or red-card icon) when `value === "red"`
- [x] 2.3 Apply selected state styling to the card the participant has clicked
- [x] 3.1 Create `src/hooks/useVote.ts` hook that sends `{ type: "vote", value }` over the WebSocket when called
- [x] 4.1 Create `src/components/VotingBoard` component that renders `hasVoted` indicators pre-reveal and full vote values post-reveal
- [x] 4.2 Render the red card value with distinctive styling (e.g. class `card--red` or `data-card-value="red"`) in the post-reveal view
- [x] 5.1 Wire `CardPicker` and `useVote` together in the session page/view so clicking a card dispatches the vote
- [x] 9.1 Run every Verify command in bdd.md; all must pass
- [x] 9.2 Update docs if user-facing behaviour changed
- [ ] 9.3 Create the PR
