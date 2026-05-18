/**
 * In-memory FIFO matchmaking queue.
 *
 * Manages player join/leave, periodic tick for pairing, and emits
 * queue status updates to connected clients via Socket.io.
 *
 * @module
 */

import { Server as SocketServer } from "socket.io";

// ─── Types ────────────────────────────────────────────────────────────────

/** An entry in the matchmaking queue. */
export interface QueueEntry {
  /** Authenticated user ID (from JWT payload). */
  userId: string;
  /** Active socket connection ID for this user. */
  socketId: string;
  /** Timestamp (epoch ms) when the player joined the queue. */
  joinedAt: number;
}

/** A pair of matched players ready for a battle session. */
export interface MatchPair {
  player1: QueueEntry;
  player2: QueueEntry;
}

/** Payload sent to clients via the `queue:status` event. */
export interface QueueStatusPayload {
  /** Whether the player is currently in the queue. */
  inQueue: boolean;
  /** Current position in queue (1-based). Only set when inQueue is true. */
  position?: number;
  /** Set to true when a match has been found. */
  matchFound?: boolean;
  /** Set to true when the player timed out waiting. */
  timedOut?: boolean;
  /** Optional human-readable message. */
  message?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────

/** How often (ms) the tick runs to check for pairs. */
const TICK_INTERVAL_MS = 3_000;

/** Maximum time (ms) a player can stay in queue before being timed out. */
const QUEUE_TIMEOUT_MS = 120_000;

// ─── Matchmaker ───────────────────────────────────────────────────────────

/**
 * Lightweight FIFO matchmaking queue.
 *
 * Players join by `userId`/`socketId`, are paired in arrival order
 * when the periodic tick finds two available players, and get
 * real-time status updates via Socket.io.
 */
export class Matchmaker {
  private queue: QueueEntry[] = [];
  private io: SocketServer;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private onPairCallback: ((pair: MatchPair) => void) | null = null;

  constructor(io: SocketServer) {
    this.io = io;
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  /**
   * Add a player to the queue (or update their socketId if already queued).
   *
   * @returns The player's 1-based position in queue.
   */
  join(userId: string, socketId: string): { position: number } {
    const existing = this.queue.findIndex((e) => e.userId === userId);
    if (existing !== -1) {
      // Update socket ID in case of reconnection
      this.queue[existing].socketId = socketId;
      const position = existing + 1;
      this.emitStatus(socketId, { inQueue: true, position });
      return { position };
    }

    this.queue.push({ userId, socketId, joinedAt: Date.now() });
    const position = this.queue.length;
    this.emitStatus(socketId, { inQueue: true, position });
    return { position };
  }

  /**
   * Remove a player from the queue by userId.
   *
   * @returns true if the player was in the queue and was removed.
   */
  leave(userId: string): boolean {
    const idx = this.queue.findIndex((e) => e.userId === userId);
    if (idx === -1) return false;
    this.queue.splice(idx, 1);
    return true;
  }

  /**
   * Remove a player by their socket connection ID.
   * Useful for handling disconnect events.
   *
   * @returns true if a matching entry was removed.
   */
  removeBySocketId(socketId: string): boolean {
    const idx = this.queue.findIndex((e) => e.socketId === socketId);
    if (idx === -1) return false;
    this.queue.splice(idx, 1);
    return true;
  }

  /**
   * Register a callback invoked when a pair of players is matched.
   * The callback receives the two `QueueEntry` objects.
   */
  onPair(callback: (pair: MatchPair) => void): void {
    this.onPairCallback = callback;
  }

  /**
   * Run one matchmaking cycle.
   *
   * - Checks for timed-out entries and removes them.
   * - If 2+ players are waiting, dequeues the first two and signals
   *   a match via the `onPair` callback.
   *
   * Safe to call externally (e.g. in tests) — no side effects besides
   * the queue mutation and callback invocation.
   */
  tick(): void {
    this.evictTimedOut();

    if (this.queue.length < 2) return;

    const player1 = this.queue.shift()!;
    const player2 = this.queue.shift()!;

    // Notify both players a match was found
    this.emitStatus(player1.socketId, {
      inQueue: false,
      matchFound: true,
    });
    this.emitStatus(player2.socketId, {
      inQueue: false,
      matchFound: true,
    });

    this.onPairCallback?.({ player1, player2 });
  }

  /**
   * Start the periodic tick loop.
   * Idempotent — safe to call multiple times.
   */
  start(): void {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => this.tick(), TICK_INTERVAL_MS);
  }

  /**
   * Stop the periodic tick loop.
   * Idempotent — safe to call multiple times.
   */
  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  /**
   * Get the 1-based queue position for a given userId.
   * Returns 0 if the user is not in the queue.
   */
  getPosition(userId: string): number {
    const idx = this.queue.findIndex((e) => e.userId === userId);
    return idx === -1 ? 0 : idx + 1;
  }

  /** Current number of players in the queue. */
  get length(): number {
    return this.queue.length;
  }

  /** Snapshot of current queue entries (for testing/inspection). */
  get entries(): readonly QueueEntry[] {
    return this.queue;
  }

  // ─── Private ────────────────────────────────────────────────────────────

  /** Remove entries that have exceeded the timeout. */
  private evictTimedOut(): void {
    const now = Date.now();
    const timedOut: QueueEntry[] = [];

    for (let i = this.queue.length - 1; i >= 0; i--) {
      if (now - this.queue[i].joinedAt >= QUEUE_TIMEOUT_MS) {
        timedOut.push(this.queue[i]);
        this.queue.splice(i, 1);
      }
    }

    for (const entry of timedOut) {
      this.emitStatus(entry.socketId, {
        inQueue: false,
        timedOut: true,
        message: "No match found within the time limit",
      });
    }
  }

  /** Safely emit a `queue:status` event to a specific socket. */
  private emitStatus(socketId: string, payload: QueueStatusPayload): void {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit("queue:status", payload);
    }
  }
}
