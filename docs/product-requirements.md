# Product Decisions

The goal is to create a simple, easy to use tool which is used to vote on the size of Jira tickets during a planning poker decision.

Primary user flows:
1) Create a room
2) Share room link
3) Join with display name
4) Vote
5) See who has voted
6) Reveal votes
7) Reset for next story
8) Leave / disconnect / reconnect

This will be an MVP product.

MVP non-goals:
- No authentication
- No Jira integration; Jira tickets are discussed manually outside the app
- No saved voting history
- No custom voting decks
- No persistence after everyone leaves a room
- No admin controls beyond host reveal/reset
- No spectator mode
- No comments or discussion inside the app

We will use Lord of the Rings characters for voting, instead of Fibonacci or t-shirt sizing:
X-Small: Pippin
Small: Gimli
Medium: Aragorn
Large: Legolas
X-Large: Gandalf
Gargantuan: Sauron

The vote value sent to the backend is the character name.

Voting buttons should have a photo of that character and their name for accessibility. This assumes appropriate rights or usage approval can be satisfied before public release.

The room should be open to everyone. Anyone can connect with the URL and no authentication. The first client to connect is the host. The host has the ability to reveal scores and reset the voting. If the host disconnects, host status transfers to the oldest remaining participant.

Scores are hidden from other users until everyone has voted OR the host decides to reveal scores. If everyone currently in the room has voted, scores are revealed automatically. The host should have an easy way to reveal scores before everyone has voted.

If a user disconnects and reconnects, they return as a new participant. Their previous vote is lost and they do not regain host status automatically.

Each voting round consists of:
1) Waiting for participants
2) Voting open
3) Some/all users voted
4) Votes revealed
5) Reset / next round

MVP acceptance criteria:
- A user can create a room and get a shareable room link.
- A user can join a room from a shared link with a display name.
- Participants can see who is in the room.
- Participants can cast one vote using the Lord of the Rings character deck.
- Participants can see who has voted before scores are revealed.
- Vote values are hidden until the host reveals scores or all current participants have voted.
- The host can easily reveal scores before everyone has voted.
- Scores reveal automatically when all current participants have voted.
- The host can reset the room for the next ticket.
- If the host disconnects, the oldest remaining participant becomes host.
- If a participant disconnects, their vote is removed.
- If a participant reconnects, they join as a new participant.
