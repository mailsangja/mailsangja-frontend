import { queryOptions, useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { getMailboxThreads, getThreadDetail } from "@/api/emails"
import type { ListThreadsParams, SupportedMailboxId } from "@/types/email"

export const emailKeys = {
  all: () => ["emails"] as const,
  mailbox: (mailbox: SupportedMailboxId | null, params: Omit<ListThreadsParams, "marker">) =>
    [...emailKeys.all(), "mailbox", mailbox, params] as const,
  thread: (id: string) => [...emailKeys.all(), "thread", id] as const,
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
}

export function useMailboxThreads(mailbox: SupportedMailboxId | null, options: Omit<ListThreadsParams, "marker"> = {}) {
  const size = options.size ?? 50
  const params = {
    size,
    labelId: options.labelId,
    read: options.read,
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

export function useThread(id: string | null) {
  return useQuery({
    ...emailQueries.thread(id ?? ""),
    enabled: id != null,
  })
}
