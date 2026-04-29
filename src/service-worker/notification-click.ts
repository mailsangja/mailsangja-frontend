/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const data = event.notification.data as { url?: string } | undefined
  const url = data?.url

  if (!url) {
    return
  }

  event.waitUntil(
    (async () => {
      const targetUrl = new URL(url, self.location.origin)
      return self.clients.openWindow(targetUrl.href)
    })()
  )
})

export {}
