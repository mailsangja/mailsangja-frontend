import { QueryClient } from "@tanstack/react-query"

import { getHttpStatus } from "@/lib/http-error"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        const status = getHttpStatus(error)

        if (status !== undefined && status >= 400 && status < 500) {
          return false
        }

        return failureCount < 1
      },
      refetchOnWindowFocus: true,
    },
  },
})
