import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { toast } from "sonner"

import { ThreadDetail } from "@/components/thread/detail"
import { ThreadList } from "@/components/thread/list"
import { TrashThreadDetail } from "@/components/trash/thread-detail"
import { TrashThreadList } from "@/components/trash/thread-list"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { parseMailRouteSearch } from "@/lib/mail-routing"
import { cn } from "@/lib/utils"
import { useMarkThreadAsRead } from "@/mutations/emails"
import { useMailAccounts, mailAccountQueries } from "@/queries/mail-accounts"
import { emailKeys, useMailboxThreads } from "@/queries/emails"
import { useLabels, labelQueries, useLabelGroups, labelGroupQueries } from "@/queries/labels"
import { useTrashThreads } from "@/queries/trash"
import { isSupportedMailboxId, MAILBOX_LABELS, parseMailboxId, type PrimaryMailboxId } from "@/types/email"

export const Route = createFileRoute("/_authenticated/mail/$mailbox")({
  params: {
    parse: (rawParams) => {
      const mailbox = parseMailboxId(rawParams.mailbox)

      if (!mailbox) {
        return false
      }

      return { mailbox }
    },
  },
  validateSearch: parseMailRouteSearch,
  beforeLoad: async ({ context, params, search }) => {
    const { labelId, accountId, labelGroupId } = search

    const [labels, accounts, groups] = await Promise.all([
      context.queryClient.ensureQueryData(labelQueries.list()),
      accountId !== undefined ? context.queryClient.ensureQueryData(mailAccountQueries.list()) : null,
      labelGroupId !== undefined ? context.queryClient.ensureQueryData(labelGroupQueries.list()) : null,
    ])

    if (!labelId && !accountId && !labelGroupId) return

    const isLabelInvalid = labelId !== undefined && !labels.some((l) => l.id === labelId)
    const isAccountInvalid = accounts !== null && !accounts.some((a) => a.id === accountId)
    const isGroupInvalid = groups !== null && !groups.some((g) => g.id === labelGroupId)

    if (!isLabelInvalid && !isAccountInvalid && !isGroupInvalid) return

    if (isLabelInvalid) toast.error("유효하지 않은 라벨입니다")
    if (isAccountInvalid) toast.error("유효하지 않은 계정입니다")
    if (isGroupInvalid) toast.error("유효하지 않은 라벨 그룹입니다")

    throw redirect({
      to: "/mail/$mailbox",
      params: { mailbox: params.mailbox },
      search: {
        ...search,
        labelId: isLabelInvalid ? undefined : search.labelId,
        accountId: isAccountInvalid ? undefined : search.accountId,
        labelGroupId: isGroupInvalid ? undefined : search.labelGroupId,
      },
      replace: true,
    })
  },
  component: MailboxPage,
})

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

  if (mailbox === "trash") {
    return <TrashMailboxView />
  }

  return <MailboxView mailbox={mailbox} />
}

