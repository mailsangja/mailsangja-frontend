import { Skeleton } from "@/components/ui/skeleton"

interface ThreadListSkeletonRowsProps {
  count?: number
  view?: "single" | "double"
}

export function ThreadListSkeletonRows({ count = 10, view = "double" }: ThreadListSkeletonRowsProps) {
  return Array.from({ length: count }).map((_, index) =>
    view === "single" ? (
      <div
        key={index}
        className="flex min-w-0 flex-col gap-1 border-b border-l-2 border-l-transparent px-3 py-2.5"
        role="listitem"
        aria-hidden="true"
      >
        <div className="flex w-full min-w-0 items-center gap-3.5">
          <div className="mr-0.5 hidden md:flex">
            <Skeleton className="size-4 rounded" />
          </div>
          <Skeleton className="mx-0.5 size-4 shrink-0" />
          <Skeleton className="size-5 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-42 shrink-0" />
          <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
            <Skeleton className="h-4 w-32 min-w-0 shrink" />
            <Skeleton className="mx-1 h-4 w-4 shrink-0" />
            <Skeleton className="h-4 min-w-0 flex-1" />
          </div>
          <Skeleton className="h-4 w-10 shrink-0" />
        </div>
      </div>
    ) : (
      <div
        key={index}
        className="flex min-w-0 flex-col gap-1.5 border-b border-l-2 border-l-transparent px-3 py-2.5 md:flex-row md:items-start md:gap-3"
        role="listitem"
        aria-hidden="true"
      >
        <div className="flex min-w-0 items-center gap-3.5 md:w-72 md:shrink-0">
          <div className="mr-0.5 hidden md:flex">
            <Skeleton className="size-4 rounded" />
          </div>
          <Skeleton className="mx-0.5 hidden size-4 shrink-0 md:flex" />
          <Skeleton className="size-5 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-32 min-w-0" />
          <Skeleton className="h-3 w-4 shrink-0" />
          <Skeleton className="ml-auto h-4 w-12 shrink-0 md:hidden" />
        </div>

        <div className="flex min-w-0 flex-1 gap-2 md:flex-col">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex min-w-0 items-center gap-2">
              <Skeleton className="h-4 min-w-0 flex-1" />
              <Skeleton className="hidden h-4 w-12 shrink-0 md:block" />
            </div>

            <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center">
              <Skeleton className="h-4 min-w-0 md:flex-1" />
              <div className="flex min-w-0 items-center gap-1.5 md:shrink-0 md:justify-end">
                <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
                <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
                <Skeleton className="h-5 w-10 shrink-0 rounded-full" />
              </div>
            </div>
          </div>
          <Skeleton className="size-4 self-end md:hidden" />
        </div>
      </div>
    )
  )
}
