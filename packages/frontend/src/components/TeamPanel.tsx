import { useCallback, useRef, useState } from "react";
import type { PokemonInstance } from "@pokelike/core";
import PokemonCard from "./PokemonCard";

export interface TeamPanelProps {
  team: PokemonInstance[];
  onPokemonClick?: (index: number) => void;
  compact?: boolean;
}

/**
 * TeamPanel — displays a list of Pokemon in the player's team.
 *
 * Supports:
 * - Horizontal or vertical layout (compact = horizontal for battle/catch screens)
 * - Click to select a Pokemon
 * - Drag-to-reorder via pointer events (mouse + touch)
 */
const TEAM_MAX_SIZE = 6;

export default function TeamPanel({
  team,
  onPokemonClick,
  compact = false,
}: TeamPanelProps) {
  const [orderedTeam, setOrderedTeam] = useState<PokemonInstance[]>(team);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync ordered team when external team changes (and not mid-drag)
  const prevTeamRef = useRef(team);
  if (team !== prevTeamRef.current && dragIndex === null) {
    prevTeamRef.current = team;
    // Only re-sync if lengths match (avoid race with reorder)
    if (team.length === orderedTeam.length || orderedTeam.length === 0) {
      setOrderedTeam(team);
    }
  }

  const handleDragStart = useCallback(
    (e: React.PointerEvent, index: number) => {
      e.preventDefault();
      setDragIndex(index);
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.PointerEvent, index: number) => {
      if (dragIndex === null || dragIndex === index) return;
      e.preventDefault();

      setOrderedTeam((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(index, 0, moved);
        return next;
      });
      setDragIndex(index);
    },
    [dragIndex],
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  const handleClick = useCallback(
    (index: number) => {
      onPokemonClick?.(index);
    },
    [onPokemonClick],
  );

  if (team.length === 0) {
    return (
      <div
        className="team-panel team-panel--empty"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-md)",
          border: "2px dashed var(--color-text-dim, #606070)",
          color: "var(--color-text-dim, #606070)",
          fontSize: "0.5rem",
          textAlign: "center",
          minHeight: compact ? "60px" : "120px",
        }}
        role="status"
        aria-label="No Pokemon in team"
      >
        No Pokemon
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`team-panel${compact ? " team-panel--compact" : ""}`}
      style={{
        display: "flex",
        flexDirection: compact ? "row" : "column",
        gap: compact ? "var(--space-xs, 4px)" : "var(--space-sm, 8px)",
        overflowX: compact ? "auto" : "visible",
        overflowY: compact ? "visible" : "auto",
        padding: "var(--space-xs, 4px)",
        width: "100%",
      }}
      role="list"
      aria-label="Pokemon team"
    >
      {orderedTeam.map((pokemon, index) => (
        <div
          key={`${pokemon.speciesId}-${index}`}
          role="listitem"
          style={{
            touchAction: "none",
            userSelect: "none",
            cursor: "grab",
            transition: "opacity 0.15s ease",
            opacity: dragIndex === index ? 0.5 : 1,
          }}
          onPointerDown={(e) => handleDragStart(e, index)}
          onPointerOver={(e) => handleDragOver(e, index)}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <PokemonCard
            pokemon={pokemon}
            compact
            onClick={() => handleClick(index)}
          />
        </div>
      ))}
    </div>
  );
}
