# Tasks � pokelike-reborn-phase1

> Auto-generated. Update [ ] ? [x] as tasks are completed.

## Phase 1: Project Scaffolding

- [x] 1.1 Create monorepo root with package.json (workspaces: ["packages/*"], name: "pokelike-reborn")
- [x] 1.2 Add 	sconfig.base.json with strict mode, ES2020, paths aliases for packages
- [x] 1.3 Create shared ESLint flat config (eslint.config.js) for TypeScript + React
- [x] 1.4 Create shared Prettier config (singleQuote, semi, tabWidth: 2)
- [x] 1.5 Create .gitignore (node_modules, dist, .turbo, *.log, .env)
- [x] 1.7 Create packages/core/package.json (name: "@pokelike/core", type: module, pure TS)
- [x] 1.8 Create packages/frontend/package.json (name: "@pokelike/frontend", Vite+React)
- [x] 1.9 Create packages/server/package.json (name: "@pokelike/server", Fastify)

## Phase 2: Core Package (Foundation)

- [x] 2.1 Define TypeScript interfaces and types in packages/core/src/types/index.ts
- [x] 2.2 Implement Mulberry32 PRNG in packages/core/src/utils/prng.ts
- [x] 2.3 Create type effectiveness map in packages/core/src/data/typeChart.ts

## Phase 3: Battle Engine (in future PR)

## Phase 4: Frontend Shell (PR 7)

- [x] 8.1 Initialize Vite + React + TypeScript (vite.config.ts, index.html, main.tsx, App.tsx)
- [x] 8.2 Create retro CSS theme (globals.css with Press Start 2P font, pixel-art aesthetic)
- [x] 8.3 Create game state store (gameStore.ts with Zustand + persist middleware)
- [x] 8.4 Create UI state store (uiStore.ts with screen navigation)
- [x] 8.5 Create placeholder screen components (title, trainer_select, starter_select, map, battle, catch, item, game_over, win)
- [x] 8.6 Add PWA support (vite-plugin-pwa with service worker + web manifest)

## Phase 5: Backend Server (in future PR)

## Phase 6: Frontend UI Components (PR 8)

- [x] 7.1 Create HpBar component (color-coded health bar with animation and size variants)
- [x] 7.2 Create PokemonCard component (sprite, name, level, type badges, HP bar, stats, moves)
- [x] 7.3 Create TeamPanel component (horizontal/vertical list with drag reorder)
- [x] 7.4 Create ItemBar component (horizontal item badges with empty state)
- [x] 7.5 Create MapView component (SVG node graph with zoom/pan controls)
- [x] 7.6 Create BattleField component (two-sided battle with HP bars, log, victory/defeat)
- [x] 7.7 Create components/index.ts barrel file
- [x] 7.8 Add vitest config, test setup, and component tests

## Phase 9: Complete Game Screens (PR 9)

- [x] 9.1 Create game helpers (packages/frontend/src/game/helpers.ts) with battle sim, encounters, map gen
- [x] 9.2 Implement full TitleScreen with logo, Continue check, Nuzlocke/Battle Tower buttons
- [x] 9.3 Implement full TrainerSelectScreen with CSS pixel art sprites
- [x] 9.4 Implement full StarterSelectScreen with 3 Kanto starters
- [x] 9.5 Implement full MapScreen with MapView, TeamPanel, ItemBar, node resolution
- [x] 9.6 Implement full BattleScreen with auto-battle, log streaming, XP/evolution
- [x] 9.7 Implement full CatchScreen with swap modal for full teams
- [x] 9.8 Implement full ItemScreen with item cards and descriptions
- [x] 9.9 Implement full GameOverScreen with stats and final team display
- [x] 9.10 Implement full WinScreen with Battle Tower unlock
- [x] 9.11 Update App router with screen transition animations
- [x] 9.12 Extend uiStore with transient battle/catch/item data
- [x] 9.13 Add pulse and attackFlash CSS animations

## Phase 10: Persistence System (PR 10)

- [x] 10.1 Create Save/Load utilities (packages/frontend/src/utils/saveLoad.ts) with SaveManager, SaveData, GameSettings types
- [x] 10.2 Implement save schema with versioning (SAVE_VERSION = 1), validateSaveData, migrateSaveData, MIN_COMPATIBLE_VERSION
- [x] 10.3 Create auto-save integration (packages/frontend/src/stores/autoSave.ts) with debounced subscription to game store changes
- [x] 10.4 Add Continue button to title screen (TitleScreen.tsx) — enabled when SaveManager.hasSave() returns true, loads and hydrates store on click
- [x] 10.5 Create Hall of Fame (packages/frontend/src/utils/hallOfFame.ts) — addHallOfFameEntry, getHallOfFame, getRunNumber, peekRunNumber
- [x] 10.6 Create Pokédex (packages/frontend/src/utils/pokedex.ts) — markCaught, markSeen, getPokedex, isPokedexComplete, getCaughtCount