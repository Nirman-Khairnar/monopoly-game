"use client"

import { ArrowRight, Car, CircleDollarSign, Gem, Gift, HelpCircle, Home, Hotel, Lightbulb, Lock, TrainFront, Droplets } from "lucide-react"
import { GROUP_COLORS, PLAYER_TOKENS } from "@/lib/monopoly/board-data"
import type { Player, PropertyState, Tile } from "@/lib/monopoly/types"
import { PlayerTokenIcon } from "./player-token"
import { cn } from "@/lib/utils"

type Side = "bottom" | "left" | "top" | "right" | "corner"

function tileSide(id: number): Side {
  if (id === 0 || id === 10 || id === 20 || id === 30) return "corner"
  if (id < 10) return "bottom"
  if (id < 20) return "left"
  if (id < 30) return "top"
  return "right"
}

/** Grid placement for an 11x11 perimeter board */
export function gridPosition(id: number): { row: number; col: number } {
  if (id <= 10) return { row: 11, col: 11 - id } // bottom, right -> left
  if (id <= 20) return { row: 11 - (id - 10), col: 1 } // left, bottom -> top
  if (id <= 30) return { row: 1, col: id - 19 } // top, left -> right
  return { row: id - 29, col: 11 } // right, top -> bottom
}

function TypeIcon({ tile }: { tile: Tile }) {
  const cls = "size-3.5 shrink-0 text-muted-foreground md:size-4"
  switch (tile.type) {
    case "railroad":
      return <TrainFront className={cls} aria-hidden="true" />
    case "utility":
      return tile.id === 12 ? <Lightbulb className={cls} aria-hidden="true" /> : <Droplets className={cls} aria-hidden="true" />
    case "chance":
      return <HelpCircle className="size-4 shrink-0 text-orange-500 md:size-5" aria-hidden="true" />
    case "chest":
      return <Gift className="size-4 shrink-0 text-sky-500 md:size-5" aria-hidden="true" />
    case "tax":
      return tile.id === 4 ? <CircleDollarSign className={cls} aria-hidden="true" /> : <Gem className={cls} aria-hidden="true" />
    default:
      return null
  }
}

export function BoardTile({
  tile,
  propertyState,
  playersHere,
  owner,
  isActiveTile,
  onSelect,
}: {
  tile: Tile
  propertyState?: PropertyState
  playersHere: Player[]
  owner?: Player
  isActiveTile: boolean
  onSelect: () => void
}) {
  const side = tileSide(tile.id)
  const { row, col } = gridPosition(tile.id)
  const groupColor = tile.group ? GROUP_COLORS[tile.group] : undefined
  const houses = propertyState?.houses ?? 0

  const isCorner = side === "corner"

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ gridRow: row, gridColumn: col }}
      className={cn(
        "relative flex min-h-0 min-w-0 flex-col overflow-hidden border border-border/70 bg-card p-0 text-left transition-colors",
        "hover:bg-accent focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-ring",
        isActiveTile && "ring-2 ring-ring ring-offset-1 z-10",
      )}
      aria-label={`${tile.name}${owner ? `, owned by ${owner.name}` : ""}`}
    >
      {/* Color band */}
      {groupColor && (
        <div
          className={cn(
            "shrink-0",
            side === "bottom" && "h-2.5 w-full md:h-3.5",
            side === "top" && "order-last h-2.5 w-full md:h-3.5",
            side === "left" && "absolute right-0 top-0 h-full w-2.5 md:w-3.5",
            side === "right" && "absolute left-0 top-0 h-full w-2.5 md:w-3.5",
          )}
          style={{ backgroundColor: groupColor }}
          aria-hidden="true"
        />
      )}

      {/* Houses / hotel indicator */}
      {houses > 0 && (
        <div
          className={cn(
            "absolute z-10 flex gap-px",
            side === "bottom" && "left-0.5 top-3 md:top-4",
            side === "top" && "bottom-3 left-0.5 md:bottom-4",
            side === "left" && "right-3 top-0.5 flex-col md:right-4",
            side === "right" && "left-3 top-0.5 flex-col md:left-4",
          )}
          aria-label={houses === 5 ? "Hotel" : `${houses} houses`}
        >
          {houses === 5 ? (
            <Hotel className="size-3 text-red-600 md:size-3.5" aria-hidden="true" />
          ) : (
            Array.from({ length: houses }).map((_, i) => (
              <Home key={i} className="size-2.5 text-green-700 md:size-3" aria-hidden="true" />
            ))
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn("flex min-h-0 flex-1 flex-col items-center justify-between gap-0.5 p-0.5 md:p-1", side === "left" && "pr-3 md:pr-4", side === "right" && "pl-3 md:pl-4")}>
        {isCorner ? (
          <CornerContent tile={tile} />
        ) : (
          <>
            <span className="line-clamp-2 w-full text-center text-[7px] font-semibold uppercase leading-tight tracking-tight md:text-[9px]">
              {tile.name}
            </span>
            <TypeIcon tile={tile} />
            {tile.price !== undefined && (
              <span className="text-[7px] font-medium text-muted-foreground md:text-[9px]">${tile.price}</span>
            )}
            {tile.taxAmount !== undefined && (
              <span className="text-[7px] font-medium text-muted-foreground md:text-[9px]">Pay ${tile.taxAmount}</span>
            )}
          </>
        )}
      </div>

      {/* Owner marker */}
      {owner && (
        <span
          className="absolute bottom-0.5 right-0.5 z-10 size-2 rounded-full border border-card md:size-2.5"
          style={{ backgroundColor: PLAYER_TOKENS[owner.tokenIndex].color }}
          title={`Owned by ${owner.name}`}
        />
      )}

      {/* Player tokens */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="flex max-w-full flex-wrap items-center justify-center gap-0">
            {playersHere.map((p) => (
              <span
                key={p.id}
                className="flex size-4 items-center justify-center rounded-full border bg-card/95 shadow md:size-6"
                style={{ borderColor: PLAYER_TOKENS[p.tokenIndex].color }}
                title={p.name}
              >
                <PlayerTokenIcon tokenIndex={p.tokenIndex} size={12} className="md:hidden" />
                <PlayerTokenIcon tokenIndex={p.tokenIndex} size={16} className="hidden md:block" />
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  )
}

function CornerContent({ tile }: { tile: Tile }) {
  const label = "text-center text-[8px] font-bold uppercase leading-tight md:text-[11px]"
  switch (tile.type) {
    case "go":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-0.5 text-red-600">
          <span className={label}>GO</span>
          <ArrowRight className="size-4 md:size-6" aria-hidden="true" />
          <span className="text-[6px] font-medium text-muted-foreground md:text-[8px]">Collect $200</span>
        </div>
      )
    case "jail":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-0.5 text-orange-600">
          <Lock className="size-4 md:size-6" aria-hidden="true" />
          <span className={label}>Jail</span>
        </div>
      )
    case "free-parking":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-0.5 text-red-500">
          <Car className="size-4 md:size-6" aria-hidden="true" />
          <span className={label}>Free Parking</span>
        </div>
      )
    case "go-to-jail":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-0.5 text-blue-700 dark:text-blue-400">
          <Lock className="size-4 md:size-6" aria-hidden="true" />
          <span className={label}>Go To Jail</span>
        </div>
      )
    default:
      return null
  }
}
