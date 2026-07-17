# Repair Jobs

A mobile repair-jobs marketplace where two roles share one app — a **Client** posts jobs, a **Pro** claims and completes them. Same app, same login, different experience based on who you are.

Built with Expo SDK 56 + TypeScript + Expo Router.

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8
- **Xcode** (iOS simulator) or **Android Studio** (Android emulator)
- **Expo Go** app on a physical device (optional)

## Quick start

```bash
pnpm install
pnpm start         # Expo dev server (i = iOS, a = Android)
pnpm test          # Jest test suite
pnpm typecheck     # TypeScript type checking
pnpm format        # Prettier + ESLint --fix
```

## Project structure

```
app/
├── _layout.tsx          # root layout (hydration / startup gate)
├── index.tsx            # splash → role redirect
├── login.tsx            # shared login screen
├── (client)/            # Client role: _layout (auth/role guard), index,
│   └── job/[id].tsx     #   create, job detail
└── (pro)/               # Pro role: _layout (auth/role guard), index
    └── job/[id].tsx     #   (browse/claimed/done), job detail
src/
├── features/
│   ├── auth/        # auth store, session personas
│   └── jobs/        # jobs store, jobUtils (state machine), components
│                    #   (JobCard, StatusBadge, JobDetail, …), DummyJSON
│                    #   client + mapTodoToJob (+ inline seed fixtures)
├── shared/
│   ├── api/         # generic fetch wrapper (timeout/abort)
│   ├── components/  # reusable UI (Button, SegmentedControl,
│   │                #   NetworkErrorBanner, etc.)
│   ├── constants/   # theme, persona display names
│   ├── hooks/       # useAppStartup, useAsyncAction
│   ├── store/       # Zustand store helpers
│   └── utils/       # time formatting
```

## Libraries picked and why

- **Expo + Expo Router v56** — the required stack. Expo Router's file-based routing and route groups (`(client)` / `(pro)`) made it natural to keep each role's screens and stack isolated while sharing the same login entry point.
- **TypeScript** — required. Also used to encode the job state machine (`Job['status']` literal) so illegal transitions don't compile.
- **Zustand** (with `persist` + `@react-native-async-storage/async-storage`) — lightweight, no provider boilerplate, and its `persist` middleware gave me cross-restart persistence for the session and the local job world in a few lines. Two stores: `useAuthStore` (session) and `useJobsStore` (jobs + seed flag).
- **react-native** built-ins (`FlatList` with `RefreshControl`, `Alert`, `Pressable`) + plain `StyleSheet` with a small theme module (`shared/constants/theme.ts`). No UI kit — the surface is small enough that a hand-rolled theme keeps the bundle lean and the styling explicit. Pull-to-refresh calls `useJobsStore.resyncJobs`, which re-fetches DummyJSON and merges via `mergeJobs` so local claim/complete progress and locally-created jobs survive.
- **jest + jest-expo + @testing-library/react-native** — tests focus on the domain layer (state machine transitions in `jobUtils`) and the stores (auth + jobs), the parts with real logic. UI components have light snapshot-free tests for the bits that branch on props (StatusBadge, JobCard, SegmentedControl, Button, InputField).

## Next up

1. **Optimistic-invalidation plumbing** — drive mutations through a proper cache layer with `onMutate`/`onError` rollback, instead of today's fire-and-forget pattern where API failures leave the UI silently out of sync.
2. **Per-endpoint fetching** — use `GET /todos/{id}` and `/todos/user/{userId}` instead of seeding everything up front, once the dataset outgrows a one-shot list.
3. **Accessibility pass** — `accessibilityRole`/`accessibilityLabel` on every `Pressable`, dynamic font scaling, minimum touch-target audit.
4. **E2E with Maestro or Detox** on top of the unit/component suite, focused on role-gated navigation and the claim→complete flow.
5. **Root error boundary** — so a render-time crash anywhere doesn't blank the whole app.

## Assumptions & shortcuts

- **Identity is faked.** Two fixed demo personas (`CLIENT_PERSONA`, `PRO_PERSONA`) with hardcoded `userId`s drive role and assignment. "Pro names" and "client names" come from a small `PERSONA_NAMES` map; DummyJSON's `userId` is reused as the creator id for seed jobs.
- **Local store is the source of truth.** DummyJSON's `POST`/`PUT`/`DELETE` return a valid-looking response but don't persist, so a later `GET` won't show your change. I seed once from `/todos?limit=0` into the persisted Zustand store and treat that store as the system of record thereafter. Mutations update the store synchronously and fire the API call best-effort. Pull-to-refresh merges by id and status rank (`mergeJobs`) so local claim/complete on seeded jobs and locally-created jobs survive.
- **The "claim" notion doesn't exist in DummyJSON.** I represent an assignment by adding `assigneeId` and a `claimed` status on top of the basic todo shape, and keep it consistent via the state machine in `jobUtils.ts` (`open → claimed → done`). Illegal transitions throw `JobTransitionError`, tested in `jobUtils.test.ts`.
- **Single shared job world, role-gated by filtering.** Both roles read the same `useJobsStore.jobs`; the Client sees `jobsByCreator(myUserId)`, the Pro sees `openJobs` / `claimedJobsForPro(myUserId)` / `doneJobsForPro(myUserId)`. No per-role siloing of data, only of views + actions.
- **Seed/network errors are surfaced.** If `/todos` is unreachable on first seed, the app still boots against bundled fixtures and shows a retry banner (`NetworkErrorBanner`). Pull-to-refresh failures keep local jobs and show the same banner with a refresh-specific message.
- **Switching roles keeps the jobs.** Clearing the session is a logout, not a data wipe — the job world persists and the new role sees it.
- **Field naming divergence is intentional.** `todo` → `title`, `completed` → `status` (open/claimed/done). The brief explicitly says the exact field names don't matter; I kept the mapping in one function (`mapTodoToJob`) for clarity.
- **DELETE endpoint unused.** DummyJSON exposes `DELETE /todos/{id}` but no role has a "delete/cancel job" action in the brief's role table, so the verb isn't wired up. With more time I'd add a Client "Cancel open job" flow that calls `fetchDeleteJob` and removes by id from the local store (mirroring the create/claim/complete pattern).

## Demo

https://github.com/user-attachments/assets/9ab95fb3-2b79-45b8-afbe-47d78c620fc3
