const MS_PER_DAY = 1000 * 60 * 60 * 24

const monthDayFormatter = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" })
const fullDateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
})
const fullDateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h12",
})
const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  hour: "numeric",
  minute: "2-digit",
  hourCycle: "h12",
})

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime())
}

function getStartOfDayTime(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
}

function getCalendarDayDiff(left: Date, right: Date) {
  return Math.round((getStartOfDayTime(left) - getStartOfDayTime(right)) / MS_PER_DAY)
}

function formatKoreanTime(value: Date) {
  const parts = timeFormatter.formatToParts(value)
  const hour = parts.find((part) => part.type === "hour")?.value
  const minute = parts.find((part) => part.type === "minute")?.value
  const rawDayPeriod = parts.find((part) => part.type === "dayPeriod")?.value

  if (!hour || !minute) {
    return timeFormatter.format(value)
  }

  const dayPeriod =
    rawDayPeriod === "AM"
      ? "오전"
      : rawDayPeriod === "PM"
        ? "오후"
        : rawDayPeriod || (value.getHours() < 12 ? "오전" : "오후")

  return `${dayPeriod} ${hour}:${minute}`
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)

  if (!isValidDate(date)) {
    return ""
  }

  const now = new Date()
  const dayDiff = getCalendarDayDiff(date, now)

  if (dayDiff === 0) {
    return formatKoreanTime(date)
  }

  if (dayDiff === -1) {
    return "어제"
  }

  if (date.getFullYear() === now.getFullYear()) {
    return monthDayFormatter.format(date)
  }

  return fullDateFormatter.format(date)
}

export function formatFullDateTime(dateStr: string): string {
  const date = new Date(dateStr)

  if (!isValidDate(date)) {
    return ""
  }

  return fullDateTimeFormatter.format(date)
}
