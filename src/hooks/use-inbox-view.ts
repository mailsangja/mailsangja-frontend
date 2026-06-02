import { useCallback, useEffect, useState } from "react"

type InboxView = "single" | "double"

const STORAGE_KEY = "inbox-view"
const DEFAULT_VIEW: InboxView = "double"

function getStoredView(): InboxView {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "single" || stored === "double") return stored
  } catch {
    // ignore
  }
  return DEFAULT_VIEW
}

export function useInboxView() {
  const [view, setView] = useState<InboxView>(getStoredView)

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "single" || e.newValue === "double")) {
        setView(e.newValue)
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const updateView = useCallback((next: InboxView) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
    setView(next)
  }, [])

  return { view, setView: updateView }
}
