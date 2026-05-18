/**
 * @fileoverview Save/Load utilities for Pokelike Reborn.
 *
 * Provides schema-versioned save/load of game state to localStorage.
 * Includes migration support so old saves can be upgraded to the current
 * schema version without data loss.
 *
 * The SaveManager operates on a dedicated localStorage key ("pokelike-save")
 * that is separate from the zustand persist middleware key ("pokelike-game-state").
 * This separation lets the explicit save/load system have its own schema lifecycle
 * while the zustand persist handles automatic rehydration of the working store.
 *
 * @module saveLoad
 */

import type { GameMode, PokemonInstance, ItemInstance } from "@pokelike/core";

// ─── Schema ───────────────────────────────────────────────────────────────────

/** Current schema version. Bump when making breaking changes to SaveData. */
export const SAVE_VERSION = 1;

/** Minimum supported schema version for loading. */
export const MIN_COMPATIBLE_VERSION = 1;

/** localStorage key used for save data. */
const SAVE_KEY = "pokelike-save";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Game settings stored alongside the save.
 */
export interface GameSettings {
  /** Sound effects volume (0-1). */
  sfxVolume: number;
  /** Music volume (0-1). */
  musicVolume: number;
  /** Whether battle animations are enabled. */
  battleAnimations: boolean;
  /** Whether text speed is fast. */
  fastText: boolean;
}

/**
 * A single entry in the Hall of Fame.
 */
export interface HallOfFameEntry {
  /** ISO date string when the run was completed. */
  date: string;
  /** The team that completed the run. */
  team: { speciesId: string; name: string; level: number }[];
  /** Number of badges earned. */
  badges: number;
  /** Game mode for this run. */
  mode: GameMode;
  /** Sequential run number. */
  runNumber: number;
  /** PRNG seed used for the run. */
  seed: number;
}

/**
 * A single entry in the Pokédex.
 */
export interface PokedexEntry {
  /** Species ID. */
  id: number;
  /** Display name. */
  name: string;
  /** Whether the species has been caught. */
  caught: boolean;
  /** Whether the species has been seen (but not necessarily caught). */
  seen: boolean;
  /** ISO date when first caught (undefined if never caught). */
  firstCaughtDate?: string;
}

/**
 * Complete serialised save data.
 *
 * This is what gets written to and read from localStorage. The {@link version}
 * field enables schema migrations — older saves can be upgraded forward.
 */
