import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BattleField from "./BattleField";
import type { PokemonInstance, BattleLogEntry } from "@pokelike/core";

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

describe("BattleField", () => {
  const playerTeam = [createMockPokemon("pikachu")];
  const enemyTeam = [createMockPokemon("charmander")];
  const defaultLog: BattleLogEntry[] = [
    { turn: 1, side: "system", action: "start", message: "Battle start!" },
  ];

  it("renders player and enemy Pokemon info", () => {
    render(
      <BattleField
        playerTeam={playerTeam}
        enemyTeam={enemyTeam}
        battleLog={defaultLog}
        animating={false}
      />,
    );
    expect(screen.getByText("pikachu")).toBeInTheDocument();
    expect(screen.getByText("charmander")).toBeInTheDocument();
  });

  it("shows enemy level indicator", () => {
    render(
      <BattleField
        playerTeam={playerTeam}
        enemyTeam={enemyTeam}
        battleLog={defaultLog}
        animating={false}
      />,
    );
    const levelIndicators = screen.getAllByText("Lv.10");
    expect(levelIndicators.length).toBe(2); // one for player, one for enemy
  });

  it("renders battle log entries", () => {
    render(
      <BattleField
        playerTeam={playerTeam}
        enemyTeam={enemyTeam}
        battleLog={defaultLog}
        animating={false}
      />,
    );
    expect(screen.getByText("Battle start!")).toBeInTheDocument();
  });

  it("shows battle start placeholder when log is empty", () => {
    render(
      <BattleField
        playerTeam={playerTeam}
        enemyTeam={enemyTeam}
        battleLog={[]}
        animating={false}
      />,
    );
    expect(screen.getByText("Battle start...")).toBeInTheDocument();
  });

  it("shows victory overlay when enemy team is all fainted", () => {
    const faintedEnemy = [createMockPokemon("charmander", { fainted: true })];
    render(
      <BattleField
        playerTeam={playerTeam}
        enemyTeam={faintedEnemy}
        battleLog={defaultLog}
        animating={false}
      />,
    );
    expect(screen.getByText("Victory!")).toBeInTheDocument();
  });

  it("shows defeat overlay when player team is all fainted", () => {
    const faintedPlayer = [createMockPokemon("pikachu", { fainted: true })];
    render(
      <BattleField
        playerTeam={faintedPlayer}
        enemyTeam={enemyTeam}
        battleLog={defaultLog}
        animating={false}
      />,
    );
    expect(screen.getByText("Defeated")).toBeInTheDocument();
  });

  it("does not show result overlay during animation", () => {
    const faintedEnemy = [createMockPokemon("charmander", { fainted: true })];
    render(
      <BattleField
        playerTeam={playerTeam}
        enemyTeam={faintedEnemy}
        battleLog={defaultLog}
        animating={true}
      />,
    );
    // Victory/defeat overlay should NOT be rendered during animation
    expect(screen.queryByText("Victory!")).not.toBeInTheDocument();
  });

  it("has log with aria-live polite", () => {
    render(
      <BattleField
        playerTeam={playerTeam}
        enemyTeam={enemyTeam}
        battleLog={defaultLog}
        animating={false}
      />,
    );
    const log = screen.getByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
  });

  it("shows no enemy placeholder when enemy team is empty", () => {
    render(
      <BattleField
        playerTeam={playerTeam}
        enemyTeam={[]}
        battleLog={[]}
        animating={false}
      />,
    );
    expect(screen.getByText("No enemy")).toBeInTheDocument();
  });
});
