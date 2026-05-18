/**
 * @fileoverview Barrel exports for the game mode rules module.
 *
 * Re-exports all rule interfaces, implementations, and the
 * `createModeRules()` factory for convenient importing.
 *
 * @module rules
 */

import type { GameMode } from "../types";
import type { ModeRules } from "./ModeRules";
import { NormalRules } from "./NormalRules";
import { NuzlockeRules } from "./NuzlockeRules";
import { BattleTowerRules } from "./BattleTowerRules";

// ─── Re-exports ────────────────────────────────────────────────────────────────

export type { ModeRules } from "./ModeRules";
export { NormalRules } from "./NormalRules";
export { NuzlockeRules } from "./NuzlockeRules";
export { BattleTowerRules } from "./BattleTowerRules";
export type { TowerBattleResult } from "./BattleTowerRules";
export { createAreaTracker } from "./areaTracking";
export type { AreaTracker } from "./areaTracking";

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
