import { useCallback, useEffect, useRef, useState } from "react";
import { SeededRNG } from "@pokelike/core";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import BattleField from "../components/BattleField";
import {
  simulateBattle,
  applyLevelGain,
  canEvolve,
  resolveEvolution,
  getSpeciesName,
  getGymBadgeName,
} from "../game/helpers";
import type { BattleLogEntry } from "@pokelike/core";
import type { BattleTowerRules } from "@pokelike/core";

/**
 * BattleScreen — Auto-battle simulation screen.
 *
 * On mount: runs full battle simulation and streams the log.
 * On victory: applies XP gains, checks evolutions, awards badges.
 * On defeat: navigates to game over.
 */
export default function BattleScreen() {
  const gameStore = useGameStore();
  const uiStore = useUIStore();

  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [animating, setAnimating] = useState(true);
  const [result, setResult] = useState<{
    winner: "player" | "enemy" | "draw";
    playerTeam: typeof gameStore.team;
    enemyTeam: typeof gameStore.team;
  } | null>(null);

  const battleRunRef = useRef(false);
  const rngRef = useRef(new SeededRNG(gameStore.runSeed ?? Date.now()));

  const enemyTeam = uiStore.battleEnemyTeam;
  const nodeType = uiStore.battleNodeType;

  // Run battle simulation on mount
  useEffect(() => {
    if (!enemyTeam || battleRunRef.current) return;
    battleRunRef.current = true;

    const rng = rngRef.current;

    // Simulate the battle
    const battleResult = simulateBattle(gameStore.team, enemyTeam, rng);

    // Stream the log with a delay
    let logIndex = 0;
    const logInterval = setInterval(() => {
      if (logIndex < battleResult.log.length) {
        const entry = battleResult.log[logIndex]!;
        setBattleLog((prev) => [...prev, entry]);
        logIndex++;
      } else {
        clearInterval(logInterval);
        setAnimating(false);

        const playerTeamAfter = battleResult.finalPlayerTeam;
        const enemyTeamAfter = battleResult.finalEnemyTeam;

        // Store the result for the continue handler
        setResult({
          winner: battleResult.winner,
          playerTeam: structuredClone(playerTeamAfter),
          enemyTeam: structuredClone(enemyTeamAfter),
        });

        // If victory, apply gains immediately
        if (battleResult.winner === "player") {
          // Generate a random badge boss gain
          const isBoss = nodeType === "BOSS";
          const levelGain = isBoss ? 30 : 15;
          const participantIdxs = gameStore.team.map((_, i) => i);
          const updatedTeam = applyLevelGain(
            structuredClone(playerTeamAfter),
            participantIdxs,
            levelGain,
          );

          // Check and apply evolutions
          const finalTeam = updatedTeam.map((p) => {
            if (canEvolve(p)) {
              const evolved = resolveEvolution(p);
              // Add evolution log entry
              setBattleLog((prev) => [
                ...prev,
                {
                  turn: battleResult.log.length + 1,
                  side: "system",
                  action: "evolve",
                  message: `${getSpeciesName(p.speciesId)} is evolving into ${getSpeciesName(evolved.speciesId)}!`,
                },
              ]);
              return evolved;
            }
            return p;
          });

          // Award badge for boss battles
          if (isBoss && gameStore.currentMapIndex < 8) {
            const badgeName = getGymBadgeName(gameStore.currentMapIndex);
            gameStore.earnBadge(badgeName);
            setBattleLog((prev) => [
              ...prev,
              {
                turn: battleResult.log.length + 1,
                side: "system",
                action: "badge",
                message: `You earned the ${badgeName}!`,
              },
            ]);

            // Check if all 8 badges earned → win!
            if (gameStore.badges.length + 1 >= 8) {
              // Will navigate on continue
            }
          }

          // Check if all gyms beaten + elite 4 cleared
          if (gameStore.currentMapIndex >= 8 && isBoss) {
            // Check if we've cleared all elite 4 members
            // For simplicity, winning at Indigo Plateau = champion
          }

          // Update team in store (but only if won)
          const currentTeam = useGameStore.getState().team;
          const mergedTeam = currentTeam.map((p, i) => finalTeam[i] ?? p);
          useGameStore.setState({ team: mergedTeam });
        }
      }
    }, 400);

    return () => clearInterval(logInterval);
  }, [enemyTeam, gameStore, nodeType]);

  // Continue handler
  const handleContinue = useCallback(() => {
    if (!result) return;

    // ─── Battle Tower Mode ───────────────────────────────────────────────
    if (gameStore.mode === "battle_tower") {
      const rules = gameStore.modeRules as BattleTowerRules | null;
      if (result.winner === "player") {
        rules?.recordWin();
        uiStore.navigate("battle_tower");
      } else {
        rules?.recordLoss();
        uiStore.navigate("battle_tower");
      }
      return;
    }

    // ─── Standard Game Modes (Normal / Nuzlocke) ────────────────────────
    if (result.winner === "player") {
      // Check if we should advance to next map
      const isBoss = nodeType === "BOSS";
      if (isBoss && gameStore.currentMapIndex < 7) {
        useGameStore.setState({ currentMapIndex: gameStore.currentMapIndex + 1 });
        uiStore.navigate("map");
        return;
      }

      // Check if we won the entire game (map 8 boss = champion)
      if (isBoss && gameStore.currentMapIndex >= 8) {
        uiStore.navigate("win");
        return;
      }

      // Check if all 8 badges earned
      if (gameStore.badges.length >= 8 && gameStore.currentMapIndex === 7) {
        useGameStore.setState({ currentMapIndex: 8 });
        uiStore.navigate("map");
        return;
      }

      uiStore.navigate("map");
    } else {
      uiStore.navigate("game_over");
    }
  }, [result, nodeType, gameStore, uiStore]);

  // Retry handler (for when you lose but want to try again)
  const handleRetry = useCallback(() => {
    battleRunRef.current = false;
    setBattleLog([]);
    setAnimating(true);
    setResult(null);
    rngRef.current = new SeededRNG(Date.now());
    // Re-trigger by re-setting battle enemy team
    if (enemyTeam) {
      uiStore.setBattleData(enemyTeam, nodeType ?? undefined);
    }
    // Force re-render
    window.location.reload();
  }, [enemyTeam, nodeType, uiStore]);

  // Navigate back if no battle data
  useEffect(() => {
    if (!enemyTeam) {
      const timer = setTimeout(() => uiStore.navigate("map"), 1000);
      return () => clearTimeout(timer);
    }
  }, [enemyTeam, uiStore]);

  if (!enemyTeam) {
    return (
      <div className="screen battle-screen">
        <div className="screen-content">
          <div className="placeholder">No battle data. Returning to map...</div>
        </div>
      </div>
    );
  }

  const playerWin = result?.winner === "player";
  const battleOver = !animating && result !== null;

  return (
    <div
      className="screen battle-screen"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
        padding: "var(--space-sm)",
        height: "100dvh",
      }}
    >
      {/* Battle Field */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <BattleField
          playerTeam={gameStore.team}
          enemyTeam={enemyTeam}
          battleLog={battleLog}
          animating={animating}
        />
      </div>

      {/* Battle Actions */}
      <div
        className="battle-actions"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "var(--space-sm)",
          flexShrink: 0,
        }}
      >
        {battleOver && (
          <button
            className="pixel-button"
            type="button"
            onClick={handleContinue}
            style={{
              maxWidth: "280px",
              backgroundColor: playerWin
                ? "var(--color-accent-green)"
                : "var(--color-accent-red)",
              borderColor: playerWin
                ? "var(--color-accent-green)"
                : "var(--color-accent-red)",
            }}
          >
            {playerWin ? "Continue" : "Game Over"}
          </button>
        )}

        {battleOver && !playerWin && (
          <button
            className="pixel-button"
            type="button"
            onClick={handleRetry}
            style={{ maxWidth: "200px", fontSize: "0.5rem" }}
          >
            Retry Battle
          </button>
        )}
      </div>
    </div>
  );
}
