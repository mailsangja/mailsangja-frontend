import { apiClient } from "@/lib/api-client"
import type {
  InboxThreadDetail,
  InboxThreadSummary,
  ListThreadsParams,
  MarkerSliceResponse,
  SupportedMailboxId,
  UnreadCountResponse,
} from "@/types/email"

export async function getMailboxThreads(
  mailbox: SupportedMailboxId,
  params: ListThreadsParams = {}
): Promise<MarkerSliceResponse<InboxThreadSummary>> {
  const path = mailbox === "INBOX" ? "/api/v1/threads/inbox" : "/api/v1/threads/sent"

  return apiClient.get<MarkerSliceResponse<InboxThreadSummary>>(path, {
    params: params as Record<string, string | number | boolean | null | undefined>,
  })
}

export async function getThreadDetail(threadId: string): Promise<InboxThreadDetail> {
  return apiClient.get<InboxThreadDetail>(`/api/v1/threads/${threadId}`)
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return apiClient.get<UnreadCountResponse>("/api/v1/threads/inbox/unread-count")
}
