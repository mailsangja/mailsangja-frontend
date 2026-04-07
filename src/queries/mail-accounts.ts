import { useQuery } from "@tanstack/react-query"

import { getMailAccounts } from "@/api/mail-accounts"
import { useUser } from "@/queries/user"

export const mailAccountKeys = {
  all: () => ["mail-accounts"] as const,
  list: () => [...mailAccountKeys.all(), "list"] as const,
}

export const mailAccountQueries = {
  list: () => ({
    queryKey: mailAccountKeys.list(),
    queryFn: getMailAccounts,
  }),
}

export function useMailAccounts() {
  const { data: user } = useUser()

  return useQuery({
    ...mailAccountQueries.list(),
    enabled: user != null,
  })
}
