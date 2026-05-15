import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PokemonCard from "./PokemonCard";
import type { PokemonInstance } from "@pokelike/core";
import { PokemonType } from "@pokelike/core";

function createMockPokemon(overrides: Partial<PokemonInstance> = {}): PokemonInstance {
  return {
    speciesId: "pikachu",
    nickname: "Sparky",
    level: 25,
    currentHp: 80,
    maxHp: 100,
    ivs: { hp: 15, atk: 15, def: 15, spa: 15, spd: 15, spe: 15 },
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    stats: { hp: 80, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    moves: [
      { moveId: "thunderbolt", currentPp: 15, maxPp: 15 },
      { moveId: "quick-attack", currentPp: 30, maxPp: 30 },
    ],
    trainerId: "player-1",
    fainted: false,
    status: null,
    ...overrides,
  };
}

describe("PokemonCard", () => {
  it("renders pokemon name and level", () => {
    render(<PokemonCard pokemon={createMockPokemon()} />);
    expect(screen.getByText("Sparky")).toBeInTheDocument();
    expect(screen.getByText("Lv.25")).toBeInTheDocument();
  });

  it("falls back to speciesId when no nickname", () => {
    render(
      <PokemonCard
        pokemon={createMockPokemon({ nickname: undefined })}
        name="Pikachu"
      />,
    );
    expect(screen.getByText("Pikachu")).toBeInTheDocument();
  });

  it("shows fainted state with reduced opacity", () => {
    const { container } = render(
      <PokemonCard pokemon={createMockPokemon({ fainted: true })} />,
    );
    const card = container.querySelector(".pokemon-card") as HTMLElement;
    expect(card.style.opacity).toBe("0.5");
    expect(card.style.filter).toBe("grayscale(1)");
  });

  it("shows selected state with gold border", () => {
    const { container } = render(
      <PokemonCard pokemon={createMockPokemon()} selected />,
    );
    const card = container.querySelector(".pokemon-card") as HTMLElement;
    expect(card.style.border).toContain("var(--color-gold, #e2b714)");
  });

  it("displays type badges when types are provided", () => {
    render(
      <PokemonCard
        pokemon={createMockPokemon()}
        types={[PokemonType.Electric]}
      />,
    );
    expect(screen.getByText("Electric")).toBeInTheDocument();
  });

  it("shows status condition when present", () => {
    render(
      <PokemonCard
        pokemon={createMockPokemon({ status: "PAR" })}
      />,
    );
    expect(screen.getByText("[PAR]")).toBeInTheDocument();
  });

  it("shows details section when showDetails is true", () => {
    render(
      <PokemonCard
        pokemon={createMockPokemon()}
        showDetails
      />,
    );
    expect(screen.getByText(/HP:/)).toBeInTheDocument();
    expect(screen.getByText(/ATK:/)).toBeInTheDocument();
    expect(screen.getByText(/Moves:/)).toBeInTheDocument();
  });

  it("renders compact layout", () => {
    const { container } = render(
      <PokemonCard pokemon={createMockPokemon()} compact />,
    );
    const card = container.querySelector(".pokemon-card") as HTMLElement;
    expect(card.style.flexDirection).toBe("row");
  });

  it("renders caught placeholder when not caught", () => {
    render(
      <PokemonCard pokemon={createMockPokemon()} caught={false} />,
    );
    expect(screen.getByText("???")).toBeInTheDocument();
  });

  it("has clickable role when onClick is provided", () => {
    render(<PokemonCard pokemon={createMockPokemon()} onClick={() => {}} />);
    const card = screen.getByRole("button");
    expect(card).toBeInTheDocument();
  });
});
