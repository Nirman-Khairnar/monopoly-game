"use client"

import { BOARD } from "@/lib/monopoly/board-data"
import type { GameState } from "@/lib/monopoly/types"
import { BoardTile } from "./board-tile"
import { Dice } from "./dice"

export function GameBoard({
  state,
  onSelectTile,
}: {
  state: GameState
  onSelectTile: (position: number) => void
}) {
  const current = state.players[state.currentPlayerIndex]

  return (
    <div className="overflow-auto rounded-xl border bg-card p-1.5 shadow-sm md:p-2" role="region" aria-label="Monopoly board">
      <div
        className="grid aspect-square min-w-[540px] gap-px md:min-w-0"
        style={{
          gridTemplateColumns: "1.55fr repeat(9, 1fr) 1.55fr",
          gridTemplateRows: "1.55fr repeat(9, 1fr) 1.55fr",
        }}
      >
        {BOARD.map((tile) => (
          <BoardTile
            key={tile.id}
            tile={tile}
            propertyState={state.properties[tile.id]}
            playersHere={state.players.filter((p) => !p.bankrupt && p.position === tile.id)}
            owner={
              state.properties[tile.id]?.ownerId !== null && state.properties[tile.id]?.ownerId !== undefined
                ? state.players.find((p) => p.id === state.properties[tile.id].ownerId)
                : undefined
            }
            isActiveTile={current ? current.position === tile.id : false}
            onSelect={() => onSelectTile(tile.id)}
          />
        ))}

        {/* Board center */}
        <div
          className="relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-secondary md:gap-4"
          style={{ gridRow: "2 / 11", gridColumn: "2 / 11" }}
        >
          <h1 className="rotate-[-8deg] rounded-md bg-red-600 px-3 py-1 text-lg font-black uppercase tracking-widest text-white shadow-lg md:px-6 md:py-2 md:text-4xl">
            Monopoly
          </h1>
          {state.dice && (
            <div className="flex items-center gap-2 md:gap-3" aria-live="polite">
              <Dice value={state.dice[0]} />
              <Dice value={state.dice[1]} />
            </div>
          )}
          {current && (
            <p className="px-2 text-center text-xs font-medium text-muted-foreground md:text-sm">
              {state.phase === "game-over" && state.winnerId !== null
                ? `${state.players.find((p) => p.id === state.winnerId)?.name} wins!`
                : `${current.name}'s turn`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
