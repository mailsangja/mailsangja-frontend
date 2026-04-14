import { useInfiniteQuery, useQuery } from "@tanstack/react-query"

import { getTrashThreadDetail, getTrashThreads } from "@/api/trash"

export const trashKeys = {
  all: () => ["trash"] as const,
  list: (size: number) => [...trashKeys.all(), "list", size] as const,
  thread: (id: string) => [...trashKeys.all(), "thread", id] as const,
}

export function useTrashThreads(options: { size?: number } = {}) {
  const size = options.size ?? 50

  return useInfiniteQuery({
    queryKey: trashKeys.list(size),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => getTrashThreads({ marker: pageParam, size }),
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
