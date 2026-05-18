/**
 * @fileoverview Tests for hallOfFame.ts — add, get, and run counter.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  addHallOfFameEntry,
  getHallOfFame,
  getRunNumber,
  peekRunNumber,
} from "../hallOfFame";
import type { HallOfFameEntry } from "../hallOfFame";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEntry(overrides?: Partial<HallOfFameEntry>): HallOfFameEntry {
  return {
    date: "2026-05-15",
    team: [
      { speciesId: "6", name: "Charizard", level: 100 },
      { speciesId: "9", name: "Blastoise", level: 98 },
    ],
    badges: 8,
    mode: "normal",
    runNumber: 1,
    seed: 42,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("HallOfFame", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("addHallOfFameEntry", () => {
    it("stores an entry that can be retrieved", () => {
      const entry = makeEntry();
      addHallOfFameEntry(entry);

      const entries = getHallOfFame();
      expect(entries).toHaveLength(1);
      expect(entries[0].runNumber).toBe(1);
      expect(entries[0].team).toHaveLength(2);
    });

    it("prepends new entries (most recent first)", () => {
      addHallOfFameEntry(makeEntry({ runNumber: 1 }));
      addHallOfFameEntry(makeEntry({ runNumber: 2 }));

      const entries = getHallOfFame();
      expect(entries).toHaveLength(2);
      expect(entries[0].runNumber).toBe(2); // most recent first
      expect(entries[1].runNumber).toBe(1);
    });

    it("handles large teams in an entry", () => {
      const team = Array.from({ length: 6 }, (_, i) => ({
        speciesId: String(i + 1),
        name: `Pokemon ${i + 1}`,
        level: 50 + i,
      }));
      addHallOfFameEntry(makeEntry({ team }));

      const entries = getHallOfFame();
      expect(entries[0].team).toHaveLength(6);
    });
  });

  describe("getHallOfFame", () => {
    it("returns an empty array when no entries exist", () => {
      expect(getHallOfFame()).toEqual([]);
    });

    it("returns a copy (mutating the result does not affect storage)", () => {
      addHallOfFameEntry(makeEntry());
      const entries = getHallOfFame();
      entries.pop();

      // Original storage should still have the entry.
      expect(getHallOfFame()).toHaveLength(1);
    });

    it("returns multiple entries in order", () => {
      addHallOfFameEntry(makeEntry({ runNumber: 1, date: "2026-01-01" }));
      addHallOfFameEntry(makeEntry({ runNumber: 2, date: "2026-06-01" }));
      addHallOfFameEntry(makeEntry({ runNumber: 3, date: "2026-12-01" }));

      const entries = getHallOfFame();
      expect(entries.map((e) => e.runNumber)).toEqual([3, 2, 1]);
    });
  });

  describe("run counter", () => {
    it("starts at 1 and increments", () => {
      expect(getRunNumber()).toBe(1);
      expect(getRunNumber()).toBe(2);
      expect(getRunNumber()).toBe(3);
    });

    it("peekRunNumber returns the current value without incrementing", () => {
      expect(peekRunNumber()).toBe(0); // no runs started
      getRunNumber(); // 1
      expect(peekRunNumber()).toBe(1); // still 1, not 2
    });
  });
});
