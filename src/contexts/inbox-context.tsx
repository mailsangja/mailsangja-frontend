import { createContext, useContext } from "react"

import type { PrimaryMailboxId } from "@/types/email"

interface InboxContextValue {
  activeMailbox: PrimaryMailboxId
  setActiveMailbox: (mailbox: PrimaryMailboxId) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const InboxContext = createContext<InboxContextValue | null>(null)

export function useInboxContext() {
  const context = useContext(InboxContext)
  if (!context) {
    throw new Error("useInboxContext must be used within AuthenticatedRouteLayout")
  }
  return context
}
