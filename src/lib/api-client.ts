type PrimitiveQueryValue = string | number | boolean | null | undefined
type QueryValue = PrimitiveQueryValue | PrimitiveQueryValue[]
type QueryParams = Record<string, QueryValue>
type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

type RequestOptions = {
  method?: HttpMethod
  params?: QueryParams
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

export class HttpError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = "HttpError"
    this.status = status
    this.data = data
  }
}

function buildUrl(path: string, params?: QueryParams) {
  const baseURL = import.meta.env.VITE_API_BASE_URL
  const url = new URL(path, baseURL || window.location.origin)

  if (!params) {
    return url
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue
    }

    const values = Array.isArray(value) ? value : [value]
    for (const item of values) {
      if (item === null || item === undefined) {
        continue
      }
      url.searchParams.append(key, String(item))
    }
  }

  return url
}

function isBodyInit(body: unknown): body is BodyInit {
  if (typeof body === "string") {
    return true
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return true
  }

  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return true
  }

  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
    return true
  }

  return false
}

function buildHeaders(headers?: HeadersInit, body?: unknown) {
  const requestHeaders = new Headers(headers)
  requestHeaders.set("Accept", "application/json")

  if (body !== undefined && !isBodyInit(body) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json")
  }

  return requestHeaders
}

function buildRequestBody(body?: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined
  }

  return isBodyInit(body) ? body : JSON.stringify(body)
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return undefined
  }

  const text = await response.text()
  if (!text) {
    return undefined
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return JSON.parse(text) as unknown
  }

  return text
}

function getErrorMessage(statusText: string, data: unknown) {
  if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
    return data.message
  }

  return statusText || "Request failed"
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", params, body, headers, signal } = options

  const response = await fetch(buildUrl(path, params), {
    method,
    credentials: "include",
    headers: buildHeaders(headers, body),
    body: buildRequestBody(body),
    signal,
  })

  const data = await parseResponseBody(response)

  if (!response.ok) {
    throw new HttpError(getErrorMessage(response.statusText, data), response.status, data)
  }

  return data as T
}

export const apiClient = {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "GET" })
  },
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "POST", body })
  },
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "PATCH", body })
  },
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "PUT", body })
  },
  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "DELETE" })
  },
}
