/**
 * @fileoverview Game database: species definitions and item pool.
 *
 * Relocated from `packages/frontend/src/game/helpers.ts` as part of the
 * battle engine migration. Contains the simplified species registry with
 * move pools used by the battle simulator, and the item pool for item
 * choice nodes.
 *
 * @module battle
 */

import { PokemonType as PT } from "../types/index.js";
import type { SpeciesEntry, ItemOption } from "./types.js";

// ─── Species Database ─────────────────────────────────────────────────────────

/**
 * Simplified species registry used by the battle engine.
 *
 * Contains species data sufficient for stat calculation, STAB,
 * move lookup, and evolution. Unlike the full dex (`speciesList.ts`),
 * this includes level-up move pools and evolution thresholds.
 */
export const SPECIES: Record<string, SpeciesEntry> = {
  bulbasaur: {
    id: "bulbasaur",
    name: "Bulbasaur",
    types: [PT.Grass, PT.Poison],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    evolvesAt: 16,
    evolvesTo: "ivysaur",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "A tackle" } },
      { level: 1, move: { name: "Growl", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Growl" } },
      { level: 7, move: { name: "Vine Whip", power: 45, type: PT.Grass, isSpecial: true, category: "special", description: "Whips with vines" } },
      { level: 13, move: { name: "Poison Powder", power: 0, type: PT.Poison, isSpecial: false, category: "status", description: "Poison powder" } },
      { level: 20, move: { name: "Razor Leaf", power: 55, type: PT.Grass, isSpecial: true, category: "special", description: "Sharp leaves" } },
      { level: 27, move: { name: "Growth", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Growth" } },
      { level: 34, move: { name: "Sleep Powder", power: 0, type: PT.Grass, isSpecial: false, category: "status", description: "Sleep powder" } },
      { level: 41, move: { name: "Solar Beam", power: 120, type: PT.Grass, isSpecial: true, category: "special", description: "Solar beam" } },
    ],
  },
  ivysaur: {
    id: "ivysaur", name: "Ivysaur", types: [PT.Grass, PT.Poison],
    baseStats: { hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60 },
    evolvesAt: 32, evolvesTo: "venusaur",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "A tackle" } },
      { level: 1, move: { name: "Vine Whip", power: 45, type: PT.Grass, isSpecial: true, category: "special", description: "Vine whip" } },
      { level: 20, move: { name: "Razor Leaf", power: 55, type: PT.Grass, isSpecial: true, category: "special", description: "Razor leaf" } },
      { level: 31, move: { name: "Sweet Scent", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Sweet scent" } },
      { level: 41, move: { name: "Solar Beam", power: 120, type: PT.Grass, isSpecial: true, category: "special", description: "Solar beam" } },
    ],
  },
  venusaur: {
    id: "venusaur", name: "Venusaur", types: [PT.Grass, PT.Poison],
    baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 1, move: { name: "Razor Leaf", power: 55, type: PT.Grass, isSpecial: true, category: "special", description: "Razor leaf" } },
      { level: 32, move: { name: "Petal Dance", power: 120, type: PT.Grass, isSpecial: true, category: "special", description: "Petal dance" } },
      { level: 53, move: { name: "Solar Beam", power: 120, type: PT.Grass, isSpecial: true, category: "special", description: "Solar beam" } },
    ],
  },
  charmander: {
    id: "charmander", name: "Charmander", types: [PT.Fire],
    baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    evolvesAt: 16, evolvesTo: "charmeleon",
    movePool: [
      { level: 1, move: { name: "Scratch", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Scratches" } },
      { level: 1, move: { name: "Growl", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Growl" } },
      { level: 7, move: { name: "Ember", power: 40, type: PT.Fire, isSpecial: true, category: "special", description: "Ember" } },
      { level: 13, move: { name: "Smokescreen", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Smokescreen" } },
      { level: 19, move: { name: "Dragon Rage", power: 40, type: PT.Dragon, isSpecial: true, category: "special", description: "Dragon rage" } },
      { level: 25, move: { name: "Scary Face", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Scary face" } },
      { level: 34, move: { name: "Flamethrower", power: 90, type: PT.Fire, isSpecial: true, category: "special", description: "Flamethrower" } },
      { level: 43, move: { name: "Fire Spin", power: 35, type: PT.Fire, isSpecial: true, category: "special", description: "Fire spin" } },
    ],
  },
  charmeleon: {
    id: "charmeleon", name: "Charmeleon", types: [PT.Fire],
    baseStats: { hp: 58, atk: 64, def: 58, spa: 80, spd: 65, spe: 80 },
    evolvesAt: 36, evolvesTo: "charizard",
    movePool: [
      { level: 1, move: { name: "Scratch", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Scratch" } },
      { level: 1, move: { name: "Ember", power: 40, type: PT.Fire, isSpecial: true, category: "special", description: "Ember" } },
      { level: 20, move: { name: "Rage", power: 20, type: PT.Normal, isSpecial: false, category: "physical", description: "Rage" } },
      { level: 36, move: { name: "Flamethrower", power: 90, type: PT.Fire, isSpecial: true, category: "special", description: "Flamethrower" } },
    ],
  },
  charizard: {
    id: "charizard", name: "Charizard", types: [PT.Fire, PT.Flying],
    baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Scratch", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Scratch" } },
      { level: 1, move: { name: "Ember", power: 40, type: PT.Fire, isSpecial: true, category: "special", description: "Ember" } },
      { level: 36, move: { name: "Flamethrower", power: 90, type: PT.Fire, isSpecial: true, category: "special", description: "Flamethrower" } },
      { level: 46, move: { name: "Fire Blast", power: 110, type: PT.Fire, isSpecial: true, category: "special", description: "Fire blast" } },
      { level: 55, move: { name: "Heat Wave", power: 95, type: PT.Fire, isSpecial: true, category: "special", description: "Heat wave" } },
    ],
  },
  squirtle: {
    id: "squirtle", name: "Squirtle", types: [PT.Water],
    baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    evolvesAt: 16, evolvesTo: "wartortle",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 1, move: { name: "Tail Whip", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Tail whip" } },
      { level: 7, move: { name: "Water Gun", power: 40, type: PT.Water, isSpecial: true, category: "special", description: "Water gun" } },
      { level: 13, move: { name: "Bubble", power: 40, type: PT.Water, isSpecial: true, category: "special", description: "Bubble" } },
      { level: 19, move: { name: "Bite", power: 60, type: PT.Dark, isSpecial: false, category: "physical", description: "Bite" } },
      { level: 25, move: { name: "Protect", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Protect" } },
      { level: 34, move: { name: "Rain Dance", power: 0, type: PT.Water, isSpecial: false, category: "status", description: "Rain dance" } },
      { level: 43, move: { name: "Hydro Pump", power: 110, type: PT.Water, isSpecial: true, category: "special", description: "Hydro pump" } },
    ],
  },
  wartortle: {
    id: "wartortle", name: "Wartortle", types: [PT.Water],
    baseStats: { hp: 59, atk: 63, def: 80, spa: 65, spd: 80, spe: 58 },
    evolvesAt: 36, evolvesTo: "blastoise",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 1, move: { name: "Water Gun", power: 40, type: PT.Water, isSpecial: true, category: "special", description: "Water gun" } },
      { level: 20, move: { name: "Bite", power: 60, type: PT.Dark, isSpecial: false, category: "physical", description: "Bite" } },
      { level: 36, move: { name: "Hydro Pump", power: 110, type: PT.Water, isSpecial: true, category: "special", description: "Hydro pump" } },
    ],
  },
  blastoise: {
    id: "blastoise", name: "Blastoise", types: [PT.Water],
    baseStats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 1, move: { name: "Water Gun", power: 40, type: PT.Water, isSpecial: true, category: "special", description: "Water gun" } },
      { level: 36, move: { name: "Hydro Pump", power: 110, type: PT.Water, isSpecial: true, category: "special", description: "Hydro pump" } },
      { level: 46, move: { name: "Skull Bash", power: 130, type: PT.Normal, isSpecial: false, category: "physical", description: "Skull bash" } },
    ],
  },
  caterpie: {
    id: "caterpie", name: "Caterpie", types: [PT.Bug],
    baseStats: { hp: 45, atk: 30, def: 35, spa: 20, spd: 20, spe: 45 },
    evolvesAt: 7, evolvesTo: "metapod",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 1, move: { name: "String Shot", power: 0, type: PT.Bug, isSpecial: false, category: "status", description: "String shot" } },
    ],
  },
  metapod: {
    id: "metapod", name: "Metapod", types: [PT.Bug],
    baseStats: { hp: 50, atk: 20, def: 55, spa: 25, spd: 25, spe: 30 },
    evolvesAt: 10, evolvesTo: "butterfree",
    movePool: [
      { level: 1, move: { name: "Harden", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Harden" } },
    ],
  },
  butterfree: {
    id: "butterfree", name: "Butterfree", types: [PT.Bug, PT.Flying],
    baseStats: { hp: 60, atk: 45, def: 50, spa: 90, spd: 80, spe: 70 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Confusion", power: 50, type: PT.Psychic, isSpecial: true, category: "special", description: "Confusion" } },
      { level: 12, move: { name: "Sleep Powder", power: 0, type: PT.Grass, isSpecial: false, category: "status", description: "Sleep powder" } },
      { level: 16, move: { name: "Gust", power: 40, type: PT.Flying, isSpecial: true, category: "special", description: "Gust" } },
    ],
  },
  pidgey: {
    id: "pidgey", name: "Pidgey", types: [PT.Normal, PT.Flying],
    baseStats: { hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 },
    evolvesAt: 18, evolvesTo: "pidgeotto",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 5, move: { name: "Gust", power: 40, type: PT.Flying, isSpecial: true, category: "special", description: "Gust" } },
      { level: 9, move: { name: "Quick Attack", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Quick attack" } },
    ],
  },
  pidgeotto: {
    id: "pidgeotto", name: "Pidgeotto", types: [PT.Normal, PT.Flying],
    baseStats: { hp: 63, atk: 60, def: 55, spa: 50, spd: 50, spe: 71 },
    evolvesAt: 36, evolvesTo: "pidgeot",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 1, move: { name: "Gust", power: 40, type: PT.Flying, isSpecial: true, category: "special", description: "Gust" } },
      { level: 21, move: { name: "Wing Attack", power: 60, type: PT.Flying, isSpecial: false, category: "physical", description: "Wing attack" } },
    ],
  },
  pidgeot: {
    id: "pidgeot", name: "Pidgeot", types: [PT.Normal, PT.Flying],
    baseStats: { hp: 83, atk: 80, def: 75, spa: 70, spd: 70, spe: 101 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Gust", power: 40, type: PT.Flying, isSpecial: true, category: "special", description: "Gust" } },
      { level: 1, move: { name: "Quick Attack", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Quick attack" } },
      { level: 38, move: { name: "Whirlwind", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Whirlwind" } },
    ],
  },
  rattata: {
    id: "rattata", name: "Rattata", types: [PT.Normal],
    baseStats: { hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 },
    evolvesAt: 20, evolvesTo: "raticate",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 1, move: { name: "Tail Whip", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Tail whip" } },
      { level: 7, move: { name: "Quick Attack", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Quick attack" } },
      { level: 14, move: { name: "Hyper Fang", power: 80, type: PT.Normal, isSpecial: false, category: "physical", description: "Hyper fang" } },
    ],
  },
  raticate: {
    id: "raticate", name: "Raticate", types: [PT.Normal],
    baseStats: { hp: 55, atk: 81, def: 60, spa: 50, spd: 70, spe: 97 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Quick Attack", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Quick attack" } },
      { level: 14, move: { name: "Hyper Fang", power: 80, type: PT.Normal, isSpecial: false, category: "physical", description: "Hyper fang" } },
    ],
  },
  pikachu: {
    id: "pikachu", name: "Pikachu", types: [PT.Electric],
    baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Thunder Shock", power: 40, type: PT.Electric, isSpecial: true, category: "special", description: "Thunder shock" } },
      { level: 1, move: { name: "Growl", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Growl" } },
      { level: 6, move: { name: "Tail Whip", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Tail whip" } },
      { level: 10, move: { name: "Quick Attack", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Quick attack" } },
      { level: 18, move: { name: "Thunder Wave", power: 0, type: PT.Electric, isSpecial: false, category: "status", description: "Thunder wave" } },
      { level: 26, move: { name: "Thunderbolt", power: 90, type: PT.Electric, isSpecial: true, category: "special", description: "Thunderbolt" } },
      { level: 42, move: { name: "Thunder", power: 110, type: PT.Electric, isSpecial: true, category: "special", description: "Thunder" } },
    ],
  },
  sandshrew: {
    id: "sandshrew", name: "Sandshrew", types: [PT.Ground],
    baseStats: { hp: 50, atk: 75, def: 85, spa: 20, spd: 30, spe: 40 },
    evolvesAt: 22, evolvesTo: "sandslash",
    movePool: [
      { level: 1, move: { name: "Scratch", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Scratch" } },
      { level: 6, move: { name: "Sand Attack", power: 0, type: PT.Ground, isSpecial: false, category: "status", description: "Sand attack" } },
      { level: 11, move: { name: "Poison Sting", power: 15, type: PT.Poison, isSpecial: false, category: "physical", description: "Poison sting" } },
    ],
  },
  sandslash: {
    id: "sandslash", name: "Sandslash", types: [PT.Ground],
    baseStats: { hp: 75, atk: 100, def: 110, spa: 45, spd: 55, spe: 65 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Scratch", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Scratch" } },
      { level: 17, move: { name: "Slash", power: 70, type: PT.Normal, isSpecial: false, category: "physical", description: "Slash" } },
      { level: 27, move: { name: "Dig", power: 80, type: PT.Ground, isSpecial: false, category: "physical", description: "Dig" } },
    ],
  },
  jigglypuff: {
    id: "jigglypuff", name: "Jigglypuff", types: [PT.Normal, PT.Fairy],
    baseStats: { hp: 115, atk: 45, def: 20, spa: 45, spd: 25, spe: 20 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Sing", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Sing" } },
      { level: 5, move: { name: "Pound", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Pound" } },
      { level: 9, move: { name: "Disable", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Disable" } },
    ],
  },
  zubat: {
    id: "zubat", name: "Zubat", types: [PT.Poison, PT.Flying],
    baseStats: { hp: 40, atk: 45, def: 35, spa: 30, spd: 40, spe: 55 },
    evolvesAt: 22, evolvesTo: "golbat",
    movePool: [
      { level: 1, move: { name: "Leech Life", power: 20, type: PT.Bug, isSpecial: false, category: "physical", description: "Leech life" } },
      { level: 6, move: { name: "Supersonic", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Supersonic" } },
      { level: 12, move: { name: "Bite", power: 60, type: PT.Dark, isSpecial: false, category: "physical", description: "Bite" } },
    ],
  },
  golbat: {
    id: "golbat", name: "Golbat", types: [PT.Poison, PT.Flying],
    baseStats: { hp: 75, atk: 80, def: 70, spa: 65, spd: 75, spe: 90 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Bite", power: 60, type: PT.Dark, isSpecial: false, category: "physical", description: "Bite" } },
      { level: 16, move: { name: "Wing Attack", power: 60, type: PT.Flying, isSpecial: false, category: "physical", description: "Wing attack" } },
      { level: 28, move: { name: "Poison Fang", power: 50, type: PT.Poison, isSpecial: false, category: "physical", description: "Poison fang" } },
    ],
  },
  geodude: {
    id: "geodude", name: "Geodude", types: [PT.Rock, PT.Ground],
    baseStats: { hp: 40, atk: 80, def: 100, spa: 30, spd: 30, spe: 20 },
    evolvesAt: 25, evolvesTo: "graveler",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 6, move: { name: "Defense Curl", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Defense curl" } },
      { level: 11, move: { name: "Rock Throw", power: 50, type: PT.Rock, isSpecial: false, category: "physical", description: "Rock throw" } },
      { level: 21, move: { name: "Self-Destruct", power: 200, type: PT.Normal, isSpecial: false, category: "physical", description: "Self-destruct" } },
    ],
  },
  graveler: {
    id: "graveler", name: "Graveler", types: [PT.Rock, PT.Ground],
    baseStats: { hp: 55, atk: 95, def: 115, spa: 45, spd: 45, spe: 35 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Rock Throw", power: 50, type: PT.Rock, isSpecial: false, category: "physical", description: "Rock throw" } },
      { level: 21, move: { name: "Self-Destruct", power: 200, type: PT.Normal, isSpecial: false, category: "physical", description: "Self-destruct" } },
      { level: 36, move: { name: "Earthquake", power: 100, type: PT.Ground, isSpecial: false, category: "physical", description: "Earthquake" } },
    ],
  },
  growlithe: {
    id: "growlithe", name: "Growlithe", types: [PT.Fire],
    baseStats: { hp: 55, atk: 70, def: 45, spa: 70, spd: 50, spe: 60 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Bite", power: 60, type: PT.Dark, isSpecial: false, category: "physical", description: "Bite" } },
      { level: 1, move: { name: "Roar", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Roar" } },
      { level: 8, move: { name: "Ember", power: 40, type: PT.Fire, isSpecial: true, category: "special", description: "Ember" } },
      { level: 18, move: { name: "Flame Wheel", power: 60, type: PT.Fire, isSpecial: false, category: "physical", description: "Flame wheel" } },
      { level: 30, move: { name: "Flamethrower", power: 90, type: PT.Fire, isSpecial: true, category: "special", description: "Flamethrower" } },
    ],
  },
  abra: {
    id: "abra", name: "Abra", types: [PT.Psychic],
    baseStats: { hp: 25, atk: 20, def: 15, spa: 105, spd: 55, spe: 90 },
    evolvesAt: 16, evolvesTo: "kadabra",
    movePool: [
      { level: 1, move: { name: "Teleport", power: 0, type: PT.Psychic, isSpecial: false, category: "status", description: "Teleport" } },
    ],
  },
  kadabra: {
    id: "kadabra", name: "Kadabra", types: [PT.Psychic],
    baseStats: { hp: 40, atk: 35, def: 30, spa: 120, spd: 70, spe: 105 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Confusion", power: 50, type: PT.Psychic, isSpecial: true, category: "special", description: "Confusion" } },
      { level: 16, move: { name: "Psybeam", power: 65, type: PT.Psychic, isSpecial: true, category: "special", description: "Psybeam" } },
      { level: 21, move: { name: "Recover", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Recover" } },
      { level: 31, move: { name: "Psychic", power: 90, type: PT.Psychic, isSpecial: true, category: "special", description: "Psychic" } },
    ],
  },
  machop: {
    id: "machop", name: "Machop", types: [PT.Fighting],
    baseStats: { hp: 70, atk: 80, def: 50, spa: 35, spd: 35, spe: 35 },
    evolvesAt: 28, evolvesTo: "machoke",
    movePool: [
      { level: 1, move: { name: "Karate Chop", power: 50, type: PT.Fighting, isSpecial: false, category: "physical", description: "Karate chop" } },
      { level: 1, move: { name: "Low Kick", power: 40, type: PT.Fighting, isSpecial: false, category: "physical", description: "Low kick" } },
      { level: 10, move: { name: "Seismic Toss", power: 40, type: PT.Fighting, isSpecial: false, category: "physical", description: "Seismic toss" } },
    ],
  },
  machoke: {
    id: "machoke", name: "Machoke", types: [PT.Fighting],
    baseStats: { hp: 80, atk: 100, def: 70, spa: 50, spd: 60, spe: 45 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Karate Chop", power: 50, type: PT.Fighting, isSpecial: false, category: "physical", description: "Karate chop" } },
      { level: 28, move: { name: "Submission", power: 80, type: PT.Fighting, isSpecial: false, category: "physical", description: "Submission" } },
      { level: 38, move: { name: "Cross Chop", power: 100, type: PT.Fighting, isSpecial: false, category: "physical", description: "Cross chop" } },
    ],
  },
  bellsprout: {
    id: "bellsprout", name: "Bellsprout", types: [PT.Grass, PT.Poison],
    baseStats: { hp: 50, atk: 75, def: 35, spa: 70, spd: 30, spe: 40 },
    evolvesAt: 21, evolvesTo: "weepinbell",
    movePool: [
      { level: 1, move: { name: "Vine Whip", power: 45, type: PT.Grass, isSpecial: true, category: "special", description: "Vine whip" } },
      { level: 6, move: { name: "Growth", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Growth" } },
      { level: 11, move: { name: "Wrap", power: 15, type: PT.Normal, isSpecial: false, category: "physical", description: "Wrap" } },
    ],
  },
  weepinbell: {
    id: "weepinbell", name: "Weepinbell", types: [PT.Grass, PT.Poison],
    baseStats: { hp: 65, atk: 90, def: 50, spa: 85, spd: 45, spe: 55 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Vine Whip", power: 45, type: PT.Grass, isSpecial: true, category: "special", description: "Vine whip" } },
      { level: 22, move: { name: "Razor Leaf", power: 55, type: PT.Grass, isSpecial: true, category: "special", description: "Razor leaf" } },
    ],
  },
  tentacool: {
    id: "tentacool", name: "Tentacool", types: [PT.Water, PT.Poison],
    baseStats: { hp: 40, atk: 40, def: 35, spa: 50, spd: 100, spe: 70 },
    evolvesAt: 30, evolvesTo: "tentacruel",
    movePool: [
      { level: 1, move: { name: "Bubble", power: 40, type: PT.Water, isSpecial: true, category: "special", description: "Bubble" } },
      { level: 7, move: { name: "Poison Sting", power: 15, type: PT.Poison, isSpecial: false, category: "physical", description: "Poison sting" } },
    ],
  },
  tentacruel: {
    id: "tentacruel", name: "Tentacruel", types: [PT.Water, PT.Poison],
    baseStats: { hp: 80, atk: 70, def: 65, spa: 80, spd: 120, spe: 100 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Bubble", power: 40, type: PT.Water, isSpecial: true, category: "special", description: "Bubble" } },
      { level: 22, move: { name: "Water Pulse", power: 60, type: PT.Water, isSpecial: true, category: "special", description: "Water pulse" } },
      { level: 36, move: { name: "Hydro Pump", power: 110, type: PT.Water, isSpecial: true, category: "special", description: "Hydro pump" } },
    ],
  },
  ponyta: {
    id: "ponyta", name: "Ponyta", types: [PT.Fire],
    baseStats: { hp: 50, atk: 85, def: 55, spa: 65, spd: 65, spe: 90 },
    evolvesAt: 40, evolvesTo: "rapidash",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 5, move: { name: "Tail Whip", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Tail whip" } },
      { level: 10, move: { name: "Ember", power: 40, type: PT.Fire, isSpecial: true, category: "special", description: "Ember" } },
      { level: 20, move: { name: "Flame Wheel", power: 60, type: PT.Fire, isSpecial: false, category: "physical", description: "Flame wheel" } },
      { level: 35, move: { name: "Fire Blast", power: 110, type: PT.Fire, isSpecial: true, category: "special", description: "Fire blast" } },
    ],
  },
  rapidash: {
    id: "rapidash", name: "Rapidash", types: [PT.Fire],
    baseStats: { hp: 65, atk: 100, def: 70, spa: 80, spd: 80, spe: 105 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Ember", power: 40, type: PT.Fire, isSpecial: true, category: "special", description: "Ember" } },
      { level: 20, move: { name: "Flame Wheel", power: 60, type: PT.Fire, isSpecial: false, category: "physical", description: "Flame wheel" } },
      { level: 40, move: { name: "Fire Blast", power: 110, type: PT.Fire, isSpecial: true, category: "special", description: "Fire blast" } },
    ],
  },
  slowpoke: {
    id: "slowpoke", name: "Slowpoke", types: [PT.Water, PT.Psychic],
    baseStats: { hp: 90, atk: 65, def: 65, spa: 40, spd: 40, spe: 15 },
    evolvesAt: 37, evolvesTo: "slowbro",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 6, move: { name: "Growl", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Growl" } },
      { level: 12, move: { name: "Water Gun", power: 40, type: PT.Water, isSpecial: true, category: "special", description: "Water gun" } },
      { level: 22, move: { name: "Confusion", power: 50, type: PT.Psychic, isSpecial: true, category: "special", description: "Confusion" } },
    ],
  },
  slowbro: {
    id: "slowbro", name: "Slowbro", types: [PT.Water, PT.Psychic],
    baseStats: { hp: 95, atk: 75, def: 110, spa: 100, spd: 80, spe: 30 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Water Gun", power: 40, type: PT.Water, isSpecial: true, category: "special", description: "Water gun" } },
      { level: 22, move: { name: "Confusion", power: 50, type: PT.Psychic, isSpecial: true, category: "special", description: "Confusion" } },
      { level: 37, move: { name: "Psychic", power: 90, type: PT.Psychic, isSpecial: true, category: "special", description: "Psychic" } },
    ],
  },
  magnemite: {
    id: "magnemite", name: "Magnemite", types: [PT.Electric, PT.Steel],
    baseStats: { hp: 25, atk: 35, def: 70, spa: 95, spd: 55, spe: 45 },
    evolvesAt: 30, evolvesTo: "magneton",
    movePool: [
      { level: 1, move: { name: "Thunder Shock", power: 40, type: PT.Electric, isSpecial: true, category: "special", description: "Thunder shock" } },
      { level: 6, move: { name: "Supersonic", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Supersonic" } },
      { level: 11, move: { name: "Sonic Boom", power: 40, type: PT.Normal, isSpecial: true, category: "special", description: "Sonic boom" } },
    ],
  },
  magneton: {
    id: "magneton", name: "Magneton", types: [PT.Electric, PT.Steel],
    baseStats: { hp: 50, atk: 60, def: 95, spa: 120, spd: 70, spe: 70 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Thunder Shock", power: 40, type: PT.Electric, isSpecial: true, category: "special", description: "Thunder shock" } },
      { level: 16, move: { name: "Thunder Wave", power: 0, type: PT.Electric, isSpecial: false, category: "status", description: "Thunder wave" } },
      { level: 30, move: { name: "Thunderbolt", power: 90, type: PT.Electric, isSpecial: true, category: "special", description: "Thunderbolt" } },
    ],
  },
  gastly: {
    id: "gastly", name: "Gastly", types: [PT.Ghost, PT.Poison],
    baseStats: { hp: 30, atk: 35, def: 30, spa: 100, spd: 35, spe: 80 },
    evolvesAt: 25, evolvesTo: "haunter",
    movePool: [
      { level: 1, move: { name: "Lick", power: 30, type: PT.Ghost, isSpecial: false, category: "physical", description: "Lick" } },
      { level: 1, move: { name: "Confusion", power: 50, type: PT.Psychic, isSpecial: true, category: "special", description: "Confusion" } },
      { level: 8, move: { name: "Smog", power: 30, type: PT.Poison, isSpecial: true, category: "special", description: "Smog" } },
      { level: 16, move: { name: "Curse", power: 0, type: PT.Ghost, isSpecial: false, category: "status", description: "Curse" } },
    ],
  },
  haunter: {
    id: "haunter", name: "Haunter", types: [PT.Ghost, PT.Poison],
    baseStats: { hp: 45, atk: 50, def: 45, spa: 115, spd: 55, spe: 95 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Lick", power: 30, type: PT.Ghost, isSpecial: false, category: "physical", description: "Lick" } },
      { level: 16, move: { name: "Curse", power: 0, type: PT.Ghost, isSpecial: false, category: "status", description: "Curse" } },
      { level: 25, move: { name: "Shadow Ball", power: 80, type: PT.Ghost, isSpecial: true, category: "special", description: "Shadow ball" } },
    ],
  },
  drowzee: {
    id: "drowzee", name: "Drowzee", types: [PT.Psychic],
    baseStats: { hp: 60, atk: 48, def: 45, spa: 43, spd: 90, spe: 42 },
    evolvesAt: 26, evolvesTo: "hypno",
    movePool: [
      { level: 1, move: { name: "Pound", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Pound" } },
      { level: 1, move: { name: "Hypnosis", power: 0, type: PT.Psychic, isSpecial: false, category: "status", description: "Hypnosis" } },
      { level: 12, move: { name: "Confusion", power: 50, type: PT.Psychic, isSpecial: true, category: "special", description: "Confusion" } },
      { level: 20, move: { name: "Headbutt", power: 70, type: PT.Normal, isSpecial: false, category: "physical", description: "Headbutt" } },
    ],
  },
  hypno: {
    id: "hypno", name: "Hypno", types: [PT.Psychic],
    baseStats: { hp: 85, atk: 73, def: 70, spa: 73, spd: 115, spe: 67 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Confusion", power: 50, type: PT.Psychic, isSpecial: true, category: "special", description: "Confusion" } },
      { level: 26, move: { name: "Psychic", power: 90, type: PT.Psychic, isSpecial: true, category: "special", description: "Psychic" } },
    ],
  },
  rhyhorn: {
    id: "rhyhorn", name: "Rhyhorn", types: [PT.Ground, PT.Rock],
    baseStats: { hp: 80, atk: 85, def: 95, spa: 30, spd: 30, spe: 25 },
    evolvesAt: 42, evolvesTo: "rhydon",
    movePool: [
      { level: 1, move: { name: "Horn Attack", power: 65, type: PT.Normal, isSpecial: false, category: "physical", description: "Horn attack" } },
      { level: 1, move: { name: "Stomp", power: 65, type: PT.Normal, isSpecial: false, category: "physical", description: "Stomp" } },
      { level: 15, move: { name: "Rock Blast", power: 50, type: PT.Rock, isSpecial: false, category: "physical", description: "Rock blast" } },
    ],
  },
  rhydon: {
    id: "rhydon", name: "Rhydon", types: [PT.Ground, PT.Rock],
    baseStats: { hp: 105, atk: 130, def: 120, spa: 45, spd: 45, spe: 40 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Horn Attack", power: 65, type: PT.Normal, isSpecial: false, category: "physical", description: "Horn attack" } },
      { level: 42, move: { name: "Earthquake", power: 100, type: PT.Ground, isSpecial: false, category: "physical", description: "Earthquake" } },
      { level: 52, move: { name: "Megahorn", power: 120, type: PT.Bug, isSpecial: false, category: "physical", description: "Megahorn" } },
    ],
  },
  electabuzz: {
    id: "electabuzz", name: "Electabuzz", types: [PT.Electric],
    baseStats: { hp: 65, atk: 83, def: 57, spa: 95, spd: 85, spe: 105 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Thunder Shock", power: 40, type: PT.Electric, isSpecial: true, category: "special", description: "Thunder shock" } },
      { level: 9, move: { name: "Thunder Punch", power: 75, type: PT.Electric, isSpecial: false, category: "physical", description: "Thunder punch" } },
      { level: 25, move: { name: "Thunderbolt", power: 90, type: PT.Electric, isSpecial: true, category: "special", description: "Thunderbolt" } },
    ],
  },
  magmar: {
    id: "magmar", name: "Magmar", types: [PT.Fire],
    baseStats: { hp: 65, atk: 95, def: 57, spa: 100, spd: 85, spe: 93 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Ember", power: 40, type: PT.Fire, isSpecial: true, category: "special", description: "Ember" } },
      { level: 15, move: { name: "Fire Punch", power: 75, type: PT.Fire, isSpecial: false, category: "physical", description: "Fire punch" } },
      { level: 33, move: { name: "Flamethrower", power: 90, type: PT.Fire, isSpecial: true, category: "special", description: "Flamethrower" } },
    ],
  },
  magikarp: {
    id: "magikarp", name: "Magikarp", types: [PT.Water],
    baseStats: { hp: 20, atk: 10, def: 55, spa: 15, spd: 20, spe: 80 },
    evolvesAt: 20, evolvesTo: "gyarados",
    movePool: [
      { level: 1, move: { name: "Splash", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Splash" } },
      { level: 15, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
    ],
  },
  gyarados: {
    id: "gyarados", name: "Gyarados", types: [PT.Water, PT.Flying],
    baseStats: { hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Bite", power: 60, type: PT.Dark, isSpecial: false, category: "physical", description: "Bite" } },
      { level: 20, move: { name: "Dragon Rage", power: 40, type: PT.Dragon, isSpecial: true, category: "special", description: "Dragon rage" } },
      { level: 25, move: { name: "Ice Fang", power: 65, type: PT.Ice, isSpecial: false, category: "physical", description: "Ice fang" } },
      { level: 35, move: { name: "Hydro Pump", power: 110, type: PT.Water, isSpecial: true, category: "special", description: "Hydro pump" } },
      { level: 45, move: { name: "Hyper Beam", power: 150, type: PT.Normal, isSpecial: true, category: "special", description: "Hyper beam" } },
    ],
  },
  lapras: {
    id: "lapras", name: "Lapras", types: [PT.Water, PT.Ice],
    baseStats: { hp: 130, atk: 85, def: 80, spa: 85, spd: 95, spe: 60 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Water Gun", power: 40, type: PT.Water, isSpecial: true, category: "special", description: "Water gun" } },
      { level: 10, move: { name: "Ice Shard", power: 40, type: PT.Ice, isSpecial: false, category: "physical", description: "Ice shard" } },
      { level: 18, move: { name: "Confuse Ray", power: 0, type: PT.Ghost, isSpecial: false, category: "status", description: "Confuse ray" } },
      { level: 28, move: { name: "Surf", power: 90, type: PT.Water, isSpecial: true, category: "special", description: "Surf" } },
      { level: 38, move: { name: "Ice Beam", power: 90, type: PT.Ice, isSpecial: true, category: "special", description: "Ice beam" } },
      { level: 50, move: { name: "Hydro Pump", power: 110, type: PT.Water, isSpecial: true, category: "special", description: "Hydro pump" } },
    ],
  },
  dratini: {
    id: "dratini", name: "Dratini", types: [PT.Dragon],
    baseStats: { hp: 41, atk: 64, def: 45, spa: 50, spd: 50, spe: 50 },
    evolvesAt: 30, evolvesTo: "dragonair",
    movePool: [
      { level: 1, move: { name: "Wrap", power: 15, type: PT.Normal, isSpecial: false, category: "physical", description: "Wrap" } },
      { level: 8, move: { name: "Thunder Wave", power: 0, type: PT.Electric, isSpecial: false, category: "status", description: "Thunder wave" } },
      { level: 15, move: { name: "Dragon Rage", power: 40, type: PT.Dragon, isSpecial: true, category: "special", description: "Dragon rage" } },
      { level: 22, move: { name: "Slam", power: 80, type: PT.Normal, isSpecial: false, category: "physical", description: "Slam" } },
    ],
  },
  dragonair: {
    id: "dragonair", name: "Dragonair", types: [PT.Dragon],
    baseStats: { hp: 61, atk: 84, def: 65, spa: 70, spd: 70, spe: 70 },
    evolvesAt: 55, evolvesTo: "dragonite",
    movePool: [
      { level: 1, move: { name: "Wrap", power: 15, type: PT.Normal, isSpecial: false, category: "physical", description: "Wrap" } },
      { level: 22, move: { name: "Slam", power: 80, type: PT.Normal, isSpecial: false, category: "physical", description: "Slam" } },
      { level: 30, move: { name: "Dragon Pulse", power: 85, type: PT.Dragon, isSpecial: true, category: "special", description: "Dragon pulse" } },
    ],
  },
  dragonite: {
    id: "dragonite", name: "Dragonite", types: [PT.Dragon, PT.Flying],
    baseStats: { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Slam", power: 80, type: PT.Normal, isSpecial: false, category: "physical", description: "Slam" } },
      { level: 30, move: { name: "Dragon Pulse", power: 85, type: PT.Dragon, isSpecial: true, category: "special", description: "Dragon pulse" } },
      { level: 55, move: { name: "Outrage", power: 120, type: PT.Dragon, isSpecial: false, category: "physical", description: "Outrage" } },
      { level: 65, move: { name: "Hyper Beam", power: 150, type: PT.Normal, isSpecial: true, category: "special", description: "Hyper beam" } },
    ],
  },
  mewtwo: {
    id: "mewtwo", name: "Mewtwo", types: [PT.Psychic],
    baseStats: { hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Confusion", power: 50, type: PT.Psychic, isSpecial: true, category: "special", description: "Confusion" } },
      { level: 22, move: { name: "Swift", power: 60, type: PT.Normal, isSpecial: true, category: "special", description: "Swift" } },
      { level: 44, move: { name: "Psychic", power: 90, type: PT.Psychic, isSpecial: true, category: "special", description: "Psychic" } },
      { level: 66, move: { name: "Recover", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Recover" } },
      { level: 88, move: { name: "Hyper Beam", power: 150, type: PT.Normal, isSpecial: true, category: "special", description: "Hyper beam" } },
    ],
  },
  eevee: {
    id: "eevee", name: "Eevee", types: [PT.Normal],
    baseStats: { hp: 55, atk: 55, def: 50, spa: 45, spd: 65, spe: 55 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 1, move: { name: "Tail Whip", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Tail whip" } },
      { level: 8, move: { name: "Sand Attack", power: 0, type: PT.Ground, isSpecial: false, category: "status", description: "Sand attack" } },
      { level: 16, move: { name: "Quick Attack", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Quick attack" } },
      { level: 23, move: { name: "Bite", power: 60, type: PT.Dark, isSpecial: false, category: "physical", description: "Bite" } },
      { level: 36, move: { name: "Take Down", power: 90, type: PT.Normal, isSpecial: false, category: "physical", description: "Take down" } },
    ],
  },
  snorlax: {
    id: "snorlax", name: "Snorlax", types: [PT.Normal],
    baseStats: { hp: 160, atk: 110, def: 65, spa: 65, spd: 110, spe: 30 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Tackle", power: 40, type: PT.Normal, isSpecial: false, category: "physical", description: "Tackle" } },
      { level: 4, move: { name: "Defense Curl", power: 0, type: PT.Normal, isSpecial: false, category: "status", description: "Defense curl" } },
      { level: 10, move: { name: "Amnesia", power: 0, type: PT.Psychic, isSpecial: false, category: "status", description: "Amnesia" } },
      { level: 20, move: { name: "Body Slam", power: 85, type: PT.Normal, isSpecial: false, category: "physical", description: "Body slam" } },
      { level: 30, move: { name: "Rest", power: 0, type: PT.Psychic, isSpecial: false, category: "status", description: "Rest" } },
      { level: 40, move: { name: "Hyper Beam", power: 150, type: PT.Normal, isSpecial: true, category: "special", description: "Hyper beam" } },
    ],
  },
  articuno: {
    id: "articuno", name: "Articuno", types: [PT.Ice, PT.Flying],
    baseStats: { hp: 90, atk: 85, def: 100, spa: 95, spd: 125, spe: 85 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Gust", power: 40, type: PT.Flying, isSpecial: true, category: "special", description: "Gust" } },
      { level: 8, move: { name: "Ice Shard", power: 40, type: PT.Ice, isSpecial: false, category: "physical", description: "Ice shard" } },
      { level: 22, move: { name: "Ice Beam", power: 90, type: PT.Ice, isSpecial: true, category: "special", description: "Ice beam" } },
      { level: 36, move: { name: "Blizzard", power: 110, type: PT.Ice, isSpecial: true, category: "special", description: "Blizzard" } },
    ],
  },
  zapdos: {
    id: "zapdos", name: "Zapdos", types: [PT.Electric, PT.Flying],
    baseStats: { hp: 90, atk: 90, def: 85, spa: 125, spd: 90, spe: 100 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Thunder Shock", power: 40, type: PT.Electric, isSpecial: true, category: "special", description: "Thunder shock" } },
      { level: 8, move: { name: "Drill Peck", power: 80, type: PT.Flying, isSpecial: false, category: "physical", description: "Drill peck" } },
      { level: 22, move: { name: "Thunderbolt", power: 90, type: PT.Electric, isSpecial: true, category: "special", description: "Thunderbolt" } },
      { level: 36, move: { name: "Thunder", power: 110, type: PT.Electric, isSpecial: true, category: "special", description: "Thunder" } },
    ],
  },
  moltres: {
    id: "moltres", name: "Moltres", types: [PT.Fire, PT.Flying],
    baseStats: { hp: 90, atk: 100, def: 90, spa: 125, spd: 85, spe: 90 },
    evolvesAt: 0, evolvesTo: "",
    movePool: [
      { level: 1, move: { name: "Ember", power: 40, type: PT.Fire, isSpecial: true, category: "special", description: "Ember" } },
      { level: 8, move: { name: "Fire Spin", power: 35, type: PT.Fire, isSpecial: true, category: "special", description: "Fire spin" } },
      { level: 22, move: { name: "Flamethrower", power: 90, type: PT.Fire, isSpecial: true, category: "special", description: "Flamethrower" } },
      { level: 36, move: { name: "Heat Wave", power: 95, type: PT.Fire, isSpecial: true, category: "special", description: "Heat wave" } },
      { level: 50, move: { name: "Overheat", power: 130, type: PT.Fire, isSpecial: true, category: "special", description: "Overheat" } },
    ],
  },
};

// ─── Item Definitions ─────────────────────────────────────────────────────────

/**
 * Item pool available for item choice nodes.
 */
export const ITEM_POOL: ItemOption[] = [
  { itemId: "potion", name: "Potion", description: "Heals 20 HP", icon: "❤️" },
  { itemId: "super_potion", name: "Super Potion", description: "Heals 50 HP", icon: "💖" },
  { itemId: "hyper_potion", name: "Hyper Potion", description: "Heals 120 HP", icon: "❤️‍🔥" },
  { itemId: "full_restore", name: "Full Restore", description: "Fully heals + cures status", icon: "✨" },
  { itemId: "revive", name: "Revive", description: "Revives a fainted Pokemon", icon: "💫" },
  { itemId: "ether", name: "Ether", description: "Restores 10 PP", icon: "🔮" },
  { itemId: "elixir", name: "Elixir", description: "Restores all PP", icon: "💎" },
  { itemId: "antidote", name: "Antidote", description: "Cures poison", icon: "💊" },
  { itemId: "paralyze_heal", name: "Paralyze Heal", description: "Cures paralysis", icon: "⚡" },
  { itemId: "burn_heal", name: "Burn Heal", description: "Cures burn", icon: "🔥" },
  { itemId: "ice_heal", name: "Ice Heal", description: "Cures freeze", icon: "❄️" },
  { itemId: "awakening", name: "Awakening", description: "Wakes up a Pokemon", icon: "😴" },
  { itemId: "full_heal", name: "Full Heal", description: "Cures all status conditions", icon: "🌟" },
  { itemId: "rare_candy", name: "Rare Candy", description: "Levels up a Pokemon by 1", icon: "🍬" },
  { itemId: "pp_up", name: "PP Up", description: "Increases max PP", icon: "⬆️" },
];
