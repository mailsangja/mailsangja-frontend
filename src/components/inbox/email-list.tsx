import { useEffect, useRef } from "react"
import { InboxIcon } from "lucide-react"

import { EmailErrorState } from "@/components/inbox/email-error-state"
import { EmailListHeader } from "@/components/inbox/email-list-header"
import type { EmailFilter } from "@/components/inbox/email-list-header"
import { EmailListItem } from "@/components/inbox/email-list-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { InboxThreadSummary } from "@/types/email"

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
  getAccountColor: (accountId: string) => string | undefined
  emptyTitle?: string
  emptyDescription?: string
  errorTitle?: string
  errorDescription?: string
  onRetry?: () => void
  loadMoreErrorTitle?: string
  loadMoreErrorDescription?: string
  onRetryLoadMore?: () => void
}

function LoadingRows() {
  return Array.from({ length: 10 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell className="w-10">
        <Skeleton className="size-2.5 rounded-full" />
      </TableCell>
      <TableCell className="w-[22%]">
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell className="w-[58%]">
        <Skeleton className="h-4 w-full" />
      </TableCell>
      <TableCell className="hidden w-14 text-center md:table-cell">
        <Skeleton className="mx-auto size-4 rounded-full" />
      </TableCell>
      <TableCell className="w-24 text-right">
        <Skeleton className="ml-auto h-4 w-16" />
      </TableCell>
    </TableRow>
  ))
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
  getAccountColor,
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
      />

      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <Table className="table-fixed">
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-10">상태</TableHead>
                <TableHead className="w-[22%]">보낸 사람</TableHead>
                <TableHead className="w-[58%]">제목</TableHead>
                <TableHead className="hidden w-14 text-center md:table-cell">첨부</TableHead>
                <TableHead className="w-24 text-right">시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <LoadingRows />
            </TableBody>
          </Table>
        ) : errorTitle && errorDescription ? (
          <EmailErrorState title={errorTitle} description={errorDescription} onRetry={onRetry} />
        ) : threads && threads.length > 0 ? (
          <>
            <Table className="table-fixed">
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-10">상태</TableHead>
                  <TableHead className="w-[28%] md:w-[22%]">보낸 사람</TableHead>
                  <TableHead className="w-[52%] md:w-[58%]">제목</TableHead>
                  <TableHead className="hidden w-14 text-center md:table-cell">첨부</TableHead>
                  <TableHead className="w-24 text-right">시간</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threads.map((thread) => {
                  return (
                    <EmailListItem
                      key={thread.threadId}
                      thread={thread}
                      isSelected={selectedThreadId === thread.threadId}
                      accountColor={getAccountColor(thread.accountId)}
                      onSelect={() => onSelectThread(thread.threadId)}
                    />
                  )
                })}
                {isFetchingNextPage ? <LoadingRows /> : null}
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
