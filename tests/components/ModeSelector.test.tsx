import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ModeSelector } from '../../src/components/ModeSelector'
import { TimerMode, TimerStatus } from '../../src/types'

describe('ModeSelector', () => {
  it('renders three mode buttons', () => {
    render(
      <ModeSelector
        currentMode={TimerMode.FOCUS}
        suggestedMode={TimerMode.FOCUS}
        status={TimerStatus.IDLE}
        onModeSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /focus/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /short break/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /long break/i })).toBeInTheDocument()
  })

  it('highlights the suggested mode button', () => {
    render(
      <ModeSelector
        currentMode={TimerMode.FOCUS}
        suggestedMode={TimerMode.SHORT_BREAK}
        status={TimerStatus.IDLE}
        onModeSelect={vi.fn()}
      />,
    )
    const shortBreakBtn = screen.getByRole('button', { name: /short break/i })
    expect(shortBreakBtn).toHaveAttribute('data-suggested', 'true')
  })

  it('calls onModeSelect with the correct mode when a button is clicked', async () => {
    const onModeSelect = vi.fn()
    render(
      <ModeSelector
        currentMode={TimerMode.FOCUS}
        suggestedMode={TimerMode.FOCUS}
        status={TimerStatus.IDLE}
        onModeSelect={onModeSelect}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /short break/i }))
    expect(onModeSelect).toHaveBeenCalledWith(TimerMode.SHORT_BREAK)
  })

  it('disables all buttons when timer is RUNNING', () => {
    render(
      <ModeSelector
        currentMode={TimerMode.FOCUS}
        suggestedMode={TimerMode.FOCUS}
        status={TimerStatus.RUNNING}
        onModeSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /focus/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /short break/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /long break/i })).toBeDisabled()
  })

  it('enables buttons when timer is IDLE', () => {
    render(
      <ModeSelector
        currentMode={TimerMode.FOCUS}
        suggestedMode={TimerMode.FOCUS}
        status={TimerStatus.IDLE}
        onModeSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /focus/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /short break/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /long break/i })).not.toBeDisabled()
  })

  it('enables buttons when timer is COMPLETED', () => {
    render(
      <ModeSelector
        currentMode={TimerMode.FOCUS}
        suggestedMode={TimerMode.SHORT_BREAK}
        status={TimerStatus.COMPLETED}
        onModeSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /focus/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /short break/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /long break/i })).not.toBeDisabled()
  })
})
