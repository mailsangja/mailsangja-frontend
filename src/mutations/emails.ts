import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ComposeEmailData, MailReviewRequest } from "@/types/email"

import {
  markMessageAsRead,
  markMessageAsUnread,
  markThreadAsRead,
  markThreadAsUnread,
  reviewMail,
  selectReplyDraftSuggestion,
  sendMail,
  toggleMessageStar,
  toggleThreadStar,
} from "@/api/emails"
import { queryClient } from "@/lib/query-client"
import { m } from "@/paraglide/messages"
import { aiKeys } from "@/queries/ai"
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
      toast.error(m.mail_mark_read_error())
    },
  })
}

export function useMarkThreadAsUnread() {
  return useMutation({
    mutationFn: (threadId: string) => markThreadAsUnread(threadId),
    onSuccess: invalidateEmailAndLabelQueries,
    onError: () => {
      toast.error(m.mail_mark_unread_error())
    },
  })
}

export function useMarkThreadsAsRead() {
  return useMutation({
    mutationFn: async (threadIds: string[]) => {
      const results = await Promise.allSettled(threadIds.map((id) => markThreadAsRead(id)))
      const failed = results.filter((r) => r.status === "rejected").length
      return { failed }
    },
    onSettled: invalidateEmailAndLabelQueries,
    onSuccess: ({ failed }) => {
      if (failed > 0) toast.error(m.mail_mark_read_error())
    },
    onError: () => {
      toast.error(m.mail_mark_read_error())
    },
  })
}

export function useMarkThreadsAsUnread() {
  return useMutation({
    mutationFn: async (threadIds: string[]) => {
      const results = await Promise.allSettled(threadIds.map((id) => markThreadAsUnread(id)))
      const failed = results.filter((r) => r.status === "rejected").length
      return { failed }
    },
    onSettled: invalidateEmailAndLabelQueries,
    onSuccess: ({ failed }) => {
      if (failed > 0) toast.error(m.mail_mark_unread_error())
    },
    onError: () => {
      toast.error(m.mail_mark_unread_error())
    },
  })
}

export function useMarkMessageAsRead() {
  return useMutation({
    mutationFn: (messageId: string) => markMessageAsRead(messageId),
    onSuccess: invalidateEmailAndLabelQueries,
    onError: () => {
      toast.error(m.mail_mark_read_error())
    },
  })
}

export function useMarkMessageAsUnread() {
  return useMutation({
    mutationFn: (messageId: string) => markMessageAsUnread(messageId),
    onSuccess: invalidateEmailAndLabelQueries,
    onError: () => {
      toast.error(m.mail_mark_unread_error())
    },
  })
}

export function useToggleMessageStar() {
  return useMutation({
    mutationFn: toggleMessageStar,
    onSuccess: invalidateEmailAndLabelQueries,
    onError: () => {
      toast.error(m.mail_star_error())
    },
  })
}

export function useToggleThreadStar() {
  return useMutation({
    mutationFn: toggleThreadStar,
    onSuccess: invalidateEmailAndLabelQueries,
    onError: () => {
      toast.error(m.mail_star_error())
    },
  })
}

export function useSendMail() {
  return useMutation(emailMutationOptions.sendMail())
}

export function useReviewMail() {
  return useMutation({
    mutationFn: (request: MailReviewRequest) => reviewMail(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: aiKeys.all() })
    },
  })
}

export function useSelectReplyDraftSuggestion() {
  return useMutation({
    mutationFn: (suggestionId: string) => selectReplyDraftSuggestion(suggestionId),
  })
}
