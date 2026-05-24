import { useState } from "react"

import type { InboxMessage } from "@/types/email"

function getDefaultExpandedIds({
  messages,
  messageId,
}: {
  messages: readonly InboxMessage[]
  messageId?: string | null
}) {
  const next = new Set<string>()
  const hasMessageId = messageId != null
  const last = messages.at(-1)

  if (!hasMessageId && last) {
    next.add(last.id)
  }

  for (const message of messages) {
    if (!message.isRead || message.id === messageId) {
      next.add(message.id)
    }
  }

  return next
}

export function useThreadMessageExpansion({
  threadId,
  messages,
  messageId = null,
}: {
  threadId: string | null
  messages: readonly InboxMessage[]
  messageId?: string | null
}) {
  const messageKey = messages.map((message) => `${message.id}:${message.isRead ? "1" : "0"}`).join("\u0000")
  const resetKey = `${threadId ?? ""}\u0000${messageId ?? ""}\u0000${messageKey}`
  const [expandedState, setExpandedState] = useState(() => ({
    resetKey,
    ids: getDefaultExpandedIds({ messages, messageId }),
  }))

  let expandedIds = expandedState.ids

  if (expandedState.resetKey !== resetKey) {
    expandedIds = getDefaultExpandedIds({ messages, messageId })
    setExpandedState({ resetKey, ids: expandedIds })
  }

  const toggleExpanded = (id: string) => {
    setExpandedState((prev) => {
      const next = new Set(prev.ids)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...prev, ids: next }
    })
  }

  return {
    expandedIds,
    toggleExpanded,
  }
}
