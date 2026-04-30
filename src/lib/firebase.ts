import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app"
import { getMessaging, isSupported, type Messaging } from "firebase/messaging"

let firebaseApp: FirebaseApp | null = null
let messagingPromise: Promise<Messaging | null> | null = null

function getFirebaseConfig(): FirebaseOptions | null {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }

  return Object.values(config).every(Boolean) ? config : null
}

export function getFirebaseApp() {
  const config = getFirebaseConfig()

  if (!config) {
    return null
  }

  firebaseApp ??= initializeApp(config)

  return firebaseApp
}

export async function getFirebaseMessaging() {
  if (!messagingPromise) {
    messagingPromise = (async (): Promise<Messaging | null> => {
      const app = getFirebaseApp()

      if (!app || !(await isSupported().catch(() => false))) {
        return null
      }

      return getMessaging(app)
    })()
  }

  return messagingPromise
}
