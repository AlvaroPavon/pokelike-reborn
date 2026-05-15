import { useCallback } from "react";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import PokemonCard from "../components/PokemonCard";
import {
  getSpeciesName,
  getSpeciesSpriteUrl,
  getSpeciesTypes,
} from "../game/helpers";

/**
 * GameOverScreen — Displayed when the player loses all Pokemon.
 *
 * Shows "GAME OVER" with pulsing red text, badges earned,
 * final team, and a "Try Again" button.
 */
export default function GameOverScreen() {
  const gameStore = useGameStore();
  const navigate = useUIStore((s) => s.navigate);

  const handleTryAgain = useCallback(() => {
    gameStore.endRun();
    navigate("title");
  }, [gameStore, navigate]);

  // Calculate stats
  const badgesEarned = gameStore.badges.length;
  const teamSize = gameStore.team.length;
  const highestLevel = Math.max(
    1,
    ...gameStore.team.map((p) => p.level),
  );
  const totalLevels = gameStore.team.reduce((sum, p) => sum + p.level, 0);

  return (
    <div
      className="screen game-over-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        padding: "var(--space-md)",
        justifyContent: "center",
        alignItems: "center",
        overflow: "auto",
      }}
    >
      {/* Game Over Title */}
      <h1
        className="game-over-title"
        style={{
          fontSize: "clamp(1.5rem, 6vw, 2rem)",
          color: "var(--color-accent-red)",
          textShadow: "3px 3px 0px rgba(231, 76, 60, 0.4)",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "4px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      >
        GAME OVER
      </h1>

      <p
        style={{
          fontSize: "0.5rem",
          color: "var(--color-text-secondary)",
          textAlign: "center",
        }}
      >
        Your journey has ended...
      </p>

      {/* Stats Summary */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-md)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <StatBox label="Badges" value={`${badgesEarned}/8`} />
        <StatBox label="Team Size" value={`${teamSize}/6`} />
        <StatBox label="Highest Lv." value={highestLevel.toString()} />
        <StatBox label="Total Lv." value={totalLevels.toString()} />
      </div>

      {/* Final Team */}
      {gameStore.team.length > 0 && (
        <div style={{ width: "100%", maxWidth: "320px" }}>
          <span
            style={{
              fontSize: "0.4rem",
              color: "var(--color-text-dim)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              display: "block",
              marginBottom: "var(--space-xs)",
              textAlign: "center",
            }}
          >
            Final Team
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-xs)",
            }}
          >
            {gameStore.team.map((p, i) => (
              <PokemonCard
                key={`${p.speciesId}-${i}`}
                pokemon={p}
                name={getSpeciesName(p.speciesId)}
                spriteUrl={getSpeciesSpriteUrl(p.speciesId)}
                types={getSpeciesTypes(p.speciesId)}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Try Again Button */}
      <button
        className="pixel-button"
        type="button"
        onClick={handleTryAgain}
        style={{
          maxWidth: "280px",
          marginTop: "var(--space-md)",
          borderColor: "var(--color-gold)",
        }}
      >
        Try Again
      </button>
    </div>
  );
}

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        padding: "var(--space-sm) var(--space-md)",
        backgroundColor: "var(--color-bg-mid)",
        border: "1px solid var(--color-text-dim)",
        minWidth: "80px",
      }}
    >
      <span
        style={{
          fontSize: "0.5rem",
          color: "var(--color-gold)",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "0.35rem",
          color: "var(--color-text-dim)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}
