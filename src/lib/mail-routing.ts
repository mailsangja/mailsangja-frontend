import type { EmailFilter } from "@/types/email"

export interface MailRouteSearch {
  query?: string
  filter?: EmailFilter
  accountId?: string
  thread?: string
  message?: string
  labelId?: string
  labelGroupId?: string
}

export function parseMailRouteSearch(search: unknown): MailRouteSearch {
  if (!search || typeof search !== "object") {
    return {}
  }

  const values = search as Record<string, unknown>
  const query = typeof values.query === "string" ? values.query : undefined
  const filter = values.filter === "unread" ? "unread" : values.filter === "all" ? "all" : undefined
  const accountId = typeof values.accountId === "string" ? values.accountId.trim() : undefined
  const thread = typeof values.thread === "string" ? values.thread.trim() : undefined
  const message = typeof values.message === "string" ? values.message.trim() : undefined
  const labelId = typeof values.labelId === "string" ? values.labelId.trim() : undefined
  const labelGroupId = typeof values.labelGroupId === "string" ? values.labelGroupId.trim() : undefined

  return {
    ...(query?.trim() ? { query } : {}),
    ...(filter && filter !== "all" ? { filter } : {}),
    ...(accountId ? { accountId } : {}),
    ...(thread ? { thread } : {}),
    ...(message ? { message } : {}),
    ...(labelId ? { labelId } : {}),
    ...(labelGroupId ? { labelGroupId } : {}),
  }
}
