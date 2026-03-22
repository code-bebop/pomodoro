import { useCallback } from 'react'

export function useNotification() {
  const requestPermission = useCallback(async () => {
    if (typeof window.Notification !== 'undefined') {
      await window.Notification.requestPermission()
    }
  }, [])

  const notify = useCallback((title: string, body: string) => {
    // Play audio regardless of notification permission
    try {
      const audio = new Audio('/pomodoro/notification.mp3')
      audio.play().catch(() => {
        // Audio may fail if user hasn't interacted with page
      })
    } catch {
      // Audio API not available
    }

    // Show system notification if permission granted
    if (
      typeof window.Notification !== 'undefined' &&
      window.Notification.permission === 'granted'
    ) {
      new window.Notification(title, { body })
    }
  }, [])

  return { requestPermission, notify }
}
