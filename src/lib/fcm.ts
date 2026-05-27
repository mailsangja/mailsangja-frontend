import { deleteToken, getToken, onMessage, type MessagePayload, type Unsubscribe } from "firebase/messaging"

import { getFirebaseMessaging } from "@/lib/firebase"
import { getPwaServiceWorkerRegistration } from "@/lib/pwa"
import { m } from "@/paraglide/messages"

const FCM_TOKEN_STORAGE_KEY_PREFIX = "mailsangja:fcm-token"
export const FCM_TOKEN_CHANGED_EVENT = "mailsangja:fcm-token-changed"

export type PushNotificationErrorCode = "unsupported" | "missing-config" | "permission-denied" | "token-unavailable"

export class PushNotificationError extends Error {
  code: PushNotificationErrorCode

  constructor(code: PushNotificationErrorCode, message: string) {
    super(message)
    this.name = "PushNotificationError"
    this.code = code
  }
}

function isBrowserPushSupported() {
  return "serviceWorker" in navigator && "Notification" in window && "PushManager" in window
}

export function getPushNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isBrowserPushSupported()) {
    return "unsupported"
  }

  return Notification.permission
}

export async function getFcmToken() {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new PushNotificationError("unsupported", m.push_error_unsupported())
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

  if (!vapidKey) {
    throw new PushNotificationError("missing-config", m.push_error_missing_config())
  }

  const permission = await Notification.requestPermission()

  if (permission !== "granted") {
    throw new PushNotificationError("permission-denied", m.push_error_permission_denied())
  }

  const messaging = await getFirebaseMessaging()

  if (!messaging) {
    throw new PushNotificationError("missing-config", m.push_error_missing_config())
  }

  let registration: ServiceWorkerRegistration

  try {
    registration = await getPwaServiceWorkerRegistration()
  } catch {
    throw new PushNotificationError("token-unavailable", m.push_error_service_worker_unavailable())
  }

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  })

  if (!token) {
    throw new PushNotificationError("token-unavailable", m.push_error_token_unavailable())
  }

  return token
}

function getFcmTokenStorageKey(userId: string) {
  return `${FCM_TOKEN_STORAGE_KEY_PREFIX}:${userId}`
}

function clearLegacyFcmTokenStorage() {
  window.localStorage.removeItem(FCM_TOKEN_STORAGE_KEY_PREFIX)
}

function markFcmTokenRegistered(userId: string, token: string) {
  clearLegacyFcmTokenStorage()
  window.localStorage.setItem(getFcmTokenStorageKey(userId), token)
  window.dispatchEvent(new CustomEvent(FCM_TOKEN_CHANGED_EVENT))
}

async function saveRegisteredFcmToken(userId: string, token: string, registerToken: (token: string) => Promise<void>) {
  await registerToken(token)
  markFcmTokenRegistered(userId, token)
}

export function getStoredFcmToken(userId: string) {
  clearLegacyFcmTokenStorage()
  return window.localStorage.getItem(getFcmTokenStorageKey(userId))
}

export function subscribeToFcmToken(listener: () => void) {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.storageArea !== window.localStorage || event.key === null) {
      return
    }

    if (event.key === FCM_TOKEN_STORAGE_KEY_PREFIX || event.key.startsWith(`${FCM_TOKEN_STORAGE_KEY_PREFIX}:`)) {
      listener()
    }
  }

  window.addEventListener(FCM_TOKEN_CHANGED_EVENT, listener)
  window.addEventListener("storage", handleStorageChange)

  return () => {
    window.removeEventListener(FCM_TOKEN_CHANGED_EVENT, listener)
    window.removeEventListener("storage", handleStorageChange)
  }
}

export async function enableFcm(userId: string, registerToken: (token: string) => Promise<void>) {
  const token = await getFcmToken()

  await saveRegisteredFcmToken(userId, token, registerToken)

  return token
}

export function clearStoredFcmToken(userId: string) {
  window.localStorage.removeItem(getFcmTokenStorageKey(userId))
  window.dispatchEvent(new CustomEvent(FCM_TOKEN_CHANGED_EVENT))
}

export async function clearFcmToken(userId: string) {
  clearStoredFcmToken(userId)
  await deleteFcmToken().catch(() => {})
}

export async function deleteFcmToken() {
  const messaging = await getFirebaseMessaging()

  if (!messaging) {
    return
  }

  await deleteToken(messaging)
}

export async function disableFcm(userId: string, unregisterToken: (token: string) => Promise<void>) {
  const registeredToken = getStoredFcmToken(userId)

  if (!registeredToken) {
    return
  }

  // TODO: backend token deletion can fail, but the user intent is to disable notifications
  // on this browser. We still clear frontend state and delete the Firebase token, then surface the backend issue.
  let unregisterError: unknown
  await unregisterToken(registeredToken).catch((error) => (unregisterError = error))
  await clearFcmToken(userId)

  if (unregisterError) {
    throw unregisterError
  }
}

export async function syncFcmToken(userId: string, registerToken: (token: string) => Promise<void>) {
  const registeredToken = getStoredFcmToken(userId)

  if (getPushNotificationPermission() !== "granted" || !registeredToken) {
    return
  }

  const currentToken = await getFcmToken()

  if (currentToken === registeredToken) {
    return
  }

  await saveRegisteredFcmToken(userId, currentToken, registerToken)
}

export async function listenToForegroundFcmMessages(handler: (payload: MessagePayload) => void): Promise<Unsubscribe> {
  if (getPushNotificationPermission() !== "granted") {
    return () => {}
  }

  const messaging = await getFirebaseMessaging()

  if (!messaging) {
    return () => {}
  }

  return onMessage(messaging, handler)
}
