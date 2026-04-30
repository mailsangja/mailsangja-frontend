import { useEffect, useMemo, useRef, useState } from "react"
import { SquareMinus, Trash2, Undo2 } from "lucide-react"
import { toast } from "sonner"

import { EmailErrorState } from "@/components/inbox/email-error-state"
import { EmailListItem } from "@/components/inbox/email-list-item"
import { EmailListLoadingRows } from "@/components/inbox/email-list-loading-rows"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody } from "@/components/ui/table"
import { getErrorMessage } from "@/lib/http-error"
import { useRestoreTrashThread } from "@/mutations/trash"
import type { InboxThreadSummary, MailAddress } from "@/types/email"
import type { MailAccount } from "@/types/mail-account"
import type { TrashMessage, TrashThreadSummary } from "@/types/trash"

function getLatestMessage(thread: TrashThreadSummary): TrashMessage | undefined {
  if (thread.deletedMessages.length === 0) {
    return undefined
  }

  return thread.deletedMessages.reduce((latest, current) => {
    const latestTime = new Date(latest.deletedAt).getTime()
    const currentTime = new Date(current.deletedAt).getTime()

    return currentTime > latestTime ? current : latest
  })
}

function parseAddress(raw: string): MailAddress {
  const match = raw.match(/^\s*(.*?)\s*<(.+)>\s*$/)
  if (match) {
    const name = match[1].replace(/^["']|["']$/g, "").trim()
    return { ...(name ? { name } : {}), email: match[2].trim() }
  }

  return { email: raw.trim() }
}

function getParticipant(thread: TrashThreadSummary, latest: TrashMessage | undefined): MailAddress {
  if (!latest) {
    return { email: thread.accountEmail }
  }

  if (latest.direction === "INBOUND") {
    return parseAddress(latest.fromAddress || thread.accountEmail)
  }

  const [first, ...rest] = latest.toAddresses
  if (!first) {
    return { email: thread.accountEmail }
  }

  const parsed = parseAddress(first)
  if (rest.length === 0) {
    return parsed
  }

  const base = parsed.name || parsed.email
  return { name: `${base} 외 ${rest.length}명`, email: parsed.email }
}

function toInboxSummary(thread: TrashThreadSummary): InboxThreadSummary {
  const latest = getLatestMessage(thread)

  return {
    threadId: thread.threadId,
    gmailThreadId: thread.gmailThreadId,
    accountId: thread.accountId,
    latestSubject: latest?.subject ?? "",
    participant: getParticipant(thread, latest),
    snippet: latest?.snippet ?? "",
    isRead: true,
    lastMessageAt: latest?.deletedAt ?? "",
    attachments: [],
  }
}

interface TrashListProps {
  mailboxName: string
  threads: TrashThreadSummary[] | undefined
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

export function TrashList({
  mailboxName,
  threads,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  selectedThreadId,
  onSelectThread,
  onLoadMore,
  getAccount,
  emptyTitle = "휴지통이 비어있습니다",
  emptyDescription,
  errorTitle,
  errorDescription,
  onRetry,
  loadMoreErrorTitle,
  loadMoreErrorDescription,
  onRetryLoadMore,
}: TrashListProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { mutateAsync: restoreThread } = useRestoreTrashThread()

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

  const header =
    visibleSelectedIds.size > 0 ? (
      <div className="flex h-11 shrink-0 items-center gap-2 border-b bg-accent/40 px-3">
        <Button variant="ghost" size="icon-sm" onClick={() => setSelectedIds(new Set())} aria-label="선택 해제">
          <SquareMinus />
        </Button>
        <span className="text-sm font-medium">{visibleSelectedIds.size.toLocaleString()}개 선택됨</span>
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
                toast.success(`${ids.length}개 스레드를 복구했습니다`)
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
                toast.error("복구에 실패했습니다", {
                  description: getErrorMessage(failed[0].result.reason, "잠시 후 다시 시도해주세요."),
                })
                return
              }

              toast.warning(`${succeededCount}개 복구, ${failed.length}개 실패`, {
                description: getErrorMessage(failed[0].result.reason, "실패한 항목은 선택 상태로 두었습니다."),
              })
            }}
            aria-label="선택 복구"
          >
            <Undo2 data-icon="inline-start" />
          </Button>
        </div>
      </div>
    ) : (
      <div className="flex h-11 shrink-0 items-center gap-3 border-b px-4">
        <h2 className="min-w-0 truncate text-sm font-medium">{mailboxName}</h2>
        <span className="hidden rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-flex">
          {(threads?.length ?? 0).toLocaleString()}개
        </span>
      </div>
    )

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[inherit]">
      {header}

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
                {threads.map((thread) => (
                  <EmailListItem
                    key={thread.threadId}
                    thread={toInboxSummary(thread)}
                    isSelected={selectedThreadId === thread.threadId}
                    isChecked={visibleSelectedIds.has(thread.threadId)}
                    account={getAccount(thread.accountId)}
                    onSelect={() => onSelectThread(thread.threadId)}
                    onToggleCheck={() => toggleSelected(thread.threadId)}
                  />
                ))}
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
