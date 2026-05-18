/**
 * Game Helpers — map generation, encounters, gym leaders, and progression.
 *
 * Battle simulation logic has been migrated to `@pokelike/core` (battle engine).
 * This module now only contains game-specific data and UI helpers.
 */
import {
  type PokemonInstance,
  type MapGraph,
  type MapNode,
  type MapEdge,
  type BaseStats,
  NodeType,
  PokemonType as PT,
  SeededRNG,
  SPECIES,
  ITEM_POOL,
  type ItemOption,
  makeGymMon,
} from "@pokelike/core";

// ─── Gym Leader Data ──────────────────────────────────────────────────────────

export interface GymLeaderData {
  name: string;
  title: string;
  type: PT;
  team: PokemonInstance[];
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
      makeGymMon("tentacool", 18),
      makeGymMon("tentacool", 20),
      makeGymMon("tentacruel", 22),
    ],
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
  return starters.map((p) => ({
    ...p,
    movePool: undefined, // Clean up any extra props
  })) as unknown as PokemonInstance[];
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
