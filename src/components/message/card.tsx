import { ChevronDown, MoreVertical, Star } from "lucide-react"

import { AttachmentDownloadChip } from "@/components/attachment/download-chip"
import { MessageHtmlFrame } from "@/components/message/html-frame"
import { MessageMetadataContent } from "@/components/message/metadata-content"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatRelativeDate } from "@/lib/date"
import { getMailAddressFullLabel, getMailAddressLabel } from "@/lib/mail-address"
import { m } from "@/paraglide/messages"
import type { InboxMessage } from "@/types/email"

function getRecipientSummary(message: InboxMessage, accountEmail?: string) {
  const recipients = message.to

  if (recipients.length === 0) {
    return m.message_no_recipients()
  }

  const normalizedAccountEmail = accountEmail?.trim().toLowerCase()
  const first = recipients[0]
  const firstLabel =
    normalizedAccountEmail && first.email.trim().toLowerCase() === normalizedAccountEmail
      ? m.message_recipient_self()
      : getMailAddressLabel(first)
  const others = recipients.length - 1

  return others > 0 ? m.message_recipient_others({ recipient: firstLabel, count: others }) : firstLabel
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
          aria-label={isExpanded ? m.message_collapse() : m.message_expand()}
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
                    aria-label={m.message_details()}
                  />
                }
              >
                <span className="min-w-0 truncate">{m.message_to_suffix({ recipients: recipientSummary })}</span>
                <ChevronDown data-icon="inline-end" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)]">
                <MessageMetadataContent message={message} />
              </PopoverContent>
            </Popover>
          </div>
          <button
            type="button"
            className="block w-full min-w-0 cursor-pointer truncate rounded-sm text-left text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? m.message_collapse() : m.message_expand()}
          >
            {isExpanded ? message.subject || m.message_no_subject() : message.snippet}
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
              title={m.message_star_disabled()}
              aria-label={m.message_star()}
            >
              <Star />
            </Button>
            {menuActions ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={m.message_more()} />}>
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
            <MessageHtmlFrame html={message.bodyHtml} />
          ) : (
            <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">{message.bodyText}</div>
          )}

          {message.attachments.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                <AttachmentDownloadChip key={attachment.id} attachment={attachment} />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
