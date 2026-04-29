import { useEffect, useRef, useState } from "react"
import { InboxIcon } from "lucide-react"
import { toast } from "sonner"

import { EmailErrorState } from "@/components/inbox/email-error-state"
import { EmailListHeader } from "@/components/inbox/email-list-header"
import { EmailListItem } from "@/components/inbox/email-list-item"
import { EmailListLoadingRows } from "@/components/inbox/email-list-loading-rows"
import { useDeleteThread, useRestoreTrashThread } from "@/mutations/trash"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody } from "@/components/ui/table"
import type { EmailFilter, InboxThreadSummary } from "@/types/email"
import type { MailAccount } from "@/types/mail-account"

interface EmailListProps {
  mailboxName: string
  threads: InboxThreadSummary[] | undefined
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  selectedThreadId: string | null
  filter: EmailFilter
  onFilterChange: (filter: EmailFilter) => void
  onSelectThread: (id: string) => void
  onLoadMore: () => void
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
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  selectedThreadId,
  filter,
  onFilterChange,
  onSelectThread,
  onLoadMore,
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
    <div className="flex h-full flex-col overflow-hidden rounded-[inherit]">
      <EmailListHeader
        mailboxName={mailboxName}
        threadCount={threads?.length ?? 0}
        filter={filter}
        onFilterChange={onFilterChange}
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
          <Table className="table-fixed">
            <TableBody>
              <EmailListLoadingRows />
            </TableBody>
          </Table>
        ) : errorTitle && errorDescription ? (
          <EmailErrorState title={errorTitle} description={errorDescription} onRetry={onRetry} />
        ) : threads && threads.length > 0 ? (
          <>
            <Table className="table-fixed">
              <colgroup>
                <col className="w-10" />
                <col className="w-10" />
                <col className="w-[28%] md:w-[22%]" />
                <col className="w-[52%] md:w-[58%]" />
                <col className="hidden w-14 md:table-column" />
                <col className="w-24" />
              </colgroup>
              <TableBody>
                {threads.map((thread) => {
                  return (
                    <EmailListItem
                      key={thread.threadId}
                      thread={thread}
                      isSelected={selectedThreadId === thread.threadId}
                      isChecked={selectedIds.has(thread.threadId)}
                      account={getAccount(thread.accountId)}
                      onSelect={() => onSelectThread(thread.threadId)}
                      onToggleCheck={() => toggleSelected(thread.threadId)}
                    />
                  )
                })}
                {isFetchingNextPage ? <EmailListLoadingRows /> : null}
              </TableBody>
            </Table>
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
          <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
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
