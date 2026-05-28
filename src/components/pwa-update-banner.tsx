import { useSyncExternalStore } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { applyPwaUpdate, getPwaUpdateServerSnapshot, getPwaUpdateSnapshot, subscribeToPwaUpdate } from "@/lib/pwa"

export function PwaUpdateBanner() {
  const { isApplyingUpdate, isUpdateAvailable } = useSyncExternalStore(
    subscribeToPwaUpdate,
    getPwaUpdateSnapshot,
    getPwaUpdateServerSnapshot
  )

  if (!isUpdateAvailable && !isApplyingUpdate) {
    return null
  }

  return (
    <div className="rounded-md border border-sidebar-border bg-sidebar-accent/50 p-2 text-sidebar-accent-foreground">
      <div className="mb-2 min-w-0">
        <p className="truncate text-xs font-medium">🎉 메일 상자 업데이트</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-sidebar-foreground/70">다음 접속시 자동으로 적용됩니다.</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-8 w-full justify-start gap-1.5"
        disabled={isApplyingUpdate}
        onClick={() => {
          void applyPwaUpdate()
        }}
      >
        <RefreshCw className={cn("size-3.5", isApplyingUpdate && "animate-spin")} />
        <span className="truncate">{isApplyingUpdate ? "업데이트 중" : "지금 업데이트"}</span>
      </Button>
    </div>
  )
}
