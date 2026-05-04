import { useState } from "react"
import { ChevronDown, ChevronUp, Mail } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { getMailAddressLabel } from "@/lib/mail-address"
import { useThread } from "@/queries/emails"
import type { InboxMessage } from "@/types/email"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function ReferenceMessageItem({ message }: { message: InboxMessage }) {
  const [expanded, setExpanded] = useState(false)
  const senderLabel = getMailAddressLabel(message.from)

  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted/40"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium">{senderLabel}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{formatDate(message.sentAt)}</span>
          </div>
          {!expanded && <p className="mt-0.5 truncate text-xs text-muted-foreground">{message.snippet}</p>}
        </div>
        <span className="mt-0.5 shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {message.bodyHtml ? (
            <ReferenceBodyFrame html={message.bodyHtml} />
          ) : (
            <p className="text-sm whitespace-pre-wrap text-foreground/90">{message.bodyText}</p>
          )}
        </div>
      )}
    </div>
  )
}

function ReferenceBodyFrame({ html }: { html: string }) {
  const [height, setHeight] = useState(0)
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{margin:0;padding:0;font-family:ui-sans-serif,system-ui,sans-serif;font-size:13px;color:#111;word-break:break-word;overflow-wrap:anywhere;overflow:hidden}img{max-width:100%;height:auto}</style></head><body>${html}</body></html>`

  return (
    <iframe
      title="참고 메일 본문"
      sandbox="allow-same-origin allow-popups"
      srcDoc={srcDoc}
      className="w-full border-0 bg-white"
      style={{ height: height || 120 }}
      onLoad={(e) => {
        const doc = e.currentTarget.contentDocument
        if (!doc) return
        setHeight(Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight))
      }}
    />
  )
}

function EmptyPlaceholder() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Mail className="size-7 text-muted-foreground/60" />
      </div>
      <div>
        <p className="font-medium text-muted-foreground">레퍼런스 메일</p>
        <p className="mt-1 text-sm text-muted-foreground">메일 작성시 참고할 메일이 여기 표시됩니다</p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

interface ComposeReferenceProps {
  threadId?: string
}

export function ComposeReference({ threadId }: ComposeReferenceProps) {
  const { data: thread, isLoading } = useThread(threadId ?? null)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-11 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-medium">참고 메일</h1>
      </div>

      {!threadId && <EmptyPlaceholder />}

      {threadId && isLoading && <LoadingState />}

      {thread && (
        <div className="flex-1 overflow-auto">
          <div className="border-b px-4 py-3">
            <p className="text-sm leading-snug font-semibold">{thread.latestSubject || "(제목 없음)"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">메시지 {thread.messages.length}개</p>
          </div>
          <div>
            {thread.messages.map((message) => (
              <ReferenceMessageItem key={message.id} message={message} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
