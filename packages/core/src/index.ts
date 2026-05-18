/**
 * @pokelike/core — Core game engine package
 *
 * This package provides the foundational types, utilities, and data
 * for the Pokelike Reborn game. It has zero runtime dependencies.
 *
 * @module
 */

export * from "./types/index.js";
export * from "./utils/prng.js";
export * from "./data/typeChart.js";
export * from "./data/speciesList.js";
export * from "./pokedex/types.js";
export * from "./rules/index.js";
export * from "./battle/towerGenerator.js";
export type { ModeRules } from "./rules/ModeRules.js";
export type { AreaTracker } from "./rules/areaTracking.js";
export type { TowerBattleResult } from "./rules/BattleTowerRules.js";
