import { LabelChipList } from "@/components/label/label-chip"
import { MailAccountIcon } from "@/components/mail-account-icon"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ThreadLabel } from "@/types/label"
import type { MailAccount } from "@/types/mail-account"

interface ThreadHeaderData {
  latestSubject: string
  messages: readonly { direction: "INBOUND" | "OUTBOUND" }[]
}

interface ThreadHeaderProps {
  thread: ThreadHeaderData
  account?: MailAccount
  labels?: ThreadLabel[]
  className?: string
}

export function ThreadHeader({ thread, account, labels, className }: ThreadHeaderProps) {
  const messageCount = thread.messages.length
  const hasInbound = thread.messages.some((m) => m.direction === "INBOUND")
  const hasOutbound = thread.messages.some((m) => m.direction === "OUTBOUND")
  return (
    <div className={cn("shrink-0 border-b px-6 pb-5", className)}>
      <h2 className="text-xl leading-snug font-semibold wrap-break-word">{thread.latestSubject || "(제목 없음)"}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {account?.icon ? (
          <MailAccountIcon
            icon={account.icon}
            color={account.color}
            aria-label={`${account.emailAddress} 계정`}
            title={account.emailAddress}
          />
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
        <Badge variant="outline" className="font-normal">
          메시지 {messageCount}개
        </Badge>
        {labels ? <LabelChipList labels={labels} /> : null}
      </div>
    </div>
  )
}
