import { queryOptions, useQuery } from "@tanstack/react-query"

import { getUserInfo } from "@/api/users"
import { HttpError } from "@/lib/api-client"
import type { User } from "@/types/user"

export const userKeys = {
  all: () => ["user"] as const,
  me: () => [...userKeys.all(), "me"] as const,
}

export const userQueries = {
  me: () =>
    queryOptions({
      queryKey: userKeys.me(),
      queryFn: async (): Promise<User | null> => {
        try {
          return await getUserInfo()
        } catch (error) {
          if (error instanceof HttpError && error.status === 401) {
            return null
          }

          throw error
        }
      },
    }),
}

export function useUser() {
  return useQuery(userQueries.me())
}
