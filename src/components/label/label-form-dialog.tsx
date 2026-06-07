import { useState, type ElementType, type ReactNode } from "react"
import { BellRing, Bell, BellOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { LABEL_COLORS } from "@/lib/label-colors"
import { LabelRuleGroupList } from "@/components/label/label-condition-list"
import { m } from "@/paraglide/messages"
import { getNotificationPolicyLabel, type LabelConditionGroup, type NotificationPolicy } from "@/types/label"

const NOTIFICATION_OPTIONS: { value: NotificationPolicy; icon: ElementType }[] = [
  { value: "URGENT", icon: BellRing },
  { value: "INHERIT", icon: Bell },
  { value: "SILENT", icon: BellOff },
]

export interface LabelFormData {
  name: string
  colorCode: string
  notificationPolicy: NotificationPolicy
}

interface LabelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  defaultName?: string
  defaultColor?: string
  defaultNotificationPolicy?: NotificationPolicy
  groups?: LabelConditionGroup[]
  onSubmit: (data: LabelFormData) => void
  isPending?: boolean
  submitLabel?: string
  submitDisabled?: boolean
  cancelLabel?: string
  cancelVariant?: "outline" | "destructive" | "ghost" | "secondary"
  cancelIcon?: ReactNode
  submitIcon?: ReactNode
  onCancel?: () => void
}

interface LabelFormContentProps {
  defaultName: string
  defaultColor: string
  defaultNotificationPolicy: NotificationPolicy
  groups?: LabelConditionGroup[]
  onSubmit: (data: LabelFormData) => void
  isPending?: boolean
  submitLabel: string
  submitDisabled?: boolean
  cancelLabel: string
  cancelVariant: "outline" | "destructive" | "ghost" | "secondary"
  cancelIcon?: ReactNode
  submitIcon?: ReactNode
  onClose: () => void
}

function LabelFormContent({
  defaultName,
  defaultColor,
  defaultNotificationPolicy,
  groups,
  onSubmit,
  isPending,
  submitLabel,
  submitDisabled,
  cancelLabel,
  cancelVariant,
  cancelIcon,
  submitIcon,
  onClose,
}: LabelFormContentProps) {
  const [name, setName] = useState(defaultName)
  const [selectedColor, setSelectedColor] = useState(defaultColor)
  const [notificationPolicy, setNotificationPolicy] = useState<NotificationPolicy>(defaultNotificationPolicy)

  function handleSubmit() {
    if (isPending || submitDisabled) return
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit({ name: trimmed, colorCode: selectedColor, notificationPolicy })
  }

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-3 py-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={m.label_name_placeholder()}
            autoFocus
          />
          <div>
            <p className="mb-2 text-xs text-muted-foreground">{m.label_color_select()}</p>
            <div className="grid grid-cols-10 gap-1.5">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="size-6 rounded-full ring-offset-2 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  style={{
                    backgroundColor: color,
                    boxShadow: selectedColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : undefined,
                  }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={color}
                  aria-pressed={selectedColor === color}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-muted-foreground">{m.label_notification_settings_title()}</p>
            <div className="flex gap-2">
              {NOTIFICATION_OPTIONS.map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setNotificationPolicy(value)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs transition-colors",
                    notificationPolicy === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-3.5" />
                  {getNotificationPolicyLabel(value)}
                </button>
              ))}
            </div>
          </div>
          {groups && groups.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">{m.label_rules_title()}</p>
              <LabelRuleGroupList groups={groups} />
            </div>
          )}
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button variant={cancelVariant} onClick={onClose}>
          {cancelIcon}
          {cancelLabel}
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim() || isPending || submitDisabled}>
          {submitIcon}
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  )
}

export function LabelFormDialog({
  open,
  onOpenChange,
  title,
  defaultName = "",
  defaultColor = LABEL_COLORS[0],
  defaultNotificationPolicy = "INHERIT",
  groups,
  onSubmit,
  isPending,
  submitLabel = m.common_confirm(),
  submitDisabled,
  cancelLabel = m.common_cancel(),
  cancelVariant = "outline",
  cancelIcon,
  submitIcon,
  onCancel,
}: LabelFormDialogProps) {
  function handleClose() {
    onCancel?.()
    onOpenChange(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      handleClose()
      return
    }
    onOpenChange(true)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] grid-rows-[auto_1fr_auto] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {open && (
          <LabelFormContent
            defaultName={defaultName}
            defaultColor={defaultColor}
            defaultNotificationPolicy={defaultNotificationPolicy}
            groups={groups}
            onSubmit={onSubmit}
            isPending={isPending}
            submitLabel={submitLabel}
            submitDisabled={submitDisabled}
            cancelLabel={cancelLabel}
            cancelVariant={cancelVariant}
            cancelIcon={cancelIcon}
            submitIcon={submitIcon}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
