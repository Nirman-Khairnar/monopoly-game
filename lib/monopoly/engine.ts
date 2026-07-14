import { BOARD, GO_SALARY, JAIL_FINE, JAIL_POSITION, RAILROAD_POSITIONS, STARTING_MONEY, UTILITY_POSITIONS, groupMembers } from "./board-data"
import { CHANCE_CARDS, CHEST_CARDS, shuffledDeckOrder } from "./cards"
import type { GameAction, GameCard, GameState, LogEntry, Player, PropertyState } from "./types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(state: GameState, text: string, tone: LogEntry["tone"] = "info"): GameState {
  const entry: LogEntry = { id: state.logCounter, text, tone }
  return { ...state, log: [...state.log, entry].slice(-120), logCounter: state.logCounter + 1 }
}

function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex]
}

function updatePlayer(state: GameState, playerId: number, patch: Partial<Player>): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === playerId ? { ...p, ...patch } : p)),
  }
}

function activePlayers(state: GameState): Player[] {
  return state.players.filter((p) => !p.bankrupt)
}

export function ownedPositions(state: GameState, playerId: number): number[] {
  return Object.entries(state.properties)
    .filter(([, ps]) => ps.ownerId === playerId)
    .map(([pos]) => Number(pos))
}

export function ownsFullGroup(state: GameState, playerId: number, position: number): boolean {
  const tile = BOARD[position]
  if (!tile.group) return false
  return groupMembers(tile.group).every((id) => state.properties[id]?.ownerId === playerId)
}

export function calculateRent(state: GameState, position: number, diceTotal: number, multiplierOverride?: "double-rail" | "ten-x-utility"): number {
  const tile = BOARD[position]
  const ps = state.properties[position]
  if (!ps || ps.ownerId === null) return 0
  const ownerId = ps.ownerId

  if (tile.type === "property" && tile.rents) {
    if (ps.houses > 0) return tile.rents[ps.houses]
    const base = tile.rents[0]
    return ownsFullGroup(state, ownerId, position) ? base * 2 : base
  }
  if (tile.type === "railroad") {
    const count = RAILROAD_POSITIONS.filter((p) => state.properties[p]?.ownerId === ownerId).length
    const rent = 25 * Math.pow(2, count - 1)
    return multiplierOverride === "double-rail" ? rent * 2 : rent
  }
  if (tile.type === "utility") {
    if (multiplierOverride === "ten-x-utility") return diceTotal * 10
    const count = UTILITY_POSITIONS.filter((p) => state.properties[p]?.ownerId === ownerId).length
    return diceTotal * (count === 2 ? 10 : 4)
  }
  return 0
}

/** Deduct money from a player; handles bankruptcy (assets go to creditor or bank). */
function chargePlayer(state: GameState, payerId: number, amount: number, recipientId: number | null): GameState {
  const payer = state.players.find((p) => p.id === payerId)!
  if (payer.money >= amount) {
    let s = updatePlayer(state, payerId, { money: payer.money - amount })
    if (recipientId !== null) {
      const recipient = s.players.find((p) => p.id === recipientId)!
      s = updatePlayer(s, recipientId, { money: recipient.money + amount })
    }
    return s
  }
  // Bankruptcy: liquidate everything, transfer remaining cash + deeds
  let s = state
  const payerName = payer.name
  const cash = Math.max(0, payer.money)
  s = updatePlayer(s, payerId, { money: 0, bankrupt: true })
  const newProps: Record<number, PropertyState> = { ...s.properties }
  for (const [pos, ps] of Object.entries(newProps)) {
    if (ps.ownerId === payerId) {
      newProps[Number(pos)] = { ownerId: recipientId, houses: 0 }
    }
  }
  s = { ...s, properties: newProps }
  if (recipientId !== null) {
    const recipient = s.players.find((p) => p.id === recipientId)!
    s = updatePlayer(s, recipientId, { money: recipient.money + cash })
    s = log(s, `${payerName} is BANKRUPT! All assets transfer to ${recipient.name}.`, "alert")
  } else {
    s = log(s, `${payerName} is BANKRUPT! Properties return to the bank.`, "alert")
  }
  // Check for winner
  const remaining = activePlayers(s)
  if (remaining.length === 1) {
    s = { ...s, phase: "game-over", winnerId: remaining[0].id }
    s = log(s, `${remaining[0].name} wins the game!`, "system")
  }
  return s
}

