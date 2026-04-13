import { queryOptions, useQuery } from "@tanstack/react-query"

import { getUserInfo } from "@/api/users"
import { getHttpStatus } from "@/lib/http-error"
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
          if (getHttpStatus(error) === 401) {
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
