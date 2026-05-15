import { useMemo } from "react";

export interface HpBarProps {
  currentHp: number;
  maxHp: number;
  showText?: boolean;
  size?: "sm" | "md";
  animated?: boolean;
}

const BAR_HEIGHTS: Record<Exclude<HpBarProps["size"], undefined>, number> = {
  sm: 6,
  md: 12,
};

const BAR_WIDTHS: Record<Exclude<HpBarProps["size"], undefined>, string> = {
  sm: "100%",
  md: "100%",
};

/**
 * HP Bar component — displays a color-coded health bar.
 *
 * Colors:
 * - Green  (#2ecc71) when HP > 50%
 * - Yellow (#f1c40f) when HP is between 10% and 50%
 * - Red    (#e74c3c) when HP < 10%
 */
export default function HpBar({
  currentHp,
  maxHp,
  showText = false,
  size = "md",
  animated = true,
}: HpBarProps) {
  const ratio = useMemo(() => {
    if (maxHp <= 0) return 0;
    return Math.max(0, Math.min(1, currentHp / maxHp));
  }, [currentHp, maxHp]);

  const barColor = useMemo(() => {
    if (ratio > 0.5) return "var(--color-hp-bar, #2ecc71)";
    if (ratio > 0.1) return "#f1c40f";
    return "var(--color-hp-bar-low, #e74c3c)";
  }, [ratio]);

  const height = BAR_HEIGHTS[size];
  const width = BAR_WIDTHS[size];

  return (
    <div
      className="hp-bar"
      style={{
        width,
        height: `${height + 4}px`,
        backgroundColor: "var(--color-bg-dark, #0f0f23)",
        border: "1px solid var(--color-text-dim, #606070)",
        position: "relative",
        overflow: "hidden",
        borderRadius: "2px",
      }}
    >
      <div
        className="hp-bar-fill"
        style={{
          width: `${ratio * 100}%`,
          height: "100%",
          backgroundColor: barColor,
          transition: animated
            ? "width 0.4s ease-in-out, background-color 0.3s ease"
            : "none",
          borderRadius: "1px",
        }}
      />
      {showText && (
        <span
          className="hp-bar-text"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size === "sm" ? "0.4rem" : "0.55rem",
            fontFamily: "var(--font-pixel, 'Press Start 2P', monospace)",
            color: "var(--color-text-primary, #e0e0e0)",
            lineHeight: 1,
            pointerEvents: "none",
            textShadow: "1px 1px 0 rgba(0,0,0,0.8)",
          }}
        >
          {currentHp}/{maxHp}
        </span>
      )}
    </div>
  );
}
