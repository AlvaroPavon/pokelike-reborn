import { useCallback, useMemo, useRef, useState } from "react";
import type { MapNode, MapEdge } from "@pokelike/core";
import { NodeType } from "@pokelike/core";
import { getSpeciesSpriteUrl } from "../game/helpers";

export interface MapViewProps {
  nodes: MapNode[];
  edges: MapEdge[];
  currentNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface DisplayNode extends MapNode {
  displayPosition: { x: number; y: number };
}

type NodeVisual =
  | { kind: "pokemon"; src: string }
  | { kind: "item"; src: string }
  | { kind: "trainer"; variant: "player" | "trainer" | "boss" }
  | { kind: "sign"; label: string; tone: "heal" | "trade" | "tutor" | "question" };

const POKEMON_POOL = [
  "bulbasaur",
  "charmander",
  "squirtle",
  "caterpie",
  "pidgey",
  "rattata",
  "pikachu",
  "sandshrew",
  "zubat",
  "geodude",
  "bellsprout",
  "tentacool",
  "slowpoke",
  "gastly",
  "dratini",
  "lapras",
];

const LEGENDARY_POOL = ["articuno", "zapdos", "moltres", "dragonite", "mewtwo"];

const ITEM_SPRITES = [
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png",
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png",
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png",
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/revive.png",
];

const NODE_RADIUS = 20;
const MIN_SCALE = 0.78;
const MAX_SCALE = 2.2;
const ZOOM_STEP = 0.12;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick<T>(items: T[], key: string): T {
  return items[hashString(key) % items.length]!;
}

function getNodeVisual(node: MapNode): NodeVisual {
  switch (node.type) {
    case NodeType.START:
      return { kind: "trainer", variant: "player" };
    case NodeType.BATTLE:
      return { kind: "item", src: ITEM_SPRITES[0]! };
    case NodeType.CATCH:
      return {
        kind: "pokemon",
        src: getSpeciesSpriteUrl(pick(POKEMON_POOL, node.id)),
      };
    case NodeType.ITEM:
      return { kind: "item", src: pick(ITEM_SPRITES, node.id) };
    case NodeType.BOSS:
      return { kind: "trainer", variant: "boss" };
    case NodeType.POKECENTER:
      return { kind: "sign", label: "+", tone: "heal" };
    case NodeType.TRAINER:
      return { kind: "trainer", variant: "trainer" };
    case NodeType.LEGENDARY:
      return {
        kind: "pokemon",
        src: getSpeciesSpriteUrl(pick(LEGENDARY_POOL, node.id)),
      };
    case NodeType.MOVE_TUTOR:
      return { kind: "sign", label: "TM", tone: "tutor" };
    case NodeType.TRADE:
      return { kind: "sign", label: "SW", tone: "trade" };
    case NodeType.QUESTION:
      return { kind: "sign", label: "?", tone: "question" };
  }
}

function computeDisplayNodes(nodes: MapNode[]): DisplayNode[] {
  if (nodes.length === 0) return [];
  const ys = nodes.map((node) => node.position.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return nodes.map((node) => ({
    ...node,
    displayPosition: {
      x: node.position.x,
      y: maxY - (node.position.y - minY),
    },
  }));
}

function edgePath(fromNode: DisplayNode, toNode: DisplayNode): string {
  const from = fromNode.displayPosition;
  const to = toNode.displayPosition;
  const midY = (from.y + to.y) / 2;
  return [
    `M ${from.x} ${from.y}`,
    `C ${from.x} ${midY}`,
    `${to.x} ${midY}`,
    `${to.x} ${to.y}`,
  ].join(" ");
}

function nodeClassName(node: MapNode, isCurrent: boolean): string {
  const typeClass = node.type.toLowerCase().replace(/_/g, "-");
  return [
    "map-node",
    `map-node--${typeClass}`,
    node.accessible ? "map-node--accessible" : "map-node--blocked",
    node.visited ? "map-node--visited" : "",
    isCurrent ? "map-node--current" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function renderTrainer(x: number, y: number, variant: "player" | "trainer" | "boss") {
  return (
    <g className={`map-node__trainer map-node__trainer--${variant}`}>
      <rect x={x - 12} y={y - 42} width="24" height="8" className="trainer-hat" />
      <rect x={x - 8} y={y - 34} width="16" height="14" className="trainer-face" />
      <rect x={x - 12} y={y - 20} width="24" height="16" className="trainer-shirt" />
      <rect x={x - 12} y={y - 4} width="9" height="13" className="trainer-leg" />
      <rect x={x + 3} y={y - 4} width="9" height="13" className="trainer-leg" />
      <rect x={x - 14} y={y - 18} width="5" height="13" className="trainer-arm" />
      <rect x={x + 9} y={y - 18} width="5" height="13" className="trainer-arm" />
    </g>
  );
}

function renderSign(x: number, y: number, label: string, tone: string) {
  return (
    <g className={`map-node__sign map-node__sign--${tone}`}>
      <rect x={x - 15} y={y - 38} width="30" height="24" className="sign-board" />
      <rect x={x - 3} y={y - 14} width="6" height="18" className="sign-post" />
      <text
        className="sign-label"
        x={x}
        y={y - 25}
        textAnchor="middle"
        dominantBaseline="middle"
        pointerEvents="none"
      >
        {label}
      </text>
    </g>
  );
}

function renderVisual(node: MapNode, x: number, y: number) {
  const visual = getNodeVisual(node);

  if (visual.kind === "pokemon") {
    return (
      <image
        className="map-node__sprite map-node__sprite--pokemon"
        href={visual.src}
        x={x - 30}
        y={y - 54}
        width="60"
        height="60"
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }

  if (visual.kind === "item") {
    return (
      <image
        className="map-node__sprite map-node__sprite--item"
        href={visual.src}
        x={x - 25}
        y={y - 47}
        width="50"
        height="50"
        preserveAspectRatio="xMidYMid meet"
      />
    );
  }

  if (visual.kind === "trainer") {
    return renderTrainer(x, y, visual.variant);
  }

  return renderSign(x, y, visual.label, visual.tone);
}

/**
 * MapView - sprite route renderer with zoom and pan.
 */
export default function MapView({
  nodes,
  edges,
  currentNodeId,
  onNodeClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayNodes = useMemo(() => computeDisplayNodes(nodes), [nodes]);
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);

  const viewBox = useCallback(() => {
    if (displayNodes.length === 0) return "0 0 400 620";
    const xs = displayNodes.map((n) => n.displayPosition.x);
    const ys = displayNodes.map((n) => n.displayPosition.y);
    const minX = Math.min(...xs) - NODE_RADIUS * 4;
    const minY = Math.min(...ys) - NODE_RADIUS * 4;
    const maxX = Math.max(...xs) + NODE_RADIUS * 4;
    const maxY = Math.max(...ys) + NODE_RADIUS * 4;
    const w = Math.max(maxX - minX, 280);
    const h = Math.max(maxY - minY, 560);
    return `${minX} ${minY} ${w} ${h}`;
  }, [displayNodes]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * ZOOM_STEP;
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale + delta)),
    }));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isPanning.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    containerRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setTransform((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      lastPinchDist.current = dist;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const scaleDelta = (dist - lastPinchDist.current) * 0.01;
      lastPinchDist.current = dist;
      setTransform((prev) => ({
        ...prev,
        scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale + scaleDelta)),
      }));
    }
  }, []);

  const handleNodeClick = useCallback(
    (e: React.MouseEvent, nodeId: string, accessible: boolean) => {
      e.stopPropagation();
      if (accessible) {
        onNodeClick(nodeId);
      }
    },
    [onNodeClick],
  );

  if (displayNodes.length === 0) {
    return (
      <div className="map-view map-view--empty" role="status">
        No map data
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="map-view map-view--sprite-route"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      role="application"
      aria-label="Overworld map"
    >
      <svg
        className="map-view__svg"
        viewBox={viewBox()}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grassFlecks" width="22" height="22" patternUnits="userSpaceOnUse">
            <rect width="22" height="22" fill="transparent" />
            <path d="M4 15 l2 -5 M13 18 l2 -6 M18 8 l2 -4" className="terrain-fleck" />
            <circle cx="7" cy="6" r="1.2" className="terrain-dot" />
          </pattern>
        </defs>

        <rect className="map-terrain-base" x="-500" y="-500" width="1400" height="1700" />
        <rect className="map-terrain-flecks" x="-500" y="-500" width="1400" height="1700" />

        <g className="map-decoration" aria-hidden="true">
          {displayNodes
            .filter((_, index) => index % 4 === 0)
            .map((node, index) => (
              <g
                key={`flower-${node.id}`}
                transform={`translate(${node.displayPosition.x + (index % 2 ? 54 : -56)} ${node.displayPosition.y + (index % 3 ? 28 : -20)})`}
              >
                <circle cx="0" cy="0" r="5" className="flower-petal flower-petal--a" />
                <circle cx="8" cy="0" r="5" className="flower-petal flower-petal--a" />
                <circle cx="4" cy="-7" r="5" className="flower-petal flower-petal--b" />
                <circle cx="4" cy="5" r="3" className="flower-center" />
              </g>
            ))}
        </g>

        <g className="map-edges">
          {edges.map((edge, i) => {
            const fromNode = displayNodes.find((n) => n.id === edge.from);
            const toNode = displayNodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            const unlocked = fromNode.visited && toNode.accessible;
            const labelX = (fromNode.displayPosition.x + toNode.displayPosition.x) / 2;
            const labelY = (fromNode.displayPosition.y + toNode.displayPosition.y) / 2 - 10;

            return (
              <g key={`edge-${i}`} className="map-edge-group">
                <path
                  className={`map-edge${unlocked ? " map-edge--unlocked" : ""}`}
                  d={edgePath(fromNode, toNode)}
                />
                {edge.label && (
                  <text
                    className="map-edge__label"
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        <g className="map-nodes">
          {displayNodes.map((node) => {
            const isCurrent = node.id === currentNodeId;
            const { x, y } = node.displayPosition;

            return (
              <g
                key={node.id}
                className={nodeClassName(node, isCurrent)}
                onClick={(e) => handleNodeClick(e, node.id, node.accessible)}
                role="button"
                aria-label={`${node.type} node: ${node.id}${
                  !node.accessible ? " (blocked)" : ""
                }`}
                tabIndex={node.accessible ? 0 : undefined}
                onKeyDown={(e) => {
                  if (
                    node.accessible &&
                    (e.key === "Enter" || e.key === " ")
                  ) {
                    e.preventDefault();
                    onNodeClick(node.id);
                  }
                }}
              >
                <title>{node.type}</title>
                <ellipse className="map-node__shadow" cx={x} cy={y + 5} rx="22" ry="8" />
                <circle className="map-node__target" cx={x} cy={y - 16} r="25" />
                {renderVisual(node, x, y)}
                {node.visited && !isCurrent && (
                  <circle className="map-node__visited-dot" cx={x + 19} cy={y - 39} r="5" />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="map-view__controls">
        <button
          type="button"
          className="map-view__control"
          onClick={() =>
            setTransform((p) => ({
              ...p,
              scale: Math.min(MAX_SCALE, p.scale + ZOOM_STEP),
            }))
          }
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="map-view__control"
          onClick={() =>
            setTransform((p) => ({
              ...p,
              scale: Math.max(MIN_SCALE, p.scale - ZOOM_STEP),
            }))
          }
          aria-label="Zoom out"
        >
          -
        </button>
      </div>
    </div>
  );
}
