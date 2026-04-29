import { registerSW } from "virtual:pwa-register"

const SERVICE_WORKER_READY_TIMEOUT_MS = 10_000

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null

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
    let rejectRegistration: (reason?: unknown) => void = () => {}

    const registrationFailed = new Promise<never>((_, reject) => {
      rejectRegistration = reject
    })

    registerSW({
      immediate: true,
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
