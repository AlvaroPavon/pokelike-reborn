/**
 * @fileoverview Battle engine — deterministic auto-battle simulation.
 *
 * Relocated from `packages/frontend/src/game/helpers.ts` as part of the
 * battle engine migration. Integrates with the core type effectiveness
 * chart (`typeChart.ts`) instead of maintaining a duplicate table.
 *
 * All functions are pure — no side effects, no global state.
 * Same inputs (teams + seed) always produce identical outputs.
 *
 * @module battle
 */

import { SeededRNG } from "../utils/prng.js";
import { getEffectiveness } from "../data/typeChart.js";
import type { Move, BaseStats, PokemonInstance, BattleLogEntry, BattleResult } from "../types/index.js";
import { PokemonType as PT } from "../types/index.js";
import type { BattleOptions, SpeciesEntry } from "./types.js";
import { SPECIES } from "./database.js";

// ─── Stat Calculation ─────────────────────────────────────────────────────────

/**
 * Calculate a single stat value using the standard Pokemon formula.
 *
 * @param base  - Base stat value for the species.
 * @param iv    - Individual Value (0-31).
 * @param ev    - Effort Value.
 * @param level - Current level.
 * @param isHp  - Whether this is the HP stat (uses different formula).
 * @returns The calculated stat value.
 */
export function calcStat(
  base: number,
  iv: number,
  ev: number,
  level: number,
  isHp: boolean,
): number {
  const stat = Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100);
  if (isHp) return stat + level + 10;
  return stat + 5;
}

// ─── Move Helpers ─────────────────────────────────────────────────────────────

/**
 * Get the moves a species knows at a given level.
 * Returns the top 4 moves by level (or "struggle" if none).
 */
export function getMovesForLevel(
  species: SpeciesEntry,
  level: number,
): import("../types/index.js").MoveInstance[] {
  const available = species.movePool.filter((m) => m.level <= level);
  const picked = available.slice(-4);
  if (picked.length === 0) {
    return [
      {
        moveId: "struggle",
        currentPp: 999,
        maxPp: 999,
      },
    ];
  }
  return picked.map((m) => ({
    moveId: m.move.name.toLowerCase().replace(/\s+/g, "_"),
    currentPp: 30,
    maxPp: 30,
  }));
}

/**
 * Look up a Move definition for a species + moveId combination.
 */
export function getSpeciesMove(
  speciesId: string,
  moveId: string,
): Move | undefined {
  const species = SPECIES[speciesId];
  if (!species) return undefined;
  const entry = species.movePool.find(
    (m) => m.move.name.toLowerCase().replace(/\s+/g, "_") === moveId,
  );
  return entry?.move;
}

// ─── Pokemon Factory ──────────────────────────────────────────────────────────

/**
 * Create a Pokemon instance for a given species and level.
 * Uses deterministic IVs if no RNG is provided.
 */
export function makeGymMon(
  speciesId: string,
  level: number,
  rng?: SeededRNG,
): PokemonInstance {
  const species = SPECIES[speciesId];
  if (!species) throw new Error(`Unknown species: ${speciesId}`);

  const base = species.baseStats;
  const ivs: BaseStats = {
    hp: rng ? rng.randomInt(0, 31) : 15,
    atk: rng ? rng.randomInt(0, 31) : 15,
    def: rng ? rng.randomInt(0, 31) : 15,
    spa: rng ? rng.randomInt(0, 31) : 15,
    spd: rng ? rng.randomInt(0, 31) : 15,
    spe: rng ? rng.randomInt(0, 31) : 15,
  };
  const evs: BaseStats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const stats: BaseStats = {
    hp: calcStat(base.hp, ivs.hp, evs.hp, level, true),
    atk: calcStat(base.atk, ivs.atk, evs.atk, level, false),
    def: calcStat(base.def, ivs.def, evs.def, level, false),
    spa: calcStat(base.spa, ivs.spa, evs.spa, level, false),
    spd: calcStat(base.spd, ivs.spd, evs.spd, level, false),
    spe: calcStat(base.spe, ivs.spe, evs.spe, level, false),
  };

  const moves = getMovesForLevel(species, level);

  return {
    speciesId: species.id,
    level,
    currentHp: stats.hp,
    maxHp: stats.hp,
    ivs,
    evs,
    stats,
    moves,
    trainerId: "gym",
    fainted: false,
    status: null,
  };
}

