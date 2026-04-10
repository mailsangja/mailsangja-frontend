import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { getMailboxThreads, getThreadDetail } from "@/api/emails"
import type { SupportedMailboxId } from "@/types/email"

export const emailKeys = {
  all: () => ["emails"] as const,
  mailbox: (mailbox: SupportedMailboxId | null, size: number) =>
    [...emailKeys.all(), "mailbox", mailbox, size] as const,
  thread: (id: string) => [...emailKeys.all(), "thread", id] as const,
}

export function useMailboxThreads(mailbox: SupportedMailboxId | null, options: { size?: number } = {}) {
  const size = options.size ?? 50

  return useInfiniteQuery({
    queryKey: emailKeys.mailbox(mailbox, size),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      if (!mailbox) {
        throw new Error("Mailbox is required")
      }

      return getMailboxThreads(mailbox, { marker: pageParam, size })
    },
    getNextPageParam: (lastPage) => lastPage.nextMarker ?? undefined,
    enabled: mailbox != null,
  })
}

export function useThread(id: string | null) {
  return useQuery({
    queryKey: emailKeys.thread(id ?? ""),
    queryFn: () => getThreadDetail(id!),
    enabled: id != null,
  })
}
