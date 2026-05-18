# Design: phase2-pokedex-auth-modes

## Technical Approach

Phase 2 evolves Pokelike Reborn from a prototype to a full game experience. The strategy focuses on **decoupling game rules from the core loop** via a Strategy Pattern for modes (Nuzlocke/Battle Tower) and **modernizing state management** by migrating the Pokédex to Zustand. Authentication will be implemented as a separate layer providing cloud-persistence for the game state.

## Architecture Decisions

### Decision: Pokédex State Migration
**Choice**: New Zustand store (`usePokedexStore`) with `persist` middleware + initialization migration.
**Alternatives considered**: Keeping it in `localStorage` via helper functions.
**Rationale**: Reactivity. The Pokédex browser requires real-time updates when a Pokémon is seen or caught. A Zustand store allows components to subscribe to changes without manual polling.

### Decision: Game Mode Rule Engine
**Choice**: Strategy Pattern. A `ModeRules` interface in `@pokelike/core` implemented by `NormalRules`, `NuzlockeRules`, and `BattleTowerRules`.
**Alternatives considered**: Conditional logic (if/else) inside the battle/catch functions.
**Rationale**: Avoids "spaghetti code" in the core loop. Nuzlocke rules (permadeath) are isolated from Normal mode, making the system extensible for future modes.

### Decision: Battle Tower Loop
**Choice**: Procedural encounter generation based on "Floor" index, integrated as a specific `GameMode`.
**Alternatives considered**: Pre-defined set of battles.
**Rationale**: Scalability. Procedural generation allows for an endless challenge with escalating difficulty without bloating the data files.

### Decision: Authentication & Persistence
**Choice**: JWT-based auth with Fastify. Game state is synced as a JSON blob to the user profile.
**Alternatives considered**: Session cookies + relational DB for every game item.
**Rationale**: Simplicity. Since the game state is already a serializable Zustand blob, storing it as a document/blob in the DB is more efficient than mapping every Pokémon/Item to a DB row.

## Data Flow

```
[UI Screens] ──→ [Zustand Stores] ──→ [Core Logic / Mode Rules]
      │                │                       │
      │                └───────→ [AutoSave] ───┘
      │                                │
      └──────────→ [Auth API] ←────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/frontend/src/stores/pokedexStore.ts` | Create | Zustand store for Pokédex tracking |
| `packages/frontend/src/pages/PokedexScreen.tsx` | Create | Searchable Pokédex grid UI |
| `packages/frontend/src/pages/PokemonDetailScreen.tsx` | Create | Detailed stats and info view |
| `packages/frontend/src/pages/BattleTowerScreen.tsx` | Create | Tower lobby and progress UI |
| `packages/frontend/src/pages/ProfileScreen.tsx` | Create | User account and cloud sync UI |
| `packages/frontend/src/stores/authStore.ts` | Create | JWT and User session management |
| `packages/core/src/rules/index.ts` | Create | `ModeRules` interface and Strategy implementations |
| `packages/core/src/battle/towerGenerator.ts` | Create | Logic for escalating tower encounters |
| `packages/server/src/routes/auth.ts` | Create | Registration, Login, and Profile endpoints |
| `packages/frontend/src/stores/gameStore.ts` | Modify | Integration with `ModeRules` |

## Interfaces / Contracts

### Mode Rules Strategy
```typescript
interface ModeRules {
  onPokemonFaint(pokemon: PokemonInstance, team: PokemonInstance[]): PokemonInstance[];
  onEncounter(speciesId: string, areaId: string): boolean; // true if allowed
  onCatch(pokemon: PokemonInstance): PokemonInstance;
}
```

### Auth API
- `POST /api/auth/register` $\rightarrow$ `{ userId: string }`
- `POST /api/auth/login` $\rightarrow$ `{ token: string, user: User }`
- `GET /api/user/profile` $\rightarrow$ `{ profile: UserProfile, gameState: GameState }`
- `PUT /api/user/profile/state` $\rightarrow$ `{ success: boolean }`

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Nuzlocke permadeath | Test `NuzlockeRules.onPokemonFaint` removes Pokémon |
| Unit | Tower Scaling | Verify `towerGenerator` increases levels per floor |
| Integration | Pokedex Migration | Mock `localStorage` and verify Zustand store hydration |
| E2E | Auth Flow | Register $\rightarrow$ Login $\rightarrow$ Save State $\rightarrow$ Reload |

## Migration / Rollout

**Pokédex Migration**:
1. On `usePokedexStore` init, check `localStorage.getItem("pokelike-pokedex")`.
2. If present, parse and `set()` state.
3. `localStorage.removeItem("pokelike-pokedex")` to prevent double migration.

## PR Slicing Plan

1. **PR 1 (Data Foundation)**: `pokedexStore` + Migration + `PokedexScreen` + `PokemonDetailScreen`.
2. **PR 2 (Game Logic)**: Core `ModeRules` + `NuzlockeRules` + `gameStore` integration.
3. **PR 3 (Battle Tower)**: `towerGenerator` + `BattleTowerScreen` + Tower Loop.
4. **PR 4 (Auth Infra)**: Server `auth.ts` + `authStore` + JWT implementation.
5. **PR 5 (User Experience)**: `ProfileScreen` + Cloud Sync logic.
