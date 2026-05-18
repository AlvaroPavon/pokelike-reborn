/**
 * @fileoverview Barrel exports for the game mode rules module.
 *
 * Re-exports all rule interfaces, implementations, and the
 * `createModeRules()` factory for convenient importing.
 *
 * @module rules
 */

import type { GameMode } from "../types/index.js";
import type { ModeRules } from "./ModeRules.js";
import { NormalRules } from "./NormalRules.js";
import { NuzlockeRules } from "./NuzlockeRules.js";
import { BattleTowerRules } from "./BattleTowerRules.js";

// ─── Re-exports ────────────────────────────────────────────────────────────────

export type { ModeRules } from "./ModeRules.js";
export { NormalRules } from "./NormalRules.js";
export { NuzlockeRules } from "./NuzlockeRules.js";
export { BattleTowerRules } from "./BattleTowerRules.js";
export type { TowerBattleResult } from "./BattleTowerRules.js";
export { createAreaTracker } from "./areaTracking.js";
export type { AreaTracker } from "./areaTracking.js";

// ─── Factory ───────────────────────────────────────────────────────────────────

/**
 * Create the appropriate `ModeRules` implementation for the given game mode.
 *
 * @param mode - The active game mode.
 * @returns A `ModeRules` instance matching the mode.
 *
 * | Mode          | Implementation     |
 * |---------------|--------------------|
 * | `normal`      | `NormalRules`      |
 * | `nuzlocke`    | `NuzlockeRules`    |
 * | `battle_tower`| `BattleTowerRules` |
 */
export function createModeRules(mode: GameMode): ModeRules {
  switch (mode) {
    case "nuzlocke":
      return new NuzlockeRules();
    case "battle_tower":
      return new BattleTowerRules();
    case "normal":
    default:
      return new NormalRules();
  }
}
