import { describe, expect, it, vi } from 'vitest';
import { createRoomSocket, ensureRoomInUrl, generateRoomId, ROOM_ID_PATTERN } from './room.ts';

describe('generateRoomId', () => {
  it('creates slugs that match the backend room id format', () => {
    expect(generateRoomId()).toMatch(ROOM_ID_PATTERN);
  });

  it('creates different ids across fresh generations', () => {
    const roomIds = new Set(Array.from({ length: 20 }, () => generateRoomId()));

    expect(roomIds.size).toBeGreaterThan(1);
  });
});

describe('ensureRoomInUrl', () => {
  it('adds a generated room query parameter when the URL has no room', () => {
    const history = { replaceState: vi.fn() } as unknown as History;
    const roomId = ensureRoomInUrl(new URL('http://localhost:5173/') as unknown as Location, history);

    expect(roomId).toMatch(ROOM_ID_PATTERN);
    expect(history.replaceState).toHaveBeenCalledWith({}, '', `/?room=${roomId}`);
  });

  it('uses an existing valid room query parameter', () => {
    const history = { replaceState: vi.fn() } as unknown as History;
    const roomId = ensureRoomInUrl(new URL('http://localhost:5173/?room=abcd-1234') as unknown as Location, history);

    expect(roomId).toBe('abcd-1234');
    expect(history.replaceState).not.toHaveBeenCalled();
  });
});

describe('createRoomSocket', () => {
  it('connects to the backend websocket with the room id and display name', () => {
    const webSocket = vi.fn();
    vi.stubGlobal('WebSocket', webSocket);

    createRoomSocket('abcd-1234');

    expect(webSocket).toHaveBeenCalledWith(
      'wss://planning-poker-backend-ymq7.onrender.com/ws?room=abcd-1234&name=Fellowship+Host',
    );

    vi.unstubAllGlobals();
  });
});