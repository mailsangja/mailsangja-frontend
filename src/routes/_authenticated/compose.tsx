import { createFileRoute } from "@tanstack/react-router"

import { ComposeEmail } from "@/components/compose/compose-email"
import { ReferencePlaceholder } from "@/components/compose/compose-reference"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"

export const Route = createFileRoute("/_authenticated/compose")({
  component: ComposePage,
})

function ComposePage() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ComposeEmail />
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
        <ComposeEmail />
      </div>
    </div>
  )
}
