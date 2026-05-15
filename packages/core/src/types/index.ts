/**
 * Core type definitions for the Pokelike Reborn game engine.
 *
 * This file defines all shared data structures used across the game:
 * - Pokemon types (18 elemental types with matchups)
 * - Stat blocks and species definitions
 * - Moves, items, and battle entities
 * - Map/overworld graph structures
 * - Game state and battle result types
 */

// ─── Pokemon Type System ─────────────────────────────────────────────────────

/**
 * All 18 canonical Pokemon elemental types.
 *
 * These form the basis of the type effectiveness system. Each type
 * has specific offensive and defensive relationships with every other type.
 */
export enum PokemonType {
  Normal = "Normal",
  Fire = "Fire",
  Water = "Water",
  Electric = "Electric",
  Grass = "Grass",
  Ice = "Ice",
  Fighting = "Fighting",
  Poison = "Poison",
  Ground = "Ground",
  Flying = "Flying",
  Psychic = "Psychic",
  Bug = "Bug",
  Rock = "Rock",
  Ghost = "Ghost",
  Dragon = "Dragon",
  Dark = "Dark",
  Steel = "Steel",
  Fairy = "Fairy",
}

/**
 * Immutable set of all 18 Pokemon types for runtime iteration.
 */
export const ALL_TYPES: readonly PokemonType[] = Object.values(PokemonType);

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Core stat block used by Pokemon species, individual Pokemon, and battle participants.
 *
 * All values are raw stat numbers before modifiers. The six stats are:
 * - HP (hit points / health)
 * - ATK (physical attack power)
 * - DEF (physical defense)
 * - SPA (special attack power)
 * - SPD (special defense)
 * - SPE (speed — determines turn order)
 */
export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

// ─── Species ──────────────────────────────────────────────────────────────────

/**
 * Definition of a Pokemon species (not an individual instance).
 *
 * Species are the archetypes — Pikachu, Charizard, etc. Each species has
 * fixed base stats, one or two types, and sprite assets.
 */
export interface PokemonSpecies {
  /** Unique identifier (e.g., "pikachu", "charizard") */
  id: string;
  /** Display name */
  name: string;
  /** One or two types (dual-type Pokemon have two) */
  types: [PokemonType, PokemonType?];
  /** Base stat block */
  baseStats: BaseStats;
  /** Base Stat Total — sum of all six stats */
  bst: number;
  /** URL to the default sprite */
  spriteUrl: string;
  /** URL to the shiny variant sprite */
  shinySpriteUrl: string;
}

// ─── Moves ────────────────────────────────────────────────────────────────────

/**
 * The damage category of a move.
 * - Physical: uses ATK vs DEF
 * - Special: uses SPA vs SPD
 * - Status: no direct damage (applies effects)
 */
export type MoveCategory = "physical" | "special" | "status";

/**
 * Definition of a battle move (attack, status move, etc.).
 */
export interface Move {
  /** Display name (e.g., "Thunderbolt") */
  name: string;
  /** Base power (0 for status moves) */
  power: number;
  /** The move's elemental type */
  type: PokemonType;
  /** Whether this is a special move (uses SPA/SPD) vs physical (uses ATK/DEF) */
  isSpecial: boolean;
  /** Damage category */
  category: MoveCategory;
  /** Flavor/effect description */
  description: string;
}

// ─── Items ────────────────────────────────────────────────────────────────────

/**
 * A usable or holdable item.
 */
export interface Item {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Flavor/effect description */
  description: string;
  /** Icon identifier or URL */
  icon: string;
  /** Effects this item applies (free-form for future engine use) */
  effects: Record<string, unknown>;
}

// ─── Map / Overworld ──────────────────────────────────────────────────────────

/**
 * Types of nodes that can appear on the overworld map.
 */
export enum NodeType {
  START = "START",
  BATTLE = "BATTLE",
  CATCH = "CATCH",
  ITEM = "ITEM",
  BOSS = "BOSS",
  POKECENTER = "POKECENTER",
  TRAINER = "TRAINER",
  LEGENDARY = "LEGENDARY",
  MOVE_TUTOR = "MOVE_TUTOR",
  TRADE = "TRADE",
  QUESTION = "QUESTION",
}

/**
 * A single node on the overworld map graph.
 *
 * Nodes represent locations the player can visit. The map is a directed
 * or undirected graph where traversal is controlled by accessibility rules.
 */
