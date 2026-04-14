import { useMutation } from "@tanstack/react-query"

import { deleteMessage, deleteThread, restoreTrashMessage, restoreTrashThread } from "@/api/trash"
import { queryClient } from "@/lib/query-client"
import { emailKeys } from "@/queries/emails"
import { trashKeys } from "@/queries/trash"

function invalidateMailboxesAndTrash() {
  void queryClient.invalidateQueries({ queryKey: emailKeys.all() })
  void queryClient.invalidateQueries({ queryKey: trashKeys.all() })
}

export const trashMutationOptions = {
  deleteThread: () => ({
    mutationFn: (threadId: string) => deleteThread(threadId),
    onSuccess: invalidateMailboxesAndTrash,
  }),
  deleteMessage: () => ({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: invalidateMailboxesAndTrash,
  }),
  restoreThread: () => ({
    mutationFn: (threadId: string) => restoreTrashThread(threadId),
    onSuccess: invalidateMailboxesAndTrash,
  }),
  restoreMessage: () => ({
    mutationFn: (messageId: string) => restoreTrashMessage(messageId),
    onSuccess: invalidateMailboxesAndTrash,
  }),
}

export function useDeleteThread() {
  return useMutation(trashMutationOptions.deleteThread())
}

export function useDeleteMessage() {
  return useMutation(trashMutationOptions.deleteMessage())
}

export function useRestoreTrashThread() {
  return useMutation(trashMutationOptions.restoreThread())
}

export function useRestoreTrashMessage() {
  return useMutation(trashMutationOptions.restoreMessage())
}
