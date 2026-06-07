import { useState } from "react"
import { createPortal } from "react-dom"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { LabelFormDialog, type LabelFormData } from "@/components/label/label-form-dialog"
import { LabelItem } from "@/components/sidebar/label-item"
import { LabelSuggestionItem } from "@/components/sidebar/label-suggestion-item"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleGenerateSuggestions() {
    if (createSuggestions.isPending) return
    setConfirmOpen(false)
    createSuggestions.mutate(undefined, {
      onSuccess: () => {
        trackEvent("ai_label_suggestions_generate")
        toast.success(m.sidebar_label_ai_success())
      },
      onError: (e) => toast.error(getErrorMessage(e, m.sidebar_label_ai_error())),
    })
  }

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
            onClick={() => setConfirmOpen(true)}
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{m.sidebar_label_ai_confirm_title()}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{m.sidebar_label_ai_confirm_description()}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {m.common_cancel()}
            </Button>
            <Button onClick={handleGenerateSuggestions} disabled={createSuggestions.isPending}>
              <Sparkles className="size-4" />
              {m.sidebar_label_ai_confirm_button()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {createSuggestions.isPending &&
        createPortal(
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-popover px-8 py-6 shadow-lg ring-1 ring-foreground/10">
              <Sparkles className="ai-sparkle-icon size-8 animate-pulse text-primary" />
              <p className="text-sm font-medium">{m.sidebar_label_ai_generating()}</p>
              <p className="text-xs text-muted-foreground">{m.sidebar_label_ai_generating_description()}</p>
            </div>
          </div>,
          document.body
        )}
    </SidebarGroup>
  )
}
