import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { LABEL_COLORS } from "@/lib/label-colors"
import { useApproveLabelSuggestion } from "@/mutations/labels"
import { useLabelSuggestionDetail } from "@/queries/labels"
import type { ConditionField, ConditionOperator, LabelSuggestion, NotificationPolicy } from "@/types/label"

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

const ATTACHMENT_VALUE_LABELS: Record<string, string> = {
  true: "포함",
  false: "포함안함",
}

const NOTIFICATION_OPTIONS: { value: NotificationPolicy; label: string }[] = [
  { value: "URGENT", label: "항상 알림" },
  { value: "INHERIT", label: "기본" },
  { value: "SILENT", label: "알림 안함" },
]

export function ApproveDialog({
  open,
  onOpenChange,
  suggestion,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  suggestion: LabelSuggestion
}) {
  const navigate = useNavigate()
  const [name, setName] = useState(suggestion.name)
  const [selectedColor, setSelectedColor] = useState(suggestion.colorCode)
  const [notificationPolicy, setNotificationPolicy] = useState<NotificationPolicy>("INHERIT")
  const approveLabelSuggestion = useApproveLabelSuggestion()
  const { data: detail } = useLabelSuggestionDetail(suggestion.id, open)

  const groups = useMemo(() => detail?.rule?.groups ?? [], [detail])

  function handleApprove() {
    const trimmed = name.trim()
    if (!trimmed) return

    const rule = groups.length > 0 ? { groups } : undefined

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
        onSuccess: (label) => {
          onOpenChange(false)
          toast.success(`${trimmed} 라벨이 추가되었습니다`)
          void navigate({ to: "/settings/label/$labelId", params: { labelId: label.id } })
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] grid-rows-[auto_1fr_auto] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI 추천 라벨 추가</DialogTitle>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden py-2">
            <div className="flex shrink-0 items-center gap-3 px-1">
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
            {groups.length > 0 && (
              <div className="flex min-h-0 flex-1 flex-col">
                <p className="mb-2 shrink-0 text-xs text-muted-foreground">라벨 규칙</p>
                <div className="flex flex-col gap-4 py-0.5 pr-3 pl-0.5">
                  {groups.map((group, groupIndex) => (
                    <div key={groupIndex} className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground">규칙 {groupIndex + 1}</p>
                      {group.conditions.map((condition, conditionIndex) => (
                        <div
                          key={conditionIndex}
                          className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-foreground">{FIELD_LABELS[condition.field]}</span>
                          {condition.field !== "HAS_ATTACHMENT" && (
                            <span className="text-muted-foreground">{OPERATOR_LABELS[condition.operator]}</span>
                          )}
                          <span className="text-foreground">
                            {condition.field === "HAS_ATTACHMENT"
                              ? (ATTACHMENT_VALUE_LABELS[condition.value] ?? condition.value)
                              : condition.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleApprove} disabled={!name.trim() || approveLabelSuggestion.isPending || !detail}>
            추가하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
