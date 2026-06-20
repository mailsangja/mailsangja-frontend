import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { toast } from "sonner"

import { OnboardingModal } from "@/components/onboarding-modal"
import { ThreadDetail } from "@/components/thread/detail"
import { ThreadList } from "@/components/thread/list"
import { TrashThreadDetail } from "@/components/trash/thread-detail"
import { TrashThreadList } from "@/components/trash/thread-list"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { parseMailRouteSearch } from "@/lib/mail-routing"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"
import { useMailAccounts, mailAccountQueries } from "@/queries/mail-accounts"
import { emailKeys, useMailboxThreads, useStarredThreads } from "@/queries/emails"
import { useLabels, labelQueries, useLabelGroups, labelGroupQueries } from "@/queries/labels"
import { useTrashThreads } from "@/queries/trash"
import { getMailboxLabel, isSupportedMailboxId, parseMailboxId, type PrimaryMailboxId } from "@/types/email"

export const Route = createFileRoute("/_authenticated/_app/mail/$mailbox")({
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

    if (isLabelInvalid) toast.error(m.mail_invalid_label())
    if (isAccountInvalid) toast.error(m.mail_invalid_account())
    if (isGroupInvalid) toast.error(m.mail_invalid_label_group())

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
        title: m.mail_error_bad_page_title(),
        description: m.mail_error_bad_page_description(),
      }
    case 401:
      return {
        title: m.thread_error_login_title(),
        description: m.mail_error_login_description(),
      }
    default:
      return {
        title: m.mail_error_generic_title(),
        description: getErrorMessage(error, m.mail_error_generic_description()),
      }
  }
}

function MailboxPage() {
  const { mailbox } = Route.useParams()

  if (mailbox === "trash") {
    return <TrashMailboxView />
  }

  return (
    <>
      {mailbox === "inbox" && <OnboardingModal />}
      <MailboxView mailbox={mailbox} />
    </>
  )
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
  const supportedMailbox = isSupportedMailboxId(mailbox) ? mailbox : null
  const isStarredMailbox = mailbox === "starred"
  const isThreadListMailbox = supportedMailbox != null || isStarredMailbox
  const selectedLabel = labelId ? (labels?.find((label) => label.id === labelId) ?? null) : null
  const selectedGroup = labelGroupId ? (groups?.find((g) => g.id === labelGroupId) ?? null) : null
  const effectiveLabelIds = selectedGroup ? selectedGroup.labelIds : labelId ? [labelId] : undefined
  const hasSearchQuery = Boolean(query.trim())
  const mailboxThreadsQuery = useMailboxThreads(supportedMailbox, {
    read: filter === "unread" ? false : undefined,
    labelId: effectiveLabelIds,
    q: hasSearchQuery ? query : undefined,
  })
  const starredThreadsQuery = useStarredThreads(
    {
      size: 50,
      read: filter === "unread" ? false : undefined,
      labelId: effectiveLabelIds,
      q: hasSearchQuery ? query : undefined,
    },
    isStarredMailbox
  )
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
  } = isStarredMailbox ? starredThreadsQuery : mailboxThreadsQuery

  const loadedThreads = data?.pages.flatMap((page) => page.content) ?? []
  const baseTotalThreadCount = data?.pages[0]?.totalCount ?? 0
  const selectedAccount = accountId ? (accounts?.find((account) => account.id === accountId) ?? null) : null

  const threads = isThreadListMailbox
    ? loadedThreads.filter((thread) => !selectedAccount || thread.accountId === selectedAccount.id)
    : []
  const totalThreadCount = isStarredMailbox && selectedAccount ? threads.length : baseTotalThreadCount
  const mailboxErrorCopy = isError ? getMailboxThreadsErrorCopy(error) : null
  const loadMoreErrorCopy = isFetchNextPageError ? getMailboxThreadsErrorCopy(error) : null

  const getAccount = (accountId: string) => {
    return accounts?.find((account) => account.id === accountId)
  }

  const refreshMailbox = () => {
    if (!isThreadListMailbox) return

    void queryClient.invalidateQueries({
      queryKey: isStarredMailbox ? [...emailKeys.all(), "starred"] : [...emailKeys.all(), "mailbox", supportedMailbox],
    })
  }

  const listSelectedThreadId = threads.some((thread) => thread.threadId === selectedThreadId) ? selectedThreadId : null
  const hasSelection = selectedThreadId != null

  let emptyTitle = m.mail_empty_title()
  let emptyDescription: string | undefined

  if (!isThreadListMailbox) {
    emptyTitle = m.mail_unsupported_title()
    emptyDescription = m.mail_unsupported_description()
  } else if (hasSearchQuery) {
    emptyTitle = m.mail_search_empty_title()
    emptyDescription = m.mail_search_empty_description()
  } else if (filter === "unread") {
    emptyTitle = m.mail_unread_empty_title()
  } else if (selectedGroup?.id) {
    emptyTitle = m.mail_group_empty_title()
    emptyDescription = m.mail_group_empty_description({ group: selectedGroup.name })
  } else if (selectedLabel?.id) {
    emptyTitle = m.mail_label_empty_title()
    emptyDescription = m.mail_label_empty_description({ label: selectedLabel.name })
  } else if (selectedAccount?.id) {
    emptyTitle = m.mail_account_empty_title()
    emptyDescription = m.mail_account_empty_description({
      account: selectedAccount.alias,
      email: selectedAccount.emailAddress,
    })
  }

  const emailList = (
    <ThreadList
      mailboxName={getMailboxLabel(mailbox)}
      threads={threads}
      totalCount={totalThreadCount}
      isLoading={isThreadListMailbox && isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={!!hasNextPage}
      isRefreshing={isRefetching}
      selectedThreadId={listSelectedThreadId}
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
            message: undefined,
          }),
        })
      }}
      onLoadMore={() => {
        if (isThreadListMailbox && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      }}
      onRefresh={isThreadListMailbox ? refreshMailbox : undefined}
      getAccount={getAccount}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      errorTitle={isThreadListMailbox && isError && threads.length === 0 ? mailboxErrorCopy?.title : undefined}
      errorDescription={
        isThreadListMailbox && isError && threads.length === 0 ? mailboxErrorCopy?.description : undefined
      }
      onRetry={isThreadListMailbox && isError ? () => void refetch() : undefined}
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
        message: undefined,
      }),
      replace: true,
    })
  }
  const threadDetailKey = selectedThreadId ?? ""

  if (isMobile) {
    return (
      <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
        {hasSelection ? (
          <ThreadDetail
            key={threadDetailKey}
            threadId={selectedThreadId}
            messageId={selectedMessageId}
            onClose={closeThread}
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
              key={threadDetailKey}
              threadId={selectedThreadId}
              messageId={selectedMessageId}
              onClose={closeThread}
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

  let emptyTitle = m.trash_empty_title()
  let emptyDescription: string | undefined

  if (hasSearchQuery) {
    emptyTitle = m.mail_search_empty_title()
    emptyDescription = m.trash_search_empty_description()
  } else if (selectedAccount?.id) {
    emptyTitle = m.trash_account_empty_title()
    emptyDescription = m.trash_account_empty_description({
      account: selectedAccount.alias,
      email: selectedAccount.emailAddress,
    })
  }

  const trashList = (
    <TrashThreadList
      mailboxName={getMailboxLabel("trash")}
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
