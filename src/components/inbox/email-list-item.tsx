import { useEffect, useRef, useState } from "react"
import { Paperclip } from "lucide-react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
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
  isSelectionMode: boolean
  account?: MailAccount
  labelsColorMap: LabelsColorMap
  onSelect: () => void
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
          className="inline-flex max-w-24 shrink-0 items-center truncate rounded-full px-1.5 py-0.5 text-xs font-medium text-white"
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

function EmailListItemContent({
  thread,
  isUnread,
  isChecked,
  isSelectionMode,
  account,
  participantLabel,
  labelsColorMap,
  onToggleCheck,
}: {
  thread: InboxThreadSummary
  isUnread: boolean
  isChecked: boolean
  isSelectionMode: boolean
  account?: MailAccount
  participantLabel: string
  labelsColorMap: LabelsColorMap
  onToggleCheck: () => void
}) {
  const showThreadCount = thread.messageCount > 1
  const hasLabels = thread.labels.length > 0
  const hasAttachments = thread.attachments.length > 0

  const renderTime = (className?: string) => (
    <span className={cn("flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span>{formatRelativeDate(thread.lastMessageAt)}</span>
      {isUnread ? <span className="ml-0.5 size-1.5 rounded-full bg-primary" aria-hidden="true" /> : null}
    </span>
  )

  return (
    <>
      <div className="flex min-w-0 items-center gap-2.5 md:w-48 md:shrink-0">
        <div
          className={cn("mr-0.5", isSelectionMode ? "flex" : "hidden", "md:flex")}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Checkbox checked={isChecked} onCheckedChange={onToggleCheck} aria-label="메일 선택" />
        </div>

        <span
          className={cn(
            "flex min-w-0 items-center gap-2 text-sm font-medium",
            isUnread ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: account?.color || "#6B7280" }}
            aria-hidden="true"
          >
            <AccountIcon name={account?.icon ?? "mail"} className="size-3.5 text-white" />
          </span>

          <span className="min-w-0 truncate">{participantLabel}</span>

          {showThreadCount ? (
            <Badge variant="outline" className="-ml-0.5 text-xs text-muted-foreground">
              {thread.messageCount}
            </Badge>
          ) : null}
        </span>

        {renderTime("ml-auto md:hidden")}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
            )}
          >
            {thread.latestSubject || "(제목 없음)"}
          </span>

          {renderTime("hidden md:flex")}
        </div>

        <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center">
          <span className="line-clamp-1 min-w-0 text-sm text-muted-foreground md:flex-1">{thread.snippet}</span>

          {hasLabels || hasAttachments ? (
            <span className="flex min-w-0 items-center justify-between gap-1.5 md:shrink-0 md:justify-end">
              {hasAttachments ? <Paperclip className="mx-auto size-4 text-muted-foreground" /> : null}
              <LabelChips labels={thread.labels} labelsColorMap={labelsColorMap} />
            </span>
          ) : null}
        </div>
      </div>
    </>
  )
}

function EmailListItemPreview({ thread, participantLabel, labelsColorMap }: EmailListItemPreviewProps) {
  const hasAttachments = thread.attachments.length > 0

  return (
    <div className="flex flex-col gap-2.5">
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
  isSelectionMode,
  account,
  labelsColorMap,
  onSelect,
  onToggleCheck,
}: EmailListItemProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<PopoverPrimitive.Positioner.Props["anchor"]>(null)
  const longPressTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const ignoreNextClickRef = useRef(false)
  const isUnread = !thread.isRead
  const participantLabel = getMailAddressLabel(thread.participant)
  const rowClassName = cn(
    "flex cursor-pointer flex-col gap-1.5 border-b border-l-2 border-l-transparent p-3 transition-colors select-none hover:bg-accent md:flex-row md:items-center md:gap-3",
    isSelected && "border-l-primary",
    isUnread ? "font-semibold" : "bg-accent/50",
    isSelected && isUnread && "bg-accent",
    isChecked && !isSelected && "bg-accent/70"
  )

  const updateAnchor = (event: React.PointerEvent<HTMLDivElement>) => {
    setAnchor(createCursorAnchor(event.clientX, event.clientY, event.currentTarget))
  }

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const startLongPressSelection = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile || isSelectionMode || event.pointerType === "mouse" || event.button !== 0) {
      return
    }

    clearLongPressTimer()
    longPressTimerRef.current = window.setTimeout(() => {
      ignoreNextClickRef.current = true
      onToggleCheck()
      longPressTimerRef.current = null
    }, 500)
  }

  const handlePointerEnd = (
    event: React.PointerEvent<HTMLDivElement>,
    handler?: React.PointerEventHandler<HTMLDivElement>
  ) => {
    clearLongPressTimer()
    handler?.(event)
  }

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  const handleRowAction = () => {
    if (isMobile && isSelectionMode) {
      onToggleCheck()
      return
    }

    onSelect()
  }

  const renderRow = (triggerProps: React.HTMLAttributes<HTMLDivElement> = {}) => {
    const {
      onClick,
      onKeyDown,
      onPointerCancel,
      onPointerDown,
      onPointerEnter,
      onPointerLeave,
      onPointerMove,
      onPointerUp,
      className,
      ...rowProps
    } = triggerProps

    return (
      <div
        {...rowProps}
        role="listitem"
        data-state={isSelected ? "selected" : undefined}
        onClick={(event) => {
          if (ignoreNextClickRef.current) {
            ignoreNextClickRef.current = false
            event.preventDefault()
            return
          }

          handleRowAction()
          onClick?.(event)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            handleRowAction()
          }
          onKeyDown?.(event)
        }}
        onPointerDown={(event) => {
          startLongPressSelection(event)
          onPointerDown?.(event)
        }}
        onPointerEnter={(event) => {
          if (!isMobile) {
            updateAnchor(event)
          }
          onPointerEnter?.(event)
        }}
        onPointerLeave={(event) => {
          handlePointerEnd(event, onPointerLeave)
        }}
        onPointerMove={(event) => {
          if (!isMobile && !open) {
            updateAnchor(event)
          }
          onPointerMove?.(event)
        }}
        onPointerUp={(event) => {
          handlePointerEnd(event, onPointerUp)
        }}
        onPointerCancel={(event) => {
          handlePointerEnd(event, onPointerCancel)
        }}
        className={cn(className, rowClassName)}
      >
        <EmailListItemContent
          thread={thread}
          isUnread={isUnread}
          isChecked={isChecked}
          isSelectionMode={isSelectionMode}
          account={account}
          participantLabel={participantLabel}
          labelsColorMap={labelsColorMap}
          onToggleCheck={onToggleCheck}
        />
      </div>
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
