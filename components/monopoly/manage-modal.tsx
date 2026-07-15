"use client"

import { Banknote, Home, Hotel, Minus, Plus } from "lucide-react"
import { BOARD, GROUP_COLORS } from "@/lib/monopoly/board-data"
import {
  canBuildHouse,
  canMortgage,
  canSellHouse,
  canUnmortgage,
  mortgageValue,
  ownedPositions,
  unmortgageCost,
} from "@/lib/monopoly/engine"
import type { GameAction, GameState } from "@/lib/monopoly/types"
import { Modal } from "./modal"
import { cn } from "@/lib/utils"

export function ManageModal({
  state,
  dispatch,
  onClose,
}: {
  state: GameState
  dispatch: (a: GameAction) => void
  onClose: () => void
}) {
  const player = state.players[state.currentPlayerIndex]
  const owned = ownedPositions(state, player.id).sort((a, b) => a - b)

  return (
    <Modal title={`${player.name}'s Properties`} onClose={onClose}>
      <div className="flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto">
        <p className="text-right text-sm font-bold tabular-nums text-muted-foreground">
          Cash: <span className="text-foreground">${player.money.toLocaleString()}</span>
        </p>
        {owned.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">You don&apos;t own any properties yet.</p>
        )}
        {owned.map((pos) => {
          const tile = BOARD[pos]
          const ps = state.properties[pos]
          const buildable = canBuildHouse(state, player.id, pos)
          const sellable = canSellHouse(state, player.id, pos)
          const mortgageable = canMortgage(state, player.id, pos)
          const unmortgageable = canUnmortgage(state, player.id, pos)
          return (
            <div
              key={pos}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2",
                ps.mortgaged && "bg-muted/60",
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-3 shrink-0 rounded-sm border"
                  style={{ backgroundColor: tile.group ? GROUP_COLORS[tile.group] : "var(--muted)" }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className={cn("truncate text-sm font-semibold", ps.mortgaged && "text-muted-foreground")}>
                    {tile.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {ps.mortgaged ? (
                      <span className="font-semibold text-orange-600 dark:text-orange-400">Mortgaged</span>
                    ) : ps.houses === 5 ? (
                      <>
                        <Hotel className="size-3 text-red-600" aria-hidden="true" /> Hotel
                      </>
                    ) : ps.houses > 0 ? (
                      <>
                        <Home className="size-3 text-green-700" aria-hidden="true" /> {ps.houses} house{ps.houses > 1 ? "s" : ""}
                      </>
                    ) : tile.type === "property" ? (
                      "No buildings"
                    ) : tile.type === "railroad" ? (
                      "Railroad"
                    ) : (
                      "Utility"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {tile.type === "property" && !ps.mortgaged && (
                  <>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "SELL_HOUSE", position: pos })}
                      disabled={!sellable}
                      className="rounded-md border p-1.5 transition-colors hover:bg-accent disabled:opacity-30"
                      aria-label={`Sell building on ${tile.name} for $${Math.floor((tile.houseCost ?? 0) / 2)}`}
                    >
                      <Minus className="size-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "BUILD_HOUSE", position: pos })}
                      disabled={!buildable}
                      className="rounded-md border p-1.5 transition-colors hover:bg-accent disabled:opacity-30"
                      aria-label={`Build on ${tile.name} for $${tile.houseCost}`}
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                    </button>
                  </>
                )}
                {ps.mortgaged ? (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "UNMORTGAGE", position: pos })}
                    disabled={!unmortgageable}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors hover:bg-accent disabled:opacity-30"
                    aria-label={`Pay off mortgage on ${tile.name} for $${unmortgageCost(pos)}`}
                  >
                    <Banknote className="size-3.5" aria-hidden="true" />
                    Redeem ${unmortgageCost(pos)}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "MORTGAGE", position: pos })}
                    disabled={!mortgageable}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors hover:bg-accent disabled:opacity-30"
                    aria-label={`Mortgage ${tile.name} for $${mortgageValue(pos)}`}
                  >
                    <Banknote className="size-3.5" aria-hidden="true" />
                    Mortgage ${mortgageValue(pos)}
                  </button>
                )}
              </div>
            </div>
          )
        })}
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Build requires a full color set with no mortgages. Houses build evenly and sell for half cost. Mortgaged
          properties collect no rent; redeeming costs the mortgage value plus 10%.
        </p>
      </div>
    </Modal>
  )
}
