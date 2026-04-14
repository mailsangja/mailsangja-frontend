import { cloneElement, useState } from "react"
import { Paperclip } from "lucide-react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import { normalizeSnippetText } from "@/lib/html-entities"
import { getMailAddressLabel } from "@/lib/mail-address"
import type { InboxThreadSummary } from "@/types/email"

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit", hour12: true })
  }
  if (diffDays === 1) return "어제"
  if (diffDays < 7) return `${diffDays}일 전`
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
}

interface EmailPreviewPopoverProps {
  thread: InboxThreadSummary
  children: React.ReactElement<{
    onPointerEnter?: React.PointerEventHandler<Element>
    onPointerMove?: React.PointerEventHandler<Element>
  }>
}

function createCursorAnchor(
  clientX: number,
  clientY: number,
  contextElement: Element
): NonNullable<PopoverPrimitive.Positioner.Props["anchor"]> {
  return {
    contextElement,
    getBoundingClientRect: () => new DOMRect(clientX, clientY, 0, 0),
  }
}

export function EmailPreviewPopover({ thread, children }: EmailPreviewPopoverProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<PopoverPrimitive.Positioner.Props["anchor"]>(null)
  const snippet = normalizeSnippetText(thread.snippet)

  if (isMobile) return children

  const trigger = cloneElement(children, {
    onPointerEnter: (event: React.PointerEvent<Element>) => {
      setAnchor(createCursorAnchor(event.clientX, event.clientY, event.currentTarget))
      children.props.onPointerEnter?.(event)
    },
    onPointerMove: (event: React.PointerEvent<Element>) => {
      if (!open) {
        setAnchor(createCursorAnchor(event.clientX, event.clientY, event.currentTarget))
      }
      children.props.onPointerMove?.(event)
    },
  })

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (details.reason === "trigger-press") return
        setOpen(nextOpen)
      }}
    >
      <PopoverTrigger openOnHover delay={300} closeDelay={150} render={trigger} nativeButton={false} />
      <PopoverContent anchor={anchor} side="bottom" align="start" sideOffset={20} className="w-80 p-4">
        <div className="space-y-2.5">
          <p className="text-sm leading-snug font-semibold">{thread.latestSubject || "(제목 없음)"}</p>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{snippet}</p>
          <Separator />
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="font-normal">
              {getMailAddressLabel(thread.participant)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {thread.attachments.length > 0 ? (
              <span className="flex items-center gap-1">
                <Paperclip className="size-3" />
                첨부 {thread.attachments.length}개
              </span>
            ) : null}
            <span>{formatRelativeDate(thread.lastMessageAt)}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
