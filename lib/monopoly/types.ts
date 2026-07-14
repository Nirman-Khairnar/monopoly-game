export type TileType =
  | "go"
  | "property"
  | "railroad"
  | "utility"
  | "chance"
  | "chest"
  | "tax"
  | "jail"
  | "free-parking"
  | "go-to-jail"

export type ColorGroup =
  | "brown"
  | "lightblue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "darkblue"

export interface Tile {
  id: number
  name: string
  type: TileType
  price?: number
  group?: ColorGroup
  /** rents[0] = base, [1..4] = houses, [5] = hotel */
  rents?: number[]
  houseCost?: number
  taxAmount?: number
}

export interface PlayerToken {
  icon: string
  color: string
  label: string
}

export interface Player {
  id: number
  name: string
  tokenIndex: number
  money: number
  position: number
  inJail: boolean
  jailTurns: number
  doublesCount: number
  bankrupt: boolean
  getOutOfJailCards: number
}

export interface PropertyState {
  ownerId: number | null
  houses: number // 0-4 houses, 5 = hotel
}

export type CardEffect =
  | { kind: "money"; amount: number } // positive = receive, negative = pay
  | { kind: "move-to"; position: number; collectGo: boolean }
  | { kind: "move-relative"; steps: number }
  | { kind: "go-to-jail" }
  | { kind: "jail-free" }
  | { kind: "repairs"; perHouse: number; perHotel: number }
  | { kind: "collect-each"; amount: number } // negative = pay each player
  | { kind: "nearest-railroad" }
  | { kind: "nearest-utility" }

export interface GameCard {
  deck: "chance" | "chest"
  text: string
  effect: CardEffect
}

export interface AuctionState {
  position: number
  currentBid: number
  highestBidderId: number | null
  activeBidderIds: number[]
  turnIndex: number // index into activeBidderIds
}

export type GamePhase =
  | "setup"
  | "awaiting-roll"
  | "awaiting-buy"
  | "auction"
  | "card"
  | "end-turn"
  | "game-over"

export interface LogEntry {
  id: number
  text: string
  tone: "info" | "money-up" | "money-down" | "alert" | "system"
}

export interface GameState {
  phase: GamePhase
  players: Player[]
  currentPlayerIndex: number
  properties: Record<number, PropertyState>
  dice: [number, number] | null
  lastRollWasDoubles: boolean
  turnEndsAfterResolve: boolean // set when jailed mid-turn (no roll again)
  pendingCard: GameCard | null
  cardMoved: boolean
  auction: AuctionState | null
  chanceDeck: number[]
  chestDeck: number[]
  chanceIndex: number
  chestIndex: number
  log: LogEntry[]
  logCounter: number
  winnerId: number | null
}

export type GameAction =
  | { type: "START_GAME"; playerNames: string[]; tokenIndexes: number[] }
  | { type: "ROLL_DICE" }
  | { type: "BUY_PROPERTY" }
  | { type: "START_AUCTION" }
  | { type: "AUCTION_BID"; amount: number }
  | { type: "AUCTION_PASS" }
  | { type: "APPLY_CARD" }
  | { type: "PAY_JAIL_FINE" }
  | { type: "USE_JAIL_CARD" }
  | { type: "BUILD_HOUSE"; position: number }
  | { type: "SELL_HOUSE"; position: number }
  | { type: "END_TURN" }
  | { type: "NEW_GAME" }
