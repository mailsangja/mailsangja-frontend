import { useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowLeft, Plus, Minus } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { LabelRuleDialog } from "@/components/label-filter-dialog"
import { getErrorMessage } from "@/lib/http-error"
import { useUpdateLabelRule } from "@/mutations/labels"
import { useLabelDetail } from "@/queries/labels"
import type { ConditionField, ConditionOperator } from "@/types/label"

export const ATTACHMENT_VALUE_LABELS: Record<string, string> = {
  true: "포함",
  false: "포함안함",
}

export const FIELD_LABELS: Record<ConditionField, string> = {
  MAIL_ACCOUNT: "메일 계정",
  FROM_ADDRESS: "보낸 주소",
  FROM_DOMAIN: "보낸 도메인",
  TO_ADDRESS: "받는 주소",
  CC_ADDRESS: "참조",
  SUBJECT: "제목",
  BODY_TEXT: "본문",
  HAS_ATTACHMENT: "첨부파일",
}

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  EQUALS: "같음",
  CONTAINS: "포함",
  NOT_CONTAINS: "미포함",
  BOOLEAN: "해당함",
}

export const Route = createFileRoute("/_authenticated/settings/label/$labelId")({
  component: LabelDetailPage,
})

function LabelDetailPage() {
  const { labelId } = Route.useParams()
  const { data: label, isPending, isError } = useLabelDetail(labelId)
  const updateRule = useUpdateLabelRule()
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)

  const groups = label?.rule?.groups ?? []

  function handleDeleteGroup(groupIndex: number) {
    const newGroups = groups.filter((_, i) => i !== groupIndex)
    updateRule.mutate(
      { labelId, data: { groups: newGroups } },
      {
        onSuccess: () => toast.success("규칙이 삭제되었습니다."),
        onError: (e) => toast.error(getErrorMessage(e, "규칙 삭제에 실패했습니다.")),
      }
    )
  }

  if (isPending) {
    return (
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 px-3 pt-1 pb-4">
          <div>
            <Skeleton className="h-8 w-40 rounded-md" />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-3.5 shrink-0 rounded-sm" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="mt-2 h-4 w-80 max-w-full" />
            </div>
            {[0, 1].map((i) => (
              <Card key={i} className="gap-0 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-2.5">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="size-7 rounded-md" />
                </CardHeader>
                <CardContent className="flex flex-col gap-2 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-3.5 w-8" />
                    <Skeleton className="h-5 w-36 rounded-sm" />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      </ScrollArea>
    )
  }

  if (isError || !label) {
    return (
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 px-3 pt-1 pb-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">라벨을 불러오지 못했습니다</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-6 px-3 pt-1 pb-4">
        <div>
          <Link to="/settings/label" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ArrowLeft className="size-5" />
            라벨 목록으로 돌아가기
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block size-3.5 shrink-0 rounded-sm"
                style={{ backgroundColor: label.colorCode }}
              />
              <h2 className="text-lg font-semibold">{label.name}</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              이 라벨에 자동으로 분류될 메일의 규칙을 설정합니다. 규칙이 여러 개이면 하나라도 만족하면 분류됩니다.
            </p>
          </div>

          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex flex-col gap-2">
              <Card className="gap-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">규칙 {groupIndex + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeleteGroup(groupIndex)}
                    disabled={updateRule.isPending}
                    aria-label="규칙 삭제"
                  >
                    <Minus className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {group.conditions.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="shrink-0 font-normal">
                        {FIELD_LABELS[condition.field]}
                      </Badge>
                      <span className="shrink-0 text-muted-foreground">
                        {condition.field === "HAS_ATTACHMENT"
                          ? (ATTACHMENT_VALUE_LABELS[condition.value] ?? String(condition.value))
                          : OPERATOR_LABELS[condition.operator]}
                      </span>
                      {condition.field !== "HAS_ATTACHMENT" && <div className="text-sm">{condition.value}</div>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setRuleDialogOpen(true)}
            disabled={updateRule.isPending}
          >
            <Plus className="size-4" />
            규칙 추가
          </Button>
        </div>
      </div>

      <LabelRuleDialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen} labelId={labelId} />
    </ScrollArea>
  )
}
