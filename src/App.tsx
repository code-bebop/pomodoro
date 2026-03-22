import { useEffect, useRef, useState } from 'react'
import { Timer } from './components/Timer'
import { Controls } from './components/Controls'
import { ModeSelector } from './components/ModeSelector'
import { CycleIndicator } from './components/CycleIndicator'
import { Settings } from './components/Settings'
import { useTimer } from './hooks/useTimer'
import { useNotification } from './hooks/useNotification'
import { useLocalStorage } from './hooks/useLocalStorage'
import { TimerMode, TimerStatus } from './types'
import type { UserSettings } from './types'
import { DEFAULT_SETTINGS } from './constants'

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    'pomodoro-settings',
    DEFAULT_SETTINGS,
  )
  const timer = useTimer()
  const { requestPermission, notify } = useNotification()
  const prevStatusRef = useRef(timer.status)

  // Request notification permission on first user interaction
  useEffect(() => {
    const handler = () => {
      requestPermission()
      document.removeEventListener('click', handler)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [requestPermission])

  // Update document title with remaining time when running
  useEffect(() => {
    if (timer.status === TimerStatus.RUNNING) {
      const totalSecs = Math.ceil(timer.remainingMs / 1000)
      const mins = Math.floor(totalSecs / 60)
      const secs = totalSecs % 60
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      const modeLabel = timer.mode === TimerMode.FOCUS ? 'Focus' : 'Break'
      document.title = `${timeStr} — ${modeLabel} | Pomodoro`
    } else {
      document.title = 'Pomodoro Timer'
    }
  }, [timer.status, timer.remainingMs, timer.mode])

  // Notify on completion
  useEffect(() => {
    if (
      prevStatusRef.current === TimerStatus.RUNNING &&
      timer.status === TimerStatus.COMPLETED
    ) {
      const modeLabel =
        timer.mode === TimerMode.FOCUS
          ? 'Focus session complete! Time for a break.'
          : 'Break complete! Ready to focus?'
      notify('Pomodoro Timer', modeLabel)
    }
    prevStatusRef.current = timer.status
  }, [timer.status, timer.mode, notify])

  const suggestedMode = timer.suggestLongBreak
    ? TimerMode.LONG_BREAK
    : timer.status === TimerStatus.COMPLETED && timer.mode === TimerMode.FOCUS
      ? TimerMode.SHORT_BREAK
      : timer.mode

  function handleSaveSettings(newSettings: UserSettings) {
    setSettings(newSettings)
    setSettingsOpen(false)
  }

  return (
    <main className="app">
      <div className="app-header">
        <h1>Pomodoro</h1>
        <button
          type="button"
          className="settings-btn"
          aria-label="Open settings"
          onClick={() => setSettingsOpen(true)}
        >
          Settings
        </button>
      </div>
      <CycleIndicator completedFocusCount={timer.completedFocusCount} />
      <ModeSelector
        currentMode={timer.mode}
        suggestedMode={suggestedMode}
        status={timer.status}
        onModeSelect={timer.setMode}
      />
      <Timer remainingMs={timer.remainingMs} status={timer.status} />
      <Controls
        status={timer.status}
        onStart={timer.start}
        onPause={timer.pause}
        onResume={timer.resume}
        onCancel={timer.cancel}
      />
      {settingsOpen && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </main>
  )
}
