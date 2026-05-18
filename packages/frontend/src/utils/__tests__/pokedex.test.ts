/**
 * @fileoverview Tests for pokedex.ts — markCaught, markSeen, getPokedex,
 * isPokedexComplete, and getCaughtCount.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  markCaught,
  markSeen,
  getPokedex,
  isPokedexComplete,
  getCaughtCount,
} from "../pokedex";

describe("Pokedex", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("markSeen", () => {
    it("creates a new entry with seen=true when species is unknown", () => {
      markSeen(25, "Pikachu");
      const dex = getPokedex();
      expect(dex[25]).toBeDefined();
      expect(dex[25].seen).toBe(true);
      expect(dex[25].caught).toBe(false);
      expect(dex[25].name).toBe("Pikachu");
    });

    it("upgrades an existing entry from caught+seen to still seen", () => {
      markCaught(4, "Charmander");
      markSeen(4, "Charmander");

      const dex = getPokedex();
      expect(dex[4].seen).toBe(true);
      expect(dex[4].caught).toBe(true);
    });

    it("does not overwrite caught status when marking seen", () => {
      markCaught(7, "Squirtle");
      markSeen(7, "Squirtle");

      const dex = getPokedex();
      expect(dex[7].caught).toBe(true);
    });
  });

  describe("markCaught", () => {
    it("creates a new entry with caught=true and seen=true", () => {
      markCaught(1, "Bulbasaur");
      const dex = getPokedex();
      expect(dex[1].caught).toBe(true);
      expect(dex[1].seen).toBe(true);
    });

    it("records the firstCaughtDate on first capture", () => {
      markCaught(6, "Charizard");
      const dex = getPokedex();
      expect(dex[6].firstCaughtDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("does not overwrite firstCaughtDate if already caught", () => {
      markCaught(6, "Charizard");
      const firstDate = getPokedex()[6].firstCaughtDate;

      // Call again — should be a no-op.
      markCaught(6, "Charizard");
      expect(getPokedex()[6].firstCaughtDate).toBe(firstDate);
    });

    it("upgrades a seen-but-not-caught entry to caught", () => {
      markSeen(9, "Blastoise");
      expect(getPokedex()[9].caught).toBe(false);

      markCaught(9, "Blastoise");
      expect(getPokedex()[9].caught).toBe(true);
    });
  });

  describe("getPokedex", () => {
    it("returns an empty object when nothing is recorded", () => {
      expect(getPokedex()).toEqual({});
    });

    it("returns a copy (mutations do not affect storage)", () => {
      markCaught(25, "Pikachu");
      const dex = getPokedex();
      delete dex[25];
      expect(Object.keys(getPokedex())).toHaveLength(1);
    });
  });

  describe("isPokedexComplete", () => {
    it("returns false when no species have been caught", () => {
      expect(isPokedexComplete()).toBe(false);
    });

    it("returns true when all given species are caught", () => {
      markCaught(1, "Bulbasaur");
      markCaught(4, "Charmander");
      markCaught(7, "Squirtle");

      expect(isPokedexComplete([1, 4, 7])).toBe(true);
    });

    it("returns false when some species are missing", () => {
      markCaught(1, "Bulbasaur");

      expect(isPokedexComplete([1, 4])).toBe(false);
    });

    it("returns false when a species is only seen, not caught", () => {
      markCaught(1, "Bulbasaur");
      markSeen(4, "Charmander");

      expect(isPokedexComplete([1, 4])).toBe(false);
    });

    it("returns true regardless of entry completeness when no list given", () => {
      markCaught(1, "Bulbasaur");
      // Only one entry and it's caught.
      expect(isPokedexComplete()).toBe(true);
    });

    it("returns false with no list and mixed entries", () => {
      markCaught(1, "Bulbasaur");
      markSeen(4, "Charmander");
      expect(isPokedexComplete()).toBe(false);
    });
  });

  describe("getCaughtCount", () => {
    it("returns 0 when nothing is caught", () => {
      expect(getCaughtCount()).toBe(0);
    });

    it("returns the count of unique caught species", () => {
      markCaught(1, "Bulbasaur");
      markCaught(4, "Charmander");
      markSeen(7, "Squirtle"); // seen but not caught
      markCaught(25, "Pikachu");

      expect(getCaughtCount()).toBe(3);
    });

    it("does not double-count the same species", () => {
      markCaught(25, "Pikachu");
      markCaught(25, "Pikachu"); // no-op
      expect(getCaughtCount()).toBe(1);
    });
  });
});
