"use client"

import { Gift, HelpCircle } from "lucide-react"
import type { GameAction, GameState } from "@/lib/monopoly/types"
import { Modal } from "./modal"

export function CardModal({ state, dispatch }: { state: GameState; dispatch: (a: GameAction) => void }) {
  const card = state.pendingCard
  if (!card) return null

  const isChance = card.deck === "chance"

  return (
    <Modal title={isChance ? "Chance" : "Community Chest"}>
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          className={`flex size-14 items-center justify-center rounded-full ${
            isChance ? "bg-orange-100 text-orange-600 dark:bg-orange-950" : "bg-sky-100 text-sky-600 dark:bg-sky-950"
          }`}
        >
          {isChance ? (
            <HelpCircle className="size-8" aria-hidden="true" />
          ) : (
            <Gift className="size-8" aria-hidden="true" />
          )}
        </span>
        <p className="text-balance text-sm font-medium leading-relaxed">{card.text}</p>
        <button
          type="button"
          onClick={() => dispatch({ type: "APPLY_CARD" })}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          OK
        </button>
      </div>
    </Modal>
  )
}
