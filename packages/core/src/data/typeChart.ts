/**
 * Pokemon Type Effectiveness Chart
 *
 * This module defines the immutable type matchup matrix for all 18 Pokemon types.
 * It provides a single function, `getEffectiveness()`, that calculates the
 * total effectiveness multiplier when one type attacks a defender with one
 * or two types.
 *
 * The type chart is based on the canonical Generation 6+ matchups (includes Fairy).
 *
 * Effectiveness values:
 * - 0.0 = immune (no damage)
 * - 0.5 = not very effective (resisted)
 * - 1.0 = neutral
 * - 2.0 = super effective
 *
 * @module
 */

import { PokemonType } from "../types/index.js";

/**
 * Effectiveness multiplier type.
 *
 * - 0 = immune
 * - 0.5 = not very effective (resisted)
 * - 1 = neutral
 * - 2 = super effective
 */
export type Effectiveness = 0 | 0.5 | 1 | 2;

/**
 * Immutable type effectiveness lookup table.
 *
 * The outer key is the attacking type, the inner key is the defending type.
 * Each value is the effectiveness multiplier applied when a move of the
 * attacking type hits a Pokemon of the defending type.
 *
 * This map is frozen at creation time and cannot be modified at runtime.
 */
const TYPE_CHART: ReadonlyMap<PokemonType, ReadonlyMap<PokemonType, Effectiveness>> =
  buildTypeChart();

/**
 * Build and freeze the complete type effectiveness chart.
 *
 * This creates a Map-of-Maps structure where:
 *   TYPE_CHART.get(attackType).get(defendType) → Effectiveness
 *
 * The chart is immediately frozen to prevent runtime modification.
 */
function buildTypeChart(): ReadonlyMap<
  PokemonType,
  ReadonlyMap<PokemonType, Effectiveness>
