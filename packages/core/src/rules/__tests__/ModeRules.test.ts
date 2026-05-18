/**
 * @fileoverview Tests for game mode rules (NormalRules, NuzlockeRules).
 *
 * Covers:
 * - NormalRules pass-through behavior (no-op faint, always allow encounters)
 * - NuzlockeRules permadeath (onPokemonFaint removes Pokémon)
 * - NuzlockeRules first-encounter restriction (repeat area returns false)
 * - NuzlockeRules onCatch pass-through
 * - createModeRules factory returns correct implementation per mode
 */

import { describe, it, expect, beforeEach } from "vitest";
import type { PokemonInstance } from "../../types";
import { NormalRules } from "../NormalRules.js";
import { NuzlockeRules } from "../NuzlockeRules.js";
import { createModeRules } from "../index.js";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makePokemon(overrides: Partial<PokemonInstance> = {}): PokemonInstance {
  return {
    speciesId: "pikachu",
    nickname: undefined,
    level: 5,
    currentHp: 100,
    maxHp: 100,
    ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    stats: { hp: 100, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    moves: [],
    trainerId: "player-1",
    fainted: false,
    status: null,
    ...overrides,
  };
}

// ─── NormalRules ───────────────────────────────────────────────────────────────

describe("NormalRules", () => {
  let rules: NormalRules;

  beforeEach(() => {
    rules = new NormalRules();
  });

  describe("onPokemonFaint", () => {
    it("returns the team unchanged when a Pokémon faints", () => {
      const pikachu = makePokemon({ speciesId: "pikachu" });
      const charmander = makePokemon({ speciesId: "charmander" });
      const team = [pikachu, charmander];

      const result = rules.onPokemonFaint(pikachu, team);

      // Team length and composition should be preserved
      expect(result).toHaveLength(2);
      expect(result).toEqual(team);
    });

    it("preserves the team when called with a reference not in the array", () => {
      const team = [makePokemon({ speciesId: "pikachu" })];
      const unrelated = makePokemon({ speciesId: "mewtwo" });

      const result = rules.onPokemonFaint(unrelated, team);

      expect(result).toHaveLength(1);
      expect(result).toEqual(team);
    });

    it("returns the same array reference for an empty team", () => {
      const team: PokemonInstance[] = [];
      const pokemon = makePokemon();

      const result = rules.onPokemonFaint(pokemon, team);

      expect(result).toEqual([]);
    });
  });

  describe("onEncounter", () => {
    it("always returns true for any species and area", () => {
      expect(rules.onEncounter("pikachu", "route-1")).toBe(true);
      expect(rules.onEncounter("charizard", "safari-zone")).toBe(true);
      expect(rules.onEncounter("mew", "cerulean-cave")).toBe(true);
    });

    it("returns true regardless of how many times called", () => {
      rules.onEncounter("pikachu", "route-1");
      rules.onEncounter("pikachu", "route-1");
      expect(rules.onEncounter("pikachu", "route-1")).toBe(true);
    });
  });

  describe("onCatch", () => {
    it("returns the Pokémon unchanged", () => {
      const pokemon = makePokemon({ speciesId: "bulbasaur", level: 10 });

      const result = rules.onCatch(pokemon);

      expect(result).toBe(pokemon);
      expect(result.speciesId).toBe("bulbasaur");
      expect(result.level).toBe(10);
    });
  });
});

// ─── NuzlockeRules ─────────────────────────────────────────────────────────────

describe("NuzlockeRules", () => {
  let rules: NuzlockeRules;

  beforeEach(() => {
    rules = new NuzlockeRules();
  });

  describe("onPokemonFaint (permadeath)", () => {
    it("removes the fainted Pokémon from the team", () => {
      const pikachu = makePokemon({ speciesId: "pikachu" });
      const charmander = makePokemon({ speciesId: "charmander" });
      const bulbasaur = makePokemon({ speciesId: "bulbasaur" });
      const team = [pikachu, charmander, bulbasaur];

      const result = rules.onPokemonFaint(charmander, team);

      expect(result).toHaveLength(2);
      expect(result).not.toContain(charmander);
      expect(result).toContain(pikachu);
      expect(result).toContain(bulbasaur);
    });

    it("removes only the fainted Pokémon, preserving order", () => {
      const a = makePokemon({ speciesId: "a" });
      const b = makePokemon({ speciesId: "b" });
      const c = makePokemon({ speciesId: "c" });
      const team = [a, b, c];

      const result = rules.onPokemonFaint(b, team);

      expect(result).toEqual([a, c]);
    });

    it("returns an empty team when the only Pokémon faints", () => {
      const solo = makePokemon({ speciesId: "pikachu" });
      const team = [solo];

      const result = rules.onPokemonFaint(solo, team);

      expect(result).toEqual([]);
    });

    it("leaves the team unchanged when fainted Pokémon is not in the team", () => {
      const pikachu = makePokemon({ speciesId: "pikachu" });
      const team = [pikachu];
      const unknown = makePokemon({ speciesId: "mew" });

      const result = rules.onPokemonFaint(unknown, team);

      expect(result).toHaveLength(1);
      expect(result).toContain(pikachu);
    });
  });

  describe("onEncounter (first encounter per area)", () => {
    it("allows the first encounter in a new area", () => {
      const result = rules.onEncounter("pikachu", "route-1");
      expect(result).toBe(true);
    });

    it("blocks subsequent encounters in the same area", () => {
      rules.onEncounter("pikachu", "route-1");
      const result = rules.onEncounter("rattata", "route-1");
      expect(result).toBe(false);
    });

    it("allows encounters in different areas independently", () => {
      rules.onEncounter("pikachu", "route-1");
      expect(rules.onEncounter("pidgey", "route-2")).toBe(true);
      expect(rules.onEncounter("caterpie", "viridian-forest")).toBe(true);
    });

    it("blocks multiple areas independently", () => {
      rules.onEncounter("pikachu", "route-1");
      rules.onEncounter("pidgey", "route-2");
      expect(rules.onEncounter("rattata", "route-1")).toBe(false);
      expect(rules.onEncounter("spearow", "route-2")).toBe(false);
    });
  });

  describe("onCatch", () => {
    it("returns the Pokémon unchanged", () => {
      const pokemon = makePokemon({ speciesId: "charmander" });

      const result = rules.onCatch(pokemon);

      expect(result).toBe(pokemon);
      expect(result.speciesId).toBe("charmander");
    });
  });

  describe("reset", () => {
    it("clears encountered areas after reset", () => {
      rules.onEncounter("pikachu", "route-1");
      rules.onEncounter("pidgey", "route-2");

      rules.reset();

      expect(rules.onEncounter("pikachu", "route-1")).toBe(true);
      expect(rules.onEncounter("pidgey", "route-2")).toBe(true);
    });
  });
});

// ─── Factory ───────────────────────────────────────────────────────────────────

describe("createModeRules", () => {
  it("returns a NormalRules instance for 'normal' mode", () => {
    const rules = createModeRules("normal");
    expect(rules).toBeInstanceOf(NormalRules);
  });

  it("returns a NuzlockeRules instance for 'nuzlocke' mode", () => {
    const rules = createModeRules("nuzlocke");
    expect(rules).toBeInstanceOf(NuzlockeRules);
  });

  it("returns a NormalRules instance for 'battle_tower' mode (placeholder)", () => {
    const rules = createModeRules("battle_tower");
    expect(rules).toBeInstanceOf(NormalRules);
  });

  it("each call returns a fresh instance", () => {
    const a = createModeRules("nuzlocke");
    const b = createModeRules("nuzlocke");
    expect(a).not.toBe(b);
    // Each instance should have independent encounter tracking
    a.onEncounter("pikachu", "route-1");
    expect(b.onEncounter("pikachu", "route-1")).toBe(true);
  });
});
