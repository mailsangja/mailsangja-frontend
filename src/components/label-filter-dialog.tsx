import { useState } from "react"
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
import { getErrorMessage } from "@/lib/http-error"
import { useUpdateLabelRule } from "@/mutations/labels"
import { useLabelDetail } from "@/queries/labels"
import type { ConditionField, ConditionOperator } from "@/types/label"

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
  BOOLEAN: "해당함",
}

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
          toast.success("규칙이 생성되었습니다.")
          handleOpenChange(false)
        },
        onError: (e) => toast.error(getErrorMessage(e, "규칙 생성에 실패했습니다.")),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>규칙 만들기</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[40vh]">
          <div className="flex min-h-12 flex-col gap-3 py-0.5 pr-3 pl-0.5">
            {entries.map((entry, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
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
                      onValueChange={(v) => handleFieldChange(index, v as ConditionField)}
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
                        <DropdownMenuRadioGroup value={entry.value} onValueChange={(v) => handleValueChange(index, v)}>
                          {ATTACHMENT_OPTIONS.map((o) => (
                            <DropdownMenuRadioItem key={o.value} value={o.value}>
                              {o.label}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {entries.length > 1 && (
                      <Button variant="ghost" size="icon-sm" onClick={() => removeEntry(index)} aria-label="조건 삭제">
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
                          onValueChange={(v) => handleOperatorChange(index, v as ConditionOperator)}
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
                        onChange={(e) => handleValueChange(index, e.target.value)}
                        className="h-8 flex-1"
                        placeholder="값 입력..."
                        disabled={!entry.field}
                      />
                      {entries.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeEntry(index)}
                          aria-label="조건 삭제"
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
          조건 추가하기
        </button>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || updateRule.isPending}>
            {updateRule.isPending ? "생성 중..." : "규칙 만들기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
