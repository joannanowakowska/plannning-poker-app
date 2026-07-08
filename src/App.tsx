import { useState } from 'react'
import { SessionPage } from './SessionPage'

function randomRoomId() {
  return Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 6)
}

export function App() {
  const [session, setSession] = useState<{ room: string; name: string } | null>(null)
  const [name, setName] = useState('')
  const [room, setRoom] = useState(randomRoomId)

  if (session) {
    return <SessionPage room={session.room} name={session.name} />
  }

  return (
    <div className="join">
      <h1>Planning Poker</h1>
      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button
        disabled={!name.trim() || !room.trim()}
        onClick={() => setSession({ room: room.trim(), name: name.trim() })}
      >
        Join
      </button>
    </div>
  )
}