function sendToJail(state: GameState, playerId: number): GameState {
  const player = state.players.find((p) => p.id === playerId)!
  let s = updatePlayer(state, playerId, {
    position: JAIL_POSITION,
    inJail: true,
    jailTurns: 0,
    doublesCount: 0,
  })
  s = log(s, `${player.name} goes directly to Jail!`, "alert")
  return { ...s, turnEndsAfterResolve: true, phase: "end-turn" }
}

/** Move a player forward/to a position, crediting GO salary when passed. */
function movePlayerTo(state: GameState, playerId: number, newPosition: number, collectGo: boolean): GameState {
  const player = state.players.find((p) => p.id === playerId)!
  let s = state
  if (collectGo && newPosition < player.position) {
    s = updatePlayer(s, playerId, { money: player.money + GO_SALARY })
    s = log(s, `${player.name} passes GO and collects $${GO_SALARY}.`, "money-up")
  }
  s = updatePlayer(s, playerId, { position: newPosition })
  return s
}

// ---------------------------------------------------------------------------
// Tile resolution (after landing)
// ---------------------------------------------------------------------------

function resolveTile(state: GameState, rentOverride?: "double-rail" | "ten-x-utility"): GameState {
  const player = currentPlayer(state)
  const tile = BOARD[player.position]
  const diceTotal = state.dice ? state.dice[0] + state.dice[1] : 7
  let s = state

  switch (tile.type) {
    case "go":
      s = updatePlayer(s, player.id, { money: player.money + GO_SALARY })
      s = log(s, `${player.name} lands on GO and collects $${GO_SALARY}.`, "money-up")
      return { ...s, phase: "end-turn" }

    case "property":
    case "railroad":
    case "utility": {
      const ps = s.properties[tile.id]
      if (!ps || ps.ownerId === null) {
        return { ...s, phase: "awaiting-buy" }
      }
      if (ps.ownerId === player.id) {
        s = log(s, `${player.name} landed on their own property, ${tile.name}.`)
        return { ...s, phase: "end-turn" }
      }
      const owner = s.players.find((p) => p.id === ps.ownerId)!
      const rent = calculateRent(s, tile.id, diceTotal, rentOverride)
      s = log(s, `${player.name} pays $${rent} rent to ${owner.name} for ${tile.name}.`, "money-down")
      s = chargePlayer(s, player.id, rent, owner.id)
      if (s.phase === "game-over") return s
      return { ...s, phase: "end-turn" }
    }

    case "tax": {
      const amount = tile.taxAmount ?? 0
      s = log(s, `${player.name} pays ${tile.name} of $${amount}.`, "money-down")
      s = chargePlayer(s, player.id, amount, null)
      if (s.phase === "game-over") return s
      return { ...s, phase: "end-turn" }
    }

    case "chance": {
      const card = CHANCE_CARDS[s.chanceDeck[s.chanceIndex % s.chanceDeck.length]]
      s = log(s, `${player.name} draws a Chance card.`)
      return { ...s, pendingCard: card, chanceIndex: s.chanceIndex + 1, phase: "card" }
    }

    case "chest": {
      const card = CHEST_CARDS[s.chestDeck[s.chestIndex % s.chestDeck.length]]
      s = log(s, `${player.name} draws a Community Chest card.`)
      return { ...s, pendingCard: card, chestIndex: s.chestIndex + 1, phase: "card" }
    }

    case "go-to-jail":
      return sendToJail(s, player.id)

    case "jail":
      s = log(s, `${player.name} is just visiting Jail.`)
      return { ...s, phase: "end-turn" }

    case "free-parking":
      s = log(s, `${player.name} rests at Free Parking.`)
      return { ...s, phase: "end-turn" }
  }
}

