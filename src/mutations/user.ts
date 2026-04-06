import { useMutation } from "@tanstack/react-query"
import type { UpdateDefaultAccountPayload } from "@/types/user"

import { updateDefaultAccount } from "@/api/users"
import { queryClient } from "@/lib/query-client"
import { mailAccountKeys } from "@/queries/mail-accounts"
import { userKeys } from "@/queries/user"

export const userMutationOptions = {
  updateDefaultAccount: () => ({
    mutationFn: (data: UpdateDefaultAccountPayload) => updateDefaultAccount(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all() })
      void queryClient.invalidateQueries({ queryKey: mailAccountKeys.all() })
    },
  }),
}

export function useUpdateDefaultAccount() {
  return useMutation(userMutationOptions.updateDefaultAccount())
}
