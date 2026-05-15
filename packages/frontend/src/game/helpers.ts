/**
 * Game Helpers — battle simulation, map generation, encounters, and progression.
 *
 * These functions fill the gap until the full battle engine is implemented
 * in @pokelike/core. They are designed to be replaced piecemeal.
 */
import {
  type PokemonInstance,
  type PokemonType,
  type Move,
  type MoveInstance,
  type BattleLogEntry,
  type BattleResult,
  type MapGraph,
  type MapNode,
  type MapEdge,
  type BaseStats,
  type Item,
  type ItemInstance,
  NodeType,
  PokemonType as PT,
  SeededRNG,
} from "@pokelike/core";

// ─── Species Database ─────────────────────────────────────────────────────────

interface SpeciesEntry {
  id: string;
  name: string;
  types: [PT, PT?];
  baseStats: BaseStats;
  /** Evolution level (0 = no evolution) */
  evolvesAt: number;
  /** Species ID this evolves into */
  evolvesTo: string;
  /** Move pool per level */
  movePool: Array<{ level: number; move: Move }>;
}

const SPECIES: Record<string, SpeciesEntry> = {
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

export interface ItemOption {
  itemId: string;
  name: string;
  description: string;
  icon: string;
}

const ITEM_POOL: ItemOption[] = [
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

// ─── Gym Leader Data ──────────────────────────────────────────────────────────

export interface GymLeaderData {
  name: string;
  title: string;
  type: PT;
  team: PokemonInstance[];
}

function makeGymMon(
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

function calcStat(
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

function getMovesForLevel(
  species: SpeciesEntry,
  level: number,
): MoveInstance[] {
  const available = species.movePool.filter((m) => m.level <= level);
  // Pick the top 4 moves by level
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

function getSpeciesMove(speciesId: string, moveId: string): Move | undefined {
  const species = SPECIES[speciesId];
  if (!species) return undefined;
  const entry = species.movePool.find(
    (m) => m.move.name.toLowerCase().replace(/\s+/g, "_") === moveId,
  );
  return entry?.move;
}

export const GYM_LEADERS: GymLeaderData[] = [
  {
    name: "Brock",
    title: "Rock-Type Gym Leader",
    type: PT.Rock,
    team: [
      makeGymMon("geodude", 10),
      makeGymMon("geodude", 12),
      makeGymMon("graveler", 14),
    ],
  },
  {
    name: "Misty",
    title: "Water-Type Gym Leader",
    type: PT.Water,
    team: [
      makeGymMon("staryu", 18),
      makeGymMon("staryu", 20),
      makeGymMon("starmie", 22),
    ].map((p) => Object.assign(p, { speciesId: p.speciesId === "staryu" ? "tentacool" : p.speciesId === "starmie" ? "tentacruel" : p.speciesId })),
  },
  {
    name: "Lt. Surge",
    title: "Electric-Type Gym Leader",
    type: PT.Electric,
    team: [
      makeGymMon("magnemite", 24),
      makeGymMon("pikachu", 26),
      makeGymMon("magneton", 28),
    ],
  },
  {
    name: "Erika",
    title: "Grass-Type Gym Leader",
    type: PT.Grass,
    team: [
      makeGymMon("bellsprout", 30),
      makeGymMon("weepinbell", 32),
      makeGymMon("bulbasaur", 34),
    ].map((p, i) => i === 2 ? Object.assign(p, { speciesId: "bulbasaur" }) : p),
  },
  {
    name: "Koga",
    title: "Poison-Type Gym Leader",
    type: PT.Poison,
    team: [
      makeGymMon("zubat", 36),
      makeGymMon("golbat", 38),
      makeGymMon("gastly", 40),
    ].map((p, i) => Object.assign(p, { speciesId: i < 2 ? (i === 0 ? "golbat" : "golbat") : "haunter" })),
  },
  {
    name: "Sabrina",
    title: "Psychic-Type Gym Leader",
    type: PT.Psychic,
    team: [
      makeGymMon("abra", 42),
      makeGymMon("kadabra", 44),
      makeGymMon("hypno", 46),
    ],
  },
  {
    name: "Blaine",
    title: "Fire-Type Gym Leader",
    type: PT.Fire,
    team: [
      makeGymMon("growlithe", 48),
      makeGymMon("ponyta", 50),
      makeGymMon("magmar", 52),
    ],
  },
  {
    name: "Giovanni",
    title: "Ground-Type Gym Leader",
    type: PT.Ground,
    team: [
      makeGymMon("rhyhorn", 54),
      makeGymMon("rhydon", 56),
      makeGymMon("mewtwo", 58),
    ].map((p, i) => i === 2 ? Object.assign(p, { speciesId: "rhydon", level: 58, nickname: "Persian (stand-in)" }) : p),
  },
];

export const ELITE_FOUR: GymLeaderData[] = [
  {
    name: "Lorelei",
    title: "Ice-Type Elite",
    type: PT.Ice,
    team: [
      makeGymMon("lapras", 60),
      makeGymMon("articuno", 62),
      makeGymMon("slowbro", 64),
    ],
  },
  {
    name: "Bruno",
    title: "Fighting-Type Elite",
    type: PT.Fighting,
    team: [
      makeGymMon("machoke", 60),
      makeGymMon("machoke", 62),
      makeGymMon("machoke", 64),
      makeGymMon("machoke", 66),
    ],
  },
  {
    name: "Agatha",
    title: "Ghost-Type Elite",
    type: PT.Ghost,
    team: [
      makeGymMon("haunter", 62),
      makeGymMon("haunter", 64),
      makeGymMon("haunter", 66),
    ],
  },
  {
    name: "Lance",
    title: "Dragon-Type Elite",
    type: PT.Dragon,
    team: [
      makeGymMon("dratini", 64),
      makeGymMon("dragonair", 66),
      makeGymMon("dragonite", 68),
    ],
  },
];

export const CHAMPION: GymLeaderData = {
  name: "Blue",
  title: "Pokemon League Champion",
  type: PT.Normal,
  team: [
    makeGymMon("pidgeot", 70),
    makeGymMon("gyarados", 72),
    makeGymMon("dragonite", 74),
    makeGymMon("charizard", 76),
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getGymLeader(mapIndex: number): GymLeaderData | null {
  if (mapIndex >= 0 && mapIndex < GYM_LEADERS.length) {
    return GYM_LEADERS[mapIndex];
  }
  return null;
}

export function getEliteFour(): GymLeaderData[] {
  return ELITE_FOUR;
}

export function getChampion(): GymLeaderData {
  return CHAMPION;
}

export function getMapName(mapIndex: number): string {
  const names = [
    "Viridian Forest",
    "Pewter City",
    "Cerulean City",
    "Vermilion City",
    "Celadon City",
    "Fuchsia City",
    "Saffron City",
    "Cinnabar Island",
    "Indigo Plateau",
  ];
  return names[mapIndex] ?? `Route ${mapIndex + 1}`;
}

// ─── Map Generation ──────────────────────────────────────────────────────────

/**
 * Generate a map graph for the given map index.
 * Each map is a layer-based graph with progressively harder nodes.
 */
export function generateMap(
  mapIndex: number,
  _nuzlockeMode: boolean,
  rng: SeededRNG,
): MapGraph {
  if (mapIndex === 8) {
    return generateIndigoPlateau(rng);
  }

  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];

  let nodeCounter = 0;
  const nodeId = () => `node_${nodeCounter++}`;

  // Layer 0: Start node
  const startId = nodeId();
  nodes.push({
    id: startId,
    type: NodeType.START,
    position: { x: 200, y: 30 },
    connections: [],
    visited: false,
    accessible: true,
  });

  // Layers 1-5: progressively harder, with branching paths
  const layers = 5;
  const layerHeight = 100;
  const layerStart = 80;

  let prevLayerNodes = [startId];

  for (let layer = 0; layer < layers; layer++) {
    const nodesInLayer = rng.randomInt(2, 3);
    const y = layerStart + layer * layerHeight;
    const spacing = 380 / (nodesInLayer + 1);

    const currentLayerNodes: string[] = [];

    for (let n = 0; n < nodesInLayer; n++) {
      const id = nodeId();
      const x = spacing * (n + 1);
      const isStartLayer = layer === 0 && mapIndex === 0;

      // Determine node type
      let type: NodeType;
      if (layer === layers - 1 && mapIndex > 0) {
        type = NodeType.BOSS;
      } else {
        const roll = rng.random();
        if (roll < 0.4) type = NodeType.BATTLE;
        else if (roll < 0.6) type = NodeType.CATCH;
        else if (roll < 0.8) type = NodeType.ITEM;
        else if (roll < 0.9) type = NodeType.POKECENTER;
        else type = NodeType.TRAINER;
      }

      nodes.push({
        id,
        type,
        position: { x, y },
        connections: [],
        visited: false,
        accessible: isStartLayer || layer === 0,
      });

      currentLayerNodes.push(id);

      // Connect from previous layer nodes (each prev connects to at least 1)
      const connected = new Set<string>();
      for (const prevId of prevLayerNodes) {
        if (!connected.has(id) || rng.random() < 0.3) {
          edges.push({ from: prevId, to: id });
          connected.add(id);
          const prevNode = nodes.find((n) => n.id === prevId);
          if (prevNode) prevNode.connections.push(id);
        }
      }
    }

    prevLayerNodes = currentLayerNodes;
  }

  return { nodes, edges, layers };
}

function generateIndigoPlateau(rng: SeededRNG): MapGraph {
  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];

  const nodeId = (prefix: string) => `${prefix}_${rng.randomInt(1000, 9999)}`;

  // Elite 4 + Champion linear path
  const e4Names = ["Lorelei", "Bruno", "Agatha", "Lance", "Champion"];
  e4Names.forEach((name, i) => {
    const id = nodeId(name.toLowerCase());
    nodes.push({
      id,
      type: NodeType.BOSS,
      position: { x: 200, y: 30 + i * 100 },
      connections: [],
      visited: false,
      accessible: i === 0,
    });
    if (i > 0) {
      const prevId = nodes[i - 1]!.id;
      edges.push({ from: prevId, to: id });
      nodes[i - 1]!.connections.push(id);
    }
  });

  return { nodes, edges, layers: 5 };
}

// ─── Enemy Generation ─────────────────────────────────────────────────────────

/**
 * Generate an enemy team for a battle/catch node.
 * Difficulty scales with map index.
 */
export function generateEnemyTeam(
  mapIndex: number,
  nodeType: NodeType,
  rng: SeededRNG,
): PokemonInstance[] {
  const baseLevel = 5 + mapIndex * 3 + rng.randomInt(0, 2);

  // Get encounter pool for this map
  const pool = getEncounterPool(mapIndex);
  if (pool.length === 0) return [makeGymMon("rattata", baseLevel, rng)];

  const teamSize = mapIndex >= 6 ? rng.randomInt(2, 3) : rng.randomInt(1, 2);

  const team: PokemonInstance[] = [];
  const shuffled = rng.shuffle([...pool]);

  for (let i = 0; i < Math.min(teamSize, shuffled.length); i++) {
    const speciesId = shuffled[i]!;
    const level = baseLevel + rng.randomInt(-1, 2);
    team.push(makeGymMon(speciesId, Math.max(1, level), rng));
  }

  return team.length > 0 ? team : [makeGymMon("rattata", baseLevel, rng)];
}

// ─── Encounter Pools ─────────────────────────────────────────────────────────

function getEncounterPool(mapIndex: number): string[] {
  const pools: Record<number, string[]> = {
    0: ["caterpie", "pidgey", "rattata", "zubat"],
    1: ["sandshrew", "zubat", "geodude", "machop"],
    2: ["pidgey", "bellsprout", "drowzee", "jigglypuff"],
    3: ["magnemite", "growlithe", "ponyta", "electabuzz"],
    4: ["slowpoke", "tentacool", "drowzee", "pikachu"],
    5: ["ghastly", "zubat", "drowzee", "hypno"],
    6: ["rhyhorn", "ponyta", "rapidash", "magmar"],
    7: ["dratini", "magikarp", "gyarados", "lapras"],
    8: ["dragonair", "dragonite", "mewtwo", "snorlax"],
  };
  // Fix the key names
  const fixedPools: Record<number, string[]> = {
    0: ["caterpie", "pidgey", "rattata", "zubat"],
    1: ["sandshrew", "zubat", "geodude", "machop"],
    2: ["pidgey", "bellsprout", "drowzee", "jigglypuff"],
    3: ["magnemite", "growlithe", "ponyta", "electabuzz"],
    4: ["slowpoke", "tentacool", "drowzee", "pikachu"],
    5: ["gastly", "zubat", "drowzee", "hypno"],
    6: ["rhyhorn", "ponyta", "rapidash", "magmar"],
    7: ["dratini", "magikarp", "gyarados", "lapras"],
    8: ["dragonair", "dragonite", "mewtwo", "snorlax"],
  };

  return fixedPools[mapIndex] ?? fixedPools[0]!;
}

// ─── Catch Choices ────────────────────────────────────────────────────────────

export function getCatchChoices(
  mapIndex: number,
  count: number,
  rng: SeededRNG,
  excludeStarters?: string[],
): PokemonInstance[] {
  const pool = getEncounterPool(mapIndex).filter(
    (s) => !excludeStarters?.includes(s),
  );
  const shuffled = rng.shuffle([...pool]);
  const choices: PokemonInstance[] = [];
  const baseLevel = 5 + mapIndex * 3;

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const level = baseLevel + rng.randomInt(-1, 2);
    choices.push(makeGymMon(shuffled[i]!, Math.max(1, level), rng));
  }

  return choices.length > 0
    ? choices
    : [makeGymMon("pidgey", baseLevel, rng)];
}

// ─── Item Choices ─────────────────────────────────────────────────────────────

export function getItemChoices(
  mapIndex: number,
  count: number,
  rng: SeededRNG,
): ItemOption[] {
  const shuffled = rng.shuffle([...ITEM_POOL]);
  // Better items appear at higher map indices
  const qualityOffset = Math.min(mapIndex, 5);
  return shuffled.slice(qualityOffset, qualityOffset + count);
}

// ─── Battle Simulation ────────────────────────────────────────────────────────

/**
 * Simulate an auto-battle between two teams.
 * Returns the complete battle result including logs and final team states.
 */
export function simulateBattle(
  playerTeam: PokemonInstance[],
  enemyTeam: PokemonInstance[],
  rng: SeededRNG,
): BattleResult {
  // Deep clone (with a simple JSON round-trip since these are plain objects)
  const player = structuredClone(playerTeam);
  const enemy = structuredClone(enemyTeam);

  const log: BattleLogEntry[] = [];
  let turn = 0;

  const MAX_TURNS = 100;

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

/**
 * Execute a single attack and return whether the defender fainted.
 */
function executeAttack(
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

  // Type effectiveness (simplified - use the getEffectiveness if available)
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

/**
 * Simple type effectiveness lookup.
 */
function getTypeEffectiveness(
  attackType: PT,
  defender: PokemonInstance,
): number {
  const species = SPECIES[defender.speciesId];
  if (!species) return 1;

  let multiplier = 1;
  for (const defType of species.types) {
    if (!defType) break;
    const eff = getSingleEffectiveness(attackType, defType);
    multiplier *= eff;
  }
  return multiplier;
}

/**
 * Single-type effectiveness.
 */
function getSingleEffectiveness(attack: PT, defend: PT): number {
  // Key super-effective matchups
  const superEff: Record<string, PT[]> = {
    [PT.Normal]: [],
    [PT.Fire]: [PT.Grass, PT.Ice, PT.Bug, PT.Steel],
    [PT.Water]: [PT.Fire, PT.Ground, PT.Rock],
    [PT.Electric]: [PT.Water, PT.Flying],
    [PT.Grass]: [PT.Water, PT.Ground, PT.Rock],
    [PT.Ice]: [PT.Grass, PT.Ground, PT.Flying, PT.Dragon],
    [PT.Fighting]: [PT.Normal, PT.Ice, PT.Rock, PT.Dark, PT.Steel],
    [PT.Poison]: [PT.Grass, PT.Fairy],
    [PT.Ground]: [PT.Fire, PT.Electric, PT.Poison, PT.Rock, PT.Steel],
    [PT.Flying]: [PT.Grass, PT.Fighting, PT.Bug],
    [PT.Psychic]: [PT.Fighting, PT.Poison],
    [PT.Bug]: [PT.Grass, PT.Psychic, PT.Dark],
    [PT.Rock]: [PT.Fire, PT.Ice, PT.Flying, PT.Bug],
    [PT.Ghost]: [PT.Psychic, PT.Ghost],
    [PT.Dragon]: [PT.Dragon],
    [PT.Dark]: [PT.Psychic, PT.Ghost],
    [PT.Steel]: [PT.Ice, PT.Rock, PT.Fairy],
    [PT.Fairy]: [PT.Fighting, PT.Dragon, PT.Dark],
  };

  const notVeryEff: Record<string, PT[]> = {
    [PT.Normal]: [PT.Rock, PT.Steel],
    [PT.Fire]: [PT.Fire, PT.Water, PT.Rock, PT.Dragon],
    [PT.Water]: [PT.Water, PT.Grass, PT.Dragon],
    [PT.Electric]: [PT.Electric, PT.Grass, PT.Dragon],
    [PT.Grass]: [PT.Fire, PT.Grass, PT.Poison, PT.Flying, PT.Bug, PT.Dragon, PT.Steel],
    [PT.Ice]: [PT.Fire, PT.Water, PT.Ice, PT.Steel],
    [PT.Fighting]: [PT.Poison, PT.Flying, PT.Psychic, PT.Bug, PT.Fairy],
    [PT.Poison]: [PT.Poison, PT.Ground, PT.Rock, PT.Ghost],
    [PT.Ground]: [PT.Grass, PT.Bug],
    [PT.Flying]: [PT.Electric, PT.Rock, PT.Steel],
    [PT.Psychic]: [PT.Psychic, PT.Steel],
    [PT.Bug]: [PT.Fire, PT.Fighting, PT.Poison, PT.Flying, PT.Ghost, PT.Steel, PT.Fairy],
    [PT.Rock]: [PT.Fighting, PT.Ground, PT.Steel],
    [PT.Ghost]: [PT.Dark],
    [PT.Dragon]: [PT.Steel],
    [PT.Dark]: [PT.Fighting, PT.Dark, PT.Fairy],
    [PT.Steel]: [PT.Fire, PT.Water, PT.Electric, PT.Steel],
    [PT.Fairy]: [PT.Poison, PT.Fire, PT.Steel],
  };

  const immune: Record<string, PT[]> = {
    [PT.Normal]: [PT.Ghost],
    [PT.Ghost]: [PT.Normal],
    [PT.Fighting]: [PT.Ghost],
    [PT.Ground]: [PT.Flying],
    [PT.Electric]: [PT.Ground],
    [PT.Psychic]: [PT.Dark],
    [PT.Dragon]: [PT.Fairy],
  };

  if (immune[attack]?.includes(defend)) return 0;
  if (superEff[attack]?.includes(defend)) return 2;
  if (notVeryEff[attack]?.includes(defend)) return 0.5;
  return 1;
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
): PokemonInstance[] {
  return team.map((p, i) => {
    if (!participantIdxs.includes(i)) return p;
    const gain = participantIdxs.length > 0
      ? baseGain + Math.floor(Math.random() * 3)
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

export function canEvolve(pokemon: PokemonInstance): boolean {
  const species = SPECIES[pokemon.speciesId];
  if (!species) return false;
  if (!species.evolvesTo || species.evolvesAt === 0) return false;
  return pokemon.level >= species.evolvesAt;
}

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

// ─── Starter Pokemon ──────────────────────────────────────────────────────────

/**
 * Returns the 3 Kanto starter Pokemon as instances.
 */
export function getStarters(): PokemonInstance[] {
  const starters = [
    makeGymMon("bulbasaur", 5),
    makeGymMon("charmander", 5),
    makeGymMon("squirtle", 5),
  ];

  // Fix up starter-specific traits
  return starters.map((p, i) => ({
    ...p,
    movePool: undefined, // Clean up any extra props
  })) as unknown as PokemonInstance[];
}

// ─── Create Pokemon Instance Helper ───────────────────────────────────────────

export function createPokemonInstance(
  speciesId: string,
  level: number,
  rng?: SeededRNG,
): PokemonInstance {
  return makeGymMon(speciesId, level, rng);
}

// ─── Node Processing ─────────────────────────────────────────────────────────-

export type NodeResolution =
  | { type: "battle"; enemyTeam: PokemonInstance[]; nodeType: NodeType }
  | { type: "catch"; choices: PokemonInstance[] }
  | { type: "item"; choices: ItemOption[] }
  | { type: "heal" }
  | { type: "nothing" };

/**
 * Process a node click and determine what happens.
 */
export function processNodeClick(
  node: MapNode,
  mapIndex: number,
  rng: SeededRNG,
): NodeResolution {
  switch (node.type) {
    case NodeType.BATTLE:
    case NodeType.TRAINER: {
      const enemyTeam = generateEnemyTeam(mapIndex, node.type, rng);
      return { type: "battle", enemyTeam, nodeType: node.type };
    }
    case NodeType.CATCH: {
      const choices = getCatchChoices(mapIndex, 3, rng);
      return { type: "catch", choices };
    }
    case NodeType.ITEM: {
      const choices = getItemChoices(mapIndex, 3, rng);
      return { type: "item", choices };
    }
    case NodeType.BOSS: {
      if (mapIndex >= 8) {
        // Elite 4 / Champion
        const e4Index = rng.randomInt(0, 3);
        const leader = ELITE_FOUR[e4Index] ?? CHAMPION;
        return { type: "battle", enemyTeam: leader.team, nodeType: NodeType.BOSS };
      }
      const leader = GYM_LEADERS[mapIndex];
      if (leader) {
        return { type: "battle", enemyTeam: leader.team, nodeType: NodeType.BOSS };
      }
      const enemyTeam = generateEnemyTeam(mapIndex, node.type, rng);
      return { type: "battle", enemyTeam, nodeType: NodeType.BOSS };
    }
    case NodeType.POKECENTER:
      return { type: "heal" };
    case NodeType.LEGENDARY:
    case NodeType.QUESTION:
    case NodeType.MOVE_TUTOR:
    case NodeType.TRADE:
    case NodeType.START:
    default:
      return { type: "nothing" };
  }
}

// ─── Species Name / Sprite Lookups ────────────────────────────────────────────

export function getSpeciesName(speciesId: string): string {
  return SPECIES[speciesId]?.name ?? speciesId;
}

export function getSpeciesSpriteUrl(speciesId: string): string {
  const numMatch = speciesId.match(/\d+/);
  if (numMatch) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${numMatch[0]}.png`;
  }
  const NAME_TO_ID: Record<string, string> = {
    bulbasaur: "1", ivysaur: "2", venusaur: "3",
    charmander: "4", charmeleon: "5", charizard: "6",
    squirtle: "7", wartortle: "8", blastoise: "9",
    caterpie: "10", metapod: "11", butterfree: "12",
    pidgey: "16", pidgeotto: "17", pidgeot: "18",
    rattata: "19", raticate: "20",
    pikachu: "25",
    sandshrew: "27", sandslash: "28",
    jigglypuff: "39",
    zubat: "41", golbat: "42",
    geodude: "74", graveler: "75",
    growlithe: "58",
    abra: "63", kadabra: "64",
    machop: "66", machoke: "67",
    bellsprout: "69", weepinbell: "70",
    tentacool: "72", tentacruel: "73",
    ponyta: "77", rapidash: "78",
    slowpoke: "79", slowbro: "80",
    magnemite: "81", magneton: "82",
    gastly: "92", haunter: "93",
    drowzee: "96", hypno: "97",
    electabuzz: "125",
    magmar: "126",
    magikarp: "129", gyarados: "130",
    lapras: "131",
    eevee: "133",
    snorlax: "143",
    articuno: "144", zapdos: "145", moltres: "146",
    dratini: "147", dragonair: "148", dragonite: "149",
    mewtwo: "150",
  };
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${NAME_TO_ID[speciesId.toLowerCase()] ?? "25"}.png`;
}

export function getSpeciesTypes(speciesId: string): [PT, PT?] {
  return SPECIES[speciesId]?.types ?? [PT.Normal];
}

// ─── BOSS Monster helpers for species normalization ───────────────────────────

/**
 * Get the gym leader's display badge info for the given map index.
 */
export function getGymBadgeName(mapIndex: number): string {
  const badgeNames = [
    "Boulder Badge",
    "Cascade Badge",
    "Thunder Badge",
    "Rainbow Badge",
    "Soul Badge",
    "Marsh Badge",
    "Volcano Badge",
    "Earth Badge",
  ];
  return badgeNames[mapIndex] ?? "Unknown Badge";
}
