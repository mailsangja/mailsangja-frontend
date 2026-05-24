import { createFileRoute, useLocation } from "@tanstack/react-router"

import { ComposeEmail } from "@/components/compose/compose-email"
import { ComposeReferenceThreadPanel } from "@/components/compose/compose-reference-thread-panel"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatMailAddressList } from "@/lib/mail-address"
import { emailQueries } from "@/queries/emails"
import { mailAccountQueries } from "@/queries/mail-accounts"

interface ComposeRouteSearch {
  from?: string
  thread?: string
  message?: string
}

export const Route = createFileRoute("/_authenticated/compose")({
  validateSearch: (search: Record<string, unknown>): ComposeRouteSearch => {
    const from = typeof search.from === "string" ? search.from.trim() : ""
    const thread = typeof search.thread === "string" ? search.thread.trim() : ""
    const message = typeof search.message === "string" ? search.message.trim() : ""

    return {
      ...(from ? { from } : {}),
      ...(thread ? { thread } : {}),
      ...(message ? { message } : {}),
    }
  },
  loaderDeps: ({ search: { thread, message } }) => ({ thread, message }),
  loader: async ({ context, deps: { thread: threadId, message: messageId } }) => {
    if (!threadId) return null

    const [thread, accounts] = await Promise.all([
      context.queryClient.ensureQueryData(emailQueries.thread(threadId)),
      context.queryClient.ensureQueryData(mailAccountQueries.list()),
    ])

    const replyMessage = messageId
      ? thread.messages.find((message) => message.id === messageId)
      : thread.messages.at(-1)
    if (!replyMessage) return null

    const replyToAddress = replyMessage.replyTo ?? replyMessage.from
    const replyTo = replyToAddress.name ? `${replyToAddress.name} <${replyToAddress.email}>` : replyToAddress.email
    const currentSubject = thread.latestSubject
    const replySubject = /^re:/i.test(currentSubject) ? currentSubject : `Re: ${currentSubject}`
    const fromAccount = accounts.find((a) => a.id === thread.accountId)
    const replyCcAddresses = replyMessage.cc.filter((addr) => addr.email !== fromAccount?.emailAddress)
    const replyCc = replyCcAddresses.length > 0 ? formatMailAddressList(replyCcAddresses) : undefined

    return {
      messageId: replyMessage.id,
      replyTo,
      replySubject,
      replyCc,
      defaultFrom: fromAccount?.emailAddress ?? null,
    }
  },
  component: ComposePage,
})

function ComposePage() {
  const isMobile = useIsMobile()
  const { from, thread, message } = Route.useSearch()
  const loaderData = Route.useLoaderData()
  const replyDraftSuggestion = useLocation({
    select: (location) => location.state.replyDraftSuggestion ?? null,
  })
  const navigate = Route.useNavigate()

  const handleFromAddressChange = (nextFrom: string | null) => {
    navigate({
      search: (prev) => ({ ...prev, from: nextFrom ?? undefined }),
      state: true,
      replace: true,
    })
  }

  const fromAddress = from ?? loaderData?.defaultFrom ?? null
  const initialSubject = replyDraftSuggestion?.subject ?? loaderData?.replySubject
  const initialBody = replyDraftSuggestion?.body

  if (isMobile) {
    return (
      <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
        <ComposeEmail
          fromAddress={fromAddress}
          onFromAddressChange={handleFromAddressChange}
          messageId={loaderData?.messageId}
          initialTo={loaderData?.replyTo}
          initialSubject={initialSubject}
          initialCc={loaderData?.replyCc}
          initialBody={initialBody}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
      <div className="min-h-0 min-w-0 basis-1/2 border-r-0">
        <ComposeReferenceThreadPanel threadId={thread ?? null} messageId={message ?? null} />
      </div>
      <Separator orientation="vertical" />
      <div className="min-h-0 min-w-0 basis-2/3">
        <ComposeEmail
          fromAddress={fromAddress}
          onFromAddressChange={handleFromAddressChange}
          messageId={loaderData?.messageId}
          initialTo={loaderData?.replyTo}
          initialSubject={initialSubject}
          initialCc={loaderData?.replyCc}
          initialBody={initialBody}
        />
      </div>
    </div>
  )
}