> {
  // Initialize chart: all matchups start at 1.0 (neutral)
  const base = new Map<PokemonType, Map<PokemonType, Effectiveness>>();

  for (const atk of Object.values(PokemonType)) {
    const row = new Map<PokemonType, Effectiveness>();
    for (const def of Object.values(PokemonType)) {
      row.set(def, 1);
    }
    base.set(atk, row);
  }

  // Helper: set a single matchup
  function set(atk: PokemonType, def: PokemonType, eff: Effectiveness): void {
    base.get(atk)!.set(def, eff);
  }

  // ─── Super Effective (2x) ──────────────────────────────────────────────

  // Normal
  // (no 2x matchups — Normal is resisted by Rock, immune to Ghost)

  // Fire
  set(PokemonType.Fire, PokemonType.Grass, 2);
  set(PokemonType.Fire, PokemonType.Ice, 2);
  set(PokemonType.Fire, PokemonType.Bug, 2);
  set(PokemonType.Fire, PokemonType.Steel, 2);

  // Water
  set(PokemonType.Water, PokemonType.Fire, 2);
  set(PokemonType.Water, PokemonType.Ground, 2);
  set(PokemonType.Water, PokemonType.Rock, 2);

  // Electric
  set(PokemonType.Electric, PokemonType.Water, 2);
  set(PokemonType.Electric, PokemonType.Flying, 2);

  // Grass
  set(PokemonType.Grass, PokemonType.Water, 2);
  set(PokemonType.Grass, PokemonType.Ground, 2);
  set(PokemonType.Grass, PokemonType.Rock, 2);

  // Ice
  set(PokemonType.Ice, PokemonType.Grass, 2);
  set(PokemonType.Ice, PokemonType.Ground, 2);
  set(PokemonType.Ice, PokemonType.Flying, 2);
  set(PokemonType.Ice, PokemonType.Dragon, 2);

  // Fighting
  set(PokemonType.Fighting, PokemonType.Normal, 2);
  set(PokemonType.Fighting, PokemonType.Ice, 2);
  set(PokemonType.Fighting, PokemonType.Rock, 2);
  set(PokemonType.Fighting, PokemonType.Dark, 2);
  set(PokemonType.Fighting, PokemonType.Steel, 2);

  // Poison
  set(PokemonType.Poison, PokemonType.Grass, 2);
  set(PokemonType.Poison, PokemonType.Fairy, 2);

  // Ground
  set(PokemonType.Ground, PokemonType.Fire, 2);
  set(PokemonType.Ground, PokemonType.Electric, 2);
  set(PokemonType.Ground, PokemonType.Poison, 2);
  set(PokemonType.Ground, PokemonType.Rock, 2);
  set(PokemonType.Ground, PokemonType.Steel, 2);

  // Flying
  set(PokemonType.Flying, PokemonType.Grass, 2);
  set(PokemonType.Flying, PokemonType.Fighting, 2);
  set(PokemonType.Flying, PokemonType.Bug, 2);

  // Psychic
  set(PokemonType.Psychic, PokemonType.Fighting, 2);
  set(PokemonType.Psychic, PokemonType.Poison, 2);

  // Bug
  set(PokemonType.Bug, PokemonType.Grass, 2);
  set(PokemonType.Bug, PokemonType.Psychic, 2);
  set(PokemonType.Bug, PokemonType.Dark, 2);

  // Rock
  set(PokemonType.Rock, PokemonType.Fire, 2);
  set(PokemonType.Rock, PokemonType.Ice, 2);
  set(PokemonType.Rock, PokemonType.Flying, 2);
  set(PokemonType.Rock, PokemonType.Bug, 2);

  // Ghost
  set(PokemonType.Ghost, PokemonType.Psychic, 2);
  set(PokemonType.Ghost, PokemonType.Ghost, 2);

  // Dragon
  set(PokemonType.Dragon, PokemonType.Dragon, 2);

  // Dark
  set(PokemonType.Dark, PokemonType.Psychic, 2);
  set(PokemonType.Dark, PokemonType.Ghost, 2);

  // Steel
  set(PokemonType.Steel, PokemonType.Ice, 2);
  set(PokemonType.Steel, PokemonType.Rock, 2);
  set(PokemonType.Steel, PokemonType.Fairy, 2);

  // Fairy
  set(PokemonType.Fairy, PokemonType.Fighting, 2);
  set(PokemonType.Fairy, PokemonType.Dragon, 2);
  set(PokemonType.Fairy, PokemonType.Dark, 2);

  // ─── Not Very Effective (0.5x) ──────────────────────────────────────────

  // Normal
  set(PokemonType.Normal, PokemonType.Rock, 0.5);
  set(PokemonType.Normal, PokemonType.Steel, 0.5);

  // Fire
  set(PokemonType.Fire, PokemonType.Fire, 0.5);
  set(PokemonType.Fire, PokemonType.Water, 0.5);
  set(PokemonType.Fire, PokemonType.Rock, 0.5);
  set(PokemonType.Fire, PokemonType.Dragon, 0.5);

  // Water
  set(PokemonType.Water, PokemonType.Water, 0.5);
  set(PokemonType.Water, PokemonType.Grass, 0.5);
  set(PokemonType.Water, PokemonType.Dragon, 0.5);

  // Electric
  set(PokemonType.Electric, PokemonType.Electric, 0.5);
  set(PokemonType.Electric, PokemonType.Grass, 0.5);
  set(PokemonType.Electric, PokemonType.Dragon, 0.5);

  // Grass
  set(PokemonType.Grass, PokemonType.Fire, 0.5);
  set(PokemonType.Grass, PokemonType.Grass, 0.5);
  set(PokemonType.Grass, PokemonType.Poison, 0.5);
  set(PokemonType.Grass, PokemonType.Flying, 0.5);
  set(PokemonType.Grass, PokemonType.Bug, 0.5);
  set(PokemonType.Grass, PokemonType.Dragon, 0.5);
  set(PokemonType.Grass, PokemonType.Steel, 0.5);

  // Ice
  set(PokemonType.Ice, PokemonType.Fire, 0.5);
  set(PokemonType.Ice, PokemonType.Water, 0.5);
  set(PokemonType.Ice, PokemonType.Ice, 0.5);
  set(PokemonType.Ice, PokemonType.Steel, 0.5);

  // Fighting
  set(PokemonType.Fighting, PokemonType.Poison, 0.5);
  set(PokemonType.Fighting, PokemonType.Flying, 0.5);
  set(PokemonType.Fighting, PokemonType.Psychic, 0.5);
  set(PokemonType.Fighting, PokemonType.Bug, 0.5);
  set(PokemonType.Fighting, PokemonType.Fairy, 0.5);

  // Poison
  set(PokemonType.Poison, PokemonType.Poison, 0.5);
  set(PokemonType.Poison, PokemonType.Ground, 0.5);
  set(PokemonType.Poison, PokemonType.Rock, 0.5);
  set(PokemonType.Poison, PokemonType.Ghost, 0.5);

  // Ground
  set(PokemonType.Ground, PokemonType.Grass, 0.5);
  set(PokemonType.Ground, PokemonType.Bug, 0.5);

  // Flying
  set(PokemonType.Flying, PokemonType.Electric, 0.5);
  set(PokemonType.Flying, PokemonType.Rock, 0.5);
  set(PokemonType.Flying, PokemonType.Steel, 0.5);

  // Psychic
  set(PokemonType.Psychic, PokemonType.Psychic, 0.5);
  set(PokemonType.Psychic, PokemonType.Steel, 0.5);

  // Bug
  set(PokemonType.Bug, PokemonType.Fire, 0.5);
  set(PokemonType.Bug, PokemonType.Fighting, 0.5);
  set(PokemonType.Bug, PokemonType.Poison, 0.5);
  set(PokemonType.Bug, PokemonType.Flying, 0.5);
  set(PokemonType.Bug, PokemonType.Ghost, 0.5);
  set(PokemonType.Bug, PokemonType.Steel, 0.5);
  set(PokemonType.Bug, PokemonType.Fairy, 0.5);

  // Rock
  set(PokemonType.Rock, PokemonType.Fighting, 0.5);
  set(PokemonType.Rock, PokemonType.Ground, 0.5);
  set(PokemonType.Rock, PokemonType.Steel, 0.5);

  // Ghost
  set(PokemonType.Ghost, PokemonType.Dark, 0.5);

  // Dragon
  set(PokemonType.Dragon, PokemonType.Steel, 0.5);

  // Dark
  set(PokemonType.Dark, PokemonType.Fighting, 0.5);
  set(PokemonType.Dark, PokemonType.Dark, 0.5);
  set(PokemonType.Dark, PokemonType.Fairy, 0.5);

  // Steel
  set(PokemonType.Steel, PokemonType.Fire, 0.5);
  set(PokemonType.Steel, PokemonType.Water, 0.5);
  set(PokemonType.Steel, PokemonType.Electric, 0.5);
  set(PokemonType.Steel, PokemonType.Steel, 0.5);

  // Fairy
  set(PokemonType.Fairy, PokemonType.Poison, 0.5);
  set(PokemonType.Fairy, PokemonType.Fire, 0.5);
  set(PokemonType.Fairy, PokemonType.Steel, 0.5);

  // ─── Immunities (0x) ────────────────────────────────────────────────────

  // Normal → Ghost (no effect)
  set(PokemonType.Normal, PokemonType.Ghost, 0);

  // Ghost → Normal (no effect)
  set(PokemonType.Ghost, PokemonType.Normal, 0);

  // Fighting → Ghost (no effect)
  set(PokemonType.Fighting, PokemonType.Ghost, 0);

  // Ground → Flying (no effect)
  set(PokemonType.Ground, PokemonType.Flying, 0);

  // Electric → Ground (no effect)
  set(PokemonType.Electric, PokemonType.Ground, 0);

  // Psychic → Dark (no effect)
  set(PokemonType.Psychic, PokemonType.Dark, 0);

  // Dragon → Fairy (no effect)
  set(PokemonType.Dragon, PokemonType.Fairy, 0);

  // Freeze the inner maps
  for (const row of base.values()) {
    Object.freeze(row);
  }

  // Freeze the outer map
  Object.freeze(base);

  return base as ReadonlyMap<PokemonType, ReadonlyMap<PokemonType, Effectiveness>>;
}

