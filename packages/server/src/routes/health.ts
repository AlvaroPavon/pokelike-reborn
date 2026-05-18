/**
 * Health check endpoint — returns server status and timestamp.
 *
 * @module
 */

import type { FastifyInstance } from "fastify";

/**
 * Registers the GET /health route on the given Fastify instance.
 *
 * Response shape:
 * ```json
 * { "status": "ok", "timestamp": 1715000000000 }
 * ```
 */
export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/health", async (_request, _reply) => {
    return { status: "ok", timestamp: Date.now() };
  });
}
