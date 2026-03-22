import { TimerStatus } from '../types'

interface TimerProps {
  remainingMs: number
  status: TimerStatus
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function Timer({ remainingMs, status }: TimerProps) {
  return (
    <div className="timer">
      <div className="timer-display">{formatTime(remainingMs)}</div>
      {status === TimerStatus.COMPLETED && (
        <div className="timer-status">Completed!</div>
      )}
    </div>
  )
}
