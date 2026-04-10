import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

export type EmailFilter = "all" | "unread"

const filterOptions: Array<{ value: EmailFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "unread", label: "안읽음" },
]

interface EmailListHeaderProps {
  mailboxName: string
  threadCount: number
  filter: EmailFilter
  onFilterChange: (filter: EmailFilter) => void
}

export function EmailListHeader({ mailboxName, threadCount, filter, onFilterChange }: EmailListHeaderProps) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-3 border-b px-4">
      <h2 className="min-w-0 truncate text-sm font-medium">{mailboxName}</h2>
      <span className="hidden rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-flex">
        {threadCount.toLocaleString()}개
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {filterOptions.map((option) => (
          <Toggle
            key={option.value}
            pressed={filter === option.value}
            onPressedChange={(pressed) => {
              if (pressed) {
                onFilterChange(option.value)
              }
            }}
            size="sm"
            className={cn("text-xs", filter === option.value && "bg-muted font-medium")}
          >
            {option.label}
          </Toggle>
        ))}
      </div>
    </div>
  )
}
