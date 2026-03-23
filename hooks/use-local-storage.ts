'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Store initialValue in a ref so it never causes re-renders
  // (avoids infinite loops when initialValue is an array/object literal like [])
  const initialValueRef = useRef(initialValue)

  // Read stored value - only depends on key, not on initialValue reference
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValueRef.current
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValueRef.current
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValueRef.current
    }
  }, [key])

  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate on mount - only runs once since readValue only depends on key
  useEffect(() => {
    setStoredValue(readValue())
    setIsHydrated(true)
  }, [readValue])

  // Set value - uses functional updater to avoid depending on storedValue,
  // keeping the callback reference stable across renders
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
          // Dispatch event for other tabs/windows
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
          }))
        }

        return valueToStore
      })
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue, isHydrated] as const
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
