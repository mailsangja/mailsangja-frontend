import { useState } from "react"
import { Archive, ArrowLeft, ChevronsRight, Copy, Forward, MailOpen, Mail, Reply, Trash2 } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { MailErrorState } from "@/components/mail-error-state"
import { ThreadHeader } from "@/components/thread/header"
import { ThreadMessageList } from "@/components/thread/message-list"
import {
  ReplyDraftSuggestionButton,
  ReplyDraftSuggestionCards,
} from "@/components/thread/reply-draft-suggestion-action"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useThreadMessageExpansion } from "@/hooks/use-thread-message-expansion"
import { copyTextToClipboard } from "@/lib/clipboard"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import {
  useMarkMessageAsRead,
  useMarkMessageAsUnread,
  useMarkThreadAsRead,
  useMarkThreadAsUnread,
  useToggleMessageStar,
} from "@/mutations/emails"
import { useDeleteMessage, useDeleteThread, useRestoreTrashMessage, useRestoreTrashThread } from "@/mutations/trash"
import { m } from "@/paraglide/messages"
import { useThread } from "@/queries/emails"
import { useMailAccounts } from "@/queries/mail-accounts"
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
        description: m.thread_error_not_found_description(),
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
        <p className="mt-1 text-sm text-muted-foreground/70">{m.thread_select_description()}</p>
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
          {Array.from({ length: 3 }).map((_, index) => (
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

function getLatestInboundMessage(messages: readonly InboxMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]

    if (message?.direction === "INBOUND") {
      return message
    }
  }

  return null
}

interface ThreadToolbarProps {
  isRead: boolean
  onClose?: () => void
  onDelete: () => void
  onReply: () => void
  onToggleRead: () => void
  isDeleting: boolean
  isTogglingRead: boolean
}

function ThreadToolbar({
  isRead,
  onClose,
  onDelete,
  onReply,
  onToggleRead,
  isDeleting,
  isTogglingRead,
}: ThreadToolbarProps) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-4">
      {onClose ? (
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={m.thread_back_to_list()}>
          <ArrowLeft className="md:hidden" />
          <ChevronsRight className="hidden md:block" />
        </Button>
      ) : (
        <span />
      )}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={onReply} aria-label={m.thread_reply()} title={m.thread_reply()}>
          <Reply />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleRead}
          disabled={isTogglingRead}
          aria-label={isRead ? m.thread_mark_unread_aria() : m.thread_mark_read_aria()}
          title={isRead ? m.thread_mark_unread() : m.thread_mark_read()}
        >
          <Mail />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled title={m.thread_forward_disabled()}>
          <Forward />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled title={m.thread_archive_disabled()}>
          <Archive />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={isDeleting}
          title={m.common_delete()}
          aria-label={m.thread_delete_mail()}
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  )
}

function ThreadFooter({
  onReply,
  replyDraftMessage,
  onShowSuggestions,
}: {
  onReply: () => void
  replyDraftMessage: InboxMessage | null
  onShowSuggestions: () => void
}) {
  return (
    <div className="shrink-0 border-t px-6 py-2">
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
        <Button variant="outline" size="sm" onClick={onReply}>
          <Reply />
          {m.thread_reply()}
        </Button>
        {replyDraftMessage ? (
          <ReplyDraftSuggestionButton messageId={replyDraftMessage.id} onClick={onShowSuggestions} />
        ) : null}
      </div>
    </div>
  )
}

interface ThreadDetailProps {
  threadId: string | null
  messageId?: string | null
  onClose?: () => void
}

