import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVote } from '../hooks/useVote'

function makeMockWs() {
  return {
    readyState: WebSocket.OPEN,
    send: vi.fn(),
  } as unknown as WebSocket
}

describe('BDD: useVote hook', () => {
  it('Scenario 3: sends { type: "vote", value: "red" } over WebSocket', () => {
    const mockWs = makeMockWs()
    const { result } = renderHook(() => useVote(mockWs))
    act(() => {
      result.current.sendVote('red')
    })
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ type: 'vote', value: 'red' }))
  })

  it('Scenario 6: playing the red card does not call pause, reset, or notify handlers', () => {
    const pause = vi.fn()
    const reset = vi.fn()
    const notify = vi.fn()
    const mockWs = makeMockWs()
    const { result } = renderHook(() => useVote(mockWs))
    act(() => {
      result.current.sendVote('red')
    })
    expect(pause).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
    expect(notify).not.toHaveBeenCalled()
  })
})
