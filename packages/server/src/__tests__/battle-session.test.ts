/**
 * Tests for server-side battle execution and event streaming.
 *
 * @module
 */

import { describe, expect, it, vi } from "vitest";
import { BattleSession } from "../sockets/session.js";

function mockSocket(socketId: string) {
  return {
    id: socketId,
    emit: vi.fn(),
    join: vi.fn(),
    leave: vi.fn(),
  };
}

function mockIo() {
  const room = { emit: vi.fn() };
  const sockets = new Map<string, ReturnType<typeof mockSocket>>();

  return {
    room,
    io: {
      sockets: { sockets },
      to: vi.fn(() => room),
    },
    sockets,
  };
}

describe("BattleSession streaming", () => {
  it("streams battle:log events and completes with battle:result", async () => {
    const { io, room, sockets } = mockIo();
    sockets.set("s1", mockSocket("s1"));
    sockets.set("s2", mockSocket("s2"));

    const session = new BattleSession(
      { userId: "u1", socketId: "s1" },
      { userId: "u2", socketId: "s2" },
      io as any,
      { seed: 1234, streamDelayMs: 0, teamSize: 3 },
    );

    session.init();
    await session.completion;

    expect(session.status).toBe("completed");
    expect(room.emit).toHaveBeenCalledWith(
      "battle:log",
      expect.objectContaining({
        roomId: session.roomId,
        entry: expect.objectContaining({
          turn: expect.any(Number),
          message: expect.any(String),
        }),
      }),
    );
    expect(room.emit).toHaveBeenCalledWith(
      "battle:result",
      expect.objectContaining({
        roomId: session.roomId,
        result: expect.objectContaining({
          log: expect.any(Array),
          winner: expect.any(String),
        }),
      }),
    );
  });

  it("emits player-specific teams on battle:start", () => {
    const { io, sockets } = mockIo();
    const socket1 = mockSocket("s1");
    const socket2 = mockSocket("s2");
    sockets.set("s1", socket1);
    sockets.set("s2", socket2);

    const session = new BattleSession(
      { userId: "u1", socketId: "s1" },
      { userId: "u2", socketId: "s2" },
      io as any,
      { seed: 4321, autoRun: false, teamSize: 3 },
    );

    session.init();

    expect(socket1.emit).toHaveBeenCalledWith(
      "battle:start",
      expect.objectContaining({
        team: expect.arrayContaining([expect.objectContaining({ trainerId: "u1" })]),
        opponentTeam: expect.arrayContaining([expect.objectContaining({ trainerId: "u2" })]),
      }),
    );
    expect(socket2.emit).toHaveBeenCalledWith(
      "battle:start",
      expect.objectContaining({
        team: expect.arrayContaining([expect.objectContaining({ trainerId: "u2" })]),
        opponentTeam: expect.arrayContaining([expect.objectContaining({ trainerId: "u1" })]),
      }),
    );
  });
});
