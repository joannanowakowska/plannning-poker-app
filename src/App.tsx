import { type FormEvent, useEffect, useRef, useState } from 'react';
import { createRoomSocket, DISPLAY_NAME_MAX_LENGTH, ensureRoomInUrl, type RoomState, type ServerMessage } from './room.ts';
import aragornImage from '../assets/characters/aragorn.png';
import gandalfImage from '../assets/characters/gandalf.png';
import gimliImage from '../assets/characters/gimli.png';
import legolasImage from '../assets/characters/legolas.png';
import pippinImage from '../assets/characters/pippin.png';
import sauronImage from '../assets/characters/sauron.png';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'failed';

const statusLabels: Record<ConnectionStatus, string> = {
  connecting: 'Opening the council room',
  connected: 'Room opened',
  disconnected: 'Connection closed',
  failed: 'Connection failed',
};

const characterCards = [
  { name: 'Pippin', size: 'X-Small', image: pippinImage },
  { name: 'Gimli', size: 'Small', image: gimliImage },
  { name: 'Aragorn', size: 'Medium', image: aragornImage },
  { name: 'Legolas', size: 'Large', image: legolasImage },
  { name: 'Gandalf', size: 'X-Large', image: gandalfImage },
  { name: 'Sauron', size: 'Gargantuan', image: sauronImage },
] as const;