function MailboxView({ mailbox }: { mailbox: PrimaryMailboxId }) {
  const {
    query = "",
    filter = "all",
    accountId,
    labelId,
    labelGroupId,
    thread: selectedThreadId = null,
    message: selectedMessageId = null,
  } = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const { data: accounts } = useMailAccounts()
  const { data: labels } = useLabels()
  const { data: groups } = useLabelGroups()
  const { mutate: markAsRead } = useMarkThreadAsRead()
  const supportedMailbox = isSupportedMailboxId(mailbox) ? mailbox : null
  const selectedLabel = labelId ? (labels?.find((label) => label.id === labelId) ?? null) : null
  const selectedGroup = labelGroupId ? (groups?.find((g) => g.id === labelGroupId) ?? null) : null
  const effectiveLabelIds = selectedGroup ? selectedGroup.labelIds : labelId ? [labelId] : undefined
  const hasSearchQuery = Boolean(query.trim())
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useMailboxThreads(supportedMailbox, {
    read: filter === "unread" ? false : undefined,
    labelId: effectiveLabelIds,
    q: hasSearchQuery ? query : undefined,
  })

  const loadedThreads = data?.pages.flatMap((page) => page.content) ?? []
  const totalThreadCount = data?.pages[0]?.totalCount ?? 0
  const selectedAccount = accountId ? (accounts?.find((account) => account.id === accountId) ?? null) : null

  const threads = supportedMailbox
    ? loadedThreads.filter((thread) => {
        return !selectedAccount || thread.accountId === selectedAccount.id
      })
    : []
  const mailboxErrorCopy = isError ? getMailboxThreadsErrorCopy(error) : null
  const loadMoreErrorCopy = isFetchNextPageError ? getMailboxThreadsErrorCopy(error) : null

  const getAccount = (accountId: string) => {
    return accounts?.find((account) => account.id === accountId)
  }

  const refreshMailbox = () => {
    if (!supportedMailbox) return

    void queryClient.invalidateQueries({
      queryKey: [...emailKeys.all(), "mailbox", supportedMailbox],
    })
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
  } else if (hasSearchQuery) {
    emptyTitle = "검색 결과가 없습니다"
    emptyDescription = "검색 조건에 맞는 메일을 찾지 못했습니다."
  } else if (filter === "unread") {
    emptyTitle = "안 읽은 메일이 없습니다"
  } else if (selectedGroup?.id) {
    emptyTitle = "선택한 그룹의 메일이 없습니다"
    emptyDescription = `"${selectedGroup.name}" 그룹에 속한 라벨이 적용된 메일이 없습니다.`
  } else if (selectedLabel?.id) {
    emptyTitle = "선택한 라벨의 메일이 없습니다"
    emptyDescription = `"${selectedLabel.name}" 라벨이 적용된 메일이 없습니다.`
  } else if (selectedAccount?.id) {
    emptyTitle = "선택한 계정의 메일이 없습니다"
    emptyDescription = `${selectedAccount.alias} (${selectedAccount.emailAddress}) 계정에서 불러온 메일이 없습니다.`
  }

  const emailList = (
    <ThreadList
      mailboxName={MAILBOX_LABELS[mailbox]}
      threads={threads}
      totalCount={totalThreadCount}
      isLoading={supportedMailbox != null && isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={!!hasNextPage}
      isRefreshing={isRefetching}
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
        const thread = threads.find((t) => t.threadId === threadId)
        if (thread && !thread.isRead) {
          markAsRead(threadId)
        }

        void navigate({
          search: (previous) => ({
            ...previous,
            thread: threadId,
            message: undefined,
          }),
        })
      }}
      onLoadMore={() => {
        if (supportedMailbox && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      }}
      onRefresh={supportedMailbox ? refreshMailbox : undefined}
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
      <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
        {hasSelection ? (
          <ThreadDetail
            threadId={visibleSelectedThreadId}
            messageId={selectedMessageId}
            onClose={() => {
              void navigate({
                search: (previous) => ({
                  ...previous,
                  thread: undefined,
                  message: undefined,
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
    <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
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
            <ThreadDetail
              threadId={visibleSelectedThreadId}
              messageId={selectedMessageId}
              onClose={() => {
                void navigate({
                  search: (previous) => ({
                    ...previous,
                    thread: undefined,
                    message: undefined,
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

function TrashMailboxView() {
  const { query = "", accountId, thread: selectedThreadId = null } = Route.useSearch()
  const navigate = Route.useNavigate()
  const isMobile = useIsMobile()
  const { data: accounts } = useMailAccounts()
  const hasSearchQuery = Boolean(query.trim())
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
  } = useTrashThreads({
    q: hasSearchQuery ? query : undefined,
  })

  const loadedThreads = data?.pages.flatMap((page) => page.content) ?? []
  const totalThreadCount = data?.pages[0]?.totalCount ?? 0
  const selectedAccount = accountId ? (accounts?.find((account) => account.id === accountId) ?? null) : null

  const threads = loadedThreads.filter((thread) => {
    return !selectedAccount || thread.accountId === selectedAccount.id
  })

  const mailboxErrorCopy = isError ? getMailboxThreadsErrorCopy(error) : null
  const loadMoreErrorCopy = isFetchNextPageError ? getMailboxThreadsErrorCopy(error) : null

  const getAccount = (id: string) => accounts?.find((account) => account.id === id)

  const visibleSelectedThreadId = threads.some((thread) => thread.threadId === selectedThreadId)
    ? selectedThreadId
    : null
  const hasSelection = visibleSelectedThreadId != null

  let emptyTitle = "휴지통이 비어있습니다"
  let emptyDescription: string | undefined

  if (hasSearchQuery) {
    emptyTitle = "검색 결과가 없습니다"
    emptyDescription = "검색 조건에 맞는 휴지통 항목을 찾지 못했습니다."
  } else if (selectedAccount?.id) {
    emptyTitle = "선택한 계정의 휴지통 항목이 없습니다"
    emptyDescription = `${selectedAccount.alias} (${selectedAccount.emailAddress}) 계정에서 삭제된 메일이 없습니다.`
  }

  const trashList = (
    <TrashThreadList
      mailboxName={MAILBOX_LABELS.trash}
      threads={threads}
      totalCount={totalThreadCount}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={!!hasNextPage}
      selectedThreadId={visibleSelectedThreadId}
      onSelectThread={(threadId) => {
        void navigate({
          search: (previous) => ({
            ...previous,
            thread: threadId,
          }),
        })
      }}
      onLoadMore={() => {
        if (hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      }}
      getAccount={getAccount}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      errorTitle={isError && threads.length === 0 ? mailboxErrorCopy?.title : undefined}
      errorDescription={isError && threads.length === 0 ? mailboxErrorCopy?.description : undefined}
      onRetry={isError ? () => void refetch() : undefined}
      loadMoreErrorTitle={threads.length > 0 ? loadMoreErrorCopy?.title : undefined}
      loadMoreErrorDescription={threads.length > 0 ? loadMoreErrorCopy?.description : undefined}
      onRetryLoadMore={threads.length > 0 && isFetchNextPageError ? () => void fetchNextPage() : undefined}
    />
  )

  const closeThread = () => {
    void navigate({
      search: (previous) => ({
        ...previous,
        thread: undefined,
      }),
      replace: true,
    })
  }

  if (isMobile) {
    return (
      <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
        {hasSelection ? <TrashThreadDetail threadId={visibleSelectedThreadId} onClose={closeThread} /> : trashList}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
      <div
        className={cn(
          "min-h-0 min-w-0 border-r-0 transition-[flex-basis,width] duration-300 ease-out",
          hasSelection ? "basis-1/2" : "basis-full"
        )}
      >
        {trashList}
      </div>
      {hasSelection ? (
        <>
          <Separator orientation="vertical" />
          <div className="min-h-0 min-w-0 basis-2/3">
            <TrashThreadDetail threadId={visibleSelectedThreadId} onClose={closeThread} />
          </div>
        </>
      ) : null}
    </div>
  )
}
