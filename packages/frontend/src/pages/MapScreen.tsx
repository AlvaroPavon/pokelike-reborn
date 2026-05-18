import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SeededRNG,
  getSpeciesById,
  type MapGraph,
  type MapNode,
} from "@pokelike/core";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import { usePokedexStore } from "../stores/pokedexStore";
import MapView from "../components/MapView";
import TeamPanel from "../components/TeamPanel";
import ItemBar from "../components/ItemBar";
import {
  generateMap,
  getMapName,
  getGymLeader,
  processNodeClick,
} from "../game/helpers";

/**
 * MapScreen - main run screen with route map, team, items, and progress.
 */
export default function MapScreen() {
  const gameStore = useGameStore();
  const uiStore = useUIStore();
  const [mapGraph, setMapGraph] = useState<MapGraph | null>(null);
  const [rng] = useState(
    () => new SeededRNG(gameStore.runSeed ?? Date.now()),
  );

  useEffect(() => {
    if (!mapGraph) {
      const graph = generateMap(
        gameStore.currentMapIndex,
        gameStore.mode === "nuzlocke",
        rng,
      );
      setMapGraph(graph);
    }
  }, [mapGraph, gameStore.currentMapIndex, gameStore.mode, rng]);

  const gymLeader = useMemo(
    () => getGymLeader(gameStore.currentMapIndex),
    [gameStore.currentMapIndex],
  );

  const progress = useMemo(() => {
    if (!mapGraph) return { visited: 0, total: 0 };
    return {
      visited: mapGraph.nodes.filter((node) => node.visited).length,
      total: mapGraph.nodes.length,
    };
  }, [mapGraph]);

  const markNodeVisited = useCallback(
    (node: MapNode) => {
      if (!mapGraph) return;

      const updatedNodes = mapGraph.nodes.map((n) => {
        if (n.id === node.id) {
          return { ...n, visited: true };
        }
        return n;
      });

      const visitedIds = new Set(
        updatedNodes
          .filter((n) => n.visited || n.id === node.id)
          .map((n) => n.id),
      );

      const newlyAccessible = new Set<string>();
      for (const edge of mapGraph.edges) {
        if (visitedIds.has(edge.from)) {
          newlyAccessible.add(edge.to);
        }
      }

      const finalNodes = updatedNodes.map((n) => {
        if (
          newlyAccessible.has(n.id) ||
          n.type.toString() === "START" ||
          n.id === node.id
        ) {
          return { ...n, accessible: true };
        }
        return n;
      });

      gameStore.setCurrentNode(node.id);
      setMapGraph({ ...mapGraph, nodes: finalNodes });
    },
    [mapGraph, gameStore],
  );

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (!mapGraph) return;

      const node = mapGraph.nodes.find((n) => n.id === nodeId);
      if (!node || !node.accessible || node.visited) return;

      const resolution = processNodeClick(node, gameStore.currentMapIndex, rng);
      const pokedexStore = usePokedexStore.getState();

      switch (resolution.type) {
        case "battle": {
          for (const p of resolution.enemyTeam) {
            const entry = getSpeciesById(p.speciesId);
            if (entry) pokedexStore.markSeen(entry.pokedexNumber);
          }
          uiStore.setBattleData(resolution.enemyTeam, node.type);
          uiStore.navigate("battle");
          break;
        }
        case "catch": {
          for (const p of resolution.choices) {
            const entry = getSpeciesById(p.speciesId);
            if (entry) pokedexStore.markSeen(entry.pokedexNumber);
          }
          uiStore.setCatchData(resolution.choices);
          uiStore.navigate("catch");
          break;
        }
        case "item": {
          uiStore.setItemData(resolution.choices);
          uiStore.navigate("item");
          break;
        }
        case "heal": {
          gameStore.healTeam();
          markNodeVisited(node);
          break;
        }
        case "nothing": {
          markNodeVisited(node);
          break;
        }
      }
    },
    [mapGraph, gameStore, uiStore, rng, markNodeVisited],
  );

  useEffect(() => {
    gameStore.saveGame();
  }, [gameStore.currentMapIndex, gameStore.team.length]);

  const handleHealTeam = useCallback(() => {
    gameStore.healTeam();
  }, [gameStore]);

  const handleGoToTitle = useCallback(() => {
    uiStore.navigate("title");
  }, [uiStore]);

  if (!mapGraph) {
    return (
      <div className="screen map-screen route-screen">
        <div className="screen-content">
          <div className="placeholder">Generating map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen map-screen route-screen">
      <header className="map-screen__topbar">
        <button
          className="map-screen__tool-button"
          type="button"
          onClick={handleGoToTitle}
        >
          Menu
        </button>

        <div className="map-screen__route-copy">
          <span className="map-screen__eyebrow">
            Route {gameStore.currentMapIndex + 1}
          </span>
          <h2>{getMapName(gameStore.currentMapIndex)}</h2>
          {gymLeader && (
            <p>
              Leader: {gymLeader.name} / {gymLeader.title}
            </p>
          )}
        </div>

        <button
          className="map-screen__tool-button map-screen__tool-button--heal"
          type="button"
          onClick={handleHealTeam}
        >
          Heal
        </button>
      </header>

      <section className="map-screen__stage" aria-label="Route map">
        <div className="map-screen__stage-meta">
          <span>Badges: {gameStore.badges.length}/8</span>
          <span>
            Nodes: {progress.visited}/{progress.total}
          </span>
        </div>
        <MapView
          nodes={mapGraph.nodes}
          edges={mapGraph.edges}
          currentNodeId={gameStore.currentNodeId}
          onNodeClick={handleNodeClick}
        />
      </section>

      <section className="map-screen__dock" aria-label="Run status">
        <div className="dock-panel dock-panel--team">
          <div className="dock-panel__header">
            <span>Team</span>
            <span>{gameStore.team.length}/6</span>
          </div>
          <TeamPanel team={gameStore.team} compact />
        </div>

        <div className="dock-panel dock-panel--items">
          <div className="dock-panel__header">
            <span>Items</span>
            <span>{gameStore.items.length}</span>
          </div>
          <ItemBar items={gameStore.items} />
        </div>
      </section>
    </div>
  );
}
