import type { EmailFilter } from "@/types/email"

export interface MailRouteSearch {
  query?: string
  filter?: EmailFilter
  accountId?: string
  thread?: string
  labelId?: string
}

export function parseMailRouteSearch(search: unknown): MailRouteSearch {
  if (!search || typeof search !== "object") {
    return {}
  }

  const values = search as Record<string, unknown>
  const query = typeof values.query === "string" ? values.query.trim() : undefined
  const filter = values.filter === "unread" ? "unread" : values.filter === "all" ? "all" : undefined
  const accountId = typeof values.accountId === "string" ? values.accountId.trim() : undefined
  const thread = typeof values.thread === "string" ? values.thread.trim() : undefined
  const labelId = typeof values.labelId === "string" ? values.labelId.trim() : undefined

  return {
    ...(query ? { query } : {}),
    ...(filter && filter !== "all" ? { filter } : {}),
    ...(accountId ? { accountId } : {}),
    ...(thread ? { thread } : {}),
    ...(labelId ? { labelId } : {}),
  }
}
