import type { UserSettings } from './types'

export const DEFAULT_FOCUS_DURATION = 25 // minutes
export const DEFAULT_SHORT_BREAK_DURATION = 5 // minutes
export const DEFAULT_LONG_BREAK_DURATION = 15 // minutes
export const CYCLE_LENGTH = 4 // focus sessions before long break
export const MIN_DURATION = 1 // minimum minutes

export const DEFAULT_SETTINGS: UserSettings = {
  focusDuration: DEFAULT_FOCUS_DURATION,
  shortBreakDuration: DEFAULT_SHORT_BREAK_DURATION,
  longBreakDuration: DEFAULT_LONG_BREAK_DURATION,
}

export const MINUTES_TO_MS = 60 * 1000
