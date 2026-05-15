import { useCallback, useMemo } from "react";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import PokemonCard from "../components/PokemonCard";
import {
  getStarters,
  getSpeciesName,
  getSpeciesSpriteUrl,
  getSpeciesTypes,
} from "../game/helpers";

/**
 * StarterSelectScreen — Choose one of three Kanto starter Pokemon.
 *
 * Each starter is displayed as a PokemonCard. On select, adds the
 * Pokemon to the team and navigates to the map screen.
 */
export default function StarterSelectScreen() {
  const selectStarter = useGameStore((s) => s.selectStarter);
  const navigate = useUIStore((s) => s.navigate);

  const starters = useMemo(() => getStarters(), []);

  const handleSelect = useCallback(
    (index: number) => {
      const pokemon = starters[index];
      if (pokemon) {
        selectStarter(pokemon);
        navigate("map");
      }
    },
    [starters, selectStarter, navigate],
  );

  return (
    <div className="screen starter-select-screen">
      <div
        className="screen-content"
        style={{
          justifyContent: "center",
          gap: "var(--space-lg)",
          padding: "var(--space-md)",
        }}
      >
        <h2 className="screen-title" style={{ fontSize: "clamp(0.7rem, 3vw, 1rem)" }}>
          Choose Your Starter
        </h2>

        <p
          style={{
            fontSize: "0.45rem",
            color: "var(--color-text-secondary)",
            textAlign: "center",
            maxWidth: "300px",
          }}
        >
          Which Pokemon will be your first partner?
        </p>

        <div
          className="starter-options"
          style={{
            display: "flex",
            gap: "var(--space-md)",
            justifyContent: "center",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {starters.map((pokemon, index) => {
            const speciesId = pokemon.speciesId;
            return (
              <button
                key={speciesId}
                type="button"
                onClick={() => handleSelect(index)}
                style={{
                  width: "clamp(120px, 35vw, 160px)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "center",
                }}
                aria-label={`Select ${getSpeciesName(speciesId)}`}
              >
                <PokemonCard
                  pokemon={pokemon}
                  name={getSpeciesName(speciesId)}
                  spriteUrl={getSpeciesSpriteUrl(speciesId)}
                  types={getSpeciesTypes(speciesId)}
                  showDetails={false}
                />
                <span
                  style={{
                    display: "block",
                    marginTop: "var(--space-xs)",
                    fontSize: "0.45rem",
                    color: "var(--color-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {getSpeciesName(speciesId)}
                </span>
              </button>
            );
          })}
        </div>

        <button
          className="pixel-button"
          type="button"
          onClick={() => navigate("trainer_select")}
          style={{ maxWidth: "200px", fontSize: "0.5rem" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
