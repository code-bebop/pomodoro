import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useLocalStorage } from '../../src/hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns the default value when key does not exist', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', { count: 0 }),
    )
    expect(result.current[0]).toEqual({ count: 0 })
  })

  it('returns stored value when key exists', () => {
    window.localStorage.setItem('test-key', JSON.stringify({ count: 5 }))
    const { result } = renderHook(() =>
      useLocalStorage('test-key', { count: 0 }),
    )
    expect(result.current[0]).toEqual({ count: 5 })
  })

  it('updates localStorage when setValue is called', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', { count: 0 }),
    )

    act(() => {
      result.current[1]({ count: 10 })
    })

    expect(result.current[0]).toEqual({ count: 10 })
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toEqual({
      count: 10,
    })
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0))

    act(() => {
      result.current[1]((prev) => prev + 1)
    })

    expect(result.current[0]).toBe(1)
  })

  it('returns default value when stored JSON is invalid', () => {
    window.localStorage.setItem('test-key', 'not-valid-json')
    const { result } = renderHook(() =>
      useLocalStorage('test-key', { count: 0 }),
    )
    expect(result.current[0]).toEqual({ count: 0 })
  })

  it('handles string values', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', 'default'),
    )

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(window.localStorage.getItem('test-key')!)).toBe('updated')
  })
})
