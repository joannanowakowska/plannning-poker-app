import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App.tsx';
import { ROOM_ID_PATTERN } from './room.ts';

class MockWebSocket extends EventTarget {
  static instances: MockWebSocket[] = [];

  url: string;
  close = vi.fn();
  send = vi.fn();

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

    expect(screen.getByText('You')).toBeInTheDocument();
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

    const participants = within(screen.getByRole('region', { name: 'Participants' }));

    expect(participants.getByText('Legolas')).toBeInTheDocument();
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

    expect(participants.queryByText('Gimli')).not.toBeInTheDocument();
    expect(participants.getByText('Host')).toBeInTheDocument();
  });

  it('renders the character deck and sends votes for selected cards before reveal', async () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Merry' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    await waitFor(() => expect(MockWebSocket.instances.length).toBeGreaterThan(0));

    const activeSocket = MockWebSocket.instances.at(-1)!;

    act(() => {
      activeSocket.dispatchEvent(new Event('open'));
      activeSocket.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ type: 'welcome', userId: 'user-1' }) }));
      activeSocket.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({
            type: 'state',
            hostId: 'user-1',
            revealed: false,
            users: [{ id: 'user-1', name: 'Merry', hasVoted: false }],
            votes: null,
          }),
        }),
      );
    });

    await waitFor(() => expect(screen.getByText('Room opened')).toBeInTheDocument());

    const expectedCards = [
      ['Pippin', 'X-Small'],
      ['Gimli', 'Small'],
      ['Aragorn', 'Medium'],
      ['Legolas', 'Large'],
      ['Gandalf', 'X-Large'],
      ['Sauron', 'Gargantuan'],
    ];

    for (const [name, size] of expectedCards) {
      const card = screen.getByRole('button', { name: new RegExp(`${name}.*${size}`) });

      expect(card).toBeEnabled();
      expect(within(card).getByRole('img', { name: `${name} character portrait` })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole('button', { name: /Aragorn.*Medium/ }));

    expect(activeSocket.send).toHaveBeenLastCalledWith(JSON.stringify({ type: 'vote', value: 'Aragorn' }));
    expect(screen.getByRole('button', { name: /Aragorn.*Medium/ })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Gandalf.*X-Large/ }));

    expect(activeSocket.send).toHaveBeenLastCalledWith(JSON.stringify({ type: 'vote', value: 'Gandalf' }));
    expect(screen.getByRole('button', { name: /Aragorn.*Medium/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /Gandalf.*X-Large/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows participant voted indicators without exposing vote values', async () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Frodo' } });
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
              { id: 'user-1', name: 'Frodo', hasVoted: true },
              { id: 'user-2', name: 'Sam', hasVoted: true },
            ],
            votes: null,
          }),
        }),
      );
    });

    const participants = within(screen.getByRole('region', { name: 'Participants' }));

    expect(participants.getByText('You · Host · Voted')).toBeInTheDocument();
    expect(participants.getByText('Voted')).toBeInTheDocument();
    expect(screen.queryByText('Aragorn')).not.toBeNull();
  });

  it('automatically requests reveal after all current participants have voted', async () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Faramir' } });
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
              { id: 'user-1', name: 'Faramir', hasVoted: true },
              { id: 'user-2', name: 'Eowyn', hasVoted: false },
            ],
            votes: null,
          }),
        }),
      );
    });

    expect(activeSocket.send).not.toHaveBeenCalledWith(JSON.stringify({ type: 'reveal' }));

    act(() => {
      activeSocket.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({
            type: 'state',
            hostId: 'user-1',
            revealed: false,
            users: [
              { id: 'user-1', name: 'Faramir', hasVoted: true },
              { id: 'user-2', name: 'Eowyn', hasVoted: true },
            ],
            votes: null,
          }),
        }),
      );
    });

    expect(activeSocket.send).toHaveBeenLastCalledWith(JSON.stringify({ type: 'reveal' }));
  });

  it('shows a reveal button only to the host and sends reveal when clicked', async () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Bilbo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    await waitFor(() => expect(MockWebSocket.instances.length).toBeGreaterThan(0));

    const activeSocket = MockWebSocket.instances.at(-1)!;

    act(() => {
      activeSocket.dispatchEvent(new Event('open'));
      activeSocket.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ type: 'welcome', userId: 'user-1' }) }));
      activeSocket.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({
            type: 'state',
            hostId: 'user-2',
            revealed: false,
            users: [
              { id: 'user-1', name: 'Bilbo', hasVoted: false },
              { id: 'user-2', name: 'Thorin', hasVoted: false },
            ],
            votes: null,
          }),
        }),
      );
    });

    expect(screen.queryByRole('button', { name: 'Reveal votes' })).not.toBeInTheDocument();

    act(() => {
      activeSocket.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({
            type: 'state',
            hostId: 'user-1',
            revealed: false,
            users: [
              { id: 'user-1', name: 'Bilbo', hasVoted: false },
              { id: 'user-2', name: 'Thorin', hasVoted: false },
            ],
            votes: null,
          }),
        }),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reveal votes' }));

    expect(activeSocket.send).toHaveBeenLastCalledWith(JSON.stringify({ type: 'reveal' }));
  });

  it('shows revealed vote values beside participant names and leaves missing votes blank', async () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Galadriel' } });
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
            revealed: true,
            users: [
              { id: 'user-1', name: 'Galadriel', hasVoted: true },
              { id: 'user-2', name: 'Celeborn', hasVoted: false },
            ],
            votes: { 'user-1': 'Legolas' },
          }),
        }),
      );
    });

    const participants = within(screen.getByRole('region', { name: 'Participants' }));
    const currentUser = participants.getByText('Galadriel').closest('li')!;
    const missingVoteUser = participants.getByText('Celeborn').closest('li')!;

    expect(within(currentUser).getByText('Legolas')).toBeInTheDocument();
    expect(within(missingVoteUser).getByText('No vote')).toBeInTheDocument();
  });

  it('disables voting after votes are revealed', async () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Elrond' } });
    fireEvent.click(screen.getByRole('button', { name: 'Join room' }));

    await waitFor(() => expect(MockWebSocket.instances.length).toBeGreaterThan(0));

    const activeSocket = MockWebSocket.instances.at(-1)!;

    act(() => {
      activeSocket.dispatchEvent(new Event('open'));
      activeSocket.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ type: 'welcome', userId: 'user-1' }) }));
      activeSocket.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({
            type: 'state',
            hostId: 'user-1',
            revealed: true,
            users: [{ id: 'user-1', name: 'Elrond', hasVoted: false }],
            votes: { 'user-1': 'Pippin' },
          }),
        }),
      );
    });

    await waitFor(() => expect(screen.getByText('Room opened')).toBeInTheDocument());

    const pippinCard = screen.getByRole('button', { name: /Pippin.*X-Small/ });

    expect(screen.getByText('Voting closed')).toBeInTheDocument();
    expect(pippinCard).toBeDisabled();

    fireEvent.click(pippinCard);

    expect(activeSocket.send).not.toHaveBeenCalled();
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
