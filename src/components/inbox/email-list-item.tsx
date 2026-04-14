import { useState } from "react"
import { Paperclip } from "lucide-react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { TableCell, TableRow } from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatFullDateTime, formatRelativeDate } from "@/lib/date"
import { getMailAddressLabel } from "@/lib/mail-address"
import { cn } from "@/lib/utils"
import type { InboxThreadSummary } from "@/types/email"

interface EmailListItemProps {
  thread: InboxThreadSummary
  isSelected: boolean
  accountColor?: string
  onSelect: () => void
}

interface EmailListItemCellsProps {
  thread: InboxThreadSummary
  isUnread: boolean
  accountColor?: string
  participantLabel: string
}

interface EmailListItemPreviewProps {
  thread: InboxThreadSummary
  participantLabel: string
}

function createCursorAnchor(
  clientX: number,
  clientY: number,
  contextElement: Element
): NonNullable<PopoverPrimitive.Positioner.Props["anchor"]> {
  return {
    contextElement,
    getBoundingClientRect: () => new DOMRect(clientX, clientY, 0, 0),
  }
}

function EmailListItemCells({ thread, isUnread, accountColor, participantLabel }: EmailListItemCellsProps) {
  const hasAttachments = thread.attachments.length > 0

  return (
    <>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className={cn("size-2.5 rounded-full", isUnread ? "bg-primary" : "bg-transparent")} />
          {accountColor ? (
            <span className="hidden size-2 rounded-full md:inline-flex" style={{ backgroundColor: accountColor }} />
          ) : null}
        </div>
      </TableCell>
      <TableCell className="truncate">
        <span className={cn("truncate", isUnread ? "text-foreground" : "text-muted-foreground")}>
          {participantLabel}
        </span>
      </TableCell>
      <TableCell className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("truncate", isUnread ? "text-foreground" : "text-muted-foreground")}>
            {thread.latestSubject || "(제목 없음)"}
          </span>
          <span className="truncate text-muted-foreground">- {thread.snippet}</span>
        </div>
      </TableCell>
      <TableCell className="hidden text-center md:table-cell">
        {hasAttachments ? <Paperclip className="mx-auto size-4 text-muted-foreground" /> : null}
      </TableCell>
      <TableCell className="text-right text-xs text-muted-foreground">
        {formatRelativeDate(thread.lastMessageAt)}
      </TableCell>
    </>
  )
}

function EmailListItemPreview({ thread, participantLabel }: EmailListItemPreviewProps) {
  const hasAttachments = thread.attachments.length > 0

  return (
    <div className="space-y-2.5">
      <p className="text-sm leading-snug font-semibold">{thread.latestSubject || "(제목 없음)"}</p>
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{thread.snippet}</p>
      <Separator />
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="font-normal">
          {participantLabel}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {hasAttachments ? (
          <span className="flex items-center gap-1">
            <Paperclip className="size-3" />
            첨부 {thread.attachments.length}개
          </span>
        ) : null}
        <span>{formatFullDateTime(thread.lastMessageAt)}</span>
      </div>
    </div>
  )
}

export function EmailListItem({ thread, isSelected, accountColor, onSelect }: EmailListItemProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<PopoverPrimitive.Positioner.Props["anchor"]>(null)
  const isUnread = !thread.isRead
  const participantLabel = getMailAddressLabel(thread.participant)
  const rowClassName = cn(
    "cursor-pointer",
    isUnread && "bg-accent/20 font-medium",
    isSelected && "bg-accent hover:bg-accent"
  )

  const updateAnchor = (event: React.PointerEvent<HTMLTableRowElement>) => {
    setAnchor(createCursorAnchor(event.clientX, event.clientY, event.currentTarget))
  }

  const renderRow = (triggerProps: React.HTMLAttributes<HTMLTableRowElement> = {}) => {
    const { onClick, onPointerEnter, onPointerMove, className, ...rowProps } = triggerProps

    return (
      <TableRow
        {...rowProps}
        data-state={isSelected ? "selected" : undefined}
        onClick={(event) => {
          onSelect()
          onClick?.(event)
        }}
        onPointerEnter={(event) => {
          updateAnchor(event)
          onPointerEnter?.(event)
        }}
        onPointerMove={(event) => {
          if (!open) {
            updateAnchor(event)
          }
          onPointerMove?.(event)
        }}
        className={cn(className, rowClassName)}
      >
        <EmailListItemCells
          thread={thread}
          isUnread={isUnread}
          accountColor={accountColor}
          participantLabel={participantLabel}
        />
      </TableRow>
    )
  }

  if (isMobile) {
    return renderRow()
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (details.reason === "trigger-press") return
        setOpen(nextOpen)
      }}
    >
      <PopoverTrigger
        openOnHover
        delay={300}
        closeDelay={150}
        nativeButton={false}
        render={(triggerProps) => renderRow(triggerProps)}
      />
      <PopoverContent anchor={anchor} side="bottom" align="start" sideOffset={20} className="w-80 p-4">
        <EmailListItemPreview thread={thread} participantLabel={participantLabel} />
      </PopoverContent>
    </Popover>
  )
}
