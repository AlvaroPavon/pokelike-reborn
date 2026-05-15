import type { ItemInstance } from "@pokelike/core";

export interface ItemBarProps {
  items: ItemInstance[];
  onItemClick?: (item: ItemInstance, index: number) => void;
}

/**
 * ItemBar — horizontal list of item badges showing icon + name/quantity.
 *
 * Empty state shows a dashed placeholder. Clicking an item fires
 * `onItemClick` for use/equip actions.
 */
export default function ItemBar({ items, onItemClick }: ItemBarProps) {
  if (items.length === 0) {
    return (
      <div
        className="item-bar item-bar--empty"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-sm, 8px)",
          padding: "var(--space-md, 16px)",
          border: "2px dashed var(--color-text-dim, #606070)",
          color: "var(--color-text-dim, #606070)",
          fontSize: "0.5rem",
          textAlign: "center",
          minHeight: "60px",
          width: "100%",
        }}
        role="status"
        aria-label="No items"
      >
        No items
      </div>
    );
  }

  return (
    <div
      className="item-bar"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-xs, 4px)",
        padding: "var(--space-xs, 4px)",
        width: "100%",
      }}
      role="list"
      aria-label="Inventory items"
    >
      {items.map((item, index) => (
        <button
          key={`${item.itemId}-${index}`}
          className="item-bar__badge"
          type="button"
          onClick={() => onItemClick?.(item, index)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-xs, 4px)",
            padding: "var(--space-xs, 4px) var(--space-sm, 8px)",
            backgroundColor: "var(--color-bg-light, #16213e)",
            border: "1px solid var(--color-text-dim, #606070)",
            borderRadius: 0,
            cursor: onItemClick ? "pointer" : "default",
            fontFamily: "var(--font-pixel, 'Press Start 2P', monospace)",
            fontSize: "0.4rem",
            color: "var(--color-text-primary, #e0e0e0)",
            transition: "var(--transition-hover, background-color 0.15s ease)",
            outline: "none",
            lineHeight: 1.4,
          }}
          onMouseEnter={(e) => {
            if (onItemClick) {
              e.currentTarget.style.backgroundColor =
                "var(--color-bg-mid, #1a1a2e)";
              e.currentTarget.style.borderColor =
                "var(--color-gold-dim, #b8940f)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              "var(--color-bg-light, #16213e)";
            e.currentTarget.style.borderColor =
              "var(--color-text-dim, #606070)";
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline =
              "2px solid var(--color-gold-light, #f5d742)";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
          aria-label={`${item.itemId} x${item.quantity}`}
          title={`${item.itemId} x${item.quantity}`}
        >
          {/* Item icon placeholder */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "16px",
              height: "16px",
              fontSize: "0.5rem",
              color: "var(--color-gold, #e2b714)",
            }}
            aria-hidden="true"
          >
            &#9679;
          </span>

          {/* Item name */}
          <span style={{ textTransform: "capitalize" }}>
            {item.itemId.replace(/_/g, " ")}
          </span>

          {/* Quantity */}
          {item.quantity > 1 && (
            <span
              style={{
                color: "var(--color-text-secondary, #a0a0b0)",
                marginLeft: "2px",
              }}
            >
              x{item.quantity}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
