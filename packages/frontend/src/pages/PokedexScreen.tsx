/**
 * @fileoverview Pokédex browser screen.
 *
 * Shows all 1025 Pokémon species in a searchable grid with a "Caught Only"
 * toggle and completion percentage. Clicking a species navigates to the
 * PokemonDetailScreen for that Pokémon.
 */

import { useMemo, useState } from "react";
import { speciesList, type SpeciesEntry } from "@pokelike/core";
import { usePokedexStore } from "../stores/pokedexStore";
import { useUIStore } from "../stores/uiStore";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/**
 * Grid entry for a single species in the Pokédex browser.
 */
function SpeciesGridCell({
  species,
  seen,
  caught,
  onSelect,
}: {
  species: SpeciesEntry;
  seen: boolean;
  caught: boolean;
  onSelect: (speciesId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(species.id)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "var(--space-xs, 4px)",
        backgroundColor: caught
          ? "var(--color-bg-mid, #1a1a2e)"
          : seen
            ? "var(--color-bg-dark, #0f0f23)"
            : "var(--color-bg-dark, #0f0f23)",
        border: caught
          ? "1px solid var(--color-gold-dim, #8b7a2e)"
          : seen
            ? "1px solid var(--color-text-dim, #606070)"
            : "1px solid transparent",
        cursor: "pointer",
        opacity: caught ? 1 : seen ? 0.7 : 0.4,
        transition: "opacity 0.15s ease, border-color 0.15s ease",
        fontFamily: "var(--font-pixel, monospace)",
        color: "var(--color-text-primary, #e0e0e0)",
        background: "none",
        width: "100%",
      }}
      title={`#${species.pokedexNumber} ${species.name}`}
    >
      {caught || seen ? (
        <img
          src={`${SPRITE_BASE}/${species.pokedexNumber}.png`}
          alt={species.name}
          style={{
            width: "48px",
            height: "48px",
            imageRendering: "pixelated",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div
          style={{
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.5rem",
            color: "var(--color-text-dim, #606070)",
          }}
        >
          ???
        </div>
      )}
      <span
        style={{
          fontSize: "0.35rem",
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "64px",
          marginTop: "2px",
        }}
      >
        {caught || seen ? species.name : `#${species.pokedexNumber}`}
      </span>
    </button>
  );
}

/**
 * PokedexScreen — searchable grid of all Pokémon species.
 */
export default function PokedexScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [caughtOnly, setCaughtOnly] = useState(false);

  const seenSpecies = usePokedexStore((s) => s.seenSpecies);
  const caughtSpecies = usePokedexStore((s) => s.caughtSpecies);
  const navigate = useUIStore((s) => s.navigate);

  const totalSpecies = speciesList.length;
  const caughtCount = caughtSpecies.length;

  const completionPercent =
    totalSpecies > 0
      ? Math.round((caughtCount / totalSpecies) * 100)
      : 0;

  const filteredSpecies = useMemo(() => {
    let list = speciesList;

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.pokedexNumber.toString() === q,
      );
    }

    // Apply caught-only filter
    if (caughtOnly) {
      const caughtSet = new Set(caughtSpecies);
      list = list.filter((s) => caughtSet.has(s.pokedexNumber));
    }

    return list;
  }, [searchQuery, caughtOnly, caughtSpecies]);

  const seenSet = useMemo(() => new Set(seenSpecies), [seenSpecies]);
  const caughtSet = useMemo(() => new Set(caughtSpecies), [caughtSpecies]);
  const setSelectedPokemonId = useUIStore((s) => s.setSelectedPokemonId);

  const handleSelectSpecies = (speciesId: string) => {
    setSelectedPokemonId(speciesId);
    navigate("pokemon_detail");
  };

  return (
    <div
      className="screen pokedex-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
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
        <h2
          style={{
            fontSize: "0.55rem",
            color: "var(--color-text-primary, #e0e0e0)",
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Pokédex
        </h2>
        <button
          type="button"
          onClick={() => navigate("title")}
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

      {/* Completion bar */}
      <div
        style={{
          padding: "var(--space-xs, 4px) var(--space-sm, 8px)",
          backgroundColor: "var(--color-bg-dark, #0f0f23)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.4rem",
            color: "var(--color-text-secondary, #a0a0b0)",
            marginBottom: "2px",
          }}
        >
          <span>
            Caught: {caughtCount}/{totalSpecies}
          </span>
          <span>{completionPercent}%</span>
        </div>
        <div
          style={{
            width: "100%",
            height: "6px",
            backgroundColor: "var(--color-bg-mid, #1a1a2e)",
            border: "1px solid var(--color-text-dim, #606070)",
          }}
        >
          <div
            style={{
              width: `${completionPercent}%`,
              height: "100%",
              backgroundColor:
                completionPercent === 100
                  ? "var(--color-gold, #e2b714)"
                  : "var(--color-accent-green, #4a9c4a)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Search and filter */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-xs, 4px)",
          padding: "var(--space-xs, 4px) var(--space-sm, 8px)",
          backgroundColor: "var(--color-bg-dark, #0f0f23)",
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          placeholder="Search name or #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            fontSize: "0.4rem",
            padding: "4px 8px",
            backgroundColor: "var(--color-bg-mid, #1a1a2e)",
            border: "1px solid var(--color-text-dim, #606070)",
            color: "var(--color-text-primary, #e0e0e0)",
            fontFamily: "var(--font-pixel, monospace)",
            outline: "none",
          }}
        />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.4rem",
            color: "var(--color-text-secondary, #a0a0b0)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <input
            type="checkbox"
            checked={caughtOnly}
            onChange={(e) => setCaughtOnly(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          Caught Only
        </label>
      </div>

      {/* Species grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-xs, 4px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))",
            gap: "2px",
          }}
        >
          {filteredSpecies.map((species) => (
            <SpeciesGridCell
              key={species.pokedexNumber}
              species={species}
              seen={seenSet.has(species.pokedexNumber)}
              caught={caughtSet.has(species.pokedexNumber)}
              onSelect={handleSelectSpecies}
            />
          ))}
        </div>
        {filteredSpecies.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-lg, 24px)",
              fontSize: "0.45rem",
              color: "var(--color-text-dim, #606070)",
            }}
          >
            No Pokémon match your search.
          </div>
        )}
      </div>
    </div>
  );
}
