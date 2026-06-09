import { m } from "@/paraglide/messages"

import type { ThreadLabel } from "./label"

export const PRIMARY_MAILBOX_IDS = ["inbox", "sent", "starred", "trash"] as const
export const SUPPORTED_MAILBOX_IDS = ["inbox", "sent"] as const

export type PrimaryMailboxId = (typeof PRIMARY_MAILBOX_IDS)[number]
export type SupportedMailboxId = (typeof SUPPORTED_MAILBOX_IDS)[number]
export type EmailFilter = "all" | "unread"

export function getMailboxLabel(mailboxId: PrimaryMailboxId): string {
  switch (mailboxId) {
    case "inbox":
      return m.mailbox_inbox()
    case "sent":
      return m.mailbox_sent()
    case "starred":
      return m.mailbox_starred()
    case "trash":
      return m.mailbox_trash()
  }
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
  star: boolean
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
  star: boolean
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
  star: boolean
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

export type StarredThreadsParams = Pick<ListThreadsParams, "marker" | "size" | "labelId" | "read" | "q">

export interface UnreadCountResponse {
  unreadCount: number
}

export interface ReplyDraftSuggestion {
  id: string
  type: string
  subject: string
  body: string
}

export interface ReplyDraftSuggestionListResponse {
  suggestions: ReplyDraftSuggestion[]
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
  model?: string
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

export function getMailReviewIssueTypeLabel(type: MailReviewIssueType): string {
  switch (type) {
    case "SPELLING":
      return m.mail_review_type_spelling()
    case "SPACING":
      return m.mail_review_type_spacing()
    case "GRAMMAR":
      return m.mail_review_type_grammar()
    case "CONTEXT":
      return m.mail_review_type_context()
    case "TONE":
      return m.mail_review_type_tone()
    case "CLARITY":
      return m.mail_review_type_clarity()
    case "ATTACHMENT_MISSING":
      return m.mail_review_type_attachment_missing()
  }
}

export function getMailReviewIssueFieldLabel(field: MailReviewIssueField): string {
  switch (field) {
    case "SUBJECT":
      return m.mail_review_field_subject()
    case "BODY":
      return m.mail_review_field_body()
  }
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

export type HybridMailSearchScope = "ALL" | "INBOX" | "SENT"
export type HybridMailSearchMatchedBy = "VECTOR" | "LEXICAL"

export interface HybridMailSearchParams {
  q: string
  scope?: HybridMailSearchScope
  mailAccountId?: string
  labelId?: string[]
  read?: boolean
  size?: number
}

export interface HybridMailSearchItem {
  messageId: string
  threadId: string
  mailAccountId: string
  direction: "INBOUND" | "OUTBOUND"
  subject: string
  from: MailAddress
  to: MailAddress[]
  snippet: string
  read: boolean
  star: boolean
  sentAt: string
  matchedBy: HybridMailSearchMatchedBy[]
  score: number
}

export interface HybridMailSearchResponse {
  content: HybridMailSearchItem[]
}
