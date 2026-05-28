import { AlertCircle, AlertTriangle, CheckCircle2, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { m } from "@/paraglide/messages"
import { getMailReviewIssueFieldLabel, getMailReviewIssueTypeLabel } from "@/types/email"
import type { MailReviewIssue, MailReviewIssueSeverity, MailReviewResult } from "@/types/email"

interface ComposeReviewPanelProps {
  isReviewing: boolean
  reviewResult: MailReviewResult | null
  reviewError: boolean
  onClose: () => void
}

function getSeverityClass(severity: MailReviewIssueSeverity) {
  if (severity === "HIGH") return "text-destructive"
  if (severity === "MEDIUM") return "text-amber-600 dark:text-amber-400"
  return "text-muted-foreground"
}

function ReviewIssueItem({ issue }: { issue: MailReviewIssue }) {
  const severityClass = getSeverityClass(issue.severity)

  return (
    <li className="flex gap-3 border-b px-4 py-3 last:border-b-0">
      <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", severityClass)} />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className={cn("font-medium", severityClass)}>{getMailReviewIssueTypeLabel(issue.type)}</span>
          <span className="text-muted-foreground">{getMailReviewIssueFieldLabel(issue.field)}</span>
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

export function ComposeReviewPanel({ isReviewing, reviewResult, reviewError, onClose }: ComposeReviewPanelProps) {
  return (
    <div className="flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-11 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          {m.compose_review_result_title()}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} className="-mr-2" aria-label={m.compose_ai_close()}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto text-sm">
        {isReviewing && (
          <ul>
            {[70, 90, 55].map((w) => (
              <li key={w} className="flex gap-3 border-b px-4 py-3 last:border-b-0">
                <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex gap-1.5">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-4" style={{ width: `${w}%` }} />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isReviewing && reviewError && (
          <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground">
            <AlertCircle className="size-4" />
            {m.compose_review_error()}
          </div>
        )}

        {!isReviewing && reviewResult && !reviewResult.hasIssues && (
          <div className="flex items-center gap-2 px-4 py-3 text-green-600 dark:text-green-400">
            <CheckCircle2 className="size-4" />
            {m.compose_review_no_issues()}
          </div>
        )}

        {!isReviewing && reviewResult?.hasIssues && reviewResult.issues.length > 0 && (
          <ul>
            {reviewResult.issues.map((issue, index) => (
              <ReviewIssueItem key={issue.segmentId || index} issue={issue} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
