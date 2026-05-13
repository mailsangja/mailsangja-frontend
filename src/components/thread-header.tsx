import { Badge } from "@/components/ui/badge"
import { AccountIcon } from "@/lib/icon-entries"
import type { LabelSummary } from "@/types/email"
import type { MailAccount } from "@/types/mail-account"

interface ThreadHeaderData {
  latestSubject: string
  messages: readonly { direction: "INBOUND" | "OUTBOUND" }[]
}

interface ThreadHeaderProps {
  thread: ThreadHeaderData
  account?: MailAccount
  labels?: LabelSummary[]
}

export function ThreadHeader({ thread, account, labels }: ThreadHeaderProps) {
  const messageCount = thread.messages.length
  const hasInbound = thread.messages.some((m) => m.direction === "INBOUND")
  const hasOutbound = thread.messages.some((m) => m.direction === "OUTBOUND")
  return (
    <div className="shrink-0 border-b px-6 pt-2 pb-5">
      <h2 className="text-xl leading-snug font-semibold wrap-break-word">{thread.latestSubject || "(제목 없음)"}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {account?.icon ? (
          <span
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: account.color }}
            aria-label={`${account.emailAddress} 계정`}
            title={account.emailAddress}
          >
            <AccountIcon name={account.icon} className="size-3 text-white" />
          </span>
        ) : null}
        {hasInbound && (
          <Badge variant="outline" className="font-normal">
            수신
          </Badge>
        )}
        {hasOutbound && (
          <Badge variant="outline" className="font-normal">
            발신
          </Badge>
        )}
        <Badge variant="secondary" className="font-normal">
          메시지 {messageCount}개
        </Badge>
        {labels?.map((label) => (
          <span
            key={label.labelId}
            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: label.colorCode }}
          >
            {label.name}
          </span>
        ))}
      </div>
    </div>
  )
}
