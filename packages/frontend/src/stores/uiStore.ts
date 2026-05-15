import { create } from "zustand";
import type { BattleLogEntry } from "@pokelike/core";

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

  navigate: (screen: ScreenId) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  setMapZoom: (zoom: number) => void;
  setMapPan: (pan: { x: number; y: number }) => void;
}

export const useUIStore = create<UIStateStore>()((set) => ({
  currentScreen: "title",
  modalOpen: null,
  battleLog: [],
  battleAnimating: false,
  mapZoom: 1,
  mapPan: { x: 0, y: 0 },

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
}));
