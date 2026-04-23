export const PRIMARY_MAILBOX_IDS = ["inbox", "sent", "spam", "trash"] as const
export const SUPPORTED_MAILBOX_IDS = ["inbox", "sent"] as const

export type PrimaryMailboxId = (typeof PRIMARY_MAILBOX_IDS)[number]
export type SupportedMailboxId = (typeof SUPPORTED_MAILBOX_IDS)[number]
export type EmailFilter = "all" | "unread"

export const MAILBOX_LABELS: Record<PrimaryMailboxId, string> = {
  inbox: "받은편지함",
  sent: "보낸편지함",
  spam: "스팸함",
  trash: "휴지통",
}

export function isSupportedMailboxId(mailboxId: PrimaryMailboxId): mailboxId is SupportedMailboxId {
  return mailboxId === "inbox" || mailboxId === "sent"
}

export function parseMailboxId(value: string): PrimaryMailboxId | null {
  const mailbox = value.trim().toLowerCase() as PrimaryMailboxId

  return PRIMARY_MAILBOX_IDS.includes(mailbox) ? mailbox : null
}

export interface Attachment {
  id: string
  gmailAttachmentId: string
  filename: string
  mimeType: string
  size: number
}

export interface MailAddress {
  name?: string
  email: string
}

export interface InboxMessage {
  id: string
  gmailMessageId: string
  subject: string
  direction: "INBOUND" | "OUTBOUND"
  from: MailAddress
  to: MailAddress[]
  cc: MailAddress[]
  snippet: string
  isRead: boolean
  sentAt: string
  bodyText: string
  bodyHtml: string
  attachments: Attachment[]
}

export interface InboxThreadSummary {
  threadId: string
  gmailThreadId: string
  accountId: string
  latestSubject: string
  participant: MailAddress
  snippet: string
  isRead: boolean
  lastMessageAt: string
  attachments: Attachment[]
}

export interface InboxThreadDetail {
  threadId: string
  gmailThreadId: string
  accountId: string
  latestSubject: string
  isRead: boolean
  lastMessageAt: string
  messages: InboxMessage[]
}

export interface MarkerSliceResponse<T> {
  content: T[]
  nextMarker: string | null
  hasNext: boolean
}

export interface ListThreadsParams {
  marker?: string
  size?: number
}

export interface UnreadCountResponse {
  unreadCount: number
}

export interface ComposeEmailData {
  from?: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  content: string
  attachments?: File[]
}
