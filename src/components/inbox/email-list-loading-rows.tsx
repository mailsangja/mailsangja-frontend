import { Skeleton } from "@/components/ui/skeleton"

interface EmailListLoadingRowsProps {
  count?: number
}

const loadingItemClassName =
  "flex min-w-0 flex-col gap-1.5 border-b px-3.5 py-3 md:flex-row md:items-center md:gap-3 md:px-3 md:py-2.5"

export function EmailListLoadingRows({ count = 10 }: EmailListLoadingRowsProps) {
  return Array.from({ length: count }).map((_, index) => (
    <div key={index} className={loadingItemClassName} role="listitem" aria-label="메일 목록 불러오는 중">
      <div className="flex min-w-0 items-center gap-1.5 md:w-48 md:shrink-0">
        <div className="hidden justify-center md:flex">
          <Skeleton className="size-4 rounded" />
        </div>
        <Skeleton className="size-5 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-24 min-w-0" />
        <Skeleton className="h-3 w-4 shrink-0" />
        <Skeleton className="ml-auto h-4 w-12 shrink-0 md:hidden" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="h-4 min-w-0 flex-1" />
          <Skeleton className="hidden h-4 w-12 shrink-0 md:block" />
        </div>

        <div className="flex min-w-0 flex-col gap-1 md:flex-row md:items-center">
          <Skeleton className="h-4 min-w-0 md:flex-1" />
          <div className="flex min-w-0 items-center justify-between gap-1 overflow-hidden md:max-w-[18rem] md:shrink-0 md:justify-end">
            <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
            <div className="flex min-w-0 items-center gap-1 overflow-hidden md:max-w-56 md:justify-end">
              <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
              <Skeleton className="h-5 w-10 shrink-0 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ))
}