/**
 * Convenience wrapper for creating a Pokemon instance.
 * Delegates to makeGymMon with the same signature.
 */
export function createPokemonInstance(
  speciesId: string,
  level: number,
  rng?: SeededRNG,
): PokemonInstance {
  return makeGymMon(speciesId, level, rng);
}

// ─── Type Effectiveness ───────────────────────────────────────────────────────

/**
 * Calculate type effectiveness multiplier for an attack against a defender,
 * looking up the defender's species types from the SPECIES registry.
 */
function getTypeEffectiveness(
  attackType: PT,
  defender: PokemonInstance,
): number {
  const species = SPECIES[defender.speciesId];
  if (!species) return 1;
  return getEffectiveness(attackType, species.types);
}

// ─── Attack Execution ─────────────────────────────────────────────────────────

/**
 * Execute a single attack and return whether the defender fainted.
 */
export function executeAttack(
  attacker: PokemonInstance,
  defender: PokemonInstance,
  turn: number,
  log: BattleLogEntry[],
  side: "player" | "enemy",
  rng: SeededRNG,
): boolean {
  const attackerName = attacker.nickname ?? attacker.speciesId;
  const defenderName = defender.nickname ?? defender.speciesId;

  // Pick a random move the attacker knows
  const moveInstance = rng.randomElement(attacker.moves);
  let move: Move | undefined;

  if (moveInstance) {
    move = getSpeciesMove(attacker.speciesId, moveInstance.moveId);
  }

  if (!move || move.power === 0) {
    // No damaging move available, do minimal damage
    const dmg = rng.randomInt(1, 5);
    defender.currentHp = Math.max(0, defender.currentHp - dmg);

    const moveName = move?.name ?? "struggle";
    log.push({
      turn,
      side,
      action: "attack",
      message: `${attackerName} used ${moveName}!`,
      damage: dmg,
      target: defenderName,
    });

    if (defender.currentHp <= 0) {
      defender.fainted = true;
      defender.currentHp = 0;
      log.push({
        turn,
        side,
        action: "faint",
        message: `${defenderName} fainted!`,
        target: defenderName,
      });
      return true;
    }
    return false;
  }

  // Calculate STAB
  const attackerSpecies = SPECIES[attacker.speciesId];
  const stab = attackerSpecies?.types.includes(move.type) ? 1.5 : 1.0;

  // Calculate damage using simplified Gen 5 formula
  const atkStat = move.isSpecial ? attacker.stats.spa : attacker.stats.atk;
  const defStat = move.isSpecial ? defender.stats.spd : defender.stats.def;

  const levelFactor = (2 * attacker.level) / 5 + 2;
  const atkDefRatio = atkStat / Math.max(defStat, 1);
  const baseDamage = ((levelFactor * move.power * atkDefRatio) / 50 + 2);

  // Random factor 0.85 - 1.0
  const randomFactor = 0.85 + rng.random() * 0.15;

  // Type effectiveness (using core typeChart)
  const typeEffectiveness = getTypeEffectiveness(move.type, defender);

  const totalDamage = Math.max(
    1,
    Math.floor(baseDamage * stab * randomFactor * typeEffectiveness),
  );

  defender.currentHp = Math.max(0, defender.currentHp - totalDamage);

  let message = `${attackerName} used ${move.name}!`;
  if (typeEffectiveness >= 2) message += " It's super effective!";
  else if (typeEffectiveness > 0 && typeEffectiveness < 1) message += " It's not very effective...";
  else if (typeEffectiveness === 0) message += " It has no effect...";

  log.push({
    turn,
    side,
    action: "attack",
    message,
    damage: totalDamage,
    target: defenderName,
  });

  if (defender.currentHp <= 0) {
    defender.fainted = true;
    defender.currentHp = 0;
    log.push({
      turn,
      side,
      action: "faint",
      message: `${defenderName} fainted!`,
      target: defenderName,
    });
    return true;
  }

  return false;
}

// ─── Battle Simulation ────────────────────────────────────────────────────────

