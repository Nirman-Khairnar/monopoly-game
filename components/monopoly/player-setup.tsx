"use client"

import { useState } from "react"
import { Minus, Play, Plus } from "lucide-react"
import { PLAYER_TOKENS, STARTING_MONEY } from "@/lib/monopoly/board-data"
import { PlayerTokenIcon } from "./player-token"
import { cn } from "@/lib/utils"

const MIN_PLAYERS = 2
const MAX_PLAYERS = 6

export function PlayerSetup({ onStart }: { onStart: (names: string[], tokenIndexes: number[]) => void }) {
  const [count, setCount] = useState(2)
  const [names, setNames] = useState<string[]>(["", "", "", "", "", ""])
  const [tokens, setTokens] = useState<number[]>([0, 1, 2, 3, 4, 5])

  const setName = (i: number, value: string) => {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)))
  }

  const setToken = (i: number, tokenIndex: number) => {
    setTokens((prev) => {
      const next = [...prev]
      const conflict = next.findIndex((t, idx) => idx < count && idx !== i && t === tokenIndex)
      if (conflict >= 0) next[conflict] = next[i] // swap tokens
      next[i] = tokenIndex
      return next
    })
  }

  const handleStart = () => {
    onStart(
      Array.from({ length: count }, (_, i) => names[i].trim() || `Player ${i + 1}`),
      tokens.slice(0, count),
    )
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-lg md:p-6">
        <h1 className="rotate-[-2deg] self-center rounded-md bg-red-600 px-4 py-1.5 text-center text-2xl font-black uppercase tracking-widest text-white shadow-md md:text-3xl">
          Monopoly
        </h1>
        <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
          Local multiplayer — pass the device between turns. Everyone starts with ${STARTING_MONEY}.
        </p>

        {/* Player count */}
        <div className="mt-5 flex items-center justify-between rounded-lg border px-3 py-2.5">
          <span className="text-sm font-semibold">Players</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCount((c) => Math.max(MIN_PLAYERS, c - 1))}
              disabled={count <= MIN_PLAYERS}
              className="rounded-md border p-1.5 transition-colors hover:bg-accent disabled:opacity-30"
              aria-label="Remove a player"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <span className="w-5 text-center text-lg font-black tabular-nums">{count}</span>
            <button
              type="button"
              onClick={() => setCount((c) => Math.min(MAX_PLAYERS, c + 1))}
              disabled={count >= MAX_PLAYERS}
              className="rounded-md border p-1.5 transition-colors hover:bg-accent disabled:opacity-30"
              aria-label="Add a player"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Player rows */}
        <div className="mt-3 flex flex-col gap-3">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground">Player {i + 1} name</span>
                <input
                  type="text"
                  value={names[i]}
                  onChange={(e) => setName(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                  maxLength={16}
                  className="rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                />
              </label>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Player ${i + 1} token`}>
                {PLAYER_TOKENS.map((token, ti) => (
                  <button
                    key={ti}
                    type="button"
                    role="radio"
                    aria-checked={tokens[i] === ti}
                    aria-label={token.label}
                    onClick={() => setToken(i, ti)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border-2 transition-colors hover:bg-accent",
                      tokens[i] === ti ? "bg-accent" : "border-transparent",
                    )}
                    style={tokens[i] === ti ? { borderColor: token.color } : undefined}
                  >
                    <PlayerTokenIcon tokenIndex={ti} size={18} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Play className="size-4" aria-hidden="true" />
          Start Game
        </button>
      </div>
    </main>
  )
}