// ---------------------------------------------------------------------------
// Card application
// ---------------------------------------------------------------------------

function applyCard(state: GameState, card: GameCard): GameState {
  const player = currentPlayer(state)
  let s: GameState = { ...state, pendingCard: null }

  switch (card.effect.kind) {
    case "money": {
      const amt = card.effect.amount
      if (amt >= 0) {
        s = updatePlayer(s, player.id, { money: player.money + amt })
        s = log(s, `${player.name} collects $${amt}.`, "money-up")
      } else {
        s = log(s, `${player.name} pays $${-amt}.`, "money-down")
        s = chargePlayer(s, player.id, -amt, null)
        if (s.phase === "game-over") return s
      }
      return { ...s, phase: "end-turn" }
    }

    case "move-to": {
      s = movePlayerTo(s, player.id, card.effect.position, card.effect.collectGo)
      s = log(s, `${player.name} moves to ${BOARD[card.effect.position].name}.`)
      return resolveTile(s)
    }

    case "move-relative": {
      const newPos = (player.position + card.effect.steps + 40) % 40
      s = updatePlayer(s, player.id, { position: newPos })
      s = log(s, `${player.name} moves to ${BOARD[newPos].name}.`)
      return resolveTile(s)
    }

    case "go-to-jail":
      return sendToJail(s, player.id)

    case "jail-free":
      s = updatePlayer(s, player.id, { getOutOfJailCards: player.getOutOfJailCards + 1 })
      s = log(s, `${player.name} keeps a Get Out of Jail Free card.`, "money-up")
      return { ...s, phase: "end-turn" }

    case "repairs": {
      let houses = 0
      let hotels = 0
      for (const pos of ownedPositions(s, player.id)) {
        const h = s.properties[pos].houses
        if (h === 5) hotels++
        else houses += h
      }
      const total = houses * card.effect.perHouse + hotels * card.effect.perHotel
      if (total > 0) {
        s = log(s, `${player.name} pays $${total} for repairs (${houses} houses, ${hotels} hotels).`, "money-down")
        s = chargePlayer(s, player.id, total, null)
        if (s.phase === "game-over") return s
      } else {
        s = log(s, `${player.name} has no buildings — no repairs owed.`)
      }
      return { ...s, phase: "end-turn" }
    }

    case "collect-each": {
      const amt = card.effect.amount
      const others = activePlayers(s).filter((p) => p.id !== player.id)
      if (amt >= 0) {
        for (const other of others) {
          s = chargePlayer(s, other.id, amt, player.id)
          if (s.phase === "game-over") return s
        }
        s = log(s, `${player.name} collects $${amt} from each player.`, "money-up")
      } else {
        for (const other of others) {
          s = chargePlayer(s, player.id, -amt, other.id)
          if (s.phase === "game-over") return s
        }
        s = log(s, `${player.name} pays $${-amt} to each player.`, "money-down")
      }
      return { ...s, phase: "end-turn" }
    }

    case "nearest-railroad": {
      const pos = player.position
      const next = RAILROAD_POSITIONS.find((r) => r > pos) ?? RAILROAD_POSITIONS[0]
      s = movePlayerTo(s, player.id, next, true)
      s = log(s, `${player.name} advances to ${BOARD[next].name}.`)
      return resolveTile(s, "double-rail")
    }

    case "nearest-utility": {
      const pos = player.position
      const next = UTILITY_POSITIONS.find((u) => u > pos) ?? UTILITY_POSITIONS[0]
      s = movePlayerTo(s, player.id, next, true)
      s = log(s, `${player.name} advances to ${BOARD[next].name}.`)
      return resolveTile(s, "ten-x-utility")
    }
  }
}

// ---------------------------------------------------------------------------
// Building rules
// ---------------------------------------------------------------------------

