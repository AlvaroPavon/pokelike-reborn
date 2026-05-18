/**
 * Pokédex type definitions for the Pokelike Reborn game engine.
 *
 * These types track the player's discovery progress across all species.
 * The Pokédex is global-persistent (survives runs) so the player can
 * accumulate their collection across multiple playthroughs.
 *
 * @module pokedex
 */

/**
 * Tracking status for a single species in the Pokédex.
 *
 * - `not_seen`: Species has never been encountered (shown as "???").
 * - `seen`: Species has been encountered but not caught.
 * - `caught`: Species has been successfully captured at least once.
 */
export enum PokedexStatus {
  NotSeen = "not_seen",
  Seen = "seen",
  Caught = "caught",
}

/**
 * A single entry in the player's Pokédex.
 *
 * Each species is represented exactly once. The entry tracks whether
 * the player has seen and/or caught that species, along with the date
 * of first capture (if any).
 */
export interface PokedexEntry {
  /** National Pokédex number (1–1025). */
  id: number;
  /** Display name of the species. */
  name: string;
  /** Current discovery status. */
  status: PokedexStatus;
  /** ISO date string of when this species was first caught (if ever). */
  firstCaughtDate?: string;
}

/**
 * Serialisable shape of the entire Pokédex for persistence.
 *
 * Stored as a map from species ID → entry state so lookups are O(1).
 */
export interface PokedexData {
  /** Map of species ID → Pokédex entry. */
  entries: Record<number, PokedexEntry>;
}
