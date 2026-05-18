## Exploration: Multiplayer 3v3 with Socket.io

### Current State

#### Server (`@pokelike/server`)
- Fastify-based HTTP server providing health checks, PokeAPI proxy, and JWT authentication.
- Authentication is implemented using JWTs stored in an in-memory Map (MVP).
- No real-time communication capabilities (no WebSockets/Socket.io).

#### Battle System (`@pokelike/core` & `frontend`)
- **CRITICAL FINDING**: The battle simulation logic (`simulateBattle`) is currently located in `packages/frontend/src/game/helpers.ts` instead of the core package. This means the current "engine" is client-side only.
- The simulation logic is generic and supports any team size (including 3v3) by iterating through available Pokemon until one team is wiped.
- Uses a `SeededRNG` for determinism.

#### Frontend (`@pokelike/frontend`)
- `BattleScreen.tsx` runs the full simulation locally on mount and streams the log to the UI.
- `authStore.ts` manages the JWT token, which can be reused for Socket.io authentication.

### Affected Areas
- `packages/core/src/battle/` — Will need the `simulateBattle` logic and `SPECIES` database moved here from the frontend to allow server-side execution.
- `packages/server/src/index.ts` — Integration of Socket.io with the Fastify server.
- `packages/server/src/` — New module for `BattleSession` management and Socket.io event handlers.
- `packages/frontend/src/pages/BattleScreen.tsx` — Shift from local simulation to listening for server-emitted battle events.
- `packages/frontend/src/stores/` — Potential new `multiplayerStore.ts` to manage lobby and match state.

### Approaches

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **Server-Side Auto-Battle** | Fast implementation; low latency; easy synchronization; leverages existing simulation logic. | Less interactive; players just watch the result stream. | Low/Medium |
| **Turn-Based Interactive** | Truly competitive multiplayer; high engagement; traditional Pokemon feel. | High complexity; requires turn-state management; timeouts; UI overhaul for move selection. | High |

### Recommendation
**Approach 1: Server-Side Auto-Battle (MVP)**
I recommend starting with the Server-Side Auto-Battle approach. This allows us to establish the Socket.io infrastructure, JWT authentication for sockets, and the multiplayer flow (Lobby $\rightarrow$ Match $\rightarrow$ Result) without the extreme complexity of turn-based state synchronization. Once the pipeline is stable, we can evolve the engine to be interactive.

### MVP Feature Set
1. **Socket Integration**: Fastify + Socket.io on the same port.
2. **Secure Handshake**: Socket.io middleware to verify JWTs.
3. **Simple Matchmaking**: A "Join Queue" system that pairs the first two available players.
4. **Server-Side Simulation**: Move the battle engine to `@pokelike/core` and execute it on the server.
5. **Real-time Streaming**: Server emits `battle:log` events to both clients as the simulation progresses.
6. **State Persistence**: Server updates user profiles/game states upon battle completion.

### Risks
- **Architectural Debt**: Moving logic from frontend to core may cause temporary regressions in the frontend.
- **Determinism**: Must ensure `SeededRNG` is handled correctly on the server to avoid desyncs (though less critical in auto-battle).
- **Concurrency**: Handling multiple simultaneous battles on a single-threaded Node.js process (mitigated by the lightweight nature of the current simulation).

### Ready for Proposal
**Yes**. The orchestrator should now proceed to the Proposal phase, focusing on moving the battle engine to core and implementing the Socket.io server-side pipeline.
