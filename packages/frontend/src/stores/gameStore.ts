import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameMode, PokemonInstance, ItemInstance } from "@pokelike/core";

export interface GameStateStore {
  // State
  mode: GameMode | null;
  team: PokemonInstance[];
  items: ItemInstance[];
  badges: string[];
  currentMapIndex: number;
  currentNodeId: string | null;
  runSeed: number | null;
  trainer: "boy" | "girl" | null;

  // Actions
  startNewRun: (mode: GameMode) => void;
  selectTrainer: (gender: "boy" | "girl") => void;
  selectStarter: (pokemon: PokemonInstance) => void;
  addToTeam: (pokemon: PokemonInstance) => void;
  removeFromTeam: (index: number) => void;
  addItem: (item: ItemInstance) => void;
  earnBadge: (badgeId: string) => void;
  setCurrentNode: (nodeId: string) => void;
  healTeam: () => void;
  endRun: () => void;
  saveGame: () => void;
  loadGame: () => boolean;
  clearSave: () => void;
}

const initialState = {
  mode: null as GameMode | null,
  team: [] as PokemonInstance[],
  items: [] as ItemInstance[],
  badges: [] as string[],
  currentMapIndex: 0,
  currentNodeId: null as string | null,
  runSeed: null as number | null,
  trainer: null as "boy" | "girl" | null,
};

export const useGameStore = create<GameStateStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startNewRun: (mode: GameMode) => {
        set({
          ...initialState,
          mode,
          runSeed: Date.now(),
          currentMapIndex: 0,
        });
      },

      selectTrainer: (gender: "boy" | "girl") => {
        set({ trainer: gender });
      },

      selectStarter: (pokemon: PokemonInstance) => {
        set({ team: [pokemon] });
      },

      addToTeam: (pokemon: PokemonInstance) => {
        const { team } = get();
        if (team.length >= 6) {
          console.warn("Team is full — cannot add more Pokemon");
          return;
        }
        set({ team: [...team, pokemon] });
      },

      removeFromTeam: (index: number) => {
        const { team } = get();
        if (index < 0 || index >= team.length) {
          console.warn("Invalid team index:", index);
          return;
        }
        set({ team: team.filter((_, i) => i !== index) });
      },

      addItem: (item: ItemInstance) => {
        const { items } = get();
        const existing = items.find((i) => i.itemId === item.itemId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.itemId === item.itemId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      earnBadge: (badgeId: string) => {
        const { badges } = get();
        if (!badges.includes(badgeId)) {
          set({ badges: [...badges, badgeId] });
        }
      },

      setCurrentNode: (nodeId: string) => {
        set({ currentNodeId: nodeId });
      },

      healTeam: () => {
        const { team } = get();
        set({
          team: team.map((p) => ({
            ...p,
            currentHp: p.maxHp,
            fainted: false,
            status: null,
          })),
        });
      },

      endRun: () => {
        set({ ...initialState });
      },

      saveGame: () => {
        // persist middleware handles actual persistence
        // this action exists for explicit save points
        localStorage.setItem("pokelike-save-timestamp", Date.now().toString());
      },

      loadGame: () => {
        // The persist middleware auto-rehydrates on store creation
        // This returns whether there's saved data
        const state = get();
        return state.mode !== null;
      },

      clearSave: () => {
        localStorage.removeItem("pokelike-game-state");
        set({ ...initialState });
      },
    }),
    {
      name: "pokelike-game-state",
      partialize: (state) => ({
        mode: state.mode,
        team: state.team,
        items: state.items,
        badges: state.badges,
        currentMapIndex: state.currentMapIndex,
        currentNodeId: state.currentNodeId,
        runSeed: state.runSeed,
        trainer: state.trainer,
      }),
    },
  ),
);
