/**
 * @fileoverview Tests for autoSave.ts — debounce behaviour, subscription,
 * manual flush, and teardown.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initAutoSave, flushAutoSave, forceAutoSave, destroyAutoSave } from "../../stores/autoSave";
import { SaveManager } from "../saveLoad";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Create a minimal Zustand-like store that we can use in tests without
 * pulling in the full React/Zustand dependency.
 */
function createMockStore(initial: Record<string, unknown>) {
  let state = { ...initial };
  const listeners: Array<(s: Record<string, unknown>) => void> = [];

  return {
    getState: () => state,
    setState: (partial: Record<string, unknown>) => {
      state = { ...state, ...partial };
      listeners.forEach((fn) => fn(state));
    },
    subscribe: (fn: (s: Record<string, unknown>) => void) => {
      listeners.push(fn);
      return () => {
        const idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
      };
    },
    _reset: (s: Record<string, unknown>) => {
      state = { ...s };
    },
  };
}

type MockStore = ReturnType<typeof createMockStore>;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("autoSave", () => {
  let store: MockStore;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    store = createMockStore({
      mode: "normal",
      team: [],
      items: [],
      badges: [],
      currentMapIndex: 0,
      currentNodeId: null,
      runSeed: 42,
      trainer: "boy",
    });
  });

  afterEach(() => {
    destroyAutoSave();
    vi.useRealTimers();
  });

  describe("initAutoSave", () => {
    it("subscribes to store changes and saves after debounce", () => {
      initAutoSave(store as never);

      // Simulate a significant change: add a badge.
      store.setState({ badges: ["boulder"] });

      // Before debounce, no save should exist.
      expect(SaveManager.hasSave()).toBe(false);

      // Advance past the debounce window.
      vi.advanceTimersByTime(600);

      expect(SaveManager.hasSave()).toBe(true);
      const data = SaveManager.loadGame();
      expect(data!.gameState.badges).toEqual(["boulder"]);
    });

    it("does NOT save on insignificant changes (same team length)", () => {
      initAutoSave(store as never);

      // Set items to same length (no-op effectively) — should not trigger.
      store.setState({ items: [] });

      vi.advanceTimersByTime(600);
      expect(SaveManager.hasSave()).toBe(false);
    });

    it("debounces multiple rapid changes into a single save", () => {
      initAutoSave(store as never);

      const saveSpy = vi.spyOn(SaveManager, "saveGame");

      // Rapid changes within the debounce window.
      store.setState({ badges: ["boulder"] });
      vi.advanceTimersByTime(100);
      store.setState({ currentNodeId: "node-1" });
      vi.advanceTimersByTime(100);
      store.setState({ items: [{ itemId: "potion", quantity: 1 }] });
      vi.advanceTimersByTime(100);

      // saveGame should not have been called yet.
      expect(saveSpy).not.toHaveBeenCalled();

      // Advance past the full debounce window from the last change.
      vi.advanceTimersByTime(500);
      expect(saveSpy).toHaveBeenCalledTimes(1);

      saveSpy.mockRestore();
    });

    it("is idempotent — calling initAutoSave twice is safe", () => {
      initAutoSave(store as never);
      initAutoSave(store as never); // second call should be no-op

      store.setState({ badges: ["thunder"] });
      vi.advanceTimersByTime(600);

      expect(SaveManager.hasSave()).toBe(true);
    });

    it("triggers save when team length changes (capture event)", () => {
      initAutoSave(store as never);

      // Simulate capturing a Pokemon (adding to team)
      store.setState({
        team: [
          {
            speciesId: "charmander",
            nickname: null,
            level: 5,
            currentHp: 20,
            maxHp: 20,
            attack: 10,
            defense: 10,
            spAttack: 10,
            spDefense: 10,
            speed: 10,
            fainted: false,
            status: null,
            moves: [],
            heldItem: null,
            friendship: 0,
          },
        ],
      });

      expect(SaveManager.hasSave()).toBe(false);

      vi.advanceTimersByTime(600);

      expect(SaveManager.hasSave()).toBe(true);
      const data = SaveManager.loadGame();
      expect(data!.gameState.team).toHaveLength(1);
      expect(data!.gameState.team[0].speciesId).toBe("charmander");
    });

    it("triggers save when items change (item use event)", () => {
      initAutoSave(store as never);

      store.setState({
        items: [{ itemId: "potion", quantity: 5 }],
      });

      vi.advanceTimersByTime(600);

      expect(SaveManager.hasSave()).toBe(true);
      const data = SaveManager.loadGame();
      expect(data!.gameState.items).toHaveLength(1);
    });
  });

  describe("flushAutoSave", () => {
    it("immediately saves without waiting for debounce", () => {
      initAutoSave(store as never);

      store.setState({ badges: ["cascade"] });

      // Before debounce would fire.
      expect(SaveManager.hasSave()).toBe(false);

      flushAutoSave(store as never);

      // Should be saved immediately.
      expect(SaveManager.hasSave()).toBe(true);
      const data = SaveManager.loadGame();
      expect(data!.gameState.badges).toEqual(["cascade"]);
    });

    it("cancels a pending debounced save", () => {
      const saveSpy = vi.spyOn(SaveManager, "saveGame");

      initAutoSave(store as never);
      store.setState({ badges: ["boulder"] });
      store.setState({ currentNodeId: "node-2" });

      // Force flush.
      flushAutoSave(store as never);

      // Advance past the original debounce — should NOT trigger another save.
      saveSpy.mockClear();
      vi.advanceTimersByTime(600);
      expect(saveSpy).not.toHaveBeenCalled();

      saveSpy.mockRestore();
    });
  });

  describe("forceAutoSave", () => {
    it("saves the provided state immediately", () => {
      const state = {
        mode: "nuzlocke" as const,
        team: [],
        items: [{ itemId: "ultra-ball", quantity: 10 }],
        badges: [],
        currentMapIndex: 2,
        currentNodeId: "boss-1",
        runSeed: 999,
        trainer: "girl" as const,
      };

      forceAutoSave(state as never);

      expect(SaveManager.hasSave()).toBe(true);
      const data = SaveManager.loadGame();
      expect(data!.gameState.mode).toBe("nuzlocke");
      expect(data!.gameState.items).toEqual([
        { itemId: "ultra-ball", quantity: 10 },
      ]);
    });
  });

  describe("destroyAutoSave", () => {
    it("cancels pending saves and allows re-initialisation", () => {
      initAutoSave(store as never);
      store.setState({ badges: ["earth"] });

      destroyAutoSave();

      // Advance past debounce — should NOT save.
      vi.advanceTimersByTime(600);
      expect(SaveManager.hasSave()).toBe(false);

      // Re-init should work. Use a different triggering dimension since badges
      // already has length 1 from ["earth"]. Adding an item changes items length
      // from 0 → 1, which is a significant change.
      initAutoSave(store as never);
      store.setState({ items: [{ itemId: "potion", quantity: 1 }] });
      vi.advanceTimersByTime(600);
      expect(SaveManager.hasSave()).toBe(true);
    });
  });
});
