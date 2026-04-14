import { apiClient } from "@/lib/api-client"
import { normalizeSnippetText } from "@/lib/html-entities"
import type {
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
    snippet: normalizeSnippetText(thread.snippet),
  }
}

function normalizeMessage(message: InboxMessage): InboxMessage {
  return {
    ...message,
    snippet: normalizeSnippetText(message.snippet),
  }
}

function normalizeThreadDetail(thread: InboxThreadDetail): InboxThreadDetail {
  return {
    ...thread,
    messages: thread.messages.map(normalizeMessage),
  }
}

export async function getMailboxThreads(
  mailbox: SupportedMailboxId,
  params: ListThreadsParams = {}
): Promise<MarkerSliceResponse<InboxThreadSummary>> {
  const path = mailbox === "INBOX" ? "/api/v1/threads/inbox" : "/api/v1/threads/sent"

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

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return apiClient.get<UnreadCountResponse>("/api/v1/threads/inbox/unread-count")
}
