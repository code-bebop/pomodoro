import { CYCLE_LENGTH } from '../constants'

interface CycleIndicatorProps {
  completedFocusCount: number
}

export function CycleIndicator({ completedFocusCount }: CycleIndicatorProps) {
  return (
    <div className="cycle-indicator">
      {completedFocusCount} of {CYCLE_LENGTH}
    </div>
  )
}
