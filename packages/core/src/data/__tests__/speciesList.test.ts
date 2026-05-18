/**
 * @fileoverview Data integrity tests for the species registry.
 *
 * Verifies that:
 * - All species have valid pokedex numbers (1–1025)
 * - All species have non-empty names
 * - All species have at least one type
 * - No duplicate pokedex numbers exist
 * - Evolution chains reference existing species
 * - Public helper functions work correctly
 * - Total species count matches expectations
 */

import { describe, it, expect } from "vitest";
import {
  speciesMap,
  speciesList,
  getSpeciesByNumber,
  getSpeciesById,
  getEvolutionChain,
  searchSpecies,
  TOTAL_SPECIES,
} from "../speciesList";
import { PokemonType } from "../../types";
import type { SpeciesEntry } from "../speciesList";

describe("speciesList — data integrity", () => {
  describe("registry completeness", () => {
    it("has species map entries", () => {
      expect(speciesMap.size).toBeGreaterThan(0);
    });

    it("contains Bulbasaur (#1)", () => {
      const entry = speciesMap.get(1);
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Bulbasaur");
      expect(entry!.id).toBe("bulbasaur");
    });

    it("contains Pikachu (#25)", () => {
      const entry = speciesMap.get(25);
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Pikachu");
    });

    it("contains Pecharunt (#1018)", () => {
      const entry = speciesMap.get(1018);
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Pecharunt");
    });
  });

  describe("TOTAL_SPECIES", () => {
    it("matches the map size", () => {
      expect(TOTAL_SPECIES).toBe(speciesMap.size);
    });

    it("is exactly 1018", () => {
      expect(TOTAL_SPECIES).toBe(1018);
    });
  });

  describe("speciesList", () => {
    it("is sorted by pokedexNumber", () => {
      for (let i = 1; i < speciesList.length; i++) {
        expect(speciesList[i].pokedexNumber).toBeGreaterThan(
          speciesList[i - 1].pokedexNumber,
        );
      }
    });

    it("contains all entries from the map", () => {
      expect(speciesList.length).toBe(speciesMap.size);
    });
  });

  describe("individual entry validation", () => {
    it("all species have valid pokedex numbers", () => {
      for (const entry of speciesMap.values()) {
        expect(entry.pokedexNumber).toBeGreaterThanOrEqual(1);
        expect(entry.pokedexNumber).toBeLessThanOrEqual(1025);
      }
    });

    it("all species have non-empty names", () => {
      for (const entry of speciesMap.values()) {
        expect(entry.name.length).toBeGreaterThan(0);
      }
    });

    it("all species have at least one type", () => {
      for (const entry of speciesMap.values()) {
        expect(entry.types.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("all species have valid PokemonType values", () => {
      const validTypes = Object.values(PokemonType);
      for (const entry of speciesMap.values()) {
        for (const type of entry.types) {
          expect(validTypes).toContain(type);
        }
      }
    });

    it("all species have non-empty id strings", () => {
      for (const entry of speciesMap.values()) {
        expect(entry.id.length).toBeGreaterThan(0);
      }
    });

    it("no duplicate pokedex numbers", () => {
      const numbers = Array.from(speciesMap.values()).map(
        (e) => e.pokedexNumber,
      );
      const unique = new Set(numbers);
      expect(unique.size).toBe(numbers.length);
    });

    it("all species have valid base stats", () => {
      for (const entry of speciesMap.values()) {
        const s = entry.baseStats;
        expect(s.hp).toBeGreaterThanOrEqual(1);
        expect(s.atk).toBeGreaterThanOrEqual(1);
        expect(s.def).toBeGreaterThanOrEqual(1);
        expect(s.spa).toBeGreaterThanOrEqual(1);
        expect(s.spd).toBeGreaterThanOrEqual(1);
        expect(s.spe).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe("getSpeciesByNumber", () => {
    it("returns the correct species for a known number", () => {
      const pikachu = getSpeciesByNumber(25);
      expect(pikachu).toBeDefined();
      expect(pikachu!.name).toBe("Pikachu");
    });

    it("returns undefined for an unknown number", () => {
      expect(getSpeciesByNumber(9999)).toBeUndefined();
    });

    it("returns undefined for 0", () => {
      expect(getSpeciesByNumber(0)).toBeUndefined();
    });
  });

  describe("getSpeciesById", () => {
    it("returns the correct species for a known id", () => {
      const charmander = getSpeciesById("charmander");
      expect(charmander).toBeDefined();
      expect(charmander!.name).toBe("Charmander");
      expect(charmander!.pokedexNumber).toBe(4);
    });

    it("returns undefined for an unknown id", () => {
      expect(getSpeciesById("nonexistent")).toBeUndefined();
    });

    it("is case-sensitive", () => {
      expect(getSpeciesById("Charmander")).toBeUndefined();
    });
  });

  describe("getEvolutionChain", () => {
    it("returns a single link for a non-evolving species", () => {
      const chain = getEvolutionChain("mewtwo");
      expect(chain.length).toBe(1);
      expect(chain[0].id).toBe("mewtwo");
    });

    it("returns the full chain for a middle-stage Pokémon", () => {
      // Charmeleon (#5) → evolves from Charmander (#4), evolves to Charizard (#6)
      const chain = getEvolutionChain("charmeleon");
      expect(chain.length).toBe(3);
      expect(chain[0].id).toBe("charmander");
      expect(chain[1].id).toBe("charmeleon");
      expect(chain[2].id).toBe("charizard");
    });

    it("includes the full chain from the first stage", () => {
      const chain = getEvolutionChain("charmander");
      expect(chain.length).toBe(3);
      expect(chain[0].id).toBe("charmander");
      expect(chain[2].id).toBe("charizard");
    });

    it("includes the full chain from the last stage", () => {
      const chain = getEvolutionChain("charizard");
      expect(chain.length).toBe(3);
      expect(chain[0].id).toBe("charmander");
    });

    it("returns empty array for a completely unknown species ID", () => {
      const chain = getEvolutionChain("__nonexistent__");
      expect(chain).toEqual([]);
    });
  });

  describe("searchSpecies", () => {
    it("returns first 100 species with empty query", () => {
      const results = searchSpecies("");
      expect(results.length).toBeLessThanOrEqual(100);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].pokedexNumber).toBe(1);
    });

    it("respects custom limit", () => {
      const results = searchSpecies("", 5);
      expect(results.length).toBe(5);
    });

    it("finds species by name substring (case-insensitive)", () => {
      const results = searchSpecies("char");
      expect(results.length).toBeGreaterThan(0);
      const names = results.map((r) => r.name);
      expect(names).toContain("Charmander");
      expect(names).toContain("Charmeleon");
      expect(names).toContain("Charizard");
    });

    it("finds species by id substring", () => {
      const results = searchSpecies("pikachu");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe("pikachu");
    });

    it("finds species by exact pokedex number", () => {
      const results = searchSpecies("25", 1);
      expect(results.length).toBe(1);
      expect(results[0].name).toBe("Pikachu");
    });

    it("returns empty array for query with no matches", () => {
      const results = searchSpecies("zzzznonexistentzzzz");
      expect(results).toEqual([]);
    });
  });

  describe("evolution data consistency", () => {
    // Note: Only Gen 1 species (1-151) currently have evolution data via reg().
    // Gen 2+ use stubs and don't carry evolution fields yet.
    //
    // Limitations of the single-string evolvesTo field:
    // - Eevee evolves into 8 species but only stores one evolvesTo value.

    it("evolvesFrom references point to existing species", () => {
      for (const entry of speciesMap.values()) {
        if (entry.evolvesFrom) {
          expect(getSpeciesById(entry.evolvesFrom)).toBeDefined();
        }
      }
    });

    it("evolvesTo references point to existing species", () => {
      for (const entry of speciesMap.values()) {
        if (entry.evolvesTo) {
          expect(getSpeciesById(entry.evolvesTo)).toBeDefined();
        }
      }
    });

    it("species with evolvesTo have a matching child's evolvesFrom", () => {
      for (const entry of speciesMap.values()) {
        if (entry.evolvesTo) {
          const child = getSpeciesById(entry.evolvesTo);
          expect(child).toBeDefined();
          if (child && child.evolvesFrom !== undefined) {
            expect(child.evolvesFrom).toBe(entry.id);
          }
        }
      }
    });

    it("species that are NOT multi-evo parents have matching evolvesTo set correctly", () => {
      // Eevee is the only multi-evo case. Build a set of all species
      // that have multiple species evolving FROM them.
      const multiEvoParents = new Set<string>();
      for (const entry of speciesMap.values()) {
        if (entry.evolvesFrom) {
          if (multiEvoParents.has(entry.evolvesFrom)) continue;
          // Check if there's another species with the same evolvesFrom
          for (const other of speciesMap.values()) {
            if (other.id !== entry.id && other.evolvesFrom === entry.evolvesFrom) {
              multiEvoParents.add(entry.evolvesFrom);
              break;
            }
          }
        }
      }

      for (const entry of speciesMap.values()) {
        if (entry.evolvesFrom && !multiEvoParents.has(entry.evolvesFrom)) {
          const parent = getSpeciesById(entry.evolvesFrom);
          expect(parent).toBeDefined();
          if (parent && parent.evolvesTo !== undefined) {
            expect(parent.evolvesTo).toBe(entry.id);
          }
        }
      }
    });
  });
});
