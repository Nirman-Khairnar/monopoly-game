"use client"

import { BOARD } from "@/lib/monopoly/board-data"
import type { GameState } from "@/lib/monopoly/types"
import { Modal } from "./modal"
import { PropertyDeed } from "./property-modal"

export function TileInfoModal({
  state,
  position,
  onClose,
}: {
  state: GameState
  position: number
  onClose: () => void
}) {
  const tile = BOARD[position]
  const ps = state.properties[position]
  const owner = ps?.ownerId !== null && ps?.ownerId !== undefined ? state.players.find((p) => p.id === ps.ownerId) : null
  const isOwnable = tile.type === "property" || tile.type === "railroad" || tile.type === "utility"

  return (
    <Modal title="Tile Details" onClose={onClose}>
      <div className="flex flex-col gap-3">
        {isOwnable ? (
          <>
            <PropertyDeed position={position} />
            <p className="text-center text-sm">
              {owner ? (
                <>
                  Owned by <span className="font-bold">{owner.name}</span>
                  {ps.mortgaged && (
                    <span className="font-semibold text-orange-600 dark:text-orange-400"> — mortgaged (no rent)</span>
                  )}
                  {ps.houses > 0 && (
                    <span className="text-muted-foreground">
                      {" "}
                      — {ps.houses === 5 ? "hotel built" : `${ps.houses} house${ps.houses > 1 ? "s" : ""}`}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">Unowned — available to purchase</span>
              )}
            </p>
          </>
        ) : (
          <div className="py-2 text-center">
            <p className="text-lg font-bold">{tile.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tile.type === "go" && "Collect $200 salary every time you pass or land on GO."}
              {tile.type === "jail" && "Just visiting — unless the dice say otherwise."}
              {tile.type === "free-parking" && "A free resting spot. Nothing happens here."}
              {tile.type === "go-to-jail" && "Land here and go directly to Jail. Do not pass GO."}
              {tile.type === "chance" && "Draw a Chance card and follow its instructions."}
              {tile.type === "chest" && "Draw a Community Chest card and follow its instructions."}
              {tile.type === "tax" && `Pay $${tile.taxAmount} to the bank when you land here.`}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
