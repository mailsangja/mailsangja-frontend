import { useEffect, useMemo, useRef, useState } from "react"
import { SquareMinus, Trash2, Undo2 } from "lucide-react"
import { toast } from "sonner"

import { MailErrorState } from "@/components/mail-error-state"
import { ThreadListItem } from "@/components/thread/list-item"
import { ThreadListSkeletonRows } from "@/components/thread/list-skeleton-rows"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatNumber } from "@/lib/date"
import { getErrorMessage } from "@/lib/http-error"
import { m } from "@/paraglide/messages"
import { useRestoreTrashThread } from "@/mutations/trash"
import { useLabels } from "@/queries/labels"
import type { InboxThreadSummary } from "@/types/email"
import type { MailAccount } from "@/types/mail-account"
import type { TrashThreadSummary } from "@/types/trash"

function toInboxSummary(thread: TrashThreadSummary): InboxThreadSummary {
  return {
    threadId: thread.threadId,
    gmailThreadId: thread.gmailThreadId,
    accountId: thread.accountId,
    latestSubject: thread.latestSubject,
    participant: thread.participant,
    snippet: thread.snippet,
    isRead: thread.isRead,
    lastMessageAt: thread.lastMessageAt,
    attachments: thread.attachments,
    messageCount: thread.messageCount,
    labels: thread.labels,
  }
}

interface TrashThreadListProps {
  mailboxName: string
  threads: TrashThreadSummary[] | undefined
  totalCount: number
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  selectedThreadId: string | null
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

export function TrashThreadList({
  mailboxName,
  threads,
  totalCount,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  selectedThreadId,
  onSelectThread,
  onLoadMore,
  getAccount,
  emptyTitle = m.trash_empty_title(),
  emptyDescription,
  errorTitle,
  errorDescription,
  onRetry,
  loadMoreErrorTitle,
  loadMoreErrorDescription,
  onRetryLoadMore,
}: TrashThreadListProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { mutateAsync: restoreThread } = useRestoreTrashThread()
  const { data: labelsList } = useLabels()
  const labelsColorMap = useMemo(
    () => new Map(labelsList?.map((l) => [l.id, { colorCode: l.colorCode, name: l.name }]) ?? []),
    [labelsList]
  )

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

  const visibleSelectedIds = useMemo(() => {
    if (selectedIds.size === 0 || !threads || threads.length === 0) {
      return selectedIds
    }

    const visibleIds = new Set(threads.map((thread) => thread.threadId))
    const next = new Set<string>()
    for (const id of selectedIds) {
      if (visibleIds.has(id)) {
        next.add(id)
      }
    }

    return next.size === selectedIds.size ? selectedIds : next
  }, [selectedIds, threads])
  const isSelectionMode = visibleSelectedIds.size > 0

  const header =
    visibleSelectedIds.size > 0 ? (
      <div className="flex h-11 shrink-0 items-center gap-2 border-b bg-accent/40 px-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSelectedIds(new Set())}
          aria-label={m.mail_clear_selection()}
        >
          <SquareMinus />
        </Button>
        <span className="text-sm font-medium">
          {m.mail_selected_count({ count: formatNumber(visibleSelectedIds.size) })}
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={async () => {
              const ids = Array.from(visibleSelectedIds)
              if (ids.length === 0) return
              setSelectedIds(new Set())

              const results = await Promise.allSettled(ids.map((id) => restoreThread(id)))
              const failed = results
                .map((result, index) => ({ result, id: ids[index] }))
                .filter(
                  (entry): entry is { result: PromiseRejectedResult; id: string } => entry.result.status === "rejected"
                )
              const succeededCount = ids.length - failed.length

              if (failed.length === 0) {
                toast.success(m.trash_restore_threads_success({ count: ids.length }))
                return
              }

              setSelectedIds((prev) => {
                const next = new Set(prev)
                for (const { id } of failed) {
                  next.add(id)
                }
                return next
              })

              if (succeededCount === 0) {
                toast.error(m.trash_restore_error(), {
                  description: getErrorMessage(failed[0].result.reason, m.common_try_again_later()),
                })
                return
              }

              toast.warning(m.trash_restore_partial({ restoredCount: succeededCount, failedCount: failed.length }), {
                description: getErrorMessage(failed[0].result.reason, m.trash_restore_partial_description()),
              })
            }}
            aria-label={m.trash_restore_selected()}
          >
            <Undo2 data-icon="inline-start" />
          </Button>
        </div>
      </div>
    ) : (
      <div className="flex h-11 shrink-0 items-center gap-3 border-b px-4">
        <h2 className="min-w-0 truncate text-sm font-medium">{mailboxName}</h2>
        <span className="hidden rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-flex">
          {m.mail_total_count({ count: formatNumber(totalCount) })}
        </span>
      </div>
    )

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[inherit]">
      {header}

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
              {threads.map((thread) => (
                <ThreadListItem
                  key={thread.threadId}
                  thread={toInboxSummary(thread)}
                  isSelected={selectedThreadId === thread.threadId}
                  isChecked={visibleSelectedIds.has(thread.threadId)}
                  isSelectionMode={isSelectionMode}
                  account={getAccount(thread.accountId)}
                  labelsColorMap={labelsColorMap}
                  onSelect={() => onSelectThread(thread.threadId)}
                  onToggleCheck={() => toggleSelected(thread.threadId)}
                />
              ))}
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
              <Trash2 className="size-7 text-muted-foreground/60" />
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
