import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HpBar from "./HpBar";

describe("HpBar", () => {
  const defaultProps = { currentHp: 70, maxHp: 100 };

  it("renders without crashing", () => {
    const { container } = render(<HpBar {...defaultProps} />);
    expect(container.querySelector(".hp-bar")).toBeInTheDocument();
  });

  it("shows full bar when currentHp equals maxHp", () => {
    const { container } = render(<HpBar currentHp={100} maxHp={100} />);
    const fill = container.querySelector(".hp-bar-fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("shows empty bar when currentHp is zero", () => {
    const { container } = render(<HpBar currentHp={0} maxHp={100} />);
    const fill = container.querySelector(".hp-bar-fill") as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });

  it("clamps ratio to 0 when currentHp is negative", () => {
    const { container } = render(<HpBar currentHp={-10} maxHp={100} />);
    const fill = container.querySelector(".hp-bar-fill") as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });

  it("shows green for health above 50%", () => {
    const { container } = render(<HpBar currentHp={80} maxHp={100} />);
    const fill = container.querySelector(".hp-bar-fill") as HTMLElement;
    expect(fill.style.backgroundColor).toBe("var(--color-hp-bar, #2ecc71)");
  });

  it("shows yellow for health between 10% and 50%", () => {
    const { container } = render(<HpBar currentHp={30} maxHp={100} />);
    const fill = container.querySelector(".hp-bar-fill") as HTMLElement;
    expect(fill.style.backgroundColor).toBe("rgb(241, 196, 15)");
  });

  it("shows red for health below 10%", () => {
    const { container } = render(<HpBar currentHp={5} maxHp={100} />);
    const fill = container.querySelector(".hp-bar-fill") as HTMLElement;
    expect(fill.style.backgroundColor).toBe(
      "var(--color-hp-bar-low, #e74c3c)",
    );
  });

  it("shows text when showText is true", () => {
    render(<HpBar currentHp={70} maxHp={100} showText />);
    const textEl = screen.queryByText("70/100");
    expect(textEl).toBeInTheDocument();
  });

  it("hides text when showText is false", () => {
    render(<HpBar currentHp={70} maxHp={100} showText={false} />);
    // The text uses display:none equivalent — verify it's not accessible
    // In this case we check the container doesn't have the text
    const textEl = screen.queryByText("70/100");
    expect(textEl).not.toBeInTheDocument();
  });

  it("applies sm size styles", () => {
    const { container } = render(<HpBar {...defaultProps} size="sm" />);
    const bar = container.querySelector(".hp-bar") as HTMLElement;
    expect(bar.style.height).toBe("10px");
  });

  it("applies md size styles", () => {
    const { container } = render(<HpBar {...defaultProps} size="md" />);
    const bar = container.querySelector(".hp-bar") as HTMLElement;
    expect(bar.style.height).toBe("16px");
  });

  it("handles zero maxHp gracefully", () => {
    const { container } = render(<HpBar currentHp={0} maxHp={0} />);
    const fill = container.querySelector(".hp-bar-fill") as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });
});
