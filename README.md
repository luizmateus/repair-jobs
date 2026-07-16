# Repair Jobs

A mobile repair-jobs marketplace where two roles share one app — a **Client** posts jobs, a **Pro** claims and completes them. Same app, same login, different experience based on who you are.

Built with Expo (managed workflow) + TypeScript for the Mobile Take-Home challenge.

## Quick start

```bash
pnpm install
pnpm start         # launches Expo Dev Server
# press i for iOS simulator, a for Android, w for web
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm start` | Expo dev server |
| `pnpm test` | Jest test suite |
| `pnpm typecheck` | TypeScript type checking |

## Architecture

### Domain-first

The core logic lives in `src/domain/` as pure functions with no React or storage dependencies:

- **`job.ts`** — the `Job` type, a three-state machine (`open → claimed → done`), and transition functions (`createJob`, `claimJob`, `completeJob`) that enforce all business rules (only open jobs can be claimed, only the assigned Pro can complete, etc.).
- **`personas.ts`** — the two fixed demo identities (Alex the Client, Sam the Pro) and name lookups.

### Source of truth

DummyJSON's POST/PUT/DELETE endpoints return success but **don't persist**. So the app seeds once from the API (`GET /todos?limit=30`), maps todos → jobs, and treats the **local Zustand store** (backed by AsyncStorage) as the sole source of truth for all mutations. No write-through to the API. See [ADR-0001](docs/adr/0001-dummyjson-seed-local-source-of-truth.md).

If the seed fetch fails (offline, API down), the app falls back to bundled fixtures — it's always demoable.

### State management

[Zustand](https://github.com/pmndrs/zustand) with the `persist` middleware + AsyncStorage. The store holds:

- `session` — current role + persona (or `null` = logged out)
- `jobs` — the shared job world
- `hasSeeded` / `seedStatus` — seed lifecycle

Jobs outlive the session: logging out or switching roles clears only the session, not the jobs. A Client-created open job is visible to the Pro, and claims/completions persist across role switches. See [ADR-0002](docs/adr/0002-shared-job-world-across-sessions.md).

### Navigation

Expo Router with route groups:

```
app/
├── _layout.tsx          ← root: hydrates store, seeds, redirects by session
├── login.tsx            ← role picker (Continue as Client / Pro)
├── (client)/
│   ├── index.tsx        ← my jobs list + create + logout
│   ├── create.tsx       ← create job form
│   └── job/[id].tsx     ← job detail (read-only for client)
├── (pro)/
│   ├── index.tsx        ← Available / Mine segmented list
│   └── job/[id].tsx     ← job detail (claim / complete actions)
```

### Pro home — segmented

Pro's home is one screen with an "Available" / "Mine" segmented control. Available shows all `open` jobs. Mine shows `claimed` jobs assigned to this Pro. Done jobs drop off — no history view. See [ADR-0004](docs/adr/0004-pro-home-segments.md).

### Job detail — one component, role-driven actions

A single `JobDetail` component serves both roles. The Client sees status + assigned Pro name (read-only). The Pro sees conditional action buttons: "Claim this job" (if open), "Mark as done" (if claimed by them).

## Libraries & why

| Library | Why |
|---|---|
| **Expo Router** | File-based navigation with route groups for clean role separation |
| **Zustand** | Lightweight store; `persist` middleware gives AsyncStorage persistence for free |
| **AsyncStorage** | Persists jobs + session across app restarts |
| **jest-expo** | Jest preset with React Native transform config out of the box |

Everything else (styling, components) is plain React Native — `StyleSheet` + a shared theme. No UI framework, no CSS-in-JS, no component library.

## Testing

The domain layer is fully unit-tested (`src/domain/job.test.ts`) — every transition and every guard. The store has smoke tests (`src/store/app-store.test.ts`) covering sign-in/out, create, claim, and complete. UI tests are intentionally skipped — the domain + store tests cover the logic, and the UI is reviewable by running the app.

```bash
pnpm test
```

## Decisions recorded

- [ADR-0001](docs/adr/0001-dummyjson-seed-local-source-of-truth.md) — DummyJSON is seed-only; local store is source of truth
- [ADR-0002](docs/adr/0002-shared-job-world-across-sessions.md) — Jobs outlive the session
- [ADR-0004](docs/adr/0004-pro-home-segments.md) — Pro home uses Available / Mine segments

See [CONTEXT.md](CONTEXT.md) for the domain glossary.

## With more time

- **Done history for Pro** — a third "Done" segment or a separate history screen
- **Pull-to-refresh** on the job lists
- **Optimistic UI with error rollback** — if we ever point at a real backend
- **Offline-first with sync** — queue mutations and replay when online
- **Multiple Pros** — let the user pick from DummyJSON's user list, show real names
- **Job photos** — attach images to a repair request
- **E2E tests** with Maestro or Detox
- **Accessibility audit** — VoiceOver labels, dynamic type scaling
