/**
 * Socket.io server initialization and Fastify integration.
 *
 * Creates a Socket.io server attached to Fastify's underlying Node.js
 * HTTP server, configures CORS for the frontend dev server, and wires
 * the JWT handshake middleware, matchmaking queue, and event handlers.
 *
 * @module
 */

import { Server as SocketServer } from "socket.io";
import type { FastifyInstance } from "fastify";
import { config } from "../config.js";
import { authMiddleware } from "./auth.js";
import { Matchmaker } from "./matchmaker.js";
import { BattleSession } from "./session.js";

/**
 * Initializes a Socket.io server on the given Fastify instance.
 *
 * Uses `fastify.server` (the raw Node.js HTTP server) rather than the
 * Fastify wrapper so Socket.io can hijack the upgrade handshake.
 *
 * Sets up:
 * - CORS for the frontend dev server
 * - JWT handshake middleware
 * - Matchmaking queue (join, leave, tick, auto-pair)
 * - Per-connection event handlers (queue:join, queue:leave, disconnect)
 *
 * @param fastify - The running Fastify instance.
 * @returns The configured Socket.io Server instance.
 */
export function initSocketServer(fastify: FastifyInstance): SocketServer {
  const io = new SocketServer(fastify.server, {
    cors: {
      origin: [config.frontendOrigin],
      methods: ["GET", "POST"],
    },
  });

  // Apply JWT handshake middleware — reject unauthenticated connections
  io.use(authMiddleware);

  // Create the matchmaking queue and start the tick loop
  const matchmaker = new Matchmaker(io);

  // When a pair is found, create a BattleSession and initialize it
  matchmaker.onPair(({ player1, player2 }) => {
    const session = new BattleSession(
      { userId: player1.userId, socketId: player1.socketId },
      { userId: player2.userId, socketId: player2.socketId },
      io,
    );
    session.init();
  });

  // Handle per-connection events
  io.on("connection", (socket) => {
    const user = socket.data.user as
      | { userId: string; email: string }
      | undefined;
    if (!user) return;

    // ── Queue: Join ──────────────────────────────────────────────────
    socket.on("queue:join", () => {
      matchmaker.join(user.userId, socket.id);
    });

    // ── Queue: Leave ─────────────────────────────────────────────────
    socket.on("queue:leave", () => {
      matchmaker.leave(user.userId);

      // Notify the client they're no longer in queue
      socket.emit("queue:status", {
        inQueue: false,
        message: "You left the queue",
      });
    });

    // ── Disconnect: auto-remove from queue ───────────────────────────
    socket.on("disconnect", () => {
      matchmaker.removeBySocketId(socket.id);
    });
  });

  // Start periodic tick loop (every 3s)
  matchmaker.start();

  return io;
}
