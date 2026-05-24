import { useState } from "react"
import { Reply, Sparkles, Mail } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { useReplyDraftSuggestions } from "@/queries/emails"
import type { InboxMessage, ReplyDraftSuggestion } from "@/types/email"

interface ReplyDraftSuggestionActionProps {
  threadId: string
  message: InboxMessage
}

interface SuggestionPreviewProps {
  suggestion: ReplyDraftSuggestion
  onSelect: (suggestion: ReplyDraftSuggestion) => void
}

function SuggestionPreview({ suggestion, onSelect }: SuggestionPreviewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border bg-background p-4">
        <p className="max-h-72 overflow-hidden text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {suggestion.body}
        </p>
      </div>
      <Button onClick={() => onSelect(suggestion)}>
        <Reply />이 내용으로 답장 작성
      </Button>
    </div>
  )
}

function getSuggestionAriaLabel(suggestion: ReplyDraftSuggestion) {
  return `${suggestion.type} 추천 답장`
}

export function ReplyDraftSuggestionAction({ threadId, message }: ReplyDraftSuggestionActionProps) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [mobileSuggestion, setMobileSuggestion] = useState<ReplyDraftSuggestion | null>(null)
  const { data, isPending, isError } = useReplyDraftSuggestions(message.id)
  const suggestions = data?.suggestions ?? []

  if (isPending || isError || suggestions.length === 0) {
    return null
  }

  const handleSelect = (suggestion: ReplyDraftSuggestion) => {
    setMobileSuggestion(null)
    void navigate({
      to: "/compose",
      search: {
        thread: threadId,
        message: message.id,
        suggestion: suggestion.id,
      },
    })
  }

  if (isMobile) {
    return (
      <Sheet open={mobileSuggestion != null} onOpenChange={(open) => !open && setMobileSuggestion(null)}>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <div className="mr-1 flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />
            AI 답장
          </div>
          {suggestions.map((suggestion) => (
            <SheetTrigger
              key={suggestion.id}
              render={
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={getSuggestionAriaLabel(suggestion)}
                  onClick={() => setMobileSuggestion(suggestion)}
                >
                  <Mail />
                  {suggestion.type}
                </Button>
              }
            />
          ))}
        </div>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-lg">
          <SheetHeader>
            <SheetTitle className="flex flex-row items-center gap-2">
              <Sparkles className="size-4" />
              <span>{mobileSuggestion ? `${mobileSuggestion.type} 답장 미리보기` : "추천 답장"}</span>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
            {mobileSuggestion ? <SuggestionPreview suggestion={mobileSuggestion} onSelect={handleSelect} /> : null}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
      <div className="mr-1 flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5" />
        AI 답장
      </div>
      {suggestions.map((suggestion) => (
        <Popover key={suggestion.id}>
          <PopoverTrigger
            openOnHover
            delay={80}
            closeDelay={120}
            render={
              <Button variant="outline" size="sm" aria-label={getSuggestionAriaLabel(suggestion)}>
                <Mail />
                {suggestion.type}
              </Button>
            }
          />
          <PopoverContent side="top" sideOffset={8} className="w-88 max-w-[calc(100vw-2rem)] p-3">
            <PopoverTitle className="flex flex-row items-center gap-2">
              <Sparkles className="size-4" />
              {suggestion.type} 답장 미리보기
            </PopoverTitle>
            <SuggestionPreview suggestion={suggestion} onSelect={handleSelect} />
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}
