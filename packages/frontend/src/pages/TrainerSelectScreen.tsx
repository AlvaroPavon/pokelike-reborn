import { useCallback } from "react";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";

/**
 * TrainerSelectScreen — Choose between Boy or Girl trainer.
 *
 * Each trainer is displayed as a card with a simple CSS-drawn
 * pixel art representation.
 */
export default function TrainerSelectScreen() {
  const selectTrainer = useGameStore((s) => s.selectTrainer);
  const navigate = useUIStore((s) => s.navigate);

  const handleSelect = useCallback(
    (gender: "boy" | "girl") => {
      selectTrainer(gender);
      navigate("starter_select");
    },
    [selectTrainer, navigate],
  );

  return (
    <div className="screen trainer-select-screen">
      <div
        className="screen-content"
        style={{ justifyContent: "center", gap: "var(--space-lg)" }}
      >
        <h2 className="screen-title" style={{ fontSize: "clamp(0.7rem, 3vw, 1rem)" }}>
          Choose Your Trainer
        </h2>

        <div
          className="trainer-options"
          style={{ gap: "var(--space-lg)", flexWrap: "wrap", justifyContent: "center" }}
        >
          {/* Boy Trainer */}
          <button
            className="pixel-button trainer-card"
            type="button"
            onClick={() => handleSelect("boy")}
            style={{
              width: "clamp(100px, 30vw, 140px)",
              height: "clamp(140px, 40vw, 180px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-sm)",
              padding: "var(--space-md)",
              backgroundColor: "var(--color-bg-mid)",
              border: "2px solid var(--color-accent-blue)",
              cursor: "pointer",
            }}
            aria-label="Select boy trainer"
          >
            {/* Pixel art boy sprite */}
            <div
              style={{
                width: "64px",
                height: "64px",
                display: "grid",
                gridTemplateColumns: "repeat(8, 8px)",
                gridTemplateRows: "repeat(8, 8px)",
                gap: "1px",
                imageRendering: "pixelated",
              }}
            >
              {/* Hair */}
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={`hair-${i}`}
                  style={{
                    gridColumn: i + 2,
                    gridRow: 1,
                    backgroundColor: "#4a3728",
                    width: "8px",
                    height: "8px",
                  }}
                />
              ))}
              {/* Face */}
              <div style={{ gridColumn: "3 / 7", gridRow: 2, backgroundColor: "#f5d6b8", width: "32px", height: "8px" }} />
              <div style={{ gridColumn: "3 / 7", gridRow: 3, backgroundColor: "#f5d6b8", width: "32px", height: "8px" }} />
              {/* Eyes */}
              <div style={{ gridColumn: 3, gridRow: 3, backgroundColor: "#222", width: "6px", height: "6px", borderRadius: "50%" }} />
              <div style={{ gridColumn: 6, gridRow: 3, backgroundColor: "#222", width: "6px", height: "6px", borderRadius: "50%" }} />
              {/* Body (red shirt) */}
              <div style={{ gridColumn: "2 / 8", gridRow: 4, backgroundColor: "#e74c3c", width: "48px", height: "8px" }} />
              <div style={{ gridColumn: "2 / 8", gridRow: 5, backgroundColor: "#e74c3c", width: "48px", height: "8px" }} />
              {/* Arms */}
              <div style={{ gridColumn: 1, gridRow: "4 / 6", backgroundColor: "#f5d6b8", width: "8px", height: "16px" }} />
              <div style={{ gridColumn: 8, gridRow: "4 / 6", backgroundColor: "#f5d6b8", width: "8px", height: "16px" }} />
              {/* Legs */}
              <div style={{ gridColumn: "3 / 5", gridRow: "6 / 8", backgroundColor: "#2c3e50", width: "16px", height: "16px" }} />
              <div style={{ gridColumn: "5 / 7", gridRow: "6 / 8", backgroundColor: "#2c3e50", width: "16px", height: "16px" }} />
            </div>
            <span style={{ fontSize: "0.55rem", color: "var(--color-accent-blue)" }}>
              Boy
            </span>
          </button>

          {/* Girl Trainer */}
          <button
            className="pixel-button trainer-card"
            type="button"
            onClick={() => handleSelect("girl")}
            style={{
              width: "clamp(100px, 30vw, 140px)",
              height: "clamp(140px, 40vw, 180px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-sm)",
              padding: "var(--space-md)",
              backgroundColor: "var(--color-bg-mid)",
              border: "2px solid var(--color-accent-green)",
              cursor: "pointer",
            }}
            aria-label="Select girl trainer"
          >
            {/* Pixel art girl sprite */}
            <div
              style={{
                width: "64px",
                height: "64px",
                display: "grid",
                gridTemplateColumns: "repeat(8, 8px)",
                gridTemplateRows: "repeat(8, 8px)",
                gap: "1px",
                imageRendering: "pixelated",
              }}
            >
              {/* Hair */}
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={`hair-${i}`}
                  style={{
                    gridColumn: i + 1,
                    gridRow: 1,
                    backgroundColor: "#8b4513",
                    width: "8px",
                    height: "8px",
                  }}
                />
              ))}
              {/* Hair tie */}
              <div style={{ gridColumn: 1, gridRow: 2, backgroundColor: "#e74c3c", width: "8px", height: "8px" }} />
              {/* Face */}
              <div style={{ gridColumn: "3 / 7", gridRow: 2, backgroundColor: "#f5d6b8", width: "32px", height: "8px" }} />
              <div style={{ gridColumn: "3 / 7", gridRow: 3, backgroundColor: "#f5d6b8", width: "32px", height: "8px" }} />
              {/* Eyes */}
              <div style={{ gridColumn: 3, gridRow: 3, backgroundColor: "#222", width: "6px", height: "6px", borderRadius: "50%" }} />
              <div style={{ gridColumn: 6, gridRow: 3, backgroundColor: "#222", width: "6px", height: "6px", borderRadius: "50%" }} />
              {/* Mouth */}
              <div style={{ gridColumn: 4, gridRow: 4, backgroundColor: "#c0392b", width: "8px", height: "3px", marginTop: "2px" }} />
              {/* Body (green dress) */}
              <div style={{ gridColumn: "2 / 8", gridRow: 5, backgroundColor: "#27ae60", width: "48px", height: "8px" }} />
              <div style={{ gridColumn: "2 / 8", gridRow: 6, backgroundColor: "#27ae60", width: "48px", height: "8px" }} />
              {/* Arms */}
              <div style={{ gridColumn: 1, gridRow: "5 / 7", backgroundColor: "#f5d6b8", width: "8px", height: "16px" }} />
              <div style={{ gridColumn: 8, gridRow: "5 / 7", backgroundColor: "#f5d6b8", width: "8px", height: "16px" }} />
              {/* Legs */}
              <div style={{ gridColumn: "3 / 5", gridRow: "7 / 9", backgroundColor: "#f5d6b8", width: "16px", height: "16px" }} />
              <div style={{ gridColumn: "5 / 7", gridRow: "7 / 9", backgroundColor: "#f5d6b8", width: "16px", height: "16px" }} />
              {/* Shoes */}
              <div style={{ gridColumn: 3, gridRow: "8 / 9", backgroundColor: "#c0392b", width: "8px", height: "8px" }} />
              <div style={{ gridColumn: 6, gridRow: "8 / 9", backgroundColor: "#c0392b", width: "8px", height: "8px" }} />
            </div>
            <span style={{ fontSize: "0.55rem", color: "var(--color-accent-green)" }}>
              Girl
            </span>
          </button>
        </div>

        <button
          className="pixel-button"
          type="button"
          onClick={() => navigate("title")}
          style={{ maxWidth: "200px", fontSize: "0.5rem" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
