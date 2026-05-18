/**
 * Socket.io JWT handshake middleware.
 *
 * Validates that every incoming socket connection carries a valid JWT
 * in the `auth.token` handshake field. Connections without a token or
 * with an invalid/expired token are rejected before any event handlers
 * are registered.
 *
 * @module
 */

import type { Socket } from "socket.io";
import { verifyToken } from "../routes/auth.js";

/**
 * Middleware function for Socket.io `io.use()`.
 *
 * Extracts the token from `socket.handshake.auth.token`, verifies it
 * using the same JWT secret as the REST API, and attaches the decoded
 * payload to `socket.data.user` for downstream access.
 *
 * @param socket - The connecting socket.
 * @param next   - Callback to proceed or reject the connection.
 */
export function authMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): void {
  const token = socket.handshake.auth.token;

  if (!token || typeof token !== "string") {
    return next(new Error("Authentication required"));
  }

  const payload = verifyToken(token);

  if (!payload) {
    return next(new Error("Invalid or expired token"));
  }

  // Make user info available to downstream handlers
  socket.data.user = payload;
  next();
}
