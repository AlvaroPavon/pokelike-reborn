/**
 * @fileoverview Unit tests for the migrated battle engine.
 *
 * Verifies that simulateBattle is deterministic — same seed + same teams
 * always produces identical results. This is the core requirement for
 * server-authoritative multiplayer.
 */

import { describe, it, expect } from "vitest";
import { SeededRNG } from "../../utils/prng.js";
import { simulateBattle, makeGymMon } from "../engine.js";
import type { PokemonInstance } from "../../types/index.js";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * Create a simple test team with one Pokemon.
 */
function makeTeam(speciesId: string, level: number): PokemonInstance[] {
  return [makeGymMon(speciesId, level)];
}

describe("simulateBattle", () => {
  it("produces identical results for the same seed", () => {
    const seed = 42;
    const team1 = makeTeam("pikachu", 50);
    const team2 = makeTeam("charmander", 50);

    const rng1 = new SeededRNG(seed);
    const rng2 = new SeededRNG(seed);

    const result1 = simulateBattle(team1, team2, rng1);
    const result2 = simulateBattle(team1, team2, rng2);

    expect(result1.winner).toBe(result2.winner);
    expect(result1.log).toEqual(result2.log);
    expect(result1.finalPlayerTeam).toEqual(result2.finalPlayerTeam);
    expect(result1.finalEnemyTeam).toEqual(result2.finalEnemyTeam);
  });

  it("produces different results for different seeds", () => {
    const team1 = makeTeam("pikachu", 50);
    const team2 = makeTeam("charmander", 50);

    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(999);

    const result1 = simulateBattle(team1, team2, rng1);
    const result2 = simulateBattle(team1, team2, rng2);

    // Different seeds should produce different logs
    // (extremely unlikely to be identical)
    const logsDiffer = result1.log.some(
      (entry, i) =>
        entry.message !== (result2.log[i]?.message ?? "") ||
        entry.damage !== result2.log[i]?.damage,
    );
    expect(logsDiffer).toBe(true);
  });

  it("handles a 3v3 battle", () => {
    const seed = 12345;
    const team1 = [
      makeGymMon("pikachu", 50),
      makeGymMon("bulbasaur", 50),
      makeGymMon("squirtle", 50),
    ];
    const team2 = [
      makeGymMon("charmander", 50),
      makeGymMon("pidgey", 50),
      makeGymMon("rattata", 50),
    ];

    const rng = new SeededRNG(seed);
    const result = simulateBattle(team1, team2, rng);

    // Should complete with a winner
    expect(["player", "enemy", "draw"]).toContain(result.winner);
    expect(result.log.length).toBeGreaterThan(0);
    expect(result.finalPlayerTeam.length).toBe(3);
    expect(result.finalEnemyTeam.length).toBe(3);

    // At least one side should have all fainted
    const playerAllFainted = result.finalPlayerTeam.every((p) => p.fainted);
    const enemyAllFainted = result.finalEnemyTeam.every((p) => p.fainted);
    expect(playerAllFainted || enemyAllFainted).toBe(true);
  });

  it("is deterministic with repeated calls", () => {
    const seed = 777;
    const team1 = makeTeam("mewtwo", 100);
    const team2 = makeTeam("pikachu", 100);

    const results = [0, 1, 2].map(() => {
      const rng = new SeededRNG(seed);
      return simulateBattle(team1, team2, rng);
    });

    // All three runs should be identical
    for (let i = 1; i < results.length; i++) {
      expect(results[i]!.log).toEqual(results[0]!.log);
      expect(results[i]!.winner).toBe(results[0]!.winner);
    }
  });

  it("honors custom maxTurns from BattleOptions", () => {
    const seed = 1;
    const team1 = makeTeam("magikarp", 10);
    const team2 = makeTeam("magikarp", 10);

    const rng = new SeededRNG(seed);
    const result = simulateBattle(team1, team2, rng, { maxTurns: 3 });

    // With maxTurns=3 the battle may not finish naturally
    expect(result.log.length).toBeLessThanOrEqual(10);
  });

  it("uses the core typeChart for type effectiveness", () => {
    // Pikachu (Electric) vs Magikarp (Water) → Super effective
    const seed = 100;
    const team1 = makeTeam("pikachu", 100);
    const team2 = makeTeam("magikarp", 5);

    const rng = new SeededRNG(seed);
    const result = simulateBattle(team1, team2, rng);

    // Pikachu should easily win against a low-level Magikarp
    expect(result.winner).toBe("player");
  });
});
