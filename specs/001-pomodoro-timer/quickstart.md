# Quickstart: Pomodoro Timer

**Branch**: `001-pomodoro-timer` | **Date**: 2026-03-22

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
# Clone and checkout feature branch
git clone <repo-url>
cd pomodoro
git checkout 001-pomodoro-timer

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Scripts

| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Start Vite dev server with HMR           |
| `npm run build`   | Production build to `dist/`              |
| `npm run preview` | Preview production build locally         |
| `npm run test`    | Run all tests with Vitest                |
| `npm run test:ui` | Run tests with Vitest UI                 |
| `npm run lint`    | Run ESLint                               |

## Development Workflow (TDD)

1. Write a failing test in `tests/`
2. Verify the test fails (`npm run test`)
3. Write the minimum implementation in `src/`
4. Verify the test passes
5. Refactor if needed (tests must still pass)
6. Commit

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. This is a static build ready for GitHub Pages.

## Deploying to GitHub Pages

The app deploys as a static site to GitHub Pages. Configure the GitHub repository:

1. Go to Settings → Pages
2. Set source to GitHub Actions (or `gh-pages` branch)
3. Push to `main` to trigger deployment

## Verifying PWA

After production build:
1. Run `npm run preview`
2. Open Chrome DevTools → Application → Service Workers
3. Verify service worker is registered
4. Go to Application → Manifest and verify install prompt is available
5. Toggle offline in Network tab and confirm app still works
