import { useState } from "react"
import { ArrowLeft, MailOpen, Undo2 } from "lucide-react"
import { toast } from "sonner"

import { EmailErrorState } from "@/components/inbox/email-error-state"
import { ThreadHeader } from "@/components/thread-header"
import { ThreadMessageList } from "@/components/thread-message-list"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { useRestoreTrashMessage, useRestoreTrashThread } from "@/mutations/trash"
import { useMailAccounts } from "@/queries/mail-accounts"
import { useTrashThread } from "@/queries/trash"
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
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="휴지통 목록으로 돌아가기">
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
          title="복구"
          aria-label="메일 복구"
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
          복구
        </Button>
      </div>
    </div>
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
        toast.success("스레드를 복구했습니다")
      },
      onError: (err) => {
        toast.error("복구에 실패했습니다", {
          description: getErrorMessage(err, "잠시 후 다시 시도해주세요."),
        })
      },
    })
  }

  const handleRestoreMessage = (message: InboxMessage, isLast: boolean) => {
    restoreMessage(message.id, {
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
      <ThreadMessageList
        messages={messages}
        expandedIds={expandedIds}
        onToggle={toggleExpanded}
        renderMenuActions={(message) => (
          <DropdownMenuItem onClick={() => handleRestoreMessage(message, messages.length === 1)}>
            <Undo2 className="size-4" />
            복구
          </DropdownMenuItem>
        )}
      />
      <TrashFooter onRestore={handleRestoreThread} isRestoring={isRestoringThread} />
    </div>
  )
}
