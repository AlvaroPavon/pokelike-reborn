import { useCallback, useMemo } from "react";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import PokemonCard from "../components/PokemonCard";
import {
  getSpeciesName,
  getSpeciesSpriteUrl,
  getSpeciesTypes,
} from "../game/helpers";

/**
 * WinScreen — Displayed when the player defeats the Champion.
 *
 * Shows "YOU ARE THE CHAMPION!" in gold, the winning team,
 * stats summary, and options to play again or unlock Battle Tower.
 */
export default function WinScreen() {
  const gameStore = useGameStore();
  const navigate = useUIStore((s) => s.navigate);

  // Check if Battle Tower should be unlocked
  const towerUnlocked = useMemo(
    () => gameStore.badges.length >= 8 || gameStore.mode === "normal",
    [gameStore.badges.length, gameStore.mode],
  );

  const handlePlayAgain = useCallback(() => {
    gameStore.endRun();
    navigate("title");
  }, [gameStore, navigate]);

  const handleBattleTower = useCallback(() => {
    gameStore.endRun();
    gameStore.startNewRun("battle_tower");
    navigate("trainer_select");
  }, [gameStore, navigate]);

  // Stats
  const badgesEarned = gameStore.badges.length;
  const highestLevel = Math.max(
    1,
    ...gameStore.team.map((p) => p.level),
  );
  const totalLevels = gameStore.team.reduce((sum, p) => sum + p.level, 0);

  return (
    <div
      className="screen win-screen"
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
      {/* Win Title */}
      <h1
        className="win-title"
        style={{
          fontSize: "clamp(1rem, 5vw, 1.8rem)",
          color: "var(--color-gold)",
          textShadow: "3px 3px 0px rgba(226, 183, 20, 0.5)",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "3px",
          lineHeight: 1.4,
        }}
      >
        YOU ARE THE CHAMPION!
      </h1>

      <p
        style={{
          fontSize: "0.5rem",
          color: "var(--color-text-secondary)",
          textAlign: "center",
        }}
      >
        Congratulations! You've conquered the Pokemon League!
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
        <StatBox label="Highest Lv." value={highestLevel.toString()} />
        <StatBox label="Total Lv." value={totalLevels.toString()} />
        <StatBox label="Mode" value={gameStore.mode ?? "Normal"} />
      </div>

      {/* Champion Team */}
      {gameStore.team.length > 0 && (
        <div style={{ width: "100%", maxWidth: "320px" }}>
          <span
            style={{
              fontSize: "0.4rem",
              color: "var(--color-gold-dim)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              display: "block",
              marginBottom: "var(--space-xs)",
              textAlign: "center",
            }}
          >
            Champion Team
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-xs)",
            }}
          >
            {gameStore.team.map((p, i) => (
              <div
                key={`${p.speciesId}-${i}`}
                style={{
                  border: "1px solid var(--color-gold-dim)",
                  padding: "var(--space-xs)",
                }}
              >
                <PokemonCard
                  pokemon={p}
                  name={getSpeciesName(p.speciesId)}
                  spriteUrl={getSpeciesSpriteUrl(p.speciesId)}
                  types={getSpeciesTypes(p.speciesId)}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div
        className="menu-options"
        style={{ gap: "var(--space-sm)", marginTop: "var(--space-md)" }}
      >
        <button
          className="pixel-button"
          type="button"
          onClick={handlePlayAgain}
          style={{
            maxWidth: "280px",
            borderColor: "var(--color-gold)",
          }}
        >
          Play Again
        </button>

        {towerUnlocked && (
          <button
            className="pixel-button"
            type="button"
            onClick={handleBattleTower}
            style={{
              maxWidth: "280px",
              borderColor: "var(--color-accent-purple)",
              backgroundColor: "rgba(155, 89, 182, 0.1)",
            }}
          >
            Battle Tower (Unlocked!)
          </button>
        )}

        <button
          className="pixel-button"
          type="button"
          onClick={() => navigate("title")}
          style={{ maxWidth: "200px", fontSize: "0.45rem" }}
        >
          Return to Title
        </button>
      </div>

      {/* Victory decoration */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-xs)",
          fontSize: "0.8rem",
          opacity: 0.3,
        }}
        aria-hidden="true"
      >
        <span>✦</span>
        <span>✦</span>
        <span>✦</span>
        <span>✦</span>
        <span>✦</span>
      </div>
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
