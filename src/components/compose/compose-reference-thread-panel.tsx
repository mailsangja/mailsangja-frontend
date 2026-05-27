import { Mail } from "lucide-react"

import { MailErrorState } from "@/components/mail-error-state"
import { ThreadHeader } from "@/components/thread/header"
import { ThreadMessageList } from "@/components/thread/message-list"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useThreadMessageExpansion } from "@/hooks/use-thread-message-expansion"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { m } from "@/paraglide/messages"
import { useThread } from "@/queries/emails"
import { useMailAccounts } from "@/queries/mail-accounts"

function getThreadDetailErrorCopy(error: unknown) {
  switch (getHttpStatus(error)) {
    case 401:
      return {
        title: m.thread_error_login_title(),
        description: m.thread_error_login_description(),
      }
    case 403:
      return {
        title: m.thread_error_forbidden_title(),
        description: m.thread_error_forbidden_description(),
      }
    case 404:
      return {
        title: m.thread_error_not_found_title(),
        description: m.thread_error_not_found_description(),
      }
    default:
      return {
        title: m.thread_error_generic_title(),
        description: getErrorMessage(error, m.thread_error_generic_description()),
      }
  }
}

function ReferenceEmptyState() {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Mail className="size-7 text-muted-foreground/60" />
      </div>
      <div>
        <p className="font-medium text-muted-foreground">{m.compose_reference_empty_title()}</p>
        <p className="mt-1 text-sm text-muted-foreground">{m.compose_reference_empty_description()}</p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-7 w-3/4" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Separator />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

interface ComposeReferenceThreadPanelProps {
  threadId: string | null
  messageId?: string | null
}

export function ComposeReferenceThreadPanel({ threadId, messageId = null }: ComposeReferenceThreadPanelProps) {
  const { data: thread, isLoading, isError, error, refetch } = useThread(threadId)
  const { data: accounts } = useMailAccounts()
  const { expandedIds, toggleExpanded } = useThreadMessageExpansion({
    threadId,
    messages: thread?.messages ?? [],
    messageId,
  })

  const errorCopy = isError ? getThreadDetailErrorCopy(error) : null
  const account = thread ? accounts?.find((item) => item.id === thread.accountId) : undefined

  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-11 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-medium">{m.compose_reference_title()}</h1>
      </div>
      {!threadId || (!isLoading && !thread && !isError) ? (
        <ReferenceEmptyState />
      ) : isLoading ? (
        <LoadingState />
      ) : isError && errorCopy ? (
        <MailErrorState title={errorCopy.title} description={errorCopy.description} onRetry={() => void refetch()} />
      ) : thread ? (
        <>
          <ThreadHeader thread={thread} account={account} className="pt-4" />
          <ThreadMessageList
            messages={thread.messages}
            expandedIds={expandedIds}
            onToggle={toggleExpanded}
            accountEmail={account?.emailAddress}
          />
        </>
      ) : null}
    </div>
  )
}
