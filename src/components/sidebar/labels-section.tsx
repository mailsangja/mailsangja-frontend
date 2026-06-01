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
import { m } from "@/paraglide/messages"
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

  function handleCreate({ name, colorCode, notificationPolicy, isSensitive }: LabelFormData) {
    const maxOrder = serverLabels.length > 0 ? Math.max(...serverLabels.map((l) => l.order)) : 0
    createLabel.mutate(
      { name, colorCode, notificationPolicy, isSensitive, order: maxOrder + 1 },
      {
        onSuccess: () => {
          trackEvent("label_create", { notification_policy: notificationPolicy })
          setOpen(false)
        },
        onError: (e) => {
          if (getHttpStatus(e) === 409) {
            toast.error(m.sidebar_label_duplicate_error())
          } else {
            toast.error(getErrorMessage(e, m.sidebar_label_create_error()))
          }
        },
      }
    )
  }

  return (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className="flex items-center justify-between pr-1">
        <span>{m.sidebar_labels()}</span>
        <div className="flex items-center">
          <button
            type="button"
            title={m.sidebar_label_ai_suggest()}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-xs" }),
              "text-primary hover:bg-primary/10 hover:text-primary",
              createSuggestions.isPending && "animate-pulse"
            )}
            onClick={() => {
              const toastId = toast.loading(m.sidebar_label_ai_loading())
              createSuggestions.mutate(undefined, {
                onSuccess: () => {
                  trackEvent("ai_label_suggestions_generate")
                  toast.success(m.sidebar_label_ai_success(), { id: toastId })
                },
                onError: (e) => toast.error(getErrorMessage(e, m.sidebar_label_ai_error()), { id: toastId }),
              })
            }}
            disabled={createSuggestions.isPending}
          >
            <Sparkles className="ai-sparkle-icon size-3.5" />
            <span className="sr-only">{m.sidebar_label_ai_suggest()}</span>
          </button>
          <Button variant="ghost" size="icon-xs" title={m.sidebar_label_add()} onClick={() => setOpen(true)}>
            <Plus />
            <span className="sr-only">{m.sidebar_label_add()}</span>
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
        title={m.sidebar_label_create_title()}
        submitLabel={m.sidebar_label_create_submit()}
        isPending={createLabel.isPending}
        onSubmit={handleCreate}
      />
    </SidebarGroup>
  )
}
