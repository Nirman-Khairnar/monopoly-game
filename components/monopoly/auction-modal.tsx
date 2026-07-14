"use client"

import { Gavel } from "lucide-react"
import { BOARD } from "@/lib/monopoly/board-data"
import type { GameAction, GameState } from "@/lib/monopoly/types"
import { Modal } from "./modal"
import { PropertyDeed } from "./property-modal"
import { PlayerTokenBadge } from "./player-token"

const BID_INCREMENTS = [10, 50, 100]

export function AuctionModal({ state, dispatch }: { state: GameState; dispatch: (a: GameAction) => void }) {
  const auction = state.auction
  if (!auction) return null

  const bidderId = auction.activeBidderIds[auction.turnIndex]
  const bidder = state.players.find((p) => p.id === bidderId)!
  const highestBidder =
    auction.highestBidderId !== null ? state.players.find((p) => p.id === auction.highestBidderId) : null

  return (
    <Modal title="Auction">
      <div className="flex flex-col gap-4">
        <PropertyDeed position={auction.position} />

        <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">Current bid</span>
          <span className="text-lg font-black tabular-nums">
            ${auction.currentBid}
            {highestBidder && <span className="ml-1.5 text-xs font-semibold text-muted-foreground">by {highestBidder.name}</span>}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <PlayerTokenBadge tokenIndex={bidder.tokenIndex} size={16} />
          <p className="text-sm">
            <span className="font-bold">{bidder.name}</span>
            <span className="text-muted-foreground"> — your bid (you have ${bidder.money.toLocaleString()})</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {BID_INCREMENTS.map((inc) => {
            const newBid = auction.currentBid + inc
            const disabled = bidder.money < newBid
            return (
              <button
                key={inc}
                type="button"
                onClick={() => dispatch({ type: "AUCTION_BID", amount: inc })}
                disabled={disabled}
                className="rounded-lg border px-2 py-2.5 text-sm font-bold transition-colors hover:bg-accent disabled:opacity-40"
              >
                +${inc}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "AUCTION_PASS" })}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Gavel className="size-4" aria-hidden="true" />
          Pass
        </button>

        <p className="text-center text-xs text-muted-foreground">
          {BOARD[auction.position].name} sells to the highest bidder when everyone else passes.
        </p>
      </div>
    </Modal>
  )
}
