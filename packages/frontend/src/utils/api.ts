/**
 * @fileoverview HTTP API client with JWT authentication support.
 *
 * Provides a thin wrapper around `fetch` that automatically attaches the
 * stored JWT token to every request, and exposes typed helpers for the
 * Pokelike Reborn auth and profile endpoints.
 *
 * The base URL defaults to the same origin (proxied by Vite dev server)
 * and can be overridden via the `POKELIKE_API_BASE` environment variable.
 *
 * @module api
 */

// ─── Configuration ───────────────────────────────────────────────────────

/** Base URL for the game server API. */
export const API_BASE = (import.meta as { env?: { VITE_API_BASE?: string } })
  .env?.VITE_API_BASE ?? "";

// ─── Token store (lightweight alternative to importing authStore) ────────

/**
 * Internal token holder. Updated by authStore on login/register and cleared
 * on logout. The api utility reads from here to avoid circular dependencies
 * between api.ts and authStore.ts.
 */
let _currentToken: string | null = null;

/** Set the active JWT token for outgoing requests. */
export function setApiToken(token: string | null): void {
  _currentToken = token;
}

/** Get the current JWT token without importing authStore. */
export function getApiToken(): string | null {
  return _currentToken;
}

// ─── Typed HTTP helpers ─────────────────────────────────────────────────

/** Standard API error shape returned by the server. */
export interface ApiError {
  error: string;
}

/**
 * Enhanced fetch wrapper that:
 *  1. Attaches `Authorization: Bearer <token>` when a token is available.
 *  2. Sets `Content-Type: application/json` for POST/PUT requests.
 *  3. Throws on non-OK responses so callers can catch and handle errors.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (_currentToken) {
    headers["Authorization"] = `Bearer ${_currentToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw body as ApiError;
  }

  // 204 No Content responses have no body
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// ─── Auth API helpers ────────────────────────────────────────────────────

/** Shape returned by POST /api/auth/register. */
export interface RegisterResponse {
  userId: string;
}

/** Shape returned by POST /api/auth/login. */
export interface LoginResponse {
  token: string;
  user: {
    userId: string;
    email: string;
    createdAt: number;
  };
}

/** User profile object returned by GET /api/user/profile. */
export interface UserProfile {
  userId: string;
  email: string;
  createdAt: number;
}

/** Shape returned by GET /api/user/profile. */
export interface ProfileResponse {
  profile: UserProfile;
  gameState: Record<string, unknown>;
}

/** Shape returned by PUT /api/user/profile/state. */
export interface StateUpdateResponse {
  success: boolean;
}

/** Register a new user account. */
export function registerUser(
  email: string,
  password: string,
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** Log in with existing credentials. */
export function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** Fetch the authenticated user's profile and game state. */
export function fetchProfile(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/api/user/profile");
}

/** Update the authenticated user's game state (full replace/upsert). */
export function updateGameState(
  gameState: Record<string, unknown>,
): Promise<StateUpdateResponse> {
  return apiFetch<StateUpdateResponse>("/api/user/profile/state", {
    method: "PUT",
    body: JSON.stringify({ gameState }),
  });
}
