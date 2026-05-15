import { useMemo, useRef, useEffect, useState } from "react";
import type { PokemonInstance, BattleLogEntry } from "@pokelike/core";
import PokemonCard from "./PokemonCard";

export interface BattleFieldProps {
  playerTeam: PokemonInstance[];
  enemyTeam: PokemonInstance[];
  battleLog: BattleLogEntry[];
  animating: boolean;
}

/**
 * BattleField — two-sided battle display.
 *
 * Layout:
 * - Enemy side (right) with active enemy Pokemon
 * - Player side (left) with active player Pokemon
 * - HP bars with damage animation
 * - Attack flash effect on hit
 * - Battle log scrolling at the bottom
 * - Victory/defeat overlay
 */
export default function BattleField({
  playerTeam,
  enemyTeam,
  battleLog,
  animating,
}: BattleFieldProps) {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [flashSide, setFlashSide] = useState<"player" | "enemy" | null>(null);

  // Scroll battle log to bottom on new entries
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [battleLog]);

  // Flash effect: detect last log entry for attack animation
  useEffect(() => {
    if (battleLog.length === 0) return;
    const lastEntry = battleLog[battleLog.length - 1];
    if (lastEntry.action === "attack" && lastEntry.damage && lastEntry.damage > 0) {
      const target = lastEntry.side === "player" ? "enemy" : "player";
      setFlashSide(target);
      const timer = setTimeout(() => setFlashSide(null), 300);
      return () => clearTimeout(timer);
    }
  }, [battleLog]);

  const activePlayer = useMemo(
    () => playerTeam.find((p) => !p.fainted) ?? playerTeam[0],
    [playerTeam],
  );
  const activeEnemy = useMemo(
    () => enemyTeam.find((p) => !p.fainted) ?? enemyTeam[0],
    [enemyTeam],
  );

  const playerAllFainted = playerTeam.every((p) => p.fainted);
  const enemyAllFainted = enemyTeam.every((p) => p.fainted);

  return (
    <div
      className="battle-field"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: "var(--space-md, 16px)",
        position: "relative",
      }}
    >
      {/* Battle arena */}
      <div
        className="battle-field__arena"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          gap: "var(--space-md, 16px)",
          padding: "var(--space-sm, 8px)",
          backgroundColor: "var(--color-bg-mid, #1a1a2e)",
          border: "1px solid var(--color-text-dim, #606070)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Enemy side */}
        <div
          className="battle-field__enemy"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "var(--space-xs, 4px)",
            transition: flashSide === "enemy" ? "none" : "opacity 0.2s ease",
            opacity: flashSide === "enemy" ? 0.6 : 1,
          }}
        >
          {activeEnemy ? (
            <>
              {animating && flashSide === "enemy" && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "80px",
                    height: "80px",
                    backgroundColor: "rgba(255, 200, 100, 0.4)",
                    borderRadius: "50%",
                    animation: "attackFlash 0.3s ease-out",
                    pointerEvents: "none",
                  }}
                />
              )}
              <div
                style={{
                  width: "100%",
                  maxWidth: "240px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  backgroundColor: "var(--color-bg-light, #16213e)",
                  padding: "var(--space-sm, 8px)",
                  border: `1px solid ${
                    activeEnemy.fainted
                      ? "var(--color-accent-red, #e74c3c)"
                      : "var(--color-text-dim, #606070)"
                  }`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.5rem",
                    color: "var(--color-text-primary, #e0e0e0)",
                    textTransform: "capitalize",
                  }}
                >
                  <span>{activeEnemy.nickname ?? activeEnemy.speciesId}</span>
                  <span>Lv.{activeEnemy.level}</span>
                </div>
                <HpBarInline
                  currentHp={activeEnemy.currentHp}
                  maxHp={activeEnemy.maxHp}
                  showText
                />
              </div>
            </>
          ) : (
            <div
              className="placeholder"
              style={{ width: "200px", minHeight: "80px" }}
            >
              No enemy
            </div>
          )}
        </div>

        {/* Player side */}
        <div
          className="battle-field__player"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "var(--space-xs, 4px)",
            transition: flashSide === "player" ? "none" : "opacity 0.2s ease",
            opacity: flashSide === "player" ? 0.6 : 1,
          }}
        >
          {activePlayer ? (
            <>
              {animating && flashSide === "player" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "80px",
                    height: "80px",
                    backgroundColor: "rgba(255, 200, 100, 0.4)",
                    borderRadius: "50%",
                    animation: "attackFlash 0.3s ease-out",
                    pointerEvents: "none",
                  }}
                />
              )}
              <div
                style={{
                  width: "100%",
                  maxWidth: "240px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  backgroundColor: "var(--color-bg-light, #16213e)",
                  padding: "var(--space-sm, 8px)",
                  border: `1px solid ${
                    activePlayer.fainted
                      ? "var(--color-accent-red, #e74c3c)"
                      : "var(--color-text-dim, #606070)"
                  }`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.5rem",
                    color: "var(--color-text-primary, #e0e0e0)",
                    textTransform: "capitalize",
                  }}
                >
                  <span>{activePlayer.nickname ?? activePlayer.speciesId}</span>
                  <span>Lv.{activePlayer.level}</span>
                </div>
                <HpBarInline
                  currentHp={activePlayer.currentHp}
                  maxHp={activePlayer.maxHp}
                  showText
                />
              </div>
            </>
          ) : (
            <div
              className="placeholder"
              style={{ width: "200px", minHeight: "80px" }}
            >
              No Pokemon
            </div>
          )}
        </div>
      </div>

      {/* Battle Log */}
      <div
        className="battle-field__log"
        style={{
          maxHeight: "120px",
          overflowY: "auto",
          backgroundColor: "var(--color-bg-dark, #0f0f23)",
          border: "1px solid var(--color-text-dim, #606070)",
          padding: "var(--space-sm, 8px)",
          fontFamily: "var(--font-pixel, 'Press Start 2P', monospace)",
          fontSize: "0.4rem",
          lineHeight: 1.8,
        }}
        role="log"
        aria-label="Battle log"
        aria-live="polite"
      >
        {battleLog.length === 0 ? (
          <span style={{ color: "var(--color-text-dim, #606070)" }}>
            Battle start...
          </span>
        ) : (
          battleLog.map((entry, i) => (
            <div
              key={`log-${i}`}
              style={{
                color:
                  entry.side === "player"
                    ? "var(--color-accent-green, #2ecc71)"
                    : entry.side === "enemy"
                      ? "var(--color-accent-red, #e74c3c)"
                      : "var(--color-text-secondary, #a0a0b0)",
              }}
            >
              <span style={{ color: "var(--color-text-dim)" }}>
                [{entry.turn}]
              </span>{" "}
              {entry.message}
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* Victory/Defeat overlay */}
      {!animating && (playerAllFainted || enemyAllFainted) && (
        <div
          className="battle-field__result"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--color-overlay, rgba(0,0,0,0.7))",
            zIndex: 10,
            animation: "screenFadeIn 0.3s ease-in-out",
          }}
        >
          <span
            style={{
              fontSize: "1.2rem",
              fontFamily: "var(--font-pixel, 'Press Start 2P', monospace)",
              color: enemyAllFainted
                ? "var(--color-gold, #e2b714)"
                : "var(--color-accent-red, #e74c3c)",
              textTransform: "uppercase",
              textShadow: "2px 2px 0 rgba(0,0,0,0.5)",
              letterSpacing: "3px",
            }}
          >
            {enemyAllFainted ? "Victory!" : "Defeated"}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Inline HP bar used inside the battle field.
 * Simpler variant without the full HpBar import cycle.
 */
function HpBarInline({
  currentHp,
  maxHp,
  showText = false,
}: {
  currentHp: number;
  maxHp: number;
  showText?: boolean;
}) {
  const ratio = maxHp > 0 ? Math.max(0, Math.min(1, currentHp / maxHp)) : 0;
  const barColor =
    ratio > 0.5
      ? "var(--color-hp-bar, #2ecc71)"
      : ratio > 0.1
        ? "#f1c40f"
        : "var(--color-hp-bar-low, #e74c3c)";

  return (
    <div
      className="hp-bar-inline"
      style={{
        width: "100%",
        height: "10px",
        backgroundColor: "var(--color-bg-dark, #0f0f23)",
        border: "1px solid var(--color-text-dim, #606070)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="hp-bar-inline__fill"
        style={{
          width: `${ratio * 100}%`,
          height: "100%",
          backgroundColor: barColor,
          transition: "width 0.5s ease-in-out, background-color 0.3s ease",
        }}
      />
      {showText && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.35rem",
            fontFamily: "var(--font-pixel, monospace)",
            color: "var(--color-text-primary, #e0e0e0)",
            textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
            pointerEvents: "none",
          }}
        >
          {currentHp}/{maxHp}
        </span>
      )}
    </div>
  );
}
