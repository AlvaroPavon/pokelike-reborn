# Tasks: phase2-pokedex-auth-modes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1800 (5 PRs × ~360 avg) |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | PR | Base |
|------|------|----|------|
| 1 | Data Foundation: pokedexStore + migration + 2 screens | PR 1 | main |
| 2 | Game Logic: ModeRules + NuzlockeRules + gameStore | PR 2 | main |
| 3 | Battle Tower: towerGenerator + BattleTowerScreen | PR 3 | main |
| 4 | Auth Infra: server routes + authStore + JWT | PR 4 | main |
| 5 | UX: ProfileScreen + cloud sync + auto-save | PR 5 | main |

## PR 1: Data Foundation

- [x] 1.1 Create `packages/core/src/pokedex/types.ts` — `PokedexEntry`, `PokedexStatus` enums
- [x] 1.2 Create `packages/frontend/src/stores/pokedexStore.ts` — Zustand + persist + localStorage migration init
- [x] 1.3 Create `packages/frontend/src/stores/pokedexStore.ts` — `seenSpecies`, `caughtSpecies` state + `markSeen()`, `markCaught()`, `isCaught()`, `isSeen()` actions
- [x] 1.4 Create `packages/frontend/src/pages/PokedexScreen.tsx` — grid layout + search + "Caught Only" toggle
- [x] 1.5 Create `packages/frontend/src/pages/PokedexScreen.tsx` — completion % display (Caught/Total)
- [x] 1.6 Create `packages/frontend/src/pages/PokemonDetailScreen.tsx` — stats display (HP, Atk, Def, SpA, SpD, Spe)
- [x] 1.7 Create `packages/frontend/src/pages/PokemonDetailScreen.tsx` — move list with types and power
- [x] 1.8 Create `packages/frontend/src/pages/PokemonDetailScreen.tsx` — evolution chain with conditions
- [x] 1.9 Add Pokédex route to `App.tsx` (`/pokedex`, `/pokemon/:id`)
- [x] 1.10 Write tests: pokedexStore markSeen/markCaught, PokédexScreen filter rendering
- [x] 1.11 Write tests: PokemonDetailScreen stat and evolution rendering

## PR 2: Game Logic

- [x] 2.1 Create `packages/core/src/rules/ModeRules.ts` — `ModeRules` interface (onPokemonFaint, onEncounter, onCatch)
- [x] 2.2 Create `packages/core/src/rules/NormalRules.ts` — default rules (no-op / pass-through)
- [x] 2.3 Create `packages/core/src/rules/NuzlockeRules.ts` — permadeath on faint, first-encounter per area
- [x] 2.4 Create `packages/core/src/rules/index.ts` — barrel export + `createModeRules()` factory
- [x] 2.5 Create `packages/core/src/rules/areaTracking.ts` — `encounteredAreas: Set<string>` helper for Nuzlocke
- [x] 2.6 Modify `packages/frontend/src/stores/gameStore.ts` — inject active `ModeRules` instance
- [x] 2.7 Add game mode selector to `GameSetupScreen` or `App.tsx` routes (Normal | Nuzlocke | BattleTower)
- [x] 2.8 Write tests: NuzlockeRules.onPokemonFaint removes Pokémon from team
- [x] 2.9 Write tests: NuzlockeRules.onEncounter returns false on repeat area
- [x] 2.10 Write tests: NormalRules pass-through behavior

## PR 3: Battle Tower

- [x] 3.1 Create `packages/core/src/battle/towerGenerator.ts` — `TowerFloor`, `generateTowerEncounter(floor)` by level scaling
- [x] 3.2 Create `packages/core/src/battle/towerGenerator.ts` — `getNextOpponent(floor)` — escalate levels + team size
- [x] 3.3 Create `packages/frontend/src/pages/BattleTowerScreen.tsx` — tower lobby UI (start run, current floor display)
- [x] 3.4 Create `packages/frontend/src/pages/BattleTowerScreen.tsx` — floor progress bar + win counter
- [x] 3.5 Wire `towerGenerator` into battle loop via `BattleTowerRules` (implements `ModeRules`)
- [x] 3.6 Handle defeat state: show total wins, offer "Retry" or "Exit"
- [x] 3.7 Write tests: towerGenerator level scaling matches floor progression formula
- [x] 3.8 Write tests: towerGenerator team size increases every N floors

## PR 4: Auth Infra

- [x] 4.1 Create `packages/server/src/routes/auth.ts` — `POST /api/auth/register` (bcrypt hash, userId)
- [x] 4.2 Create `packages/server/src/routes/auth.ts` — `POST /api/auth/login` (compare, JWT issuance)
- [x] 4.3 Create `packages/server/src/routes/auth.ts` — `GET /api/user/profile` (JWT guard, return profile + gameState)
- [x] 4.4 Create `packages/server/src/routes/auth.ts` — `PUT /api/user/profile/state` (upsert gameState JSON blob)
- [x] 4.5 Create `packages/frontend/src/stores/authStore.ts` — Zustand + persist for JWT token + user
- [x] 4.6 Implement `authStore.login()`, `authStore.register()`, `authStore.logout()` actions
- [x] 4.7 Add JWT middleware to frontend API calls (attach `Authorization: Bearer <token>`)
- [x] 4.8 Write tests: server auth endpoints return correct status codes (201, 401, 200)
- [x] 4.9 Write tests: authStore hydrates token from persist storage

## PR 5: User Experience

- [x] 5.1 Create `packages/frontend/src/pages/ProfileScreen.tsx` — display username, email, cloud save status
- [x] 5.2 Create `packages/frontend/src/pages/ProfileScreen.tsx` — "Sync Now" button + last-sync timestamp
- [x] 5.3 Implement auto-save trigger on game state mutations (battle end, capture, item use)
- [x] 5.4 Implement `loadFromCloud()` on app init when authenticated
- [x] 5.5 Add conflict resolution: prefer latest server timestamp on load
- [x] 5.6 Wire "Play Modes" menu to route between Normal, Nuzlocke, Battle Tower
- [x] 5.7 Write tests: ProfileScreen renders user data and sync button
- [x] 5.8 Write tests: auto-save fires on capture event (mock gameStore mutation)
- [x] 5.9 Write tests: cloud load restores Zustand state correctly