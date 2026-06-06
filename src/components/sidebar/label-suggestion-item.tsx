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

  function handleApprove({ name, colorCode, notificationPolicy }: LabelFormData) {
    const rule = groups.length > 0 ? { groups } : undefined
    approveLabelSuggestion.mutate(
      {
        suggestionId: suggestion.id,
        data: { name, colorCode, notificationPolicy, order: suggestion.order, rule },
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
    <SidebarMenuItem className="ai-suggestion-item">
      <SidebarMenuButton type="button" size="sm" tooltip={suggestion.name} onClick={() => setApproveOpen(true)}>
        <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: suggestion.colorCode }} />
        <span className="truncate">{suggestion.name}</span>
      </SidebarMenuButton>

      <LabelFormDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={m.label_suggestion_add_title()}
        defaultName={suggestion.name}
        defaultColor={suggestion.colorCode}
        groups={groups}
        onSubmit={handleApprove}
        isPending={approveLabelSuggestion.isPending}
        submitLabel={m.label_suggestion_approve()}
        submitIcon={<Check className="size-4" />}
        cancelLabel={m.label_suggestion_reject()}
        cancelVariant="destructive"
        cancelIcon={<X className="size-4" />}
        onCancel={handleReject}
        submitDisabled={!detail}
      />
    </SidebarMenuItem>
  )
}