/**
 * Simulate an auto-battle between two teams.
 *
 * The simulation is **deterministic**: given the same teams and the same RNG
 * seed, it always produces the exact same result. This is critical for
 * reproducible battles, replays, and server-authoritative multiplayer.
 *
 * @param playerTeam - The player's team of Pokemon.
 * @param enemyTeam  - The enemy's team of Pokemon.
 * @param rng        - A seeded PRNG instance for deterministic randomness.
 * @param options    - Optional battle configuration (e.g. max turns).
 * @returns The complete battle result including logs and final team states.
 */
export function simulateBattle(
  playerTeam: PokemonInstance[],
  enemyTeam: PokemonInstance[],
  rng: SeededRNG,
  options?: BattleOptions,
): BattleResult {
  // Deep clone (with a simple JSON round-trip since these are plain objects)
  const player = structuredClone(playerTeam);
  const enemy = structuredClone(enemyTeam);

  const log: BattleLogEntry[] = [];
  let turn = 0;

  const MAX_TURNS = options?.maxTurns ?? 100;

  while (turn < MAX_TURNS) {
    turn++;
    const pActive = player.find((p) => !p.fainted);
    const eActive = enemy.find((p) => !p.fainted);

    if (!pActive) {
      log.push({
        turn,
        side: "system",
        action: "result",
        message: "All your Pokemon have fainted!",
      });
      break;
    }

    if (!eActive) {
      log.push({
        turn,
        side: "system",
        action: "result",
        message: "All enemy Pokemon have fainted!",
      });
      break;
    }

    // Determine turn order by speed
    const playerFirst = pActive.stats.spe >= eActive.stats.spe;

    // First attacker
    const first = playerFirst
      ? { attacker: pActive, defender: eActive, side: "player" as const }
      : { attacker: eActive, defender: pActive, side: "enemy" as const };
    // Second attacker
    const second = playerFirst
      ? { attacker: eActive, defender: pActive, side: "enemy" as const }
      : { attacker: pActive, defender: eActive, side: "player" as const };

    // Execute first attack
    const firstKilled = executeAttack(first.attacker, first.defender, turn, log, first.side, rng);
    if (firstKilled) {
      // Check if the defeated side is fully wiped
      const targetTeam = first.side === "player" ? enemy : player;
      const nextActive = targetTeam.find((p) => !p.fainted);
      if (!nextActive) {
        log.push({
          turn,
          side: "system",
          action: "result",
          message:
            first.side === "player"
              ? "The enemy team was defeated!"
              : "Your team was defeated!",
        });
        break;
      }
      // Log the switch
      log.push({
        turn,
        side: "system",
        action: "switch",
        message: `${first.side === "player" ? "Enemy" : "Your"} sent out ${nextActive.nickname ?? nextActive.speciesId}!`,
      });
    }

    // Execute second attack (if both sides still have active Pokemon)
    const secondActive = player.find((p) => !p.fainted);
    const secondEnemyActive = enemy.find((p) => !p.fainted);
    if (secondActive && secondEnemyActive) {
      const secondKilled = executeAttack(
        second.attacker,
        second.defender,
        turn,
        log,
        second.side,
        rng,
      );
      if (secondKilled) {
        const targetTeam = second.side === "player" ? enemy : player;
        const nextActive = targetTeam.find((p) => !p.fainted);
        if (!nextActive) {
          log.push({
            turn,
            side: "system",
            action: "result",
            message:
              second.side === "player"
                ? "The enemy team was defeated!"
                : "Your team was defeated!",
          });
          break;
        }
        log.push({
          turn,
          side: "system",
          action: "switch",
          message: `${second.side === "player" ? "Enemy" : "Your"} sent out ${nextActive.nickname ?? nextActive.speciesId}!`,
        });
      }
    }
  }

  // Determine winner
  const playerWon = enemy.every((p) => p.fainted);
  const playerLost = player.every((p) => p.fainted);
  const winner: "player" | "enemy" | "draw" = playerWon
    ? "player"
    : playerLost
      ? "enemy"
      : "draw";

  return {
    winner,
    log,
    finalPlayerTeam: player,
    finalEnemyTeam: enemy,
    seedUsed: rng.randomInt(1, 999999),
  };
}

