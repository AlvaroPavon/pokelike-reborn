import { useCallback } from "react";
import { useGameStore } from "../stores/gameStore";
import { useUIStore } from "../stores/uiStore";
import type { ItemOption } from "../game/helpers";

/**
 * ItemScreen — Choose an item to add to inventory.
 *
 * Shows 3 item options from the item pool. Click to add to inventory.
 * "Skip" button to pass without taking anything.
 */
export default function ItemScreen() {
  const addItem = useGameStore((s) => s.addItem);
  const navigate = useUIStore((s) => s.navigate);

  const choices = useUIStore((s) => s.itemChoices);

  const handleSelect = useCallback(
    (option: ItemOption) => {
      addItem({ itemId: option.itemId, quantity: 1 });
      navigate("map");
    },
    [addItem, navigate],
  );

  const handleSkip = useCallback(() => {
    navigate("map");
  }, [navigate]);

  if (!choices || choices.length === 0) {
    return (
      <div className="screen item-screen">
        <div className="screen-content">
          <h2 className="screen-title">Items</h2>
          <div className="inventory-list placeholder">
            <p>No items available.</p>
          </div>
          <button
            className="pixel-button back-button"
            type="button"
            onClick={handleSkip}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen item-screen">
      <div
        className="screen-content"
        style={{
          justifyContent: "center",
          gap: "var(--space-lg)",
          padding: "var(--space-md)",
        }}
      >
        <h2 className="screen-title" style={{ fontSize: "clamp(0.6rem, 3vw, 0.85rem)" }}>
          Item Found!
        </h2>

        <p
          style={{
            fontSize: "0.45rem",
            color: "var(--color-text-secondary)",
            textAlign: "center",
          }}
        >
          Choose an item to take
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-sm)",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {choices.map((option, index) => (
            <button
              key={`${option.itemId}-${index}`}
              type="button"
              onClick={() => handleSelect(option)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                padding: "var(--space-sm) var(--space-md)",
                backgroundColor: "var(--color-bg-mid)",
                border: "2px solid var(--color-text-dim)",
                cursor: "pointer",
                fontFamily: "var(--font-pixel)",
                textAlign: "left",
                transition: "var(--transition-hover)",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg-light)";
                e.currentTarget.style.borderColor = "var(--color-gold-dim)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg-mid)";
                e.currentTarget.style.borderColor = "var(--color-text-dim)";
              }}
              aria-label={`Take ${option.name}`}
            >
              {/* Icon */}
              <span
                style={{
                  fontSize: "1.2rem",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--color-bg-dark)",
                  border: "1px solid var(--color-text-dim)",
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {option.icon}
              </span>

              {/* Info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontSize: "0.5rem",
                    color: "var(--color-gold)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {option.name}
                </span>
                <span
                  style={{
                    fontSize: "0.35rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {option.description}
                </span>
              </div>
            </button>
          ))}
        </div>

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
