import type { Attachment, InboxMessage, MailAddress } from "./email"

export interface LabelSummary {
  labelId: string
  name: string
  colorCode: string
}

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
  messages: InboxMessage[]
}
