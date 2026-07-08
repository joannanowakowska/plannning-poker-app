import { useCallback } from 'react'

export function useVote(ws: WebSocket | null) {
  const sendVote = useCallback(
    (value: string) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'vote', value }))
      }
    },
    [ws],
  )

  return { sendVote }
}
