import { createFileRoute } from "@tanstack/react-router"

import { ComposeEmail } from "@/components/compose/compose-email"
import { ComposeReference } from "@/components/compose/compose-reference"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"

interface ComposeRouteSearch {
  from?: string
  replyMessageId?: string
  replyThreadId?: string
  replyTo?: string
  replySubject?: string
}

export const Route = createFileRoute("/_authenticated/compose")({
  validateSearch: (search: Record<string, unknown>): ComposeRouteSearch => {
    const from = typeof search.from === "string" ? search.from.trim() : ""
    const replyMessageId = typeof search.replyMessageId === "string" ? search.replyMessageId.trim() : ""
    const replyThreadId = typeof search.replyThreadId === "string" ? search.replyThreadId.trim() : ""
    const replyTo = typeof search.replyTo === "string" ? search.replyTo.trim() : ""
    const replySubject = typeof search.replySubject === "string" ? search.replySubject.trim() : ""
    return {
      ...(from ? { from } : {}),
      ...(replyMessageId ? { replyMessageId } : {}),
      ...(replyThreadId ? { replyThreadId } : {}),
      ...(replyTo ? { replyTo } : {}),
      ...(replySubject ? { replySubject } : {}),
    }
  },
  component: ComposePage,
})

function ComposePage() {
  const isMobile = useIsMobile()
  const { from, replyMessageId, replyThreadId, replyTo, replySubject } = Route.useSearch()
  const navigate = Route.useNavigate()

  const handleFromAddressChange = (nextFrom: string | null) => {
    navigate({
      search: (prev) => ({ ...prev, from: nextFrom ?? undefined }),
      replace: true,
    })
  }

  if (isMobile) {
    return (
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ComposeEmail
          fromAddress={from ?? null}
          onFromAddressChange={handleFromAddressChange}
          messageId={replyMessageId}
          initialTo={replyTo}
          initialSubject={replySubject}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="min-h-0 min-w-0 basis-1/2 border-r-0">
        <ComposeReference threadId={replyThreadId} />
      </div>
      <Separator orientation="vertical" />
      <div className="min-h-0 min-w-0 basis-2/3">
        <ComposeEmail
          fromAddress={from ?? null}
          onFromAddressChange={handleFromAddressChange}
          messageId={replyMessageId}
          initialTo={replyTo}
          initialSubject={replySubject}
        />
      </div>
    </div>
  )
}
