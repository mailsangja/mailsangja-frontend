import { useState, type ElementType } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { Bell, BellOff, BellRing, ChevronDown, ChevronLeft, Minus, Pencil, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { LabelConditionList } from "@/components/label/label-condition-list"
import { LabelDeleteDialog } from "@/components/label/label-delete-dialog"
import { LABEL_COLORS } from "@/lib/label-colors"
import { getErrorMessage } from "@/lib/http-error"
import { cn } from "@/lib/utils"
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
  getNotificationPolicyLabel,
  type ConditionField,
  type ConditionOperator,
  type LabelDetail,
  type NotificationPolicy,
  type UpdateLabelPayload,
} from "@/types/label"
import { Badge } from "@/components/ui/badge"

export const Route = createFileRoute("/_authenticated/settings/label/$labelId")({
  component: LabelDetailPage,
})

const NOTIFICATION_OPTIONS: { value: NotificationPolicy; icon: ElementType }[] = [
  { value: "URGENT", icon: BellRing },
  { value: "INHERIT", icon: Bell },
  { value: "SILENT", icon: BellOff },
]

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

function LabelDetailPage() {
  const { labelId } = Route.useParams()
  const { data: label, isPending, isError } = useLabelDetail(labelId)

  if (isPending) {
    return (
      <>
        <Skeleton className="h-5 w-16" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-5 w-36" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3.5 w-64" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border">
                <div className="flex items-center justify-between bg-muted/50 px-3 py-2">
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="px-4 py-3">
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
            ))}
            <Skeleton className="mt-1 h-8 w-16 rounded-md" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3.5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-14 rounded-md" />
          </CardContent>
        </Card>
      </>
    )
  }

  if (isError || !label) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">{m.label_load_error_title()}</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return <LabelDetailContent key={labelId} labelId={labelId} label={label} />
}

