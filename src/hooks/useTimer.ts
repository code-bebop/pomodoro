import { useCallback, useEffect, useRef, useState } from 'react'
import { TimerStatus, TimerMode } from '../types'
import type { TimerState, PomodorosCycle, UserSettings } from '../types'
import { useLocalStorage } from './useLocalStorage'
import {
  DEFAULT_FOCUS_DURATION,
  DEFAULT_SETTINGS,
  CYCLE_LENGTH,
  MINUTES_TO_MS,
} from '../constants'

const BROADCAST_CHANNEL_NAME = 'pomodoro-timer'

const TICK_INTERVAL = 250 // ms — frequent enough for smooth display

const defaultTimerState: TimerState = {
  status: TimerStatus.IDLE,
  mode: TimerMode.FOCUS,
  duration: DEFAULT_FOCUS_DURATION * MINUTES_TO_MS,
  endTime: null,
  remainingMs: DEFAULT_FOCUS_DURATION * MINUTES_TO_MS,
}

const defaultCycle: PomodorosCycle = {
  completedFocusCount: 0,
}

function getDurationForMode(mode: TimerMode, settings: UserSettings): number {
  switch (mode) {
    case TimerMode.SHORT_BREAK:
      return settings.shortBreakDuration * MINUTES_TO_MS
    case TimerMode.LONG_BREAK:
      return settings.longBreakDuration * MINUTES_TO_MS
    case TimerMode.FOCUS:
    default:
      return settings.focusDuration * MINUTES_TO_MS
  }
}

export function useTimer() {
  const [settings] = useLocalStorage<UserSettings>(
    'pomodoro-settings',
    DEFAULT_SETTINGS,
  )
  const [state, setState] = useLocalStorage<TimerState>(
    'pomodoro-timer-state',
    defaultTimerState,
  )
  const [cycle, setCycle] = useLocalStorage<PomodorosCycle>(
    'pomodoro-cycle',
    defaultCycle,
  )
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const [isActiveInOtherTab, setIsActiveInOtherTab] = useState(false)

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // BroadcastChannel for multi-tab coordination
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
    channelRef.current = channel

    channel.onmessage = (event: MessageEvent<{ type: string }>) => {
      if (event.data.type === 'timer-claimed') {
        setIsActiveInOtherTab(true)
      } else if (event.data.type === 'timer-released') {
        setIsActiveInOtherTab(false)
      }
    }

    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [])

  const broadcastMessage = useCallback((type: string) => {
    channelRef.current?.postMessage({ type })
  }, [])

  const tick = useCallback(() => {
    setState((prev) => {
      if (prev.status !== TimerStatus.RUNNING || prev.endTime === null) {
        return prev
      }
      const remaining = prev.endTime - Date.now()
      if (remaining <= 0) {
        return {
          ...prev,
          status: TimerStatus.COMPLETED,
          remainingMs: 0,
          endTime: null,
        }
      }
      return { ...prev, remainingMs: remaining }
    })
  }, [setState])

  // Start/restore interval when status is RUNNING
  useEffect(() => {
    if (state.status === TimerStatus.RUNNING) {
      // Restore from persisted state: recalculate if endTime is set
      if (state.endTime !== null) {
        const remaining = state.endTime - Date.now()
        if (remaining <= 0) {
          setState((prev) => ({
            ...prev,
            status: TimerStatus.COMPLETED,
            remainingMs: 0,
            endTime: null,
          }))
          return
        }
      }
      clearTick()
      intervalRef.current = setInterval(tick, TICK_INTERVAL)
    } else {
      clearTick()
    }
    return clearTick
  }, [state.status, state.endTime, tick, clearTick, setState])

  // Broadcast timer-released when timer completes
  useEffect(() => {
    if (state.status === TimerStatus.COMPLETED) {
      broadcastMessage('timer-released')
    }
  }, [state.status, broadcastMessage])

  // visibilitychange: if tab becomes visible while RUNNING, check if time has already passed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setState((prev) => {
          if (prev.status !== TimerStatus.RUNNING || prev.endTime === null) {
            return prev
          }
          if (Date.now() >= prev.endTime) {
            return {
              ...prev,
              status: TimerStatus.COMPLETED,
              remainingMs: 0,
              endTime: null,
            }
          }
          return prev
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [setState])

  // Track cycle: increment on FOCUS complete, reset on LONG_BREAK complete
  const prevStatusRef = useRef(state.status)
  const prevModeRef = useRef(state.mode)
  useEffect(() => {
    const wasRunning = prevStatusRef.current === TimerStatus.RUNNING
    const isNowCompleted = state.status === TimerStatus.COMPLETED
    if (wasRunning && isNowCompleted) {
      if (prevModeRef.current === TimerMode.FOCUS) {
        setCycle((prev) => ({
          completedFocusCount: prev.completedFocusCount + 1,
        }))
      } else if (prevModeRef.current === TimerMode.LONG_BREAK) {
        setCycle({ completedFocusCount: 0 })
      }
    }
    prevStatusRef.current = state.status
    prevModeRef.current = state.mode
  }, [state.status, state.mode, setCycle])

  // When IDLE and settings change, update displayed duration
  useEffect(() => {
    if (state.status === TimerStatus.IDLE) {
      const duration = getDurationForMode(state.mode, settings)
      setState((prev) => {
        if (prev.status !== TimerStatus.IDLE) return prev
        return { ...prev, duration, remainingMs: duration }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  const start = useCallback(() => {
    const now = Date.now()
    const duration = getDurationForMode(state.mode, settings)
    setState({
      status: TimerStatus.RUNNING,
      mode: state.mode,
      duration,
      endTime: now + duration,
      remainingMs: duration,
    })
    broadcastMessage('timer-claimed')
  }, [state.mode, settings, setState, broadcastMessage])

  const pause = useCallback(() => {
    clearTick()
    setState((prev) => {
      if (prev.status !== TimerStatus.RUNNING) return prev
      const remaining = prev.endTime !== null ? prev.endTime - Date.now() : prev.remainingMs
      return {
        ...prev,
        status: TimerStatus.PAUSED,
        remainingMs: Math.max(0, remaining),
        endTime: null,
      }
    })
  }, [clearTick, setState])

  const resume = useCallback(() => {
    setState((prev) => {
      if (prev.status !== TimerStatus.PAUSED) return prev
      const now = Date.now()
      return {
        ...prev,
        status: TimerStatus.RUNNING,
        endTime: now + prev.remainingMs,
      }
    })
  }, [setState])

  const cancel = useCallback(() => {
    clearTick()
    setState(defaultTimerState)
    broadcastMessage('timer-released')
  }, [clearTick, setState, broadcastMessage])

  const reset = useCallback(() => {
    clearTick()
    setState(defaultTimerState)
  }, [clearTick, setState])

  const setMode = useCallback(
    (mode: TimerMode) => {
      const duration = getDurationForMode(mode, settings)
      setState((prev) => ({
        ...prev,
        mode,
        duration,
        remainingMs: duration,
      }))
    },
    [settings, setState],
  )

  const suggestLongBreak = cycle.completedFocusCount >= CYCLE_LENGTH

  return {
    status: state.status,
    mode: state.mode,
    remainingMs: state.remainingMs,
    endTime: state.endTime,
    duration: state.duration,
    completedFocusCount: cycle.completedFocusCount,
    suggestLongBreak,
    isActiveInOtherTab,
    start,
    pause,
    resume,
    cancel,
    reset,
    setMode,
  }
}
