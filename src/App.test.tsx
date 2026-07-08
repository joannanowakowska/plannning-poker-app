import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App.tsx';
import { ROOM_ID_PATTERN } from './room.ts';

class MockWebSocket extends EventTarget {
  static instances: MockWebSocket[] = [];

  url: string;
  close = vi.fn();

  constructor(url: string) {
    super();
    this.url = url;
    MockWebSocket.instances.push(this);
  }
}

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('generates a room, prompts for a display name, and opens a backend websocket after submit', async () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    const roomId = new URL(window.location.href).searchParams.get('room');

    expect(roomId).toMatch(ROOM_ID_PATTERN);
    expect(screen.getByText(roomId!)).toBeInTheDocument();
    expect(screen.getByLabelText('Display name')).toBeInTheDocument();
    expect(MockWebSocket.instances).toHaveLength(0);

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: '  Aragorn  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    await waitFor(() => expect(MockWebSocket.instances.length).toBeGreaterThan(0));

    const activeSocket = MockWebSocket.instances.at(-1);

    expect(screen.getByText('Aragorn')).toBeInTheDocument();
    expect(screen.getByLabelText('Shareable room link')).toHaveValue(window.location.href);
    expect(activeSocket?.url).toBe(
      `wss://planning-poker-backend-ymq7.onrender.com/ws?room=${roomId}&name=Aragorn`,
    );
  });

  it('rejects display names outside the 1 to 32 character trimmed limit', () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    expect(screen.getByText('Enter a display name between 1 and 32 characters.')).toBeInTheDocument();
    expect(MockWebSocket.instances).toHaveLength(0);

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'x'.repeat(33) } });
    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    expect(screen.getByText('Enter a display name between 1 and 32 characters.')).toBeInTheDocument();
    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it('stores the welcome user id and replaces the room state from websocket messages', async () => {
    window.history.replaceState({}, '', '/?room=abcd-1234');

    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Gimli' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    await waitFor(() => expect(MockWebSocket.instances.length).toBeGreaterThan(0));

    const activeSocket = MockWebSocket.instances.at(-1)!;

    act(() => {
      activeSocket.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ type: 'welcome', userId: 'user-1' }) }));
      activeSocket.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({
            type: 'state',
            hostId: 'user-1',
            revealed: false,
            users: [
              { id: 'user-1', name: 'Gimli', hasVoted: false },
              { id: 'user-2', name: 'Legolas', hasVoted: false },
            ],
            votes: null,
          }),
        }),
      );
    });

    expect(screen.getByText('Legolas')).toBeInTheDocument();
    expect(screen.getByText('You · Host')).toBeInTheDocument();

    act(() => {
      activeSocket.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({
            type: 'state',
            hostId: 'user-2',
            revealed: false,
            users: [{ id: 'user-2', name: 'Legolas', hasVoted: false }],
            votes: null,
          }),
        }),
      );
    });

    const participants = within(screen.getByRole('region', { name: 'Participants' }));

    expect(participants.queryByText('Gimli')).not.toBeInTheDocument();
    expect(participants.getByText('Host')).toBeInTheDocument();
  });

  it('updates the connection status from the active socket', async () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Boromir' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    await waitFor(() => expect(MockWebSocket.instances.length).toBeGreaterThan(0));

    act(() => {
      MockWebSocket.instances.at(-1)?.dispatchEvent(new Event('open'));
    });

    expect(screen.getByText('Room opened')).toBeInTheDocument();

    act(() => {
      MockWebSocket.instances.at(-1)?.dispatchEvent(new Event('close'));
    });

    expect(screen.getByText('Connection closed')).toBeInTheDocument();
  });
});
