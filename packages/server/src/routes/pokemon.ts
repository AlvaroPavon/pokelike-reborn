/**
 * PokeAPI proxy route — fetches, normalizes, and caches Pokemon data.
 *
 * @module
 */

import type { FastifyInstance } from "fastify";
import { config } from "../config.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Normalized Pokemon representation returned by the proxy. */
export interface CachedPokemon {
  id: number;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spa: number;
    spd: number;
    spe: number;
  };
  bst: number;
  spriteUrl: string;
  shinySpriteUrl: string;
  cachedAt: number;
}

/** Raw shape returned by the upstream PokeAPI. */
interface PokeApiPokemon {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
  };
}

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

const cache = new Map<number, CachedPokemon>();

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

const STAT_MAP: Record<string, keyof CachedPokemon["baseStats"]> = {
  hp: "hp",
  attack: "atk",
  defense: "def",
  "special-attack": "spa",
  "special-defense": "spd",
  speed: "spe",
};

/** Flatten the verbose PokeAPI structure into a minimal CachedPokemon. */
function normalizePokemon(data: PokeApiPokemon): CachedPokemon {
  const baseStats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  let bst = 0;

  for (const stat of data.stats) {
    const key = STAT_MAP[stat.stat.name];
    if (key) {
      baseStats[key] = stat.base_stat;
      bst += stat.base_stat;
    }
  }

  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    baseStats,
    bst,
    spriteUrl: data.sprites.front_default ?? "",
    shinySpriteUrl: data.sprites.front_shiny ?? "",
    cachedAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Route registration
// ---------------------------------------------------------------------------

/**
 * Registers the GET /api/pokemon/:id route on the given Fastify instance.
 *
 * - Seeks an in-memory cache hit first (TTL = config.cacheTtlMs).
 * - On miss, fetches from PokeAPI, normalizes, caches, and returns.
 * - Returns 400 for invalid IDs and 404 for unknown Pokemon.
 */
export async function pokemonRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: { id: string } }>(
    "/api/pokemon/:id",
    async (request, reply) => {
      const id = parseInt(request.params.id, 10);

      if (isNaN(id) || id < 1) {
        return reply.status(400).send({ error: "Invalid Pokemon ID" });
      }

      // --- Cache check ---
      const cached = cache.get(id);
      if (cached && Date.now() - cached.cachedAt < config.cacheTtlMs) {
        return cached;
      }

      // --- Fetch from PokeAPI ---
      const response = await fetch(`${config.pokeApiBaseUrl}/pokemon/${id}`);

      if (!response.ok) {
        return reply
          .status(response.status)
          .send({ error: "Pokemon not found" });
      }

      const raw = (await response.json()) as PokeApiPokemon;
      const normalized = normalizePokemon(raw);

      cache.set(id, normalized);
      return normalized;
    },
  );
}
