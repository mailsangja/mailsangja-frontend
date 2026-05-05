import { useState } from "react"
import { Archive, ArrowLeft, Forward, MailOpen, MoreVertical, Reply, Star, Trash2 } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { AttachmentChip } from "@/components/attachment-chip"
import { EmailErrorState } from "@/components/inbox/email-error-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { AccountIcon } from "@/lib/icon-entries"
import { formatMailAddressList, getMailAddressLabel } from "@/lib/mail-address"
import { useDeleteMessage, useDeleteThread, useRestoreTrashMessage, useRestoreTrashThread } from "@/mutations/trash"
import { useThread } from "@/queries/emails"
import { useMailAccounts } from "@/queries/mail-accounts"
import type { InboxMessage, InboxThreadDetail } from "@/types/email"
import type { MailAccount } from "@/types/mail-account"

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

interface ThreadToolbarProps {
  onClose?: () => void
  onDelete: () => void
  onReply: () => void
  isDeleting: boolean
}

function ThreadToolbar({ onClose, onDelete, onReply, isDeleting }: ThreadToolbarProps) {
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
        <Button variant="ghost" size="icon-sm" onClick={onReply} aria-label="답장" title="답장">
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
  account?: MailAccount
}

function ThreadHeader({ thread, account }: ThreadHeaderProps) {
  const messageCount = thread.messages.length
  const hasInbound = thread.messages.some((m) => m.direction === "INBOUND")
  const hasOutbound = thread.messages.some((m) => m.direction === "OUTBOUND")

  return (
    <div className="shrink-0 border-b px-6 pt-2 pb-5">
      <h2 className="text-xl leading-snug font-semibold wrap-break-word">{thread.latestSubject || "(제목 없음)"}</h2>
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

function MessageBodyFrame({ html }: { html: string }) {
  const [height, setHeight] = useState(0)

  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{margin:0;padding:0;font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;color:#111;word-break:break-word;overflow-wrap:anywhere;overflow:hidden}img{max-width:100%;height:auto}</style></head><body>${html}</body></html>`

  return (
    <iframe
      title="메일 본문"
      sandbox="allow-same-origin allow-popups"
      srcDoc={srcDoc}
      className="w-full border-0 bg-white"
      style={{ height: height || 200 }}
      onLoad={(event) => {
        const doc = event.currentTarget.contentDocument
        if (!doc) return
        const next = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight)
        setHeight(next)
      }}
    />
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
    <article className="w-full min-w-0 p-4">
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

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 items-baseline gap-2">
            <p className="shrink-0 truncate text-sm font-semibold">{senderName}</p>
            {senderEmail && senderEmail !== senderName ? (
              <p className="hidden min-w-0 flex-1 truncate text-xs text-muted-foreground sm:block">
                &lt;{senderEmail}&gt;
              </p>
            ) : null}
          </div>
          {isExpanded ? (
            <p className="mt-0.5 text-xs break-all text-muted-foreground">
              받는 사람: {message.to.length > 0 ? formatMailAddressList(message.to) : "-"}
            </p>
          ) : (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{message.snippet}</p>
          )}
          {isExpanded && message.cc.length > 0 ? (
            <p className="mt-0.5 text-xs break-all text-muted-foreground">참조: {formatMailAddressList(message.cc)}</p>
          ) : null}
        </div>

        <div
          className="flex shrink-0 items-center gap-1"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <span className="hidden truncate text-xs text-muted-foreground/80 sm:inline">
            {formatDate(message.sentAt)}
          </span>
          <div className="flex shrink-0 items-center">
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
        </div>
      </header>

      {isExpanded ? (
        <div className="mt-4 pl-0 sm:pl-13">
          {message.bodyHtml ? (
            <MessageBodyFrame html={message.bodyHtml} />
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

function ThreadFooter({ onReply }: { onReply: () => void }) {
  return (
    <div className="shrink-0 border-t px-6 py-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onReply}>
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
  const navigate = useNavigate()
  const { data: thread, isLoading, isError, error, refetch } = useThread(threadId)
  const { data: accounts } = useMailAccounts()
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

  const handleReply = () => {
    if (!thread) return
    const lastMessage = thread.messages.at(-1)
    if (!lastMessage) return

    const replyTo = lastMessage.replyTo?.email ?? lastMessage.from.email
    const currentSubject = thread.latestSubject
    const replySubject = /^re:/i.test(currentSubject) ? currentSubject : `Re: ${currentSubject}`

    void navigate({
      to: "/compose",
      search: { replyMessageId: lastMessage.id, replyThreadId: thread.threadId, replyTo, replySubject },
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
  const account = accounts?.find((item) => item.id === thread.accountId)

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col">
      <ThreadToolbar onClose={onClose} onDelete={handleDeleteThread} onReply={handleReply} isDeleting={isDeleting} />
      <ThreadHeader thread={thread} account={account} />

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          <div className="divide-y overflow-hidden rounded-lg border bg-card">
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
      </ScrollArea>
      <ThreadFooter onReply={handleReply} />
    </div>
  )
}
