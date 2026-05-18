/**
 * @fileoverview Zustand store for authentication state.
 *
 * Manages the JWT token and user profile, providing login, register, and
 * logout actions. The token is persisted via Zustand persist middleware so
 * it survives page reloads. On hydration, the token is synced to the api
 * utility so outgoing fetch calls automatically attach the Authorization header.
 *
 * @module authStore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginUser,
  registerUser,
  setApiToken,
  type LoginResponse,
} from "../utils/api";

// ─── Types ───────────────────────────────────────────────────────────────

/** User object as returned by the login endpoint. */
export interface AuthUser {
  userId: string;
  email: string;
  createdAt: number;
}

/** Shape of the auth store state and actions. */
export interface AuthStateStore {
  /** JWT token for authenticated requests. Null when logged out. */
  token: string | null;
  /** Current authenticated user profile. Null when logged out. */
  user: AuthUser | null;
  /** Whether an auth operation is in progress. */
  loading: boolean;
  /** Most recent error message, if any. */
  error: string | null;

  /** Register a new account, then auto-login. */
  register: (email: string, password: string) => Promise<void>;
  /** Log in with existing credentials. */
  login: (email: string, password: string) => Promise<void>;
  /** Log out — clear token, user, and API token. */
  logout: () => void;
  /** Clear any stored error. */
  clearError: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStateStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      loading: false,
      error: null,

      register: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          await registerUser(email, password);

          // Auto-login after successful registration
          const result: LoginResponse = await loginUser(email, password);
          setApiToken(result.token);
          set({
            token: result.token,
            user: result.user,
            loading: false,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            err && typeof err === "object" && "error" in err
              ? (err as { error: string }).error
              : "Registration failed";
          set({ loading: false, error: message });
          throw err;
        }
      },

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const result: LoginResponse = await loginUser(email, password);
          setApiToken(result.token);
          set({
            token: result.token,
            user: result.user,
            loading: false,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            err && typeof err === "object" && "error" in err
              ? (err as { error: string }).error
              : "Login failed";
          set({ loading: false, error: message });
          throw err;
        }
      },

      logout: () => {
        setApiToken(null);
        set({
          token: null,
          user: null,
          loading: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "pokelike-auth-store",
      // Only persist the token and user — not loading state or transient errors
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      // On rehydration, sync the persisted token back to the api utility
      onRehydrateStorage: () => {
        return (state, _error) => {
          if (state?.token) {
            setApiToken(state.token);
          }
        };
      },
    },
  ),
);
