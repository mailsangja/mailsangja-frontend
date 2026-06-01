import { MessageCard } from "@/components/message/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { InboxMessage } from "@/types/email"

interface ThreadMessageListProps {
  messages: InboxMessage[]
  expandedIds: Set<string>
  onToggle: (id: string) => void
  accountEmail?: string
  renderMenuActions?: (message: InboxMessage) => React.ReactNode
  onToggleMessageStar?: (message: InboxMessage) => void
  togglingStarMessageId?: string | null
}

export function ThreadMessageList({
  messages,
  expandedIds,
  onToggle,
  accountEmail,
  renderMenuActions,
  onToggleMessageStar,
  togglingStarMessageId = null,
}: ThreadMessageListProps) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="p-2">
        <div className="divide-y overflow-hidden rounded-lg border bg-card">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              isExpanded={expandedIds.has(message.id)}
              onToggle={() => onToggle(message.id)}
              accountEmail={accountEmail}
              menuActions={renderMenuActions?.(message)}
              onToggleStar={onToggleMessageStar ? () => onToggleMessageStar(message) : undefined}
              isTogglingStar={togglingStarMessageId === message.id}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
