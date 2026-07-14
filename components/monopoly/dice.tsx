import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react"

const FACES = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

export function Dice({ value, size = 40 }: { value: number; size?: number }) {
  const Face = FACES[Math.min(5, Math.max(0, value - 1))]
  return (
    <span className="inline-flex items-center justify-center rounded-lg bg-card text-foreground shadow-md" role="img" aria-label={`Die showing ${value}`}>
      <Face size={size} strokeWidth={1.5} aria-hidden="true" />
    </span>
  )
}
