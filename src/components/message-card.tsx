import { MoreVertical, Star } from "lucide-react"

import { AttachmentChip } from "@/components/attachment-chip"
import { MessageBodyFrame } from "@/components/message-body-frame"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatMailAddressList, getMailAddressLabel } from "@/lib/mail-address"
import type { InboxMessage } from "@/types/email"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function getInitials(value: string) {
  const localPart = value.split("@")[0]?.trim() ?? ""
  return localPart.slice(0, 2).toUpperCase() || "?"
}

interface MessageCardProps {
  message: InboxMessage
  isExpanded: boolean
  onToggle: () => void
  menuActions?: React.ReactNode
}

export function MessageCard({ message, isExpanded, onToggle, menuActions }: MessageCardProps) {
  const senderName = getMailAddressLabel(message.from)
  const senderEmail = message.from.email

  return (
    <article className="w-full min-w-0 p-4">
      <header
        className="flex cursor-pointer items-start gap-3"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            onToggle()
          }
        }}
        aria-expanded={isExpanded}
      >
        <Avatar>
          <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 items-baseline gap-2">
            <p className="shrink-0 truncate text-sm font-semibold">{senderName}</p>
            {senderEmail && senderEmail !== senderName ? (
              <p className="hidden min-w-0 flex-1 truncate text-xs text-muted-foreground sm:block">
                &lt;{senderEmail}&gt;
              </p>
            ) : null}
          </div>
          {isExpanded ? (
            <p className="mt-0.5 text-xs break-all text-muted-foreground">
              받는 사람: {message.to.length > 0 ? formatMailAddressList(message.to) : "-"}
            </p>
          ) : (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{message.snippet}</p>
          )}
          {isExpanded && message.cc.length > 0 ? (
            <p className="mt-0.5 text-xs break-all text-muted-foreground">참조: {formatMailAddressList(message.cc)}</p>
          ) : null}
        </div>

        <div
          className="flex shrink-0 items-center gap-1"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <span className="hidden truncate text-xs text-muted-foreground/80 sm:inline">
            {formatDate(message.sentAt)}
          </span>
          <div className="flex shrink-0 items-center">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled
              title="즐겨찾기는 아직 지원되지 않습니다."
              aria-label="즐겨찾기"
            >
              <Star className="size-4" />
            </Button>
            {menuActions ? (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="메시지 더보기" />}>
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">{menuActions}</DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </header>

      {isExpanded ? (
        <div className="mt-4 pl-0 sm:pl-13">
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
