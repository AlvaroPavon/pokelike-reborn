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
export type { SpeciesEntry } from "./data/speciesList.js";
export { speciesList, speciesMap, getSpeciesByNumber, getSpeciesById, getEvolutionChain, searchSpecies, TOTAL_SPECIES } from "./data/speciesList.js";
export * from "./pokedex/types.js";
export * from "./rules/index.js";
export type { Team, BattleOptions, ItemOption } from "./battle/index.js";
export { SPECIES, ITEM_POOL } from "./battle/index.js";
export { simulateBattle, executeAttack, makeGymMon, calcStat, getMovesForLevel, getSpeciesMove, createPokemonInstance, applyLevelGain, canEvolve, resolveEvolution, getEvoLineRoot } from "./battle/index.js";
export { generateTowerEncounter, calculateTowerLevel, calculateTowerTeamSize, getNextOpponent } from "./battle/towerGenerator.js";
export type { ModeRules } from "./rules/ModeRules.js";
export type { AreaTracker } from "./rules/areaTracking.js";
export type { TowerBattleResult } from "./rules/BattleTowerRules.js";
