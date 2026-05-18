# Proposal: phase2-pokedex-auth-modes

## Intent

Expand "Pokelike Reborn" from a basic battle loop to a deeper experience by adding Pokémon inspection, a comprehensive Pokédex, specialized gameplay modes (Nuzlocke & Battle Tower), and user authentication for persistent progression.

## Scope

### In Scope
- **Pokémon Detail Screen**: UI for viewing stats, moves, and evolution info.
- **Pokédex Browser**: Searchable UI integrated with game state.
- **Nuzlocke Mode**: Logic for permadeath, first encounters, and nicknames.
- **Battle Tower**: Endless challenge mode with automated encounter generation.
- **Authentication**: Lightweight user accounts (Email/Password) and profile management.

### Out of Scope
- **Multiplayer Battles**: Real-time PvP is deferred to a later phase.
- **Social Features**: Friends lists, guilds, or chat.
- **Advanced Breeding**: Complex genetics and egg mechanics.

## Capabilities

### New Capabilities
- `pokemon-details`: Displaying detailed Pokémon data and stats.
- `pokedex`: Tracking and browsing the user's collection.
- `game-modes`: Implementing specialized rule sets (Nuzlocke, Battle Tower).
- `authentication`: Managing user identity and cloud-saved progress.

### Modified Capabilities
- `game-state`: Updating core loop to handle mode-specific rules (Nuzlocke) and Pokédex integration.

## Approach

1. **UI Foundation**: Implement Detail and Pokédex screens first to provide immediate value.
2. **State Migration**: Move Pokédex tracking from `localStorage` to a Zustand-managed store to ensure UI reactivity.
3. **Rule Engine**: Implement Nuzlocke and Battle Tower logic in `@pokelike/core` using a strategy pattern to keep "Normal" mode unaffected.
4. **Persistence**: Add Fastify routes for user profiles, allowing the frontend to sync Zustand state to the server.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `packages/frontend/src/pages/` | New | `PokedexScreen`, `PokemonDetailScreen`, `BattleTowerScreen`, `ProfileScreen` |
| `packages/frontend/src/stores/` | Modified | `gameStore.ts` (integration of modes and Pokédex) |
| `packages/core/src/` | New/Modified | Nuzlocke rules, Battle Tower encounter logic, Mode types |
| `packages/server/src/routes/` | New | User auth and profile endpoints |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Nuzlocke logic side-effects | Medium | Strict isolation of mode-specific rules in `@pokelike/core`. |
| State sync inconsistencies | Medium | Migrating Pokédex from `localStorage` to Zustand. |
| Battle Tower complexity creep | High | Defining a strict, limited scope for the initial loop. |

## Rollback Plan

Revert new UI routes, restore `gameStore.ts` and `@pokelike/core` to Phase 1 state, and remove new server endpoints.

## Dependencies

- Phase 1 core battle and movement systems.

## Success Criteria

- [ ] User can inspect any Pokémon's full stats.
- [ ] Pokédex correctly reflects caught/seen status in the UI.
- [ ] Nuzlocke mode correctly enforces permadeath rules.
- [ ] Battle Tower provides a continuous, escalating challenge loop.
- [ ] User can register, login, and have their data persist across sessions.