function LabelDetailContent({ labelId, label }: { labelId: string; label: LabelDetail }) {
  const navigate = useNavigate()
  const updateLabel = useUpdateLabel()
  const updateRule = useUpdateLabelRule()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [isEditingRules, setIsEditingRules] = useState(false)

  // Label info edit state
  const [name, setName] = useState(label.name)
  const [selectedColor, setSelectedColor] = useState(label.colorCode)
  const [notificationPolicy, setNotificationPolicy] = useState<NotificationPolicy>(label.notificationPolicy)

  // Rule edit state
  const [localGroups, setLocalGroups] = useState<EditableCondition[][]>(() =>
    (label.rule?.groups ?? []).map((g) => g.conditions.map((c) => ({ ...c })))
  )

  const allGroupsValid =
    localGroups.length === 0 || localGroups.every((group) => group.length > 0 && group.every(isComplete))

  const originalGroupsJson = JSON.stringify((label.rule?.groups ?? []).map((g) => g.conditions))
  const rulesChanged = JSON.stringify(localGroups) !== originalGroupsJson

  function handleCancelInfo() {
    setName(label.name)
    setSelectedColor(label.colorCode)
    setNotificationPolicy(label.notificationPolicy)
    setIsEditingInfo(false)
  }

  function handleSaveInfo() {
    const trimmed = name.trim()
    if (!trimmed) return
    const data: UpdateLabelPayload = {}
    if (trimmed !== label.name) data.name = trimmed
    if (selectedColor !== label.colorCode) data.colorCode = selectedColor
    if (notificationPolicy !== label.notificationPolicy) data.notificationPolicy = notificationPolicy
    if (Object.keys(data).length === 0) {
      setIsEditingInfo(false)
      return
    }
    updateLabel.mutate(
      { labelId, data },
      {
        onSuccess: () => {
          toast.success("라벨 정보가 변경되었습니다.")
          setIsEditingInfo(false)
        },
        onError: (e) => toast.error(getErrorMessage(e, "라벨 정보 변경에 실패했습니다.")),
      }
    )
  }

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
      prev.map((group, gi) => (gi !== groupIndex ? group : group.filter((_, ci) => ci !== condIndex)))
    )
  }

  function addGroup() {
    setLocalGroups((prev) => [...prev, [{ ...EMPTY_CONDITION }]])
  }

  function removeGroup(groupIndex: number) {
    setLocalGroups((prev) => prev.filter((_, gi) => gi !== groupIndex))
  }

  const currentNotifOption = NOTIFICATION_OPTIONS.find((o) => o.value === label.notificationPolicy)
  const NotifIcon = currentNotifOption?.icon ?? Bell

  return (
    <>
      <Link to="/settings/label" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <ChevronLeft className="size-4" />
        {m.label_back()}
      </Link>

      {/* Label info */}
      <Card>
        <CardHeader>
          <CardTitle>라벨 정보</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditingInfo ? (
            <div className="flex flex-wrap items-center gap-3">
              {/* Color picker */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="size-5 shrink-0 cursor-pointer rounded-full ring-2 ring-border ring-offset-2 focus-visible:outline-none"
                      style={{ backgroundColor: selectedColor }}
                      aria-label="색상 선택"
                    />
                  }
                />
                <DropdownMenuContent className="w-auto p-2">
                  <div className="grid grid-cols-5 gap-1.5">
                    {LABEL_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="size-6 cursor-pointer rounded-full transition-transform hover:scale-110 focus-visible:outline-none"
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
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Name */}
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveInfo()}
                placeholder="라벨 이름"
                className="h-8 w-40 text-sm"
              />

              {/* Notification toggles + actions on right */}
              <div className="ml-auto flex items-center gap-3">
                <div className="flex overflow-hidden rounded-md border">
                  {NOTIFICATION_OPTIONS.map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNotificationPolicy(value)}
                      className={cn(
                        "flex items-center gap-1.5 border-r px-3 py-1.5 text-xs transition-colors last:border-r-0",
                        notificationPolicy === value
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="size-3.5" />
                      {getNotificationPolicyLabel(value)}
                    </button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleCancelInfo}>
                  {m.common_cancel()}
                </Button>
                <Button size="sm" onClick={handleSaveInfo} disabled={!name.trim() || updateLabel.isPending}>
                  {m.common_save()}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="size-4 shrink-0 rounded-full" style={{ backgroundColor: label.colorCode }} />
              <span className="text-sm font-medium">{label.name}</span>
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <NotifIcon className="size-4" />
                  {getNotificationPolicyLabel(label.notificationPolicy)}
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEditingInfo(true)}>
                  <Pencil className="size-3.5" />
                  {m.common_edit()}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Label rules */}
      <Card>
        <CardHeader>
          <CardTitle>라벨 규칙</CardTitle>
          <CardDescription>
            이 라벨에 자동으로 분류될 메일의 규칙을 설정합니다. 규칙이 여러 개이면 하나라도 만족하면 분류됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          {isEditingRules ? (
            <>
              {localGroups.map((conditions, groupIndex) => (
                <div key={groupIndex}>
                  {groupIndex > 0 && (
                    <div className="my-1 flex items-center gap-3 py-2">
                      <div className="h-px flex-1 bg-border" />
                      <Badge variant="outline" className="px-3">
                        OR
                      </Badge>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}

                  <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
                    <div className="flex items-center justify-between bg-muted/40 px-3 py-2">
                      <span className="text-sm font-semibold">규칙 {groupIndex + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeGroup(groupIndex)}
                        aria-label="규칙 삭제"
                      >
                        <X className="size-4 text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="flex flex-col gap-2 border-t px-4 py-3">
                      {conditions.map((entry, condIndex) => (
                        <div key={condIndex}>
                          {condIndex > 0 && (
                            <div className="flex items-center gap-2 pb-2">
                              <div className="h-px flex-1 bg-border" />
                              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground">
                                AND
                              </span>
                              <div className="h-px flex-1 bg-border" />
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Field */}
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
                                {/* Operator */}
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
                                        updateCondition(groupIndex, condIndex, {
                                          operator: v as ConditionOperator,
                                        })
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

                                {/* Value */}
                                <Input
                                  value={entry.value}
                                  onChange={(e) => updateCondition(groupIndex, condIndex, { value: e.target.value })}
                                  className="h-8 min-w-0 flex-1"
                                  placeholder="값 입력..."
                                  disabled={!entry.field}
                                />
                              </>
                            )}

                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeCondition(groupIndex, condIndex)}
                              disabled={conditions.length <= 1}
                              aria-label="조건 삭제"
                            >
                              <Minus className="size-4" />
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

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={addGroup}>
                  <Plus className="size-4" />
                  규칙 추가
                </Button>
                <Button variant="outline" onClick={handleCancelRules}>
                  {m.common_cancel()}
                </Button>
                <Button onClick={handleSaveRules} disabled={!rulesChanged || !allGroupsValid || updateRule.isPending}>
                  {m.common_save()}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col">
              {label.rule && label.rule.groups.length > 0 ? (
                label.rule.groups.map((group, gi) => (
                  <div key={gi}>
                    {gi > 0 && (
                      <div className="my-1 flex items-center gap-3 py-2">
                        <div className="h-px flex-1 bg-border" />
                        <Badge variant="outline" className="px-3">
                          OR
                        </Badge>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    )}
                    <div className="overflow-hidden rounded-xl border bg-background px-4 shadow-sm">
                      <LabelConditionList conditions={group.conditions} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-2 text-sm text-muted-foreground">설정된 규칙이 없습니다.</p>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditingRules(true)}>
                  <Pencil className="size-3.5" />
                  {m.common_edit()}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">{m.label_delete_title()}</CardTitle>
          <CardDescription>{m.label_delete_description()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            {m.common_delete()}
          </Button>
        </CardContent>
      </Card>

      <LabelDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        label={label}
        onSuccess={() => void navigate({ to: "/settings/label" })}
      />
    </>
  )
}
