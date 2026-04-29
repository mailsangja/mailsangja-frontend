import { getToken, onMessage, type MessagePayload, type Unsubscribe } from "firebase/messaging"

import { getFirebaseMessaging } from "@/lib/firebase"
import { getPwaServiceWorkerRegistration } from "@/lib/pwa"

const FCM_TOKEN_STORAGE_KEY = "mailsangja:fcm-token"
export const FCM_TOKEN_REGISTERED_EVENT = "mailsangja:fcm-token-registered"

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

export async function requestFcmRegistrationToken() {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new PushNotificationError("unsupported", "이 브라우저에서는 푸시 알림을 사용할 수 없습니다.")
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY

  if (!vapidKey) {
    throw new PushNotificationError("missing-config", "Firebase 알림 설정이 완료되지 않았습니다.")
  }

  const permission = await Notification.requestPermission()

  if (permission !== "granted") {
    throw new PushNotificationError("permission-denied", "브라우저 알림 권한이 허용되지 않았습니다.")
  }

  const messaging = await getFirebaseMessaging()

  if (!messaging) {
    throw new PushNotificationError("missing-config", "Firebase 알림 설정이 완료되지 않았습니다.")
  }

  let registration: ServiceWorkerRegistration

  try {
    registration = await getPwaServiceWorkerRegistration()
  } catch {
    throw new PushNotificationError("token-unavailable", "푸시 알림 서비스 워커를 등록하지 못했습니다.")
  }

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  })

  if (!token) {
    throw new PushNotificationError("token-unavailable", "FCM 디바이스 토큰을 발급받지 못했습니다.")
  }

  return token
}

export function markFcmTokenRegistered(token: string) {
  window.localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token)
  window.dispatchEvent(new CustomEvent(FCM_TOKEN_REGISTERED_EVENT))
}

export function getRegisteredFcmToken() {
  return window.localStorage.getItem(FCM_TOKEN_STORAGE_KEY)
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
