import { useMutation } from "@tanstack/react-query"
import type { RegisterFcmTokenPayload, UnregisterFcmTokenPayload, UpdateDefaultAccountPayload } from "@/types/user"

import { registerFcmToken, unregisterFcmToken, updateDefaultAccount } from "@/api/users"
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
  unregisterFcmToken: () => ({
    mutationFn: (data: UnregisterFcmTokenPayload) => unregisterFcmToken(data),
  }),
}

export function useUpdateDefaultAccount() {
  return useMutation(userMutationOptions.updateDefaultAccount())
}

export function useRegisterFcmToken() {
  return useMutation(userMutationOptions.registerFcmToken())
}

export function useUnregisterFcmToken() {
  return useMutation(userMutationOptions.unregisterFcmToken())
}
