/**
 * Socket.io multiplayer battle hook.
 *
 * Owns the client-side lifecycle for queueing and receiving server-streamed
 * battle events.
 *
 * @module
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { BattleLogEntry, PokemonInstance } from "@pokelike/core";
import { useAuthStore } from "../../stores/authStore";
import { useGameStore } from "../../stores/gameStore";
import { useUIStore } from "../../stores/uiStore";

const SOCKET_URL =
  (import.meta as ImportMeta & { env?: { VITE_SOCKET_URL?: string } }).env?.VITE_SOCKET_URL
  ?? globalThis.location?.origin
  ?? "http://localhost:3001";

interface QueueStatusPayload {
  inQueue?: boolean;
  position?: number;
  matchFound?: boolean;
  timedOut?: boolean;
  message?: string;
}

interface BattleStartPayload {
  roomId: string;
  team: PokemonInstance[];
  opponentTeam: PokemonInstance[];
}

interface BattleLogPayload {
  roomId: string;
  entry: BattleLogEntry;
}

interface BattleResultPayload {
  roomId: string;
  winnerUserId: string | null;
  loserUserId: string | null;
}

export interface MultiplayerBattleState {
  connected: boolean;
  searching: boolean;
  queuePosition: number | null;
  error: string | null;
}

export function useMultiplayerBattle() {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<MultiplayerBattleState>({
    connected: false,
    searching: false,
    queuePosition: null,
    error: null,
  });

  const connect = useCallback((): Socket | null => {
    const token = useAuthStore.getState().token;
    if (!token) {
      setState((prev) => ({ ...prev, error: "Login required for multiplayer" }));
      return null;
    }

    if (socketRef.current?.connected) return socketRef.current;

    const socket = io(SOCKET_URL, {
      autoConnect: true,
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      setState((prev) => ({ ...prev, connected: true, error: null }));
    });

    socket.on("connect_error", (err) => {
      setState((prev) => ({ ...prev, connected: false, error: err.message }));
      useUIStore.getState().setMultiplayerStatus("error");
    });

    socket.on("queue:status", (payload: QueueStatusPayload) => {
      setState((prev) => ({
        ...prev,
        searching: payload.inQueue ?? false,
        queuePosition: payload.position ?? null,
        error: payload.timedOut ? "Queue timed out" : prev.error,
      }));

      if (payload.inQueue) useUIStore.getState().setMultiplayerStatus("searching");
      if (payload.matchFound) useUIStore.getState().setMultiplayerStatus("matched");
    });

    socket.on("battle:start", (payload: BattleStartPayload) => {
      useGameStore.setState({ team: payload.team });
      useUIStore.getState().setBattleData(payload.opponentTeam, "MULTIPLAYER");
      useUIStore.getState().setBattleLog([]);
      useUIStore.getState().setBattleAnimating(true);
      useUIStore.getState().setMultiplayerResult(null);
      useUIStore.getState().setMultiplayerStatus("battle");
      useUIStore.getState().navigate("battle");
    });

    socket.on("battle:log", (payload: BattleLogPayload) => {
      useUIStore.getState().appendBattleLog(payload.entry);
    });

    socket.on("battle:result", (payload: BattleResultPayload) => {
      useUIStore.getState().setBattleAnimating(false);
      useUIStore.getState().setMultiplayerStatus("result");
      useUIStore.getState().setMultiplayerResult({
        roomId: payload.roomId,
        winnerUserId: payload.winnerUserId,
        loserUserId: payload.loserUserId,
      });
    });

    socketRef.current = socket;
    return socket;
  }, []);

  const joinQueue = useCallback(() => {
    const socket = connect();
    if (!socket) return;
    socket?.emit("queue:join");
    setState((prev) => ({ ...prev, searching: true, error: null }));
    useUIStore.getState().setMultiplayerStatus("searching");
  }, [connect]);

  const leaveQueue = useCallback(() => {
    socketRef.current?.emit("queue:leave");
    setState((prev) => ({ ...prev, searching: false, queuePosition: null }));
    useUIStore.getState().setMultiplayerStatus("idle");
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setState({ connected: false, searching: false, queuePosition: null, error: null });
    useUIStore.getState().setMultiplayerStatus("idle");
  }, []);

  useEffect(() => () => {
    socketRef.current?.disconnect();
  }, []);

  return {
    ...state,
    connect,
    joinQueue,
    leaveQueue,
    disconnect,
  };
}