export interface SaveData {
  /** Schema version — used to detect and migrate old saves. */
  version: number;
  /** Unix timestamp (ms) of when this save was created. */
  timestamp: number;
  /** The core game state. */
  gameState: {
    mode: GameMode;
    team: PokemonInstance[];
    items: ItemInstance[];
    badges: string[];
    currentMapIndex: number;
    currentNodeId: string | null;
    runSeed: number | null;
    trainer: "boy" | "girl";
    starterSpeciesId: number | null;
    maxTeamSize: number;
  };
  /** Pokédex progress (optional — may not exist in very old saves). */
  pokedex?: Record<number, PokedexEntry>;
  /** Hall of Fame entries (optional). */
  hallOfFame?: HallOfFameEntry[];
  /** User settings (optional). */
  settings?: GameSettings;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Check that a value is a non-null object (record-like).
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate that a parsed SaveData has all required fields and a compatible
 * version number.
 *
 * @param data - The partially parsed save object.
 * @returns `true` if the save passes validation.
 * @throws {Error} With a descriptive message when validation fails.
 */
export function validateSaveData(data: unknown): data is SaveData {
  if (!isObject(data)) {
    throw new Error("Save data is not a valid object");
  }

  const version = data.version;
  if (typeof version !== "number" || !Number.isInteger(version)) {
    throw new Error("Save data is missing a valid integer 'version' field");
  }

  if (version < MIN_COMPATIBLE_VERSION) {
    throw new Error(
      `Save version ${version} is too old (minimum supported: ${MIN_COMPATIBLE_VERSION})`,
    );
  }

  if (version > SAVE_VERSION) {
    throw new Error(
      `Save version ${version} is from a newer version of the game (current: ${SAVE_VERSION})`,
    );
  }

  if (typeof data.timestamp !== "number") {
    throw new Error("Save data is missing a numeric 'timestamp' field");
  }

  if (!isObject(data.gameState)) {
    throw new Error("Save data is missing 'gameState' object");
  }

  const gs = data.gameState as Record<string, unknown>;

  const validModes = ["normal", "nuzlocke", "battle_tower"];
  if (!validModes.includes(gs.mode as string)) {
    throw new Error(
      `Invalid game mode "${String(gs.mode)}" — expected one of: ${validModes.join(", ")}`,
    );
  }

  if (!Array.isArray(gs.team)) {
    throw new Error("Save data is missing valid 'gameState.team' array");
  }

  if (!Array.isArray(gs.items)) {
    throw new Error("Save data is missing valid 'gameState.items' array");
  }

  if (!Array.isArray(gs.badges)) {
    throw new Error("Save data is missing valid 'gameState.badges' array");
  }

  return true;
}

// ─── Migration ────────────────────────────────────────────────────────────────

/**
 * Migrate a save from an older schema version to the current version.
 *
 * Each migration step bumps the version forward until it reaches {@link SAVE_VERSION}.
 * If the save is already at the current version it is returned unchanged.
 *
 * Currently supported migrations:
 * - v1 → v1: no-op (initial schema)
 *
 * @param data - The save data to migrate (mutated in place).
 * @returns The migrated save data.
 */
export function migrateSaveData(data: SaveData): SaveData {
  let current = data.version;

  // v1 → current: no migrations needed yet since v1 is the initial schema.
  // Future migrations would chain here:
  //   if (current < 2) { /* v1 → v2 */ current = 2; }
  //   if (current < 3) { /* v2 → v3 */ current = 3; }

  data.version = SAVE_VERSION;
  return data;
}

// ─── SaveManager ──────────────────────────────────────────────────────────────

/**
 * Manager for save/load operations against localStorage.
 *
 * Provides a clean API for persisting, loading, and deleting game saves,
 * with built-in schema versioning and migration support.
 */
export const SaveManager = {
  /**
   * Persist the given save data to localStorage.
   *
   * @param data - The fully populated save data to write.
   * @returns `true` if the save succeeded, `false` if storage was full or
   *          the browser blocked the write.
   */
  saveGame(data: SaveData): boolean {
    try {
      // Ensure the version is always current before writing.
      const toSave: SaveData = { ...data, version: SAVE_VERSION, timestamp: Date.now() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
      return true;
    } catch (err) {
      console.error("[SaveManager] Failed to save game:", err);
      return false;
    }
  },

  /**
   * Load the most recent save from localStorage.
   *
   * Automatically runs validation and schema migration so the returned
   * data is always at the current schema version.
   *
   * @returns The loaded and migrated save data, or `null` if no save exists
   *          or the save data is corrupt / incompatible.
   */
  loadGame(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw === null) return null;

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.warn("[SaveManager] Corrupt save JSON — discarding");
        localStorage.removeItem(SAVE_KEY);
        return null;
      }

      if (!validateSaveData(parsed)) return null;

      return migrateSaveData(parsed);
    } catch (err) {
      if (err instanceof Error) {
        console.warn("[SaveManager] Failed to load save:", err.message);
      }
      return null;
    }
  },

  /**
   * Permanently delete the saved game from localStorage.
   */
  deleteSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Silently ignore — storage removal may fail in private browsing modes.
    }
  },

  /**
   * Check whether a compatible save exists in localStorage.
   *
   * @returns `true` if a valid save is present.
   */
  hasSave(): boolean {
    return SaveManager.loadGame() !== null;
  },

  /**
   * Get the timestamp of the most recent save.
   *
   * @returns The Unix timestamp (ms) of the save, or `null` if no save exists.
   */
  getSaveTimestamp(): number | null {
    const data = SaveManager.loadGame();
    return data?.timestamp ?? null;
  },
} as const;
