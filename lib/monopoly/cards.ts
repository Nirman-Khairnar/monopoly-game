import type { GameCard } from "./types"

export const CHANCE_CARDS: GameCard[] = [
  { deck: "chance", text: "Advance to GO. Collect $200.", effect: { kind: "move-to", position: 0, collectGo: true } },
  { deck: "chance", text: "Advance to Illinois Avenue. If you pass GO, collect $200.", effect: { kind: "move-to", position: 24, collectGo: true } },
  { deck: "chance", text: "Advance to St. Charles Place. If you pass GO, collect $200.", effect: { kind: "move-to", position: 11, collectGo: true } },
  { deck: "chance", text: "Advance to the nearest Railroad. Pay the owner double rent if owned.", effect: { kind: "nearest-railroad" } },
  { deck: "chance", text: "Advance to the nearest Utility. If owned, pay 10x your dice roll.", effect: { kind: "nearest-utility" } },
  { deck: "chance", text: "Bank pays you a dividend of $50.", effect: { kind: "money", amount: 50 } },
  { deck: "chance", text: "Get Out of Jail Free. Keep this card until needed.", effect: { kind: "jail-free" } },
  { deck: "chance", text: "Go back 3 spaces.", effect: { kind: "move-relative", steps: -3 } },
  { deck: "chance", text: "Go directly to Jail. Do not pass GO. Do not collect $200.", effect: { kind: "go-to-jail" } },
  { deck: "chance", text: "Make general repairs: pay $25 per house and $100 per hotel you own.", effect: { kind: "repairs", perHouse: 25, perHotel: 100 } },
  { deck: "chance", text: "Speeding fine. Pay $15.", effect: { kind: "money", amount: -15 } },
  { deck: "chance", text: "Take a trip to Reading Railroad. If you pass GO, collect $200.", effect: { kind: "move-to", position: 5, collectGo: true } },
  { deck: "chance", text: "Advance to Boardwalk.", effect: { kind: "move-to", position: 39, collectGo: false } },
  { deck: "chance", text: "You have been elected Chairman of the Board. Pay each player $50.", effect: { kind: "collect-each", amount: -50 } },
  { deck: "chance", text: "Your building loan matures. Collect $150.", effect: { kind: "money", amount: 150 } },
]

export const CHEST_CARDS: GameCard[] = [
  { deck: "chest", text: "Advance to GO. Collect $200.", effect: { kind: "move-to", position: 0, collectGo: true } },
  { deck: "chest", text: "Bank error in your favor. Collect $200.", effect: { kind: "money", amount: 200 } },
  { deck: "chest", text: "Doctor's fees. Pay $50.", effect: { kind: "money", amount: -50 } },
  { deck: "chest", text: "From sale of stock you get $50.", effect: { kind: "money", amount: 50 } },
  { deck: "chest", text: "Get Out of Jail Free. Keep this card until needed.", effect: { kind: "jail-free" } },
  { deck: "chest", text: "Go directly to Jail. Do not pass GO. Do not collect $200.", effect: { kind: "go-to-jail" } },
  { deck: "chest", text: "Holiday fund matures. Collect $100.", effect: { kind: "money", amount: 100 } },
  { deck: "chest", text: "Income tax refund. Collect $20.", effect: { kind: "money", amount: 20 } },
  { deck: "chest", text: "It is your birthday. Collect $10 from every player.", effect: { kind: "collect-each", amount: 10 } },
  { deck: "chest", text: "Life insurance matures. Collect $100.", effect: { kind: "money", amount: 100 } },
  { deck: "chest", text: "Pay hospital fees of $100.", effect: { kind: "money", amount: -100 } },
  { deck: "chest", text: "Pay school fees of $50.", effect: { kind: "money", amount: -50 } },
  { deck: "chest", text: "Receive $25 consultancy fee.", effect: { kind: "money", amount: 25 } },
  { deck: "chest", text: "Street repairs: pay $40 per house and $115 per hotel you own.", effect: { kind: "repairs", perHouse: 40, perHotel: 115 } },
  { deck: "chest", text: "You have won second prize in a beauty contest. Collect $10.", effect: { kind: "money", amount: 10 } },
  { deck: "chest", text: "You inherit $100.", effect: { kind: "money", amount: 100 } },
]

export function shuffledDeckOrder(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}
