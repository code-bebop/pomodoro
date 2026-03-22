import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTimer } from '../../src/hooks/useTimer'
import { TimerStatus, TimerMode } from '../../src/types'
import {
  DEFAULT_FOCUS_DURATION,
  DEFAULT_SHORT_BREAK_DURATION,
  MINUTES_TO_MS,
} from '../../src/constants'

describe('Full Pomodoro Flow Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('full flow: start focus → complete → select short break → complete break → verify cycle increments', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    const { result } = renderHook(() => useTimer())

    // Initial state: IDLE, FOCUS mode
    expect(result.current.status).toBe(TimerStatus.IDLE)
    expect(result.current.mode).toBe(TimerMode.FOCUS)
    expect(result.current.completedFocusCount).toBe(0)

    // Step 1: Start focus session
    act(() => {
      result.current.start()
    })
    expect(result.current.status).toBe(TimerStatus.RUNNING)
    expect(result.current.mode).toBe(TimerMode.FOCUS)

    // Step 2: Advance past focus duration — session completes
    act(() => {
      vi.setSystemTime(now + DEFAULT_FOCUS_DURATION * MINUTES_TO_MS + 100)
      vi.advanceTimersByTime(DEFAULT_FOCUS_DURATION * MINUTES_TO_MS + 1000)
    })
    expect(result.current.status).toBe(TimerStatus.COMPLETED)
    expect(result.current.remainingMs).toBe(0)

    // Step 3: Cycle should have incremented (focus completed)
    expect(result.current.completedFocusCount).toBe(1)

    // Step 4: Select short break mode
    act(() => {
      result.current.setMode(TimerMode.SHORT_BREAK)
    })
    expect(result.current.mode).toBe(TimerMode.SHORT_BREAK)

    // Step 5: Start the short break
    const breakStart = now + DEFAULT_FOCUS_DURATION * MINUTES_TO_MS + 2000
    vi.setSystemTime(breakStart)
    act(() => {
      result.current.start()
    })
    expect(result.current.status).toBe(TimerStatus.RUNNING)
    expect(result.current.mode).toBe(TimerMode.SHORT_BREAK)

    // Step 6: Advance past short break duration — break completes
    act(() => {
      vi.setSystemTime(breakStart + DEFAULT_SHORT_BREAK_DURATION * MINUTES_TO_MS + 100)
      vi.advanceTimersByTime(DEFAULT_SHORT_BREAK_DURATION * MINUTES_TO_MS + 1000)
    })
    expect(result.current.status).toBe(TimerStatus.COMPLETED)
    expect(result.current.remainingMs).toBe(0)

    // Step 7: Focus count should remain 1 (short break doesn't change it)
    expect(result.current.completedFocusCount).toBe(1)
  })

  it('cycle count persists in localStorage across sessions', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    const { result } = renderHook(() => useTimer())

    act(() => {
      result.current.start()
    })
    act(() => {
      vi.setSystemTime(now + DEFAULT_FOCUS_DURATION * MINUTES_TO_MS + 100)
      vi.advanceTimersByTime(DEFAULT_FOCUS_DURATION * MINUTES_TO_MS + 1000)
    })

    expect(result.current.completedFocusCount).toBe(1)

    const stored = JSON.parse(window.localStorage.getItem('pomodoro-cycle')!)
    expect(stored.completedFocusCount).toBe(1)
  })

  it('cancel during running focus session resets to IDLE', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    const { result } = renderHook(() => useTimer())

    act(() => {
      result.current.start()
    })
    expect(result.current.status).toBe(TimerStatus.RUNNING)

    act(() => {
      result.current.cancel()
    })
    expect(result.current.status).toBe(TimerStatus.IDLE)
    expect(result.current.mode).toBe(TimerMode.FOCUS)
    expect(result.current.completedFocusCount).toBe(0)
  })

  it('pause and resume preserves remaining time correctly', () => {
    const now = Date.now()
    vi.setSystemTime(now)

    const { result } = renderHook(() => useTimer())

    act(() => {
      result.current.start()
    })

    // Run for 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    act(() => {
      result.current.pause()
    })
    expect(result.current.status).toBe(TimerStatus.PAUSED)

    const remainingAfterPause = result.current.remainingMs
    const expectedRemaining = DEFAULT_FOCUS_DURATION * MINUTES_TO_MS - 5000
    expect(remainingAfterPause).toBeGreaterThanOrEqual(expectedRemaining - 500)
    expect(remainingAfterPause).toBeLessThanOrEqual(expectedRemaining + 500)

    // Resume — remaining should be preserved
    const resumeTime = now + 10000
    vi.setSystemTime(resumeTime)
    act(() => {
      result.current.resume()
    })
    expect(result.current.status).toBe(TimerStatus.RUNNING)
    expect(result.current.endTime).toBeCloseTo(resumeTime + remainingAfterPause, -2)
  })
})
