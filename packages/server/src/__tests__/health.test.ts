/**
 * Integration tests for the health check endpoint.
 *
 * Validates that GET /health returns the expected status and timestamp
 * without requiring any external services.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import { healthRoutes } from "../routes/health.js";

describe("Health endpoint", () => {
  const server = Fastify({ logger: false });

  beforeAll(async () => {
    await server.register(healthRoutes);
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it("GET /health returns 200 with status ok", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
  });

  it("GET /health returns status: ok", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty("status", "ok");
  });

  it("GET /health returns a numeric timestamp", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty("timestamp");
    expect(typeof body.timestamp).toBe("number");
    expect(body.timestamp).toBeGreaterThan(0);
  });

  it("GET /health timestamp is close to current time", async () => {
    const before = Date.now();
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });
    const after = Date.now();

    const body = JSON.parse(response.payload);
    expect(body.timestamp).toBeGreaterThanOrEqual(before);
    expect(body.timestamp).toBeLessThanOrEqual(after);
  });

  it("GET /health returns exactly two keys", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    const body = JSON.parse(response.payload);
    expect(Object.keys(body).sort()).toEqual(["status", "timestamp"]);
  });

  it("GET /health works without logger", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
  });
});