export interface MapNode {
  /** Unique node identifier */
  id: string;
  /** Visual/functional type */
  type: NodeType;
  /** Position on the rendered map (x, y) */
  position: { x: number; y: number };
  /** IDs of connected nodes reachable from this one */
  connections: string[];
  /** Whether the player has visited this node */
  visited: boolean;
  /** Whether this node is currently reachable */
  accessible: boolean;
}

/**
 * A connection/edge between two map nodes.
 */
export interface MapEdge {
  /** Source node ID */
  from: string;
  /** Destination node ID */
  to: string;
  /** Optional label or condition for traversal */
  label?: string;
}

/**
 * The complete overworld map structure.
 */
export interface MapGraph {
  /** All nodes in the map */
  nodes: MapNode[];
  /** All connections between nodes */
  edges: MapEdge[];
  /** Number of map layers/regions */
  layers: number;
}

// ─── Game State ───────────────────────────────────────────────────────────────

/**
 * The current game mode, which affects rules and difficulty.
 */
export type GameMode = "normal" | "nuzlocke" | "battle_tower";

/**
 * Serializable snapshot of the entire game state.
 *
 * This is the persisted state that gets saved/loaded. It captures
 * the player's progress, team, inventory, and current location.
 */
export interface GameState {
  /** Current overworld map */
  currentMap: string;
  /** Current node the player is at */
  currentNode: string;
  /** Player's current Pokemon team */
  team: PokemonInstance[];
  /** Inventory items */
  items: ItemInstance[];
  /** Gym badges or progression flags */
  badges: string[];
  /** Active game mode */
  mode: GameMode;
}

/**
 * An individual Pokemon instance belonging to the player or an NPC.
 */
export interface PokemonInstance {
  /** Species identifier */
  speciesId: string;
  /** Nickname (optional) */
  nickname?: string;
  /** Current level */
  level: number;
  /** Current HP */
  currentHp: number;
  /** Maximum HP */
  maxHp: number;
  /** Individual Values (genetic variation) */
  ivs: BaseStats;
  /** Effort Values (earned from battles) */
  evs: BaseStats;
  /** Actual stats after IVs, EVs, level, and nature */
  stats: BaseStats;
  /** Known moves */
  moves: MoveInstance[];
  /** Original trainer ID */
  trainerId: string;
  /** Whether this Pokemon has fainted */
  fainted: boolean;
  /** Status condition (e.g., "BRN", "PAR", "SLP", null for healthy) */
  status: string | null;
}

/**
 * An instance of a move known by a specific Pokemon.
 */
export interface MoveInstance {
  /** Move definition identifier */
  moveId: string;
  /** Remaining PP (power points) */
  currentPp: number;
  /** Maximum PP */
  maxPp: number;
}

/**
 * An item instance in the player's inventory.
 */
export interface ItemInstance {
  /** Item definition identifier */
  itemId: string;
  /** Stack quantity */
  quantity: number;
}

// ─── Battle ───────────────────────────────────────────────────────────────────

/**
 * A single entry in the battle log.
 *
 * The log records everything that happens during a battle for
 * replay, debugging, and display purposes.
 */
export interface BattleLogEntry {
  /** Turn number */
  turn: number;
  /** Which side performed the action */
  side: "player" | "enemy" | "system";
  /** Action or event type */
  action: string;
  /** Human-readable message */
  message: string;
  /** Damage dealt (if applicable) */
  damage?: number;
  /** Target of the action */
  target?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * The complete result of a battle simulation.
 *
 * This is the output of the battle engine — a pure function that
 * takes state and returns this result with no side effects.
 */
export interface BattleResult {
  /** Which side won: "player", "enemy", or "draw" */
  winner: "player" | "enemy" | "draw";
  /** Full battle log */
  log: BattleLogEntry[];
  /** Player's team after the battle */
  finalPlayerTeam: PokemonInstance[];
  /** Enemy's team after the battle */
  finalEnemyTeam: PokemonInstance[];
  /** The PRNG seed used for this battle (for reproducibility) */
  seedUsed: number;
}

// ─── Re-exports Barrel ────────────────────────────────────────────────────────

// This barrel file re-exports all types for convenient imports.
// Consumers can do: import { PokemonType, BaseStats, Move } from "@pokelike/core";
