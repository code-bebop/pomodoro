import { TimerMode, TimerStatus } from '../types'

interface ModeSelectorProps {
  currentMode: TimerMode
  suggestedMode: TimerMode
  status: TimerStatus
  onModeSelect: (mode: TimerMode) => void
}

const MODES: { mode: TimerMode; label: string }[] = [
  { mode: TimerMode.FOCUS, label: 'Focus' },
  { mode: TimerMode.SHORT_BREAK, label: 'Short Break' },
  { mode: TimerMode.LONG_BREAK, label: 'Long Break' },
]

export function ModeSelector({
  currentMode,
  suggestedMode,
  status,
  onModeSelect,
}: ModeSelectorProps) {
  const isDisabled = status === TimerStatus.RUNNING || status === TimerStatus.PAUSED

  return (
    <div className="mode-selector">
      {MODES.map(({ mode, label }) => (
        <button
          key={mode}
          onClick={() => onModeSelect(mode)}
          disabled={isDisabled}
          data-suggested={mode === suggestedMode ? 'true' : 'false'}
          data-active={mode === currentMode ? 'true' : 'false'}
          className={[
            'mode-btn',
            mode === currentMode ? 'mode-btn--active' : '',
            mode === suggestedMode ? 'mode-btn--suggested' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
