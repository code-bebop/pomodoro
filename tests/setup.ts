import '@testing-library/jest-dom/vitest'

// Node 25+ ships a built-in localStorage that lacks standard methods like .clear().
// This polyfill provides a proper Storage implementation for tests.
function createStorage(): Storage {
  let store: Record<string, string> = {}
  return {
    getItem(key: string) {
      return key in store ? store[key]! : null
    },
    setItem(key: string, value: string) {
      store[key] = String(value)
    },
    removeItem(key: string) {
      delete store[key]
    },
    clear() {
      store = {}
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null
    },
    get length() {
      return Object.keys(store).length
    },
  }
}

const storage = createStorage()

Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  writable: true,
  configurable: true,
})

Object.defineProperty(window, 'localStorage', {
  value: storage,
  writable: true,
  configurable: true,
})
