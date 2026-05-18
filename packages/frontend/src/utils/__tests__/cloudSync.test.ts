/**
 * @fileoverview Tests for cloudSync utility.
 *
 * Covers:
 *  - syncToCloud uploads the current game store state
 *  - syncToCloud is a no-op when not authenticated
 *  - loadFromCloud downloads and restores server state when newer
 *  - Conflict resolution prefers the latest timestamp
 *
 * @module
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../../stores/authStore";
import { useGameStore } from "../../stores/gameStore";
import { getLastSyncTimestamp, syncToCloud, loadFromCloud } from "../cloudSync";
import { updateGameState, fetchProfile } from "../api";

// ─── Mocks ───────────────────────────────────────────────────────────────

vi.mock("../api", async () => {
  const actual = await vi.importActual<typeof import("../api")>("../api");

  return {
    ...actual,
    updateGameState: vi.fn(),
    fetchProfile: vi.fn(),
  };
});

// ─── Test user ────────────────────────────────────────────────────────────

const TEST_USER = {
  userId: "test-user-sync",
  email: "sync@example.com",
  createdAt: 1715000000000,
};

const STARTING_GAME_STATE = {
  mode: "normal" as const,
  team: [
    {
      speciesId: "charmander",
      nickname: undefined,
      level: 5,
      currentHp: 20,
      maxHp: 20,
      ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      stats: { hp: 20, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
      trainerId: "test-trainer",
      fainted: false,
      status: null,
      moves: [],
    },
  ],
  items: [],
  badges: [],
  currentMapIndex: 0,
  currentNodeId: "start",
  runSeed: 42,
  trainer: "boy" as const,
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function setAuthenticated(): void {
  useAuthStore.setState({
    token: "sync-test-token",
    user: TEST_USER,
    loading: false,
    error: null,
  });
}

function setLoggedOut(): void {
  useAuthStore.setState({
    token: null,
    user: null,
    loading: false,
    error: null,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe("cloudSync", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Reset game store to a known starting state
    useGameStore.setState(STARTING_GAME_STATE);
  });

  // ── syncToCloud ──────────────────────────────────────────────────────────

  describe("syncToCloud", () => {
    it("uploads current game state when authenticated", async () => {
      vi.mocked(updateGameState).mockResolvedValue({ success: true });
      setAuthenticated();

      const ok = await syncToCloud();

      expect(ok).toBe(true);
      expect(updateGameState).toHaveBeenCalledTimes(1);

      const payload = vi.mocked(updateGameState).mock.calls[0][0];
      expect(payload.mode).toBe("normal");
      expect(payload.team).toHaveLength(1);
      expect(payload._syncedAt).toBeGreaterThan(0);
    });

    it("returns false when not authenticated", async () => {
      setLoggedOut();

      const ok = await syncToCloud();

      expect(ok).toBe(false);
      expect(updateGameState).not.toHaveBeenCalled();
    });

    it("updates the local sync timestamp on success", async () => {
      vi.mocked(updateGameState).mockResolvedValue({ success: true });
      setAuthenticated();

      expect(getLastSyncTimestamp()).toBeNull();

      await syncToCloud();

      const ts = getLastSyncTimestamp();
      expect(ts).toBeGreaterThan(0);
    });

    it("does NOT update timestamp on failure", async () => {
      vi.mocked(updateGameState).mockRejectedValue({ error: "Server error" });
      setAuthenticated();

      const ok = await syncToCloud();

      expect(ok).toBe(false);
      expect(getLastSyncTimestamp()).toBeNull();
    });

    it("accepts a partial state override", async () => {
      vi.mocked(updateGameState).mockResolvedValue({ success: true });
      setAuthenticated();

      const partial = {
        mode: "nuzlocke" as const,
        team: [],
        items: [],
        badges: ["boulder"],
        currentMapIndex: 1,
        currentNodeId: "gym-1",
        runSeed: 99,
        trainer: "girl" as const,
      };

      await syncToCloud(partial);

      const payload = vi.mocked(updateGameState).mock.calls[0][0];
      expect(payload.mode).toBe("nuzlocke");
      expect(payload.badges).toEqual(["boulder"]);
    });
  });

  // ── loadFromCloud ────────────────────────────────────────────────────────

  describe("loadFromCloud", () => {
    it("downloads server state and restores it when newer", async () => {
      vi.mocked(fetchProfile).mockResolvedValue({
        profile: {
          userId: TEST_USER.userId,
          email: TEST_USER.email,
          createdAt: TEST_USER.createdAt,
        },
        gameState: {
          mode: "nuzlocke",
          team: [],
          items: [{ itemId: "master-ball", quantity: 1 }],
          badges: ["boulder"],
          currentMapIndex: 3,
          currentNodeId: "elite-four",
          runSeed: 100,
          trainer: "girl",
          _syncedAt: 2000,
        },
      });

      setAuthenticated();
      // Set local timestamp to be OLDER than server
      localStorage.setItem("pokelike-cloud-sync-at", "1000");

      const applied = await loadFromCloud();

      expect(applied).toBe(true);

      // Game store should have been updated with server state
      const state = useGameStore.getState();
      expect(state.mode).toBe("nuzlocke");
      expect(state.items).toHaveLength(1);
      expect(state.items[0].itemId).toBe("master-ball");
      expect(state.currentNodeId).toBe("elite-four");

      // Local timestamp should have been updated to match server
      expect(getLastSyncTimestamp()).toBe(2000);
    });

    it("keeps local state when it is newer than server", async () => {
      vi.mocked(fetchProfile).mockResolvedValue({
        profile: {
          userId: TEST_USER.userId,
          email: TEST_USER.email,
          createdAt: TEST_USER.createdAt,
        },
        gameState: {
          mode: "nuzlocke",
          team: [],
          items: [],
          badges: [],
          currentMapIndex: 0,
          currentNodeId: null,
          runSeed: 1,
          trainer: "boy",
          _syncedAt: 100, // OLDER than local
        },
      });

      setAuthenticated();
      // Local timestamp is NEWER
      localStorage.setItem("pokelike-cloud-sync-at", "500");

      const applied = await loadFromCloud();

      expect(applied).toBe(false);

      // Game store should still have the original starting state
      const state = useGameStore.getState();
      expect(state.mode).toBe("normal");
      expect(state.team).toHaveLength(1);
      expect(state.team[0].speciesId).toBe("charmander");
    });

    it("returns false when not authenticated", async () => {
      setLoggedOut();

      const applied = await loadFromCloud();

      expect(applied).toBe(false);
      expect(fetchProfile).not.toHaveBeenCalled();
    });

    it("returns false when server has no game state", async () => {
      vi.mocked(fetchProfile).mockResolvedValue({
        profile: {
          userId: TEST_USER.userId,
          email: TEST_USER.email,
          createdAt: TEST_USER.createdAt,
        },
        gameState: {},
      });

      setAuthenticated();

      const applied = await loadFromCloud();

      expect(applied).toBe(false);

      // Store state should be unchanged
      const state = useGameStore.getState();
      expect(state.mode).toBe("normal");
    });

    it("handles fetch errors gracefully", async () => {
      vi.mocked(fetchProfile).mockRejectedValue({ error: "Network error" });
      setAuthenticated();

      const applied = await loadFromCloud();

      expect(applied).toBe(false);

      // Store state should be unchanged
      const state = useGameStore.getState();
      expect(state.mode).toBe("normal");
    });
  });
});
