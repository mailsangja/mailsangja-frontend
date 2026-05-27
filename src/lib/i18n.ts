import { getLocale, getTextDirection } from "@/paraglide/runtime"

export function getCurrentLocale() {
  return getLocale()
}

export function getCurrentTextDirection() {
  return getTextDirection()
}
