/**
 * @fileoverview Nuzlocke mode rules — permadeath and first-encounter restriction.
 *
 * Nuzlocke is a popular self-imposed challenge that enforces two core rules:
 *
 * 1. **Permadeath**: Any Pokémon that faints is considered dead and must be
 *    permanently removed from the team. It cannot be used or healed again.
 *
 * 2. **First Encounter**: Only the first wild Pokémon encountered in each area
 *    may be caught. Subsequent encounters in the same area are blocked.
 *
 * This implementation follows the Strategy Pattern via the `ModeRules` interface,
 * keeping the Nuzlocke logic fully isolated from the core battle loop.
 *
 * @module rules
 */

import type { PokemonInstance } from "../types";
import type { ModeRules } from "./ModeRules";
import { createAreaTracker, type AreaTracker } from "./areaTracking";

/**
 * Nuzlocke game mode rules.
 *
 * Each instance carries its own `AreaTracker` scoped to a single game run.
 * To start a fresh Nuzlocke run, create a new instance.
 */
export class NuzlockeRules implements ModeRules {
  private readonly tracker: AreaTracker;

  constructor() {
    this.tracker = createAreaTracker();
  }

  /**
   * Permadeath: removes the fainted Pokémon from the team entirely.
   *
   * The Pokémon is filtered out by reference equality. After this call,
   * the Pokémon is gone from the active team and cannot be healed or reused.
   */
  onPokemonFaint(pokemon: PokemonInstance, team: PokemonInstance[]): PokemonInstance[] {
    return team.filter((p) => p !== pokemon);
  }

  /**
   * First-encounter restriction per area.
   *
   * Returns `true` (encounter allowed) only if this area has not yet
   * had a registered encounter. After the first encounter in an area,
   * all subsequent tries return `false`.
   *
   * When an encounter is allowed, it is automatically registered so
   * the area is blocked for future attempts.
   *
   * @param speciesId - The species identifier (used for tracking metadata).
   * @param areaId    - The area identifier to check/register.
   * @returns `true` if the encounter is the first in this area.
   */
  onEncounter(_speciesId: string, areaId: string): boolean {
    if (this.tracker.hasEncountered(areaId)) {
      return false;
    }
    this.tracker.registerEncounter(areaId);
    return true;
  }

  /**
   * Capture handler — returns the Pokémon unchanged.
   *
   * Future enhancements may force the player to assign a nickname,
   * which is a common Nuzlocke variant rule.
   */
  onCatch(pokemon: PokemonInstance): PokemonInstance {
    return pokemon;
  }

  /**
   * Read-only view of the areas that have had encounters this run.
   */
  get encounteredAreas(): ReadonlySet<string> {
    return this.tracker.encounteredAreas;
  }

  /**
   * Reset the encounter tracker (for restarting a run without
   * creating a new instance).
   */
  reset(): void {
    this.tracker.reset();
  }
}
