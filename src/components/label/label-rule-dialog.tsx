import { useState } from "react"
import { ChevronDown, Minus, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getErrorMessage } from "@/lib/http-error"
import { useUpdateLabelRule } from "@/mutations/labels"
import { useLabelDetail } from "@/queries/labels"
import { m } from "@/paraglide/messages"
import {
  LABEL_ATTACHMENT_OPTIONS,
  LABEL_CONDITION_FIELDS,
  LABEL_FIELD_OPERATORS,
  getLabelAttachmentValueLabel,
  getLabelConditionFieldLabel,
  getLabelConditionOperatorLabel,
  type ConditionField,
  type ConditionOperator,
} from "@/types/label"

interface ConditionEntry {
  field: ConditionField | ""
  operator: ConditionOperator | ""
  value: string
}

const EMPTY_ENTRY: ConditionEntry = { field: "", operator: "", value: "" }

function isComplete(entry: ConditionEntry): boolean {
  if (!entry.field) return false
  if (entry.field === "HAS_ATTACHMENT") return entry.value === "true" || entry.value === "false"
  return !!entry.operator && entry.value.trim().length > 0
}

interface LabelRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  labelId: string
}

export function LabelRuleDialog({ open, onOpenChange, labelId }: LabelRuleDialogProps) {
  const [entries, setEntries] = useState<ConditionEntry[]>([{ ...EMPTY_ENTRY }])

  const { data: label } = useLabelDetail(labelId)
  const updateRule = useUpdateLabelRule()

  const canSubmit = !!label && entries.length > 0 && entries.every(isComplete)

  function handleFieldChange(index: number, field: ConditionField | "") {
    setEntries((prev) =>
      prev.map((e, i) => {
        if (i !== index) return e
        if (!field) return { ...EMPTY_ENTRY }
        return { field, operator: field === "HAS_ATTACHMENT" ? "BOOLEAN" : "", value: "" }
      })
    )
  }

  function handleOperatorChange(index: number, operator: ConditionOperator) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, operator } : e)))
  }

  function handleValueChange(index: number, value: string) {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, value } : e)))
  }

  function addEntry() {
    setEntries((prev) => [...prev, { ...EMPTY_ENTRY }])
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function handleOpenChange(o: boolean) {
    onOpenChange(o)
    if (!o) setEntries([{ ...EMPTY_ENTRY }])
  }

  function handleSubmit() {
    if (!canSubmit) return
    const conditions = entries.map((e) => ({
      field: e.field as ConditionField,
      operator: e.operator as ConditionOperator,
      value: e.value,
    }))
    const existingGroups = label?.rule?.groups ?? []
    updateRule.mutate(
      { labelId, data: { groups: [...existingGroups, { conditions }] } },
      {
        onSuccess: () => {
          toast.success(m.label_rule_create_success())
          handleOpenChange(false)
        },
        onError: (e) => toast.error(getErrorMessage(e, m.label_rule_create_error())),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{m.label_rule_create_title()}</DialogTitle>
          <DialogDescription>{m.label_rule_create_description()}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="-m-1 max-h-[40vh]">
          <div className="flex min-h-12 flex-col gap-3 p-1">
            {entries.map((entry, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-9 w-36 shrink-0 items-center justify-between gap-1 rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                    <span className="truncate">
                      {entry.field ? (
                        getLabelConditionFieldLabel(entry.field)
                      ) : (
                        <span className="text-muted-foreground">{m.label_rule_field_placeholder()}</span>
                      )}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup
                      value={entry.field}
                      onValueChange={(v) => handleFieldChange(index, v as ConditionField)}
                    >
                      {LABEL_CONDITION_FIELDS.map((field) => (
                        <DropdownMenuRadioItem key={field} value={field}>
                          {getLabelConditionFieldLabel(field)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {entry.field === "HAS_ATTACHMENT" ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-9 w-28 shrink-0 items-center justify-between gap-1 rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                        <span className="truncate">
                          {entry.value ? (
                            getLabelAttachmentValueLabel(entry.value)
                          ) : (
                            <span className="text-muted-foreground">{m.label_rule_select_placeholder()}</span>
                          )}
                        </span>
                        <ChevronDown className="size-4 shrink-0 opacity-50" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={entry.value} onValueChange={(v) => handleValueChange(index, v)}>
                          {LABEL_ATTACHMENT_OPTIONS.map((value) => (
                            <DropdownMenuRadioItem key={value} value={value}>
                              {getLabelAttachmentValueLabel(value)}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {entries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeEntry(index)}
                        aria-label={m.label_condition_delete()}
                      >
                        <Minus className="size-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={!entry.field}
                        className="flex h-9 w-24 shrink-0 items-center justify-between gap-1 rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="truncate">
                          {entry.operator ? (
                            getLabelConditionOperatorLabel(entry.operator as ConditionOperator)
                          ) : (
                            <span className="text-muted-foreground">{m.label_rule_operator_placeholder()}</span>
                          )}
                        </span>
                        <ChevronDown className="size-4 shrink-0 opacity-50" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuRadioGroup
                          value={entry.operator}
                          onValueChange={(v) => handleOperatorChange(index, v as ConditionOperator)}
                        >
                          {entry.field &&
                            LABEL_FIELD_OPERATORS[entry.field].map((op) => (
                              <DropdownMenuRadioItem key={op} value={op}>
                                {getLabelConditionOperatorLabel(op)}
                              </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex min-w-full flex-1 items-center gap-2 sm:min-w-0">
                      <Input
                        value={entry.value}
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        className="h-8 flex-1"
                        placeholder={m.label_rule_value_placeholder()}
                        disabled={!entry.field}
                      />
                      {entries.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeEntry(index)}
                          aria-label={m.label_condition_delete()}
                        >
                          <Minus className="size-4" />
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <button
          type="button"
          onClick={addEntry}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="size-4" />
          {m.label_condition_add()}
        </button>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {m.common_cancel()}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || updateRule.isPending}>
            {updateRule.isPending ? m.label_rule_creating() : m.label_rule_create_submit()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
