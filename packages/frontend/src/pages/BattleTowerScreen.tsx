/**
 * @fileoverview Battle Tower screen — tower lobby, progress display,
 * and run lifecycle management.
 *
 * Manages the Battle Tower game mode flow:
 * 1. Lobby: "Start Run" button
 * 2. Active run: floor progress bar, win counter, "Next Floor" button
 * 3. Defeat: total wins display, "Retry" or "Exit" options
 *
 * The tower uses `BattleTowerRules` (from the game store) for encounter
 * generation and floor tracking. Each battle is delegated to `BattleScreen`,
 * which returns here after completion.
 *
 * @module pages
 */

import { useCallback, useMemo } from "react";
import { getSpeciesById, type BattleTowerRules, type PokemonInstance } from "@pokelike/core";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import { usePokedexStore } from "../stores/pokedexStore";

/**
 * Maximum floor for progress bar calculation.
 * The bar shows progress in groups of 10 floors.
 */
const PROGRESS_GROUP_SIZE = 10;

/**
 * BattleTowerScreen — Tower lobby and run management UI.
 */
export default function BattleTowerScreen() {
  const modeRules = useGameStore((s) => s.modeRules);
  const team = useGameStore((s) => s.team);
  const navigate = useUIStore((s) => s.navigate);

  // Cast to BattleTowerRules — safe because we check mode in the store
  const rules = modeRules as BattleTowerRules | null;

  // ─── Derived State ──────────────────────────────────────────────────────

  const currentFloor = rules?.currentFloor ?? 0;
  const totalWins = rules?.totalWins ?? 0;
  const lastResult = rules?.lastBattleResult ?? null;
  const nextLevel = rules?.nextLevel ?? 5;
  const nextTeamSize = rules?.nextTeamSize ?? 1;

  /**
   * Progress percentage within the current 10-floor group.
   * Floor 1 → 10%, Floor 5 → 50%, Floor 10 → 100%
   */
  const progressPercent = useMemo(() => {
    if (currentFloor === 0) return 0;
    const position = ((currentFloor - 1) % PROGRESS_GROUP_SIZE) + 1;
    return (position / PROGRESS_GROUP_SIZE) * 100;
  }, [currentFloor]);

  // ─── Handlers ───────────────────────────────────────────────────────────

  /**
   * Mark all species in an opponent team as seen in the Pokédex.
   */
  function markOpponentSeen(opponent: PokemonInstance[]): void {
    const pokedex = usePokedexStore.getState();
    for (const p of opponent) {
      const entry = getSpeciesById(p.speciesId);
      if (entry) pokedex.markSeen(entry.pokedexNumber);
    }
  }

  /**
   * Start a fresh tower run: reset state, generate floor 1 encounter,
   * and navigate to battle.
   */
  const handleStartRun = useCallback(() => {
    if (!rules) return;
    rules.reset();
    const opponent = rules.getNextEncounter();
    markOpponentSeen(opponent);
    useUIStore.getState().setBattleData(opponent, "tower");
    navigate("battle");
  }, [rules, navigate]);

  /**
   * Advance to the next floor: generate the next encounter
   * and navigate to battle.
   */
  const handleNextFloor = useCallback(() => {
    if (!rules) return;
    const opponent = rules.getNextEncounter();
    markOpponentSeen(opponent);
    useUIStore.getState().setBattleData(opponent, "tower");
    navigate("battle");
  }, [rules, navigate]);

  /**
   * Retry the run: reset and start fresh from floor 1.
   */
  const handleRetry = useCallback(() => {
    if (!rules) return;
    rules.reset();
    const opponent = rules.getNextEncounter();
    markOpponentSeen(opponent);
    useUIStore.getState().setBattleData(opponent, "tower");
    navigate("battle");
  }, [rules, navigate]);

  /**
   * Exit back to the title screen.
   */
  const handleExit = useCallback(() => {
    if (rules) {
      rules.reset();
    }
    navigate("title");
  }, [rules, navigate]);

  /**
   * Go back to title from the lobby.
   */
  const handleBackToTitle = useCallback(() => {
    navigate("title");
  }, [navigate]);

  // ─── Render Helpers ─────────────────────────────────────────────────────

  /**
   * Check if the player has lost (all Pokemon fainted).
   */
  const allFainted = useMemo(() => {
    return (
      team.length > 0 &&
      team.every((p) => p.fainted || p.currentHp <= 0)
    );
  }, [team]);

  /**
   * Determine the current screen state.
   */
  const screenState = useMemo<"lobby" | "active" | "defeat">(() => {
    if (currentFloor === 0) return "lobby";
    if (lastResult === "loss" || allFainted) return "defeat";
    return "active";
  }, [currentFloor, lastResult, allFainted]);

  // ─── Lobby State ────────────────────────────────────────────────────────

  if (screenState === "lobby") {
    return (
      <div className="screen battle-tower-screen">
        <div
          className="screen-content"
          style={{
            justifyContent: "center",
            gap: "var(--space-lg)",
            padding: "var(--space-xl) var(--space-md)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
                marginBottom: "var(--space-xs)",
                color: "var(--color-accent-purple)",
              }}
            >
              BATTLE TOWER
            </h1>
            <p
              style={{
                fontSize: "clamp(0.4rem, 2vw, 0.6rem)",
                color: "var(--color-text-secondary)",
              }}
            >
              Endless Challenge Mode
            </p>
          </div>

          {/* Description */}
          <div
            style={{
              textAlign: "center",
              maxWidth: "300px",
              fontSize: "clamp(0.4rem, 1.5vw, 0.55rem)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            <p>
              Battle through endless floors of increasingly difficult opponents.
              How many wins can you stack before your team falls?
            </p>
            <p style={{ marginTop: "var(--space-sm)", color: "var(--color-text-dim)" }}>
              Floor 1 starts at level 5. Difficulty scales every floor.
            </p>
          </div>

          {/* Start Button */}
          <button
            className="pixel-button"
            type="button"
            onClick={handleStartRun}
            style={{
              maxWidth: "280px",
              borderColor: "var(--color-accent-purple)",
              fontSize: "clamp(0.45rem, 2vw, 0.6rem)",
            }}
          >
            Start Run
          </button>

          {/* Back Button */}
          <button
            className="pixel-button"
            type="button"
            onClick={handleBackToTitle}
            style={{
              maxWidth: "200px",
              fontSize: "clamp(0.35rem, 1.5vw, 0.5rem)",
            }}
          >
            Back to Title
          </button>
        </div>
      </div>
    );
  }

  // ─── Defeat State ───────────────────────────────────────────────────────

  if (screenState === "defeat") {
    return (
      <div className="screen battle-tower-screen">
        <div
          className="screen-content"
          style={{
            justifyContent: "center",
            gap: "var(--space-lg)",
            padding: "var(--space-xl) var(--space-md)",
          }}
        >
          {/* Defeat Header */}
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontSize: "clamp(1rem, 4vw, 1.5rem)",
                marginBottom: "var(--space-xs)",
                color: "var(--color-accent-red)",
              }}
            >
              RUN OVER
            </h1>
            <p
              style={{
                fontSize: "clamp(0.4rem, 2vw, 0.6rem)",
                color: "var(--color-text-secondary)",
              }}
            >
              Your tower run has ended
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-md)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              minWidth: "200px",
            }}
          >
            <div
              style={{
                fontSize: "clamp(0.6rem, 3vw, 1rem)",
                fontWeight: "bold",
                color: "var(--color-accent-gold)",
              }}
            >
              {totalWins}
            </div>
            <div
              style={{
                fontSize: "clamp(0.35rem, 1.5vw, 0.5rem)",
                color: "var(--color-text-dim)",
              }}
            >
              Total Wins
            </div>
            <div
              style={{
                fontSize: "clamp(0.35rem, 1.5vw, 0.5rem)",
                color: "var(--color-text-secondary)",
                marginTop: "var(--space-sm)",
              }}
            >
              Defeated at Floor {currentFloor}
            </div>
          </div>

          {/* Action Buttons */}
          <button
            className="pixel-button"
            type="button"
            onClick={handleRetry}
            style={{
              maxWidth: "280px",
              borderColor: "var(--color-accent-purple)",
              fontSize: "clamp(0.45rem, 2vw, 0.6rem)",
            }}
          >
            Retry (Restart from Floor 1)
          </button>

          <button
            className="pixel-button"
            type="button"
            onClick={handleExit}
            style={{
              maxWidth: "200px",
              fontSize: "clamp(0.35rem, 1.5vw, 0.5rem)",
            }}
          >
            Exit to Title
          </button>
        </div>
      </div>
    );
  }

  // ─── Active Run State ───────────────────────────────────────────────────

  return (
    <div className="screen battle-tower-screen">
      <div
        className="screen-content"
        style={{
          justifyContent: "center",
          gap: "var(--space-lg)",
          padding: "var(--space-xl) var(--space-md)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "clamp(0.8rem, 3.5vw, 1.2rem)",
              marginBottom: "var(--space-xs)",
              color: "var(--color-accent-purple)",
            }}
          >
            BATTLE TOWER
          </h1>
        </div>

        {/* Floor Progress */}
        <div
          style={{
            width: "100%",
            maxWidth: "320px",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-sm)",
          }}
        >
          {/* Floor Number */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "clamp(0.45rem, 2vw, 0.6rem)",
                color: "var(--color-text-secondary)",
              }}
            >
              Floor
            </span>
            <span
              style={{
                fontSize: "clamp(0.6rem, 2.5vw, 0.85rem)",
                fontWeight: "bold",
                color: "var(--color-text-primary)",
              }}
            >
              {currentFloor}
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "12px",
              backgroundColor: "var(--color-bg-tertiary, #333)",
              borderRadius: "6px",
              overflow: "hidden",
              border: "1px solid var(--color-border, #555)",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                backgroundColor: "var(--color-accent-purple, #a855f7)",
                borderRadius: "6px",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </div>

          {/* Progress Labels */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "clamp(0.3rem, 1.2vw, 0.4rem)",
              color: "var(--color-text-dim)",
            }}
          >
            <span>
              Group {Math.ceil(currentFloor / PROGRESS_GROUP_SIZE)}
            </span>
            <span>
              Floor {Math.ceil(currentFloor / PROGRESS_GROUP_SIZE) * PROGRESS_GROUP_SIZE}
            </span>
          </div>
        </div>

        {/* Win Counter */}
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-sm) var(--space-md)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            minWidth: "160px",
          }}
        >
          <div
            style={{
              fontSize: "clamp(0.5rem, 2.5vw, 0.75rem)",
              fontWeight: "bold",
              color: "var(--color-accent-gold, #eab308)",
            }}
          >
            {totalWins}
          </div>
          <div
            style={{
              fontSize: "clamp(0.35rem, 1.5vw, 0.5rem)",
              color: "var(--color-text-dim)",
            }}
          >
            {totalWins === 1 ? "Win" : "Wins"}
          </div>
        </div>

        {/* Next Floor Info */}
        <div
          style={{
            textAlign: "center",
            fontSize: "clamp(0.35rem, 1.5vw, 0.5rem)",
            color: "var(--color-text-secondary)",
          }}
        >
          Next opponent: Lv.{nextLevel} &times; {nextTeamSize}
        </div>

        {/* Action Button */}
        {lastResult === "win" && (
          <button
            className="pixel-button"
            type="button"
            onClick={handleNextFloor}
            style={{
              maxWidth: "280px",
              borderColor: "var(--color-accent-green)",
              fontSize: "clamp(0.45rem, 2vw, 0.6rem)",
            }}
          >
            Next Floor
          </button>
        )}

        {lastResult !== "win" && currentFloor > 0 && (
          <button
            className="pixel-button"
            type="button"
            onClick={handleNextFloor}
            style={{
              maxWidth: "280px",
              borderColor: "var(--color-accent-purple)",
              fontSize: "clamp(0.45rem, 2vw, 0.6rem)",
            }}
          >
            Begin Battle
          </button>
        )}
      </div>
    </div>
  );
}
