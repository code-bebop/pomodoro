export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export interface TimerState {
  status: TimerStatus
  mode: TimerMode
  duration: number // total duration in milliseconds
  endTime: number | null // absolute end timestamp, null if idle/paused
  remainingMs: number // remaining time in milliseconds
}

export interface PomodorosCycle {
  completedFocusCount: number // 0-4, resets after long break
}

export interface UserSettings {
  focusDuration: number // minutes, min: 1
  shortBreakDuration: number // minutes, min: 1
  longBreakDuration: number // minutes, min: 1
}
