"use client"

import { Gavel, ShoppingCart } from "lucide-react"
import { BOARD, GROUP_COLORS } from "@/lib/monopoly/board-data"
import type { GameAction, GameState } from "@/lib/monopoly/types"
import { Modal } from "./modal"

export function PropertyModal({ state, dispatch }: { state: GameState; dispatch: (a: GameAction) => void }) {
  const player = state.players[state.currentPlayerIndex]
  const tile = BOARD[player.position]
  const price = tile.price ?? 0
  const canAfford = player.money >= price

  return (
    <Modal title="Property for Sale">
      <div className="flex flex-col gap-4">
        <PropertyDeed position={tile.id} />
        <p className="text-sm text-muted-foreground">
          {player.name}, you landed on an unowned property. Buy it now or send it to auction.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "BUY_PROPERTY" })}
            disabled={!canAfford}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            Buy for ${price}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "START_AUCTION" })}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <Gavel className="size-4" aria-hidden="true" />
            Auction
          </button>
          {!canAfford && (
            <p className="text-center text-xs text-red-600 dark:text-red-400">
              Not enough money to buy — the property must be auctioned.
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

export function PropertyDeed({ position }: { position: number }) {
  const tile = BOARD[position]
  const groupColor = tile.group ? GROUP_COLORS[tile.group] : undefined

  return (
    <div className="overflow-hidden rounded-lg border">
      <div
        className="px-3 py-2 text-center"
        style={groupColor ? { backgroundColor: groupColor } : undefined}
      >
        <p
          className="text-sm font-black uppercase tracking-wide"
          style={groupColor ? { color: contrastText(groupColor) } : undefined}
        >
          {tile.name}
        </p>
      </div>
      <div className="flex flex-col gap-1 p-3 text-xs">
        {tile.type === "property" && tile.rents && (
          <>
            <DeedRow label="Rent" value={`$${tile.rents[0]}`} />
            <DeedRow label="Rent with full color set" value={`$${tile.rents[0] * 2}`} />
            <DeedRow label="With 1 house" value={`$${tile.rents[1]}`} />
            <DeedRow label="With 2 houses" value={`$${tile.rents[2]}`} />
            <DeedRow label="With 3 houses" value={`$${tile.rents[3]}`} />
            <DeedRow label="With 4 houses" value={`$${tile.rents[4]}`} />
            <DeedRow label="With hotel" value={`$${tile.rents[5]}`} />
            <DeedRow label="House cost" value={`$${tile.houseCost} each`} />
          </>
        )}
        {tile.type === "railroad" && (
          <>
            <DeedRow label="Rent (1 railroad)" value="$25" />
            <DeedRow label="Rent (2 railroads)" value="$50" />
            <DeedRow label="Rent (3 railroads)" value="$100" />
            <DeedRow label="Rent (4 railroads)" value="$200" />
          </>
        )}
        {tile.type === "utility" && (
          <>
            <DeedRow label="1 utility owned" value="4x dice roll" />
            <DeedRow label="Both utilities owned" value="10x dice roll" />
          </>
        )}
        {tile.price !== undefined && (
          <div className="mt-1 border-t pt-1">
            <DeedRow label="Price" value={`$${tile.price}`} bold />
          </div>
        )}
      </div>
    </div>
  )
}

function DeedRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

function contrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#1a1a1a" : "#ffffff"
}
