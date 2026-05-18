/**
 * @fileoverview Pokédex utilities for Pokelike Reborn.
 *
 * Tracks which Pokemon species the player has seen and caught during their
 * play sessions. The Pokédex persists across runs (it is stored separately
 * from the active save) so progress accumulates over time.
 *
 * Data is stored in localStorage under the "pokelike-pokedex" key.
 *
 * @module pokedex
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single entry in the Pokédex, tracking whether a species has been
 * seen and/or caught.
 */
export interface PokedexEntry {
  /** Species ID (Pokédex number). */
  id: number;
  /** Display name of the species. */
  name: string;
  /** Whether the player has caught this species. */
  caught: boolean;
  /** Whether the player has encountered (seen) this species. */
  seen: boolean;
  /** ISO date string of when this species was first caught. */
  firstCaughtDate?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** localStorage key for the Pokédex data. */
const STORAGE_KEY = "pokelike-pokedex";

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Read the full Pokédex record from localStorage.
 */
function readPokedex(): Record<number, PokedexEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<number, PokedexEntry>;
  } catch {
    return {};
  }
}

/**
 * Overwrite the Pokédex record in localStorage.
 */
function writePokedex(pokedex: Record<number, PokedexEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pokedex));
  } catch (err) {
    console.error("[Pokedex] Failed to write Pokédex:", err);
  }
}

/**
 * Get the current date as an ISO string (YYYY-MM-DD).
 */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Mark a species as caught.
 *
 * @deprecated Use `usePokedexStore.getState().markCaught(speciesId)` instead.
 * The Zustand store (`pokedexStore`) is now the primary source of truth and
 * persists independently of the active game save. This legacy utility writes
 * directly to localStorage under `pokelike-pokedex`, which was migrated to
 * the store on first initialization.
 *
 * If the species was already seen but not caught, this upgrades the
 * entry to caught and sets the first-caught date (only on the first
 * capture). If the species is not yet in the Pokédex, both seen and
 * caught are set to true.
 *
 * @param speciesId - The Pokédex number of the species.
 * @param name      - The display name of the species.
 */
export function markCaught(speciesId: number, name: string): void {
  const pokedex = readPokedex();
  const existing = pokedex[speciesId];

  if (existing?.caught) {
    // Already caught — nothing to update.
    return;
  }

  pokedex[speciesId] = {
    id: speciesId,
    name,
    caught: true,
    seen: true,
    firstCaughtDate: existing?.firstCaughtDate ?? todayISO(),
  };

  writePokedex(pokedex);
}

/**
 * Mark a species as seen (encountered but not necessarily caught).
 *
 * @deprecated Use `usePokedexStore.getState().markSeen(speciesId)` instead.
 *
 * If the species is not yet in the Pokédex, a new entry is created with
 * `seen: true` and `caught: false`. If it already exists, only the `seen`
 * flag is updated (caught status is preserved).
 *
 * @param speciesId - The Pokédex number of the species.
 * @param name      - The display name of the species.
 */
export function markSeen(speciesId: number, name: string): void {
  const pokedex = readPokedex();
  const existing = pokedex[speciesId];

  if (existing) {
    pokedex[speciesId] = { ...existing, seen: true };
  } else {
    pokedex[speciesId] = { id: speciesId, name, caught: false, seen: true };
  }

  writePokedex(pokedex);
}

/**
 * Retrieve a copy of the full Pokédex.
 *
 * @deprecated Use `usePokedexStore.getState()` instead (access `.seenSpecies` and `.caughtSpecies`).
 *
 * @returns A record mapping species IDs to their Pokédex entries.
 */
export function getPokedex(): Record<number, PokedexEntry> {
  return { ...readPokedex() };
}

/**
 * Check whether every species in the provided list has been caught.
 *
 * @param allSpeciesIds - Array of all species IDs that must be caught.
 * @returns `true` if the Pokédex is complete for the given list.
 */
export function isPokedexComplete(allSpeciesIds?: number[]): boolean {
  const pokedex = readPokedex();

  if (allSpeciesIds && allSpeciesIds.length > 0) {
    return allSpeciesIds.every((id) => pokedex[id]?.caught === true);
  }

  // If no list is provided, consider it complete only if there is at least
  // one entry and every entry is marked caught.
  const entries = Object.values(pokedex);
  return entries.length > 0 && entries.every((e) => e.caught);
}

/**
 * Get the number of unique species that have been caught.
 *
 * @returns The count of caught species.
 */
export function getCaughtCount(): number {
  const pokedex = readPokedex();
  return Object.values(pokedex).filter((e) => e.caught).length;
}
