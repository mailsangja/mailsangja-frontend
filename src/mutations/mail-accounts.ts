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
import { emailKeys } from "@/queries/emails"
import { labelKeys } from "@/queries/labels"
import { mailAccountKeys } from "@/queries/mail-accounts"
import { trashKeys } from "@/queries/trash"
import { userKeys } from "@/queries/user"
import type { MailAccount, UpdateMailAccountAppearancePayload } from "@/types/mail-account"

function invalidateMailAccounts() {
  void queryClient.invalidateQueries({ queryKey: mailAccountKeys.all() })
}

function invalidateMailboxes() {
  void queryClient.invalidateQueries({ queryKey: emailKeys.all() })
  void queryClient.invalidateQueries({ queryKey: trashKeys.all() })
  void queryClient.invalidateQueries({ queryKey: labelKeys.all() })
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

function patchIsActive(mailAccountId: string, isActive: boolean) {
  queryClient.setQueryData<MailAccount[]>(mailAccountKeys.list(), (old) =>
    old?.map((a) => (a.id === mailAccountId ? { ...a, isActive } : a))
  )
}

export function useActivateMailAccount() {
  return useMutation({
    mutationFn: (mailAccountId: string) => activateMailAccount(mailAccountId),
    onMutate: async (mailAccountId) => {
      await queryClient.cancelQueries({ queryKey: mailAccountKeys.list() })
      const previous = queryClient.getQueryData<MailAccount[]>(mailAccountKeys.list())
      patchIsActive(mailAccountId, true)
      return { previous }
    },
    onError: (error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(mailAccountKeys.list(), context.previous)
      toast.error(getErrorMessage(error, "메일 계정 활성화에 실패했습니다."))
    },
    onSettled: () => {
      invalidateMailAccounts()
      invalidateMailboxes()
    },
  })
}

export function useDeactivateMailAccount() {
  return useMutation({
    mutationFn: (mailAccountId: string) => deactivateMailAccount(mailAccountId),
    onMutate: async (mailAccountId) => {
      await queryClient.cancelQueries({ queryKey: mailAccountKeys.list() })
      const previous = queryClient.getQueryData<MailAccount[]>(mailAccountKeys.list())
      patchIsActive(mailAccountId, false)
      return { previous }
    },
    onError: (error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(mailAccountKeys.list(), context.previous)
      toast.error(getErrorMessage(error, "메일 계정 비활성화에 실패했습니다."))
    },
    onSettled: () => {
      invalidateMailAccounts()
      invalidateMailboxes()
    },
  })
}
