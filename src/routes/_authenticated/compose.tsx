import { createFileRoute } from "@tanstack/react-router"

import { ComposeEmail } from "@/components/compose/compose-email"
import { ReferencePlaceholder } from "@/components/compose/compose-reference"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"

interface ComposeRouteSearch {
  from?: string
}

export const Route = createFileRoute("/_authenticated/compose")({
  validateSearch: (search: Record<string, unknown>): ComposeRouteSearch => {
    const from = typeof search.from === "string" ? search.from.trim() : ""
    return from ? { from } : {}
  },
  component: ComposePage,
})

function ComposePage() {
  const isMobile = useIsMobile()
  const { from } = Route.useSearch()

  if (isMobile) {
    return (
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ComposeEmail initialFromAddress={from} />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="min-h-0 min-w-0 basis-1/2 border-r-0">
        <ReferencePlaceholder />
      </div>
      <Separator orientation="vertical" />
      <div className="min-h-0 min-w-0 basis-2/3">
        <ComposeEmail initialFromAddress={from} />
      </div>
    </div>
  )
}
