import { TimerStatus } from '../types'

interface ControlsProps {
  status: TimerStatus
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onCancel: () => void
}

export function Controls({ status, onStart, onPause, onResume, onCancel }: ControlsProps) {
  return (
    <div className="controls">
      {status === TimerStatus.IDLE && (
        <button onClick={onStart}>Start</button>
      )}
      {status === TimerStatus.RUNNING && (
        <button onClick={onPause}>Pause</button>
      )}
      {status === TimerStatus.PAUSED && (
        <>
          <button onClick={onResume}>Resume</button>
          <button onClick={onCancel}>Cancel</button>
        </>
      )}
      {status === TimerStatus.RUNNING && (
        <button onClick={onCancel}>Cancel</button>
      )}
    </div>
  )
}
