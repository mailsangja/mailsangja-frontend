import { useEffect, useMemo, useRef, useState } from "react"
import { InboxIcon } from "lucide-react"
import { toast } from "sonner"

import { EmailErrorState } from "@/components/inbox/email-error-state"
import { EmailListHeader } from "@/components/inbox/email-list-header"
import { EmailListItem } from "@/components/inbox/email-list-item"
import { EmailListLoadingRows } from "@/components/inbox/email-list-item-loading"
import { useDeleteThread, useRestoreTrashThread } from "@/mutations/trash"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSuspenseLabels } from "@/queries/labels"
import type { EmailFilter, InboxThreadSummary } from "@/types/email"
import type { MailAccount } from "@/types/mail-account"

interface EmailListProps {
  mailboxName: string
  threads: InboxThreadSummary[] | undefined
  totalCount: number
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  isRefreshing?: boolean
  selectedThreadId: string | null
  filter: EmailFilter
  onFilterChange: (filter: EmailFilter) => void
  onSelectThread: (id: string) => void
  onLoadMore: () => void
  onRefresh?: () => void
  getAccount: (accountId: string) => MailAccount | undefined
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  errorDescription?: string
  onRetry?: () => void
  loadMoreErrorTitle?: string
  loadMoreErrorDescription?: string
  onRetryLoadMore?: () => void
}

export function EmailList({
  mailboxName,
  threads,
  totalCount,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  isRefreshing = false,
  selectedThreadId,
  filter,
  onFilterChange,
  onSelectThread,
  onLoadMore,
  onRefresh,
  getAccount,
  emptyTitle = "메일이 없습니다",
  emptyDescription,
  errorTitle,
  errorDescription,
  onRetry,
  loadMoreErrorTitle,
  loadMoreErrorDescription,
  onRetryLoadMore,
}: EmailListProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { mutate: deleteThread } = useDeleteThread()
  const { mutate: restoreThread } = useRestoreTrashThread()
  const { data: labelsList } = useSuspenseLabels()
  const labelsColorMap = useMemo(() => new Map(labelsList.map((l) => [l.id, l.colorCode])), [labelsList])
  const isSelectionMode = selectedIds.size > 0

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  useEffect(() => {
    const node = loadMoreRef.current

    if (!node || !hasNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          onLoadMore()
        }
      },
      { rootMargin: "200px 0px" }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, onLoadMore])

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[inherit]">
      <EmailListHeader
        mailboxName={mailboxName}
        currentCount={threads?.length ?? 0}
        totalCount={totalCount}
        filter={filter}
        onFilterChange={onFilterChange}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onDeleteSelected={() => {
          const ids = Array.from(selectedIds)
          if (ids.length === 0) return
          setSelectedIds(new Set())
          ids.forEach((id) => deleteThread(id))
          toast(`${ids.length}개 메일을 휴지통으로 옮겼습니다`, {
            action: {
              label: "실행 취소",
              onClick: () => {
                ids.forEach((id) => restoreThread(id))
                toast.success("삭제가 취소되었습니다")
              },
            },
          })
        }}
        onLabelSelected={() => {
          toast.info("라벨 기능은 준비 중입니다")
        }}
      />

      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <div role="list" aria-label={`${mailboxName} 메일 목록`} className="min-w-0">
            <EmailListLoadingRows />
          </div>
        ) : errorTitle && errorDescription ? (
          <EmailErrorState title={errorTitle} description={errorDescription} onRetry={onRetry} />
        ) : threads && threads.length > 0 ? (
          <>
            <div role="list" aria-label={`${mailboxName} 메일 목록`} className="min-w-0">
              {threads.map((thread) => {
                return (
                  <EmailListItem
                    key={thread.threadId}
                    thread={thread}
                    isSelected={selectedThreadId === thread.threadId}
                    isChecked={selectedIds.has(thread.threadId)}
                    isSelectionMode={isSelectionMode}
                    account={getAccount(thread.accountId)}
                    labelsColorMap={labelsColorMap}
                    onSelect={() => onSelectThread(thread.threadId)}
                    onToggleCheck={() => toggleSelected(thread.threadId)}
                  />
                )
              })}
              {isFetchingNextPage ? <EmailListLoadingRows /> : null}
            </div>
            {loadMoreErrorTitle && loadMoreErrorDescription ? (
              <div className="border-t px-4 py-3">
                <EmailErrorState
                  title={loadMoreErrorTitle}
                  description={loadMoreErrorDescription}
                  retryLabel="추가 메일 다시 불러오기"
                  onRetry={onRetryLoadMore}
                />
              </div>
            ) : null}
            <div ref={loadMoreRef} className="h-1" />
          </>
        ) : (
          <div className="flex min-h-full w-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <InboxIcon className="size-7 text-muted-foreground/60" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground">{emptyTitle}</p>
              {emptyDescription ? <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p> : null}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
