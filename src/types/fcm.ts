import { decodeHtmlEntities } from "@/lib/html-entities"

export const DEFAULT_NEW_MAIL_PUSH_TITLE = "New mail arrived"

export interface NewMailPushData {
  title: string
  body: string
  mailAccountId: string
  alias: string
  threadId: string
  messageId: string
  threadDetailUrl: string
  image?: string
}

export function toNewMailPushData(
  data: Record<string, string> | undefined,
  fallbackTitle = DEFAULT_NEW_MAIL_PUSH_TITLE
): NewMailPushData {
  return {
    title: data?.title || fallbackTitle,
    body: decodeHtmlEntities(data?.body ?? ""),
    mailAccountId: data?.mailAccountId ?? "",
    alias: data?.alias ?? "",
    threadId: data?.threadId ?? "",
    messageId: data?.messageId ?? "",
    threadDetailUrl: data?.threadDetailUrl ?? "",
    ...(data?.image ? { image: data.image } : {}),
  }
}
