/**
 * @fileoverview Zustand store for Pokédex state with localStorage migration.
 *
 * This store replaces the legacy `pokedex.ts` utility that wrote directly to
 * localStorage. On first init, it migrates existing data from the old format
 * and removes the legacy key to prevent double-migration.
 *
 * Uses Zustand persist middleware to keep the Pokédex across sessions,
 * independent of the active game save (Pokédex progress is permanent).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PokedexStatus } from "@pokelike/core";

// ─── Types ───────────────────────────────────────────────────────────────

export interface PokedexStateStore {
  /** Species IDs that have been seen (encountered). */
  seenSpecies: number[];
  /** Species IDs that have been caught. */
  caughtSpecies: number[];

  /** Mark a species as seen by its national Pokédex number. */
  markSeen: (speciesId: number) => void;
  /** Mark a species as caught (also marks as seen). */
  markCaught: (speciesId: number) => void;
  /** Check whether a species has been seen. */
  isSeen: (speciesId: number) => boolean;
  /** Check whether a species has been caught. */
  isCaught: (speciesId: number) => boolean;
  /** Get the Pokédex status for a given species. */
  getStatus: (speciesId: number) => PokedexStatus;
  /** Number of unique species seen. */
  seenCount: () => number;
  /** Number of unique species caught. */
  caughtCount: () => number;
}

// ─── Legacy migration helpers ────────────────────────────────────────────

const LEGACY_KEY = "pokelike-pokedex";

interface LegacyEntry {
  id: number;
  name: string;
  caught: boolean;
  seen: boolean;
  firstCaughtDate?: string;
}

interface LegacyData {
  [speciesId: number]: LegacyEntry;
}

/**
 * Migrate data from the legacy localStorage format.
 * Returns [seenIds, caughtIds] extracted from the old record.
 */
function migrateFromLegacy(): [number[], number[]] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [[], []];

    const parsed: LegacyData = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return [[], []];

    const seen: number[] = [];
    const caught: number[] = [];

    for (const key of Object.keys(parsed)) {
      const entry = parsed[Number(key)];
      if (!entry || typeof entry.id !== "number") continue;
      if (entry.seen && !seen.includes(entry.id)) seen.push(entry.id);
      if (entry.caught && !caught.includes(entry.id)) caught.push(entry.id);
    }

    // Remove legacy key to prevent double-migration
    localStorage.removeItem(LEGACY_KEY);

    return [seen, caught];
  } catch {
    return [[], []];
  }
}

// ─── Store ───────────────────────────────────────────────────────────────

export const usePokedexStore = create<PokedexStateStore>()(
  persist(
    (set, get) => {
      // Run migration once on store creation
      const [migratedSeen, migratedCaught] = migrateFromLegacy();

      return {
        seenSpecies: migratedSeen,
        caughtSpecies: migratedCaught,

        markSeen: (speciesId: number) => {
          set((state) => {
            if (state.seenSpecies.includes(speciesId)) return state;
            return {
              seenSpecies: [...state.seenSpecies, speciesId].sort(
                (a, b) => a - b,
              ),
            };
          });
        },

        markCaught: (speciesId: number) => {
          set((state) => {
            const seen = state.seenSpecies.includes(speciesId)
              ? state.seenSpecies
              : [...state.seenSpecies, speciesId].sort((a, b) => a - b);
            if (state.caughtSpecies.includes(speciesId)) {
              return { seenSpecies: seen };
            }
            return {
              seenSpecies: seen,
              caughtSpecies: [...state.caughtSpecies, speciesId].sort(
                (a, b) => a - b,
              ),
            };
          });
        },

        isSeen: (speciesId: number): boolean => {
          return get().seenSpecies.includes(speciesId);
        },

        isCaught: (speciesId: number): boolean => {
          return get().caughtSpecies.includes(speciesId);
        },

        getStatus: (speciesId: number): PokedexStatus => {
          const { caughtSpecies, seenSpecies } = get();
          if (caughtSpecies.includes(speciesId)) return PokedexStatus.Caught;
          if (seenSpecies.includes(speciesId)) return PokedexStatus.Seen;
          return PokedexStatus.NotSeen;
        },

        seenCount: (): number => {
          return get().seenSpecies.length;
        },

        caughtCount: (): number => {
          return get().caughtSpecies.length;
        },
      };
    },
    {
      name: "pokelike-pokedex-store",
      partialize: (state) => ({
        seenSpecies: state.seenSpecies,
        caughtSpecies: state.caughtSpecies,
      }),
    },
  ),
);
