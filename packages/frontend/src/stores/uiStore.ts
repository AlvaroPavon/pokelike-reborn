import { create } from "zustand";
import type { BattleLogEntry, PokemonInstance } from "@pokelike/core";
import type { ItemOption } from "../game/helpers";

export type ScreenId =
  | "title"
  | "trainer_select"
  | "starter_select"
  | "map"
  | "battle"
  | "catch"
  | "item"
  | "game_over"
  | "win";

export interface UIStateStore {
  currentScreen: ScreenId;
  modalOpen: string | null;
  battleLog: BattleLogEntry[];
  battleAnimating: boolean;
  mapZoom: number;
  mapPan: { x: number; y: number };

  /** Transient data for cross-screen navigation */
  battleEnemyTeam: PokemonInstance[] | null;
  battleNodeType: string | null;
  catchChoices: PokemonInstance[];
  itemChoices: ItemOption[];

  navigate: (screen: ScreenId) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  setMapZoom: (zoom: number) => void;
  setMapPan: (pan: { x: number; y: number }) => void;

  /** Set battle data before navigating to battle screen */
  setBattleData: (enemyTeam: PokemonInstance[], nodeType?: string) => void;
  /** Set catch choices before navigating to catch screen */
  setCatchData: (choices: PokemonInstance[]) => void;
  /** Set item choices before navigating to item screen */
  setItemData: (choices: ItemOption[]) => void;
}

export const useUIStore = create<UIStateStore>()((set) => ({
  currentScreen: "title",
  modalOpen: null,
  battleLog: [],
  battleAnimating: false,
  mapZoom: 1,
  mapPan: { x: 0, y: 0 },

  // Transient data
  battleEnemyTeam: null,
  battleNodeType: null,
  catchChoices: [],
  itemChoices: [],

  navigate: (screen: ScreenId) => {
    set({ currentScreen: screen, modalOpen: null });
  },

  openModal: (modal: string) => {
    set({ modalOpen: modal });
  },

  closeModal: () => {
    set({ modalOpen: null });
  },

  setMapZoom: (zoom: number) => {
    set({ mapZoom: Math.max(0.25, Math.min(4, zoom)) });
  },

  setMapPan: (pan: { x: number; y: number }) => {
    set({ mapPan: pan });
  },

  setBattleData: (enemyTeam: PokemonInstance[], nodeType?: string) => {
    set({ battleEnemyTeam: enemyTeam, battleNodeType: nodeType ?? null });
  },

  setCatchData: (choices: PokemonInstance[]) => {
    set({ catchChoices: choices });
  },

  setItemData: (choices: ItemOption[]) => {
    set({ itemChoices: choices });
  },
}));
