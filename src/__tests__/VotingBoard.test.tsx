import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VotingBoard } from '../components/VotingBoard'

const users = [
  { id: 'user1', name: 'Alice', hasVoted: true },
  { id: 'user2', name: 'Bob', hasVoted: true },
]

describe('BDD: VotingBoard', () => {
  it('Scenario 4: renders red card with card--red class and data-card-value="red" after reveal', () => {
    render(
      <VotingBoard
        users={users}
        votes={{ user1: '5', user2: 'red' }}
        revealed={true}
      />,
    )
    const redCard = document.querySelector('[data-card-value="red"]')
    expect(redCard).toBeInTheDocument()
    expect(redCard).toHaveClass('card--red')
  })

  it('Scenario 5: red card value is hidden from others before reveal', () => {
    render(
      <VotingBoard
        users={users}
        votes={null}
        revealed={false}
      />,
    )
    // No element should contain "red" text or the red-card style
    expect(screen.queryByText('red')).not.toBeInTheDocument()
    expect(document.querySelector('.card--red')).not.toBeInTheDocument()
    expect(document.querySelector('[data-card-value="red"]')).not.toBeInTheDocument()
  })
})
