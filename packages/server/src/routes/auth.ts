/**
 * Authentication and user profile routes.
 *
 * Provides registration, login, profile retrieval, and game state sync
 * using bcryptjs for password hashing and jsonwebtoken for session management.
 *
 * In-memory Map is used for user storage (MVP phase). Switching to a
 * persistent database requires replacing the `users` Map implementation.
 *
 * @module
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { config } from "../config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ─── Types ───────────────────────────────────────────────────────────────

/** Internal user record stored in-memory. */
interface User {
  userId: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  gameState: Record<string, unknown>;
  multiplayerStats: MultiplayerStats;
}

/** Minimal ranked multiplayer stats stored in the user profile. */
export interface MultiplayerStats {
  wins: number;
  losses: number;
  rank: number;
  lastBattleAt: number | null;
}

/** Payload embedded inside every issued JWT. */
export interface JwtPayload {
  userId: string;
  email: string;
}

// ─── In-memory store (MVP — replace with DB later) ──────────────────────

const users = new Map<string, User>();

function createInitialMultiplayerStats(): MultiplayerStats {
  return {
    wins: 0,
    losses: 0,
    rank: 1000,
    lastBattleAt: null,
  };
}

/** Update the in-memory profile stats after a completed multiplayer battle. */
export function recordMultiplayerResult(winnerUserId: string, loserUserId: string): void {
  const winner = users.get(winnerUserId);
  const loser = users.get(loserUserId);
  const now = Date.now();

  if (winner) {
    winner.multiplayerStats = {
      ...winner.multiplayerStats,
      wins: winner.multiplayerStats.wins + 1,
      rank: winner.multiplayerStats.rank + 15,
      lastBattleAt: now,
    };
  }

  if (loser) {
    loser.multiplayerStats = {
      ...loser.multiplayerStats,
      losses: loser.multiplayerStats.losses + 1,
      rank: Math.max(0, loser.multiplayerStats.rank - 10),
      lastBattleAt: now,
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Generate a v4 UUID for new user accounts. */
function generateUserId(): string {
  return crypto.randomUUID();
}

/** Sign a JWT for the given payload with configured expiry. */
function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

/** Verify and decode a JWT. Returns null on invalid/expired tokens. */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Extract and verify the JWT from the Authorization header.
 * Expects format: "Bearer <token>".
 */
function getJwtPayload(
  request: FastifyRequest,
): JwtPayload | null {
  const authHeader = request.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return verifyToken(parts[1]);
}

// ─── Auth routes: register + login ───────────────────────────────────────

/**
 * Registers the auth routes on the given Fastify instance.
 *
 * - `POST /api/auth/register` → creates account, returns `{ userId }` (201)
 * - `POST /api/auth/login`    → validates credentials, returns `{ token, user }` (200)
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/auth/register
   *
   * Creates a new user account with bcrypt-hashed password.
   * Returns 201 on success, 400 if email/password missing, 409 if email taken.
   */
  fastify.post<{ Body: { email: string; password: string } }>(
    "/api/auth/register",
    async (request, reply) => {
      const { email, password } = request.body ?? {};

      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password are required" });
      }

      if (typeof email !== "string" || typeof password !== "string") {
        return reply.status(400).send({ error: "Email and password must be strings" });
      }

      // Check for existing user by email
      for (const user of users.values()) {
        if (user.email === email) {
          return reply.status(409).send({ error: "Email already registered" });
        }
      }

      const userId = generateUserId();
      const passwordHash = await bcrypt.hash(password, 10);

      users.set(userId, {
        userId,
        email,
        passwordHash,
        createdAt: Date.now(),
        gameState: {},
        multiplayerStats: createInitialMultiplayerStats(),
      });

      return reply.status(201).send({ userId });
    },
  );

  /**
   * POST /api/auth/login
   *
   * Validates email + password against stored hash.
   * Returns a signed JWT and user profile on success.
   * Returns 401 on invalid credentials.
   */
  fastify.post<{ Body: { email: string; password: string } }>(
    "/api/auth/login",
    async (request, reply) => {
      const { email, password } = request.body ?? {};

      if (!email || !password) {
        return reply.status(400).send({ error: "Email and password are required" });
      }

      if (typeof email !== "string" || typeof password !== "string") {
        return reply.status(400).send({ error: "Email and password must be strings" });
      }

      // Find user by email
      let foundUser: User | undefined;
      for (const user of users.values()) {
        if (user.email === email) {
          foundUser = user;
          break;
        }
      }

      if (!foundUser) {
        return reply.status(401).send({ error: "Invalid email or password" });
      }

      const valid = await bcrypt.compare(password, foundUser.passwordHash);
      if (!valid) {
        return reply.status(401).send({ error: "Invalid email or password" });
      }

      const token = createToken({
        userId: foundUser.userId,
        email: foundUser.email,
      });

      return {
        token,
        user: {
          userId: foundUser.userId,
          email: foundUser.email,
          createdAt: foundUser.createdAt,
          multiplayerStats: foundUser.multiplayerStats,
        },
      };
    },
  );
}

// ─── Profile routes: read + update game state ────────────────────────────

/**
 * Registers the user profile routes on the given Fastify instance.
 *
 * - `GET  /api/user/profile`      → returns `{ profile, gameState }` (200 / 401)
 * - `PUT  /api/user/profile/state` → upserts gameState JSON blob (200 / 401)
 */
export async function profileRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * GET /api/user/profile
   *
   * Returns the authenticated user's profile and game state.
   * Requires a valid Bearer JWT in the Authorization header.
   */
  fastify.get("/api/user/profile", async (request, reply) => {
    const payload = getJwtPayload(request);
    if (!payload) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const user = users.get(payload.userId);
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    return {
      profile: {
        userId: user.userId,
        email: user.email,
        createdAt: user.createdAt,
        multiplayerStats: user.multiplayerStats,
      },
      gameState: user.gameState,
    };
  });

  /**
   * PUT /api/user/profile/state
   *
   * Upserts the authenticated user's gameState JSON blob.
   * Requires a valid Bearer JWT in the Authorization header.
   */
  fastify.put<{ Body: { gameState: Record<string, unknown> } }>(
    "/api/user/profile/state",
    async (request, reply) => {
      const payload = getJwtPayload(request);
      if (!payload) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const user = users.get(payload.userId);
      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      const { gameState } = request.body ?? {};
      user.gameState = typeof gameState === "object" && gameState !== null
        ? gameState
        : {};

      return { success: true };
    },
  );
}
