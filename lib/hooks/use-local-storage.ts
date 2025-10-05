"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))

      // Dispatch custom event for cross-tab sync
      window.dispatchEvent(new CustomEvent("local-storage", { detail: { key, value: valueToStore } }))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ("key" in e && e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue))
      } else if ("detail" in e && e.detail.key === key) {
        setStoredValue(e.detail.value)
      }
    }

    window.addEventListener("storage", handleStorageChange as EventListener)
    window.addEventListener("local-storage", handleStorageChange as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorageChange as EventListener)
      window.removeEventListener("local-storage", handleStorageChange as EventListener)
    }
  }, [key])

  return [storedValue, setValue, isLoading] as const
}
