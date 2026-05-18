/**
 * @fileoverview Hall of Fame utilities for Pokelike Reborn.
 *
 * Tracks completed runs — when the player defeats all bosses / reaches
 * the final node, a Hall of Fame entry is recorded so they can look
 * back at past victories.
 *
 * Data is stored in localStorage under the "pokelike-hall-of-fame" key
 * so it persists between runs independently of the active save file.
 *
 * @module hallOfFame
 */

import type { GameMode } from "@pokelike/core";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single Hall of Fame entry recorded when a run is completed.
 */
export interface HallOfFameEntry {
  /** ISO date string of when the run was completed. */
  date: string;
  /** The team that finished the run (species, nickname, level). */
  team: { speciesId: string; name: string; level: number }[];
  /** Number of badges earned during the run. */
  badges: number;
  /** Game mode. */
  mode: GameMode;
  /** Sequential run number. */
  runNumber: number;
  /** PRNG seed used for the run. */
  seed: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** localStorage key for the Hall of Fame data. */
const STORAGE_KEY = "pokelike-hall-of-fame";

/** localStorage key for the run counter (persists across resets). */
const RUN_COUNTER_KEY = "pokelike-run-counter";

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Read the raw Hall of Fame array from localStorage.
 */
function readEntries(): HallOfFameEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HallOfFameEntry[];
  } catch {
    return [];
  }
}

/**
 * Overwrite the Hall of Fame array in localStorage.
 */
function writeEntries(entries: HallOfFameEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error("[HallOfFame] Failed to write entries:", err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Add an entry to the Hall of Fame.
 *
 * New entries are prepended so the most recent run appears first.
 *
 * @param entry - The Hall of Fame entry to persist.
 */
export function addHallOfFameEntry(entry: HallOfFameEntry): void {
  const entries = readEntries();
  entries.unshift(entry);
  writeEntries(entries);
}

/**
 * Retrieve all Hall of Fame entries, most recent first.
 *
 * @returns A sorted copy of the Hall of Fame entries (never mutates storage).
 */
export function getHallOfFame(): HallOfFameEntry[] {
  return readEntries();
}

/**
 * Get the current run number and atomically increment it.
 *
 * Each call advances the counter, so it should be called exactly
 * once at the start of a new run.
 *
 * @returns The next run number (1-based).
 */
export function getRunNumber(): number {
  try {
    const raw = localStorage.getItem(RUN_COUNTER_KEY);
    const current = raw !== null ? parseInt(raw, 10) : 0;
    const next = Number.isFinite(current) ? current + 1 : 1;
    localStorage.setItem(RUN_COUNTER_KEY, String(next));
    return next;
  } catch {
    // Fallback if localStorage is unavailable.
    return 1;
  }
}

/**
 * Peek at the next run number without incrementing.
 *
 * Useful for displaying "Run #X" in the UI without consuming the counter.
 *
 * @returns The current run counter value (0 if no runs have been started).
 */
export function peekRunNumber(): number {
  try {
    const raw = localStorage.getItem(RUN_COUNTER_KEY);
    return raw !== null ? (Number.isFinite(parseInt(raw, 10)) ? parseInt(raw, 10) : 0) : 0;
  } catch {
    return 0;
  }
}
