import { useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

import { EmailDetail } from "@/components/inbox/email-detail"
import { EmailList } from "@/components/inbox/email-list"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { parseMailRouteSearch } from "@/lib/mail-routing"
import { getMailAddressSearchText } from "@/lib/mail-address"
import { cn } from "@/lib/utils"
import { useMailAccounts } from "@/queries/mail-accounts"
import { useMailboxThreads } from "@/queries/emails"
import { isSupportedMailboxId, MAILBOX_LABELS, parseMailboxId } from "@/types/email"

export const Route = createFileRoute("/_authenticated/mail/$mailbox")({
  params: {
    parse: (rawParams) => {
      const mailbox = parseMailboxId(rawParams.mailbox)

      if (!mailbox) {
        throw new Error("Unknown mailbox")
      }

      return { mailbox }
    },
  },
  skipRouteOnParseError: {
    params: true,
  },
  validateSearch: parseMailRouteSearch,
  component: MailboxPage,
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

function MailboxPage() {
  const { mailbox } = Route.useParams()
  const { query = "", filter = "all", accountId, thread: selectedThreadId = null } = Route.useSearch()
  const navigate = Route.useNavigate()
  const isMobile = useIsMobile()
  const { data: accounts } = useMailAccounts()
  const supportedMailbox = isSupportedMailboxId(mailbox) ? mailbox : null
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
  const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const selectedAccount = accountId ? (accounts?.find((account) => account.id === accountId) ?? null) : null

  useEffect(() => {
    if (!accountId || accounts === undefined || selectedAccount) {
      return
    }

    toast.error("유효하지 않은 계정입니다")

    void navigate({
      search: (previous) => ({
        ...previous,
        accountId: undefined,
      }),
      replace: true,
    })
  }, [accounts, navigate, selectedAccount, accountId])

  const threads = supportedMailbox
    ? loadedThreads.filter((thread) => {
        if (selectedAccount && thread.accountId !== selectedAccount.id) {
          return false
        }

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

  const getAccount = (accountId: string) => {
    return accounts?.find((account) => account.id === accountId)
  }

  const visibleSelectedThreadId = threads.some((thread) => thread.threadId === selectedThreadId)
    ? selectedThreadId
    : null
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
  } else if (selectedAccount?.id) {
    emptyTitle = "선택한 계정의 메일이 없습니다"
    emptyDescription = `${selectedAccount.alias} (${selectedAccount.emailAddress}) 계정에서 불러온 메일이 없습니다.`
  }

  const emailList = (
    <EmailList
      mailboxName={MAILBOX_LABELS[mailbox]}
      threads={threads}
      isLoading={supportedMailbox != null && isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={!!hasNextPage}
      selectedThreadId={visibleSelectedThreadId}
      filter={filter}
      onFilterChange={(nextFilter) => {
        void navigate({
          search: (previous) => ({
            ...previous,
            filter: nextFilter === "unread" ? nextFilter : undefined,
          }),
          replace: true,
        })
      }}
      onSelectThread={(threadId) => {
        void navigate({
          search: (previous) => ({
            ...previous,
            thread: threadId,
          }),
        })
      }}
      onLoadMore={() => {
        if (supportedMailbox && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      }}
      getAccount={getAccount}
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
          <EmailDetail
            threadId={visibleSelectedThreadId}
            onClose={() => {
              void navigate({
                search: (previous) => ({
                  ...previous,
                  thread: undefined,
                }),
                replace: true,
              })
            }}
          />
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
          <div className="min-h-0 min-w-0 basis-2/3">
            <EmailDetail
              threadId={visibleSelectedThreadId}
              onClose={() => {
                void navigate({
                  search: (previous) => ({
                    ...previous,
                    thread: undefined,
                  }),
                  replace: true,
                })
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
