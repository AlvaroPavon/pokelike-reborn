/**
 * Persistent MVP user store.
 *
 * This module intentionally uses a small JSON file instead of a real database.
 * It gives Phase 3 durable auth/profile/multiplayer stats while keeping the
 * deployment footprint tiny. Replace this with SQLite/Postgres before public
 * production traffic.
 *
 * @module
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { config } from "../config.js";

/** Minimal ranked multiplayer stats stored in the user profile. */
export interface MultiplayerStats {
  wins: number;
  losses: number;
  rank: number;
  lastBattleAt: number | null;
}

/** Internal user record stored by the MVP auth layer. */
export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  gameState: Record<string, unknown>;
  multiplayerStats: MultiplayerStats;
}

interface UserStoreFile {
  users: User[];
}

export interface UserStoreOptions {
  filePath?: string;
  persist?: boolean;
}

export function createInitialMultiplayerStats(): MultiplayerStats {
  return {
    wins: 0,
    losses: 0,
    rank: 1000,
    lastBattleAt: null,
  };
}

export class UserStore {
  private readonly users = new Map<string, User>();
  private readonly filePath: string;
  private readonly persist: boolean;

  constructor(options: UserStoreOptions = {}) {
    this.filePath = resolve(options.filePath ?? config.userStorePath);
    this.persist = options.persist ?? process.env.NODE_ENV !== "test";
    this.load();
  }

  get(userId: string): User | undefined {
    return this.users.get(userId);
  }

  values(): IterableIterator<User> {
    return this.users.values();
  }

  findByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  set(user: User): void {
    this.users.set(user.userId, user);
    this.save();
  }

  update(userId: string, updater: (user: User) => User): User | undefined {
    const current = this.users.get(userId);
    if (!current) return undefined;
    const next = updater(current);
    this.users.set(userId, next);
    this.save();
    return next;
  }

  clear(): void {
    this.users.clear();
    this.save();
  }

  snapshot(): User[] {
    return [...this.users.values()].map((user) => ({ ...user }));
  }

  private load(): void {
    if (!this.persist || !existsSync(this.filePath)) return;

    const raw = readFileSync(this.filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<UserStoreFile>;

    for (const user of parsed.users ?? []) {
      this.users.set(user.userId, {
        ...user,
        multiplayerStats: user.multiplayerStats ?? createInitialMultiplayerStats(),
        gameState: user.gameState ?? {},
      });
    }
  }

  private save(): void {
    if (!this.persist) return;

    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(
      this.filePath,
      JSON.stringify({ users: this.snapshot() } satisfies UserStoreFile, null, 2),
      "utf8",
    );
  }
}

export const userStore = new UserStore();
