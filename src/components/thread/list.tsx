import { useEffect, useMemo, useRef, useState } from "react"
import { InboxIcon } from "lucide-react"
import { toast } from "sonner"

import { MailErrorState } from "@/components/mail-error-state"
import { ThreadListItem } from "@/components/thread/list-item"
import { ThreadListSkeletonRows } from "@/components/thread/list-skeleton-rows"
import { ThreadListToolbar } from "@/components/thread/list-toolbar"
import { useDeleteThread, useRestoreTrashThread } from "@/mutations/trash"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSuspenseLabels } from "@/queries/labels"
import { formatNumber } from "@/lib/date"
import { m } from "@/paraglide/messages"
import type { EmailFilter, InboxThreadSummary } from "@/types/email"
import type { MailAccount } from "@/types/mail-account"

interface ThreadListProps {
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

export function ThreadList({
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
  emptyTitle = m.mail_empty_title(),
  emptyDescription,
  errorTitle,
  errorDescription,
  onRetry,
  loadMoreErrorTitle,
  loadMoreErrorDescription,
  onRetryLoadMore,
}: ThreadListProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { mutate: deleteThread } = useDeleteThread()
  const { mutate: restoreThread } = useRestoreTrashThread()
  const { data: labelsList } = useSuspenseLabels()
  const labelsColorMap = useMemo(
    () => new Map(labelsList.map((l) => [l.id, { colorCode: l.colorCode, name: l.name }])),
    [labelsList]
  )
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
      <ThreadListToolbar
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
          toast(m.mail_moved_to_trash({ count: formatNumber(ids.length) }), {
            action: {
              label: m.common_undo(),
              onClick: () => {
                ids.forEach((id) => restoreThread(id))
                toast.success(m.mail_delete_undone())
              },
            },
          })
        }}
        onLabelSelected={() => {
          toast.info(m.mail_label_feature_pending())
        }}
      />

      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <div role="list" aria-label={m.mail_list_label({ mailbox: mailboxName })} className="min-w-0">
            <ThreadListSkeletonRows />
          </div>
        ) : errorTitle && errorDescription ? (
          <MailErrorState title={errorTitle} description={errorDescription} onRetry={onRetry} />
        ) : threads && threads.length > 0 ? (
          <>
            <div role="list" aria-label={m.mail_list_label({ mailbox: mailboxName })} className="min-w-0">
              {threads.map((thread) => {
                return (
                  <ThreadListItem
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
              {isFetchingNextPage ? <ThreadListSkeletonRows /> : null}
            </div>
            {loadMoreErrorTitle && loadMoreErrorDescription ? (
              <div className="border-t px-4 py-3">
                <MailErrorState
                  title={loadMoreErrorTitle}
                  description={loadMoreErrorDescription}
                  retryLabel={m.mail_load_more_retry()}
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
