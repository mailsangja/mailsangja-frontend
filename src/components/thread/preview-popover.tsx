import { Paperclip } from "lucide-react"

import { PopoverContent } from "@/components/ui/popover"
import { formatFullDateTime } from "@/lib/date"
import { getMailAddressLabel } from "@/lib/mail-address"
import { m } from "@/paraglide/messages"
import type { InboxThreadSummary } from "@/types/email"

interface ThreadPreviewPopoverContentProps {
  thread: InboxThreadSummary
  anchor: { getBoundingClientRect: () => DOMRect }
}

export function ThreadPreviewPopoverContent({ thread, anchor }: ThreadPreviewPopoverContentProps) {
  const participantLabel = getMailAddressLabel(thread.participant)
  const hasNameAndEmail = !!thread.participant.name?.trim() && !!thread.participant.email.trim()

  return (
    <PopoverContent anchor={anchor} side="right" align="start" sideOffset={8} className="w-80 gap-3 p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-tight font-medium">{participantLabel}</p>
          {hasNameAndEmail && <p className="truncate text-xs text-muted-foreground">{thread.participant.email}</p>}
        </div>
        <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
          {formatFullDateTime(thread.lastMessageAt)}
        </span>
      </div>

      <div className="h-px bg-border" />

      <div className="flex flex-col gap-1.5">
        <p className="text-sm leading-snug font-semibold">{thread.latestSubject || m.message_no_subject()}</p>
        {thread.snippet && <p className="line-clamp-3 text-sm text-muted-foreground">{thread.snippet}</p>}
      </div>

      {thread.attachments.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Paperclip className="size-3" />
            {m.message_attachment_count({ count: thread.attachments.length })}
          </span>
        </div>
      )}
    </PopoverContent>
  )
}
