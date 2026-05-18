import { apiClient, buildApiUrl } from "@/lib/api-client"
import { getVisibleAttachments } from "@/lib/email-attachments"
import { normalizeSnippetText } from "@/lib/html-entities"
import type {
  ComposeEmailData,
  InboxMessage,
  InboxThreadDetail,
  InboxThreadSummary,
  ListThreadsParams,
  MailDraftStreamEvent,
  MailDraftStreamRequest,
  MailDraftUsage,
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

export class MailDraftStreamError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = "MailDraftStreamError"
    this.code = code
  }
}

interface SseFrame {
  event: string
  data: string
}

function parseSseFrame(frame: string): SseFrame | null {
  let event = "message"
  const dataLines: string[] = []

  for (const rawLine of frame.split(/\r?\n/)) {
    const line = rawLine.trimEnd()

    if (!line || line.startsWith(":")) {
      continue
    }

    const separatorIndex = line.indexOf(":")
    const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex)
    const rawValue = separatorIndex === -1 ? "" : line.slice(separatorIndex + 1)
    const value = rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue

    if (field === "event") {
      event = value
    }

    if (field === "data") {
      dataLines.push(value)
    }
  }

  if (dataLines.length === 0 && event !== "done") {
    return null
  }

  return {
    event,
    data: dataLines.join("\n"),
  }
}

function parseMailDraftStreamEvent(frame: SseFrame): MailDraftStreamEvent | null {
  if (frame.event === "done") {
    return { type: "done" }
  }

  if (!["subject", "body", "usage", "error"].includes(frame.event)) {
    return null
  }

  const data = JSON.parse(frame.data) as unknown

  if (frame.event === "subject") {
    const delta =
      typeof data === "object" && data !== null && "delta" in data && typeof data.delta === "string" ? data.delta : ""

    return { type: "subject", delta }
  }

  if (frame.event === "body") {
    const delta =
      typeof data === "object" && data !== null && "delta" in data && typeof data.delta === "string" ? data.delta : ""

    return { type: "body", delta }
  }

  if (frame.event === "usage") {
    const usage = data as MailDraftUsage

    return { type: "usage", usage }
  }

  if (frame.event === "error") {
    const code =
      typeof data === "object" && data !== null && "code" in data && typeof data.code === "string"
        ? data.code
        : undefined
    const message =
      typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
        ? data.message
        : "메일 초안 생성에 실패했습니다."

    return { type: "error", code, message }
  }

  return null
}

async function parseErrorResponseMessage(response: Response) {
  const text = await response.text()

  if (!text) {
    return response.statusText || "메일 초안 생성 요청에 실패했습니다."
  }

  try {
    const data = JSON.parse(text) as unknown

    if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
      return data.message
    }
  } catch {
    return text
  }

  return response.statusText || "메일 초안 생성 요청에 실패했습니다."
}

export async function getMailboxThreads(
  mailbox: SupportedMailboxId,
  params: ListThreadsParams = {}
): Promise<MarkerSliceResponse<InboxThreadSummary>> {
  const path = `/api/v1/threads/${mailbox}`

  const response = await apiClient.get<MarkerSliceResponse<InboxThreadSummary>>(path, {
    params: params as Record<string, string | string[] | number | boolean | null | undefined>,
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

export async function markThreadAsUnread(threadId: string): Promise<void> {
  return apiClient.post<void>(`/api/v1/threads/${threadId}/unread`)
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  return apiClient.post<void>(`/api/v1/messages/${messageId}/read`)
}

export async function markMessageAsUnread(messageId: string): Promise<void> {
  return apiClient.post<void>(`/api/v1/messages/${messageId}/unread`)
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return apiClient.get<UnreadCountResponse>("/api/v1/threads/inbox/unread-count")
}

export function getAttachmentDownloadUrl(attachmentId: string) {
  return buildApiUrl(`/api/v1/mail/attachments/${attachmentId}`)
}

export async function streamMailDraft(
  request: MailDraftStreamRequest,
  options: {
    signal?: AbortSignal
    onEvent: (event: MailDraftStreamEvent) => void
  }
) {
  const response = await fetch(buildApiUrl("/api/v1/mail/drafts/stream"), {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal: options.signal,
  })

  if (!response.ok) {
    throw new MailDraftStreamError(await parseErrorResponseMessage(response))
  }

  if (!response.body) {
    throw new MailDraftStreamError("메일 초안 생성 응답을 읽을 수 없습니다.")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let shouldCancelReader = true

  const emitFrameEvent = (frameText: string) => {
    const frame = parseSseFrame(frameText)
    if (!frame) return false

    const event = parseMailDraftStreamEvent(frame)
    if (!event) return false

    options.onEvent(event)

    if (event.type === "error") {
      throw new MailDraftStreamError(event.message, event.code)
    }

    return event.type === "done"
  }

  try {
    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })

      const frames = buffer.split(/\r?\n\r?\n/)
      buffer = frames.pop() ?? ""

      for (const frameText of frames) {
        if (emitFrameEvent(frameText)) {
          return
        }
      }

      if (done) {
        shouldCancelReader = false
        break
      }
    }

    if (emitFrameEvent(buffer)) {
      return
    }

    throw new MailDraftStreamError("메일 초안 생성이 완료되기 전에 연결이 종료되었습니다.")
  } finally {
    if (shouldCancelReader) {
      await reader.cancel().catch(() => undefined)
    }

    reader.releaseLock()
  }
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
