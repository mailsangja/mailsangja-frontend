import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  activateMailAccount,
  deactivateMailAccount,
  deleteMailAccount,
  updateMailAccountAppearance,
} from "@/api/mail-accounts"
import { getErrorMessage } from "@/lib/http-error"
import { queryClient } from "@/lib/query-client"
import { mailAccountKeys } from "@/queries/mail-accounts"
import { userKeys } from "@/queries/user"
import type { UpdateMailAccountAppearancePayload } from "@/types/mail-account"

function invalidateMailAccounts() {
  void queryClient.invalidateQueries({ queryKey: mailAccountKeys.all() })
}

function invalidateMailAccountsAndUser() {
  invalidateMailAccounts()
  void queryClient.invalidateQueries({ queryKey: userKeys.all() })
}

export function useUpdateMailAccountAppearance() {
  return useMutation({
    mutationFn: ({ mailAccountId, data }: { mailAccountId: string; data: UpdateMailAccountAppearancePayload }) =>
      updateMailAccountAppearance(mailAccountId, data),
    onSuccess: invalidateMailAccounts,
    onError: (error) => {
      toast.error(getErrorMessage(error, "메일 계정 정보 변경에 실패했습니다."))
    },
  })
}

export function useDeleteMailAccount() {
  return useMutation({
    mutationFn: (mailAccountId: string) => deleteMailAccount(mailAccountId),
    onSuccess: invalidateMailAccountsAndUser,
    onError: (error) => {
      toast.error(getErrorMessage(error, "메일 계정 삭제에 실패했습니다."))
    },
  })
}

export function useActivateMailAccount() {
  return useMutation({
    mutationFn: (mailAccountId: string) => activateMailAccount(mailAccountId),
    onSuccess: invalidateMailAccounts,
    onError: (error) => {
      toast.error(getErrorMessage(error, "메일 계정 활성화에 실패했습니다."))
    },
  })
}

export function useDeactivateMailAccount() {
  return useMutation({
    mutationFn: (mailAccountId: string) => deactivateMailAccount(mailAccountId),
    onSuccess: invalidateMailAccounts,
    onError: (error) => {
      toast.error(getErrorMessage(error, "메일 계정 비활성화에 실패했습니다."))
    },
  })
}
