import { getCurrentLocale } from "@/lib/i18n"
import { m } from "@/paraglide/messages"

const MS_PER_DAY = 1000 * 60 * 60 * 24

function getIntlLocale() {
  return getCurrentLocale() === "ko" ? "ko-KR" : "en-US"
}

function createMonthDayFormatter() {
  return new Intl.DateTimeFormat(getIntlLocale(), { month: "long", day: "numeric" })
}

function createFullDateFormatter() {
  return new Intl.DateTimeFormat(getIntlLocale(), {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
}

function createFullDateTimeFormatter() {
  return new Intl.DateTimeFormat(getIntlLocale(), {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h12",
  })
}

function createTimeFormatter() {
  return new Intl.DateTimeFormat(getIntlLocale(), {
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h12",
  })
}

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime())
}

function getStartOfDayTime(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
}

function getCalendarDayDiff(left: Date, right: Date) {
  return Math.round((getStartOfDayTime(left) - getStartOfDayTime(right)) / MS_PER_DAY)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(getIntlLocale()).format(value)
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)

  if (!isValidDate(date)) {
    return ""
  }

  const now = new Date()
  const dayDiff = getCalendarDayDiff(date, now)

  if (dayDiff === 0) {
    return createTimeFormatter().format(date)
  }

  if (dayDiff === -1) {
    return m.date_yesterday()
  }

  if (date.getFullYear() === now.getFullYear()) {
    return createMonthDayFormatter().format(date)
  }

  return createFullDateFormatter().format(date)
}

export function formatFullDateTime(dateStr: string): string {
  const date = new Date(dateStr)

  if (!isValidDate(date)) {
    return ""
  }

  return createFullDateTimeFormatter().format(date)
}
