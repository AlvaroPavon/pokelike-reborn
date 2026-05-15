import { useCallback, useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import PokemonCard from "../components/PokemonCard";
import {
  getSpeciesName,
  getSpeciesSpriteUrl,
  getSpeciesTypes,
} from "../game/helpers";
import type { PokemonInstance } from "@pokelike/core";

/**
 * CatchScreen — Choose a wild Pokemon to add to the team.
 *
 * Shows 3 catch choices from the encounter pool. Click to add
 * to team. If team is full (6), shows a swap modal.
 * "Skip" button to pass without catching.
 */
export default function CatchScreen() {
  const gameStore = useGameStore();
  const uiStore = useUIStore();
  const navigate = useUIStore((s) => s.navigate);

  const choices = uiStore.catchChoices;
  const [swapMode, setSwapMode] = useState(false);
  const [selectedCatch, setSelectedCatch] = useState<PokemonInstance | null>(null);

  const handleSelect = useCallback(
    (pokemon: PokemonInstance) => {
      if (gameStore.team.length >= 6) {
        // Team is full, show swap modal
        setSelectedCatch(pokemon);
        setSwapMode(true);
      } else {
        gameStore.addToTeam(pokemon);
        navigate("map");
      }
    },
    [gameStore, navigate],
  );

  const handleSwapSelect = useCallback(
    (swapIndex: number) => {
      if (selectedCatch) {
        gameStore.removeFromTeam(swapIndex);
        gameStore.addToTeam(selectedCatch);
      }
      setSwapMode(false);
      setSelectedCatch(null);
      navigate("map");
    },
    [selectedCatch, gameStore, navigate],
  );

  const handleSkip = useCallback(() => {
    navigate("map");
  }, [navigate]);

  if (!choices || choices.length === 0) {
    return (
      <div className="screen catch-screen">
        <div className="screen-content">
          <div className="placeholder">No Pokemon available.</div>
          <button className="pixel-button" type="button" onClick={handleSkip} style={{ maxWidth: "200px" }}>
            Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen catch-screen">
      <div
        className="screen-content"
        style={{
          justifyContent: "center",
          gap: "var(--space-lg)",
          padding: "var(--space-md)",
        }}
      >
        <h2 className="screen-title" style={{ fontSize: "clamp(0.6rem, 3vw, 0.85rem)" }}>
          Wild Encounter!
        </h2>

        <p
          style={{
            fontSize: "0.45rem",
            color: "var(--color-text-secondary)",
            textAlign: "center",
          }}
        >
          Choose a Pokemon to catch
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
          {choices.map((pokemon, index) => {
            const speciesId = pokemon.speciesId;
            return (
              <button
                key={`${speciesId}-${index}`}
                type="button"
                onClick={() => handleSelect(pokemon)}
                style={{
                  width: "clamp(110px, 30vw, 140px)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textAlign: "center",
                }}
                aria-label={`Catch ${getSpeciesName(speciesId)}`}
              >
                <PokemonCard
                  pokemon={pokemon}
                  name={getSpeciesName(speciesId)}
                  spriteUrl={getSpeciesSpriteUrl(speciesId)}
                  types={getSpeciesTypes(speciesId)}
                />
                <span
                  style={{
                    display: "block",
                    marginTop: "var(--space-xs)",
                    fontSize: "0.4rem",
                    color: "var(--color-text-secondary)",
                    textTransform: "uppercase",
                  }}
                >
                  Lv.{pokemon.level} {getSpeciesName(speciesId)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Swap modal */}
        {swapMode && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "var(--color-overlay)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
            }}
            onClick={() => setSwapMode(false)}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "var(--color-bg-mid)",
                border: "2px solid var(--color-gold-dim)",
                padding: "var(--space-lg)",
                maxWidth: "360px",
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  fontSize: "0.55rem",
                  color: "var(--color-gold)",
                  textAlign: "center",
                  marginBottom: "var(--space-md)",
                  textTransform: "uppercase",
                }}
              >
                Team Full! Choose a Pokemon to release
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-xs)",
                }}
              >
                {gameStore.team.map((p, index) => (
                  <button
                    key={`${p.speciesId}-${index}`}
                    type="button"
                    onClick={() => handleSwapSelect(index)}
                    style={{
                      background: "none",
                      border: "1px solid var(--color-text-dim)",
                      cursor: "pointer",
                      padding: "var(--space-xs)",
                      textAlign: "left",
                      fontFamily: "var(--font-pixel)",
                    }}
                  >
                    <PokemonCard
                      pokemon={p}
                      name={getSpeciesName(p.speciesId)}
                      spriteUrl={getSpeciesSpriteUrl(p.speciesId)}
                      types={getSpeciesTypes(p.speciesId)}
                      compact
                    />
                  </button>
                ))}
              </div>

              <button
                className="pixel-button"
                type="button"
                onClick={() => setSwapMode(false)}
                style={{
                  marginTop: "var(--space-md)",
                  maxWidth: "200px",
                  fontSize: "0.45rem",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Skip button */}
        <button
          className="pixel-button"
          type="button"
          onClick={handleSkip}
          style={{ maxWidth: "200px", fontSize: "0.5rem" }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
