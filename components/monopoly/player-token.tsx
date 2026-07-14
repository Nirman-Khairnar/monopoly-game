import { Car, Cat, Crown, Dog, Rocket, Ship } from "lucide-react"
import { PLAYER_TOKENS } from "@/lib/monopoly/board-data"

const ICONS: Record<string, typeof Car> = {
  car: Car,
  dog: Dog,
  cat: Cat,
  ship: Ship,
  crown: Crown,
  rocket: Rocket,
}

export function PlayerTokenIcon({
  tokenIndex,
  size = 16,
  className,
}: {
  tokenIndex: number
  size?: number
  className?: string
}) {
  const token = PLAYER_TOKENS[tokenIndex]
  const Icon = ICONS[token.icon] ?? Car
  return <Icon size={size} style={{ color: token.color }} className={className} aria-hidden="true" />
}

export function PlayerTokenBadge({ tokenIndex, size = 20 }: { tokenIndex: number; size?: number }) {
  const token = PLAYER_TOKENS[tokenIndex]
  return (
    <span
      className="inline-flex items-center justify-center rounded-full border-2 bg-card shadow-sm"
      style={{ borderColor: token.color, width: size + 8, height: size + 8 }}
      title={token.label}
    >
      <PlayerTokenIcon tokenIndex={tokenIndex} size={size} />
    </span>
  )
}
