import { useEffect, useMemo, useRef, useState } from "react"
import { Paperclip, Star } from "lucide-react"

import { AttachmentDownloadChip } from "@/components/attachment/download-chip"
import { LabelChipList, type LabelChipMap } from "@/components/label/label-chip"
import { MailAccountIcon } from "@/components/mail-account-icon"
import { ThreadPreviewPopoverContent } from "@/components/thread/preview-popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatFullDateTime, formatRelativeDate } from "@/lib/date"
import { getMailAddressLabel } from "@/lib/mail-address"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"
import type { InboxThreadSummary } from "@/types/email"
import type { MailAccount } from "@/types/mail-account"

interface ThreadListItemProps {
  thread: InboxThreadSummary
  isSelected: boolean
  isChecked: boolean
  isSelectionMode: boolean
  account?: MailAccount
  labelsColorMap: LabelChipMap
  view?: "single" | "double"
  previewEnabled?: boolean
  attachmentDisplay?: "inline" | "icon"
  onSelect: () => void
  onToggleCheck: () => void
}

function SenderTooltipContent({ participant }: { participant: InboxThreadSummary["participant"] }) {
  const name = participant.name?.trim()
  const email = participant.email.trim()

  return (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <span className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-background/70">{m.thread_sender_tooltip_name()}</span>
        <span className="min-w-0 truncate">{name || email || m.thread_sender_unknown()}</span>
      </span>
      {name && email ? (
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-background/70">{m.thread_sender_tooltip_email()}</span>
          <span className="min-w-0 truncate">{email}</span>
        </span>
      ) : null}
    </span>
  )
}

function AccountTooltipContent({ account }: { account?: MailAccount }) {
  if (!account) {
    return <span>{m.thread_account_missing()}</span>
  }

  return <span>{account.alias ? `${account.alias} (${account.emailAddress})` : account.emailAddress}</span>
}

function ThreadAttachmentChips({ attachments }: { attachments: InboxThreadSummary["attachments"] }) {
  return (
    <div className="flex w-full min-w-0 items-center gap-1.5 overflow-hidden">
      {attachments.slice(0, 3).map((attachment) => (
        <AttachmentDownloadChip key={attachment.id} attachment={attachment} className="max-w-60" />
      ))}
      {attachments.length > 3 ? (
        <span className="shrink-0 text-xs text-muted-foreground">+{attachments.length - 3}</span>
      ) : null}
    </div>
  )
}

function ThreadLastMessageTime({ lastMessageAt, className }: { lastMessageAt: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className={cn("flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground", className)} />}
      >
        <span>{formatRelativeDate(lastMessageAt)}</span>
      </TooltipTrigger>
      <TooltipContent>{formatFullDateTime(lastMessageAt)}</TooltipContent>
    </Tooltip>
  )
}

type ThreadListItemSubProps = {
  thread: InboxThreadSummary
  isUnread: boolean
  isChecked: boolean
  isSelectionMode: boolean
  account?: MailAccount
  participantLabel: string
  labelsColorMap: LabelChipMap
  attachmentDisplay?: "inline" | "icon"
  onToggleCheck: () => void
  onHoverStart?: React.MouseEventHandler<HTMLDivElement>
  onHoverEnd?: React.MouseEventHandler<HTMLDivElement>
  onHoverMove?: React.MouseEventHandler<HTMLDivElement>
}

