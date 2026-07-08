import { useCallback, useEffect, useRef, useState } from 'react'
import { CardPicker } from './components/CardPicker'
import { VotingBoard } from './components/VotingBoard'
import { useVote } from './hooks/useVote'
import { DECK } from './deck'

interface User {
  id: string
  name: string
  hasVoted: boolean
}

interface StateMessage {
  type: 'state'
  hostId: string
  revealed: boolean
  users: User[]
  votes: Record<string, string> | null
}

const WS_URL = 'wss://planning-poker-backend-ymq7.onrender.com/ws'

function buildWsUrl(room: string, name: string) {
  return `${WS_URL}?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`
}

export function SessionPage({ room, name }: { room: string; name: string }) {
  const wsRef = useRef<WebSocket | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [myId, setMyId] = useState<string | null>(null)
  const [gameState, setGameState] = useState<Omit<StateMessage, 'type'> | null>(null)
  const [selectedValue, setSelectedValue] = useState<string | undefined>()

  const { sendVote } = useVote(ws)

  useEffect(() => {
    const socket = new WebSocket(buildWsUrl(room, name))
    wsRef.current = socket
    setWs(socket)

    socket.onmessage = (event: MessageEvent) => {
      const msg = JSON.parse(event.data as string) as
        | { type: 'welcome'; userId: string }
        | StateMessage

      if (msg.type === 'welcome') {
        setMyId(msg.userId)
      } else if (msg.type === 'state') {
        const { type: _type, ...state } = msg
        setGameState(state)
        if (state.revealed) {
          setSelectedValue(undefined)
        }
      }
    }

    return () => {
      socket.close()
    }
  }, [room, name])

  const handleVote = useCallback(
    (value: string) => {
      setSelectedValue(value)
      sendVote(value)
    },
    [sendVote],
  )

  const handleReveal = useCallback(() => {
    ws?.send(JSON.stringify({ type: 'reveal' }))
  }, [ws])

  const handleReset = useCallback(() => {
    ws?.send(JSON.stringify({ type: 'reset' }))
    setSelectedValue(undefined)
  }, [ws])

  if (!gameState) {
    return <p>Connecting…</p>
  }

  const isHost = myId === gameState.hostId

  return (
    <div className="session">
      <h2>Room: {room}</h2>
      <VotingBoard
        users={gameState.users}
        votes={gameState.votes}
        revealed={gameState.revealed}
      />
      {!gameState.revealed && (
        <CardPicker deck={DECK} selectedValue={selectedValue} onVote={handleVote} />
      )}
      {isHost && (
        <div className="session__controls">
          {!gameState.revealed ? (
            <button onClick={handleReveal}>Reveal votes</button>
          ) : (
            <button onClick={handleReset}>New round</button>
          )}
        </div>
      )}
    </div>
  )
}
