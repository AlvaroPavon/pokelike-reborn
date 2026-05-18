import { useCallback, useEffect, useMemo, useState } from "react";
import { SeededRNG, getSpeciesById, type MapGraph, type MapNode } from "@pokelike/core";
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
  getGymBadgeName,
} from "../game/helpers";

/**
 * MapScreen — THE MAIN GAME SCREEN.
 *
 * Integrates:
 * - Overworld map with navigation
 * - Team panel with current Pokemon
 * - Item bar with inventory
 * - Badge count display
 * - Info header with map name
 *
 * Handles node clicks by resolving the node type and navigating
 * to the appropriate sub-screen (battle, catch, item, etc).
 */
export default function MapScreen() {
  const gameStore = useGameStore();
  const uiStore = useUIStore();

  // Local map state
  const [mapGraph, setMapGraph] = useState<MapGraph | null>(null);
  const [rng] = useState(
    () => new SeededRNG(gameStore.runSeed ?? Date.now()),
  );

  // Generate map on first load
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

  // Node click handler
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (!mapGraph) return;

      const node = mapGraph.nodes.find((n) => n.id === nodeId);
      if (!node || !node.accessible || node.visited) return;

      const resolution = processNodeClick(node, gameStore.currentMapIndex, rng);

      const pokedexStore = usePokedexStore.getState();

      switch (resolution.type) {
        case "battle": {
          // Mark all enemy species as seen in the Pokédex
          for (const p of resolution.enemyTeam) {
            const entry = getSpeciesById(p.speciesId);
            if (entry) pokedexStore.markSeen(entry.pokedexNumber);
          }
          uiStore.setBattleData(resolution.enemyTeam, node.type);
          uiStore.navigate("battle");
          break;
        }
        case "catch": {
          // Mark all encounter choices as seen in the Pokédex
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
          // Stay on map
          break;
        }
        case "nothing": {
          // Just mark as visited and move on
          markNodeVisited(node);
          break;
        }
      }
    },
    [mapGraph, gameStore, uiStore, rng],
  );

  const markNodeVisited = useCallback(
    (node: MapNode) => {
      if (!mapGraph) return;

      // Mark the node as visited
      const updatedNodes = mapGraph.nodes.map((n) => {
        if (n.id === node.id) {
          return { ...n, visited: true };
        }
        return n;
      });

      // Find the next layer of nodes and mark them accessible
      const visitedIds = new Set(
        updatedNodes.filter((n) => n.visited || n.id === node.id).map((n) => n.id),
      );

      const newlyAccessible = new Set<string>();
      for (const edge of mapGraph.edges) {
        // If the 'from' node is visited (or just got visited), make 'to' accessible
        if (visitedIds.has(edge.from)) {
          newlyAccessible.add(edge.to);
        }
      }

      const finalNodes = updatedNodes.map((n) => {
        if (newlyAccessible.has(n.id) || n.type.toString() === "START" || n.id === node.id) {
          return { ...n, accessible: true };
        }
        return n;
      });

      gameStore.setCurrentNode(node.id);
      setMapGraph({ ...mapGraph, nodes: finalNodes });
    },
    [mapGraph, gameStore],
  );

  // Save game periodically
  useEffect(() => {
    gameStore.saveGame();
  }, [gameStore.currentMapIndex, gameStore.team.length]);

  // Handle healing team after visiting a PokeCenter
  const handleHealTeam = useCallback(() => {
    gameStore.healTeam();
  }, [gameStore]);

  const handleGoToTitle = useCallback(() => {
    uiStore.navigate("title");
  }, [uiStore]);

  if (!mapGraph) {
    return (
      <div className="screen map-screen">
        <div className="screen-content">
          <div className="placeholder">Generating map...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="screen map-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
        padding: "var(--space-sm)",
        overflow: "hidden",
        height: "100dvh",
      }}
    >
      {/* Info Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--space-xs) var(--space-sm)",
          backgroundColor: "var(--color-bg-mid)",
          border: "1px solid var(--color-text-dim)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
          <span
            style={{
              fontSize: "0.45rem",
              color: "var(--color-gold)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {getMapName(gameStore.currentMapIndex)}
          </span>
          {gymLeader && (
            <span
              style={{
                fontSize: "0.35rem",
                color: "var(--color-text-secondary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Leader: {gymLeader.name} ({gymLeader.title})
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            flexShrink: 0,
          }}
        >
          {/* Badge count */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              padding: "2px 6px",
              backgroundColor: "var(--color-bg-dark)",
              border: "1px solid var(--color-gold-dim)",
            }}
            title={`${gameStore.badges.length} badges`}
          >
            <span style={{ fontSize: "0.5rem", color: "var(--color-gold)" }}>★</span>
            <span
              style={{
                fontSize: "0.4rem",
                color: "var(--color-text-primary)",
              }}
            >
              {gameStore.badges.length}/8
            </span>
          </div>

          {/* Heal button */}
          <button
            type="button"
            onClick={handleHealTeam}
            style={{
              background: "none",
              border: "1px solid var(--color-accent-green)",
              color: "var(--color-text-primary)",
              fontSize: "0.4rem",
              padding: "2px 6px",
              cursor: "pointer",
              fontFamily: "var(--font-pixel)",
            }}
            title="Heal team"
            aria-label="Heal team"
          >
            +HP
          </button>

          {/* Menu button */}
          <button
            type="button"
            onClick={handleGoToTitle}
            style={{
              background: "none",
              border: "1px solid var(--color-text-dim)",
              color: "var(--color-text-secondary)",
              fontSize: "0.4rem",
              padding: "2px 6px",
              cursor: "pointer",
              fontFamily: "var(--font-pixel)",
            }}
            title="Return to title"
            aria-label="Return to title"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Map View */}
      <div
        className="map-container"
        style={{ flex: 1, minHeight: 0, width: "100%" }}
      >
        <MapView
          nodes={mapGraph.nodes}
          edges={mapGraph.edges}
          currentNodeId={gameStore.currentNodeId}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* HUD Bottom: Team + Items */}
      <div
        className="hud-bottom"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
          flexShrink: 0,
          padding: 0,
        }}
      >
        {/* Team Panel */}
        <div
          style={{
            backgroundColor: "var(--color-bg-mid)",
            border: "1px solid var(--color-text-dim)",
            padding: "var(--space-xs)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2px",
            }}
          >
            <span
              style={{
                fontSize: "0.35rem",
                color: "var(--color-text-dim)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Team ({gameStore.team.length}/6)
            </span>
          </div>
          <TeamPanel team={gameStore.team} compact />
        </div>

        {/* Item Bar */}
        <div
          style={{
            backgroundColor: "var(--color-bg-mid)",
            border: "1px solid var(--color-text-dim)",
            padding: "var(--space-xs)",
          }}
        >
          <span
            style={{
              fontSize: "0.35rem",
              color: "var(--color-text-dim)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              display: "block",
              marginBottom: "2px",
            }}
          >
            Items
          </span>
          <ItemBar items={gameStore.items} />
        </div>
      </div>
    </div>
  );
}
