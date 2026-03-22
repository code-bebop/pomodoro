import { useState } from 'react'
import type { UserSettings } from '../types'
import { DEFAULT_SETTINGS, MIN_DURATION } from '../constants'

interface SettingsProps {
  settings: UserSettings
  onSave: (settings: UserSettings) => void
  onClose: () => void
}

export function Settings({ settings, onSave, onClose }: SettingsProps) {
  const [focusDuration, setFocusDuration] = useState(settings.focusDuration)
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration)
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration)
  const [error, setError] = useState<string | null>(null)

  function handleReset() {
    setFocusDuration(DEFAULT_SETTINGS.focusDuration)
    setShortBreakDuration(DEFAULT_SETTINGS.shortBreakDuration)
    setLongBreakDuration(DEFAULT_SETTINGS.longBreakDuration)
    setError(null)
  }

  function handleSave() {
    if (
      focusDuration < MIN_DURATION ||
      shortBreakDuration < MIN_DURATION ||
      longBreakDuration < MIN_DURATION
    ) {
      setError(`All durations must be at least ${MIN_DURATION} minute.`)
      return
    }
    onSave({ focusDuration, shortBreakDuration, longBreakDuration })
  }

  return (
    <div className="settings-overlay" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="settings-panel">
        <h2>Settings</h2>

        <div className="settings-field">
          <label htmlFor="focus-duration">Focus Duration (minutes)</label>
          <input
            id="focus-duration"
            type="number"
            min={MIN_DURATION}
            value={focusDuration}
            onChange={(e) => setFocusDuration(parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="short-break-duration">Short Break Duration (minutes)</label>
          <input
            id="short-break-duration"
            type="number"
            min={MIN_DURATION}
            value={shortBreakDuration}
            onChange={(e) => setShortBreakDuration(parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <div className="settings-field">
          <label htmlFor="long-break-duration">Long Break Duration (minutes)</label>
          <input
            id="long-break-duration"
            type="number"
            min={MIN_DURATION}
            value={longBreakDuration}
            onChange={(e) => setLongBreakDuration(parseInt(e.target.value, 10) || 0)}
          />
        </div>

        {error && <p className="settings-error" role="alert">{error}</p>}

        <div className="settings-actions">
          <button type="button" onClick={handleReset}>
            Reset to Defaults
          </button>
          <button type="button" onClick={handleSave}>
            Save
          </button>
          <button type="button" onClick={onClose} aria-label="Close">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
