import { useMemo, useState } from "react"
import { ChevronDown, Minus, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { LABEL_COLORS } from "@/lib/label-colors"
import { useApproveLabelSuggestion } from "@/mutations/labels"
import { useLabelSuggestionDetail } from "@/queries/labels"
import type { ConditionField, ConditionOperator, LabelSuggestion, NotificationPolicy } from "@/types/label"

interface ConditionEntry {
  field: ConditionField | ""
  operator: ConditionOperator | ""
  value: string
}

const FIELD_LABELS: Record<ConditionField, string> = {
  MAIL_ACCOUNT: "메일 계정",
  FROM_ADDRESS: "보낸 주소",
  FROM_DOMAIN: "보낸 도메인",
  TO_ADDRESS: "받는 주소",
  CC_ADDRESS: "참조",
  SUBJECT: "제목",
  BODY_TEXT: "본문",
  HAS_ATTACHMENT: "첨부파일",
}

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  EQUALS: "같음",
  CONTAINS: "포함",
  NOT_CONTAINS: "미포함",
  BOOLEAN: "해당함 여부",
}

const NOTIFICATION_OPTIONS: { value: NotificationPolicy; label: string }[] = [
  { value: "URGENT", label: "항상 알림" },
  { value: "INHERIT", label: "기본" },
  { value: "SILENT", label: "알림 안함" },
]

const ALL_CONDITION_FIELDS: ConditionField[] = [
  "MAIL_ACCOUNT",
  "FROM_ADDRESS",
  "FROM_DOMAIN",
  "TO_ADDRESS",
  "CC_ADDRESS",
  "SUBJECT",
  "BODY_TEXT",
  "HAS_ATTACHMENT",
]

const FIELD_OPERATORS: Record<ConditionField, ConditionOperator[]> = {
  MAIL_ACCOUNT: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  FROM_ADDRESS: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  FROM_DOMAIN: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  TO_ADDRESS: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  CC_ADDRESS: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  SUBJECT: ["EQUALS", "CONTAINS", "NOT_CONTAINS"],
  BODY_TEXT: ["CONTAINS", "NOT_CONTAINS"],
  HAS_ATTACHMENT: ["BOOLEAN"],
}

const ATTACHMENT_OPTIONS = [
  { value: "true", label: "포함" },
  { value: "false", label: "포함안함" },
]

const EMPTY_ENTRY: ConditionEntry = { field: "", operator: "", value: "" }

function isComplete(entry: ConditionEntry): boolean {
  if (!entry.field) return false
  if (entry.field === "HAS_ATTACHMENT") return entry.value === "true" || entry.value === "false"
  return !!entry.operator && entry.value.trim().length > 0
}

