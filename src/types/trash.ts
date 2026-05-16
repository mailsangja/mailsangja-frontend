import type { Attachment, InboxMessage, LabelSummary, MailAddress } from "./email"

export type { LabelSummary }

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
  labels: LabelSummary[]
}

export interface TrashThreadDetail {
  threadId: string
  gmailThreadId: string
  accountId: string
  latestSubject: string
  isRead: boolean
  lastMessageAt: string
  labels: LabelSummary[]
  messages: InboxMessage[]
}
