import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";

/**
 * TitleScreen - main menu with game mode selection.
 */
export default function TitleScreen() {
  const loadGame = useGameStore((s) => s.loadGame);
  const startNewRun = useGameStore((s) => s.startNewRun);
  const navigate = useUIStore((s) => s.navigate);
  const token = useAuthStore((s) => s.token);
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
    navigate("battle_tower");
  }, [startNewRun, navigate]);

  const handleMultiplayer = useCallback(() => {
    navigate("lobby");
  }, [navigate]);

  const handleContinue = useCallback(() => {
    const loaded = loadGame();
    if (loaded) {
      navigate("map");
    }
  }, [loadGame, navigate]);

  return (
    <div className="screen title-screen">
      <div className="title-screen__clouds" aria-hidden="true" />
      <div className="title-screen__content">
        <header className="title-screen__brand">
          <h1 className="game-title">POKELIKE REBORN</h1>
          <p className="subtitle">Pokemon Roguelike</p>
          <span className="title-screen__version">v0.1.0</span>
        </header>

        <div className="title-screen__primary-actions">
          <button
            className="pixel-button pixel-button--primary"
            type="button"
            onClick={handleNewGame}
          >
            Normal Mode
          </button>

          <button
            className="pixel-button"
            type="button"
            onClick={handleContinue}
            disabled={!hasSave}
            title={hasSave ? "Continue saved game" : "No saved game found"}
          >
            {hasSave ? "Continue Run" : "Continue"}
          </button>
        </div>

        <div className="title-screen__mode-row" aria-label="Game modes">
          <button
            className="pixel-button pixel-button--danger"
            type="button"
            onClick={handleNuzlocke}
          >
            Nuzlocke
          </button>

          <button
            className="pixel-button pixel-button--muted"
            type="button"
            onClick={handleBattleTower}
          >
            Battle Tower
          </button>
        </div>

        <div className="title-screen__utility-grid" aria-label="Utilities">
          <button
            className="pixel-button pixel-button--dark"
            type="button"
            onClick={() => navigate("pokedex")}
          >
            Pokedex
          </button>

          <button
            className="pixel-button pixel-button--dark"
            type="button"
            onClick={() => navigate("profile")}
            disabled={!token}
            title={token ? "Open profile" : "Login required"}
          >
            Profile
          </button>

          <button
            className="pixel-button pixel-button--dark"
            type="button"
            onClick={handleMultiplayer}
            disabled={!token}
            title={token ? "Find a 3v3 match" : "Login required"}
          >
            Multiplayer 3v3
          </button>

          <button
            className="pixel-button pixel-button--dark"
            type="button"
            disabled
            title="Coming soon"
          >
            Settings
          </button>
        </div>

        <p className="title-screen__fineprint">
          Fan-made project. Pokemon names and sprites belong to their owners.
        </p>
      </div>
    </div>
  );
}
