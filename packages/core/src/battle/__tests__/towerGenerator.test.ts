/**
 * @fileoverview Tests for the Battle Tower encounter generator.
 *
 * Verifies level scaling matches the floor progression formula and
 * team size increases at the expected floor thresholds.
 *
 * @module battle/__tests__
 */

import { describe, it, expect } from "vitest";
import {
  calculateTowerLevel,
  calculateTowerTeamSize,
  generateTowerEncounter,
  getNextOpponent,
} from "../towerGenerator.js";

// ─── calculateTowerLevel ──────────────────────────────────────────────────

describe("calculateTowerLevel", () => {
  /**
   * The level scaling formula produces monotonically increasing levels.
   */
  it("should return level 5 for floor 1", () => {
    expect(calculateTowerLevel(1)).toBe(5);
  });

  it("should return level >= 5 for any floor", () => {
    for (let floor = 1; floor <= 50; floor++) {
      expect(calculateTowerLevel(floor)).toBeGreaterThanOrEqual(5);
    }
  });

  it("should increase levels monotonically across floors", () => {
    let prev = 0;
    for (let floor = 1; floor <= 30; floor++) {
      const level = calculateTowerLevel(floor);
      expect(level).toBeGreaterThanOrEqual(prev);
      prev = level;
    }
  });

  it("should reach approximately level 28 by floor 10", () => {
    const level = calculateTowerLevel(10);
    // Floor 10 target ~28 from formula: round(2.5*10 + 2.5) = round(27.5) = 28
    expect(level).toBe(28);
  });

  it("should reach approximately level 53 by floor 20", () => {
    const level = calculateTowerLevel(20);
    // Floor 20 target ~53 from formula: round(2.5*20 + 2.5) = round(52.5) = 53
    expect(level).toBe(53);
  });

  it("should produce level 128 by floor 50", () => {
    const level = calculateTowerLevel(50);
    // round(2.5*50 + 2.5) = round(127.5) = 128
    expect(level).toBe(128);
  });
});

// ─── calculateTowerTeamSize ───────────────────────────────────────────────

describe("calculateTowerTeamSize", () => {
  it("should return 1 for floors 1-5", () => {
    for (let floor = 1; floor <= 5; floor++) {
      expect(calculateTowerTeamSize(floor)).toBe(1);
    }
  });

  it("should return 3 for floors 6-15", () => {
    for (let floor = 6; floor <= 15; floor++) {
      expect(calculateTowerTeamSize(floor)).toBe(3);
    }
  });

  it("should return 6 for floors 16 and above", () => {
    for (let floor = 16; floor <= 50; floor++) {
      expect(calculateTowerTeamSize(floor)).toBe(6);
    }
  });

  it("should transition from 1 to 3 at floor 6", () => {
    expect(calculateTowerTeamSize(5)).toBe(1);
    expect(calculateTowerTeamSize(6)).toBe(3);
  });

  it("should transition from 3 to 6 at floor 16", () => {
    expect(calculateTowerTeamSize(15)).toBe(3);
    expect(calculateTowerTeamSize(16)).toBe(6);
  });
});

// ─── generateTowerEncounter ───────────────────────────────────────────────

