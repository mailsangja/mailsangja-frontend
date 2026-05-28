import { registerSW } from "virtual:pwa-register"

const SERVICE_WORKER_READY_TIMEOUT_MS = 10_000
const PWA_DEFERRED_UPDATE_STORAGE_KEY = "pwa:deferred-update"

interface PwaUpdateSnapshot {
  isApplyingUpdate: boolean
  isUpdateAvailable: boolean
}

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null
let updateServiceWorker: (() => Promise<void>) | null = null
let pwaUpdateSnapshot: PwaUpdateSnapshot = {
  isApplyingUpdate: false,
  isUpdateAvailable: false,
}
const pwaUpdateListeners = new Set<() => void>()

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timeoutId: ReturnType<typeof window.setTimeout>

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => {
    window.clearTimeout(timeoutId)
  })
}

export function registerPwaServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return Promise.resolve(null)
  }

  registrationPromise ??= (async () => {
    const shouldApplyDeferredUpdateOnLoad = hasDeferredPwaUpdate()
    let rejectRegistration: (reason?: unknown) => void = () => {}

    const registrationFailed = new Promise<never>((_, reject) => {
      rejectRegistration = reject
    })

    updateServiceWorker = registerSW({
      immediate: true,
      onNeedRefresh() {
        if (shouldApplyDeferredUpdateOnLoad) {
          void applyPwaUpdate().catch(() => {})
          return
        }

        setDeferredPwaUpdate(true)
        setPwaUpdateSnapshot({ isUpdateAvailable: true })
      },
      onRegisteredSW(_swUrl, registration) {
        if (shouldApplyDeferredUpdateOnLoad && registration?.waiting) {
          void applyPwaUpdate().catch(() => {})
          return
        }

        void registration
          ?.update()
          .then(() => {
            if (shouldApplyDeferredUpdateOnLoad && !registration.waiting && !registration.installing) {
              setDeferredPwaUpdate(false)
            }
          })
          .catch(() => {})
      },
      onRegisterError(error) {
        rejectRegistration(error)
      },
    })

    return withTimeout(
      Promise.race([navigator.serviceWorker.ready, registrationFailed]),
      SERVICE_WORKER_READY_TIMEOUT_MS,
      "Service worker did not become ready."
    )
  })().catch((error) => {
    registrationPromise = null
    throw error
  })

  return registrationPromise
}

export async function getPwaServiceWorkerRegistration() {
  const registration = await registerPwaServiceWorker()

  if (!registration) {
    throw new Error("Service worker is not supported.")
  }

  return registration
}

export function subscribeToPwaUpdate(listener: () => void) {
  pwaUpdateListeners.add(listener)

  return () => {
    pwaUpdateListeners.delete(listener)
  }
}

export function getPwaUpdateSnapshot(): PwaUpdateSnapshot {
  return pwaUpdateSnapshot
}

export function getPwaUpdateServerSnapshot(): PwaUpdateSnapshot {
  return {
    isApplyingUpdate: false,
    isUpdateAvailable: false,
  }
}

export async function applyPwaUpdate() {
  if (pwaUpdateSnapshot.isApplyingUpdate) {
    return
  }

  setPwaUpdateSnapshot({ isApplyingUpdate: true })
  setDeferredPwaUpdate(false)

  try {
    if (!updateServiceWorker) {
      throw new Error("PWA update service worker is not initialized.")
    }

    await updateServiceWorker()
  } catch (error) {
    setDeferredPwaUpdate(true)
    setPwaUpdateSnapshot({ isUpdateAvailable: true })
    throw error
  } finally {
    setPwaUpdateSnapshot({ isApplyingUpdate: false })
  }
}

function hasDeferredPwaUpdate() {
  return window.localStorage.getItem(PWA_DEFERRED_UPDATE_STORAGE_KEY) === "1"
}

function setDeferredPwaUpdate(isDeferred: boolean) {
  if (isDeferred) {
    window.localStorage.setItem(PWA_DEFERRED_UPDATE_STORAGE_KEY, "1")
    return
  }

  window.localStorage.removeItem(PWA_DEFERRED_UPDATE_STORAGE_KEY)
}

function setPwaUpdateSnapshot(nextSnapshot: Partial<PwaUpdateSnapshot>) {
  const nextPwaUpdateSnapshot = {
    isApplyingUpdate: nextSnapshot.isApplyingUpdate ?? pwaUpdateSnapshot.isApplyingUpdate,
    isUpdateAvailable: nextSnapshot.isUpdateAvailable ?? pwaUpdateSnapshot.isUpdateAvailable,
  }

  if (
    nextPwaUpdateSnapshot.isApplyingUpdate === pwaUpdateSnapshot.isApplyingUpdate &&
    nextPwaUpdateSnapshot.isUpdateAvailable === pwaUpdateSnapshot.isUpdateAvailable
  ) {
    return
  }

  pwaUpdateSnapshot = nextPwaUpdateSnapshot

  pwaUpdateListeners.forEach((listener) => {
    listener()
  })
}
