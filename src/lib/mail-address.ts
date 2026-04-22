import type { MailAddress } from "@/types/email"

function normalize(value?: string) {
  return value?.trim() ?? ""
}

export function getMailAddressLabel(address?: MailAddress | null) {
  const name = normalize(address?.name)
  const email = normalize(address?.email)

  return name || email || "알 수 없음"
}

export function getMailAddressFullLabel(address?: MailAddress | null) {
  const name = normalize(address?.name)
  const email = normalize(address?.email)

  if (name && email && name !== email) {
    return `${name} <${email}>`
  }

  return name || email || "알 수 없음"
}

export function getMailAddressSearchText(address?: MailAddress | null) {
  const name = normalize(address?.name)
  const email = normalize(address?.email)

  return [name, email].filter(Boolean).join(" ")
}

export function formatMailAddressList(addresses: MailAddress[]) {
  return addresses.map((address) => getMailAddressFullLabel(address)).join(", ")
}

export function parseMailAddressInput(value: string) {
  const entries: string[] = []
  let current = ""
  let inQuotes = false
  let angleDepth = 0
  let backslashCount = 0

  for (const char of value) {
    if (char === '"' && backslashCount % 2 === 0) {
      inQuotes = !inQuotes
      current += char
      backslashCount = 0
      continue
    }

    if (!inQuotes && char === "<") {
      angleDepth += 1
      current += char
      backslashCount = 0
      continue
    }

    if (!inQuotes && char === ">" && angleDepth > 0) {
      angleDepth -= 1
      current += char
      backslashCount = 0
      continue
    }

    if (!inQuotes && angleDepth === 0 && /[,\n;]/.test(char)) {
      const entry = current.trim()

      if (entry) {
        entries.push(entry)
      }

      current = ""
      backslashCount = 0
      continue
    }

    current += char
    backslashCount = char === "\\" ? backslashCount + 1 : 0
  }

  const lastEntry = current.trim()

  if (lastEntry) {
    entries.push(lastEntry)
  }

  return entries
}
