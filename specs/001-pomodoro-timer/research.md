# Research: Pomodoro Timer

**Branch**: `001-pomodoro-timer` | **Date**: 2026-03-22

## Timer Accuracy in Browsers

**Decision**: Use `Date.now()` wall-clock comparison instead of relying on `setInterval` drift.

**Rationale**: `setInterval` is throttled in background tabs (browsers reduce interval to ~1000ms or more). By storing the target end time (`startTime + duration`) and comparing against `Date.now()` on each tick, the displayed time is always accurate regardless of throttling. On tab refocus, the timer self-corrects immediately.

**Alternatives considered**:
- `setInterval` only: Drifts significantly in background tabs, can be minutes off.
- Web Workers: Avoids throttling but adds complexity. Not needed since wall-clock comparison handles accuracy.
- `requestAnimationFrame`: Only fires when tab is visible — unusable for background timers.

## State Persistence

**Decision**: Use `localStorage` with JSON serialization. Store the absolute end time (not remaining seconds) so state survives page reloads accurately.

**Rationale**: No server, no IndexedDB complexity needed. localStorage is synchronous, widely supported, and sufficient for the small data footprint (~200 bytes). Storing absolute end time means on reload we can compute remaining time from `endTime - Date.now()`.

**Alternatives considered**:
- IndexedDB: Overkill for 3 small objects (timer state, cycle, settings).
- sessionStorage: Does not persist across tab close — fails FR-006.
- Cookies: Size limits, sent with every request (irrelevant for static hosting but unnecessary).

## PWA Service Worker

**Decision**: Use `vite-plugin-pwa` with Workbox `generateSW` strategy (precache all static assets).

**Rationale**: The app is fully static — all assets can be precached at install time. Workbox's `generateSW` auto-generates the service worker from the Vite build output, requiring zero manual SW code. The plugin also generates the `manifest.json` from vite config.

**Alternatives considered**:
- Manual service worker: Full control but requires maintaining cache versioning manually. Unnecessary for a static app.
- `injectManifest`: Useful when custom SW logic is needed (e.g., background sync). Not required here.

## Notifications

**Decision**: Use the Web Notifications API (`Notification.requestPermission()` + `new Notification()`). Fall back to in-app visual + audio alert if permission denied.

**Rationale**: The Notifications API is well-supported in modern browsers and works when the tab is in the background. For timer completion audio, use the HTML5 `Audio` API with a short MP3 file.

**Alternatives considered**:
- Push API (server-sent): Requires a backend push server. Violates the no-server constraint.
- Vibration API: Only works on Android, not reliable. Could be added later as enhancement.

## Multi-Tab Handling

**Decision**: Use the `BroadcastChannel` API to coordinate between tabs. The first tab owns the timer; subsequent tabs show a "timer active in another tab" message.

**Rationale**: Simple, no-dependency solution. `BroadcastChannel` is supported in all modern browsers. Alternatively, `localStorage` events (`storage` event) could work but are more limited.

**Alternatives considered**:
- SharedWorker: More complex setup, limited Safari support.
- `storage` event listener: Works but only fires in *other* tabs (not the one that wrote), making coordination awkward.
- Web Locks API: Good for mutex but doesn't help with state sync.

## Background Timer Behavior (Device Sleep)

**Decision**: Store the absolute end time. On wake/refocus, compare `Date.now()` against stored end time. If past, immediately trigger completion. If not, resume countdown with correct remaining time.

**Rationale**: Browsers cannot guarantee code execution during device sleep. The only reliable approach is to check wall-clock time on any wake event and react accordingly. The Notification API's `setTimeout` equivalent doesn't survive sleep, but the `visibilitychange` event fires on wake.

**Alternatives considered**:
- Service Worker timers: `setTimeout` in SW is also throttled/killed during sleep.
- Wake Lock API: Prevents sleep but drains battery — hostile to users.
