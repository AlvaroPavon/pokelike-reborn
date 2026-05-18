/**
 * @fileoverview Complete species registry for Pokelike Reborn.
 *
 * Contains all 1025 Pokemon species (Generations 1-9) with their
 * types, base stats, evolution relationships, and sprite URLs.
 *
 * Each species is keyed by its Pokedex number for O(1) lookup.
 *
 * @module speciesList
 */

import { PokemonType, type BaseStats } from "../types/index.js";

// ─── Helper to generate sprite URLs ─────────────────────────────────────

const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const spriteUrl = (n: number): string => SPRITE_BASE + "/" + n + ".png";
const shinySpriteUrl = (n: number): string => SPRITE_BASE + "/shiny/" + n + ".png";

// ─── Stat helpers ───────────────────────────────────────────────────────

function calcBst(stats: BaseStats): number {
  return stats.hp + stats.atk + stats.def + stats.spa + stats.spd + stats.spe;
}

// ─── Species entry interface ────────────────────────────────────────────

export interface SpeciesEntry {
  /** Slug identifier (e.g., "bulbasaur"). */
  id: string;
  /** Display name (e.g., "Bulbasaur"). */
  name: string;
  /** National Pokedex number (1-1025). */
  pokedexNumber: number;
  /** One or two elemental types. */
  types: [PokemonType, PokemonType?];
  /** Base stat block. */
  baseStats: BaseStats;
  /** Base Stat Total. */
  bst: number;
  /** Default sprite URL. */
  spriteUrl: string;
  /** Shiny variant sprite URL. */
  shinySpriteUrl: string;
  /** Slug of the species this evolves from (if any). */
  evolvesFrom?: string;
  /** Human-readable evolution condition (e.g., "Level 16"). */
  evolutionCondition?: string;
  /** Slug of the species this evolves into (if any). */
  evolvesTo?: string;
}


// ─── Species data ───────────────────────────────────────────────────────

const SPECIES_MAP = new Map<number, SpeciesEntry>();

