import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Controls } from '../../src/components/Controls'
import { TimerStatus } from '../../src/types'

describe('Controls', () => {
  it('renders Start button when IDLE', () => {
    render(
      <Controls
        status={TimerStatus.IDLE}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
  })

  it('calls onStart when Start is clicked', async () => {
    const onStart = vi.fn()
    render(
      <Controls
        status={TimerStatus.IDLE}
        onStart={onStart}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /start/i }))
    expect(onStart).toHaveBeenCalledOnce()
  })

  it('does not show Start button when RUNNING', () => {
    render(
      <Controls
        status={TimerStatus.RUNNING}
        onStart={vi.fn()}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(
      screen.queryByRole('button', { name: /start/i }),
    ).not.toBeInTheDocument()
  })

  describe('RUNNING state', () => {
    it('shows Pause button when RUNNING', () => {
      render(
        <Controls
          status={TimerStatus.RUNNING}
          onStart={vi.fn()}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
    })

    it('shows Cancel button when RUNNING', () => {
      render(
        <Controls
          status={TimerStatus.RUNNING}
          onStart={vi.fn()}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('calls onPause when Pause is clicked', async () => {
      const onPause = vi.fn()
      render(
        <Controls
          status={TimerStatus.RUNNING}
          onStart={vi.fn()}
          onPause={onPause}
          onResume={vi.fn()}
          onCancel={vi.fn()}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /pause/i }))
      expect(onPause).toHaveBeenCalledOnce()
    })

    it('calls onCancel when Cancel is clicked while RUNNING', async () => {
      const onCancel = vi.fn()
      render(
        <Controls
          status={TimerStatus.RUNNING}
          onStart={vi.fn()}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={onCancel}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(onCancel).toHaveBeenCalledOnce()
    })
  })

  describe('PAUSED state', () => {
    it('shows Resume button when PAUSED', () => {
      render(
        <Controls
          status={TimerStatus.PAUSED}
          onStart={vi.fn()}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument()
    })

    it('shows Cancel button when PAUSED', () => {
      render(
        <Controls
          status={TimerStatus.PAUSED}
          onStart={vi.fn()}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={vi.fn()}
        />,
      )
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('does not show Start or Pause buttons when PAUSED', () => {
      render(
        <Controls
          status={TimerStatus.PAUSED}
          onStart={vi.fn()}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={vi.fn()}
        />,
      )
      expect(screen.queryByRole('button', { name: /start/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument()
    })

    it('calls onResume when Resume is clicked', async () => {
      const onResume = vi.fn()
      render(
        <Controls
          status={TimerStatus.PAUSED}
          onStart={vi.fn()}
          onPause={vi.fn()}
          onResume={onResume}
          onCancel={vi.fn()}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /resume/i }))
      expect(onResume).toHaveBeenCalledOnce()
    })

    it('calls onCancel when Cancel is clicked while PAUSED', async () => {
      const onCancel = vi.fn()
      render(
        <Controls
          status={TimerStatus.PAUSED}
          onStart={vi.fn()}
          onPause={vi.fn()}
          onResume={vi.fn()}
          onCancel={onCancel}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
      expect(onCancel).toHaveBeenCalledOnce()
    })
  })
})