function ThreadListItemContent({
  thread,
  isUnread,
  isChecked,
  isSelectionMode,
  account,
  participantLabel,
  labelsColorMap,
  attachmentDisplay,
  onToggleCheck,
  onHoverStart,
  onHoverEnd,
  onHoverMove,
}: ThreadListItemSubProps) {
  const showThreadCount = thread.messageCount > 1
  const hasLabels = thread.labels.length > 0
  const hasAttachments = thread.attachments.length > 0

  return (
    <>
      <div className="flex w-full min-w-0 items-center gap-3.5 md:w-60 md:shrink-0">
        <div
          className={cn("mr-0.5", isSelectionMode ? "flex" : "hidden", "md:flex")}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Checkbox checked={isChecked} onCheckedChange={onToggleCheck} aria-label={m.thread_select_mail()} />
        </div>

        <Star
          className={cn(
            "hidden size-4 shrink-0 md:block",
            thread.star ? "fill-primary text-primary" : "text-muted-foreground/40"
          )}
          aria-label={thread.star ? m.message_starred() : undefined}
        />

        <span
          className={cn(
            "flex min-w-0 items-center gap-2 text-sm font-medium",
            "flex-1",
            isUnread ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <Tooltip>
            <TooltipTrigger
              aria-label={m.thread_account_info()}
              render={<MailAccountIcon icon={account?.icon} color={account?.color} />}
            />
            <TooltipContent side="bottom" align="start" className="max-w-72 items-start">
              <AccountTooltipContent account={account} />
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger render={<span className="min-w-0 truncate" />}>{participantLabel}</TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-72 items-start">
              <SenderTooltipContent participant={thread.participant} />
            </TooltipContent>
          </Tooltip>

          {showThreadCount ? (
            <span className="-ml-0.5 text-xs font-normal text-muted-foreground">{thread.messageCount}</span>
          ) : null}
        </span>

        <ThreadLastMessageTime lastMessageAt={thread.lastMessageAt} className="ml-auto md:hidden" />
      </div>

      <div
        className="flex min-w-0 flex-1 gap-2 md:flex-col"
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onMouseMove={onHoverMove}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex w-full min-w-0 items-center gap-2">
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-sm",
                isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
              )}
            >
              {thread.latestSubject || m.message_no_subject()}
            </span>

            {hasAttachments && attachmentDisplay === "icon" && (
              <Paperclip className="hidden size-3.5 shrink-0 text-muted-foreground md:block" />
            )}

            <ThreadLastMessageTime lastMessageAt={thread.lastMessageAt} className="hidden md:flex" />
          </div>

          <div className="flex min-w-0 flex-col gap-2 md:flex-row md:items-center">
            <span className="line-clamp-1 min-w-0 text-sm text-muted-foreground md:flex-1">{thread.snippet}</span>

            {hasLabels ? (
              <span className="flex min-w-0 items-center justify-start gap-1.5 md:shrink-0 md:justify-end">
                <LabelChipList
                  labels={thread.labels}
                  labelsColorMap={labelsColorMap}
                  hideMissingLabels
                  className="max-w-48 shrink-0 truncate"
                />
              </span>
            ) : null}
          </div>

          {hasAttachments && attachmentDisplay !== "icon" ? (
            <div className="hidden w-full md:block">
              <ThreadAttachmentChips attachments={thread.attachments} />
            </div>
          ) : null}
        </div>

        <Star
          className={cn(
            "size-4 shrink-0 self-end md:hidden",
            thread.star ? "fill-primary text-primary" : "text-muted-foreground/40"
          )}
          aria-label={thread.star ? m.message_starred() : undefined}
        />
      </div>
    </>
  )
}

