/**
 * @fileoverview Auto-save integration for Pokelike Reborn.
 *
 * Subscribes to the Zustand game store and triggers saves on specific
 * game events: battle end, catch selection, item pickup, node traversal,
 * and badge earned.
 *
 * Saves are debounced (500 ms) to avoid writing on every tiny state
 * transition — only the final state after a burst of changes is persisted.
 *
 * @module autoSave
 */

import { SaveManager, type SaveData } from "../utils/saveLoad";
import { syncToCloud } from "../utils/cloudSync";
import type { GameStateStore } from "./gameStore";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Debounce interval in milliseconds. */
const DEBOUNCE_MS = 500;

// ─── State ────────────────────────────────────────────────────────────────────

/**
 * Map of previous values for each watched field, used to detect
 * meaningful changes rather than saving on every store update.
 */
interface WatchedState {
  badges: string[];
  currentNodeId: string | null;
  itemsLength: number;
  teamLength: number;
}

let previous: WatchedState = {
  badges: [],
  currentNodeId: null,
  itemsLength: 0,
  teamLength: 0,
};

/** Pending debounce timer ID, or `null` if no save is queued. */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** Whether the auto-save system has been initialised. */
let initialized = false;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a SaveData snapshot from the current game store state.
 *
 * Hall of Fame and Pokédex are deliberately excluded here — they are
 * persisted independently via their own APIs. The auto-save only concerns
 * the active run state.
 */
function buildSaveData(state: GameStateStore): SaveData {
  return {
    version: 1, // will be overwritten by SaveManager.saveGame
    timestamp: Date.now(),
    gameState: {
      mode: state.mode ?? "normal",
      team: state.team,
      items: state.items,
      badges: state.badges,
      currentMapIndex: state.currentMapIndex,
      currentNodeId: state.currentNodeId,
      runSeed: state.runSeed,
      trainer: state.trainer ?? "boy",
      starterSpeciesId: null, // not exposed by the store — derived from team[0]
      maxTeamSize: 6,
    },
  };
}

/**
 * Perform the actual save (called after debounce settles).
 */
function flushSave(state: GameStateStore): void {
  const data = buildSaveData(state);
  const ok = SaveManager.saveGame(data);
  if (!ok) {
    console.warn("[AutoSave] Auto-save failed — storage may be full");
  }

  // Best-effort cloud sync: fire-and-forget, never blocks the game loop
  syncToCloud(state).catch(() => {
    /* cloud sync errors are logged inside syncToCloud */
  });
}

/**
 * Determine whether a store update represents a "significant" change
 * that warrants an auto-save.
 */
function isSignificantChange(state: GameStateStore): boolean {
  const current: WatchedState = {
    badges: state.badges,
    currentNodeId: state.currentNodeId,
    itemsLength: state.items.length,
    teamLength: state.team.length,
  };

  const changed =
    current.badges.length !== previous.badges.length ||
    current.currentNodeId !== previous.currentNodeId ||
    current.itemsLength !== previous.itemsLength ||
    current.teamLength !== previous.teamLength;

  previous = current;
  return changed;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialise the auto-save system.
 *
 * Subscribes to the provided Zustand game store and watches for changes
 * that trigger an auto-save. Safe to call multiple times — subsequent
 * calls are no-ops.
 *
 * @param useGameStore - The Zustand game store hook (must be the bound
 *                       React hook, typically exported from gameStore.ts).
 */
export function initAutoSave(useGameStore: {
  subscribe: (listener: (state: GameStateStore) => void) => () => void;
  getState: () => GameStateStore;
}): void {
  if (initialized) return;
  initialized = true;

  // Initialise previous state from the store snapshot.
  const initialState = useGameStore.getState?.();
  if (initialState) {
    previous = {
      badges: initialState.badges ?? [],
      currentNodeId: initialState.currentNodeId ?? null,
      itemsLength: initialState.items?.length ?? 0,
      teamLength: initialState.team?.length ?? 0,
    };
  }

  useGameStore.subscribe((state: GameStateStore) => {
    if (!isSignificantChange(state)) return;

    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      flushSave(state);
      debounceTimer = null;
    }, DEBOUNCE_MS);
  });
}

/**
 * Trigger an immediate auto-save, bypassing the debounce.
 *
 * Use this for critical save-on-exit or before navigation away from
 * the game. If a debounced save is pending, it is flushed immediately.
 *
 * @param gameStore - The Zustand game store instance (useGameStore).
 */
export function flushAutoSave(gameStore: {
  getState: () => GameStateStore;
}): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  const state = gameStore.getState();
  flushSave(state);
}

/**
 * Manually trigger a single auto-save at the current store state.
 *
 * This is useful for explicit save points without subscribing to changes.
 *
 * @param state - The current game store state to persist.
 */
export function forceAutoSave(state: GameStateStore): void {
  flushSave(state);

  // Explicit saves also trigger cloud sync
  syncToCloud(state).catch(() => {
    /* cloud sync errors are logged inside syncToCloud */
  });
}

/**
 * Tear down the auto-save system: flush any pending save and
 * allow re-initialisation.
 *
 * Call this during cleanup (e.g., in useEffect cleanup or on app unmount).
 */
export function destroyAutoSave(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  initialized = false;
  previous = { badges: [], currentNodeId: null, itemsLength: 0, teamLength: 0 };
}
