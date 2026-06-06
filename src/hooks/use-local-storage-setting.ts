import { useCallback, useEffect, useState } from "react"

function useLocalStorageSetting<T extends string>(
  key: string,
  valid: readonly T[],
  defaultValue: T
): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null && (valid as readonly string[]).includes(stored)) return stored as T
    } catch {
      // ignore
    }
    return defaultValue
  })

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key) return
      if (e.newValue !== null && (valid as readonly string[]).includes(e.newValue)) {
        setValue(e.newValue as T)
        return
      }
      setValue(defaultValue)
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [key, valid, defaultValue])

  const update = useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, next)
      } catch {
        // ignore
      }
      setValue(next)
    },
    [key]
  )

  return [value, update]
}

type InboxView = "single" | "double"
const INBOX_VIEW_VALID: readonly InboxView[] = ["single", "double"]

export function useInboxView() {
  const [view, setView] = useLocalStorageSetting("inbox-view", INBOX_VIEW_VALID, "double")
  return { view, setView }
}

type MailPreviewState = "enabled" | "disabled"
const MAIL_PREVIEW_VALID: readonly MailPreviewState[] = ["enabled", "disabled"]

export function useMailPreview() {
  const [preview, setPreview] = useLocalStorageSetting("mail-preview", MAIL_PREVIEW_VALID, "enabled")
  return { preview, setPreview }
}

type AttachmentDisplay = "inline" | "icon"
const ATTACHMENT_DISPLAY_VALID: readonly AttachmentDisplay[] = ["inline", "icon"]

export function useAttachmentDisplay() {
  const [display, setDisplay] = useLocalStorageSetting("attachment-display", ATTACHMENT_DISPLAY_VALID, "inline")
  return { display, setDisplay }
}
