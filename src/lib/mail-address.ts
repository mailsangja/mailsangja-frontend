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

export function getMailAddressDisplayName(address?: MailAddress | null) {
  const name = normalize(address?.name)
  const email = normalize(address?.email)

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

function escapeDisplayName(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

export function formatMailAddressForSend(address: MailAddress) {
  const name = normalize(address.name)
  const email = normalize(address.email)

  if (name && name !== email) {
    return `"${escapeDisplayName(name)}" <${email}>`
  }

  return email
}

export function formatMailAddressesForSend(addresses: MailAddress[]) {
  return addresses.map(formatMailAddressForSend)
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

function unescapeQuotedName(value: string) {
  return value.replace(/\\(["\\])/g, "$1")
}

export function isValidEmailAddress(value: string) {
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value.trim())
}

export function parseMailAddressEntry(value: string): MailAddress | null {
  const entry = value.trim()

  if (!entry) {
    return null
  }

  const angleMatch = entry.match(/^(.*?)<([^<>]+)>\s*$/)

  if (!angleMatch) {
    return isValidEmailAddress(entry) ? { email: entry } : null
  }

  const rawName = angleMatch[1].trim()
  const email = angleMatch[2].trim()

  if (!rawName || !isValidEmailAddress(email)) {
    return null
  }

  const quotedName = rawName.match(/^"((?:\\.|[^"])*)"$/)
  const name = (quotedName ? unescapeQuotedName(quotedName[1]) : rawName).trim()

  if (!name) {
    return null
  }

  return {
    name,
    email,
  }
}

export function parseMailRecipients(value: string) {
  return parseMailAddressInput(value).flatMap((entry) => {
    const address = parseMailAddressEntry(entry)

    return address ? [address] : []
  })
}

export function getUniqueMailAddresses(addresses: readonly MailAddress[]) {
  const seen = new Set<string>()
  const uniqueAddresses: MailAddress[] = []

  for (const address of addresses) {
    const email = normalize(address.email)
    const key = email.toLowerCase()

    if (!email || seen.has(key)) {
      continue
    }

    seen.add(key)
    uniqueAddresses.push({
      ...address,
      email,
      ...(normalize(address.name) ? { name: normalize(address.name) } : {}),
    })
  }

  return uniqueAddresses
}
