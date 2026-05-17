import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ComposeEmailData } from "@/types/email"

import { markMessageAsRead, markMessageAsUnread, markThreadAsRead, markThreadAsUnread, sendMail } from "@/api/emails"
import { queryClient } from "@/lib/query-client"
import { emailKeys } from "@/queries/emails"
import { labelKeys } from "@/queries/labels"

function invalidateEmailAndLabelQueries() {
  void queryClient.invalidateQueries({ queryKey: emailKeys.all() })
  void queryClient.invalidateQueries({ queryKey: labelKeys.all() })
}

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
    onSuccess: invalidateEmailAndLabelQueries,
    onError: () => {
      toast.error("읽음 처리에 실패했습니다")
    },
  })
}

export function useMarkThreadAsUnread() {
  return useMutation({
    mutationFn: (threadId: string) => markThreadAsUnread(threadId),
    onSuccess: invalidateEmailAndLabelQueries,
    onError: () => {
      toast.error("안읽음 처리에 실패했습니다")
    },
  })
}

export function useMarkMessageAsRead() {
  return useMutation({
    mutationFn: (messageId: string) => markMessageAsRead(messageId),
    onSuccess: invalidateEmailAndLabelQueries,
    onError: () => {
      toast.error("읽음 처리에 실패했습니다")
    },
  })
}

export function useMarkMessageAsUnread() {
  return useMutation({
    mutationFn: (messageId: string) => markMessageAsUnread(messageId),
    onSuccess: invalidateEmailAndLabelQueries,
    onError: () => {
      toast.error("안읽음 처리에 실패했습니다")
    },
  })
}

export function useSendMail() {
  return useMutation(emailMutationOptions.sendMail())
}
