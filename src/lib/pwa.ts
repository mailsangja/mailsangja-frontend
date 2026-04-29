import { registerSW } from "virtual:pwa-register"

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null

export function registerPwaServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return Promise.resolve(null)
  }

  registrationPromise ??= (async () => {
    registerSW({ immediate: true })

    return navigator.serviceWorker.ready
  })()

  return registrationPromise
}

export async function getPwaServiceWorkerRegistration() {
  const registration = await registerPwaServiceWorker()

  if (!registration) {
    throw new Error("Service worker is not supported.")
  }

  return registration
}
