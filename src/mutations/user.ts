import { useMutation } from "@tanstack/react-query"
import type { RegisterFcmTokenPayload, UpdateDefaultAccountPayload } from "@/types/user"

import { registerFcmToken, updateDefaultAccount } from "@/api/users"
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
  registerFcmToken: () => ({
    mutationFn: (data: RegisterFcmTokenPayload) => registerFcmToken(data),
  }),
}

export function useUpdateDefaultAccount() {
  return useMutation(userMutationOptions.updateDefaultAccount())
}

export function useRegisterFcmToken() {
  return useMutation(userMutationOptions.registerFcmToken())
}
