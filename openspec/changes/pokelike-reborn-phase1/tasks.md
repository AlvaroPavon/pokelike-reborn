# Tasks — pokelike-reborn-phase1

> Auto-generated. Update `[ ]` → `[x]` as tasks are completed.

## Phase 1: Project Scaffolding

- [x] 1.1 Create monorepo root with `package.json` (workspaces: ["packages/*"], name: "pokelike-reborn")
- [x] 1.2 Add `tsconfig.base.json` with strict mode, ES2020, paths aliases for packages
- [x] 1.3 Create shared ESLint flat config (`eslint.config.js`) for TypeScript + React
- [x] 1.4 Create shared Prettier config (singleQuote, semi, tabWidth: 2)
- [x] 1.5 Create `.gitignore` (node_modules, dist, .turbo, *.log, .env)
- [x] 1.7 Create `packages/core/package.json` (name: "@pokelike/core", type: module, pure TS)
- [x] 1.8 Create `packages/frontend/package.json` (name: "@pokelike/frontend", Vite+React)
- [x] 1.9 Create `packages/server/package.json` (name: "@pokelike/server", Fastify)

## Phase 2: Core Package (Foundation)

- [x] 2.1 Define TypeScript interfaces and types in `packages/core/src/types/index.ts`
- [x] 2.2 Implement Mulberry32 PRNG in `packages/core/src/utils/prng.ts`
- [x] 2.3 Create type effectiveness map in `packages/core/src/data/typeChart.ts`

## Phase 3: Battle Engine (in future PR)
## Phase 4: Frontend Shell (in future PR)
## Phase 5: Backend Server (in future PR)
