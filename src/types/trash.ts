import type { Attachment, InboxMessage, MailAddress } from "./email"
import type { ThreadLabel } from "./label"

export type { ThreadLabel }

export interface TrashThreadSummary {
  threadId: string
  gmailThreadId: string
  accountId: string
  latestSubject: string
  participant: MailAddress
  snippet: string
  isRead: boolean
  lastMessageAt: string
  attachments: Attachment[]
  messageCount: number
  labels: ThreadLabel[]
}

export interface TrashThreadDetail {
  threadId: string
  gmailThreadId: string
  accountId: string
  latestSubject: string
  isRead: boolean
  lastMessageAt: string
  labels: ThreadLabel[]
  messages: InboxMessage[]
}
