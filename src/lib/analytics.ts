const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()
const GA_SCRIPT_ID = "google-analytics-tag"
const REDACTED_SEARCH_PARAMS = ["query", "thread"]

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

function isAnalyticsEnabled() {
  return import.meta.env.PROD
}

function sanitizeLocation(href: string) {
  const url = new URL(href, window.location.origin)

  for (const param of REDACTED_SEARCH_PARAMS) {
    url.searchParams.delete(param)
  }

  return url
}

function getSerializableParams(params: AnalyticsEventParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== undefined
    })
  )
}

export function initAnalytics() {
  if (!isAnalyticsEnabled() || !GA_MEASUREMENT_ID) return

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

export function trackPageView(href: string) {
  if (!isAnalyticsEnabled() || !GA_MEASUREMENT_ID || !window.gtag) return

  const url = sanitizeLocation(href)
  const pageLocation = url.toString()

  if (pageLocation === lastPageLocation) return
  const pageReferrer = lastPageLocation ?? document.referrer
  lastPageLocation = pageLocation

  window.gtag("event", "page_view", {
    send_to: GA_MEASUREMENT_ID,
    page_location: pageLocation,
    page_path: `${url.pathname}${url.search}${url.hash}`,
    ...(pageReferrer ? { page_referrer: pageReferrer } : {}),
    page_title: document.title,
  })
}

export function trackEvent(name: string, params: AnalyticsEventParams = {}) {
  if (!isAnalyticsEnabled() || !window.gtag) return

  window.gtag("event", name, {
    send_to: GA_MEASUREMENT_ID,
    ...getSerializableParams(params),
  })
}
