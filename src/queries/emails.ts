import { queryOptions, useInfiniteQuery, useQuery } from "@tanstack/react-query"

import {
  getMailboxThreads,
  getReplyDraftSuggestions,
  getStarredThreads,
  getThreadDetail,
  searchMailHybrid,
} from "@/api/emails"
import type { HybridMailSearchParams, ListThreadsParams, StarredThreadsParams, SupportedMailboxId } from "@/types/email"

export const emailKeys = {
  all: () => ["emails"] as const,
  mailbox: (mailbox: SupportedMailboxId | null, params: Omit<ListThreadsParams, "marker">) =>
    [...emailKeys.all(), "mailbox", mailbox, params] as const,
  starred: (params: Omit<StarredThreadsParams, "marker">) => [...emailKeys.all(), "starred", params] as const,
  thread: (id: string) => [...emailKeys.all(), "thread", id] as const,
  replyDraftSuggestions: (messageId: string) => [...emailKeys.all(), "reply-draft-suggestions", messageId] as const,
  search: (params: HybridMailSearchParams) => [...emailKeys.all(), "search", params] as const,
}

export const emailQueries = {
  thread: (id: string) => ({
    queryKey: emailKeys.thread(id),
    queryFn: () => getThreadDetail(id),
  }),
  labelCount: (labelId: string) =>
    queryOptions({
      queryKey: [...emailKeys.all(), "label-count", labelId] as const,
      queryFn: () => getMailboxThreads("inbox", { size: 1, labelId: [labelId] }),
    }),
  replyDraftSuggestions: (messageId: string) =>
    queryOptions({
      queryKey: emailKeys.replyDraftSuggestions(messageId),
      queryFn: () => getReplyDraftSuggestions(messageId),
      enabled: !!messageId,
    }),
}

export function useMailboxThreads(mailbox: SupportedMailboxId | null, options: Omit<ListThreadsParams, "marker"> = {}) {
  const size = options.size ?? 50
  const params = {
    size,
    labelId: options.labelId,
    read: options.read,
    q: options.q,
  }

  return useInfiniteQuery({
    queryKey: emailKeys.mailbox(mailbox, params),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      if (!mailbox) {
        throw new Error("Mailbox is required")
      }

      return getMailboxThreads(mailbox, { ...params, marker: pageParam })
    },
    getNextPageParam: (lastPage) => lastPage.nextMarker ?? undefined,
    enabled: mailbox != null,
  })
}

export function useStarredThreads(options: Omit<StarredThreadsParams, "marker"> = {}, enabled = true) {
  const size = options.size ?? 50
  const params = {
    size,
    labelId: options.labelId,
    read: options.read,
    q: options.q,
  }

  return useInfiniteQuery({
    queryKey: emailKeys.starred(params),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getStarredThreads({ ...params, marker: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextMarker ?? undefined,
    enabled,
  })
}

export function useThread(id: string | null) {
  return useQuery({
    ...emailQueries.thread(id ?? ""),
    enabled: id != null,
  })
}

export function useReplyDraftSuggestions(messageId: string | null, enabled?: boolean) {
  return useQuery({
    ...emailQueries.replyDraftSuggestions(messageId ?? ""),
    enabled: (enabled ?? true) && messageId != null,
  })
}

export function useMailSearch(params: HybridMailSearchParams, enabled = true) {
  return useQuery({
    queryKey: emailKeys.search(params),
    queryFn: () => searchMailHybrid(params),
    enabled: enabled && params.q.trim().length > 0,
  })
}
