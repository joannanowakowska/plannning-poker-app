import { type FormEvent, useEffect, useState } from 'react';
import { createRoomSocket, DISPLAY_NAME_MAX_LENGTH, ensureRoomInUrl, type RoomState, type ServerMessage } from './room.ts';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'failed';

const statusLabels: Record<ConnectionStatus, string> = {
  connecting: 'Opening the council room',
  connected: 'Room opened',
  disconnected: 'Connection closed',
  failed: 'Connection failed',
};

export function App() {
  const [roomId] = useState(() => ensureRoomInUrl(window.location, window.history));
  const [displayName, setDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [joinedDisplayName, setJoinedDisplayName] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [serverError, setServerError] = useState('');
  const shareableLink = window.location.href;

  useEffect(() => {
    if (!joinedDisplayName) {
      return;
    }

    let isActive = true;
    const socket = createRoomSocket(roomId, joinedDisplayName);

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
      socket.close();
    };
  }, [roomId, joinedDisplayName]);

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
    setServerError('');
    setJoinedDisplayName(trimmedDisplayName);
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
              {roomState.users.map((user) => (
                <li key={user.id}>
                  <span>{user.name}</span>
                  <small>
                    {user.id === currentUserId ? 'You' : null}
                    {user.id === currentUserId && user.id === roomState.hostId ? ' · ' : null}
                    {user.id === roomState.hostId ? 'Host' : null}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Waiting for the room roster.</p>
          )}
        </section>

        <label className="invite-label" htmlFor="invite-link">
          Shareable room link
        </label>
        <input id="invite-link" readOnly value={shareableLink} onFocus={(event) => event.currentTarget.select()} />
      </section>
    </main>
  );
}