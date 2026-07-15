"use client"

import { ArrowLeftRight, Dices, KeyRound, Lock, RotateCcw, SkipForward, Ticket } from "lucide-react"
import { JAIL_FINE, PLAYER_TOKENS } from "@/lib/monopoly/board-data"
import type { GameAction, GameState } from "@/lib/monopoly/types"
import { PlayerTokenBadge } from "./player-token"
import { cn } from "@/lib/utils"

export function ActionPanel({
  state,
  dispatch,
  onManageProperties,
  onTrade,
}: {
  state: GameState
  dispatch: (action: GameAction) => void
  onManageProperties: () => void
  onTrade: () => void
}) {
  const current = state.players[state.currentPlayerIndex]
  if (!current) return null

  const otherActive = state.players.some((p) => !p.bankrupt && p.id !== current.id)

  const rollAgain =
    state.phase === "end-turn" && state.lastRollWasDoubles && !state.turnEndsAfterResolve && !current.inJail && !current.bankrupt

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm md:p-4" aria-label="Turn actions">
      {/* Current player */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <PlayerTokenBadge tokenIndex={current.tokenIndex} />
          <div>
            <p className="text-sm font-bold leading-tight">{current.name}</p>
            <p className="text-xs text-muted-foreground">
              {current.inJail ? (
                <span className="inline-flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400">
                  <Lock className="size-3" aria-hidden="true" /> In Jail (turn {current.jailTurns + 1}/3)
                </span>
              ) : (
                "Current turn"
              )}
            </p>
          </div>
        </div>
        <p className="text-lg font-black tabular-nums md:text-xl">${current.money.toLocaleString()}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {state.phase === "awaiting-roll" && (
          <>
            <button
              type="button"
              onClick={() => dispatch({ type: "ROLL_DICE" })}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Dices className="size-4" aria-hidden="true" />
              {current.inJail ? "Roll for Doubles" : "Roll Dice"}
            </button>
            {current.inJail && (
              <>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "PAY_JAIL_FINE" })}
                  disabled={current.money < JAIL_FINE}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-40"
                >
                  <KeyRound className="size-4" aria-hidden="true" />
                  Pay ${JAIL_FINE}
                </button>
                {current.getOutOfJailCards > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "USE_JAIL_CARD" })}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
                  >
                    <Ticket className="size-4" aria-hidden="true" />
                    Use Card
                  </button>
                )}
              </>
            )}
          </>
        )}

        {state.phase === "end-turn" && (
          <button
            type="button"
            onClick={() => dispatch({ type: "END_TURN" })}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors",
              rollAgain
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {rollAgain ? (
              <>
                <RotateCcw className="size-4" aria-hidden="true" /> Doubles! Roll Again
              </>
            ) : (
              <>
                <SkipForward className="size-4" aria-hidden="true" /> End Turn
              </>
            )}
          </button>
        )}

        {(state.phase === "awaiting-roll" || state.phase === "end-turn") && (
          <>
            <button
              type="button"
              onClick={onManageProperties}
              className="inline-flex items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
            >
              Manage
            </button>
            {otherActive && (
              <button
                type="button"
                onClick={onTrade}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
              >
                <ArrowLeftRight className="size-4" aria-hidden="true" />
                Trade
              </button>
            )}
          </>
        )}
      </div>

      {/* All players summary */}
      <ul className="flex flex-col gap-1.5" aria-label="All players">
        {state.players.map((p, i) => (
          <li
            key={p.id}
            className={cn(
              "flex items-center justify-between rounded-lg px-2 py-1.5 text-sm",
              i === state.currentPlayerIndex && "bg-accent",
              p.bankrupt && "opacity-40",
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: PLAYER_TOKENS[p.tokenIndex].color }}
                aria-hidden="true"
              />
              <span className={cn("font-medium", p.bankrupt && "line-through")}>{p.name}</span>
              {p.inJail && <Lock className="size-3 text-orange-500" aria-label="In jail" />}
              {p.getOutOfJailCards > 0 && (
                <Ticket className="size-3 text-muted-foreground" aria-label={`${p.getOutOfJailCards} jail free cards`} />
              )}
            </span>
            <span className="font-semibold tabular-nums">${p.money.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
