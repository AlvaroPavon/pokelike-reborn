import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ItemBar from "./ItemBar";
import type { ItemInstance } from "@pokelike/core";

describe("ItemBar", () => {
  it("renders empty state when items array is empty", () => {
    render(<ItemBar items={[]} />);
    expect(screen.getByText("No items")).toBeInTheDocument();
  });

  it("renders item badges for each item", () => {
    const items: ItemInstance[] = [
      { itemId: "potion", quantity: 3 },
      { itemId: "pokeball", quantity: 5 },
    ];
    render(<ItemBar items={items} />);
    expect(screen.getByText("potion")).toBeInTheDocument();
    expect(screen.getByText("pokeball")).toBeInTheDocument();
  });

  it("shows quantity when > 1", () => {
    const items: ItemInstance[] = [{ itemId: "potion", quantity: 3 }];
    render(<ItemBar items={items} />);
    expect(screen.getByText("x3")).toBeInTheDocument();
  });

  it("hides quantity when === 1", () => {
    const items: ItemInstance[] = [{ itemId: "potion", quantity: 1 }];
    render(<ItemBar items={items} />);
    expect(screen.queryByText("x1")).not.toBeInTheDocument();
  });

  it("renders item badges as buttons when onClick is provided", () => {
    const items: ItemInstance[] = [{ itemId: "potion", quantity: 1 }];
    render(<ItemBar items={items} onItemClick={() => {}} />);
    const badge = screen.getByRole("button");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("aria-label", "potion x1");
  });

  it("renders item badges as non-interactive when onClick is omitted", () => {
    const items: ItemInstance[] = [{ itemId: "potion", quantity: 1 }];
    render(<ItemBar items={items} />);
    const badges = screen.getAllByRole("button");
    // Still buttons but without pointer cursor behavior
    expect(badges.length).toBe(1);
  });

  it("has list role and aria label", () => {
    const items: ItemInstance[] = [{ itemId: "potion", quantity: 1 }];
    render(<ItemBar items={items} />);
    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-label", "Inventory items");
  });
});
