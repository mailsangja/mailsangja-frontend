// import { apiClient } from "@/lib/api-client"
import { getMockMailboxThreads, mockThreadDetails } from "@/mock-data/emails"
import type {
  InboxThreadDetail,
  InboxThreadSummary,
  ListThreadsParams,
  MarkerSliceResponse,
  SupportedMailboxId,
} from "@/types/email"

export async function getMailboxThreads(
  mailbox: SupportedMailboxId,
  params: ListThreadsParams = {}
): Promise<MarkerSliceResponse<InboxThreadSummary>> {
  return getMockMailboxThreads(mailbox, params)

  // const path = mailbox === "INBOX" ? "/api/v1/threads/inbox" : "/api/v1/threads/sent"
  // return apiClient.get<MarkerSliceResponse<InboxThreadSummary>>(path, {
  //   params: params as Record<string, string | number | boolean | null | undefined>,
  // })
}

export async function getThreadDetail(threadId: string): Promise<InboxThreadDetail> {
  const detail = mockThreadDetails[threadId]

  if (!detail) {
    throw new Error(`Mock thread not found: ${threadId}`)
  }

  return detail

  // return apiClient.get<InboxThreadDetail>(`/api/v1/threads/${threadId}`)
}
