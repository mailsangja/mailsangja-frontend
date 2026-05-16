import { RefreshCw, Tag, Trash2, SquareMinus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import type { EmailFilter } from "@/types/email"

const filterOptions: Array<{ value: EmailFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "unread", label: "안읽음" },
]

interface EmailListHeaderProps {
  mailboxName: string
  currentCount: number
  totalCount: number
  filter: EmailFilter
  onFilterChange: (filter: EmailFilter) => void
  isRefreshing?: boolean
  onRefresh?: () => void
  selectedCount: number
  onClearSelection: () => void
  onDeleteSelected: () => void
  onLabelSelected: () => void
}

export function EmailListHeader({
  mailboxName,
  totalCount,
  filter,
  onFilterChange,
  isRefreshing = false,
  onRefresh,
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  onLabelSelected,
}: EmailListHeaderProps) {
  if (selectedCount > 0) {
    return (
      <div className="flex h-11 shrink-0 items-center gap-2 border-b bg-accent/40 px-3">
        <Button variant="ghost" size="icon-sm" onClick={onClearSelection} aria-label="선택 해제">
          <SquareMinus />
        </Button>
        <span className="text-sm font-medium">{selectedCount.toLocaleString()}개 선택됨</span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={onDeleteSelected} aria-label="선택 삭제">
            <Trash2 data-icon="inline-start" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onLabelSelected} aria-label="라벨 지정">
            <Tag data-icon="inline-start" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-11 shrink-0 items-center gap-3 border-b px-4">
      <h2 className="min-w-0 truncate text-sm font-medium">{mailboxName}</h2>
      <span className="hidden rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-flex">
        {totalCount.toLocaleString()}개
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {onRefresh ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="메일 목록 새로고침"
            title="새로고침"
          >
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
          </Button>
        ) : null}
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