export function App() {
  const [roomId] = useState(() => ensureRoomInUrl(window.location, window.history));
  const [displayName, setDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [joinedDisplayName, setJoinedDisplayName] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const autoRevealRequestedRef = useRef(false);
  const shareableLink = window.location.href;

  useEffect(() => {
    if (!joinedDisplayName) {
      return;
    }

    let isActive = true;
    const socket = createRoomSocket(roomId, joinedDisplayName);
    socketRef.current = socket;

    const updateStatus = (status: ConnectionStatus) => {
      if (isActive) {
        setConnectionStatus(status);
      }
    };

    setConnectionStatus('connecting');
    socket.addEventListener('open', () => updateStatus('connected'));
    socket.addEventListener('close', () => updateStatus('disconnected'));
    socket.addEventListener('error', () => updateStatus('failed'));
    socket.addEventListener('message', (event) => {
      if (!isActive) {
        return;
      }

      const message = JSON.parse((event as MessageEvent<string>).data) as ServerMessage;

      if (message.type === 'welcome') {
        setCurrentUserId(message.userId);
      }

      if (message.type === 'state') {
        setRoomState({
          hostId: message.hostId,
          revealed: message.revealed,
          users: message.users,
          votes: message.votes,
        });
      }

      if (message.type === 'error') {
        setServerError(message.message);
      }
    });

    return () => {
      isActive = false;
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
      socket.close();
    };
  }, [roomId, joinedDisplayName]);

  useEffect(() => {
    if (!roomState || roomState.revealed) {
      autoRevealRequestedRef.current = false;
      return;
    }

    const allCurrentParticipantsVoted = roomState.users.length > 0 && roomState.users.every((user) => user.hasVoted);

    if (!allCurrentParticipantsVoted) {
      autoRevealRequestedRef.current = false;
      return;
    }

    if (!autoRevealRequestedRef.current) {
      autoRevealRequestedRef.current = true;
      socketRef.current?.send(JSON.stringify({ type: 'reveal' }));
    }
  }, [roomState]);

  useEffect(() => {
    if (!roomState || roomState.revealed || !currentUserId) {
      return;
    }

    const currentUser = roomState.users.find((user) => user.id === currentUserId);

    if (currentUser && !currentUser.hasVoted) {
      setSelectedCharacter(null);
    }
  }, [currentUserId, roomState]);

  const handleJoinRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedDisplayName = displayName.trim();

    if (trimmedDisplayName.length < 1 || trimmedDisplayName.length > DISPLAY_NAME_MAX_LENGTH) {
      setDisplayNameError('Enter a display name between 1 and 32 characters.');
      return;
    }

    setDisplayNameError('');
    setCurrentUserId(null);
    setRoomState(null);
    setSelectedCharacter(null);
    autoRevealRequestedRef.current = false;
    setServerError('');
    setJoinedDisplayName(trimmedDisplayName);
  };

  const handleVote = (characterName: string) => {
    if (roomState?.revealed || connectionStatus !== 'connected') {
      return;
    }

    setSelectedCharacter(characterName);
    socketRef.current?.send(JSON.stringify({ type: 'vote', value: characterName }));
  };

  const handleRevealVotes = () => {
    if (!roomState || roomState.revealed || currentUserId !== roomState.hostId || connectionStatus !== 'connected') {
      return;
    }

    socketRef.current?.send(JSON.stringify({ type: 'reveal' }));
  };

  const handleResetRoom = () => {
    if (!roomState || !roomState.revealed || currentUserId !== roomState.hostId || connectionStatus !== 'connected') {
      return;
    }

    socketRef.current?.send(JSON.stringify({ type: 'reset' }));
  };

  if (!joinedDisplayName) {
    return (
      <main className="app-shell">
        <section className="room-panel" aria-labelledby="room-heading">
          <p className="eyebrow">The Invitation</p>
          <h1 id="room-heading">The Fellowship Estimates</h1>
          <p className="intro">Enter your display name to join the planning room.</p>

          <dl className="room-details">
            <div>
              <dt>Room</dt>
              <dd>{roomId}</dd>
            </div>
          </dl>

          <form className="join-form" onSubmit={handleJoinRoom} noValidate>
            <label htmlFor="display-name">Display name</label>
            <input
              id="display-name"
              maxLength={DISPLAY_NAME_MAX_LENGTH + 1}
              onChange={(event) => setDisplayName(event.currentTarget.value)}
              value={displayName}
              aria-describedby={displayNameError ? 'display-name-error' : undefined}
              aria-invalid={displayNameError ? 'true' : 'false'}
            />
            {displayNameError ? (
              <p className="form-error" id="display-name-error">
                {displayNameError}
              </p>
            ) : null}
            <button type="submit">Join room</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="room-panel" aria-labelledby="room-heading">
        <p className="eyebrow">The Invitation</p>
        <h1 id="room-heading">The Fellowship Estimates</h1>
        <p className="intro">Your planning poker room is ready. Share this link to invite the team.</p>

        <dl className="room-details">
          <div>
            <dt>Room</dt>
            <dd>{roomId}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{statusLabels[connectionStatus]}</dd>
          </div>
          <div>
            <dt>You</dt>
            <dd>{joinedDisplayName}</dd>
          </div>
        </dl>

        {serverError ? <p className="form-error">{serverError}</p> : null}

        <section className="participants" aria-labelledby="participants-heading">
          <h2 id="participants-heading">Participants</h2>
          {roomState ? (
            <ul>
              {roomState.users.map((user) => {
                const participantLabels = [
                  user.id === currentUserId ? 'You' : null,
                  user.id === roomState.hostId ? 'Host' : null,
                  user.hasVoted ? 'Voted' : null,
                ].filter(Boolean);
                const revealedVote = roomState.revealed ? (roomState.votes?.[user.id] ?? 'No vote') : null;

                return (
                  <li key={user.id}>
                    <span className="participant-summary">
                      <span>{user.name}</span>
                      <small>{participantLabels.join(' · ')}</small>
                    </span>
                    {revealedVote ? <strong className="vote-value">{revealedVote}</strong> : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="empty-state">Waiting for the room roster.</p>
          )}
        </section>

        <section className="voting-deck" aria-labelledby="voting-heading">
          <div className="section-heading-row">
            <h2 id="voting-heading">Cast your vote</h2>
            {roomState?.revealed ? <p>Voting closed</p> : null}
            {roomState && !roomState.revealed && currentUserId === roomState.hostId ? (
              <button disabled={connectionStatus !== 'connected'} onClick={handleRevealVotes} type="button">
                Reveal votes
              </button>
            ) : null}
            {roomState?.revealed && currentUserId === roomState.hostId ? (
              <button disabled={connectionStatus !== 'connected'} onClick={handleResetRoom} type="button">
                Reset room
              </button>
            ) : null}
          </div>
          <div className="character-grid">
            {characterCards.map((card) => {
              const isSelected = selectedCharacter === card.name;
              const isDisabled = roomState?.revealed || connectionStatus !== 'connected';

              return (
                <button
                  aria-pressed={isSelected}
                  className="character-card"
                  disabled={isDisabled}
                  key={card.name}
                  onClick={() => handleVote(card.name)}
                  type="button"
                >
                  <img alt={`${card.name} character portrait`} src={card.image} />
                  <span>{card.name}</span>
                  <small>{card.size}</small>
                </button>
              );
            })}
          </div>
        </section>

        <label className="invite-label" htmlFor="invite-link">
          Shareable room link
        </label>
        <input id="invite-link" readOnly value={shareableLink} onFocus={(event) => event.currentTarget.select()} />
      </section>
    </main>
  );
}