export function canBuildHouse(state: GameState, playerId: number, position: number): boolean {
  const tile = BOARD[position]
  if (tile.type !== "property" || !tile.group || !tile.houseCost) return false
  const ps = state.properties[position]
  if (!ps || ps.ownerId !== playerId || ps.houses >= 5) return false
  if (!ownsFullGroup(state, playerId, position)) return false
  const player = state.players.find((p) => p.id === playerId)!
  if (player.money < tile.houseCost) return false
  // Even-build rule: cannot build if this tile already has more houses than the group minimum
  const groupHouses = groupMembers(tile.group).map((id) => state.properties[id].houses)
  return ps.houses === Math.min(...groupHouses)
}

export function canSellHouse(state: GameState, playerId: number, position: number): boolean {
  const tile = BOARD[position]
  if (tile.type !== "property" || !tile.group) return false
  const ps = state.properties[position]
  if (!ps || ps.ownerId !== playerId || ps.houses === 0) return false
  const groupHouses = groupMembers(tile.group).map((id) => state.properties[id].houses)
  return ps.houses === Math.max(...groupHouses)
}

// ---------------------------------------------------------------------------
// Initial state + reducer
// ---------------------------------------------------------------------------

export function createInitialState(): GameState {
  return {
    phase: "setup",
    players: [],
    currentPlayerIndex: 0,
    properties: {},
    dice: null,
    lastRollWasDoubles: false,
    turnEndsAfterResolve: false,
    pendingCard: null,
    cardMoved: false,
    auction: null,
    chanceDeck: shuffledDeckOrder(CHANCE_CARDS.length),
    chestDeck: shuffledDeckOrder(CHEST_CARDS.length),
    chanceIndex: 0,
    chestIndex: 0,
    log: [],
    logCounter: 0,
    winnerId: null,
  }
}

function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6)
}

