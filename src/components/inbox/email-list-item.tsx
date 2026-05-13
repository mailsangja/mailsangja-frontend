import { useState } from "react"
import { Paperclip } from "lucide-react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { TableCell, TableRow } from "@/components/ui/table"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatFullDateTime, formatRelativeDate } from "@/lib/date"
import { AccountIcon } from "@/lib/icon-entries"
import { getMailAddressLabel } from "@/lib/mail-address"
import { cn } from "@/lib/utils"
import type { InboxThreadSummary, LabelSummary } from "@/types/email"
import type { MailAccount } from "@/types/mail-account"

type LabelsColorMap = Map<string, string>

interface EmailListItemProps {
  thread: InboxThreadSummary
  isSelected: boolean
  isChecked: boolean
  account?: MailAccount
  labelsColorMap: LabelsColorMap
  onSelect: () => void
  onToggleCheck: () => void
}

interface EmailListItemCellsProps {
  thread: InboxThreadSummary
  isUnread: boolean
  isChecked: boolean
  account?: MailAccount
  participantLabel: string
  labelsColorMap: LabelsColorMap
  onToggleCheck: () => void
}

interface EmailListItemPreviewProps {
  thread: InboxThreadSummary
  participantLabel: string
  labelsColorMap: LabelsColorMap
}

function LabelChips({ labels, labelsColorMap }: { labels: LabelSummary[]; labelsColorMap: LabelsColorMap }) {
  if (labels.length === 0) return null
  return (
    <>
      {labels.map((label) => (
        <span
          key={label.labelId}
          className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: labelsColorMap.get(label.labelId) ?? label.colorCode }}
        >
          {label.name}
        </span>
      ))}
    </>
  )
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

function EmailListItemCells({
  thread,
  isUnread,
  isChecked,
  account,
  participantLabel,
  labelsColorMap,
  onToggleCheck,
}: EmailListItemCellsProps) {
  const hasAttachments = thread.attachments.length > 0

  return (
    <>
      <TableCell onClick={(event) => event.stopPropagation()}>
        <div className="flex justify-center">
          <Checkbox checked={isChecked} onCheckedChange={onToggleCheck} aria-label="메일 선택" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-center">
          {account?.icon ? (
            <div
              className="flex size-6 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: account.color || "#6B7280" }}
            >
              <AccountIcon name={account.icon} className="size-3.5 text-white" />
            </div>
          ) : (
            <span className={cn("size-2.5 rounded-full", isUnread ? "bg-primary" : "bg-transparent")} />
          )}
        </div>
      </TableCell>
      <TableCell className="truncate">
        <span className={cn("truncate", isUnread ? "text-foreground" : "text-muted-foreground")}>
          {participantLabel}
        </span>
      </TableCell>
      <TableCell className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          {thread.labels.length > 0 && (
            <div className="flex shrink-0 items-center gap-1">
              <LabelChips labels={thread.labels} labelsColorMap={labelsColorMap} />
            </div>
          )}
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

function EmailListItemPreview({ thread, participantLabel, labelsColorMap }: EmailListItemPreviewProps) {
  const hasAttachments = thread.attachments.length > 0

  return (
    <div className="space-y-2.5">
      <p className="text-sm leading-snug font-semibold">{thread.latestSubject || "(제목 없음)"}</p>
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{thread.snippet}</p>
      <Separator />
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="rounded font-normal">
          {participantLabel}
        </Badge>
        <LabelChips labels={thread.labels} labelsColorMap={labelsColorMap} />
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

export function EmailListItem({
  thread,
  isSelected,
  isChecked,
  account,
  labelsColorMap,
  onSelect,
  onToggleCheck,
}: EmailListItemProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<PopoverPrimitive.Positioner.Props["anchor"]>(null)
  const isUnread = !thread.isRead
  const participantLabel = getMailAddressLabel(thread.participant)
  const rowClassName = cn(
    "cursor-pointer border-l-2 transition-colors",
    isSelected ? "border-l-primary bg-accent" : "border-l-transparent",
    isUnread ? "font-semibold hover:bg-accent" : "bg-accent/50 hover:bg-accent",
    isSelected && "hover:bg-accent"
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
          isChecked={isChecked}
          account={account}
          participantLabel={participantLabel}
          labelsColorMap={labelsColorMap}
          onToggleCheck={onToggleCheck}
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
        <EmailListItemPreview thread={thread} participantLabel={participantLabel} labelsColorMap={labelsColorMap} />
      </PopoverContent>
    </Popover>
  )
}
