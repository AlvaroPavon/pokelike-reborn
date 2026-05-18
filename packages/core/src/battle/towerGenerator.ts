/**
 * @fileoverview Procedural tower encounter generator for Battle Tower mode.
 *
 * Generates escalating opponent teams based on the current floor number.
 * Difficulty scales via level increases and team size progression,
 * using the species registry for procedural opponent creation.
 *
 * @module battle
 */

import { speciesList } from "../data/speciesList.js";
import type { SpeciesEntry } from "../data/speciesList.js";
import type { PokemonInstance, BaseStats } from "../types/index.js";

// ─── Types ─────────────────────────────────────────────────────────────────

/**
 * Describes a single floor encounter in the Battle Tower.
 */
export interface TowerFloor {
  /** Floor number (1-indexed). */
  floor: number;
  /** The opponent team for this floor. */
  opponentTeam: PokemonInstance[];
  /** Level of all Pokemon on this floor. */
  level: number;
  /** Number of Pokemon on the opponent team. */
  teamSize: number;
}

// ─── Level Scaling Formula ─────────────────────────────────────────────────
//
//  Floor 1  → level 5
//  Floor 10 → level ~28
//  Floor 20 → level ~53
//
//  Formula: level = round(2.5 * floor + 2.5)
//  Grows linearly at ~2.5 levels per floor.

/**
 * Calculate the opponent level for a given tower floor.
 *
 * @param floor - The current floor (1-indexed).
 * @returns The level to use for opponent Pokemon on this floor.
 */
export function calculateTowerLevel(floor: number): number {
  return Math.round(2.5 * floor + 2.5);
}

// ─── Team Size Formula ────────────────────────────────────────────────────
//
//  Floors  1-5:  1 Pokémon
//  Floors  6-15: 3 Pokémon
//  Floors 16+:   6 Pokémon

/**
 * Determine how many Pokemon the opponent team should have for the given floor.
 *
 * @param floor - The current floor (1-indexed).
 * @returns Team size (1, 3, or 6).
 */
export function calculateTowerTeamSize(floor: number): number {
  if (floor <= 5) return 1;
  if (floor <= 15) return 3;
  return 6;
}

// ─── Stat Calculation ─────────────────────────────────────────────────────

/**
 * Calculate a single stat value using the standard Pokemon formula.
 *
 * @param base  - Base stat value for the species.
 * @param iv    - Individual Value (0-31).
 * @param ev    - Effort Value.
 * @param level - Current level.
 * @param isHp  - Whether this is the HP stat (uses different formula).
 * @returns The calculated stat value.
 */
function calculateStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  isHp: boolean,
): number {
  const stat = Math.floor(
    ((2 * base + iv + Math.floor(ev / 4)) * level) / 100,
  );
  return isHp ? stat + level + 10 : stat + 5;
}

// ─── Tower Pokemon Factory ────────────────────────────────────────────────

/**
 * Stat scaling multiplier for IVs based on floor difficulty.
 * Higher floors give Pokemon better IVs for a small extra challenge.
 */
function getIvBonus(floor: number): number {
  // Floors 1-5: base IVs only (15)
  // Floors 6-10: +2
  // Floors 11+: +4
  if (floor <= 5) return 0;
  if (floor <= 10) return 2;
  return 4;
}

/**
 * Create a single Pokemon instance for a tower encounter.
 *
 * @param species - The species entry to base the Pokemon on.
 * @param level   - The level for this Pokemon.
 * @param floor   - The current floor (used for IV scaling).
 * @returns A fully-formed PokemonInstance ready for battle.
 */
function createTowerPokemon(
  species: SpeciesEntry,
  level: number,
  floor: number,
): PokemonInstance {
  const ivBonus = getIvBonus(floor);
  const ivValue = 15 + ivBonus;

  const ivs: BaseStats = {
    hp: ivValue,
    atk: ivValue,
    def: ivValue,
    spa: ivValue,
    spd: ivValue,
    spe: ivValue,
  };

  const evs: BaseStats = {
    hp: 0,
    atk: 0,
    def: 0,
    spa: 0,
    spd: 0,
    spe: 0,
  };

  const stats: BaseStats = {
    hp: calculateStat(species.baseStats.hp, ivs.hp, evs.hp, level, true),
    atk: calculateStat(species.baseStats.atk, ivs.atk, evs.atk, level, false),
    def: calculateStat(species.baseStats.def, ivs.def, evs.def, level, false),
    spa: calculateStat(species.baseStats.spa, ivs.spa, evs.spa, level, false),
    spd: calculateStat(species.baseStats.spd, ivs.spd, evs.spd, level, false),
    spe: calculateStat(species.baseStats.spe, ivs.spe, evs.spe, level, false),
  };

  return {
    speciesId: species.id,
    level,
    currentHp: stats.hp,
    maxHp: stats.hp,
    ivs,
    evs,
    stats,
    moves: [
      {
        moveId: "tackle",
        currentPp: 35,
        maxPp: 35,
      },
    ],
    trainerId: "tower",
    fainted: false,
    status: null,
  };
}

// ─── Species Selection ────────────────────────────────────────────────────

/**
 * Deterministically pick species IDs for a tower floor.
 *
 * Uses a simple pseudo-random formula based on floor and slot index
 * to ensure variety without requiring an RNG instance.
 *
 * @param floor - The current floor (1-indexed).
 * @param count - How many species IDs to pick.
 * @returns Array of species ID strings.
 */
function pickSpeciesIds(floor: number, count: number): string[] {
  const result: string[] = [];
  const used = new Set<number>();

  for (let i = 0; i < count; i++) {
    // Deterministic index: different floor + slot combos produce different species
    let idx = ((floor - 1) * 31 + i * 17) % speciesList.length;
    // Avoid duplicate species within the same team
    while (used.has(idx)) {
      idx = (idx + 1) % speciesList.length;
    }
    used.add(idx);
    result.push(speciesList[idx]!.id);
  }

  return result;
}

// ─── Main Exports ─────────────────────────────────────────────────────────

/**
 * Generate a complete tower floor encounter.
 *
 * Creates an opponent team for the given floor with level-scaled Pokemon
 * and a team size that grows as the player advances.
 *
 * @param floor - The floor number (1-indexed) to generate an encounter for.
 * @returns A `TowerFloor` object with the opponent team and metadata.
 */
export function generateTowerEncounter(floor: number): TowerFloor {
  const level = calculateTowerLevel(floor);
  const teamSize = calculateTowerTeamSize(floor);
  const speciesIds = pickSpeciesIds(floor, teamSize);

  const team: PokemonInstance[] = speciesIds.map((speciesId) => {
    const species = speciesList.find(
      (s): s is SpeciesEntry => s.id === speciesId,
    );
    // Fallback: should never happen with valid speciesIds
    if (!species) {
      throw new Error(`Species not found: ${speciesId}`);
    }
    return createTowerPokemon(species, level, floor);
  });

  return { floor, opponentTeam: team, level, teamSize };
}

/**
 * Get the opponent team for the next floor.
 *
 * Convenience wrapper around `generateTowerEncounter` that returns
 * just the opponent Pokemon array for direct use in battle setup.
 *
 * @param floor - The next floor number (1-indexed).
 * @returns Array of opponent PokemonInstance.
 */
export function getNextOpponent(floor: number): PokemonInstance[] {
  return generateTowerEncounter(floor).opponentTeam;
}
