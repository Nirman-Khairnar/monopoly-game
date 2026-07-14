import type { ColorGroup, PlayerToken, Tile } from "./types"

export const GO_SALARY = 200
export const JAIL_POSITION = 10
export const JAIL_FINE = 50
export const STARTING_MONEY = 1500

export const GROUP_COLORS: Record<ColorGroup, string> = {
  brown: "#955436",
  lightblue: "#aae0fa",
  pink: "#d93a96",
  orange: "#f7941d",
  red: "#ed1b24",
  yellow: "#fef200",
  green: "#1fb25a",
  darkblue: "#0072bb",
}

export const PLAYER_TOKENS: PlayerToken[] = [
  { icon: "car", color: "#dc2626", label: "Racecar" },
  { icon: "dog", color: "#2563eb", label: "Dog" },
  { icon: "cat", color: "#16a34a", label: "Cat" },
  { icon: "ship", color: "#9333ea", label: "Battleship" },
  { icon: "crown", color: "#ca8a04", label: "Top Hat" },
  { icon: "rocket", color: "#0891b2", label: "Rocket" },
]

export const BOARD: Tile[] = [
  { id: 0, name: "GO", type: "go" },
  { id: 1, name: "Mediterranean Avenue", type: "property", group: "brown", price: 60, houseCost: 50, rents: [2, 10, 30, 90, 160, 250] },
  { id: 2, name: "Community Chest", type: "chest" },
  { id: 3, name: "Baltic Avenue", type: "property", group: "brown", price: 60, houseCost: 50, rents: [4, 20, 60, 180, 320, 450] },
  { id: 4, name: "Income Tax", type: "tax", taxAmount: 200 },
  { id: 5, name: "Reading Railroad", type: "railroad", price: 200 },
  { id: 6, name: "Oriental Avenue", type: "property", group: "lightblue", price: 100, houseCost: 50, rents: [6, 30, 90, 270, 400, 550] },
  { id: 7, name: "Chance", type: "chance" },
  { id: 8, name: "Vermont Avenue", type: "property", group: "lightblue", price: 100, houseCost: 50, rents: [6, 30, 90, 270, 400, 550] },
  { id: 9, name: "Connecticut Avenue", type: "property", group: "lightblue", price: 120, houseCost: 50, rents: [8, 40, 100, 300, 450, 600] },
  { id: 10, name: "Jail / Just Visiting", type: "jail" },
  { id: 11, name: "St. Charles Place", type: "property", group: "pink", price: 140, houseCost: 100, rents: [10, 50, 150, 450, 625, 750] },
  { id: 12, name: "Electric Company", type: "utility", price: 150 },
  { id: 13, name: "States Avenue", type: "property", group: "pink", price: 140, houseCost: 100, rents: [10, 50, 150, 450, 625, 750] },
  { id: 14, name: "Virginia Avenue", type: "property", group: "pink", price: 160, houseCost: 100, rents: [12, 60, 180, 500, 700, 900] },
  { id: 15, name: "Pennsylvania Railroad", type: "railroad", price: 200 },
  { id: 16, name: "St. James Place", type: "property", group: "orange", price: 180, houseCost: 100, rents: [14, 70, 200, 550, 750, 950] },
  { id: 17, name: "Community Chest", type: "chest" },
  { id: 18, name: "Tennessee Avenue", type: "property", group: "orange", price: 180, houseCost: 100, rents: [14, 70, 200, 550, 750, 950] },
  { id: 19, name: "New York Avenue", type: "property", group: "orange", price: 200, houseCost: 100, rents: [16, 80, 220, 600, 800, 1000] },
  { id: 20, name: "Free Parking", type: "free-parking" },
  { id: 21, name: "Kentucky Avenue", type: "property", group: "red", price: 220, houseCost: 150, rents: [18, 90, 250, 700, 875, 1050] },
  { id: 22, name: "Chance", type: "chance" },
  { id: 23, name: "Indiana Avenue", type: "property", group: "red", price: 220, houseCost: 150, rents: [18, 90, 250, 700, 875, 1050] },
  { id: 24, name: "Illinois Avenue", type: "property", group: "red", price: 240, houseCost: 150, rents: [20, 100, 300, 750, 925, 1100] },
  { id: 25, name: "B&O Railroad", type: "railroad", price: 200 },
  { id: 26, name: "Atlantic Avenue", type: "property", group: "yellow", price: 260, houseCost: 150, rents: [22, 110, 330, 800, 975, 1150] },
  { id: 27, name: "Ventnor Avenue", type: "property", group: "yellow", price: 260, houseCost: 150, rents: [22, 110, 330, 800, 975, 1150] },
  { id: 28, name: "Water Works", type: "utility", price: 150 },
  { id: 29, name: "Marvin Gardens", type: "property", group: "yellow", price: 280, houseCost: 150, rents: [24, 120, 360, 850, 1025, 1200] },
  { id: 30, name: "Go To Jail", type: "go-to-jail" },
  { id: 31, name: "Pacific Avenue", type: "property", group: "green", price: 300, houseCost: 200, rents: [26, 130, 390, 900, 1100, 1275] },
  { id: 32, name: "North Carolina Avenue", type: "property", group: "green", price: 300, houseCost: 200, rents: [26, 130, 390, 900, 1100, 1275] },
  { id: 33, name: "Community Chest", type: "chest" },
  { id: 34, name: "Pennsylvania Avenue", type: "property", group: "green", price: 320, houseCost: 200, rents: [28, 150, 450, 1000, 1200, 1400] },
  { id: 35, name: "Short Line", type: "railroad", price: 200 },
  { id: 36, name: "Chance", type: "chance" },
  { id: 37, name: "Park Place", type: "property", group: "darkblue", price: 350, houseCost: 200, rents: [35, 175, 500, 1100, 1300, 1500] },
  { id: 38, name: "Luxury Tax", type: "tax", taxAmount: 100 },
  { id: 39, name: "Boardwalk", type: "property", group: "darkblue", price: 400, houseCost: 200, rents: [50, 200, 600, 1400, 1700, 2000] },
]

/** All tile ids belonging to a color group */
export function groupMembers(group: ColorGroup): number[] {
  return BOARD.filter((t) => t.group === group).map((t) => t.id)
}

export const RAILROAD_POSITIONS = [5, 15, 25, 35]
export const UTILITY_POSITIONS = [12, 28]
