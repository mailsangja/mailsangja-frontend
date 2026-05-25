import * as amplitude from "@amplitude/analytics-browser"
import { sessionReplayPlugin } from "@amplitude/plugin-session-replay-browser"

import type { User } from "@/types/user"

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()
const AMPLITUDE_API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY?.trim()
const AMPLITUDE_SERVER_ZONE = import.meta.env.VITE_AMPLITUDE_SERVER_ZONE === "EU" ? "EU" : "US"
const GA_SCRIPT_ID = "google-analytics-tag"

type GtagArguments = [command: string, ...args: unknown[]]
type DataLayerEntry = GtagArguments | IArguments
type AnalyticsEventParams = Record<string, boolean | number | string | null | undefined>

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[]
    gtag?: (...args: GtagArguments) => void
  }
}

let lastPageLocation: string | null = null
let isAmplitudeInitialized = false

function isAnalyticsEnabled() {
  return import.meta.env.PROD || import.meta.env.VITE_ANALYTICS_ENABLED === "true"
}

function isGoogleAnalyticsEnabled() {
  return isAnalyticsEnabled() && Boolean(GA_MEASUREMENT_ID)
}

function isAmplitudeEnabled() {
  return isAnalyticsEnabled() && Boolean(AMPLITUDE_API_KEY)
}

function getSerializableParams(params: AnalyticsEventParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined
    })
  )
}

export function initAnalytics() {
  if (!isAnalyticsEnabled()) return

  if (GA_MEASUREMENT_ID) {
    window.dataLayer = window.dataLayer ?? []
    window.gtag =
      window.gtag ??
      (function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments)
      } as (...args: GtagArguments) => void)

    if (!document.getElementById(GA_SCRIPT_ID)) {
      const script = document.createElement("script")
      script.id = GA_SCRIPT_ID
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`
      document.head.appendChild(script)
    }

    window.gtag("js", new Date())
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
    })
  }

  if (!AMPLITUDE_API_KEY || isAmplitudeInitialized) return

  amplitude.add(
    sessionReplayPlugin({
      forceSessionTracking: true,
      debugMode: !import.meta.env.PROD,
      useWebWorker: true,
    })
  )
  amplitude.init(AMPLITUDE_API_KEY, {
    serverZone: AMPLITUDE_SERVER_ZONE,
    remoteConfig: {
      fetchRemoteConfig: true,
    },
    autocapture: {
      attribution: {
        trackingMethod: ["userProperty", "eventProperty"],
        fallbackAttributionEvent: true,
      },
      fileDownloads: true,
      formInteractions: true,
      pageViews: false,
      sessions: true,
      elementInteractions: true,
      frustrationInteractions: true,
      networkTracking: true,
      webVitals: true,
      performanceTracking: true,
      pageUrlEnrichment: true,
    },
  })
  isAmplitudeInitialized = true
}

export function trackPageView(href: string) {
  if (!isAnalyticsEnabled()) return

  const url = new URL(href, window.location.origin)
  const pageLocation = url.toString()

  if (pageLocation === lastPageLocation) return
  const pageReferrer = lastPageLocation ?? document.referrer
  lastPageLocation = pageLocation

  const properties = {
    page_location: pageLocation,
    page_path: `${url.pathname}${url.search}${url.hash}`,
    ...(pageReferrer ? { page_referrer: pageReferrer } : {}),
    page_title: document.title,
  }

  if (isGoogleAnalyticsEnabled() && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag("event", "page_view", {
      send_to: GA_MEASUREMENT_ID,
      ...properties,
    })
  }

  if (isAmplitudeEnabled()) {
    amplitude.track("page_view", properties)
  }
}

export function trackEvent(name: string, params: AnalyticsEventParams = {}) {
  if (!isAnalyticsEnabled()) return

  const properties = getSerializableParams(params)

  if (isGoogleAnalyticsEnabled() && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag("event", name, {
      send_to: GA_MEASUREMENT_ID,
      ...properties,
    })
  }

  if (isAmplitudeEnabled()) {
    amplitude.track(name, properties)
  }
}

export function identifyAnalyticsUser(user: User) {
  if (!isAmplitudeEnabled()) return

  amplitude.setUserId(user.id)

  const identify = new amplitude.Identify()
  identify.set("plan", user.plan)
  identify.set("has_default_mail_account", Boolean(user.defaultMailAccountId))
  identify.set("credit_usage", user.creditUsage)
  amplitude.identify(identify)
}

export function resetAnalyticsUser() {
  if (!isAmplitudeEnabled()) return

  amplitude.setUserId(undefined)
}
