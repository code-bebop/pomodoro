import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Settings } from '../../src/components/Settings'
import { DEFAULT_SETTINGS } from '../../src/constants'
import type { UserSettings } from '../../src/types'

describe('Settings', () => {
  const defaultProps = {
    settings: DEFAULT_SETTINGS,
    onSave: vi.fn(),
    onClose: vi.fn(),
  }

  it('renders three number inputs with current duration values', () => {
    render(<Settings {...defaultProps} />)

    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(3)

    // Focus, Short Break, Long Break
    expect(screen.getByLabelText(/focus/i)).toHaveValue(DEFAULT_SETTINGS.focusDuration)
    expect(screen.getByLabelText(/short break/i)).toHaveValue(DEFAULT_SETTINGS.shortBreakDuration)
    expect(screen.getByLabelText(/long break/i)).toHaveValue(DEFAULT_SETTINGS.longBreakDuration)
  })

  it('updates focus duration value on change', async () => {
    render(<Settings {...defaultProps} />)

    const focusInput = screen.getByLabelText(/focus/i)
    await userEvent.clear(focusInput)
    await userEvent.type(focusInput, '30')

    expect(focusInput).toHaveValue(30)
  })

  it('updates short break duration value on change', async () => {
    render(<Settings {...defaultProps} />)

    const shortBreakInput = screen.getByLabelText(/short break/i)
    await userEvent.clear(shortBreakInput)
    await userEvent.type(shortBreakInput, '10')

    expect(shortBreakInput).toHaveValue(10)
  })

  it('updates long break duration value on change', async () => {
    render(<Settings {...defaultProps} />)

    const longBreakInput = screen.getByLabelText(/long break/i)
    await userEvent.clear(longBreakInput)
    await userEvent.type(longBreakInput, '20')

    expect(longBreakInput).toHaveValue(20)
  })

  it('validates minimum 1 minute — rejects 0', async () => {
    const onSave = vi.fn()
    render(<Settings {...defaultProps} onSave={onSave} />)

    const focusInput = screen.getByLabelText(/focus/i)
    await userEvent.clear(focusInput)
    await userEvent.type(focusInput, '0')

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).not.toHaveBeenCalled()
  })

  it('validates minimum 1 minute — rejects negative values', async () => {
    const onSave = vi.fn()
    render(<Settings {...defaultProps} onSave={onSave} />)

    const focusInput = screen.getByLabelText(/focus/i)
    // Use fireEvent to directly set a negative value bypassing browser input constraints
    fireEvent.change(focusInput, { target: { value: '-5' } })

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).not.toHaveBeenCalled()
  })

  it('has a Reset to Defaults button that restores 25/5/15', async () => {
    render(<Settings {...defaultProps} />)

    const focusInput = screen.getByLabelText(/focus/i)
    await userEvent.clear(focusInput)
    await userEvent.type(focusInput, '50')

    await userEvent.click(screen.getByRole('button', { name: /reset/i }))

    expect(screen.getByLabelText(/focus/i)).toHaveValue(25)
    expect(screen.getByLabelText(/short break/i)).toHaveValue(5)
    expect(screen.getByLabelText(/long break/i)).toHaveValue(15)
  })

  it('calls onSave with updated settings when Save is clicked', async () => {
    const onSave = vi.fn()
    render(<Settings {...defaultProps} onSave={onSave} />)

    const focusInput = screen.getByLabelText(/focus/i)
    await userEvent.clear(focusInput)
    await userEvent.type(focusInput, '30')

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    const expectedSettings: UserSettings = {
      focusDuration: 30,
      shortBreakDuration: DEFAULT_SETTINGS.shortBreakDuration,
      longBreakDuration: DEFAULT_SETTINGS.longBreakDuration,
    }
    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave).toHaveBeenCalledWith(expectedSettings)
  })

  it('has a close/cancel button that calls onClose', async () => {
    const onClose = vi.fn()
    render(<Settings {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByRole('button', { name: /close|cancel/i })
    await userEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledOnce()
  })
})
