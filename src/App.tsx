import { useEffect, useState } from 'react';
import { createRoomSocket, ensureRoomInUrl } from './room.ts';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'failed';

const statusLabels: Record<ConnectionStatus, string> = {
  connecting: 'Opening the council room',
  connected: 'Room opened',
  disconnected: 'Connection closed',
  failed: 'Connection failed',
};

export function App() {
  const [roomId] = useState(() => ensureRoomInUrl(window.location, window.history));
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const shareableLink = window.location.href;

  useEffect(() => {
    let isActive = true;
    const socket = createRoomSocket(roomId);

    const updateStatus = (status: ConnectionStatus) => {
      if (isActive) {
        setConnectionStatus(status);
      }
    };

    setConnectionStatus('connecting');
    socket.addEventListener('open', () => updateStatus('connected'));
    socket.addEventListener('close', () => updateStatus('disconnected'));
    socket.addEventListener('error', () => updateStatus('failed'));

    return () => {
      isActive = false;
      socket.close();
    };
  }, [roomId]);

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
        </dl>

        <label className="invite-label" htmlFor="invite-link">
          Shareable room link
        </label>
        <input id="invite-link" readOnly value={shareableLink} onFocus={(event) => event.currentTarget.select()} />
      </section>
    </main>
  );
}