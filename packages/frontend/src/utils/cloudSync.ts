/**
 * @fileoverview Cloud synchronisation for game state.
 *
 * Provides functions to upload the current game state to the server and
 * download the latest saved state on app init. Conflict resolution prefers
 * the state with the most recent timestamp.
 *
 * @module cloudSync
 */

import { useAuthStore } from "../stores/authStore";
import { useGameStore, type GameStateStore } from "../stores/gameStore";
import { fetchProfile, updateGameState } from "./api";

// ─── Constants ────────────────────────────────────────────────────────────

/** localStorage key for the last cloud sync timestamp. */
const CLOUD_SYNC_TIMESTAMP_KEY = "pokelike-cloud-sync-at";

// ─── Timestamp helpers ────────────────────────────────────────────────────

/**
 * Read the last cloud sync timestamp from localStorage.
 * Returns `null` if no sync has ever been performed.
 */
export function getLastSyncTimestamp(): number | null {
  const val = localStorage.getItem(CLOUD_SYNC_TIMESTAMP_KEY);
  return val ? parseInt(val, 10) : null;
}

/**
 * Write the last cloud sync timestamp to localStorage.
 * Call after a successful syncToCloud().
 */
function setLastSyncTimestamp(ts: number): void {
  localStorage.setItem(CLOUD_SYNC_TIMESTAMP_KEY, ts.toString());
}

// ─── Cloud sync (upload) ─────────────────────────────────────────────────

/**
 * Upload the current game store state to the server.
 *
 * The state is serialised as a JSON blob with a `_syncedAt` timestamp so
 * the server stores a point-in-time snapshot. On success, the local sync
 * timestamp is updated.
 *
 * Returns `true` on success, `false` if not authenticated or the request
 * fails. Errors are logged to the console — cloud sync is best-effort and
 * MUST NOT block the game loop.
 */
export async function syncToCloud(
  partialState?: Partial<GameStateStore>,
): Promise<boolean> {
  const { token } = useAuthStore.getState();
  if (!token) return false;

  try {
    const state = partialState ?? useGameStore.getState();
    const syncedAt = Date.now();

    const payload: Record<string, unknown> = {
      mode: state.mode,
      team: state.team,
      items: state.items,
      badges: state.badges,
      currentMapIndex: state.currentMapIndex,
      currentNodeId: state.currentNodeId,
      runSeed: state.runSeed,
      trainer: state.trainer,
      _syncedAt: syncedAt,
    };

    await updateGameState(payload);
    setLastSyncTimestamp(syncedAt);
    return true;
  } catch (err) {
    console.error("[CloudSync] Upload failed:", err);
    return false;
  }
}

// ─── Cloud load (download + conflict resolution) ──────────────────────────

/**
 * Download game state from the server and merge it into the local Zustand
 * store when the server copy is newer than the local copy.
 *
 * Conflict resolution strategy: **prefer latest timestamp**. If the server
 * snapshot has a `_syncedAt` later than the last local sync, the server
 * state replaces the local store. Otherwise, the local state is kept.
 *
 * Call this once on app init when the user is authenticated.
 *
 * Returns `true` if the server state was applied, `false` if the local
 * state was preferred or no server state exists.
 */
export async function loadFromCloud(): Promise<boolean> {
  const { token } = useAuthStore.getState();
  if (!token) return false;

  try {
    const { gameState } = await fetchProfile();

    // No server state to restore
    if (!gameState || Object.keys(gameState).length === 0) {
      return false;
    }

    const serverTimestamp =
      typeof gameState._syncedAt === "number" ? gameState._syncedAt : 0;
    const localTimestamp = getLastSyncTimestamp() ?? 0;
    const mode = gameState.mode as string | undefined;

    // Conflict resolution: prefer latest timestamp
    if (serverTimestamp > localTimestamp && mode) {
      useGameStore.setState({
        mode: mode as GameStateStore["mode"],
        team: (gameState.team as GameStateStore["team"]) ?? [],
        items: (gameState.items as GameStateStore["items"]) ?? [],
        badges: (gameState.badges as string[]) ?? [],
        currentMapIndex: (gameState.currentMapIndex as number) ?? 0,
        currentNodeId: (gameState.currentNodeId as string | null) ?? null,
        runSeed: (gameState.runSeed as number | null) ?? null,
        trainer: (gameState.trainer as GameStateStore["trainer"]) ?? null,
      });

      // Sync local timestamp to match server
      setLastSyncTimestamp(serverTimestamp);
      return true;
    }

    return false;
  } catch (err) {
    console.error("[CloudSync] Download failed:", err);
    return false;
  }
}
