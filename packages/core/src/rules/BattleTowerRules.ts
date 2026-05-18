/**
 * @fileoverview Battle Tower mode rules — permadeath within a tower run
 * with procedural encounter generation via towerGenerator.
 *
 * Battle Tower is an endless challenge mode where the player fights
 * escalating floors. Key rules:
 *
 * 1. **Tower Permadeath**: Any Pokémon that faints during a tower run
 *    is removed from the team for the remainder of that run.
 *
 * 2. **Endless Scaling**: After each victory, the player advances to
 *    the next floor where opponents have higher levels and larger teams.
 *
 * 3. **Run Reset**: When the player loses (all Pokémon faint), the run
 *    ends and must be restarted from Floor 1.
 *
 * This implementation extends `NormalRules` and adds tower-specific
 * state tracking and floor progression.
 *
 * @module rules
 */

import type { PokemonInstance } from "../types/index.js";
import { getNextOpponent, calculateTowerLevel, calculateTowerTeamSize } from "../battle/towerGenerator.js";
import { NormalRules } from "./NormalRules.js";
import type { ModeRules } from "./ModeRules.js";

/**
 * Possible outcomes after returning from a tower battle.
 */
export type TowerBattleResult = "win" | "loss" | null;

/**
 * Battle Tower game mode rules.
 *
 * In addition to implementing `ModeRules`, this class provides:
 * - Floor tracking (`currentFloor`, `totalWins`)
 * - Encounter generation via `getNextEncounter()`
 * - Run lifecycle management (`reset()`, `recordWin()`, `recordLoss()`)
 *
 * Create a fresh instance for each tower run.
 */
export class BattleTowerRules extends NormalRules implements ModeRules {
  private floor = 0;
  private wins = 0;
  private lastResult: TowerBattleResult = null;

  // ─── Accessors ────────────────────────────────────────────────────────────

  /** The current floor the player is on (0 before the first encounter). */
  get currentFloor(): number {
    return this.floor;
  }

  /** Total wins accumulated in the current run. */
  get totalWins(): number {
    return this.wins;
  }

  /** Result of the most recent battle, if any. */
  get lastBattleResult(): TowerBattleResult {
    return this.lastResult;
  }

  /** The level opponents will have on the next encounter. */
  get nextLevel(): number {
    return calculateTowerLevel(this.floor + 1);
  }

  /** The team size opponents will have on the next encounter. */
  get nextTeamSize(): number {
    return calculateTowerTeamSize(this.floor + 1);
  }

  // ─── Tower-specific API ──────────────────────────────────────────────────

  /**
   * Generate and return the opponent team for the next floor.
   *
   * Increments the internal floor counter and clears the last battle result.
   * Call this when the player is ready to start the next battle.
   *
   * @returns The opponent team for the upcoming battle.
   */
  getNextEncounter(): PokemonInstance[] {
    this.floor++;
    this.lastResult = null;
    return getNextOpponent(this.floor);
  }

  /**
   * Record a win for the current floor.
   *
   * Updates the win count to match the current floor.
   * Call this after the player wins a battle.
   */
  recordWin(): void {
    this.wins = this.floor;
    this.lastResult = "win";
  }

  /**
   * Record a loss — the run has ended.
   *
   * Call this when all of the player's Pokémon have fainted.
   */
  recordLoss(): void {
    this.lastResult = "loss";
  }

  /**
   * Reset the run state for a new attempt.
   *
   * Clears floor counter, win count, and last battle result
   * without creating a new instance.
   */
  reset(): void {
    this.floor = 0;
    this.wins = 0;
    this.lastResult = null;
  }

  // ─── ModeRules Implementation ────────────────────────────────────────────

  /**
   * Tower permadeath: removes the fainted Pokémon from the team.
   *
   * Fainted Pokémon are filtered out by reference equality,
   * preventing them from being used for the rest of the run.
   */
  override onPokemonFaint(
    pokemon: PokemonInstance,
    team: PokemonInstance[],
  ): PokemonInstance[] {
    return team.filter((p) => p !== pokemon);
  }

  // onEncounter and onCatch are inherited from NormalRules:
  // - onEncounter: always returns true (no first-encounter restriction)
  // - onCatch: returns the Pokémon unchanged
}
