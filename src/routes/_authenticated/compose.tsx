import { createFileRoute } from "@tanstack/react-router"

import { ComposeEmail } from "@/components/compose/compose-email"
import { ComposeReference } from "@/components/compose/compose-reference"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatMailAddressList } from "@/lib/mail-address"
import { emailQueries } from "@/queries/emails"
import { mailAccountQueries } from "@/queries/mail-accounts"

interface ComposeRouteSearch {
  from?: string
  replyThreadId?: string
}

export const Route = createFileRoute("/_authenticated/compose")({
  validateSearch: (search: Record<string, unknown>): ComposeRouteSearch => {
    const from = typeof search.from === "string" ? search.from.trim() : ""
    const replyThreadId = typeof search.replyThreadId === "string" ? search.replyThreadId.trim() : ""
    return {
      ...(from ? { from } : {}),
      ...(replyThreadId ? { replyThreadId } : {}),
    }
  },
  loaderDeps: ({ search: { replyThreadId } }) => ({ replyThreadId }),
  loader: async ({ context, deps: { replyThreadId } }) => {
    if (!replyThreadId) return null

    const [thread, accounts] = await Promise.all([
      context.queryClient.ensureQueryData(emailQueries.thread(replyThreadId)),
      context.queryClient.ensureQueryData(mailAccountQueries.list()),
    ])

    const lastMessage = thread.messages.at(-1)
    if (!lastMessage) return null

    const replyToAddress = lastMessage.replyTo ?? lastMessage.from
    const replyTo = replyToAddress.name ? `${replyToAddress.name} <${replyToAddress.email}>` : replyToAddress.email
    const currentSubject = thread.latestSubject
    const replySubject = /^re:/i.test(currentSubject) ? currentSubject : `Re: ${currentSubject}`
    const fromAccount = accounts.find((a) => a.id === thread.accountId)
    const replyCcAddresses = lastMessage.cc.filter((addr) => addr.email !== fromAccount?.emailAddress)
    const replyCc = replyCcAddresses.length > 0 ? formatMailAddressList(replyCcAddresses) : undefined

    return {
      messageId: lastMessage.id,
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
  const { from, replyThreadId } = Route.useSearch()
  const loaderData = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const handleFromAddressChange = (nextFrom: string | null) => {
    navigate({
      search: (prev) => ({ ...prev, from: nextFrom ?? undefined }),
      replace: true,
    })
  }

  const fromAddress = from ?? loaderData?.defaultFrom ?? null

  if (isMobile) {
    return (
      <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
        <ComposeEmail
          fromAddress={fromAddress}
          onFromAddressChange={handleFromAddressChange}
          messageId={loaderData?.messageId}
          initialTo={loaderData?.replyTo}
          initialSubject={loaderData?.replySubject}
          initialCc={loaderData?.replyCc}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
      <div className="min-h-0 min-w-0 basis-1/2 border-r-0">
        <ComposeReference threadId={replyThreadId ?? null} />
      </div>
      <Separator orientation="vertical" />
      <div className="min-h-0 min-w-0 basis-2/3">
        <ComposeEmail
          fromAddress={fromAddress}
          onFromAddressChange={handleFromAddressChange}
          messageId={loaderData?.messageId}
          initialTo={loaderData?.replyTo}
          initialSubject={loaderData?.replySubject}
          initialCc={loaderData?.replyCc}
        />
      </div>
    </div>
  )
}
