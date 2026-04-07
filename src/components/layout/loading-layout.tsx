import { Loader2 } from "lucide-react"

function LoadingLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Loader2 className="animate-spin" />
    </div>
  )
}

export { LoadingLayout }
