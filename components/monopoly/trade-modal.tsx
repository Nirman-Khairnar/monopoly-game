"use client"

import { useMemo, useState } from "react"
import { ArrowLeftRight, Check, X } from "lucide-react"
import { BOARD, GROUP_COLORS } from "@/lib/monopoly/board-data"
import { ownedPositions } from "@/lib/monopoly/engine"
import type { GameAction, GameState, Player } from "@/lib/monopoly/types"
import { Modal } from "./modal"
import { PlayerTokenBadge } from "./player-token"
import { cn } from "@/lib/utils"

/** Properties a player can trade: owned, and its whole color group has no buildings. */
function tradablePositions(state: GameState, playerId: number): number[] {
  return ownedPositions(state, playerId)
    .filter((pos) => {
      const tile = BOARD[pos]
      if (!tile.group) return true
      return BOARD.filter((t) => t.group === tile.group).every((t) => state.properties[t.id].houses === 0)
    })
    .sort((a, b) => a - b)
}

export function TradeModal({
  state,
  dispatch,
  onClose,
}: {
  state: GameState
  dispatch: (a: GameAction) => void
  onClose: () => void
}) {
  const player = state.players[state.currentPlayerIndex]
  const partners = state.players.filter((p) => !p.bankrupt && p.id !== player.id)

  const [partnerId, setPartnerId] = useState<number>(partners[0]?.id ?? -1)
  const [giveProps, setGiveProps] = useState<number[]>([])
  const [getProps, setGetProps] = useState<number[]>([])
  const [giveMoney, setGiveMoney] = useState(0)
  const [getMoney, setGetMoney] = useState(0)
  const [step, setStep] = useState<"build" | "review">("build")

  const partner = state.players.find((p) => p.id === partnerId)

  const myTradable = useMemo(() => tradablePositions(state, player.id), [state, player.id])
  const theirTradable = useMemo(
    () => (partner ? tradablePositions(state, partner.id) : []),
    [state, partner],
  )

  const hasOffer = giveProps.length > 0 || getProps.length > 0 || giveMoney > 0 || getMoney > 0
  const valid =
    hasOffer && partner !== undefined && giveMoney <= player.money && (partner ? getMoney <= partner.money : false)

  const toggle = (list: number[], setList: (v: number[]) => void, pos: number) =>
    setList(list.includes(pos) ? list.filter((p) => p !== pos) : [...list, pos])

  const selectPartner = (id: number) => {
    setPartnerId(id)
    setGetProps([])
    setGetMoney(0)
  }

  if (partners.length === 0) return null

  if (step === "review" && partner) {
    return (
      <Modal title="Review Trade Offer">
        <div className="flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{partner.name}</span>, {player.name} proposes this trade. Do
            you accept?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <TradeSummary title={`${player.name} gives`} player={player} props={giveProps} money={giveMoney} state={state} />
            <TradeSummary title={`${partner.name} gives`} player={partner} props={getProps} money={getMoney} state={state} />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("build")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
            >
              <X className="size-4" aria-hidden="true" />
              Decline
            </button>
            <button
              type="button"
              onClick={() => {
                dispatch({
                  type: "EXECUTE_TRADE",
                  partnerId: partner.id,
                  giveProps,
                  getProps,
                  giveMoney,
                  getMoney,
                })
                onClose()
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Check className="size-4" aria-hidden="true" />
              Accept Trade
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Propose a Trade" onClose={onClose}>
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
        {/* Partner picker */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trade with</p>
          <div className="flex flex-wrap gap-2">
            {partners.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => selectPartner(p.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-accent",
                  p.id === partnerId && "border-primary bg-accent",
                )}
                aria-pressed={p.id === partnerId}
              >
                <PlayerTokenBadge tokenIndex={p.tokenIndex} size={14} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Your side */}
          <TradeSide
            title="You give"
            positions={myTradable}
            selected={giveProps}
            onToggle={(pos) => toggle(giveProps, setGiveProps, pos)}
            money={giveMoney}
            onMoney={setGiveMoney}
            maxMoney={player.money}
            state={state}
          />
          {/* Their side */}
          <TradeSide
            title={`${partner?.name ?? "They"} give${partner ? "s" : ""}`}
            positions={theirTradable}
            selected={getProps}
            onToggle={(pos) => toggle(getProps, setGetProps, pos)}
            money={getMoney}
            onMoney={setGetMoney}
            maxMoney={partner?.money ?? 0}
            state={state}
          />
        </div>

        <button
          type="button"
          onClick={() => setStep("review")}
          disabled={!valid}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          Propose Trade
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Properties in color groups with buildings can&apos;t be traded — sell the buildings first. Mortgaged
          properties transfer as-is.
        </p>
      </div>
    </Modal>
  )
}

function TradeSide({
  title,
  positions,
  selected,
  onToggle,
  money,
  onMoney,
  maxMoney,
  state,
}: {
  title: string
  positions: number[]
  selected: number[]
  onToggle: (pos: number) => void
  money: number
  onMoney: (v: number) => void
  maxMoney: number
  state: GameState
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg border p-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex max-h-44 flex-col gap-1 overflow-y-auto">
        {positions.length === 0 && <p className="py-2 text-center text-xs text-muted-foreground">No tradable properties</p>}
        {positions.map((pos) => {
          const tile = BOARD[pos]
          const ps = state.properties[pos]
          const isSelected = selected.includes(pos)
          return (
            <button
              key={pos}
              type="button"
              onClick={() => onToggle(pos)}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-1.5 py-1 text-left text-xs font-medium transition-colors hover:bg-accent",
                isSelected && "border-primary bg-accent",
              )}
            >
              <span
                className="size-2.5 shrink-0 rounded-sm border"
                style={{ backgroundColor: tile.group ? GROUP_COLORS[tile.group] : "var(--muted)" }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate">{tile.name}</span>
              {ps.mortgaged && <span className="shrink-0 text-[9px] font-bold text-orange-600 dark:text-orange-400">MTG</span>}
            </button>
          )
        })}
      </div>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Cash (max ${maxMoney.toLocaleString()})
        <input
          type="number"
          min={0}
          max={maxMoney}
          step={10}
          value={money || ""}
          placeholder="0"
          onChange={(e) => {
            const v = Math.max(0, Math.min(maxMoney, Math.floor(Number(e.target.value) || 0)))
            onMoney(v)
          }}
          className="rounded-md border bg-background px-2 py-1.5 text-sm tabular-nums text-foreground"
        />
      </label>
    </div>
  )
}

function TradeSummary({
  title,
  player,
  props,
  money,
  state,
}: {
  title: string
  player: Player
  props: number[]
  money: number
  state: GameState
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border p-2.5">
      <div className="flex items-center gap-1.5">
        <PlayerTokenBadge tokenIndex={player.tokenIndex} size={14} />
        <p className="text-xs font-bold">{title}</p>
      </div>
      <ul className="flex flex-col gap-1 text-xs">
        {props.map((pos) => {
          const tile = BOARD[pos]
          return (
            <li key={pos} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-sm border"
                style={{ backgroundColor: tile.group ? GROUP_COLORS[tile.group] : "var(--muted)" }}
                aria-hidden="true"
              />
              <span className="truncate">{tile.name}</span>
              {state.properties[pos].mortgaged && (
                <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400">MTG</span>
              )}
            </li>
          )
        })}
        {money > 0 && <li className="font-bold tabular-nums">${money.toLocaleString()}</li>}
        {props.length === 0 && money === 0 && <li className="text-muted-foreground">Nothing</li>}
      </ul>
    </div>
  )
}
