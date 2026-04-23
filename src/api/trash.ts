import { apiClient } from "@/lib/api-client"
import { normalizeSnippetText } from "@/lib/html-entities"
import type { MarkerSliceResponse, ListThreadsParams } from "@/types/email"
import type { TrashMessage, TrashThreadDetail, TrashThreadSummary } from "@/types/trash"

function normalizeMessage(message: TrashMessage): TrashMessage {
  return {
    ...message,
    snippet: normalizeSnippetText(message.snippet),
  }
}

function normalizeSummary(thread: TrashThreadSummary): TrashThreadSummary {
  return {
    ...thread,
    deletedMessages: thread.deletedMessages.map(normalizeMessage),
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
