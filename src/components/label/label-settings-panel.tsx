import { useState } from "react"
import { ChevronDown, Pencil, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { LabelRuleGroupList, LabelRuleJoiner } from "@/components/label/label-condition-list"
import { LabelDeleteDialog } from "@/components/label/label-delete-dialog"
import { getErrorMessage } from "@/lib/http-error"
import { useUpdateLabel, useUpdateLabelRule } from "@/mutations/labels"
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
  type LabelDetail,
} from "@/types/label"

type EditableCondition = {
  field: ConditionField | ""
  operator: ConditionOperator | ""
  value: string
}

const EMPTY_CONDITION: EditableCondition = { field: "", operator: "", value: "" }

function isComplete(entry: EditableCondition): boolean {
  if (!entry.field) return false
  if (entry.field === "HAS_ATTACHMENT") return entry.value === "true" || entry.value === "false"
  return !!entry.operator && entry.value.trim().length > 0
}

export function LabelSettingsPanel({ labelId, onDeleted }: { labelId: string; onDeleted: () => void }) {
  const { data: label, isPending, isError } = useLabelDetail(labelId)

  if (isPending) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (isError || !label) {
    return <p className="p-4 text-sm text-destructive">{m.label_list_error()}</p>
  }

  return <LabelSettingsContent key={labelId} labelId={labelId} label={label} onDeleted={onDeleted} />
}

