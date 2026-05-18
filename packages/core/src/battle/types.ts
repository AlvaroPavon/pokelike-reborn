/**
 * @fileoverview Battle-specific type definitions for the battle engine module.
 *
 * Provides a centralized set of types used by the battle simulator,
 * including the Team type and game-specific species/item definitions.
 * Re-exports common core types for convenience.
 *
 * @module battle
 */

import type {
  BaseStats,
  Move,
  PokemonType,
  PokemonInstance,
} from "../types/index.js";

// ─── Battle-specific Types ───────────────────────────────────────────────────

/**
 * A team is an ordered array of Pokemon instances.
 *
 * During battle, the first non-fainted Pokemon is the active one.
 */
export type Team = PokemonInstance[];

/**
 * Optional configuration for battle simulation.
 */
export interface BattleOptions {
  /** Maximum number of turns before forcing a draw (default: 100) */
  maxTurns?: number;
}

// ─── Game Database Types ─────────────────────────────────────────────────────

/**
 * Simplified species entry used by the battle engine for stat calculation,
 * STAB, move lookup, and evolution.
 *
 * This is intentionally simpler than the full SpeciesEntry in speciesList.ts
 * and includes only what the battle engine needs.
 */
export interface SpeciesEntry {
  id: string;
  name: string;
  types: [PokemonType, PokemonType?];
  baseStats: BaseStats;
  /** Evolution level (0 = no evolution) */
  evolvesAt: number;
  /** Species ID this evolves into */
  evolvesTo: string;
  /** Move pool per level */
  movePool: Array<{ level: number; move: Move }>;
}

/**
 * An item option presented to the player (pick from a choice).
 */
export interface ItemOption {
  itemId: string;
  name: string;
  description: string;
  icon: string;
}
