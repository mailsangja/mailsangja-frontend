import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Check, X } from "lucide-react"
import { toast } from "sonner"

import { LabelFormDialog, type LabelFormData } from "@/components/label/label-form-dialog"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { useApproveLabelSuggestion, useDeleteLabelSuggestion } from "@/mutations/labels"
import { useLabelSuggestionDetail } from "@/queries/labels"
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
      onError: (e) => toast.error(getErrorMessage(e, "라벨 제안 거부에 실패했습니다.")),
    })
  }

  function handleApprove({ name, colorCode, notificationPolicy }: LabelFormData) {
    const rule = groups.length > 0 ? { groups } : undefined
    approveLabelSuggestion.mutate(
      { suggestionId: suggestion.id, data: { name, colorCode, notificationPolicy, order: suggestion.order, rule } },
      {
        onSuccess: (label) => {
          setApproveOpen(false)
          toast.success(`${name} 라벨이 추가되었습니다`)
          void navigate({ to: "/settings/label/$labelId", params: { labelId: label.id } })
        },
        onError: (e) => {
          if (getHttpStatus(e) === 409) {
            toast.error("이미 존재하는 라벨입니다.")
          } else {
            toast.error(getErrorMessage(e, "라벨 추가에 실패했습니다."))
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
          aria-label="승인"
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
          aria-label="거부"
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
        title="AI 추천 라벨 추가"
        defaultName={suggestion.name}
        defaultColor={suggestion.colorCode}
        groups={groups}
        onSubmit={handleApprove}
        isPending={approveLabelSuggestion.isPending}
        submitLabel="추가하기"
        submitDisabled={!detail}
      />
    </SidebarMenuItem>
  )
}
