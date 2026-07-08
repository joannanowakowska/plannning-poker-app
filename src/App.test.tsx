import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
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

  it('generates a room, updates the browser URL, and opens a backend websocket', () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    const roomId = new URL(window.location.href).searchParams.get('room');
    const activeSocket = MockWebSocket.instances.at(-1);

    expect(roomId).toMatch(ROOM_ID_PATTERN);
    expect(screen.getByText(roomId!)).toBeInTheDocument();
    expect(screen.getByLabelText('Shareable room link')).toHaveValue(window.location.href);
    expect(activeSocket?.url).toBe(
      `wss://planning-poker-backend-ymq7.onrender.com/ws?room=${roomId}&name=Fellowship+Host`,
    );
  });

  it('ignores stale close events from a cleaned up socket', () => {
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    MockWebSocket.instances[0].dispatchEvent(new Event('close'));

    expect(screen.getByText('Opening the council room')).toBeInTheDocument();
  });
});