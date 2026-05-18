# Design: Phase 3 - Multiplayer 3v3

## Technical Approach

The core strategy is to transform the battle system from a client-side simulation into a server-authoritative real-time experience. We will relocate the battle engine to `@pokelike/core` to enable its use on the server, integrate Socket.io with the Fastify backend for real-time communication, and implement a lightweight matchmaking queue.

The server will act as the "driver" of the battle, executing the simulation and streaming turn-by-turn events to connected clients, who will act as "subscribers" updating their UI in response to these events.

## Architecture Decisions

### Decision: Battle Engine Migration
**Choice**: Relocate `simulateBattle` and all supporting helpers from `@pokelike/frontend` to `@pokelike/core`.
**Alternatives considered**: Keep simulation on frontend and just sync results.
**Rationale**: Moving logic to `@pokelike/core` ensures a single source of truth and prevents client-side manipulation of battle outcomes.

### Decision: Real-time Communication Layer
**Choice**: Socket.io integrated with Fastify.
**Alternatives considered**: Pure WebSockets, SignalR.
**Rationale**: Socket.io provides built-in room management (essential for pairing players) and reliable reconnection logic.

### Decision: Battle Execution Model
**Choice**: Server-side execution with event streaming (`battle:log`).
**Alternatives considered**: Lock-step simulation (both clients run the same seed).
**Rationale**: Streaming events simplifies frontend state management and ensures perfect synchronization without complex seed-sharing and validation.

### Decision: Matchmaking Protocol
**Choice**: Simple in-memory FIFO queue.
**Alternatives considered**: Redis-based queue, Elo-based matching.
**Rationale**: For the MVP, a FIFO queue is sufficient. Redis is overkill for the current scale, and Elo-matching is a future enhancement.

## Data Flow

```
Player A/B ──(join_queue)──→ Matchmaker (Server)
                                   │
                                   ▼
                         [ Pair Found: Room ID ]
                                   │
                                   ▼
                         BattleSession (Server)
                                   │
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
       (emit: battle:log)                      (emit: battle:log)
               │                                       │
               ▼                                       ▼
        Frontend A UI                            Frontend B UI
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/core/src/battle/engine.ts` | Create | Relocated `simulateBattle`, `executeAttack`, and battle logic. |
| `packages/core/src/battle/database.ts` | Create | Relocated `SPECIES` and `ITEM_POOL` data. |
| `packages/core/src/battle/types.ts` | Create | Centralized battle types (`BattleResult`, `BattleLogEntry`, etc.). |
| `packages/server/src/sockets/index.ts` | Create | Socket.io server initialization and Fastify integration. |
| `packages/server/src/sockets/auth.ts` | Create | JWT handshake middleware for socket connections. |
| `packages/server/src/sockets/matchmaker.ts` | Create | Queue management and player pairing logic. |
| `packages/server/src/sockets/session.ts` | Create | `BattleSession` class to run simulation and emit events. |
| `packages/frontend/src/game/helpers.ts` | Modify | Remove relocated battle logic; import from `@pokelike/core`. |
| `packages/frontend/src/game/hooks/useMultiplayerBattle.ts` | Create | Hook to manage socket connection and battle event state. |
| `packages/frontend/src/game/screens/BattleScreen.tsx` | Modify | Update to receive events via socket instead of local simulation. |
| `packages/frontend/src/game/screens/LobbyScreen.tsx` | Create | New UI for joining and waiting in the matchmaking queue. |

## Interfaces / Contracts

### Socket Events

**Client $\rightarrow$ Server**
- `queue:join`: Requests to enter the matchmaking queue.
- `queue:leave`: Requests to leave the queue.

**Server $\rightarrow$ Client**
- `queue:status`: Updates on queue position or "Match Found".
- `battle:start`: Initial battle state (opponent team, room ID).
- `battle:log`: Real-time event (attack, faint, switch).
- `battle:result`: Final outcome (winner, updated stats).

### Battle Session State
```typescript
interface BattleSession {
  roomId: string;
  players: { userId: string; socketId: string; team: PokemonInstance[] }[];
  simulation: BattleSimulator; // Based on relocated simulateBattle
  status: 'waiting' | 'active' | 'completed';
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Battle Engine Logic | Vitest: Verify `simulateBattle` produces identical results for same seed in `@pokelike/core`. |
| Integration | Socket Handshake | Vitest + `socket.io-client`: Verify JWT authentication blocks unauthorized connections. |
| Integration | Matchmaking | Vitest: Simulate multiple clients joining queue and verify room creation. |
| E2E | Full Battle Flow | Manual/Playwright: Join queue $\rightarrow$ Battle $\rightarrow$ Result persistence. |

## Migration / Rollout

No data migration required. The multiplayer mode will be a separate entry point in the game menu, leaving the single-player "Tower" experience intact.

## Open Questions

- [ ] Should we implement a "timeout" for players who don't connect after a match is found?
- [ ] Do we need a spectate mode in Phase 3 or defer to Phase 4?