function advanceTurn(state: GameState): GameState {
  let s: GameState = { ...state, dice: null, lastRollWasDoubles: false, turnEndsAfterResolve: false }
  let idx = s.currentPlayerIndex
  for (let i = 0; i < s.players.length; i++) {
    idx = (idx + 1) % s.players.length
    if (!s.players[idx].bankrupt) break
  }
  s = { ...s, currentPlayerIndex: idx, phase: "awaiting-roll" }
  const next = s.players[idx]
  s = log(s, `— ${next.name}'s turn —`, "system")
  return s
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "NEW_GAME":
      return createInitialState()

    case "START_GAME": {
      const players: Player[] = action.playerNames.map((name, i) => ({
        id: i,
        name: name.trim() || `Player ${i + 1}`,
        tokenIndex: action.tokenIndexes[i],
        money: STARTING_MONEY,
        position: 0,
        inJail: false,
        jailTurns: 0,
        doublesCount: 0,
        bankrupt: false,
        getOutOfJailCards: 0,
      }))
      const properties: Record<number, PropertyState> = {}
      for (const tile of BOARD) {
        if (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") {
          properties[tile.id] = { ownerId: null, houses: 0 }
        }
      }
      let s: GameState = { ...createInitialState(), phase: "awaiting-roll", players, properties }
      s = log(s, `Game started with ${players.length} players. Everyone begins with $${STARTING_MONEY}.`, "system")
      s = log(s, `— ${players[0].name}'s turn —`, "system")
      return s
    }

    case "ROLL_DICE": {
      if (state.phase !== "awaiting-roll") return state
      const player = currentPlayer(state)
      const d1 = rollDie()
      const d2 = rollDie()
      const isDoubles = d1 === d2
      let s: GameState = { ...state, dice: [d1, d2], lastRollWasDoubles: isDoubles, turnEndsAfterResolve: false }
      s = log(s, `${player.name} rolls ${d1} + ${d2} = ${d1 + d2}${isDoubles ? " — Doubles!" : ""}.`)

      // --- Jail handling ---
      if (player.inJail) {
        if (isDoubles) {
          s = log(s, `${player.name} rolled doubles and escapes Jail!`, "money-up")
          s = updatePlayer(s, player.id, { inJail: false, jailTurns: 0 })
          // Escaping via doubles does NOT grant another roll
          s = { ...s, lastRollWasDoubles: false }
        } else {
          const turns = player.jailTurns + 1
          if (turns >= 3) {
            s = log(s, `${player.name} failed 3 times and must pay the $${JAIL_FINE} fine.`, "money-down")
            s = chargePlayer(s, player.id, JAIL_FINE, null)
            if (s.phase === "game-over") return s
            s = updatePlayer(s, player.id, { inJail: false, jailTurns: 0 })
          } else {
            s = updatePlayer(s, player.id, { jailTurns: turns })
            s = log(s, `${player.name} stays in Jail (attempt ${turns} of 3).`, "alert")
            return { ...s, phase: "end-turn", lastRollWasDoubles: false }
          }
        }
        // Move out of jail with this roll
        const p = s.players[s.currentPlayerIndex]
        const newPos = (p.position + d1 + d2) % 40
        s = movePlayerTo(s, p.id, newPos, newPos < p.position)
        s = log(s, `${p.name} moves to ${BOARD[newPos].name}.`)
        return resolveTile(s)
      }

      // --- Three doubles => jail ---
      if (isDoubles) {
        const count = player.doublesCount + 1
        if (count >= 3) {
          s = log(s, `${player.name} rolled doubles three times in a row!`, "alert")
          return sendToJail(s, player.id)
        }
        s = updatePlayer(s, player.id, { doublesCount: count })
      } else {
        s = updatePlayer(s, player.id, { doublesCount: 0 })
      }

      // --- Normal movement ---
      const p = s.players[s.currentPlayerIndex]
      const newPos = (p.position + d1 + d2) % 40
      s = movePlayerTo(s, p.id, newPos, newPos < p.position)
      s = log(s, `${p.name} moves to ${BOARD[newPos].name}.`)
      return resolveTile(s)
    }

    case "BUY_PROPERTY": {
      if (state.phase !== "awaiting-buy") return state
      const player = currentPlayer(state)
      const tile = BOARD[player.position]
      const price = tile.price ?? 0
      if (player.money < price) return state
      let s = updatePlayer(state, player.id, { money: player.money - price })
      s = { ...s, properties: { ...s.properties, [tile.id]: { ownerId: player.id, houses: 0 } } }
      s = log(s, `${player.name} buys ${tile.name} for $${price}.`, "money-up")
      return { ...s, phase: "end-turn" }
    }

    case "START_AUCTION": {
      if (state.phase !== "awaiting-buy") return state
      const player = currentPlayer(state)
      const tile = BOARD[player.position]
      const bidders = activePlayers(state).map((p) => p.id)
      let s = log(state, `${tile.name} goes to auction!`, "system")
      return {
        ...s,
        phase: "auction",
        auction: {
          position: tile.id,
          currentBid: 0,
          highestBidderId: null,
          activeBidderIds: bidders,
          turnIndex: bidders.indexOf(player.id),
        },
      }
    }

    case "AUCTION_BID": {
      if (state.phase !== "auction" || !state.auction) return state
      const a = state.auction
      const bidderId = a.activeBidderIds[a.turnIndex]
      const bidder = state.players.find((p) => p.id === bidderId)!
      const newBid = a.currentBid + action.amount
      if (bidder.money < newBid) return state
      let s = log(state, `${bidder.name} bids $${newBid} for ${BOARD[a.position].name}.`)
      return {
        ...s,
        auction: {
          ...a,
          currentBid: newBid,
          highestBidderId: bidderId,
          turnIndex: (a.turnIndex + 1) % a.activeBidderIds.length,
        },
      }
    }

    case "AUCTION_PASS": {
      if (state.phase !== "auction" || !state.auction) return state
      const a = state.auction
      const passerId = a.activeBidderIds[a.turnIndex]
      const passer = state.players.find((p) => p.id === passerId)!
      let s = log(state, `${passer.name} passes.`)
      const remaining = a.activeBidderIds.filter((id) => id !== passerId)

      // Auction ends when nobody is left, or only the highest bidder remains
      if (remaining.length === 0 || (remaining.length === 1 && a.highestBidderId === remaining[0])) {
        if (a.highestBidderId !== null && remaining.includes(a.highestBidderId)) {
          const winner = s.players.find((p) => p.id === a.highestBidderId)!
          s = updatePlayer(s, winner.id, { money: winner.money - a.currentBid })
          s = { ...s, properties: { ...s.properties, [a.position]: { ownerId: winner.id, houses: 0 } } }
          s = log(s, `${winner.name} wins the auction for ${BOARD[a.position].name} at $${a.currentBid}!`, "money-up")
        } else {
          s = log(s, `Everyone passed. ${BOARD[a.position].name} remains unsold.`, "system")
        }
        return { ...s, auction: null, phase: "end-turn" }
      }

      const nextIndex = a.turnIndex % remaining.length
      return { ...s, auction: { ...a, activeBidderIds: remaining, turnIndex: nextIndex } }
    }

    case "APPLY_CARD": {
      if (state.phase !== "card" || !state.pendingCard) return state
      return applyCard(state, state.pendingCard)
    }

    case "PAY_JAIL_FINE": {
      if (state.phase !== "awaiting-roll") return state
      const player = currentPlayer(state)
      if (!player.inJail || player.money < JAIL_FINE) return state
      let s = updatePlayer(state, player.id, { money: player.money - JAIL_FINE, inJail: false, jailTurns: 0 })
      s = log(s, `${player.name} pays the $${JAIL_FINE} fine and is released from Jail.`, "money-down")
      return s
    }

    case "USE_JAIL_CARD": {
      if (state.phase !== "awaiting-roll") return state
      const player = currentPlayer(state)
      if (!player.inJail || player.getOutOfJailCards < 1) return state
      let s = updatePlayer(state, player.id, {
        getOutOfJailCards: player.getOutOfJailCards - 1,
        inJail: false,
        jailTurns: 0,
      })
      s = log(s, `${player.name} uses a Get Out of Jail Free card.`, "money-up")
      return s
    }

    case "BUILD_HOUSE": {
      const player = currentPlayer(state)
      if (!canBuildHouse(state, player.id, action.position)) return state
      const tile = BOARD[action.position]
      const cost = tile.houseCost!
      const ps = state.properties[action.position]
      let s = updatePlayer(state, player.id, { money: player.money - cost })
      s = { ...s, properties: { ...s.properties, [action.position]: { ...ps, houses: ps.houses + 1 } } }
      const label = ps.houses + 1 === 5 ? "a hotel" : `house #${ps.houses + 1}`
      s = log(s, `${player.name} builds ${label} on ${tile.name} for $${cost}.`, "money-down")
      return s
    }

    case "SELL_HOUSE": {
      const player = currentPlayer(state)
      if (!canSellHouse(state, player.id, action.position)) return state
      const tile = BOARD[action.position]
      const refund = Math.floor((tile.houseCost ?? 0) / 2)
      const ps = state.properties[action.position]
      let s = updatePlayer(state, player.id, { money: player.money + refund })
      s = { ...s, properties: { ...s.properties, [action.position]: { ...ps, houses: ps.houses - 1 } } }
      s = log(s, `${player.name} sells a building on ${tile.name} for $${refund}.`, "money-up")
      return s
    }

    case "END_TURN": {
      if (state.phase !== "end-turn") return state
      const player = currentPlayer(state)
      // Doubles grant another roll (unless the player was just jailed or is bankrupt)
      if (state.lastRollWasDoubles && !state.turnEndsAfterResolve && !player.inJail && !player.bankrupt) {
        let s: GameState = { ...state, phase: "awaiting-roll", dice: null, lastRollWasDoubles: false }
        s = log(s, `${player.name} rolled doubles and takes another turn!`, "system")
        return s
      }
      return advanceTurn(state)
    }

    default:
      return state
  }
}
