import { Mail, MailOpen, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Toggle } from "@/components/ui/toggle"
import { formatNumber } from "@/lib/date"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"
import type { EmailFilter } from "@/types/email"

const filterOptions: Array<{ value: EmailFilter; label: string }> = [
  { value: "all", label: m.mail_filter_all() },
  { value: "unread", label: m.mail_filter_unread() },
]

interface ThreadListToolbarProps {
  mailboxName: string
  currentCount: number
  totalCount: number
  filter: EmailFilter
  onFilterChange: (filter: EmailFilter) => void
  isRefreshing?: boolean
  onRefresh?: () => void
  selectedCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onDeleteSelected: () => void
  onMarkSelectedAsRead: () => void
  onMarkSelectedAsUnread: () => void
}

export function ThreadListToolbar({
  mailboxName,
  currentCount,
  totalCount,
  filter,
  onFilterChange,
  isRefreshing = false,
  onRefresh,
  selectedCount,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onMarkSelectedAsRead,
  onMarkSelectedAsUnread,
}: ThreadListToolbarProps) {
  const isAllSelected = selectedCount > 0 && selectedCount === currentCount
  const isIndeterminate = selectedCount > 0 && selectedCount < currentCount

  if (selectedCount > 0) {
    return (
      <div className="ml-0.5 flex h-11 shrink-0 items-center gap-3 border-b bg-accent/40 px-3">
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onCheckedChange={(checked) => {
            if (isIndeterminate) {
              onClearSelection()
            } else if (checked) {
              onSelectAll()
            } else {
              onClearSelection()
            }
          }}
          aria-label={isAllSelected ? m.mail_clear_selection() : m.mail_select_all()}
        />
        <span className="text-sm font-medium">{m.mail_selected_count({ count: formatNumber(selectedCount) })}</span>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMarkSelectedAsRead}
            aria-label={m.thread_mark_read_aria()}
            title={m.thread_mark_read()}
          >
            <MailOpen />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMarkSelectedAsUnread}
            aria-label={m.thread_mark_unread_aria()}
            title={m.thread_mark_unread()}
          >
            <Mail />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDeleteSelected} aria-label={m.mail_delete_selected()}>
            <Trash2 data-icon="inline-start" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-0.5 flex h-11 shrink-0 items-center gap-3 border-b px-3">
      <Checkbox
        checked={false}
        onCheckedChange={() => {
          onSelectAll()
          toast.info(m.mail_selected_count({ count: formatNumber(currentCount) }), {
            description: m.mail_select_all_loaded_notice(),
          })
        }}
        aria-label={m.mail_select_all()}
      />
      <h2 className="min-w-0 truncate text-sm font-medium">{mailboxName}</h2>
      <span className="hidden rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground sm:inline-flex">
        {m.mail_total_count({ count: formatNumber(totalCount) })}
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {onRefresh ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={m.mail_refresh_list()}
            title={m.mail_refresh()}
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
