<!--
  Sync Impact Report
  Version change: N/A → 1.0.0 (initial ratification)
  Added sections: Core Principles (4), Technology Stack, Development Workflow, Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ compatible (Constitution Check section exists)
    - .specify/templates/spec-template.md ✅ compatible (TDD aligns with test-first scenarios)
    - .specify/templates/tasks-template.md ✅ compatible (test-first workflow matches TDD principle)
  Follow-up TODOs: None
-->

# Pomodoro Timer Constitution

## Core Principles

### I. Test-Driven Development (NON-NEGOTIABLE)

All feature code MUST be written following the TDD cycle:
- Tests MUST be written before implementation code
- Tests MUST fail before implementation begins (Red)
- Implementation MUST satisfy failing tests (Green)
- Code MUST be refactored only after tests pass (Refactor)
- No production code without a corresponding test

### II. Minimal UI

The user interface MUST prioritize simplicity and clarity:
- Every UI element MUST serve a clear, immediate purpose
- No decorative elements that do not aid usability
- Prefer fewer screens and interactions over feature-rich complexity
- Whitespace and typography MUST do the heavy lifting over colors and icons

### III. PWA-First

The application MUST function as a Progressive Web App:
- MUST work offline after initial load (service worker required)
- MUST be installable on mobile and desktop
- Timer MUST continue running when the app is in the background
- Notifications MUST alert users when a timer session completes

### IV. Simplicity (YAGNI)

- Start with the simplest implementation that works
- Do NOT add features, abstractions, or infrastructure "just in case"
- Every addition MUST be justified by a current, concrete need
- Prefer deleting code over adding compatibility layers

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Framework**: React 19+
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Deployment**: GitHub Pages (static build)
- **Package Manager**: npm

## Development Workflow

- TDD cycle MUST be followed for every feature
- Each feature MUST be independently testable and deliverable
- Commits MUST be atomic — one logical change per commit
- All tests MUST pass before merging to main

## Governance

This constitution defines the non-negotiable principles for the
Pomodoro Timer project. All implementation decisions, code reviews,
and architectural choices MUST comply with these principles.

- Amendments require explicit discussion and documentation
- Version follows semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR: principle removal or redefinition
- MINOR: new principle or material expansion
- PATCH: clarification or wording fix

**Version**: 1.0.0 | **Ratified**: 2026-03-22 | **Last Amended**: 2026-03-22
