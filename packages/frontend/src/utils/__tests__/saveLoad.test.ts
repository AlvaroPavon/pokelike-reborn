/**
 * @fileoverview Tests for saveLoad.ts — save/load roundtrip, schema migration,
 * validation, and edge cases.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  SaveManager,
  validateSaveData,
  migrateSaveData,
  SAVE_VERSION,
  MIN_COMPATIBLE_VERSION,
} from "../saveLoad";
import type { SaveData } from "../saveLoad";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Create a minimal valid SaveData fixture at the current version. */
function validSave(overrides?: Partial<SaveData>): SaveData {
  return {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    gameState: {
      mode: "normal",
      team: [],
      items: [],
      badges: [],
      currentMapIndex: 0,
      currentNodeId: null,
      runSeed: 12345,
      trainer: "boy",
      starterSpeciesId: null,
      maxTeamSize: 6,
    },
    ...overrides,
  };
}

/** Create a valid PokemonInstance-like object for test fixtures. */
function makeMon(overrides?: Record<string, unknown>) {
  return {
    speciesId: "25",
    level: 5,
    currentHp: 100,
    maxHp: 100,
    ivs: { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 },
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    stats: { hp: 100, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
    moves: [],
    trainerId: "test",
    fainted: false,
    status: null,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SaveManager", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("saveGame", () => {
    it("persists a valid save to localStorage", () => {
      const data = validSave();
      const result = SaveManager.saveGame(data);

      expect(result).toBe(true);

      const raw = localStorage.getItem("pokelike-save");
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw!);
      expect(parsed.version).toBe(SAVE_VERSION);
      expect(parsed.gameState.mode).toBe("normal");
    });

    it("overwrites the version with SAVE_VERSION on write", () => {
      const data = validSave({ version: 999 });
      SaveManager.saveGame(data);

      const raw = localStorage.getItem("pokelike-save")!;
      const parsed = JSON.parse(raw);
      expect(parsed.version).toBe(SAVE_VERSION);
    });

    it("updates the timestamp on each save", () => {
      const data = validSave({ timestamp: 0 });
      SaveManager.saveGame(data);

      const raw = localStorage.getItem("pokelike-save")!;
      const parsed = JSON.parse(raw);
      expect(parsed.timestamp).toBeGreaterThan(0);
    });

    it("returns false when localStorage throws", () => {
      // Vitest's jsdom localStorage doesn't easily throw, but we can
      // simulate by spying.
      const spy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementationOnce(() => {
          throw new Error("QuotaExceededError");
        });

      const result = SaveManager.saveGame(validSave());
      expect(result).toBe(false);

      spy.mockRestore();
    });
  });

  describe("loadGame", () => {
    it("returns null when no save exists", () => {
      expect(SaveManager.loadGame()).toBeNull();
    });

    it("loads a previously saved game", () => {
      const data = validSave();
      SaveManager.saveGame(data);

      const loaded = SaveManager.loadGame();
      expect(loaded).not.toBeNull();
      expect(loaded!.gameState.mode).toBe("normal");
      expect(loaded!.gameState.runSeed).toBe(12345);
    });

    it("roundtrips team data correctly", () => {
      const team = [makeMon({ speciesId: "4", level: 10 })];
      const data = validSave({
        gameState: { ...validSave().gameState, team },
      });
      SaveManager.saveGame(data);

      const loaded = SaveManager.loadGame();
      expect(loaded!.gameState.team).toHaveLength(1);
      expect(loaded!.gameState.team[0].speciesId).toBe("4");
      expect(loaded!.gameState.team[0].level).toBe(10);
    });

    it("roundtrips badges and items", () => {
      const data = validSave({
        gameState: {
          ...validSave().gameState,
          badges: ["boulder", "cascade"],
          items: [{ itemId: "potion", quantity: 5 }],
        },
      });
      SaveManager.saveGame(data);

      const loaded = SaveManager.loadGame();
      expect(loaded!.gameState.badges).toEqual(["boulder", "cascade"]);
      expect(loaded!.gameState.items).toEqual([
        { itemId: "potion", quantity: 5 },
      ]);
    });

    it("returns null for corrupt JSON", () => {
      localStorage.setItem("pokelike-save", "not-json-at-all");
      expect(SaveManager.loadGame()).toBeNull();
    });

    it("returns null for missing version field", () => {
      localStorage.setItem(
        "pokelike-save",
        JSON.stringify({ timestamp: 1, gameState: validSave().gameState }),
      );
      expect(SaveManager.loadGame()).toBeNull();
    });

    it("returns null for version below minimum", () => {
      localStorage.setItem(
        "pokelike-save",
        JSON.stringify(validSave({ version: 0 })),
      );
      expect(SaveManager.loadGame()).toBeNull();
    });

    it("returns null for version above current", () => {
      localStorage.setItem(
        "pokelike-save",
        JSON.stringify(validSave({ version: SAVE_VERSION + 100 })),
      );
      expect(SaveManager.loadGame()).toBeNull();
    });

    it("migrates old saves to current version on load", () => {
      // Write a v1-like save directly.
      const old: SaveData = {
        version: 1,
        timestamp: 1000,
        gameState: {
          mode: "nuzlocke",
          team: [],
          items: [],
          badges: [],
          currentMapIndex: 1,
          currentNodeId: "node-5",
          runSeed: 999,
          trainer: "girl",
          starterSpeciesId: null,
          maxTeamSize: 6,
        },
      };
      localStorage.setItem("pokelike-save", JSON.stringify(old));

      const loaded = SaveManager.loadGame();
      expect(loaded).not.toBeNull();
      expect(loaded!.version).toBe(SAVE_VERSION);
      expect(loaded!.gameState.mode).toBe("nuzlocke");
    });
  });

  describe("deleteSave", () => {
    it("removes the save from localStorage", () => {
      SaveManager.saveGame(validSave());
      expect(localStorage.getItem("pokelike-save")).not.toBeNull();

      SaveManager.deleteSave();
      expect(localStorage.getItem("pokelike-save")).toBeNull();
    });

    it("does not throw when no save exists", () => {
      expect(() => SaveManager.deleteSave()).not.toThrow();
    });
  });

  describe("hasSave", () => {
    it("returns false when no save exists", () => {
      expect(SaveManager.hasSave()).toBe(false);
    });

    it("returns true after saving", () => {
      SaveManager.saveGame(validSave());
      expect(SaveManager.hasSave()).toBe(true);
    });

    it("returns false after deleting save", () => {
      SaveManager.saveGame(validSave());
      SaveManager.deleteSave();
      expect(SaveManager.hasSave()).toBe(false);
    });
  });

  describe("getSaveTimestamp", () => {
    it("returns null when no save exists", () => {
      expect(SaveManager.getSaveTimestamp()).toBeNull();
    });

    it("returns the timestamp of the saved game (saveGame overwrites it)", () => {
      const before = Date.now();
      SaveManager.saveGame(validSave({ timestamp: 0 }));
      const ts = SaveManager.getSaveTimestamp();
      expect(ts).not.toBeNull();
      expect(ts!).toBeGreaterThanOrEqual(before);
    });
  });
});

