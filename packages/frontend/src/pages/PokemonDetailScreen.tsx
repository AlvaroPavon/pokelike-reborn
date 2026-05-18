/**
 * @fileoverview Pokémon detail screen.
 *
 * Shows stats, evolution chain, and type info for a selected Pokémon
 * from the Pokédex. Uses the selectedPokemonId from uiStore to determine
 * which species to display.
 */

import { useMemo } from "react";
import {
  getSpeciesById,
  getEvolutionChain,
  type SpeciesEntry,
  PokedexStatus,
} from "@pokelike/core";
import { usePokedexStore } from "../stores/pokedexStore";
import { useUIStore } from "../stores/uiStore";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

// ─── Helpers ─────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Normal: "#A8A77A",
  Fire: "#EE8130",
  Water: "#6390F0",
  Electric: "#F7D02C",
  Grass: "#7AC74C",
  Ice: "#96D9D6",
  Fighting: "#C22E28",
  Poison: "#A33EA1",
  Ground: "#E2BF65",
  Flying: "#A98FF3",
  Psychic: "#F95587",
  Bug: "#A6B91A",
  Rock: "#B6A136",
  Ghost: "#735797",
  Dragon: "#6F35FC",
  Dark: "#705746",
  Steel: "#B7B7CE",
  Fairy: "#D685AD",
};

/**
 * Horizontal bar representing a single base stat value.
 */
function StatBar({
  label,
  value,
  maxValue = 255,
}: {
  label: string;
  value: number;
  maxValue?: number;
}) {
  const pct = Math.min((value / maxValue) * 100, 100);
  const barColor =
    value >= 120
      ? "var(--color-accent-green, #4a9c4a)"
      : value >= 80
        ? "var(--color-accent-yellow, #c9a03a)"
        : "var(--color-accent-red, #a04a4a)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-xs, 4px)",
        fontSize: "0.35rem",
      }}
    >
      <span style={{ width: "32px", color: "var(--color-text-dim, #606070)" }}>
        {label}
      </span>
      <span
        style={{
          width: "24px",
          textAlign: "right",
          color: "var(--color-text-primary, #e0e0e0)",
          fontWeight: "bold",
        }}
      >
        {value}
      </span>
      <div
        style={{
          flex: 1,
          height: "8px",
          backgroundColor: "var(--color-bg-mid, #1a1a2e)",
          border: "1px solid var(--color-text-dim, #606070)",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: barColor,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Type badge with appropriate color.
 */
function TypeBadge({ type }: { type: import("@pokelike/core").PokemonType }) {
  const bg = TYPE_COLORS[type] ?? "var(--color-text-dim, #606070)";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 8px",
        fontSize: "0.35rem",
        backgroundColor: bg,
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.2)",
        fontFamily: "var(--font-pixel, monospace)",
        textTransform: "uppercase",
        letterSpacing: "1px",
      }}
    >
      {type}
    </span>
  );
}

/**
 * Evolution chain display showing stage icons connected by arrows.
 */