/**
 * Calculate the total type effectiveness multiplier for an attack
 * against a defender with one or two types.
 *
 * For single-type defenders, returns the direct effectiveness.
 * For dual-type defenders, multiplies both effectiveness values (e.g.,
 * 2× from one type and 0.5× from the other = 1× total).
 *
 * @param attackType - The type of the move being used
 * @param defenderTypes - The type(s) of the defending Pokemon (1 or 2)
 * @returns The total effectiveness multiplier (0, 0.5, 1, 2, or 4)
 *
 * @example
 * ```ts
 * // Fire vs Grass → 2x
 * getEffectiveness(PokemonType.Fire, [PokemonType.Grass]) // 2
 *
 * // Fire vs Water → 0.5x
 * getEffectiveness(PokemonType.Fire, [PokemonType.Water]) // 0.5
 *
 * // Normal vs Ghost → 0x (immune)
 * getEffectiveness(PokemonType.Normal, [PokemonType.Ghost]) // 0
 *
 * // Ice vs Dragon/Flying → 4x (2 × 2)
 * getEffectiveness(PokemonType.Ice, [PokemonType.Dragon, PokemonType.Flying]) // 4
 * ```
 */
export function getEffectiveness(
  attackType: PokemonType,
  defenderTypes: readonly [PokemonType, PokemonType?],
): number {
  const atkRow = TYPE_CHART.get(attackType);
  if (!atkRow) return 1; // Unknown attack type → neutral

  let multiplier = 1;

  for (const defType of defenderTypes) {
    if (defType === undefined) break;
    const eff = atkRow.get(defType);
    if (eff === undefined) continue;
    multiplier *= eff;
  }

  return multiplier;
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Check if an attacking type is immune against a defender.
 *
 * This is a convenience wrapper around getEffectiveness for the common
 * case of checking immunities.
 *
 * @param attackType - The attacking move's type
 * @param defenderTypes - The defender's type(s)
 * @returns true if the attack would deal no damage
 */
export function isImmune(
  attackType: PokemonType,
  defenderTypes: readonly [PokemonType, PokemonType?],
): boolean {
  return getEffectiveness(attackType, defenderTypes) === 0;
}

/**
 * Check if an attacking type is super effective against a defender.
 *
 * @param attackType - The attacking move's type
 * @param defenderTypes - The defender's type(s)
 * @returns true if the attack deals 2× or more damage
 */
export function isSuperEffective(
  attackType: PokemonType,
  defenderTypes: readonly [PokemonType, PokemonType?],
): boolean {
  return getEffectiveness(attackType, defenderTypes) >= 2;
}

/**
 * Check if an attacking type is not very effective against a defender.
 *
 * @param attackType - The attacking move's type
 * @param defenderTypes - The defender's type(s)
 * @returns true if the attack is resisted (0.5× or less, but not immune)
 */
export function isNotVeryEffective(
  attackType: PokemonType,
  defenderTypes: readonly [PokemonType, PokemonType?],
): boolean {
  const eff = getEffectiveness(attackType, defenderTypes);
  return eff > 0 && eff < 1;
}