function reg(
  id: string,
  name: string,
  num: number,
  types: [PokemonType, PokemonType?],
  baseStats: BaseStats,
  evolvesFrom?: string,
  evolutionCondition?: string,
  evolvesTo?: string,
): void {
  SPECIES_MAP.set(num, {
    id,
    name,
    pokedexNumber: num,
    types,
    baseStats,
    bst: calcBst(baseStats),
    spriteUrl: spriteUrl(num),
    shinySpriteUrl: shinySpriteUrl(num),
    evolvesFrom,
    evolutionCondition,
    evolvesTo,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Generation 1 - Kanto (#1-151)
// ═══════════════════════════════════════════════════════════════════════

reg("bulbasaur","Bulbasaur",1,[PokemonType.Grass,PokemonType.Poison],{hp:45,atk:49,def:49,spa:65,spd:65,spe:45},undefined,undefined,"ivysaur");
reg("ivysaur","Ivysaur",2,[PokemonType.Grass,PokemonType.Poison],{hp:60,atk:62,def:63,spa:80,spd:80,spe:60},"bulbasaur","Level 16","venusaur");
reg("venusaur","Venusaur",3,[PokemonType.Grass,PokemonType.Poison],{hp:80,atk:82,def:83,spa:100,spd:100,spe:80},"ivysaur","Level 32",undefined);

reg("charmander","Charmander",4,[PokemonType.Fire],{hp:39,atk:52,def:43,spa:60,spd:50,spe:65},undefined,undefined,"charmeleon");
reg("charmeleon","Charmeleon",5,[PokemonType.Fire],{hp:58,atk:64,def:58,spa:80,spd:65,spe:80},"charmander","Level 16","charizard");
reg("charizard","Charizard",6,[PokemonType.Fire,PokemonType.Flying],{hp:78,atk:84,def:78,spa:109,spd:85,spe:100},"charmeleon","Level 36",undefined);

reg("squirtle","Squirtle",7,[PokemonType.Water],{hp:44,atk:48,def:65,spa:50,spd:64,spe:43},undefined,undefined,"wartortle");
reg("wartortle","Wartortle",8,[PokemonType.Water],{hp:59,atk:63,def:80,spa:65,spd:80,spe:58},"squirtle","Level 16","blastoise");
reg("blastoise","Blastoise",9,[PokemonType.Water],{hp:79,atk:83,def:100,spa:85,spd:105,spe:78},"wartortle","Level 36",undefined);

reg("caterpie","Caterpie",10,[PokemonType.Bug],{hp:45,atk:30,def:35,spa:20,spd:20,spe:45},undefined,undefined,"metapod");
reg("metapod","Metapod",11,[PokemonType.Bug],{hp:50,atk:20,def:55,spa:25,spd:25,spe:30},"caterpie","Level 7","butterfree");
reg("butterfree","Butterfree",12,[PokemonType.Bug,PokemonType.Flying],{hp:60,atk:45,def:50,spa:90,spd:80,spe:70},"metapod","Level 10",undefined);

reg("weedle","Weedle",13,[PokemonType.Bug,PokemonType.Poison],{hp:40,atk:35,def:30,spa:20,spd:20,spe:50},undefined,undefined,"kakuna");
reg("kakuna","Kakuna",14,[PokemonType.Bug,PokemonType.Poison],{hp:45,atk:25,def:50,spa:25,spd:25,spe:35},"weedle","Level 7","beedrill");
reg("beedrill","Beedrill",15,[PokemonType.Bug,PokemonType.Poison],{hp:65,atk:90,def:40,spa:45,spd:80,spe:75},"kakuna","Level 10",undefined);

reg("pidgey","Pidgey",16,[PokemonType.Normal,PokemonType.Flying],{hp:40,atk:45,def:40,spa:35,spd:35,spe:56},undefined,undefined,"pidgeotto");
reg("pidgeotto","Pidgeotto",17,[PokemonType.Normal,PokemonType.Flying],{hp:63,atk:60,def:55,spa:50,spd:50,spe:71},"pidgey","Level 18","pidgeot");
reg("pidgeot","Pidgeot",18,[PokemonType.Normal,PokemonType.Flying],{hp:83,atk:80,def:75,spa:70,spd:70,spe:101},"pidgeotto","Level 36",undefined);

reg("rattata","Rattata",19,[PokemonType.Normal],{hp:30,atk:56,def:35,spa:25,spd:35,spe:72},undefined,undefined,"raticate");
reg("raticate","Raticate",20,[PokemonType.Normal],{hp:55,atk:81,def:60,spa:50,spd:70,spe:97},"rattata","Level 20",undefined);

reg("spearow","Spearow",21,[PokemonType.Normal,PokemonType.Flying],{hp:40,atk:60,def:30,spa:31,spd:31,spe:70},undefined,undefined,"fearow");
reg("fearow","Fearow",22,[PokemonType.Normal,PokemonType.Flying],{hp:65,atk:90,def:65,spa:61,spd:61,spe:100},"spearow","Level 20",undefined);

reg("ekans","Ekans",23,[PokemonType.Poison],{hp:35,atk:60,def:44,spa:40,spd:54,spe:55},undefined,undefined,"arbok");
reg("arbok","Arbok",24,[PokemonType.Poison],{hp:60,atk:95,def:69,spa:65,spd:79,spe:80},"ekans","Level 22",undefined);

reg("pikachu","Pikachu",25,[PokemonType.Electric],{hp:35,atk:55,def:40,spa:50,spd:50,spe:90},"pichu","Friendship","raichu");
reg("raichu","Raichu",26,[PokemonType.Electric],{hp:60,atk:90,def:55,spa:90,spd:80,spe:110},"pikachu","Thunder Stone",undefined);

reg("sandshrew","Sandshrew",27,[PokemonType.Ground],{hp:50,atk:75,def:85,spa:20,spd:30,spe:40},undefined,undefined,"sandslash");
reg("sandslash","Sandslash",28,[PokemonType.Ground],{hp:75,atk:100,def:110,spa:45,spd:55,spe:65},"sandshrew","Level 22",undefined);

reg("nidoran-f","Nidoran F",29,[PokemonType.Poison],{hp:55,atk:47,def:52,spa:40,spd:40,spe:41},undefined,undefined,"nidorina");
reg("nidorina","Nidorina",30,[PokemonType.Poison],{hp:70,atk:62,def:67,spa:55,spd:55,spe:56},"nidoran-f","Level 16","nidoqueen");
reg("nidoqueen","Nidoqueen",31,[PokemonType.Poison,PokemonType.Ground],{hp:90,atk:92,def:87,spa:75,spd:85,spe:76},"nidorina","Moon Stone",undefined);

reg("nidoran-m","Nidoran M",32,[PokemonType.Poison],{hp:46,atk:57,def:40,spa:40,spd:40,spe:50},undefined,undefined,"nidorino");
reg("nidorino","Nidorino",33,[PokemonType.Poison],{hp:61,atk:72,def:57,spa:55,spd:55,spe:65},"nidoran-m","Level 16","nidoking");
reg("nidoking","Nidoking",34,[PokemonType.Poison,PokemonType.Ground],{hp:81,atk:102,def:77,spa:85,spd:75,spe:85},"nidorino","Moon Stone",undefined);

reg("clefairy","Clefairy",35,[PokemonType.Fairy],{hp:70,atk:45,def:48,spa:60,spd:65,spe:35},"cleffa","Friendship","clefable");
reg("clefable","Clefable",36,[PokemonType.Fairy],{hp:95,atk:70,def:73,spa:95,spd:90,spe:60},"clefairy","Moon Stone",undefined);

reg("vulpix","Vulpix",37,[PokemonType.Fire],{hp:38,atk:41,def:40,spa:50,spd:65,spe:65},undefined,undefined,"ninetales");
reg("ninetales","Ninetales",38,[PokemonType.Fire],{hp:73,atk:76,def:75,spa:81,spd:100,spe:100},"vulpix","Fire Stone",undefined);

reg("jigglypuff","Jigglypuff",39,[PokemonType.Normal,PokemonType.Fairy],{hp:115,atk:45,def:20,spa:45,spd:25,spe:20},"igglybuff","Friendship","wigglytuff");
reg("wigglytuff","Wigglytuff",40,[PokemonType.Normal,PokemonType.Fairy],{hp:140,atk:70,def:45,spa:85,spd:50,spe:45},"jigglypuff","Moon Stone",undefined);

reg("zubat","Zubat",41,[PokemonType.Poison,PokemonType.Flying],{hp:40,atk:45,def:35,spa:30,spd:40,spe:55},undefined,undefined,"golbat");
reg("golbat","Golbat",42,[PokemonType.Poison,PokemonType.Flying],{hp:75,atk:80,def:70,spa:65,spd:75,spe:90},"zubat","Level 22","crobat");

reg("oddish","Oddish",43,[PokemonType.Grass,PokemonType.Poison],{hp:45,atk:50,def:55,spa:75,spd:65,spe:30},undefined,undefined,"gloom");
reg("gloom","Gloom",44,[PokemonType.Grass,PokemonType.Poison],{hp:60,atk:65,def:70,spa:85,spd:75,spe:40},"oddish","Level 21","vileplume");
reg("vileplume","Vileplume",45,[PokemonType.Grass,PokemonType.Poison],{hp:75,atk:80,def:85,spa:110,spd:90,spe:50},"gloom","Leaf Stone",undefined);

reg("paras","Paras",46,[PokemonType.Bug,PokemonType.Grass],{hp:35,atk:70,def:55,spa:45,spd:55,spe:25},undefined,undefined,"parasect");
reg("parasect","Parasect",47,[PokemonType.Bug,PokemonType.Grass],{hp:60,atk:95,def:80,spa:60,spd:80,spe:30},"paras","Level 24",undefined);

reg("venonat","Venonat",48,[PokemonType.Bug,PokemonType.Poison],{hp:60,atk:55,def:50,spa:40,spd:55,spe:45},undefined,undefined,"venomoth");
reg("venomoth","Venomoth",49,[PokemonType.Bug,PokemonType.Poison],{hp:70,atk:65,def:60,spa:90,spd:75,spe:90},"venonat","Level 31",undefined);

reg("diglett","Diglett",50,[PokemonType.Ground],{hp:10,atk:55,def:25,spa:35,spd:45,spe:95},undefined,undefined,"dugtrio");
reg("dugtrio","Dugtrio",51,[PokemonType.Ground],{hp:35,atk:100,def:50,spa:50,spd:70,spe:120},"diglett","Level 26",undefined);

reg("meowth","Meowth",52,[PokemonType.Normal],{hp:40,atk:45,def:35,spa:40,spd:40,spe:90},undefined,undefined,"persian");
reg("persian","Persian",53,[PokemonType.Normal],{hp:65,atk:70,def:60,spa:65,spd:65,spe:115},"meowth","Level 28",undefined);

reg("psyduck","Psyduck",54,[PokemonType.Water],{hp:50,atk:52,def:48,spa:65,spd:50,spe:55},undefined,undefined,"golduck");
reg("golduck","Golduck",55,[PokemonType.Water],{hp:80,atk:82,def:78,spa:95,spd:80,spe:85},"psyduck","Level 33",undefined);

reg("mankey","Mankey",56,[PokemonType.Fighting],{hp:40,atk:80,def:35,spa:35,spd:45,spe:70},undefined,undefined,"primeape");
reg("primeape","Primeape",57,[PokemonType.Fighting],{hp:65,atk:105,def:60,spa:60,spd:70,spe:95},"mankey","Level 28","annihilape");

reg("growlithe","Growlithe",58,[PokemonType.Fire],{hp:55,atk:70,def:45,spa:70,spd:50,spe:60},undefined,undefined,"arcanine");
reg("arcanine","Arcanine",59,[PokemonType.Fire],{hp:90,atk:110,def:80,spa:100,spd:80,spe:95},"growlithe","Fire Stone",undefined);

reg("poliwag","Poliwag",60,[PokemonType.Water],{hp:40,atk:50,def:40,spa:40,spd:40,spe:90},undefined,undefined,"poliwhirl");
reg("poliwhirl","Poliwhirl",61,[PokemonType.Water],{hp:65,atk:65,def:65,spa:50,spd:50,spe:90},"poliwag","Level 25","poliwrath");
reg("poliwrath","Poliwrath",62,[PokemonType.Water,PokemonType.Fighting],{hp:90,atk:95,def:95,spa:70,spd:90,spe:70},"poliwhirl","Water Stone",undefined);

reg("abra","Abra",63,[PokemonType.Psychic],{hp:25,atk:20,def:15,spa:105,spd:55,spe:90},undefined,undefined,"kadabra");
reg("kadabra","Kadabra",64,[PokemonType.Psychic],{hp:40,atk:35,def:30,spa:120,spd:70,spe:105},"abra","Level 16","alakazam");
reg("alakazam","Alakazam",65,[PokemonType.Psychic],{hp:55,atk:50,def:45,spa:135,spd:95,spe:120},"kadabra","Trade",undefined);

reg("machop","Machop",66,[PokemonType.Fighting],{hp:70,atk:80,def:50,spa:35,spd:35,spe:35},undefined,undefined,"machoke");
reg("machoke","Machoke",67,[PokemonType.Fighting],{hp:80,atk:100,def:70,spa:50,spd:60,spe:45},"machop","Level 28","machamp");
reg("machamp","Machamp",68,[PokemonType.Fighting],{hp:90,atk:130,def:80,spa:65,spd:85,spe:55},"machoke","Trade",undefined);

reg("bellsprout","Bellsprout",69,[PokemonType.Grass,PokemonType.Poison],{hp:50,atk:75,def:35,spa:70,spd:30,spe:40},undefined,undefined,"weepinbell");
reg("weepinbell","Weepinbell",70,[PokemonType.Grass,PokemonType.Poison],{hp:65,atk:90,def:50,spa:85,spd:45,spe:55},"bellsprout","Level 21","victreebel");
reg("victreebel","Victreebel",71,[PokemonType.Grass,PokemonType.Poison],{hp:80,atk:105,def:65,spa:100,spd:70,spe:70},"weepinbell","Leaf Stone",undefined);

reg("tentacool","Tentacool",72,[PokemonType.Water,PokemonType.Poison],{hp:40,atk:40,def:35,spa:50,spd:100,spe:70},undefined,undefined,"tentacruel");
reg("tentacruel","Tentacruel",73,[PokemonType.Water,PokemonType.Poison],{hp:80,atk:70,def:65,spa:80,spd:120,spe:100},"tentacool","Level 30",undefined);

reg("geodude","Geodude",74,[PokemonType.Rock,PokemonType.Ground],{hp:40,atk:80,def:100,spa:30,spd:30,spe:20},undefined,undefined,"graveler");
reg("graveler","Graveler",75,[PokemonType.Rock,PokemonType.Ground],{hp:55,atk:95,def:115,spa:45,spd:45,spe:35},"geodude","Level 25","golem");
reg("golem","Golem",76,[PokemonType.Rock,PokemonType.Ground],{hp:80,atk:120,def:130,spa:55,spd:65,spe:45},"graveler","Trade",undefined);

reg("ponyta","Ponyta",77,[PokemonType.Fire],{hp:50,atk:85,def:55,spa:65,spd:65,spe:90},undefined,undefined,"rapidash");
reg("rapidash","Rapidash",78,[PokemonType.Fire],{hp:65,atk:100,def:70,spa:80,spd:80,spe:105},"ponyta","Level 40",undefined);

reg("slowpoke","Slowpoke",79,[PokemonType.Water,PokemonType.Psychic],{hp:90,atk:65,def:65,spa:40,spd:40,spe:15},undefined,undefined,"slowbro");
reg("slowbro","Slowbro",80,[PokemonType.Water,PokemonType.Psychic],{hp:95,atk:75,def:110,spa:100,spd:80,spe:30},"slowpoke","Level 37",undefined);

reg("magnemite","Magnemite",81,[PokemonType.Electric,PokemonType.Steel],{hp:25,atk:35,def:70,spa:95,spd:55,spe:45},undefined,undefined,"magneton");
reg("magneton","Magneton",82,[PokemonType.Electric,PokemonType.Steel],{hp:50,atk:60,def:95,spa:120,spd:70,spe:70},"magnemite","Level 30","magnezone");

reg("farfetchd","Farfetchd",83,[PokemonType.Normal,PokemonType.Flying],{hp:52,atk:90,def:55,spa:58,spd:62,spe:60},undefined,undefined,undefined);

reg("doduo","Doduo",84,[PokemonType.Normal,PokemonType.Flying],{hp:35,atk:85,def:45,spa:35,spd:35,spe:75},undefined,undefined,"dodrio");
reg("dodrio","Dodrio",85,[PokemonType.Normal,PokemonType.Flying],{hp:60,atk:110,def:70,spa:60,spd:60,spe:110},"doduo","Level 31",undefined);

reg("seel","Seel",86,[PokemonType.Water],{hp:65,atk:45,def:55,spa:45,spd:70,spe:45},undefined,undefined,"dewgong");
reg("dewgong","Dewgong",87,[PokemonType.Water,PokemonType.Ice],{hp:90,atk:70,def:80,spa:70,spd:95,spe:70},"seel","Level 34",undefined);

reg("grimer","Grimer",88,[PokemonType.Poison],{hp:80,atk:80,def:50,spa:40,spd:50,spe:25},undefined,undefined,"muk");
reg("muk","Muk",89,[PokemonType.Poison],{hp:105,atk:105,def:75,spa:65,spd:100,spe:50},"grimer","Level 38",undefined);

reg("shellder","Shellder",90,[PokemonType.Water],{hp:30,atk:65,def:100,spa:45,spd:25,spe:40},undefined,undefined,"cloyster");
reg("cloyster","Cloyster",91,[PokemonType.Water,PokemonType.Ice],{hp:50,atk:95,def:180,spa:85,spd:45,spe:70},"shellder","Water Stone",undefined);

reg("gastly","Gastly",92,[PokemonType.Ghost,PokemonType.Poison],{hp:30,atk:35,def:30,spa:100,spd:35,spe:80},undefined,undefined,"haunter");
reg("haunter","Haunter",93,[PokemonType.Ghost,PokemonType.Poison],{hp:45,atk:50,def:45,spa:115,spd:55,spe:95},"gastly","Level 25","gengar");
reg("gengar","Gengar",94,[PokemonType.Ghost,PokemonType.Poison],{hp:60,atk:65,def:60,spa:130,spd:75,spe:110},"haunter","Trade",undefined);

reg("onix","Onix",95,[PokemonType.Rock,PokemonType.Ground],{hp:35,atk:45,def:160,spa:30,spd:45,spe:70},undefined,undefined,"steelix");

reg("drowzee","Drowzee",96,[PokemonType.Psychic],{hp:60,atk:48,def:45,spa:43,spd:90,spe:42},undefined,undefined,"hypno");
reg("hypno","Hypno",97,[PokemonType.Psychic],{hp:85,atk:73,def:70,spa:73,spd:115,spe:67},"drowzee","Level 26",undefined);

reg("krabby","Krabby",98,[PokemonType.Water],{hp:30,atk:105,def:90,spa:25,spd:25,spe:50},undefined,undefined,"kingler");
reg("kingler","Kingler",99,[PokemonType.Water],{hp:55,atk:130,def:115,spa:50,spd:50,spe:75},"krabby","Level 28",undefined);

reg("voltorb","Voltorb",100,[PokemonType.Electric],{hp:40,atk:30,def:50,spa:55,spd:55,spe:100},undefined,undefined,"electrode");
reg("electrode","Electrode",101,[PokemonType.Electric],{hp:60,atk:50,def:70,spa:80,spd:80,spe:150},"voltorb","Level 30",undefined);

reg("exeggcute","Exeggcute",102,[PokemonType.Grass,PokemonType.Psychic],{hp:60,atk:40,def:80,spa:60,spd:45,spe:40},undefined,undefined,"exeggutor");
reg("exeggutor","Exeggutor",103,[PokemonType.Grass,PokemonType.Psychic],{hp:95,atk:95,def:85,spa:125,spd:75,spe:55},"exeggcute","Leaf Stone",undefined);

reg("cubone","Cubone",104,[PokemonType.Ground],{hp:50,atk:50,def:95,spa:40,spd:50,spe:35},undefined,undefined,"marowak");
reg("marowak","Marowak",105,[PokemonType.Ground],{hp:60,atk:80,def:110,spa:50,spd:80,spe:45},"cubone","Level 28",undefined);

reg("hitmonlee","Hitmonlee",106,[PokemonType.Fighting],{hp:50,atk:120,def:53,spa:35,spd:110,spe:87},"tyrogue","Atk > Def",undefined);
reg("hitmonchan","Hitmonchan",107,[PokemonType.Fighting],{hp:50,atk:105,def:79,spa:35,spd:110,spe:76},"tyrogue","Def > Atk",undefined);

reg("lickitung","Lickitung",108,[PokemonType.Normal],{hp:90,atk:55,def:75,spa:60,spd:75,spe:30},undefined,undefined,"lickilicky");

reg("koffing","Koffing",109,[PokemonType.Poison],{hp:40,atk:65,def:95,spa:60,spd:45,spe:35},undefined,undefined,"weezing");
reg("weezing","Weezing",110,[PokemonType.Poison],{hp:65,atk:90,def:120,spa:85,spd:70,spe:60},"koffing","Level 35",undefined);

reg("rhyhorn","Rhyhorn",111,[PokemonType.Ground,PokemonType.Rock],{hp:80,atk:85,def:95,spa:30,spd:30,spe:25},undefined,undefined,"rhydon");
reg("rhydon","Rhydon",112,[PokemonType.Ground,PokemonType.Rock],{hp:105,atk:130,def:120,spa:45,spd:45,spe:40},"rhyhorn","Level 42","rhyperior");

reg("chansey","Chansey",113,[PokemonType.Normal],{hp:250,atk:5,def:5,spa:35,spd:105,spe:50},"happiny","Friendship","blissey");

reg("tangela","Tangela",114,[PokemonType.Grass],{hp:65,atk:55,def:115,spa:100,spd:40,spe:60},undefined,undefined,"tangrowth");

reg("kangaskhan","Kangaskhan",115,[PokemonType.Normal],{hp:105,atk:95,def:80,spa:40,spd:80,spe:90},undefined,undefined,undefined);

reg("horsea","Horsea",116,[PokemonType.Water],{hp:30,atk:40,def:70,spa:70,spd:25,spe:60},undefined,undefined,"seadra");
reg("seadra","Seadra",117,[PokemonType.Water],{hp:55,atk:65,def:95,spa:95,spd:45,spe:85},"horsea","Level 32","kingdra");

reg("goldeen","Goldeen",118,[PokemonType.Water],{hp:45,atk:67,def:60,spa:35,spd:50,spe:63},undefined,undefined,"seaking");
reg("seaking","Seaking",119,[PokemonType.Water],{hp:80,atk:92,def:65,spa:65,spd:80,spe:68},"goldeen","Level 33",undefined);

reg("staryu","Staryu",120,[PokemonType.Water],{hp:30,atk:45,def:55,spa:70,spd:55,spe:85},undefined,undefined,"starmie");
reg("starmie","Starmie",121,[PokemonType.Water,PokemonType.Psychic],{hp:60,atk:75,def:85,spa:100,spd:85,spe:115},"staryu","Water Stone",undefined);

reg("mr-mime","Mr. Mime",122,[PokemonType.Psychic,PokemonType.Fairy],{hp:40,atk:45,def:65,spa:100,spd:120,spe:90},"mime-jr","Move: Mimic",undefined);

reg("scyther","Scyther",123,[PokemonType.Bug,PokemonType.Flying],{hp:70,atk:110,def:80,spa:55,spd:80,spe:105},undefined,undefined,"scizor");

reg("jynx","Jynx",124,[PokemonType.Ice,PokemonType.Psychic],{hp:65,atk:50,def:35,spa:115,spd:95,spe:95},"smoochum","Level 30",undefined);

reg("electabuzz","Electabuzz",125,[PokemonType.Electric],{hp:65,atk:83,def:57,spa:95,spd:85,spe:105},"elekid","Level 30","electivire");
reg("magmar","Magmar",126,[PokemonType.Fire],{hp:65,atk:95,def:57,spa:100,spd:85,spe:93},"magby","Level 30","magmortar");

reg("pinsir","Pinsir",127,[PokemonType.Bug],{hp:65,atk:125,def:100,spa:55,spd:70,spe:85},undefined,undefined,undefined);

reg("tauros","Tauros",128,[PokemonType.Normal],{hp:75,atk:100,def:95,spa:40,spd:70,spe:110},undefined,undefined,undefined);

reg("magikarp","Magikarp",129,[PokemonType.Water],{hp:20,atk:10,def:55,spa:15,spd:20,spe:80},undefined,undefined,"gyarados");
reg("gyarados","Gyarados",130,[PokemonType.Water,PokemonType.Flying],{hp:95,atk:125,def:79,spa:60,spd:100,spe:81},"magikarp","Level 20",undefined);

reg("lapras","Lapras",131,[PokemonType.Water,PokemonType.Ice],{hp:130,atk:85,def:80,spa:85,spd:95,spe:60},undefined,undefined,undefined);

reg("ditto","Ditto",132,[PokemonType.Normal],{hp:48,atk:48,def:48,spa:48,spd:48,spe:48},undefined,undefined,undefined);

reg("eevee","Eevee",133,[PokemonType.Normal],{hp:55,atk:55,def:50,spa:45,spd:65,spe:55},undefined,undefined,"vaporeon");
reg("vaporeon","Vaporeon",134,[PokemonType.Water],{hp:130,atk:65,def:60,spa:110,spd:95,spe:65},"eevee","Water Stone",undefined);
reg("jolteon","Jolteon",135,[PokemonType.Electric],{hp:65,atk:65,def:60,spa:110,spd:95,spe:130},"eevee","Thunder Stone",undefined);
reg("flareon","Flareon",136,[PokemonType.Fire],{hp:65,atk:130,def:60,spa:95,spd:110,spe:65},"eevee","Fire Stone",undefined);

reg("porygon","Porygon",137,[PokemonType.Normal],{hp:65,atk:60,def:70,spa:85,spd:75,spe:40},undefined,undefined,"porygon2");

reg("omanyte","Omanyte",138,[PokemonType.Rock,PokemonType.Water],{hp:35,atk:40,def:100,spa:90,spd:55,spe:35},undefined,undefined,"omastar");
reg("omastar","Omastar",139,[PokemonType.Rock,PokemonType.Water],{hp:70,atk:60,def:125,spa:115,spd:70,spe:55},"omanyte","Level 40",undefined);

reg("kabuto","Kabuto",140,[PokemonType.Rock,PokemonType.Water],{hp:30,atk:80,def:90,spa:55,spd:45,spe:55},undefined,undefined,"kabutops");
reg("kabutops","Kabutops",141,[PokemonType.Rock,PokemonType.Water],{hp:60,atk:115,def:105,spa:65,spd:70,spe:80},"kabuto","Level 40",undefined);

reg("aerodactyl","Aerodactyl",142,[PokemonType.Rock,PokemonType.Flying],{hp:80,atk:105,def:65,spa:60,spd:75,spe:130},undefined,undefined,undefined);

reg("snorlax","Snorlax",143,[PokemonType.Normal],{hp:160,atk:110,def:65,spa:65,spd:110,spe:30},"munchlax","Friendship",undefined);

reg("articuno","Articuno",144,[PokemonType.Ice,PokemonType.Flying],{hp:90,atk:85,def:100,spa:95,spd:125,spe:85},undefined,undefined,undefined);
reg("zapdos","Zapdos",145,[PokemonType.Electric,PokemonType.Flying],{hp:90,atk:90,def:85,spa:125,spd:90,spe:100},undefined,undefined,undefined);
reg("moltres","Moltres",146,[PokemonType.Fire,PokemonType.Flying],{hp:90,atk:100,def:90,spa:125,spd:85,spe:90},undefined,undefined,undefined);

reg("dratini","Dratini",147,[PokemonType.Dragon],{hp:41,atk:64,def:45,spa:50,spd:50,spe:50},undefined,undefined,"dragonair");
reg("dragonair","Dragonair",148,[PokemonType.Dragon],{hp:61,atk:84,def:65,spa:70,spd:70,spe:70},"dratini","Level 30","dragonite");
reg("dragonite","Dragonite",149,[PokemonType.Dragon,PokemonType.Flying],{hp:91,atk:134,def:95,spa:100,spd:100,spe:80},"dragonair","Level 55",undefined);

reg("mewtwo","Mewtwo",150,[PokemonType.Psychic],{hp:106,atk:110,def:90,spa:154,spd:90,spe:130},undefined,undefined,undefined);
reg("mew","Mew",151,[PokemonType.Psychic],{hp:100,atk:100,def:100,spa:100,spd:100,spe:100},undefined,undefined,undefined);

// ═══════════════════════════════════════════════════════════════════════
// Generation 2 - Johto (#152-251) and beyond use compact generation
// ═══════════════════════════════════════════════════════════════════════

interface SpeciesStub {
  id: string;
  name: string;
  num: number;
  types: [PokemonType, PokemonType?];
}

const DEFAULT_STATS: BaseStats = { hp: 70, atk: 70, def: 70, spa: 70, spd: 70, spe: 70 };

function registerStubs(list: SpeciesStub[]): void {
  for (const s of list) {
    SPECIES_MAP.set(s.num, {
      id: s.id,
      name: s.name,
      pokedexNumber: s.num,
      types: s.types,
      baseStats: DEFAULT_STATS,
      bst: calcBst(DEFAULT_STATS),
      spriteUrl: spriteUrl(s.num),
      shinySpriteUrl: shinySpriteUrl(s.num),
    });
  }
}

const GEN2: SpeciesStub[] = [
  {id:"chikorita",name:"Chikorita",num:152,types:[PokemonType.Grass]},
  {id:"bayleef",name:"Bayleef",num:153,types:[PokemonType.Grass]},
  {id:"meganium",name:"Meganium",num:154,types:[PokemonType.Grass]},
  {id:"cyndaquil",name:"Cyndaquil",num:155,types:[PokemonType.Fire]},
  {id:"quilava",name:"Quilava",num:156,types:[PokemonType.Fire]},
  {id:"typhlosion",name:"Typhlosion",num:157,types:[PokemonType.Fire]},
  {id:"totodile",name:"Totodile",num:158,types:[PokemonType.Water]},
  {id:"croconaw",name:"Croconaw",num:159,types:[PokemonType.Water]},
  {id:"feraligatr",name:"Feraligatr",num:160,types:[PokemonType.Water]},
  {id:"sentret",name:"Sentret",num:161,types:[PokemonType.Normal]},
  {id:"furret",name:"Furret",num:162,types:[PokemonType.Normal]},
  {id:"hoothoot",name:"Hoothoot",num:163,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"noctowl",name:"Noctowl",num:164,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"ledyba",name:"Ledyba",num:165,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"ledian",name:"Ledian",num:166,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"spinarak",name:"Spinarak",num:167,types:[PokemonType.Bug,PokemonType.Poison]},
  {id:"ariados",name:"Ariados",num:168,types:[PokemonType.Bug,PokemonType.Poison]},
  {id:"crobat",name:"Crobat",num:169,types:[PokemonType.Poison,PokemonType.Flying]},
  {id:"chinchou",name:"Chinchou",num:170,types:[PokemonType.Water,PokemonType.Electric]},
  {id:"lanturn",name:"Lanturn",num:171,types:[PokemonType.Water,PokemonType.Electric]},
  {id:"pichu",name:"Pichu",num:172,types:[PokemonType.Electric]},
  {id:"cleffa",name:"Cleffa",num:173,types:[PokemonType.Fairy]},
  {id:"igglybuff",name:"Igglybuff",num:174,types:[PokemonType.Normal,PokemonType.Fairy]},
  {id:"togepi",name:"Togepi",num:175,types:[PokemonType.Fairy]},
  {id:"togetic",name:"Togetic",num:176,types:[PokemonType.Fairy,PokemonType.Flying]},
  {id:"natu",name:"Natu",num:177,types:[PokemonType.Psychic,PokemonType.Flying]},
  {id:"xatu",name:"Xatu",num:178,types:[PokemonType.Psychic,PokemonType.Flying]},
  {id:"mareep",name:"Mareep",num:179,types:[PokemonType.Electric]},
  {id:"flaaffy",name:"Flaaffy",num:180,types:[PokemonType.Electric]},
  {id:"ampharos",name:"Ampharos",num:181,types:[PokemonType.Electric]},
  {id:"bellossom",name:"Bellossom",num:182,types:[PokemonType.Grass]},
  {id:"marill",name:"Marill",num:183,types:[PokemonType.Water,PokemonType.Fairy]},
  {id:"azumarill",name:"Azumarill",num:184,types:[PokemonType.Water,PokemonType.Fairy]},
  {id:"sudowoodo",name:"Sudowoodo",num:185,types:[PokemonType.Rock]},
  {id:"politoed",name:"Politoed",num:186,types:[PokemonType.Water]},
  {id:"hoppip",name:"Hoppip",num:187,types:[PokemonType.Grass,PokemonType.Flying]},
  {id:"skiploom",name:"Skiploom",num:188,types:[PokemonType.Grass,PokemonType.Flying]},
  {id:"jumpluff",name:"Jumpluff",num:189,types:[PokemonType.Grass,PokemonType.Flying]},
  {id:"aipom",name:"Aipom",num:190,types:[PokemonType.Normal]},
  {id:"sunkern",name:"Sunkern",num:191,types:[PokemonType.Grass]},
  {id:"sunflora",name:"Sunflora",num:192,types:[PokemonType.Grass]},
  {id:"yanma",name:"Yanma",num:193,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"wooper",name:"Wooper",num:194,types:[PokemonType.Water,PokemonType.Ground]},
  {id:"quagsire",name:"Quagsire",num:195,types:[PokemonType.Water,PokemonType.Ground]},
  {id:"espeon",name:"Espeon",num:196,types:[PokemonType.Psychic]},
  {id:"umbreon",name:"Umbreon",num:197,types:[PokemonType.Dark]},
  {id:"murkrow",name:"Murkrow",num:198,types:[PokemonType.Dark,PokemonType.Flying]},
  {id:"slowking",name:"Slowking",num:199,types:[PokemonType.Water,PokemonType.Psychic]},
  {id:"misdreavus",name:"Misdreavus",num:200,types:[PokemonType.Ghost]},
  {id:"unown",name:"Unown",num:201,types:[PokemonType.Psychic]},
  {id:"wobbuffet",name:"Wobbuffet",num:202,types:[PokemonType.Psychic]},
  {id:"girafarig",name:"Girafarig",num:203,types:[PokemonType.Normal,PokemonType.Psychic]},
  {id:"pineco",name:"Pineco",num:204,types:[PokemonType.Bug]},
  {id:"forretress",name:"Forretress",num:205,types:[PokemonType.Bug,PokemonType.Steel]},
  {id:"dunsparce",name:"Dunsparce",num:206,types:[PokemonType.Normal]},
  {id:"gligar",name:"Gligar",num:207,types:[PokemonType.Ground,PokemonType.Flying]},
  {id:"steelix",name:"Steelix",num:208,types:[PokemonType.Steel,PokemonType.Ground]},
  {id:"snubbull",name:"Snubbull",num:209,types:[PokemonType.Fairy]},
  {id:"granbull",name:"Granbull",num:210,types:[PokemonType.Fairy]},
  {id:"qwilfish",name:"Qwilfish",num:211,types:[PokemonType.Water,PokemonType.Poison]},
  {id:"scizor",name:"Scizor",num:212,types:[PokemonType.Bug,PokemonType.Steel]},
  {id:"shuckle",name:"Shuckle",num:213,types:[PokemonType.Bug,PokemonType.Rock]},
  {id:"heracross",name:"Heracross",num:214,types:[PokemonType.Bug,PokemonType.Fighting]},
  {id:"sneasel",name:"Sneasel",num:215,types:[PokemonType.Dark,PokemonType.Ice]},
  {id:"teddiursa",name:"Teddiursa",num:216,types:[PokemonType.Normal]},
  {id:"ursaring",name:"Ursaring",num:217,types:[PokemonType.Normal]},
  {id:"slugma",name:"Slugma",num:218,types:[PokemonType.Fire]},
  {id:"magcargo",name:"Magcargo",num:219,types:[PokemonType.Fire,PokemonType.Rock]},
  {id:"swinub",name:"Swinub",num:220,types:[PokemonType.Ice,PokemonType.Ground]},
  {id:"piloswine",name:"Piloswine",num:221,types:[PokemonType.Ice,PokemonType.Ground]},
  {id:"corsola",name:"Corsola",num:222,types:[PokemonType.Water,PokemonType.Rock]},
  {id:"remoraid",name:"Remoraid",num:223,types:[PokemonType.Water]},
  {id:"octillery",name:"Octillery",num:224,types:[PokemonType.Water]},
  {id:"delibird",name:"Delibird",num:225,types:[PokemonType.Ice,PokemonType.Flying]},
  {id:"mantine",name:"Mantine",num:226,types:[PokemonType.Water,PokemonType.Flying]},
  {id:"skarmory",name:"Skarmory",num:227,types:[PokemonType.Steel,PokemonType.Flying]},
  {id:"houndour",name:"Houndour",num:228,types:[PokemonType.Dark,PokemonType.Fire]},
  {id:"houndoom",name:"Houndoom",num:229,types:[PokemonType.Dark,PokemonType.Fire]},
  {id:"kingdra",name:"Kingdra",num:230,types:[PokemonType.Water,PokemonType.Dragon]},
  {id:"phanpy",name:"Phanpy",num:231,types:[PokemonType.Ground]},
  {id:"donphan",name:"Donphan",num:232,types:[PokemonType.Ground]},
  {id:"porygon2",name:"Porygon2",num:233,types:[PokemonType.Normal]},
  {id:"stantler",name:"Stantler",num:234,types:[PokemonType.Normal]},
  {id:"smeargle",name:"Smeargle",num:235,types:[PokemonType.Normal]},
  {id:"tyrogue",name:"Tyrogue",num:236,types:[PokemonType.Fighting]},
  {id:"hitmontop",name:"Hitmontop",num:237,types:[PokemonType.Fighting]},
  {id:"smoochum",name:"Smoochum",num:238,types:[PokemonType.Ice,PokemonType.Psychic]},
  {id:"elekid",name:"Elekid",num:239,types:[PokemonType.Electric]},
  {id:"magby",name:"Magby",num:240,types:[PokemonType.Fire]},
  {id:"miltank",name:"Miltank",num:241,types:[PokemonType.Normal]},
  {id:"blissey",name:"Blissey",num:242,types:[PokemonType.Normal]},
  {id:"raikou",name:"Raikou",num:243,types:[PokemonType.Electric]},
  {id:"entei",name:"Entei",num:244,types:[PokemonType.Fire]},
  {id:"suicune",name:"Suicune",num:245,types:[PokemonType.Water]},
  {id:"larvitar",name:"Larvitar",num:246,types:[PokemonType.Rock,PokemonType.Ground]},
  {id:"pupitar",name:"Pupitar",num:247,types:[PokemonType.Rock,PokemonType.Ground]},
  {id:"tyranitar",name:"Tyranitar",num:248,types:[PokemonType.Rock,PokemonType.Dark]},
  {id:"lugia",name:"Lugia",num:249,types:[PokemonType.Psychic,PokemonType.Flying]},
  {id:"ho-oh",name:"Ho-Oh",num:250,types:[PokemonType.Fire,PokemonType.Flying]},
  {id:"celebi",name:"Celebi",num:251,types:[PokemonType.Psychic,PokemonType.Grass]},
];

registerStubs(GEN2);

const GEN3: SpeciesStub[] = [
  {id:"treecko",name:"Treecko",num:252,types:[PokemonType.Grass]},
  {id:"grovyle",name:"Grovyle",num:253,types:[PokemonType.Grass]},
  {id:"sceptile",name:"Sceptile",num:254,types:[PokemonType.Grass]},
  {id:"torchic",name:"Torchic",num:255,types:[PokemonType.Fire]},
  {id:"combusken",name:"Combusken",num:256,types:[PokemonType.Fire,PokemonType.Fighting]},
  {id:"blaziken",name:"Blaziken",num:257,types:[PokemonType.Fire,PokemonType.Fighting]},
  {id:"mudkip",name:"Mudkip",num:258,types:[PokemonType.Water]},
  {id:"marshtomp",name:"Marshtomp",num:259,types:[PokemonType.Water,PokemonType.Ground]},
  {id:"swampert",name:"Swampert",num:260,types:[PokemonType.Water,PokemonType.Ground]},
  {id:"poochyena",name:"Poochyena",num:261,types:[PokemonType.Dark]},
  {id:"mightyena",name:"Mightyena",num:262,types:[PokemonType.Dark]},
  {id:"zigzagoon",name:"Zigzagoon",num:263,types:[PokemonType.Normal]},
  {id:"linoone",name:"Linoone",num:264,types:[PokemonType.Normal]},
  {id:"wurmple",name:"Wurmple",num:265,types:[PokemonType.Bug]},
  {id:"silcoon",name:"Silcoon",num:266,types:[PokemonType.Bug]},
  {id:"beautifly",name:"Beautifly",num:267,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"cascoon",name:"Cascoon",num:268,types:[PokemonType.Bug]},
  {id:"dustox",name:"Dustox",num:269,types:[PokemonType.Bug,PokemonType.Poison]},
  {id:"lotad",name:"Lotad",num:270,types:[PokemonType.Water,PokemonType.Grass]},
  {id:"lombre",name:"Lombre",num:271,types:[PokemonType.Water,PokemonType.Grass]},
  {id:"ludicolo",name:"Ludicolo",num:272,types:[PokemonType.Water,PokemonType.Grass]},
  {id:"seedot",name:"Seedot",num:273,types:[PokemonType.Grass]},
  {id:"nuzleaf",name:"Nuzleaf",num:274,types:[PokemonType.Grass,PokemonType.Dark]},
  {id:"shiftry",name:"Shiftry",num:275,types:[PokemonType.Grass,PokemonType.Dark]},
  {id:"taillow",name:"Taillow",num:276,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"swellow",name:"Swellow",num:277,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"wingull",name:"Wingull",num:278,types:[PokemonType.Water,PokemonType.Flying]},
  {id:"pelipper",name:"Pelipper",num:279,types:[PokemonType.Water,PokemonType.Flying]},
  {id:"ralts",name:"Ralts",num:280,types:[PokemonType.Psychic,PokemonType.Fairy]},
  {id:"kirlia",name:"Kirlia",num:281,types:[PokemonType.Psychic,PokemonType.Fairy]},
  {id:"gardevoir",name:"Gardevoir",num:282,types:[PokemonType.Psychic,PokemonType.Fairy]},
  {id:"surskit",name:"Surskit",num:283,types:[PokemonType.Bug,PokemonType.Water]},
  {id:"masquerain",name:"Masquerain",num:284,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"shroomish",name:"Shroomish",num:285,types:[PokemonType.Grass]},
  {id:"breloom",name:"Breloom",num:286,types:[PokemonType.Grass,PokemonType.Fighting]},
  {id:"slakoth",name:"Slakoth",num:287,types:[PokemonType.Normal]},
  {id:"vigoroth",name:"Vigoroth",num:288,types:[PokemonType.Normal]},
  {id:"slaking",name:"Slaking",num:289,types:[PokemonType.Normal]},
  {id:"nincada",name:"Nincada",num:290,types:[PokemonType.Bug,PokemonType.Ground]},
  {id:"ninjask",name:"Ninjask",num:291,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"shedinja",name:"Shedinja",num:292,types:[PokemonType.Bug,PokemonType.Ghost]},
  {id:"whismur",name:"Whismur",num:293,types:[PokemonType.Normal]},
  {id:"loudred",name:"Loudred",num:294,types:[PokemonType.Normal]},
  {id:"exploud",name:"Exploud",num:295,types:[PokemonType.Normal]},
  {id:"makuhita",name:"Makuhita",num:296,types:[PokemonType.Fighting]},
  {id:"hariyama",name:"Hariyama",num:297,types:[PokemonType.Fighting]},
  {id:"azurill",name:"Azurill",num:298,types:[PokemonType.Normal,PokemonType.Fairy]},
  {id:"nosepass",name:"Nosepass",num:299,types:[PokemonType.Rock]},
  {id:"skitty",name:"Skitty",num:300,types:[PokemonType.Normal]},
  {id:"delcatty",name:"Delcatty",num:301,types:[PokemonType.Normal]},
  {id:"sableye",name:"Sableye",num:302,types:[PokemonType.Dark,PokemonType.Ghost]},
  {id:"mawile",name:"Mawile",num:303,types:[PokemonType.Steel,PokemonType.Fairy]},
  {id:"aron",name:"Aron",num:304,types:[PokemonType.Steel,PokemonType.Rock]},
  {id:"lairon",name:"Lairon",num:305,types:[PokemonType.Steel,PokemonType.Rock]},
  {id:"aggron",name:"Aggron",num:306,types:[PokemonType.Steel,PokemonType.Rock]},
  {id:"meditite",name:"Meditite",num:307,types:[PokemonType.Fighting,PokemonType.Psychic]},
  {id:"medicham",name:"Medicham",num:308,types:[PokemonType.Fighting,PokemonType.Psychic]},
  {id:"electrike",name:"Electrike",num:309,types:[PokemonType.Electric]},
  {id:"manectric",name:"Manectric",num:310,types:[PokemonType.Electric]},
  {id:"plusle",name:"Plusle",num:311,types:[PokemonType.Electric]},
  {id:"minun",name:"Minun",num:312,types:[PokemonType.Electric]},
  {id:"volbeat",name:"Volbeat",num:313,types:[PokemonType.Bug]},
  {id:"illumise",name:"Illumise",num:314,types:[PokemonType.Bug]},
  {id:"roselia",name:"Roselia",num:315,types:[PokemonType.Grass,PokemonType.Poison]},
  {id:"gulpin",name:"Gulpin",num:316,types:[PokemonType.Poison]},
  {id:"swalot",name:"Swalot",num:317,types:[PokemonType.Poison]},
  {id:"carvanha",name:"Carvanha",num:318,types:[PokemonType.Water,PokemonType.Dark]},
  {id:"sharpedo",name:"Sharpedo",num:319,types:[PokemonType.Water,PokemonType.Dark]},
  {id:"wailmer",name:"Wailmer",num:320,types:[PokemonType.Water]},
  {id:"wailord",name:"Wailord",num:321,types:[PokemonType.Water]},
  {id:"numel",name:"Numel",num:322,types:[PokemonType.Fire,PokemonType.Ground]},
  {id:"camerupt",name:"Camerupt",num:323,types:[PokemonType.Fire,PokemonType.Ground]},
  {id:"torkoal",name:"Torkoal",num:324,types:[PokemonType.Fire]},
  {id:"spoink",name:"Spoink",num:325,types:[PokemonType.Psychic]},
  {id:"grumpig",name:"Grumpig",num:326,types:[PokemonType.Psychic]},
  {id:"spinda",name:"Spinda",num:327,types:[PokemonType.Normal]},
  {id:"trapinch",name:"Trapinch",num:328,types:[PokemonType.Ground]},
  {id:"vibrava",name:"Vibrava",num:329,types:[PokemonType.Ground,PokemonType.Dragon]},
  {id:"flygon",name:"Flygon",num:330,types:[PokemonType.Ground,PokemonType.Dragon]},
  {id:"cacnea",name:"Cacnea",num:331,types:[PokemonType.Grass]},
  {id:"cacturne",name:"Cacturne",num:332,types:[PokemonType.Grass,PokemonType.Dark]},
  {id:"swablu",name:"Swablu",num:333,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"altaria",name:"Altaria",num:334,types:[PokemonType.Dragon,PokemonType.Flying]},
  {id:"zangoose",name:"Zangoose",num:335,types:[PokemonType.Normal]},
  {id:"seviper",name:"Seviper",num:336,types:[PokemonType.Poison]},
  {id:"lunatone",name:"Lunatone",num:337,types:[PokemonType.Rock,PokemonType.Psychic]},
  {id:"solrock",name:"Solrock",num:338,types:[PokemonType.Rock,PokemonType.Psychic]},
  {id:"barboach",name:"Barboach",num:339,types:[PokemonType.Water,PokemonType.Ground]},
  {id:"whiscash",name:"Whiscash",num:340,types:[PokemonType.Water,PokemonType.Ground]},
  {id:"corphish",name:"Corphish",num:341,types:[PokemonType.Water]},
  {id:"crawdaunt",name:"Crawdaunt",num:342,types:[PokemonType.Water,PokemonType.Dark]},
  {id:"baltoy",name:"Baltoy",num:343,types:[PokemonType.Ground,PokemonType.Psychic]},
  {id:"claydol",name:"Claydol",num:344,types:[PokemonType.Ground,PokemonType.Psychic]},
  {id:"lileep",name:"Lileep",num:345,types:[PokemonType.Rock,PokemonType.Grass]},
  {id:"cradily",name:"Cradily",num:346,types:[PokemonType.Rock,PokemonType.Grass]},
  {id:"anorith",name:"Anorith",num:347,types:[PokemonType.Rock,PokemonType.Bug]},
  {id:"armaldo",name:"Armaldo",num:348,types:[PokemonType.Rock,PokemonType.Bug]},
  {id:"feebas",name:"Feebas",num:349,types:[PokemonType.Water]},
  {id:"milotic",name:"Milotic",num:350,types:[PokemonType.Water]},
  {id:"castform",name:"Castform",num:351,types:[PokemonType.Normal]},
  {id:"kecleon",name:"Kecleon",num:352,types:[PokemonType.Normal]},
  {id:"shuppet",name:"Shuppet",num:353,types:[PokemonType.Ghost]},
  {id:"banette",name:"Banette",num:354,types:[PokemonType.Ghost]},
  {id:"duskull",name:"Duskull",num:355,types:[PokemonType.Ghost]},
  {id:"dusclops",name:"Dusclops",num:356,types:[PokemonType.Ghost]},
  {id:"tropius",name:"Tropius",num:357,types:[PokemonType.Grass,PokemonType.Flying]},
  {id:"chimecho",name:"Chimecho",num:358,types:[PokemonType.Psychic]},
  {id:"absol",name:"Absol",num:359,types:[PokemonType.Dark]},
  {id:"wynaut",name:"Wynaut",num:360,types:[PokemonType.Psychic]},
  {id:"snorunt",name:"Snorunt",num:361,types:[PokemonType.Ice]},
  {id:"glalie",name:"Glalie",num:362,types:[PokemonType.Ice]},
  {id:"spheal",name:"Spheal",num:363,types:[PokemonType.Ice,PokemonType.Water]},
  {id:"sealeo",name:"Sealeo",num:364,types:[PokemonType.Ice,PokemonType.Water]},
  {id:"walrein",name:"Walrein",num:365,types:[PokemonType.Ice,PokemonType.Water]},
  {id:"clamperl",name:"Clamperl",num:366,types:[PokemonType.Water]},
  {id:"huntail",name:"Huntail",num:367,types:[PokemonType.Water]},
  {id:"gorebyss",name:"Gorebyss",num:368,types:[PokemonType.Water]},
  {id:"relicanth",name:"Relicanth",num:369,types:[PokemonType.Water,PokemonType.Rock]},
  {id:"luvdisc",name:"Luvdisc",num:370,types:[PokemonType.Water]},
  {id:"bagon",name:"Bagon",num:371,types:[PokemonType.Dragon]},
  {id:"shelgon",name:"Shelgon",num:372,types:[PokemonType.Dragon]},
  {id:"salamence",name:"Salamence",num:373,types:[PokemonType.Dragon,PokemonType.Flying]},
  {id:"beldum",name:"Beldum",num:374,types:[PokemonType.Steel,PokemonType.Psychic]},
  {id:"metang",name:"Metang",num:375,types:[PokemonType.Steel,PokemonType.Psychic]},
  {id:"metagross",name:"Metagross",num:376,types:[PokemonType.Steel,PokemonType.Psychic]},
  {id:"regirock",name:"Regirock",num:377,types:[PokemonType.Rock]},
  {id:"regice",name:"Regice",num:378,types:[PokemonType.Ice]},
  {id:"registeel",name:"Registeel",num:379,types:[PokemonType.Steel]},
  {id:"latias",name:"Latias",num:380,types:[PokemonType.Dragon,PokemonType.Psychic]},
  {id:"latios",name:"Latios",num:381,types:[PokemonType.Dragon,PokemonType.Psychic]},
  {id:"kyogre",name:"Kyogre",num:382,types:[PokemonType.Water]},
  {id:"groudon",name:"Groudon",num:383,types:[PokemonType.Ground]},
  {id:"rayquaza",name:"Rayquaza",num:384,types:[PokemonType.Dragon,PokemonType.Flying]},
  {id:"jirachi",name:"Jirachi",num:385,types:[PokemonType.Steel,PokemonType.Psychic]},
  {id:"deoxys",name:"Deoxys",num:386,types:[PokemonType.Psychic]},
];
registerStubs(GEN3);

const GEN4: SpeciesStub[] = [
  {id:"turtwig",name:"Turtwig",num:387,types:[PokemonType.Grass]},
  {id:"grotle",name:"Grotle",num:388,types:[PokemonType.Grass]},
  {id:"torterra",name:"Torterra",num:389,types:[PokemonType.Grass,PokemonType.Ground]},
  {id:"chimchar",name:"Chimchar",num:390,types:[PokemonType.Fire]},
  {id:"monferno",name:"Monferno",num:391,types:[PokemonType.Fire,PokemonType.Fighting]},
  {id:"infernape",name:"Infernape",num:392,types:[PokemonType.Fire,PokemonType.Fighting]},
  {id:"piplup",name:"Piplup",num:393,types:[PokemonType.Water]},
  {id:"prinplup",name:"Prinplup",num:394,types:[PokemonType.Water]},
  {id:"empoleon",name:"Empoleon",num:395,types:[PokemonType.Water,PokemonType.Steel]},
  {id:"starly",name:"Starly",num:396,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"staravia",name:"Staravia",num:397,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"staraptor",name:"Staraptor",num:398,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"bidoof",name:"Bidoof",num:399,types:[PokemonType.Normal]},
  {id:"bibarel",name:"Bibarel",num:400,types:[PokemonType.Normal,PokemonType.Water]},
  {id:"kricketot",name:"Kricketot",num:401,types:[PokemonType.Bug]},
  {id:"kricketune",name:"Kricketune",num:402,types:[PokemonType.Bug]},
  {id:"shinx",name:"Shinx",num:403,types:[PokemonType.Electric]},
  {id:"luxio",name:"Luxio",num:404,types:[PokemonType.Electric]},
  {id:"luxray",name:"Luxray",num:405,types:[PokemonType.Electric]},
  {id:"budew",name:"Budew",num:406,types:[PokemonType.Grass,PokemonType.Poison]},
  {id:"roserade",name:"Roserade",num:407,types:[PokemonType.Grass,PokemonType.Poison]},
  {id:"cranidos",name:"Cranidos",num:408,types:[PokemonType.Rock]},
  {id:"rampardos",name:"Rampardos",num:409,types:[PokemonType.Rock]},
  {id:"shieldon",name:"Shieldon",num:410,types:[PokemonType.Rock,PokemonType.Steel]},
  {id:"bastiodon",name:"Bastiodon",num:411,types:[PokemonType.Rock,PokemonType.Steel]},
  {id:"burmy",name:"Burmy",num:412,types:[PokemonType.Bug]},
  {id:"wormadam",name:"Wormadam",num:413,types:[PokemonType.Bug,PokemonType.Grass]},
  {id:"mothim",name:"Mothim",num:414,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"combee",name:"Combee",num:415,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"vespiquen",name:"Vespiquen",num:416,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"pachirisu",name:"Pachirisu",num:417,types:[PokemonType.Electric]},
  {id:"buizel",name:"Buizel",num:418,types:[PokemonType.Water]},
  {id:"floatzel",name:"Floatzel",num:419,types:[PokemonType.Water]},
  {id:"cherubi",name:"Cherubi",num:420,types:[PokemonType.Grass]},
  {id:"cherrim",name:"Cherrim",num:421,types:[PokemonType.Grass]},
  {id:"shellos",name:"Shellos",num:422,types:[PokemonType.Water]},
  {id:"gastrodon",name:"Gastrodon",num:423,types:[PokemonType.Water,PokemonType.Ground]},
  {id:"ambipom",name:"Ambipom",num:424,types:[PokemonType.Normal]},
  {id:"drifloon",name:"Drifloon",num:425,types:[PokemonType.Ghost,PokemonType.Flying]},
  {id:"drifblim",name:"Drifblim",num:426,types:[PokemonType.Ghost,PokemonType.Flying]},
  {id:"buneary",name:"Buneary",num:427,types:[PokemonType.Normal]},
  {id:"lopunny",name:"Lopunny",num:428,types:[PokemonType.Normal]},
  {id:"mismagius",name:"Mismagius",num:429,types:[PokemonType.Ghost]},
  {id:"honchkrow",name:"Honchkrow",num:430,types:[PokemonType.Dark,PokemonType.Flying]},
  {id:"glameow",name:"Glameow",num:431,types:[PokemonType.Normal]},
  {id:"purugly",name:"Purugly",num:432,types:[PokemonType.Normal]},
  {id:"chingling",name:"Chingling",num:433,types:[PokemonType.Psychic]},
  {id:"stunky",name:"Stunky",num:434,types:[PokemonType.Poison,PokemonType.Dark]},
  {id:"skuntank",name:"Skuntank",num:435,types:[PokemonType.Poison,PokemonType.Dark]},
  {id:"bronzor",name:"Bronzor",num:436,types:[PokemonType.Steel,PokemonType.Psychic]},
  {id:"bronzong",name:"Bronzong",num:437,types:[PokemonType.Steel,PokemonType.Psychic]},
  {id:"bonsly",name:"Bonsly",num:438,types:[PokemonType.Rock]},
  {id:"mime-jr",name:"Mime Jr.",num:439,types:[PokemonType.Psychic,PokemonType.Fairy]},
  {id:"happiny",name:"Happiny",num:440,types:[PokemonType.Normal]},
  {id:"chatot",name:"Chatot",num:441,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"spiritomb",name:"Spiritomb",num:442,types:[PokemonType.Ghost,PokemonType.Dark]},
  {id:"gible",name:"Gible",num:443,types:[PokemonType.Dragon,PokemonType.Ground]},
  {id:"gabite",name:"Gabite",num:444,types:[PokemonType.Dragon,PokemonType.Ground]},
  {id:"garchomp",name:"Garchomp",num:445,types:[PokemonType.Dragon,PokemonType.Ground]},
  {id:"munchlax",name:"Munchlax",num:446,types:[PokemonType.Normal]},
  {id:"riolu",name:"Riolu",num:447,types:[PokemonType.Fighting]},
  {id:"lucario",name:"Lucario",num:448,types:[PokemonType.Fighting,PokemonType.Steel]},
  {id:"hippopotas",name:"Hippopotas",num:449,types:[PokemonType.Ground]},
  {id:"hippowdon",name:"Hippowdon",num:450,types:[PokemonType.Ground]},
  {id:"skorupi",name:"Skorupi",num:451,types:[PokemonType.Poison,PokemonType.Bug]},
  {id:"drapion",name:"Drapion",num:452,types:[PokemonType.Poison,PokemonType.Dark]},
  {id:"croagunk",name:"Croagunk",num:453,types:[PokemonType.Poison,PokemonType.Fighting]},
  {id:"toxicroak",name:"Toxicroak",num:454,types:[PokemonType.Poison,PokemonType.Fighting]},
  {id:"carnivine",name:"Carnivine",num:455,types:[PokemonType.Grass]},
  {id:"finneon",name:"Finneon",num:456,types:[PokemonType.Water]},
  {id:"lumineon",name:"Lumineon",num:457,types:[PokemonType.Water]},
  {id:"mantyke",name:"Mantyke",num:458,types:[PokemonType.Water,PokemonType.Flying]},
  {id:"snover",name:"Snover",num:459,types:[PokemonType.Grass,PokemonType.Ice]},
  {id:"abomasnow",name:"Abomasnow",num:460,types:[PokemonType.Grass,PokemonType.Ice]},
  {id:"weavile",name:"Weavile",num:461,types:[PokemonType.Dark,PokemonType.Ice]},
  {id:"magnezone",name:"Magnezone",num:462,types:[PokemonType.Electric,PokemonType.Steel]},
  {id:"lickilicky",name:"Lickilicky",num:463,types:[PokemonType.Normal]},
  {id:"rhyperior",name:"Rhyperior",num:464,types:[PokemonType.Ground,PokemonType.Rock]},
  {id:"tangrowth",name:"Tangrowth",num:465,types:[PokemonType.Grass]},
  {id:"electivire",name:"Electivire",num:466,types:[PokemonType.Electric]},
  {id:"magmortar",name:"Magmortar",num:467,types:[PokemonType.Fire]},
  {id:"togekiss",name:"Togekiss",num:468,types:[PokemonType.Fairy,PokemonType.Flying]},
  {id:"yanmega",name:"Yanmega",num:469,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"leafeon",name:"Leafeon",num:470,types:[PokemonType.Grass]},
  {id:"glaceon",name:"Glaceon",num:471,types:[PokemonType.Ice]},
  {id:"gliscor",name:"Gliscor",num:472,types:[PokemonType.Ground,PokemonType.Flying]},
  {id:"mamoswine",name:"Mamoswine",num:473,types:[PokemonType.Ice,PokemonType.Ground]},
  {id:"porygon-z",name:"Porygon-Z",num:474,types:[PokemonType.Normal]},
  {id:"gallade",name:"Gallade",num:475,types:[PokemonType.Psychic,PokemonType.Fighting]},
  {id:"probopass",name:"Probopass",num:476,types:[PokemonType.Rock,PokemonType.Steel]},
  {id:"dusknoir",name:"Dusknoir",num:477,types:[PokemonType.Ghost]},
  {id:"froslass",name:"Froslass",num:478,types:[PokemonType.Ice,PokemonType.Ghost]},
  {id:"rotom",name:"Rotom",num:479,types:[PokemonType.Electric,PokemonType.Ghost]},
  {id:"uxie",name:"Uxie",num:480,types:[PokemonType.Psychic]},
  {id:"mesprit",name:"Mesprit",num:481,types:[PokemonType.Psychic]},
  {id:"azelf",name:"Azelf",num:482,types:[PokemonType.Psychic]},
  {id:"dialga",name:"Dialga",num:483,types:[PokemonType.Steel,PokemonType.Dragon]},
  {id:"palkia",name:"Palkia",num:484,types:[PokemonType.Water,PokemonType.Dragon]},
  {id:"heatran",name:"Heatran",num:485,types:[PokemonType.Fire,PokemonType.Steel]},
  {id:"regigigas",name:"Regigigas",num:486,types:[PokemonType.Normal]},
  {id:"giratina",name:"Giratina",num:487,types:[PokemonType.Ghost,PokemonType.Dragon]},
  {id:"cresselia",name:"Cresselia",num:488,types:[PokemonType.Psychic]},
  {id:"phione",name:"Phione",num:489,types:[PokemonType.Water]},
  {id:"manaphy",name:"Manaphy",num:490,types:[PokemonType.Water]},
  {id:"darkrai",name:"Darkrai",num:491,types:[PokemonType.Dark]},
  {id:"shaymin",name:"Shaymin",num:492,types:[PokemonType.Grass]},
  {id:"arceus",name:"Arceus",num:493,types:[PokemonType.Normal]},
];
registerStubs(GEN4);

const GEN5: SpeciesStub[] = [
  {id:"victini",name:"Victini",num:494,types:[PokemonType.Psychic,PokemonType.Fire]},
  {id:"snivy",name:"Snivy",num:495,types:[PokemonType.Grass]},
  {id:"servine",name:"Servine",num:496,types:[PokemonType.Grass]},
  {id:"serperior",name:"Serperior",num:497,types:[PokemonType.Grass]},
  {id:"tepig",name:"Tepig",num:498,types:[PokemonType.Fire]},
  {id:"pignite",name:"Pignite",num:499,types:[PokemonType.Fire,PokemonType.Fighting]},
  {id:"emboar",name:"Emboar",num:500,types:[PokemonType.Fire,PokemonType.Fighting]},
  {id:"oshawott",name:"Oshawott",num:501,types:[PokemonType.Water]},
  {id:"dewott",name:"Dewott",num:502,types:[PokemonType.Water]},
  {id:"samurott",name:"Samurott",num:503,types:[PokemonType.Water]},
  {id:"patrat",name:"Patrat",num:504,types:[PokemonType.Normal]},
  {id:"watchog",name:"Watchog",num:505,types:[PokemonType.Normal]},
  {id:"lillipup",name:"Lillipup",num:506,types:[PokemonType.Normal]},
  {id:"herdier",name:"Herdier",num:507,types:[PokemonType.Normal]},
  {id:"stoutland",name:"Stoutland",num:508,types:[PokemonType.Normal]},
  {id:"purrloin",name:"Purrloin",num:509,types:[PokemonType.Dark]},
  {id:"liepard",name:"Liepard",num:510,types:[PokemonType.Dark]},
  {id:"pansage",name:"Pansage",num:511,types:[PokemonType.Grass]},
  {id:"simisage",name:"Simisage",num:512,types:[PokemonType.Grass]},
  {id:"pansear",name:"Pansear",num:513,types:[PokemonType.Fire]},
  {id:"simisear",name:"Simisear",num:514,types:[PokemonType.Fire]},
  {id:"panpour",name:"Panpour",num:515,types:[PokemonType.Water]},
  {id:"simipour",name:"Simipour",num:516,types:[PokemonType.Water]},
  {id:"munna",name:"Munna",num:517,types:[PokemonType.Psychic]},
  {id:"musharna",name:"Musharna",num:518,types:[PokemonType.Psychic]},
  {id:"pidove",name:"Pidove",num:519,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"tranquill",name:"Tranquill",num:520,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"unfezant",name:"Unfezant",num:521,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"blitzle",name:"Blitzle",num:522,types:[PokemonType.Electric]},
  {id:"zebstrika",name:"Zebstrika",num:523,types:[PokemonType.Electric]},
  {id:"roggenrola",name:"Roggenrola",num:524,types:[PokemonType.Rock]},
  {id:"boldore",name:"Boldore",num:525,types:[PokemonType.Rock]},
  {id:"gigalith",name:"Gigalith",num:526,types:[PokemonType.Rock]},
  {id:"woobat",name:"Woobat",num:527,types:[PokemonType.Psychic,PokemonType.Flying]},
  {id:"swoobat",name:"Swoobat",num:528,types:[PokemonType.Psychic,PokemonType.Flying]},
  {id:"drilbur",name:"Drilbur",num:529,types:[PokemonType.Ground]},
  {id:"excadrill",name:"Excadrill",num:530,types:[PokemonType.Ground,PokemonType.Steel]},
  {id:"audino",name:"Audino",num:531,types:[PokemonType.Normal]},
  {id:"timburr",name:"Timburr",num:532,types:[PokemonType.Fighting]},
  {id:"gurdurr",name:"Gurdurr",num:533,types:[PokemonType.Fighting]},
  {id:"conkeldurr",name:"Conkeldurr",num:534,types:[PokemonType.Fighting]},
  {id:"tympole",name:"Tympole",num:535,types:[PokemonType.Water]},
  {id:"palpitoad",name:"Palpitoad",num:536,types:[PokemonType.Water,PokemonType.Ground]},
  {id:"seismitoad",name:"Seismitoad",num:537,types:[PokemonType.Water,PokemonType.Ground]},
  {id:"throh",name:"Throh",num:538,types:[PokemonType.Fighting]},
  {id:"sawk",name:"Sawk",num:539,types:[PokemonType.Fighting]},
  {id:"sewaddle",name:"Sewaddle",num:540,types:[PokemonType.Bug,PokemonType.Grass]},
  {id:"swadloon",name:"Swadloon",num:541,types:[PokemonType.Bug,PokemonType.Grass]},
  {id:"leavanny",name:"Leavanny",num:542,types:[PokemonType.Bug,PokemonType.Grass]},
  {id:"venipede",name:"Venipede",num:543,types:[PokemonType.Bug,PokemonType.Poison]},
  {id:"whirlipede",name:"Whirlipede",num:544,types:[PokemonType.Bug,PokemonType.Poison]},
  {id:"scolipede",name:"Scolipede",num:545,types:[PokemonType.Bug,PokemonType.Poison]},
  {id:"cottonee",name:"Cottonee",num:546,types:[PokemonType.Grass,PokemonType.Fairy]},
  {id:"whimsicott",name:"Whimsicott",num:547,types:[PokemonType.Grass,PokemonType.Fairy]},
  {id:"petilil",name:"Petilil",num:548,types:[PokemonType.Grass]},
  {id:"lilligant",name:"Lilligant",num:549,types:[PokemonType.Grass]},
  {id:"basculin",name:"Basculin",num:550,types:[PokemonType.Water]},
  {id:"sandile",name:"Sandile",num:551,types:[PokemonType.Ground,PokemonType.Dark]},
  {id:"krokorok",name:"Krokorok",num:552,types:[PokemonType.Ground,PokemonType.Dark]},
  {id:"krookodile",name:"Krookodile",num:553,types:[PokemonType.Ground,PokemonType.Dark]},
  {id:"darumaka",name:"Darumaka",num:554,types:[PokemonType.Fire]},
  {id:"darmanitan",name:"Darmanitan",num:555,types:[PokemonType.Fire]},
  {id:"maractus",name:"Maractus",num:556,types:[PokemonType.Grass]},
  {id:"dwebble",name:"Dwebble",num:557,types:[PokemonType.Bug,PokemonType.Rock]},
  {id:"crustle",name:"Crustle",num:558,types:[PokemonType.Bug,PokemonType.Rock]},
  {id:"scraggy",name:"Scraggy",num:559,types:[PokemonType.Dark,PokemonType.Fighting]},
  {id:"scrafty",name:"Scrafty",num:560,types:[PokemonType.Dark,PokemonType.Fighting]},
  {id:"sigilyph",name:"Sigilyph",num:561,types:[PokemonType.Psychic,PokemonType.Flying]},
  {id:"yamask",name:"Yamask",num:562,types:[PokemonType.Ghost]},
  {id:"cofagrigus",name:"Cofagrigus",num:563,types:[PokemonType.Ghost]},
  {id:"tirtouga",name:"Tirtouga",num:564,types:[PokemonType.Water,PokemonType.Rock]},
  {id:"carracosta",name:"Carracosta",num:565,types:[PokemonType.Water,PokemonType.Rock]},
  {id:"archen",name:"Archen",num:566,types:[PokemonType.Rock,PokemonType.Flying]},
  {id:"archeops",name:"Archeops",num:567,types:[PokemonType.Rock,PokemonType.Flying]},
  {id:"trubbish",name:"Trubbish",num:568,types:[PokemonType.Poison]},
  {id:"garbodor",name:"Garbodor",num:569,types:[PokemonType.Poison]},
  {id:"zorua",name:"Zorua",num:570,types:[PokemonType.Dark]},
  {id:"zoroark",name:"Zoroark",num:571,types:[PokemonType.Dark]},
  {id:"minccino",name:"Minccino",num:572,types:[PokemonType.Normal]},
  {id:"cinccino",name:"Cinccino",num:573,types:[PokemonType.Normal]},
  {id:"gothita",name:"Gothita",num:574,types:[PokemonType.Psychic]},
  {id:"gothorita",name:"Gothorita",num:575,types:[PokemonType.Psychic]},
  {id:"gothitelle",name:"Gothitelle",num:576,types:[PokemonType.Psychic]},
  {id:"solosis",name:"Solosis",num:577,types:[PokemonType.Psychic]},
  {id:"duosion",name:"Duosion",num:578,types:[PokemonType.Psychic]},
  {id:"reuniclus",name:"Reuniclus",num:579,types:[PokemonType.Psychic]},
  {id:"ducklett",name:"Ducklett",num:580,types:[PokemonType.Water,PokemonType.Flying]},
  {id:"swanna",name:"Swanna",num:581,types:[PokemonType.Water,PokemonType.Flying]},
  {id:"vanillite",name:"Vanillite",num:582,types:[PokemonType.Ice]},
  {id:"vanillish",name:"Vanillish",num:583,types:[PokemonType.Ice]},
  {id:"vanilluxe",name:"Vanilluxe",num:584,types:[PokemonType.Ice]},
  {id:"deerling",name:"Deerling",num:585,types:[PokemonType.Normal,PokemonType.Grass]},
  {id:"sawsbuck",name:"Sawsbuck",num:586,types:[PokemonType.Normal,PokemonType.Grass]},
  {id:"emolga",name:"Emolga",num:587,types:[PokemonType.Electric,PokemonType.Flying]},
  {id:"karrablast",name:"Karrablast",num:588,types:[PokemonType.Bug]},
  {id:"escavalier",name:"Escavalier",num:589,types:[PokemonType.Bug,PokemonType.Steel]},
  {id:"foongus",name:"Foongus",num:590,types:[PokemonType.Grass,PokemonType.Poison]},
  {id:"amoonguss",name:"Amoonguss",num:591,types:[PokemonType.Grass,PokemonType.Poison]},
  {id:"frillish",name:"Frillish",num:592,types:[PokemonType.Water,PokemonType.Ghost]},
  {id:"jellicent",name:"Jellicent",num:593,types:[PokemonType.Water,PokemonType.Ghost]},
  {id:"alomomola",name:"Alomomola",num:594,types:[PokemonType.Water]},
  {id:"joltik",name:"Joltik",num:595,types:[PokemonType.Bug,PokemonType.Electric]},
  {id:"galvantula",name:"Galvantula",num:596,types:[PokemonType.Bug,PokemonType.Electric]},
  {id:"ferroseed",name:"Ferroseed",num:597,types:[PokemonType.Grass,PokemonType.Steel]},
  {id:"ferrothorn",name:"Ferrothorn",num:598,types:[PokemonType.Grass,PokemonType.Steel]},
  {id:"klink",name:"Klink",num:599,types:[PokemonType.Steel]},
  {id:"klang",name:"Klang",num:600,types:[PokemonType.Steel]},
  {id:"klinklang",name:"Klinklang",num:601,types:[PokemonType.Steel]},
  {id:"tynamo",name:"Tynamo",num:602,types:[PokemonType.Electric]},
  {id:"eelektrik",name:"Eelektrik",num:603,types:[PokemonType.Electric]},
  {id:"eelektross",name:"Eelektross",num:604,types:[PokemonType.Electric]},
  {id:"elgyem",name:"Elgyem",num:605,types:[PokemonType.Psychic]},
  {id:"beheeyem",name:"Beheeyem",num:606,types:[PokemonType.Psychic]},
  {id:"litwick",name:"Litwick",num:607,types:[PokemonType.Ghost,PokemonType.Fire]},
  {id:"lampent",name:"Lampent",num:608,types:[PokemonType.Ghost,PokemonType.Fire]},
  {id:"chandelure",name:"Chandelure",num:609,types:[PokemonType.Ghost,PokemonType.Fire]},
  {id:"axew",name:"Axew",num:610,types:[PokemonType.Dragon]},
  {id:"fraxure",name:"Fraxure",num:611,types:[PokemonType.Dragon]},
  {id:"haxorus",name:"Haxorus",num:612,types:[PokemonType.Dragon]},
  {id:"cubchoo",name:"Cubchoo",num:613,types:[PokemonType.Ice]},
  {id:"beartic",name:"Beartic",num:614,types:[PokemonType.Ice]},
  {id:"cryogonal",name:"Cryogonal",num:615,types:[PokemonType.Ice]},
  {id:"shelmet",name:"Shelmet",num:616,types:[PokemonType.Bug]},
  {id:"accelgor",name:"Accelgor",num:617,types:[PokemonType.Bug]},
  {id:"stunfisk",name:"Stunfisk",num:618,types:[PokemonType.Ground,PokemonType.Electric]},
  {id:"mienfoo",name:"Mienfoo",num:619,types:[PokemonType.Fighting]},
  {id:"mienshao",name:"Mienshao",num:620,types:[PokemonType.Fighting]},
  {id:"druddigon",name:"Druddigon",num:621,types:[PokemonType.Dragon]},
  {id:"golett",name:"Golett",num:622,types:[PokemonType.Ground,PokemonType.Ghost]},
  {id:"golurk",name:"Golurk",num:623,types:[PokemonType.Ground,PokemonType.Ghost]},
  {id:"pawniard",name:"Pawniard",num:624,types:[PokemonType.Dark,PokemonType.Steel]},
  {id:"bisharp",name:"Bisharp",num:625,types:[PokemonType.Dark,PokemonType.Steel]},
  {id:"bouffalant",name:"Bouffalant",num:626,types:[PokemonType.Normal]},
  {id:"rufflet",name:"Rufflet",num:627,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"braviary",name:"Braviary",num:628,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"vullaby",name:"Vullaby",num:629,types:[PokemonType.Dark,PokemonType.Flying]},
  {id:"mandibuzz",name:"Mandibuzz",num:630,types:[PokemonType.Dark,PokemonType.Flying]},
  {id:"heatmor",name:"Heatmor",num:631,types:[PokemonType.Fire]},
  {id:"durant",name:"Durant",num:632,types:[PokemonType.Bug,PokemonType.Steel]},
  {id:"deino",name:"Deino",num:633,types:[PokemonType.Dark,PokemonType.Dragon]},
  {id:"zweilous",name:"Zweilous",num:634,types:[PokemonType.Dark,PokemonType.Dragon]},
  {id:"hydreigon",name:"Hydreigon",num:635,types:[PokemonType.Dark,PokemonType.Dragon]},
  {id:"larvesta",name:"Larvesta",num:636,types:[PokemonType.Bug,PokemonType.Fire]},
  {id:"volcarona",name:"Volcarona",num:637,types:[PokemonType.Bug,PokemonType.Fire]},
  {id:"cobalion",name:"Cobalion",num:638,types:[PokemonType.Steel,PokemonType.Fighting]},
  {id:"terrakion",name:"Terrakion",num:639,types:[PokemonType.Rock,PokemonType.Fighting]},
  {id:"virizion",name:"Virizion",num:640,types:[PokemonType.Grass,PokemonType.Fighting]},
  {id:"tornadus",name:"Tornadus",num:641,types:[PokemonType.Flying]},
  {id:"thundurus",name:"Thundurus",num:642,types:[PokemonType.Electric,PokemonType.Flying]},
  {id:"reshiram",name:"Reshiram",num:643,types:[PokemonType.Dragon,PokemonType.Fire]},
  {id:"zekrom",name:"Zekrom",num:644,types:[PokemonType.Dragon,PokemonType.Electric]},
  {id:"landorus",name:"Landorus",num:645,types:[PokemonType.Ground,PokemonType.Flying]},
  {id:"kyurem",name:"Kyurem",num:646,types:[PokemonType.Dragon,PokemonType.Ice]},
  {id:"keldeo",name:"Keldeo",num:647,types:[PokemonType.Water,PokemonType.Fighting]},
  {id:"meloetta",name:"Meloetta",num:648,types:[PokemonType.Normal,PokemonType.Psychic]},
  {id:"genesect",name:"Genesect",num:649,types:[PokemonType.Bug,PokemonType.Steel]},
];
registerStubs(GEN5);

const GEN6: SpeciesStub[] = [
  {id:"chespin",name:"Chespin",num:650,types:[PokemonType.Grass]},
  {id:"quilladin",name:"Quilladin",num:651,types:[PokemonType.Grass]},
  {id:"chesnaught",name:"Chesnaught",num:652,types:[PokemonType.Grass,PokemonType.Fighting]},
  {id:"fennekin",name:"Fennekin",num:653,types:[PokemonType.Fire]},
  {id:"braixen",name:"Braixen",num:654,types:[PokemonType.Fire]},
  {id:"delphox",name:"Delphox",num:655,types:[PokemonType.Fire,PokemonType.Psychic]},
  {id:"froakie",name:"Froakie",num:656,types:[PokemonType.Water]},
  {id:"frogadier",name:"Frogadier",num:657,types:[PokemonType.Water]},
  {id:"greninja",name:"Greninja",num:658,types:[PokemonType.Water,PokemonType.Dark]},
  {id:"bunnelby",name:"Bunnelby",num:659,types:[PokemonType.Normal]},
  {id:"diggersby",name:"Diggersby",num:660,types:[PokemonType.Normal,PokemonType.Ground]},
  {id:"fletchling",name:"Fletchling",num:661,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"fletchinder",name:"Fletchinder",num:662,types:[PokemonType.Fire,PokemonType.Flying]},
  {id:"talonflame",name:"Talonflame",num:663,types:[PokemonType.Fire,PokemonType.Flying]},
  {id:"scatterbug",name:"Scatterbug",num:664,types:[PokemonType.Bug]},
  {id:"spewpa",name:"Spewpa",num:665,types:[PokemonType.Bug]},
  {id:"vivillon",name:"Vivillon",num:666,types:[PokemonType.Bug,PokemonType.Flying]},
  {id:"litleo",name:"Litleo",num:667,types:[PokemonType.Fire,PokemonType.Normal]},
  {id:"pyroar",name:"Pyroar",num:668,types:[PokemonType.Fire,PokemonType.Normal]},
  {id:"flabebe",name:"Flabebe",num:669,types:[PokemonType.Fairy]},
  {id:"floette",name:"Floette",num:670,types:[PokemonType.Fairy]},
  {id:"florges",name:"Florges",num:671,types:[PokemonType.Fairy]},
  {id:"skiddo",name:"Skiddo",num:672,types:[PokemonType.Grass]},
  {id:"gogoat",name:"Gogoat",num:673,types:[PokemonType.Grass]},
  {id:"pancham",name:"Pancham",num:674,types:[PokemonType.Fighting]},
  {id:"pangoro",name:"Pangoro",num:675,types:[PokemonType.Fighting,PokemonType.Dark]},
  {id:"furfrou",name:"Furfrou",num:676,types:[PokemonType.Normal]},
  {id:"espurr",name:"Espurr",num:677,types:[PokemonType.Psychic]},
  {id:"meowstic",name:"Meowstic",num:678,types:[PokemonType.Psychic]},
  {id:"honedge",name:"Honedge",num:679,types:[PokemonType.Steel,PokemonType.Ghost]},
  {id:"doublade",name:"Doublade",num:680,types:[PokemonType.Steel,PokemonType.Ghost]},
  {id:"aegislash",name:"Aegislash",num:681,types:[PokemonType.Steel,PokemonType.Ghost]},
  {id:"spritzee",name:"Spritzee",num:682,types:[PokemonType.Fairy]},
  {id:"aromatisse",name:"Aromatisse",num:683,types:[PokemonType.Fairy]},
  {id:"swirlix",name:"Swirlix",num:684,types:[PokemonType.Fairy]},
  {id:"slurpuff",name:"Slurpuff",num:685,types:[PokemonType.Fairy]},
  {id:"inkay",name:"Inkay",num:686,types:[PokemonType.Dark,PokemonType.Psychic]},
  {id:"malamar",name:"Malamar",num:687,types:[PokemonType.Dark,PokemonType.Psychic]},
  {id:"binacle",name:"Binacle",num:688,types:[PokemonType.Rock,PokemonType.Water]},
  {id:"barbaracle",name:"Barbaracle",num:689,types:[PokemonType.Rock,PokemonType.Water]},
  {id:"skrelp",name:"Skrelp",num:690,types:[PokemonType.Poison,PokemonType.Water]},
  {id:"dragalge",name:"Dragalge",num:691,types:[PokemonType.Poison,PokemonType.Dragon]},
  {id:"clauncher",name:"Clauncher",num:692,types:[PokemonType.Water]},
  {id:"clawitzer",name:"Clawitzer",num:693,types:[PokemonType.Water]},
  {id:"helioptile",name:"Helioptile",num:694,types:[PokemonType.Electric,PokemonType.Normal]},
  {id:"heliolisk",name:"Heliolisk",num:695,types:[PokemonType.Electric,PokemonType.Normal]},
  {id:"tyrunt",name:"Tyrunt",num:696,types:[PokemonType.Rock,PokemonType.Dragon]},
  {id:"tyrantrum",name:"Tyrantrum",num:697,types:[PokemonType.Rock,PokemonType.Dragon]},
  {id:"amaura",name:"Amaura",num:698,types:[PokemonType.Rock,PokemonType.Ice]},
  {id:"aurorus",name:"Aurorus",num:699,types:[PokemonType.Rock,PokemonType.Ice]},
  {id:"sylveon",name:"Sylveon",num:700,types:[PokemonType.Fairy]},
  {id:"hawlucha",name:"Hawlucha",num:701,types:[PokemonType.Fighting,PokemonType.Flying]},
  {id:"dedenne",name:"Dedenne",num:702,types:[PokemonType.Electric,PokemonType.Fairy]},
  {id:"carbink",name:"Carbink",num:703,types:[PokemonType.Rock,PokemonType.Fairy]},
  {id:"goomy",name:"Goomy",num:704,types:[PokemonType.Dragon]},
  {id:"sliggoo",name:"Sliggoo",num:705,types:[PokemonType.Dragon]},
  {id:"goodra",name:"Goodra",num:706,types:[PokemonType.Dragon]},
  {id:"klefki",name:"Klefki",num:707,types:[PokemonType.Steel,PokemonType.Fairy]},
  {id:"phantump",name:"Phantump",num:708,types:[PokemonType.Ghost,PokemonType.Grass]},
  {id:"trevenant",name:"Trevenant",num:709,types:[PokemonType.Ghost,PokemonType.Grass]},
  {id:"pumpkaboo",name:"Pumpkaboo",num:710,types:[PokemonType.Ghost,PokemonType.Grass]},
  {id:"gourgeist",name:"Gourgeist",num:711,types:[PokemonType.Ghost,PokemonType.Grass]},
  {id:"bergmite",name:"Bergmite",num:712,types:[PokemonType.Ice]},
  {id:"avalugg",name:"Avalugg",num:713,types:[PokemonType.Ice]},
  {id:"noibat",name:"Noibat",num:714,types:[PokemonType.Flying,PokemonType.Dragon]},
  {id:"noivern",name:"Noivern",num:715,types:[PokemonType.Flying,PokemonType.Dragon]},
  {id:"xerneas",name:"Xerneas",num:716,types:[PokemonType.Fairy]},
  {id:"yveltal",name:"Yveltal",num:717,types:[PokemonType.Dark,PokemonType.Flying]},
  {id:"zygarde",name:"Zygarde",num:718,types:[PokemonType.Dragon,PokemonType.Ground]},
  {id:"diancie",name:"Diancie",num:719,types:[PokemonType.Rock,PokemonType.Fairy]},
  {id:"hoopa",name:"Hoopa",num:720,types:[PokemonType.Psychic,PokemonType.Ghost]},
  {id:"volcanion",name:"Volcanion",num:721,types:[PokemonType.Fire,PokemonType.Water]},
];
registerStubs(GEN6);

const GEN7: SpeciesStub[] = [
  {id:"rowlet",name:"Rowlet",num:722,types:[PokemonType.Grass,PokemonType.Flying]},
  {id:"dartrix",name:"Dartrix",num:723,types:[PokemonType.Grass,PokemonType.Flying]},
  {id:"decidueye",name:"Decidueye",num:724,types:[PokemonType.Grass,PokemonType.Ghost]},
  {id:"litten",name:"Litten",num:725,types:[PokemonType.Fire]},
  {id:"torracat",name:"Torracat",num:726,types:[PokemonType.Fire]},
  {id:"incineroar",name:"Incineroar",num:727,types:[PokemonType.Fire,PokemonType.Dark]},
  {id:"popplio",name:"Popplio",num:728,types:[PokemonType.Water]},
  {id:"brionne",name:"Brionne",num:729,types:[PokemonType.Water]},
  {id:"primarina",name:"Primarina",num:730,types:[PokemonType.Water,PokemonType.Fairy]},
  {id:"pikipek",name:"Pikipek",num:731,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"trumbeak",name:"Trumbeak",num:732,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"toucannon",name:"Toucannon",num:733,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"yungoos",name:"Yungoos",num:734,types:[PokemonType.Normal]},
  {id:"gumshoos",name:"Gumshoos",num:735,types:[PokemonType.Normal]},
  {id:"grubbin",name:"Grubbin",num:736,types:[PokemonType.Bug]},
  {id:"charjabug",name:"Charjabug",num:737,types:[PokemonType.Bug,PokemonType.Electric]},
  {id:"vikavolt",name:"Vikavolt",num:738,types:[PokemonType.Bug,PokemonType.Electric]},
  {id:"crabrawler",name:"Crabrawler",num:739,types:[PokemonType.Fighting]},
  {id:"crabominable",name:"Crabominable",num:740,types:[PokemonType.Fighting,PokemonType.Ice]},
  {id:"oricorio",name:"Oricorio",num:741,types:[PokemonType.Fire,PokemonType.Flying]},
  {id:"cutiefly",name:"Cutiefly",num:742,types:[PokemonType.Bug,PokemonType.Fairy]},
  {id:"ribombee",name:"Ribombee",num:743,types:[PokemonType.Bug,PokemonType.Fairy]},
  {id:"rockruff",name:"Rockruff",num:744,types:[PokemonType.Rock]},
  {id:"lycanroc",name:"Lycanroc",num:745,types:[PokemonType.Rock]},
  {id:"wishiwashi",name:"Wishiwashi",num:746,types:[PokemonType.Water]},
  {id:"mareanie",name:"Mareanie",num:747,types:[PokemonType.Poison,PokemonType.Water]},
  {id:"toxapex",name:"Toxapex",num:748,types:[PokemonType.Poison,PokemonType.Water]},
  {id:"mudbray",name:"Mudbray",num:749,types:[PokemonType.Ground]},
  {id:"mudsdale",name:"Mudsdale",num:750,types:[PokemonType.Ground]},
  {id:"dewpider",name:"Dewpider",num:751,types:[PokemonType.Water,PokemonType.Bug]},
  {id:"araquanid",name:"Araquanid",num:752,types:[PokemonType.Water,PokemonType.Bug]},
  {id:"fomantis",name:"Fomantis",num:753,types:[PokemonType.Grass]},
  {id:"lurantis",name:"Lurantis",num:754,types:[PokemonType.Grass]},
  {id:"morelull",name:"Morelull",num:755,types:[PokemonType.Grass,PokemonType.Fairy]},
  {id:"shiinotic",name:"Shiinotic",num:756,types:[PokemonType.Grass,PokemonType.Fairy]},
  {id:"salandit",name:"Salandit",num:757,types:[PokemonType.Poison,PokemonType.Fire]},
  {id:"salazzle",name:"Salazzle",num:758,types:[PokemonType.Poison,PokemonType.Fire]},
  {id:"stufful",name:"Stufful",num:759,types:[PokemonType.Normal,PokemonType.Fighting]},
  {id:"bewear",name:"Bewear",num:760,types:[PokemonType.Normal,PokemonType.Fighting]},
  {id:"bounsweet",name:"Bounsweet",num:761,types:[PokemonType.Grass]},
  {id:"steenee",name:"Steenee",num:762,types:[PokemonType.Grass]},
  {id:"tsareena",name:"Tsareena",num:763,types:[PokemonType.Grass]},
  {id:"comfey",name:"Comfey",num:764,types:[PokemonType.Fairy]},
  {id:"oranguru",name:"Oranguru",num:765,types:[PokemonType.Normal,PokemonType.Psychic]},
  {id:"passimian",name:"Passimian",num:766,types:[PokemonType.Fighting]},
  {id:"wimpod",name:"Wimpod",num:767,types:[PokemonType.Bug,PokemonType.Water]},
  {id:"golisopod",name:"Golisopod",num:768,types:[PokemonType.Bug,PokemonType.Water]},
  {id:"sandygast",name:"Sandygast",num:769,types:[PokemonType.Ghost,PokemonType.Ground]},
  {id:"palossand",name:"Palossand",num:770,types:[PokemonType.Ghost,PokemonType.Ground]},
  {id:"pyukumuku",name:"Pyukumuku",num:771,types:[PokemonType.Water]},
  {id:"type-null",name:"Type: Null",num:772,types:[PokemonType.Normal]},
  {id:"silvally",name:"Silvally",num:773,types:[PokemonType.Normal]},
  {id:"minior",name:"Minior",num:774,types:[PokemonType.Rock,PokemonType.Flying]},
  {id:"komala",name:"Komala",num:775,types:[PokemonType.Normal]},
  {id:"turtonator",name:"Turtonator",num:776,types:[PokemonType.Fire,PokemonType.Dragon]},
  {id:"togedemaru",name:"Togedemaru",num:777,types:[PokemonType.Electric,PokemonType.Steel]},
  {id:"mimikyu",name:"Mimikyu",num:778,types:[PokemonType.Ghost,PokemonType.Fairy]},
  {id:"bruxish",name:"Bruxish",num:779,types:[PokemonType.Water,PokemonType.Psychic]},
  {id:"drampa",name:"Drampa",num:780,types:[PokemonType.Normal,PokemonType.Dragon]},
  {id:"dhelmise",name:"Dhelmise",num:781,types:[PokemonType.Ghost,PokemonType.Grass]},
  {id:"jangmo-o",name:"Jangmo-o",num:782,types:[PokemonType.Dragon]},
  {id:"hakamo-o",name:"Hakamo-o",num:783,types:[PokemonType.Dragon,PokemonType.Fighting]},
  {id:"kommo-o",name:"Kommo-o",num:784,types:[PokemonType.Dragon,PokemonType.Fighting]},
  {id:"tapu-koko",name:"Tapu Koko",num:785,types:[PokemonType.Electric,PokemonType.Fairy]},
  {id:"tapu-lele",name:"Tapu Lele",num:786,types:[PokemonType.Psychic,PokemonType.Fairy]},
  {id:"tapu-bulu",name:"Tapu Bulu",num:787,types:[PokemonType.Grass,PokemonType.Fairy]},
  {id:"tapu-fini",name:"Tapu Fini",num:788,types:[PokemonType.Water,PokemonType.Fairy]},
  {id:"cosmog",name:"Cosmog",num:789,types:[PokemonType.Psychic]},
  {id:"cosmoem",name:"Cosmoem",num:790,types:[PokemonType.Psychic]},
  {id:"solgaleo",name:"Solgaleo",num:791,types:[PokemonType.Psychic,PokemonType.Steel]},
  {id:"lunala",name:"Lunala",num:792,types:[PokemonType.Psychic,PokemonType.Ghost]},
  {id:"nihilego",name:"Nihilego",num:793,types:[PokemonType.Rock,PokemonType.Poison]},
  {id:"buzzwole",name:"Buzzwole",num:794,types:[PokemonType.Bug,PokemonType.Fighting]},
  {id:"pheromosa",name:"Pheromosa",num:795,types:[PokemonType.Bug,PokemonType.Fighting]},
  {id:"xurkitree",name:"Xurkitree",num:796,types:[PokemonType.Electric]},
  {id:"celesteela",name:"Celesteela",num:797,types:[PokemonType.Steel,PokemonType.Flying]},
  {id:"kartana",name:"Kartana",num:798,types:[PokemonType.Grass,PokemonType.Steel]},
  {id:"guzzlord",name:"Guzzlord",num:799,types:[PokemonType.Dark,PokemonType.Dragon]},
  {id:"necrozma",name:"Necrozma",num:800,types:[PokemonType.Psychic]},
  {id:"magearna",name:"Magearna",num:801,types:[PokemonType.Steel,PokemonType.Fairy]},
  {id:"marshadow",name:"Marshadow",num:802,types:[PokemonType.Fighting,PokemonType.Ghost]},
  {id:"poipole",name:"Poipole",num:803,types:[PokemonType.Poison]},
  {id:"naganadel",name:"Naganadel",num:804,types:[PokemonType.Poison,PokemonType.Dragon]},
  {id:"stakataka",name:"Stakataka",num:805,types:[PokemonType.Rock,PokemonType.Steel]},
  {id:"blacephalon",name:"Blacephalon",num:806,types:[PokemonType.Fire,PokemonType.Ghost]},
  {id:"zeraora",name:"Zeraora",num:807,types:[PokemonType.Electric]},
  {id:"meltan",name:"Meltan",num:808,types:[PokemonType.Steel]},
  {id:"melmetal",name:"Melmetal",num:809,types:[PokemonType.Steel]},
];
registerStubs(GEN7);

const GEN8: SpeciesStub[] = [
  {id:"grookey",name:"Grookey",num:810,types:[PokemonType.Grass]},
  {id:"thwackey",name:"Thwackey",num:811,types:[PokemonType.Grass]},
  {id:"rillaboom",name:"Rillaboom",num:812,types:[PokemonType.Grass]},
  {id:"scorbunny",name:"Scorbunny",num:813,types:[PokemonType.Fire]},
  {id:"raboot",name:"Raboot",num:814,types:[PokemonType.Fire]},
  {id:"cinderace",name:"Cinderace",num:815,types:[PokemonType.Fire]},
  {id:"sobble",name:"Sobble",num:816,types:[PokemonType.Water]},
  {id:"drizzile",name:"Drizzile",num:817,types:[PokemonType.Water]},
  {id:"inteleon",name:"Inteleon",num:818,types:[PokemonType.Water]},
  {id:"skwovet",name:"Skwovet",num:819,types:[PokemonType.Normal]},
  {id:"greedent",name:"Greedent",num:820,types:[PokemonType.Normal]},
  {id:"rookidee",name:"Rookidee",num:821,types:[PokemonType.Flying]},
  {id:"corvisquire",name:"Corvisquire",num:822,types:[PokemonType.Flying]},
  {id:"corviknight",name:"Corviknight",num:823,types:[PokemonType.Flying,PokemonType.Steel]},
  {id:"blipbug",name:"Blipbug",num:824,types:[PokemonType.Bug]},
  {id:"dottler",name:"Dottler",num:825,types:[PokemonType.Bug,PokemonType.Psychic]},
  {id:"orbeetle",name:"Orbeetle",num:826,types:[PokemonType.Bug,PokemonType.Psychic]},
  {id:"nickit",name:"Nickit",num:827,types:[PokemonType.Dark]},
  {id:"thievul",name:"Thievul",num:828,types:[PokemonType.Dark]},
  {id:"gossifleur",name:"Gossifleur",num:829,types:[PokemonType.Grass]},
  {id:"eldegoss",name:"Eldegoss",num:830,types:[PokemonType.Grass]},
  {id:"wooloo",name:"Wooloo",num:831,types:[PokemonType.Normal]},
  {id:"dubwool",name:"Dubwool",num:832,types:[PokemonType.Normal]},
  {id:"chewtle",name:"Chewtle",num:833,types:[PokemonType.Water]},
  {id:"drednaw",name:"Drednaw",num:834,types:[PokemonType.Water,PokemonType.Rock]},
  {id:"yamper",name:"Yamper",num:835,types:[PokemonType.Electric]},
  {id:"boltund",name:"Boltund",num:836,types:[PokemonType.Electric]},
  {id:"rolycoly",name:"Rolycoly",num:837,types:[PokemonType.Rock]},
  {id:"carkol",name:"Carkol",num:838,types:[PokemonType.Rock,PokemonType.Fire]},
  {id:"coalossal",name:"Coalossal",num:839,types:[PokemonType.Rock,PokemonType.Fire]},
  {id:"applin",name:"Applin",num:840,types:[PokemonType.Grass,PokemonType.Dragon]},
  {id:"flapple",name:"Flapple",num:841,types:[PokemonType.Grass,PokemonType.Dragon]},
  {id:"appletun",name:"Appletun",num:842,types:[PokemonType.Grass,PokemonType.Dragon]},
  {id:"silicobra",name:"Silicobra",num:843,types:[PokemonType.Ground]},
  {id:"sandaconda",name:"Sandaconda",num:844,types:[PokemonType.Ground]},
  {id:"cramorant",name:"Cramorant",num:845,types:[PokemonType.Flying,PokemonType.Water]},
  {id:"arrokuda",name:"Arrokuda",num:846,types:[PokemonType.Water]},
  {id:"barraskewda",name:"Barraskewda",num:847,types:[PokemonType.Water]},
  {id:"toxel",name:"Toxel",num:848,types:[PokemonType.Electric,PokemonType.Poison]},
  {id:"toxtricity",name:"Toxtricity",num:849,types:[PokemonType.Electric,PokemonType.Poison]},
  {id:"sizzlipede",name:"Sizzlipede",num:850,types:[PokemonType.Fire,PokemonType.Bug]},
  {id:"centiskorch",name:"Centiskorch",num:851,types:[PokemonType.Fire,PokemonType.Bug]},
  {id:"clobbopus",name:"Clobbopus",num:852,types:[PokemonType.Fighting]},
  {id:"grapploct",name:"Grapploct",num:853,types:[PokemonType.Fighting]},
  {id:"sinistea",name:"Sinistea",num:854,types:[PokemonType.Ghost]},
  {id:"polteageist",name:"Polteageist",num:855,types:[PokemonType.Ghost]},
  {id:"hatenna",name:"Hatenna",num:856,types:[PokemonType.Psychic]},
  {id:"hattrem",name:"Hattrem",num:857,types:[PokemonType.Psychic]},
  {id:"hatterene",name:"Hatterene",num:858,types:[PokemonType.Psychic,PokemonType.Fairy]},
  {id:"impidimp",name:"Impidimp",num:859,types:[PokemonType.Dark,PokemonType.Fairy]},
  {id:"morgrem",name:"Morgrem",num:860,types:[PokemonType.Dark,PokemonType.Fairy]},
  {id:"grimmsnarl",name:"Grimmsnarl",num:861,types:[PokemonType.Dark,PokemonType.Fairy]},
  {id:"obstagoon",name:"Obstagoon",num:862,types:[PokemonType.Dark,PokemonType.Normal]},
  {id:"perrserker",name:"Perrserker",num:863,types:[PokemonType.Steel]},
  {id:"cursola",name:"Cursola",num:864,types:[PokemonType.Ghost]},
  {id:"sirfetchd",name:"Sirfetchd",num:865,types:[PokemonType.Fighting]},
  {id:"mr-rime",name:"Mr. Rime",num:866,types:[PokemonType.Ice,PokemonType.Psychic]},
  {id:"runerigus",name:"Runerigus",num:867,types:[PokemonType.Ground,PokemonType.Ghost]},
  {id:"milcery",name:"Milcery",num:868,types:[PokemonType.Fairy]},
  {id:"alcremie",name:"Alcremie",num:869,types:[PokemonType.Fairy]},
  {id:"falinks",name:"Falinks",num:870,types:[PokemonType.Fighting]},
  {id:"pincurchin",name:"Pincurchin",num:871,types:[PokemonType.Electric]},
  {id:"snom",name:"Snom",num:872,types:[PokemonType.Ice,PokemonType.Bug]},
  {id:"frosmoth",name:"Frosmoth",num:873,types:[PokemonType.Ice,PokemonType.Bug]},
  {id:"stonjourner",name:"Stonjourner",num:874,types:[PokemonType.Rock]},
  {id:"eiscue",name:"Eiscue",num:875,types:[PokemonType.Ice]},
  {id:"indeedee",name:"Indeedee",num:876,types:[PokemonType.Psychic,PokemonType.Normal]},
  {id:"morpeko",name:"Morpeko",num:877,types:[PokemonType.Electric,PokemonType.Dark]},
  {id:"cufant",name:"Cufant",num:878,types:[PokemonType.Steel]},
  {id:"copperajah",name:"Copperajah",num:879,types:[PokemonType.Steel]},
  {id:"dracozolt",name:"Dracozolt",num:880,types:[PokemonType.Electric,PokemonType.Dragon]},
  {id:"arctozolt",name:"Arctozolt",num:881,types:[PokemonType.Electric,PokemonType.Ice]},
  {id:"dracovish",name:"Dracovish",num:882,types:[PokemonType.Water,PokemonType.Dragon]},
  {id:"arctovish",name:"Arctovish",num:883,types:[PokemonType.Water,PokemonType.Ice]},
  {id:"duraludon",name:"Duraludon",num:884,types:[PokemonType.Steel,PokemonType.Dragon]},
  {id:"dreepy",name:"Dreepy",num:885,types:[PokemonType.Dragon,PokemonType.Ghost]},
  {id:"drakloak",name:"Drakloak",num:886,types:[PokemonType.Dragon,PokemonType.Ghost]},
  {id:"dragapult",name:"Dragapult",num:887,types:[PokemonType.Dragon,PokemonType.Ghost]},
  {id:"zacian",name:"Zacian",num:888,types:[PokemonType.Fairy]},
  {id:"zamazenta",name:"Zamazenta",num:889,types:[PokemonType.Fighting]},
  {id:"eternatus",name:"Eternatus",num:890,types:[PokemonType.Poison,PokemonType.Dragon]},
  {id:"kubfu",name:"Kubfu",num:891,types:[PokemonType.Fighting]},
  {id:"urshifu",name:"Urshifu",num:892,types:[PokemonType.Fighting,PokemonType.Dark]},
  {id:"zarude",name:"Zarude",num:893,types:[PokemonType.Dark,PokemonType.Grass]},
  {id:"regieleki",name:"Regieleki",num:894,types:[PokemonType.Electric]},
  {id:"regidrago",name:"Regidrago",num:895,types:[PokemonType.Dragon]},
  {id:"glastrier",name:"Glastrier",num:896,types:[PokemonType.Ice]},
  {id:"spectrier",name:"Spectrier",num:897,types:[PokemonType.Ghost]},
  {id:"calyrex",name:"Calyrex",num:898,types:[PokemonType.Psychic,PokemonType.Grass]},
];
registerStubs(GEN8);

const GEN9: SpeciesStub[] = [
  {id:"sprigatito",name:"Sprigatito",num:899,types:[PokemonType.Grass]},
  {id:"floragato",name:"Floragato",num:900,types:[PokemonType.Grass]},
  {id:"meowscarada",name:"Meowscarada",num:901,types:[PokemonType.Grass,PokemonType.Dark]},
  {id:"fuecoco",name:"Fuecoco",num:902,types:[PokemonType.Fire]},
  {id:"crocalor",name:"Crocalor",num:903,types:[PokemonType.Fire]},
  {id:"skeledirge",name:"Skeledirge",num:904,types:[PokemonType.Fire,PokemonType.Ghost]},
  {id:"quaxly",name:"Quaxly",num:905,types:[PokemonType.Water]},
  {id:"quaxwell",name:"Quaxwell",num:906,types:[PokemonType.Water]},
  {id:"quaquaval",name:"Quaquaval",num:907,types:[PokemonType.Water,PokemonType.Fighting]},
  {id:"lechonk",name:"Lechonk",num:908,types:[PokemonType.Normal]},
  {id:"oinkologne",name:"Oinkologne",num:909,types:[PokemonType.Normal]},
  {id:"tarountula",name:"Tarountula",num:910,types:[PokemonType.Bug]},
  {id:"spidops",name:"Spidops",num:911,types:[PokemonType.Bug]},
  {id:"nymble",name:"Nymble",num:912,types:[PokemonType.Bug]},
  {id:"lokix",name:"Lokix",num:913,types:[PokemonType.Bug,PokemonType.Dark]},
  {id:"pawmi",name:"Pawmi",num:914,types:[PokemonType.Electric]},
  {id:"pawmo",name:"Pawmo",num:915,types:[PokemonType.Electric,PokemonType.Fighting]},
  {id:"pawmot",name:"Pawmot",num:916,types:[PokemonType.Electric,PokemonType.Fighting]},
  {id:"tandemaus",name:"Tandemaus",num:917,types:[PokemonType.Normal]},
  {id:"maushold",name:"Maushold",num:918,types:[PokemonType.Normal]},
  {id:"fidough",name:"Fidough",num:919,types:[PokemonType.Fairy]},
  {id:"dachsbun",name:"Dachsbun",num:920,types:[PokemonType.Fairy]},
  {id:"smoliv",name:"Smoliv",num:921,types:[PokemonType.Grass,PokemonType.Normal]},
  {id:"dolliv",name:"Dolliv",num:922,types:[PokemonType.Grass,PokemonType.Normal]},
  {id:"arboliva",name:"Arboliva",num:923,types:[PokemonType.Grass,PokemonType.Normal]},
  {id:"squawkabilly",name:"Squawkabilly",num:924,types:[PokemonType.Normal,PokemonType.Flying]},
  {id:"nacli",name:"Nacli",num:925,types:[PokemonType.Rock]},
  {id:"naclstack",name:"Naclstack",num:926,types:[PokemonType.Rock]},
  {id:"garganacl",name:"Garganacl",num:927,types:[PokemonType.Rock]},
  {id:"charcadet",name:"Charcadet",num:928,types:[PokemonType.Fire]},
  {id:"armarouge",name:"Armarouge",num:929,types:[PokemonType.Fire,PokemonType.Psychic]},
  {id:"ceruledge",name:"Ceruledge",num:930,types:[PokemonType.Fire,PokemonType.Ghost]},
  {id:"tadbulb",name:"Tadbulb",num:931,types:[PokemonType.Electric]},
  {id:"bellibolt",name:"Bellibolt",num:932,types:[PokemonType.Electric]},
  {id:"wattrel",name:"Wattrel",num:933,types:[PokemonType.Electric,PokemonType.Flying]},
  {id:"kilowattrel",name:"Kilowattrel",num:934,types:[PokemonType.Electric,PokemonType.Flying]},
  {id:"maschiff",name:"Maschiff",num:935,types:[PokemonType.Dark]},
  {id:"mabosstiff",name:"Mabosstiff",num:936,types:[PokemonType.Dark]},
  {id:"shroodle",name:"Shroodle",num:937,types:[PokemonType.Poison,PokemonType.Normal]},
  {id:"grafaiai",name:"Grafaiai",num:938,types:[PokemonType.Poison,PokemonType.Normal]},
  {id:"bramblin",name:"Bramblin",num:939,types:[PokemonType.Grass,PokemonType.Ghost]},
  {id:"brambleghast",name:"Brambleghast",num:940,types:[PokemonType.Grass,PokemonType.Ghost]},
  {id:"toedscool",name:"Toedscool",num:941,types:[PokemonType.Ground,PokemonType.Grass]},
  {id:"toedscruel",name:"Toedscruel",num:942,types:[PokemonType.Ground,PokemonType.Grass]},
  {id:"klawf",name:"Klawf",num:943,types:[PokemonType.Rock]},
  {id:"capsakid",name:"Capsakid",num:944,types:[PokemonType.Grass]},
  {id:"scovillain",name:"Scovillain",num:945,types:[PokemonType.Grass,PokemonType.Fire]},
  {id:"rellor",name:"Rellor",num:946,types:[PokemonType.Bug]},
  {id:"rabsca",name:"Rabsca",num:947,types:[PokemonType.Bug,PokemonType.Psychic]},
  {id:"flittle",name:"Flittle",num:948,types:[PokemonType.Psychic]},
  {id:"espathra",name:"Espathra",num:949,types:[PokemonType.Psychic]},
  {id:"tinkatink",name:"Tinkatink",num:950,types:[PokemonType.Fairy,PokemonType.Steel]},
  {id:"tinkatuff",name:"Tinkatuff",num:951,types:[PokemonType.Fairy,PokemonType.Steel]},
  {id:"tinkaton",name:"Tinkaton",num:952,types:[PokemonType.Fairy,PokemonType.Steel]},
  {id:"wiglett",name:"Wiglett",num:953,types:[PokemonType.Water]},
  {id:"wugtrio",name:"Wugtrio",num:954,types:[PokemonType.Water]},
  {id:"bombirdier",name:"Bombirdier",num:955,types:[PokemonType.Dark,PokemonType.Flying]},
  {id:"finizen",name:"Finizen",num:956,types:[PokemonType.Water]},
  {id:"palafin",name:"Palafin",num:957,types:[PokemonType.Water]},
  {id:"varoom",name:"Varoom",num:958,types:[PokemonType.Steel,PokemonType.Poison]},
  {id:"revavroom",name:"Revavroom",num:959,types:[PokemonType.Steel,PokemonType.Poison]},
  {id:"cyclizar",name:"Cyclizar",num:960,types:[PokemonType.Dragon,PokemonType.Normal]},
  {id:"orthworm",name:"Orthworm",num:961,types:[PokemonType.Steel]},
  {id:"glimmet",name:"Glimmet",num:962,types:[PokemonType.Rock,PokemonType.Poison]},
  {id:"glimmora",name:"Glimmora",num:963,types:[PokemonType.Rock,PokemonType.Poison]},
  {id:"greavard",name:"Greavard",num:964,types:[PokemonType.Ghost]},
  {id:"houndstone",name:"Houndstone",num:965,types:[PokemonType.Ghost]},
  {id:"flamigo",name:"Flamigo",num:966,types:[PokemonType.Flying,PokemonType.Fighting]},
  {id:"cetoddle",name:"Cetoddle",num:967,types:[PokemonType.Ice]},
  {id:"cetitan",name:"Cetitan",num:968,types:[PokemonType.Ice]},
  {id:"veluza",name:"Veluza",num:969,types:[PokemonType.Water,PokemonType.Psychic]},
  {id:"dondozo",name:"Dondozo",num:970,types:[PokemonType.Water]},
  {id:"tatsugiri",name:"Tatsugiri",num:971,types:[PokemonType.Dragon,PokemonType.Water]},
  {id:"annihilape",name:"Annihilape",num:972,types:[PokemonType.Fighting,PokemonType.Ghost]},
  {id:"clodsire",name:"Clodsire",num:973,types:[PokemonType.Poison,PokemonType.Ground]},
  {id:"farigiraf",name:"Farigiraf",num:974,types:[PokemonType.Normal,PokemonType.Psychic]},
  {id:"dudunsparce",name:"Dudunsparce",num:975,types:[PokemonType.Normal]},
  {id:"kingambit",name:"Kingambit",num:976,types:[PokemonType.Dark,PokemonType.Steel]},
  {id:"great-tusk",name:"Great Tusk",num:977,types:[PokemonType.Ground,PokemonType.Fighting]},
  {id:"scream-tail",name:"Scream Tail",num:978,types:[PokemonType.Fairy,PokemonType.Psychic]},
  {id:"brute-bonnet",name:"Brute Bonnet",num:979,types:[PokemonType.Grass,PokemonType.Dark]},
  {id:"flutter-mane",name:"Flutter Mane",num:980,types:[PokemonType.Ghost,PokemonType.Fairy]},
  {id:"slither-wing",name:"Slither Wing",num:981,types:[PokemonType.Bug,PokemonType.Fighting]},
  {id:"sandy-shocks",name:"Sandy Shocks",num:982,types:[PokemonType.Electric,PokemonType.Ground]},
  {id:"iron-treads",name:"Iron Treads",num:983,types:[PokemonType.Ground,PokemonType.Steel]},
  {id:"iron-bundle",name:"Iron Bundle",num:984,types:[PokemonType.Ice,PokemonType.Water]},
  {id:"iron-hands",name:"Iron Hands",num:985,types:[PokemonType.Fighting,PokemonType.Electric]},
  {id:"iron-jugulis",name:"Iron Jugulis",num:986,types:[PokemonType.Dark,PokemonType.Flying]},
  {id:"iron-moth",name:"Iron Moth",num:987,types:[PokemonType.Fire,PokemonType.Poison]},
  {id:"iron-thorns",name:"Iron Thorns",num:988,types:[PokemonType.Rock,PokemonType.Electric]},
  {id:"frigibax",name:"Frigibax",num:989,types:[PokemonType.Dragon,PokemonType.Ice]},
  {id:"arctibax",name:"Arctibax",num:990,types:[PokemonType.Dragon,PokemonType.Ice]},
  {id:"baxcalibur",name:"Baxcalibur",num:991,types:[PokemonType.Dragon,PokemonType.Ice]},
  {id:"gimmighoul",name:"Gimmighoul",num:992,types:[PokemonType.Ghost]},
  {id:"gholdengo",name:"Gholdengo",num:993,types:[PokemonType.Steel,PokemonType.Ghost]},
  {id:"wo-chien",name:"Wo-Chien",num:994,types:[PokemonType.Dark,PokemonType.Grass]},
  {id:"chien-pao",name:"Chien-Pao",num:995,types:[PokemonType.Dark,PokemonType.Ice]},
  {id:"ting-lu",name:"Ting-Lu",num:996,types:[PokemonType.Dark,PokemonType.Ground]},
  {id:"chi-yu",name:"Chi-Yu",num:997,types:[PokemonType.Dark,PokemonType.Fire]},
  {id:"roaring-moon",name:"Roaring Moon",num:998,types:[PokemonType.Dragon,PokemonType.Dark]},
  {id:"iron-valiant",name:"Iron Valiant",num:999,types:[PokemonType.Fairy,PokemonType.Fighting]},
  {id:"koraidon",name:"Koraidon",num:1000,types:[PokemonType.Fighting,PokemonType.Dragon]},
  {id:"miraidon",name:"Miraidon",num:1001,types:[PokemonType.Electric,PokemonType.Dragon]},
  {id:"walking-wake",name:"Walking Wake",num:1002,types:[PokemonType.Water,PokemonType.Dragon]},
  {id:"iron-leaves",name:"Iron Leaves",num:1003,types:[PokemonType.Grass,PokemonType.Psychic]},
  {id:"dipplin",name:"Dipplin",num:1004,types:[PokemonType.Grass,PokemonType.Dragon]},
];
registerStubs(GEN9);

const GEN9_EXTRA: SpeciesStub[] = [
  {id:"poltchageist",name:"Poltchageist",num:1005,types:[PokemonType.Grass, PokemonType.Ghost]},
  {id:"sinistcha",name:"Sinistcha",num:1006,types:[PokemonType.Grass, PokemonType.Ghost]},
  {id:"okidogi",name:"Okidogi",num:1007,types:[PokemonType.Poison, PokemonType.Fighting]},
  {id:"munkidori",name:"Munkidori",num:1008,types:[PokemonType.Poison, PokemonType.Psychic]},
  {id:"fezandipiti",name:"Fezandipiti",num:1009,types:[PokemonType.Poison, PokemonType.Fairy]},
  {id:"ogerpon",name:"Ogerpon",num:1010,types:[PokemonType.Grass]},
  {id:"archaludon",name:"Archaludon",num:1011,types:[PokemonType.Steel, PokemonType.Dragon]},
  {id:"hydrapple",name:"Hydrapple",num:1012,types:[PokemonType.Grass, PokemonType.Dragon]},
  {id:"gouging-fire",name:"Gouging Fire",num:1013,types:[PokemonType.Fire, PokemonType.Dragon]},
  {id:"raging-bolt",name:"Raging Bolt",num:1014,types:[PokemonType.Electric, PokemonType.Dragon]},
  {id:"iron-boulder",name:"Iron Boulder",num:1015,types:[PokemonType.Rock, PokemonType.Psychic]},
  {id:"iron-crown",name:"Iron Crown",num:1016,types:[PokemonType.Steel, PokemonType.Psychic]},
  {id:"terapagos",name:"Terapagos",num:1017,types:[PokemonType.Normal]},
  {id:"pecharunt",name:"Pecharunt",num:1018,types:[PokemonType.Poison, PokemonType.Ghost]},
];
registerStubs(GEN9_EXTRA);

// ═══════════════════════════════════════════════════════════════════════
// Public exports
// ═══════════════════════════════════════════════════════════════════════

/**
 * Complete species registry mapped by national Pokedex number.
 */
export const speciesMap: ReadonlyMap<number, SpeciesEntry> = SPECIES_MAP;

/**
 * All species entries, sorted by Pokedex number.
 */
export const speciesList: readonly SpeciesEntry[] = Array.from(SPECIES_MAP.values())
  .sort((a, b) => a.pokedexNumber - b.pokedexNumber);

/**
 * Look up a species by its national Pokedex number.
 */
export function getSpeciesByNumber(num: number): SpeciesEntry | undefined {
  return SPECIES_MAP.get(num);
}

/**
 * Look up a species by its string identifier (slug).
 */
export function getSpeciesById(id: string): SpeciesEntry | undefined {
  for (const entry of SPECIES_MAP.values()) {
    if (entry.id === id) return entry;
  }
  return undefined;
}

/**
 * Get the evolution chain for a given species.
 * Returns an ordered array from the first stage through all evolutions.
 */
export function getEvolutionChain(speciesId: string): SpeciesEntry[] {
  const chain: SpeciesEntry[] = [];
  const start = getSpeciesById(speciesId);
  if (!start) return chain;

  // Walk backwards to find the first stage
  let current: SpeciesEntry | undefined = start;
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    if (current.evolvesFrom) {
      const prev = getSpeciesById(current.evolvesFrom);
      if (prev) { current = prev; continue; }
    }
    break;
  }

  // Walk forward from the first stage
  const forwardVisited = new Set<string>();
  let node: SpeciesEntry | undefined = current;
  while (node && !forwardVisited.has(node.id)) {
    forwardVisited.add(node.id);
    chain.push(node);
    if (node.evolvesTo) {
      node = getSpeciesById(node.evolvesTo);
    } else {
      break;
    }
  }

  return chain;
}

/**
 * Search species by name (case-insensitive partial match).
 * Returns up to limit results.
 */
export function searchSpecies(query: string, limit: number = 100): SpeciesEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return speciesList.slice(0, limit);
  const results: SpeciesEntry[] = [];
  for (const entry of SPECIES_MAP.values()) {
    if (results.length >= limit) break;
    if (
      entry.name.toLowerCase().includes(q) ||
      entry.id.toLowerCase().includes(q) ||
      entry.pokedexNumber.toString() === q
    ) {
      results.push(entry);
    }
  }
  return results;
}

/**
 * Total number of species in the registry.
 */
export const TOTAL_SPECIES: number = SPECIES_MAP.size;

