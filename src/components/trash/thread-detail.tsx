import { useState } from "react"
import { ArrowLeft, Copy, MailOpen, Undo2 } from "lucide-react"
import { toast } from "sonner"

import { MailErrorState } from "@/components/mail-error-state"
import { ThreadHeader } from "@/components/thread/header"
import { ThreadMessageList } from "@/components/thread/message-list"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { copyTextToClipboard } from "@/lib/clipboard"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { useRestoreTrashMessage, useRestoreTrashThread } from "@/mutations/trash"
import { m } from "@/paraglide/messages"
import { useMailAccounts } from "@/queries/mail-accounts"
import { useTrashThread } from "@/queries/trash"
import type { InboxMessage } from "@/types/email"

function getThreadDetailErrorCopy(error: unknown) {
  switch (getHttpStatus(error)) {
    case 401:
      return {
        title: m.thread_error_login_title(),
        description: m.thread_error_login_description(),
      }
    case 403:
      return {
        title: m.thread_error_forbidden_title(),
        description: m.thread_error_forbidden_description(),
      }
    case 404:
      return {
        title: m.thread_error_not_found_title(),
        description: m.trash_thread_error_not_found_description(),
      }
    default:
      return {
        title: m.thread_error_generic_title(),
        description: getErrorMessage(error, m.thread_error_generic_description()),
      }
  }
}

function EmptyState() {
  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col items-center justify-center gap-3">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <MailOpen className="size-8 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="font-medium text-muted-foreground">{m.thread_select_title()}</p>
        <p className="mt-1 text-sm text-muted-foreground/70">{m.trash_select_description()}</p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col">
      <div className="flex h-11 w-full min-w-0 shrink-0 items-center justify-between gap-2 px-4">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="size-7 rounded-md" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-7 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Separator />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

interface TrashToolbarProps {
  onClose?: () => void
  onRestore: () => void
  isRestoring: boolean
}

function TrashToolbar({ onClose, onRestore, isRestoring }: TrashToolbarProps) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-4">
      {onClose ? (
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={m.trash_back_to_list()}>
          <ArrowLeft className="size-4" />
        </Button>
      ) : (
        <span />
      )}
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRestore}
          disabled={isRestoring}
          title={m.trash_restore()}
          aria-label={m.trash_restore_mail()}
        >
          <Undo2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function TrashFooter({ onRestore, isRestoring }: { onRestore: () => void; isRestoring: boolean }) {
  return (
    <div className="shrink-0 border-t px-6 py-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onRestore} disabled={isRestoring}>
          <Undo2 className="size-4" />
          {m.trash_restore()}
        </Button>
      </div>
    </div>
  )
}

interface TrashThreadDetailProps {
  threadId: string | null
  onClose?: () => void
}

export function TrashThreadDetail({ threadId, onClose }: TrashThreadDetailProps) {
  const { data: thread, isLoading, isError, error, refetch } = useTrashThread(threadId)
  const { data: accounts } = useMailAccounts()
  const { mutate: restoreThread, isPending: isRestoringThread } = useRestoreTrashThread()
  const { mutate: restoreMessage } = useRestoreTrashMessage()

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null)

  if (thread && thread.threadId !== expandedThreadId) {
    const next = new Set<string>()
    const last = thread.messages.at(-1)
    if (last) next.add(last.id)
    setExpandedIds(next)
    setExpandedThreadId(thread.threadId)
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleRestoreThread = () => {
    if (!threadId) return
    restoreThread(threadId, {
      onSuccess: () => {
        onClose?.()
        toast.success(m.trash_thread_restored())
      },
      onError: (err) => {
        toast.error(m.trash_restore_error(), {
          description: getErrorMessage(err, m.common_try_again_later()),
        })
      },
    })
  }

  const handleRestoreMessage = (message: InboxMessage, isLast: boolean) => {
    restoreMessage(message.id, {
      onSuccess: () => {
        if (isLast) onClose?.()
        toast.success(m.trash_message_restored())
      },
      onError: (err) => {
        toast.error(m.trash_restore_error(), {
          description: getErrorMessage(err, m.common_try_again_later()),
        })
      },
    })
  }

  if (!threadId) return <EmptyState />
  if (isLoading) return <LoadingState />
  if (isError) {
    const errorCopy = getThreadDetailErrorCopy(error)
    return <MailErrorState title={errorCopy.title} description={errorCopy.description} onRetry={() => void refetch()} />
  }
  if (!thread) return <EmptyState />

  const account = accounts?.find((item) => item.id === thread.accountId)
  const messages = thread.messages

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col">
      <TrashToolbar onClose={onClose} onRestore={handleRestoreThread} isRestoring={isRestoringThread} />
      <ThreadHeader thread={thread} account={account} labels={thread.labels} />
      <ThreadMessageList
        messages={messages}
        expandedIds={expandedIds}
        onToggle={toggleExpanded}
        accountEmail={account?.emailAddress}
        renderMenuActions={(message) => (
          <>
            <DropdownMenuItem onClick={() => handleRestoreMessage(message, messages.length === 1)}>
              <Undo2 />
              {m.trash_restore()}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => copyTextToClipboard(message.from.email, m.thread_sender_copied())}>
              <Copy />
              {m.thread_copy_sender()}
            </DropdownMenuItem>
          </>
        )}
      />
      <TrashFooter onRestore={handleRestoreThread} isRestoring={isRestoringThread} />
    </div>
  )
}
