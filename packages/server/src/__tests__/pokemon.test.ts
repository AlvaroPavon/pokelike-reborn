/**
 * Tests for the PokeAPI proxy endpoint.
 *
 * Uses vi.stubGlobal to mock `fetch` so no external HTTP calls are made.
 * Validates normalization, caching, error handling, and edge cases.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import Fastify from "fastify";
import { pokemonRoutes } from "../routes/pokemon.js";

const MOCK_PIKACHU = {
  id: 25,
  name: "pikachu",
  types: [{ type: { name: "electric" } }],
  stats: [
    { base_stat: 35, stat: { name: "hp" } },
    { base_stat: 55, stat: { name: "attack" } },
    { base_stat: 40, stat: { name: "defense" } },
    { base_stat: 50, stat: { name: "special-attack" } },
    { base_stat: 50, stat: { name: "special-defense" } },
    { base_stat: 90, stat: { name: "speed" } },
  ],
  sprites: {
    front_default: "https://example.com/pikachu.png",
    front_shiny: "https://example.com/pikachu-shiny.png",
  },
};

const MOCK_MEWTWO = {
  id: 150,
  name: "mewtwo",
  types: [{ type: { name: "psychic" } }],
  stats: [
    { base_stat: 106, stat: { name: "hp" } },
    { base_stat: 110, stat: { name: "attack" } },
    { base_stat: 90, stat: { name: "defense" } },
    { base_stat: 154, stat: { name: "special-attack" } },
    { base_stat: 90, stat: { name: "special-defense" } },
    { base_stat: 130, stat: { name: "speed" } },
  ],
  sprites: {
    front_default: "https://example.com/mewtwo.png",
    front_shiny: "https://example.com/mewtwo-shiny.png",
  },
};

describe("Pokemon API proxy", () => {
  const server = Fastify({ logger: false });

  beforeAll(async () => {
    await server.register(pokemonRoutes);
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
    vi.restoreAllMocks();
  });

  describe("normalization", () => {
    it("returns normalized Pikachu data with correct types and stats", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(MOCK_PIKACHU),
        }),
      );

      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/25",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.name).toBe("pikachu");
      expect(body.types).toEqual(["electric"]);
      expect(body.baseStats).toEqual({
        hp: 35,
        atk: 55,
        def: 40,
        spa: 50,
        spd: 50,
        spe: 90,
      });
      expect(body.bst).toBe(320); // 35+55+40+50+50+90
    });

    it("returns correct sprite URLs", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(MOCK_PIKACHU),
        }),
      );

      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/25",
      });

      const body = JSON.parse(response.payload);
      expect(body.spriteUrl).toBe("https://example.com/pikachu.png");
      expect(body.shinySpriteUrl).toBe(
        "https://example.com/pikachu-shiny.png",
      );
    });

    it("returns correct bst for Mewtwo", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(MOCK_MEWTWO),
        }),
      );

      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/150",
      });

      const body = JSON.parse(response.payload);
      expect(body.name).toBe("mewtwo");
      expect(body.types).toEqual(["psychic"]);
      expect(body.bst).toBe(680); // 106+110+90+154+90+130
    });
  });

  describe("caching", () => {
    it("caches the result and reuses it within TTL", async () => {
      // Use a unique ID (999) that no other test has cached
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ...MOCK_PIKACHU, id: 999 }),
      });
      vi.stubGlobal("fetch", fetchMock);

      // First call — should hit PokeAPI
      await server.inject({ method: "GET", url: "/api/pokemon/999" });
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second call — should use cache (fetch not called again)
      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/999",
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(JSON.parse(response.payload).name).toBe("pikachu");
    });
  });

  describe("error handling", () => {
    it("returns 400 for id 0", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/0",
      });
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.payload)).toHaveProperty(
        "error",
        "Invalid Pokemon ID",
      );
    });

    it("returns 400 for negative id", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/-5",
      });
      expect(response.statusCode).toBe(400);
    });

    it("returns 400 for NaN id", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/abc",
      });
      expect(response.statusCode).toBe(400);
    });

    it("returns 404 when PokeAPI returns 404", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
        }),
      );

      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/99999",
      });
      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.payload)).toHaveProperty(
        "error",
        "Pokemon not found",
      );
    });

    it("propagates PokeAPI error status codes", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
        }),
      );

      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/1",
      });
      expect(response.statusCode).toBe(500);
    });
  });

  describe("edge cases", () => {
    it("handles null sprites gracefully", async () => {
      // Use a unique ID (888) to avoid cache interference
      const pokemonWithNullSprites = {
        ...MOCK_PIKACHU,
        id: 888,
        sprites: { front_default: null, front_shiny: null },
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(pokemonWithNullSprites),
        }),
      );

      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/888",
      });

      const body = JSON.parse(response.payload);
      expect(body.spriteUrl).toBe("");
      expect(body.shinySpriteUrl).toBe("");
    });

    it("handles Pokemon with multiple types", async () => {
      const pokemonWithDualTypes = {
        ...MOCK_PIKACHU,
        id: 6,
        name: "charizard",
        types: [{ type: { name: "fire" } }, { type: { name: "flying" } }],
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(pokemonWithDualTypes),
        }),
      );

      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/6",
      });

      const body = JSON.parse(response.payload);
      expect(body.types).toEqual(["fire", "flying"]);
    });

    it("includes a cachedAt timestamp", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(MOCK_PIKACHU),
        }),
      );

      const response = await server.inject({
        method: "GET",
        url: "/api/pokemon/25",
      });

      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty("cachedAt");
      expect(typeof body.cachedAt).toBe("number");
    });
  });
});
