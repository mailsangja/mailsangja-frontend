import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ComposeEmailData } from "@/types/email"

export interface ComposeSendPreviewData {
  mail: ComposeEmailData
  text: string
}

interface ComposeSendPreviewDialogProps {
  open: boolean
  preview: ComposeSendPreviewData | null
  isSending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 border-b px-4 py-2 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-medium">{value}</dd>
    </div>
  )
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function EmailPreviewFrame({ html, text }: { html: string; text: string }) {
  const fallbackText = text.trim()
  const body = html.trim() || `<pre>${escapeHtml(fallbackText)}</pre>`
  const srcDoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <base target="_blank">
    <style>
      html, body { margin: 0; padding: 0; background: #fff; color: #111; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; line-height: 1.5; overflow-wrap: anywhere; }
      body { padding: 20px; }
      img { max-width: 100%; height: auto; }
      pre { white-space: pre-wrap; font-family: inherit; margin: 0; }
    </style>
  </head>
  <body>${body}</body>
</html>`

  return (
    <iframe
      title="최종 발송 본문 미리보기"
      sandbox="allow-popups"
      srcDoc={srcDoc}
      className="h-[min(52vh,34rem)] w-full rounded-lg border bg-white"
    />
  )
}

export function ComposeSendPreviewDialog({
  open,
  preview,
  isSending,
  onOpenChange,
  onConfirm,
}: ComposeSendPreviewDialogProps) {
  const mail = preview?.mail

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isSending && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>메일 미리보기</DialogTitle>
          <DialogDescription>아래 내용으로 메일이 발송됩니다.</DialogDescription>
        </DialogHeader>

        {mail && (
          <div className="grid gap-4">
            <dl className="overflow-hidden rounded-lg border text-sm">
              <PreviewField label="보내는 사람" value={mail.from ?? ""} />
              <PreviewField label="받는 사람" value={mail.to.join(", ")} />
              {mail.cc && mail.cc.length > 0 && <PreviewField label="참조" value={mail.cc.join(", ")} />}
              {mail.bcc && mail.bcc.length > 0 && <PreviewField label="숨은참조" value={mail.bcc.join(", ")} />}
              <PreviewField label="제목" value={mail.subject} />
            </dl>

            <EmailPreviewFrame html={mail.content} text={preview.text} />
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            수정하기
          </Button>
          <Button type="button" onClick={onConfirm} disabled={!mail || isSending}>
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            발송
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
