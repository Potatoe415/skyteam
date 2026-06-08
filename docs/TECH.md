# TECH

Status: Living document. Never edit autonomously — confirm with user first.

---

Stack_Frontend: React 18 + TypeScript
Stack_Backend: None (pure client-side)
Database: None (in-memory game state only)
Runtime: Browser; Node 18+ for tooling
Package_Manager: npm
Hosting: Static build (Vercel-ready); any static host
Authentication: None
Authorization: None
Security: No secrets, no network calls, no user data collected
Testing: Vitest (unit tests for the pure game engine)
Build_Tool: Vite 5
Styling: Tailwind CSS 3 (mobile-first)
Deployment: `vite build` -> static `dist/`

Conventions:
- Language: English for code/comments. User-facing copy is localized via `src/i18n` (EN default + FR); the game engine stays locale-free and emits stable codes that the UI translates.
- Naming: camelCase for vars/functions, PascalCase for components/types, kebab-case for files of components is allowed but default to PascalCase for component files.
- State: single immutable game-state object driven by a pure reducer (`useReducer`). No mutation.
- Game logic is framework-free: lives in `src/game/`, imports nothing from React.
- UI never computes rules; it reads state and dispatches actions.
- Formatting: Prettier defaults (2-space indent).
- Error_Handling: Illegal moves are prevented by selectors/guards, not thrown; reducer ignores illegal actions.
- Logging: none in production; console only for dev assertions.

Architecture_Principles:
- Keep the system understandable.
- Pure engine + thin React UI. Engine is the source of truth and is unit-tested.
- Avoid premature abstraction. One airport (data-driven) in v1.
- Prefer explicit over implicit.
- Every meaningful UI element gets a stable kebab-case `data-id` (see AGENTS.md).
- File size <= 300 lines, function <= 30 lines (per AGENTS.md).

Directory_Layout:
- `src/game/` — types, setup, rules, reducer, selectors (no React).
- `src/components/` — presentational + interactive cockpit components.
- `src/hooks/` — React glue (e.g., useGame).
- `src/i18n/` — language dictionaries (`messages.ts`) + provider/hook (`I18nContext.tsx`).
- `src/game/__tests__/` — Vitest engine tests.

Open_Questions:
- Tailwind v3 chosen over v4 for predictable config (no live build available to agent).
- React 18 (stable) chosen over 19 to minimize blind-setup risk.
