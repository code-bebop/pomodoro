import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useTimer } from '../../src/hooks/useTimer'
import { TimerStatus, TimerMode } from '../../src/types'
import {
  DEFAULT_FOCUS_DURATION,
  DEFAULT_SHORT_BREAK_DURATION,
  DEFAULT_LONG_BREAK_DURATION,
  CYCLE_LENGTH,
  MINUTES_TO_MS,
} from '../../src/constants'

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts in IDLE status with FOCUS mode', () => {
      const { result } = renderHook(() => useTimer())
      expect(result.current.status).toBe(TimerStatus.IDLE)
      expect(result.current.mode).toBe(TimerMode.FOCUS)
    })

    it('has remaining time equal to default focus duration', () => {
      const { result } = renderHook(() => useTimer())
      expect(result.current.remainingMs).toBe(
        DEFAULT_FOCUS_DURATION * MINUTES_TO_MS,
      )
    })
  })

  describe('start', () => {
    it('transitions to RUNNING and computes endTime', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.start()
      })

      expect(result.current.status).toBe(TimerStatus.RUNNING)
      expect(result.current.endTime).toBe(
        now + DEFAULT_FOCUS_DURATION * MINUTES_TO_MS,
      )
    })
  })

  describe('tick', () => {
    it('updates remainingMs based on wall clock', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.start()
      })

      // Advance 5 seconds — setSystemTime moves the clock,
      // advanceTimersByTime triggers the interval callbacks
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // remainingMs should reflect ~5 seconds elapsed.
      // Allow small variance from tick interval granularity.
      const expected = DEFAULT_FOCUS_DURATION * MINUTES_TO_MS - 5000
      expect(result.current.remainingMs).toBeGreaterThanOrEqual(expected - 500)
      expect(result.current.remainingMs).toBeLessThanOrEqual(expected + 500)
    })
  })

  describe('completion', () => {
    it('transitions to COMPLETED when countdown reaches 0', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.start()
      })

      // Advance past the full duration
      act(() => {
        vi.setSystemTime(now + DEFAULT_FOCUS_DURATION * MINUTES_TO_MS + 100)
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.status).toBe(TimerStatus.COMPLETED)
      expect(result.current.remainingMs).toBe(0)
    })
  })

  describe('persistence', () => {
    it('stores timer state in localStorage', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.start()
      })

      const stored = JSON.parse(
        window.localStorage.getItem('pomodoro-timer-state')!,
      )
      expect(stored.status).toBe(TimerStatus.RUNNING)
      expect(stored.endTime).toBe(
        now + DEFAULT_FOCUS_DURATION * MINUTES_TO_MS,
      )
    })
  })

  describe('break modes', () => {
    it('starts SHORT_BREAK with correct duration', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.setMode(TimerMode.SHORT_BREAK)
      })
      act(() => {
        result.current.start()
      })

      expect(result.current.mode).toBe(TimerMode.SHORT_BREAK)
      expect(result.current.endTime).toBe(
        now + DEFAULT_SHORT_BREAK_DURATION * MINUTES_TO_MS,
      )
    })

    it('starts LONG_BREAK with correct duration', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.setMode(TimerMode.LONG_BREAK)
      })
      act(() => {
        result.current.start()
      })

      expect(result.current.mode).toBe(TimerMode.LONG_BREAK)
      expect(result.current.endTime).toBe(
        now + DEFAULT_LONG_BREAK_DURATION * MINUTES_TO_MS,
      )
    })
  })

  describe('pause', () => {
    it('transitions RUNNING to PAUSED', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })
      act(() => { result.current.pause() })

      expect(result.current.status).toBe(TimerStatus.PAUSED)
    })

    it('stores remainingMs computed from endTime', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })

      // Advance 5 seconds, then pause
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      act(() => { result.current.pause() })

      const expectedRemaining = DEFAULT_FOCUS_DURATION * MINUTES_TO_MS - 5000
      expect(result.current.remainingMs).toBeGreaterThanOrEqual(expectedRemaining - 500)
      expect(result.current.remainingMs).toBeLessThanOrEqual(expectedRemaining + 500)
    })

    it('clears endTime when paused', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })
      act(() => { result.current.pause() })

      expect(result.current.endTime).toBeNull()
    })

    it('does nothing when already PAUSED', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })
      act(() => { result.current.pause() })
      const remainingAfterFirstPause = result.current.remainingMs

      act(() => { result.current.pause() })
      expect(result.current.status).toBe(TimerStatus.PAUSED)
      expect(result.current.remainingMs).toBe(remainingAfterFirstPause)
    })
  })

  describe('resume', () => {
    it('transitions PAUSED to RUNNING', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })
      act(() => { result.current.pause() })
      act(() => { result.current.resume() })

      expect(result.current.status).toBe(TimerStatus.RUNNING)
    })

    it('computes new endTime from Date.now() + remainingMs', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })

      // Advance 5 seconds using only advanceTimersByTime (moves both timer and clock)
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      act(() => { result.current.pause() })

      const pausedRemaining = result.current.remainingMs
      // After advanceTimersByTime(5000), Date.now() is now+5000; set a new resumeTime
      const resumeTime = now + 8000
      vi.setSystemTime(resumeTime)

      act(() => { result.current.resume() })

      const expectedEndTime = resumeTime + pausedRemaining
      expect(result.current.endTime).toBeGreaterThanOrEqual(expectedEndTime - 500)
      expect(result.current.endTime).toBeLessThanOrEqual(expectedEndTime + 500)
    })

    it('does nothing when not PAUSED', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.resume() })

      expect(result.current.status).toBe(TimerStatus.IDLE)
    })
  })

  describe('cancel', () => {
    it('resets to IDLE from RUNNING', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })
      act(() => { result.current.cancel() })

      expect(result.current.status).toBe(TimerStatus.IDLE)
    })

    it('resets to IDLE from PAUSED', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })
      act(() => { result.current.pause() })
      act(() => { result.current.cancel() })

      expect(result.current.status).toBe(TimerStatus.IDLE)
    })

    it('resets remainingMs to default focus duration', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })
      act(() => {
        vi.setSystemTime(now + 5000)
        vi.advanceTimersByTime(5000)
      })
      act(() => { result.current.cancel() })

      expect(result.current.remainingMs).toBe(DEFAULT_FOCUS_DURATION * MINUTES_TO_MS)
    })

    it('clears endTime on cancel', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })
      act(() => { result.current.cancel() })

      expect(result.current.endTime).toBeNull()
    })
  })

  describe('paused state persistence', () => {
    it('persists PAUSED status and remainingMs to localStorage', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => { result.current.start() })
      act(() => {
        vi.setSystemTime(now + 5000)
        vi.advanceTimersByTime(5000)
      })
      act(() => { result.current.pause() })

      const stored = JSON.parse(window.localStorage.getItem('pomodoro-timer-state')!)
      expect(stored.status).toBe(TimerStatus.PAUSED)
      expect(stored.endTime).toBeNull()
      expect(stored.remainingMs).toBeGreaterThan(0)
      expect(stored.remainingMs).toBeLessThan(DEFAULT_FOCUS_DURATION * MINUTES_TO_MS)
    })

    it('restores PAUSED state from localStorage on mount', () => {
      const pausedRemaining = DEFAULT_FOCUS_DURATION * MINUTES_TO_MS - 30000
      window.localStorage.setItem(
        'pomodoro-timer-state',
        JSON.stringify({
          status: TimerStatus.PAUSED,
          mode: TimerMode.FOCUS,
          duration: DEFAULT_FOCUS_DURATION * MINUTES_TO_MS,
          endTime: null,
          remainingMs: pausedRemaining,
        }),
      )

      const { result } = renderHook(() => useTimer())

      expect(result.current.status).toBe(TimerStatus.PAUSED)
      expect(result.current.remainingMs).toBe(pausedRemaining)
      expect(result.current.endTime).toBeNull()
    })
  })

  describe('custom durations from settings', () => {
    it('starting a FOCUS timer uses focusDuration from settings stored in localStorage', () => {
      const customSettings = {
        focusDuration: 45,
        shortBreakDuration: 10,
        longBreakDuration: 20,
      }
      window.localStorage.setItem('pomodoro-settings', JSON.stringify(customSettings))

      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.start()
      })

      expect(result.current.endTime).toBe(now + 45 * MINUTES_TO_MS)
    })

    it('starting a SHORT_BREAK uses shortBreakDuration from settings stored in localStorage', () => {
      const customSettings = {
        focusDuration: 25,
        shortBreakDuration: 10,
        longBreakDuration: 20,
      }
      window.localStorage.setItem('pomodoro-settings', JSON.stringify(customSettings))

      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.setMode(TimerMode.SHORT_BREAK)
      })
      act(() => {
        result.current.start()
      })

      expect(result.current.endTime).toBe(now + 10 * MINUTES_TO_MS)
    })
  })

  describe('cycle tracking', () => {
    it('starts with completedFocusCount of 0', () => {
      const { result } = renderHook(() => useTimer())
      expect(result.current.completedFocusCount).toBe(0)
    })

    it('increments completedFocusCount when FOCUS timer completes', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.start()
      })
      act(() => {
        vi.setSystemTime(now + DEFAULT_FOCUS_DURATION * MINUTES_TO_MS + 100)
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.status).toBe(TimerStatus.COMPLETED)
      expect(result.current.completedFocusCount).toBe(1)
    })

    it('does not increment completedFocusCount when SHORT_BREAK completes', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      act(() => {
        result.current.setMode(TimerMode.SHORT_BREAK)
      })
      act(() => {
        result.current.start()
      })
      act(() => {
        vi.setSystemTime(now + DEFAULT_SHORT_BREAK_DURATION * MINUTES_TO_MS + 100)
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.status).toBe(TimerStatus.COMPLETED)
      expect(result.current.completedFocusCount).toBe(0)
    })

    it('resets completedFocusCount to 0 after LONG_BREAK completes', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      const { result } = renderHook(() => useTimer())

      // Simulate 4 completed focus sessions via localStorage
      window.localStorage.setItem('pomodoro-cycle', JSON.stringify({ completedFocusCount: 4 }))

      act(() => {
        result.current.setMode(TimerMode.LONG_BREAK)
      })
      act(() => {
        result.current.start()
      })
      act(() => {
        vi.setSystemTime(now + DEFAULT_LONG_BREAK_DURATION * MINUTES_TO_MS + 100)
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.status).toBe(TimerStatus.COMPLETED)
      expect(result.current.completedFocusCount).toBe(0)
    })

    it('suggestLongBreak returns true when completedFocusCount reaches CYCLE_LENGTH', () => {
      window.localStorage.setItem(
        'pomodoro-cycle',
        JSON.stringify({ completedFocusCount: CYCLE_LENGTH }),
      )
      const { result } = renderHook(() => useTimer())
      expect(result.current.suggestLongBreak).toBe(true)
    })

    it('suggestLongBreak returns false when completedFocusCount is below CYCLE_LENGTH', () => {
      window.localStorage.setItem(
        'pomodoro-cycle',
        JSON.stringify({ completedFocusCount: CYCLE_LENGTH - 1 }),
      )
      const { result } = renderHook(() => useTimer())
      expect(result.current.suggestLongBreak).toBe(false)
    })
  })
})