function EvolutionChain({ species }: { species: SpeciesEntry }) {
  const chain = useMemo(() => getEvolutionChain(species.id), [species.id]);

  if (chain.length <= 1) {
    return (
      <div
        style={{
          fontSize: "0.35rem",
          color: "var(--color-text-dim, #606070)",
          textAlign: "center",
          padding: "var(--space-sm, 8px)",
        }}
      >
        No evolution
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-xs, 4px)",
        flexWrap: "wrap",
        padding: "var(--space-xs, 4px) 0",
      }}
    >
      {chain.map((stage, idx) => (
        <span key={stage.id}>
          {idx > 0 && (
            <span
              style={{
                color: "var(--color-text-dim, #606070)",
                fontSize: "0.5rem",
                margin: "0 4px",
              }}
            >
              →
            </span>
          )}
          <span
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: stage.id === species.id ? 1 : 0.6,
              transition: "opacity 0.15s ease",
            }}
            title={`#${stage.pokedexNumber} ${stage.name}`}
          >
            <img
              src={`${SPRITE_BASE}/${stage.pokedexNumber}.png`}
              alt={stage.name}
              style={{
                width: "40px",
                height: "40px",
                imageRendering: "pixelated",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span
              style={{
                fontSize: "0.3rem",
                color: "var(--color-text-secondary, #a0a0b0)",
              }}
            >
              {stage.name}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── Main screen component ───────────────────────────────────────────────

/**
 * PokemonDetailScreen — displays stats, evolution, and info for one species.
 */
export default function PokemonDetailScreen() {
  const speciesId = useUIStore((s) => s.selectedPokemonId);
  const navigate = useUIStore((s) => s.navigate);
  const setSelectedPokemonId = useUIStore((s) => s.setSelectedPokemonId);
  const getStatus = usePokedexStore((s) => s.getStatus);

  const species = useMemo(
    () => (speciesId ? getSpeciesById(speciesId) : undefined),
    [speciesId],
  );

  const status = useMemo(
    () => (species ? getStatus(species.pokedexNumber) : undefined),
    [species, getStatus],
  );

  const statEntries: { label: string; value: number }[] = useMemo(
    () =>
      species
        ? [
            { label: "HP", value: species.baseStats.hp },
            { label: "Atk", value: species.baseStats.atk },
            { label: "Def", value: species.baseStats.def },
            { label: "SpA", value: species.baseStats.spa },
            { label: "SpD", value: species.baseStats.spd },
            { label: "Spe", value: species.baseStats.spe },
          ]
        : [],
    [species],
  );

  const totalStats = useMemo(
    () => statEntries.reduce((sum, s) => sum + s.value, 0),
    [statEntries],
  );

  const handleBack = () => {
    setSelectedPokemonId(null);
    navigate("pokedex");
  };

  // Fallback if no species is selected
  if (!species) {
    return (
      <div
        className="screen pokemon-detail-screen"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          gap: "var(--space-md, 16px)",
        }}
      >
        <div
          style={{
            fontSize: "0.45rem",
            color: "var(--color-text-dim, #606070)",
          }}
        >
          No Pokémon selected.
        </div>
        <button
          type="button"
          onClick={() => navigate("pokedex")}
          style={{
            background: "none",
            border: "1px solid var(--color-text-dim, #606070)",
            color: "var(--color-text-secondary, #a0a0b0)",
            fontSize: "0.4rem",
            padding: "4px 12px",
            cursor: "pointer",
            fontFamily: "var(--font-pixel, monospace)",
          }}
        >
          Back to Pokédex
        </button>
      </div>
    );
  }

  return (
    <div
      className="screen pokemon-detail-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--space-sm, 8px)",
          backgroundColor: "var(--color-bg-mid, #1a1a2e)",
          borderBottom: "1px solid var(--color-text-dim, #606070)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "0.55rem",
            color: "var(--color-text-primary, #e0e0e0)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontWeight: "bold",
          }}
        >
          #{species.pokedexNumber} {species.name}
        </span>
        <button
          type="button"
          onClick={handleBack}
          style={{
            background: "none",
            border: "1px solid var(--color-text-dim, #606070)",
            color: "var(--color-text-secondary, #a0a0b0)",
            fontSize: "0.4rem",
            padding: "2px 8px",
            cursor: "pointer",
            fontFamily: "var(--font-pixel, monospace)",
          }}
        >
          Back
        </button>
      </div>

      {/* Status badge */}
      {status !== undefined && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-xs, 4px)",
            fontSize: "0.35rem",
            color:
              status === PokedexStatus.Caught
                ? "var(--color-gold-dim, #8b7a2e)"
                : status === PokedexStatus.Seen
                  ? "var(--color-accent-yellow, #c9a03a)"
                  : "var(--color-text-dim, #606070)",
            backgroundColor: "var(--color-bg-dark, #0f0f23)",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {status === PokedexStatus.Caught
            ? "Caught"
            : status === PokedexStatus.Seen
              ? "Seen"
              : "Not Yet Seen"}
        </div>
      )}

      {/* Sprite and types */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-sm, 8px)",
          padding: "var(--space-sm, 8px)",
          flexWrap: "wrap",
        }}
      >
        <img
          src={`${SPRITE_BASE}/${species.pokedexNumber}.png`}
          alt={species.name}
          style={{
            width: "96px",
            height: "96px",
            imageRendering: "pixelated",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {(species.types.filter((t): t is import("@pokelike/core").PokemonType => t !== undefined)).map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      </div>

      {/* Evolution chain */}
      <div
        style={{
          borderTop: "1px solid var(--color-text-dim, #606070)",
          borderBottom: "1px solid var(--color-text-dim, #606070)",
          padding: "var(--space-xs, 4px) var(--space-sm, 8px)",
          backgroundColor: "var(--color-bg-mid, #1a1a2e)",
        }}
      >
        <div
          style={{
            fontSize: "0.4rem",
            color: "var(--color-text-dim, #606070)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "4px",
          }}
        >
          Evolution Chain
        </div>
        <EvolutionChain species={species} />
      </div>

      {/* Base stats */}
      <div
        style={{
          padding: "var(--space-sm, 8px)",
        }}
      >
        <div
          style={{
            fontSize: "0.4rem",
            color: "var(--color-text-dim, #606070)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "var(--space-xs, 4px)",
          }}
        >
          Base Stats
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {statEntries.map((s) => (
            <StatBar key={s.label} label={s.label} value={s.value} />
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-xs, 4px)",
              fontSize: "0.35rem",
              borderTop: "1px solid var(--color-text-dim, #606070)",
              paddingTop: "4px",
              marginTop: "2px",
            }}
          >
            <span
              style={{ width: "32px", color: "var(--color-text-dim, #606070)" }}
            >
              Total
            </span>
            <span
              style={{
                width: "24px",
                textAlign: "right",
                color: "var(--color-text-primary, #e0e0e0)",
                fontWeight: "bold",
              }}
            >
              {totalStats}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
