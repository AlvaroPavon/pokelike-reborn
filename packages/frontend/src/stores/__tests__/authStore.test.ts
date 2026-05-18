/**
 * @fileoverview Tests for the Zustand auth store.
 *
 * Covers token hydration from persist storage, login/register/logout
 * actions, and proper sync of the token to the api utility.
 *
 * @module
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../authStore";
import { getApiToken } from "../../utils/api";

// ─── Mocks ───────────────────────────────────────────────────────────────

// Mock the api utility so tests don't make real HTTP calls
vi.mock("../../utils/api", async () => {
  const actual = await vi.importActual<typeof import("../../utils/api")>(
    "../../utils/api",
  );

  return {
    ...actual,
    registerUser: vi.fn(),
    loginUser: vi.fn(),
  };
});

import { registerUser, loginUser } from "../../utils/api";

// ─── Helpers ─────────────────────────────────────────────────────────────

/**
 * Set up localStorage with mock persist data as Zustand persist would store it.
 * This simulates a previously authenticated session surviving a page reload.
 */
function seedPersistAuth(
  token: string,
  user: { userId: string; email: string; createdAt: number },
): void {
  localStorage.setItem(
    "pokelike-auth-store",
    JSON.stringify({
      state: { token, user },
      version: 0,
    }),
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe("authStore", () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store to logged-out state and clear the API token
    useAuthStore.getState().logout();
    vi.clearAllMocks();
  });

  describe("hydration from persist storage", () => {
    it("hydrates token from localStorage on rehydrate", async () => {
      const testUser = {
        userId: "test-user-001",
        email: "test@example.com",
        createdAt: 1715000000000,
      };

      seedPersistAuth("persisted-jwt-token-abc", testUser);

      // Trigger rehydration from the seeded localStorage
      await useAuthStore.persist.rehydrate();

      const state = useAuthStore.getState();
      expect(state.token).toBe("persisted-jwt-token-abc");
      expect(state.user).toEqual(testUser);
    });

    it("syncs token to api utility after hydration", async () => {
      const testUser = {
        userId: "test-user-002",
        email: "sync-test@example.com",
        createdAt: 1715000000000,
      };

      seedPersistAuth("sync-test-token-xyz", testUser);

      // Before rehydration, getApiToken should return null
      expect(getApiToken()).toBeNull();

      await useAuthStore.persist.rehydrate();

      // After rehydration, the onRehydrateStorage callback should have set the token
      expect(getApiToken()).toBe("sync-test-token-xyz");
    });

    it("remains logged out when no persist data exists", async () => {
      // localStorage is already cleared in beforeEach
      await useAuthStore.persist.rehydrate();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(getApiToken()).toBeNull();
    });


  });

  describe("login action", () => {
    it("sets token and user on successful login", async () => {
      const mockResponse = {
        token: "login-token-123",
        user: {
          userId: "user-abc",
          email: "alice@example.com",
          createdAt: 1715000000000,
        },
      };
      vi.mocked(loginUser).mockResolvedValue(mockResponse);

      await useAuthStore.getState().login("alice@example.com", "pass123");

      const state = useAuthStore.getState();
      expect(state.token).toBe("login-token-123");
      expect(state.user?.email).toBe("alice@example.com");
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("syncs token to api utility after login", async () => {
      const mockResponse = {
        token: "api-sync-token",
        user: {
          userId: "user-xyz",
          email: "bob@example.com",
          createdAt: 1715000000000,
        },
      };
      vi.mocked(loginUser).mockResolvedValue(mockResponse);

      expect(getApiToken()).toBeNull();

      await useAuthStore.getState().login("bob@example.com", "pass456");

      expect(getApiToken()).toBe("api-sync-token");
    });

    it("sets error on login failure", async () => {
      vi.mocked(loginUser).mockRejectedValue({ error: "Invalid email or password" });

      await expect(
        useAuthStore.getState().login("wrong@example.com", "badpass"),
      ).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.error).toBe("Invalid email or password");
      expect(state.loading).toBe(false);
    });
  });

  describe("register action", () => {
    it("registers then auto-logs in", async () => {
      const registerMock = vi.mocked(registerUser);
      registerMock.mockResolvedValue({ userId: "new-user-001" });

      const loginMock = vi.mocked(loginUser);
      loginMock.mockResolvedValue({
        token: "post-register-token",
        user: {
          userId: "new-user-001",
          email: "newuser@example.com",
          createdAt: 1715000000000,
        },
      });

      await useAuthStore.getState().register("newuser@example.com", "mypass");

      // Should have called register then login
      expect(registerMock).toHaveBeenCalledWith("newuser@example.com", "mypass");
      expect(loginMock).toHaveBeenCalledWith("newuser@example.com", "mypass");

      const state = useAuthStore.getState();
      expect(state.token).toBe("post-register-token");
      expect(state.user?.userId).toBe("new-user-001");
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("sets error on registration failure", async () => {
      vi.mocked(registerUser).mockRejectedValue({ error: "Email already registered" });

      await expect(
        useAuthStore.getState().register("existing@example.com", "pass"),
      ).rejects.toThrow();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.error).toBe("Email already registered");
      expect(state.loading).toBe(false);
    });
  });

  describe("logout action", () => {
    it("clears token, user, and api token", async () => {
      // Simulate being logged in
      useAuthStore.setState({
        token: "some-token",
        user: {
          userId: "user-id",
          email: "test@example.com",
          createdAt: 1000,
        },
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(getApiToken()).toBeNull();
    });
  });

  describe("clearError action", () => {
    it("clears the error state", () => {
      useAuthStore.setState({ error: "Something went wrong" });
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
