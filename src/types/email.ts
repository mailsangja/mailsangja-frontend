import type { ThreadLabel } from "./label"

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
  contentId?: string
  disposition?: "ATTACHMENT" | "INLINE"
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
  replyTo?: MailAddress
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
  messageCount: number
  labels: ThreadLabel[]
}

export interface InboxThreadDetail {
  threadId: string
  gmailThreadId: string
  accountId: string
  latestSubject: string
  isRead: boolean
  lastMessageAt: string
  labels: ThreadLabel[]
  messages: InboxMessage[]
}

export interface MarkerSliceResponse<T> {
  content: T[]
  nextMarker: string | null
  hasNext: boolean
  unreadCount: number
  totalCount: number
}

export interface ListThreadsParams {
  marker?: string
  size?: number
  labelId?: string[]
  read?: boolean
  q?: string
}

export interface UnreadCountResponse {
  unreadCount: number
}

export interface ComposeInlineImage {
  file: File
  cid: string
}

export interface ComposeEmailData {
  messageId?: string
  from?: string
  replyTo?: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  content: string
  attachments?: File[]
  inlineImages?: ComposeInlineImage[]
}

export interface MailDraftStreamRequest {
  mailAddress: string
  query: string
  replyMessageId: string | null
  to: string[]
  cc: string[]
}

export interface MailDraftUsage {
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export type MailDraftStreamPhase = "idle" | "subject" | "body" | "done" | "error" | "aborted"

export type MailDraftStreamEvent =
  | { type: "subject"; delta: string }
  | { type: "body"; delta: string }
  | { type: "usage"; usage: MailDraftUsage }
  | { type: "done" }
  | { type: "error"; code?: string; message: string }

export interface MailReviewRequest {
  subject: string
  body: string
  attachmentCount?: number
  attachmentNames?: string[]
}

export type MailReviewIssueField = "SUBJECT" | "BODY"
export type MailReviewIssueType =
  | "SPELLING"
  | "SPACING"
  | "GRAMMAR"
  | "CONTEXT"
  | "TONE"
  | "CLARITY"
  | "ATTACHMENT_MISSING"
export type MailReviewIssueSeverity = "LOW" | "MEDIUM" | "HIGH"

export const MAIL_REVIEW_ISSUE_TYPE_LABELS: Record<MailReviewIssueType, string> = {
  SPELLING: "맞춤법",
  SPACING: "띄어쓰기",
  GRAMMAR: "문법",
  CONTEXT: "문맥",
  TONE: "어조",
  CLARITY: "명확성",
  ATTACHMENT_MISSING: "첨부파일 누락",
}

export const MAIL_REVIEW_ISSUE_FIELD_LABELS: Record<MailReviewIssueField, string> = {
  SUBJECT: "제목",
  BODY: "본문",
}

export interface MailReviewIssue {
  segmentId: string
  field: MailReviewIssueField
  type: MailReviewIssueType
  severity: MailReviewIssueSeverity
  segmentText: string
  originalText: string
  replacementText: string
  localStartOffset: number
  localEndOffset: number
  globalStartOffset: number
  globalEndOffset: number
  reason: string
}

export interface MailReviewResult {
  hasIssues: boolean
  issues: MailReviewIssue[]
}
