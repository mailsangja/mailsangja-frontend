import { apiClient } from "@/lib/api-client"
import { getVisibleAttachments } from "@/lib/email-attachments"
import { normalizeSnippetText } from "@/lib/html-entities"
import type { InboxMessage, ListThreadsParams, MarkerSliceResponse } from "@/types/email"
import type { TrashThreadDetail, TrashThreadSummary } from "@/types/trash"

function normalizeMessage(message: InboxMessage): InboxMessage {
  return {
    ...message,
    attachments: getVisibleAttachments(message.attachments),
    snippet: normalizeSnippetText(message.snippet),
  }
}

function normalizeSummary(thread: TrashThreadSummary): TrashThreadSummary {
  return {
    ...thread,
    attachments: getVisibleAttachments(thread.attachments),
    snippet: normalizeSnippetText(thread.snippet),
  }
}

function normalizeDetail(thread: TrashThreadDetail): TrashThreadDetail {
  return {
    ...thread,
    messages: thread.messages.map(normalizeMessage),
  }
}

export async function getTrashThreads(
  params: ListThreadsParams = {}
): Promise<MarkerSliceResponse<TrashThreadSummary>> {
  const response = await apiClient.get<MarkerSliceResponse<TrashThreadSummary>>("/api/v1/trash/threads", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  })

  return {
    ...response,
    content: response.content.map(normalizeSummary),
  }
}

export async function getTrashThreadDetail(threadId: string): Promise<TrashThreadDetail> {
  const response = await apiClient.get<TrashThreadDetail>(`/api/v1/trash/threads/${threadId}`)
  return normalizeDetail(response)
}

export async function deleteThread(threadId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v1/threads/${threadId}`)
}

export async function deleteMessage(messageId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v1/messages/${messageId}`)
}

export async function restoreTrashThread(threadId: string): Promise<void> {
  return apiClient.post<void>(`/api/v1/trash/threads/${threadId}/restore`)
}

export async function restoreTrashMessage(messageId: string): Promise<void> {
  return apiClient.post<void>(`/api/v1/trash/messages/${messageId}/restore`)
}
