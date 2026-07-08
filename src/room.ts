export const BACKEND_WS_URL = 'wss://planning-poker-backend-ymq7.onrender.com/ws';
export const DEFAULT_DISPLAY_NAME = 'Fellowship Host';
export const DISPLAY_NAME_MAX_LENGTH = 32;
export const ROOM_ID_PATTERN = /^[a-z0-9]{4,32}(-[a-z0-9]{4,32})*$/;

export type RoomUser = {
  id: string;
  name: string;
  hasVoted: boolean;
};

export type RoomState = {
  hostId: string;
  revealed: boolean;
  users: RoomUser[];
  votes: Record<string, string> | null;
};

export type ServerMessage =
  | { type: 'welcome'; userId: string }
  | ({ type: 'state' } & RoomState)
  | { type: 'error'; message: string };

const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateRoomId(): string {
  return `${randomSegment()}-${randomSegment()}`;
}

export function ensureRoomInUrl(location: Location, history: History): string {
  const url = new URL(location.href);
  const existingRoom = url.searchParams.get('room');

  if (existingRoom && ROOM_ID_PATTERN.test(existingRoom)) {
    return existingRoom;
  }

  const roomId = generateRoomId();
  url.searchParams.set('room', roomId);
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);

  return roomId;
}

export function createRoomSocket(roomId: string, displayName = DEFAULT_DISPLAY_NAME): WebSocket {
  const url = new URL(BACKEND_WS_URL);
  url.searchParams.set('room', roomId);
  url.searchParams.set('name', displayName);

  return new WebSocket(url.toString());
}

function randomSegment(length = 4): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);

  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('');
}