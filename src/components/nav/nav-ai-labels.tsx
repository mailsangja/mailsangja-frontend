import { useState } from "react"
import { Check, Sparkles, X } from "lucide-react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { getErrorMessage, getHttpStatus } from "@/lib/http-error"
import { LABEL_COLORS } from "@/lib/label-colors"
import { useApproveLabelSuggestion, useCreateLabelSuggestions, useDeleteLabelSuggestion } from "@/mutations/labels"
import { useLabelSuggestionDetail, useLabelSuggestions } from "@/queries/labels"
import type { ConditionField, ConditionOperator, LabelSuggestion, NotificationPolicy } from "@/types/label"

const NOTIFICATION_OPTIONS: { value: NotificationPolicy; label: string }[] = [
  { value: "URGENT", label: "항상 알림" },
  { value: "INHERIT", label: "기본" },
  { value: "SILENT", label: "알림 안함" },
]

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

function ApproveDialog({
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

  function handleApprove() {
    if (approveLabelSuggestion.isPending) return
    const trimmed = name.trim()
    if (!trimmed) return
    approveLabelSuggestion.mutate(
      {
        suggestionId: suggestion.id,
        data: {
          name: trimmed,
          colorCode: selectedColor,
          notificationPolicy,
          order: suggestion.order,
          rule: detail?.rule ?? undefined,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>AI 추천 라벨 추가</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApprove()}
              placeholder="라벨 이름"
              autoFocus
            />
          </div>
          <div>
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
          <div>
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
          {detail?.rule?.groups && detail.rule.groups.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">AI 제안 필터 조건</p>
              <div className="space-y-1 rounded-md border bg-muted/40 px-3 py-2 text-xs">
                {detail.rule.groups.flatMap((group, gi) => [
                  ...(gi > 0 ? [<hr key={`sep-${gi}`} className="my-1 border-border" />] : []),
                  ...group.conditions.map((cond, ci) => (
                    <p key={`${gi}-${ci}`} className="text-muted-foreground">
                      <span className="font-medium text-foreground">{FIELD_LABELS[cond.field]}</span>{" "}
                      {OPERATOR_LABELS[cond.operator]}{" "}
                      {cond.operator !== "BOOLEAN" && (
                        <span className="font-mono text-foreground">&quot;{cond.value}&quot;</span>
                      )}
                    </p>
                  )),
                ])}
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">필터 조건은 라벨 추가 후 설정에서 수정할 수 있습니다.</p>
        </div>
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

function SuggestionItem({ suggestion }: { suggestion: LabelSuggestion }) {
  const [approveOpen, setApproveOpen] = useState(false)
  const deleteSuggestion = useDeleteLabelSuggestion()

  function handleReject() {
    deleteSuggestion.mutate(suggestion.id, {
      onError: (e) => toast.error(getErrorMessage(e, "라벨 제안 거부에 실패했습니다.")),
    })
  }

  return (
    <SidebarMenuItem className="group/suggestion">
      <SidebarMenuButton type="button" size="sm" tooltip={suggestion.name} onClick={() => setApproveOpen(true)}>
        <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: suggestion.colorCode }} />
        <span className="truncate">{suggestion.name}</span>
      </SidebarMenuButton>

      <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-0.5 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/suggestion:opacity-100 [@media(hover:hover)]:group-hover/suggestion:opacity-100">
        <button
          type="button"
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-green-600"
          aria-label="승인"
          onClick={(e) => {
            e.stopPropagation()
            setApproveOpen(true)
          }}
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:text-destructive"
          aria-label="거부"
          onClick={(e) => {
            e.stopPropagation()
            handleReject()
          }}
          disabled={deleteSuggestion.isPending}
        >
          <X className="size-3.5" />
        </button>
      </div>

      <ApproveDialog open={approveOpen} onOpenChange={setApproveOpen} suggestion={suggestion} />
    </SidebarMenuItem>
  )
}

export function NavAiLabels({ className }: { className?: string }) {
  const { data: suggestions = [] } = useLabelSuggestions()
  const createSuggestions = useCreateLabelSuggestions()

  if (suggestions.length === 0) return null

  return (
    <SidebarGroup className={cn(className, "ai-label-spinning-border")}>
      <SidebarGroupLabel className="flex items-center justify-between pr-1">
        <span>AI 추천 라벨</span>
        <button
          type="button"
          title="AI 라벨 추천 받기"
          className={buttonVariants({ variant: "ghost", size: "icon-xs" })}
          onClick={() => createSuggestions.mutate()}
          disabled={createSuggestions.isPending}
        >
          <Sparkles className="size-3.5" />
          <span className="sr-only">AI 라벨 추천 받기</span>
        </button>
      </SidebarGroupLabel>
      <SidebarMenu>
        {suggestions.map((suggestion) => (
          <SuggestionItem key={suggestion.id} suggestion={suggestion} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
