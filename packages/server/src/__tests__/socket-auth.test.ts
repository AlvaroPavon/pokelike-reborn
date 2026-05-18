/**
 * Unit tests for Socket.io JWT authentication middleware.
 *
 * Verifies that the handshake middleware correctly:
 * - Rejects connections without a token
 * - Rejects connections with an invalid/expired token
 * - Allows connections with a valid token
 * - Attaches decoded user payload to the socket data
 *
 * @module
 */

import { describe, it, expect } from "vitest";
import { authMiddleware } from "../sockets/auth.js";
import { config } from "../config.js";
import jwt from "jsonwebtoken";

// ─── Helpers ─────────────────────────────────────────────────────────────

/**
 * Create a minimal mock socket object with the given auth token.
 * Only exposes the fields that `authMiddleware` touches.
 */
function mockSocket(token: string | undefined): any {
  return {
    handshake: {
      auth: { token },
    },
    data: {},
  };
}

/**
 * Create a mock `next` callback that captures its argument.
 * Returns `[nextFn, errorCapture]` where `errorCapture` is an array
 * that will contain the error (or undefined) passed to next.
 */
function mockNext(): [(err?: Error) => void, (Error | undefined)[]] {
  const captured: (Error | undefined)[] = [];
  const next = (err?: Error): void => {
    captured.push(err);
  };
  return [next, captured];
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe("Socket.io JWT auth middleware", () => {
  it("rejects connection when no token is provided", () => {
    const socket = mockSocket(undefined);
    const [next, captured] = mockNext();

    authMiddleware(socket as any, next);

    expect(captured).toHaveLength(1);
    expect(captured[0]).toBeInstanceOf(Error);
    expect(captured[0]!.message).toBe("Authentication required");
  });

  it("rejects connection when token is an empty string", () => {
    const socket = mockSocket("");
    const [next, captured] = mockNext();

    authMiddleware(socket as any, next);

    expect(captured).toHaveLength(1);
    expect(captured[0]).toBeInstanceOf(Error);
  });

  it("rejects connection when token is invalid", () => {
    const socket = mockSocket("this-is-not-a-valid-jwt");
    const [next, captured] = mockNext();

    authMiddleware(socket as any, next);

    expect(captured).toHaveLength(1);
    expect(captured[0]).toBeInstanceOf(Error);
    expect(captured[0]!.message).toBe("Invalid or expired token");
  });

  it("rejects connection when token is expired", () => {
    // Sign a token that is already expired
    const expiredToken = jwt.sign(
      { userId: "test-user", email: "test@example.com" },
      "pokelike-reborn-dev-secret-key-2026",
      { expiresIn: "0s" },
    );
    const socket = mockSocket(expiredToken);
    const [next, captured] = mockNext();

    authMiddleware(socket as any, next);

    expect(captured).toHaveLength(1);
    expect(captured[0]).toBeInstanceOf(Error);
    expect(captured[0]!.message).toBe("Invalid or expired token");
  });

  it("allows connection when token is valid and attaches user data", () => {
    const validToken = jwt.sign(
      { userId: "test-user-123", email: "test@pokelike.com" },
      config.jwtSecret,
      { expiresIn: "1h" },
    );
    const socket = mockSocket(validToken);
    const [next, captured] = mockNext();

    authMiddleware(socket, next);

    // Should pass without error
    expect(captured).toHaveLength(1);
    expect(captured[0]).toBeUndefined();

    // User payload should be attached to socket data
    expect(socket.data).toHaveProperty("user");
    expect(socket.data.user.userId).toBe("test-user-123");
    expect(socket.data.user.email).toBe("test@pokelike.com");
  });

  it("rejects connection when token is not a string (e.g. number)", () => {
    const socket: any = {
      handshake: {
        auth: { token: 12345 },
      },
      data: {},
    };
    const [next, captured] = mockNext();

    authMiddleware(socket, next);

    expect(captured).toHaveLength(1);
    expect(captured[0]).toBeInstanceOf(Error);
    expect(captured[0]!.message).toBe("Authentication required");
  });
});
