import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TeamPanel from "./TeamPanel";
import type { PokemonInstance } from "@pokelike/core";

function createMockPokemon(
  speciesId: string,
  overrides: Partial<PokemonInstance> = {},
): PokemonInstance {
  return {
    speciesId,
    nickname: undefined,
    level: 10,
    currentHp: 50,
    maxHp: 50,
    ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    stats: { hp: 50, atk: 30, def: 30, spa: 30, spd: 30, spe: 30 },
    moves: [{ moveId: "tackle", currentPp: 35, maxPp: 35 }],
    trainerId: "player",
    fainted: false,
    status: null,
    ...overrides,
  };
}

describe("TeamPanel", () => {
  it("renders empty state when team is empty", () => {
    render(<TeamPanel team={[]} />);
    expect(screen.getByText("No Pokemon")).toBeInTheDocument();
  });

  it("renders a list of Pokemon", () => {
    const team = [
      createMockPokemon("pikachu"),
      createMockPokemon("charmander"),
      createMockPokemon("bulbasaur"),
    ];
    render(<TeamPanel team={team} />);
    expect(screen.getByText("pikachu")).toBeInTheDocument();
    expect(screen.getByText("charmander")).toBeInTheDocument();
    expect(screen.getByText("bulbasaur")).toBeInTheDocument();
  });

  it("renders with compact layout", () => {
    const team = [createMockPokemon("pikachu")];
    const { container } = render(<TeamPanel team={team} compact />);
    const panel = container.querySelector(".team-panel--compact");
    expect(panel).toBeInTheDocument();
  });

  it("renders the correct number of Pokemon cards", () => {
    const team = [
      createMockPokemon("pikachu"),
      createMockPokemon("charmander"),
    ];
    const { container } = render(<TeamPanel team={team} />);
    const items = container.querySelectorAll('[role="listitem"]');
    expect(items.length).toBe(2);
  });

  it("has list role and aria label", () => {
    const team = [createMockPokemon("pikachu")];
    render(<TeamPanel team={team} />);
    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-label", "Pokemon team");
  });
});
