import { useEffect, useRef } from "react"
import { Star } from "lucide-react"

import { AttachmentDownloadChip } from "@/components/attachment/download-chip"
import { LabelChipList, type LabelChipMap } from "@/components/label/label-chip"
import { MailAccountIcon } from "@/components/mail-account-icon"
import { Checkbox } from "@/components/ui/checkbox"
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

function ThreadListItemContent({
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
  labelsColorMap: LabelChipMap
  onToggleCheck: () => void
}) {
  const showThreadCount = thread.messageCount > 1
  const hasLabels = thread.labels.length > 0
  const hasAttachments = thread.attachments.length > 0

  const renderTime = (className?: string) => (
    <Tooltip>
      <TooltipTrigger
        render={<span className={cn("flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground", className)} />}
      >
        <span>{formatRelativeDate(thread.lastMessageAt)}</span>
      </TooltipTrigger>
      <TooltipContent>{formatFullDateTime(thread.lastMessageAt)}</TooltipContent>
    </Tooltip>
  )

  return (
    <>
      <div className="flex w-full min-w-0 items-center gap-2.5 md:w-48 md:shrink-0">
        <div
          className={cn("mr-0.5", isSelectionMode ? "flex" : "hidden", "md:flex")}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Checkbox checked={isChecked} onCheckedChange={onToggleCheck} aria-label={m.thread_select_mail()} />
        </div>

        <Star
          className={cn("size-4 shrink-0", thread.star ? "fill-primary text-primary" : "text-muted-foreground/40")}
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

        {renderTime("ml-auto md:hidden")}
      </div>

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

          {renderTime("hidden md:flex")}
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

        {hasAttachments ? <ThreadAttachmentChips attachments={thread.attachments} /> : null}
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
  onToggleCheck,
}: {
  thread: InboxThreadSummary
  isUnread: boolean
  isChecked: boolean
  isSelectionMode: boolean
  account?: MailAccount
  participantLabel: string
  labelsColorMap: LabelChipMap
  onToggleCheck: () => void
}) {
  const showThreadCount = thread.messageCount > 1
  const hasLabels = thread.labels.length > 0
  const hasAttachments = thread.attachments.length > 0

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      <div className="flex w-full min-w-0 items-center gap-2.5">
        <div
          className={cn("shrink-0", isSelectionMode ? "flex" : "hidden", "md:flex")}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Checkbox checked={isChecked} onCheckedChange={onToggleCheck} aria-label={m.thread_select_mail()} />
        </div>

        <Star
          className={cn("size-4 shrink-0", thread.star ? "fill-primary text-primary" : "text-muted-foreground/40")}
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
                  "w-28 shrink-0 truncate text-sm font-medium md:w-36",
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

        <span
          className={cn(
            "min-w-0 shrink truncate text-sm",
            isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
          )}
        >
          {thread.latestSubject || m.message_no_subject()}
        </span>

        <span className="mx-1 hidden shrink-0 text-muted-foreground/40 md:inline">—</span>

        <span className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground md:block">{thread.snippet}</span>

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

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger render={<span className="text-xs text-muted-foreground" />}>
              {formatRelativeDate(thread.lastMessageAt)}
            </TooltipTrigger>
            <TooltipContent>{formatFullDateTime(thread.lastMessageAt)}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {hasAttachments ? (
        <div className="flex min-w-0 items-center">
          <div className="flex shrink-0 items-center gap-2.5" aria-hidden="true">
            <div className={cn("size-4 shrink-0", isSelectionMode ? "flex" : "hidden", "md:flex")} />
            <div className="size-4 shrink-0" />
            <div className="size-5 shrink-0" />
            <div className={cn("w-28 shrink-0 md:w-36")} />
          </div>
          <div className="ml-2.5 min-w-0 flex-1">
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
  onSelect,
  onToggleCheck,
}: ThreadListItemProps) {
  const isMobile = useIsMobile()
  const longPressTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const ignoreNextClickRef = useRef(false)
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

  const renderRow = () => {
    return (
      <div
        role="listitem"
        data-state={isSelected ? "selected" : undefined}
        onClick={(event) => {
          if (ignoreNextClickRef.current) {
            ignoreNextClickRef.current = false
            event.preventDefault()
            return
          }

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
            onToggleCheck={onToggleCheck}
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
            onToggleCheck={onToggleCheck}
          />
        )}
      </div>
    )
  }

  return renderRow()
}
