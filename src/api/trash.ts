import { apiClient } from "@/lib/api-client"
import type { MarkerSliceResponse, ListThreadsParams } from "@/types/email"
import type { TrashThreadDetail, TrashThreadSummary } from "@/types/trash"

export async function getTrashThreads(
  params: ListThreadsParams = {}
): Promise<MarkerSliceResponse<TrashThreadSummary>> {
  return apiClient.get<MarkerSliceResponse<TrashThreadSummary>>("/api/v1/trash/threads", {
    params: params as Record<string, string | number | boolean | null | undefined>,
  })
}

export async function getTrashThreadDetail(threadId: string): Promise<TrashThreadDetail> {
  return apiClient.get<TrashThreadDetail>(`/api/v1/trash/threads/${threadId}`)
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
