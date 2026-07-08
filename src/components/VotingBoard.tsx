import './VotingBoard.css'

interface User {
  id: string
  name: string
  hasVoted: boolean
}

interface VotingBoardProps {
  users: User[]
  votes: Record<string, string> | null
  revealed: boolean
}

export function VotingBoard({ users, votes, revealed }: VotingBoardProps) {
  return (
    <div className="voting-board">
      {users.map((user) => (
        <div key={user.id} className="voting-board__user">
          <span className="voting-board__name">{user.name}</span>
          <span
            className={[
              'voting-board__card',
              revealed && votes?.[user.id] === 'red' ? 'card--red' : '',
              !revealed && user.hasVoted ? 'voting-board__card--voted' : '',
              !revealed && !user.hasVoted ? 'voting-board__card--waiting' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-card-value={revealed ? (votes?.[user.id] ?? '') : undefined}
          >
            {revealed
              ? votes?.[user.id] === 'red'
                ? '🚩'
                : (votes?.[user.id] ?? '–')
              : user.hasVoted
                ? '✓'
                : '…'}
          </span>
        </div>
      ))}
    </div>
  )
}
