import { MessageCard } from "@/components/message-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { InboxMessage } from "@/types/email"

interface ThreadMessageListProps {
  messages: InboxMessage[]
  expandedIds: Set<string>
  onToggle: (id: string) => void
  renderMenuActions?: (message: InboxMessage) => React.ReactNode
}

export function ThreadMessageList({ messages, expandedIds, onToggle, renderMenuActions }: ThreadMessageListProps) {
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
              menuActions={renderMenuActions?.(message)}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
