# PROMPTS.md

A record of the AI prompts I used while building this project, tidied for review. In all of these I wrote or edited the surrounding code by hand; the prompts are just the parts I offloaded to the model.

## 1. Kicking the tyres on the domain model

Before writing any code, I had a back-and-forth to pressure-test my read of the brief.

**Prompt:**

> I want to sanity-check my domain model before I start building. Two roles — Client posts jobs, Pro claims and completes — jobs move open → claimed → done, backed by DummyJSON's todos API. Key open questions I have: (1) how do I represent "the current user" and `claimed`/`assigned` on top of a todo that only has `{id, todo, completed, userId}`? (2) does DummyJSON persist POST/PUT for a later GET? (3) should the two roles see different _data_ or the same world filtered by role? Push back on anything that sounds hand-wavy.

**What I took from it:** confirmed DummyJSON's writes don't persist (a later GET drops your change), which forced the "seed once then hold the world in a local store" decision. Also talked myself out of a per-role data silo — same jobs, different _views_.

## 2. Sketching the state machine

**Prompt:**

> Sketch the Job state machine as TypeScript. States: open, claimed, done. Transitions: create -> open, claim (by a Pro) -> claimed, complete (by the assigned Pro) -> done. I want illegal transitions to not compile, and a runtime guard for the ones that can't be caught at the type level (claim a done job, complete a job you didn't claim). Show me a single module with the types, the transition functions, and the filtering helpers I'll need on the client/pro home screens (jobsByCreator, openJobs, claimedJobsForPro, doneJobsForPro).

I then refactored this file a fair bit by hand — added `JobTransitionError`, `nextJobId`, and tightened the `claimJob`/`completeJob` guards after writing the unit tests.

## 3. Zustand stores + persistence

**Prompt:**

> Two Zustand stores, both persisted to AsyncStorage. `useAuthStore`: session `{role, userId} | null`, signIn, signOut. `useJobsStore`: `jobs: Job[]`, `hasSeeded: boolean`, setSeedJobs, resetData, createClientJob, claimOpenJob, completeClaimedJob. Each mutating action must (a) require the right role via the auth store's current session and throw otherwise, (b) update the local store synchronously, (c) best-effort fire the DummyJSON POST/PUT. Use the persist middleware's onRehydrateStorage to flip a `hydrated` flag. Don't over-engineer the role check — a small `requireSession` helper is fine.

I dropped `resetData` later and added `resyncJobs` / `retrySeed` / `seedError` instead. Mutators take an explicit `session` from the caller rather than reading the auth store internally.

## 4. Seeding + the fallback question

**Prompt:**

> Write `fetchSeedJobs` for DummyJSON. Hit `/todos?limit=0`, map each todo to my Job shape with `mapTodoToJob` (todo -> title, completed -> done/open, userId -> creatorId). Append a few bundled client fixtures so the Client persona has at least one open + one done job on first launch. If the network call fails or returns non-ok, fall back entirely to fixtures — I don't want the app to block on the network. Wrap the fetch with an AbortSignal.

I later surfaced the fallback with a `NetworkErrorBanner` (retry on first seed, refresh-specific message on pull-to-refresh) instead of leaving it silent.

## 5. Login + role persistence + startup redirect

**Prompt:**

> Login screen as a role picker — "Continue as Client" / "Continue as Pro", no real credentials. On pick, set session and `router.replace` to the role's home. Root index should Redirect to either `/login` or the saved role's home _after_ both stores have hydrated, so we never flash the wrong screen. Build a `useAppStartup` hook that owns this gate and also kicks off the seed fetch once storage is hydrated, and doesn't report `hydrated: true` until `hasSeeded` settles.

## 6. Role-gated home screens

**Prompt:**

> Two homes in separate Expo Router route groups, `(client)` and `(pro)`, each with their own Stack. Client home: list of jobs filtered to `jobsByCreator(session.userId)`, a "+ New" header action, a "Log out" text action, empty state for "you haven't posted any jobs yet". Pro home: a SegmentedControl with three segments — Available (openJobs), Mine (claimedJobsForPro), Done (doneJobsForPro) — each with its own empty message, plus the same Log out. Both reuse a shared `JobList` + `JobCard` + `StatusBadge`.

I wrote the SegmentedControl component itself by hand — the model's first draft was a `ScrollView`-with-margins hack; I replaced it with a flex layout that properly underlines the active segment.

## 7. Shared job detail with role-driven action bar

**Prompt:**

> A `JobDetail` component that takes a `Job` and an optional `actionBar?: ReactNode`. Renders title + status badge, description (or "No description provided"), a divider, then meta rows: Status, Posted by (creator name), Assigned Pro (or "Not yet assigned"), Posted (relative time), plus Claimed and Completed if present. The Pro job screen passes an action bar with a Claim button (only when status === open) and a Mark as Done button (only when status === claimed AND assigneeId === session.userId). Complete action should throw an Alert confirmation. Use `assigneeName`/`creatorName` from the personas module — don't show raw userIds.

Display names ended up in `shared/constants/personaNames.ts`; the personas module just owns the demo sessions.

## 8. Create-job form + async action shell

**Prompt:**

> A `useAsyncAction` hook for the create-job, claim, and complete mutations: `run(action, {ok, fail, onSuccess})` — sets loading true, awaits the action, shows a success toast on resolve (then calls onSuccess), shows an error toast on reject, resets loading. Pair it with a small toast store + a Toast component mounted at the root. Create job screen should validate a non-empty title _before_ calling the store (the store will also throw, but I want in-form error text), with an InputField for title (autofocus, error row) and description (multiline), then a Button with `isLoading`.

## 9. Tests — what to bother with

**Prompt:**

> I've got ~4 hours total for this take-home. What's the right testing scope? I'm thinking: unit tests for the state machine (claim/done transitions, the role guards), and store tests for `useJobsStore` playing back create → claim → complete with the auth store's session set. Skip exhaustive UI snapshot tests — just light render tests for the components that branch on props (StatusBadge, JobCard, SegmentedControl, Button, InputField). Confirm or push back.

Took the "confirm" side. Ended up with 66 tests across 11 suites covering: `jobUtils`, `useJobsStore`, `useAuthStore`, `useAppStartup`, `useAsyncAction`, `JobDetail`, and the prop-branching components. No snapshots.

## 10. README — libraries + more-time + assumptions

**Prompt:**

> I built it with Expo Router v56, Zustand + AsyncStorage + persist, jest-expo + @testing-library/react-native. No UI kit — plain StyleSheet + a small theme module.

I then edited it down so it didn't oversell anything.

---

That's the whole list. Nothing automated — each prompt had a follow-up of "now run typecheck / tests / format" and my own pass over the output.