// ─── Level Gain ───────────────────────────────────────────────────────────────

/**
 * Apply level gains to participating Pokemon after a battle victory.
 * Returns the updated team.
 */
export function applyLevelGain(
  team: PokemonInstance[],
  participantIdxs: number[],
  baseGain: number,
  rng?: SeededRNG,
): PokemonInstance[] {
  return team.map((p, i) => {
    if (!participantIdxs.includes(i)) return p;
    const gain = participantIdxs.length > 0
      ? baseGain + Math.floor((rng ? rng.random() : Math.random()) * 3)
      : 0;
    if (gain <= 0) return p;
    const newLevel = p.level + Math.ceil(gain / 10);
    if (newLevel <= p.level) return p;

    // Level up: recalculate stats
    const species = SPECIES[p.speciesId];
    if (!species) return p;

    const newStats: BaseStats = {
      hp: calcStat(species.baseStats.hp, p.ivs.hp, p.evs.hp, newLevel, true),
      atk: calcStat(species.baseStats.atk, p.ivs.atk, p.evs.atk, newLevel, false),
      def: calcStat(species.baseStats.def, p.ivs.def, p.evs.def, newLevel, false),
      spa: calcStat(species.baseStats.spa, p.ivs.spa, p.evs.spa, newLevel, false),
      spd: calcStat(species.baseStats.spd, p.ivs.spd, p.evs.spd, newLevel, false),
      spe: calcStat(species.baseStats.spe, p.ivs.spe, p.evs.spe, newLevel, false),
    };

    const hpGain = newStats.hp - p.stats.hp;

    return {
      ...p,
      level: newLevel,
      stats: newStats,
      currentHp: Math.min(newStats.hp, p.currentHp + hpGain),
      maxHp: newStats.hp,
      moves: getMovesForLevel(species, newLevel),
    };
  });
}

// ─── Evolution ────────────────────────────────────────────────────────────────

/**
 * Check if a Pokemon is able to evolve based on its level.
 */
export function canEvolve(pokemon: PokemonInstance): boolean {
  const species = SPECIES[pokemon.speciesId];
  if (!species) return false;
  if (!species.evolvesTo || species.evolvesAt === 0) return false;
  return pokemon.level >= species.evolvesAt;
}

/**
 * Resolve the evolution of a Pokemon, returning the evolved instance.
 */
export function resolveEvolution(pokemon: PokemonInstance): PokemonInstance {
  const species = SPECIES[pokemon.speciesId];
  if (!species || !species.evolvesTo) return pokemon;

  const evolved = SPECIES[species.evolvesTo];
  if (!evolved) return pokemon;

  // Recalculate stats for evolved form
  const newStats: BaseStats = {
    hp: calcStat(evolved.baseStats.hp, pokemon.ivs.hp, pokemon.evs.hp, pokemon.level, true),
    atk: calcStat(evolved.baseStats.atk, pokemon.ivs.atk, pokemon.evs.atk, pokemon.level, false),
    def: calcStat(evolved.baseStats.def, pokemon.ivs.def, pokemon.evs.def, pokemon.level, false),
    spa: calcStat(evolved.baseStats.spa, pokemon.ivs.spa, pokemon.evs.spa, pokemon.level, false),
    spd: calcStat(evolved.baseStats.spd, pokemon.ivs.spd, pokemon.evs.spd, pokemon.level, false),
    spe: calcStat(evolved.baseStats.spe, pokemon.ivs.spe, pokemon.evs.spe, pokemon.level, false),
  };

  return {
    ...pokemon,
    speciesId: evolved.id,
    maxHp: newStats.hp,
    currentHp: newStats.hp, // Full heal on evolution
    stats: newStats,
    moves: getMovesForLevel(evolved, pokemon.level),
  };
}

/**
 * Walk backwards through the evolution chain to find the root species.
 */
export function getEvoLineRoot(speciesId: string): string {
  const species = SPECIES[speciesId];
  if (!species) return speciesId;

  // Walk backwards to find the root
  let current = speciesId;
  for (const [id, entry] of Object.entries(SPECIES)) {
    if (entry.evolvesTo === current) {
      current = id;
      break;
    }
  }
  return current;
}
