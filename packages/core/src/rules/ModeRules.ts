/**
 * @fileoverview Strategy interface for game mode rule sets.
 *
 * The `ModeRules` interface defines the contract that every game mode
 * (Normal, Nuzlocke, Battle Tower) must implement. This decouples
 * the core battle loop from mode-specific behavior using the
 * Strategy Pattern, making the system extensible for future modes.
 *
 * Each method receives the relevant game context and returns the
 * transformed state. Implementations are stateless or carry their
 * own per-run state (e.g., Nuzlocke's encounter tracking).
 *
 * @module rules
 */

import type { PokemonInstance } from "../types";

/**
 * Game mode rule strategy.
 *
 * Implementations define how the game loop behaves for a specific mode.
 * The core battle/capture loop calls these methods instead of applying
 * hard-coded logic, keeping the loop mode-agnostic.
 */
export interface ModeRules {
  /**
   * Called when a Pokémon faints in battle.
   *
   * @param pokemon - The Pokémon that fainted (reference in the team array).
   * @param team    - The full team array before removal.
   * @returns The modified team after applying the faint rule.
   *
   * Normal mode: returns team unchanged (standard revival possible).
   * Nuzlocke mode: removes the fainted Pokémon (permadeath).
   */
  onPokemonFaint(pokemon: PokemonInstance, team: PokemonInstance[]): PokemonInstance[];

  /**
   * Called when a wild Pokémon is encountered.
   *
   * @param speciesId - The species being encountered.
   * @param areaId    - The area where the encounter happens.
   * @returns `true` if the encounter/capture is allowed, `false` to block it.
   *
   * Normal mode: always returns `true`.
   * Nuzlocke mode: returns `false` if the area already had an encounter.
   */
  onEncounter(speciesId: string, areaId: string): boolean;

  /**
   * Called after a Pokémon is successfully caught.
   *
   * @param pokemon - The Pokémon instance that was caught.
   * @returns The (possibly modified) Pokémon instance.
   *
   * Normal mode: returns the Pokémon unchanged.
   * Nuzlocke mode: may force a nickname requirement.
   */
  onCatch(pokemon: PokemonInstance): PokemonInstance;
}
