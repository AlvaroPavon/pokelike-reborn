import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createInitialMultiplayerStats, UserStore } from "../store/userStore.js";

describe("UserStore", () => {
  let tempDir: string | null = null;

  afterEach(() => {
    if (tempDir) rmSync(tempDir, { recursive: true, force: true });
    tempDir = null;
  });

  it("persists users to disk and reloads them", () => {
    tempDir = mkdtempSync(join(tmpdir(), "pokelike-users-"));
    const filePath = join(tempDir, "users.json");

    const store = new UserStore({ filePath, persist: true });
    store.set({
      userId: "u1",
      email: "remote@example.com",
      passwordHash: "hash",
      createdAt: 1,
      gameState: { floor: 3 },
      multiplayerStats: createInitialMultiplayerStats(),
    });

    const reloaded = new UserStore({ filePath, persist: true });

    expect(reloaded.get("u1")?.email).toBe("remote@example.com");
    expect(reloaded.get("u1")?.gameState).toEqual({ floor: 3 });
  });

  it("updates multiplayer stats durably", () => {
    tempDir = mkdtempSync(join(tmpdir(), "pokelike-users-"));
    const filePath = join(tempDir, "users.json");
    const store = new UserStore({ filePath, persist: true });

    store.set({
      userId: "u1",
      email: "a@example.com",
      passwordHash: "hash",
      createdAt: 1,
      gameState: {},
      multiplayerStats: createInitialMultiplayerStats(),
    });
    store.update("u1", (user) => ({
      ...user,
      multiplayerStats: { ...user.multiplayerStats, wins: 1, rank: 1015 },
    }));

    expect(new UserStore({ filePath, persist: true }).get("u1")?.multiplayerStats).toMatchObject({
      wins: 1,
      rank: 1015,
    });
  });
});