export function ThreadDetail({ threadId, messageId = null, onClose }: ThreadDetailProps) {
  const navigate = useNavigate()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [prevThreadId, setPrevThreadId] = useState(threadId)
  const [prevMessageId, setPrevMessageId] = useState(messageId)

  if (prevThreadId !== threadId || prevMessageId !== messageId) {
    setPrevThreadId(threadId)
    setPrevMessageId(messageId)
    setShowSuggestions(false)
  }
  const { data: thread, isLoading, isError, error, refetch } = useThread(threadId)
  const { data: accounts } = useMailAccounts()
  const { mutate: deleteThread, isPending: isDeleting } = useDeleteThread()
  const { mutate: restoreThread } = useRestoreTrashThread()
  const { mutate: deleteMessage } = useDeleteMessage()
  const { mutate: restoreMessage } = useRestoreTrashMessage()
  const { mutate: markThreadRead, isPending: isMarkingThreadRead } = useMarkThreadAsRead()
  const { mutate: markThreadUnread, isPending: isMarkingThreadUnread } = useMarkThreadAsUnread()
  const { mutate: markMessageRead } = useMarkMessageAsRead()
  const { mutate: markMessageUnread } = useMarkMessageAsUnread()
  const {
    mutate: toggleMessageStar,
    variables: togglingStarMessageId,
    isPending: isTogglingMessageStar,
  } = useToggleMessageStar()
  const { expandedIds, toggleExpanded } = useThreadMessageExpansion({
    threadId,
    messages: thread?.messages ?? [],
    messageId,
  })

  const handleDeleteMessage = (message: InboxMessage, isLast: boolean) => {
    deleteMessage(message.id, {
      onSuccess: () => {
        if (isLast) onClose?.()
        toast(m.thread_message_moved_to_trash(), {
          action: {
            label: m.common_undo(),
            onClick: () => {
              restoreMessage(message.id, {
                onSuccess: () => {
                  toast.success(m.mail_delete_undone())
                },
                onError: (err) => {
                  toast.error(m.thread_delete_undo_error(), {
                    description: getErrorMessage(err, m.common_try_again_later()),
                  })
                },
              })
            },
          },
        })
      },
      onError: (err) => {
        toast.error(m.thread_message_delete_error(), {
          description: getErrorMessage(err, m.common_try_again_later()),
        })
      },
    })
  }

  const handleReply = (message?: InboxMessage) => {
    if (!thread) return
    void navigate({
      to: "/compose",
      search: {
        thread: thread.threadId,
        ...(message ? { message: message.id } : {}),
      },
    })
  }

  const handleToggleThreadRead = () => {
    if (!thread) return
    if (thread.isRead) {
      markThreadUnread(thread.threadId)
    } else {
      markThreadRead(thread.threadId)
    }
  }

  const handleToggleMessageRead = (message: InboxMessage) => {
    if (message.isRead) {
      markMessageUnread(message.id)
    } else {
      markMessageRead(message.id)
    }
  }

  const handleToggleMessageStar = (message: InboxMessage) => {
    toggleMessageStar(message.id)
  }

  const handleDeleteThread = () => {
    if (!threadId) return
    deleteThread(threadId, {
      onSuccess: () => {
        onClose?.()
        toast(m.thread_mail_moved_to_trash(), {
          action: {
            label: m.common_undo(),
            onClick: () => {
              restoreThread(threadId, {
                onSuccess: () => {
                  toast.success(m.mail_delete_undone())
                },
                onError: (err) => {
                  toast.error(m.thread_delete_undo_error(), {
                    description: getErrorMessage(err, m.common_try_again_later()),
                  })
                },
              })
            },
          },
        })
      },
      onError: (err) => {
        toast.error(m.thread_mail_delete_error(), {
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

  const messages = thread.messages
  const account = accounts?.find((item) => item.id === thread.accountId)
  const replyDraftMessage = getLatestInboundMessage(messages)

  return (
    <div className="relative flex h-full w-full min-w-0 flex-1 flex-col">
      <ThreadToolbar
        isRead={thread.isRead}
        onClose={onClose}
        onDelete={handleDeleteThread}
        onReply={() => handleReply()}
        onToggleRead={handleToggleThreadRead}
        isDeleting={isDeleting}
        isTogglingRead={isMarkingThreadRead || isMarkingThreadUnread}
      />
      <ThreadHeader thread={thread} account={account} labels={thread.labels} />
      <ThreadMessageList
        messages={messages}
        expandedIds={expandedIds}
        onToggle={toggleExpanded}
        accountEmail={account?.emailAddress}
        onToggleMessageStar={handleToggleMessageStar}
        togglingStarMessageId={isTogglingMessageStar ? togglingStarMessageId : null}
        renderMenuActions={(message) => (
          <>
            <DropdownMenuItem onClick={() => handleReply(message)}>
              <Reply />
              {m.thread_reply()}
            </DropdownMenuItem>
            <DropdownMenuItem disabled title={m.thread_forward_disabled()}>
              <Forward />
              {m.thread_forward()}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleMessageRead(message)}>
              <Mail />
              {message.isRead ? m.thread_mark_unread() : m.thread_mark_read()}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => copyTextToClipboard(message.from.email, m.thread_sender_copied())}>
              <Copy />
              {m.thread_copy_sender()}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => handleDeleteMessage(message, messages.length === 1)}>
              <Trash2 />
              {m.common_delete()}
            </DropdownMenuItem>
          </>
        )}
      />
      {replyDraftMessage && (
        <ReplyDraftSuggestionCards
          threadId={thread.threadId}
          message={replyDraftMessage}
          show={showSuggestions}
          onClose={() => setShowSuggestions(false)}
        />
      )}
      <ThreadFooter
        onReply={() => handleReply()}
        replyDraftMessage={replyDraftMessage}
        onShowSuggestions={() => setShowSuggestions((prev) => !prev)}
      />
    </div>
  )
}
