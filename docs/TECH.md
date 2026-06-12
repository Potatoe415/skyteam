# TECH

Status: Living document. Never edit autonomously — confirm with user first.

---

Stack_Frontend: React 18 + TypeScript
Stack_Backend: Vercel Serverless Functions (`api/`, Node/TS) for online mode; reuse the pure engine server-side. Local mode stays pure client-side.
Database: Supabase Postgres (online mode only). Local mode = in-memory state. Schema in `supabase/migrations/0001_init.sql`.
Realtime: Supabase Realtime — clients subscribe to a `game_events` tick table and refetch a redacted view (no state diffused over the wire).
Runtime: Browser; Node 18+ for tooling and Vercel Functions
Package_Manager: npm
Hosting: Vercel (static `dist/` + `api/` functions). Static-only still works for local mode.
Authentication: Supabase anonymous sign-in (online mode). None for local.
Authorization: Postgres RLS (sensitive tables = service_role only; `game_events` readable by authenticated). Server guard enforces role == currentPlayer for placement.
Security: service_role key is server-only (never shipped to client); secrets in env (`.env` gitignored, `.env.example` template). Hidden game info never leaves the server; rolls/rerolls randomized server-side.
Testing: Vitest (unit tests for the pure game engine). `npx tsc -p api` type-checks the server functions.
Build_Tool: Vite 5
Styling: Tailwind CSS 3 (mobile-first)
Deployment: Vercel — `vite build` -> static `dist/`; `api/*.ts` auto-deployed as functions. Env vars set in Vercel project settings.

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
- `src/game/` — types, setup, rules, reducer, selectors, `redact.ts` (no React; reused server-side).
- `src/components/` — presentational + interactive cockpit components, plus home/lobby/waiting-room screens.
- `src/hooks/` — React glue (e.g., useGame).
- `src/online/` — browser Supabase client (anon), API wrappers, `useOnlineGame` (ticks + redacted view).
- `src/i18n/` — language dictionaries (`messages.ts`) + provider/hook (`I18nContext.tsx`).
- `src/game/__tests__/` — Vitest engine tests.
- `api/` — Vercel Serverless Functions: `game/{create,join,start,view,move}.ts` + `_lib/` (supabase service client, auth, rooms, guards, shared data access). Type-checked via `api/tsconfig.json`.
- `supabase/migrations/` — re-runnable SQL schema (`0001_init.sql`).

Open_Questions:
- Tailwind v3 chosen over v4 for predictable config (no live build available to agent).
- React 18 (stable) chosen over 19 to minimize blind-setup risk.
