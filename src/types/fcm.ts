import { decodeHtmlEntities } from "@/lib/html-entities"

export const DEFAULT_NEW_MAIL_PUSH_TITLE = "새 메일이 도착했습니다"

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

export function toNewMailPushData(data: Record<string, string> | undefined): NewMailPushData {
  return {
    title: data?.title || DEFAULT_NEW_MAIL_PUSH_TITLE,
    body: decodeHtmlEntities(data?.body ?? ""),
    mailAccountId: data?.mailAccountId ?? "",
    alias: data?.alias ?? "",
    threadId: data?.threadId ?? "",
    messageId: data?.messageId ?? "",
    threadDetailUrl: data?.threadDetailUrl ?? "",
    ...(data?.image ? { image: data.image } : {}),
  }
}