export function ApproveDialog({
  open,
  onOpenChange,
  suggestion,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  suggestion: LabelSuggestion
}) {
  const [name, setName] = useState(suggestion.name)
  const [selectedColor, setSelectedColor] = useState(suggestion.colorCode)
  const [notificationPolicy, setNotificationPolicy] = useState<NotificationPolicy>("INHERIT")
  const approveLabelSuggestion = useApproveLabelSuggestion()
  const { data: detail } = useLabelSuggestionDetail(suggestion.id)

  const suggestedGroups = useMemo(
    () =>
      (detail?.rule?.groups ?? []).map((g) =>
        g.conditions.map((c) => ({ field: c.field, operator: c.operator, value: c.value }) as ConditionEntry)
      ),
    [detail]
  )
  const [userGroups, setUserGroups] = useState<ConditionEntry[][] | null>(null)
  const groups = userGroups ?? suggestedGroups

  function handleFieldChange(groupIndex: number, conditionIndex: number, field: ConditionField | "") {
    setUserGroups(
      groups.map((g, gi) => {
        if (gi !== groupIndex) return g
        return g.map((e, ci) => {
          if (ci !== conditionIndex) return e
          if (!field) return { ...EMPTY_ENTRY }
          return { field, operator: field === "HAS_ATTACHMENT" ? "BOOLEAN" : "", value: "" }
        })
      })
    )
  }

  function handleOperatorChange(groupIndex: number, conditionIndex: number, operator: ConditionOperator) {
    setUserGroups(
      groups.map((g, gi) =>
        gi === groupIndex ? g.map((e, ci) => (ci === conditionIndex ? { ...e, operator } : e)) : g
      )
    )
  }

  function handleValueChange(groupIndex: number, conditionIndex: number, value: string) {
    setUserGroups(
      groups.map((g, gi) => (gi === groupIndex ? g.map((e, ci) => (ci === conditionIndex ? { ...e, value } : e)) : g))
    )
  }

  function addEntry(groupIndex: number) {
    setUserGroups(groups.map((g, gi) => (gi === groupIndex ? [...g, { ...EMPTY_ENTRY }] : g)))
  }

  function addGroup() {
    setUserGroups([...groups, [{ ...EMPTY_ENTRY }]])
  }

  function removeEntry(groupIndex: number, conditionIndex: number) {
    const updated = groups.map((g, gi) => (gi === groupIndex ? g.filter((_, ci) => ci !== conditionIndex) : g))
    setUserGroups(updated.filter((g) => g.length > 0))
  }

  const hasIncompleteEntry = groups.some((g) => g.length > 0 && !g.every(isComplete))

  function handleApprove() {
    const trimmed = name.trim()
    if (!trimmed || hasIncompleteEntry) return

    const completeGroups = groups.map((g) => g.filter(isComplete)).filter((g) => g.length > 0)
    const rule =
      completeGroups.length > 0
        ? {
            groups: completeGroups.map((g) => ({
              conditions: g.map((e) => ({
                field: e.field as ConditionField,
                operator: e.operator as ConditionOperator,
                value: e.value,
              })),
            })),
          }
        : undefined

    approveLabelSuggestion.mutate(
      {
        suggestionId: suggestion.id,
        data: {
          name: trimmed,
          colorCode: selectedColor,
          notificationPolicy,
          order: suggestion.order,
          rule,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          toast.success(`${trimmed} 라벨이 추가되었습니다`)
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

  function handleOpenChange(o: boolean) {
    onOpenChange(o)
    if (!o) setUserGroups(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] grid-rows-[auto_1fr_auto] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI 추천 라벨 추가</DialogTitle>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden py-2">
            <div className="flex shrink-0 items-center gap-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApprove()}
                placeholder="라벨 이름"
                autoFocus
              />
            </div>
            <div className="shrink-0">
              <p className="mb-2 text-xs text-muted-foreground">색상 선택</p>
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
            <div className="shrink-0">
              <p className="mb-2 text-xs text-muted-foreground">알림 설정</p>
              <div className="flex gap-2">
                {NOTIFICATION_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNotificationPolicy(value)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-1.5 text-xs transition-colors",
                      notificationPolicy === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <p className="mb-2 shrink-0 text-xs text-muted-foreground">라벨 규칙</p>
              <div className="flex flex-col gap-4 py-0.5 pr-3 pl-0.5">
                {groups.map((groupEntries, groupIndex) => (
                  <div key={groupIndex} className="flex flex-col gap-3">
                    {groupIndex > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    )}
                    {groupEntries.map((entry, conditionIndex) => (
                      <div key={conditionIndex} className="flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex h-9 w-36 shrink-0 items-center justify-between gap-1 rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                            <span className="truncate">
                              {entry.field ? (
                                FIELD_LABELS[entry.field]
                              ) : (
                                <span className="text-muted-foreground">필드 선택</span>
                              )}
                            </span>
                            <ChevronDown className="size-4 shrink-0 opacity-50" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuRadioGroup
                              value={entry.field}
                              onValueChange={(v) => handleFieldChange(groupIndex, conditionIndex, v as ConditionField)}
                            >
                              {ALL_CONDITION_FIELDS.map((field) => (
                                <DropdownMenuRadioItem key={field} value={field}>
                                  {FIELD_LABELS[field]}
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
                                    ATTACHMENT_OPTIONS.find((o) => o.value === entry.value)?.label
                                  ) : (
                                    <span className="text-muted-foreground">선택</span>
                                  )}
                                </span>
                                <ChevronDown className="size-4 shrink-0 opacity-50" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuRadioGroup
                                  value={entry.value}
                                  onValueChange={(v) => handleValueChange(groupIndex, conditionIndex, v)}
                                >
                                  {ATTACHMENT_OPTIONS.map((o) => (
                                    <DropdownMenuRadioItem key={o.value} value={o.value}>
                                      {o.label}
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeEntry(groupIndex, conditionIndex)}
                              aria-label="조건 삭제"
                            >
                              <Minus className="size-4" />
                            </Button>
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
                                    OPERATOR_LABELS[entry.operator as ConditionOperator]
                                  ) : (
                                    <span className="text-muted-foreground">연산자</span>
                                  )}
                                </span>
                                <ChevronDown className="size-4 shrink-0 opacity-50" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuRadioGroup
                                  value={entry.operator}
                                  onValueChange={(v) =>
                                    handleOperatorChange(groupIndex, conditionIndex, v as ConditionOperator)
                                  }
                                >
                                  {entry.field &&
                                    FIELD_OPERATORS[entry.field].map((op) => (
                                      <DropdownMenuRadioItem key={op} value={op}>
                                        {OPERATOR_LABELS[op]}
                                      </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="flex min-w-full flex-1 items-center gap-2 sm:min-w-0">
                              <Input
                                value={entry.value}
                                onChange={(e) => handleValueChange(groupIndex, conditionIndex, e.target.value)}
                                className="h-8 flex-1"
                                placeholder="값 입력..."
                                disabled={!entry.field}
                              />
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeEntry(groupIndex, conditionIndex)}
                                aria-label="조건 삭제"
                              >
                                <Minus className="size-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addEntry(groupIndex)}
                      className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Plus className="size-4" />
                      조건 추가하기
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addGroup}
                className="mt-3 flex w-fit shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Plus className="size-4" />
                규칙 추가하기
              </button>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={handleApprove}
            disabled={!name.trim() || approveLabelSuggestion.isPending || !detail || hasIncompleteEntry}
          >
            추가하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
