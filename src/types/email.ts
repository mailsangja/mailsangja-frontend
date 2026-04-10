export const PRIMARY_MAILBOX_IDS = ["INBOX", "SENT", "DRAFT", "SPAM", "TRASH"] as const
export const SUPPORTED_MAILBOX_IDS = ["INBOX", "SENT"] as const

export type PrimaryMailboxId = (typeof PRIMARY_MAILBOX_IDS)[number]
export type SupportedMailboxId = (typeof SUPPORTED_MAILBOX_IDS)[number]

export const MAILBOX_LABELS: Record<PrimaryMailboxId, string> = {
  INBOX: "받은편지함",
  SENT: "보낸편지함",
  DRAFT: "임시보관함",
  SPAM: "스팸함",
  TRASH: "휴지통",
}

export function isSupportedMailboxId(mailboxId: PrimaryMailboxId): mailboxId is SupportedMailboxId {
  return mailboxId === "INBOX" || mailboxId === "SENT"
}

export interface Attachment {
  id: string
  gmailAttachmentId: string
  filename: string
  mimeType: string
  size: number
}

export interface InboxMessage {
  id: string
  gmailMessageId: string
  subject: string
  direction: "INBOUND" | "OUTBOUND"
  fromAddress: string
  toAddresses: string[]
  ccAddresses: string[]
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
  participantAddress: string
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
