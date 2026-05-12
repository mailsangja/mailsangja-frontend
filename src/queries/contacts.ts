import { queryOptions, useQuery } from "@tanstack/react-query"

import { getContacts } from "@/api/contacts"
import type { ListContactsParams } from "@/types/contact"

function normalizeKeyword(keyword?: string) {
  const normalized = keyword?.trim()

  return normalized || undefined
}

export const contactKeys = {
  all: () => ["contacts"] as const,
  list: (params: ListContactsParams = {}) =>
    [...contactKeys.all(), "list", { keyword: normalizeKeyword(params.keyword) }] as const,
}

export const contactQueries = {
  list: (params: ListContactsParams = {}) => {
    const keyword = normalizeKeyword(params.keyword)

    return queryOptions({
      queryKey: contactKeys.list({ keyword }),
      queryFn: () => getContacts({ keyword }),
    })
  },
}

export function useContacts(params: ListContactsParams = {}, enabled = true) {
  return useQuery({
    ...contactQueries.list(params),
    enabled,
  })
}
