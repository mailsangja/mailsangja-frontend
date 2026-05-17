import { ChevronDown, MoreVertical, Star } from "lucide-react"

import { AttachmentChip } from "@/components/attachment-chip"
import { MessageBodyFrame } from "@/components/message-body-frame"
import { MessageDetail } from "@/components/message-detail"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatRelativeDate } from "@/lib/date"
import { getMailAddressFullLabel, getMailAddressLabel } from "@/lib/mail-address"
import type { InboxMessage } from "@/types/email"

function getRecipientSummary(message: InboxMessage, accountEmail?: string) {
  const recipients = message.to

  if (recipients.length === 0) {
    return "받는 사람 없음"
  }

  const normalizedAccountEmail = accountEmail?.trim().toLowerCase()
  const first = recipients[0]
  const firstLabel =
    normalizedAccountEmail && first.email.trim().toLowerCase() === normalizedAccountEmail
      ? "나"
      : getMailAddressLabel(first)
  const others = recipients.length - 1

  return others > 0 ? `${firstLabel} 외 ${others}명` : firstLabel
}

function getInitials(value: string) {
  const localPart = value.split("@")[0]?.trim() ?? ""
  return localPart.slice(0, 2).toUpperCase() || "?"
}

interface MessageCardProps {
  message: InboxMessage
  isExpanded: boolean
  onToggle: () => void
  accountEmail?: string
  menuActions?: React.ReactNode
}

export function MessageCard({ message, isExpanded, onToggle, accountEmail, menuActions }: MessageCardProps) {
  const senderName = getMailAddressLabel(message.from)
  const fullSenderLabel = getMailAddressFullLabel(message.from)
  const recipientSummary = getRecipientSummary(message, accountEmail)

  return (
    <article className="w-full min-w-0 p-4">
      <header className="flex items-start gap-3">
        <button
          type="button"
          className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "메시지 접기" : "메시지 펼치기"}
        >
          <Avatar>
            <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
          </Avatar>
        </button>

        <div className="-mt-1 min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
            <Tooltip>
              <TooltipTrigger className="mr-2 font-semibold">{senderName}</TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-80 items-start">
                <span className="max-w-72 truncate">{fullSenderLabel}</span>
              </TooltipContent>
            </Tooltip>
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="xs"
                    className="-ml-2 text-muted-foreground"
                    aria-label="메시지 상세 정보"
                  />
                }
              >
                <span className="min-w-0 truncate">{recipientSummary}에게</span>
                <ChevronDown data-icon="inline-end" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)]">
                <MessageDetail message={message} />
              </PopoverContent>
            </Popover>
          </div>
          <button
            type="button"
            className="block w-full min-w-0 cursor-pointer truncate rounded-sm text-left text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "메시지 접기" : "메시지 펼치기"}
          >
            {isExpanded ? message.subject || "(제목 없음)" : message.snippet}
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden truncate text-xs text-muted-foreground/80 sm:inline">
            {formatRelativeDate(message.sentAt)}
          </span>
          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled
              title="즐겨찾기는 아직 지원되지 않습니다."
              aria-label="즐겨찾기"
            >
              <Star />
            </Button>
            {menuActions ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="메시지 더보기" />}>
                  <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-36">
                  {menuActions}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </header>

      {isExpanded ? (
        <div className="mt-4 pl-0 sm:pl-11">
          {message.bodyHtml ? (
            <MessageBodyFrame html={message.bodyHtml} />
          ) : (
            <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">{message.bodyText}</div>
          )}

          {message.attachments.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                <AttachmentChip key={attachment.id} attachment={attachment} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
