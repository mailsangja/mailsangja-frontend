import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PopoverHeader, PopoverTitle } from "@/components/ui/popover"
import { copyTextToClipboard } from "@/lib/clipboard"
import { formatFullDateTime } from "@/lib/date"
import { getMailAddressFullLabel } from "@/lib/mail-address"
import { m } from "@/paraglide/messages"
import type { InboxMessage, MailAddress } from "@/types/email"

function isSameAddress(left?: MailAddress | null, right?: MailAddress | null) {
  return left?.email?.trim().toLowerCase() === right?.email?.trim().toLowerCase()
}

function AddressList({ addresses }: { addresses: MailAddress[] }) {
  if (addresses.length === 0) {
    return <span className="text-muted-foreground">-</span>
  }

  return (
    <ul className="flex min-w-0 flex-col gap-0.5">
      {addresses.map((address, index) => (
        <li key={`${address.email}-${index}`} className="flex min-h-6 min-w-0 items-center gap-1">
          <span className="min-w-0 flex-1 wrap-break-word">{getMailAddressFullLabel(address)}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0"
            aria-label={m.message_copy_email_aria({ email: address.email })}
            title={m.message_copy_address()}
            onClick={(event) => {
              event.stopPropagation()
              copyTextToClipboard(address.email, m.message_address_copied())
            }}
          >
            <Copy />
          </Button>
        </li>
      ))}
    </ul>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="flex min-h-6 items-center text-xs font-medium whitespace-nowrap text-muted-foreground">{label}</dt>
      <dd className="flex min-h-6 min-w-0 items-center text-xs wrap-break-word">{children}</dd>
    </>
  )
}

interface MessageMetadataContentProps {
  message: InboxMessage
}

export function MessageMetadataContent({ message }: MessageMetadataContentProps) {
  const showReplyTo = message.replyTo && !isSameAddress(message.replyTo, message.from)

  return (
    <>
      <PopoverHeader>
        <PopoverTitle>{m.message_details()}</PopoverTitle>
      </PopoverHeader>
      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4">
        <DetailRow label={m.message_detail_from()}>
          <AddressList addresses={[message.from]} />
        </DetailRow>
        <DetailRow label={m.message_detail_to()}>
          <AddressList addresses={message.to} />
        </DetailRow>
        {message.cc.length > 0 ? (
          <DetailRow label={m.message_detail_cc()}>
            <AddressList addresses={message.cc} />
          </DetailRow>
        ) : null}
        {showReplyTo && message.replyTo ? (
          <DetailRow label="Reply-To">
            <AddressList addresses={[message.replyTo]} />
          </DetailRow>
        ) : null}
        <DetailRow label={m.message_detail_sent_at()}>{formatFullDateTime(message.sentAt)}</DetailRow>
      </dl>
    </>
  )
}
