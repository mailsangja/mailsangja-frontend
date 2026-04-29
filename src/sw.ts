/// <reference lib="webworker" />

// Firebase Messaging can attach its own click behavior, so register ours before importing it.
import "@/service-worker/notification-click"

import { initializeApp } from "firebase/app"
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching"

import { toNewMailPushData } from "@/types/fcm"

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { revision: string | null; url: string }>
}

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

const messaging = getMessaging(firebaseApp)

onBackgroundMessage(messaging, (payload) => {
  if (payload.notification) {
    return
  }

  const data = toNewMailPushData(payload.data)
  const { title, alias, body, image, threadDetailUrl: url } = data
  const notificationTitle = `[${alias}] ${title}`

  const options: NotificationOptions = {
    body,
    icon: image ?? "/android-chrome-192x192.png",
    badge: "/favicon-32x32.png",
    data: {
      url,
    },
  }

  void self.registration.showNotification(notificationTitle, options)
})
