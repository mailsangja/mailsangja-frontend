import { HttpError } from "@/lib/api-client"

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError
}

export function getHttpStatus(error: unknown) {
  return isHttpError(error) ? error.status : undefined
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (isHttpError(error) && error.message) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
