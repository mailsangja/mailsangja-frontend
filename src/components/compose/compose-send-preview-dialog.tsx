import { Loader2, Send } from "lucide-react"

import { LocalAttachmentChip } from "@/components/attachment/local-chip"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { m } from "@/paraglide/messages"
import type { ComposeEmailData } from "@/types/email"

export interface ComposeSendPreviewData {
  mail: ComposeEmailData
  text: string
  html: string
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
  const isFullHtmlDocument = /^\s*(<!doctype|<html[\s>])/i.test(body)
  const srcDoc = isFullHtmlDocument
    ? body
    : `<!doctype html>
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
      title={m.compose_send_preview_frame_title()}
      sandbox="allow-popups allow-same-origin"
      srcDoc={srcDoc}
      className="h-[min(40vh,30rem)] w-full rounded-lg border bg-white"
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
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{m.compose_send_preview_title()}</DialogTitle>
        </DialogHeader>

        {mail && (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            <dl className="overflow-hidden rounded-lg border text-sm">
              <PreviewField label={m.compose_field_from()} value={mail.from ?? ""} />
              <PreviewField label={m.compose_field_to()} value={mail.to.join(", ")} />
              {mail.cc && mail.cc.length > 0 && (
                <PreviewField label={m.compose_field_cc()} value={mail.cc.join(", ")} />
              )}
              {mail.bcc && mail.bcc.length > 0 && (
                <PreviewField label={m.compose_field_bcc()} value={mail.bcc.join(", ")} />
              )}
              <PreviewField label={m.compose_field_subject()} value={mail.subject} />
            </dl>

            <EmailPreviewFrame html={preview.html} text={preview.text} />

            {mail.attachments && mail.attachments.length > 0 && (
              <div className="rounded-lg border px-4 py-3 text-sm">
                <div className="mb-2 font-medium">{m.compose_attachments_title()}</div>
                <div className="flex flex-wrap gap-2 pr-1 md:max-h-20 md:overflow-y-auto">
                  {mail.attachments.map((file, index) => (
                    <LocalAttachmentChip key={`${file.name}-${file.lastModified}-${index}`} file={file} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
            {m.compose_edit()}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={!mail || isSending}>
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {m.compose_confirm_send()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
