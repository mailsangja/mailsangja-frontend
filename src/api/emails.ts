import { apiClient, buildApiUrl } from "@/lib/api-client"
import { getVisibleAttachments } from "@/lib/email-attachments"
import { normalizeSnippetText } from "@/lib/html-entities"
import type {
  ComposeEmailData,
  InboxMessage,
  InboxThreadDetail,
  InboxThreadSummary,
  ListThreadsParams,
  MarkerSliceResponse,
  SupportedMailboxId,
  UnreadCountResponse,
} from "@/types/email"

function normalizeThreadSummary(thread: InboxThreadSummary): InboxThreadSummary {
  return {
    ...thread,
    attachments: getVisibleAttachments(thread.attachments),
    snippet: normalizeSnippetText(thread.snippet),
  }
}

function normalizeMessage(message: InboxMessage): InboxMessage {
  return {
    ...message,
    attachments: getVisibleAttachments(message.attachments),
    snippet: normalizeSnippetText(message.snippet),
  }
}

function normalizeThreadDetail(thread: InboxThreadDetail): InboxThreadDetail {
  return {
    ...thread,
    messages: thread.messages.map(normalizeMessage),
  }
}

function appendFormDataValues(formData: FormData, key: string, values?: readonly string[]) {
  for (const value of values ?? []) {
    const normalizedValue = value.trim()

    if (!normalizedValue) {
      continue
    }

    formData.append(key, normalizedValue)
  }
}

export async function getMailboxThreads(
  mailbox: SupportedMailboxId,
  params: ListThreadsParams = {}
): Promise<MarkerSliceResponse<InboxThreadSummary>> {
  const path = `/api/v1/threads/${mailbox}`

  const response = await apiClient.get<MarkerSliceResponse<InboxThreadSummary>>(path, {
    params: params as Record<string, string | number | boolean | null | undefined>,
  })

  return {
    ...response,
    content: response.content.map(normalizeThreadSummary),
  }
}

export async function getThreadDetail(threadId: string): Promise<InboxThreadDetail> {
  const response = await apiClient.get<InboxThreadDetail>(`/api/v1/threads/${threadId}`)

  return normalizeThreadDetail(response)
}

export async function markThreadAsRead(threadId: string): Promise<void> {
  return apiClient.post<void>(`/api/v1/threads/${threadId}/read`)
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return apiClient.get<UnreadCountResponse>("/api/v1/threads/inbox/unread-count")
}

export function getAttachmentDownloadUrl(attachmentId: string) {
  return buildApiUrl(`/api/v1/mail/attachments/${attachmentId}`)
}

export async function sendMail(data: ComposeEmailData): Promise<void> {
  const formData = new FormData()

  if (data.from?.trim()) {
    formData.append("from", data.from.trim())
  }

  if (data.replyTo?.trim()) {
    formData.append("replyTo", data.replyTo.trim())
  }

  appendFormDataValues(formData, "to", data.to)
  appendFormDataValues(formData, "cc", data.cc)
  appendFormDataValues(formData, "bcc", data.bcc)
  formData.append("subject", data.subject)
  formData.append("content", data.content)

  for (const attachment of data.attachments ?? []) {
    formData.append("attachments", attachment)
  }

  for (const inlineImage of data.inlineImages ?? []) {
    const cid = inlineImage.cid.trim()

    if (!cid) {
      continue
    }

    formData.append("inlineImages", inlineImage.file)
    formData.append("inlineImageCids", cid)
  }

  await apiClient.post<void>("/api/v1/mail/send", formData, {
    params: {
      messageId: data.messageId,
    },
  })
}
