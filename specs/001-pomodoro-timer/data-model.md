# Data Model: Pomodoro Timer

**Branch**: `001-pomodoro-timer` | **Date**: 2026-03-22

## Entities

### TimerMode (enum)

```
FOCUS | SHORT_BREAK | LONG_BREAK
```

### TimerStatus (enum)

```
IDLE | RUNNING | PAUSED | COMPLETED
```

### TimerState

| Field        | Type         | Description                                        |
|--------------|--------------|----------------------------------------------------|
| status       | TimerStatus  | Current timer status                               |
| mode         | TimerMode    | Current timer mode                                 |
| duration     | number       | Total duration in milliseconds                     |
| endTime      | number/null  | Absolute end timestamp (ms since epoch). Null if idle/paused. |
| remainingMs  | number       | Remaining time in milliseconds. Updated on pause.  |

**State transitions**:

```
IDLE → RUNNING (user taps Start)
RUNNING → PAUSED (user taps Pause)
RUNNING → COMPLETED (countdown reaches 0)
PAUSED → RUNNING (user taps Resume)
PAUSED → IDLE (user taps Cancel)
RUNNING → IDLE (user taps Cancel)
COMPLETED → IDLE (user selects next mode or cancels)
```

**Persistence**: Serialized to `localStorage` key `pomodoro-timer-state`. On reload:
- If RUNNING: recalculate `remainingMs` from `endTime - Date.now()`. If ≤ 0, transition to COMPLETED.
- If PAUSED: restore `remainingMs` as-is.
- If IDLE or COMPLETED: restore as-is.

### PomodorosCycle

| Field              | Type   | Description                                          |
|--------------------|--------|------------------------------------------------------|
| completedFocusCount | number | Number of focus sessions completed in current cycle (0-4) |

**Rules**:
- Increments by 1 when a FOCUS timer transitions to COMPLETED.
- Resets to 0 after a long break is completed.
- Does NOT reset on short break completion.
- Does NOT reset on cancel.

**Persistence**: Serialized to `localStorage` key `pomodoro-cycle`.

### UserSettings

| Field             | Type   | Default | Constraints         |
|-------------------|--------|---------|---------------------|
| focusDuration     | number | 25      | Minutes, min: 1     |
| shortBreakDuration | number | 5       | Minutes, min: 1     |
| longBreakDuration | number | 15      | Minutes, min: 1     |

**Validation**:
- All durations MUST be integers ≥ 1 minute.
- Invalid input is rejected; previous valid value is retained.

**Persistence**: Serialized to `localStorage` key `pomodoro-settings`.

## localStorage Keys Summary

| Key                  | Value Type     | Purpose                    |
|----------------------|----------------|----------------------------|
| `pomodoro-timer-state` | TimerState JSON | Active timer state         |
| `pomodoro-cycle`     | PomodorosCycle JSON | Cycle progress           |
| `pomodoro-settings`  | UserSettings JSON | User-configured durations |
