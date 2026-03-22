import { useState, useCallback } from 'react'

type SetValue<T> = T | ((prev: T) => T)

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: SetValue<T>) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValue = useCallback(
    (value: SetValue<T>) => {
      setStoredValue((prev) => {
        const nextValue =
          value instanceof Function ? value(prev) : value
        window.localStorage.setItem(key, JSON.stringify(nextValue))
        return nextValue
      })
    },
    [key],
  )

  return [storedValue, setValue]
}
