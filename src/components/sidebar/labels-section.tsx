import { useState } from "react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { LabelFormDialog, type LabelFormData } from "@/components/label/label-form-dialog"
import { LabelItem } from "@/components/sidebar/label-item"
import { LabelSuggestionItem } from "@/components/sidebar/label-suggestion-item"
import { Button, buttonVariants } from "@/components/ui/button"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar"
import { useLabelOrder } from "@/hooks/use-label-order"
import { trackEvent } from "@/lib/analytics"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { cn } from "@/lib/utils"
import { useCreateLabel, useCreateLabelSuggestions } from "@/mutations/labels"
import { useLabels, useLabelSuggestions } from "@/queries/labels"

interface SidebarLabelsSectionProps {
  activeLabelId?: string
  onLabelToggle: (labelId: string) => void
  className?: string
}

export function SidebarLabelsSection({ activeLabelId, onLabelToggle, className }: SidebarLabelsSectionProps) {
  const { data: serverLabels = [] } = useLabels()
  const { data: suggestions = [] } = useLabelSuggestions()
  const createLabel = useCreateLabel()
  const createSuggestions = useCreateLabelSuggestions()
  const { orderedLabels, sensors, handleDragEnd } = useLabelOrder(serverLabels)
  const [open, setOpen] = useState(false)

  function handleCreate({ name, colorCode, notificationPolicy }: LabelFormData) {
    const maxOrder = serverLabels.length > 0 ? Math.max(...serverLabels.map((l) => l.order)) : 0
    createLabel.mutate(
      { name, colorCode, notificationPolicy, order: maxOrder + 1 },
      {
        onSuccess: () => {
          trackEvent("label_create", { notification_policy: notificationPolicy })
          setOpen(false)
        },
        onError: (e) => {
          if (getHttpStatus(e) === 409) {
            toast.error("이미 존재하는 라벨입니다.")
          } else {
            toast.error(getErrorMessage(e, "라벨 생성에 실패했습니다."))
          }
        },
      }
    )
  }

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className="flex items-center justify-between pr-1">
        <span>라벨</span>
        <div className="flex items-center">
          <button
            type="button"
            title="AI 라벨 추천 받기"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "text-primary hover:bg-primary/10 hover:text-primary",
              createSuggestions.isPending && "animate-pulse"
            )}
            onClick={() => {
              const toastId = toast.loading("AI 추천 라벨을 생성 중입니다...")
              createSuggestions.mutate(undefined, {
                onSuccess: () => {
                  trackEvent("ai_label_suggestions_generate")
                  toast.success("AI 추천 라벨 생성이 완료되었습니다!", { id: toastId })
                },
                onError: (e) => toast.error(getErrorMessage(e, "AI 추천 라벨 생성에 실패했습니다."), { id: toastId }),
              })
            }}
            disabled={createSuggestions.isPending}
          >
            <Sparkles className="ai-sparkle-icon size-3.5" />
            <span className="sr-only">AI 라벨 추천 받기</span>
          </button>
          <Button variant="ghost" size="icon-xs" title="라벨 추가" onClick={() => setOpen(true)}>
            <Plus />
            <span className="sr-only">라벨 추가</span>
          </Button>
        </div>
      </SidebarGroupLabel>

      {orderedLabels.length > 0 && (
        <SidebarMenu>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedLabels.map((label) => label.id)} strategy={verticalListSortingStrategy}>
              {orderedLabels.map((label) => (
                <LabelItem
                  key={label.id}
                  label={label}
                  isActive={activeLabelId === label.id}
                  onLabelToggle={onLabelToggle}
                />
              ))}
            </SortableContext>
          </DndContext>
        </SidebarMenu>
      )}

      {suggestions.length > 0 && (
        <SidebarMenu className="mt-1">
          {suggestions.map((suggestion) => (
            <LabelSuggestionItem key={suggestion.id} suggestion={suggestion} />
          ))}
        </SidebarMenu>
      )}

      <LabelFormDialog
        open={open}
        onOpenChange={setOpen}
        title="새 라벨 만들기"
        submitLabel="만들기"
        isPending={createLabel.isPending}
        onSubmit={handleCreate}
      />
    </SidebarGroup>
  )
}
