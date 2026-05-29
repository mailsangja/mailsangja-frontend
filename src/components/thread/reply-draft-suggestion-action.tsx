import { useState } from "react"
import { Loader2, Reply, Sparkles } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { getErrorMessage } from "@/lib/http-error"
import { cn } from "@/lib/utils"
import { useSelectReplyDraftSuggestion } from "@/mutations/emails"
import { m } from "@/paraglide/messages"
import { emailKeys, useReplyDraftSuggestions } from "@/queries/emails"
import type { InboxMessage, ReplyDraftSuggestion, ReplyDraftSuggestionListResponse } from "@/types/email"

interface SuggestionCardProps {
  suggestion: ReplyDraftSuggestion
  onSelect: (suggestion: ReplyDraftSuggestion) => void
  isSelecting: boolean
  selectedId: string | null
}

function SuggestionCard({ suggestion, onSelect, isSelecting, selectedId }: SuggestionCardProps) {
  const isThisSelecting = isSelecting && selectedId === suggestion.id

  return (
    <button
      onClick={() => onSelect(suggestion)}
      disabled={isSelecting}
      aria-label={m.reply_draft_suggestion_aria({ type: suggestion.type })}
      className={cn(
        "ai-suggestion-card group flex flex-col gap-2 rounded-xl p-4 text-left transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "hover:-translate-y-0.5 hover:shadow-lg",
        "shadow-sm"
      )}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 shrink-0 text-primary" />
          <span className="text-xs font-semibold text-primary">{suggestion.type}</span>
        </div>
        {isThisSelecting && <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />}
      </div>
      <p className="line-clamp-4 text-sm leading-relaxed text-foreground">{suggestion.body}</p>
      <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
        <Reply className="size-3 shrink-0" />
        {m.reply_draft_suggestion_select()}
      </div>
    </button>
  )
}

interface ReplyDraftSuggestionButtonProps {
  messageId: string
  onClick: () => void
}

export function ReplyDraftSuggestionButton({ messageId, onClick }: ReplyDraftSuggestionButtonProps) {
  const { data, isPending, isError } = useReplyDraftSuggestions(messageId)
  const suggestions = data?.suggestions ?? []

  if (isPending || isError || suggestions.length === 0) return null

  return (
    <Button variant="outline" size="sm" className="shrink-0" onClick={onClick}>
      <Sparkles className="size-3.5" />
      {m.reply_draft_ai_reply()}
    </Button>
  )
}

interface ReplyDraftSuggestionCardsProps {
  threadId: string
  message: InboxMessage
  show: boolean
  onClose: () => void
}

export function ReplyDraftSuggestionCards({ threadId, message, show, onClose }: ReplyDraftSuggestionCardsProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { data } = useReplyDraftSuggestions(message.id)
  const selectSuggestion = useSelectReplyDraftSuggestion()
  const suggestions = data?.suggestions ?? []

  if (suggestions.length === 0) return null

  const handleSelect = async (suggestion: ReplyDraftSuggestion) => {
    setSelectedId(suggestion.id)
    try {
      const replyDraftSuggestion = await selectSuggestion.mutateAsync(suggestion.id)

      queryClient.setQueryData<ReplyDraftSuggestionListResponse>(emailKeys.replyDraftSuggestions(message.id), {
        suggestions: [],
      })
      void navigate({
        to: "/compose",
        search: {
          thread: threadId,
          message: message.id,
        },
        state: (prev) => ({
          ...prev,
          replyDraftSuggestion,
        }),
      })
    } catch (error) {
      toast.error(m.reply_draft_suggestion_select_error(), {
        description: getErrorMessage(error, m.common_try_again_later()),
      })
    } finally {
      setSelectedId(null)
    }
  }

  if (isMobile) {
    return (
      <Sheet
        open={show}
        onOpenChange={(open) => {
          if (!open) onClose()
        }}
      >
        <SheetContent side="bottom" className="max-h-[75vh] rounded-t-2xl" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>{m.reply_draft_ai_reply()}</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 px-4 py-6">
            <div className="flex flex-col gap-3">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onSelect={handleSelect}
                  isSelecting={selectSuggestion.isPending}
                  selectedId={selectedId}
                />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      data-show={show}
      inert={!show}
      className={cn(
        "ai-cards-wrapper absolute right-0 bottom-12 left-0 z-10 px-2 py-3",
        "transition-all duration-300 ease-out",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <div className="grid grid-cols-3 gap-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onSelect={handleSelect}
            isSelecting={selectSuggestion.isPending}
            selectedId={selectedId}
          />
        ))}
      </div>
    </div>
  )
}
