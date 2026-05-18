# Tasks: Phase 3 - Multiplayer 3v3

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 800–1200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Battle engine migration to `@pokelike/core` | PR 1 | Base = main; includes types, engine, data, tests |
| 2 | Socket.io infrastructure (server init, JWT auth, CORS) | PR 2 | Base = main; independent of PR 1 core logic |
| 3 | Matchmaking queue and player pairing | PR 3 | Base = main; depends on PR 2 socket infra |
| 4 | Server-side battle execution + event streaming | PR 4 | Base = main; depends on PR 1 + PR 3 |
| 5 | Frontend multiplayer UI (lobby, battle viewer) | PR 5 | Base = main; depends on PR 2 + PR 4 |

## Phase 1: Battle Engine Migration (PR 1)

- [x] 1.1 Create `packages/core/src/battle/types.ts` — define `BattleResult`, `BattleLogEntry`, `PokemonInstance`, `Team` interfaces
- [x] 1.2 Create `packages/core/src/battle/database.ts` — relocate `SPECIES` and `ITEM_POOL` from `packages/frontend/src/game/helpers.ts`
- [x] 1.3 Create `packages/core/src/battle/engine.ts` — relocate `simulateBattle`, `executeAttack`, and supporting helpers from `helpers.ts`
- [x] 1.4 Create `packages/core/src/battle/index.ts` — export all battle module types and functions
- [x] 1.5 Add `packages/core/src/battle/__tests__/engine.test.ts` — unit tests verifying `simulateBattle` produces identical results for same seed
- [x] 1.6 Modify `packages/frontend/src/game/helpers.ts` — remove relocated battle logic; import from `@pokelike/core`
- [x] 1.7 Update `packages/frontend/src/pages/BattleScreen.tsx` — change import source to `@pokelike/core`

Also updated: `packages/frontend/src/stores/uiStore.ts` and `packages/frontend/src/pages/ItemScreen.tsx` — import `ItemOption` from `@pokelike/core` instead of `../game/helpers`. Fixed ambiguous re-exports in `packages/core/src/index.ts` and `packages/core/src/battle/types.ts`.

## Phase 2: Socket.io Infrastructure (PR 2)

- [x] 2.1 Add `socket.io` and `@types/socket.io` dependencies to `packages/server/package.json`
- [x] 2.2 Create `packages/server/src/sockets/index.ts` — initialize Socket.io server attached to Fastify HTTP server; configure CORS for frontend origin
- [x] 2.3 Create `packages/server/src/sockets/auth.ts` — implement JWT handshake middleware: reject connections without valid token in `auth` payload
- [x] 2.4 Register socket handlers in the Fastify server (`src/index.ts`)
- [x] 2.5 Add `packages/server/src/__tests__/socket-auth.test.ts` — verify JWT auth blocks/rejects invalid connections

## Phase 3: Matchmaking Queue (PR 3)

- [x] 3.1 Create `packages/server/src/sockets/matchmaker.ts` — implement FIFO in-memory queue with `join`, `leave`, and periodic `tick`
- [x] 3.2 Create `packages/server/src/sockets/session.ts` — implement `BattleSession` class: accepts two players, assigns room ID, manages session lifecycle (`waiting` | `active` | `completed`)
- [x] 3.3 Wire socket events: `queue:join` → add to queue; `queue:leave` → remove; auto-pair on `tick` → create `BattleSession`
- [x] 3.4 Emit `queue:status` events to clients (queue position, match found)
- [x] 3.5 Add `packages/server/src/__tests__/matchmaker.test.ts` — simulate multiple clients joining queue; verify room creation

## Phase 4: Server-Side Battle + Streaming (PR 4)

- [x] 4.1 In `BattleSession`: import and call `simulateBattle` from `@pokelike/core` with both teams
- [x] 4.2 Emit `battle:start` with initial state (opponent team, room ID) to both players' sockets
- [x] 4.3 For each battle turn: emit `battle:log` event with `BattleLogEntry` to the room
- [x] 4.4 On battle completion: emit `battle:result` with winner and updated stats to both players
- [x] 4.5 Implement result persistence: update player Elo/Rank in database upon `battle:result`
- [x] 4.6 Add `packages/server/src/__tests__/battle-session.test.ts` — verify `battle:log` events are emitted and session completes

## Phase 5: Frontend Multiplayer UI (PR 5)

- [x] 5.1 Create `packages/frontend/src/pages/LobbyScreen.tsx` — matchmaking UI: "Find Match" button, "Searching..." state, "Cancel" button
- [x] 5.2 Create `packages/frontend/src/game/hooks/useMultiplayerBattle.ts` — manage socket connection lifecycle, queue events, battle events
- [x] 5.3 Modify `packages/frontend/src/pages/BattleScreen.tsx` — listen to socket `battle:log` and `battle:result` instead of local simulation
- [x] 5.4 Update `packages/frontend/src/stores/uiStore.ts` — add multiplayer navigation state (`lobby`, `searching`, `battle`)
- [x] 5.5 Add `packages/frontend/src/game/__tests__/useMultiplayerBattle.test.ts` — mock socket; verify events update store correctly
