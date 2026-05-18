/**
 * @pokelike/server — Game server entry point.
 *
 * Boots a Fastify HTTP server that exposes:
 * - GET /health        — health check
 * - GET /api/pokemon/:id — PokeAPI proxy with caching
 *
 * @module
 */

import Fastify from "fastify";
import { config } from "./config.js";
import { healthRoutes } from "./routes/health.js";
import { pokemonRoutes } from "./routes/pokemon.js";
import { authRoutes, profileRoutes } from "./routes/auth.js";
import { initSocketServer } from "./sockets/index.js";

const server = Fastify({ logger: true });

async function start(): Promise<void> {
  // Register route plugins
  await server.register(healthRoutes);
  await server.register(pokemonRoutes);
  await server.register(authRoutes);
  await server.register(profileRoutes);

  // Initialize Socket.io on the raw Node.js HTTP server
  const io = initSocketServer(server);
  server.log.info("Socket.io initialized");

  try {
    await server.listen({ port: config.port, host: config.host });
    server.log.info(`Server listening on ${config.host}:${config.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
