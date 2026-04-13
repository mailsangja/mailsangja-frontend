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
