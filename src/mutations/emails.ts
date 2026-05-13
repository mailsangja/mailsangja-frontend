import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ComposeEmailData } from "@/types/email"

import { markThreadAsRead, sendMail } from "@/api/emails"
import { queryClient } from "@/lib/query-client"
import { emailKeys } from "@/queries/emails"
import { labelKeys } from "@/queries/labels"

export const emailMutationOptions = {
  sendMail: () => ({
    mutationKey: [...emailKeys.all(), "send"] as const,
    mutationFn: (data: ComposeEmailData) => sendMail(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: emailKeys.all() })
    },
  }),
}

export function useMarkThreadAsRead() {
  return useMutation({
    mutationFn: (threadId: string) => markThreadAsRead(threadId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: emailKeys.all() })
      void queryClient.invalidateQueries({ queryKey: labelKeys.all() })
    },
    onError: () => {
      toast.error("읽음 처리에 실패했습니다")
    },
  })
}

export function useSendMail() {
  return useMutation(emailMutationOptions.sendMail())
}
