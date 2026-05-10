import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface EmailErrorStateProps {
  title: string
  description: string
  retryLabel?: string
  onRetry?: () => void
}

export function EmailErrorState({ title, description, retryLabel = "다시 시도", onRetry }: EmailErrorStateProps) {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" />
      </div>
      <div className="max-w-sm">
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}
