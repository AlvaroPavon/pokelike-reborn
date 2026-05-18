## Exploration: Phase 2 Scope for Pokelike Reborn

### Current State

The project has a solid foundation from Phase 1, but several planned features are either missing or only partially implemented.

#### 1. Pokédex Tracking
- **State**: Partially implemented (Data layer only).
- **Implementation**: Found in `packages/frontend/src/utils/pokedex.ts`. It uses a dedicated `localStorage` key (`pokelike-pokedex`) to track `seen` and `caught` status, independently of the active game save.
- **Missing**: No UI screen to view the Pokédex.

#### 2. Authentication & User Profiles
- **State**: Missing.
- **Implementation**: There is no authentication system. User identity is limited to a trainer gender selection (`"boy" | "girl"`) stored in `gameStore.ts`.
- **Missing**: User accounts, login/signup, profile management.

#### 3. Game Modes (Nuzlocke, etc.)
- **State**: Skeleton only.
- **Implementation**: `GameMode` type in `packages/core/src/types/index.ts` includes `"normal" | "nuzlocke" | "battle_tower"`. `gameStore.ts` tracks the active mode.
- **Missing**: No logic to enforce Nuzlocke rules (e.g., permanent death) or Battle Tower progression.

#### 4. Battle Tower
- **State**: Missing.
- **Implementation**: Only exists as a type value in `GameMode`.
- **Missing**: Entire game loop for an endless/challenge mode, specific encounter sequences, and a dedicated UI.

#### 5. Pokémon Details
- **State**: Missing.
- **Implementation**: None.
- **Missing**: A screen to view detailed stats, moves, and Pokédex information for a specific Pokémon.

#### 6. Current Routes/Pages
- **Implemented**: Title, Trainer Select, Starter Select, Map, Battle, Catch, Items, Game Over, Win.
- **Missing**: Pokédex, Pokémon Detail, Battle Tower, Profile/Settings.

#### 7. State Management (Zustand)
- **Implementation**: `gameStore.ts` handles the active run (team, items, badges, location). `uiStore.ts` and `autoSave.ts` provide supporting functionality.
- **Observation**: The Pokédex uses a separate utility instead of being integrated into the Zustand store, which might lead to synchronization issues if not handled carefully.

#### 8. Server Endpoints
- **Implementation**: `packages/server/src/routes/pokemon.ts` acts as a proxy to PokeAPI with an in-memory cache.
- **Missing**: Endpoints for user profiles, global Pokédex leaderboards, or cloud saves.

---

### Gap Analysis

| Feature | Existing | Missing | Gap |
|---------|----------|----------|-----|
| Pokédex | Utility logic | UI Screen | No way for the user to see their progress |
| Auth | Nothing | Full System | No identity or persistent user profiles |
| Nuzlocke | Type definition | Rules Engine | No "permadeath" or "first encounter" logic |
| Battle Tower | Type definition | Game Loop | No endless battle sequence or UI |
| Details | Nothing | Detail Screen | Cannot inspect Pokémon beyond basic card |

---

### Recommended Phase 2 Scope

I recommend the following implementation order to maximize reuse and minimize refactoring:

1. **Pokémon Detail Screen** (Low Complexity)
   - Create a screen to display full stats and moves of a `PokemonInstance`.
   - This serves as a foundation for both the Team panel and the Pokédex.

2. **Pokédex UI** (Low Complexity)
   - Create a screen that reads from `packages/frontend/src/utils/pokedex.ts`.
   - Integrate the "Detail Screen" for caught Pokémon.

3. **Nuzlocke Mode Implementation** (Medium Complexity)
   - Implement the rules in `packages/core/src/` (e.g., updating `BattleResult` processing to handle permanent death).
   - Add a mode selector in the `StarterSelectScreen` or `TitleScreen`.

4. **Battle Tower** (Medium/High Complexity)
   - Create a new encounter generator for sequential battles.
   - Implement a new "Tower" loop and a dedicated UI.

5. **User Profiles & Auth** (Medium Complexity)
   - Implement basic user profiles (Local first, then Server-side).
   - Create a Profile screen to show total caught Pokémon and Hall of Fame records.

---

### Affected Areas

- `packages/frontend/src/pages/`: New files for `PokedexScreen.tsx`, `PokemonDetailScreen.tsx`, `BattleTowerScreen.tsx`, `ProfileScreen.tsx`.
- `packages/frontend/src/stores/gameStore.ts`: Integration of Pokédex state and mode-specific flags.
- `packages/core/src/`: Logic for Nuzlocke rules and Battle Tower encounter generation.
- `packages/server/src/routes/`: New routes for user profiles and persistence.

---

### Risks

- **Nuzlocke Logic**: Modifying the battle result processing in `core` might affect existing "normal" mode behavior if not properly isolated.
- **State Sync**: The current separation between `gameStore` (Zustand) and `pokedex.ts` (localStorage) could cause UI lag or inconsistencies. Moving Pokédex to Zustand is recommended.
- **Battle Tower Scope**: If not strictly defined, the Battle Tower could grow into a massive feature that delays other Phase 2 goals.
