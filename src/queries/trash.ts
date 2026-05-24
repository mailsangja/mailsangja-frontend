import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { getTrashThreadDetail, getTrashThreads } from "@/api/trash"
import type { ListThreadsParams } from "@/types/email"

export const trashKeys = {
  all: () => ["trash"] as const,
  list: (params: Omit<ListThreadsParams, "marker">) => [...trashKeys.all(), "list", params] as const,
  thread: (id: string) => [...trashKeys.all(), "thread", id] as const,
}

export function useTrashThreads(options: Omit<ListThreadsParams, "marker"> = {}) {
  const size = options.size ?? 50
  const params = {
    size,
    labelId: options.labelId,
    read: options.read,
    q: options.q,
  }

  return useInfiniteQuery({
    queryKey: trashKeys.list(params),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getTrashThreads({ ...params, marker: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextMarker ?? undefined,
  })
}

export function useTrashThread(id: string | null) {
  return useQuery({
    queryKey: trashKeys.thread(id ?? ""),
    queryFn: () => getTrashThreadDetail(id!),
    enabled: id != null,
  })
}
