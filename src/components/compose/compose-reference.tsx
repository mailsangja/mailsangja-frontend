import { useState } from "react"
import { Mail } from "lucide-react"

import { EmailErrorState } from "@/components/inbox/email-error-state"
import { ThreadHeader } from "@/components/thread-header"
import { ThreadMessageList } from "@/components/thread-message-list"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { useThread } from "@/queries/emails"
import { useMailAccounts } from "@/queries/mail-accounts"

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

function ReferenceEmptyState() {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Mail className="size-7 text-muted-foreground/60" />
      </div>
      <div>
        <p className="font-medium text-muted-foreground">레퍼런스 메일</p>
        <p className="mt-1 text-sm text-muted-foreground">메일 작성시 참고할 메일이 여기 표시됩니다</p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
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
  )
}

interface ComposeReferenceProps {
  threadId: string | null
}

export function ComposeReference({ threadId }: ComposeReferenceProps) {
  const { data: thread, isLoading, isError, error, refetch } = useThread(threadId)
  const { data: accounts } = useMailAccounts()

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

  const errorCopy = isError ? getThreadDetailErrorCopy(error) : null

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-11 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-medium">참고 메일</h1>
      </div>
      {!threadId || (!isLoading && !thread && !isError) ? (
        <ReferenceEmptyState />
      ) : isLoading ? (
        <LoadingState />
      ) : isError && errorCopy ? (
        <EmailErrorState title={errorCopy.title} description={errorCopy.description} onRetry={() => void refetch()} />
      ) : thread ? (
        <>
          <ThreadHeader thread={thread} account={accounts?.find((a) => a.id === thread.accountId)} />
          <ThreadMessageList messages={thread.messages} expandedIds={expandedIds} onToggle={toggleExpanded} />
        </>
      ) : null}
    </div>
  )
}
