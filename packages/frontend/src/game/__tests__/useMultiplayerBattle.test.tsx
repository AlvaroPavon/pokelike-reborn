import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PokemonInstance } from "@pokelike/core";
import { useMultiplayerBattle } from "../hooks/useMultiplayerBattle";
import { useAuthStore } from "../../stores/authStore";
import { useGameStore } from "../../stores/gameStore";
import { useUIStore } from "../../stores/uiStore";

const handlers = new Map<string, (payload?: unknown) => void>();
const emit = vi.fn();
const disconnect = vi.fn();

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    connected: true,
    on: (event: string, handler: (payload?: unknown) => void) => {
      handlers.set(event, handler);
    },
    emit,
    disconnect,
  })),
}));

const mon: PokemonInstance = {
  speciesId: "pikachu",
  level: 50,
  currentHp: 120,
  maxHp: 120,
  ivs: { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 },
  evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  stats: { hp: 120, atk: 80, def: 70, spa: 90, spd: 80, spe: 100 },
  moves: [],
  trainerId: "u1",
  fainted: false,
  status: null,
};

describe("useMultiplayerBattle", () => {
  beforeEach(() => {
    handlers.clear();
    emit.mockClear();
    disconnect.mockClear();
    useAuthStore.setState({ token: null, user: null, loading: false, error: null });
    useGameStore.setState({ team: [] });
    useUIStore.setState({
      currentScreen: "title",
      battleEnemyTeam: null,
      battleNodeType: null,
      battleLog: [],
      battleAnimating: false,
      multiplayerStatus: "idle",
      multiplayerResult: null,
    });
  });

  it("requires authentication before joining queue", () => {
    const { result } = renderHook(() => useMultiplayerBattle());

    act(() => result.current.joinQueue());

    expect(result.current.error).toBe("Login required for multiplayer");
    expect(emit).not.toHaveBeenCalled();
  });

  it("handles battle:start by storing teams and navigating to battle", () => {
    useAuthStore.setState({
      token: "token",
      user: { userId: "u1", email: "a@b.com", createdAt: 1 },
      loading: false,
      error: null,
    });
    const { result } = renderHook(() => useMultiplayerBattle());

    act(() => result.current.joinQueue());
    act(() => {
      handlers.get("battle:start")?.({
        roomId: "battle:1",
        team: [mon],
        opponentTeam: [{ ...mon, speciesId: "eevee", trainerId: "u2" }],
      });
    });

    expect(useGameStore.getState().team[0]?.speciesId).toBe("pikachu");
    expect(useUIStore.getState().battleEnemyTeam?.[0]?.speciesId).toBe("eevee");
    expect(useUIStore.getState().battleNodeType).toBe("MULTIPLAYER");
    expect(useUIStore.getState().currentScreen).toBe("battle");
  });
});
