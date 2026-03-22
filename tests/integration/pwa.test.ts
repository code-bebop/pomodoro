import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('PWA manifest config in vite.config.ts', () => {
  const configSource = readFileSync(
    resolve(__dirname, '../../vite.config.ts'),
    'utf-8',
  )

  it('imports VitePWA from vite-plugin-pwa', () => {
    expect(configSource).toContain('vite-plugin-pwa')
    expect(configSource).toContain('VitePWA')
  })

  it('has registerType autoUpdate', () => {
    expect(configSource).toContain('autoUpdate')
  })

  it('has manifest with name', () => {
    expect(configSource).toContain('Pomodoro Timer')
  })

  it('has manifest with short_name', () => {
    expect(configSource).toContain('short_name')
    expect(configSource).toContain('Pomodoro')
  })

  it('has display standalone', () => {
    expect(configSource).toContain('standalone')
  })

  it('has theme_color', () => {
    expect(configSource).toContain('theme_color')
    expect(configSource).toContain('#1a1a2e')
  })
})