function LabelSettingsContent({
  labelId,
  label,
  onDeleted,
}: {
  labelId: string
  label: LabelDetail
  onDeleted: () => void
}) {
  const updateLabel = useUpdateLabel()
  const updateRule = useUpdateLabelRule()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isEditingRules, setIsEditingRules] = useState(false)

  const [localGroups, setLocalGroups] = useState<EditableCondition[][]>(() =>
    (label.rule?.groups ?? []).map((g) => g.conditions.map((c) => ({ ...c })))
  )

  const allGroupsValid =
    localGroups.length === 0 || localGroups.every((group) => group.length > 0 && group.every(isComplete))
  const originalGroupsJson = JSON.stringify((label.rule?.groups ?? []).map((g) => g.conditions))
  const rulesChanged = JSON.stringify(localGroups) !== originalGroupsJson

  function handleCancelRules() {
    setLocalGroups((label.rule?.groups ?? []).map((g) => g.conditions.map((c) => ({ ...c }))))
    setIsEditingRules(false)
  }

  function handleSaveRules() {
    if (!allGroupsValid) return
    const groups = localGroups.map((conditions) => ({
      conditions: conditions.map((c) => ({
        field: c.field as ConditionField,
        operator: c.operator as ConditionOperator,
        value: c.value,
      })),
    }))
    updateRule.mutate(
      { labelId, data: { groups } },
      {
        onSuccess: () => {
          toast.success("규칙이 저장되었습니다.")
          setIsEditingRules(false)
        },
        onError: (e) => toast.error(getErrorMessage(e, "규칙 저장에 실패했습니다.")),
      }
    )
  }

  function handleFieldChange(groupIndex: number, condIndex: number, field: ConditionField | "") {
    setLocalGroups((prev) =>
      prev.map((group, gi) =>
        gi !== groupIndex
          ? group
          : group.map((cond, ci) => {
              if (ci !== condIndex) return cond
              if (!field) return { ...EMPTY_CONDITION }
              return { field, operator: field === "HAS_ATTACHMENT" ? "BOOLEAN" : "", value: "" }
            })
      )
    )
  }

  function updateCondition(groupIndex: number, condIndex: number, updates: Partial<EditableCondition>) {
    setLocalGroups((prev) =>
      prev.map((group, gi) =>
        gi !== groupIndex ? group : group.map((cond, ci) => (ci !== condIndex ? cond : { ...cond, ...updates }))
      )
    )
  }

  function addCondition(groupIndex: number) {
    setLocalGroups((prev) => prev.map((group, gi) => (gi !== groupIndex ? group : [...group, { ...EMPTY_CONDITION }])))
  }

  function removeCondition(groupIndex: number, condIndex: number) {
    setLocalGroups((prev) =>
      prev.flatMap((group, gi) => {
        if (gi !== groupIndex) return [group]
        const nextGroup = group.filter((_, ci) => ci !== condIndex)
        return nextGroup.length > 0 ? [nextGroup] : []
      })
    )
  }

  function addGroup() {
    setLocalGroups((prev) => [...prev, [{ ...EMPTY_CONDITION }]])
  }

  function handleSensitiveChange(isSensitive: boolean) {
    updateLabel.mutate(
      { labelId, data: { isSensitive } },
      {
        onError: (e) => toast.error(getErrorMessage(e, "AI 민감 라벨 설정 변경에 실패했습니다.")),
      }
    )
  }

  const groups = label.rule?.groups ?? []

  return (
    <div className="flex flex-col gap-5 px-6 py-4">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">라벨 규칙</h3>
          {!isEditingRules && (
            <Button variant="outline" size="sm" onClick={() => setIsEditingRules(true)}>
              <Pencil data-icon="inline-start" />
              규칙 수정
            </Button>
          )}
        </div>

        {isEditingRules ? (
          <div className="flex flex-col">
            {localGroups.map((conditions, groupIndex) => (
              <div key={groupIndex}>
                {groupIndex > 0 && <LabelRuleJoiner label="OR" className="py-3" />}
                <div className="overflow-hidden rounded-md border bg-background">
                  <div className="flex flex-col gap-2 px-4 py-3">
                    {conditions.map((entry, condIndex) => (
                      <div key={condIndex}>
                        {condIndex > 0 && <LabelRuleJoiner label="AND" className="pb-2" />}
                        <div className="flex flex-wrap items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-8 w-32 shrink-0 items-center justify-between gap-1 rounded-md border border-input bg-background px-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                              <span className="truncate">
                                {entry.field ? (
                                  getLabelConditionFieldLabel(entry.field)
                                ) : (
                                  <span className="text-muted-foreground">필드 선택</span>
                                )}
                              </span>
                              <ChevronDown className="size-3.5 shrink-0 opacity-50" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuRadioGroup
                                value={entry.field}
                                onValueChange={(v) => handleFieldChange(groupIndex, condIndex, v as ConditionField)}
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
                            <DropdownMenu>
                              <DropdownMenuTrigger className="flex h-8 w-24 shrink-0 items-center justify-between gap-1 rounded-md border border-input bg-background px-2.5 text-sm">
                                <span className="truncate">
                                  {entry.value ? (
                                    (getLabelAttachmentValueLabel(entry.value) ?? entry.value)
                                  ) : (
                                    <span className="text-muted-foreground">선택</span>
                                  )}
                                </span>
                                <ChevronDown className="size-3.5 shrink-0 opacity-50" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuRadioGroup
                                  value={entry.value}
                                  onValueChange={(v) => updateCondition(groupIndex, condIndex, { value: v })}
                                >
                                  {LABEL_ATTACHMENT_OPTIONS.map((value) => (
                                    <DropdownMenuRadioItem key={value} value={value}>
                                      {getLabelAttachmentValueLabel(value) ?? value}
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  disabled={!entry.field}
                                  className="flex h-8 w-20 shrink-0 items-center justify-between gap-1 rounded-md border border-input bg-background px-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <span className="truncate">
                                    {entry.operator ? (
                                      getLabelConditionOperatorLabel(entry.operator as ConditionOperator)
                                    ) : (
                                      <span className="text-muted-foreground">연산자</span>
                                    )}
                                  </span>
                                  <ChevronDown className="size-3.5 shrink-0 opacity-50" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuRadioGroup
                                    value={entry.operator}
                                    onValueChange={(v) =>
                                      updateCondition(groupIndex, condIndex, { operator: v as ConditionOperator })
                                    }
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

                              <Input
                                value={entry.value}
                                onChange={(e) => updateCondition(groupIndex, condIndex, { value: e.target.value })}
                                className="h-8 min-w-48 flex-1"
                                placeholder="값 입력..."
                                disabled={!entry.field}
                              />
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeCondition(groupIndex, condIndex)}
                            aria-label="조건 삭제"
                            className="-mr-2 -ml-1"
                          >
                            <X />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addCondition(groupIndex)}
                      className="mt-1 flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Plus className="size-3.5" />
                      조건 추가
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3">
              <Button variant="outline" size="sm" onClick={addGroup}>
                <Plus data-icon="inline-start" />
                규칙 추가
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancelRules}>
                {m.common_cancel()}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRules}
                disabled={!rulesChanged || !allGroupsValid || updateRule.isPending}
              >
                {m.common_save()}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {groups.length > 0 ? (
              <LabelRuleGroupList groups={groups} groupClassName="shadow-none" />
            ) : (
              <p className="text-sm text-muted-foreground">설정된 규칙이 없습니다.</p>
            )}
          </>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <Switch
            id={`label-sensitive-${labelId}`}
            checked={label.isSensitive}
            onCheckedChange={handleSensitiveChange}
            disabled={updateLabel.isPending}
            aria-labelledby={`label-sensitive-title-${labelId}`}
          />
          <div className="min-w-0">
            <p id={`label-sensitive-title-${labelId}`} className="text-sm font-medium">
              {m.label_sensitive_title()}
            </p>
            <p className="text-xs text-muted-foreground">{m.label_sensitive_description()}</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
          라벨 삭제
        </Button>
      </section>

      <LabelDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        label={label}
        onSuccess={onDeleted}
      />
    </div>
  )
}
