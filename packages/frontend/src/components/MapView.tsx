import { useCallback, useEffect, useRef, useState } from "react";
import type { MapNode, MapEdge } from "@pokelike/core";
import { NodeType } from "@pokelike/core";

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

const NODE_COLORS: Record<NodeType, string> = {
  [NodeType.START]: "#4a4a6a",
  [NodeType.BATTLE]: "#6a2a2a",
  [NodeType.CATCH]: "#2a6a2a",
  [NodeType.ITEM]: "#2a4a6a",
  [NodeType.BOSS]: "#8a2a8a",
  [NodeType.POKECENTER]: "#006666",
  [NodeType.TRAINER]: "#6a3a1a",
  [NodeType.LEGENDARY]: "#7a6a00",
  [NodeType.MOVE_TUTOR]: "#3a4a6a",
  [NodeType.TRADE]: "#1a5a5a",
  [NodeType.QUESTION]: "#6a4a2a",
};

const NODE_LABELS: Record<NodeType, string> = {
  [NodeType.START]: "S",
  [NodeType.BATTLE]: "B",
  [NodeType.CATCH]: "C",
  [NodeType.ITEM]: "I",
  [NodeType.BOSS]: "!",
  [NodeType.POKECENTER]: "P",
  [NodeType.TRAINER]: "T",
  [NodeType.LEGENDARY]: "★",
  [NodeType.MOVE_TUTOR]: "M",
  [NodeType.TRADE]: "R",
  [NodeType.QUESTION]: "?",
};

const NODE_RADIUS = 16;
const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.1;

/**
 * MapView — SVG-based overworld map renderer.
 *
 * Displays a graph of MapNodes connected by MapEdges.
 * Supports zoom (scroll/pinch) and pan (drag) via CSS transforms.
 * Nodes are color-coded by type and show visited/accessible/blocked states.
 */
