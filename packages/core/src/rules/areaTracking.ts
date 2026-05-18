/**
 * @fileoverview Area encounter tracker for Nuzlocke mode.
 *
 * The Nuzlocke rule restricts captures to the first encounter per area.
 * This helper provides a `Set<string>`-backed tracker that records which
 * area IDs have already been visited, so the mode rule can block
 * repeat encounters.
 *
 * @module rules
 */

/**
 * Area encounter tracker.
 *
 * Tracks which areas have had their first encounter, enabling
 * the Nuzlocke "first encounter per area" restriction.
 */
export interface AreaTracker {
  /** Read-only view of the encountered area set. */
  readonly encounteredAreas: ReadonlySet<string>;

  /**
   * Check if an area already had its first encounter.
   * @param areaId - The area identifier to check.
   * @returns `true` if an encounter was already registered for this area.
   */
  hasEncountered(areaId: string): boolean;

  /**
   * Register an encounter for the given area.
   * @param areaId - The area identifier to mark as encountered.
   */
  registerEncounter(areaId: string): void;

  /**
   * Reset all tracking (for a new game run).
   */
  reset(): void;
}

/**
 * Create a new `AreaTracker` instance with an empty encountered set.
 *
 * Each game run should create its own tracker so that Nuzlocke
 * encounter tracking is scoped per run.
 *
 * @returns A new `AreaTracker` instance.
 */
export function createAreaTracker(): AreaTracker {
  const encounteredAreas = new Set<string>();

  return {
    get encounteredAreas(): ReadonlySet<string> {
      return encounteredAreas;
    },

    hasEncountered(areaId: string): boolean {
      return encounteredAreas.has(areaId);
    },

    registerEncounter(areaId: string): void {
      encounteredAreas.add(areaId);
    },

    reset(): void {
      encounteredAreas.clear();
    },
  };
}
