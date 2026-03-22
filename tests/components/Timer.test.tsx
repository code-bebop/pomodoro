import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Timer } from '../../src/components/Timer'
import { TimerStatus } from '../../src/types'

describe('Timer', () => {
  it('renders time in mm:ss format', () => {
    render(
      <Timer remainingMs={25 * 60 * 1000} status={TimerStatus.IDLE} />,
    )
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('renders correct time for partial minutes', () => {
    render(
      <Timer remainingMs={5 * 60 * 1000 + 30 * 1000} status={TimerStatus.RUNNING} />,
    )
    expect(screen.getByText('05:30')).toBeInTheDocument()
  })

  it('renders 00:00 when remaining is 0', () => {
    render(
      <Timer remainingMs={0} status={TimerStatus.COMPLETED} />,
    )
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('shows completed state', () => {
    render(
      <Timer remainingMs={0} status={TimerStatus.COMPLETED} />,
    )
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })

  it('does not show completed text when running', () => {
    render(
      <Timer remainingMs={10 * 60 * 1000} status={TimerStatus.RUNNING} />,
    )
    expect(screen.queryByText(/completed/i)).not.toBeInTheDocument()
  })
})
