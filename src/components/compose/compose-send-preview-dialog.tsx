import { AlertCircle, AlertTriangle, CheckCircle2, Loader2, Send, Sparkles } from "lucide-react"

import { LocalAttachmentChip } from "@/components/attachment/local-chip"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { MAIL_REVIEW_ISSUE_FIELD_LABELS, MAIL_REVIEW_ISSUE_TYPE_LABELS } from "@/types/email"
import type { ComposeEmailData, MailReviewIssue, MailReviewIssueSeverity, MailReviewResult } from "@/types/email"

export interface ComposeSendPreviewData {
  mail: ComposeEmailData
  text: string
  html: string
}

interface ComposeSendPreviewDialogProps {
  open: boolean
  preview: ComposeSendPreviewData | null
  isSending: boolean
  isReviewing: boolean
  reviewResult: MailReviewResult | null
  reviewError: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function getSeverityClass(severity: MailReviewIssueSeverity) {
  if (severity === "HIGH") return "text-destructive"
  if (severity === "MEDIUM") return "text-amber-600 dark:text-amber-400"
  return "text-muted-foreground"
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
      title="최종 발송 본문 미리보기"
      sandbox="allow-popups allow-same-origin"
      srcDoc={srcDoc}
      className="h-[min(40vh,30rem)] w-full rounded-lg border bg-white"
    />
  )
}

function ReviewIssueItem({ issue }: { issue: MailReviewIssue }) {
  const severityClass = getSeverityClass(issue.severity)

  return (
    <li className="flex gap-3 border-b px-4 py-3 last:border-b-0">
      <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", severityClass)} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className={cn("font-medium", severityClass)}>{MAIL_REVIEW_ISSUE_TYPE_LABELS[issue.type]}</span>
          <span className="text-muted-foreground">{MAIL_REVIEW_ISSUE_FIELD_LABELS[issue.field]}</span>
        </div>
        <p className="text-sm">{issue.reason}</p>
        {issue.originalText && issue.replacementText && (
          <p className="text-xs text-muted-foreground">
            <span className="line-through">{issue.originalText}</span>
            {" → "}
            <span className="font-medium text-foreground">{issue.replacementText}</span>
          </p>
        )}
      </div>
    </li>
  )
}

function ReviewSection({
  isReviewing,
  reviewResult,
  reviewError,
}: {
  isReviewing: boolean
  reviewResult: MailReviewResult | null
  reviewError: boolean
}) {
  return (
    <div className="rounded-lg border text-sm md:self-start">
      <div className="flex items-center gap-2 border-b px-4 py-2.5 font-medium text-primary">
        <Sparkles className="size-4" />
        AI 검토 결과
      </div>

      {isReviewing && (
        <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          AI가 메일을 검토하는 중입니다...
        </div>
      )}

      {!isReviewing && reviewError && (
        <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground">
          <AlertCircle className="size-4" />
          AI 검토에 실패했습니다. 메일을 수정하거나 바로 발송할 수 있습니다.
        </div>
      )}

      {!isReviewing && reviewResult && !reviewResult.hasIssues && (
        <div className="flex items-center gap-2 px-4 py-3 text-green-600 dark:text-green-400">
          <CheckCircle2 className="size-4" />
          수정 권장 사항이 없습니다.
        </div>
      )}

      {!isReviewing && reviewResult?.hasIssues && reviewResult.issues.length > 0 && (
        <ul className="md:max-h-90 md:overflow-y-auto">
          {reviewResult.issues.map((issue, index) => (
            <ReviewIssueItem key={issue.segmentId || index} issue={issue} />
          ))}
        </ul>
      )}
    </div>
  )
}

export function ComposeSendPreviewDialog({
  open,
  preview,
  isSending,
  isReviewing,
  reviewResult,
  reviewError,
  onOpenChange,
  onConfirm,
}: ComposeSendPreviewDialogProps) {
  const mail = preview?.mail

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isSending && onOpenChange(nextOpen)}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>메일 미리보기</DialogTitle>
        </DialogHeader>

        {mail && (
          <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto md:grid-cols-[1fr_22rem]">
            <div className="grid gap-4">
              <dl className="overflow-hidden rounded-lg border text-sm">
                <PreviewField label="보내는 사람" value={mail.from ?? ""} />
                <PreviewField label="받는 사람" value={mail.to.join(", ")} />
                {mail.cc && mail.cc.length > 0 && <PreviewField label="참조" value={mail.cc.join(", ")} />}
                {mail.bcc && mail.bcc.length > 0 && <PreviewField label="숨은참조" value={mail.bcc.join(", ")} />}
                <PreviewField label="제목" value={mail.subject} />
              </dl>

              <EmailPreviewFrame html={preview.html} text={preview.text} />

              {mail.attachments && mail.attachments.length > 0 && (
                <div className="rounded-lg border px-4 py-3 text-sm">
                  <div className="mb-2 font-medium">첨부파일</div>
                  <div className="flex flex-wrap gap-2 pr-1 md:max-h-20 md:overflow-y-auto">
                    {mail.attachments.map((file, index) => (
                      <LocalAttachmentChip key={`${file.name}-${file.lastModified}-${index}`} file={file} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ReviewSection isReviewing={isReviewing} reviewResult={reviewResult} reviewError={reviewError} />
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