describe("validateSaveData", () => {
  it("accepts a valid SaveData object", () => {
    expect(validateSaveData(validSave())).toBe(true);
  });

  it("rejects null", () => {
    expect(() => validateSaveData(null)).toThrow("not a valid object");
  });

  it("rejects a string", () => {
    expect(() => validateSaveData("hello")).toThrow("not a valid object");
  });

  it("rejects an array", () => {
    expect(() => validateSaveData([])).toThrow("not a valid object");
  });

  it("rejects when version is missing", () => {
    const { version: _, ...rest } = validSave();
    expect(() => validateSaveData(rest)).toThrow("version");
  });

  it("rejects when version is not an integer", () => {
    expect(() => validateSaveData(validSave({ version: 1.5 }))).toThrow(
      "version",
    );
  });

  it("rejects when timestamp is missing", () => {
    const { timestamp: _, ...rest } = validSave();
    expect(() => validateSaveData(rest)).toThrow("timestamp");
  });

  it("rejects when gameState is missing", () => {
    expect(() =>
      validateSaveData({ version: SAVE_VERSION, timestamp: 1 }),
    ).toThrow("gameState");
  });

  it("rejects an invalid game mode", () => {
    expect(() =>
      validateSaveData(
        validSave({
          gameState: {
            ...validSave().gameState,
            mode: "ultra_insane" as never,
          },
        }),
      ),
    ).toThrow("game mode");
  });

  it("rejects when team is not an array", () => {
    expect(() =>
      validateSaveData(
        validSave({
          gameState: { ...validSave().gameState, team: "not-array" as never },
        }),
      ),
    ).toThrow("team");
  });

  it("rejects when items is not an array", () => {
    expect(() =>
      validateSaveData(
        validSave({
          gameState: { ...validSave().gameState, items: "nope" as never },
        }),
      ),
    ).toThrow("items");
  });

  it("rejects when badges is not an array", () => {
    expect(() =>
      validateSaveData(
        validSave({
          gameState: { ...validSave().gameState, badges: 42 as never },
        }),
      ),
    ).toThrow("badges");
  });
});

describe("migrateSaveData", () => {
  it("sets version to SAVE_VERSION for old saves", () => {
    const old: SaveData = {
      version: 1,
      timestamp: 0,
      gameState: {
        mode: "normal",
        team: [],
        items: [],
        badges: [],
        currentMapIndex: 0,
        currentNodeId: null,
        runSeed: null,
        trainer: "boy",
        starterSpeciesId: null,
        maxTeamSize: 6,
      },
    };
    const migrated = migrateSaveData(old);
    expect(migrated.version).toBe(SAVE_VERSION);
  });

  it("leaves a current-version save unchanged", () => {
    const data = validSave({ version: SAVE_VERSION });
    const result = migrateSaveData(data);
    expect(result.version).toBe(SAVE_VERSION);
    expect(result.gameState.mode).toBe("normal");
  });
});