function ThreadListItemSingleLine({
  thread,
  isUnread,
  isChecked,
  isSelectionMode,
  account,
  participantLabel,
  labelsColorMap,
  attachmentDisplay,
  onToggleCheck,
  onHoverStart,
  onHoverEnd,
  onHoverMove,
}: ThreadListItemSubProps) {
  const showThreadCount = thread.messageCount > 1
  const hasLabels = thread.labels.length > 0
  const hasAttachments = thread.attachments.length > 0

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <div className="flex w-full min-w-0 items-center gap-3.5">
        <div
          className={cn("mr-0.5", isSelectionMode ? "flex" : "hidden", "md:flex")}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Checkbox checked={isChecked} onCheckedChange={onToggleCheck} aria-label={m.thread_select_mail()} />
        </div>

        <Star
          className={cn(
            "mx-1.5 size-4 shrink-0",
            thread.star ? "fill-primary text-primary" : "text-muted-foreground/40"
          )}
          aria-label={thread.star ? m.message_starred() : undefined}
        />

        <Tooltip>
          <TooltipTrigger
            aria-label={m.thread_account_info()}
            render={<MailAccountIcon icon={account?.icon} color={account?.color} className="shrink-0" />}
          />
          <TooltipContent side="bottom" align="start" className="max-w-72 items-start">
            <AccountTooltipContent account={account} />
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <span
                className={cn(
                  "w-42 shrink-0 truncate text-sm font-medium",
                  isUnread ? "text-foreground" : "text-muted-foreground"
                )}
              />
            }
          >
            {participantLabel}
            {showThreadCount ? (
              <span className="ml-1 text-xs font-normal text-muted-foreground">{thread.messageCount}</span>
            ) : null}
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-72 items-start">
            <SenderTooltipContent participant={thread.participant} />
          </TooltipContent>
        </Tooltip>

        <div
          className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden"
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          onMouseMove={onHoverMove}
        >
          <span
            className={cn(
              "min-w-0 shrink truncate text-sm",
              isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
            )}
          >
            {thread.latestSubject || m.message_no_subject()}
          </span>

          {hasAttachments && attachmentDisplay === "icon" && (
            <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
          )}

          <span className="mx-1 shrink-0 text-muted-foreground/40">—</span>

          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{thread.snippet}</span>

          {hasLabels ? (
            <span className="flex shrink-0 items-center gap-1.5">
              <LabelChipList
                labels={thread.labels}
                labelsColorMap={labelsColorMap}
                hideMissingLabels
                className="max-w-36 shrink-0 truncate"
              />
            </span>
          ) : null}
        </div>

        <ThreadLastMessageTime lastMessageAt={thread.lastMessageAt} />
      </div>

      {hasAttachments && attachmentDisplay !== "icon" ? (
        <div className="hidden min-w-0 items-center md:flex">
          <div className="flex shrink-0 items-center gap-3.5" aria-hidden="true">
            <div className="flex size-4 shrink-0" />
            <div className="size-4 shrink-0" />
            <div className="size-5 shrink-0" />
            <div className="w-45 shrink-0" />
          </div>
          <div className="ml-3.5 min-w-0 flex-1">
            <ThreadAttachmentChips attachments={thread.attachments} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function ThreadListItem({
  thread,
  isSelected,
  isChecked,
  isSelectionMode,
  account,
  labelsColorMap,
  view = "double",
  previewEnabled = false,
  attachmentDisplay = "inline",
  onSelect,
  onToggleCheck,
}: ThreadListItemProps) {
  const isMobile = useIsMobile()
  const longPressTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const ignoreNextClickRef = useRef(false)
  const mousePositionRef = useRef({ x: 0, y: 0 })
  const virtualAnchor = useMemo(
    () => ({ getBoundingClientRect: () => new DOMRect(mousePositionRef.current.x, mousePositionRef.current.y, 0, 0) }),
    []
  )
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const isUnread = !thread.isRead
  const participantLabel = getMailAddressLabel(thread.participant)
  const rowClassName = cn(
    "flex cursor-pointer border-b border-l-2 border-l-transparent px-3 py-2.5 transition-colors select-none hover:bg-accent",
    view === "double" ? "flex-col gap-1.5 md:flex-row md:items-start md:gap-3" : "flex-col gap-1",
    isSelected && "border-l-primary",
    isUnread ? "font-semibold" : "bg-accent/70",
    isSelected && isUnread && "bg-accent",
    isChecked && !isSelected && "bg-accent/70"
  )

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !previewEnabled) return
    mousePositionRef.current = { x: event.clientX, y: event.clientY }
    hoverTimerRef.current = window.setTimeout(() => {
      setIsPreviewOpen(true)
    }, 600)
  }

  const handleMouseLeave = () => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    setIsPreviewOpen(false)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    mousePositionRef.current = { x: event.clientX, y: event.clientY }
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
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current)
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

  return (
    <Popover open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <div
        role="listitem"
        data-state={isSelected ? "selected" : undefined}
        onClick={(event) => {
          if (ignoreNextClickRef.current) {
            ignoreNextClickRef.current = false
            event.preventDefault()
            return
          }

          setIsPreviewOpen(false)
          handleRowAction()
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            handleRowAction()
          }
        }}
        onPointerDown={(event) => {
          startLongPressSelection(event)
        }}
        onPointerLeave={(event) => {
          handlePointerEnd(event)
        }}
        onPointerUp={(event) => {
          handlePointerEnd(event)
        }}
        onPointerCancel={(event) => {
          handlePointerEnd(event)
        }}
        className={rowClassName}
      >
        {view === "single" ? (
          <ThreadListItemSingleLine
            thread={thread}
            isUnread={isUnread}
            isChecked={isChecked}
            isSelectionMode={isSelectionMode}
            account={account}
            participantLabel={participantLabel}
            labelsColorMap={labelsColorMap}
            attachmentDisplay={attachmentDisplay}
            onToggleCheck={onToggleCheck}
            onHoverStart={handleMouseEnter}
            onHoverEnd={handleMouseLeave}
            onHoverMove={handleMouseMove}
          />
        ) : (
          <ThreadListItemContent
            thread={thread}
            isUnread={isUnread}
            isChecked={isChecked}
            isSelectionMode={isSelectionMode}
            account={account}
            participantLabel={participantLabel}
            labelsColorMap={labelsColorMap}
            attachmentDisplay={attachmentDisplay}
            onToggleCheck={onToggleCheck}
            onHoverStart={handleMouseEnter}
            onHoverEnd={handleMouseLeave}
            onHoverMove={handleMouseMove}
          />
        )}
      </div>
      {previewEnabled && !isMobile && <ThreadPreviewPopoverContent thread={thread} anchor={virtualAnchor} />}
    </Popover>
  )
}
