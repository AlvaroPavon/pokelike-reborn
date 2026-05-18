/**
 * Server-authoritative battle session.
 *
 * Manages the lifecycle of a multiplayer battle between two players:
 * - Creates a unique Socket.io room for the match
 * - Tracks session state: `waiting` | `active` | `completed`
 * - Joins both players into the room and emits `battle:start`
 *
 * @module
 */

import { Server as SocketServer } from "socket.io";
import {
  SeededRNG,
  type BattleLogEntry,
  type BattleResult,
  type PokemonInstance,
} from "@pokelike/core";
import { SPECIES, makeGymMon, simulateBattle } from "@pokelike/core/battle/index";
import { recordMultiplayerResult } from "../routes/auth.js";

// ─── Types ────────────────────────────────────────────────────────────────

/** Possible states for a battle session. */
export type SessionStatus = "waiting" | "active" | "completed";

/** Minimal player identity used within a session. */
export interface PlayerInfo {
  /** Authenticated user ID. */
  userId: string;
  /** Active socket connection ID. */
  socketId: string;
}

/** Payload sent with the `battle:start` event. */
export interface BattleStartPayload {
  /** Unique room ID for this battle. */
  roomId: string;
  /** The status of the session (`active`). */
  status: SessionStatus;
  /** The receiving player's generated team. */
  team: PokemonInstance[];
  /** The opponent's generated team. */
  opponentTeam: PokemonInstance[];
}

/** Payload emitted for each streamed battle event. */
export interface BattleLogPayload {
  roomId: string;
  entry: BattleLogEntry;
}

/** Final multiplayer battle result payload. */
export interface BattleResultPayload {
  roomId: string;
  winnerUserId: string | null;
  loserUserId: string | null;
  result: BattleResult;
}

/** Optional test/operational controls for battle sessions. */
export interface BattleSessionOptions {
  seed?: number;
  streamDelayMs?: number;
  teamSize?: number;
  autoRun?: boolean;
}

// ─── BattleSession ────────────────────────────────────────────────────────

/**
 * Represents one multiplayer battle between two players.
 *
 * Lifecycle:
 * 1. Constructed with two `PlayerInfo` + the Socket.io server reference.
 * 2. `init()` joins both sockets into a room, sets status to `active`,
 *    and emits `battle:start` to both players.
 * 3. `complete()` sets status to `completed` and emits `battle:completed`.
 * 4. `destroy()` cleans up the room.
 *
 * Phase 4 (PR 4) will hook into `simulateBattle` and emit `battle:log`
 * events here. For now, the session is a thin container that proves
 * the pairing and room wiring work.
 */
export class BattleSession {
  /** Unique room identifier (e.g. `battle:<uuid>`). */
  public readonly roomId: string;
  /** Ordered pair of players in this session. */
  public readonly players: [PlayerInfo, PlayerInfo];
  /** Current lifecycle status. */
  public status: SessionStatus = "waiting";
  /** Promise resolved after all battle events have been emitted. */
  public completion: Promise<void> = Promise.resolve();

  private io: SocketServer;
  private readonly seed: number;
  private readonly streamDelayMs: number;
  private readonly teamSize: number;
  private readonly autoRun: boolean;
  private readonly teams: [PokemonInstance[], PokemonInstance[]];

  constructor(
    player1: PlayerInfo,
    player2: PlayerInfo,
    io: SocketServer,
    options: BattleSessionOptions = {},
  ) {
    this.roomId = `battle:${crypto.randomUUID()}`;
    this.players = [player1, player2];
    this.io = io;
    this.seed = options.seed ?? Date.now();
    this.streamDelayMs = options.streamDelayMs ?? 0;
    this.teamSize = options.teamSize ?? 3;
    this.autoRun = options.autoRun ?? true;
    this.teams = this.generateTeams();
  }

  /**
   * Initialize the battle session.
   *
   * Moves status to `active`, joins both players into the Socket.io room,
   * and emits `battle:start` with the room ID.
   */
  init(): void {
    this.status = "active";

    for (const player of this.players) {
      const socket = this.io.sockets.sockets.get(player.socketId);
      if (socket) {
        socket.join(this.roomId);
      }
    }

    this.emitBattleStart();

    if (this.autoRun) {
      const result = simulateBattle(
        this.teams[0],
        this.teams[1],
        new SeededRNG(this.seed),
      );
      this.completion = this.streamBattle(result);
    }
  }

  /**
   * Mark the session as completed.
   *
   * Sets status to `completed` and emits `battle:completed` to the room.
   * In Phase 4 this will carry the final result payload.
   */
  complete(result?: BattleResult): void {
    this.status = "completed";

    if (result) {
      const { winnerUserId, loserUserId } = this.resolveWinner(result);
      if (winnerUserId && loserUserId) {
        recordMultiplayerResult(winnerUserId, loserUserId);
      }

      const payload: BattleResultPayload = {
        roomId: this.roomId,
        winnerUserId,
        loserUserId,
        result,
      };

      this.io.to(this.roomId).emit("battle:result", payload);
      return;
    }

    this.io.to(this.roomId).emit("battle:completed", {
      roomId: this.roomId,
    });
  }

  /**
   * Tear down the session and remove players from the room.
   */
  destroy(): void {
    this.status = "completed";

    for (const player of this.players) {
      const socket = this.io.sockets.sockets.get(player.socketId);
      if (socket) {
        socket.leave(this.roomId);
      }
    }
  }

  private emitBattleStart(): void {
    const [playerOneTeam, playerTwoTeam] = this.teams;

    this.emitToPlayer(this.players[0], "battle:start", {
      roomId: this.roomId,
      status: this.status,
      team: playerOneTeam,
      opponentTeam: playerTwoTeam,
    });

    this.emitToPlayer(this.players[1], "battle:start", {
      roomId: this.roomId,
      status: this.status,
      team: playerTwoTeam,
      opponentTeam: playerOneTeam,
    });
  }

  private emitToPlayer<TPayload>(player: PlayerInfo, event: string, payload: TPayload): void {
    const socket = this.io.sockets.sockets.get(player.socketId);
    socket?.emit(event, payload);
  }

  private async streamBattle(result: BattleResult): Promise<void> {
    for (const entry of result.log) {
      this.io.to(this.roomId).emit("battle:log", {
        roomId: this.roomId,
        entry,
      } satisfies BattleLogPayload);

      if (this.streamDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.streamDelayMs));
      }
    }

    this.complete(result);
  }

  private generateTeams(): [PokemonInstance[], PokemonInstance[]] {
    const rng = new SeededRNG(this.seed);
    const speciesIds = Object.keys(SPECIES);

    const buildTeam = (trainerId: string): PokemonInstance[] => {
      const team: PokemonInstance[] = [];
      for (let i = 0; i < this.teamSize; i++) {
        const speciesId = rng.randomElement(speciesIds) ?? "pikachu";
        const level = rng.randomInt(45, 55);
        team.push({
          ...makeGymMon(speciesId, level, rng),
          trainerId,
        });
      }
      return team;
    };

    return [buildTeam(this.players[0].userId), buildTeam(this.players[1].userId)];
  }

  private resolveWinner(result: BattleResult): { winnerUserId: string | null; loserUserId: string | null } {
    if (result.winner === "draw") {
      return { winnerUserId: null, loserUserId: null };
    }

    const winnerIndex = result.winner === "player" ? 0 : 1;
    const loserIndex = winnerIndex === 0 ? 1 : 0;

    return {
      winnerUserId: this.players[winnerIndex].userId,
      loserUserId: this.players[loserIndex].userId,
    };
  }
}
