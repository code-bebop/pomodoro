# Tasks: Pomodoro Timer

**Input**: Design documents from `/specs/001-pomodoro-timer/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: TDD is NON-NEGOTIABLE per constitution. All tests MUST be written and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, shared types, and tooling configuration

- [x] T001 Initialize React + TypeScript project with Vite in repository root (`npm create vite@latest . -- --template react-ts`)
- [x] T002 Install dependencies: vitest, @testing-library/react, @testing-library/jest-dom, jsdom, vite-plugin-pwa
- [x] T003 Configure Vitest in vite.config.ts (jsdom environment, test globals, coverage)
- [x] T004 [P] Define shared types (TimerMode, TimerStatus, TimerState, PomodorosCycle, UserSettings) in src/types/index.ts
- [x] T005 [P] Define default constants (DEFAULT_FOCUS_DURATION, DEFAULT_SHORT_BREAK, DEFAULT_LONG_BREAK, CYCLE_LENGTH) in src/constants.ts
- [x] T006 [P] Create minimal global styles in src/index.css
- [x] T007 Configure GitHub Pages base path in vite.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundation

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T008 Write tests for useLocalStorage hook in tests/hooks/useLocalStorage.test.ts (get, set, default values, JSON serialization, invalid JSON fallback)

### Implementation for Foundation

- [x] T009 Implement useLocalStorage hook in src/hooks/useLocalStorage.ts (typed get/set with JSON serialization, default value support)

**Checkpoint**: Foundation ready — useLocalStorage tested and working. User story implementation can begin.

---

## Phase 3: User Story 1 — Start and Complete a Focus Session (Priority: P1) 🎯 MVP

**Goal**: User can start a 25-minute focus timer, see the countdown, and receive a notification when it completes.

**Independent Test**: Open app → tap Start → countdown displays and decrements → at 00:00 notification fires and timer stops.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T010 [US1] Write tests for useTimer hook (FOCUS mode only) in tests/hooks/useTimer.test.ts: start sets status to RUNNING and computes endTime; tick updates remainingMs; reaching 0 transitions to COMPLETED; stores absolute endTime for wall-clock accuracy
- [x] T011 [P] [US1] Write tests for useNotification hook in tests/hooks/useNotification.test.ts: requestPermission, showNotification when granted, fallback when denied, audio playback on complete
- [x] T012 [P] [US1] Write tests for Timer component in tests/components/Timer.test.tsx: renders mm:ss format, updates display on remainingMs change, shows "completed" state
- [x] T013 [P] [US1] Write tests for Controls component (start only) in tests/components/Controls.test.tsx: renders Start button when IDLE, calls onStart when tapped, hides Start when RUNNING

### Implementation for User Story 1

- [x] T014 [US1] Implement useTimer hook (FOCUS mode, start/complete) in src/hooks/useTimer.ts: state machine (IDLE→RUNNING→COMPLETED), setInterval with Date.now() wall-clock comparison, persist state via useLocalStorage, restore on mount
- [x] T015 [US1] Implement useNotification hook in src/hooks/useNotification.ts: requestPermission, showNotification with title/body, Audio playback, graceful fallback if denied
- [x] T016 [P] [US1] Implement Timer component in src/components/Timer.tsx: display remaining time as mm:ss, visual state indicator (running/completed)
- [x] T017 [P] [US1] Implement Controls component (Start button) in src/components/Controls.tsx: Start button visible when IDLE, triggers onStart callback
- [x] T018 [US1] Wire App component with useTimer, Timer, Controls, and useNotification in src/App.tsx: render timer and controls, trigger notification on COMPLETED, request notification permission on first interaction

**Checkpoint**: User Story 1 fully functional — focus timer starts, counts down, completes with notification.

---

## Phase 4: User Story 2 — Take Breaks Between Sessions (Priority: P2)

**Goal**: After a focus session, user can start short (5 min) or long (15 min) breaks. App tracks cycle progress and suggests long break after 4 focus sessions.

**Independent Test**: Complete a focus session → choose Short Break → break timer counts down → after 4 focus sessions, app suggests Long Break.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T019 [US2] Write tests for useTimer hook (break modes + cycle) in tests/hooks/useTimer.test.ts: start SHORT_BREAK and LONG_BREAK modes with correct durations; completedFocusCount increments on FOCUS complete; cycle resets after LONG_BREAK complete; suggestLongBreak returns true when count reaches 4
- [x] T020 [P] [US2] Write tests for ModeSelector component in tests/components/ModeSelector.test.tsx: renders mode buttons (Focus/Short Break/Long Break), highlights suggested mode, calls onModeSelect, disables selection while timer RUNNING
- [x] T021 [P] [US2] Write tests for CycleIndicator component in tests/components/CycleIndicator.test.tsx: renders "N of 4" text, updates on focus complete, resets visual after long break

### Implementation for User Story 2

- [x] T022 [US2] Extend useTimer hook with break modes and cycle tracking in src/hooks/useTimer.ts: support SHORT_BREAK/LONG_BREAK modes, track completedFocusCount in PomodorosCycle (persisted via useLocalStorage), reset cycle after long break, expose suggestLongBreak flag
- [x] T023 [P] [US2] Implement ModeSelector component in src/components/ModeSelector.tsx: three mode buttons, visual highlight for suggested mode, disabled state during active timer
- [x] T024 [P] [US2] Implement CycleIndicator component in src/components/CycleIndicator.tsx: display "N of 4 focus sessions" progress
- [x] T025 [US2] Integrate ModeSelector and CycleIndicator into App in src/App.tsx: show mode selection after timer completes, display cycle progress, pass suggestLongBreak to ModeSelector

**Checkpoint**: User Stories 1 AND 2 work — full focus-break cycle with correct long break suggestion.

---

## Phase 5: User Story 3 — Pause and Cancel Timers (Priority: P3)

**Goal**: User can pause a running timer, resume it later, or cancel it entirely.

**Independent Test**: Start timer → Pause → time freezes → Resume → countdown continues → Cancel → resets to IDLE.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T026 [US3] Write tests for useTimer hook (pause/resume/cancel) in tests/hooks/useTimer.test.ts: pause stores remainingMs and clears endTime; resume computes new endTime from remainingMs; cancel resets to IDLE; paused state persists across reload
- [x] T027 [US3] Write tests for Controls component (pause/resume/cancel) in tests/components/Controls.test.tsx: shows Pause when RUNNING, shows Resume+Cancel when PAUSED, Cancel visible when RUNNING or PAUSED, all buttons trigger correct callbacks

### Implementation for User Story 3

- [x] T028 [US3] Extend useTimer hook with pause/resume/cancel in src/hooks/useTimer.ts: RUNNING→PAUSED (store remainingMs, clear interval), PAUSED→RUNNING (recompute endTime), PAUSED/RUNNING→IDLE (reset state), persist paused state
- [x] T029 [US3] Extend Controls component with Pause/Resume/Cancel buttons in src/components/Controls.tsx: conditionally render buttons based on timer status, wire callbacks
- [x] T030 [US3] Update App component to pass pause/resume/cancel handlers in src/App.tsx

**Checkpoint**: All timer controls work — start, pause, resume, cancel with state persistence.

---

## Phase 6: User Story 4 — Offline and PWA Install (Priority: P4)

**Goal**: App works offline after first load and is installable as a standalone PWA.

**Independent Test**: Load app → go offline → all timer features work. Install via browser → opens without browser chrome.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T031 [US4] Write test to verify PWA manifest fields in tests/integration/pwa.test.ts: name, short_name, start_url, display: standalone, icons, theme_color

### Implementation for User Story 4

- [x] T032 [US4] Configure vite-plugin-pwa in vite.config.ts: registerType autoUpdate, generateSW strategy, manifest with name/icons/theme_color/display standalone
- [x] T033 [P] [US4] Add PWA icons (192x192, 512x512) to public/ directory
- [x] T034 [P] [US4] Add notification audio file (short completion chime) to public/notification.mp3
- [x] T035 [US4] Register service worker in src/main.tsx and handle update prompt

**Checkpoint**: App installable as PWA, works fully offline.

---

## Phase 7: User Story 5 — Customize Timer Durations (Priority: P5)

**Goal**: User can change focus, short break, and long break durations via a settings screen.

**Independent Test**: Open settings → change focus to 30 min → start timer → countdown starts from 30:00.

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T036 [US5] Write tests for Settings component in tests/components/Settings.test.tsx: renders inputs with current values, updates on change, validates min 1 minute, rejects invalid input, reset to defaults button, persists via useLocalStorage
- [x] T037 [US5] Write tests for useTimer reading custom durations in tests/hooks/useTimer.test.ts: starting a FOCUS timer uses focusDuration from settings, starting SHORT_BREAK uses shortBreakDuration from settings

### Implementation for User Story 5

- [x] T038 [US5] Implement Settings component in src/components/Settings.tsx: overlay with duration inputs (focus/short/long), validation (min 1 minute, integers only), reset to defaults button, close on save
- [x] T039 [US5] Integrate Settings with useLocalStorage for persistence in src/App.tsx: load UserSettings on mount, pass to useTimer for duration lookup, settings button to toggle overlay
- [x] T040 [US5] Update useTimer to read durations from UserSettings in src/hooks/useTimer.ts: use settings.focusDuration / shortBreakDuration / longBreakDuration instead of hardcoded constants when starting a timer

**Checkpoint**: All five user stories work — customizable durations applied immediately.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, multi-tab handling, integration tests, and deployment readiness

- [x] T041 Write integration test for full pomodoro flow in tests/integration/pomodoro-flow.test.tsx: start focus → complete → choose break → complete break → cycle increments → after 4 focus sessions long break suggested
- [x] T042 Implement multi-tab coordination via BroadcastChannel in src/hooks/useTimer.ts: claim ownership on start, release on complete/cancel, show "active in another tab" message in secondary tabs
- [x] T043 Handle visibilitychange event for device sleep recovery in src/hooks/useTimer.ts: on wake, compare Date.now() vs endTime, trigger completion if past
- [x] T044 [P] Add document title update showing remaining time (e.g., "15:30 — Focus") in src/App.tsx
- [x] T045 [P] Verify responsive layout on mobile viewports in src/index.css
- [x] T046 Run quickstart.md validation: verify npm install, npm run dev, npm run build, npm run test all pass cleanly
- [x] T047 Configure GitHub Actions workflow for CI (test + build) and GitHub Pages deployment in .github/workflows/deploy.yml

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types and constants must exist) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — No dependencies on other stories
- **US2 (Phase 4)**: Depends on Phase 3 (extends useTimer, integrates into App)
- **US3 (Phase 5)**: Depends on Phase 3 (extends useTimer and Controls)
- **US4 (Phase 6)**: Depends on Phase 1 only (PWA config is independent of timer logic)
- **US5 (Phase 7)**: Depends on Phase 3 (needs useTimer to read settings)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundation only — standalone MVP
- **US2 (P2)**: Requires US1 (extends useTimer with break modes, adds cycle to App)
- **US3 (P3)**: Requires US1 (extends useTimer with pause/cancel, extends Controls)
- **US4 (P4)**: Independent of US1-3 (PWA config is build-level). Can run in parallel with US2/US3.
- **US5 (P5)**: Requires US1 (useTimer must exist to integrate settings)

### Within Each User Story (TDD Flow)

1. Write tests FIRST — verify they FAIL
2. Implement hooks (logic layer)
3. Implement components (UI layer)
4. Integrate in App.tsx
5. Verify all tests PASS
6. Commit

### Parallel Opportunities

- T004, T005, T006 can run in parallel (Setup phase — different files)
- T011, T012, T013 can run in parallel (US1 tests — different test files)
- T016, T017 can run in parallel (US1 components — different files)
- T020, T021 can run in parallel (US2 tests — different test files)
- T023, T024 can run in parallel (US2 components — different files)
- T033, T034 can run in parallel (US4 assets — different files)
- T044, T045 can run in parallel (Polish — different files)
- US4 (Phase 6) can run in parallel with US2 (Phase 4) and US3 (Phase 5)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (useLocalStorage)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Focus timer starts, counts down, completes with notification
5. Deploy to GitHub Pages if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Focus timer works → Deploy (MVP!)
3. US2 → Break modes + cycle tracking → Deploy
4. US3 → Pause/resume/cancel → Deploy
5. US4 → PWA installable + offline → Deploy
6. US5 → Custom durations → Deploy
7. Polish → Multi-tab, edge cases, CI → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- TDD is NON-NEGOTIABLE: every implementation task has a preceding test task
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
