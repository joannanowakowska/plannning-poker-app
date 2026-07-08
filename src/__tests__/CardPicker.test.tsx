import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardPicker } from '../components/CardPicker'
import { DECK } from '../deck'

describe('BDD: Red card in planning poker deck', () => {
  it('Scenario 1: red card appears in the deck alongside numeric cards', () => {
    render(<CardPicker deck={DECK} onVote={() => {}} />)
    // The red card button must be present
    const redCard = screen.getByRole('button', { name: '🚩' })
    expect(redCard).toBeInTheDocument()
    expect(redCard).toHaveAttribute('data-card-value', 'red')
    // A numeric card must also be present
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument()
  })

  it('Scenario 2: selecting the red card calls onVote with "red" and marks it selected', async () => {
    const spy = vi.fn()
    render(<CardPicker deck={DECK} onVote={spy} />)
    const redCard = screen.getByRole('button', { name: '🚩' })
    await userEvent.click(redCard)
    expect(spy).toHaveBeenCalledWith('red')
  })

  it('Scenario 2: selected card receives selected class', async () => {
    const spy = vi.fn()
    const { rerender } = render(<CardPicker deck={DECK} onVote={spy} />)
    const redCard = screen.getByRole('button', { name: '🚩' })
    await userEvent.click(redCard)
    // Re-render with selectedValue set (as SessionPage would do)
    rerender(<CardPicker deck={DECK} onVote={spy} selectedValue="red" />)
    expect(screen.getByRole('button', { name: '🚩' })).toHaveClass('card--selected')
  })
})
