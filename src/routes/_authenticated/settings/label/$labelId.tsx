import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LabelFilterDialog } from "@/components/label-filter-dialog"
import { getErrorMessage } from "@/lib/http-error"
import { useUpdateLabelRule } from "@/mutations/labels"
import { useLabelDetail } from "@/queries/labels"
import type { ConditionField, ConditionOperator, LabelCondition } from "@/types/label"

export const Route = createFileRoute("/_authenticated/settings/label/$labelId")({
  component: LabelDetailPage,
})

const FIELD_LABELS: Record<ConditionField, string> = {
  MAIL_ACCOUNT: "메일 계정",
  FROM_ADDRESS: "보낸 주소",
  FROM_DOMAIN: "보낸 도메인",
  TO_ADDRESS: "받는 주소",
  CC_ADDRESS: "참조",
  SUBJECT: "제목",
  BODY_TEXT: "포함하는 단어",
  HAS_ATTACHMENT: "첨부파일",
}

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  EQUALS: "같음",
  CONTAINS: "포함",
  NOT_CONTAINS: "미포함",
  BOOLEAN: "해당함 여부",
}

function LabelDetailPage() {
  const { labelId } = Route.useParams()
  const { data: label, isPending, isError } = useLabelDetail(labelId)
  const updateRule = useUpdateLabelRule()
  const [isEditing, setIsEditing] = useState(false)
  const [conditions, setConditions] = useState<LabelCondition[] | null>(null)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  const savedConditions = label?.rule?.groups[0]?.conditions ?? []
  const displayConditions = conditions ?? savedConditions
  const colSpan = isEditing ? 4 : 3

  function startEditing() {
    setConditions([...savedConditions])
    setIsEditing(true)
  }

  function cancelEditing() {
    setConditions(null)
    setIsEditing(false)
  }

  function handleRemove(index: number) {
    setConditions(displayConditions.filter((_, i) => i !== index))
  }

  function handleSave() {
    const otherGroups = label?.rule?.groups.slice(1) ?? []
    updateRule.mutate(
      {
        labelId,
        data: { rule: { groups: [{ conditions: displayConditions }, ...otherGroups] } },
      },
      {
        onSuccess: () => {
          setConditions(null)
          setIsEditing(false)
          toast.success("필터 규칙이 저장되었습니다.")
        },
        onError: (e) => toast.error(getErrorMessage(e, "필터 규칙 저장에 실패했습니다.")),
      }
    )
  }

  if (isPending) {
    return (
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 px-3 pt-1 pb-4">
          <Card>
            <CardHeader>
              <CardTitle>불러오는 중...</CardTitle>
              <CardDescription>라벨 정보를 가져오고 있습니다.</CardDescription>
            </CardHeader>
          </Card>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span
                className="inline-block size-3.5 shrink-0 rounded-sm"
                style={{ backgroundColor: label.colorCode }}
              />
              {label.name}
            </CardTitle>
            <CardDescription>이 라벨에 자동으로 분류될 메일의 조건을 설정합니다.</CardDescription>
            <CardAction>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={startEditing} disabled={savedConditions.length === 0}>
                  <Pencil data-icon="inline-start" />
                  조건 수정
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>필드</TableHead>
                  <TableHead>연산자</TableHead>
                  <TableHead>값</TableHead>
                  {isEditing && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayConditions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={colSpan} className="text-center text-sm text-muted-foreground">
                      설정된 필터 조건이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayConditions.map((condition, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {FIELD_LABELS[condition.field]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {OPERATOR_LABELS[condition.operator]}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{condition.value}</TableCell>
                      {isEditing && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemove(index)}
                            aria-label="조건 삭제"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
                {!isEditing && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={colSpan} className="p-0">
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-center py-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        onClick={() => setFilterDialogOpen(true)}
                        aria-label="조건 추가"
                      >
                        <Plus className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          {isEditing && (
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost" onClick={cancelEditing} disabled={updateRule.isPending}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={updateRule.isPending}>
                {updateRule.isPending ? "저장 중..." : "저장하기"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <LabelFilterDialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen} defaultLabelId={labelId} />
    </ScrollArea>
  )
}
