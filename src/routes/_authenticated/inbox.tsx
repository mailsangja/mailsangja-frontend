import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { EmailDetail } from "@/components/inbox/email-detail"
import type { EmailFilter } from "@/components/inbox/email-list-header"
import { EmailList } from "@/components/inbox/email-list"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { Separator } from "@/components/ui/separator"
import { useInboxContext } from "@/contexts/inbox-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { getMailAddressSearchText } from "@/lib/mail-address"
import { cn } from "@/lib/utils"
import { useMailAccounts } from "@/queries/mail-accounts"
import { useMailboxThreads } from "@/queries/emails"
import { isSupportedMailboxId, MAILBOX_LABELS } from "@/types/email"

export const Route = createFileRoute("/_authenticated/inbox")({
  component: InboxPage,
})

function matchesSearch(value: string, terms: string[]) {
  const normalized = value.toLowerCase()

  return terms.every((term) => normalized.includes(term))
}

function getMailboxThreadsErrorCopy(error: unknown) {
  switch (getHttpStatus(error)) {
    case 400:
      return {
        title: "메일 목록 페이지 정보를 해석하지 못했습니다",
        description: "다음 페이지 marker가 유효하지 않습니다. 목록을 처음부터 다시 불러와주세요.",
      }
    case 401:
      return {
        title: "로그인이 필요합니다",
        description: "세션이 만료되었거나 인증 정보가 없습니다. 다시 로그인한 뒤 메일함을 불러와주세요.",
      }
    default:
      return {
        title: "메일 목록을 불러오지 못했습니다",
        description: getErrorMessage(error, "네트워크 상태를 확인한 뒤 다시 시도해주세요."),
      }
  }
}

function InboxPage() {
  const { activeMailbox, searchQuery } = useInboxContext()
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [filter, setFilter] = useState<EmailFilter>("all")
  const isMobile = useIsMobile()
  const { data: accounts } = useMailAccounts()
  const supportedMailbox = isSupportedMailboxId(activeMailbox) ? activeMailbox : null
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useMailboxThreads(supportedMailbox)

  const loadedThreads = data?.pages.flatMap((page) => page.content) ?? []
  const searchTerms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean)

  const threads = supportedMailbox
    ? loadedThreads.filter((thread) => {
        if (filter === "unread" && thread.isRead) {
          return false
        }

        if (searchTerms.length === 0) {
          return true
        }

        return matchesSearch(
          [thread.latestSubject, getMailAddressSearchText(thread.participant), thread.snippet].join(" "),
          searchTerms
        )
      })
    : []
  const mailboxErrorCopy = isError ? getMailboxThreadsErrorCopy(error) : null
  const loadMoreErrorCopy = isFetchNextPageError ? getMailboxThreadsErrorCopy(error) : null

  const getAccountColor = (accountId: string) => {
    return accounts?.find((account) => account.id === accountId)?.color
  }

  const visibleSelectedThreadId = threads.some((thread) => thread.threadId === selectedThreadId)
    ? selectedThreadId
    : null
  const mailboxName = MAILBOX_LABELS[activeMailbox]
  const hasSelection = visibleSelectedThreadId != null

  let emptyTitle = "메일이 없습니다"
  let emptyDescription: string | undefined

  if (!supportedMailbox) {
    emptyTitle = "아직 지원되지 않는 메일함입니다"
    emptyDescription = "현재 백엔드 API는 받은편지함과 보낸편지함만 지원합니다."
  } else if (searchTerms.length > 0) {
    emptyTitle = "검색 결과가 없습니다"
    emptyDescription = "현재까지 불러온 메일에서 검색 결과를 찾지 못했습니다."
  } else if (filter === "unread") {
    emptyTitle = "안 읽은 메일이 없습니다"
  }

  const emailList = (
    <EmailList
      mailboxName={mailboxName}
      threads={threads}
      isLoading={supportedMailbox != null && isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={!!hasNextPage}
      selectedThreadId={visibleSelectedThreadId}
      filter={filter}
      onFilterChange={setFilter}
      onSelectThread={setSelectedThreadId}
      onLoadMore={() => {
        if (supportedMailbox && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      }}
      getAccountColor={getAccountColor}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      errorTitle={supportedMailbox && isError && threads.length === 0 ? mailboxErrorCopy?.title : undefined}
      errorDescription={supportedMailbox && isError && threads.length === 0 ? mailboxErrorCopy?.description : undefined}
      onRetry={supportedMailbox && isError ? () => void refetch() : undefined}
      loadMoreErrorTitle={threads.length > 0 ? loadMoreErrorCopy?.title : undefined}
      loadMoreErrorDescription={threads.length > 0 ? loadMoreErrorCopy?.description : undefined}
      onRetryLoadMore={threads.length > 0 && isFetchNextPageError ? () => void fetchNextPage() : undefined}
    />
  )

  if (isMobile) {
    return (
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {hasSelection ? (
          <EmailDetail threadId={visibleSelectedThreadId} onClose={() => setSelectedThreadId(null)} />
        ) : (
          emailList
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div
        className={cn(
          "min-h-0 min-w-0 border-r-0 transition-[flex-basis,width] duration-300 ease-out",
          hasSelection ? "basis-1/2" : "basis-full"
        )}
      >
        {emailList}
      </div>
      {hasSelection ? (
        <>
          <Separator orientation="vertical" />
          <div className="min-h-0 min-w-0 basis-1/2">
            <EmailDetail threadId={visibleSelectedThreadId} onClose={() => setSelectedThreadId(null)} />
          </div>
        </>
      ) : null}
    </div>
  )
}
