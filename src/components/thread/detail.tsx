import { Archive, ArrowLeft, Copy, Forward, MailOpen, Mail, Reply, Trash2 } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { MailErrorState } from "@/components/mail-error-state"
import { ThreadHeader } from "@/components/thread/header"
import { ThreadMessageList } from "@/components/thread/message-list"
import { ReplyDraftSuggestionAction } from "@/components/thread/reply-draft-suggestion-action"
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
} from "@/mutations/emails"
import { useDeleteMessage, useDeleteThread, useRestoreTrashMessage, useRestoreTrashThread } from "@/mutations/trash"
import { useThread } from "@/queries/emails"
import { useMailAccounts } from "@/queries/mail-accounts"
import type { InboxMessage } from "@/types/email"

function getThreadDetailErrorCopy(error: unknown) {
  switch (getHttpStatus(error)) {
    case 401:
      return {
        title: "로그인이 필요합니다",
        description: "세션이 만료되었거나 인증 정보가 없습니다. 다시 로그인한 뒤 스레드를 열어주세요.",
      }
    case 403:
      return {
        title: "이 스레드에 접근할 수 없습니다",
        description: "현재 로그인한 사용자에게 이 스레드를 볼 권한이 없습니다.",
      }
    case 404:
      return {
        title: "스레드를 찾을 수 없습니다",
        description: "삭제되었거나 더 이상 접근할 수 없는 메일 스레드입니다.",
      }
    default:
      return {
        title: "스레드 내용을 불러오지 못했습니다",
        description: getErrorMessage(error, "네트워크 상태를 확인한 뒤 다시 시도해주세요."),
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
        <p className="font-medium text-muted-foreground">스레드를 선택해주세요</p>
        <p className="mt-1 text-sm text-muted-foreground/70">목록에서 대화를 클릭하면 여기에 내용이 표시됩니다</p>
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
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="스레드 목록으로 돌아가기">
          <ArrowLeft />
        </Button>
      ) : (
        <span />
      )}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={onReply} aria-label="답장" title="답장">
          <Reply />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleRead}
          disabled={isTogglingRead}
          aria-label={isRead ? "스레드를 안읽음으로 표시" : "스레드를 읽음으로 표시"}
          title={isRead ? "안읽음으로 표시" : "읽음으로 표시"}
        >
          <Mail />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled title="전달 기능은 아직 지원되지 않습니다.">
          <Forward />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled title="보관 기능은 아직 지원되지 않습니다.">
          <Archive />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={isDeleting}
          title="삭제"
          aria-label="메일 삭제"
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
  threadId,
}: {
  onReply: () => void
  replyDraftMessage: InboxMessage | null
  threadId: string
}) {
  return (
    <div className="shrink-0 border-t px-6 py-2">
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
        <Button variant="outline" size="sm" onClick={onReply}>
          <Reply />
          답장
        </Button>
        {replyDraftMessage ? <ReplyDraftSuggestionAction threadId={threadId} message={replyDraftMessage} /> : null}
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
  const { expandedIds, toggleExpanded } = useThreadMessageExpansion({
    threadId,
    messages: thread?.messages ?? [],
    messageId,
  })

  const handleDeleteMessage = (message: InboxMessage, isLast: boolean) => {
    deleteMessage(message.id, {
      onSuccess: () => {
        if (isLast) onClose?.()
        toast("메시지를 휴지통으로 옮겼습니다", {
          action: {
            label: "실행 취소",
            onClick: () => {
              restoreMessage(message.id, {
                onSuccess: () => {
                  toast.success("삭제가 취소되었습니다")
                },
                onError: (err) => {
                  toast.error("삭제 취소에 실패했습니다", {
                    description: getErrorMessage(err, "잠시 후 다시 시도해주세요."),
                  })
                },
              })
            },
          },
        })
      },
      onError: (err) => {
        toast.error("메시지 삭제에 실패했습니다", {
          description: getErrorMessage(err, "잠시 후 다시 시도해주세요."),
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

  const handleDeleteThread = () => {
    if (!threadId) return
    deleteThread(threadId, {
      onSuccess: () => {
        onClose?.()
        toast("메일을 휴지통으로 옮겼습니다", {
          action: {
            label: "실행 취소",
            onClick: () => {
              restoreThread(threadId, {
                onSuccess: () => {
                  toast.success("삭제가 취소되었습니다")
                },
                onError: (err) => {
                  toast.error("삭제 취소에 실패했습니다", {
                    description: getErrorMessage(err, "잠시 후 다시 시도해주세요."),
                  })
                },
              })
            },
          },
        })
      },
      onError: (err) => {
        toast.error("메일 삭제에 실패했습니다", {
          description: getErrorMessage(err, "잠시 후 다시 시도해주세요."),
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
    <div className="flex h-full w-full min-w-0 flex-1 flex-col">
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
        renderMenuActions={(message) => (
          <>
            <DropdownMenuItem onClick={() => handleReply(message)}>
              <Reply />
              답장
            </DropdownMenuItem>
            <DropdownMenuItem disabled title="전달 기능은 아직 지원되지 않습니다.">
              <Forward />
              전달
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleMessageRead(message)}>
              <Mail />
              {message.isRead ? "안읽음으로 표시" : "읽음으로 표시"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => copyTextToClipboard(message.from.email, "발신자 주소를 복사했습니다")}>
              <Copy />
              발신자 주소 복사
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => handleDeleteMessage(message, messages.length === 1)}>
              <Trash2 />
              삭제
            </DropdownMenuItem>
          </>
        )}
      />
      <ThreadFooter onReply={() => handleReply()} threadId={thread.threadId} replyDraftMessage={replyDraftMessage} />
    </div>
  )
}
