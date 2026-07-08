import './CardPicker.css'

interface CardPickerProps {
  deck: string[]
  selectedValue?: string
  onVote: (value: string) => void
}

export function CardPicker({ deck, selectedValue, onVote }: CardPickerProps) {
  return (
    <div className="card-picker">
      {deck.map((value) => (
        <button
          key={value}
          className={[
            'card',
            value === 'red' ? 'card--red' : '',
            value === selectedValue ? 'card--selected' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          data-card-value={value}
          onClick={() => onVote(value)}
        >
          {value === 'red' ? '🚩' : value}
        </button>
      ))}
    </div>
  )
}
