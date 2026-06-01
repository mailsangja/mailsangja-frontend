import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Check, X } from "lucide-react"
import { toast } from "sonner"

import { LabelFormDialog, type LabelFormData } from "@/components/label/label-form-dialog"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { trackEvent } from "@/lib/analytics"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { useApproveLabelSuggestion, useDeleteLabelSuggestion } from "@/mutations/labels"
import { useLabelSuggestionDetail } from "@/queries/labels"
import { m } from "@/paraglide/messages"
import type { LabelSuggestion } from "@/types/label"

interface LabelSuggestionItemProps {
  suggestion: LabelSuggestion
}

export function LabelSuggestionItem({ suggestion }: LabelSuggestionItemProps) {
  const [approveOpen, setApproveOpen] = useState(false)
  const deleteSuggestion = useDeleteLabelSuggestion()
  const navigate = useNavigate()
  const approveLabelSuggestion = useApproveLabelSuggestion()
  const { data: detail } = useLabelSuggestionDetail(suggestion.id, approveOpen)
  const groups = detail?.rule?.groups ?? []

  function handleReject() {
    deleteSuggestion.mutate(suggestion.id, {
      onSuccess: () => {
        trackEvent("ai_label_suggestion_reject")
      },
      onError: (e) => toast.error(getErrorMessage(e, m.label_suggestion_reject_error())),
    })
  }

  function handleApprove({ name, colorCode, notificationPolicy, isSensitive }: LabelFormData) {
    const rule = groups.length > 0 ? { groups } : undefined
    approveLabelSuggestion.mutate(
      {
        suggestionId: suggestion.id,
        data: { name, colorCode, notificationPolicy, isSensitive, order: suggestion.order, rule },
      },
      {
        onSuccess: (label) => {
          trackEvent("ai_label_suggestion_approve", {
            has_rule: groups.length > 0,
            notification_policy: notificationPolicy,
          })
          setApproveOpen(false)
          toast.success(m.label_suggestion_approve_success({ name }))
          void navigate({ to: "/settings/label/$labelId", params: { labelId: label.id } })
        },
        onError: (e) => {
          if (getHttpStatus(e) === 409) {
            toast.error(m.sidebar_label_duplicate_error())
          } else {
            toast.error(getErrorMessage(e, m.label_add_error()))
          }
        },
      }
    )
  }

  return (
    <SidebarMenuItem className="ai-suggestion-item group/suggestion">
      <SidebarMenuButton type="button" size="sm" tooltip={suggestion.name} onClick={() => setApproveOpen(true)}>
        <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: suggestion.colorCode }} />
        <span className="truncate">{suggestion.name}</span>
      </SidebarMenuButton>

      <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-0.5 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/suggestion:opacity-100 [@media(hover:hover)]:group-hover/suggestion:opacity-100">
        <button
          type="button"
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-green-600"
          aria-label={m.label_suggestion_approve()}
          onClick={(e) => {
            e.stopPropagation()
            setApproveOpen(true)
          }}
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-destructive"
          aria-label={m.label_suggestion_reject()}
          onClick={(e) => {
            e.stopPropagation()
            handleReject()
          }}
          disabled={deleteSuggestion.isPending}
        >
          <X className="size-3.5" />
        </button>
      </div>

      <LabelFormDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={m.label_suggestion_add_title()}
        defaultName={suggestion.name}
        defaultColor={suggestion.colorCode}
        groups={groups}
        onSubmit={handleApprove}
        isPending={approveLabelSuggestion.isPending}
        submitLabel={m.label_add_submit()}
        submitDisabled={!detail}
      />
    </SidebarMenuItem>
  )
}
