"use client"

import { useReducer, useState } from "react"
import { RotateCcw, Trophy } from "lucide-react"
import { createInitialState, gameReducer } from "@/lib/monopoly/engine"
import { ActionPanel } from "./action-panel"
import { AuctionModal } from "./auction-modal"
import { CardModal } from "./card-modal"
import { EventLog } from "./event-log"
import { GameBoard } from "./game-board"
import { ManageModal } from "./manage-modal"
import { Modal } from "./modal"
import { PlayerSetup } from "./player-setup"
import { PlayerTokenBadge } from "./player-token"
import { PropertyModal } from "./property-modal"
import { TileInfoModal } from "./tile-info-modal"

export function MonopolyGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [inspectedTile, setInspectedTile] = useState<number | null>(null)
  const [showManage, setShowManage] = useState(false)
  const [showTrade, setShowTrade] = useState(false)

  if (state.phase === "setup") {
    return (
      <PlayerSetup
        onStart={(playerNames, tokenIndexes) => dispatch({ type: "START_GAME", playerNames, tokenIndexes })}
      />
    )
  }

  const winner = state.winnerId !== null ? state.players.find((p) => p.id === state.winnerId) : null

  return (
    <main className="min-h-dvh bg-background p-2 md:p-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-4">
        {/* Board */}
        <GameBoard state={state} onSelectTile={setInspectedTile} />

        {/* Side panel */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)]">
          <ActionPanel
            state={state}
            dispatch={dispatch}
            onManageProperties={() => setShowManage(true)}
            onTrade={() => setShowTrade(true)}
          />
          <div className="h-56 lg:h-auto lg:min-h-0 lg:flex-1">
            <div className="flex h-full flex-col">
              <EventLog entries={state.log} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {state.phase === "awaiting-buy" && <PropertyModal state={state} dispatch={dispatch} />}
      {state.phase === "auction" && <AuctionModal state={state} dispatch={dispatch} />}
      {state.phase === "card" && <CardModal state={state} dispatch={dispatch} />}
      {showManage && state.phase !== "game-over" && (
        <ManageModal state={state} dispatch={dispatch} onClose={() => setShowManage(false)} />
      )}
      {showTrade && (state.phase === "awaiting-roll" || state.phase === "end-turn") && (
        <TradeModal state={state} dispatch={dispatch} onClose={() => setShowTrade(false)} />
      )}
      {inspectedTile !== null && (
        <TileInfoModal state={state} position={inspectedTile} onClose={() => setInspectedTile(null)} />
      )}
      {state.phase === "game-over" && winner && (
        <Modal title="Game Over">
          <div className="flex flex-col items-center gap-4 text-center">
            <Trophy className="size-12 text-yellow-500" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <PlayerTokenBadge tokenIndex={winner.tokenIndex} />
              <p className="text-lg font-black">{winner.name} wins!</p>
            </div>
            <p className="text-sm text-muted-foreground">All other players have gone bankrupt.</p>
            <button
              type="button"
              onClick={() => dispatch({ type: "NEW_GAME" })}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              New Game
            </button>
          </div>
        </Modal>
      )}
    </main>
  )
}
