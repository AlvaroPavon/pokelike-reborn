import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";

/**
 * TitleScreen — Main menu with game mode selection.
 *
 * Shows logo, subtitle, and action buttons. Continue button
 * is only visible when a saved game exists.
 */
export default function TitleScreen() {
  const loadGame = useGameStore((s) => s.loadGame);
  const startNewRun = useGameStore((s) => s.startNewRun);
  const navigate = useUIStore((s) => s.navigate);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setHasSave(loadGame());
  }, [loadGame]);

  const handleNewGame = useCallback(() => {
    startNewRun("normal");
    navigate("trainer_select");
  }, [startNewRun, navigate]);

  const handleNuzlocke = useCallback(() => {
    startNewRun("nuzlocke");
    navigate("trainer_select");
  }, [startNewRun, navigate]);

  const handleBattleTower = useCallback(() => {
    startNewRun("battle_tower");
    navigate("trainer_select");
  }, [startNewRun, navigate]);

  const handleContinue = useCallback(() => {
    const loaded = loadGame();
    if (loaded) {
      navigate("map");
    }
  }, [loadGame, navigate]);

  return (
    <div className="screen title-screen">
      <div
        className="screen-content"
        style={{
          justifyContent: "center",
          gap: "var(--space-lg)",
          padding: "var(--space-xl) var(--space-md)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <h1
            className="game-title"
            style={{
              fontSize: "clamp(1.2rem, 5vw, 2rem)",
              marginBottom: "var(--space-xs)",
            }}
          >
            POKELIKE REBORN
          </h1>
          <p
            className="subtitle"
            style={{
              fontSize: "clamp(0.45rem, 2vw, 0.65rem)",
              color: "var(--color-text-secondary)",
              letterSpacing: "2px",
            }}
          >
            Pokemon Roguelike
          </p>
        </div>

        {/* Decorative divider */}
        <div
          style={{
            width: "60%",
            maxWidth: "200px",
            height: "2px",
            backgroundColor: "var(--color-gold-dim)",
            opacity: 0.5,
          }}
        />

        {/* Menu buttons */}
        <div className="menu-options" style={{ gap: "var(--space-sm)" }}>
          <button
            className="pixel-button"
            type="button"
            onClick={handleNewGame}
            style={{ maxWidth: "280px" }}
          >
            New Game
          </button>

          <button
            className="pixel-button"
            type="button"
            onClick={handleContinue}
            disabled={!hasSave}
            style={{
              maxWidth: "280px",
              opacity: hasSave ? 1 : 0.4,
            }}
            title={hasSave ? "Continue saved game" : "No saved game found"}
          >
            Continue
            {!hasSave && (
              <span style={{ display: "block", fontSize: "0.35rem", marginTop: "2px" }}>
                (no save)
              </span>
            )}
          </button>

          <button
            className="pixel-button"
            type="button"
            onClick={handleNuzlocke}
            style={{ maxWidth: "280px", borderColor: "var(--color-accent-red)" }}
          >
            Nuzlocke Mode
          </button>

          <button
            className="pixel-button"
            type="button"
            onClick={handleBattleTower}
            style={{ maxWidth: "280px", borderColor: "var(--color-accent-purple)" }}
          >
            Battle Tower
          </button>

          <button
            className="pixel-button"
            type="button"
            disabled
            style={{ maxWidth: "280px", opacity: 0.4 }}
            title="Coming soon"
          >
            Settings
          </button>
        </div>

        {/* Version */}
        <span
          style={{
            fontSize: "0.35rem",
            color: "var(--color-text-dim)",
            position: "absolute",
            bottom: "var(--space-sm)",
            right: "var(--space-sm)",
          }}
        >
          v0.1.0
        </span>
      </div>
    </div>
  );
}
