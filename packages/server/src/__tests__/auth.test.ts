/**
 * Integration tests for authentication and user profile endpoints.
 *
 * Validates registration, login, profile retrieval, and game state sync
 * using Fastify's `inject` method (no HTTP server needed).
 *
 * Each test group uses unique email addresses so tests within the same file
 * do not collide in the shared in-memory user store.
 *
 * @module
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import { authRoutes, profileRoutes } from "../routes/auth.js";

// ─── Counter for unique test emails ──────────────────────────────────────

let emailCounter = 0;
function nextEmail(): string {
  emailCounter += 1;
  return `auth-test-${emailCounter}-${Date.now()}@example.com`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

/**
 * Register a test user and return the full response body.
 * Used by login/profile/state test groups to set up their user.
 */
async function registerTestUser(
  server: ReturnType<typeof Fastify>,
  email: string,
  password: string,
): Promise<{ userId: string }> {
  const res = await server.inject({
    method: "POST",
    url: "/api/auth/register",
    payload: { email, password },
  });
  return JSON.parse(res.payload);
}

/**
 * Log in a test user and return the response body with token.
 */
async function loginTestUser(
  server: ReturnType<typeof Fastify>,
  email: string,
  password: string,
): Promise<{ token: string; user: { userId: string; email: string; createdAt: number } }> {
  const res = await server.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email, password },
  });
  return JSON.parse(res.payload);
}

// ─── Shared server instance ──────────────────────────────────────────────

const server = Fastify({ logger: false });

beforeAll(async () => {
  await server.register(authRoutes);
  await server.register(profileRoutes);
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

// ─── Registration tests ──────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  const email = nextEmail();
  const password = "regpass123";

  it("returns 201 + userId on successful registration", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email, password },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty("userId");
    expect(typeof body.userId).toBe("string");
  });

  it("returns 400 when email is missing", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { password: "somepass" },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty("error");
  });

  it("returns 400 when password is missing", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: nextEmail() },
    });

    expect(res.statusCode).toBe(400);
  });

  it("returns 409 when email is already registered", async () => {
    // Use the same email that was already registered above
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email, password: "otherpass456" },
    });

    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty("error");
  });
});

// ─── Login tests ─────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  const email = nextEmail();
  const password = "loginpass456";

  beforeAll(async () => {
    await registerTestUser(server, email, password);
  });

  it("returns 200 + token + user on valid credentials", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email, password },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body).toHaveProperty("user");
    expect(body.user.email).toBe(email);
    expect(body.user).toHaveProperty("userId");
    expect(body.user).toHaveProperty("createdAt");
  });

  it("returns 401 on wrong password", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email, password: "wrongpassword" },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty("error");
  });

  it("returns 401 on unknown email", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "nonexistent@example.com", password: "pass123" },
    });

    expect(res.statusCode).toBe(401);
  });

  it("returns 400 when email is missing", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { password: "pass123" },
    });

    expect(res.statusCode).toBe(400);
  });
});

// ─── Profile tests ───────────────────────────────────────────────────────

describe("GET /api/user/profile", () => {
  const email = nextEmail();
  const password = "profilepass789";
  let authToken: string;

  beforeAll(async () => {
    await registerTestUser(server, email, password);
    const loginBody = await loginTestUser(server, email, password);
    authToken = loginBody.token;
  });

  it("returns 401 without Authorization header", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/user/profile",
    });

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 with malformed Authorization header", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/user/profile",
      headers: { authorization: "NotBearer token" },
    });

    expect(res.statusCode).toBe(401);
  });

  it("returns 200 + profile + gameState with valid token", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/api/user/profile",
      headers: { authorization: `Bearer ${authToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty("profile");
    expect(body.profile.email).toBe(email);
    expect(body.profile).toHaveProperty("userId");
    expect(body.profile).toHaveProperty("createdAt");
    expect(body).toHaveProperty("gameState");
    expect(body.gameState).toEqual({});
  });
});

// ─── Game State tests ────────────────────────────────────────────────────

describe("PUT /api/user/profile/state", () => {
  const email = nextEmail();
  const password = "statepass000";
  let authToken: string;

  beforeAll(async () => {
    await registerTestUser(server, email, password);
    const loginBody = await loginTestUser(server, email, password);
    authToken = loginBody.token;
  });

  it("returns 401 without Authorization header", async () => {
    const res = await server.inject({
      method: "PUT",
      url: "/api/user/profile/state",
      payload: { gameState: { level: 5 } },
    });

    expect(res.statusCode).toBe(401);
  });

  it("returns 200 + success on valid state update", async () => {
    const res = await server.inject({
      method: "PUT",
      url: "/api/user/profile/state",
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        gameState: {
          level: 10,
          items: ["potion"],
          team: [{ species: "Pikachu", level: 25 }],
        },
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body).toEqual({ success: true });
  });

  it("persists game state after update", async () => {
    // Fetch profile to verify the gameState was persisted
    const res = await server.inject({
      method: "GET",
      url: "/api/user/profile",
      headers: { authorization: `Bearer ${authToken}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.gameState).toHaveProperty("level", 10);
    expect(body.gameState).toHaveProperty("items");
    expect(body.gameState).toHaveProperty("team");
  });

  it("returns 401 with invalid token", async () => {
    const res = await server.inject({
      method: "PUT",
      url: "/api/user/profile/state",
      headers: { authorization: "Bearer invalid-jwt-token-here" },
      payload: { gameState: { test: true } },
    });

    expect(res.statusCode).toBe(401);
  });
});
