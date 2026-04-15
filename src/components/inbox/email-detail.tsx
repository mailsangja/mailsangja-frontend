import { useState } from "react"
import { Archive, ArrowLeft, FileText, Forward, MailOpen, MoreVertical, Reply, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { EmailErrorState } from "@/components/inbox/email-error-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { formatMailAddressList, getMailAddressLabel } from "@/lib/mail-address"
import { useDeleteMessage, useDeleteThread, useRestoreTrashMessage, useRestoreTrashThread } from "@/mutations/trash"
import { useThread } from "@/queries/emails"
import type { Attachment, InboxMessage, InboxThreadDetail } from "@/types/email"

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
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
    <div className="flex h-full flex-col items-center justify-center gap-3">
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
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-4">
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

interface ThreadToolbarProps {
  onClose?: () => void
  onDelete: () => void
  isDeleting: boolean
}

function ThreadToolbar({ onClose, onDelete, isDeleting }: ThreadToolbarProps) {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-4">
      {onClose ? (
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="스레드 목록으로 돌아가기">
          <ArrowLeft className="size-4" />
        </Button>
      ) : (
        <span />
      )}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" disabled title="답장 기능은 아직 지원되지 않습니다.">
          <Reply className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled title="전달 기능은 아직 지원되지 않습니다.">
          <Forward className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" disabled title="보관 기능은 아직 지원되지 않습니다.">
          <Archive className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={isDeleting}
          title="삭제"
          aria-label="메일 삭제"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

interface ThreadHeaderProps {
  thread: InboxThreadDetail
}

function ThreadHeader({ thread }: ThreadHeaderProps) {
  const messageCount = thread.messages.length
  const hasInbound = thread.messages.some((m) => m.direction === "INBOUND")
  const hasOutbound = thread.messages.some((m) => m.direction === "OUTBOUND")

  return (
    <div className="shrink-0 border-b px-6 pt-2 pb-5">
      <h2 className="text-xl leading-snug font-semibold break-words">{thread.latestSubject || "(제목 없음)"}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-normal">
          메시지 {messageCount}개
        </Badge>
        {hasInbound ? (
          <Badge variant="outline" className="font-normal">
            수신
          </Badge>
        ) : null}
        {hasOutbound ? (
          <Badge variant="outline" className="font-normal">
            발신
          </Badge>
        ) : null}
      </div>
    </div>
  )
}

interface AttachmentChipProps {
  attachment: Attachment
}

function AttachmentChip({ attachment }: AttachmentChipProps) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs transition-colors hover:bg-muted">
      <FileText className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate font-medium">{attachment.filename}</span>
      <span className="shrink-0 text-muted-foreground">{formatFileSize(attachment.size)}</span>
    </div>
  )
}

interface MessageItemProps {
  message: InboxMessage
  isExpanded: boolean
  onToggle: () => void
  onDelete: () => void
}

function MessageItem({ message, isExpanded, onToggle, onDelete }: MessageItemProps) {
  const senderName = getMailAddressLabel(message.from)
  const senderEmail = message.from.email

  return (
    <article className="p-4">
      <header
        className="flex cursor-pointer items-start gap-3"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onToggle()
          }
        }}
        aria-expanded={isExpanded}
      >
        <Avatar>
          <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate text-sm font-semibold">{senderName}</p>
            {senderEmail && senderEmail !== senderName ? (
              <p className="truncate text-xs text-muted-foreground">&lt;{senderEmail}&gt;</p>
            ) : null}
          </div>
          {isExpanded ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              받는 사람: {message.to.length > 0 ? formatMailAddressList(message.to) : "-"}
            </p>
          ) : (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{message.snippet}</p>
          )}
          {isExpanded && message.cc.length > 0 ? (
            <p className="mt-0.5 text-xs text-muted-foreground">참조: {formatMailAddressList(message.cc)}</p>
          ) : null}
        </div>

        <div
          className="flex shrink-0 items-center gap-1"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <span className="text-xs whitespace-nowrap text-muted-foreground/80">{formatDate(message.sentAt)}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled
            title="즐겨찾기는 아직 지원되지 않습니다."
            aria-label="즐겨찾기"
          >
            <Star className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="메시지 더보기" />}>
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete}>
                <Trash2 className="size-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {isExpanded ? (
        <div className="mt-4 pl-13">
          {message.bodyHtml ? (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />
          ) : (
            <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">{message.bodyText}</div>
          )}

          {message.attachments.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                <AttachmentChip key={attachment.id} attachment={attachment} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function ThreadFooter() {
  return (
    <div className="shrink-0 border-t px-6 py-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled title="답장 기능은 아직 지원되지 않습니다.">
          <Reply className="size-4" />
          답장
        </Button>
        <Button variant="outline" size="sm" disabled title="전달 기능은 아직 지원되지 않습니다.">
          <Forward className="size-4" />
          전달
        </Button>
      </div>
    </div>
  )
}

interface EmailDetailProps {
  threadId: string | null
  onClose?: () => void
}

export function EmailDetail({ threadId, onClose }: EmailDetailProps) {
  const { data: thread, isLoading, isError, error, refetch } = useThread(threadId)
  const { mutate: deleteThread, isPending: isDeleting } = useDeleteThread()
  const { mutate: restoreThread } = useRestoreTrashThread()
  const { mutate: deleteMessage } = useDeleteMessage()
  const { mutate: restoreMessage } = useRestoreTrashMessage()

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null)

  if (thread && thread.threadId !== expandedThreadId) {
    const next = new Set<string>()
    const last = thread.messages.at(-1)
    if (last) next.add(last.id)
    for (const message of thread.messages) {
      if (!message.isRead) next.add(message.id)
    }
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

  const handleDeleteMessage = (messageId: string, isLast: boolean) => {
    deleteMessage(messageId, {
      onSuccess: () => {
        if (isLast) onClose?.()
        toast("메시지를 휴지통으로 옮겼습니다", {
          action: {
            label: "실행 취소",
            onClick: () => {
              restoreMessage(messageId, {
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
    return (
      <EmailErrorState title={errorCopy.title} description={errorCopy.description} onRetry={() => void refetch()} />
    )
  }
  if (!thread) return <EmptyState />

  const messages = thread.messages

  return (
    <div className="flex h-full flex-col">
      <ThreadToolbar onClose={onClose} onDelete={handleDeleteThread} isDeleting={isDeleting} />
      <ThreadHeader thread={thread} />

      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="divide-y rounded-lg border bg-card">
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isExpanded={expandedIds.has(message.id)}
                onToggle={() => toggleExpanded(message.id)}
                onDelete={() => handleDeleteMessage(message.id, messages.length === 1)}
              />
            ))}
          </div>
        </div>
      </div>
      <ThreadFooter />
    </div>
  )
}
