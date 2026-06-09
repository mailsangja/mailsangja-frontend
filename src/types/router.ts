import type { QueryClient } from "@tanstack/react-query"

import type { ReplyDraftSuggestion } from "@/types/email"

export interface RouterContext {
  queryClient: QueryClient
}

declare module "@tanstack/react-router" {
  interface HistoryState {
    replyDraftSuggestion?: ReplyDraftSuggestion | null
  }
}
