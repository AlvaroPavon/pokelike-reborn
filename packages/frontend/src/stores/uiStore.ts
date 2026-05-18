import { create } from "zustand";
import type { BattleLogEntry, PokemonInstance, ItemOption } from "@pokelike/core";

export type ScreenId =
  | "title"
  | "trainer_select"
  | "starter_select"
  | "map"
  | "battle"
  | "catch"
  | "item"
  | "game_over"
  | "win"
  | "pokedex"
  | "pokemon_detail"
  | "battle_tower"
  | "profile"
  | "lobby";

export type MultiplayerStatus = "idle" | "searching" | "matched" | "battle" | "result" | "error";

export interface MultiplayerBattleResult {
  roomId: string;
  winnerUserId: string | null;
  loserUserId: string | null;
}

export interface UIStateStore {
  currentScreen: ScreenId;
  modalOpen: string | null;
  battleLog: BattleLogEntry[];
  battleAnimating: boolean;
  multiplayerStatus: MultiplayerStatus;
  multiplayerResult: MultiplayerBattleResult | null;
  mapZoom: number;
  mapPan: { x: number; y: number };

  /** Transient data for cross-screen navigation */
  battleEnemyTeam: PokemonInstance[] | null;
  battleNodeType: string | null;
  catchChoices: PokemonInstance[];
  itemChoices: ItemOption[];

  /** Selected Pokémon species ID for the detail screen */
  selectedPokemonId: string | null;

  navigate: (screen: ScreenId) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  setMapZoom: (zoom: number) => void;
  setMapPan: (pan: { x: number; y: number }) => void;
  setBattleLog: (log: BattleLogEntry[]) => void;
  appendBattleLog: (entry: BattleLogEntry) => void;
  setBattleAnimating: (animating: boolean) => void;
  setMultiplayerStatus: (status: MultiplayerStatus) => void;
  setMultiplayerResult: (result: MultiplayerBattleResult | null) => void;

  /** Set battle data before navigating to battle screen */
  setBattleData: (enemyTeam: PokemonInstance[], nodeType?: string) => void;
  /** Set catch choices before navigating to catch screen */
  setCatchData: (choices: PokemonInstance[]) => void;
  /** Set item choices before navigating to item screen */
  setItemData: (choices: ItemOption[]) => void;

  /** Set the selected Pokémon for the detail screen */
  setSelectedPokemonId: (id: string | null) => void;
}

export const useUIStore = create<UIStateStore>()((set) => ({
  currentScreen: "title",
  modalOpen: null,
  battleLog: [],
  battleAnimating: false,
  multiplayerStatus: "idle",
  multiplayerResult: null,
  mapZoom: 1,
  mapPan: { x: 0, y: 0 },

  // Transient data
  battleEnemyTeam: null,
  battleNodeType: null,
  catchChoices: [],
  itemChoices: [],
  selectedPokemonId: null,

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

  setBattleLog: (log: BattleLogEntry[]) => {
    set({ battleLog: log });
  },

  appendBattleLog: (entry: BattleLogEntry) => {
    set((state) => ({ battleLog: [...state.battleLog, entry] }));
  },

  setBattleAnimating: (animating: boolean) => {
    set({ battleAnimating: animating });
  },

  setMultiplayerStatus: (status: MultiplayerStatus) => {
    set({ multiplayerStatus: status });
  },

  setMultiplayerResult: (result: MultiplayerBattleResult | null) => {
    set({ multiplayerResult: result });
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

  setSelectedPokemonId: (id: string | null) => {
    set({ selectedPokemonId: id });
  },
}));
