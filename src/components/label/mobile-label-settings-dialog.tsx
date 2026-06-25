import { useState, type ElementType, type KeyboardEvent } from "react"
import { Bell, BellOff, BellRing, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { LabelRuleGroupList } from "@/components/label/label-condition-list"
import { LabelDeleteDialog } from "@/components/label/label-delete-dialog"
import { LabelRuleEditor } from "@/components/label/label-rule-editor"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LABEL_COLORS } from "@/lib/label-colors"
import { getErrorMessage } from "@/lib/http-error"
import { cn } from "@/lib/utils"
import { useUpdateLabel } from "@/mutations/labels"
import { m } from "@/paraglide/messages"
import { useLabelDetail } from "@/queries/labels"
import {
  getNotificationPolicyLabel,
  type LabelDetail,
  type LabelListItem,
  type NotificationPolicy,
} from "@/types/label"

const NOTIFICATION_OPTIONS: { value: NotificationPolicy; icon: ElementType }[] = [
  { value: "URGENT", icon: BellRing },
  { value: "INHERIT", icon: Bell },
  { value: "SILENT", icon: BellOff },
]

export function MobileLabelSettingsDialog({
  label,
  open,
  onOpenChange,
}: {
  label: LabelListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [rulesOpen, setRulesOpen] = useState(false)

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setRulesOpen(false)
    onOpenChange(nextOpen)
  }

  function returnToSettingsDialog() {
    setRulesOpen(false)
    onOpenChange(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] grid-rows-[auto_1fr_auto] overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{m.label_settings()}</DialogTitle>
          </DialogHeader>
          {open && (
            <MobileLabelSettingsContent
              labelId={label.id}
              onDeleted={() => onOpenChange(false)}
              onEditRules={() => {
                setRulesOpen(true)
                onOpenChange(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-h-[90vh] grid-rows-[auto_1fr] overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{m.label_rules_title()}</DialogTitle>
          </DialogHeader>
          {rulesOpen && <MobileLabelRuleEditContent labelId={label.id} onClose={returnToSettingsDialog} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

function MobileLabelRuleEditContent({ labelId, onClose }: { labelId: string; onClose: () => void }) {
  const { data: label, isPending, isError } = useLabelDetail(labelId)

  if (isPending) {
    return (
      <ScrollArea className="-m-1 min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-1">
          <div className="h-16 w-full rounded-md bg-muted" />
          <div className="h-16 w-full rounded-md bg-muted" />
          <div className="h-9 w-40 self-end rounded-md bg-muted" />
        </div>
      </ScrollArea>
    )
  }

  if (isError || !label) {
    return <p className="text-sm text-destructive">{m.label_list_error()}</p>
  }

  return (
    <ScrollArea className="-m-1 min-h-0 flex-1">
      <div className="p-1">
        <LabelRuleEditor labelId={labelId} label={label} onCancel={onClose} onSaved={onClose} />
      </div>
    </ScrollArea>
  )
}

function MobileLabelSettingsContent({
  labelId,
  onDeleted,
  onEditRules,
}: {
  labelId: string
  onDeleted: () => void
  onEditRules: () => void
}) {
  const { data: label, isPending, isError } = useLabelDetail(labelId)

  if (isPending) {
    return (
      <ScrollArea className="-m-1 min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-1">
          <div className="h-9 w-full rounded-md bg-muted" />
          <div className="h-14 w-full rounded-md bg-muted" />
          <div className="h-20 w-full rounded-md bg-muted" />
        </div>
      </ScrollArea>
    )
  }

  if (isError || !label) {
    return <p className="text-sm text-destructive">{m.label_list_error()}</p>
  }

  return <MobileLabelSettingsForm key={label.id} label={label} onDeleted={onDeleted} onEditRules={onEditRules} />
}

function MobileLabelSettingsForm({
  label,
  onDeleted,
  onEditRules,
}: {
  label: LabelDetail
  onDeleted: () => void
  onEditRules: () => void
}) {
  const updateLabel = useUpdateLabel()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [name, setName] = useState(label.name)
  const [selectedColor, setSelectedColor] = useState(label.colorCode)
  const [notificationPolicy, setNotificationPolicy] = useState<NotificationPolicy>(label.notificationPolicy)
  const groups = label.rule?.groups ?? []

  function commitName() {
    const trimmed = name.trim()
    if (!trimmed) {
      setName(label.name)
      return
    }
    if (trimmed === label.name) return

    updateLabel.mutate(
      { labelId: label.id, data: { name: trimmed } },
      {
        onSuccess: () => setName(trimmed),
        onError: (e) => {
          setName(label.name)
          toast.error(getErrorMessage(e, m.label_name_update_error()))
        },
      }
    )
  }

  function handleColorChange(colorCode: string) {
    if (colorCode === selectedColor) return
    setSelectedColor(colorCode)
    updateLabel.mutate(
      { labelId: label.id, data: { colorCode } },
      {
        onError: (e) => {
          setSelectedColor(label.colorCode)
          toast.error(getErrorMessage(e, m.label_color_update_error()))
        },
      }
    )
  }

  function handleNotificationChange(nextNotificationPolicy: NotificationPolicy) {
    if (nextNotificationPolicy === notificationPolicy) return
    setNotificationPolicy(nextNotificationPolicy)
    updateLabel.mutate(
      { labelId: label.id, data: { notificationPolicy: nextNotificationPolicy } },
      {
        onError: (e) => {
          setNotificationPolicy(label.notificationPolicy)
          toast.error(getErrorMessage(e, m.label_notification_update_error()))
        },
      }
    )
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
    if (e.key === "Escape") {
      setName(label.name)
      e.currentTarget.blur()
    }
  }

  return (
    <>
      <ScrollArea className="-m-1 min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={handleKeyDown}
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
                  onClick={() => handleColorChange(color)}
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
                  onClick={() => handleNotificationChange(value)}
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

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">{m.label_rules_title()}</p>
              <Button variant="outline" size="sm" onClick={onEditRules}>
                <Pencil data-icon="inline-start" />
                {m.label_rule_edit_menu()}
              </Button>
            </div>
            {groups.length > 0 && <LabelRuleGroupList groups={groups} />}
          </div>
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 data-icon="inline-start" />
          {m.label_delete_title()}
        </Button>
      </DialogFooter>
      <LabelDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} label={label} onSuccess={onDeleted} />
    </>
  )
}
