import type { PokemonInstance, PokemonType } from "@pokelike/core";
import HpBar from "./HpBar";

export interface PokemonCardProps {
  pokemon: PokemonInstance;
  onClick?: () => void;
  selected?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  /** Species display name (resolved from registry or API) */
  name?: string;
  /** Sprite image URL (resolved from species data) */
  spriteUrl?: string;
  /** Pokemon types (resolved from species data) */
  types?: [PokemonType, PokemonType?];
  /** Whether this Pokemon has been caught (for Pokedex display) */
  caught?: boolean;
}

const TYPE_COLORS: Record<PokemonType, string> = {
  Normal: "#a8a878",
  Fire: "#f08030",
  Water: "#6890f0",
  Electric: "#f8d030",
  Grass: "#78c850",
  Ice: "#98d8d8",
  Fighting: "#c03028",
  Poison: "#a040a0",
  Ground: "#e0c068",
  Flying: "#a890f0",
  Psychic: "#f85888",
  Bug: "#a8b820",
  Rock: "#b8a038",
  Ghost: "#705898",
  Dragon: "#7038f8",
  Dark: "#705848",
  Steel: "#b8b8d0",
  Fairy: "#ee99ac",
};

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  atk: "ATK",
  def: "DEF",
  spa: "SpA",
  spd: "SpD",
  spe: "SPE",
};

/**
 * PokemonCard — displays a single Pokemon's sprite, name, level,
 * type badges, HP bar, and optionally stats and move info.
 */
export default function PokemonCard({
  pokemon,
  onClick,
  selected = false,
  showDetails = false,
  compact = false,
  name,
  spriteUrl,
  types,
  caught = true,
}: PokemonCardProps) {
  const displayName = name ?? pokemon.nickname ?? pokemon.speciesId;
  const isShiny = false; // TODO: derive from PokemonInstance when shiny flag is added
  const spriteSrc =
    spriteUrl ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getIdFromSpecies(pokemon.speciesId)}.png`;

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: compact ? "row" : "column",
    alignItems: "center",
    gap: compact ? "var(--space-sm, 8px)" : "var(--space-sm, 8px)",
    padding: compact ? "var(--space-xs, 4px) var(--space-sm, 8px)" : "var(--space-sm, 8px)",
    backgroundColor: "var(--color-bg-mid, #1a1a2e)",
    border: selected
      ? "2px solid var(--color-gold, #e2b714)"
      : isShiny
        ? "2px solid var(--color-gold-light, #f5d742)"
        : "2px solid var(--color-text-dim, #606070)",
    borderRadius: 0,
    cursor: onClick ? "pointer" : "default",
    opacity: pokemon.fainted ? 0.5 : 1,
    filter: pokemon.fainted ? "grayscale(1)" : "none",
    transition: "var(--transition-hover, background-color 0.15s ease)",
    width: compact ? "auto" : "100%",
    boxShadow: isShiny ? "0 0 8px var(--color-gold-light, #f5d742)" : undefined,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`pokemon-card${pokemon.fainted ? " pokemon-card--fainted" : ""}${selected ? " pokemon-card--selected" : ""}`}
      style={cardStyle}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${displayName} Level ${pokemon.level}${pokemon.fainted ? ", fainted" : ""}`}
      title={`${displayName} Lv.${pokemon.level}`}
    >
      {/* Sprite */}
      {caught ? (
        <img
          src={spriteSrc}
          alt={displayName}
          style={{
            width: compact ? "40px" : "72px",
            height: compact ? "40px" : "72px",
            imageRendering: "pixelated",
            flexShrink: 0,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div
          style={{
            width: compact ? "40px" : "72px",
            height: compact ? "40px" : "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.4rem",
            color: "var(--color-text-dim)",
            backgroundColor: "var(--color-bg-dark)",
          }}
        >
          ???
        </div>
      )}

      {/* Info */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: compact ? "2px" : "4px",
          flex: 1,
          width: compact ? "auto" : "100%",
          minWidth: 0,
        }}
      >
        {/* Name + Level */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--space-xs, 4px)",
          }}
        >
          <span
            style={{
              fontSize: compact ? "0.45rem" : "0.55rem",
              color: "var(--color-text-primary, #e0e0e0)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textTransform: "capitalize",
            }}
          >
            {displayName}
          </span>
          <span
            style={{
              fontSize: compact ? "0.4rem" : "0.5rem",
              color: "var(--color-text-secondary, #a0a0b0)",
              whiteSpace: "nowrap",
            }}
          >
            Lv.{pokemon.level}
          </span>
        </div>

        {/* Type badges */}
        {types && types.length > 0 && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {types.map(
              (t) =>
                t && (
                  <span
                    key={t}
                    style={{
                      fontSize: compact ? "0.35rem" : "0.4rem",
                      padding: "1px 4px",
                      backgroundColor: TYPE_COLORS[t] || "#999",
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      lineHeight: 1.4,
                    }}
                  >
                    {t}
                  </span>
                ),
            )}
          </div>
        )}

        {/* HP Bar */}
        {!compact && (
          <HpBar
            currentHp={pokemon.currentHp}
            maxHp={pokemon.maxHp}
            showText
            size="sm"
            animated
          />
        )}

        {/* Status condition */}
        {pokemon.status && !compact && (
          <span
            style={{
              fontSize: "0.4rem",
              color: "var(--color-accent-red, #e74c3c)",
              textTransform: "uppercase",
            }}
          >
            [{pokemon.status}]
          </span>
        )}
      </div>

      {/* Details section (stats + moves) */}
      {showDetails && (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            paddingTop: "4px",
            borderTop: "1px solid var(--color-text-dim, #606070)",
          }}
        >
          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2px",
              fontSize: "0.4rem",
            }}
          >
            {Object.entries(STAT_LABELS).map(([key, label]) => {
              const val = pokemon.stats[key as keyof typeof pokemon.stats];
              return (
                <span key={key} style={{ color: "var(--color-text-secondary)" }}>
                  {label}: {val}
                </span>
              );
            })}
          </div>

          {/* Moves */}
          {pokemon.moves.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "2px",
                fontSize: "0.4rem",
              }}
            >
              <span style={{ color: "var(--color-text-dim)" }}>Moves: </span>
              {pokemon.moves.map((m) => (
                <span key={m.moveId} style={{ color: "var(--color-accent-blue)" }}>
                  {m.moveId}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Extract a numeric Pokemon ID from a species ID string.
 * Supports formats like "1", "bulbasaur", or "pokemon_1".
 */
function getIdFromSpecies(speciesId: string): string {
  const numMatch = speciesId.match(/\d+/);
  if (numMatch) return numMatch[0];
  // Fallback: map common species names to IDs
  const NAME_TO_ID: Record<string, string> = {
    bulbasaur: "1",
    ivysaur: "2",
    venusaur: "3",
    charmander: "4",
    charmeleon: "5",
    charizard: "6",
    squirtle: "7",
    wartortle: "8",
    blastoise: "9",
    pikachu: "25",
    mewtwo: "150",
    mew: "151",
  };
  return NAME_TO_ID[speciesId.toLowerCase()] ?? "25";
}
