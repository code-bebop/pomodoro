import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CycleIndicator } from '../../src/components/CycleIndicator'

describe('CycleIndicator', () => {
  it('renders "N of 4" text', () => {
    render(<CycleIndicator completedFocusCount={2} />)
    expect(screen.getByText(/2 of 4/i)).toBeInTheDocument()
  })

  it('shows 0 of 4 initially', () => {
    render(<CycleIndicator completedFocusCount={0} />)
    expect(screen.getByText(/0 of 4/i)).toBeInTheDocument()
  })

  it('shows correct count when all 4 are completed', () => {
    render(<CycleIndicator completedFocusCount={4} />)
    expect(screen.getByText(/4 of 4/i)).toBeInTheDocument()
  })
})