export default function MapView({
  nodes,
  edges,
  currentNodeId,
  onNodeClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);

  // Track container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute SVG viewbox from node positions
  const viewBox = useCallback(() => {
    if (nodes.length === 0) return "0 0 400 400";
    const xs = nodes.map((n) => n.position.x);
    const ys = nodes.map((n) => n.position.y);
    const minX = Math.min(...xs) - NODE_RADIUS * 2;
    const minY = Math.min(...ys) - NODE_RADIUS * 2;
    const maxX = Math.max(...xs) + NODE_RADIUS * 2;
    const maxY = Math.max(...ys) + NODE_RADIUS * 2;
    const w = Math.max(maxX - minX, 200);
    const h = Math.max(maxY - minY, 200);
    return `${minX} ${minY} ${w} ${h}`;
  }, [nodes]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * ZOOM_STEP;
      setTransform((prev) => ({
        ...prev,
        scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale + delta)),
      }));
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only pan on background clicks, not on SVG elements
      if ((e.target as HTMLElement).closest("svg")) {
        isPanning.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        const el = containerRef.current;
        if (el) el.setPointerCapture(e.pointerId);
      }
    },
    [],
  );

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

  // Touch pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      lastPinchDist.current = dist;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
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
          scale: Math.max(
            MIN_SCALE,
            Math.min(MAX_SCALE, prev.scale + scaleDelta),
          ),
        }));
      }
    },
    [],
  );

  const handleNodeClick = useCallback(
    (nodeId: string, accessible: boolean) => {
      if (accessible) {
        onNodeClick(nodeId);
      }
    },
    [onNodeClick],
  );

  if (nodes.length === 0) {
    return (
      <div
        className="map-view map-view--empty"
        style={{
          width: "100%",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed var(--color-text-dim, #606070)",
          color: "var(--color-text-dim, #606070)",
          fontSize: "0.5rem",
        }}
        role="status"
        aria-label="No map data"
      >
        No map data
      </div>
    );
  }

  const vb = viewBox();

  return (
    <div
      ref={containerRef}
      className="map-view"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "300px",
        overflow: "hidden",
        backgroundColor: "var(--color-bg-dark, #0f0f23)",
        border: "1px solid var(--color-text-dim, #606070)",
        cursor: isPanning.current ? "grabbing" : "grab",
        touchAction: "none",
        position: "relative",
      }}
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
        viewBox={vb}
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "center center",
          transition: isPanning.current ? "none" : "transform 0.05s ease",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Edges */}
        {edges.map((edge, i) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          return (
            <g key={`edge-${i}`}>
              <line
                x1={fromNode.position.x}
                y1={fromNode.position.y}
                x2={toNode.position.x}
                y2={toNode.position.y}
                stroke={
                  fromNode.visited && toNode.accessible
                    ? "var(--color-text-secondary, #a0a0b0)"
                    : "var(--color-text-dim, #606070)"
                }
                strokeWidth={2}
                strokeOpacity={toNode.accessible ? 0.8 : 0.3}
                strokeDasharray={toNode.accessible ? "none" : "4,4"}
              />
              {edge.label && (
                <text
                  x={(fromNode.position.x + toNode.position.x) / 2}
                  y={(fromNode.position.y + toNode.position.y) / 2 - 6}
                  fill="var(--color-text-dim)"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="var(--font-pixel, monospace)"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const color = NODE_COLORS[node.type] || "#4a4a6a";
          const isCurrent = node.id === currentNodeId;
          const label = NODE_LABELS[node.type] || "?";

          return (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node.id, node.accessible)}
              style={{ cursor: node.accessible ? "pointer" : "default" }}
              role="button"
              aria-label={`${node.type} node: ${node.id}${!node.accessible ? " (blocked)" : ""}`}
              tabIndex={node.accessible ? 0 : undefined}
              onKeyDown={(e) => {
                if (
                  node.accessible &&
                  (e.key === "Enter" || e.key === " ")
                ) {
                  e.preventDefault();
                  handleNodeClick(node.id, node.accessible);
                }
              }}
            >
              {/* Node circle */}
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r={NODE_RADIUS}
                fill={isCurrent ? "var(--color-gold, #e2b714)" : color}
                stroke={
                  node.visited
                    ? "var(--color-text-primary, #e0e0e0)"
                    : node.accessible
                      ? "var(--color-text-secondary, #a0a0b0)"
                      : "var(--color-text-dim, #606070)"
                }
                strokeWidth={isCurrent ? 3 : 2}
                opacity={node.accessible ? 1 : 0.4}
              />

              {/* Node icon */}
              <text
                x={node.position.x}
                y={node.position.y + 1}
                fill="#fff"
                fontSize={NODE_RADIUS * 0.7}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-pixel, monospace)"
                pointerEvents="none"
              >
                {label}
              </text>

              {/* Visited checkmark */}
              {node.visited && !isCurrent && (
                <text
                  x={node.position.x + NODE_RADIUS * 0.6}
                  y={node.position.y - NODE_RADIUS * 0.6}
                  fill="var(--color-accent-green, #2ecc71)"
                  fontSize="10"
                  fontFamily="var(--font-pixel, monospace)"
                  pointerEvents="none"
                >
                  &#10003;
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Zoom controls */}
      <div
        className="map-view__controls"
        style={{
          position: "absolute",
          bottom: "var(--space-sm, 8px)",
          right: "var(--space-sm, 8px)",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <button
          type="button"
          className="pixel-button"
          style={{
            width: "32px",
            height: "32px",
            minHeight: "auto",
            padding: 0,
            fontSize: "0.7rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "none",
          }}
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
          className="pixel-button"
          style={{
            width: "32px",
            height: "32px",
            minHeight: "auto",
            padding: 0,
            fontSize: "0.7rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "none",
          }}
          onClick={() =>
            setTransform((p) => ({
              ...p,
              scale: Math.max(MIN_SCALE, p.scale - ZOOM_STEP),
            }))
          }
          aria-label="Zoom out"
        >
          &minus;
        </button>
      </div>
    </div>
  );
}
