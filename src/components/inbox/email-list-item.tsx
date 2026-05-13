import { useEffect, useRef } from "react"
import { Paperclip } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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

function SenderTooltipContent({ participant }: { participant: InboxThreadSummary["participant"] }) {
  const name = participant.name?.trim()
  const email = participant.email.trim()

  return (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <span className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-background/70">이름</span>
        <span className="min-w-0 truncate">{name || email || "알 수 없음"}</span>
      </span>
      {name && email ? (
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-background/70">이메일</span>
          <span className="min-w-0 truncate">{email}</span>
        </span>
      ) : null}
    </span>
  )
}

function AccountTooltipContent({ account }: { account?: MailAccount }) {
  if (!account) {
    return <span>계정 정보 없음</span>
  }

  return <span>{account.alias ? `${account.alias} (${account.emailAddress})` : account.emailAddress}</span>
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
    <Tooltip>
      <TooltipTrigger
        render={<span className={cn("flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground", className)} />}
      >
        <span>{formatRelativeDate(thread.lastMessageAt)}</span>
        {isUnread ? <span className="ml-0.5 size-1.5 rounded-full bg-primary" aria-hidden="true" /> : null}
      </TooltipTrigger>
      <TooltipContent>{formatFullDateTime(thread.lastMessageAt)}</TooltipContent>
    </Tooltip>
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
          <Tooltip>
            <TooltipTrigger
              aria-label="계정 정보"
              render={
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: account?.color || "#6B7280" }}
                />
              }
            >
              <AccountIcon name={account?.icon ?? "mail"} className="size-3.5 text-white" />
            </TooltipTrigger>
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
              {hasAttachments ? (
                <Tooltip>
                  <TooltipTrigger render={<span className="flex shrink-0 items-center" />}>
                    <Paperclip className="mx-auto size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end" className="max-w-72 items-start">
                    <span className="flex min-w-0 flex-col items-start gap-1">
                      <span>첨부파일 {thread.attachments.length}개</span>
                      {thread.attachments.slice(0, 3).map((attachment) => (
                        <span key={attachment.id} className="max-w-64 truncate text-background/80">
                          {attachment.filename}
                        </span>
                      ))}
                      {thread.attachments.length > 3 ? (
                        <span className="text-background/70">외 {thread.attachments.length - 3}개</span>
                      ) : null}
                    </span>
                  </TooltipContent>
                </Tooltip>
              ) : null}
              <LabelChips labels={thread.labels} labelsColorMap={labelsColorMap} />
            </span>
          ) : null}
        </div>
      </div>
    </>
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

  return renderRow()
}