describe("generateTowerEncounter", () => {
  it("should return a TowerFloor object with correct floor number", () => {
    const floor = generateTowerEncounter(1);
    expect(floor.floor).toBe(1);
  });

  it("should produce an opponent team with the correct team size", () => {
    // Floors 1-5: team size 1
    const floor1 = generateTowerEncounter(1);
    expect(floor1.opponentTeam).toHaveLength(1);
    expect(floor1.teamSize).toBe(1);

    // Floor 6: team size 3
    const floor6 = generateTowerEncounter(6);
    expect(floor6.opponentTeam).toHaveLength(3);
    expect(floor6.teamSize).toBe(3);

    // Floor 16: team size 6
    const floor16 = generateTowerEncounter(16);
    expect(floor16.opponentTeam).toHaveLength(6);
    expect(floor16.teamSize).toBe(6);
  });

  it("should produce Pokemon with the correct level", () => {
    const floor = generateTowerEncounter(5);
    const expectedLevel = calculateTowerLevel(5);
    for (const pokemon of floor.opponentTeam) {
      expect(pokemon.level).toBe(expectedLevel);
    }
  });

  it("should generate valid PokemonInstance objects", () => {
    const floor = generateTowerEncounter(10);
    for (const pokemon of floor.opponentTeam) {
      expect(pokemon.speciesId).toBeTruthy();
      expect(pokemon.level).toBeGreaterThan(0);
      expect(pokemon.maxHp).toBeGreaterThan(0);
      expect(pokemon.currentHp).toBe(pokemon.maxHp);
      expect(pokemon.stats).toBeDefined();
      expect(pokemon.ivs).toBeDefined();
      expect(pokemon.evs).toBeDefined();
      expect(pokemon.moves).toHaveLength(1);
      expect(pokemon.trainerId).toBe("tower");
      expect(pokemon.fainted).toBe(false);
    }
  });

  it("should produce different species on different floors", () => {
    const floor1 = generateTowerEncounter(1);
    const floor2 = generateTowerEncounter(2);
    // Single-pokemon floors should have different species
    // (deterministic formula should give different results for floors 1 and 2)
    expect(floor1.opponentTeam[0]!.speciesId).not.toBe(
      floor2.opponentTeam[0]!.speciesId,
    );
  });

  it("should not have duplicate species within the same team", () => {
    const floor = generateTowerEncounter(20);
    const speciesIds = floor.opponentTeam.map((p) => p.speciesId);
    const uniqueIds = new Set(speciesIds);
    expect(uniqueIds.size).toBe(speciesIds.length);
  });
});

// ─── getNextOpponent ──────────────────────────────────────────────────────

describe("getNextOpponent", () => {
  it("should return an array of PokemonInstance", () => {
    const opponent = getNextOpponent(1);
    expect(Array.isArray(opponent)).toBe(true);
    expect(opponent.length).toBeGreaterThan(0);
    expect(opponent[0]!.speciesId).toBeTruthy();
  });

  it("should produce the same team size as calculateTowerTeamSize", () => {
    const opponent = getNextOpponent(10);
    expect(opponent.length).toBe(calculateTowerTeamSize(10));
  });

  it("should produce Pokemon at the expected level", () => {
    const opponent = getNextOpponent(15);
    for (const pokemon of opponent) {
      expect(pokemon.level).toBe(calculateTowerLevel(15));
    }
  });
});

// ─── Integration: Level + Team Size Progression ──────────────────────────

describe("Tower progression integration", () => {
  it("should scale levels proportionally with floor number", () => {
    const samples = [1, 5, 10, 15, 20, 30, 50];
    for (const floor of samples) {
      const encounter = generateTowerEncounter(floor);
      const expectedLevel = calculateTowerLevel(floor);
      expect(encounter.level).toBe(expectedLevel);
      for (const pokemon of encounter.opponentTeam) {
        expect(pokemon.level).toBe(expectedLevel);
      }
    }
  });

  it("should scale team size at expected thresholds", () => {
    // Floor 4: team size 1
    expect(generateTowerEncounter(4).teamSize).toBe(1);
    expect(generateTowerEncounter(4).opponentTeam).toHaveLength(1);

    // Floor 10: team size 3
    expect(generateTowerEncounter(10).teamSize).toBe(3);
    expect(generateTowerEncounter(10).opponentTeam).toHaveLength(3);

    // Floor 20: team size 6
    expect(generateTowerEncounter(20).teamSize).toBe(6);
    expect(generateTowerEncounter(20).opponentTeam).toHaveLength(6);
  });

  it("should produce stronger opponents at higher floors (higher HP)", () => {
    const lowFloor = generateTowerEncounter(1);
    const highFloor = generateTowerEncounter(20);

    const lowAvgHp =
      lowFloor.opponentTeam.reduce((sum, p) => sum + p.maxHp, 0) /
      lowFloor.opponentTeam.length;

    const highAvgHp =
      highFloor.opponentTeam.reduce((sum, p) => sum + p.maxHp, 0) /
      highFloor.opponentTeam.length;

    expect(highAvgHp).toBeGreaterThan(lowAvgHp);
  });
});
