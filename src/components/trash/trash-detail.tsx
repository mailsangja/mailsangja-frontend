import { ArrowLeft, MailOpen, Undo2 } from "lucide-react"
import { toast } from "sonner"

import { EmailErrorState } from "@/components/inbox/email-error-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { AccountIcon } from "@/lib/icon-entries"
import { useRestoreTrashMessage, useRestoreTrashThread } from "@/mutations/trash"
import { useMailAccounts } from "@/queries/mail-accounts"
import { useTrashThread } from "@/queries/trash"
import type { MailAccount } from "@/types/mail-account"
import type { TrashMessage, TrashThreadDetail } from "@/types/trash"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function getInitials(value: string) {
  const localPart = value.split("@")[0]?.trim() ?? ""
  return localPart.slice(0, 2).toUpperCase() || "?"
}

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
        description: "영구 삭제되었거나 더 이상 접근할 수 없는 메일 스레드입니다.",
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
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <MailOpen className="size-8 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="font-medium text-muted-foreground">스레드를 선택해주세요</p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          휴지통 목록에서 항목을 클릭하면 여기에 내용이 표시됩니다
        </p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 w-full min-w-0 shrink-0 items-center justify-between gap-2 px-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-20 rounded-md" />
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
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="휴지통 목록으로 돌아가기">
          <ArrowLeft className="size-4" />
        </Button>
      ) : (
        <span />
      )}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onRestore} disabled={isRestoring} aria-label="스레드 복구">
          <Undo2 className="size-4" />
          복구
        </Button>
      </div>
    </div>
  )
}

interface ThreadHeaderProps {
  thread: TrashThreadDetail
  account?: MailAccount
}

function ThreadHeader({ thread, account }: ThreadHeaderProps) {
  const latestSubject = thread.messages.at(-1)?.subject || "(제목 없음)"
  const messageCount = thread.messages.length
  const hasInbound = thread.messages.some((m) => m.direction === "INBOUND")
  const hasOutbound = thread.messages.some((m) => m.direction === "OUTBOUND")

  return (
    <div className="shrink-0 border-b px-6 pt-2 pb-5">
      <h2 className="text-xl leading-snug font-semibold wrap-break-word">{latestSubject}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {account?.icon ? (
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: account.color }}
            aria-label={`${account.emailAddress} 계정`}
            title={account.emailAddress}
          >
            <AccountIcon name={account.icon} className="size-3 text-white" />
          </span>
        ) : null}
        {hasInbound && (
          <Badge variant="outline" className="font-normal">
            수신
          </Badge>
        )}
        {hasOutbound && (
          <Badge variant="outline" className="font-normal">
            발신
          </Badge>
        )}
        <Badge variant="secondary" className="font-normal">
          메시지 {messageCount}개
        </Badge>
      </div>
    </div>
  )
}

interface MessageItemProps {
  message: TrashMessage
  onRestore: () => void
  isRestoring: boolean
}

function MessageItem({ message, onRestore, isRestoring }: MessageItemProps) {
  const senderLabel = message.fromAddress || "알 수 없음"
  const receivers = message.toAddresses.length > 0 ? message.toAddresses.join(", ") : "-"

  return (
    <article className="w-full min-w-0 p-4">
      <header className="flex items-start gap-3">
        <Avatar>
          <AvatarFallback>{getInitials(senderLabel)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold">{senderLabel}</p>
          <p className="mt-0.5 text-xs break-all text-muted-foreground">받는 사람: {receivers}</p>
          <p className="mt-1 truncate text-sm">{message.subject || "(제목 없음)"}</p>
          {message.snippet ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{message.snippet}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="hidden truncate text-xs text-muted-foreground/80 sm:inline">
            {formatDate(message.sentAt)}
          </span>
          <Button variant="outline" size="sm" onClick={onRestore} disabled={isRestoring} aria-label="메시지 복구">
            <Undo2 className="size-4" />
            복구
          </Button>
        </div>
      </header>
    </article>
  )
}

interface TrashDetailProps {
  threadId: string | null
  onClose?: () => void
}

export function TrashDetail({ threadId, onClose }: TrashDetailProps) {
  const { data: thread, isLoading, isError, error, refetch } = useTrashThread(threadId)
  const { data: accounts } = useMailAccounts()
  const { mutate: restoreThread, isPending: isRestoringThread } = useRestoreTrashThread()
  const { mutate: restoreMessage, isPending: isRestoringMessage } = useRestoreTrashMessage()

  const handleRestoreThread = () => {
    if (!threadId) return
    restoreThread(threadId, {
      onSuccess: () => {
        onClose?.()
        toast.success("스레드를 복구했습니다")
      },
      onError: (err) => {
        toast.error("복구에 실패했습니다", {
          description: getErrorMessage(err, "잠시 후 다시 시도해주세요."),
        })
      },
    })
  }

  const handleRestoreMessage = (messageId: string, isLast: boolean) => {
    restoreMessage(messageId, {
      onSuccess: () => {
        if (isLast) onClose?.()
        toast.success("메시지를 복구했습니다")
      },
      onError: (err) => {
        toast.error("복구에 실패했습니다", {
          description: getErrorMessage(err, "잠시 후 다시 시도해주세요."),
        })
      },
    })
  }

  if (!threadId) return <EmptyState />
  if (isLoading) return <LoadingState />
  if (isError) {
    const errorCopy = getThreadDetailErrorCopy(error)
    return (
      <EmailErrorState title={errorCopy.title} description={errorCopy.description} onRetry={() => void refetch()} />
    )
  }
  if (!thread) return <EmptyState />

  const account = accounts?.find((item) => item.id === thread.accountId)
  const messages = thread.messages

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col">
      <TrashToolbar onClose={onClose} onRestore={handleRestoreThread} isRestoring={isRestoringThread} />
      <ThreadHeader thread={thread} account={account} />

      <div className="flex-1 overflow-auto">
        <div className="p-2">
          <div className="divide-y overflow-hidden rounded-lg border bg-card">
            {messages.map((message) => (
              <MessageItem
                key={message.messageId}
                message={message}
                onRestore={() => handleRestoreMessage(message.messageId, messages.length === 1)}
                isRestoring={isRestoringMessage}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
