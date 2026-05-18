/**
 * @fileoverview Default game mode rules — no-op / pass-through behavior.
 *
 * `NormalRules` implements the standard Pokémon experience:
 * - Fainted Pokémon can be healed at a PokéCenter (team unchanged)
 * - Every wild encounter is allowed
 * - Caught Pokémon are used as-is
 *
 * This is the "vanilla" mode that matches the standard game behavior
 * before any variant rules are applied.
 *
 * @module rules
 */

import type { PokemonInstance } from "../types";
import type { ModeRules } from "./ModeRules";

/**
 * Standard game mode rules.
 *
 * All methods are pass-through: they return inputs unmodified.
 */
export class NormalRules implements ModeRules {
  /**
   * Standard faint handling — team unchanged (Pokémon can be revived).
   */
  onPokemonFaint(_pokemon: PokemonInstance, team: PokemonInstance[]): PokemonInstance[] {
    return team;
  }

  /**
   * Standard encounter — always allowed.
   */
  onEncounter(_speciesId: string, _areaId: string): boolean {
    return true;
  }

  /**
   * Standard capture — Pokémon used as-is.
   */
  onCatch(pokemon: PokemonInstance): PokemonInstance {
    return pokemon;
  }
}
