# Implementation Plan: Pomodoro Timer

**Branch**: `001-pomodoro-timer` | **Date**: 2026-03-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pomodoro-timer/spec.md`

## Summary

Build a Pomodoro Timer as a Progressive Web App with React + TypeScript. The app provides a countdown timer with three modes (focus/short break/long break), configurable durations, pause/resume/cancel controls, cycle tracking, offline support, and push notifications on completion. All timers require manual start. No backend — all state persisted in localStorage.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: React 19+, Vite 6+, vite-plugin-pwa (Workbox)
**Storage**: localStorage (timer state, user settings, cycle progress)
**Testing**: Vitest + React Testing Library + jsdom
**Target Platform**: Modern browsers (Chrome, Safari, Firefox, Edge — last 2 versions), mobile and desktop
**Project Type**: web-app (SPA, client-only PWA)
**Performance Goals**: Interactive within 3 seconds on 3G; timer accuracy within 1 second
**Constraints**: Offline-capable after first load; no server dependencies; GitHub Pages static hosting
**Scale/Scope**: Single-user, single-page app with settings overlay; ~5 components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TDD (NON-NEGOTIABLE) | ✅ PASS | Vitest + RTL configured; all tasks will follow Red-Green-Refactor |
| II. Minimal UI | ✅ PASS | Single page with timer display, control buttons, cycle indicator, and settings overlay. No decorative elements. |
| III. PWA-First | ✅ PASS | vite-plugin-pwa for service worker + manifest; Notification API for alerts |
| IV. Simplicity (YAGNI) | ✅ PASS | No backend, no database, no auth, no analytics. localStorage only. Flat component structure. |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-pomodoro-timer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Timer.tsx            # Countdown display
│   ├── Controls.tsx         # Start/Pause/Resume/Cancel buttons
│   ├── CycleIndicator.tsx   # "2 of 4" progress display
│   ├── ModeSelector.tsx     # Focus/Short Break/Long Break selection
│   └── Settings.tsx         # Duration configuration overlay
├── hooks/
│   ├── useTimer.ts          # Core timer logic (countdown, state machine)
│   ├── useNotification.ts   # Notification API wrapper
│   └── useLocalStorage.ts   # Typed localStorage persistence
├── types/
│   └── index.ts             # Shared types (TimerState, TimerMode, Settings)
├── constants.ts             # Default durations, cycle length
├── App.tsx                  # Root component
├── main.tsx                 # Entry point
└── index.css                # Minimal global styles

tests/
├── hooks/
│   ├── useTimer.test.ts
│   ├── useNotification.test.ts
│   └── useLocalStorage.test.ts
├── components/
│   ├── Timer.test.tsx
│   ├── Controls.test.tsx
│   ├── CycleIndicator.test.tsx
│   ├── ModeSelector.test.tsx
│   └── Settings.test.tsx
└── integration/
    └── pomodoro-flow.test.tsx

public/
├── manifest.json            # PWA manifest
└── notification.mp3         # Audio cue for timer completion
```

**Structure Decision**: Single project (Option 1 adapted for React SPA). No backend needed — pure client-side app. Hooks encapsulate logic; components are presentation-only. Tests mirror source structure.

## Complexity Tracking

> No violations. Table intentionally empty.
