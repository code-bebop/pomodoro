import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useNotification } from '../../src/hooks/useNotification'

type MockNotificationConstructor = {
  permission: NotificationPermission
  requestPermission: () => Promise<NotificationPermission>
  new (title: string, options?: NotificationOptions): Notification
}

describe('useNotification', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('requests permission on call', async () => {
    const requestPermission = vi.fn().mockResolvedValue('granted')
    Object.defineProperty(window, 'Notification', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })
    ;(window.Notification as unknown as { requestPermission: typeof requestPermission }).requestPermission = requestPermission
    ;(window.Notification as unknown as { permission: string }).permission = 'default'

    const { result } = renderHook(() => useNotification())

    await act(async () => {
      await result.current.requestPermission()
    })

    expect(requestPermission).toHaveBeenCalled()
  })

  it('shows notification when permission is granted', () => {
    const MockNotification = vi.fn() as unknown as MockNotificationConstructor
    MockNotification.permission = 'granted'
    MockNotification.requestPermission = vi.fn().mockResolvedValue('granted')
    Object.defineProperty(window, 'Notification', {
      value: MockNotification,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.notify('Timer Complete', 'Focus session done!')
    })

    expect(vi.mocked(window.Notification as unknown as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith('Timer Complete', {
      body: 'Focus session done!',
    })
  })

  it('does not throw when permission is denied', () => {
    const MockNotification = vi.fn() as unknown as MockNotificationConstructor
    MockNotification.permission = 'denied'
    MockNotification.requestPermission = vi.fn().mockResolvedValue('denied')
    Object.defineProperty(window, 'Notification', {
      value: MockNotification,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useNotification())

    expect(() => {
      act(() => {
        result.current.notify('Timer Complete', 'Focus session done!')
      })
    }).not.toThrow()

    expect(vi.mocked(window.Notification as unknown as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
  })

  it('plays audio on notify', () => {
    const playMock = vi.fn().mockResolvedValue(undefined)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).Audio = function () {
      return { play: playMock }
    }

    const MockNotification = vi.fn() as unknown as MockNotificationConstructor
    MockNotification.permission = 'granted'
    MockNotification.requestPermission = vi.fn().mockResolvedValue('granted')
    Object.defineProperty(window, 'Notification', {
      value: MockNotification,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useNotification())

    act(() => {
      result.current.notify('Done', 'Session complete')
    })

    expect(playMock).toHaveBeenCalled()
  })
})
