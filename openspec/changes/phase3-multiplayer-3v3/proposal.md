# Proposal: Phase 3 - Multiplayer 3v3

## Intent
Introduce real-time multiplayer capabilities to "Pokelike Reborn" through a server-side auto-battle system. The goal is to move the battle engine from the client to the server, enabling synchronized matches between players using Socket.io, while establishing a robust foundation for future interactive turn-based modes.

## Scope

### In Scope
- **Battle Engine Migration**: Extract `simulateBattle` and related logic from `@pokelike/frontend` to `@pokelike/core`.
- **Socket.io Infrastructure**: Integrate Socket.io with the existing Fastify server.
- **Secure Authentication**: Implement JWT verification middleware for Socket.io connections.
- **Matchmaking MVP**: A simple queue-based system that pairs players for 3v3 battles.
- **Real-time Battle Streaming**: Server-side execution of battles with real-time event streaming (`battle:log`) to clients.
- **Multiplayer UI**: Lobby/Queue screens and a spectate-style Battle UI.
- **Result Persistence**: Update user profiles and game state (Elo/Rank, etc.) upon battle completion.

### Out of Scope
- **Turn-Based Interaction**: Manual move selection and turn-based state management (deferred to Phase 4).
- **Friend System**: Inviting specific players to battles.
- **Team Selection/Customization**: Pre-battle team building in multiplayer (deferred to Phase 4).

## Capabilities

### New Capabilities
- `multiplayer-battle`: Real-time 3v3 auto-battles managed by the server via Socket.io.
- `matchmaking-queue`: A server-side queue to pair players for matches.
- `socket-auth`: Secure WebSocket connections using existing JWT authentication.

### Modified Capabilities
- `authentication`: Requirements expanded to cover Socket.io handshake authentication.
- `game-state`: Requirements expanded to include synchronization of multiplayer battle results.

## Approach
Implement a "Server-Side Auto-Battle" architecture.
1. **Core Refactor**: Move the simulation logic to `@pokelike/core` to make it environment-agnostic (runnable on both frontend and server).
2. **Server Extension**: Add a Socket.io layer to the Fastify server.
3. **Matchmaking Flow**: Players join a queue $\rightarrow$ Server pairs them $\rightarrow$ Server initiates a `BattleSession` $\rightarrow$ Server runs the simulation $\rightarrow$ Server streams events $\rightarrow$ Server persists results.
4. **Frontend Update**: Frontend shifts from being the "driver" of the battle to a "subscriber" of battle events.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `@pokelike/core` | New/Modified | Will host the relocated `simulateBattle` engine. |
| `@pokelike/server` | New/Modified | Integration of Socket.io, matchmaking logic, and battle session management. |
| `@pokelike/frontend` | Modified | Significant changes to `BattleScreen.tsx` and new multiplayer-specific stores/UI. |
| `openspec/specs/authentication` | Modified | Updated to cover socket-level authentication. |
| `openspec/specs/game-state` | Modified | Updated to include multiplayer result persistence. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Logic Regressions | Medium | Robust unit testing for the relocated `@pokelike/core` battle engine. |
| Socket Connection Stability | Medium | Implementing reconnection logic and robust error handling in the frontend. |
| Server Performance/Concurrency | Low | Keeping the simulation lightweight and leveraging Node.js event loop efficiently. |

## Rollback Plan
- **Code Revert**: Revert changes to `@pokelike/core` and `@pokelike/server`.
- **Frontend Revert**: Revert `BattleScreen.tsx` and multiplayer stores to use the local simulation logic.
- **State Integrity**: Ensure that any partial multiplayer state updates do not corrupt the existing single-player game state.

## Dependencies
- Existing JWT authentication system (Phase 2).
- `@pokelike/core` battle logic (to be refactored).

## Success Criteria
- [ ] Players can join a matchmaking queue and be paired with another player.
- [ ] Battles are executed on the server and results are streamed in real-time to both clients.
- [ ] Battle results are correctly persisted to the user's profile.
- [ ] No regressions in the existing single-player game experience.
