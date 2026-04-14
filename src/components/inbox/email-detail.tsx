import { Archive, Forward, MailOpen, Paperclip, Reply, Trash2, X } from "lucide-react"

import { EmailErrorState } from "@/components/inbox/email-error-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { formatMailAddressList, getMailAddressFullLabel, getMailAddressLabel } from "@/lib/mail-address"
import { useThread } from "@/queries/emails"
import type { InboxMessage, MailAddress } from "@/types/email"

function formatDate(value: string) {
  const date = new Date(value)

  return date.toLocaleDateString("ko-KR", {
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

function getMessageParticipants(message: InboxMessage) {
  const seen = new Set<string>()

  return [message.from, ...message.to, ...message.cc].filter((address) => {
    const normalized = address.email.trim()

    if (!normalized || seen.has(normalized)) {
      return false
    }

    seen.add(normalized)
    return true
  })
}

function getParticipantKey(address: MailAddress) {
  return address.email || address.name || "unknown"
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
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b px-4">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 4 }).map((_, index) => (
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

interface EmailDetailProps {
  threadId: string | null
  onClose?: () => void
}

export function EmailDetail({ threadId, onClose }: EmailDetailProps) {
  const { data: thread, isLoading, isError, error, refetch } = useThread(threadId)

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
  const lastMessage = messages.at(-1)

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b px-4">
        {/*<span className="min-w-0 truncate text-sm font-medium">대화 상세</span>*/}
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
          <Button variant="ghost" size="icon-sm" disabled title="삭제 기능은 아직 지원되지 않습니다.">
            <Trash2 className="size-4" />
          </Button>
          {onClose ? (
            <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="상세보기 닫기" className="-mr-2">
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-b p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">{thread.latestSubject}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{messages.length}개 메시지</p>
          </div>
        </div>

        {lastMessage ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {getMessageParticipants(lastMessage).map((participant) => (
              <Badge key={getParticipantKey(participant)} variant="secondary" className="font-normal">
                {getMailAddressFullLabel(participant)}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          {messages.map((message) => (
            <section key={message.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>{getInitials(getMailAddressLabel(message.from))}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{getMailAddressFullLabel(message.from)}</p>
                        <Badge variant="outline">{message.direction === "INBOUND" ? "수신" : "발신"}</Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{message.subject}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(message.sentAt)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    받는 사람: {message.to.length > 0 ? formatMailAddressList(message.to) : "-"}
                  </p>
                  {message.cc.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">참조: {formatMailAddressList(message.cc)}</p>
                  ) : null}
                </div>
              </div>

              <Separator className="my-4" />

              {message.bodyHtml ? (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />
              ) : (
                <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">{message.bodyText}</div>
              )}

              {message.attachments.length > 0 ? (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Paperclip className="size-3.5" />
                  첨부파일 {message.attachments.length}개
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
